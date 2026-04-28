#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-542b55690a2647a2be017f5046e9047b';

const ENDPOINTS = [
  'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
];

const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'images', 'hero', 'orbit');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateBg(filename, promptText) {
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
      size: '1920*1080',
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
      const imgRes = await fetch(imageUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());

      fs.writeFileSync(outPath, buffer);
      console.log(`  ✓ Saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return true;
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }

  console.log(`  ✗ Failed: ${filename}`);
  return false;
}

const backgrounds = [
  {
    file: 'background-1.png',
    prompt:
      'Abstract banner background for a children\'s educational toy website. Very subtle linear gradient from light blue on the left to slightly lighter blue-white on the right. The bottom fifth of the image has soft white wave shapes and gentle cloud-like curves, like rolling hills or ocean waves. Minimalist, clean, modern. High resolution, sharp details, 8k quality. No text, no letters, no realistic objects. Flat vector illustration style.',
  },
  {
    file: 'background-2.png',
    prompt:
      'Abstract pattern background for a children\'s science toy brand. Subtle repeating pattern of simple flat line-art science icons scattered across a very light blue background: tiny volcanoes, beakers, magnets, atoms, gears, test tubes, and molecules. Drawn in a thin white or very faint blue stroke style, like a subtle wallpaper texture. Very light, airy, not busy. High resolution, sharp details, 8k quality. No text, no letters, no photorealistic objects.',
  },
  {
    file: 'background-3.png',
    prompt:
      'Subtle abstract pattern texture background for a toy company. Small geometric shapes — circles, rectangles, hexagons, triangles, diamonds — scattered with lots of breathing room across a very light warm off-white background. Each shape is small and spaced far apart from each other, like a delicate scattered pattern. Colors are soft and muted: pastel pink, soft blue, pale yellow, light mint, gentle lavender. Very minimal, clean, airy. Acts as a subtle background texture, not a crowded pattern. High resolution, sharp details, 8k quality. No text, no letters, no realistic objects.',
  },
  {
    file: 'background-4.png',
    prompt:
      'Subtle educational pattern texture background with tiny science and learning icons scattered sparsely across a very light warm off-white background. Small delicate icons of: rockets, planets, stars, test tubes, beakers, microscopes, rulers, magnets, volcanoes, atoms, gears, and lightbulbs. Each icon is small with lots of empty space around them, like a faint subtle wallpaper texture. Colors are soft and muted — light teal, soft coral, pale blue, warm yellow. Very airy, minimal, not crowded. Acts as a gentle background texture, not a busy pattern. High resolution, sharp details, 8k quality. No text, no letters.',
  },
  {
    file: 'background-5.png',
    prompt:
      'Abstract banner background for a children\'s educational toy website, variant 2. Smooth diagonal gradient from soft sky blue (top-left) to warm cream-white (bottom-right). Subtle pastel geometric shapes — floating circles, soft rounded squares, gentle arcs — scattered delicately across the composition. Minimalist, clean, modern. High resolution, sharp details, 8k quality. No text, no letters, no realistic objects. Flat vector illustration style.',
  },
  {
    file: 'background-6.png',
    prompt:
      'Abstract pattern background for a children\'s science toy brand, variant 2. Gentle scattered pattern of science-themed doodle icons on a very pale warm cream background: tiny molecules, DNA helixes, planets with rings, microscopes, flasks, gears, and lightbulbs. Drawn in delicate thin soft-blue and warm-gray lines, spaced far apart like a faint whisper texture. Very clean, airy, elegant. High resolution, sharp crisp lines, 8k quality. No text, no letters, no photorealistic objects.',
  },
  {
    file: 'background-7.png',
    prompt:
      'Subtle pattern background with nature and discovery icons scattered sparsely across a very light warm off-white background, variant 2. Tiny delicate line-art icons of: leaves, trees, magnifying glasses, compasses, stars, books, pencils, and butterflies. Each icon is small with generous breathing room, drawn in thin muted pastel coral and sage green strokes. Very airy, minimal, gentle. Acts as a faint elegant texture. High resolution, sharp details, crisp lines, 8k quality. No text, no letters.',
  },
];

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║       Hero Background Image Generator        ║');
  console.log('╚══════════════════════════════════════════════╝');

  for (let i = 0; i < backgrounds.length; i++) {
    const { file, prompt } = backgrounds[i];
    await generateBg(file, prompt);
    if (i < backgrounds.length - 1) await sleep(2000);
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
