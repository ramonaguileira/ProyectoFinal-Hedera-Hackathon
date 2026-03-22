/* Eggologic — Dark/Light Theme Toggle */
(function () {
  var html = document.documentElement;
  var key = 'eggologic-theme';

  // Apply saved theme or system preference (before paint)
  var saved = localStorage.getItem(key);
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.remove('light');
    html.classList.add('dark');
  }

  // Toggle function — called by the nav button
  window.toggleTheme = function () {
    var isDark = html.classList.contains('dark');
    html.classList.remove(isDark ? 'dark' : 'light');
    html.classList.add(isDark ? 'light' : 'dark');
    localStorage.setItem(key, isDark ? 'light' : 'dark');
    updateToggleIcons();
  };

  // Swap icon text in all toggle buttons on the page
  function updateToggleIcons() {
    var isDark = html.classList.contains('dark');
    document.querySelectorAll('.theme-toggle-icon').forEach(function (el) {
      el.textContent = isDark ? 'light_mode' : 'dark_mode';
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateToggleIcons);
  } else {
    updateToggleIcons();
  }
})();
