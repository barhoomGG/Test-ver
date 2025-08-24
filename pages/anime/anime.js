// anime.js (محدّث لمسارات صحيحة + يعمل داخل مجلد /pages/anime/)
import DataManager from '../../data-manager.js';

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

  let animeList = [];
  let currentPage = 1;
  const itemsPerPage = 12;
  let currentAnimeList = [];
  let activeSort = "newest";
  let activeGenres = new Set();
  let activeMoods = new Set();
  let currentColumns = localStorage.getItem("gridColumns") || "3";
  let isFilteredByFavorites = false;
  let isFilteredByWatchLater = false;
  let isFilteredByMoods = false;
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  let isMobile = window.innerWidth <= 768;

  const predefinedGenres = [
    "Action","Adventure","Comedy","Drama","Fantasy","Horror","Mystery",
    "Romance","Sci-Fi","Slice of Life","Sports","Psychological","Thriller",
    "Magic","Supernatural","Mecha","School","Martial Arts","Historical",
    "Military","Music","Shoujo","Shounen","Seinen","Josei","Parody"
  ];

  const predefinedMoods = {
    "سعيد":["comedy","slice of life","parody"],
    "حزين":["drama","psychological","seinen"],
    "رومانسي":["romance","shoujo","josei"],
    "مثير":["action","adventure","thriller"],
    "مرعب":["horror","mystery"],
    "هادئ":["slice of life","music","school"],
    "ملهم":["sports","historical","military"],
    "غامض":["mystery","supernatural"],
    "غاضب":["action","psychological","martial arts"],
    "متحمس":["adventure","sports","shounen"],
    "خائف":["horror","thriller"],
    "متفائل":["comedy","drama","fantasy"],
    "محبط":["psychological","drama"],
    "مستريح":["slice of life","music"],
    "نشيط":["sports","action","mecha"],
    "فضولي":["mystery","sci-fi","magic"],
    "مغامر":["adventure","fantasy"],
    "عاطفي":["romance","drama"],
    "مبتكر":["sci-fi","mecha"],
    "تاريخي":["historical","military"],
    "ساخر":["parody"],
    "سحري":["magic","supernatural"],
    "ميكانيكي":["mecha"],
    "مدرسي":["school"],
    "قتالي":["martial arts"],
    "موسيقي":["music"]
  };

  const moodEmojis = {
    "سعيد":"😊","حزين":"😢","رومانسي":"❤️","مثير":"🔥","مرعب":"👻","هادئ":"🌿","ملهم":"💪",
    "غامض":"🕵️","غاضب":"😡","متحمس":"⚡","خائف":"😱","متفائل":"🌟","محبط":"😞","مستريح":"😌",
    "نشيط":"🏃","فضولي":"🤔","مغامر":"🗺️","عاطفي":"💕","مبتكر":"💡","تاريخي":"🏛️","ساخر":"😆",
    "سحري":"🪄","ميكانيكي":"🤖","مدرسي":"📚","قتالي":"🥊","موسيقي":"🎵"
  };

  function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    document.documentElement.classList.toggle("theme-purple", savedTheme === "purple");
  }
  applySavedTheme();

  function processAnimeData(data) {
    return {
      id: data.id,
      title: data.title,
      cover: data.cover || '',
      poster: data.poster || '',
      genres: Array.isArray(data.category)
        ? data.category.map(g => g.trim().toLowerCase())
        : String(data.category || "")
            .split(",")
            .map(g => g.trim().toLowerCase()),
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

  function setGridColumns(columns) {
    currentColumns = columns;
    animeGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    animeGrid.classList.remove("two-columns","three-columns","auto-columns");
    animeGrid.classList.add(columns === "2" ? "two-columns" : "three-columns");
    localStorage.setItem("gridColumns", columns);
    renderAnimeGrid();
  }

  function initGridToggle() {
    if (!isMobile) {
      animeGrid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(250px,1fr))';
      animeGrid.classList.remove("two-columns","three-columns");
      animeGrid.classList.add("auto-columns");
      gridToggleBtn.style.display = 'none';
    } else {
      setGridColumns(currentColumns);
      gridToggleBtn.style.display = 'flex';
    }
    gridToggleBtn?.addEventListener("click", () => {
      if (!isMobile) return;
      const newColumns = currentColumns === "2" ? "3" : "2";
      setGridColumns(newColumns);
    });

    window.addEventListener('resize', () => {
      const newIsMobile = window.innerWidth <= 768;
      if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        if (isMobile) {
          gridToggleBtn.style.display = 'flex';
          setGridColumns(localStorage.getItem('gridColumns') || '3');
        } else {
          gridToggleBtn.style.display = 'none';
          animeGrid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(250px,1fr))';
          animeGrid.classList.remove("two-columns","three-columns");
          animeGrid.classList.add("auto-columns");
        }
        renderAnimeGrid();
      }
    });
  }

  function initFilters() {
    genreFilterBtn?.addEventListener("click", () => {
      genreFilterMenu.classList.toggle("hidden");
      sortFilterMenu.classList.add("hidden");
      moodFilterMenu.classList.add("hidden");
    });
    sortFilterBtn?.addEventListener("click", () => {
      sortFilterMenu.classList.toggle("hidden");
      genreFilterMenu.classList.add("hidden");
      moodFilterMenu.classList.add("hidden");
    });
    moodFilterBtn?.addEventListener("click", () => {
      moodFilterMenu.classList.toggle("hidden");
      genreFilterMenu.classList.add("hidden");
      sortFilterMenu.classList.add("hidden");
    });
    closeGenreFilter?.addEventListener("click", () => genreFilterMenu.classList.add("hidden"));
    closeSortFilter?.addEventListener("click", () => sortFilterMenu.classList.add("hidden"));
    closeMoodFilter?.addEventListener("click", () => moodFilterMenu.classList.add("hidden"));

    document.querySelectorAll(".sort-option").forEach(option => {
      option.addEventListener("click", () => {
        document.querySelectorAll(".sort-option").forEach(btn => btn.classList.remove("active"));
        option.classList.add("active");
        activeSort = option.dataset.sort;
        sortAnimeList();
        renderAnimeGrid();
        sortFilterMenu.classList.add("hidden");
      });
    });

    createGenreButtons();
    createMoodButtons();

    applyGenresBtn?.addEventListener("click", applyGenreFilters);
    resetGenresBtn?.addEventListener("click", resetGenreFilters);
    applyMoodsBtn?.addEventListener("click", applyMoodFilters);
    resetMoodsBtn?.addEventListener("click", resetMoodFilters);

    favoritesBtn?.addEventListener("click", () => {
      if (!isLoggedIn) {
        window.showNotification?.("يجب أن يسجل الدخول أولا حتى تضهر المحتوى");
        return;
      }
      isFilteredByFavorites = !isFilteredByFavorites;
      isFilteredByWatchLater = false;
      isFilteredByMoods = false;
      favoritesBtn.classList.toggle("active", isFilteredByFavorites);
      watchLaterBtn?.classList.remove("active");
      moodFilterBtn?.classList.remove("active");
      loadUserFavorites();
      renderAnimeGrid();
    });

    watchLaterBtn?.addEventListener("click", () => {
      if (!isLoggedIn) {
        window.showNotification?.("يجب أن يسجل الدخول أولا حتى تضهر المحتوى");
        return;
      }
      isFilteredByWatchLater = !isFilteredByWatchLater;
      isFilteredByFavorites = false;
      isFilteredByMoods = false;
      watchLaterBtn.classList.toggle("active", isFilteredByWatchLater);
      favoritesBtn?.classList.remove("active");
      moodFilterBtn?.classList.remove("active");
      loadUserWatchLater();
      renderAnimeGrid();
    });
  }

  function createGenreButtons() {
    if (!genreFilterContainer) return;
    genreFilterContainer.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.textContent = "الكل";
    allBtn.classList.add("genre-btn","active");
    allBtn.dataset.genre = "all";
    genreFilterContainer.appendChild(allBtn);

    predefinedGenres.forEach(g => {
      const btn = document.createElement("button");
      btn.textContent = g;
      btn.classList.add("genre-btn");
      btn.dataset.genre = g.toLowerCase();
      genreFilterContainer.appendChild(btn);
    });

    allBtn.addEventListener("click", () => {
      document.querySelectorAll(".genre-btn").forEach(b => {
        if (b.dataset.genre !== "all") b.classList.remove("active");
      });
      allBtn.classList.add("active");
    });

    genreFilterContainer.querySelectorAll(".genre-btn:not([data-genre='all'])").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        allBtn.classList.remove("active");
      });
    });
  }

  function createMoodButtons() {
    if (!moodFilterContainer) return;
    moodFilterContainer.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.textContent = "الكل";
    allBtn.classList.add("mood-btn","active");
    allBtn.dataset.mood = "all";
    moodFilterContainer.appendChild(allBtn);

    Object.keys(predefinedMoods).forEach(mood => {
      const btn = document.createElement("button");
      btn.textContent = `${mood} ${moodEmojis[mood] || ''}`;
      btn.classList.add("mood-btn");
      btn.dataset.mood = mood;
      moodFilterContainer.appendChild(btn);
    });

    allBtn.addEventListener("click", () => {
      moodFilterContainer.querySelectorAll(".mood-btn:not([data-mood='all'])").forEach(b => b.classList.remove("active"));
      allBtn.classList.add("active");
    });

    moodFilterContainer.querySelectorAll(".mood-btn:not([data-mood='all'])").forEach(btn => {
      btn.addEventListener("click", () => {
        moodFilterContainer.querySelectorAll(".mood-btn:not([data-mood='all'])").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        allBtn.classList.remove("active");
      });
    });
  }

  function applyGenreFilters() {
    activeGenres.clear();
    document.querySelectorAll(".genre-btn.active:not([data-genre='all'])").forEach(btn => activeGenres.add(btn.textContent));
    if (activeGenres.size === 0) {
      document.querySelector("[data-genre='all']")?.classList.add("active");
    }
    isFilteredByFavorites = false;
    isFilteredByWatchLater = false;
    isFilteredByMoods = false;
    favoritesBtn?.classList.remove("active");
    watchLaterBtn?.classList.remove("active");
    moodFilterBtn?.classList.remove("active");
    window.showNotification?.("تم تطبيق فلتر التصنيفات");
    filterAnimeList();
    genreFilterMenu?.classList.add("hidden");
  }

  function resetGenreFilters() {
    document.querySelectorAll(".genre-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector("[data-genre='all']")?.classList.add("active");
    activeGenres.clear();
    isFilteredByFavorites = false;
    isFilteredByWatchLater = false;
    isFilteredByMoods = false;
    favoritesBtn?.classList.remove("active");
    watchLaterBtn?.classList.remove("active");
    moodFilterBtn?.classList.remove("active");
    window.showNotification?.("تم إعادة تعيين التصنيفات");
    filterAnimeList();
  }

  function applyMoodFilters() {
    activeMoods.clear();
    const activeMoodBtn = document.querySelector(".mood-btn.active:not([data-mood='all'])");
    const allMoodBtn = document.querySelector("[data-mood='all']");
    if (allMoodBtn?.classList.contains("active")) {
      activeGenres.clear();
      isFilteredByFavorites = false;
      isFilteredByWatchLater = false;
      isFilteredByMoods = false;
      favoritesBtn?.classList.remove("active");
      watchLaterBtn?.classList.remove("active");
      moodFilterBtn?.classList.remove("active");
      window.showNotification?.("تم عرض جميع الأنميات");
      filterAnimeList();
      moodFilterMenu?.classList.add("hidden");
      return;
    }
    if (activeMoodBtn) {
      const mood = activeMoodBtn.dataset.mood;
      activeMoods.add(mood);
      activeGenres.clear();
      predefinedMoods[mood].forEach(g => activeGenres.add(g));
      isFilteredByFavorites = false;
      isFilteredByWatchLater = false;
      isFilteredByMoods = true;
      favoritesBtn?.classList.remove("active");
      watchLaterBtn?.classList.remove("active");
      moodFilterBtn?.classList.add("active");
      window.showNotification?.("تم تطبيق فلتر الحالة النفسية");
    } else {
      activeGenres.clear();
      isFilteredByFavorites = false;
      isFilteredByWatchLater = false;
      isFilteredByMoods = false;
      favoritesBtn?.classList.remove("active");
      watchLaterBtn?.classList.remove("active");
      moodFilterBtn?.classList.remove("active");
      window.showNotification?.("تم إعادة تعيين الحالة النفسية");
    }
    filterAnimeList();
    moodFilterMenu?.classList.add("hidden");
  }

  function resetMoodFilters() {
    document.querySelectorAll(".mood-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector("[data-mood='all']")?.classList.add("active");
    activeMoods.clear();
    activeGenres.clear();
    isFilteredByFavorites = false;
    isFilteredByWatchLater = false;
    isFilteredByMoods = false;
    favoritesBtn?.classList.remove("active");
    watchLaterBtn?.classList.remove("active");
    moodFilterBtn?.classList.remove("active");
    window.showNotification?.("تم إعادة تعيين الحالة النفسية");
    filterAnimeList();
  }

  function loadUserFavorites() {
    const favoriteIds = JSON.parse(localStorage.getItem("favorites")) || [];
    currentAnimeList = animeList.filter(a => favoriteIds.includes(a.id));
    sortAnimeList();
    currentPage = 1;
    window.showNotification?.("تم تحميل الأنميات المفضلة");
  }

  function loadUserWatchLater() {
    const ids = JSON.parse(localStorage.getItem("watchLater")) || [];
    currentAnimeList = animeList.filter(a => ids.includes(a.id));
    sortAnimeList();
    currentPage = 1;
    window.showNotification?.("تم تحميل قائمة مشاهدة لاحقًا");
  }

  function sortAnimeList() {
    switch (activeSort) {
      case "imdb": currentAnimeList.sort((a,b)=>b.imdb - a.imdb); break;
      case "imdb-low": currentAnimeList.sort((a,b)=>a.imdb - b.imdb); break;
      case "newest": currentAnimeList.sort((a,b)=>new Date(b.releaseDate)-new Date(a.releaseDate)); break;
      case "views": currentAnimeList.sort((a,b)=>b.views - a.views); break;
      case "az": currentAnimeList.sort((a,b)=>a.title.localeCompare(b.title)); break;
      default: currentAnimeList.sort((a,b)=>new Date(b.releaseDate)-new Date(a.releaseDate));
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
      const activeLower = [...activeGenres].map(g=>g.toLowerCase());
      currentAnimeList = animeList.filter(anime => {
        if (!Array.isArray(anime.genres)) return false;
        const animeGenres = anime.genres.map(g => g.toLowerCase());
        return isFilteredByMoods
          ? activeLower.some(g => animeGenres.includes(g))
          : activeLower.every(g => animeGenres.includes(g));
      });
    }
    sortAnimeList();
    currentPage = 1;
    renderAnimeGrid();
  }

  function createAnimeCard(anime,isAll=true) {
    const card = document.createElement("div");
    card.classList.add("anime-card");
    const img = document.createElement("img");
    img.src = anime.poster || anime.cover || '';
    img.alt = anime.title;
    img.loading = "lazy";
    card.appendChild(img);

    const titleContainer = document.createElement("div");
    titleContainer.className = "title-container";
    const ltrContainer = document.createElement("div");
    ltrContainer.dir = "ltr";
    const title = document.createElement("h3");
    title.textContent = anime.title;
    ltrContainer.appendChild(title);
    titleContainer.appendChild(ltrContainer);
    card.appendChild(titleContainer);

    requestAnimationFrame(()=>{
      const lineHeight = parseFloat(getComputedStyle(title).lineHeight);
      if (title.offsetHeight <= lineHeight * 1.5) title.classList.add("centered-title");
      else title.classList.add("left-aligned-title");
    });

    const bottomInfo = document.createElement("div");
    bottomInfo.className = "bottom-info";

    const episodeInfo = document.createElement("div");
    episodeInfo.className = "episode-info";
    episodeInfo.innerHTML = `<i class="fas fa-film episode-icon"></i><span class="episode-label">${isAll ? 'الحلقات:' : 'الحلقة:'}</span> <span class="episode-number">${isAll ? anime.totalEpisodes : anime.currentEpisode}</span>`;
    bottomInfo.appendChild(episodeInfo);

    const ratingInfo = document.createElement("div");
    ratingInfo.className = "rating-info";
    ratingInfo.innerHTML = `<i class="fas fa-star rating-icon"></i><span class="rating-label">التقييم:</span> <span class="rating-value">${anime.imdb || 'غير متوفر'}</span>`;
    bottomInfo.appendChild(ratingInfo);

    const btn = document.createElement("a");
    btn.textContent = "مشاهدة الآن";
    btn.href = `../anime-details/anime-details.html?id=${encodeURIComponent(anime.id)}`;
    btn.classList.add("watch-btn");
    bottomInfo.appendChild(btn);

    card.appendChild(bottomInfo);
    return card;
  }

  function renderAnimeGrid() {
    if (!animeGrid) return;
    animeGrid.innerHTML = "";
    const animeToShow = currentAnimeList.slice(0, currentPage * itemsPerPage);
    if (animeToShow.length === 0) {
      animeGrid.innerHTML = `<div class="no-results">لا توجد أنميات لعرضها مع الفلاتر المحددة</div>`;
      loader?.classList.add("hidden");
      return;
    }
    animeToShow.forEach(a => animeGrid.appendChild(createAnimeCard(a,true)));
    loader?.classList.toggle("hidden", currentPage * itemsPerPage >= currentAnimeList.length);
  }

  function setupInfiniteScroll() {
    let busy = false;
    window.addEventListener("scroll", () => {
      if (busy) return;
      busy = true;
      setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          if (currentPage * itemsPerPage < currentAnimeList.length) {
            loader?.classList.remove("hidden");
            setTimeout(() => {
              currentPage++;
              renderAnimeGrid();
            }, 400);
          }
        }
        busy = false;
      }, 180);
    });
  }

  // Spotlight Slider
  let spotlightAnimeList = [];
  let currentSpotlightIndex = 0;
  let spotlightInterval = null;

  function createSpotlightSlide(anime) {
    const slide = document.createElement("div");
    slide.classList.add("slider-slide");
    const img = document.createElement("img");
    img.src = anime.cover || anime.poster || '';
    img.alt = anime.title;
    img.loading = "lazy";
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
    watchBtn.href = `../aniwatch/aniwatch.html?id=${anime.id}&episode=${anime.currentEpisode || 1}`;
    watchBtn.classList.add("slider-btn","watch-now");
    watchBtn.innerHTML = '<i class="fas fa-play"></i> شاهد الآن';
    buttonsContainer.appendChild(watchBtn);
    const detailsBtn = document.createElement("a");
    detailsBtn.href = `../anime-details/anime-details.html?id=${anime.id}`;
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
    spotlightAnimeList.forEach((_, idx) => {
      const button = document.createElement("button");
      button.classList.add("slider-button");
      if (idx === 0) button.classList.add("active");
      button.addEventListener("click", () => {
        currentSpotlightIndex = idx;
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
    buttonsContainer?.querySelectorAll(".slider-button").forEach((btn, i) => {
      btn.classList.toggle("active", i === currentSpotlightIndex);
    });
    const nextIndex = (currentSpotlightIndex + 1) % spotlightAnimeList.length;
    const nextAnime = spotlightAnimeList[nextIndex];
    if (nextAnime) {
      const preloadImg = new Image();
      preloadImg.src = nextAnime.cover || nextAnime.poster || '';
    }
  }

  function startSpotlightTimer() {
    if (spotlightInterval || spotlightAnimeList.length === 0) return;
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
    setTimeout(() => { if (!spotlightInterval) startSpotlightTimer(); }, 2000);
  }

  function setupSpotlightControls() {
    document.getElementById("prevSlide")?.addEventListener("click", () => {
      currentSpotlightIndex = (currentSpotlightIndex - 1 + spotlightAnimeList.length) % spotlightAnimeList.length;
      updateSpotlightSlider(); resetSpotlightTimer();
    });
    document.getElementById("nextSlide")?.addEventListener("click", () => {
      currentSpotlightIndex = (currentSpotlightIndex + 1) % spotlightAnimeList.length;
      updateSpotlightSlider(); resetSpotlightTimer();
    });
    const sliderContainer = document.getElementById("spotlightSlider");
    sliderContainer?.addEventListener("mouseenter", () => { if (spotlightInterval) { clearInterval(spotlightInterval); spotlightInterval = null; }});
    sliderContainer?.addEventListener("mouseleave", () => { if (!spotlightInterval) setTimeout(startSpotlightTimer, 1000); });
  }

  function renderSpotlightSlider() {
    const sliderTrack = document.getElementById("sliderTrack");
    if (!sliderTrack) return;
    const newList = animeList
      .filter(anime => anime.showIn === "recent" || anime.showIn === "both")
      .sort((a,b)=> new Date(b.date) - new Date(a.date))
      .slice(0,5);
    if (JSON.stringify(newList) === JSON.stringify(spotlightAnimeList)) return;
    spotlightAnimeList = newList;
    sliderTrack.innerHTML = "";
    if (spotlightAnimeList.length === 0) {
      sliderTrack.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;color:var(--text-secondary);">لا توجد أنميات حديثة</div>';
      return;
    }
    spotlightAnimeList.forEach(anime => sliderTrack.appendChild(createSpotlightSlide(anime)));
    createSpotlightButtons();
    setupSpotlightControls();
    updateSpotlightSlider();
    startSpotlightTimer();
  }

  async function loadData() {
    loader?.classList.remove("hidden");
    try {
      const result = await DataManager.getAnimeList();
      if (result?.data && Array.isArray(result.data)) {
        const processed = result.data.map(processAnimeData);
        const unique = new Map();
        processed.forEach(a => unique.set(a.id, a));
        animeList = Array.from(unique.values());
        window.showNotification?.("تم تحميل بيانات الأنمي بنجاح");
        initFilters();
        initGridToggle();
        renderSpotlightSlider();
        filterAnimeList();
      } else {
        window.showNotification?.("البيانات المسترجعة غير صالحة");
      }
    } catch (e) {
      console.error("Error loading anime list:", e);
      window.showNotification?.("حدث خطأ في تحميل بيانات الأنمي");
    } finally {
      loader?.classList.add("hidden");
      if (loadingScreen) {
        loadingScreen.classList.add("hidden");
        setTimeout(()=>loadingScreen.remove(),500);
      }
    }
  }

  document.addEventListener('panda:update', () => {
    window.showNotification?.("تم الكشف عن تحديث جديد، جاري التحديث...");
    loadData();
  });

  animeSearch?.addEventListener("input", () => {
    const query = animeSearch.value.trim().toLowerCase();
    if (!query) {
      isFilteredByFavorites = false;
      isFilteredByWatchLater = false;
      isFilteredByMoods = false;
      favoritesBtn?.classList.remove("active");
      watchLaterBtn?.classList.remove("active");
      moodFilterBtn?.classList.remove("active");
      currentAnimeList = [...animeList];
      filterAnimeList();
      return;
    }
    currentAnimeList = animeList.filter(anime => anime.title.toLowerCase().includes(query));
    currentPage = 1;
    renderAnimeGrid();
  });

  function preventContextMenu() {
    document.addEventListener("contextmenu", e => {
      const target = e.target;
      if (target.tagName === 'IMG' && target.closest('.anime-card')) {
        e.preventDefault();
      }
    });
  }

  setupInfiniteScroll();
  loadData();
  preventContextMenu();
});
