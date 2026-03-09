import React from 'react';

const LABELS = {
  vi: {
    sectionRecruitment: 'THÔNG TIN TUYỂN DỤNG',
    companyName: 'Tên công ty',
    jobTitle: 'Tiêu đề việc làm',
    jobCode: 'Mã tin tuyển dụng',
    recruitmentForm: 'Hình thức tuyển dụng',
    field: 'Lĩnh vực',
    jobType: 'Loại công việc',
    expByPosition: 'Số năm kinh nghiệm theo vị trí',
    expByIndustry: 'Số năm kinh nghiệm theo ngành',
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
    holidays: 'Ngày nghỉ',
    holidayDetails: 'Chi tiết về ngày nghỉ',
    holidayDetailsPlaceholder: 'Điền chi tiết',
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
    recruitmentType1: 'Nhân viên chính thức',
    recruitmentType2: 'Nhân viên chính thức (công ty haken)',
    recruitmentType3: 'Nhân viên haken',
    recruitmentType4: 'Nhân viên hợp đồng',
  },
  en: {
    sectionRecruitment: 'RECRUITMENT INFORMATION',
    companyName: 'Company name',
    jobTitle: 'Job title',
    jobCode: 'Job code',
    recruitmentForm: 'Recruitment type',
    field: 'Field',
    jobType: 'Job type',
    expByPosition: 'Years of experience (position)',
    expByIndustry: 'Years of experience (industry)',
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
    holidays: 'Holidays',
    holidayDetails: 'Holiday details',
    holidayDetailsPlaceholder: 'Enter details',
    probation: 'Probation',
    probationDetails: 'Probation details',
    recruitmentProcess: 'Recruitment process',
    sectionCompany: 'COMPANY INFORMATION',
    stockExchangeInfo: 'Stock exchange info',
    services: 'Services',
    businessSectors: 'Business sectors',
    revenue: 'Revenue',
    investmentCapital: 'Investment capital',
    numberOfEmployees: 'Number of employees',
    established: 'Established',
    headquarters: 'Headquarters',
    companyIntroduction: 'Company introduction',
    recruitmentType1: 'Regular employee',
    recruitmentType2: 'Regular (haken company)',
    recruitmentType3: 'Temporary staff',
    recruitmentType4: 'Contract employee',
  },
  jp: {
    sectionRecruitment: '募集情報',
    companyName: '会社名',
    jobTitle: '求人タイトル',
    jobCode: '求人コード',
    recruitmentForm: '雇用形態',
    field: '分野',
    jobType: '職種',
    expByPosition: '職種別経験年数',
    expByIndustry: '業界別経験年数',
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
    holidays: '休日',
    holidayDetails: '休日の詳細',
    holidayDetailsPlaceholder: '詳細を入力',
    probation: '試用期間',
    probationDetails: '試用期間の詳細',
    recruitmentProcess: '選考プロセス',
    sectionCompany: '会社情報',
    stockExchangeInfo: '上場情報',
    services: '提供サービス',
    businessSectors: '事業分野',
    revenue: '売上',
    investmentCapital: '投資資本',
    numberOfEmployees: '従業員数',
    established: '設立',
    headquarters: '本社',
    companyIntroduction: '会社紹介',
    recruitmentType1: '正社員',
    recruitmentType2: '正社員（ハケン会社）',
    recruitmentType3: '派遣社員',
    recruitmentType4: '契約社員',
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
  salaryRanges,
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

  const getFormKey = (field) => {
    const noSuffix = ['jobCode', 'slug', 'status', 'categoryId', 'companyId', 'interviewLocation', 'deadline', 'recruitmentType', 'jobCommissionType', 'isPinned', 'isHot', 'holidays', 'highlights'];
    if (noSuffix.includes(field)) return field;
    return field + suffix;
  };

  const jdEditable = (field, className = '', style = {}, placeholder = '—') => {
    const key = getFormKey(field);
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      key: `jd-${key}-${String(formData[key] ?? '').slice(0, 50)}`,
      onBlur: (e) => {
        const v = (e.currentTarget.textContent || '').trim();
        setFormData((prev) => ({ ...prev, [key]: v || '' }));
      },
      className: className || 'outline-none min-h-[1.2em] block',
      style: { outline: 'none', minHeight: '1.2em', ...style },
      children: (formData[key] || '').trim() || placeholder,
    };
  };

  const getRecruitingKey = (field) => {
    if (field === 'headquarters' && (lang === 'en' || lang === 'jp')) return field + (lang === 'en' ? 'En' : 'Jp');
    if (field === 'companyIntroduction' && (lang === 'en' || lang === 'jp')) return field + (lang === 'en' ? 'En' : 'Jp');
    return field;
  };

  const jdRecruitingEditable = (field, className = '', style = {}, placeholder = '—') => {
    const key = getRecruitingKey(field);
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      key: `jd-rc-${key}-${String(recruitingCompany[key] ?? '').slice(0, 50)}`,
      onBlur: (e) => {
        const v = (e.currentTarget.textContent || '').trim();
        setRecruitingCompany((prev) => ({ ...prev, [key]: v || '' }));
      },
      className: className || 'outline-none min-h-[1.2em] block',
      style: { outline: 'none', minHeight: '1.2em', ...style },
      children: (recruitingCompany[key] || '').trim() || placeholder,
    };
  };

  const recruitmentTypeMap = {
    1: L.recruitmentType1,
    2: L.recruitmentType2,
    3: L.recruitmentType3,
    4: L.recruitmentType4,
  };

  const recruitmentTypeLabel = formData.recruitmentType ? (recruitmentTypeMap[formData.recruitmentType] || formData.recruitmentType) : null;
  const categoryName = formData.categoryId ? (categories.find((c) => c.id === parseInt(formData.categoryId))?.name || '') : null;
  const expJv = jobValues.find((jv) => (jv.type?.cvField || '').includes('experienceYears'));
  const expNg = jobValues.find((jv) => (jv.type?.cvField || '').toLowerCase().includes('industry') || (jv.type?.name || '').toLowerCase().includes('ngành'));
  const numberOfHiresVal = (workingLocations?.[0]?.numberOfHires ?? null) || null;

  const requirementContent = (type) => {
    const list = requirements.filter((r) => r.type === type);
    const text = list.map((r) => r[contentKey] || r.content).filter(Boolean).join('\n');
    return text || (type === 'technique' ? L.requiredConditionsPlaceholder : L.preferredConditionsPlaceholder);
  };

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
    [L.companyName, recruitingCompany.companyName],
    [L.jobTitle, formData[getFormKey('title')]],
    [L.jobCode, formData.jobCode],
    [L.recruitmentForm, recruitmentTypeLabel],
    [L.field, categoryName],
    [L.jobType, categoryName],
    [L.expByPosition, expJv?.valueRef?.valuename || null],
    [L.expByIndustry, expNg?.valueRef?.valuename || null],
    [L.numberOfHires, numberOfHiresVal],
  ];

  return (
    <div className="rounded border bg-white shadow-sm w-full" style={{ borderColor: '#e5e7eb', fontSize: '11px' }}>
      <div className="px-3 py-2 font-bold text-sm border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
        {L.sectionRecruitment}
      </div>
      <div className="divide-y" style={{ borderColor: '#e5e7eb' }}>
        {rows.map(([lbl, val], i) => (
          <div key={i} className="flex" style={{ minHeight: '32px' }}>
            <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
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
                val || '—'
              )}
            </div>
          </div>
        ))}
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.highlights}
          </div>
          <div className="px-3 py-2 min-h-[48px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('highlights', 'block whitespace-pre-wrap outline-none', { minHeight: '48px' }, L.highlightsPlaceholder)} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.jobDescription}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('description', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.jobDescriptionPlaceholder)} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.recruitmentReason}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('instruction', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.recruitmentReasonPlaceholder)} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.requiredConditions}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              contentEditable
              suppressContentEditableWarning
              className="outline-none block whitespace-pre-wrap"
              style={{ minHeight: '60px' }}
              onBlur={(e) => {
                const v = (e.currentTarget.textContent || '').trim();
                const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                setRequirements((prev) => [
                  ...prev.filter((r) => r.type !== 'technique'),
                  ...lines.map((content) => {
                    const base = prev.find((r) => r.type === 'technique') || {};
                    return { ...base, [contentKey]: content, type: 'technique', status: base.status || '' };
                  }),
                ]);
              }}
            >
              {requirementContent('technique')}
            </span>
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.preferredConditions}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              contentEditable
              suppressContentEditableWarning
              className="outline-none block whitespace-pre-wrap"
              style={{ minHeight: '60px' }}
              onBlur={(e) => {
                const v = (e.currentTarget.textContent || '').trim();
                const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                setRequirements((prev) => [
                  ...prev.filter((r) => r.type !== 'education'),
                  ...lines.map((content) => {
                    const base = prev.find((r) => r.type === 'education') || {};
                    return { ...base, [contentKey]: content, type: 'education', status: base.status || '' };
                  }),
                ]);
              }}
            >
              {requirementContent('education')}
            </span>
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 w-28 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.annualIncome}
          </div>
          <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            {(salaryYear?.salaryRange) || '—'}
          </div>
          <div className="flex-shrink-0 w-24 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280', borderLeft: '1px solid #e5e7eb' }}>
            {L.monthlySalary}
          </div>
          <div className="flex-1 min-w-[80px] px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            {(salaryMonth?.salaryRange) || '—'}
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.incomeDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              contentEditable
              suppressContentEditableWarning
              className="outline-none block whitespace-pre-wrap"
              style={{ minHeight: '60px' }}
              onBlur={(e) => {
                const v = (e.currentTarget.textContent || '').trim();
                const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                setSalaryRangeDetails(lines.length ? lines.map((content) => ({ ...(salaryRangeDetails[lines.indexOf(content)] || {}), [contentKey]: content })) : []);
              }}
            >
              {salaryRangeDetailsText || L.incomeDetailsPlaceholder}
            </span>
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.bonus}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('bonus', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.incomeDetailsPlaceholder)} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.salaryReview}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('salaryReview', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.incomeDetailsPlaceholder)} />
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.transferAbility}
          </div>
          <div className="flex-1 min-w-[60px] px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            —'
          </div>
          <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280', borderLeft: '1px solid #e5e7eb' }}>
            {L.workLocation}
          </div>
          <div className="flex-1 min-w-[80px] px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            {(workingLocations || []).map((wl) => (wl.location ? wl.location + (wl.country ? ' (' + wl.country + ')' : '') : '')).filter(Boolean).join(', ') || '—'}
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.workLocationDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              contentEditable
              suppressContentEditableWarning
              className="outline-none block whitespace-pre-wrap"
              style={{ minHeight: '60px' }}
              onBlur={(e) => {
                const v = (e.currentTarget.textContent || '').trim();
                const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                setWorkingLocationDetails(lines.length ? lines.map((content) => ({ ...(workingLocationDetails[lines.indexOf(content)] || {}), [contentKey]: content })) : []);
              }}
            >
              {workingLocationDetailsText || L.incomeDetailsPlaceholder}
            </span>
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.workingTime}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            {workingHoursText || L.incomeDetailsPlaceholder}
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280', minWidth: '140px' }}>
            {L.overtimeHoursPerMonth}
          </div>
          <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span {...jdEditable('overtime', '', {}, '—')} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.overtimeDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span
              contentEditable
              suppressContentEditableWarning
              className="outline-none block whitespace-pre-wrap"
              style={{ minHeight: '60px' }}
              onBlur={(e) => {
                const v = (e.currentTarget.textContent || '').trim();
                const lines = v ? v.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                setOvertimeAllowanceDetails(lines.length ? lines.map((content) => ({ ...(overtimeAllowanceDetails[lines.indexOf(content)] || {}), [contentKey]: content })) : []);
              }}
            >
              {overtimeDetailsText || L.incomeDetailsPlaceholder}
            </span>
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.benefits}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <span {...jdEditable('socialInsurance', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.incomeDetailsPlaceholder)} />
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 w-28 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.holidays}
          </div>
          <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span {...jdEditable('holidays', '', {}, '—')} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.holidayDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            {L.holidayDetailsPlaceholder}
          </div>
        </div>
        <div className="flex" style={{ minHeight: '32px' }}>
          <div className="flex-shrink-0 w-28 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.probation}
          </div>
          <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>
            <span {...jdEditable('contractPeriod', '', {}, '—')} />
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
            {L.probationDetails}
          </div>
          <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            {L.holidayDetailsPlaceholder}
          </div>
        </div>
        <div>
          <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>
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
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.companyName}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('companyName')} /></div>
            </div>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.stockExchangeInfo}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('stockExchangeInfo')} /></div>
            </div>
            <div className="flex border-b border-r" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.services}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>{servicesDisplay || '—'}</div>
            </div>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.businessSectors}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}>{(recruitingCompany.businessSectors || []).map((bs) => bs.sectorName).filter(Boolean).join(', ') || '—'}</div>
            </div>
            <div className="flex border-b border-r" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.revenue}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('revenue')} /></div>
            </div>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.investmentCapital}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('investmentCapital')} /></div>
            </div>
            <div className="flex border-b border-r" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.numberOfEmployees}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('numberOfEmployees')} /></div>
            </div>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.established}</div>
              <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('establishedDate')} /></div>
            </div>
          </div>
          <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex-shrink-0 w-36 px-3 py-2 flex items-center text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.headquarters}</div>
            <div className="flex-1 px-3 py-2 flex items-center text-xs border-l" style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: 'white' }}><span {...jdRecruitingEditable('headquarters')} /></div>
          </div>
          <div>
            <div className="w-full px-3 py-2 text-xs font-medium text-white" style={{ backgroundColor: '#6b7280' }}>{L.companyIntroduction}</div>
            <div className="px-3 py-2 min-h-[60px] text-xs whitespace-pre-wrap" style={{ color: '#111827', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
              <span {...jdRecruitingEditable('companyIntroduction', 'block whitespace-pre-wrap', { minHeight: '60px' }, L.incomeDetailsPlaceholder)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
