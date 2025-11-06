const express = require("express");
const {comment, like, activity, deleteComment, searchNews} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();


router.post("/comment", authMiddleware, comment);
router.post("/like", authMiddleware, like);
router.post("/activity", authMiddleware, activity);
router.delete("/deleteComment", authMiddleware, deleteComment);
router.get("/search", searchNews);

module.exports = router;
