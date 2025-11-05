const express = require("express");
const {comment, like} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();


router.post("/comment", authMiddleware, comment);
router.post("/like", authMiddleware, like);

module.exports = router;
