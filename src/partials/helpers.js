/**
 * Хелперы Handlebars. Каждый экспорт регистрируется под своим именем.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const IMAGES = fileURLToPath(new URL('../assets/images/', import.meta.url));

/**
 * Есть ли у картинки двойная версия имя@2x.webp (её создаёт npm run images из исходника 2x).
 * Партиал components/img сам добавляет srcset, если файл есть: {{#if (has2x name)}}.
 */
export const has2x = (name) => typeof name === 'string' && existsSync(`${IMAGES}${name}@2x.webp`);

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

/** Первое непустое значение: {{or active 0}}. Последний аргумент — служебный объект Handlebars. */
export const or = (...args) =>
  args.slice(0, -1).find((v) => v !== undefined && v !== null && v !== '') ?? args.at(-2);

/**
 * Сдвиг массива по кругу на n × step элементов — демо-наборы для табов (каждый таб показывает
 * те же карточки в другом порядке): {{#each (rotate data.home.products @index)}}.
 * Последний аргумент — служебный объект Handlebars; step по умолчанию 3.
 */
export const rotate = (arr, n, ...rest) => {
  if (!Array.isArray(arr) || !arr.length) return arr;
  const step = typeof rest[0] === 'number' ? rest[0] : 3;
  const k = ((((Number(n) || 0) * step) % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
};
