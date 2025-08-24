// component-loader.js (إصدار مُحسَّن + سجلات + حماية)
// يدعم أي عمق مجلدات ويضيف لوج لتسهيل التشخيص.
window.componentLoader = (function () {
  const cache = new Map();

  function computeBaseComponentsPath() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length && segments[segments.length - 1].includes('.')) {
      segments.pop();
    }
    if (segments.length === 0) return "./components/";
    return "../".repeat(segments.length) + "components/";
  }
  const basePath = computeBaseComponentsPath();
  console.info('[component-loader] base components path =', basePath);

  async function fetchText(url, label) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      console.info(`[component-loader] OK: ${label}`, url);
      return await res.text();
    } catch (e) {
      console.warn(`[component-loader] فشل تحميل ${label}:`, url, e.message);
      return null;
    }
  }

  async function loadComponent(name, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[component-loader] لم يتم العثور على الحاوية ${containerId}`);
      return;
    }
    if (cache.has(name)) {
      container.innerHTML = cache.get(name).html;
      console.info(`[component-loader] من الكاش: ${name}`);
      return;
    }

    const base = `${basePath}${name}/${name}`;
    const [html, css, js] = await Promise.all([
      fetchText(base + '.html', 'HTML'),
      fetchText(base + '.css', 'CSS'),
      fetchText(base + '.js', 'JS')
    ]);

    if (html) {
      container.innerHTML = html;
      cache.set(name, { html });
    } else {
      console.error(`[component-loader] المكون ${name} لم يتم تحميل HTML له، لن يُحقن.`);
      return;
    }

    if (css) {
      if (!document.querySelector(`style[data-component="${name}"]`)) {
        const style = document.createElement('style');
        style.dataset.component = name;
        style.textContent = css;
        document.head.appendChild(style);
      }
    }

    if (js) {
      if (!document.querySelector(`script[data-component="${name}"]`)) {
        const script = document.createElement('script');
        script.dataset.component = name;
        script.textContent = js;
        document.body.appendChild(script);
      }
    }

    console.info(`[component-loader] تم تحميل وحقن المكون: ${name}`);
  }

  return { loadComponent };
})();
