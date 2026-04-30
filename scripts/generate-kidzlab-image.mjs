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

const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'images', 'home');

async function generateImage(filename, prompt) {
  const outPath = path.join(OUTPUT_DIR, filename);
  console.log(`\nGenerating "${filename}"...`);

  const body = {
    model: 'qwen-image-2.0',
    input: { messages: [{ role: 'user', content: [{ text: prompt }] }] },
    parameters: { watermark: false, prompt_extend: true, size: '1920*1080' },
  };

  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`  → POST ${new URL(endpoint).host}...`);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      if (!text) continue;
      const data = JSON.parse(text);
      if (!res.ok) { console.log(`  API error: ${data.message || data.code}, trying next...`); continue; }
      const url = data.output?.choices?.[0]?.message?.content?.[0]?.image;
      if (!url) continue;
      console.log(`  Downloading...`);
      const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
      fs.writeFileSync(outPath, buffer);
      console.log(`  ✓ Saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return buffer;
    } catch (err) { console.log(`  Error: ${err.message}`); }
  }
  console.log(`  ✗ Failed: ${filename}`);
  return null;
}

async function removeGreenBackground(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Detect green pixels: high green relative to red and blue
    if (g > 100 && g > r * 1.3 && g > b * 1.3) {
      data[i + 3] = 0;
    }
    // Also handle near-white/white-green fringe
    const isWhiteish = (r > 230 && g > 230 && b > 230);
    if (isWhiteish && g > r * 0.9 && g > b * 0.9) {
      // Don't remove white (might be skin), just tone it
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

const rawBuffer = await generateImage(
  'kidzlabs-child.png',
  'Photorealistic medium shot of a young Caucasian white boy (7-8 years old) with light brown hair, wearing safety goggles, sitting at a desk with colorful science experiment beakers, test tubes, and a small volcano model in front of him. He looks intensely focused and curious. Natural soft daylight and warm indoor classroom lighting. Pure solid chroma-key GREEN SCREEN background (bright uniform green like #00FF00 or #00B140), no details, no shadows on the background, completely flat green backdrop. High resolution, sharp focus. No text, no letters, no logos, no watermarks.'
);

if (rawBuffer) {
  console.log('\nRemoving green screen background with sharp...');
  const pngBuffer = await removeGreenBackground(rawBuffer);
  const outPath = path.join(OUTPUT_DIR, 'kidzlabs-child.png');
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`  ✓ Saved transparent PNG: kidzlabs-child.png (${(pngBuffer.length / 1024).toFixed(1)} KB)`);
}

console.log('\nDone.');
