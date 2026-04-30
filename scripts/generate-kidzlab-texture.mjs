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
      return;
    } catch (err) { console.log(`  Error: ${err.message}`); }
  }
  console.log(`  ✗ Failed: ${filename}`);
}

await generateImage(
  'kidzlabs-texture.png',
  'Seamless repeating pattern texture for a children\'s science toy brand. Simple flat white outline icons scattered evenly across a fully transparent background: tiny cartoon volcanoes with smoke, glass test tubes with bubbles, red-and-blue horseshoe magnets, science beakers, atoms, gears, and rockets. Every icon is drawn in pure white color (#FFFFFF) with soft thin line-art style. The icons should be small and spread out evenly with lots of empty space between them, like a delicate wallpaper pattern texture. Pure transparent background (no fill color, just transparent). The white icons are the only visible elements. Suitable for overlaying on a blue background with 20% opacity to create a subtle kids science texture.'
);

console.log('\nDone.');
