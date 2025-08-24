// component-loader.js (حقن CSS المكوّنات قبل ملفات الصفحة + منع تضارب)
(function () {
  const cache = new Map();

  function computeBaseComponentsPath() {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length && parts[parts.length - 1].includes('.')) parts.pop();
    if (parts.length === 0) return './components/';
    return '../'.repeat(parts.length) + 'components/';
  }
  const BASE = computeBaseComponentsPath();

  async function fetchText(url) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      return await res.text();
    } catch (e) {
      console.error('[component-loader] فشل جلب:', url, e.message);
      return null;
    }
  }

  function injectStyle(name, cssText) {
    if (!cssText) return;
    if (document.querySelector(`style[data-comp="${name}"]`)) return;
    const st = document.createElement('style');
    st.dataset.comp = name;
    st.textContent = cssText;

    // نحاول وضعه قبل أول stylesheet للصفحة حتى تبقى صفحة anime.css أقوى
    const firstPageSheet = document.querySelector('link[rel="stylesheet"], style[data-page-css]');
    if (firstPageSheet) {
      document.head.insertBefore(st, firstPageSheet);
    } else {
      document.head.appendChild(st);
    }
  }

  async function loadComponent(name, containerId, options = {}) {
    const { animate = true, log = false } = options;
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('[component-loader] لم يتم العثور على الحاوية:', containerId);
      return;
    }

    if (cache.has(name)) {
      container.innerHTML = cache.get(name).html;
      reveal(container, animate);
      log && console.info('[component-loader] (cache)', name);
      return;
    }

    container.classList.add('cmp-pending');
    const base = `${BASE}${name}/${name}`;

    // CSS أولاً
    const css = await fetchText(base + '.css');
    injectStyle(name, css);

    // HTML
    const html = await fetchText(base + '.html');
    if (!html) {
      container.innerHTML = `<div style="padding:8px;color:#f55;font:12px monospace">تعذر تحميل المكوّن: ${name}</div>`;
      reveal(container, false);
      return;
    }
    container.innerHTML = html;
    cache.set(name, { html });

    // JS
    const js = await fetchText(base + '.js');
    if (js && !document.querySelector(`script[data-comp="${name}"]`)) {
      const sc = document.createElement('script');
      sc.dataset.comp = name;
      sc.textContent = js;
      document.body.appendChild(sc);
    }

    requestAnimationFrame(() => reveal(container, animate));
    log && console.info('[component-loader] loaded:', name);
  }

  function reveal(container, animate) {
    container.classList.remove('cmp-pending');
    container.classList.add('component-mounted');
    if (animate) container.classList.add('component-ready');
  }

  async function loadBatch(list) {
    for (const item of list) {
      await loadComponent(item.name, item.container, item.options || {});
    }
  }

  window.componentLoader = { loadComponent, loadBatch };
})();
