import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import svgSpritemap from '@spiriit/vite-plugin-svg-spritemap';

import * as helpers from './src/partials/helpers.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const r = (...p) => resolve(root, ...p);

/**
 * Читает все JSON из src/data в объект { имяФайла: содержимое }.
 * Вызывается при каждой отрисовке страницы, поэтому правки данных
 * видны после перезагрузки без перезапуска сервера.
 */
function loadData() {
  const dir = r('src/data');
  const data = {};
  for (const file of readdirSync(dir)) {
    if (extname(file) !== '.json') continue;
    data[basename(file, '.json')] = JSON.parse(readFileSync(resolve(dir, file), 'utf-8'));
  }
  return data;
}

/** Полная перезагрузка страницы при изменении демо-данных. */
function reloadOnData() {
  return {
    name: 'reload-on-data',
    configureServer(server) {
      server.watcher.add(r('src/data'));
      server.watcher.on('change', (file) => {
        if (file.replaceAll('\\', '/').includes('/src/data/')) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

/**
 * При сборке плагин спрайта заменяет «/__spritemap» на путь к файлу только
 * в JS и CSS, а в HTML-страницах — нет. Доделываем замену в готовых HTML.
 */
function spritemapInHtml() {
  let base = '/';
  return {
    name: 'spritemap-in-html',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const sprite = Object.values(ctx.bundle ?? {}).find(
          (f) => f.type === 'asset' && /(^|\/)spritemap\.[^/]*\.svg$/.test(f.fileName),
        );
        return sprite ? html.replaceAll('/__spritemap', `${base}${sprite.fileName}`) : html;
      },
    },
  };
}

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: r('src/partials'),
      context: () => ({ data: loadData() }),
      // Копия нужна: Handlebars принимает только обычный объект, а не объект модуля
      helpers: { ...helpers },
    }),
    svgSpritemap('./src/assets/icons/*.svg', {
      prefix: 'icon-',
      output: { hrefAttribute: 'href' },
      // Цвет иконок задаём через currentColor, поэтому svgo не трогает fill/stroke
      svgo: {
        plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
      },
    }),
    spritemapInHtml(),
    reloadOnData(),
  ],

  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        // Позволяет писать @use 'abstracts' as *; из любого файла
        loadPaths: [r('src/scss')],
      },
    },
  },

  build: {
    rolldownOptions: {
      input: {
        main: r('index.html'),
        'ui-kit': r('ui-kit.html'),
      },
    },
  },

  server: {
    port: 5173,
    open: false,
  },
});
