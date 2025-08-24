
import DataManager from '../../data-manager.js';

document.addEventListener("DOMContentLoaded", () => {

  /* === الثيم === */
  function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    document.documentElement.classList.toggle("theme-purple", savedTheme === "purple");
  }
  applySavedTheme();

  /* === عناصر DOM === */
  const params = new URLSearchParams(window.location.search);
  const animeId = params.get("id");
  const loadingScreen = document.getElementById("loadingScreen");
  const poster = document.getElementById("animePoster");
  const title = document.getElementById("animeTitle");
  const genresEl = document.getElementById("animeGenres");
  const ratingEl = document.getElementById("animeRating");
  const episodeCountEl = document.getElementById("episodeCount");
  const statusEl = document.getElementById("animeStatus");
  const descriptionEl = document.getElementById("animeDescription");
  const watchBtn = document.getElementById("watchNowBtn");
  const favoriteBtn = document.getElementById("favoriteBtn");
  const watchLaterBtn = document.getElementById("watchLaterBtn");
  const userRatingValue = document.getElementById("userRatingValue");
  const backToListBtn = document.getElementById("backToListBtn");
  const shareBtn = document.getElementById("shareBtn");
  const commentForm = document.getElementById("commentFormContainer");
  const commentInput = document.getElementById("commentInput");
  const submitCommentBtn = document.getElementById("submitCommentBtn");
  const commentsList = document.getElementById("commentsList");
  const loginToComment = document.getElementById("loginToComment");

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  /* === دالة إشعار موحّدة === */
  function notify(msg, type = 'info') {
    if (window.showNotification) {
      window.showNotification(msg, type);
    } else {
      console.log(`[${type}] ${msg}`);
    }
  }

  /* === واجهة المستخدم حسب تسجيل الدخول === */
  if (isLoggedIn) {
    commentForm && (commentForm.style.display = "flex");
    loginToComment && (loginToComment.style.display = "none");
  } else {
    commentForm && (commentForm.style.display = "none");
    loginToComment && (loginToComment.style.display = "block");
  }

  /* === أزرار عامة === */
  backToListBtn?.addEventListener("click", () => {
    notify("جارٍ العودة لقائمة الأنمي...");
    setTimeout(()=> window.location.href = "../anime/anime.html", 400);
  });

  shareBtn?.addEventListener("click", () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: location.href })
        .then(()=>notify("تمت المشاركة بنجاح","success"))
        .catch(()=>notify("تعذر المشاركة","error"));
    } else {
      navigator.clipboard.writeText(location.href)
        .then(()=>notify("تم نسخ الرابط","success"))
        .catch(()=>notify("تعذر نسخ الرابط","error"));
    }
  });

  /* === المفضلة === */
  if (favoriteBtn) {
    const updateFavState = () => {
      const ids = JSON.parse(localStorage.getItem("favorites") || "[]");
      favoriteBtn.classList.toggle("active", ids.includes(animeId));
    };
    favoriteBtn.addEventListener("click", () => {
      if (!isLoggedIn) { notify("يجب تسجيل الدخول لإضافة للمفضلة"); return; }
      let ids = JSON.parse(localStorage.getItem("favorites") || "[]");
      if (ids.includes(animeId)) {
        ids = ids.filter(id => id !== animeId);
        notify("أزيل من المفضلة");
      } else {
        ids.push(animeId);
        notify("أضيف إلى المفضلة","success");
      }
      localStorage.setItem("favorites", JSON.stringify(ids));
      updateFavState();
    });
    updateFavState();
  }

  /* === مشاهدة لاحقاً === */
  if (watchLaterBtn) {
    const updateWLState = () => {
      const ids = JSON.parse(localStorage.getItem("watchLater") || "[]");
      watchLaterBtn.classList.toggle("active", ids.includes(animeId));
    };
    watchLaterBtn.addEventListener("click", () => {
      if (!isLoggedIn) { notify("يجب تسجيل الدخول لإضافة للمشاهدة لاحقاً"); return; }
      let ids = JSON.parse(localStorage.getItem("watchLater") || "[]");
      if (ids.includes(animeId)) {
        ids = ids.filter(id => id !== animeId);
        notify("أزيل من مشاهدة لاحقاً");
      } else {
        ids.push(animeId);
        notify("أضيف إلى مشاهدة لاحقاً","success");
      }
      localStorage.setItem("watchLater", JSON.stringify(ids));
      updateWLState();
    });
    updateWLState();
  }

  /* === تقييم المستخدم (مستقبلي) === */
  userRatingValue?.addEventListener("click", () => {
    if (!isLoggedIn) { notify("يجب تسجيل الدخول"); return; }
    notify("نظام التقييم قادم قريباً");
  });

  /* === التعليقات (محلي) === */
  submitCommentBtn?.addEventListener("click", () => {
    if (!isLoggedIn) { notify("يجب تسجيل الدخول للتعليق"); return; }
    const content = commentInput?.value.trim();
    if (!content) { notify("اكتب تعليقاً أولاً"); return; }
    const key = `comments_${animeId}`;
    const comments = JSON.parse(localStorage.getItem(key) || "[]");
    const username = localStorage.getItem("username") || "مستخدم مجهول";
    comments.push({ content, username, createdAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(comments));
    commentInput.value = "";
    notify("تم إضافة التعليق","success");
    loadComments();
  });

  function loadComments() {
    if (!commentsList) return;
    const key = `comments_${animeId}`;
    const comments = JSON.parse(localStorage.getItem(key) || "[]");
    commentsList.innerHTML = "";
    if (comments.length === 0) {
      commentsList.innerHTML = "<p>لا توجد تعليقات بعد.</p>";
      return;
    }
    comments
      .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(c => {
        const div = document.createElement("div");
        div.className = "comment";
        div.innerHTML = `<p><strong>${c.username}</strong>:</p><p>${c.content}</p>`;
        commentsList.appendChild(div);
      });
  }

  /* === ترجمة الوصف (خارجي) === */
  async function translateDescription(desc) {
    if (!desc || desc === "لا يوجد وصف.") return desc;
    try {
      const res = await fetch('https://libretranslate.de/translate', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ q:desc, source:"en", target:"ar", format:"text" })
      });
      const data = await res.json();
      return data.translatedText || desc;
    } catch(e){
      console.error("خطأ ترجمة:", e);
      return desc;
    }
  }

  function translateStatus(status) {
    const map = { 'ongoing':'مستمر', 'completed':'مكتمل', 'dropped':'متوقف', 'soon':'قريبًا' };
    if (!status) return "غير معروف";
    return map[String(status).toLowerCase()] || status;
  }

  /* === تحميل بيانات الأنمي === */
  async function loadAnimeData() {
    if (!animeId) {
      title && (title.textContent = "لم يتم العثور على الأنمي");
      notify("معرف الأنمي غير موجود","error");
      hideLoader();
      loadComments();
      return;
    }

    const timeout = setTimeout(() => {
      notify("انتهت مهلة التحميل","warning");
      hideLoader();
    }, 7000);

    // محاولة استخدام الكاش
    const cacheKey = `anime_${animeId}`;
    const TTL = 60000;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const obj = JSON.parse(cached);
        if (Date.now() - obj.timestamp < TTL) {
          await updateUI(obj);
          loadComments();
          clearTimeout(timeout);
          hideLoader();
          return;
        }
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      const result = await DataManager.getAnimeList();
      if (!result?.data || !Array.isArray(result.data)) throw new Error("بيانات غير صالحة");
      const anime = result.data.find(a => a.id === animeId);
      if (!anime) {
        title && (title.textContent = "الأنمي غير موجود");
        notify("لم يتم العثور على الأنمي","warning");
        clearTimeout(timeout);
        hideLoader();
        loadComments();
        return;
      }
      const animeData = {
        id: anime.id,
        image: anime.cover || anime.poster || "https://via.placeholder.com/800x450?text=No+Image",
        title: anime.title || "بدون عنوان",
        imdb: anime.rating ? Number(anime.rating).toFixed(1) : "0.0",
        description: anime.description || "لا يوجد وصف.",
        status: anime.state || "غير معروف",
        totalEpisodes: anime.totalEpisodes ? `${anime.totalEpisodes} حلقة` : "غير معروف",
        genres: Array.isArray(anime.category) ? anime.category : ["لا توجد تصنيفات"],
        currentEpisode: anime.currentEpisode || 0,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(animeData));
      await updateUI(animeData);
      loadComments();
    } catch(e){
      console.error("خطأ الجلب:", e);
      title && (title.textContent = "حدث خطأ في التحميل");
      notify("خطأ أثناء تحميل البيانات","error");
    } finally {
      clearTimeout(timeout);
      hideLoader();
    }
  }

  async function updateUI(animeData) {
    poster && (poster.src = animeData.image);
    title && (title.textContent = animeData.title);
    ratingEl && (ratingEl.textContent = animeData.imdb);
    statusEl && (statusEl.textContent = translateStatus(animeData.status));
    episodeCountEl && (episodeCountEl.textContent = animeData.totalEpisodes);
    if (genresEl) {
      genresEl.innerHTML = "";
      if (Array.isArray(animeData.genres) && animeData.genres.length) {
        animeData.genres.forEach(g => {
          const span = document.createElement("span");
            span.textContent = g;
          genresEl.appendChild(span);
        });
      } else {
        genresEl.textContent = "لا توجد تصنيفات";
      }
    }
    let trans = animeData.translatedDescription;
    if (!trans) {
      trans = await translateDescription(animeData.description);
      animeData.translatedDescription = trans;
      // تحديث التخزين بعد الترجمة
      const cacheKey = `anime_${animeId}`;
      localStorage.setItem(cacheKey, JSON.stringify(animeData));
    }
    descriptionEl && (descriptionEl.textContent = trans || animeData.description);
  }

  /* === زر مشاهدة الآن === */
  watchBtn?.addEventListener("click", () => {
    notify("الانتقال إلى صفحة المشاهدة...");
    setTimeout(() => {
      const cached = localStorage.getItem(`anime_${animeId}`);
      let currentEpisode = 0;
      if (cached) {
        try {
          const obj = JSON.parse(cached);
          currentEpisode = obj.currentEpisode || 0;
        } catch {}
      }
      if (currentEpisode > 0) {
        window.location.href = `../aniwatch/aniwatch.html?id=${animeId}`;
      } else {
        notify("لا توجد حلقات متاحة حالياً","warning");
      }
    }, 400);
  });

  /* === وظائف مساعدة === */
  function hideLoader() {
    if (loadingScreen && !loadingScreen.classList.contains("hidden")) {
      loadingScreen.classList.add("hidden");
      setTimeout(()=> loadingScreen.remove(), 500);
    }
  }

  /* === بدء التحميل === */
  loadAnimeData();
});
