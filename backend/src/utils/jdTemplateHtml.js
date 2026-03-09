/**
 * HTML template cho JD (Job Description) - dùng để generate PDF từ dữ liệu Job
 */
function esc(s) {
  if (s == null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function orDash(s) {
  return s != null && String(s).trim() ? esc(String(s).trim()) : '—';
}

/**
 * Chuẩn hóa dữ liệu Job từ backend model sang format template
 */
export function normalizeJobForTemplate(job) {
  const raw = job?.dataValues || job || {};
  const rc = raw.recruitingCompany?.dataValues || raw.recruitingCompany || {};
  const cat = raw.category?.dataValues || raw.category || {};
  const services = (rc.services || []).map(s => s.serviceName || s).filter(Boolean);
  const sectors = (rc.businessSectors || []).map(bs => bs.sectorName || bs).filter(Boolean);
  const recruitmentMap = { 1: 'Nhân viên chính thức', 2: 'Nhân viên chính thức (công ty haken)', 3: 'Nhân viên haken', 4: 'Nhân viên hợp đồng' };

  const salaryYear = (raw.salaryRanges || []).find(sr => (sr.type || '').toLowerCase().includes('year') || (sr.type || '').toLowerCase().includes('năm'));
  const salaryMonth = (raw.salaryRanges || []).find(sr => (sr.type || '').toLowerCase().includes('month') || (sr.type || '').toLowerCase().includes('tháng'));
  const expJv = (raw.jobValues || []).find(jv => (jv.type?.cvField || '').includes('experienceYears'));
  const expNg = (raw.jobValues || []).find(jv => (jv.type?.cvField || '').toLowerCase().includes('industry') || (jv.type?.name || '').toLowerCase().includes('ngành'));
  const techReqs = (raw.requirements || []).filter(r => r.type === 'technique').map(r => r.content).filter(Boolean);
  const eduReqs = (raw.requirements || []).filter(r => r.type === 'education').map(r => r.content).filter(Boolean);
  const wlList = (raw.workingLocations || []).map(wl => (wl.location || '') + (wl.country ? ' (' + wl.country + ')' : '')).filter(Boolean);

  return {
    companyName: rc.companyName || '',
    title: raw.title || '',
    jobCode: raw.jobCode || '',
    recruitmentType: raw.recruitmentType ? (recruitmentMap[raw.recruitmentType] || raw.recruitmentType) : '',
    categoryName: cat.name || '',
    experiencePosition: expJv?.valueRef?.valuename || expJv?.valueRef?.name || '',
    experienceIndustry: expNg?.valueRef?.valuename || expNg?.valueRef?.name || '',
    numberOfHires: raw.workingLocations?.[0]?.numberOfHires || '',
    highlights: (() => {
      const v = raw.highlights;
      if (Array.isArray(v)) return v.filter(Boolean).map(String);
      if (v && typeof v === 'string') return v.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      return [];
    })(),
    description: raw.description || '',
    instruction: raw.instruction || '',
    requirementTech: techReqs.join('\n') || '',
    requirementEdu: eduReqs.join('\n') || '',
    salaryYear: salaryYear?.salaryRange || '',
    salaryMonth: salaryMonth?.salaryRange || '',
    salaryDetails: (raw.salaryRangeDetails || []).map(srd => srd.content).filter(Boolean).join('\n'),
    bonus: raw.bonus || '',
    salaryReview: raw.salaryReview || '',
    workingLocations: wlList.join(', '),
    workingLocationDetails: (raw.workingLocationDetails || []).map(wld => wld.content).filter(Boolean).join('\n'),
    workingHours: (raw.workingHours || []).map(wh => wh.workingHours).filter(Boolean).join('\n'),
    overtime: raw.overtime || '',
    overtimeDetails: (raw.overtimeAllowanceDetails || []).map(oad => oad.content).filter(Boolean).join('\n') || (raw.overtimeAllowances || []).map(oa => oa.overtimeAllowanceRange).filter(Boolean).join(', '),
    socialInsurance: raw.socialInsurance || '',
    holidays: raw.holidays || '',
    contractPeriod: raw.contractPeriod || '',
    recruitmentProcess: raw.recruitmentProcess || '',
    rcCompanyName: rc.companyName || '',
    rcStockExchange: rc.stockExchangeInfo || '',
    rcServices: services.join(', '),
    rcBusinessSectors: sectors.join(', '),
    rcRevenue: rc.revenue || '',
    rcInvestmentCapital: rc.investmentCapital || '',
    rcNumberOfEmployees: rc.numberOfEmployees || '',
    rcEstablished: rc.establishedDate || '',
    rcHeadquarters: rc.headquarters || '',
    rcIntroduction: rc.companyIntroduction || ''
  };
}

const labelStyle = 'padding:6px 8px;font-size:11px;font-weight:500;color:white;background:#6b7280;border:1px solid #e5e7eb;width:140px;box-sizing:border-box;word-wrap:break-word';
const cellStyle = 'padding:6px 8px;font-size:11px;color:#111827;background:white;border:1px solid #e5e7eb;box-sizing:border-box;word-wrap:break-word;overflow-wrap:break-word;word-break:break-word';

function row(label, value) {
  return `<tr><td style="${labelStyle}">${esc(label)}</td><td style="${cellStyle}">${orDash(value)}</td></tr>`;
}

function rowDouble(label1, value1, label2, value2) {
  return row(label1, value1) + row(label2, value2);
}

function sectionFull(label, content) {
  return `<tr><td colspan="2" style="padding:0;border:1px solid #e5e7eb;box-sizing:border-box"><div style="padding:6px 8px;font-size:11px;font-weight:500;color:white;background:#6b7280">${esc(label)}</div><div style="padding:8px;font-size:11px;color:#111827;background:white;border:1px solid #e5e7eb;border-top:none;min-height:40px;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;word-break:break-word;box-sizing:border-box">${orDash(content)}</div></td></tr>`;
}

/**
 * Tạo HTML đầy đủ cho JD template PDF
 */
export function generateJdTemplateHtml(job) {
  const d = normalizeJobForTemplate(job);
  const highlightsHtml = d.highlights.length ? d.highlights.map(h => `<span style="display:inline-block;padding:4px 8px;margin:2px;border:1px solid #d1d5db;border-radius:4px;font-size:10px;background:#e5e7eb">${esc(h)}</span>`).join('') : '—';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;font-size:11px;color:#111827;margin:0;padding:12px;line-height:1.4}
.jd-wrap{max-width:100%;overflow:hidden}
table{border-collapse:collapse;table-layout:fixed;width:100%;max-width:100%}
table td{vertical-align:top}
</style></head><body>
<div class="jd-wrap" style="border:1px solid #e5e7eb;border-radius:4px;overflow:hidden">
  <div style="padding:8px 12px;font-weight:bold;font-size:13px;background:#f9fafb;border-bottom:1px solid #e5e7eb">THÔNG TIN TUYỂN DỤNG</div>
  <table>
    <colgroup><col style="width:140px"/><col/></colgroup>
    ${row('Tên công ty', d.companyName)}
    ${row('Tiêu đề việc làm', d.title)}
    ${row('Mã tin tuyển dụng', d.jobCode)}
    ${row('Hình thức tuyển dụng', d.recruitmentType)}
    ${row('Lĩnh vực', d.categoryName)}
    ${row('Loại công việc', d.categoryName)}
    ${row('Số năm kinh nghiệm theo vị trí', d.experiencePosition)}
    ${row('Số năm kinh nghiệm theo ngành', d.experienceIndustry)}
    ${row('Số lượng tuyển dụng', d.numberOfHires)}
    <tr><td style="${labelStyle}">Điểm nổi bật</td><td style="${cellStyle}">${highlightsHtml}</td></tr>
    ${sectionFull('Mô tả công việc', d.description)}
    ${sectionFull('Lý do tuyển dụng', d.instruction)}
    ${sectionFull('Điều kiện ứng tuyển bắt buộc', d.requirementTech)}
    ${sectionFull('Điều kiện ưu tiên', d.requirementEdu)}
    ${row('Thu nhập năm', d.salaryYear)}
    ${row('Lương tháng', d.salaryMonth)}
    ${sectionFull('Chi tiết về thu nhập', d.salaryDetails)}
    ${sectionFull('Thưởng', d.bonus)}
    ${sectionFull('Tăng lương', d.salaryReview)}
    ${rowDouble('Khả năng chuyển vùng', '', 'Địa điểm làm việc', d.workingLocations)}
    ${sectionFull('Chi tiết về địa điểm làm việc', d.workingLocationDetails)}
    ${sectionFull('Thời gian làm việc', d.workingHours)}
    ${row('Tổng số giờ làm thêm/tháng', d.overtime)}
    ${sectionFull('Chi tiết về làm thêm', d.overtimeDetails)}
    ${sectionFull('Chế độ phúc lợi', d.socialInsurance)}
    ${row('Ngày nghỉ', d.holidays)}
    ${sectionFull('Chi tiết về ngày nghỉ', '')}
    ${row('Thử việc', d.contractPeriod)}
    ${sectionFull('Chi tiết về thử việc', '')}
    ${sectionFull('Quy trình tuyển dụng', d.recruitmentProcess)}
    <tr><td colspan="2" style="padding:8px;font-weight:bold;font-size:12px;color:white;background:#4b5563;border:1px solid #e5e7eb">THÔNG TIN VỀ CÔNG TY</td></tr>
    ${row('Tên công ty', d.rcCompanyName)}
    ${row('Thông tin trên sàn chứng khoán', d.rcStockExchange)}
    ${row('Các dịch vụ cung cấp', d.rcServices)}
    ${row('Phân loại lĩnh vực kinh doanh', d.rcBusinessSectors)}
    ${row('Doanh thu', d.rcRevenue)}
    ${row('Vốn đầu tư', d.rcInvestmentCapital)}
    ${row('Số nhân viên', d.rcNumberOfEmployees)}
    ${row('Thành lập', d.rcEstablished)}
    ${row('Trụ sở tại', d.rcHeadquarters)}
    ${sectionFull('Giới thiệu chung về công ty', d.rcIntroduction)}
  </table>
</div>
</body></html>`;
}
