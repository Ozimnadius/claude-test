# Маркет — вёрстка главной страницы

Вёрстка главной страницы интернет-магазина по макету Figma «Web-Comp-3 (Copy)».
Сначала собираем UI-кит (дизайн-систему), затем из его блоков — главную.

## Стек

| Что         | Чем                                                                          |
| ----------- | ---------------------------------------------------------------------------- |
| Разметка    | HTML, разбитый на партиалы (шаблонизатор — см. [решения](docs/decisions.md)) |
| Стили       | SCSS (модульный синтаксис `@use`), методология BEM                           |
| Скрипты     | Современный JS (ES-модули), по модулю на компонент                           |
| Сборка      | Vite (многостраничная сборка: `index.html` + `ui-kit.html`)                  |
| Изображения | WebP (оригиналы хранятся отдельно, конвертация скриптом)                     |
| Шрифт       | Geologica, локально из пакета `@fontsource-variable/geologica`               |

## Документация

| Файл                                           | О чём                                                     |
| ---------------------------------------------- | --------------------------------------------------------- |
| [docs/PLAN.md](docs/PLAN.md)                   | План работ по этапам и статус                             |
| [docs/figma.md](docs/figma.md)                 | Макет: ссылки на фреймы, состав страниц, брейкпоинты      |
| [docs/design-tokens.md](docs/design-tokens.md) | Цвета, типографика, отступы, скругления, темы             |
| [docs/components.md](docs/components.md)       | Перечень компонентов UI-кита и секций главной             |
| [docs/conventions.md](docs/conventions.md)     | Соглашения: структура папок, BEM, SCSS, JS, картинки, git |
| [docs/decisions.md](docs/decisions.md)         | Журнал решений и открытые вопросы                         |

## Команды

| Команда            | Что делает                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `npm install`      | Установить зависимости                                                                     |
| `npm run dev`      | Сервер разработки: http://localhost:5173 (главная) и `/ui-kit.html`                        |
| `npm run build`    | Сборка в `dist/`                                                                           |
| `npm run preview`  | Просмотр собранной версии                                                                  |
| `npm run images`   | Конвертировать картинки из `src/images-src/` в WebP (`-- --force` — все)                   |
| `npm run lint`     | Проверить стили (Stylelint) и форматирование (Prettier)                                    |
| `npm run validate` | Проверить собранный HTML (`dist/*.html`) валидатором html-validate — после `npm run build` |
| `npm run format`   | Исправить форматирование автоматически                                                     |

## Как устроено

- **Страницы** — `index.html` и `ui-kit.html` в корне. В них вставляются партиалы Handlebars: `{{> components/icon name="chevron-right"}}`.
- **Партиалы** — `src/partials/`, имя = путь без расширения (`components/icon.hbs` → `components/icon`). Хелперы — `src/partials/helpers.js` (`eq`, `concat`, `bem`, `times`).
- **Демо-данные** — JSON в `src/data/`, доступны в шаблонах как `data.<имя файла>` (`data.site.name`). Правка JSON перезагружает страницу.
- **Иконки** — SVG в `src/assets/icons/` собираются в спрайт. Цвет — через `currentColor`.
- **Картинки** — оригиналы в `src/images-src/`, `npm run images` делает WebP в `src/assets/images/` (`имя.webp` + `имя@2x.webp`; суффикс `@1x` у оригинала — один файл). В разметке: `{{> components/img name="…" alt="…" width="…" height="…"}}` — `srcset` с версией 2x добавляется сам, если файл `@2x` есть.
- **Стили** — точка входа `src/scss/main.scss`; в любом файле `@use 'abstracts' as *;` даёт `rem()`, `bp()`, миксины `media-up/down`, `hover`, `visually-hidden`, `text()`.
- **Токены и темы** — CSS-переменные в `src/scss/base/_tokens.scss`, темы в `_themes.scss`: атрибуты `data-brand="red"` и `data-theme="dark"` на `<html>`. Компоненты берут только смысловые цвета `--color-*` (подробно — [design-tokens.md](docs/design-tokens.md)).
- **Раскладка** — `.container` (контент 1696 + поля) и `.section` (вертикальный ритм, `--alt` — серый фон).
- **Скрипты** — точка входа `src/js/main.js`, модули поведения — `src/js/modules/`.

## Окружение

- Node.js 24, npm 11, git 2.54 (проверено 2026-11-25).
- Папка проекта: `C:\OSPanel\home\claude-test`.
