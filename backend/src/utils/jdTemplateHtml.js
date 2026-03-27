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

const HIGHLIGHT_LABELS_VI = {
  interview_guaranteed: 'Có điều kiện đảm bảo phỏng vấn',
  one_round_interview: 'Chỉ 1 vòng phỏng vấn',
  urgent_hiring: 'Tuyển gấp',
  online_interview: 'Phỏng vấn online (Web)',
  no_aptitude_test: 'Không có bài test năng lực',
  weekend_off: 'Nghỉ thứ 7 và Chủ nhật',
  shift_work: 'Làm việc theo ca',
  remote_possible: 'Có thể làm remote',
  full_remote: 'Full-remote',
  flex_time: 'Giờ làm việc linh hoạt',
  overtime_negotiable: 'Cho phép thương lượng làm thêm / nghỉ phép',
  no_overtime: 'Không làm thêm giờ',
  overtime_under_10h: 'Làm thêm không quá 10 giờ mỗi tháng',
  overtime_under_20h: 'Làm thêm không quá 20 giờ mỗi tháng',
  housing_support: 'Có nhà ở công ty / trợ cấp tiền thuê nhà',
  maternity_childcare_leave: 'Có thực tế nghỉ thai sản / nghỉ chăm con',
  foreigners_hired: 'Có thành tích tuyển dụng người nước ngoài',
  use_english: 'Có thể sử dụng tiếng Anh trong công việc',
  use_chinese: 'Có thể sử dụng tiếng Trung trong công việc',
  use_other_language: 'Có thể sử dụng ngoại ngữ khác trong công việc',
};

const HIGHLIGHT_LABELS_EN = {
  interview_guaranteed: 'Interview guaranteed',
  one_round_interview: 'One-round interview',
  urgent_hiring: 'Urgent hiring',
  online_interview: 'Online interview (Web)',
  no_aptitude_test: 'No aptitude test',
  weekend_off: 'Weekends off',
  shift_work: 'Shift work',
  remote_possible: 'Remote possible',
  full_remote: 'Full remote',
  flex_time: 'Flexible hours',
  overtime_negotiable: 'Overtime / leave negotiable',
  no_overtime: 'No overtime',
  overtime_under_10h: 'Overtime under 10h/month',
  overtime_under_20h: 'Overtime under 20h/month',
  housing_support: 'Housing support / rent allowance',
  maternity_childcare_leave: 'Maternity / childcare leave',
  foreigners_hired: 'Track record hiring foreigners',
  use_english: 'English used at work',
  use_chinese: 'Chinese used at work',
  use_other_language: 'Other languages used at work',
};

const HIGHLIGHT_LABELS_JP = {
  interview_guaranteed: '面接確約あり',
  one_round_interview: '面接1回',
  urgent_hiring: '急募',
  online_interview: 'オンライン面接',
  no_aptitude_test: '適性試験なし',
  weekend_off: '土日休み',
  shift_work: 'シフト制',
  remote_possible: 'リモート可',
  full_remote: 'フルリモート',
  flex_time: 'フレックスタイム',
  overtime_negotiable: '残業・休暇相談可',
  no_overtime: '残業なし',
  overtime_under_10h: '残業月10時間以内',
  overtime_under_20h: '残業月20時間以内',
  housing_support: '社宅・住宅手当',
  maternity_childcare_leave: '産休・育休実績',
  foreigners_hired: '外国人採用実績',
  use_english: '英語使用',
  use_chinese: '中国語使用',
  use_other_language: 'その他外国語使用',
};

const HIGHLIGHT_LABELS = { vi: HIGHLIGHT_LABELS_VI, en: HIGHLIGHT_LABELS_EN, jp: HIGHLIGHT_LABELS_JP };

/** Recruitment type labels by lang (1-4) */
const RECRUITMENT_MAP = {
  vi: { 1: 'Nhân viên chính thức', 2: 'Nhân viên chính thức (công ty haken)', 3: 'Nhân viên haken', 4: 'Nhân viên hợp đồng' },
  en: { 1: 'Regular employee', 2: 'Regular employee (haken company)', 3: 'Seconded employee', 4: 'Contract employee' },
  jp: { 1: '正社員', 2: '正社員（ハケン会社）', 3: '出向社員', 4: '契約社員' },
};

/** Lĩnh vực (business sector) options – label by lang for JD template */
const BUSINESS_SECTOR_OPTIONS = [
  { key: 'telecom_internet', vi: 'Viễn thông – Internet', en: 'Telecommunications & Internet', ja: '通信・インターネット' },
  { key: 'it', vi: 'Công nghệ thông tin (IT)', en: 'Information Technology (IT)', ja: 'IT（情報技術）' },
  { key: 'hr_services', vi: 'Nhân sự – Dịch vụ giới thiệu nhân sự nhân lực', en: 'Human Resources & Staffing Services', ja: '人事・人材紹介サービス' },
  { key: 'advertising_media', vi: 'Quảng cáo – Truyền thông – Phát thanh truyền hình', en: 'Advertising, Media & Broadcasting', ja: '広告・メディア・放送' },
  { key: 'retail_wholesale', vi: 'Bán lẻ – Bán buôn', en: 'Retail & Wholesale', ja: '小売・卸売' },
  { key: 'real_estate', vi: 'Bất động sản', en: 'Real Estate', ja: '不動産' },
  { key: 'finance_banking', vi: 'Tài chính – Ngân hàng', en: 'Finance & Banking', ja: '金融・銀行' },
  { key: 'insurance', vi: 'Bảo hiểm', en: 'Insurance', ja: '保険' },
  { key: 'restaurant_food', vi: 'Nhà hàng – Ăn uống', en: 'Restaurant & Food Services', ja: '飲食・レストラン' },
  { key: 'life_services', vi: 'Dịch vụ đời sống (giặt là, vệ sinh, sửa chữa, chăm sóc…)', en: 'Lifestyle Services (laundry, cleaning, repair, care, etc.)', ja: '生活サービス（クリーニング・清掃・修理・ケアなど）' },
  { key: 'education_training', vi: 'Giáo dục – Đào tạo', en: 'Education & Training', ja: '教育・研修' },
  { key: 'manufacturing', vi: 'Sản xuất – Chế tạo', en: 'Manufacturing', ja: '製造' },
  { key: 'management_consulting', vi: 'Quản lý – Tư vấn', en: 'Management & Consulting', ja: 'マネジメント・コンサルティング' },
  { key: 'medical_care', vi: 'Y tế – Chăm sóc sức khỏe', en: 'Medical & Healthcare', ja: '医療・ヘルスケア' },
  { key: 'pharma_biotech', vi: 'Dược phẩm – Công nghệ sinh học', en: 'Pharmaceuticals & Biotechnology', ja: '製薬・バイオテクノロジー' },
  { key: 'logistics_transport', vi: 'Vận tải – Giao thông – Logistics', en: 'Transportation & Logistics', ja: '運輸・交通・ロジスティクス' },
  { key: 'hotel_accommodation', vi: 'Khách sạn – Lưu trú', en: 'Hotels & Accommodation', ja: 'ホテル・宿泊' },
  { key: 'legal', vi: 'Pháp luật – Pháp lý', en: 'Legal', ja: '法律・リーガル' },
  { key: 'energy_resources', vi: 'Khai khoáng – Điện – Gas – Nước – Năng lượng', en: 'Mining, Utilities & Energy', ja: '資源・電力・ガス・水道・エネルギー' },
  { key: 'nonprofit', vi: 'Tổ chức công ích / Phi lợi nhuận', en: 'Public Interest / Non-profit', ja: '公益・非営利団体' },
  { key: 'government_admin', vi: 'Cơ quan nhà nước – Hành chính', en: 'Government & Public Administration', ja: '官公庁・行政' },
  { key: 'construction_maintenance', vi: 'Xây dựng – Sửa chữa – Bảo trì', en: 'Construction, Repair & Maintenance', ja: '建設・修繕・メンテナンス' },
  { key: 'art_entertainment', vi: 'Nghệ thuật – Giải trí – Nghỉ dưỡng', en: 'Arts, Entertainment & Leisure', ja: 'アート・エンタメ・レジャー' },
  { key: 'agriculture_fishery', vi: 'Nông nghiệp – Lâm nghiệp – Thủy sản', en: 'Agriculture, Forestry & Fisheries', ja: '農林水産' },
  { key: 'aerospace_defense', vi: 'Hàng không vũ trụ – Quốc phòng', en: 'Aerospace & Defence', ja: '航空宇宙・防衛' },
];

/** Liên hệ Workstation JobShare - dùng trong header JD PDF */
const HEADER_CONTACT = {
  website: 'ws-jobshare.com',
  hotline: '(+84)972989728',
  mail: 'jobshare@work-station.vn',
};

/** Section & field labels for JD HTML - keys used in template */
const LABELS = {
  vi: {
    headerSlogan: 'Workstation JobShare - Nền tảng chia sẻ thông tin việc làm kỹ sư số 1 Việt Nam',
    headerWebsite: 'Trang web',
    headerHotline: 'Đường dây nóng',
    headerMail: 'Email',
    sectionRecruitment: 'THÔNG TIN TUYỂN DỤNG',
    companyName: 'Tên công ty',
    jobTitle: 'Tiêu đề việc làm',
    jobCode: 'Mã tin tuyển dụng',
    recruitmentForm: 'Hình thức tuyển dụng',
    field: 'Lĩnh vực',
    jobType: 'Loại công việc',
    expPosition: 'Số năm kinh nghiệm theo vị trí',
    expIndustry: 'Số năm kinh nghiệm theo ngành',
    numberOfHires: 'Số lượng tuyển dụng',
    highlights: 'Điểm nổi bật',
    jobDescription: 'Mô tả công việc',
    recruitmentReason: 'Lý do tuyển dụng',
    requiredConditions: 'Điều kiện ứng tuyển bắt buộc',
    preferredConditions: 'Điều kiện ưu tiên',
    annualIncome: 'Thu nhập năm',
    monthlySalary: 'Lương tháng',
    incomeDetails: 'Chi tiết về thu nhập',
    bonus: 'Thưởng',
    salaryReview: 'Tăng lương',
    transferAbility: 'Khả năng chuyển vùng',
    workLocation: 'Địa điểm làm việc',
    workLocationDetails: 'Chi tiết về địa điểm làm việc',
    workingTime: 'Thời gian làm việc',
    overtimeHoursPerMonth: 'Tổng số giờ làm thêm/tháng',
    overtimeDetails: 'Chi tiết về làm thêm',
    benefits: 'Chế độ phúc lợi',
    holidays: 'Ngày nghỉ',
    holidayDetails: 'Chi tiết về ngày nghỉ',
    contractPeriod: 'Thời hạn hợp đồng',
    probation: 'Thử việc',
    probationDetails: 'Chi tiết về thử việc',
    recruitmentProcess: 'Quy trình tuyển dụng',
    sectionCompany: 'THÔNG TIN VỀ CÔNG TY',
    stockExchangeInfo: 'Thông tin trên sàn chứng khoán',
    services: 'Các dịch vụ cung cấp',
    businessSectors: 'Phân loại lĩnh vực kinh doanh',
    revenue: 'Doanh thu',
    investmentCapital: 'Vốn đầu tư',
    numberOfEmployees: 'Số nhân viên',
    established: 'Thành lập',
    headquarters: 'Trụ sở tại',
    companyIntroduction: 'Giới thiệu chung về công ty',
  },
  en: {
    headerSlogan: "Workstation JobShare - Vietnam's #1 platform for sharing engineer job information",
    headerWebsite: 'Website',
    headerHotline: 'Hotline',
    headerMail: 'Mail',
    sectionRecruitment: 'RECRUITMENT INFORMATION',
    companyName: 'Company name',
    jobTitle: 'Job title',
    jobCode: 'Job code',
    recruitmentForm: 'Recruitment type',
    field: 'Field',
    jobType: 'Job type',
    expPosition: 'Years of experience (position)',
    expIndustry: 'Years of experience (industry)',
    numberOfHires: 'Number of hires',
    highlights: 'Highlights',
    jobDescription: 'Job description',
    recruitmentReason: 'Reason for recruitment',
    requiredConditions: 'Required conditions',
    preferredConditions: 'Preferred conditions',
    annualIncome: 'Annual income',
    monthlySalary: 'Monthly salary',
    incomeDetails: 'Income details',
    bonus: 'Bonus',
    salaryReview: 'Salary review',
    transferAbility: 'Transfer ability',
    workLocation: 'Work location',
    workLocationDetails: 'Work location details',
    workingTime: 'Working hours',
    overtimeHoursPerMonth: 'Overtime hours/month',
    overtimeDetails: 'Overtime details',
    benefits: 'Benefits',
    holidays: 'Holidays',
    holidayDetails: 'Holiday details',
    contractPeriod: 'Contract period',
    probation: 'Probation',
    probationDetails: 'Probation details',
    recruitmentProcess: 'Recruitment process',
    sectionCompany: 'COMPANY INFORMATION',
    stockExchangeInfo: 'Stock exchange / Homepage',
    services: 'Services',
    businessSectors: 'Business sectors',
    revenue: 'Revenue',
    investmentCapital: 'Investment capital',
    numberOfEmployees: 'Number of employees',
    established: 'Established',
    headquarters: 'Headquarters',
    companyIntroduction: 'Company introduction',
  },
  jp: {
    headerSlogan: 'Workstation JobShare - ベトナムNo.1エンジニア求人情報共有プラットフォーム',
    headerWebsite: 'ウェブサイト',
    headerHotline: 'ホットライン',
    headerMail: 'メール',
    sectionRecruitment: '募集情報',
    companyName: '会社名',
    jobTitle: '求人タイトル',
    jobCode: '求人コード',
    recruitmentForm: '雇用形態',
    field: '分野',
    jobType: '職種',
    expPosition: '経験年数（職種）',
    expIndustry: '経験年数（業界）',
    numberOfHires: '採用人数',
    highlights: 'アピールポイント',
    jobDescription: '仕事内容',
    recruitmentReason: '募集理由',
    requiredConditions: '必須条件',
    preferredConditions: '歓迎条件',
    annualIncome: '年収',
    monthlySalary: '月給',
    incomeDetails: '収入の詳細',
    bonus: '賞与',
    salaryReview: '昇給',
    transferAbility: '転勤可否',
    workLocation: '勤務地',
    workLocationDetails: '勤務地の詳細',
    workingTime: '勤務時間',
    overtimeHoursPerMonth: '残業時間/月',
    overtimeDetails: '残業の詳細',
    benefits: '福利厚生',
    holidays: '休日',
    holidayDetails: '休日の詳細',
    contractPeriod: '契約期間',
    probation: '試用期間',
    probationDetails: '試用期間の詳細',
    recruitmentProcess: '選考プロセス',
    sectionCompany: '会社情報',
    stockExchangeInfo: 'ホームページ',
    services: '提供サービス',
    businessSectors: '事業分野',
    revenue: '売上',
    investmentCapital: '投資資本',
    numberOfEmployees: '従業員数',
    established: '設立',
    headquarters: '本社',
    companyIntroduction: '会社紹介',
  },
};

function pickByLang(obj, lang, keyVi, keyEn = null, keyJp = null) {
  const en = keyEn || (keyVi ? `${keyVi}En` : null);
  const jp = keyJp || (keyVi ? `${keyVi}Jp` : null);
  if (!obj) return '';
  const raw = obj.dataValues || obj;
  if (lang === 'en' && en && (raw[en] != null && raw[en] !== '')) return raw[en];
  if (lang === 'jp' && jp && (raw[jp] != null && raw[jp] !== '')) return raw[jp];
  return raw[keyVi] != null ? raw[keyVi] : (lang === 'en' && raw[en] != null ? raw[en] : raw[jp] != null ? raw[jp] : '');
}

/**
 * Chuẩn hóa dữ liệu Job từ backend model sang format template theo ngôn ngữ
 * @param {Object} job - Job model (có thể có dataValues)
 * @param {string} [lang='vi'] - 'vi' | 'en' | 'jp'
 */
export function normalizeJobForTemplate(job, lang = 'vi') {
  const raw = job?.dataValues || job || {};
  const rc = raw.recruitingCompany?.dataValues || raw.recruitingCompany || {};
  const cat = raw.category?.dataValues || raw.category || {};
  const services = (rc.services || []).map(s => s.serviceName || s).filter(Boolean);
  const sectors = (rc.businessSectors || []).map(bs => bs.sectorName || bs).filter(Boolean);
  const recruitmentMap = RECRUITMENT_MAP[lang] || RECRUITMENT_MAP.vi;

  const salaryYear = (raw.salaryRanges || []).find(sr => (sr.type || '').toLowerCase().includes('year') || (sr.type || '').toLowerCase().includes('năm'));
  const salaryMonth = (raw.salaryRanges || []).find(sr => (sr.type || '').toLowerCase().includes('month') || (sr.type || '').toLowerCase().includes('tháng'));
  const expJv = (raw.jobValues || []).find(jv => (jv.type?.cvField || '').includes('experienceYears'));
  const expNg = (raw.jobValues || []).find(jv => (jv.type?.cvField || '').toLowerCase().includes('industry') || (jv.type?.name || '').toLowerCase().includes('ngành'));

  const contentKey = lang === 'vi' ? 'content' : lang === 'en' ? 'contentEn' : 'contentJp';
  const techReqs = (raw.requirements || []).filter(r => r.type === 'technique').map(r => r[contentKey] ?? r.content ?? '').filter(Boolean);
  const eduReqs = (raw.requirements || []).filter(r => r.type === 'education').map(r => r[contentKey] ?? r.content ?? '').filter(Boolean);

  const wlList = (raw.workingLocations || []).map(wl => {
    const loc = (wl.location || '').trim();
    const country = (wl.country || '').trim();
    if (lang === 'jp' && String(country).toLowerCase() === 'japan' && (wl.locationJp || wl.location_jp)) return (wl.locationJp || wl.location_jp || loc) + (country ? ' (' + country + ')' : '');
    return loc + (country ? ' (' + country + ')' : '');
  }).filter(Boolean);

  const highlightLabels = HIGHLIGHT_LABELS[lang] || HIGHLIGHT_LABELS_VI;
  const parseHighlights = (v) => {
    if (Array.isArray(v)) {
      return v.map((item) => {
        if (!item) return '';
        const key = String(item).trim();
        return highlightLabels[key] || key;
      }).filter(Boolean);
    }
    if (v && typeof v === 'string') {
      const trimmed = v.trim();
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.map((key) => {
              if (key == null) return '';
              const k = String(key).trim();
              return highlightLabels[k] || k;
            }).filter(Boolean);
          }
        } catch {
          // fallback
        }
      }
      return trimmed.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const detailContentKey = lang === 'vi' ? 'content' : lang === 'en' ? 'contentEn' : 'contentJp';
  const salaryDetailsList = (raw.salaryRangeDetails || []).map(srd => srd[detailContentKey] ?? srd.content ?? '').filter(Boolean);
  const wlDetailsList = (raw.workingLocationDetails || []).map(wld => wld[detailContentKey] ?? wld.content ?? '').filter(Boolean);
  const overtimeDetailsList = (raw.overtimeAllowanceDetails || []).map(oad => oad[detailContentKey] ?? oad.content ?? '').filter(Boolean);

  const whKey = lang === 'vi' ? 'workingHours' : lang === 'en' ? 'workingHoursEn' : 'workingHoursJp';
  const workingHoursList = (raw.workingHours || []).map(wh => {
    const v = wh[whKey] ?? wh.workingHours ?? '';
    return v != null && v !== '' ? String(v).trim() : '';
  }).filter(Boolean);
  const workingHourDetailsList = (raw.workingHourDetails || []).map(whd => whd[detailContentKey] ?? whd.content ?? '').filter(Boolean);
  const workingTimeDisplay = workingHourDetailsList.length > 0
    ? workingHourDetailsList.join('\n')
    : workingHoursList.join('\n');

  const rcHeadquarters = lang === 'vi' ? (rc.headquarters ?? '') : lang === 'en' ? (rc.headquartersEn ?? rc.headquarters ?? '') : (rc.headquartersJp ?? rc.headquarters ?? '');
  const rcIntroduction = lang === 'vi' ? (rc.companyIntroduction ?? '') : lang === 'en' ? (rc.companyIntroductionEn ?? rc.companyIntroduction ?? '') : (rc.companyIntroductionJp ?? rc.companyIntroduction ?? '');

  return {
    companyName: rc.companyName || '',
    title: pickByLang(raw, lang, 'title', 'titleEn', 'titleJp'),
    jobCode: raw.jobCode || '',
    recruitmentType: raw.recruitmentType ? (recruitmentMap[raw.recruitmentType] || raw.recruitmentType) : '',
    fieldLabel: (() => {
      const key = (raw.businessSectorKey || '').trim();
      if (!key) return '';
      const opt = BUSINESS_SECTOR_OPTIONS.find((o) => (o.key || o.vi) === key);
      if (!opt) return key;
      return lang === 'en' ? (opt.en || opt.vi) : lang === 'jp' ? (opt.ja || opt.vi) : opt.vi;
    })(),
    categoryName: pickByLang(cat, lang, 'name', 'nameEn', 'nameJp'),
    experiencePosition: expJv?.valueRef?.valuename || expJv?.valueRef?.name || '',
    experienceIndustry: expNg?.valueRef?.valuename || expNg?.valueRef?.name || '',
    numberOfHires: raw.workingLocations?.[0]?.numberOfHires || '',
    highlights: parseHighlights(raw.highlights),
    description: pickByLang(raw, lang, 'description', 'descriptionEn', 'descriptionJp'),
    instruction: pickByLang(raw, lang, 'instruction', 'instructionEn', 'instructionJp'),
    requirementTech: techReqs.join('\n') || '',
    requirementEdu: eduReqs.join('\n') || '',
    salaryYear: salaryYear?.salaryRange || '',
    salaryMonth: salaryMonth?.salaryRange || '',
    salaryDetails: salaryDetailsList.join('\n'),
    bonus: pickByLang(raw, lang, 'bonus', 'bonusEn', 'bonusJp'),
    salaryReview: pickByLang(raw, lang, 'salaryReview', 'salaryReviewEn', 'salaryReviewJp'),
    workingLocations: wlList.join(', '),
    workingLocationDetails: wlDetailsList.join('\n'),
    workingHours: workingTimeDisplay,
    overtime: pickByLang(raw, lang, 'overtime', 'overtimeEn', 'overtimeJp'),
    overtimeDetails: overtimeDetailsList.join('\n') || (raw.overtimeAllowances || []).map(oa => oa.overtimeAllowanceRange).filter(Boolean).join(', '),
    socialInsurance: pickByLang(raw, lang, 'socialInsurance', 'socialInsuranceEn', 'socialInsuranceJp'),
    holidays: pickByLang(raw, lang, 'holidays', 'holidaysEn', 'holidaysJp'),
    contractPeriod: pickByLang(raw, lang, 'contractPeriod', 'contractPeriodEn', 'contractPeriodJp'),
    probationPeriod: pickByLang(raw, lang, 'probationPeriod', 'probationPeriodEn', 'probationPeriodJp'),
    probationDetail: pickByLang(raw, lang, 'probationDetail', 'probationDetailEn', 'probationDetailJp'),
    recruitmentProcess: pickByLang(raw, lang, 'recruitmentProcess', 'recruitmentProcessEn', 'recruitmentProcessJp'),
    transferAbility: pickByLang(raw, lang, 'transferAbility', 'transferAbilityEn', 'transferAbilityJp'),
    rcCompanyName: rc.companyName || '',
    rcStockExchange: rc.stockExchangeInfo || '',
    rcServices: services.join(', '),
    rcBusinessSectors: sectors.join(', '),
    rcRevenue: rc.revenue || '',
    rcInvestmentCapital: rc.investmentCapital || '',
    rcNumberOfEmployees: rc.numberOfEmployees || '',
    rcEstablished: rc.establishedDate || '',
    rcHeadquarters: rcHeadquarters,
    rcIntroduction: rcIntroduction,
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
 * Tạo HTML đầy đủ cho JD template PDF theo ngôn ngữ
 * @param {Object} job - Job model (đã include recruitingCompany, category, requirements, ...)
 * @param {string} [lang='vi'] - 'vi' | 'en' | 'jp'
 */
export function generateJdTemplateHtml(job, lang = 'vi') {
  const L = LABELS[lang] || LABELS.vi;
  const d = normalizeJobForTemplate(job, lang);
  const highlightsHtml = d.highlights.length ? d.highlights.map(h => `<span style="display:inline-block;padding:4px 8px;margin:2px;border:1px solid #d1d5db;border-radius:4px;font-size:10px;background:#e5e7eb">${esc(h)}</span>`).join('') : '—';

  const headerHtml = `<div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;flex-wrap:wrap">
  <div style="margin-left:auto;flex-shrink:0;text-align:right;font-size:10px;color:#374151">
    <div style="font-weight:600;margin-bottom:4px">${esc(L.headerSlogan)}</div>
    <div>${esc(L.headerWebsite)}: ${esc(HEADER_CONTACT.website)}</div>
    <div>${esc(L.headerHotline)}: ${esc(HEADER_CONTACT.hotline)}</div>
    <div>${esc(L.headerMail)}: ${esc(HEADER_CONTACT.mail)}</div>
  </div>
</div>`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;font-size:11px;color:#111827;margin:0;padding:12px;line-height:1.4}
.jd-wrap{max-width:100%;overflow:hidden}
table{border-collapse:collapse;table-layout:fixed;width:100%;max-width:100%}
table td{vertical-align:top}
</style></head><body>
<div class="jd-wrap" style="border:1px solid #e5e7eb;border-radius:4px;overflow:hidden">
  ${headerHtml}
  <div style="padding:8px 12px;font-weight:bold;font-size:13px;background:#f9fafb;border-bottom:1px solid #e5e7eb">${esc(L.sectionRecruitment)}</div>
  <table>
    <colgroup><col style="width:140px"/><col/></colgroup>
    ${row(L.companyName, d.companyName)}
    ${row(L.jobTitle, d.title)}
    ${row(L.jobCode, d.jobCode)}
    ${row(L.recruitmentForm, d.recruitmentType)}
    ${row(L.field, d.fieldLabel)}
    ${row(L.jobType, d.categoryName)}
    ${row(L.expPosition, d.experiencePosition)}
    ${row(L.expIndustry, d.experienceIndustry)}
    ${row(L.numberOfHires, d.numberOfHires)}
    <tr><td style="${labelStyle}">${esc(L.highlights)}</td><td style="${cellStyle}">${highlightsHtml}</td></tr>
    ${sectionFull(L.jobDescription, d.description)}
    ${sectionFull(L.recruitmentReason, d.instruction)}
    ${sectionFull(L.requiredConditions, d.requirementTech)}
    ${sectionFull(L.preferredConditions, d.requirementEdu)}
    ${row(L.annualIncome, d.salaryYear)}
    ${row(L.monthlySalary, d.salaryMonth)}
    ${sectionFull(L.incomeDetails, d.salaryDetails)}
    ${sectionFull(L.bonus, d.bonus)}
    ${sectionFull(L.salaryReview, d.salaryReview)}
    ${rowDouble(L.transferAbility, d.transferAbility, L.workLocation, d.workingLocations)}
    ${sectionFull(L.workLocationDetails, d.workingLocationDetails)}
    ${sectionFull(L.workingTime, d.workingHours)}
    ${row(L.overtimeHoursPerMonth, d.overtime)}
    ${sectionFull(L.overtimeDetails, d.overtimeDetails)}
    ${sectionFull(L.benefits, d.socialInsurance)}
    ${row(L.holidays, d.holidays)}
    ${sectionFull(L.holidayDetails, '')}
    ${row(L.contractPeriod, d.contractPeriod)}
    ${row(L.probation, d.probationPeriod)}
    ${sectionFull(L.probationDetails, d.probationDetail)}
    ${sectionFull(L.recruitmentProcess, d.recruitmentProcess)}
    <tr><td colspan="2" style="padding:8px;font-weight:bold;font-size:12px;color:white;background:#4b5563;border:1px solid #e5e7eb">${esc(L.sectionCompany)}</td></tr>
    ${row(L.companyName, d.rcCompanyName)}
    ${row(L.stockExchangeInfo, d.rcStockExchange)}
    ${row(L.services, d.rcServices)}
    ${row(L.businessSectors, d.rcBusinessSectors)}
    ${row(L.revenue, d.rcRevenue)}
    ${row(L.investmentCapital, d.rcInvestmentCapital)}
    ${row(L.numberOfEmployees, d.rcNumberOfEmployees)}
    ${row(L.established, d.rcEstablished)}
    ${row(L.headquarters, d.rcHeadquarters)}
    ${sectionFull(L.companyIntroduction, d.rcIntroduction)}
  </table>
</div>
</body></html>`;
}
