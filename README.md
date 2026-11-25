# Маркет — вёрстка главной страницы

Вёрстка главной страницы интернет-магазина по макету Figma «Web-Comp-3 (Copy)».
Сначала собран UI-кит (дизайн-система, `ui-kit.html`), затем из его блоков — главная (`index.html`):
десктоп 1920, адаптив до 320 px, поведение на JS, светлая и тёмная темы.

## Где посмотреть

- Сайт: https://claude-test-seven-iota.vercel.app (UI-кит — `/ui-kit.html`). Vercel пересобирает его при каждой отправке в ветку `main`.
- Репозиторий: https://github.com/Ozimnadius/claude-test

## Стек

| Что         | Чем                                                                              |
| ----------- | -------------------------------------------------------------------------------- |
| Разметка    | HTML с партиалами Handlebars (`vite-plugin-handlebars`)                          |
| Стили       | SCSS (модульный синтаксис `@use`), методология BEM                               |
| Скрипты     | Современный JS (ES-модули), по модулю на поведение; слайдеры — Swiper            |
| Сборка      | Vite (многостраничная сборка: `index.html` + `ui-kit.html`)                      |
| Изображения | WebP: оригиналы в `src/images-src/`, конвертация и адаптивные ширины — скриптом  |
| Шрифт       | Geologica, локально                                                              |
| Проверки    | Stylelint, Prettier, html-validate; Lighthouse — разово (результаты — в PLAN.md) |

## Документация

| Файл                                           | О чём                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| [docs/PLAN.md](docs/PLAN.md)                   | План работ по этапам и статус                                                  |
| [docs/figma.md](docs/figma.md)                 | Макет: ссылки на фреймы, состав страниц, брейкпоинты                           |
| [docs/design-tokens.md](docs/design-tokens.md) | Цвета, типографика, отступы, скругления, темы                                  |
| [docs/components.md](docs/components.md)       | Перечень компонентов UI-кита и секций главной                                  |
| [docs/conventions.md](docs/conventions.md)     | Соглашения: структура папок, BEM, SCSS, JS, картинки, git                      |
| [docs/decisions.md](docs/decisions.md)         | Журнал решений и открытые вопросы                                              |
| [docs/report.md](docs/report.md)               | Итоговый отчёт: сравнение с вариантом Codex (Astra 6.2), время, замеры, оценки |

## Как запустить

```powershell
npm install
npm run dev
```

Откроется сервер разработки: главная — http://localhost:5173, UI-кит — http://localhost:5173/ui-kit.html.
Готовая сборка — `npm run build` (в папку `dist/`), посмотреть её — `npm run preview`.

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

Перед коммитом: `npm run lint`, `npm run build`, `npm run validate` — все три без ошибок.

## Как устроено

- **Страницы** — `index.html` и `ui-kit.html` в корне. В них вставляются партиалы Handlebars: `{{> sections/header}}`.
- **Партиалы** — `src/partials/`: `components/` (блоки дизайн-системы), `sections/` (секции главной), `layout/` (`<head>`). Имя партиала = путь без расширения. Партиал видит параметры родителя, поэтому параметры вложенных партиалов передаются явно (`size=""`, `class=""`).
- **Хелперы** — `src/partials/helpers.js`: `eq`, `concat`, `bem`, `times`, `or`, `iif`, `rotate` (демо-наборы для табов), `srcset` (адаптивные картинки).
- **Демо-данные** — JSON в `src/data/`, доступны в шаблонах как `data.<имя файла>` (`data.home.products`). Правка JSON перезагружает страницу. На CMS их заменят данные бэкенда.
- **Иконки** — SVG в `src/assets/icons/` собираются в спрайт: `{{> components/icon name="cart" size="24" label="" class=""}}`. Цвет — через `currentColor`.
- **Стили** — точка входа `src/scss/main.scss`; в любом файле `@use 'abstracts' as *;` даёт `rem()`, миксины `media-up/down(xs|sm|md|lg|xl)`, `hover`, `visually-hidden`, `text(<стиль>)`.
- **Токены и темы** — CSS-переменные в `src/scss/base/_tokens.scss`, темы в `_themes.scss`: атрибуты `data-brand="red"` и `data-theme="dark"` на `<html>`. Компоненты берут только смысловые цвета `--color-*` (подробно — [design-tokens.md](docs/design-tokens.md)).
- **Раскладка** — `.container` (контент 1696 + поля), `.section` (вертикальный ритм), `.card-grid` (сетки карточек с модификаторами колонок по ширинам), `.slider` (лента-слайдер на своей ширине).
- **Скрипты** — точка входа `src/js/main.js`; модули в `src/js/modules/` подключаются, только если на странице есть их `data-*` атрибуты: `theme`, `dropdown`, `header`, `tabs`, `slider`, `countdown`, `video`.

## Как добавить компонент

1. Разметка — `src/partials/components/<имя>.hbs`, в начале комментарий: что это, параметры, пример вызова. Классы по BEM (`.имя`, `.имя__элемент`, `.имя--модификатор`).
2. Стили — `src/scss/components/_<имя>.scss` с `@use 'abstracts' as *;`, подключить строкой `@use 'components/<имя>';` в `src/scss/main.scss`. Цвета — только `var(--color-*)`, размеры — `rem()`, адаптив — `media-down(...)`.
3. Показать в UI-ките (`ui-kit.html`) и добавить строку в [docs/components.md](docs/components.md).
4. Если нужно поведение — модуль `src/js/modules/<имя>.js` с функцией `init…()`, хук — атрибут `data-…`, подключение в `main.js` по наличию этого атрибута.
5. Проверить: `npm run lint`, `npm run build`, `npm run validate`.

## Как добавить секцию на главную

1. Партиал `src/partials/sections/<имя>.hbs`: `<section class="section" aria-labelledby="…">`, внутри `.container`, заголовок — `{{> components/section-head …}}`, карточки — в `.card-grid` с модификаторами колонок.
2. Лента на узких экранах — обернуть сетку в `<div class="slider slider--lane" data-slider="xs|sm|md">`, ширину карточки задать `style="--scroll-item: 280px"`.
3. Данные — в `src/data/home.json`, вставка — `{{> sections/<имя>}}` в `index.html`.

## Как добавить картинку

1. Оригинал из Figma — в `src/images-src/` в двойном размере (`имя.png`) или как есть с суффиксом `@1x` (`имя@1x.png`, если крупнее нет).
2. `npm run images` — создаст `имя.webp` (и `имя@2x.webp`), промежуточные ширины `имя-<ширина>w.webp` и обновит манифест `src/assets/images/manifest.json`.
3. В разметке: `{{> components/img name="имя" alt="…" width="…" height="…" sizes="(max-width: 575px) 280px, 25vw" class="…"}}`. `width` / `height` — рамка из макета; `sizes` — фактическая ширина на экране (для `object-fit: cover` — с учётом растяжения по высоте); `srcset` соберётся сам.

## Окружение

- Node.js 24, npm 11, git 2.54 (проверено 2026-11-25).
- Папка проекта: `C:\OSPanel\home\claude-test`.
