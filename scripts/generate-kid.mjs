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

const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'images', 'hero', 'orbit');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function removeWhiteBackground(inputBuffer, threshold = 28) {
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
    .png()
    .toBuffer();
}

async function generateKid(filename, promptText) {
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
      const imgRes = await fetch(imageUrl);
      const rawBuffer = Buffer.from(await imgRes.arrayBuffer());

      console.log(`  Removing background...`);
      const processedBuffer = await removeWhiteBackground(rawBuffer);

      fs.writeFileSync(outPath, processedBuffer);
      const stats = fs.statSync(outPath);
      console.log(`  ✓ Saved: ${filename} (${(stats.size / 1024).toFixed(1)} KB, alpha)`);
      return true;
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }

  console.log(`  ✗ Failed: ${filename}`);
  return false;
}

const kids = [
  {
    file: 'kid-2.png',
    prompt:
      'Realistic photo of a young Caucasian boy (6-7 years old) with light brown hair sitting on the floor playing with colorful building blocks, stacking them up, curious happy expression looking at the camera. Professional photoshoot quality, soft studio lighting, plain solid white background. Full body shot. High resolution, sharp focus. No text, no letters.',
  },
  {
    file: 'kid-3.png',
    prompt:
      'Realistic photo of a young Caucasian girl (5-7 years old) with blonde hair holding a magnifying glass up to her eye, looking curious and explorative, examining something closely. Professional photoshoot quality, soft studio lighting, plain solid white background. Three-quarter body shot. High resolution, sharp focus. No text, no letters.',
  },
  {
    file: 'kid-4.png',
    prompt:
      'Realistic photo of a young Asian boy (6-7 years old) with black hair sitting cross-legged holding a toy rocket ship in his hands, looking up with wonder and imagination, smiling. Professional photoshoot quality, soft studio lighting, plain solid white background. Full body shot. High resolution, sharp focus. No text, no letters.',
  },
  {
    file: 'kid-5.png',
    prompt:
      'Realistic photo of a young Asian girl (5-7 years old) with black hair in a ponytail sitting at a small table doing a science experiment with colorful beakers and test tubes, curious focused expression. Professional photoshoot quality, soft studio lighting, plain solid white background. Three-quarter body shot. High resolution, sharp focus. No text, no letters.',
  },
  {
    file: 'kid-6.png',
    prompt:
      'Realistic photo of a young Caucasian boy (5-6 years old) with curly brown hair kneeling on the floor playing with a toy dinosaur, excited and laughing, holding the dinosaur up. Professional photoshoot quality, soft studio lighting, plain solid white background. Full body shot. High resolution, sharp focus. No text, no letters.',
  },
];

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     Kid Image Generator (realistic + alpha)  ║');
  console.log('╚══════════════════════════════════════════════╝');

  for (let i = 0; i < kids.length; i++) {
    const { file, prompt } = kids[i];
    await generateKid(file, prompt);
    if (i < kids.length - 1) await sleep(2000);
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
