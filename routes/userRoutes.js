const express = require("express");
const { 
  comment, 
  like, 
  activity, 
  deleteComment, 
  searchNews, 
  viewProfile,
  editProfile 
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Interaction routes
router.post("/comment", authMiddleware, comment);
router.post("/like", authMiddleware, like);
router.post("/activity", authMiddleware, activity);
router.delete("/deleteComment", authMiddleware, deleteComment);
router.put("/editProfile", authMiddleware, editProfile);

// Replies & voting
router.post("/comments/:commentId/reply", authMiddleware, require("../controllers/userController").addReply);
router.delete("/comments/:commentId/replies/:replyId", authMiddleware, require("../controllers/userController").deleteReply);
router.get("/comments/:commentId/replies", authMiddleware, require("../controllers/userController").getReplies);
router.post("/comments/:commentId/vote", authMiddleware, require("../controllers/userController").voteComment);
router.post("/comments/:commentId/replies/:replyId/vote", authMiddleware, require("../controllers/userController").voteReply);

// Profile Page Render
router.get("/viewProfile", authMiddleware, (req, res) => {
  res.render("profile/profile", { 
    title: "Profile", 
    path: "/profile" 
  });
});

// Search
router.get("/search", searchNews);

module.exports = router;
