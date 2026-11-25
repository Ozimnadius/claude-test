// Точка входа скриптов сайта.
// Стили, включая шрифт Geologica (см. scss/base/_fonts.scss).
import '../scss/main.scss';

import { initTheme } from './modules/theme.js';
import { initDropdowns } from './modules/dropdown.js';
import { initHeader } from './modules/header.js';
import { initTabs } from './modules/tabs.js';
import { initSliders } from './modules/slider.js';
import { initCountdowns } from './modules/countdown.js';
import { initVideo } from './modules/video.js';

/**
 * Модули поведения подключаются по наличию data-атрибутов на странице,
 * поэтому main.js безопасно подключать и на страницах без этих блоков (UI-кит).
 */
function init() {
  if (document.querySelector('[data-theme-switch]')) initTheme();
  if (document.querySelector('[data-dropdown]')) initDropdowns();
  if (document.querySelector('[data-mobile-menu], [data-search-panel]')) initHeader();
  if (document.querySelector('[data-tabs]')) initTabs();
  if (document.querySelector('[data-slider]')) initSliders();
  if (document.querySelector('[data-countdown]')) initCountdowns();
  if (document.querySelector('[data-video-modal]')) initVideo();
}

init();
