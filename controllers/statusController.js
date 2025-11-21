const logger = require('../utils/logging');
const UserNews = require('../models/UserNews');
const News = require('../models/News');
const User = require('../models/User');

//Get the status of like, bookmar for a particular news id 
exports.getStatus = async (req, res) => {
    try {
        const newsId = req.params.newsId;

        if (!newsId) {
            logger.error('Status validation failed - missing newsId', { username: req.user?.username });
            return res.status(400).json({ message: "newsId is required" });
        }

        const username = req.user.username;

        const userNews = await UserNews.findOne({ news_id: newsId, username });

        //Check if user has liked the news
        const isLiked = userNews && userNews.likes > 0;

        //Check if user has bookmarked the news
        const isBookmarked = userNews && userNews.bookmarked === true;

        return res.status(200).json({ isLiked, isBookmarked });

    } catch (error) {
        logger.error('Error fetching status', { error: error.message });
        return res.status(500).json({ message: "Internal server error" });
    }
};

