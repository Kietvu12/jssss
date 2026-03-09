/**
 * Migration: thêm cột photo_path vào bảng cv_storages (ảnh chân dung CV).
 * Chạy: node scripts/add-photo-path-migration.js
 * Hoặc: pnpm run migrate:photo-path
 */
import sequelize from '../src/config/database.js';

const sql = `
  ALTER TABLE cv_storages
  ADD COLUMN photo_path VARCHAR(255) NULL DEFAULT NULL AFTER other_documents
`;

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.query(sql);
    console.log('OK: Đã thêm cột photo_path vào bảng cv_storages.');
    process.exit(0);
  } catch (err) {
    if (err.message && err.message.includes('Duplicate column name')) {
      console.log('Cột photo_path đã tồn tại, bỏ qua.');
      process.exit(0);
      return;
    }
    console.error('Lỗi migration:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
