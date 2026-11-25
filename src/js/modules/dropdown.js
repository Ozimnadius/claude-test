/**
 * Выпадающие списки (scss/components/_dropdown.scss).
 *
 * Разметка:
 *   <div data-dropdown [data-dropdown-hover]>
 *     <button aria-expanded="false" aria-controls="id" data-dropdown-toggle>…</button>
 *     <div id="id" hidden data-dropdown-panel>…</div>
 *   </div>
 *
 * Открывается кликом по кнопке; закрывается повторным кликом, кликом мимо, клавишей Esc
 * (фокус возвращается на кнопку) и уходом фокуса из списка. Одновременно открыт один список.
 * data-dropdown-hover — дополнительно открывать при наведении мышью (пункты верхнего меню).
 *
 * Выбор варианта (область поиска): кнопки [data-dropdown-option="значение"] в панели.
 * Выбранная получает aria-pressed="true", значение пишется в [data-dropdown-value] (подпись кнопки)
 * и в скрытое поле [data-dropdown-input].
 */

const HOVER_DELAY = 150;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

const parts = (root) => ({
  toggle: root.querySelector('[data-dropdown-toggle]'),
  panel: root.querySelector('[data-dropdown-panel]'),
});

function isOpen(root) {
  return parts(root).toggle?.getAttribute('aria-expanded') === 'true';
}

function close(root, { focus = false } = {}) {
  const { toggle, panel } = parts(root);
  if (!toggle || !isOpen(root)) return;

  toggle.setAttribute('aria-expanded', 'false');
  panel.hidden = true;
  if (focus) toggle.focus();
}

function closeAll(except) {
  document.querySelectorAll('[data-dropdown]').forEach((root) => {
    if (root !== except) close(root);
  });
}

function open(root) {
  const { toggle, panel } = parts(root);
  if (!toggle || isOpen(root)) return;

  closeAll(root);
  toggle.setAttribute('aria-expanded', 'true');
  panel.hidden = false;
}

function choose(root, option) {
  const value = option.dataset.dropdownOption;

  root.querySelectorAll('[data-dropdown-option]').forEach((item) => {
    item.setAttribute('aria-pressed', String(item === option));
  });
  root.querySelectorAll('[data-dropdown-value]').forEach((el) => {
    el.textContent = value;
  });
  root.querySelectorAll('[data-dropdown-input]').forEach((input) => {
    input.value = value;
  });

  close(root, { focus: true });
}

function bindHover(root) {
  let timer;

  root.addEventListener('mouseenter', () => {
    if (!canHover.matches) return;
    clearTimeout(timer);
    open(root);
  });

  root.addEventListener('mouseleave', () => {
    if (!canHover.matches) return;
    clearTimeout(timer);
    timer = setTimeout(() => close(root), HOVER_DELAY);
  });
}

export function initDropdowns() {
  document.addEventListener('click', (event) => {
    const root = event.target.closest('[data-dropdown]');

    // Клик мимо всех списков — закрыть открытые
    if (!root) {
      closeAll();
      return;
    }

    const option = event.target.closest('[data-dropdown-option]');
    if (option) {
      choose(root, option);
      return;
    }

    if (event.target.closest('[data-dropdown-toggle]')) {
      if (isOpen(root)) close(root);
      else open(root);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    // Открыт всегда не больше одного списка
    const root = document
      .querySelector('[data-dropdown-toggle][aria-expanded="true"]')
      ?.closest('[data-dropdown]');
    if (root) close(root, { focus: true });
  });

  // Фокус ушёл из списка клавишей Tab — закрыть
  document.addEventListener('focusout', (event) => {
    const root = event.target.closest('[data-dropdown]');
    if (root && event.relatedTarget && !root.contains(event.relatedTarget)) close(root);
  });

  document.querySelectorAll('[data-dropdown][data-dropdown-hover]').forEach(bindHover);
}
