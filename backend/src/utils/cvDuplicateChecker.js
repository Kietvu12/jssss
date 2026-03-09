import { CVStorage, JobApplication } from '../models/index.js';
import { Op } from 'sequelize';
import { CV_STATUS_NEW, CV_STATUS_DUPLICATE, CV_STATUS_OVERDUE_6_MONTHS } from '../constants/cvStatus.js';

/** Số tháng để coi hồ sơ là quá hạn nếu không có lịch sử xử lý */
const OVERDUE_MONTHS = 6;

/**
 * Kiểm tra CV trùng dựa trên email hoặc phone
 * Trùng nếu email trùng HOẶC số điện thoại trùng (chỉ cần 1 trong 2)
 * @param {string} name - Tên ứng viên (không dùng trong điều kiện trùng)
 * @param {string} email - Email ứng viên
 * @param {string} phone - Số điện thoại ứng viên
 * @returns {Object|null} - CV trùng (cũ nhất) hoặc null nếu không trùng
 */
export async function checkDuplicateCV(name, email, phone) {
  const orConditions = [];
  if (email && String(email).trim()) {
    orConditions.push({ email: { [Op.like]: String(email).trim() } });
  }
  if (phone && String(phone).trim()) {
    orConditions.push({ phone: { [Op.like]: String(phone).trim() } });
  }

  if (orConditions.length === 0) return null;

  const duplicateCVs = await CVStorage.findAll({
    where: { [Op.or]: orConditions },
    order: [['created_at', 'ASC']]
  });

  return duplicateCVs.length > 0 ? duplicateCVs[0] : null;
}

/**
 * Xử lý khi phát hiện CV trùng
 * Luôn đánh dấu CV mới là "Hồ sơ trùng" (không thể tiến cử).
 * Khi hồ sơ cũ được chuyển sang quá hạn, hồ sơ trùng mới nhất sẽ được promote (gọi markOverdueCVsAndPromoteDuplicates).
 *
 * @param {Object} duplicateCV - CV cũ (bị trùng)
 * @param {Object} newCV - CV mới vừa tạo
 * @returns {Object} - { isDuplicate, duplicateWithCvId, message }
 */
export async function handleDuplicateCV(duplicateCV, newCV) {
  newCV.status = CV_STATUS_DUPLICATE;
  newCV.isDuplicate = true;
  newCV.duplicateWithCvId = duplicateCV.id;
  await newCV.save();

  return {
    isDuplicate: true,
    duplicateWithCvId: duplicateCV.id,
    message: 'CV bị trùng với CV đã tồn tại, không thể dùng để tạo đơn tiến cử'
  };
}

/**
 * Kiểm tra CV có đơn tiến cử nào có lịch sử xử lý không
 * "Lịch sử xử lý" = có ít nhất 1 job application với status >= 2 (Đang đợi xử lý hồ sơ WS trở lên)
 * @param {string} cvCode - Mã CV
 * @returns {Promise<boolean>}
 */
async function hasJobApplicationProcessingHistory(cvCode) {
  const count = await JobApplication.count({
    where: {
      cvCode,
      status: { [Op.gte]: 2 }
    }
  });
  return count > 0;
}

/**
 * Đánh dấu các CV quá hạn (tồn tại > 6 tháng, không có đơn tiến cử có lịch sử xử lý)
 * Khi đánh dấu CV cũ là quá hạn, nếu có CV trùng (duplicateWithCvId trỏ tới CV này),
 * CV trùng tạo gần nhất sẽ được chuyển sang "Hồ sơ mới"
 *
 * @returns {Promise<{ markedOverdue: number, promoted: number }>}
 */
export async function markOverdueCVsAndPromoteDuplicates() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - OVERDUE_MONTHS);

  const cvs = await CVStorage.findAll({
    where: {
      createdAt: { [Op.lt]: sixMonthsAgo },
      status: { [Op.ne]: CV_STATUS_OVERDUE_6_MONTHS }
    }
  });

  let markedOverdue = 0;
  let promoted = 0;

  for (const cv of cvs) {
    const hasHistory = await hasJobApplicationProcessingHistory(cv.code);
    if (hasHistory) continue;

    cv.status = CV_STATUS_OVERDUE_6_MONTHS;
    await cv.save();
    markedOverdue++;

    // Tìm CV trùng (duplicateWithCvId = cv.id), lấy CV tạo gần nhất
    const duplicates = await CVStorage.findAll({
      where: { duplicateWithCvId: cv.id },
      order: [['created_at', 'DESC']]
    });

    if (duplicates.length > 0) {
      const newestDuplicate = duplicates[0];
      newestDuplicate.status = CV_STATUS_NEW;
      newestDuplicate.isDuplicate = false;
      newestDuplicate.duplicateWithCvId = null;
      await newestDuplicate.save();
      promoted++;
    }
  }

  return { markedOverdue, promoted };
}
