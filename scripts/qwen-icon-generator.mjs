#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-542b55690a2647a2be017f5046e9047b'

const ENDPOINTS = [
  'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
]

const OUTPUT_DIR = path.resolve(process.argv[1], '..')

// ─── PROMPT BUILDER ─────────────────────────────────────────────────────────
function buildPrompt(description, extraRules = '') {
  return [
    'Create a single flat icon for an explainer video (no photo, no realistic rendering).',
    `ICON: ${description}`,
    '',
    'RULES:',
    '- Solid black filled shapes only (pure #000000), like a crisp silhouette.',
    '- Absolutely NO text, NO letters, NO numbers, NO labels.',
    '- Simple clean flat shapes with rounded corners where appropriate.',
    '- NO gradients, NO shading, NO shadows.',
    '- Center the icon on a pure white background.',
    '- The icon should fill roughly 70-80% of the frame.',
    '- Minimalist, modern, flat vector style.',
    extraRules,
    '',
    'Output: a single icon image on a white background.'
  ].join('\n')
}

// ─── QWEN API CALL ──────────────────────────────────────────────────────────
async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export async function generateIcon(filename, description, extraRules = '') {
  const prompt = buildPrompt(description, extraRules)
  console.log(`\nGenerating "${filename}"...`)
  console.log(`  ${description}`)

  const requestBody = {
    model: 'qwen-image-2.0',
    input: {
      messages: [{ role: 'user', content: [{ text: prompt }] }]
    },
    parameters: {
      watermark: false,
      prompt_extend: true,
      size: '1024*1024'
    }
  }

  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`  → POST ${new URL(endpoint).host}...`)
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const text = await res.text()
      if (!text) continue

      const data = JSON.parse(text)

      if (!res.ok) {
        console.log(`  API error: ${data.message || data.code}, trying next...`)
        continue
      }

      const imageUrl = data.output?.choices?.[0]?.message?.content?.[0]?.image
      if (!imageUrl) continue

      console.log(`  Downloading...`)
      const imgRes = await fetch(imageUrl)
      const buffer = Buffer.from(await imgRes.arrayBuffer())

      const outPath = path.join(OUTPUT_DIR, filename)
      fs.writeFileSync(outPath, buffer)
      console.log(`  ✓ Saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`)
      return true

    } catch (err) {
      console.log(`  Error: ${err.message}`)
    }
  }

  console.log(`  ✗ Failed: ${filename}`)
  return false
}

// ─── RUN FROM COMMAND LINE ─────────────────────────────────────────────────
const [,, fileArg, descArg, ...extraArgs] = process.argv

if (fileArg && descArg) {
  const extra = extraArgs.join(' ') || ''
  await generateIcon(fileArg, descArg, extra)
} else {
  const icons = [
    // { file: 'my-icon.png', desc: 'Description of icon', extra: 'Extra rules' },
  ]

  if (icons.length === 0) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Qwen Icon Generator                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  USAGE:                                                      ║
║    node scripts/qwen-icon-generator.mjs <filename> <desc>    ║
║    node scripts/qwen-icon-generator.mjs <filename> <d> <e>   ║
║                                                              ║
║  EXAMPLES:                                                   ║
║    node scripts/qwen-icon-generator.mjs "rocket.png"         ║
║      "A rocket ship launching upward, minimalist"            ║
║                                                              ║
║    node scripts/qwen-icon-generator.mjs "gear.png"           ║
║      "A cog/gear with 6 teeth"                               ║
║      "Solid filled, no thin lines, bold silhouette"          ║
║                                                              ║
║  ENV: DASHSCOPE_API_KEY (optional, falls back to hardcoded)  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`)
    process.exit(0)
  }

  for (let i = 0; i < icons.length; i++) {
    await generateIcon(icons[i].file, icons[i].desc, icons[i].extra || '')
    await sleep(1000)
  }
}
