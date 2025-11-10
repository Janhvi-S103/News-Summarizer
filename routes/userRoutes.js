const express = require("express");
const { activity } = require("../controllers/userController");
const { addComment, deleteComment, getComments } = require("../controllers/commentController");
const { toggleLike, getLikesCount } = require("../controllers/likeController");
const { addReply, deleteReply, getReplies } = require("../controllers/replyController");
const { voteComment, voteReply } = require("../controllers/voteController");
const { viewProfile, editProfile, getCurrentProfile } = require("../controllers/profileController");
const { searchNews, getTrending, getByCategory } = require("../controllers/searchController");
const { toggleBookmark, getBookmarkedNews, getBookmarkStatus } = require("../controllers/bookmarkController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// User activity routes
router.get("/activity", authMiddleware, activity);

// Comment routes
router.post("/comment", authMiddleware, addComment);
router.delete("/comment/:commentId", authMiddleware, deleteComment);
router.get("/comments/:newsId", getComments);

// Reply routes
router.post("/comments/:commentId/reply/:newsId", authMiddleware, addReply);
router.delete("/comments/:commentId/replies/:replyId/:newsId", authMiddleware, deleteReply);
router.get("/comments/:commentId/replies/:newsId", getReplies);

// Vote routes
router.post("/comments/:commentId/vote", authMiddleware, voteComment);
router.post("/comments/:commentId/replies/:replyId/vote", authMiddleware, voteReply);

// Like routes
router.post("/like", authMiddleware, toggleLike);
router.get("/likes/:newsId", getLikesCount);

// Profile routes
router.get("/profile/:username", viewProfile);
router.get("/profile", authMiddleware, getCurrentProfile);
router.put("/profile", authMiddleware, editProfile);

// Search routes
router.get("/search", searchNews);
router.get("/trending", getTrending);
router.get("/category/:category", getByCategory);

// Bookmark routes
router.post("/bookmark", authMiddleware, toggleBookmark);
router.get("/bookmarks", authMiddleware, getBookmarkedNews);
router.get("/bookmark/:newsId", authMiddleware, getBookmarkStatus);

module.exports = router;



