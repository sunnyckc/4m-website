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

function imageToBase64(filePath) {
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function editBackground(inputPath, outputFilename, instruction) {
  const outPath = path.join(OUTPUT_DIR, outputFilename);
  console.log(`\nEditing "${outputFilename}"...`);

  const base64Image = imageToBase64(inputPath);

  const requestBody = {
    model: 'qwen-image-2.0',
    input: {
      messages: [
        {
          role: 'user',
          content: [
            { image: base64Image },
            { text: instruction },
          ],
        },
      ],
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
      if (!imageUrl) {
        console.log(`  No image URL in response, trying next...`);
        console.log(`  Response: ${JSON.stringify(data).slice(0, 300)}`);
        continue;
      }

      console.log(`  Downloading...`);
      const imgRes = await fetch(imageUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());

      fs.writeFileSync(outPath, buffer);
      const stats = fs.statSync(outPath);
      console.log(`  ✓ Saved: ${outputFilename} (${(stats.size / 1024).toFixed(1)} KB)`);
      return true;
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }

  console.log(`  ✗ Failed: ${outputFilename}`);
  return false;
}

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     Hero BG Edit (Qwen image edit)          ║');
  console.log('╚══════════════════════════════════════════════╝');

  const inputPath = path.join(OUTPUT_DIR, 'background-1.png');

  await editBackground(
    inputPath,
    'background-5.png',
    'Add subtle geometric patterns and textures to the blue gradient area of this image. Keep the white wave and cloud shapes at the bottom completely unchanged. In the blue gradient portion, add faint delicate patterns: small dots, thin wavy lines, tiny triangles, and subtle hexagonal grid lines in very light blue and white. The patterns should be very subtle and semi-transparent, like a faint texture overlay, not overpowering. The overall feel should remain clean, minimal, and abstract. Do not change the bottom white wave/cloud area at all.',
  );

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
