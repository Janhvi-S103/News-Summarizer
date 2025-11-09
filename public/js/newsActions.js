// public/js/newsActions.js
async function initDashboard() {
  const container = document.getElementById("newsContainer");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortOrder = document.getElementById("sortOrder");

  let allNews = [];

  const renderNews = (newsList) => {
    if (!newsList.length) {
      container.innerHTML = `<p class="no-news">No articles found.</p>`;
      return;
    }

    container.innerHTML = newsList
      .map(
        (news) => `
        <div class="news-card">
          <img src="${news.urlToImage || '/images/default.jpg'}" alt="news image">
          <div class="news-content">
            <h3>${news.title}</h3>
            <p>${news.description || "No description available."}</p>
            <div class="news-actions">
              <button class="btn-icon" title="Like"><i class="fa fa-heart"></i></button>
              <button class="btn-icon" title="Comment"><i class="fa fa-comment"></i></button>
              <button class="btn-icon" title="Save"><i class="fa fa-bookmark"></i></button>
              <a href="${news.url}" target="_blank" class="btn-icon" title="Read More"><i class="fa fa-external-link"></i></a>
            </div>
          </div>
        </div>`
      )
      .join("");
  };

  const fetchNews = async () => {
    container.innerHTML = `<p class="loading-text">Loading news...</p>`;
    try {
      const res = await fetch("/api/news/all");
      const data = await res.json();
      allNews = data;
      renderNews(allNews);
    } catch (err) {
      container.innerHTML = `<p class="error-text">Failed to load news.</p>`;
    }
  };

  const applyFilters = () => {
    const query = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const sort = sortOrder.value;

    let filtered = [...allNews];

    if (category) {
      filtered = filtered.filter(
        (n) => n.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (query) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query)
      );
    }

    if (sort === "latest") {
      filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else {
      filtered.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
    }

    renderNews(filtered);
  };

  // Listeners
  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  sortOrder.addEventListener("change", applyFilters);

  // Initialize
  await fetchNews();
}
