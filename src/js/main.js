// Точка входа скриптов сайта.
// Стили, включая шрифт Geologica (см. scss/base/_fonts.scss).
import '../scss/main.scss';

import { initTheme } from './modules/theme.js';
import { initDropdowns } from './modules/dropdown.js';
import { initHeader } from './modules/header.js';

/**
 * Модули поведения подключаются по наличию data-атрибутов на странице,
 * поэтому main.js безопасно подключать и на страницах без этих блоков (UI-кит).
 */
function init() {
  if (document.querySelector('[data-theme-switch]')) initTheme();
  if (document.querySelector('[data-dropdown]')) initDropdowns();
  if (document.querySelector('[data-mobile-menu], [data-search-panel]')) initHeader();
}

init();
