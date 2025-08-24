// script.js بعد إزالة أكواد الهيدر والسايدبار (أصبحت تُدار من المكونات)

// شاشة التحميل
window.addEventListener("load", function () {
  setTimeout(function () {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.opacity = "0";
      loadingScreen.style.visibility = "hidden";
    }
  }, 1500);
});

// إنشاء النجوم المتساقطة + منطق الصفحة
document.addEventListener("DOMContentLoaded", function () {
  const starsContainer = document.getElementById("stars");
  const popSound = document.getElementById("popSound");
  const colors = ["pink", "blue", "purple"];

  // إضافة نجوم
  if (starsContainer && popSound) {
    for (let i = 0; i < 60; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.classList.add(colors[Math.floor(Math.random() * colors.length)]);
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * -100}%`;
      star.style.animationDuration = `${5 + Math.random() * 7}s`;
      starsContainer.appendChild(star);

      star.addEventListener("click", () => {
        popSound.currentTime = 0;
        popSound.play().catch(() => {});
        star.remove();
      });
    }
  }

  // التعامل مع التنقل بين (الرئيسية / تسجيل الدخول)
  const loginPage = document.getElementById("loginPage");
  const homePage = document.getElementById("homePage");
  const backToHome = document.getElementById("backToHome");
  const loginForm = document.getElementById("loginForm");
  const userName = document.querySelector(".user-name"); // سيتم تحديثه إذا كان موجودًا داخل الـ sidebar component لاحقًا

  if (loginPage && homePage && backToHome && loginForm) {
    backToHome.addEventListener("click", () => {
      loginPage.classList.add("hidden");
      homePage.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = loginForm.username.value;
      if (userName) {
        userName.textContent = username || "زائر";
      }
      alert(`مرحبًا ${username}! تم تسجيل الدخول بنجاح.`);
      loginForm.reset();
      loginPage.classList.add("hidden");
      homePage.classList.remove("hidden");
    });
  }

  // ملاحظة: أي منطق يتعلق بالهيدر أو القائمة الجانبية أصبح في ملفات المكونات (header.js / sidebar.js)
});
