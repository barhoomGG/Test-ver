// component-loader.js (إصدار مُحسن يعتمد على عدّ المجلدات فقط)
// يدعم أي عمق: /index.html  => components/
//          /pages/anime/anime.html => ../../components/
//          /pages/x/y/z/page.html  => ../../../components/

window.componentLoader = (function () {
  const cache = new Map();

  function computeBaseComponentsPath() {
    // استخراج الأجزاء (المجلدات/الملفات) بدون فراغات
    const segments = window.location.pathname.split("/").filter(Boolean);
    // إزالة اسم الملف إن وُجد (يحتوي على نقطة)
    if (segments.length && segments[segments.length - 1].includes(".")) {
      segments.pop();
    }
    // الآن segments تمثل المجلدات من الجذر حتى مجلد الصفحة
    // عدد الصعود = عدد المجلدات (لأن components في الجذر)
    if (segments.length === 0) return "./components/";
    return "../".repeat(segments.length) + "components/";
  }

  const basePath = computeBaseComponentsPath();

  async function loadComponent(name, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[component-loader] لم يتم العثور على الحاوية ${containerId}`);
      return;
    }

    // من الكاش
    if (cache.has(name)) {
      container.innerHTML = cache.get(name).html;
      return;
    }

    const htmlURL = `${basePath}${name}/${name}.html`;
    const cssURL  = `${basePath}${name}/${name}.css`;
    const jsURL   = `${basePath}${name}/${name}.js`;

    try {
      // HTML
      const htmlRes = await fetch(htmlURL);
      if (!htmlRes.ok) throw new Error(`فشل تحميل ${htmlURL}`);
      const html = await htmlRes.text();
      container.innerHTML = html;

      // CSS (اختياري)
      try {
        const cssRes = await fetch(cssURL);
        if (cssRes.ok) {
          const css = await cssRes.text();
          if (!document.querySelector(`style[data-component="${name}"]`)) {
            const style = document.createElement("style");
            style.setAttribute("data-component", name);
            style.textContent = css;
            document.head.appendChild(style);
          }
        }
      } catch (e) {
        console.info(`[component-loader] لا يوجد CSS للمكون ${name}`);
      }

      // JS (اختياري)
      try {
        const jsRes = await fetch(jsURL);
        if (jsRes.ok) {
          const js = await jsRes.text();
          if (!document.querySelector(`script[data-component="${name}"]`)) {
            const script = document.createElement("script");
            script.setAttribute("data-component", name);
            script.textContent = js;
            document.body.appendChild(script);
          }
        }
      } catch (e) {
        console.info(`[component-loader] لا يوجد JS للمكون ${name}`);
      }

      cache.set(name, { html });
    } catch (err) {
      console.error(`[component-loader] خطأ في تحميل المكون "${name}":`, err);
    }
  }

  return { loadComponent };
})();
