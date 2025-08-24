import DataManager from '../../data-manager.js';

document.addEventListener('DOMContentLoaded', () => {

  // الثيم
  (function applyTheme(){
    const saved = localStorage.getItem('theme');
    document.documentElement.classList.toggle('theme-purple', saved === 'purple');
  })();

  // عناصر
  const params           = new URLSearchParams(location.search);
  const animeId          = params.get('id');
  const loadingScreen    = document.getElementById('loadingScreen');
  const posterEl         = document.getElementById('animePoster');
  const titleEl          = document.getElementById('animeTitle');
  const genresEl         = document.getElementById('animeGenres');
  const ratingEl         = document.getElementById('animeRating');
  const episodesEl       = document.getElementById('episodeCount');
  const statusEl         = document.getElementById('animeStatus');
  const descEl           = document.getElementById('animeDescription');
  const watchBtn         = document.getElementById('watchNowBtn');
  const favoriteBtn      = document.getElementById('favoriteBtn');
  const watchLaterBtn    = document.getElementById('watchLaterBtn');
  const backBtn          = document.getElementById('backBtn');
  const shareBtn         = document.getElementById('shareBtn');
  const ratingBox        = document.getElementById('userRatingValue');
  const commentForm      = document.getElementById('commentFormContainer');
  const commentInput     = document.getElementById('commentInput');
  const submitCommentBtn = document.getElementById('submitCommentBtn');
  const commentsList     = document.getElementById('commentsList');
  const loginToComment   = document.getElementById('loginToComment');

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  function notify(msg, type='info') {
    if (window.showNotification) {
      window.showNotification(msg, type);
    } else {
      console.log(`[${type}] ${msg}`);
    }
  }

  // حالة التعليقات حسب تسجيل الدخول
  if (isLoggedIn) {
    commentForm && (commentForm.style.display = 'flex');
    loginToComment && (loginToComment.style.display = 'none');
  } else {
    commentForm && (commentForm.style.display = 'none');
    loginToComment && (loginToComment.style.display = 'block');
  }

  // زر العودة
  backBtn?.addEventListener('click', () => {
    if (document.referrer && document.referrer.includes('anime.html')) {
      history.back();
      return;
    }
    location.href = '../anime/anime.html';
  });

  // مشاركة
  shareBtn?.addEventListener('click', () => {
    const url = location.href;
    if (navigator.share) {
      navigator.share({ title: document.title, url })
        .then(()=>notify('تمت المشاركة بنجاح','success'))
        .catch(()=>notify('أُلغيَت المشاركة','warning'));
    } else {
      navigator.clipboard.writeText(url)
        .then(()=>notify('تم نسخ الرابط','success'))
        .catch(()=>notify('تعذر نسخ الرابط','error'));
    }
  });

  // مفضلة
  if (favoriteBtn) {
    function update() {
      const fav = JSON.parse(localStorage.getItem('favorites') || '[]');
      favoriteBtn.classList.toggle('active', fav.includes(animeId));
    }
    favoriteBtn.addEventListener('click', () => {
      if (!isLoggedIn) { notify('يجب تسجيل الدخول لإضافة للمفضلة'); return; }
      let fav = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (fav.includes(animeId)) {
        fav = fav.filter(id => id !== animeId);
        notify('أزيل من المفضلة');
      } else {
        fav.push(animeId);
        notify('أضيف للمفضلة','success');
      }
      localStorage.setItem('favorites', JSON.stringify(fav));
      update();
    });
    update();
  }

  // مشاهدة لاحقاً
  if (watchLaterBtn) {
    function update() {
      const wl = JSON.parse(localStorage.getItem('watchLater') || '[]');
      watchLaterBtn.classList.toggle('active', wl.includes(animeId));
    }
    watchLaterBtn.addEventListener('click', () => {
      if (!isLoggedIn) { notify('يجب تسجيل الدخول لإضافة للمشاهدة لاحقاً'); return; }
      let wl = JSON.parse(localStorage.getItem('watchLater') || '[]');
      if (wl.includes(animeId)) {
        wl = wl.filter(id => id !== animeId);
        notify('أزيل من مشاهدة لاحقاً');
      } else {
        wl.push(animeId);
        notify('أضيف إلى مشاهدة لاحقاً','success');
      }
      localStorage.setItem('watchLater', JSON.stringify(wl));
      update();
    });
    update();
  }

  // تقييم (مستقبلي)
  ratingBox?.addEventListener('click', () => {
    if (!isLoggedIn) { notify('سجّل الدخول أولاً'); return; }
    notify('نظام التقييم قادم قريباً');
  });

  // التعليقات
  submitCommentBtn?.addEventListener('click', () => {
    if (!isLoggedIn) { notify('يجب تسجيل الدخول للتعليق'); return; }
    const text = commentInput.value.trim();
    if (!text) { notify('اكتب تعليقاً أولاً'); return; }
    const key = `comments_${animeId}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    const username = localStorage.getItem('username') || 'مستخدم';
    arr.push({ content: text, username, createdAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(arr));
    commentInput.value = '';
    notify('تم نشر التعليق','success');
    loadComments();
  });

  function loadComments() {
    if (!commentsList) return;
    const key = `comments_${animeId}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]')
      .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    commentsList.innerHTML = '';
    if (arr.length === 0) {
      commentsList.innerHTML = '<p>لا توجد تعليقات بعد.</p>';
      return;
    }
    arr.forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment';
      div.innerHTML = `<p><strong>${c.username}</strong>:</p><p>${c.content}</p>`;
      commentsList.appendChild(div);
    });
  }

  // ترجمة الوصف (اختياري)
  async function translateDescription(desc) {
    if (!desc || desc === 'لا يوجد وصف.') return desc;
    try {
      const r = await fetch('https://libretranslate.de/translate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ q:desc, source:'en', target:'ar', format:'text' })
      });
      const data = await r.json();
      return data.translatedText || desc;
    } catch {
      return desc;
    }
  }

  function translateStatus(status) {
    if (!status) return 'غير معروف';
    const map = { ongoing:'مستمر', completed:'مكتمل', dropped:'متوقف', soon:'قريباً' };
    return map[String(status).toLowerCase()] || status;
  }

  function hideLoader() {
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      loadingScreen.classList.add('hidden');
      setTimeout(()=> loadingScreen.remove(), 500);
    }
  }

  async function updateUI(animeData) {
    posterEl && (posterEl.src = animeData.image);
    titleEl && (titleEl.textContent = animeData.title);
    ratingEl && (ratingEl.textContent = animeData.imdb);
    statusEl && (statusEl.textContent = translateStatus(animeData.status));
    episodesEl && (episodesEl.textContent = animeData.totalEpisodes);
    if (genresEl) {
      genresEl.innerHTML = '';
      if (animeData.genres?.length) {
        animeData.genres.forEach(g => {
          const span = document.createElement('span');
          span.textContent = g;
          genresEl.appendChild(span);
        });
      } else {
        genresEl.textContent = 'لا توجد تصنيفات';
      }
    }
    if (!animeData.translatedDescription) {
      const trans = await translateDescription(animeData.description);
      animeData.translatedDescription = trans;
      const cacheKey = `anime_${animeId}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached) {
        cached.translatedDescription = trans;
        localStorage.setItem(cacheKey, JSON.stringify(cached));
      }
    }
    descEl && (descEl.textContent = animeData.translatedDescription || animeData.description);
  }

  async function loadAnimeData() {
    if (!animeId) {
      titleEl && (titleEl.textContent = 'لم يتم العثور على الأنمي');
      notify('معرف الأنمي مفقود','error');
      hideLoader();
      loadComments();
      return;
    }

    const cacheKey = `anime_${animeId}`;
    const TTL = 60000;
    const cachedRaw = localStorage.getItem(cacheKey);
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw);
        if (Date.now() - cached.timestamp < TTL) {
          await updateUI(cached);
          loadComments();
          hideLoader();
          return;
        }
      } catch { localStorage.removeItem(cacheKey); }
    }

    try {
      const data = await DataManager.getAnimeList();
      if (!data?.data || !Array.isArray(data.data)) throw new Error('بيانات غير صالحة');
      const found = data.data.find(a => a.id === animeId);
      if (!found) {
        titleEl && (titleEl.textContent = 'الأنمي غير موجود');
        notify('الأنمي غير موجود','warning');
        loadComments();
        hideLoader();
        return;
      }
      const animeData = {
        id: found.id,
        image: found.cover || found.poster || 'https://via.placeholder.com/800x450?text=No+Image',
        title: found.title || 'بدون عنوان',
        imdb: found.rating ? Number(found.rating).toFixed(1) : '0.0',
        description: found.description || 'لا يوجد وصف.',
        status: found.state || 'غير معروف',
        totalEpisodes: found.totalEpisodes ? `${found.totalEpisodes} حلقة` : 'غير معروف',
        genres: Array.isArray(found.category) ? found.category : ['لا توجد تصنيفات'],
        currentEpisode: found.currentEpisode || 0,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(animeData));
      await updateUI(animeData);
      loadComments();
    } catch (e) {
      console.error(e);
      titleEl && (titleEl.textContent = 'خطأ في تحميل البيانات');
      notify('حدث خطأ أثناء التحميل','error');
    } finally {
      hideLoader();
    }
  }

  // زر مشاهدة الآن
  watchBtn?.addEventListener('click', () => {
    notify('جارٍ التحقق من الحلقات...');
    const cachedRaw = localStorage.getItem(`anime_${animeId}`);
    let episode = 0;
    if (cachedRaw) {
      try {
        const c = JSON.parse(cachedRaw);
        episode = c.currentEpisode || 0;
      } catch {}
    }
    setTimeout(() => {
      if (episode > 0) {
        location.href = `../aniwatch/aniwatch.html?id=${animeId}&ep=${episode}`;
      } else {
        notify('لا توجد حلقات متاحة حالياً','warning');
      }
    }, 350);
  });

  // بدء
  loadAnimeData();
  loadComments();
});
