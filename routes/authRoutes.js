const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Render Login Page
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Login', 
    path: '/login'
  });
});

// Render Register Page
router.get('/register', (req, res) => {
  res.render('auth/register', { 
    title: 'Register', 
    path: '/register'
  });
});

router.post("/register", register);
router.post("/login", login);

module.exports = router;
