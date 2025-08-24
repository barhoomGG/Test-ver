// component-loader.js (إزالة الوميض + تحميل منسق للمكوّنات)
// يدعم عمق المجلدات، ويحجز المساحة ويظهر المكونات فقط بعد اكتمال تحميلها.

window.componentLoader = (function () {
  const cache = new Map();

  function computeBaseComponentsPath() {
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments.length && segments[segments.length - 1].includes(".")) {
      segments.pop();
    }
    if (segments.length === 0) return "./components/";
    return "../".repeat(segments.length) + "components/";
  }
  const basePath = computeBaseComponentsPath();
  console.info("[component-loader] base path =", basePath);

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    return res.text();
  }

  async function loadComponent(name, containerId, options = {}) {
    const { animate = true, log = true } = options;
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[component-loader] لم يتم العثور على الحاوية: ${containerId}`);
      return;
    }

    // إذا محمّل من قبل (وتم تخزين HTML)
    if (cache.has(name)) {
      const cached = cache.get(name);
      container.innerHTML = cached.html;
      revealContainer(container, animate);
      if (log) console.info(`[component-loader] (cache) component: ${name}`);
      return;
    }

    // إضافة حالة انتظار (لو ما أضفتها أنت في HTML)
    container.classList.add("cmp-pending");
    container.setAttribute("aria-busy", "true");

    const base = `${basePath}${name}/${name}`;
    const htmlURL = `${base}.html`;
    const cssURL = `${base}.css`;
    const jsURL = `${base}.js`;

    try {
      // اجلب CSS أولاً (إن وُجد) لتقليل الوميض
      let cssText = "";
      try {
        cssText = await fetchText(cssURL);
        if (!document.querySelector(`style[data-component="${name}"]`)) {
          const style = document.createElement("style");
            style.dataset.component = name;
          style.textContent = cssText;
          document.head.appendChild(style);
        }
      } catch {
        /* CSS اختياري */
      }

      // اجلب HTML
      const htmlText = await fetchText(htmlURL);
      container.innerHTML = htmlText;

      // اجلب JS (اختياري)
      try {
        const jsText = await fetchText(jsURL);
        if (!document.querySelector(`script[data-component="${name}"]`)) {
          const script = document.createElement("script");
          script.dataset.component = name;
          script.textContent = jsText;
          document.body.appendChild(script);
        }
      } catch {
        /* لا مشكلة */
      }

      cache.set(name, { html: htmlText });
      // نؤخر الإظهار frame واحد لضمان تطبيق CSS
      requestAnimationFrame(() => {
        revealContainer(container, animate);
        if (log) console.info(`[component-loader] component loaded: ${name}`);
      });
    } catch (err) {
      console.error(`[component-loader] فشل تحميل المكون "${name}":`, err);
      // نظهر الحاوية حتى لو فشل كي لا تبقى مساحة فارغة
      revealContainer(container, false);
    }
  }

  function revealContainer(container, animate) {
    container.classList.remove("cmp-pending");
    container.removeAttribute("aria-busy");
    container.classList.add("component-mounted");
    if (animate) {
      container.classList.add("component-ready");
    } else {
      container.style.visibility = "visible";
      container.style.opacity = "1";
      container.style.transform = "none";
    }
  }

  // تحميل مجموعة دفعة واحدة (اختياري)
  async function loadBatch(configs) {
    return Promise.all(
      configs.map(c =>
        loadComponent(c.name, c.container, c.options || {})
      )
    );
  }

  return {
    loadComponent,
    loadBatch
  };
})();
