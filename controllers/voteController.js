const News = require('../models/News');
const logger = require('../utils/logging');

exports.voteComment = async (req, res) => {
  const { news_id, commentId, voteType } = req.body; // voteType: 'up' or 'down'
  const userId = req.user.userId;

  try {
    const newsItem = await News.findById(news_id);
    if (!newsItem) return res.status(404).json({ message: "News not found" });

    const comment = newsItem.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Remove existing votes
    const upIndex = comment.upvotes.indexOf(userId);
    const downIndex = comment.downvotes.indexOf(userId);

    if (upIndex > -1) comment.upvotes.splice(upIndex, 1);
    if (downIndex > -1) comment.downvotes.splice(downIndex, 1);

    // Add new vote if not toggling off
    if (voteType === 'up' && upIndex === -1) {
      comment.upvotes.push(userId);
    } else if (voteType === 'down' && downIndex === -1) {
      comment.downvotes.push(userId);
    }

    comment.score = comment.upvotes.length - comment.downvotes.length;
    await newsItem.save();

    res.json({
      message: "Vote recorded",
      score: comment.score,
      upvoted: comment.upvotes.includes(userId),
      downvoted: comment.downvotes.includes(userId)
    });
  } catch (error) {
    logger.error('Vote error', { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

exports.voteReply = async (req, res) => {
  const { news_id, commentId, replyId, voteType } = req.body;
  const userId = req.user.userId;

  try {
    const newsItem = await News.findById(news_id);
    if (!newsItem) return res.status(404).json({ message: "News not found" });

    const comment = newsItem.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    // Remove existing votes
    const upIndex = reply.upvotes.indexOf(userId);
    const downIndex = reply.downvotes.indexOf(userId);

    if (upIndex > -1) reply.upvotes.splice(upIndex, 1);
    if (downIndex > -1) reply.downvotes.splice(downIndex, 1);

    // Add new vote
    if (voteType === 'up' && upIndex === -1) {
      reply.upvotes.push(userId);
    } else if (voteType === 'down' && downIndex === -1) {
      reply.downvotes.push(userId);
    }

    reply.score = reply.upvotes.length - reply.downvotes.length;
    await newsItem.save();

    res.json({
      message: "Vote recorded",
      score: reply.score,
      upvoted: reply.upvotes.includes(userId),
      downvoted: reply.downvotes.includes(userId)
    });
  } catch (error) {
    logger.error('Vote error', { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};
