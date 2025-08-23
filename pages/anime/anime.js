// js/anime.js
import DataManager from './data-manager.js';

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const animeGrid = document.getElementById('animeGrid');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const tabButtons = document.querySelectorAll('.tab-btn');

  let animeData = [];
  let filteredData = [];
  let currentPage = 1;
  const itemsPerPage = 12;

  async function loadAnimeData() {
    try {
      const result = await DataManager.getAnime();
      animeData = result.data;
      if (!Array.isArray(animeData)) {
        throw new Error('Anime data is not an array');
      }
      filteredData = animeData;
      renderAnime();
      updatePagination();
    } catch (error) {
      console.error('Error loading anime data:', error);
      showNotification('حدث خطأ في تحميل بيانات الأنمي');
    }
  }

  function showNotification(message) {
    const notifications = document.getElementById('notifications');
    while (notifications.firstChild) {
      notifications.removeChild(notifications.firstChild);
    }
    const notification = document.createElement('div');
    notification.className = 'notification show';
    notification.textContent = message;
    notifications.appendChild(notification);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function renderAnime() {
    animeGrid.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = filteredData.slice(start, end);

    if (paginatedData.length === 0) {
      animeGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">لا توجد نتائج</p>';
      return;
    }

    paginatedData.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.innerHTML = `
        <img src="${anime.cover || 'https://via.placeholder.com/150'}" alt="${anime.title}">
        <div class="info">
          <div class="title">${anime.title}</div>
          <div class="status">${anime.status}</div>
        </div>
        ${anime.rating ? `<div class="rating">${anime.rating}</div>` : ''}
      `;
      card.addEventListener('click', () => {
        window.location.href = `anime-details.html?id=${anime.id}`;
      });
      animeGrid.appendChild(card);
    });
  }

  function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    pageInfo.textContent = `صفحة ${currentPage} من ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  function filterAnime(status) {
    currentPage = 1;
    if (status === 'all') {
      filteredData = animeData;
    } else {
      filteredData = animeData.filter(anime => anime.status.toLowerCase() === status);
    }
    renderAnime();
    updatePagination();
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterAnime(button.dataset.tab);
    });
  });

  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    filteredData = animeData.filter(anime =>
      anime.title.toLowerCase().includes(query) ||
      (anime.description && anime.description.toLowerCase().includes(query))
    );
    currentPage = 1;
    renderAnime();
    updatePagination();
    showNotification(query ? `نتائج البحث عن: ${query}` : 'تم إعادة تعيين البحث');
  });

  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderAnime();
      updatePagination();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderAnime();
      updatePagination();
    }
  });

  loadAnimeData();
});