const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  news_id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    default: "",
  },
  publishedAt: {
    type: Date,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("News", newsSchema);
