const logger = require('../utils/logging');
const UserNews = require('../models/UserNews');
const User = require('../models/User');

// Toggle bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const { news_id } = req.body;
    const username = req.user.username;   // <-- Use username (consistent with your schema)

    logger.info("Bookmark toggle attempt", { news_id, username });

    if (!news_id) {
      logger.warn("Bookmark validation failed - missing news_id", { username });
      return res.status(400).json({ message: "news_id is required" });
    }

    // Find entry for THIS user and THIS news
    let entry = await UserNews.findOne({ news_id, username });

    const previousState = entry?.bookmarked || false;

    if (!entry) {
      // Create a clean new entry
      entry = new UserNews({
        username,
        news_id,
        likes: 0,
        bookmarked: true,   // First toggle = bookmark ON
        comments: [],
      });

      logger.info("bookmark ON (new entry)", { news_id, username });
    } else {
      // Toggle bookmark
      entry.bookmarked = !entry.bookmarked;

      logger.info(entry.bookmarked ? "bookmark ON" : "bookmark OFF", {
        news_id,
        username,
        previousState,
      });
    }

    await entry.save();

    logger.info("Bookmark updated", {
      news_id,
      username,
      bookmarkStatus: entry.bookmarked,
    });

    return res.status(200).json({
      message: entry.bookmarked ? "Bookmarked" : "Bookmark removed",
      bookmarked: entry.bookmarked,
    });

  } catch (err) {
    logger.error("Bookmark error", {
      error: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: err.message });
  }
};


// Get all bookmarked news
exports.getBookmarkedNews = async (req, res) => {
  const userId = req.user.userId;
  const { page = 1, limit = 10 } = req.query;

  logger.info('Fetching bookmarked news', { userId, page, limit });

  try {
    const bookmarkedEntries = await UserNews.find({ bookmarked: true })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await UserNews.countDocuments({ bookmarked: true });

    logger.info('Bookmarked news fetched', {
      userId,
      totalBookmarked: totalCount,
      returnedCount: bookmarkedEntries.length,
      page
    });

    res.status(200).json({
      bookmarkedNews: bookmarkedEntries,
      total: totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (err) {
    logger.error('Fetch bookmarks error', {
      error: err.message,
      stack: err.stack,
      userId
    });
    res.status(500).json({ error: err.message });
  }
};

// Get bookmark status for a news item
exports.getBookmarkStatus = async (req, res) => {
  const { newsId } = req.params;
  const userId = req.user.userId;

  logger.info('Fetching bookmark status', { newsId, userId });

  try {
    const entry = await UserNews.findOne({ news_id: newsId });
    const isBookmarked = entry?.bookmarked || false;

    logger.info('Bookmark status retrieved', { newsId, userId, isBookmarked });

    res.status(200).json({
      newsId,
      isBookmarked
    });
  } catch (err) {
    logger.error('Bookmark status error', {
      error: err.message,
      stack: err.stack,
      newsId,
      userId
    });
    res.status(500).json({ error: err.message });
  }
};
