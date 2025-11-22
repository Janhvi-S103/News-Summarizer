const mongoose = require("mongoose");
const { sanitizeText } = require("../utils/sanitizer");
const logger = require('../utils/logging');
const UserNews = require('../models/UserNews');
const User = require('../models/User');
const News = require('../models/News');
const Activity = require('../models/Activity');

// Add comment
exports.addComment = async (req, res) => {
  const { comment, news_id } = req.body;

  if (!comment || !news_id) {
    return res.status(400).json({ message: "Comment text and news_id are required" });
  }

  try {
    const user = await User.findById(req.user.userId).select("username");
    if (!user) return res.status(404).json({ message: "User not found" });

    const sanitized = sanitizeText(comment);

    // 🔍 Look for UserNews with *same username + news_id*
    let userNews = await UserNews.findOne({ 
      news_id, 
      username: user.username 
    });

    // If not exists, create one
    if (!userNews) {
      userNews = new UserNews({
        news_id,
        username: user.username,
        comments: []
      });
    }

    // Generate a shared commentId for both models
    const commentId = new mongoose.Types.ObjectId();

    // Push comment to UserNews
    userNews.comments.push({
      _id: commentId,
      userId: req.user.userId,
      username: user.username,
      comment: sanitized.text || comment,
      originalText: comment,
      wasCensored: sanitized.wasCensored,
      censoredTerms: sanitized.censoredTerms || []
    });

    await userNews.save();

    // 🔄 ALSO update the main News schema's comments array
    await News.updateOne(
      { news_id },
      {
        $push: {
          comments: {
            _id: commentId,
            username: user.username,
            comment: sanitized.text || comment,
            timestamp: new Date()
          }
        }
      }
    );

    // Log activity
    await Activity.create({
      userId: req.user.userId,
      username: user.username,
      action: 'comment.create',
      news_id,
      targetId: commentId,
      meta: { wasCensored: sanitized.wasCensored }
    });

    // Response
    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        _id: commentId,
        username: user.username,
        comment: sanitized.text || comment,
        wasCensored: sanitized.wasCensored
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Delete comment
exports.deleteComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { news_id } = req.body;

  logger.info("Delete comment attempt", {
    commentId,
    news_id,
    userId: req.user.userId
  });

  try {
    if (!news_id) {
      return res.status(400).json({ message: "news_id is required" });
    }

    // 1️⃣ Delete from UserNews (only if user is owner)
    const userNewsUpdate = await UserNews.findOneAndUpdate(
      {
        news_id,
        "comments._id": commentId,
        "comments.userId": req.user.userId
      },
      {
        $pull: { comments: { _id: commentId } }
      },
      { new: true }
    );

    if (!userNewsUpdate) {
      logger.warn("Delete failed in UserNews - Not found or unauthorized", {
        commentId,
        news_id,
        userId: req.user.userId
      });
      return res.status(404).json({
        message: "Comment not found or unauthorized"
      });
    }

    // 2️⃣ Delete from News model as well
    const newsUpdate = await News.findOneAndUpdate(
      {
        news_id,
        "comments._id": commentId
      },
      {
        $pull: { comments: { _id: commentId } }
      },
      { new: true }
    );

    if (!newsUpdate) {
      logger.warn("Comment removed from UserNews but NOT found in News", {
        commentId,
        news_id
      });
      // Continue – not blocking  
    }

    // 3️⃣ Log the deletion
    await Activity.create({
      userId: req.user.userId,
      username: req.user.username,
      action: "comment.delete",
      news_id,
      targetId: commentId
    });

    logger.info("Comment deleted successfully", {
      commentId,
      news_id,
      userId: req.user.userId
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    logger.error("Delete comment error", {
      error: error.message,
      stack: error.stack,
      commentId,
      news_id,
      userId: req.user.userId
    });

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// Get all comments for a news
exports.getComments = async (req, res) => {
  const { news_id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  logger.info('Fetching comments from News model', { news_id, page, limit });

  try {
    // Fetch news item by its news_id
    const newsItem = await News.findOne({ news_id }).select("comments");

    if (!newsItem) {
      logger.warn('Comments fetch failed - news not found in News model', { news_id });
      return res.status(404).json({ message: "News not found" });
    }

    const comments = newsItem.comments || [];

    // Pagination
    const start = (page - 1) * limit;
    const paginatedComments = comments.slice(start, start + parseInt(limit));

    logger.info('Comments fetched successfully from News model', {
      news_id,
      totalComments: comments.length,
      returnedComments: paginatedComments.length,
      page
    });

    res.status(200).json({
      comments: paginatedComments,
      total: comments.length,
      page: parseInt(page),
      totalPages: Math.ceil(comments.length / limit)
    });

  } catch (error) {
    logger.error('Comments fetch error from News model', {
      error: error.message,
      stack: error.stack,
      news_id
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
