const mongoose = require("mongoose");
const { sanitizeText } = require("../utils/sanitizer");
const logger = require('../utils/logging');
const UserNews = require('../models/UserNews');
const News = require('../models/News');
const User = require('../models/User');

// Add comment
exports.addComment = async (req, res) => {
  const { comment, news_id } = req.body;

  logger.info('Comment attempt', { news_id, userId: req.user.userId });

  if (!comment || !news_id) {
    return res.status(400).json({ message: "Comment text and news_id are required" });
  }

  try {
    const user = await User.findById(req.user.userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newsItem = await News.findById(news_id);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found" });
    }

    const sanitized = sanitizeText(comment);
    const commentId = new mongoose.Types.ObjectId();

    const newComment = {
      _id: commentId,
      userId: req.user.userId,
      username: user.username,
      comment: sanitized.text || comment,
      timestamp: new Date(),
      replies: []
    };

    newsItem.comments.unshift(newComment); // Add to beginning
    await newsItem.save();

    // Also update UserNews to track that this user commented (optional, but good for activity feed)
    let userNews = await UserNews.findOne({ news_id, username: user.username });
    if (!userNews) {
      userNews = new UserNews({ news_id, username: user.username });
    }
    // We don't need to store the full comment in UserNews anymore if we don't want to duplicate,
    // but for the Activity Feed to work as currently implemented (fetching UserNews), we might need to.
    // The current profile.ejs iterates over activity.comments.
    // Let's keep a lightweight record or duplicate it for now to ensure Activity Feed works.
    userNews.comments.push(newComment);
    await userNews.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment
    });
  } catch (error) {
    logger.error('Comment error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { news_id } = req.body;

  try {
    const newsItem = await News.findById(news_id);
    if (!newsItem) return res.status(404).json({ message: "News not found" });

    const comment = newsItem.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.remove();
    await newsItem.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all comments for a news
exports.getComments = async (req, res) => {
  const { news_id } = req.params;

  try {
    const newsItem = await News.findById(news_id);
    if (!newsItem) return res.status(404).json({ message: "News not found" });

    res.status(200).json({
      comments: newsItem.comments,
      total: newsItem.comments.length
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
