/**
 * Табы (partials/components/tabs.hbs, фильтры образов).
 *
 * Разметка: общий контейнер [data-tabs], внутри — кнопки role="tab" с aria-controls и панели
 * role="tabpanel" с теми же id. Выбранная кнопка — aria-selected="true" и tabindex 0, остальные —
 * tabindex -1 (в порядок табуляции попадает только выбранная); невыбранные панели — hidden.
 *
 * Клавиатура (по образцу WAI-ARIA Authoring Practices): ← → — соседний таб, Home / End — первый
 * и последний; таб выбирается сразу при переходе (автоматическая активация).
 */

function select(tabs, tab, { focus = false } = {}) {
  tabs.forEach((item) => {
    const selected = item === tab;
    const panel = document.getElementById(item.getAttribute('aria-controls'));

    item.setAttribute('aria-selected', String(selected));
    if (selected) item.removeAttribute('tabindex');
    else item.setAttribute('tabindex', '-1');
    if (panel) panel.hidden = !selected;
  });

  if (focus) tab.focus();
}

function initGroup(root) {
  const tabs = [...root.querySelectorAll('[role="tab"][aria-controls]')];
  if (!tabs.length) return;

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tabs, tab));

    tab.addEventListener('keydown', (event) => {
      const targets = {
        ArrowRight: index + 1,
        ArrowLeft: index - 1,
        Home: 0,
        End: tabs.length - 1,
      };
      if (!(event.key in targets)) return;

      event.preventDefault();
      const next = (targets[event.key] + tabs.length) % tabs.length;
      select(tabs, tabs[next], { focus: true });
    });
  });
}

export function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach(initGroup);
}
