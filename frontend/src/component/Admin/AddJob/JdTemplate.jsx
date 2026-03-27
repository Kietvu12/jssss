import React from 'react';
import { JOB_HIGHLIGHT_OPTIONS } from '../../../utils/jobHighlightOptions';
import { BUSINESS_SECTOR_OPTIONS } from '../../../utils/businessSectorOptions';
import logoImage from '../../../assets/logo.png';

/** Liên hệ Workstation JobShare - giá trị cố định */
const HEADER_CONTACT = {
  website: 'ws-jobshare.com',
  hotline: '(+84)972989728',
  mail: 'jobshare@work-station.vn',
};

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
    residenceStatus: 'Tư cách lưu trú',
    field: 'Lĩnh vực',
    jobType: 'Loại công việc',
    expYears: 'Số năm kinh nghiệm',
    numberOfHires: 'Số lượng tuyển dụng',
    highlights: 'Điểm nổi bật',
    highlightsPlaceholder: 'Nhập điểm nổi bật (mỗi dòng một ý)',
    jobDescription: 'Mô tả công việc',
    jobDescriptionPlaceholder: 'Điền mô tả công việc cụ thể',
    recruitmentReason: 'Lý do tuyển dụng',
    recruitmentReasonPlaceholder: 'Điền lý do công ty cần tuyển (nếu có)',
    requiredConditions: 'Điều kiện ứng tuyển bắt buộc',
    requiredConditionsPlaceholder: 'Điền điều kiện must của công việc này',
    preferredConditions: 'Điều kiện ưu tiên',
    preferredConditionsPlaceholder: 'Điền điều kiện ưu tiên (nếu có)',
    annualIncome: 'Thu nhập năm',
    monthlySalary: 'Lương tháng',
    incomeDetails: 'Chi tiết về thu nhập',
    incomeDetailsPlaceholder: 'Điền chi tiết',
    bonus: 'Thưởng',
    salaryReview: 'Tăng lương',
    transferAbility: 'Khả năng chuyển vùng',
    workLocation: 'Địa điểm làm việc',
    workLocationDetails: 'Chi tiết về địa điểm làm việc',
    workingTime: 'Thời gian làm việc',
    overtimeHoursPerMonth: 'Tổng số giờ làm thêm/tháng',
    overtimeDetails: 'Chi tiết về làm thêm',
    benefits: 'Chế độ phúc lợi',
    benefitsPlaceholder: 'VD: Bảo hiểm xã hội, phụ cấp đi lại, ...',
    holidays: 'Ngày nghỉ',
    holidayDetails: 'Chi tiết về ngày nghỉ',
    holidayDetailsPlaceholder: 'Điền chi tiết',
    probation: 'Thử việc',
    probationDetails: 'Chi tiết về thử việc',
    recruitmentProcess: 'Quy trình tuyển dụng',
    sectionCompany: 'THÔNG TIN VỀ CÔNG TY',
    stockExchangeInfo: 'Homepage',
    services: 'Các dịch vụ cung cấp',
    businessSectors: 'Phân loại lĩnh vực kinh doanh',
    revenue: 'Doanh thu',
    investmentCapital: 'Vốn đầu tư',
    numberOfEmployees: 'Số nhân viên',
    established: 'Thành lập',
    headquarters: 'Trụ sở tại',
    companyIntroduction: 'Giới thiệu chung về công ty',
    recruitmentType1: 'Nhân viên chính thức',
    recruitmentType2: 'Nhân viên hợp đồng có thời hạn',
    recruitmentType3: 'Nhân viên phái cử',
    recruitmentType4: 'Nhân viên bán thời gian',
    recruitmentType5: 'Hợp đồng uỷ thác',
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
    residenceStatus: 'Residence status',
    field: 'Field',
    jobType: 'Job type',
    expYears: 'Years of experience',
    numberOfHires: 'Number of hires',
    highlights: 'Highlights',
    highlightsPlaceholder: 'Enter highlights (one per line)',
    jobDescription: 'Job description',
    jobDescriptionPlaceholder: 'Enter job description',
    recruitmentReason: 'Reason for recruitment',
    recruitmentReasonPlaceholder: 'Reason company is hiring (if any)',
    requiredConditions: 'Required conditions',
    requiredConditionsPlaceholder: 'Required conditions for this job',
    preferredConditions: 'Preferred conditions',
    preferredConditionsPlaceholder: 'Preferred conditions (if any)',
    annualIncome: 'Annual income',
    monthlySalary: 'Monthly salary',
    incomeDetails: 'Income details',
    incomeDetailsPlaceholder: 'Enter details',
    bonus: 'Bonus',
    salaryReview: 'Salary review',
    transferAbility: 'Transfer ability',
    workLocation: 'Work location',
    workLocationDetails: 'Work location details',
    workingTime: 'Working hours',
    overtimeHoursPerMonth: 'Overtime hours/month',
    overtimeDetails: 'Overtime details',
    benefits: 'Benefits',
    benefitsPlaceholder: 'E.g. Social insurance, transportation allowance, ...',
    holidays: 'Holidays',
    holidayDetails: 'Holiday details',
    holidayDetailsPlaceholder: 'Enter details',
    probation: 'Probation',
    probationDetails: 'Probation details',
    recruitmentProcess: 'Recruitment process',
    sectionCompany: 'COMPANY INFORMATION',
    stockExchangeInfo: 'Homepage',
    services: 'Services',
    businessSectors: 'Business sectors',
    revenue: 'Revenue',
    investmentCapital: 'Investment capital',
    numberOfEmployees: 'Number of employees',
    established: 'Established',
    headquarters: 'Headquarters',
    companyIntroduction: 'Company introduction',
    recruitmentType1: 'Regular employee',
    recruitmentType2: 'Fixed-term contract employee',
    recruitmentType3: 'Seconded employee',
    recruitmentType4: 'Part-time employee',
    recruitmentType5: 'Outsourcing contract',
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
    residenceStatus: '在留資格',
    field: '分野',
    jobType: '職種',
    expYears: '経験年数',
    numberOfHires: '採用人数',
    highlights: 'アピールポイント',
    highlightsPlaceholder: 'アピールポイントを入力（1行1項目）',
    jobDescription: '仕事内容',
    jobDescriptionPlaceholder: '仕事内容を入力',
    recruitmentReason: '募集理由',
    recruitmentReasonPlaceholder: '募集理由（あれば）',
    requiredConditions: '必須条件',
    requiredConditionsPlaceholder: '必須条件を入力',
    preferredConditions: '歓迎条件',
    preferredConditionsPlaceholder: '歓迎条件（あれば）',
    annualIncome: '年収',
    monthlySalary: '月給',
    incomeDetails: '収入の詳細',
    incomeDetailsPlaceholder: '詳細を入力',
    bonus: '賞与',
    salaryReview: '昇給',
    transferAbility: '転勤可否',
    workLocation: '勤務地',
    workLocationDetails: '勤務地の詳細',
    workingTime: '勤務時間',
    overtimeHoursPerMonth: '残業時間/月',
    overtimeDetails: '残業の詳細',
    benefits: '福利厚生',
    benefitsPlaceholder: '例：社会保険、通勤手当など',
    holidays: '休日',
    holidayDetails: '休日の詳細',
    holidayDetailsPlaceholder: '詳細を入力',
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
    recruitmentType1: '正社員',
    recruitmentType2: '有期契約社員',
    recruitmentType3: '出向社員',
    recruitmentType4: 'パートタイム',
    recruitmentType5: '業務委託',
  },
};

export default function JdTemplate({
  lang = 'vi',
  formData,
  setFormData,
  recruitingCompany,
  setRecruitingCompany,
  categories,
  jobValues,
  workingLocations,
  setWorkingLocations,
  salaryRanges,
  setSalaryRanges,
  salaryRangeDetails,
  setSalaryRangeDetails,
  workingLocationDetails,
  setWorkingLocationDetails,
  overtimeAllowances,
  overtimeAllowanceDetails,
  setOvertimeAllowanceDetails,
  requirements,
  setRequirements,
  workingHours,
  workingHourDetails,
  setWorkingHourDetails,
}) {
  const suffix = lang === 'vi' ? '' : lang === 'en' ? 'En' : 'Jp';
  const contentKey = lang === 'vi' ? 'content' : lang === 'en' ? 'contentEn' : 'contentJp';
  const L = LABELS[lang] || LABELS.vi;

  const countryLabelByLang = (countryRaw) => {
    const c = String(countryRaw ?? '').trim();
    if (!c) return '';
    const norm = c.toLowerCase();
    if (norm === 'japan' || c === '日本' || c === 'Nhật Bản') return lang === 'jp' ? '日本' : lang === 'en' ? 'Japan' : 'Nhật Bản';
    if (norm === 'vietnam' || c === 'ベトナム' || c === 'Việt Nam') return lang === 'jp' ? 'ベトナム' : lang === 'en' ? 'Vietnam' : 'Việt Nam';
    return c;
  };

  const locationLabelByLang = (wl) => {
    if (!wl) return '';
    // Japan location can be stored as { location: alpha, locationJp: ja } from AddJobPage.
    if (String(wl.country ?? '').trim().toLowerCase() === 'japan' && lang === 'jp') return String(wl.locationJp ?? wl.location ?? '').trim();
    return String(wl.location ?? '').trim();
  };

  const getFormKey = (field) => {
    const noSuffix = ['jobCode', 'slug', 'status', 'categoryId', 'companyId', 'interviewLocation', 'deadline', 'recruitmentType', 'jobCommissionType', 'isPinned', 'isHot', 'holidays', 'highlights'];
    if (noSuffix.includes(field)) return field;
    return field + suffix;
  };

  const getBusinessSectorLabelFromKey = () => {
    const key = formData.businessSectorKey;
    if (!key) return '';
    const opt = BUSINESS_SECTOR_OPTIONS.find((o) => (o.key || o.vi) === key);
    if (!opt) return '';
    if (lang === 'en') return opt.en || opt.vi;
    if (lang === 'jp') return opt.ja || opt.vi;
    return opt.vi;
  };

  const jdEditable = (field, className = '', style = {}, placeholder = '') => {
    const key = getFormKey(field);
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: (e) => {
        const v = (e.currentTarget.textContent || '').trim();
        setFormData((prev) => ({ ...prev, [key]: v || '' }));
      },
      className: className || 'outline-none min-h-[1.2em] block',
      style: { outline: 'none', minHeight: '1.2em', ...style },
      children: String(formData[key] ?? '').trim() || placeholder,
    };
  };

  const getRecruitingKey = (field) => {
    if (field === 'headquarters' && (lang === 'en' || lang === 'jp')) return field + (lang === 'en' ? 'En' : 'Jp');
    if (field === 'companyIntroduction' && (lang === 'en' || lang === 'jp')) return field + (lang === 'en' ? 'En' : 'Jp');
    return field;
  };

  const jdRecruitingEditable = (field, className = '', style = {}, placeholder = '') => {
    const key = getRecruitingKey(field);
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: (e) => {
        const v = (e.currentTarget.textContent || '').trim();
        setRecruitingCompany((prev) => ({ ...prev, [key]: v || '' }));
      },
      className: className || 'outline-none min-h-[1.2em] block',
      style: { outline: 'none', minHeight: '1.2em', ...style },
      children: String(recruitingCompany[key] ?? '').trim() || placeholder,
    };
  };

  /** Dùng cho các ô contentEditable không qua jdEditable/jdRecruitingEditable. */
  const customEditable = (customKey, children, onBlur, className = '', style = {}) => {
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: (e) => {
        onBlur(e);
      },
      className: className || 'outline-none block',
      style: { outline: 'none', minHeight: '1.2em', ...style },
      children,
    };
  };

  const recruitmentTypeMap = {
    1: L.recruitmentType1,
    2: L.recruitmentType2,
    3: L.recruitmentType3,
    4: L.recruitmentType4,
    5: L.recruitmentType5,
  };

  const recruitmentTypeLabel = formData.recruitmentType ? (recruitmentTypeMap[formData.recruitmentType] || formData.recruitmentType) : null;
  const categoryName = (() => {
    const c = formData.categoryId ? categories.find((cat) => cat.id === parseInt(formData.categoryId)) : null;
    if (!c) return null;
    return lang === 'en' ? (c.nameEn || c.name || '') : lang === 'jp' ? (c.nameJp || c.name || '') : (c.name || '');
  })();
  const fieldLabel = getBusinessSectorLabelFromKey();
  // Số năm kinh nghiệm: lấy từ block 11 (requirements preset), không lấy từ jobValues
  const expReq = requirements.find((r) => r.type === 'experience' && String(r.status || '').toLowerCase() === 'required');
  const expYearsVal = expReq ? (expReq[contentKey] || expReq.content || '') : '';
  const numberOfHiresVal = (workingLocations?.[0]?.numberOfHires ?? null) || null;

  const requirementContent = (type) => {
    const list = requirements.filter((r) => r.type === type);
    const text = list.map((r) => r[contentKey] || r.content).filter(Boolean).join('\n');
    return text || (type === 'technique' ? L.requiredConditionsPlaceholder : L.preferredConditionsPlaceholder);
  };

  /** Nội dung ô "Điều kiện bắt buộc" = gộp technique + experience + language + certification (chỉ phần có nội dung thật, không hiện placeholder) */
  const requiredConditionsCombined = (() => {
    const types = ['technique', 'experience', 'language', 'certification'];
    const parts = types
      .map((type) => ({ type, text: requirementContent(type) }))
      .filter(({ type, text }) => {
        const ph = type === 'technique' ? L.requiredConditionsPlaceholder : L.preferredConditionsPlaceholder;
        return text && text !== ph;
      })
      .map(({ text }) => text);
    return parts.length ? parts.join('\n') : L.requiredConditionsPlaceholder;
  })();

  const highlightsDisplay = (() => {
    if (!formData.highlights) return L.highlightsPlaceholder;
    let keys = [];
    if (typeof formData.highlights === 'string' && formData.highlights.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(formData.highlights);
        if (Array.isArray(parsed)) keys = parsed;
      } catch {
        keys = [];
      }
    }
    if (keys.length > 0) {
      const labels = keys.map((key) => {
        const opt = JOB_HIGHLIGHT_OPTIONS.find((o) => o.key === key);
        if (!opt) return key;
        if (lang === 'en') return opt.en;
        if (lang === 'jp') return opt.jp;
        return opt.vi;
      });
      const parts = labels.map((s) => String(s ?? '').trim()).filter(Boolean);
      return parts.length > 0 ? parts.join(' / ') : L.highlightsPlaceholder;
    }
    // Fallback: treat as plain text (cũ), sẽ không đa ngôn ngữ nhưng vẫn hiển thị
    const parts = String(formData.highlights)
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(' / ') : L.highlightsPlaceholder;
  })();

  const updateRequirementsByType = (type, text) => {
    const lines = text ? text.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
    setRequirements((prev) => [
      ...prev.filter((r) => r.type !== type),
      ...lines.map((content) => {
        const base = prev.find((r) => r.type === type) || {};
        return { ...base, [contentKey]: content, type, status: base.status || '' };
      }),
    ]);
  };

  const salaryRangeDetailsText = salaryRangeDetails.map((srd) => srd[contentKey] || srd.content).filter(Boolean).join('\n');
  const workingLocationDetailsText = workingLocationDetails.map((wld) => wld[contentKey] || wld.content).filter(Boolean).join('\n');
  /** Chế độ phúc lợi: gộp Bảo hiểm xã hội + Phụ cấp đi lại (đồng bộ từ form) */
  const benefitsDisplayText = [formData[getFormKey('socialInsurance')], formData[getFormKey('transportation')]]
    .map((s) => String(s ?? '').trim())
    .filter(Boolean)
    .join('\n') || '';
  const overtimeDetailsText = overtimeAllowanceDetails.map((oad) => oad[contentKey] || oad.content).filter(Boolean).join('\n') || overtimeAllowances.map((oa) => oa.overtimeAllowanceRange).filter(Boolean).join(', ');
  const workingHoursText = (workingHourDetails && workingHourDetails.length > 0)
    ? workingHourDetails.map((whd) => whd[contentKey] || whd.content).filter(Boolean).join('\n')
    : (workingHours || []).map((wh) => wh.workingHours).filter(Boolean).join('\n');

  const updateDetailArray = (setter, contentKey, lines) => {
    setter((prev) => {
      const newItems = lines.map((content) => {
        const existing = prev[lines.indexOf(content)] || {};
        return { ...existing, [contentKey]: content };
      });
      if (newItems.length >= prev.length) return newItems;
      return newItems.concat(prev.slice(newItems.length)).map((item, i) => (i < newItems.length ? newItems[i] : { ...prev[i], [contentKey]: '' }));
    });
  };

  const salaryYear = salaryRanges.find((sr) => (sr.type || '').toLowerCase().includes('year') || (sr.type || '').toLowerCase().includes('năm'));
  const salaryMonth = salaryRanges.find((sr) => (sr.type || '').toLowerCase().includes('month') || (sr.type || '').toLowerCase().includes('tháng'));

  const serviceNameKey = lang === 'vi' ? 'serviceName' : lang === 'en' ? 'serviceNameEn' : 'serviceNameJp';
  const servicesDisplay = (recruitingCompany.services || []).map((s) => s[serviceNameKey] || s.serviceName).filter(Boolean).join(', ');

  const rows = [
    [L.companyName, recruitingCompany.companyName, 'companyName'],
    [L.jobTitle, formData[getFormKey('title')], 'title'],
    [L.jobCode, formData.jobCode, 'jobCode'],
    // Lĩnh vực: chỉ từ Lĩnh vực đã chọn (businessSectorKey), không lấy theo Loại công việc
    [L.field, fieldLabel || '', 'fieldDisplay'],
    // Loại công việc: từ Loại công việc (category), đã theo ngôn ngữ JD
    [L.jobType, categoryName, 'jobTypeDisplay'],
    [L.expYears, expYearsVal || null, 'expYearsDisplay'],
    [L.numberOfHires, numberOfHiresVal, 'numberOfHiresDisplay'],
  ];

  return (
    <div className="rounded border bg-white shadow-sm w-full" style={{ borderColor: '#e5e7eb', fontSize: '11px' }}>
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-3 py-2.5 border-b"
        style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
      >
        {/* Logo: màn nhỏ đủ lớn (xếp dọc); màn sm+ vẫn rõ, không bị ép nhỏ bởi cột chữ */}
        <div className="flex justify-center sm:justify-start flex-shrink-0">
          <img
            src={logoImage}
            alt="Logo"
            className="w-auto object-contain select-none
              h-[4.75rem] max-w-[min(280px,92vw)]
              sm:h-[3.75rem] sm:max-w-[200px]
              md:h-16 md:max-w-[240px]"
          />
        </div>
        <div
          className="w-full sm:flex-1 sm:min-w-0 text-center sm:text-right leading-snug break-words
            max-sm:text-[9px] text-[10px] md:text-[11px] lg:text-xs"
          style={{ color: '#374151' }}
        >
          <p className="font-semibold mb-1 opacity-95" style={{ lineHeight: 1.35 }}>
            {L.headerSlogan}
          </p>
          <div className="space-y-0.5 opacity-90" style={{ lineHeight: 1.4 }}>
            <div>
              {L.headerWebsite}: {HEADER_CONTACT.website}
            </div>
            <div>
              {L.headerHotline}: {HEADER_CONTACT.hotline}
            </div>
            <div>
              {L.headerMail}: {HEADER_CONTACT.mail}
            </div>
          </div>
        </div>
      </div>
      <div className="px-3 py-2 font-bold text-sm border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
        {L.sectionRecruitment}
      </div>
      <div className="divide-y" style={{ borderColor: '#e5e7eb' }}>
        {rows.map(([lbl, val, key], i) => (
          <React.Fragment key={i}>
            <div className="flex" style={{ minHeight: '32px' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
                {lbl}
              </div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                {lbl === L.companyName ? (
                  <span {...jdRecruitingEditable('companyName')} />
                ) : lbl === L.jobTitle ? (
                  <span {...jdEditable('title')} />
                ) : lbl === L.jobCode ? (
                  <span {...jdEditable('jobCode')} />
                ) : (
                  <span
                    {...customEditable(
                      'basic:' + key,
                      (formData[key] ?? val) || '',
                      (e) => {
                        const v = (e.currentTarget.textContent || '').trim();
                        setFormData((prev) => ({ ...prev, [key]: v }));
                      }
                    )}
                  />
                )}
              </div>
            </div>

            {/* Hình thức tuyển dụng + Tư cách lưu trú (ngay dưới Mã tin tuyển dụng) */}
            {lbl === L.jobCode && (
              <div className="flex" style={{ minHeight: '32px' }}>
                <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
                  {L.recruitmentForm}
                </div>
                <div className="flex-1 min-w-[60px] px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                  <span
                    {...customEditable(
                      'basic:recruitmentFormDisplay',
                      recruitmentTypeLabel || '',
                      (e) => {
                        const v = (e.currentTarget.textContent || '').trim();
                        setFormData((prev) => ({ ...prev, recruitmentFormDisplay: v }));
                      }
                    )}
                  />
                </div>
                <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626', borderLeft: '1px solid #e5e7eb' }}>
                  {L.residenceStatus}
                </div>
                <div className="flex-1 min-w-[60px] px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                  <span {...jdEditable('residenceStatus', 'outline-none block', { minHeight: '1.2em' }, '')} />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
        {/* Điểm nổi bật: 1 hàng ngang, có thể chỉnh sửa trực tiếp */}
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.highlights}
          </div>
          <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white', whiteSpace: 'normal' }}>
            <span
              {...customEditable(
                'highlights',
                highlightsDisplay,
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  setFormData((prev) => ({ ...prev, highlights: v }));
                }
              )}
            />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.jobDescription}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('description', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.jobDescriptionPlaceholder)} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.recruitmentReason}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('instruction', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.recruitmentReasonPlaceholder)} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.requiredConditions}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              {...customEditable(
                'req-required',
                requiredConditionsCombined,
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  setRequirements((prev) => {
                    const requiredReqs = prev.filter((r) => ['technique', 'experience', 'language', 'certification'].includes(r.type));
                    const techniqueReq = requiredReqs.find((r) => r.type === 'technique');
                    const updatedTechnique = techniqueReq
                      ? { ...techniqueReq, [contentKey]: v }
                      : { content: '', contentEn: '', contentJp: '', type: 'technique', status: 'required', [contentKey]: v };
                    const otherRequired = requiredReqs.filter((r) => r.type !== 'technique');
                    return [
                      ...prev.filter((r) => !['technique', 'experience', 'language', 'certification'].includes(r.type)),
                      updatedTechnique,
                      ...otherRequired,
                    ];
                  });
                },
                'outline-none block whitespace-pre-wrap',
                { minHeight: '60px' }
              )}
            />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.preferredConditions}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              {...customEditable(
                'req-education',
                requirementContent('education'),
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                  setRequirements((prev) => [
                    ...prev.filter((r) => r.type !== 'education'),
                    ...lines.map((content) => {
                      const base = prev.find((r) => r.type === 'education') || {};
                      return { ...base, [contentKey]: content, type: 'education', status: base.status || '' };
                    }),
                  ]);
                },
                'outline-none block whitespace-pre-wrap',
                { minHeight: '60px' }
              )}
            />
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 w-28 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.annualIncome}
          </div>
          <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span
              {...customEditable(
                'salary-year',
                salaryYear?.salaryRange || '',
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  setSalaryRanges((prev) => {
                    const next = Array.isArray(prev) ? [...prev] : [];
                    if (!next[0]) next[0] = { type: salaryYear?.type || 'year', salaryRange: '' };
                    next[0] = { ...(next[0] || {}), salaryRange: v };
                    return next;
                  });
                }
              )}
            />
          </div>
          <div className="flex-shrink-0 w-24 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626', borderLeft: '1px solid #e5e7eb' }}>
            {L.monthlySalary}
          </div>
          <div className="flex-1 min-w-[80px] px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span
              {...customEditable(
                'salary-month',
                salaryMonth?.salaryRange || '',
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  setSalaryRanges((prev) => {
                    const next = Array.isArray(prev) ? [...prev] : [];
                    if (!next[1]) next[1] = { type: salaryMonth?.type || 'month', salaryRange: '' };
                    next[1] = { ...(next[1] || {}), salaryRange: v };
                    return next;
                  });
                }
              )}
            />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.incomeDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              {...customEditable(
                'salary-range-details',
                salaryRangeDetailsText || L.incomeDetailsPlaceholder,
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                  setSalaryRangeDetails(lines.length ? lines.map((content) => ({ ...(salaryRangeDetails[lines.indexOf(content)] || {}), [contentKey]: content })) : []);
                },
                'outline-none block whitespace-pre-wrap',
                { minHeight: '60px' }
              )}
            />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.bonus}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('bonus', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.incomeDetailsPlaceholder)} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.salaryReview}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('salaryReview', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.incomeDetailsPlaceholder)} />
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.transferAbility}
          </div>
          <div className="flex-1 min-w-[60px] px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span
              {...jdEditable('transferAbility', 'outline-none block', { minHeight: '1.2em' }, '')}
            />
          </div>
          <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626', borderLeft: '1px solid #e5e7eb' }}>
            {L.workLocation}
          </div>
          <div className="flex-1 min-w-[80px] px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span
              {...customEditable(
                'work-locations',
                (workingLocations || [])
                  .map((wl) => {
                    const loc = locationLabelByLang(wl);
                    if (!loc) return '';
                    const c = countryLabelByLang(wl.country);
                    return loc + (c ? ' (' + c + ')' : '');
                  })
                  .filter(Boolean)
                  .join(', ') || '',
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  setWorkingLocations(v ? v.split(',').map((part) => ({ location: part.trim(), country: '' })) : []);
                }
              )}
            />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.workLocationDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              {...customEditable(
                'work-location-details',
                workingLocationDetailsText || L.incomeDetailsPlaceholder,
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                  setWorkingLocationDetails(lines.length ? lines.map((content) => ({ ...(workingLocationDetails[lines.indexOf(content)] || {}), [contentKey]: content })) : []);
                },
                'outline-none block whitespace-pre-wrap',
                { minHeight: '60px' }
              )}
            />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.workingTime}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              {...customEditable(
                'working-hour-details',
                workingHoursText || L.incomeDetailsPlaceholder,
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                  updateDetailArray(setWorkingHourDetails, contentKey, lines);
                },
                'outline-none block whitespace-pre-wrap',
                { minHeight: '60px' }
              )}
            />
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626', minWidth: '140px' }}>
            {L.overtimeHoursPerMonth}
          </div>
          <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span {...jdEditable('overtime', '', {}, '')} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.overtimeDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              {...customEditable(
                'overtime-details',
                overtimeDetailsText || L.incomeDetailsPlaceholder,
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                  setOvertimeAllowanceDetails(lines.length ? lines.map((content) => ({ ...(overtimeAllowanceDetails[lines.indexOf(content)] || {}), [contentKey]: content })) : []);
                },
                'outline-none block whitespace-pre-wrap',
                { minHeight: '60px' }
              )}
            />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.benefits}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              {...customEditable(
                'benefits-combined',
                benefitsDisplayText || L.benefitsPlaceholder,
                (e) => {
                  const v = (e.currentTarget.textContent || '').trim();
                  const lines = v.split(/\n/).map((s) => s.trim());
                  const first = lines[0] || '';
                  const rest = lines.slice(1).join('\n').trim();
                  setFormData((prev) => ({
                    ...prev,
                    [getFormKey('socialInsurance')]: first,
                    [getFormKey('transportation')]: rest,
                  }));
                },
                'outline-none block whitespace-pre-wrap',
                { minHeight: '60px' }
              )}
            />
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 w-28 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.holidays}
          </div>
          <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span {...jdEditable('holidays', '', {}, '')} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.holidayDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              {...jdEditable('holidayDetails', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.holidayDetailsPlaceholder)}
            />
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 w-28 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.probation}
          </div>
          <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span {...jdEditable('probationPeriod', '', {}, '')} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.probationDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              {...jdEditable('probationDetail', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.holidayDetailsPlaceholder)}
            />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>
            {L.recruitmentProcess}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('recruitmentProcess', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.incomeDetailsPlaceholder)} />
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full px-3 py-2 text-sm font-bold text-white" style={{ backgroundColor: '#4b5563' }}>
            {L.sectionCompany}
          </div>
          <div className="grid grid-cols-2 border-t" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex border-b border-r" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.companyName}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('companyName')} /></div>
            </div>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.stockExchangeInfo}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('stockExchangeInfo')} /></div>
            </div>
            <div className="flex border-b border-r" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.services}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                <span
                  {...customEditable(
                    'recruit-services',
                    recruitingCompany.servicesText || servicesDisplay || '',
                    (e) => {
                      const v = (e.currentTarget.textContent || '').trim();
                      setRecruitingCompany((prev) => ({ ...prev, servicesText: v }));
                    }
                  )}
                />
              </div>
            </div>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.businessSectors}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                <span
                  {...customEditable(
                    'recruit-businessSectors',
                    (recruitingCompany.businessSectorsText ||
                      (recruitingCompany.businessSectors || [])
                        .map((bs) => bs.sectorName)
                        .filter(Boolean)
                        .join('\n') ||
                      ''),
                    (e) => {
                      const v = (e.currentTarget.textContent || '').trim();
                      setRecruitingCompany((prev) => ({ ...prev, businessSectorsText: v }));
                    },
                    'outline-none block whitespace-pre-wrap',
                    { whiteSpace: 'pre-wrap' }
                  )}
                />
              </div>
            </div>
            <div className="flex border-b border-r" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.revenue}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('revenue')} /></div>
            </div>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.investmentCapital}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('investmentCapital')} /></div>
            </div>
            <div className="flex border-b border-r" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.numberOfEmployees}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('numberOfEmployees')} /></div>
            </div>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.established}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('establishedDate')} /></div>
            </div>
          </div>
          <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.headquarters}</div>
            <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('headquarters')} /></div>
          </div>
          <div>
            <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#dc2626' }}>{L.companyIntroduction}</div>
            <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
              <span {...jdRecruitingEditable('companyIntroduction', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.incomeDetailsPlaceholder)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
