/**
 * Trạng thái hồ sơ ứng viên (cv_storages.status)
 * Đồng bộ với backend/src/constants/cvStatus.js
 */
export const CV_STATUS = {
  1: {
    label: 'Hồ sơ mới',
    value: 'new',
    canNominate: true,
  },
  3: {
    label: 'Hồ sơ trùng',
    value: 'duplicate',
    canNominate: false,
  },
  4: {
    label: 'Hồ sơ quá hạn quá 6 tháng',
    value: 'overdue_6_months',
    canNominate: false,
  },
};

export const CV_STATUS_NEW = 1;
export const CV_STATUS_DUPLICATE = 3;
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

/**
 * Style cho badge trạng thái (backgroundColor, color, borderColor)
 */
export const getCVStatusStyle = (status) => {
  const num = status != null && status !== '' ? Number(status) : 1;
  const styles = {
    1: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
    2: { bg: '#dcfce7', color: '#166534', border: '#86efac' }, // cũ: Đã lưu trữ, hiển thị như mới
    3: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
    4: { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' },
  };
  return styles[num] || styles[1];
};

/** Nhãn trạng thái theo ngôn ngữ (vi / en / ja) */
export const CV_STATUS_LABELS = {
  vi: {
    1: 'Hồ sơ mới',
    3: 'Hồ sơ trùng',
    4: 'Hồ sơ quá hạn quá 6 tháng',
  },
  en: {
    1: 'New profile',
    3: 'Duplicate',
    4: 'Overdue 6+ months',
  },
  ja: {
    1: '新規',
    3: '重複',
    4: '6ヶ月以上期限切れ',
  },
};

/**
 * Lấy nhãn trạng thái theo ngôn ngữ
 * @param {number|string|null|undefined} status
 * @param {'vi'|'en'|'ja'} language
 */
export const getCVStatusLabel = (status, language = 'vi') => {
  const num = status != null && status !== '' ? Number(status) : 1;
  const lang = language === 'en' || language === 'ja' ? language : 'vi';
  const labels = CV_STATUS_LABELS[lang];
  if (num === 2) return labels[1]; // cũ: Đã lưu trữ → hiển thị như mới
  return labels[num] || labels[1];
};

/**
 * Danh sách tất cả trạng thái để dùng cho filter/select (giữ backward compatibility)
 */
export const CV_STATUS_OPTIONS = [
  { value: 1, label: 'Hồ sơ mới' },
  { value: 3, label: 'Hồ sơ trùng' },
  { value: 4, label: 'Hồ sơ quá hạn quá 6 tháng' },
];

/**
 * Options trạng thái theo ngôn ngữ (dùng cho dropdown filter)
 */
export const getCVStatusOptions = (language = 'vi') => {
  const lang = language === 'en' || language === 'ja' ? language : 'vi';
  const labels = CV_STATUS_LABELS[lang];
  return [
    { value: 1, label: labels[1] },
    { value: 3, label: labels[3] },
    { value: 4, label: labels[4] },
  ];
};
