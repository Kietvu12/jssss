/**
 * Migration: thêm name_en, name_jp cho campaigns và categories.
 * Chạy: node scripts/add-name-en-jp-migration.js
 * Hoặc: pnpm run migrate:name-en-jp
 */
import sequelize from '../src/config/database.js';

const migrations = [
  {
    name: 'campaigns',
    sql: `
      ALTER TABLE campaigns
        ADD COLUMN name_en VARCHAR(255) NULL DEFAULT NULL AFTER name,
        ADD COLUMN name_jp VARCHAR(255) NULL DEFAULT NULL AFTER name_en
    `,
  },
  {
    name: 'categories',
    sql: `
      ALTER TABLE categories
        ADD COLUMN name_en VARCHAR(255) NULL DEFAULT NULL AFTER name,
        ADD COLUMN name_jp VARCHAR(255) NULL DEFAULT NULL AFTER name_en
    `,
  },
];

async function run() {
  try {
    await sequelize.authenticate();
    for (const m of migrations) {
      try {
        await sequelize.query(m.sql);
        console.log(`OK: Đã thêm name_en, name_jp vào bảng ${m.name}.`);
      } catch (err) {
        if (err.message && err.message.includes('Duplicate column name')) {
          console.log(`Bảng ${m.name}: cột name_en/name_jp đã tồn tại, bỏ qua.`);
        } else throw err;
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Lỗi migration:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
