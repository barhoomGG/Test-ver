// anime.js
import DataManager from './data-manager.js';

document.addEventListener("DOMContentLoaded", () => {
  // عناصر DOM
  const animeGrid = document.getElementById("animeGrid");
  const genreFilterContainer = document.getElementById("genreFilter");
  const moodFilterContainer = document.getElementById("moodFilter");
  const animeSearch = document.getElementById("animeSearch");
  const loader = document.getElementById("loader");
  const genreFilterBtn = document.getElementById("genreFilterBtn");
  const sortFilterBtn = document.getElementById("sortFilterBtn");
  const moodFilterBtn = document.getElementById("moodFilterBtn");
  const favoritesBtn = document.getElementById("favoritesBtn");
  const watchLaterBtn = document.getElementById("watchLaterBtn");
  const genreFilterMenu = document.getElementById("genreFilterMenu");
  const sortFilterMenu = document.getElementById("sortFilterMenu");
  const moodFilterMenu = document.getElementById("moodFilterMenu");
  const closeGenreFilter = document.querySelector("#genreFilterMenu .close-filter");
  const closeSortFilter = document.querySelector("#sortFilterMenu .close-filter");
  const closeMoodFilter = document.querySelector("#moodFilterMenu .close-filter");
  const applyGenresBtn = document.getElementById("applyGenresBtn");
  const resetGenresBtn = document.getElementById("resetGenresBtn");
  const applyMoodsBtn = document.getElementById("applyMoodsBtn");
  const resetMoodsBtn = document.getElementById("resetMoodsBtn");
  const gridToggleBtn = document.getElementById("gridToggleBtn");
  const loadingScreen = document.getElementById("loadingScreen");

  // المتغيرات العامة
  let animeList = [];
  let currentPage = 1;
  const itemsPerPage = 12;
  let currentAnimeList = [];
  let activeSort = "newest";
  let activeGenres = new Set();
  let activeMoods = new Set();
  let scrollInterval = null;
  let scrollTimeout = null;
  let currentColumns = localStorage.getItem("gridColumns") || "3";
  let isFilteredByFavorites = false;
  let isFilteredByWatchLater = false;
  let isFilteredByMoods = false;
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  let isMobile = window.innerWidth <= 768;

  // الأنواع المحددة مسبقًا
  const predefinedGenres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery",
    "Romance", "Sci-Fi", "Slice of Life", "Sports", "Psychological", "Thriller",
    "Magic", "Supernatural", "Mecha", "School", "Martial Arts", "Historical",
    "Military", "Music", "Shoujo", "Shounen", "Seinen", "Josei", "Parody",
  ];

  // الحالات النفسية وارتباطها بالتصنيفات
  const predefinedMoods = {
    "سعيد": ["comedy", "slice of life", "parody"],
    "حزين": ["drama", "psychological", "seinen"],
    "رومانسي": ["romance", "shoujo", "josei"],
    "مثير": ["action", "adventure", "thriller"],
    "مرعب": ["horror", "mystery"],
    "هادئ": ["slice of life", "music", "school"],
    "ملهم": ["sports", "historical", "military"],
    "غامض": ["mystery", "supernatural"],
    "غاضب": ["action", "psychological", "martial arts"],
    "متحمس": ["adventure", "sports", "shounen"],
    "خائف": ["horror", "thriller"],
    "متفائل": ["comedy", "drama", "fantasy"],
    "محبط": ["psychological", "drama"],
    "مستريح": ["slice of life", "music"],
    "نشيط": ["sports", "action", "mecha"],
    "فضولي": ["mystery", "sci-fi", "magic"],
    "مغامر": ["adventure", "fantasy"],
    "عاطفي": ["romance", "drama"],
    "مبتكر": ["sci-fi", "mecha"],
    "تاريخي": ["historical", "military"],
    "ساخر": ["parody"],
    "سحري": ["magic", "supernatural"],
    "ميكانيكي": ["mecha"],
    "مدرسي": ["school"],
    "قتالي": ["martial arts"],
    "موسيقي": ["music"]
  };

  // خريطة الإيموجي لكل حالة نفسية
  const moodEmojis = {
    "سعيد": "😊",
    "حزين": "😢",
    "رومانسي": "❤️",
    "مثير": "🔥",
    "مرعب": "👻",
    "هادئ": "🌿",
    "ملهم": "💪",
    "غامض": "🕵️",
    "غاضب": "😡",
    "متحمس": "⚡",
    "خائف": "😱",
    "متفائل": "🌟",
    "محبط": "😞",
    "مستريح": "😌",
    "نشيط": "🏃",
    "فضولي": "🤔",
    "مغامر": "🗺️",
    "عاطفي": "💕",
    "مبتكر": "💡",
    "تاريخي": "🏛️",
    "ساخر": "😆",
    "سحري": "🪄",
    "ميكانيكي": "🤖",
    "مدرسي": "📚",
    "قتالي": "🥊",
    "موسيقي": "🎵"
  };

  // تطبيق الثيم المحفوظ
  function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "purple") {
      document.documentElement.classList.add("theme-purple");
    } else {
      document.documentElement.classList.remove("theme-purple");
    }
  }

  applySavedTheme();

  // معالجة بيانات الأنمي
  function processAnimeData(data) {
    return {
      id: data.id,
      title: data.title,
      cover: data.cover || '',
      poster: data.poster || '',
      genres: Array.isArray(data.category) ? data.category.map((g) => g.trim().toLowerCase()) : String(data.category || "").split(",").map((g) => g.trim().toLowerCase()),
      currentEpisode: data.currentEpisode || 1,
      totalEpisodes: data.totalEpisodes || 0,
      imdb: data.rating || 0,
      views: data.views || 0,
      date: data.addDate || "2000-01-01",
      releaseDate: data.releaseDate || "2000-01-01",
      showIn: data.showIn || "both",
      description: data.description || '',
      state: data.state || 'مستمر',
      type: data.type || 'TV',
      episodes: data.episodes || {}
    };
  }

  // إعداد الشبكة
  function setGridColumns(columns) {
    currentColumns = columns;
    animeGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    animeGrid.classList.remove("two-columns", "three-columns", "auto-columns");
    animeGrid.classList.add(columns === "2" ? "two-columns" : "three-columns");
    localStorage.setItem("gridColumns", columns);
    renderAnimeGrid();
  }

  function initGridToggle() {
    if (!isMobile) {
      animeGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
      animeGrid.classList.remove("two-columns", "three-columns");
      animeGrid.classList.add("auto-columns");
      gridToggleBtn.style.display = 'none';
    } else {
      setGridColumns(currentColumns);
      gridToggleBtn.style.display = 'flex';
    }
    if (gridToggleBtn) {
      gridToggleBtn.addEventListener("click", () => {
        if (!isMobile) return;
        const newColumns = currentColumns === "2" ? "3" : "2";
        setGridColumns(newColumns);
      });
    }

    window.addEventListener('resize', () => {
      const newIsMobile = window.innerWidth <= 768;
      if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        if (isMobile) {
          gridToggleBtn.style.display = 'flex';
          setGridColumns(localStorage.getItem('gridColumns') || '3');
        } else {
          gridToggleBtn.style.display = 'none';
          animeGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
          animeGrid.classList.remove("two-columns", "three-columns");
          animeGrid.classList.add("auto-columns");
        }
        renderAnimeGrid();
      }
    });
  }

  // إعداد الفلاتر
  function initFilters() {
    if (genreFilterBtn) {
      genreFilterBtn.addEventListener("click", () => {
        genreFilterMenu.classList.toggle("hidden");
        sortFilterMenu.classList.add("hidden");
        moodFilterMenu.classList.add("hidden");
      });
    }

    if (sortFilterBtn) {
      sortFilterBtn.addEventListener("click", () => {
        sortFilterMenu.classList.toggle("hidden");
        genreFilterMenu.classList.add("hidden");
        moodFilterMenu.classList.add("hidden");
      });
    }

    if (moodFilterBtn) {
      moodFilterBtn.addEventListener("click", () => {
        moodFilterMenu.classList.toggle("hidden");
        genreFilterMenu.classList.add("hidden");
        sortFilterMenu.classList.add("hidden");
      });
    }

    if (closeGenreFilter) {
      closeGenreFilter.addEventListener("click", () => {
        genreFilterMenu.classList.add("hidden");
      });
    }

    if (closeSortFilter) {
      closeSortFilter.addEventListener("click", () => {
        sortFilterMenu.classList.add("hidden");
      });
    }

    if (closeMoodFilter) {
      closeMoodFilter.addEventListener("click", () => {
        moodFilterMenu.classList.add("hidden");
      });
    }

    document.querySelectorAll(".sort-option").forEach((option) => {
      option.addEventListener("click", () => {
        document.querySelectorAll(".sort-option").forEach((btn) => btn.classList.remove("active"));
        option.classList.add("active");
        activeSort = option.dataset.sort;
        sortAnimeList();
        renderAnimeGrid();
        sortFilterMenu.classList.add("hidden");
      });
    });

    createGenreButtons();
    createMoodButtons();

    if (applyGenresBtn) {
      applyGenresBtn.addEventListener("click", applyGenreFilters);
    }

    if (resetGenresBtn) {
      resetGenresBtn.addEventListener("click", resetGenreFilters);
    }

    if (applyMoodsBtn) {
      applyMoodsBtn.addEventListener("click", applyMoodFilters);
    }

    if (resetMoodsBtn) {
      resetMoodsBtn.addEventListener("click", resetMoodFilters);
    }

    if (favoritesBtn) {
      favoritesBtn.addEventListener("click", () => {
        if (!isLoggedIn) {
          if (window.showNotification) {
            window.showNotification("يجب أن يسجل الدخول أولا حتى تضهر المحتوى");
          }
          return;
        }
        isFilteredByFavorites = !isFilteredByFavorites;
        isFilteredByWatchLater = false;
        isFilteredByMoods = false;
        favoritesBtn.classList.toggle("active", isFilteredByFavorites);
        watchLaterBtn.classList.remove("active");
        moodFilterBtn.classList.remove("active");
        loadUserFavorites();
        renderAnimeGrid();
      });
    }

    if (watchLaterBtn) {
      watchLaterBtn.addEventListener("click", () => {
        if (!isLoggedIn) {
          if (window.showNotification) {
            window.showNotification("يجب أن يسجل الدخول أولا حتى تضهر المحتوى");
          }
          return;
        }
        isFilteredByWatchLater = !isFilteredByWatchLater;
        isFilteredByFavorites = false;
        isFilteredByMoods = false;
        watchLaterBtn.classList.toggle("active", isFilteredByWatchLater);
        favoritesBtn.classList.remove("active");
        moodFilterBtn.classList.remove("active");
        loadUserWatchLater();
        renderAnimeGrid();
      });
    }
  }

  function createGenreButtons() {
    if (genreFilterContainer) {
      genreFilterContainer.innerHTML = "";

      const allBtn = document.createElement("button");
      allBtn.textContent = "الكل";
      allBtn.classList.add("genre-btn", "active");
      allBtn.dataset.genre = "all";
      genreFilterContainer.appendChild(allBtn);

      predefinedGenres.forEach((genre) => {
        const btn = document.createElement("button");
        btn.textContent = genre;
        btn.classList.add("genre-btn");
        btn.dataset.genre = genre.toLowerCase();
        genreFilterContainer.appendChild(btn);
      });

      allBtn.addEventListener("click", () => {
        document.querySelectorAll(".genre-btn").forEach((btn) => {
          if (btn.dataset.genre !== "all") {
            btn.classList.remove("active");
          }
        });
        allBtn.classList.add("active");
      });

      document.querySelectorAll(".genre-btn:not([data-genre='all'])").forEach((btn) => {
        btn.addEventListener("click", () => {
          btn.classList.toggle("active");
          document.querySelector("[data-genre='all']").classList.remove("active");
        });
      });
    }
  }

  function createMoodButtons() {
    if (moodFilterContainer) {
      moodFilterContainer.innerHTML = "";

      const allBtn = document.createElement("button");
      allBtn.textContent = "الكل";
      allBtn.classList.add("mood-btn", "active");
      allBtn.dataset.mood = "all";
      moodFilterContainer.appendChild(allBtn);

      Object.keys(predefinedMoods).forEach((mood) => {
        const btn = document.createElement("button");
        btn.textContent = `${mood} ${moodEmojis[mood] || ''}`;
        btn.classList.add("mood-btn");
        btn.dataset.mood = mood;
        moodFilterContainer.appendChild(btn);
      });

      allBtn.addEventListener("click", () => {
        document.querySelectorAll(".mood-btn:not([data-mood='all'])").forEach((btn) => {
          btn.classList.remove("active");
        });
        allBtn.classList.add("active");
      });

      document.querySelectorAll(".mood-btn:not([data-mood='all'])").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".mood-btn:not([data-mood='all'])").forEach((b) => {
            b.classList.remove("active");
          });
          btn.classList.add("active");
          document.querySelector("[data-mood='all']").classList.remove("active");
        });
      });
    }
  }

  function applyGenreFilters() {
    activeGenres.clear();
    document.querySelectorAll(".genre-btn.active:not([data-genre='all'])").forEach((btn) => {
      activeGenres.add(btn.textContent);
    });

    if (activeGenres.size === 0) {
      document.querySelector("[data-genre='all']").classList.add("active");
    }

    isFilteredByFavorites = false;
    isFilteredByWatchLater = false;
    isFilteredByMoods = false;
    if (favoritesBtn) favoritesBtn.classList.remove("active");
    if (watchLaterBtn) watchLaterBtn.classList.remove("active");
    if (moodFilterBtn) moodFilterBtn.classList.remove("active");
    if (window.showNotification) {
      window.showNotification("تم تطبيق فلتر التصنيفات");
    }
    filterAnimeList();
    if (genreFilterMenu) genreFilterMenu.classList.add("hidden");
  }

  function resetGenreFilters() {
    document.querySelectorAll(".genre-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.querySelector("[data-genre='all']").classList.add("active");
    activeGenres.clear();
    isFilteredByFavorites = false;
    isFilteredByWatchLater = false;
    isFilteredByMoods = false;
    if (favoritesBtn) favoritesBtn.classList.remove("active");
    if (watchLaterBtn) watchLaterBtn.classList.remove("active");
    if (moodFilterBtn) moodFilterBtn.classList.remove("active");
    if (window.showNotification) {
      window.showNotification("تم إعادة تعيين التصنيفات");
    }
    filterAnimeList();
  }

  function applyMoodFilters() {
    activeMoods.clear();
    const activeMoodBtn = document.querySelector(".mood-btn.active:not([data-mood='all'])");
    const allMoodBtn = document.querySelector("[data-mood='all']");

    if (allMoodBtn.classList.contains("active")) {
      activeGenres.clear();
      isFilteredByFavorites = false;
      isFilteredByWatchLater = false;
      isFilteredByMoods = false;
      if (favoritesBtn) favoritesBtn.classList.remove("active");
      if (watchLaterBtn) watchLaterBtn.classList.remove("active");
      if (moodFilterBtn) moodFilterBtn.classList.remove("active");
      if (window.showNotification) {
        window.showNotification("تم عرض جميع الأنميات");
      }
      filterAnimeList();
      moodFilterMenu.classList.add("hidden");
      return;
    }

    if (activeMoodBtn) {
      const mood = activeMoodBtn.dataset.mood;
      activeMoods.add(mood);
      activeGenres.clear();
      activeMoods.forEach((mood) => {
        predefinedMoods[mood].forEach((genre) => activeGenres.add(genre));
      });
      isFilteredByFavorites = false;
      isFilteredByWatchLater = false;
      isFilteredByMoods = true;
      if (favoritesBtn) favoritesBtn.classList.remove("active");
      if (watchLaterBtn) watchLaterBtn.classList.remove("active");
      if (moodFilterBtn) moodFilterBtn.classList.add("active");
      if (window.showNotification) {
        window.showNotification("تم تطبيق فلتر الحالة النفسية");
      }
    } else {
      activeGenres.clear();
      isFilteredByFavorites = false;
      isFilteredByWatchLater = false;
      isFilteredByMoods = false;
      if (favoritesBtn) favoritesBtn.classList.remove("active");
      if (watchLaterBtn) watchLaterBtn.classList.remove("active");
      if (moodFilterBtn) moodFilterBtn.classList.remove("active");
      if (window.showNotification) {
        window.showNotification("تم إعادة تعيين الحالة النفسية");
      }
    }

    filterAnimeList();
    moodFilterMenu.classList.add("hidden");
  }

  function resetMoodFilters() {
    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.querySelector("[data-mood='all']").classList.add("active");
    activeMoods.clear();
    activeGenres.clear();
    isFilteredByFavorites = false;
    isFilteredByWatchLater = false;
    isFilteredByMoods = false;
    if (favoritesBtn) favoritesBtn.classList.remove("active");
    if (watchLaterBtn) watchLaterBtn.classList.remove("active");
    if (moodFilterBtn) moodFilterBtn.classList.remove("active");
    if (window.showNotification) {
      window.showNotification("تم إعادة تعيين الحالة النفسية");
    }
    filterAnimeList();
  }

  function loadUserFavorites() {
    const favoriteIds = JSON.parse(localStorage.getItem("favorites")) || [];
    currentAnimeList = animeList.filter((anime) => favoriteIds.includes(anime.id));
    sortAnimeList();
    currentPage = 1;
    if (window.showNotification) {
      window.showNotification("تم تحميل الأنميات المفضلة");
    }
  }

  function loadUserWatchLater() {
    const watchLaterIds = JSON.parse(localStorage.getItem("watchLater")) || [];
    currentAnimeList = animeList.filter((anime) => watchLaterIds.includes(anime.id));
    sortAnimeList();
    currentPage = 1;
    if (window.showNotification) {
      window.showNotification("تم تحميل قائمة مشاهدة لاحقًا");
    }
  }

  function sortAnimeList() {
    switch (activeSort) {
      case "imdb":
        currentAnimeList.sort((a, b) => b.imdb - a.imdb);
        break;
      case "imdb-low":
        currentAnimeList.sort((a, b) => a.imdb - b.imdb);
        break;
      case "newest":
        currentAnimeList.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        break;
      case "views":
        currentAnimeList.sort((a, b) => b.views - a.views);
        break;
      case "az":
        currentAnimeList.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        currentAnimeList.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    }
  }

  function filterAnimeList() {
    if (isFilteredByFavorites) {
      loadUserFavorites();
    } else if (isFilteredByWatchLater) {
      loadUserWatchLater();
    } else if (activeGenres.size === 0 && !isFilteredByMoods) {
      currentAnimeList = [...animeList];
    } else {
      const activeGenresLower = [...activeGenres].map((g) => g.toLowerCase());
      currentAnimeList = animeList.filter((anime) => {
        if (!Array.isArray(anime.genres)) return false;
        const animeGenres = anime.genres.map((g) => (typeof g === "string" ? g.trim().toLowerCase() : String(g).toLowerCase()));
        return isFilteredByMoods
          ? activeGenresLower.some((genre) => animeGenres.includes(genre))
          : activeGenresLower.every((genre) => animeGenres.includes(genre));
      });
    }

    sortAnimeList();
    currentPage = 1;
    renderAnimeGrid();
  }

  function createAnimeCard(anime, isAllAnime = false) {
    const card = document.createElement("div");
    card.classList.add("anime-card");

    const img = document.createElement("img");
    img.src = anime.poster || anime.cover || '';
    img.alt = anime.title;
    img.setAttribute("loading", "lazy");
    card.appendChild(img);

    const titleContainer = document.createElement("div");
    titleContainer.className = "title-container";

    const ltrContainer = document.createElement("div");
    ltrContainer.setAttribute("dir", "ltr");

    const title = document.createElement("h3");
    title.textContent = anime.title;
    ltrContainer.appendChild(title);
    titleContainer.appendChild(ltrContainer);
    card.appendChild(titleContainer);

    setTimeout(() => {
      const lineHeight = parseFloat(getComputedStyle(title).lineHeight);
      const titleHeight = title.offsetHeight;
      if (titleHeight <= lineHeight * 1.5) {
        title.classList.add("centered-title");
      } else {
        title.classList.add("left-aligned-title");
      }
    }, 0);

    const bottomInfo = document.createElement("div");
    bottomInfo.className = "bottom-info";

    const episodeInfo = document.createElement("div");
    episodeInfo.className = "episode-info";

    const episodeLabel = document.createElement("span");
    episodeLabel.className = "episode-label";
    episodeLabel.textContent = isAllAnime ? "الحلقات:" : "الحلقة:";

    const episodeNumber = document.createElement("span");
    episodeNumber.className = "episode-number";
    episodeNumber.textContent = isAllAnime ? anime.totalEpisodes : anime.currentEpisode;

    const episodeIcon = document.createElement("i");
    episodeIcon.className = "fas fa-film episode-icon";

    episodeInfo.appendChild(episodeIcon);
    episodeInfo.appendChild(episodeLabel);
    episodeInfo.appendChild(episodeNumber);
    bottomInfo.appendChild(episodeInfo);

    const ratingInfo = document.createElement("div");
    ratingInfo.className = "rating-info";

    const ratingLabel = document.createElement("span");
    ratingLabel.className = "rating-label";
    ratingLabel.textContent = "التقييم:";

    const ratingValue = document.createElement("span");
    ratingValue.className = "rating-value";
    ratingValue.textContent = anime.imdb || "غير متوفر";

    const ratingIcon = document.createElement("i");
    ratingIcon.className = "fas fa-star rating-icon";

    ratingInfo.appendChild(ratingIcon);
    ratingInfo.appendChild(ratingLabel);
    ratingInfo.appendChild(ratingValue);
    bottomInfo.appendChild(ratingInfo);

    const btn = document.createElement("a");
    btn.textContent = "مشاهدة الآن";
    btn.href = `anime-details.html?id=${anime.id}`;
    btn.classList.add("watch-btn");
    bottomInfo.appendChild(btn);

    card.appendChild(bottomInfo);

    return card;
  }

  function renderAnimeGrid() {
    if (animeGrid) {
      animeGrid.innerHTML = "";
      const animeToShow = currentAnimeList.slice(0, currentPage * itemsPerPage);

      if (animeToShow.length === 0) {
        animeGrid.innerHTML = `<div class="no-results">لا توجد أنميات لعرضها مع الفلاتر المحددة</div>`;
        return;
      }

      animeToShow.forEach((anime) => {
        animeGrid.appendChild(createAnimeCard(anime, true));
      });

      loader.classList.toggle("hidden", currentPage * itemsPerPage >= currentAnimeList.length);
    }
  }

  function setupInfiniteScroll() {
    let isScrolling = false;
    window.addEventListener("scroll", () => {
      if (isScrolling) return;
      isScrolling = true;

      setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          if (currentPage * itemsPerPage < currentAnimeList.length) {
            loader.classList.remove("hidden");
            setTimeout(() => {
              currentPage++;
              renderAnimeGrid();
            }, 500);
          }
        }
        isScrolling = false;
      }, 200);
    });
  }

  // --- Spotlight Slider Functions ---
  let spotlightAnimeList = [];
  let currentSpotlightIndex = 0;
  let spotlightInterval = null;

  function createSpotlightSlide(anime) {
    const slide = document.createElement("div");
    slide.classList.add("slider-slide");

    const img = document.createElement("img");
    img.src = anime.cover || anime.poster || '';
    img.alt = anime.title;
    img.setAttribute("loading", "lazy");
    slide.appendChild(img);

    const overlay = document.createElement("div");
    overlay.classList.add("slider-overlay");

    const title = document.createElement("h3");
    title.textContent = anime.title;
    overlay.appendChild(title);

    const episodeInfo = document.createElement("p");
    episodeInfo.classList.add("slider-episode-info");
    episodeInfo.innerHTML = `<i class="fas fa-film"></i> الحلقة: ${anime.currentEpisode}`;
    overlay.appendChild(episodeInfo);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("slider-buttons-action");

    const watchBtn = document.createElement("a");
    watchBtn.href = `aniwatch.html?id=${anime.id}&episode=${anime.currentEpisode || 1}`;
    watchBtn.classList.add("slider-btn", "watch-now");
    watchBtn.innerHTML = '<i class="fas fa-play"></i> شاهد الآن';
    buttonsContainer.appendChild(watchBtn);

    const detailsBtn = document.createElement("a");
    detailsBtn.href = `anime-details.html?id=${anime.id}`;
    detailsBtn.classList.add("slider-btn");
    detailsBtn.innerHTML = '<i class="fas fa-info-circle"></i> تفاصيل';
    buttonsContainer.appendChild(detailsBtn);

    overlay.appendChild(buttonsContainer);
    slide.appendChild(overlay);

    return slide;
  }

  function createSpotlightButtons() {
    const buttonsContainer = document.getElementById("sliderButtons");
    if (!buttonsContainer) return;

    buttonsContainer.innerHTML = "";

    spotlightAnimeList.forEach((_, index) => {
      const button = document.createElement("button");
      button.classList.add("slider-button");
      if (index === 0) button.classList.add("active");
      button.addEventListener("click", () => {
        currentSpotlightIndex = index;
        updateSpotlightSlider();
        resetSpotlightTimer();
      });
      buttonsContainer.appendChild(button);
    });
  }

  function updateSpotlightSlider() {
    const sliderTrack = document.getElementById("sliderTrack");
    if (!sliderTrack) return;

    sliderTrack.style.transform = `translateX(-${currentSpotlightIndex * 100}%)`;

    const buttonsContainer = document.getElementById("sliderButtons");
    if (buttonsContainer) {
      buttonsContainer.querySelectorAll(".slider-button").forEach((btn, index) => {
        btn.classList.toggle("active", index === currentSpotlightIndex);
      });
    }

    const nextIndex = (currentSpotlightIndex + 1) % spotlightAnimeList.length;
    const nextAnime = spotlightAnimeList[nextIndex];
    if (nextAnime) {
      const preloadImg = new Image();
      preloadImg.src = nextAnime.cover || nextAnime.poster || '';
    }
  }

  function startSpotlightTimer() {
    if (spotlightInterval) return;

    spotlightInterval = setInterval(() => {
      currentSpotlightIndex = (currentSpotlightIndex + 1) % spotlightAnimeList.length;
      updateSpotlightSlider();
    }, 5000);
  }

  function resetSpotlightTimer() {
    if (spotlightInterval) {
      clearInterval(spotlightInterval);
      spotlightInterval = null;
    }
    setTimeout(() => {
      if (!spotlightInterval) {
        startSpotlightTimer();
      }
    }, 2000);
  }

  function setupSpotlightControls() {
    const prevBtn = document.getElementById("prevSlide");
    const nextBtn = document.getElementById("nextSlide");
    const sliderContainer = document.getElementById("spotlightSlider");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        currentSpotlightIndex = (currentSpotlightIndex - 1 + spotlightAnimeList.length) % spotlightAnimeList.length;
        updateSpotlightSlider();
        resetSpotlightTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentSpotlightIndex = (currentSpotlightIndex + 1) % spotlightAnimeList.length;
        updateSpotlightSlider();
        resetSpotlightTimer();
      });
    }

    if (sliderContainer) {
      sliderContainer.addEventListener("mouseenter", () => {
        if (spotlightInterval) {
          clearInterval(spotlightInterval);
          spotlightInterval = null;
        }
      });

      sliderContainer.addEventListener("mouseleave", () => {
        if (!spotlightInterval) {
          setTimeout(() => {
            startSpotlightTimer();
          }, 1000);
        }
      });
    }
  }

  function renderSpotlightSlider() {
    const sliderTrack = document.getElementById("sliderTrack");
    if (!sliderTrack) return;

    const newSpotlightAnimeList = animeList
      .filter((anime) => anime.showIn === "recent" || anime.showIn === "both")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (JSON.stringify(newSpotlightAnimeList) === JSON.stringify(spotlightAnimeList)) {
      return;
    }

    spotlightAnimeList = newSpotlightAnimeList;

    if (spotlightAnimeList.length === 0) {
      sliderTrack.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">لا توجد أنميات حديثة لعرضها</div>';
      return;
    }

    sliderTrack.innerHTML = "";
    spotlightAnimeList.forEach((anime) => {
      const slide = createSpotlightSlide(anime);
      sliderTrack.appendChild(slide);
    });

    createSpotlightButtons();
    setupSpotlightControls();
    updateSpotlightSlider();
    startSpotlightTimer();
  }

  async function loadData() {
    if (loader) loader.classList.remove("hidden");

    try {
      const result = await DataManager.getAnimeList();
      if (result.data && Array.isArray(result.data)) {
        const processedData = result.data.map(processAnimeData);
        const uniqueAnime = new Map();
        processedData.forEach((anime) => uniqueAnime.set(anime.id, anime));
        animeList = Array.from(uniqueAnime.values());
        if (window.showNotification) {
          window.showNotification("تم تحميل بيانات الأنمي بنجاح");
        }
        initFilters();
        initGridToggle();
        renderSpotlightSlider();
        filterAnimeList();
      } else {
        if (window.showNotification) {
          window.showNotification("البيانات المسترجعة غير صالحة");
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      if (window.showNotification) {
        window.showNotification("حدث خطأ في تحميل بيانات الأنمي");
      }
    } finally {
      if (loader) loader.classList.add("hidden");
      if (loadingScreen) {
        loadingScreen.classList.add("hidden");
        setTimeout(() => loadingScreen.remove(), 500);
      }
    }
  }

  document.addEventListener('panda:update', () => {
    if (window.showNotification) {
      window.showNotification("تم الكشف عن تحديث جديد، جاري التحديث...");
    }
    loadData();
  });

  if (animeSearch) {
    animeSearch.addEventListener("input", () => {
      const query = animeSearch.value.trim().toLowerCase();
      if (query.length === 0) {
        isFilteredByFavorites = false;
        isFilteredByWatchLater = false;
        isFilteredByMoods = false;
        if (favoritesBtn) favoritesBtn.classList.remove("active");
        if (watchLaterBtn) watchLaterBtn.classList.remove("active");
        if (moodFilterBtn) moodFilterBtn.classList.remove("active");
        currentAnimeList = [...animeList];
        filterAnimeList();
        return;
      }

      currentAnimeList = animeList.filter((anime) => anime.title.toLowerCase().includes(query));
      currentPage = 1;
      renderAnimeGrid();
    });
  }

  function preventContextMenu() {
    document.querySelectorAll('.anime-card img').forEach(img => {
      img.addEventListener('contextmenu', e => e.preventDefault());
    });
  }

  setupInfiniteScroll();
  loadData();
  preventContextMenu();
});
