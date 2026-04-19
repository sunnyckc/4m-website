#!/usr/bin/env node
/**
 * Download assets from a JSON array of { name, link }.
 * Usage:
 *   node scripts/download-logos/index.mjs
 *   node scripts/download-logos/index.mjs path/to/brands.json
 *   node scripts/download-logos/index.mjs -i brands.json -o ./out
 *   cat brands.json | node scripts/download-logos/index.mjs --stdin
 *   node scripts/download-logos/index.mjs --png-only -o ./downloads/brand-logos-png
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_INPUT = path.join(__dirname, "brands.json");

function printHelp() {
  console.log(`download-logos — save each { name, link } to a file under --out

Usage:
  node scripts/download-logos/index.mjs [input.json] [-o DIR]
  node scripts/download-logos/index.mjs -i input.json -o ./downloads/brand-logos
  cat brands.json | node scripts/download-logos/index.mjs --stdin [-o DIR]

Options:
  -i, --input   JSON file (array of { name, link }). Default: scripts/download-logos/brands.json
  -o, --out     Output directory (created if missing). Default: ./downloads/brand-logos
      --stdin   Read JSON from stdin instead of a file
      --png-only  Only download items whose link path ends in .png
  -h, --help    Show this message
`);
}

function parseArgs(argv) {
  const out = { inputPath: null, outDir: null, stdin: false, help: false, pngOnly: false };
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-h" || a === "--help") {
      out.help = true;
    } else if (a === "--png-only") {
      out.pngOnly = true;
    } else if (a === "--stdin") {
      out.stdin = true;
    } else if (a === "-i" || a === "--input") {
      out.inputPath = path.resolve(args[++i] ?? "");
    } else if (a === "-o" || a === "--out") {
      out.outDir = path.resolve(args[++i] ?? "");
    } else if (!a.startsWith("-")) {
      out.inputPath = path.resolve(a);
    }
  }
  if (!out.outDir) {
    out.outDir = path.join(
      process.cwd(),
      "downloads",
      out.pngOnly ? "brand-logos-png" : "brand-logos",
    );
  }
  return out;
}

function isPngUrl(link) {
  try {
    return new URL(link).pathname.toLowerCase().endsWith(".png");
  } catch {
    return false;
  }
}

function slugify(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/["']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function extFromUrl(urlStr) {
  try {
    const pathname = new URL(urlStr).pathname;
    const base = path.basename(pathname);
    const m = base.match(/(\.[a-z0-9]+)$/i);
    return m ? m[1].toLowerCase() : "";
  } catch {
    return "";
  }
}

function extFromContentType(ct) {
  if (!ct) return "";
  if (ct.includes("image/svg")) return ".svg";
  if (ct.includes("image/png")) return ".png";
  if (ct.includes("image/jpeg")) return ".jpg";
  if (ct.includes("image/webp")) return ".webp";
  if (ct.includes("image/gif")) return ".gif";
  return "";
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function downloadOne(item, outDir) {
  const { name, link } = item;
  if (typeof name !== "string" || typeof link !== "string" || !link.trim()) {
    throw new Error("each item needs string name and link");
  }

  const slug = slugify(name);
  if (!slug) {
    throw new Error("name produced empty slug");
  }

  const res = await fetch(link, {
    redirect: "follow",
    headers: {
      "User-Agent": "my-store-download-logos/1.0 (+https://github.com/nodejs/node)",
      Accept: "image/*,*/*;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  let ext = extFromUrl(res.url) || extFromUrl(link);
  if (!ext) {
    ext = extFromContentType(res.headers.get("content-type"));
  }
  if (!ext) {
    ext = ".bin";
  }

  const filename = `${slug}${ext}`;
  const filepath = path.join(outDir, filename);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(filepath, buf);

  return { filename, filepath, bytes: buf.length };
}

async function main() {
  const { inputPath, outDir, stdin, help, pngOnly } = parseArgs(process.argv);
  if (help) {
    printHelp();
    process.exit(0);
  }

  let raw;
  if (stdin) {
    raw = await readStdin();
  } else {
    const p = inputPath ?? DEFAULT_INPUT;
    raw = await fs.readFile(p, "utf8");
  }

  let items;
  try {
    items = JSON.parse(raw);
  } catch (e) {
    console.error("Invalid JSON:", e.message);
    process.exit(1);
  }

  if (!Array.isArray(items)) {
    console.error("JSON root must be an array of { name, link }");
    process.exit(1);
  }

  if (pngOnly) {
    const before = items.length;
    items = items.filter((item) => isPngUrl(item?.link));
    const skipped = before - items.length;
    if (skipped) {
      console.error(`--png-only: skipping ${skipped} non-PNG link(s)`);
    }
    if (!items.length) {
      console.error("No items left after --png-only filter.");
      process.exit(1);
    }
  }

  await fs.mkdir(outDir, { recursive: true });

  const results = [];
  for (const item of items) {
    const label = item?.name ?? "(unnamed)";
    try {
      const r = await downloadOne(item, outDir);
      results.push({
        name: label,
        ok: true,
        file: r.filename,
        bytes: r.bytes,
      });
      console.error(`ok  ${r.filename} (${r.bytes} bytes)`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ name: label, ok: false, error: msg });
      console.error(`err ${label}: ${msg}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.error(`\nDone. ${results.length - failed.length}/${results.length} saved → ${outDir}`);
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
