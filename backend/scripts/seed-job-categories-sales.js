/**
 * Seed JobCategory: thêm cây danh mục việc làm từ file JSON.
 * Dùng API admin (cần token) hoặc trực tiếp DB (không cần token).
 *
 * Cách 1 - Gọi API (backend đang chạy, có token admin):
 *   ADMIN_TOKEN=<token> node scripts/seed-job-categories-sales.js [file.json]
 *
 * Cách 2 - Seed trực tiếp DB (không cần API, không cần token):
 *   node scripts/seed-job-categories-sales.js [file.json] --db
 *
 * File mặc định: job-categories-sales.json
 * Ví dụ thêm "Kế hoạch - Quản lý": node scripts/seed-job-categories-sales.js job-categories-ke-hoach-quan-ly.json --db
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const argv = process.argv.filter((a) => a !== '--db');
const USE_DB = process.argv.includes('--db');
const JSON_FILE = argv[2] || 'job-categories-sales.json';

function slugify(name) {
  const map = {
    à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a', ă: 'a', ằ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a', â: 'a', ầ: 'a', ấ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
    è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e', ê: 'e', ề: 'e', ế: 'e', ể: 'e', ễ: 'e', ệ: 'e',
    ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
    ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o', ô: 'o', ồ: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o', ơ: 'o', ờ: 'o', ớ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
    ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u', ư: 'u', ừ: 'u', ứ: 'u', ử: 'u', ữ: 'u', ự: 'u',
    ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y', đ: 'd'
  };
  let s = name.toLowerCase().trim();
  s = s.replace(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, (c) => map[c] || c);
  s = s.replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return s || 'category';
}

function makeSlugUnique(baseSlug, parentSlug, used) {
  let slug = parentSlug ? `${parentSlug}-${baseSlug}` : baseSlug;
  if (used.has(slug)) {
    let n = 1;
    while (used.has(`${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }
  used.add(slug);
  return slug;
}

/**
 * Flatten cây thành mảng [ { name, baseSlug, parentSlug, logicalSlug, depth }, ... ] (cha trước con).
 * logicalSlug = slug đầy đủ của nút (để con tra parentId); khi tạo có thể dùng makeSlugUnique.
 */
function flattenTree(node, parentSlug = null, depth = 0, out = []) {
  const name = node.name;
  const baseSlug = slugify(name);
  const logicalSlug = parentSlug ? `${parentSlug}-${baseSlug}` : baseSlug;
  out.push({ name, baseSlug, parentSlug, logicalSlug, depth });
  if (node.children && node.children.length) {
    for (const child of node.children) {
      flattenTree(child, logicalSlug, depth + 1, out);
    }
  }
  return out;
}

async function seedViaApi(items, usedSlugs) {
  const idBySlug = {};
  for (const it of items) {
    const slug = makeSlugUnique(it.baseSlug, it.parentSlug, usedSlugs);
    const parentId = it.parentSlug ? idBySlug[it.parentSlug] : null;
    const res = await fetch(`${API_BASE_URL}/admin/job-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify({
        name: it.name,
        slug,
        description: null,
        parentId: parentId || undefined,
        order: 0,
        status: 1
      })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(`API error: ${data.message || res.status} - ${JSON.stringify(data)}`);
    }
    idBySlug[it.logicalSlug] = data.data.category.id;
    console.log(`  [API] Created: ${it.name} (${slug}) id=${data.data.category.id}`);
  }
}

async function seedViaDb(items, usedSlugs) {
  const { JobCategory } = await import('../src/models/index.js');
  const idBySlug = {};
  for (const it of items) {
    const slug = makeSlugUnique(it.baseSlug, it.parentSlug, usedSlugs);
    const parentId = it.parentSlug ? idBySlug[it.parentSlug] : null;
    const cat = await JobCategory.create({
      name: it.name,
      slug,
      description: null,
      parentId,
      order: 0,
      status: 1
    });
    idBySlug[it.logicalSlug] = cat.id;
    console.log(`  [DB] Created: ${it.name} (${slug}) id=${cat.id}`);
  }
}

async function main() {
  const jsonPath = join(__dirname, JSON_FILE);
  const raw = readFileSync(jsonPath, 'utf-8');
  const root = JSON.parse(raw);
  const items = flattenTree(root);
  const usedSlugs = new Set();

  console.log('Seed JobCategory -', root.name);
  console.log('Số danh mục sẽ tạo:', items.length);

  if (USE_DB) {
    console.log('Chế độ: Seed trực tiếp DB (--db)\n');
    await seedViaDb(items, usedSlugs);
  } else {
    if (!ADMIN_TOKEN) {
      console.error('Thiếu ADMIN_TOKEN. Chạy: ADMIN_TOKEN=<token> node scripts/seed-job-categories-sales.js');
      console.error('Hoặc dùng seed DB: node scripts/seed-job-categories-sales.js --db');
      process.exit(1);
    }
    console.log('Chế độ: Gọi API admin\n');
    await seedViaApi(items, usedSlugs);
  }

  console.log('\nXong.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
