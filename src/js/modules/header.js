/**
 * Шапка на узких экранах (≤ 1000 px): мобильное меню и панель поиска.
 *
 * Мобильное меню — <dialog data-mobile-menu> (partials/sections/mobile-menu.hbs), открывается кнопкой
 * [data-menu-toggle]. Модальный <dialog> сам удерживает фокус внутри, закрывается по Esc и возвращает
 * фокус на кнопку. Дополнительно: закрытие кнопкой [data-mobile-menu-close], кликом по затемнению
 * и при расширении окна шире 1000 px (меню там не нужно).
 *
 * Панель поиска [data-search-panel] открывается кнопкой-лупой [data-search-toggle]: фокус сразу в поле,
 * Esc закрывает и возвращает фокус на лупу.
 */

// Совпадает с брейкпоинтом md в scss/abstracts/_breakpoints.scss
const desktop = window.matchMedia('(width > 1000px)');

function initMobileMenu() {
  const menu = document.querySelector('[data-mobile-menu]');
  const toggles = document.querySelectorAll('[data-menu-toggle]');
  if (!menu || !toggles.length) return;

  const setExpanded = (value) =>
    toggles.forEach((btn) => btn.setAttribute('aria-expanded', String(value)));

  toggles.forEach((btn) =>
    btn.addEventListener('click', () => {
      menu.showModal();
      setExpanded(true);
    }),
  );

  menu.addEventListener('close', () => setExpanded(false));

  menu.addEventListener('click', (event) => {
    // Клик по затемнению приходит на сам <dialog>, но за пределами его прямоугольника
    const rect = menu.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if ((event.target === menu && outside) || event.target.closest('[data-mobile-menu-close]'))
      menu.close();
  });

  desktop.addEventListener('change', (event) => {
    if (event.matches && menu.open) menu.close();
  });
}

function initSearchPanel() {
  const toggle = document.querySelector('[data-search-toggle]');
  const panel = document.querySelector('[data-search-panel]');
  if (!toggle || !panel) return;

  const setOpen = (value, { focus = false } = {}) => {
    panel.hidden = !value;
    toggle.setAttribute('aria-expanded', String(value));
    if (value) panel.querySelector('input[type="search"]')?.focus();
    else if (focus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));

  panel.addEventListener('keydown', (event) => {
    // Esc внутри открытого списка областей закрывает сначала список (dropdown.js)
    if (event.key === 'Escape' && !panel.querySelector('[aria-expanded="true"]'))
      setOpen(false, { focus: true });
  });

  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

export function initHeader() {
  initMobileMenu();
  initSearchPanel();
}
