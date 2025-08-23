// تطبيق الثيم المحفوظ عند تحميل الصفحة
function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  const themeSwitch = document.getElementById("themeSwitch");
  if (savedTheme === "purple") {
    document.documentElement.classList.add("theme-purple");
    if (themeSwitch) {
      themeSwitch.classList.add("active");
    }
  } else {
    document.documentElement.classList.remove("theme-purple");
    if (themeSwitch) {
      themeSwitch.classList.remove("active");
    }
  }
}

// تبديل الثيم وحفظه
function toggleTheme() {
  const themeSwitch = document.getElementById("themeSwitch");
  document.documentElement.classList.toggle("theme-purple");
  if (themeSwitch) {
    themeSwitch.classList.toggle("active");
  }
  const currentTheme = document.documentElement.classList.contains("theme-purple")
    ? "purple"
    : "blue";
  localStorage.setItem("theme", currentTheme);
}

// تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  applySavedTheme();

  // إضافة مستمع لزر تغيير الثيم
  const themeSwitch = document.getElementById("themeSwitch");
  if (themeSwitch) {
    themeSwitch.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleTheme();
      const settingsMenu = document.getElementById("settingsMenu");
      if (settingsMenu) {
        settingsMenu.classList.remove("active");
      }
    });
  }
});