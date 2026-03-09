/**
 * Tính hoa hồng campaign: lấy salary_range (type=year) từ job, parse min-max, nhân với campaign.percent
 * Dùng khi job thuộc campaign và có salary range theo năm.
 */

/**
 * Parse chuỗi "3.000.000 - 7.500.000" hoặc "3000000-7500000" thành { min, max } (đơn vị gốc: yen/VND)
 * Dùng giá trị gốc để nhân đúng: 3.000.000 × 30% = 900.000
 * @param {string} str - Chuỗi salary_range
 * @returns {{ min: number, max: number } | null}
 */
function parseSalaryRange(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.trim().match(/([\d.,]+)\s*[-–—]\s*([\d.,]+)/);
  if (!m) return null;
  const parseNum = (s) => {
    const cleaned = String(s).replace(/[.,]/g, '');
    const num = parseFloat(cleaned) || 0;
    const digitCount = cleaned.replace(/[^0-9]/g, '').length;
    // 7+ chữ số = đơn vị gốc (yen/VND), giữ nguyên
    if (digitCount >= 7) return num;
    // < 7 chữ số = đang là triệu, nhân 1M ra đơn vị gốc
    return num * 1000000;
  };
  const min = parseNum(m[1]);
  const max = parseNum(m[2]);
  if (min <= 0 || max <= 0) return null;
  return { min, max };
}

/**
 * Gắn computedCampaignCommission vào job nếu job thuộc campaign và có salary range year
 * @param {Object} job - Job object (plain hoặc Sequelize), phải có salaryRanges, jobCampaigns
 * @param {boolean} isAdmin - Admin thì rankMultiplier=1, CTV thì nhân rank
 * @param {number} rankMultiplier - Hệ số rank CTV (0-1), Admin = 1
 * @returns {Object} job với computedCampaignCommission nếu tính được
 */
function attachCampaignCommission(job, isAdmin = true, rankMultiplier = 1) {
  const j = job && typeof job.toJSON === 'function' ? job.toJSON() : { ...job };
  const jobCampaigns = j.jobCampaigns || [];
  const salaryRanges = j.salaryRanges || [];
  const yearRange = salaryRanges.find((sr) => {
    const t = (sr.type || '').toLowerCase();
    return t === 'year' || t === 'năm';
  });
  const rawRange = yearRange?.salaryRange ?? yearRange?.salary_range ?? '';

  if (jobCampaigns.length === 0) return j;
  const campaign = jobCampaigns[0]?.campaign;
  const percent = campaign?.percent;
  if (percent == null || Number(percent) <= 0) return j;

  const parsed = parseSalaryRange(rawRange);
  if (!parsed) return j;

  const pct = Number(percent) / 100;
  const commissionMin = parsed.min * pct * rankMultiplier;
  const commissionMax = parsed.max * pct * rankMultiplier;

  // Formatted dùng cho log/debug; frontend sẽ format theo JPY/VND
  const format = (n) => {
    if (n >= 1000) return Math.round(n).toLocaleString('vi-VN');
    if (n < 1) return n.toFixed(2).replace(/\.?0+$/, '');
    if (n < 10) return n.toFixed(1).replace(/\.?0+$/, '');
    return Math.round(n).toString();
  };

  j.computedCampaignCommission = {
    min: commissionMin,
    max: commissionMax,
    formatted: `${format(commissionMin)} - ${format(commissionMax)}`,
    salaryMin: parsed.min,
    salaryMax: parsed.max,
    percent: Number(percent)
  };
  return j;
}

/**
 * Gắn computedCampaignCommission cho mảng jobs
 */
function attachCampaignCommissionToJobs(jobs, isAdmin = true, rankMultiplier = 1) {
  if (!Array.isArray(jobs)) return jobs;
  return jobs.map((job) => attachCampaignCommission(job, isAdmin, rankMultiplier));
}

export { parseSalaryRange, attachCampaignCommission, attachCampaignCommissionToJobs };
