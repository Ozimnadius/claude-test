/**
 * Переключатель светлой и тёмной темы (partials/components/theme-switch.hbs).
 *
 * Кнопки [data-theme-value] внутри [data-theme-switch]; переключателей на странице может быть
 * несколько (шапка и мобильное меню) — состояние у всех общее.
 * Тема ставится атрибутом data-theme на <html> (scss/base/_themes.scss), светлая — без атрибута.
 * Выбор запоминается в localStorage; при загрузке его заранее применяет скрипт в <head>
 * (partials/layout/head.hbs, параметр themeScript), чтобы страница не «мигала» светлой темой.
 */

export const THEME_KEY = 'theme';
const DEFAULT_THEME = 'light';

function currentTheme() {
  return document.documentElement.dataset.theme || DEFAULT_THEME;
}

function render(theme) {
  document.querySelectorAll('[data-theme-switch] [data-theme-value]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.themeValue === theme));
  });
}

function applyTheme(theme) {
  const html = document.documentElement;

  if (theme === DEFAULT_THEME) delete html.dataset.theme;
  else html.dataset.theme = theme;

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Хранилище недоступно (приватный режим, запрет cookie) — тема просто не запомнится
  }

  render(theme);
}

export function initTheme() {
  render(currentTheme());

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-theme-switch] [data-theme-value]');
    if (btn) applyTheme(btn.dataset.themeValue);
  });
}
