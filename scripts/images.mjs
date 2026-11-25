/**
 * Конвертация картинок в WebP.
 *
 * Берёт оригиналы (PNG/JPG/JPEG/WebP) из src/images-src/ и кладёт WebP
 * в src/assets/images/ с той же структурой подпапок.
 *
 * Оригиналы выгружаются из Figma в двойном размере (2x). Для каждого файла
 * создаются две версии: имя@2x.webp (как есть) и имя.webp (в половину ширины).
 * Если оригинал назван с суффиксом @1x (имя@1x.png) — создаётся только имя.webp
 * без уменьшения (для мелких картинок, где 2x не нужен).
 *
 * Дополнительно для адаптивного srcset создаются промежуточные ширины имя-<ширина>w.webp
 * (WIDTHS, только меньше исходника и не ближе 15 % к уже готовым файлам), а в конце —
 * манифест src/assets/images/manifest.json: { имя: [{ file, width }, …] } по возрастанию ширины.
 * Его читает хелпер srcset (src/partials/helpers.js), чтобы собрать srcset с описанием ширинами.
 *
 * Пропускает файлы, у которых результат новее оригинала. Флаг --force
 * пересобирает всё.
 *
 * Запуск: npm run images [-- --force] [-- --quality=80]
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'src/images-src');
const OUT = join(root, 'src/assets/images');
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
// Промежуточные ширины для srcset (px)
const WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600];
const MANIFEST = join(OUT, 'manifest.json');

const args = process.argv.slice(2);
const force = args.includes('--force');
const quality = Number(args.find((a) => a.startsWith('--quality='))?.split('=')[1] ?? 80);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (EXTENSIONS.has(extname(entry.name).toLowerCase())) yield full;
  }
}

async function isFresh(src, out) {
  if (force) return false;
  try {
    return (await stat(out)).mtimeMs >= (await stat(src)).mtimeMs;
  } catch {
    return false;
  }
}

async function convert(src) {
  const rel = relative(SRC, src);
  const base = rel.slice(0, -extname(rel).length);
  const only1x = base.endsWith('@1x');
  const name = only1x ? base.slice(0, -3) : base;

  const targets = only1x
    ? [{ out: `${name}.webp`, scale: 1 }]
    : [
        { out: `${name}@2x.webp`, scale: 1 },
        { out: `${name}.webp`, scale: 0.5 },
      ];

  const { width } = await sharp(src).metadata();
  const done = [];

  // Промежуточные ширины: меньше исходника и не ближе 15 % к основным файлам
  const mainWidths = targets.map(({ scale }) => Math.round(width * scale));
  for (const w of WIDTHS) {
    if (w >= width * 0.9) continue;
    if (mainWidths.some((m) => Math.abs(m - w) / m < 0.15)) continue;
    targets.push({ out: `${name}-${w}w.webp`, scale: w / width });
  }

  for (const { out, scale } of targets) {
    const outPath = join(OUT, out);
    if (await isFresh(src, outPath)) continue;
    await mkdir(dirname(outPath), { recursive: true });
    await sharp(src)
      .resize({ width: Math.round(width * scale) })
      .webp({ quality })
      .toFile(outPath);
    done.push(out.replaceAll('\\', '/'));
  }
  return done;
}

let count = 0;
for await (const file of walk(SRC)) {
  const done = await convert(file);
  for (const f of done) console.log(`  ✓ ${f}`);
  count += done.length;
}
console.log(count ? `Готово: ${count} файл(ов) WebP.` : 'Нечего конвертировать — всё актуально.');

// Манифест ширин по всем готовым WebP: имя.webp, имя@2x.webp, имя-<ширина>w.webp
const manifest = {};
for await (const file of walk(OUT)) {
  if (extname(file) !== '.webp') continue;
  const rel = relative(OUT, file).replaceAll('\\', '/');
  const name = rel.replace(/(@2x|-\d+w)?\.webp$/, '');
  const { width } = await sharp(file).metadata();
  (manifest[name] ??= []).push({ file: rel, width });
}
for (const list of Object.values(manifest)) list.sort((a, b) => a.width - b.width);
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(
  MANIFEST,
  `${JSON.stringify(sorted, null, 2)}
`,
);
console.log(`Манифест: ${Object.keys(sorted).length} картинок → ${relative(root, MANIFEST)}`);
