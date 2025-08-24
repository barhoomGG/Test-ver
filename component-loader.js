// component-loader.js (إصدار مستقر مع منع الوميض + كاش بسيط + لوج)
// يعتمد على تطابق اسم المكون مع أسماء الملفات داخل مجلد المكون.
window.componentLoader = (function () {
  const cache = new Map();
  const VERSION = '2025.08.24';

  function computeBasePath() {
    const seg = location.pathname.split('/').filter(Boolean);
    if (seg.at(-1)?.includes('.')) seg.pop();
    if (seg.length === 0) return './components/';
    return '../'.repeat(seg.length) + 'components/';
  }
  const BASE = computeBasePath();
  console.info('[component-loader] base =', BASE);

  async function fetchText(url) {
    const res = await fetch(url + '?v=' + VERSION, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    return res.text();
  }

  async function loadComponent(name, containerId, options = {}) {
    const { animate = true, log = false } = options;
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('[component-loader] لا توجد حاوية:', containerId);
      return;
    }

    if (cache.has(name)) {
      container.innerHTML = cache.get(name).html;
      reveal(container, animate);
      log && console.info('[component-loader] (cache) loaded', name);
      return;
    }

    container.classList.add('cmp-pending');
    container.setAttribute('aria-busy', 'true');

    const base = `${BASE}${name}/${name}`;
    let htmlText = null;
    let cssText = null;
    let jsText = null;

    // نحاول CSS أولاً لتقليل الوميض
    try { cssText = await fetchText(base + '.css'); } catch {}
    if (cssText && !document.querySelector(`style[data-component="${name}"]`)) {
      const style = document.createElement('style');
      style.dataset.component = name;
      style.textContent = cssText;
      document.head.appendChild(style);
    }

    try {
      htmlText = await fetchText(base + '.html');
      container.innerHTML = htmlText;
      cache.set(name, { html: htmlText });
    } catch (e) {
      console.error('[component-loader] فشل HTML للمكون:', name, e.message);
      container.innerHTML = `<div style="padding:8px;color:#f55;font:12px monospace">فشل تحميل ${name}.html</div>`;
      reveal(container, false);
      return;
    }

    // JS اختياري
    try {
      jsText = await fetchText(base + '.js');
      if (jsText && !document.querySelector(`script[data-component="${name}"]`)) {
        const s = document.createElement('script');
        s.dataset.component = name;
        s.textContent = jsText;
        document.body.appendChild(s);
      }
    } catch {}

    requestAnimationFrame(() => reveal(container, animate));
    log && console.info('[component-loader] loaded', name);
  }

  function reveal(container, animate) {
    container.classList.remove('cmp-pending');
    container.removeAttribute('aria-busy');
    container.classList.add('component-mounted');
    if (animate) {
      container.classList.add('component-ready');
    } else {
      container.style.opacity = '1';
      container.style.visibility = 'visible';
    }
  }

  return { loadComponent };
})();
