/**
 * HTML template cho CV Rirekisho (履歴書) và Shokumu (職務経歴書)
 * Dùng để generate PDF từ dữ liệu CV
 */

const JPRESIDENCE_LABELS = {
  1: '技術・人文知識・国際業務',
  2: '特定技能',
  3: '留学',
  4: '永住者',
  5: '日本人の配偶者等',
  6: '定住者',
  7: 'その他',
  8: '高度専門職',
  9: '技能実習',
  10: '家族滞在',
  11: '短期滞在'
};

/**
 * Chuẩn hóa dữ liệu CV từ backend model sang format template
 */
export function normalizeCvForTemplate(cv) {
  const raw = cv?.dataValues || cv || {};
  const genderVal = raw.gender;
  const gender = genderVal === 1 ? '男' : genderVal === 2 ? '女' : '';
  const hasSpouseVal = raw.hasSpouse ?? raw.spouse;
  const hasSpouse = (hasSpouseVal === '有' || hasSpouseVal === '無') ? hasSpouseVal : (hasSpouseVal === 1 || hasSpouseVal === '1' ? '有' : (hasSpouseVal === 0 || hasSpouseVal === '0' ? '無' : ''));
  const spouseDependent = raw.spouseDependent === 1 || raw.spouseDependent === '1' ? '有' : (raw.spouseDependent === 0 || raw.spouseDependent === '0' ? '無' : '');
  const currentSalary = raw.currentIncome != null ? `${raw.currentIncome}万円` : (raw.currentSalary || '');
  const desiredSalary = raw.desiredIncome != null ? `${raw.desiredIncome}万円` : (raw.desiredSalary || '');
  const desiredLocation = raw.desiredWorkLocation || raw.desiredLocation || '';
  const desiredStartDate = raw.nyushaTime || raw.desiredStartDate || '';
  const visaDate = raw.visaExpirationDate;
  const visaStr = visaDate ? (typeof visaDate === 'string' && visaDate.match(/^\d{4}-\d{2}-\d{2}$/) ? visaDate : new Date(visaDate).toISOString().slice(0, 10)) : '';
  const birthStr = raw.birthDate ? (typeof raw.birthDate === 'string' && raw.birthDate.match(/^\d{4}-\d{2}-\d{2}$/) ? raw.birthDate : new Date(raw.birthDate).toISOString().slice(0, 10)) : '';
  const dependentsCount = raw.dependentsCount != null ? String(raw.dependentsCount) : '';

  return {
    nameKanji: raw.name || raw.nameKanji || '',
    nameKana: raw.furigana || raw.nameKana || '',
    gender,
    birthDate: birthStr,
    age: raw.ages || raw.age || '',
    phone: raw.phone || '',
    postalCode: raw.postalCode || '',
    passport: (raw.passport != null && raw.passport !== '') ? (raw.passport === '有' || raw.passport === '無' ? raw.passport : String(raw.passport)) : '',
    skypeId: raw.skypeId != null ? String(raw.skypeId) : '',
    address: raw.addressCurrent || raw.address || '',
    email: raw.email || '',
    addressOrigin: raw.addressOrigin || '',
    // 現住所の最寄り駅: ưu tiên schema mới rirekisho.nearest_station (1 chuỗi),
    // fallback về các field cũ nếu có.
    nearestStationName: raw.nearest_station || raw.nearestStationName || (raw.nearestStationLine || ''),
    dependentsCount,
    hasSpouse,
    spouseDependent,
    jpResidenceStatus: JPRESIDENCE_LABELS[raw.jpResidenceStatus] || raw.jpResidenceStatus || '',
    stayPurpose: raw.stayPurpose || raw.stay_purpose || '',
    jpConversationLevel: raw.jpConversationLevel || raw.jp_conversation_level || '',
    enConversationLevel: raw.enConversationLevel || raw.en_conversation_level || '',
    otherConversationLevel: raw.otherConversationLevel || raw.other_conversation_level || '',
    visaExpirationDate: visaStr,
    currentSalary,
    desiredSalary,
    desiredPosition: raw.desiredPosition || '',
    desiredLocation,
    desiredStartDate,
    cvDocumentDate: raw.cvDocumentDate || '',
    careerSummary: raw.careerSummary || '',
    strengths: raw.strengths || '',
    notes: raw.notes || raw.remarks || '',
    hobbiesSpecialSkills: raw.hobbiesOrSpecialSkills || raw.hobbiesSpecialSkills || '',
    motivation: raw.motivation || '',
    jlptLevel: raw.jlptLevel != null ? String(raw.jlptLevel) : '',
    toeicScore: raw.toeicScore != null ? String(raw.toeicScore) : '',
    ieltsScore: raw.ieltsScore != null ? String(raw.ieltsScore) : '',
    experienceYears: raw.experienceYears != null ? String(raw.experienceYears) : '',
    specialization: raw.specialization != null ? String(raw.specialization) : '',
    qualification: raw.qualification != null ? String(raw.qualification) : '',
    hasDrivingLicense: raw.hasDrivingLicense != null ? String(raw.hasDrivingLicense) : '',
    technicalSkills: raw.technicalSkills || '',
    learnedTools: (() => {
      try { return Array.isArray(raw.learnedTools) ? raw.learnedTools : (raw.learnedTools ? (typeof raw.learnedTools === 'string' ? JSON.parse(raw.learnedTools) : []) : []); } catch { return []; }
    })(),
    experienceTools: (() => {
      try { return Array.isArray(raw.experienceTools) ? raw.experienceTools : (raw.experienceTools ? (typeof raw.experienceTools === 'string' ? JSON.parse(raw.experienceTools) : []) : []); } catch { return []; }
    })(),
    toolsSoftwareNotes: (() => {
      try {
        const v = raw.toolsSoftwareNotes;
        if (!v) return {};
        return typeof v === 'string' ? (v ? JSON.parse(v) : {}) : (v || {});
      } catch { return {}; }
    })(),
    educations: (() => {
      try { return Array.isArray(raw.educations) ? raw.educations : (raw.educations ? (typeof raw.educations === 'string' ? JSON.parse(raw.educations) : []) : []); } catch { return []; }
    })(),
    workExperiences: (() => {
      try { return Array.isArray(raw.workExperiences) ? raw.workExperiences : (raw.workExperiences ? (typeof raw.workExperiences === 'string' ? JSON.parse(raw.workExperiences) : []) : []); } catch { return []; }
    })(),
    certificates: (() => {
      try { return Array.isArray(raw.certificates) ? raw.certificates : (raw.certificates ? (typeof raw.certificates === 'string' ? JSON.parse(raw.certificates) : []) : []); } catch { return []; }
    })()
  };
}

function esc(s) {
  if (s == null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function orBlank(s) {
  return s != null && String(s).trim() ? esc(String(s).trim()) : '　';
}

function parsePeriod(p) {
  if (!p || typeof p !== 'string') return { year: '　', month: '　' };
  const m = p.match(/^(\d{4})[\/\-]?(\d{1,2})?/);
  return m ? { year: m[1], month: m[2] || '　' } : { year: '　', month: '　' };
}

function formatDateJp(dateStr) {
  if (!dateStr || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return '　　年　　月　　日';
  const [y, m, d] = dateStr.split('-');
  return `${y}年${m}月${d}日`;
}

function skillsSection(d) {
  const parts = [];
  if (d.technicalSkills && d.technicalSkills.trim()) parts.push(esc(d.technicalSkills.trim()));
  const learned = (d.learnedTools || []).filter(Boolean);
  if (learned.length) parts.push(`【学習】${learned.map(esc).join('、')}`);
  const exp = (d.experienceTools || []).filter(Boolean);
  if (exp.length) parts.push(`【経験】${exp.map(esc).join('、')}`);
  return parts.join('\n') || '　';
}

// Noto Serif JP: font web hỗ trợ tiếng Nhật + Latin (trên server Linux không cần cài font). Fallback sang font Mincho trên Windows/macOS.
const FONT_MINCHO = "'Noto Serif JP','MS Mincho','MS PMincho','Yu Mincho','Hiragino Mincho ProN',serif";
const HTML_HEAD = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&display=swap" rel="stylesheet">
<style>
html,body{font-family:${FONT_MINCHO};font-size:11px;color:#1f2937;margin:0;padding:16px;line-height:1.4;overflow:visible;height:auto}
table{border-collapse:collapse;width:100%}
.page-break{page-break-before:always}
.avoid-break{page-break-inside:avoid}
</style></head><body>`;

/**
 * Tạo HTML đầy đủ (Rirekisho + Shokumu) hoặc chỉ 1 tab cho PDF
 * @param {Object} cv - CV model hoặc plain object
 * @param {Object} options - { avatarDataUrl, cvTemplate, tab: 'rirekisho'|'shokumu'|'all' } tab: chỉ xuất tab đó; 'all' = cả 2 tab
 */
export function generateCvTemplateHtml(cv, options = {}) {
  const d = typeof cv === 'object' && (cv.dataValues || cv) ? normalizeCvForTemplate(cv) : cv;
  const avatarDataUrl = options.avatarDataUrl || '';
  const cvTemplate = options.cvTemplate || 'common'; // common | cv_it | cv_technical (đồng bộ form; sau có thể tách layout theo template)
  const tab = options.tab || 'all'; // 'rirekisho' | 'shokumu' | 'all'
  const now = new Date();
  const nowStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日現在`;

  const birthFormatted = d.birthDate ? (() => {
    const [y, m, d1] = d.birthDate.split('-');
    return `${y}年${m}月${d1}日生（満 ${d.age || '－'} 歲）`;
  })() : '　　年　　月　　日生（満　　歲）';
  const visaFormatted = d.visaExpirationDate ? (() => {
    const [y, m, d1] = d.visaExpirationDate.split('-');
    return `西暦${y}年${m}月${d1}日`;
  })() : '西暦　　年　　月　　日';

  // Số dòng theo dữ liệu (tối thiểu 1), khớp form Rirekisho
  const eduCount = Math.max(1, (d.educations || []).length);
  const workCount = Math.max(1, (d.workExperiences || []).length);
  const certCount = Math.max(1, (d.certificates || []).length);

  // 学歴 (template chung): mỗi education -> 2 dòng (入学 / 卒業) giống form preview
  const eduRows = Array.from({ length: eduCount }, (_, i) => {
    const edu = (d.educations || [])[i];
    if (!edu) {
      return `<tr><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">　</td><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">　</td><td style="border:1px solid #1f2937;padding:4px;padding-left:8px">　</td></tr>`;
    }
    const base = edu.content || [edu.school_name, edu.major].filter(Boolean).join(' / ') || '';
    const startLabel = base ? `${base} 入学` : '';
    const endLabel = base ? `${base} 卒業` : '';
    const startRow = `<tr><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">${orBlank(edu.year)}</td><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">${orBlank(edu.month)}</td><td style="border:1px solid #1f2937;padding:4px;padding-left:8px">${esc(startLabel)}</td></tr>`;
    const endRow = `<tr><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">${orBlank(edu.endYear)}</td><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">${orBlank(edu.endMonth)}</td><td style="border:1px solid #1f2937;padding:4px;padding-left:8px">${esc(endLabel)}</td></tr>`;
    return startRow + endRow;
  }).join('');

  const workRows = Array.from({ length: workCount }, (_, i) => {
    const emp = (d.workExperiences || [])[i];
    const isCurrentUntil = emp && String(emp.company_name || '').trim() === '現在に至る';
    let year = '　', month = '　';
    if (isCurrentUntil) {
      year = '　';
      month = '　';
    } else if (emp) {
      if (emp.year != null && String(emp.year).trim()) year = orBlank(emp.year);
      else if (emp.period) year = parsePeriod(emp.period).year;
      if (emp.month != null && String(emp.month).trim()) month = orBlank(emp.month);
      else if (emp.period) month = parsePeriod(emp.period).month;
    }
    let label = emp && emp.company_name != null ? String(emp.company_name) : '';
    if (isCurrentUntil) {
      label = '現在に至る';
    } else {
      label = label.replace(/\s*(入社|退社|開始|終了)\s*$/g, '').trim();
      if (label) label = label + (i % 2 === 0 ? ' 入社' : ' 退社');
    }
    return `<tr><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">${year}</td><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">${month}</td><td style="border:1px solid #1f2937;padding:4px;padding-left:8px">${esc(label || '')}</td></tr>`;
  }).join('');

  const certRows = Array.from({ length: certCount }, (_, i) => {
    const cert = (d.certificates || [])[i];
    return `<tr><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">${orBlank(cert?.year)}</td><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">${orBlank(cert?.month)}</td><td style="border:1px solid #1f2937;padding:4px;padding-left:8px">${orBlank(cert?.name)}</td></tr>`;
  }).join('');

  const workExpsRaw = (d.workExperiences && d.workExperiences.length) ? d.workExperiences : [{ period: '', company_name: '', business_purpose: '', scale_role: '', description: '', tools_tech: '' }];
  // Gộp cặp 入社/退社 thành 1 item (cho Shokumu IT/Technical khi form gửi expanded)
  const workExps = (() => {
    const list = workExpsRaw;
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const w = list[i] || {};
      const cn = (w.company_name || '').trim();
      if (cn.endsWith(' 入社')) {
        const next = list[i + 1] || {};
        const nextCn = (next.company_name || '').trim();
        const companyName = cn.replace(/\s*入社\s*$/, '').trim();
        if (nextCn.endsWith(' 退社') && nextCn.replace(/\s*退社\s*$/, '').trim() === companyName) {
          out.push({
            period: w.period || next.period || '',
            company_name: companyName,
            position_name: w.position_name || next.position_name || w.positionName || next.positionName || w.role || next.role || w.jobTitle || next.jobTitle || '',
            location: w.location || next.location || w.workLocation || next.workLocation || w.work_location || next.work_location || '',
            business_purpose: w.business_purpose || next.business_purpose || '',
            scale_role: w.scale_role || next.scale_role || '',
            description: w.description || next.description || '',
            tools_tech: w.tools_tech || next.tools_tech || '',
            roleCheckboxes: Array.isArray(w.roleCheckboxes) ? w.roleCheckboxes : [],
            processCheckboxes: Array.isArray(w.processCheckboxes) ? w.processCheckboxes : [],
          });
          i++;
          continue;
        }
      }
      if (cn.endsWith(' 退社')) {
        out.push({
          ...w,
          company_name: cn.replace(/\s*退社\s*$/, '').trim(),
          position_name: w.position_name || w.positionName || w.role || w.jobTitle || '',
          location: w.location || w.workLocation || w.work_location || '',
          roleCheckboxes: w.roleCheckboxes || [],
          processCheckboxes: w.processCheckboxes || [],
        });
        continue;
      }
      out.push({
        ...w,
        company_name: cn || w.company_name,
        position_name: w.position_name || w.positionName || w.role || w.jobTitle || '',
        location: w.location || w.workLocation || w.work_location || '',
        roleCheckboxes: w.roleCheckboxes || [],
        processCheckboxes: w.processCheckboxes || [],
      });
    }
    return out.length ? out : [{ period: '', company_name: '', business_purpose: '', scale_role: '', description: '', tools_tech: '' }];
  })();
  const workCountShokumu = Math.max(1, workExps.length);
  const workExpsPadded = Array.from({ length: workCountShokumu }, (_, i) => workExps[i] || { period: '', company_name: '', business_purpose: '', scale_role: '', description: '', tools_tech: '' });
  const shokumuBlocks = workExpsPadded.map((emp, i) => {
    const isLast = i === workExpsPadded.length - 1;
    return `
    <div style="border-bottom:${isLast ? 'none' : '1px solid #1f2937'};font-size:11px;color:#1f2937">
      <div style="display:flex;padding:6px 8px;font-size:12px;background:#f3f4f6">
        <span style="flex:1">${orBlank(emp.period)}</span>
        <span>${orBlank(emp.company_name)}</span>
      </div>
      <div style="display:flex;padding:4px 8px;font-size:10px;color:#374151;background:#d1d5db">
        <div style="flex:1">【事業目的】</div>
        <div style="width:35%;max-width:35%;min-width:80px;text-align:right">規模 / 役割</div>
      </div>
      <div style="display:flex">
        <div style="flex:1;border-right:1px dotted #1f2937;padding:8px;min-width:0">
          <div style="font-size:12px;white-space:pre-wrap;min-height:2em;margin-bottom:8px">${orBlank(emp.business_purpose)}</div>
          <div style="font-size:10px;color:#4b5563;margin-bottom:2px">【業務内容】</div>
          <div style="font-size:12px;white-space:pre-wrap;min-height:2em;margin-bottom:8px">${orBlank(emp.description)}</div>
          <div style="font-size:10px;color:#4b5563;margin-bottom:2px">【ツール】</div>
          <div style="font-size:12px;white-space:pre-wrap;min-height:1.5em">${orBlank(emp.tools_tech)}</div>
        </div>
        <div style="width:35%;min-width:80px;max-width:35%;padding:8px;display:flex;flex-direction:column">
          <div style="font-size:12px;white-space:pre-wrap;width:100%;min-height:4em">${orBlank(emp.scale_role)}</div>
        </div>
      </div>
    </div>
  `;
  }).join('');

  const certShokumuCount = (d.certificates || []).length;
  const certShokumuRows = Array.from({ length: certShokumuCount }, (_, i) => {
    const cert = (d.certificates || [])[i];
    const y = cert && (cert.year != null && String(cert.year).trim() !== '') ? esc(String(cert.year)) : 'xxxx';
    const m = cert && (cert.month != null && String(cert.month).trim() !== '') ? esc(String(cert.month)) : 'xx';
    const dateStr = `${y}年${m}月取得`;
    return `<tr><td style="border:1px solid #1f2937;padding:6px;width:60%;vertical-align:top">${orBlank(cert?.name)}</td><td style="border:1px solid #1f2937;padding:6px;vertical-align:top;white-space:nowrap">${dateStr}</td></tr>`;
  }).join('');

  const skillsHtml = skillsSection(d);
  const showSkills = skillsHtml !== '　';
  const useItLayout = cvTemplate === 'cv_it' || cvTemplate === 'cv_technical';

  // Helper data cho layout IT/Technical (Rirekisho IT) – số dòng 職歴 theo workExperiences, mặc định 1 dòng
  const itWorkCount = Math.max(1, (d.workExperiences || []).length);
  const itWorkRows = Array.from({ length: itWorkCount }, (_, i) => {
    const w = (d.workExperiences || [])[i] || {};
    const period = w.period || '';
    const companyName = (w.company_name || '').replace(/\s*入社\s*$|\s*退社\s*$/g, '').trim() || '';
    const employmentPlace = w.employmentPlace || '';
    return { period, company_name: companyName, description: w.description || '', employmentPlace };
  });
  const toolsNotes = d.toolsSoftwareNotes || {};
  const toolsNotesLearned = toolsNotes.learned || {};
  const toolsNotesExp = toolsNotes.experienced || {};
  const learnedList = (d.learnedTools || []).filter(t => t != null);
  const expList = (d.experienceTools || []).filter(t => t != null);
  const toolsRowCount = Math.max(1, learnedList.length, expList.length);
  const toolsTableHtml = cvTemplate === 'cv_technical' ? `
  <!-- 使用可能ツール・ソフトウェア等枠 (CV Technical): dữ liệu từ 24 & 25, không checkbox, mỗi ô = [tên | ghi chú] -->
  <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #1f2937;margin-top:8px">
    <tr>
      <td rowspan="${toolsRowCount + 1}" style="border:1px solid #1f2937;padding:6px;text-align:center;vertical-align:middle;background:#e2efd9;width:5rem">使用可能ツール・ソフトウェア等枠</td>
      <td colspan="2" style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">学習したツール・ソフトウェア</td>
      <td colspan="2" style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">業務で利用したツール・ソフトウェア</td>
    </tr>
    ${Array.from({ length: toolsRowCount }).map((_, ri) => {
      const learnedName = learnedList[ri] ?? '';
      const expName = expList[ri] ?? '';
      const learnedDisplay = learnedName ? esc(learnedName) : '　';
      const expDisplay = expName ? esc(expName) : '　';
      const learnedKey = learnedName || `__learned_${ri}`;
      const expKey = expName || `__experienced_${ri}`;
      const noteLearned = toolsNotesLearned[learnedKey] ?? '';
      const noteExp = toolsNotesExp[expKey] ?? '';
      return `<tr>
        <td style="border:1px solid #1f2937;padding:4px;text-align:left;border-right:2px dotted #1f2937">${learnedDisplay}</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center;min-width:2.5rem;border-left:2px dotted #1f2937">${orBlank(noteLearned)}</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:left;border-right:2px dotted #1f2937">${expDisplay}</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center;min-width:2.5rem;border-left:2px dotted #1f2937">${orBlank(noteExp)}</td>
      </tr>`;
    }).join('')}
  </table>
` : '';
  const jlptDisplay = d.jlptLevel ? (String(d.jlptLevel).startsWith('N') ? String(d.jlptLevel) : 'N' + d.jlptLevel) : '';
  const certs = d.certificates || [];
  const certDateStr = (i) => {
    const c = certs[i] || {};
    const y = (c.year || '').trim();
    const m = (c.month || '').trim();
    return (y || m) ? `${y || '　'}年${m || '　'}月` : '　年　月';
  };
  const labelColWidth = '14%'; // chiều rộng chuẩn cho cột tiêu đề bên trái các bảng IT
  const stayPurpose = d.stayPurpose || '';
  const stayPurposeHtml = ['技能', '留学生', '企業内転', '技術人文', '研修']
    .map(label => {
      const checked = stayPurpose === label;
      return `<span style="margin-right:8px">${checked ? '■ ' : '□ '}${label}</span>`;
    })
    .join('');

  const convLabel = (val, value, display) => {
    const text = display || value;
    if (!val) return '□ ' + text;
    return val === value ? '■ ' + text : '□ ' + text;
  };

  /* Layout Rirekisho bám đúng form AddCandidateForm (common): 75% + 25%, cùng thứ tự bảng */
  const rirekishoPart = `
<!-- RIREKISHO (layout = form template common) -->
<div style="max-width:100%;font-size:11px;color:#1f2937;overflow:visible;font-family:${FONT_MINCHO}">
  <div style="display:flex;width:100%">
    <div style="width:75%;padding:4px 12px 12px 12px">
      <div style="font-weight:bold;font-size:18px;line-height:1.1">履歴書</div>
      <div style="font-size:10px;text-align:center;margin-top:4px">${nowStr}</div>
    </div>
    <div style="width:25%"></div>
  </div>
  <table style="border-collapse:collapse;width:100%;border:1px solid #1f2937;font-size:10px">
    <tr>
      <td style="width:75%;border:1px solid #1f2937;padding:6px;vertical-align:top;min-height:7.5rem">
        <div style="color:#6b7280;font-size:10px;margin-bottom:2px">ふりがな</div>
        <div style="border-bottom:1px dotted #9ca3af;min-height:1.2em">${orBlank(d.nameKana)}</div>
        <div style="margin-top:12px;color:#6b7280;font-size:10px;margin-bottom:2px">氏名</div>
        <div style="min-height:5.5em;font-weight:500">${orBlank(d.nameKanji)}</div>
      </td>
      <td style="width:25%;border:none;background:transparent;padding:6px 8px 6px 8px;vertical-align:middle;text-align:center">
        <div style="width:3cm;height:4cm;margin:0 auto;overflow:hidden;display:block">
        ${avatarDataUrl ? '<img id="cv-avatar-photo" alt="" style="width:100%;height:100%;object-fit:cover;display:block" />' : ''}
        </div>
      </td>
    </tr>
    <tr>
      <td style="width:75%;border:1px solid #1f2937;padding:6px;vertical-align:middle">
        <span style="color:#6b7280;font-size:10px">生年月日</span> ${birthFormatted}
      </td>
      <td style="border:1px solid #1f2937;padding:6px;vertical-align:top">
        <div style="color:#6b7280;font-size:10px;margin-bottom:2px">※性別</div>
        <div style="min-height:1.6em;text-align:center">${orBlank(d.gender)}</div>
      </td>
    </tr>
    <tr>
      <td style="width:75%;border:1px solid #1f2937;padding:6px;vertical-align:top">
        <div style="color:#6b7280;font-size:10px;margin-bottom:2px">ふりがな</div>
        <div style="border-bottom:1px dotted #9ca3af;min-height:1.2em">　</div>
        <div style="margin-top:4px;color:#6b7280;font-size:10px">現住所</div>
        <div style="margin-top:2px">〒 ${orBlank(d.postalCode)} ${orBlank(d.address)}</div>
      </td>
      <td style="border:1px solid #1f2937;padding:6px;vertical-align:top">
        <div style="color:#6b7280;font-size:10px;margin-bottom:2px">電話</div>
        <div style="min-height:2em">${orBlank(d.phone)}</div>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border:1px solid #1f2937;padding:6px">
        <span style="color:#6b7280;font-size:10px">E-mail</span> ${orBlank(d.email)}
      </td>
    </tr>
    <tr>
      <td style="width:75%;border:1px solid #1f2937;padding:6px;vertical-align:top">
        <div style="color:#6b7280;font-size:10px;margin-bottom:2px">ふりがな</div>
        <div style="border-bottom:1px dotted #9ca3af;min-height:1.2em">　</div>
      </td>
      <td rowspan="2" style="border:1px solid #1f2937;padding:6px;vertical-align:top">
        <div style="color:#6b7280;font-size:10px;margin-bottom:2px">電話</div>
        <div style="min-height:3rem">${orBlank(d.phone)}</div>
      </td>
    </tr>
    <tr>
      <td style="width:75%;border:1px solid #1f2937;padding:6px;vertical-align:top">
        <div style="color:#6b7280;font-size:10px">連絡先</div>
        <div style="font-size:9px;color:#6b7280;margin-top:2px">（現住所以外に連絡を希望する場合のみ記入）</div>
        <div style="border-bottom:1px dotted #9ca3af;margin-top:4px;min-height:1.5em">${d.addressOrigin ? '〒 ' + esc(d.addressOrigin) : '　'}</div>
      </td>
    </tr>
  </table>
  <table style="border-collapse:collapse;width:100%;border:1px solid #1f2937;font-size:10px;margin-top:16px">
    <thead><tr><th style="width:8%;border:1px solid #1f2937;padding:6px;text-align:center;font-weight:normal">年</th><th style="width:8%;border:1px solid #1f2937;padding:6px;text-align:center;font-weight:normal">月</th><th style="border:1px solid #1f2937;padding:6px;text-align:left;font-weight:normal">学歴</th></tr></thead>
    <tbody>${eduRows}</tbody>
    <thead><tr><th style="width:8%;border:1px solid #1f2937;padding:6px;text-align:center;font-weight:normal">年</th><th style="width:8%;border:1px solid #1f2937;padding:6px;text-align:center;font-weight:normal">月</th><th style="border:1px solid #1f2937;padding:6px;text-align:left;font-weight:normal">職歴</th></tr></thead>
    <tbody>${workRows}<tr><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">　</td><td style="border:1px solid #1f2937;padding:4px;text-align:center;width:8%">　</td><td style="border:1px solid #1f2937;padding:4px;text-align:right">以上</td></tr></tbody>
    <thead><tr><th style="width:8%;border:1px solid #1f2937;padding:6px;text-align:center;font-weight:normal">年</th><th style="width:8%;border:1px solid #1f2937;padding:6px;text-align:center;font-weight:normal">月</th><th style="border:1px solid #1f2937;padding:6px;text-align:left;font-weight:normal">免許・資格</th></tr></thead>
    <tbody>${certRows}</tbody>
  </table>
  <table style="border-collapse:collapse;width:100%;border:1px solid #1f2937;font-size:10px;margin-top:16px">
    <tr>
      <td style="width:28%;border:1px solid #1f2937;padding:6px">
        <div>現住所の最寄り駅</div>
        <div style="margin-top:4px;min-height:1.2em">${orBlank(d.nearestStationName)}</div>
      </td>
      <td style="width:24%;border:1px solid #1f2937;padding:6px"><div>扶養家族数(配偶者を除く)</div><div style="margin-top:4px">${orBlank(d.dependentsCount)} 人</div></td>
      <td style="width:24%;border:1px solid #1f2937;padding:6px"><div>配偶者</div><div style="margin-top:4px">${orBlank(d.hasSpouse)}</div></td>
      <td style="width:24%;border:1px solid #1f2937;padding:6px"><div>配偶者の扶養義務</div><div style="margin-top:4px">${orBlank(d.spouseDependent)}</div></td>
    </tr>
  </table>
  <table style="border-collapse:collapse;width:100%;border:1px solid #1f2937;font-size:10px;margin-top:16px">
    <tr>
      <td style="width:50%;border:1px solid #1f2937;padding:6px"><div>在留資格</div><div style="margin-top:4px;min-height:2em">${orBlank(d.jpResidenceStatus)}</div></td>
      <td style="width:50%;border:1px solid #1f2937;padding:6px"><div>在留期限</div><div style="margin-top:4px;min-height:2em">${visaFormatted}</div></td>
    </tr>
  </table>
  <table style="border-collapse:collapse;width:100%;border:1px solid #1f2937;font-size:10px;margin-top:16px">
    <tr>
      <td style="width:50%;border:1px solid #1f2937;padding:6px"><div>自己PR</div><div style="margin-top:4px;min-height:4rem;white-space:pre-wrap">${orBlank(d.strengths)}</div></td>
      <td style="width:50%;border:1px solid #1f2937;padding:6px"><div>趣味・特技</div><div style="margin-top:4px;min-height:4rem;white-space:pre-wrap">${orBlank(d.hobbiesSpecialSkills)}</div></td>
    </tr>
  </table>
  <table style="border-collapse:collapse;width:100%;border:1px solid #1f2937;font-size:10px;margin-top:16px">
    <tr>
      <td style="border:1px solid #1f2937;padding:6px"><div>志望動機</div><div style="margin-top:4px;min-height:5rem;white-space:pre-wrap">${orBlank(d.motivation)}</div></td>
    </tr>
  </table>
  <table class="avoid-break" style="border-collapse:collapse;width:100%;border:1px solid #1f2937;font-size:10px;margin-top:16px">
    <tr>
      <td style="border:1px solid #1f2937;padding:6px">
        <div style="font-weight:500;margin-bottom:4px">本人希望記入欄</div>
        <ul style="margin:4px 0 0 0;padding-left:16px;list-style:none">
          <li style="margin-bottom:2px">- 現在年収: ${orBlank(d.currentSalary)}</li>
          <li style="margin-bottom:2px">- 希望年収: ${orBlank(d.desiredSalary)}</li>
          <li style="margin-bottom:2px">- 希望職種: ${orBlank(d.desiredPosition)}</li>
          <li style="margin-bottom:2px">- 希望勤務地: ${orBlank(d.desiredLocation)}</li>
          <li style="margin-bottom:2px">- 希望入社日: ${orBlank(d.desiredStartDate)}</li>
        </ul>
      </td>
    </tr>
  </table>
</div>`;

  const shokumuPart = `
<!-- SHOKUMU 職務経歴書 – bố cục và màu giống form AddCandidateForm (common, tab 職務経歴書) -->
<div style="font-size:11px;color:#1f2937;font-family:${FONT_MINCHO}">
  <h2 style="text-align:center;font-weight:bold;margin-bottom:16px;font-size:18px">職務経歴書</h2>
  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:12px;margin-bottom:24px">
    <span>${d.cvDocumentDate ? esc(String(d.cvDocumentDate)) : nowStr}</span>
    <span>氏名 ${orBlank(d.nameKanji)}</span>
  </div>
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
    <span style="display:inline-block;width:16px;height:16px;line-height:16px;text-align:center;font-size:10px;font-weight:bold;color:#000">■</span>
    <span style="font-size:12px;font-weight:bold">職務要約</span>
  </div>
  <div style="display:flex;align-items:center;gap:4px;margin-top:40px;margin-bottom:8px">
    <span style="display:inline-block;width:16px;height:16px;line-height:16px;text-align:center;font-size:10px;font-weight:bold;color:#000">■</span>
    <span style="font-size:12px;font-weight:bold">職務経歴</span>
  </div>
  <div style="border:1px solid #1f2937;overflow:hidden">${shokumuBlocks}</div>
  <div style="display:flex;align-items:center;gap:4px;margin-top:24px;margin-bottom:6px">
    <span style="display:inline-block;width:16px;height:16px;line-height:16px;text-align:center;font-size:10px;font-weight:bold;color:#000">■</span>
    <span style="font-size:12px;font-weight:bold">活かせる経験・知識・技術</span>
  </div>
  <div style="border:1px solid #1f2937;min-height:60px;padding:8px;font-size:12px;background:#fafafa;white-space:pre-wrap;margin-bottom:16px">${orBlank(d.technicalSkills)}</div>
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
    <span style="display:inline-block;width:16px;height:16px;line-height:16px;text-align:center;font-size:10px;font-weight:bold;color:#000">■</span>
    <span style="font-size:12px;font-weight:bold">資格</span>
  </div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #1f2937;font-size:10px;margin-bottom:16px">
    <tbody>${certShokumuRows}</tbody>
  </table>
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
    <span style="display:inline-block;width:16px;height:16px;line-height:16px;text-align:center;font-size:10px;font-weight:bold;color:#000">■</span>
    <span style="font-size:12px;font-weight:bold">自己PR</span>
  </div>
  <div style="border:1px solid #1f2937;min-height:80px;padding:8px;font-size:12px;background:#fafafa;white-space:pre-wrap">${orBlank(d.strengths)}</div>
</div>`;

  const circleNum = (n) => ({ 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤', 6: '⑥', 7: '⑦', 8: '⑧', 9: '⑨', 10: '⑩' }[n] || `(${n})`);
  const shokumuBlockCount = Math.max(1, workExps.length);
  const shokumuRowSpan = shokumuBlockCount * 9 + (shokumuBlockCount > 1 ? shokumuBlockCount - 1 : 0);
  const borderDot = '1px dotted #9ca3af';
  const shokumuBox = (arr, key) => (Array.isArray(arr) && arr.includes(key) ? '■' : '□') + ' ・' + esc(key);
  const shokumuItBlockRows = Array.from({ length: shokumuBlockCount }, (_, blockIdx) => {
    const emp = workExps[blockIdx] || {};
    const roles = emp.roleCheckboxes || [];
    const procs = emp.processCheckboxes || [];
    const sep = blockIdx > 0 ? `
        <tr>
          <td style="border:${borderDot};padding:4px;text-align:center;background:#e2efd9;border-top:1px solid #1f2937;border-bottom:1px solid #1f2937">業務内容 (具体的、詳細に記入)</td>
          <td style="border:${borderDot};padding:4px;text-align:center;background:#e2efd9;border-top:1px solid #1f2937;border-bottom:1px solid #1f2937">役割・担当業務</td>
          <td style="border:${borderDot};padding:4px;text-align:center;background:#e2efd9;border-top:1px solid #1f2937;border-bottom:1px solid #1f2937">作業工程</td>
        </tr>` : '';
    return sep + `
        <tr>
          ${blockIdx === 0 ? `<td rowspan="${shokumuRowSpan}" style="border:1px solid #1f2937;padding:6px;vertical-align:top;width:18%;white-space:pre-wrap">${orBlank(workExps[0]?.company_name)}</td>` : ''}
          <td style="border:${borderDot};padding:4px"><strong>【期間】${circleNum(blockIdx + 1)}</strong> ${orBlank(emp.period)}</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(roles, 'PM')}</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(procs, '要件定義')}</td>
        </tr>
        <tr>
          <td style="border:${borderDot};padding:4px"><strong>【プロジェクト名】</strong> ${orBlank(emp.business_purpose)}</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(roles, 'PL')}</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(procs, '基本設計')}</td>
        </tr>
        <tr>
          <td style="border:${borderDot};padding:4px"><strong>【チーム人数】</strong> ${orBlank(emp.scale_role)}</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(roles, 'サブリーダー')}</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(procs, '詳細設計')}</td>
        </tr>
        <tr>
          <td rowspan="5" style="border:${borderDot};padding:4px;min-height:4em"><strong>【担当業務】</strong><div style="white-space:pre-wrap;margin-top:2px">${orBlank(emp.description)}</div></td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(roles, 'プログラマー')}</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(procs, '実装・単体')}</td>
        </tr>
        <tr>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(roles, 'BrSE')}</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(procs, '結合テスト')}</td>
        </tr>
        <tr>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(roles, 'その他')}</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(procs, '総合テスト')}</td>
        </tr>
        <tr>
          <td style="border:${borderDot};padding:4px;font-size:9px;color:#6b7280">(テスター)</td>
          <td style="border:${borderDot};padding:4px;font-size:9px">${shokumuBox(procs, '保守・運用')}</td>
        </tr>
        <tr>
          <td style="border:${borderDot};padding:4px">　</td>
          <td style="border:${borderDot};padding:4px">　</td>
        </tr>`;
  }).join('');

  const shokumuPartIt = `
<!-- SHOKUMU IT (職務経歴書 – CV IT layout, 1 bảng nhiều block ①②③...) -->
<div style="font-size:11px;color:#1f2937;padding:10px;font-family:${FONT_MINCHO}">
  <div style="border:1px solid #1f2937;padding:8px;text-align:center;font-weight:bold;background:#e2efd9;font-size:14px">職務経歴書</div>
  <div style="display:flex;justify-content:flex-end;gap:24px;font-size:10px;margin:8px 0">
    <span>${d.cvDocumentDate ? esc(String(d.cvDocumentDate)) : nowStr}</span>
    <span>氏名 ${orBlank(d.nameKanji)}</span>
  </div>
  <div style="margin-bottom:8px;font-size:10px"><strong>■ 職務要約</strong></div>
  <div style="border:1px solid #1f2937;border-radius:4px;min-height:60px;padding:8px;font-size:10px;background:#fafafa;white-space:pre-wrap;margin-bottom:16px">${orBlank(d.careerSummary)}</div>
  <div style="border:1px solid #1f2937;margin-bottom:12px">
    <div style="padding:6px;text-align:center;font-weight:bold;background:#e2efd9;border-bottom:1px solid #1f2937">職務経歴</div>
    <table style="width:100%;border-collapse:collapse;font-size:10px">
      <thead>
        <tr>
          <th style="border:1px solid #1f2937;padding:6px;text-align:center;background:#e2efd9;width:18%">就業先</th>
          <th style="border:1px solid #1f2937;padding:6px;text-align:center;background:#e2efd9;min-width:35%">業務内容 (具体的、詳細に記入)</th>
          <th style="border:1px solid #1f2937;padding:6px;text-align:center;background:#e2efd9;width:22%">役割・担当業務</th>
          <th style="border:1px solid #1f2937;padding:6px;text-align:center;background:#e2efd9;width:20%">作業工程</th>
        </tr>
      </thead>
      <tbody>
${shokumuItBlockRows}
      </tbody>
    </table>
  </div>
  ${showSkills ? `<div style="font-weight:bold;margin-bottom:6px;font-size:12px">■ 活かせる経験、知識、技術</div><div style="border:1px solid #1f2937;border-radius:4px;min-height:60px;padding:8px;font-size:10px;background:#fafafa;white-space:pre-wrap;margin-bottom:16px">${skillsHtml}</div>` : ''}
  <div style="font-weight:bold;margin-bottom:6px;font-size:12px">■ 資格</div>
  <table style="border:1px solid #1f2937;font-size:10px;margin-bottom:16px;width:100%"><tbody>${certShokumuRows}</tbody></table>
  <div style="font-weight:bold;margin-bottom:6px;font-size:12px">■ 自己PR</div>
  <div style="border:1px solid #1f2937;border-radius:4px;min-height:60px;padding:8px;font-size:10px;background:#fafafa;white-space:pre-wrap">${orBlank(d.strengths)}</div>
</div>`;

  const shokumuPartTechnical = `
<!-- SHOKUMU TECHNICAL (職務経歴書 – CV Technical layout) -->
<div style="font-size:11px;color:#1f2937;padding:10px;font-family:${FONT_MINCHO}">
  <div style="border:1px solid #1f2937;padding:8px;text-align:center;font-weight:bold;background:#e2efd9;font-size:14px">職務経歴書</div>
  <div style="display:flex;justify-content:flex-end;gap:24px;font-size:10px;margin:8px 0">
    <span>${d.cvDocumentDate ? esc(String(d.cvDocumentDate)) : nowStr}</span>
    <span>氏名 ${orBlank(d.nameKanji)}</span>
  </div>
  <div style="margin-bottom:8px;font-size:10px"><strong>■ 職務要約</strong></div>
  <div style="border:1px solid #1f2937;border-radius:4px;min-height:80px;padding:8px;font-size:10px;background:#fafafa;white-space:pre-wrap;margin-bottom:16px">${orBlank(d.careerSummary)}</div>

  <!-- 職務経歴 (match CvTemplateTechnical.jsx tab shokumu) -->
  <div style="border:1px solid #1f2937;padding:6px;text-align:center;font-weight:bold;background:#e2efd9;margin-bottom:0">職務経歴</div>
  ${(() => {
    const labels = ['【職歴１】', '【職歴２】', '【職歴３】'];
    const defaultPeriods = ['2016年6月 ~ 2018年6月 (例)', '2018年6月 ~ 2022年6月 (例)', '2022年6月 ~ 現在 (例)'];
    const list = workExpsPadded;
    return list.map((emp, blockIndex) => {
      const label = labels[blockIndex] || `【職歴${blockIndex + 1}】`;
      const pd = defaultPeriods[blockIndex] || '';
      return `
  <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #1f2937;border-top:${blockIndex === 0 ? 'none' : '0'};margin-top:0">
    <tbody>
      <tr>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e5e7eb;width:11%">${esc(label)}</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e5e7eb;width:40%;min-width:38%">${orBlank(emp.company_name)}</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e5e7eb">${orBlank(emp.position_name)}</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e5e7eb;width:12%;max-width:12%">勤務地</td>
      </tr>
      <tr>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#fff;width:11%">期間</td>
        <td colspan="2" style="border:1px solid #1f2937;padding:4px;text-align:center;background:#fff">業務内容</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#fff;width:12%;max-width:12%">使用ツール</td>
      </tr>
      <tr>
        <td rowspan="4" style="border:1px solid #1f2937;padding:6px;text-align:center;vertical-align:middle;background:#fff;width:11%;white-space:pre-wrap">${orBlank(emp.period || pd)}</td>
        <td rowspan="4" colspan="2" style="border:1px solid #1f2937;padding:8px;vertical-align:top;background:#fff;white-space:pre-wrap">${orBlank(emp.description)}</td>
        <td rowspan="4" style="border:1px solid #1f2937;padding:6px;vertical-align:top;background:#fff;width:12%;max-width:12%;white-space:pre-wrap">${orBlank(emp.tools_tech)}</td>
      </tr>
      <tr></tr><tr></tr><tr></tr>
    </tbody>
  </table>`;
    }).join('');
  })()}

  <div style="margin-top:16px">
  ${showSkills ? `<div style="font-weight:bold;margin-bottom:6px;font-size:12px">■ 活かせる経験、知識、技術</div><div style="border:1px solid #1f2937;border-radius:4px;min-height:60px;padding:8px;font-size:10px;background:#fafafa;white-space:pre-wrap;margin-bottom:16px">${skillsHtml}</div>` : ''}
  <div style="font-weight:bold;margin-bottom:6px;font-size:12px">■ 資格</div>
  <table style="border:1px solid #1f2937;font-size:10px;margin-bottom:16px;width:100%"><tbody>${certShokumuRows}</tbody></table>
  <div style="font-weight:bold;margin-bottom:6px;font-size:12px">■ 自己PR</div>
  <div style="border:1px solid #1f2937;border-radius:4px;min-height:60px;padding:8px;font-size:10px;background:#fafafa;white-space:pre-wrap">${orBlank(d.strengths)}</div>
  </div>
</div>`;

  // Template IT / Technical: layout bám sát preview IT/Technical trong AddCandidateForm
  const rirekishoPartIt = `
<!-- RIREKISHO (IT/Technical layout) -->
<div style="max-width:100%;min-height:240px;border:1px solid #1f2937;padding:10px;font-size:11px;overflow:visible;font-family:${FONT_MINCHO}">
  <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #1f2937">
    <tr>
      <td colspan="7" style="border:1px solid #1f2937;padding:6px;text-align:center;font-weight:bold;background:#e2efd9;font-size:14px">履歴書</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;width:9%;background:#e2efd9;text-align:center">フリガナ</td>
      <td style="border:1px solid #1f2937;padding:4px;width:26%">${orBlank(d.nameKana)}</td>
      <td style="border:1px solid #1f2937;padding:4px;width:9%;background:#e2efd9;text-align:center">生年月日</td>
      <td style="border:1px solid #1f2937;padding:4px;width:18%">${d.birthDate ? esc(d.birthDate) : '　'}</td>
      <td style="border:1px solid #1f2937;padding:4px;width:8%;background:#e2efd9;text-align:center">年齢</td>
      <td style="border:1px solid #1f2937;padding:4px;width:10%">${orBlank(d.age)}</td>
      <td rowspan="5" style="border:1px solid #1f2937;padding:4px;width:20%;text-align:center;vertical-align:middle">
        <div style="width:3cm;height:4cm;margin:0 auto;overflow:hidden;display:block;border:1px solid #d1d5db">
        ${avatarDataUrl ? '<img id="cv-avatar-photo" alt="" style="width:100%;height:100%;object-fit:cover;display:block" />' : '<span style="font-size:10px;color:#9ca3af;line-height:3cm;display:inline-block">＜顔写真＞</span>'}
        </div>
      </td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">氏名</td>
      <td style="border:1px solid #1f2937;padding:4px">${orBlank(d.nameKanji)}</td>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">性別</td>
      <td style="border:1px solid #1f2937;padding:4px">${orBlank(d.gender)}</td>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">パスポート</td>
      <td style="border:1px solid #1f2937;padding:4px">${orBlank(d.passport)}</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">Email</td>
      <td style="border:1px solid #1f2937;padding:4px">${orBlank(d.email)}</td>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">電話</td>
      <td style="border:1px solid #1f2937;padding:4px">${orBlank(d.phone)}</td>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">Skype ID</td>
      <td style="border:1px solid #1f2937;padding:4px">${orBlank(d.skypeId)}</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">現住所</td>
      <td style="border:1px solid #1f2937;padding:4px">${(d.postalCode ? '〒' + esc(d.postalCode) + ' ' : '') + orBlank(d.address)}</td>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">出身地</td>
      <td style="border:1px solid #1f2937;padding:4px">${orBlank(d.addressOrigin)}</td>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">配偶者</td>
      <td style="border:1px solid #1f2937;padding:4px">${orBlank(d.hasSpouse)}</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">日本滞在目的</td>
      <td colspan="3" style="border:1px solid #1f2937;padding:4px">
        ${stayPurposeHtml}
      </td>
      <td style="border:1px solid #1f2937;padding:4px;background:#e2efd9;text-align:center">ビザの期限</td>
      <td style="border:1px solid #1f2937;padding:4px">${visaFormatted}</td>
    </tr>
  </table>

  <!-- 学歴 bảng theo layout IT (1 dòng/trường, 入学・卒業 trên cùng dòng) -->
  <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #1f2937;margin-top:8px">
    <tr>
      <td rowspan="${1 + Math.max(1, (d.educations || []).length)}" style="border:1px solid #1f2937;padding:6px;text-align:center;width:${labelColWidth};background:#e2efd9">学歴</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">学校名 (英語名)</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">学部・専攻</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">入学年月 (y/m)</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">卒業年月 (y/m)</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">年数</td>
    </tr>
    ${Array.from({ length: Math.max(1, (d.educations || []).length) }).map((_, i) => {
      const edu = (d.educations || [])[i] || {};
      const startYm = edu.year || edu.month ? `${edu.year || ''}/${edu.month || ''}` : '';
      const endYm = edu.endYear || edu.endMonth ? `${edu.endYear || ''}/${edu.endMonth || ''}` : '';
      const schoolName = edu.school_name != null ? String(edu.school_name).trim() : '';
      const major = edu.major != null ? String(edu.major).trim() : '';
      const schoolDisplay = schoolName || (edu.content ? String(edu.content).split(/\s*\/\s*/)[0]?.trim() : '') || '　';
      const majorDisplay = major || (edu.content ? String(edu.content).split(/\s*\/\s*/).slice(1).join(' / ').trim() : '') || '　';
      return `<tr>
        <td style="border:1px solid #1f2937;padding:4px">${orBlank(schoolDisplay)}</td>
        <td style="border:1px solid #1f2937;padding:4px">${orBlank(majorDisplay)}</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center">${startYm || '　'}</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center">${endYm || '　'}</td>
        <td style="border:1px solid #1f2937;padding:4px;text-align:center">　</td>
      </tr>`;
    }).join('')}
  </table>

  <!-- 外国語の会話レベル -->
  <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #1f2937;margin-top:8px">
    <tr>
      <td rowspan="4" style="border:1px solid #1f2937;padding:6px;text-align:center;width:${labelColWidth};background:#e2efd9">外国語の会話レベル</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">日本語</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">英語</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">その他 ( )</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9;width:22%">言語スキル補足説明</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9;width:22%">備考</td>
    </tr>
    <tr>
      <td style="border-top:1px solid #1f2937;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:4px">${convLabel(d.jpConversationLevel, 'native', 'ネイティブ')}</td>
      <td style="border-top:1px solid #1f2937;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:4px">${convLabel(d.enConversationLevel, 'native', 'ネイティブ')}</td>
      <td style="border-top:1px solid #1f2937;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:4px">${convLabel(d.otherConversationLevel, 'native', 'ネイティブ')}</td>
      <td rowspan="3" style="border:1px solid #1f2937;padding:4px;vertical-align:top">${d.jlptLevel ? (String(d.jlptLevel).startsWith('N') ? orBlank(d.jlptLevel) : orBlank('N' + d.jlptLevel)) : '　'}</td>
      <td rowspan="3" style="border:1px solid #1f2937;padding:4px;vertical-align:top">${orBlank(d.notes)}</td>
    </tr>
    <tr>
      <td style="border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:4px">${convLabel(d.jpConversationLevel, 'business', 'ビジネス')}</td>
      <td style="border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:4px">${convLabel(d.enConversationLevel, 'business', 'ビジネス')}</td>
      <td style="border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:4px">${convLabel(d.otherConversationLevel, 'business', 'ビジネス')}</td>
    </tr>
    <tr>
      <td style="border-left:1px solid #1f2937;border-right:1px solid #1f2937;border-bottom:1px solid #1f2937;padding:4px">${convLabel(d.jpConversationLevel, 'daily', '日常会話')}</td>
      <td style="border-left:1px solid #1f2937;border-right:1px solid #1f2937;border-bottom:1px solid #1f2937;padding:4px">${convLabel(d.enConversationLevel, 'daily', '日常会話')}</td>
      <td style="border-left:1px solid #1f2937;border-right:1px solid #1f2937;border-bottom:1px solid #1f2937;padding:4px">${convLabel(d.otherConversationLevel, 'daily', '日常会話')}</td>
    </tr>
  </table>

  <!-- 保有資格・免許等 -->
  <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #1f2937;margin-top:8px">
    <tr>
      <td rowspan="5" style="border:1px solid #1f2937;padding:6px;text-align:center;width:${labelColWidth};background:#e2efd9">保有資格・免許等</td>
      <td style="border:1px solid #1f2937;padding:4px;width:12%;background:#e2efd9"></td>
      <td colspan="4" style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">名称</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">取得年月</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">名称</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">取得年月</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">日本語検定</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;width:6%">${jlptDisplay === 'N1' ? '■ N1' : '□ N1'}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;width:6%">${jlptDisplay === 'N2' ? '■ N2' : '□ N2'}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;width:6%">${jlptDisplay === 'N3' ? '■ N3' : '□ N3'}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;width:6%">${jlptDisplay === 'N4' ? '■ N4' : '□ N4'}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${esc(certDateStr(0))}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${orBlank(certs[0]?.name)}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${esc(certDateStr(1))}</td>
    </tr>
    <tr>
      <td rowspan="2" style="border:1px solid #1f2937;padding:4px;text-align:center">英語</td>
      <td colspan="4" style="border:1px solid #1f2937;padding:4px;text-align:center">
        TOEIC ${d.toeicScore ? esc(d.toeicScore + '点') : '（　　　点）'}
      </td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${esc(certDateStr(2))}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${orBlank(certs[2]?.name)}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${esc(certDateStr(3))}</td>
    </tr>
    <tr>
      <td colspan="4" style="border:1px solid #1f2937;padding:4px;text-align:center">
        IELTS ${d.ieltsScore ? esc(d.ieltsScore + '点') : '（　　　点）'}
      </td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${esc(certDateStr(4))}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${orBlank(certs[4]?.name)}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${esc(certDateStr(5))}</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">自動車免許</td>
      <td colspan="2" style="border:1px solid #1f2937;padding:4px;text-align:center">
        ${d.hasDrivingLicense === '1' || d.hasDrivingLicense === 'true' || d.hasDrivingLicense === '有る' ? '■ 有る' : '□ 有る'}
      </td>
      <td colspan="2" style="border:1px solid #1f2937;padding:4px;text-align:center">
        ${d.hasDrivingLicense === '0' || d.hasDrivingLicense === 'false' || d.hasDrivingLicense === '無し' ? '■ 無し' : '□ 無し'}
      </td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${esc(certDateStr(6))}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${orBlank(certs[6]?.name)}</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center">${esc(certDateStr(7))}</td>
    </tr>
  </table>
${toolsTableHtml}

  <!-- 期間 / 就業先 / 企業名 / ポジション・役割 – số dòng theo workExperiences, mặc định 1 -->
  <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #1f2937;margin-top:8px">
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9;width:10rem;max-width:10rem">期間</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9;min-width:9rem">就業先</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9;min-width:14rem">企業名</td>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9;width:8rem;max-width:8rem">ポジション・役割</td>
    </tr>
    ${itWorkRows.map(row => `
    <tr>
      <td style="border:1px solid #1f2937;padding:6px;text-align:center;vertical-align:middle;white-space:pre-wrap">${orBlank(row.period)}</td>
      <td style="border:1px solid #1f2937;padding:6px;text-align:center;vertical-align:middle;white-space:pre-wrap">${orBlank(row.employmentPlace)}</td>
      <td style="border:1px solid #1f2937;padding:6px;vertical-align:middle;white-space:pre-wrap">${orBlank(row.company_name)}</td>
      <td style="border:1px solid #1f2937;padding:6px;vertical-align:middle;white-space:pre-wrap">${orBlank(row.description)}</td>
    </tr>
    `).join('')}
  </table>

  <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #1f2937;margin-top:8px">
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">自己PR (大学での成績順位、頑張ったこと、趣味等)</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:6px;min-height:80px;white-space:pre-wrap">${orBlank(d.strengths || d.careerSummary || d.hobbiesSpecialSkills)}</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">応募動機</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:6px;min-height:80px;white-space:pre-wrap">${orBlank(d.motivation)}</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:4px;text-align:center;background:#e2efd9">備考</td>
    </tr>
    <tr>
      <td style="border:1px solid #1f2937;padding:8px;white-space:pre-wrap;font-size:10px">
        <div>・現年収: ${orBlank(d.currentSalary)}</div>
        <div>・希望年収: ${orBlank(d.desiredSalary)}</div>
        <div>・希望職種: ${orBlank(d.desiredPosition)}</div>
        <div>・希望勤務地: ${orBlank(d.desiredLocation)}</div>
        <div>・在留資格の種類: 技術・人文知識・国際業務</div>
        <div>・在留期間: ${d.visaExpirationDate ? esc(d.visaExpirationDate) : '年月日'}</div>
        <div>・在留カードに記載の就労制限:「在留資格に基づく就労活動のみ可」</div>
      </td>
    </tr>
  </table>
</div>`;

  const chosenRirekisho = useItLayout ? rirekishoPartIt : rirekishoPart;
  const chosenShokumu = cvTemplate === 'cv_it' ? shokumuPartIt
    : cvTemplate === 'cv_technical' ? shokumuPartTechnical
    : shokumuPart;

  if (tab === 'rirekisho') return HTML_HEAD + chosenRirekisho + '</body></html>';
  if (tab === 'shokumu') return HTML_HEAD + chosenShokumu + '</body></html>';
  return HTML_HEAD + chosenRirekisho + '<div class="page-break"></div>' + chosenShokumu + '</body></html>';
}
