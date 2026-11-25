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
 * Пропускает файлы, у которых результат новее оригинала. Флаг --force
 * пересобирает всё.
 *
 * Запуск: npm run images [-- --force] [-- --quality=80]
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'src/images-src');
const OUT = join(root, 'src/assets/images');
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

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
