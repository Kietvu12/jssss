import { hashPassword } from '../src/utils/password.js';

/**
 * Script để mã hóa mật khẩu
 * Usage: node backend/scripts/hashPassword.js
 */
const password = '123456';

try {
  console.log('Đang mã hóa mật khẩu:', password);
  const hashedPassword = await hashPassword(password);
  console.log('\n========================================');
  console.log('Mật khẩu gốc:', password);
  console.log('Mật khẩu đã được mã hóa:');
  console.log(hashedPassword);
  console.log('========================================');
  console.log('\nBạn có thể sử dụng mật khẩu đã mã hóa này để cập nhật vào database.');
  console.log('Độ dài hash:', hashedPassword.length, 'ký tự');
} catch (error) {
  console.error('Lỗi khi mã hóa mật khẩu:', error);
  process.exit(1);
}

