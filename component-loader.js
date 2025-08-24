// component-loader.js (محدّث لدعم الصفحات داخل /pages/...)
// يحدد المسار النسبي الصحيح لمجلد /components/ مهما كان عمق الصفحة.
window.componentLoader = (function () {
  const cache = new Map();

  function computeBaseComponentsPath() {
    // مثال: /PandaCine-Web/pages/anime/anime.html -> نحتاج ../../components/
    const pathParts = window.location.pathname
      .split("/")
      .filter(Boolean); // إزالة الفراغات
    // ابحث عن اسم الريبو ثم احسب الباقي
    // نفترض أن مجلد components في الجذر بجانب index.html
    // احسب كم مستوى بعد الجذر
    // إيجاد index.html ليس مضمون هنا، لذا نستنتج: كل ما بعد اسم المشروع يعتبر عمق
    // حل بسيط: عدّ المستويات بعد أول جزء (اسم المشروع) واطلع بمقدار ../
    if (pathParts.length <= 1) return "./components/"; // في الجذر
    const depth = pathParts.length - 1; // آخر جزء هو الملف أو مجلد الصفحة
    // إذا كان آخر جزء فيه نقطة (ملف) نحذف واحد
    const last = pathParts[pathParts.length - 1];
    const isFile = last.includes(".");
    const realDepth = isFile ? depth - 1 : depth;
    return "../".repeat(realDepth) + "components/";
  }

  const baseComponentsPath = computeBaseComponentsPath();

  async function loadComponent(componentName, containerId) {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Container ${containerId} غير موجود`);
        return;
      }

      if (cache.has(componentName)) {
        const cached = cache.get(componentName);
        container.innerHTML = cached.html;
        return;
      }

      // تحميل HTML
      const htmlRes = await fetch(`${baseComponentsPath}${componentName}/${componentName}.html`);
      if (!htmlRes.ok) throw new Error(`فشل تحميل HTML للمكون ${componentName}`);
      const html = await htmlRes.text();
      container.innerHTML = html;

      // تحميل CSS
      try {
        const cssRes = await fetch(`${baseComponentsPath}${componentName}/${componentName}.css`);
        if (cssRes.ok) {
          const css = await cssRes.text();
            if (!document.querySelector(`style[data-component="${componentName}"]`)) {
            const style = document.createElement("style");
            style.setAttribute("data-component", componentName);
            style.textContent = css;
            document.head.appendChild(style);
          }
        }
      } catch (e) {
        console.info(`لا يوجد CSS للمكون ${componentName}`);
      }

      // تحميل JS
      try {
        const jsRes = await fetch(`${baseComponentsPath}${componentName}/${componentName}.js`);
        if (jsRes.ok) {
          const js = await jsRes.text();
          if (!document.querySelector(`script[data-component="${componentName}"]`)) {
            const script = document.createElement("script");
            script.setAttribute("data-component", componentName);
            script.textContent = js;
            document.body.appendChild(script);
          }
        }
      } catch (e) {
        console.info(`لا يوجد JS للمكون ${componentName}`);
      }

      cache.set(componentName, { html });
    } catch (err) {
      console.error(`خطأ في تحميل المكون "${componentName}":`, err);
    }
  }

  return { loadComponent };
})();
