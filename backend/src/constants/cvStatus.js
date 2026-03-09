/**
 * Trạng thái hồ sơ ứng viên (cv_storages.status)
 * Dùng chung cho backend (controller, cvDuplicateChecker, ...)
 */
export const CV_STATUS = {
  1: {
    label: 'Hồ sơ mới',
    value: 'new',
    canNominate: true
  },
  3: {
    label: 'Hồ sơ trùng',
    value: 'duplicate',
    canNominate: false
  },
  4: {
    label: 'Hồ sơ quá hạn quá 6 tháng',
    value: 'overdue_6_months',
    canNominate: false
  }
};

/** Hồ sơ mới – có thể dùng để tiến cử */
export const CV_STATUS_NEW = 1;

/** Hồ sơ trùng – không thể dùng để tiến cử */
export const CV_STATUS_DUPLICATE = 3;

/** Hồ sơ quá hạn quá 6 tháng – tồn tại > 6 tháng, không có đơn tiến cử nào có lịch sử xử lý */
export const CV_STATUS_OVERDUE_6_MONTHS = 4;

/**
 * Lấy thông tin trạng thái theo mã số
 * @param {number|string|null|undefined} status
 * @returns {{ label: string, value: string, canNominate: boolean }}
 */
export const getCVStatus = (status) => {
  const num = status != null && status !== '' ? Number(status) : NaN;
  if (Number.isNaN(num) || num < 1 || num > 4) {
    return CV_STATUS[CV_STATUS_NEW];
  }
  // 2 (cũ: Đã lưu trữ) không dùng nữa → coi như hồ sơ mới
  if (num === 2) return CV_STATUS[CV_STATUS_NEW];
  return CV_STATUS[num] || CV_STATUS[CV_STATUS_NEW];
};

/** Kiểm tra CV có thể dùng để tiến cử không */
export const canCVBeNominated = (status) => {
  return getCVStatus(status).canNominate;
};
