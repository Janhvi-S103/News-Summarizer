require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const News = require("../models/News");

const NEWS_API_KEY = process.env.NEWS_API_KEY || "e5854bc0988e47259991e59d814d209b";

const CATEGORIES = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
];

function createStableId(input) {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 32);
}

function summarizeText(text) {
  if (!text) return "";
  const clean = String(text).trim();
  if (clean.length <= 260) return clean;
  return `${clean.slice(0, 257)}...`;
}

function normalizeArticle(article, category) {
  const title = article.title || "";
  const sourceName = (article.source && article.source.name) || "";
  const description = article.description || article.content || "";
  const url = article.url || "";
  const publishedAt = article.publishedAt ? new Date(article.publishedAt) : undefined;

  const newsIdBasis = url || `${title}-${sourceName}-${article.publishedAt || ""}`;
  const news_id = createStableId(newsIdBasis);

  return {
    news_id,
    title,
    source: sourceName,
    category: category || "",
    description: summarizeText(description),
    content: summarizeText(description),
    url,
    publishedAt,
  };
}

async function fetchCategory(category) {
  const url = "https://newsapi.org/v2/top-headlines";
  const params = {
    apiKey: NEWS_API_KEY,
    category,
    pageSize: 50,
    language: "en",
    country: "us",
  };
  const { data } = await axios.get(url, { params });
  if (!data || !Array.isArray(data.articles)) return [];
  return data.articles.map((a) => normalizeArticle(a, category));
}

async function removeExisting(newsList) {
  if (newsList.length === 0) return [];
  const ids = newsList.map((n) => n.news_id);
  const existing = await News.find({ news_id: { $in: ids } }).select("news_id").lean();
  const existingIds = new Set(existing.map((e) => e.news_id));
  return newsList.filter((n) => !existingIds.has(n.news_id));
}

function dedupeInMemory(newsList) {
  const byId = new Map();
  const byUrl = new Set();
  for (const item of newsList) {
    if (byId.has(item.news_id)) continue;
    if (item.url && byUrl.has(item.url)) continue;
    byId.set(item.news_id, item);
    if (item.url) byUrl.add(item.url);
  }
  return Array.from(byId.values());
}

async function fetchAndStoreOnce() {
  const chunks = await Promise.all(
    CATEGORIES.map(async (c) => {
      try {
        return await fetchCategory(c);
      } catch (e) {
        return [];
      }
    })
  );

  const combined = chunks.flat();
  const deduped = dedupeInMemory(combined);
  const newOnly = await removeExisting(deduped);
  if (newOnly.length === 0) return { inserted: 0, skipped: combined.length };

  try {
    const result = await News.insertMany(newOnly, { ordered: false });
    return { inserted: result.length, skipped: combined.length - result.length };
  } catch (e) {
    return { inserted: 0, skipped: combined.length };
  }
}

let intervalRef = null;

function startNewsScheduler(everyMinutes = 5) {
  if (intervalRef) return;
  const ms = Math.max(1, everyMinutes) * 60 * 1000;
  intervalRef = setInterval(() => {
    fetchAndStoreOnce().catch(() => {});
  }, ms);
}

function stopNewsScheduler() {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
}

module.exports = {
  fetchAndStoreOnce,
  startNewsScheduler,
  stopNewsScheduler,
};


