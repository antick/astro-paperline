const THEME_STORAGE_KEY = 'theme';
const THEME_LABELS = { light: 'Switch to dark theme', dark: 'Switch to light theme' };
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let savedTheme;
try {
  savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
} catch {
  // Storage can be unavailable; switching themes should still work in this tab.
}
let explicitTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
let themeValue = explicitTheme ?? (systemTheme.matches ? 'dark' : 'light');

function reflectPreference() {
  const root = document.documentElement;
  root.setAttribute('data-theme', themeValue);
  root.classList.toggle('dark', themeValue === 'dark');
  root.classList.toggle('light', themeValue === 'light');
  root.style.colorScheme = themeValue;
  document.querySelector('#theme-btn')?.setAttribute('aria-label', THEME_LABELS[themeValue]);
  if (document.body) {
    document
      .querySelector("meta[name='theme-color']")
      ?.setAttribute('content', getComputedStyle(document.body).backgroundColor);
  }
}

reflectPreference();
document.addEventListener('DOMContentLoaded', () => {
  reflectPreference();
  document.querySelector('#theme-btn')?.addEventListener('click', () => {
    themeValue = themeValue === 'light' ? 'dark' : 'light';
    explicitTheme = themeValue;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeValue);
    } catch {
      // Retain the explicit choice in memory when persistence is unavailable.
    }
    reflectPreference();
  });
});
systemTheme.addEventListener('change', ({ matches }) => {
  if (explicitTheme) return;
  themeValue = matches ? 'dark' : 'light';
  reflectPreference();
});
