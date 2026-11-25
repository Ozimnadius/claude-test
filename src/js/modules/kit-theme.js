/**
 * Витрина UI-кита: переключатели бренда и темы + подписи реальных значений цветов.
 *
 * Переключатели — радиокнопки name="brand" / name="theme" внутри [data-kit-theme].
 * Выбор ставится атрибутами data-brand / data-theme на <html> (см. scss/base/_themes.scss).
 * Подписи — элементы [data-kit-color="--имя-переменной"]: в них пишется HEX цвета,
 * вычисленный браузером для текущей темы.
 */

const DEFAULTS = { brand: 'blue', theme: 'light' };

/** Перевести вычисленный цвет браузера (rgb(…) или color(srgb …)) в HEX. */
function toHex(cssColor) {
  const srgb = cssColor.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/);
  const rgb = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  let channels;

  if (srgb) channels = srgb.slice(1, 4).map((v) => Math.round(Number(v) * 255));
  else if (rgb) channels = rgb.slice(1, 4).map(Number);
  else return cssColor;

  return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Обновить подписи значений цветов. */
function renderColorValues(root) {
  const probe = document.createElement('span');
  probe.hidden = true;
  document.body.append(probe);

  root.querySelectorAll('[data-kit-color]').forEach((el) => {
    probe.style.color = `var(${el.dataset.kitColor})`;
    el.textContent = toHex(getComputedStyle(probe).color);
  });

  probe.remove();
}

function applyTheme(name, value) {
  const html = document.documentElement;

  // Значение по умолчанию не пишем в атрибут — так видно, что работают базовые переменные.
  if (value === DEFAULTS[name]) delete html.dataset[name];
  else html.dataset[name] = value;
}

export function initKitTheme(root = document) {
  const switches = root.querySelector('[data-kit-theme]');

  switches?.addEventListener('change', (event) => {
    const { name, value } = event.target;
    if (!(name in DEFAULTS)) return;

    applyTheme(name, value);
    renderColorValues(root);
  });

  renderColorValues(root);
}
