/**
 * Stylelint: стандарт для SCSS + порядок свойств (recess) + шаблон имён BEM.
 * @type {import('stylelint').Config}
 */
export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  rules: {
    // BEM: block, block__element, block--modifier, block__element--modifier;
    // служебные состояния is-*, has-*
    'selector-class-pattern': [
      '^(?:(?:is|has)-[a-z0-9-]+|[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)$',
      { message: 'Класс должен соответствовать BEM: block__element--modifier (или is-*/has-*)' },
    ],
    // Разрешаем подключать partial-файлы без подчёркивания и расширения
    'scss/load-no-partial-leading-underscore': true,
    // Кавычки у font-family оставляем как в макете
    'font-family-name-quotes': null,
    // Вложенность BEM через & — не глубже 3 уровней
    'max-nesting-depth': [3, { ignore: ['pseudo-classes'], ignoreAtRules: ['include', 'media'] }],
  },
};
