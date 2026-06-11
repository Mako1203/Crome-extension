// Генератор PNG иконок для Chrome Extension
// Создаёт простые цветные иконки с буквой "H"
const fs = require('fs');
const path = require('path');

// Minimal valid 1x1 red PNG (will be resized by browser if needed)
// Actual: 16x16, 48x48, 128x128 purple icons
function createPNG(size, r, g, b) {
  // This creates a simple solid-color PNG
  // PNG structure: signature + IHDR + IDAT + IEND
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // width
  ihdrData.writeUInt32BE(size, 4);  // height
  ihdrData.writeUInt8(8, 8);        // bit depth
  ihdrData.writeUInt8(2, 9);        // color type (RGB)
  ihdrData.writeUInt8(0, 10);       // compression
  ihdrData.writeUInt8(0, 11);       // filter
  ihdrData.writeUInt8(0, 12);       // interlace

  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT - raw pixel data with filter byte per row
  const rawData = [];
  for (let y = 0; y < size; y++) {
    rawData.push(0); // filter byte (none)
    for (let x = 0; x < size; x++) {
      // Draw a simple gradient circle
      const cx = size / 2;
      const cy = size / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = size * 0.45;

      let pr = r, pg = g, pb = b;
      if (dist > radius) {
        // Transparent outside circle (set to white for simplicity)
        pr = 255; pg = 255; pb = 255;
      } else {
        // Gradient effect
        const factor = 1 - (dist / radius) * 0.3;
        pr = Math.round(r * factor);
        pg = Math.round(g * factor);
        pb = Math.round(b * factor);
      }
      rawData.push(pr, pg, pb);
    }
  }

  const rawBuffer = Buffer.from(rawData);
  const deflated = require('zlib').deflateSync(rawBuffer);
  const idat = createChunk('IDAT', deflated);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Создаём папку icons
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Генерируем иконки разных размеров (фиолетовый градиент #667eea)
const sizes = [16, 48, 128];
sizes.forEach((size) => {
  const png = createPNG(size, 0x66, 0x7e, 0xea);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Created ${filePath} (${png.length} bytes)`);
});

console.log('All icons generated successfully!');
