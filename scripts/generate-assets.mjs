/**
 * Generates resources/icon.png (1024×1024) and resources/splash.png (2732×2732).
 *
 * Pure Node.js — no npm deps required. PNG encoding uses Node's built-in zlib.
 *
 * Design: 3×3 grid of coloured dots matching the app's game palette on a #0f172a
 * background. Grid mirrors the Position Grid game motif and remains legible at 48px.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── CRC-32 (PNG uses the standard zlib polynomial) ─────────────────────────

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG encoder ────────────────────────────────────────────────────────────

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

function encodePNG(width, height, pixels) {
  // pixels: Buffer of width*height*3 packed RGB bytes

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB (no alpha)
  // bytes 10-12: compression=0, filter=0, interlace=0 (already zero)

  // Prepend a filter-type byte (0 = None) to each scanline
  const scanlines = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) {
    const dst = y * (width * 3 + 1);
    scanlines[dst] = 0; // filter: None
    pixels.copy(scanlines, dst + 1, y * width * 3, (y + 1) * width * 3);
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(scanlines)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Drawing primitives ──────────────────────────────────────────────────────

function hexRGB(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function createPixels(width, height, bg) {
  const buf = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    buf[i * 3] = bg[0];
    buf[i * 3 + 1] = bg[1];
    buf[i * 3 + 2] = bg[2];
  }
  return buf;
}

function drawCircle(pixels, width, cx, cy, r, color) {
  const h = pixels.length / (width * 3);
  const x0 = Math.max(0, Math.floor(cx - r - 1));
  const x1 = Math.min(width - 1, Math.ceil(cx + r + 1));
  const y0 = Math.max(0, Math.floor(cy - r - 1));
  const y1 = Math.min(h - 1, Math.ceil(cy + r + 1));

  const rOuter = r + 0.5;
  const rInner = r - 0.5;
  const rOuterSq = rOuter * rOuter;
  const rInnerSq = rInner * rInner;

  for (let y = y0; y <= y1; y++) {
    const dy = y - cy;
    const dy2 = dy * dy;
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      const dSq = dx * dx + dy2;
      if (dSq > rOuterSq) continue;
      const i = (y * width + x) * 3;
      if (dSq < rInnerSq) {
        // Fully inside: hard fill
        pixels[i] = color[0];
        pixels[i + 1] = color[1];
        pixels[i + 2] = color[2];
      } else {
        // Edge pixel: 1-pixel anti-alias blend
        const a = rOuter - Math.sqrt(dSq); // 0..1
        pixels[i] = Math.round(pixels[i] + (color[0] - pixels[i]) * a);
        pixels[i + 1] = Math.round(pixels[i + 1] + (color[1] - pixels[i + 1]) * a);
        pixels[i + 2] = Math.round(pixels[i + 2] + (color[2] - pixels[i + 2]) * a);
      }
    }
  }
}

// ── Design tokens (matches src/styles/tokens.css) ──────────────────────────

const BG = hexRGB('#0f172a');

// 3×3 colour grid — rows/cols match Position Grid colour palette
const DOT_COLORS = [
  [hexRGB('#ef4444'), hexRGB('#3b82f6'), hexRGB('#22c55e')], // row 0: red  blue  green
  [hexRGB('#eab308'), hexRGB('#6366f1'), hexRGB('#a855f7')], // row 1: yellow primary purple
  [hexRGB('#22c55e'), hexRGB('#ef4444'), hexRGB('#3b82f6')], // row 2: green  red  blue
];

function drawGrid(pixels, width, centers, radius) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      drawCircle(pixels, width, centers[col], centers[row], radius, DOT_COLORS[row][col]);
    }
  }
}

// ── Icon: 1024×1024 ────────────────────────────────────────────────────────
// Dot centres at 200, 512, 824 — symmetric around 512, radius 130px.
// Edge-to-edge gap = 512-200-130-130 = 52px. Outer padding = 70px.

process.stdout.write('Generating resources/icon.png (1024×1024)…');
const ICON_W = 1024;
const iconPixels = createPixels(ICON_W, ICON_W, BG);
drawGrid(iconPixels, ICON_W, [200, 512, 824], 130);
mkdirSync(join(ROOT, 'resources'), { recursive: true });
writeFileSync(join(ROOT, 'resources', 'icon.png'), encodePNG(ICON_W, ICON_W, iconPixels));
console.log(' ✓');

// ── Splash: 2732×2732 ──────────────────────────────────────────────────────
// Safe zone for splash: centre 50% = 683…2049.
// Dot centres at 946, 1366, 1786 — symmetric around 1366, radius 180px.
// Leftmost edge: 946-180=766 > 683 ✓  Rightmost edge: 1786+180=1966 < 2049 ✓
// Edge-to-edge gap = 1366-946-180-180 = 60px.

process.stdout.write('Generating resources/splash.png (2732×2732)…');
const SPLASH_W = 2732;
const splashPixels = createPixels(SPLASH_W, SPLASH_W, BG);
drawGrid(splashPixels, SPLASH_W, [946, 1366, 1786], 180);
writeFileSync(join(ROOT, 'resources', 'splash.png'), encodePNG(SPLASH_W, SPLASH_W, splashPixels));
console.log(' ✓');

console.log('\nRun "npm run cap:assets" to produce all platform sizes.');
