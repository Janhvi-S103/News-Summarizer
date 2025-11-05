const mongoose = require("mongoose");

const userNewsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  news_id: {
    type: String,
    required: true,
  },
  likes: { type: Number, default: 0 },
  commented_news: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("UserNews", userNewsSchema);