const logger = require("../utils/logging");
const UserNews = require("../models/UserNews");
const User = require("../models/User");

// User activity endpoint - kept here for user-specific activity tracking
exports.activity = async (req, res) => {
  const username = req.user.username;
  
  logger.info('Fetch user activity', { username });

  try {
    const userNews = await UserNews.find({ username })
      .select("news_id comments likes bookmarked createdAt");

    if (!userNews || userNews.length === 0) {
      logger.info('No activity found for user', { username });
      return res.status(200).json({ activity: [] });
    }

    logger.info('User activity fetched successfully', {
      username,
      newsItemsWithActivity: userNews.length
    });

    res.status(200).json({ activity: userNews });
  } catch (error) {
    logger.error('Activity fetch error', {
      error: error.message,
      stack: error.stack,
      username
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};