const express = require("express");
const { register, login, checkStatus } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const authAdminMiddleware = require("../middlewares/authAdminMiddleware");

const router = express.Router();

// @accepts application/x-www-form-urlencoded
// @body {username: string, password: string}
router.post("/register", register);

// @accepts application/x-www-form-urlencoded
// @body {username: string, password: string}
router.post("/login", login);

router.get("/verify", authMiddleware, (req, res) => {
  res.json({ loggedIn: true, user: req.user });
});

router.get("/verifyAdmin", authAdminMiddleware, (req, res) => {
    res.json({ isAdmin: true, user: req.user });
});

router.get("/checkStatus", authMiddleware, checkStatus);

router.post("/logoutUser", (req, res) => {
    res.clearCookie("userAuth", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
    });
    res.status(200).json({ message: "Logged out successfully" });
});

router.post("/logoutAdmin", (req, res) => {
    res.clearCookie("adminAuth", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
    });
    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
