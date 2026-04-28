#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-542b55690a2647a2be017f5046e9047b';

const ENDPOINTS = [
  'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
];

const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'images', 'home', 'product-icons');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function removeWhiteBackground(inputBuffer, threshold = 30) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dist = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
    if (dist < threshold) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();
}

async function generateIcon(filename, promptText) {
  const outPath = path.join(OUTPUT_DIR, filename);
  console.log(`\nGenerating "${filename}"...`);

  const requestBody = {
    model: 'qwen-image-2.0',
    input: {
      messages: [{ role: 'user', content: [{ text: promptText }] }],
    },
    parameters: {
      watermark: false,
      prompt_extend: true,
      size: '1024*1024',
    },
  };

  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`  → POST ${new URL(endpoint).host}...`);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const text = await res.text();
      if (!text) continue;

      const data = JSON.parse(text);

      if (!res.ok) {
        console.log(`  API error: ${data.message || data.code}, trying next...`);
        continue;
      }

      const imageUrl = data.output?.choices?.[0]?.message?.content?.[0]?.image;
      if (!imageUrl) continue;

      console.log(`  Downloading...`);
      const rawBuffer = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());

      console.log(`  Removing background...`);
      const processedBuffer = await removeWhiteBackground(rawBuffer);

      fs.writeFileSync(outPath, processedBuffer);
      const stats = fs.statSync(outPath);
      console.log(`  ✓ Saved: ${filename} (${(stats.size / 1024).toFixed(1)} KB, transparent PNG)`);
      return true;
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }

  console.log(`  ✗ Failed: ${filename}`);
  return false;
}

const icons = [
  // ── KidzLabs ──
  {
    file: 'kidzlabs-volcano.png',
    prompt:
      'Colorful flat vector illustration of a laboratory volcano experiment with red lava and orange flames erupting, isolated on a pure white background. Child-friendly science toy style, bold clear shapes, vibrant colors. No text, no labels, no shadows, no gradients. The object fills 70-80% of the frame and is centered.',
  },
  {
    file: 'kidzlabs-test-tube.png',
    prompt:
      'Colorful flat vector illustration of a glass test tube filled with bubbling green liquid, isolated on a pure white background. Child-friendly science toy style, bold clear shapes, vibrant colors. No text, no labels, no shadows, no gradients. The object fills 70-80% of the frame and is centered.',
  },
  {
    file: 'kidzlabs-magnet.png',
    prompt:
      'Colorful flat vector illustration of a red and blue horseshoe magnet with visible magnetic field lines, isolated on a pure white background. Child-friendly science toy style, bold clear shapes, vibrant colors. No text, no labels, no shadows, no gradients. The object fills 70-80% of the frame and is centered.',
  },
  // ── Green Science ──
  {
    file: 'green-science-water-tornado.png',
    prompt:
      'Colorful flat vector illustration of a plastic bottle with blue water swirling inside creating a tornado/vortex effect, isolated on a pure white background. Child-friendly science toy style, bold clear shapes, vibrant colors. No text, no labels, no shadows, no gradients. The object fills 70-80% of the frame and is centered.',
  },
  {
    file: 'green-science-potato-clock.png',
    prompt:
      'Colorful flat vector illustration of a potato with two metal electrodes connected by wires to a small clock display, isolated on a pure white background. Child-friendly science toy style, bold clear shapes, vibrant colors. No text, no labels, no shadows, no gradients. The object fills 70-80% of the frame and is centered.',
  },
  {
    file: 'green-science-tin-can-robot.png',
    prompt:
      'Colorful flat vector illustration of a cute tin can robot with mechanical arms and googly eyes, built from a recycled soda can, isolated on a pure white background. Child-friendly science toy style, bold clear shapes, vibrant colors. No text, no labels, no shadows, no gradients. The object fills 70-80% of the frame and is centered.',
  },
  // ── Arts & Crafts ──
  {
    file: 'arts-crafts-mold-paint.png',
    prompt:
      'Colorful flat vector illustration of a painter palette with colorful paint blobs and a paintbrush, isolated on a pure white background. Child-friendly arts and crafts style, bold clear shapes, vibrant colors. No text, no labels, no shadows, no gradients. The object fills 70-80% of the frame and is centered.',
  },
  {
    file: 'arts-crafts-knitting.png',
    prompt:
      'Colorful flat vector illustration of knitting needles with a ball of pink yarn and a small knitted square, isolated on a pure white background. Child-friendly arts and crafts style, bold clear shapes, vibrant colors. No text, no labels, no shadows, no gradients. The object fills 70-80% of the frame and is centered.',
  },
  {
    file: 'arts-crafts-mosaic.png',
    prompt:
      'Colorful flat vector illustration of mosaic art with small square colorful tiles arranged in a geometric pattern, isolated on a pure white background. Child-friendly arts and crafts style, bold clear shapes, vibrant colors. No text, no labels, no shadows, no gradients. The object fills 70-80% of the frame and is centered.',
  },
];

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║      Product Family Icon Generator (alpha)       ║');
  console.log('╚══════════════════════════════════════════════════╝');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (let i = 0; i < icons.length; i++) {
    const { file, prompt } = icons[i];
    await generateIcon(file, prompt);
    if (i < icons.length - 1) await sleep(3000);
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
