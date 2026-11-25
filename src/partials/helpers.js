/**
 * Хелперы Handlebars. Каждый экспорт регистрируется под своим именем.
 */

/** Сравнение: {{#if (eq a b)}} */
export const eq = (a, b) => a === b;

/** Склейка строк: {{concat "icon-" name}} */
export const concat = (...args) => args.slice(0, -1).join('');

/**
 * Собирает класс блока с модификаторами из строки через пробел.
 * {{bem "btn" "primary size-sm"}} → "btn btn--primary btn--size-sm"
 */
export const bem = (block, modifiers) => {
  const mods = typeof modifiers === 'string' ? modifiers.split(/\s+/).filter(Boolean) : [];
  return [block, ...mods.map((m) => `${block}--${m}`)].join(' ');
};

/** Повтор блока N раз: {{#times 5}}…{{@index}}…{{/times}} */
export function times(n, options) {
  let out = '';
  for (let i = 0; i < n; i += 1) out += options.fn(this, { data: { index: i } });
  return out;
}
