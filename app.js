require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./database/DatabaseConnection");
const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");
const userRoutes = require("./routes/userRoutes");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Global template variables
app.use((req, res, next) => {
  res.locals.title = "News Summarizer"; // 👈 default fallback
  next();
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// View engine setup (EJS + Layouts)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Serve static files from public/
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/user", userRoutes);

// Page routes
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.render("auth/login"));
app.get("/register", (req, res) => res.render("auth/register"));
app.get("/dashboard", (req, res) => res.render("dashboard/index", { user: null }));
app.get("/profile", (req, res) => res.render("profile/profile", { user: null }));

// Default redirect
app.get("/", (req, res) => res.redirect("/login"));

// Server start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
