import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import { BUSINESS_SECTOR_OPTIONS } from '../../utils/businessSectorOptions';
import JdTemplate from '../../component/Admin/AddJob/JdTemplate';
import { JOB_HIGHLIGHT_OPTIONS } from '../../utils/jobHighlightOptions';
import { JAPANESE_LEVEL_OPTIONS, EXPERIENCE_YEARS_OPTIONS, DRIVER_LICENSE_OPTIONS } from '../../utils/requirementPresetOptions';
import { JAPAN_REGIONS, JAPAN_PREFECTURES, fetchJapanCitiesByPrefecture, kanaToRomaji } from '../../utils/japanLocationData';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Tag,
  Calendar,
  Upload,
  Plus,
  Save,
  X,
  DollarSign as Money,
  Award,
  Users,
  CheckSquare,
  Eye,
} from 'lucide-react';

// Dữ liệu quốc gia và tỉnh/thành phố
const countryProvincesData = {
  'Vietnam': [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu',
    'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương',
    'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
    'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương',
    'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình',
    'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh',
    'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
    'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ],
  'Japan': [
    'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki',
    'Saitama', 'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu', 'Sakai', 'Niigata', 'Hamamatsu',
    'Shizuoka', 'Sagamihara', 'Okayama', 'Kumamoto', 'Kagoshima', 'Utsunomiya', 'Hachioji',
    'Matsuyama', 'Kanazawa', 'Nagano', 'Toyama', 'Gifu', 'Fukushima', 'Mito', 'Akita', 'Aomori',
    'Morioka', 'Yamagata', 'Fukui', 'Tottori', 'Matsue', 'Kofu', 'Maebashi', 'Takamatsu',
    'Tokushima', 'Kochi', 'Miyazaki', 'Naha', 'Okinawa'
  ],
  'Other': [] // Cho phép nhập tùy chỉnh
};

/** Lựa chọn số lượng tuyển dụng (dropdown) */
const NUMBER_OF_HIRES_OPTIONS = [
  { value: '01', label: '01' },
  { value: '02', label: '02' },
  { value: '03', label: '03' },
  { value: '04', label: '04' },
  { value: '05', label: '05' },
  { value: 'Dưới 10 người', label: 'Dưới 10 người' },
  { value: 'Từ 10~20 người', label: 'Từ 10~20 người' },
  { value: 'Trên 20 người', label: 'Trên 20 người' },
  { value: 'Không giới hạn', label: 'Không giới hạn' },
];

const PARSE_JD_API_URL = 'http://13.229.250.2/api_ai/jd/parse-jd2';
/** Tên field form-data khi gửi file. Nếu API trả 422, thử đổi thành 'cv_original'. */
const PARSE_JD_FILE_FIELD = 'file';

const AdminAddJobPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;

  const pickByLanguage = (item, fieldBase = 'name') => {
    if (!item) return '';
    const vi = item[fieldBase] || '';
    const en = item[`${fieldBase}En`] || item[`${fieldBase}_en`] || '';
    const ja = item[`${fieldBase}Jp`] || item[`${fieldBase}_jp`] || '';

    if (language === 'en') return en || vi;
    if (language === 'ja') return ja || vi;
    return vi;
  };
  const [formData, setFormData] = useState({
    // Basic Information (required)
    jobCode: '',
    title: '',
    titleEn: '',
    titleJp: '',
    slug: '', // Auto-generate from title
    description: '',
    descriptionEn: '',
    descriptionJp: '',
    instruction: '',
    instructionEn: '',
    instructionJp: '',
    // Job category (Loại công việc) - chọn bằng popup
    categoryId: '',
    // Lĩnh vực (business sector key) - danh sách giống block Lĩnh vực kinh doanh
    businessSectorKey: '',
    companyId: '',
    // Location
    interviewLocation: '',
    // Salary & Benefits
    bonus: '',
    bonusEn: '',
    bonusJp: '',
    salaryReview: '',
    salaryReviewEn: '',
    salaryReviewJp: '',
    socialInsurance: '',
    socialInsuranceEn: '',
    socialInsuranceJp: '',
    transportation: '',
    transportationEn: '',
    transportationJp: '',
    breakTime: '',
    breakTimeEn: '',
    breakTimeJp: '',
    overtime: '',
    overtimeEn: '',
    overtimeJp: '',
    holidays: '',
    holidaysEn: '',
    holidaysJp: '',
    deadline: '',
    // Recruitment Type
    recruitmentType: '',
    residenceStatus: '',
    residenceStatusEn: '',
    residenceStatusJp: '',
    contractPeriod: '',
    contractPeriodEn: '',
    contractPeriodJp: '',
    probationPeriod: '',
    probationPeriodEn: '',
    probationPeriodJp: '',
    probationDetail: '',
    probationDetailEn: '',
    probationDetailJp: '',
    recruitmentProcess: '',
    recruitmentProcessEn: '',
    recruitmentProcessJp: '',
    transferAbility: '',
    transferAbilityEn: '',
    transferAbilityJp: '',
    highlights: '',
    // Commission
    jobCommissionType: 'fixed', // 'fixed' or 'percent'
    // Status
    status: 1, // 0: Draft, 1: Published, 2: Closed, 3: Expired
    isPinned: false,
    isHot: false,
  });
  
  // Related data arrays
  const [workingLocations, setWorkingLocations] = useState([]);
  const [workingLocationDetails, setWorkingLocationDetails] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [salaryRanges, setSalaryRanges] = useState([
    { salaryRange: '', type: 'yearly' },   // Thu nhập năm
    { salaryRange: '', type: 'monthly' },   // Lương tháng
  ]);
  const [salaryRangeDetails, setSalaryRangeDetails] = useState([]);
  const [overtimeAllowances, setOvertimeAllowances] = useState([]);
  const [overtimeAllowanceDetails, setOvertimeAllowanceDetails] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [smokingPolicies, setSmokingPolicies] = useState([]);
  const [smokingPolicyDetails, setSmokingPolicyDetails] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);
  const [workingHourDetails, setWorkingHourDetails] = useState([]);
  const [jdFileJp, setJdFileJp] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);
  const [types, setTypes] = useState([]);
  const [valuesByType, setValuesByType] = useState({});
  const [jobValues, setJobValues] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddValueModal, setShowAddValueModal] = useState(false);
  const [showEditTypeModal, setShowEditTypeModal] = useState(false);
  const [showEditValueModal, setShowEditValueModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeNameEn, setNewTypeNameEn] = useState('');
  const [newTypeNameJp, setNewTypeNameJp] = useState('');
  const [newValueNames, setNewValueNames] = useState(''); // Textarea: mỗi dòng là một Value
  const [newValueNamesEn, setNewValueNamesEn] = useState('');
  const [newValueNamesJp, setNewValueNamesJp] = useState('');
  const [newValueNameEn, setNewValueNameEn] = useState('');
  const [newValueNameJp, setNewValueNameJp] = useState('');
  const [selectedTypeForValue, setSelectedTypeForValue] = useState('');
  const [useComparisonOperator, setUseComparisonOperator] = useState(false);
  const [comparisonOperator, setComparisonOperator] = useState('');
  const [comparisonValue, setComparisonValue] = useState('');
  const [comparisonValueEnd, setComparisonValueEnd] = useState('');
  const [highlightKeys, setHighlightKeys] = useState([]);
  const [showJobTypeModal, setShowJobTypeModal] = useState(false);
  /** Parent category selected in job type modal (left panel) — right panel shows its children */
  const [selectedJobTypeParentId, setSelectedJobTypeParentId] = useState(null);
  // Recruiting Company state
  const [recruitingCompany, setRecruitingCompany] = useState({
    companyName: '',
    revenue: '',
    numberOfEmployees: '',
    headquarters: '',
    headquartersEn: '',
    headquartersJp: '',
    companyIntroduction: '',
    companyIntroductionEn: '',
    companyIntroductionJp: '',
    stockExchangeInfo: '',
    investmentCapital: '',
    establishedDate: '',
    services: [],
    businessSectors: []
  });
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredCancelButton, setHoveredCancelButton] = useState(false);
  const [hoveredSaveButton, setHoveredSaveButton] = useState(false);
  const [showJdTemplatePreview, setShowJdTemplatePreview] = useState(true);
  const [parseJdLoading, setParseJdLoading] = useState(false);
  const [parseJdError, setParseJdError] = useState('');
  const [parseJdEnabled, setParseJdEnabled] = useState(true);
  const parseJdFileInputRef = useRef(null);
  /** Tab ngôn ngữ form: 'vi' | 'en' | 'jp' — mỗi tab là form nhập riêng cho ngôn ngữ đó; ô chung hiển thị ở cả 3 tab. */
  const [languageTab, setLanguageTab] = useState('vi');
  /** Chọn nhanh điều kiện bắt buộc (mục 11) */
  const [presetJapanese, setPresetJapanese] = useState('');
  const [presetExperience, setPresetExperience] = useState('');
  const [presetDriver, setPresetDriver] = useState('');
  /** Japan 3-level location: region → prefecture → city */
  const [selectedJapanRegion, setSelectedJapanRegion] = useState(null);
  const [selectedJapanPrefecture, setSelectedJapanPrefecture] = useState(null);
  const [japanLocationData, setJapanLocationData] = useState({ flat: [], tree: [] });
  const [japanCitiesLoading, setJapanCitiesLoading] = useState(false);
  /** Popup chọn địa điểm (Việt Nam / Nhật Bản) */
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [bulkJapanAdding, setBulkJapanAdding] = useState(false);
  // Lĩnh vực kinh doanh: select dropdown để thêm nhiều mục
  const [recruitingBusinessSectorKey, setRecruitingBusinessSectorKey] = useState('');

  const addAllJapanLocationsForPrefCodes = async (prefCodes) => {
    const codes = (prefCodes || []).map((c) => String(c).padStart(2, '0'));
    if (!codes.length) return;
    setBulkJapanAdding(true);
    try {
      const results = await Promise.all(codes.map((code) => fetchJapanCitiesByPrefecture(code).then((r) => ({ code, ...r }))));
      const allToAdd = [];
      const toRomaji = (kana, fallback) => (kana ? kanaToRomaji(kana) : fallback);

      for (const { code, tree } of results) {
        const pref = JAPAN_PREFECTURES[code];
        const prefJa = pref?.ja || '';
        const prefEn = pref?.en || '';
        const make = (nameJa, nameKana) => {
          const ja = (prefJa + ' ' + nameJa).trim();
          const alpha = (prefEn + ' ' + toRomaji(nameKana, nameJa)).trim();
          const id = `${code}|${nameJa}`;
          return { location: alpha, locationJp: ja, country: 'Japan', jpId: id };
        };
        (tree || []).forEach((c) => {
          if (c?.standalone) allToAdd.push(make(c.name, c.nameKana));
          else (c?.wards || []).forEach((w) => allToAdd.push(make(w.fullName, w.fullNameKana)));
        });
      }

      setWorkingLocations((prev) => {
        const existing = new Set(
          (prev || [])
            .filter((wl) => wl.country === 'Japan')
            .map((wl) => wl.jpId || `${wl.location}_${wl.country}`)
        );
        const unique = allToAdd.filter((wl) => !existing.has(wl.jpId));
        return [...(prev || []), ...unique];
      });
    } finally {
      setBulkJapanAdding(false);
    }
  };

  const getCategoryDisplayName = (cat) => {
    if (!cat) return '';
    const vi = (cat.name || '').trim();
    const en = (cat.nameEn || cat.name_en || '').trim();
    const ja = (cat.nameJp || cat.name_jp || '').trim();
    if (language === 'en') return en || vi;
    if (language === 'ja') return ja || vi;
    return vi;
  };

  /** Find a category node in tree by id (searches root and nested children) */
  const findCategoryInTree = (tree, targetId) => {
    if (!tree || !targetId) return null;
    for (const node of tree) {
      if (String(node.id) === String(targetId)) return node;
      if (node.children?.length) {
        const found = findCategoryInTree(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const getHighlightLabel = (key) => {
    const opt = JOB_HIGHLIGHT_OPTIONS.find((o) => o.key === key);
    if (!opt) return key;
    if (language === 'en') return opt.en;
    if (language === 'ja') return opt.jp;
    return opt.vi;
  };

  const syncHighlightsToForm = (keysUpdater) => {
    setHighlightKeys((prev) => {
      const next = typeof keysUpdater === 'function' ? keysUpdater(prev) : keysUpdater;
      setFormData((prevForm) => ({
        ...prevForm,
        highlights: next.length ? JSON.stringify(next) : '',
      }));
      return next;
    });
  };

  useEffect(() => {
    loadCategories();
    loadCompanies();
    loadCampaigns();
    loadTypes();
    if (jobId) {
      loadJobData();
    }
  }, [jobId]);

  useEffect(() => {
    if (selectedCountry !== 'Japan') {
      setSelectedJapanRegion(null);
      setSelectedJapanPrefecture(null);
      setJapanLocationData({ flat: [], tree: [] });
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedJapanPrefecture) {
      setJapanLocationData({ flat: [], tree: [] });
      return;
    }
    let cancelled = false;
    setJapanCitiesLoading(true);
    fetchJapanCitiesByPrefecture(selectedJapanPrefecture)
      .then((result) => {
        if (!cancelled) setJapanLocationData(result);
      })
      .catch(() => { if (!cancelled) setJapanLocationData({ flat: [], tree: [] }); })
      .finally(() => { if (!cancelled) setJapanCitiesLoading(false); });
    return () => { cancelled = true; };
  }, [selectedJapanPrefecture]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminJobById(jobId);
      if (response.success && response.data?.job) {
        const job = response.data.job;
        setFormData({
          jobCode: job.jobCode || '',
          title: job.title || '',
          titleEn: job.titleEn || job.title_en || '',
          titleJp: job.titleJp || job.title_jp || '',
          slug: job.slug || generateSlug(job.title || ''),
          description: job.description || '',
          descriptionEn: job.descriptionEn || job.description_en || '',
          descriptionJp: job.descriptionJp || job.description_jp || '',
          instruction: job.instruction || '',
          instructionEn: job.instructionEn || job.instruction_en || '',
          instructionJp: job.instructionJp || job.instruction_jp || '',
          // Loại công việc (categoryId) vẫn lấy từ jobCategoryId
          categoryId: job.jobCategoryId || job.categoryId || '',
          // Lĩnh vực: ưu tiên lấy từ trường riêng trên job; fallback từ recruitingCompany.businessSectors cho job cũ
          businessSectorKey: (() => {
            if (job.businessSectorKey) return job.businessSectorKey;
            try {
              const sectors = job.recruitingCompany?.businessSectors || [];
              if (!Array.isArray(sectors) || sectors.length === 0) return '';
              const first = sectors[0];
              const nameVi = (first.sectorName || '').trim();
              const found = BUSINESS_SECTOR_OPTIONS.find(opt => opt.vi === nameVi);
              return found?.key || found?.vi || '';
            } catch {
              return '';
            }
          })(),
          companyId: job.companyId || '',
          interviewLocation: job.interviewLocation || '',
          bonus: job.bonus || '',
          bonusEn: job.bonusEn || job.bonus_en || '',
          bonusJp: job.bonusJp || job.bonus_jp || '',
          salaryReview: job.salaryReview || '',
          salaryReviewEn: job.salaryReviewEn || job.salary_review_en || '',
          salaryReviewJp: job.salaryReviewJp || job.salary_review_jp || '',
          socialInsurance: job.socialInsurance || '',
          socialInsuranceEn: job.socialInsuranceEn || job.social_insurance_en || '',
          socialInsuranceJp: job.socialInsuranceJp || job.social_insurance_jp || '',
          transportation: job.transportation || '',
          transportationEn: job.transportationEn || job.transportation_en || '',
          transportationJp: job.transportationJp || job.transportation_jp || '',
          breakTime: job.breakTime || '',
          breakTimeEn: job.breakTimeEn || job.break_time_en || '',
          breakTimeJp: job.breakTimeJp || job.break_time_jp || '',
          overtime: job.overtime || '',
          overtimeEn: job.overtimeEn || job.overtime_en || '',
          overtimeJp: job.overtimeJp || job.overtime_jp || '',
          holidays: job.holidays || '',
          holidaysEn: job.holidaysEn || job.holidays_en || '',
          holidaysJp: job.holidaysJp || job.holidays_jp || '',
          deadline: job.deadline || '',
          recruitmentType: job.recruitmentType || '',
          residenceStatus: job.residenceStatus || job.residence_status || '',
          residenceStatusEn: job.residenceStatusEn || job.residence_status_en || '',
          residenceStatusJp: job.residenceStatusJp || job.residence_status_jp || '',
          contractPeriod: job.contractPeriod || '',
          contractPeriodEn: job.contractPeriodEn || job.contract_period_en || '',
          contractPeriodJp: job.contractPeriodJp || job.contract_period_jp || '',
          probationPeriod: job.probationPeriod || job.probation_period || '',
          probationPeriodEn: job.probationPeriodEn || job.probation_period_en || '',
          probationPeriodJp: job.probationPeriodJp || job.probation_period_jp || '',
          probationDetail: job.probationDetail || job.probation_detail || '',
          probationDetailEn: job.probationDetailEn || job.probation_detail_en || '',
          probationDetailJp: job.probationDetailJp || job.probation_detail_jp || '',
          recruitmentProcess: job.recruitmentProcess || '',
          recruitmentProcessEn: job.recruitmentProcessEn || job.recruitment_process_en || '',
          recruitmentProcessJp: job.recruitmentProcessJp || job.recruitment_process_jp || '',
          transferAbility: job.transferAbility || job.transfer_ability || '',
          transferAbilityEn: job.transferAbilityEn || job.transfer_ability_en || '',
          transferAbilityJp: job.transferAbilityJp || job.transfer_ability_jp || '',
          highlights: job.highlights || '',
          jobCommissionType: job.jobCommissionType || 'fixed',
          status: job.status !== undefined ? job.status : 1,
          isPinned: job.isPinned || false,
          isHot: job.isHot || false,
        });
        // Map điểm nổi bật sang danh sách key (nếu có)
        try {
          let keys = [];
          if (job.highlights) {
            if (Array.isArray(job.highlights)) {
              keys = job.highlights;
            } else if (typeof job.highlights === 'string') {
              if (job.highlights.trim().startsWith('[')) {
                const parsed = JSON.parse(job.highlights);
                if (Array.isArray(parsed)) keys = parsed;
              } else {
                const text = job.highlights;
                keys = JOB_HIGHLIGHT_OPTIONS.filter((opt) =>
                  text.includes(opt.vi) || text.includes(opt.en) || text.includes(opt.jp)
                ).map((opt) => opt.key);
              }
            }
          }
          setHighlightKeys(keys);
          // Đồng bộ lại formData.highlights sang dạng JSON keys để preview đa ngôn ngữ
          if (keys.length) {
            setFormData((prevForm) => ({
              ...prevForm,
              highlights: JSON.stringify(keys),
            }));
          }
        } catch {
          setHighlightKeys([]);
        }
        
        // Load related data
        if (job.workingLocations) {
          setWorkingLocations(job.workingLocations.map(wl => ({
            location: wl.location || '',
            country: wl.country || '',
            numberOfHires: wl.numberOfHires ?? ''
          })));
        }
        if (job.workingLocationDetails) {
          setWorkingLocationDetails(job.workingLocationDetails.map(wld => ({
            content: wld.content || '',
            contentEn: wld.contentEn || wld.content_en || '',
            contentJp: wld.contentJp || wld.content_jp || ''
          })));
        }
        if (job.salaryRanges) {
          setSalaryRanges(job.salaryRanges.map(sr => ({
            salaryRange: sr.salaryRange || '',
            type: sr.type || ''
          })));
        }
        if (job.salaryRangeDetails) {
          setSalaryRangeDetails(job.salaryRangeDetails.map(srd => ({
            content: srd.content || '',
            contentEn: srd.contentEn || srd.content_en || '',
            contentJp: srd.contentJp || srd.content_jp || ''
          })));
        }
        if (job.overtimeAllowances) {
          setOvertimeAllowances(job.overtimeAllowances.map(oa => ({
            overtimeAllowanceRange: oa.overtimeAllowanceRange || ''
          })));
        }
        if (job.overtimeAllowanceDetails) {
          setOvertimeAllowanceDetails(job.overtimeAllowanceDetails.map(oad => ({
            content: oad.content || '',
            contentEn: oad.contentEn || oad.content_en || '',
            contentJp: oad.contentJp || oad.content_jp || ''
          })));
        }
        if (job.requirements) {
          const reqs = job.requirements.map(req => ({
            content: req.content || '',
            contentEn: req.contentEn || req.content_en || '',
            contentJp: req.contentJp || req.content_jp || '',
            type: req.type || '',
            status: req.status || ''
          }));
          setRequirements(reqs);
          const jpOpt = JAPANESE_LEVEL_OPTIONS.find((o) => reqs.some((r) => r.type === 'language' && (r.content === o.vi || r.contentEn === o.en || r.contentJp === o.jp)));
          if (jpOpt) setPresetJapanese(jpOpt.value);
          const expOpt = EXPERIENCE_YEARS_OPTIONS.find((o) => reqs.some((r) => r.type === 'experience' && (r.content === o.vi || r.contentEn === o.en || r.contentJp === o.jp)));
          if (expOpt) setPresetExperience(expOpt.value);
          const drOpt = DRIVER_LICENSE_OPTIONS.find((o) => reqs.some((r) => r.type === 'certification' && (r.content === o.vi || r.contentEn === o.en || r.contentJp === o.jp)));
          if (drOpt) setPresetDriver(drOpt.value);
        }
        if (job.smokingPolicies) {
          setSmokingPolicies(job.smokingPolicies.map(sp => ({
            allow: sp.allow || false
          })));
        }
        if (job.smokingPolicyDetails) {
          setSmokingPolicyDetails(job.smokingPolicyDetails.map(spd => ({
            content: spd.content || '',
            contentEn: spd.contentEn || spd.content_en || '',
            contentJp: spd.contentJp || spd.content_jp || ''
          })));
        }
        if (job.workingHours) {
          setWorkingHours(job.workingHours.map(wh => ({
            workingHours: wh.workingHours || ''
          })));
        }
        if (job.workingHourDetails) {
          setWorkingHourDetails(job.workingHourDetails.map(whd => ({
            content: whd.content || '',
            contentEn: whd.contentEn || whd.content_en || '',
            contentJp: whd.contentJp || whd.content_jp || ''
          })));
        }
        
        // Load job values
        if (job.jobValues && job.jobValues.length > 0) {
          setJobValues(job.jobValues.map(jv => ({
            typeId: jv.typeId || jv.id_typename,
            valueId: jv.valueId || jv.id_value,
            value: jv.value || '',
            isRequired: jv.isRequired || jv.is_required || false
          })));
          // Load values for each type
          job.jobValues.forEach(jv => {
            const typeId = jv.typeId || jv.id_typename;
            if (typeId) {
              loadValuesForType(typeId);
            }
          });
        }
        
        // Load campaigns
        if (job.jobCampaigns && job.jobCampaigns.length > 0) {
          setSelectedCampaignIds(job.jobCampaigns.map(jc => jc.campaignId || jc.campaign?.id).filter(Boolean));
        }
        
        // Load recruiting company
        if (job.recruitingCompany) {
          const rc = job.recruitingCompany;
          setRecruitingCompany({
            companyName: rc.companyName || '',
            revenue: rc.revenue || '',
            numberOfEmployees: rc.numberOfEmployees || '',
            headquarters: rc.headquarters || '',
            headquartersEn: rc.headquartersEn || rc.headquarters_en || '',
            headquartersJp: rc.headquartersJp || rc.headquarters_jp || '',
            companyIntroduction: rc.companyIntroduction || '',
            companyIntroductionEn: rc.companyIntroductionEn || rc.company_introduction_en || '',
            companyIntroductionJp: rc.companyIntroductionJp || rc.company_introduction_jp || '',
            stockExchangeInfo: rc.stockExchangeInfo || '',
            investmentCapital: rc.investmentCapital || '',
            establishedDate: rc.establishedDate || '',
            services: (rc.services || []).map(s => ({
              serviceName: s.serviceName || s.service_name || '',
              serviceNameEn: s.serviceNameEn || s.service_name_en || '',
              serviceNameJp: s.serviceNameJp || s.service_name_jp || '',
              order: s.order || 0
            })),
            businessSectors: (rc.businessSectors || []).map(bs => ({ sectorName: bs.sectorName || '', order: bs.order || 0 }))
          });
        }
      }
    } catch (error) {
      console.error('Error loading job data:', error);
      alert('Lỗi khi tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      const response = await apiService.getAllTypes(true); // includeValues = true
      if (response.success && response.data) {
        setTypes(response.data.types || []);
        // Pre-load values for each type
        const valuesMap = {};
        const types = response.data.types || [];
        
        // Load values for all types to ensure we have all values
        for (const type of types) {
          if (type.values && type.values.length > 0) {
            valuesMap[type.id] = type.values;
          } else {
            // If no values in response, load them separately
            try {
              const valuesResponse = await apiService.getValuesByType(type.id);
              if (valuesResponse.success && valuesResponse.data) {
                valuesMap[type.id] = valuesResponse.data.values || [];
              }
            } catch (err) {
              console.error(`Error loading values for type ${type.id}:`, err);
            }
          }
        }
        setValuesByType(valuesMap);
      }
    } catch (error) {
      console.error('Error loading types:', error);
    }
  };

  const loadValuesForType = async (typeId, forceReload = false) => {
    // Nếu đã load và không force reload thì skip
    if (!forceReload && valuesByType[typeId]) {
      return; // Already loaded
    }
    try {
      const response = await apiService.getValuesByType(typeId);
      if (response.success && response.data) {
        setValuesByType(prev => ({
          ...prev,
          [typeId]: response.data.values || []
        }));
      }
    } catch (error) {
      console.error('Error loading values for type:', error);
    }
  };

  const handleComparisonOperatorChange = (operator) => {
    setComparisonOperator(operator);
    // Clear comparisonValueEnd if not 'between'
    if (operator !== 'between') {
      setComparisonValueEnd('');
    }
  };

  const [cvField, setCvField] = useState('');

  const handleCreateType = async () => {
    if (!newTypeName || !newTypeName.trim()) {
      alert(t.pleaseEnterTypeName);
      return;
    }
    try {
      const typeData = {
        typename: newTypeName.trim(),
        cvField: cvField || null,
        typenameEn: newTypeNameEn?.trim() || null,
        typenameJp: newTypeNameJp?.trim() || null
      };
      const response = await apiService.createType(typeData);
      if (response.success) {
        alert(t.typeCreateSuccess);
        setNewTypeName('');
        setNewTypeNameEn('');
        setNewTypeNameJp('');
        setCvField('');
        setShowAddTypeModal(false);
        await loadTypes();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi tạo Type');
      }
    } catch (error) {
      console.error('Error creating type:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo Type');
    }
  };

  const handleEditType = async () => {
    if (!editingType || !newTypeName || !newTypeName.trim()) {
      alert(t.pleaseEnterTypeName);
      return;
    }
    try {
      const typeData = {
        typename: newTypeName.trim(),
        cvField: cvField || null,
        typenameEn: newTypeNameEn?.trim() || null,
        typenameJp: newTypeNameJp?.trim() || null
      };
      const response = await apiService.updateType(editingType.id, typeData);
      if (response.success) {
        alert(t.typeUpdateSuccess);
        setNewTypeName('');
        setNewTypeNameEn('');
        setNewTypeNameJp('');
        setCvField('');
        setEditingType(null);
        setShowEditTypeModal(false);
        await loadTypes();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật Type');
      }
    } catch (error) {
      console.error('Error updating type:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật Type');
    }
  };

  const handleDeleteType = async (typeId) => {
    if (!window.confirm(t.confirmDeleteType)) {
      return;
    }
    try {
      const response = await apiService.deleteType(typeId);
      if (response.success) {
        alert(t.typeDeleteSuccess);
        // Reload types
        await loadTypes();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa Type');
      }
    } catch (error) {
      console.error('Error deleting type:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa Type');
    }
  };

  const handleEditValue = async () => {
    if (!editingValue || !newValueNames || !newValueNames.trim()) {
      alert(t.pleaseEnterValueName);
      return;
    }
    
    // Validate comparison operator if enabled
    if (useComparisonOperator) {
      if (!comparisonOperator) {
        alert('Vui lòng chọn toán tử so sánh');
        return;
      }
      if (!comparisonValue || !comparisonValue.trim()) {
        alert('Vui lòng nhập giá trị so sánh');
        return;
      }
      if (comparisonOperator === 'between' && (!comparisonValueEnd || !comparisonValueEnd.trim())) {
        alert('Vui lòng nhập giá trị kết thúc cho "between"');
        return;
      }
    }
    
    try {
      const valueData = {
        valuename: newValueNames.trim(),
        comparisonOperator: useComparisonOperator ? comparisonOperator : null,
        comparisonValue: useComparisonOperator ? comparisonValue.trim() : null,
        comparisonValueEnd: (useComparisonOperator && comparisonOperator === 'between') ? comparisonValueEnd.trim() : null,
        valuenameEn: newValueNameEn?.trim() || null,
        valuenameJp: newValueNameJp?.trim() || null
      };
      
      const response = await apiService.updateValue(editingValue.id, valueData);
      if (response.success) {
        alert(t.valueUpdateSuccess);
        await loadValuesForType(editingValue.typeId, true);
        setNewValueNames('');
        setNewValueNameEn('');
        setNewValueNameJp('');
        setEditingValue(null);
        setUseComparisonOperator(false);
        setComparisonOperator('');
        setComparisonValue('');
        setComparisonValueEnd('');
        setShowEditValueModal(false);
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật Value');
      }
    } catch (error) {
      console.error('Error updating value:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật Value');
    }
  };

  const handleDeleteValue = async (valueId, typeId) => {
    if (!window.confirm(t.confirmDeleteValue)) {
      return;
    }
    try {
      const response = await apiService.deleteValue(valueId);
      if (response.success) {
        alert(t.valueDeleteSuccess);
        // Xóa ngay trên UI (optimistic update)
        setValuesByType(prev => {
          const current = prev[typeId] || [];
          return {
            ...prev,
            [typeId]: current.filter(v => v.id !== valueId)
          };
        });
        // Đồng bộ lại từ server để chắc chắn
        await loadValuesForType(typeId, true);
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa Value');
      }
    } catch (error) {
      console.error('Error deleting value:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa Value');
    }
  };

  const handleCreateValue = async () => {
    if (!newValueNames || !newValueNames.trim()) {
      alert(t.pleaseEnterValueName);
      return;
    }
    if (!selectedTypeForValue) {
      alert(t.pleaseSelectType);
      return;
    }
    
    if (useComparisonOperator) {
      if (!comparisonOperator) {
        alert(t.selectOperator || 'Vui lòng chọn toán tử so sánh');
        return;
      }
      if (!comparisonValue || !comparisonValue.trim()) {
        alert(t.comparisonValueLabel + ' ' + (t.pleaseEnterValueName || ''));
        return;
      }
      if (comparisonOperator === 'between' && (!comparisonValueEnd || !comparisonValueEnd.trim())) {
        alert(t.comparisonValueEndLabel + ' ' + (t.pleaseEnterValueName || ''));
        return;
      }
      if (newValueNames.split('\n').filter(v => v.trim().length > 0).length > 1) {
        alert(t.valueNameSingleHint);
        return;
      }
    }
    
    try {
      const typeId = parseInt(selectedTypeForValue);
      const linesEn = (newValueNamesEn || '').split('\n').map(v => v.trim());
      const linesJp = (newValueNamesJp || '').split('\n').map(v => v.trim());
      
      if (useComparisonOperator) {
        const valuename = newValueNames.trim();
        try {
          const valueData = {
            typeId,
            valuename,
            comparisonOperator,
            comparisonValue: comparisonValue.trim(),
            comparisonValueEnd: comparisonOperator === 'between' ? comparisonValueEnd.trim() : null,
            valuenameEn: (newValueNamesEn || '').trim() || null,
            valuenameJp: (newValueNamesJp || '').trim() || null
          };
          const response = await apiService.createValue(valueData);
          if (response.success) {
            alert(t.valueCreateSuccess);
            await loadValuesForType(typeId, true);
            setNewValueNames('');
            setNewValueNamesEn('');
            setNewValueNamesJp('');
            setSelectedTypeForValue('');
            setUseComparisonOperator(false);
            setComparisonOperator('');
            setComparisonValue('');
            setComparisonValueEnd('');
            setShowAddValueModal(false);
          } else {
            alert(response.message || 'Có lỗi xảy ra khi tạo Value');
          }
        } catch (error) {
          console.error('Error creating value:', error);
          alert(error.message || 'Có lỗi xảy ra khi tạo Value');
        }
      } else {
        const valueNames = newValueNames
          .split('\n')
          .map(v => v.trim())
          .filter(v => v.length > 0);
        
        if (valueNames.length === 0) {
          alert(t.enterAtLeastOneValue);
          return;
        }

        const createdValues = [];
        const errors = [];
        
        for (let i = 0; i < valueNames.length; i++) {
          const valuename = valueNames[i];
          const valuenameEn = linesEn[i] || null;
          const valuenameJp = linesJp[i] || null;
          try {
            const response = await apiService.createValue({ 
              typeId,
              valuename,
              valuenameEn: valuenameEn || null,
              valuenameJp: valuenameJp || null
            });
            if (response.success) {
              createdValues.push(response.data.value);
            } else {
              errors.push(`${valuename}: ${response.message || 'Lỗi không xác định'}`);
            }
          } catch (error) {
            errors.push(`${valuename}: ${error.message || 'Lỗi không xác định'}`);
          }
        }

        if (createdValues.length > 0) {
          alert((t.createdValuesCount || 'Đã tạo thành công {count}/{total} Value!').replace('{count}', createdValues.length).replace('{total}', valueNames.length));
          // Reload values for the selected type
          await loadValuesForType(typeId, true);
          // Update valuesByType state immediately
          setValuesByType(prev => ({
            ...prev,
            [typeId]: [...(prev[typeId] || []), ...createdValues]
          }));
        }
        
        if (errors.length > 0) {
          alert(`Có lỗi khi tạo một số Value:\n${errors.join('\n')}`);
        }

        if (createdValues.length > 0) {
          setNewValueNames('');
          setNewValueNamesEn('');
          setNewValueNamesJp('');
          setSelectedTypeForValue('');
          setShowAddValueModal(false);
        }
      }
    } catch (error) {
      console.error('Error creating values:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo Value');
    }
  };

  const loadCategories = async () => {
    try {
      // Ưu tiên API tree để có đủ cha + con (panel Chi tiết hiển thị đúng)
      const treeResponse = await apiService.getJobCategoryTree({ status: 1 });
      if (treeResponse?.success && treeResponse?.data?.tree?.length > 0) {
        const tree = treeResponse.data.tree;
        const flattenCategories = (cats) => {
          const result = [];
          const seenIds = new Set();
          const visit = (list) => {
            (list || []).forEach(cat => {
              if (cat && !seenIds.has(cat.id)) {
                seenIds.add(cat.id);
                result.push(cat);
              }
              if (cat?.children?.length) visit(cat.children);
            });
          };
          visit(cats);
          return result;
        };
        setCategoryTree(tree);
        setCategories(flattenCategories(tree));
        return;
      }
    } catch (treeError) {
      console.log('Tree API not available, falling back to flat list:', treeError?.message);
    }
    // Fallback: danh sách phẳng + build lại cây (giống AgentJobsPageSession1)
    try {
      const response = await apiService.getJobCategories({ status: 1, limit: 500 });
      if (response.success && response.data?.categories?.length > 0) {
        const allCategories = (response.data.categories || []).map(cat => ({
          ...cat,
          id: String(cat.id),
          parentId: cat.parentId ? String(cat.parentId) : null
        }));
        const buildTree = (list) => {
          const map = {};
          list.forEach(cat => { map[cat.id] = { ...cat, children: [] }; });
          const roots = [];
          list.forEach(cat => {
            const node = map[cat.id];
            if (cat.parentId && map[cat.parentId]) {
              map[cat.parentId].children.push(node);
            } else {
              roots.push(node);
            }
          });
          roots.forEach(r => r.children.sort((a, b) => (a.order || 0) - (b.order || 0)));
          return roots;
        };
        const tree = buildTree(allCategories);
        setCategoryTree(tree);
        setCategories(allCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await apiService.getCompanies({ limit: 100 });
      if (response.success && response.data) {
        setCompanies(response.data.companies || []);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await apiService.getAdminCampaigns({ limit: 1000, status: 1 });
      if (response.success && response.data) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
      };
      
      // Auto-generate slug from title
      if (name === 'title' && value) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const parseJdFileAndApplyForm = async (file) => {
    if (!file || (file.size !== undefined && file.size <= 0)) return;
    setParseJdLoading(true);
    setParseJdError('');
    try {
      const formDataUpload = new FormData();
      formDataUpload.append(PARSE_JD_FILE_FIELD, file);
      const res = await fetch(PARSE_JD_API_URL, {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = data?.detail;
        const msg = data?.message || data?.error;
        const detailStr = Array.isArray(detail)
          ? detail.map((d) => d.msg || d.loc?.join?.('.') || JSON.stringify(d)).join('; ')
          : typeof detail === 'string'
            ? detail
            : detail != null ? JSON.stringify(detail) : '';
        const fullMsg = [msg, detailStr].filter(Boolean).join(' — ') || `HTTP ${res.status}`;
        throw new Error(fullMsg);
      }
      const j = data?.data ?? data;
      const titleVi = j.job_title?.vi ?? j.job_title ?? '';
      const titleEn = j.job_title?.en ?? '';
      const titleJp = j.job_title?.ja ?? j.job_title?.jp ?? '';
      let businessSectorKey = '';
      const industryStr = (j.industry ?? '').toString();
      if (industryStr) {
        const firstPart = industryStr.split(/\s*\/\s*/)[0]?.trim() ?? '';
        const found = BUSINESS_SECTOR_OPTIONS.find(
          (opt) =>
            opt.vi === firstPart || opt.en === firstPart || opt.ja === firstPart
        );
        if (found) businessSectorKey = found.key;
      }
      let categoryId = '';
      const categoryStr = (j.job_category ?? '').toString().trim();
      if (categoryStr && categories.length) {
        const firstPart = categoryStr.split(/\s*\/\s*/)[0]?.trim() ?? '';
        let found = categories.find(
          (c) =>
            (c.name && c.name.trim() === categoryStr) ||
            (c.nameEn && c.nameEn.trim() === categoryStr) ||
            (c.nameJp && c.nameJp.trim() === categoryStr)
        );
        if (!found && firstPart) {
          found = categories.find(
            (c) =>
              (c.name && c.name.trim().includes(firstPart)) ||
              (c.nameEn && c.nameEn.trim().includes(firstPart)) ||
              (c.nameJp && c.nameJp.trim().includes(firstPart))
          );
        }
        if (found) categoryId = String(found.id);
      }
      const visaVi = j.visa_status?.vi ?? j.visa_status ?? '';
      const visaEn = j.visa_status?.en ?? '';
      const visaJp = j.visa_status?.ja ?? j.visa_status?.jp ?? '';
      const headcount = j.headcount;
      let numberOfHires = '';
      if (headcount != null && headcount !== '') {
        const n = Number(headcount);
        if (n >= 1 && n <= 5) {
          numberOfHires = n <= 9 ? `0${n}` : String(n);
        } else {
          numberOfHires = String(headcount);
        }
      }
      const descVi = (typeof j.description === 'object' && j.description != null)
        ? (j.description.vi ?? j.description.en ?? '') : String(j.description ?? '');
      const descEn = (typeof j.description === 'object' && j.description != null)
        ? (j.description.en ?? '') : String(j.description_en ?? '');
      const descJp = (typeof j.description === 'object' && j.description != null)
        ? (j.description.ja ?? j.description.jp ?? '') : String(j.description_ja ?? j.description_jp ?? '');
      const instrVi = (typeof j.hiring_reason === 'object' && j.hiring_reason != null)
        ? (j.hiring_reason.vi ?? j.hiring_reason.en ?? '') : String(j.hiring_reason ?? '');
      const instrEn = (typeof j.hiring_reason === 'object' && j.hiring_reason != null)
        ? (j.hiring_reason.en ?? '') : String(j.hiring_reason_en ?? '');
      const instrJp = (typeof j.hiring_reason === 'object' && j.hiring_reason != null)
        ? (j.hiring_reason.ja ?? j.hiring_reason.jp ?? '') : String(j.hiring_reason_ja ?? j.hiring_reason_jp ?? '');
      const reqMustObj = j.requirements_must;
      const reqPrefObj = j.requirements_preferred;
      const reqMustArr = Array.isArray(reqMustObj) ? reqMustObj : [];
      const reqPrefArr = Array.isArray(reqPrefObj) ? reqPrefObj : [];
      const reqMustSingle = typeof reqMustObj === 'object' && reqMustObj !== null && !Array.isArray(reqMustObj)
        ? { content: String(reqMustObj.vi ?? reqMustObj.en ?? ''), contentEn: String(reqMustObj.en ?? ''), contentJp: String(reqMustObj.ja ?? reqMustObj.jp ?? ''), type: 'experience', status: 'required' }
        : null;
      const reqPrefSingle = typeof reqPrefObj === 'object' && reqPrefObj !== null && !Array.isArray(reqPrefObj)
        ? { content: String(reqPrefObj.vi ?? reqPrefObj.en ?? ''), contentEn: String(reqPrefObj.en ?? ''), contentJp: String(reqPrefObj.ja ?? reqPrefObj.jp ?? ''), type: 'other', status: 'preferred' }
        : null;
      const salary = j.salary ?? {};
      const bonusDetailsRaw = salary.bonus_details;
      const bonusText = typeof bonusDetailsRaw === 'object' && bonusDetailsRaw !== null && !Array.isArray(bonusDetailsRaw)
        ? [bonusDetailsRaw.vi, bonusDetailsRaw.en, bonusDetailsRaw.ja].filter(Boolean).join('\n')
        : [bonusDetailsRaw].flat().filter(Boolean).join('\n');
      const raiseDetailsRaw = salary.raise_details;
      const raiseText = typeof raiseDetailsRaw === 'object' && raiseDetailsRaw !== null && !Array.isArray(raiseDetailsRaw)
        ? [raiseDetailsRaw.vi, raiseDetailsRaw.en, raiseDetailsRaw.ja].filter(Boolean).join('\n')
        : [raiseDetailsRaw].flat().filter(Boolean).join('\n');
      const locRaw = j.location;
      const locList = Array.isArray(locRaw) ? locRaw : locRaw ? [locRaw] : [];
      const workingLocationsNext =
        locList.length > 0
          ? locList.map((loc) => ({
              location: typeof loc === 'string' ? loc : (loc?.vi ?? loc?.name ?? loc?.en ?? ''),
              country: typeof loc === 'object' && loc?.country ? loc.country : 'Japan',
              numberOfHires: numberOfHires || (locList.length === 1 ? numberOfHires : ''),
            }))
          : numberOfHires
            ? [{ location: '', country: 'Japan', numberOfHires }]
            : [];
      const salaryMin = salary.min_salary ?? salary.min;
      const salaryMax = salary.max_salary ?? salary.max;
      const salaryRangesNext = [];
      const salaryDetailsNext = [];
      if (salaryMin != null || salaryMax != null) {
        const rangeLabel = [salaryMin, salaryMax].filter((v) => v != null && v !== '').join(' - ');
        if (rangeLabel) {
          salaryRangesNext.push({ salaryRange: rangeLabel, type: (salary.period ?? 'monthly') === 'yearly' ? 'yearly' : 'monthly' });
          const sd = salary.salary_details;
          const detailVi = typeof sd === 'object' && sd != null && !Array.isArray(sd) ? (sd.vi ?? sd.en ?? '') : String(sd ?? '');
          const detailEn = typeof sd === 'object' && sd != null ? (sd.en ?? '') : '';
          const detailJp = typeof sd === 'object' && sd != null ? (sd.ja ?? sd.jp ?? '') : '';
          salaryDetailsNext.push({ content: detailVi || rangeLabel, contentEn: detailEn, contentJp: detailJp });
        }
      }
      const requirementsNext = [
        ...(reqMustSingle ? [reqMustSingle] : reqMustArr.map((t) => ({ content: String(t?.vi ?? t), contentEn: String(t?.en ?? ''), contentJp: String(t?.ja ?? t?.jp ?? ''), type: 'experience', status: 'required' }))),
        ...(reqPrefSingle ? [reqPrefSingle] : reqPrefArr.map((t) => ({ content: String(t?.vi ?? t), contentEn: String(t?.en ?? ''), contentJp: String(t?.ja ?? t?.jp ?? ''), type: 'other', status: 'preferred' }))),
      ];
      if (j.experience_job || j.experience_industry) {
        requirementsNext.unshift({
          content: [j.experience_job, j.experience_industry].filter(Boolean).join(' '),
          contentEn: '',
          contentJp: '',
          type: 'experience',
          status: 'required',
        });
      }
      const featuresVi = Array.isArray(j.features?.vi) ? j.features.vi : j.features ? [j.features] : [];
      const featuresEn = Array.isArray(j.features?.en) ? j.features.en : [];
      const featuresJp = Array.isArray(j.features?.ja) ? j.features.ja : [];
      const highlightKeysNext = [];
      for (const opt of JOB_HIGHLIGHT_OPTIONS) {
        const matchVi = featuresVi.some((f) => String(f).includes(opt.vi));
        const matchEn = featuresEn.some((f) => String(f).includes(opt.en));
        const matchJp = featuresJp.some((f) => String(f).includes(opt.jp));
        if (matchVi || matchEn || matchJp) highlightKeysNext.push(opt.key);
      }
      const company = j.company ?? {};
      const benefitsObj = j.benefits;
      const benefitsVi = typeof benefitsObj === 'object' && benefitsObj != null ? (benefitsObj.vi ?? benefitsObj.en ?? '') : String(benefitsObj ?? '');
      const benefitsEn = typeof benefitsObj === 'object' && benefitsObj != null ? (benefitsObj.en ?? '') : '';
      const benefitsJp = typeof benefitsObj === 'object' && benefitsObj != null ? (benefitsObj.ja ?? benefitsObj.jp ?? '') : '';
      const holidaysObj = j.holidays;
      const holidaysVi = typeof holidaysObj === 'object' && holidaysObj != null ? (holidaysObj.vi ?? holidaysObj.en ?? '') : String(holidaysObj ?? '');
      const holidaysEn = typeof holidaysObj === 'object' && holidaysObj != null ? (holidaysObj.en ?? '') : '';
      const holidaysJp = typeof holidaysObj === 'object' && holidaysObj != null ? (holidaysObj.ja ?? holidaysObj.jp ?? '') : '';
      const probationObj = j.probation;
      const probationVi = typeof probationObj === 'object' && probationObj != null ? (probationObj.vi ?? probationObj.en ?? '') : String(probationObj ?? '');
      const probationEn = typeof probationObj === 'object' && probationObj != null ? (probationObj.en ?? '') : '';
      const probationJp = typeof probationObj === 'object' && probationObj != null ? (probationObj.ja ?? probationObj.jp ?? '') : '';
      const recruitmentProcessRaw = j.recruitment_process;
      const recruitmentProcessVi = typeof recruitmentProcessRaw === 'object' && recruitmentProcessRaw != null ? (recruitmentProcessRaw.vi ?? recruitmentProcessRaw.en ?? '') : String(recruitmentProcessRaw ?? '');
      const recruitmentProcessEn = typeof recruitmentProcessRaw === 'object' && recruitmentProcessRaw != null ? (recruitmentProcessRaw.en ?? '') : '';
      const recruitmentProcessJp = typeof recruitmentProcessRaw === 'object' && recruitmentProcessRaw != null ? (recruitmentProcessRaw.ja ?? recruitmentProcessRaw.jp ?? '') : '';
      setFormData((prev) => ({
        ...prev,
        jobCode: (j.job_code ?? prev.jobCode) || '',
        title: titleVi || prev.title,
        titleEn: titleEn || prev.titleEn,
        titleJp: titleJp || prev.titleJp,
        slug: titleVi ? generateSlug(titleVi) : prev.slug,
        description: descVi || prev.description,
        descriptionEn: descEn || prev.descriptionEn,
        descriptionJp: descJp || prev.descriptionJp,
        instruction: instrVi || prev.instruction,
        instructionEn: instrEn || prev.instructionEn,
        instructionJp: instrJp || prev.instructionJp,
        businessSectorKey: businessSectorKey || prev.businessSectorKey,
        categoryId: categoryId || prev.categoryId,
        recruitmentType: (typeof j.employment_type === 'string' ? j.employment_type : (j.employment_type?.vi ?? j.employment_type?.en ?? '')) || prev.recruitmentType,
        residenceStatus: visaVi || prev.residenceStatus,
        residenceStatusEn: visaEn || prev.residenceStatusEn,
        residenceStatusJp: visaJp || prev.residenceStatusJp,
        bonus: bonusText || prev.bonus,
        salaryReview: raiseText || prev.salaryReview,
        socialInsurance: benefitsVi || prev.socialInsurance,
        socialInsuranceEn: benefitsEn || prev.socialInsuranceEn,
        socialInsuranceJp: benefitsJp || prev.socialInsuranceJp,
        holidays: holidaysVi || prev.holidays,
        holidaysEn: holidaysEn || prev.holidaysEn,
        holidaysJp: holidaysJp || prev.holidaysJp,
        holidayDetails: holidaysVi || prev.holidayDetails,
        holidayDetailsEn: holidaysEn || prev.holidayDetailsEn,
        holidayDetailsJp: holidaysJp || prev.holidayDetailsJp,
        probationPeriod: probationVi ? probationVi : prev.probationPeriod,
        probationDetail: probationVi || prev.probationDetail,
        probationDetailEn: probationEn || prev.probationDetailEn,
        probationDetailJp: probationJp || prev.probationDetailJp,
        recruitmentProcess: recruitmentProcessVi || prev.recruitmentProcess,
        recruitmentProcessEn: recruitmentProcessEn || prev.recruitmentProcessEn,
        recruitmentProcessJp: recruitmentProcessJp || prev.recruitmentProcessJp,
      }));
      setHighlightKeys(highlightKeysNext.length ? highlightKeysNext : highlightKeys);
      if (highlightKeysNext.length) {
        setFormData((p) => ({ ...p, highlights: JSON.stringify(highlightKeysNext) }));
      }
      if (workingLocationsNext.length) {
        setWorkingLocations(workingLocationsNext);
        const locDetails = locList.map((loc) => {
          if (typeof loc === 'object' && loc != null) {
            return { content: String(loc.vi ?? loc.en ?? ''), contentEn: String(loc.en ?? ''), contentJp: String(loc.ja ?? loc.jp ?? '') };
          }
          return { content: String(loc ?? ''), contentEn: '', contentJp: '' };
        });
        setWorkingLocationDetails(locDetails.length ? locDetails : workingLocationsNext.map(() => ({ content: '', contentEn: '', contentJp: '' })));
      }
      if (salaryRangesNext.length) {
        setSalaryRanges(salaryRangesNext);
        setSalaryRangeDetails(salaryDetailsNext.length ? salaryDetailsNext : [{ content: '', contentEn: '', contentJp: '' }]);
      }
      if (requirementsNext.length) setRequirements(requirementsNext);
      const whRaw = j.working_hours;
      if (whRaw) {
        const whList = Array.isArray(whRaw) ? whRaw : [whRaw];
        setWorkingHours(whList.map((w) => ({
          workingHours: typeof w === 'string' ? w : (w?.vi ?? w?.en ?? w?.text ?? ''),
        })));
        setWorkingHourDetails(whList.map((w) => {
          if (typeof w === 'object' && w != null) {
            return { content: String(w.vi ?? w.en ?? ''), contentEn: String(w.en ?? ''), contentJp: String(w.ja ?? w.jp ?? '') };
          }
          return { content: String(w ?? ''), contentEn: '', contentJp: '' };
        }));
      }
      const otRaw = j.overtime_details;
      if (otRaw) {
        const otList = Array.isArray(otRaw) ? otRaw : [otRaw];
        setOvertimeAllowances(otList.map((o) => ({
          overtimeAllowanceRange: typeof o === 'string' ? o : (o?.vi ?? o?.en ?? o?.text ?? ''),
        })));
        setOvertimeAllowanceDetails(otList.map((o) => {
          if (typeof o === 'object' && o != null) {
            return { content: String(o.vi ?? o.en ?? ''), contentEn: String(o.en ?? ''), contentJp: String(o.ja ?? o.jp ?? '') };
          }
          return { content: String(o ?? ''), contentEn: '', contentJp: '' };
        }));
      }
      const overviewObj = company.overview ?? company.introduction;
      const headquarterObj = company.headquarter ?? company.headquarters;
      setRecruitingCompany((prev) => ({
        ...prev,
        companyName: String(company.name ?? (prev.companyName || '')),
        companyIntroduction: typeof overviewObj === 'object' && overviewObj != null ? (overviewObj.vi ?? overviewObj.en ?? '') : String(overviewObj ?? prev.companyIntroduction ?? ''),
        companyIntroductionEn: typeof overviewObj === 'object' && overviewObj != null ? (overviewObj.en ?? '') : (prev.companyIntroductionEn ?? ''),
        companyIntroductionJp: typeof overviewObj === 'object' && overviewObj != null ? (overviewObj.ja ?? overviewObj.jp ?? '') : (prev.companyIntroductionJp ?? ''),
        headquarters: typeof headquarterObj === 'object' && headquarterObj != null ? (headquarterObj.vi ?? headquarterObj.en ?? '') : String(headquarterObj ?? prev.headquarters ?? ''),
        headquartersEn: typeof headquarterObj === 'object' && headquarterObj != null ? (headquarterObj.en ?? '') : (prev.headquartersEn ?? ''),
        headquartersJp: typeof headquarterObj === 'object' && headquarterObj != null ? (headquarterObj.ja ?? headquarterObj.jp ?? '') : (prev.headquartersJp ?? ''),
        numberOfEmployees: company.employee_count != null ? String(company.employee_count) : (prev.numberOfEmployees ?? ''),
        establishedDate: company.established_year != null ? String(company.established_year) : (prev.establishedDate ?? ''),
        investmentCapital: company.capital != null ? String(company.capital) : (prev.investmentCapital ?? ''),
        revenue: company.revenue != null ? String(company.revenue) : (prev.revenue ?? ''),
      }));
    } catch (err) {
      setParseJdError(err?.message || 'Parse JD thất bại');
    } finally {
      setParseJdLoading(false);
    }
  };

  const handleParseJdFileChange = async (e) => {
    const input = e?.target;
    const file = input?.files?.[0];
    if (!file || (file.size !== undefined && file.size <= 0)) {
      if (input) input.value = '';
      return;
    }
    await parseJdFileAndApplyForm(file);
    if (input) input.value = '';
  };

  const handleJdFileJpChange = async (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      setJdFileJp(file);
      await parseJdFileAndApplyForm(file);
    }
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setFormData(prev => ({
      ...prev,
      companyId: companyId || ''
    }));
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobCode || !String(formData.jobCode).trim()) {
      newErrors.jobCode = t.jobCodeRequired || 'Mã việc làm là bắt buộc';
    }

    if (!formData.title || !String(formData.title).trim()) {
      newErrors.title = t.jobTitleRequired || 'Tiêu đề công việc là bắt buộc';
    }

    if (!formData.slug || !String(formData.slug).trim()) {
      newErrors.slug = t.slugRequired || 'Slug là bắt buộc';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = t.jobCategoryRequired || 'Danh mục là bắt buộc';
    }

    // Job Values: nếu typeId = 2 thì phải chọn valueId
    const invalidJobValues = jobValues.filter(jv => jv.typeId === 2 && !jv.valueId);
    if (invalidJobValues.length > 0) {
      newErrors.jobValues = 'Vui lòng chọn Value cho các Type có ID = 2';
    }
    // Định dạng value: số dương; nếu percent thì ≤ 100
    for (const jv of jobValues) {
      if (jv.value) {
        const valueNum = parseFloat(jv.value);
        if (isNaN(valueNum) || valueNum < 0) {
          newErrors.jobValues = 'Giá trị trong Job Values phải là số dương';
          break;
        }
        if (formData.jobCommissionType === 'percent' && valueNum > 100) {
          newErrors.jobValues = 'Phần trăm không được vượt quá 100%';
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Prepare JSON body data
      const requestData = {
        // Required fields
        jobCode: formData.jobCode,
        jobCategoryId: parseInt(formData.categoryId),
        businessSectorKey: formData.businessSectorKey || null,
        title: formData.title,
        titleEn: formData.titleEn || null,
        titleJp: formData.titleJp || null,
        slug: formData.slug || generateSlug(formData.title),
        // Optional basic fields
        description: formData.description || null,
        descriptionEn: formData.descriptionEn || null,
        descriptionJp: formData.descriptionJp || null,
        instruction: formData.instruction || null,
        instructionEn: formData.instructionEn || null,
        instructionJp: formData.instructionJp || null,
        interviewLocation: formData.interviewLocation ? parseInt(formData.interviewLocation) : null,
        bonus: formData.bonus || null,
        bonusEn: formData.bonusEn || null,
        bonusJp: formData.bonusJp || null,
        salaryReview: formData.salaryReview || null,
        salaryReviewEn: formData.salaryReviewEn || null,
        salaryReviewJp: formData.salaryReviewJp || null,
        holidays: formData.holidays || null,
        holidaysEn: formData.holidaysEn || null,
        holidaysJp: formData.holidaysJp || null,
        socialInsurance: formData.socialInsurance || null,
        socialInsuranceEn: formData.socialInsuranceEn || null,
        socialInsuranceJp: formData.socialInsuranceJp || null,
        transportation: formData.transportation || null,
        transportationEn: formData.transportationEn || null,
        transportationJp: formData.transportationJp || null,
        breakTime: formData.breakTime || null,
        breakTimeEn: formData.breakTimeEn || null,
        breakTimeJp: formData.breakTimeJp || null,
        overtime: formData.overtime || null,
        overtimeEn: formData.overtimeEn || null,
        overtimeJp: formData.overtimeJp || null,
        recruitmentType: formData.recruitmentType ? parseInt(formData.recruitmentType) : null,
        residenceStatus: formData.residenceStatus || null,
        residenceStatusEn: formData.residenceStatusEn || null,
        residenceStatusJp: formData.residenceStatusJp || null,
        contractPeriod: formData.contractPeriod || null,
        contractPeriodEn: formData.contractPeriodEn || null,
        contractPeriodJp: formData.contractPeriodJp || null,
        probationPeriod: formData.probationPeriod || null,
        probationPeriodEn: formData.probationPeriodEn || null,
        probationPeriodJp: formData.probationPeriodJp || null,
        probationDetail: formData.probationDetail || null,
        probationDetailEn: formData.probationDetailEn || null,
        probationDetailJp: formData.probationDetailJp || null,
        companyId: formData.companyId ? parseInt(formData.companyId) : null,
        recruitmentProcess: formData.recruitmentProcess || null,
        recruitmentProcessEn: formData.recruitmentProcessEn || null,
        recruitmentProcessJp: formData.recruitmentProcessJp || null,
        transferAbility: formData.transferAbility || null,
        transferAbilityEn: formData.transferAbilityEn || null,
        transferAbilityJp: formData.transferAbilityJp || null,
        highlights: formData.highlights || null,
        deadline: formData.deadline || null,
        status: parseInt(formData.status),
        isPinned: formData.isPinned || false,
        isHot: formData.isHot || false,
        jobCommissionType: formData.jobCommissionType || 'fixed',
        // Related data arrays
        workingLocations: workingLocations.filter(wl => wl.location && wl.location.trim()),
        workingLocationDetails: workingLocationDetails
          .filter(wld =>
            (wld.content && wld.content.trim()) ||
            (wld.contentEn && wld.contentEn.trim()) ||
            (wld.contentJp && wld.contentJp.trim())
          )
          .map(wld => ({
            content: wld.content || null,
            contentEn: wld.contentEn || null,
            contentJp: wld.contentJp || null
          })),
        salaryRanges: salaryRanges.filter(sr => sr.salaryRange && sr.salaryRange.trim()),
        salaryRangeDetails: salaryRangeDetails
          .filter(srd =>
            (srd.content && srd.content.trim()) ||
            (srd.contentEn && srd.contentEn.trim()) ||
            (srd.contentJp && srd.contentJp.trim())
          )
          .map(srd => ({
            content: srd.content || null,
            contentEn: srd.contentEn || null,
            contentJp: srd.contentJp || null
          })),
        overtimeAllowances: overtimeAllowances.filter(oa => oa.overtimeAllowanceRange && oa.overtimeAllowanceRange.trim()),
        overtimeAllowanceDetails: overtimeAllowanceDetails
          .filter(oad =>
            (oad.content && oad.content.trim()) ||
            (oad.contentEn && oad.contentEn.trim()) ||
            (oad.contentJp && oad.contentJp.trim())
          )
          .map(oad => ({
            content: oad.content || null,
            contentEn: oad.contentEn || null,
            contentJp: oad.contentJp || null
          })),
        requirements: requirements
          .filter(req =>
            (req.content && req.content.trim()) ||
            (req.contentEn && req.contentEn.trim()) ||
            (req.contentJp && req.contentJp.trim())
          )
          .map(req => ({
            content: req.content || null,
            contentEn: req.contentEn || null,
            contentJp: req.contentJp || null,
            type: req.type || null,
            status: req.status || null
          })),
        smokingPolicies: smokingPolicies,
        smokingPolicyDetails: smokingPolicyDetails
          .filter(spd =>
            (spd.content && spd.content.trim()) ||
            (spd.contentEn && spd.contentEn.trim()) ||
            (spd.contentJp && spd.contentJp.trim())
          )
          .map(spd => ({
            content: spd.content || null,
            contentEn: spd.contentEn || null,
            contentJp: spd.contentJp || null
          })),
        workingHours: workingHours.filter(wh => wh.workingHours && wh.workingHours.trim()),
        workingHourDetails: workingHourDetails
          .filter(whd =>
            (whd.content && whd.content.trim()) ||
            (whd.contentEn && whd.contentEn.trim()) ||
            (whd.contentJp && whd.contentJp.trim())
          )
          .map(whd => ({
            content: whd.content || null,
            contentEn: whd.contentEn || null,
            contentJp: whd.contentJp || null
          })),
        jobValues: jobValues.map(jv => ({
          typeId: parseInt(jv.typeId),
          valueId: parseInt(jv.valueId),
          value: jv.value || null,
          isRequired: jv.isRequired || false
        })),
        jobPickupIds: [], // TODO: Add job pickup selection if needed
        campaignIds: selectedCampaignIds.map(id => parseInt(id)),
        // Recruiting Company data
        recruitingCompany: recruitingCompany.companyName ? {
          companyName: recruitingCompany.companyName || null,
          revenue: recruitingCompany.revenue || null,
          numberOfEmployees: recruitingCompany.numberOfEmployees || null,
          headquarters: recruitingCompany.headquarters || null,
          headquartersEn: recruitingCompany.headquartersEn || null,
          headquartersJp: recruitingCompany.headquartersJp || null,
          companyIntroduction: recruitingCompany.companyIntroduction || null,
          companyIntroductionEn: recruitingCompany.companyIntroductionEn || null,
          companyIntroductionJp: recruitingCompany.companyIntroductionJp || null,
          stockExchangeInfo: recruitingCompany.stockExchangeInfo || null,
          investmentCapital: recruitingCompany.investmentCapital || null,
          establishedDate: recruitingCompany.establishedDate || null,
          services: recruitingCompany.services
            .filter(s => s.serviceName && s.serviceName.trim())
            .map(s => ({
              serviceName: s.serviceName.trim(),
              serviceNameEn: s.serviceNameEn ? s.serviceNameEn.trim() : null,
              serviceNameJp: s.serviceNameJp ? s.serviceNameJp.trim() : null,
              order: s.order || 0
            })),
          businessSectors: recruitingCompany.businessSectors.filter(bs => bs.sectorName && bs.sectorName.trim()).map(bs => ({
            sectorName: bs.sectorName.trim(),
            order: bs.order || 0
          }))
        } : null
      };

      const response = jobId 
        ? await apiService.updateAdminJob(jobId, requestData)
        : await apiService.createAdminJob(requestData);
      if (response.success) {
        alert(jobId ? 'Job đã được cập nhật thành công!' : 'Job đã được lưu thành công!');
        navigate(jobId ? `/admin/jobs/${jobId}` : '/admin/jobs');
      } else {
        alert(response.message || (jobId ? 'Có lỗi xảy ra khi cập nhật job' : 'Có lỗi xảy ra khi tạo job'));
      }
    } catch (error) {
      console.error(`Error ${jobId ? 'updating' : 'creating'} job:`, error);
      alert(error.message || (jobId ? 'Có lỗi xảy ra khi cập nhật job' : 'Có lỗi xảy ra khi tạo job'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t.jobCancelConfirm || 'Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      navigate(jobId ? `/admin/jobs/${jobId}` : '/admin/jobs');
    }
  };

  return (
    <div className="space-y-3 relative">
      {/* Overlay loading khi đang phân tích JD */}
      {parseJdLoading && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
          aria-busy="true"
          aria-live="polite"
        >
          <div
            className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"
            role="status"
            aria-label={t.parseJdLoading ?? 'Đang xử lý...'}
          />
          <p className="text-sm font-semibold" style={{ color: '#111827' }}>
            {t.parseJdAnalyzingLabel ?? 'Đang phân tích JD...'}
          </p>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            {t.parseJdAnalyzingHint ?? 'Vui lòng đợi trong giây lát'}
          </p>
        </div>
      )}
      {/* Header */}
      <div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(jobId ? `/admin/jobs/${jobId}` : '/admin/jobs')}
            onMouseEnter={() => setHoveredBackButton(true)}
            onMouseLeave={() => setHoveredBackButton(false)}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: hoveredBackButton ? '#f3f4f6' : 'transparent'
            }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#4b5563' }} />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#111827' }}>
              {jobId
                ? t.adminEditJobTitle || 'Chỉnh sửa công việc'
                : t.adminAddJobTitle || 'Tạo công việc'}
            </h1>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              {jobId
                ? t.adminEditJobSubtitle || 'Cập nhật thông tin công việc'
                : t.adminAddJobSubtitle || 'Thêm thông tin công việc mới vào hệ thống'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none" title={parseJdEnabled ? (t.parseJdToggleOff ?? 'Tắt tính năng Parse JD') : (t.parseJdToggleOn ?? 'Bật tính năng Parse JD')}>
            <span className="text-xs font-medium" style={{ color: '#6b7280' }}>
              {t.parseJdFeatureLabel ?? 'Parse JD'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={parseJdEnabled}
              onClick={() => setParseJdEnabled((v) => !v)}
              className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              style={{
                backgroundColor: parseJdEnabled ? '#2563eb' : '#d1d5db'
              }}
            >
              <span
                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform"
                style={{
                  transform: parseJdEnabled ? 'translateX(18px)' : 'translateX(2px)',
                  marginTop: '2px'
                }}
              />
            </button>
          </label>
          {parseJdEnabled && (
            <>
              <input
                ref={parseJdFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleParseJdFileChange}
              />
              <button
                type="button"
                onClick={() => parseJdFileInputRef.current?.click()}
                disabled={parseJdLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border"
                style={{
                  borderColor: '#d1d5db',
                  backgroundColor: parseJdLoading ? '#f9fafb' : '#fff',
                  color: parseJdLoading ? '#9ca3af' : '#374151'
                }}
              >
                {parseJdLoading ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    {t.parseJdLoading ?? 'Đang xử lý...'}
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    {t.parseJdButton ?? 'Tự động điền từ file JD'}
                  </>
                )}
              </button>
              {parseJdError && (
                <span className="text-xs" style={{ color: '#dc2626' }}>{parseJdError}</span>
              )}
            </>
          )}
          <button
            onClick={handleCancel}
            onMouseEnter={() => setHoveredCancelButton(true)}
            onMouseLeave={() => setHoveredCancelButton(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredCancelButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            <X className="w-3.5 h-3.5" />
            {t.cancel || 'Hủy'}
          </button>
          <button
            onClick={handleSubmit}
            onMouseEnter={() => setHoveredSaveButton(true)}
            onMouseLeave={() => setHoveredSaveButton(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredSaveButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            <Save className="w-3.5 h-3.5" />
            {jobId
              ? t.adminEditJobSaveButton || 'Cập nhật công việc'
              : t.adminAddJobSaveButton || 'Lưu công việc'}
          </button>
        </div>
      </div>

      {/* Modal chọn Loại công việc — 2 panel: trái = Loại công việc (cha), phải = Chi tiết (con) */}
      {showJobTypeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
          onClick={() => setShowJobTypeModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
                {t.agentJobsSelectJobType || 'Chọn Loại công việc'}
              </h3>
              <button
                type="button"
                onClick={() => setShowJobTypeModal(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4" style={{ color: '#6b7280' }} />
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Panel trái: Loại công việc (chỉ cha) */}
              <div className="w-1/2 flex flex-col border-r overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
                <div className="px-3 py-2 border-b text-xs font-semibold" style={{ borderColor: '#e5e7eb', color: '#111827' }}>
                  {t.agentJobsSelectJobType || 'Chọn Loại công việc'}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {categoryTree && categoryTree.length > 0 ? (
                    <div className="space-y-0.5">
                      {(categoryTree.filter(cat => !cat.parentId) || []).map((cat) => {
                        const isSelected = String(selectedJobTypeParentId) === String(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedJobTypeParentId(cat.id)}
                            className="w-full text-left px-2 py-1.5 rounded text-xs"
                            style={{
                              backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                              color: isSelected ? '#1d4ed8' : '#111827'
                            }}
                          >
                            {getCategoryDisplayName(cat)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">{t.loading || 'Đang tải...'}</div>
                  )}
                </div>
              </div>
              {/* Panel phải: Chi tiết (con của cha đã chọn) */}
              <div className="w-1/2 flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b text-xs font-semibold" style={{ borderColor: '#e5e7eb', color: '#111827' }}>
                  {t.agentJobsDetails || 'Chi tiết'}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {!selectedJobTypeParentId ? (
                    <p className="text-xs text-gray-500">{t.agentJobsSelectJobTypeFirst || 'Vui lòng chọn Loại công việc trước'}</p>
                  ) : (() => {
                    const parentNode = findCategoryInTree(categoryTree || [], selectedJobTypeParentId);
                    const children = parentNode?.children || [];
                    const renderChild = (node, level = 0) => {
                      const isSelected = String(formData.categoryId) === String(node.id);
                      return (
                        <div key={node.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, categoryId: String(node.id) }));
                              setErrors(prev => ({ ...prev, categoryId: '' }));
                              setShowJobTypeModal(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded text-xs flex items-center"
                            style={{
                              paddingLeft: 8 + level * 16,
                              backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                              color: isSelected ? '#1d4ed8' : '#111827'
                            }}
                          >
                            {level > 0 && <span className="text-gray-400 mr-1">└─</span>}
                            {getCategoryDisplayName(node)}
                          </button>
                          {node.children?.length > 0 && node.children.map(child => renderChild(child, level + 1))}
                        </div>
                      );
                    };
                    return children.length > 0 ? (
                      <div className="space-y-0.5">{children.map(c => renderChild(c, 0))}</div>
                    ) : (
                      <p className="text-xs text-gray-500">{t.noData || 'Không có chi tiết'}</p>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Giao diện 2 cột: cột trái form nhập, cột phải preview JD (có thể sửa trực tiếp trên JD) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
        <div className="min-h-0">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
        {/* Block Import JD - full width, trên cùng */}
        <div className="w-full">
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <FileText className="w-4 h-4 text-blue-600" />
              {t.jobImportJdSectionTitle || 'Import JD'}
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2">
                {t.jobImportJdLabelJp || 'JD File (Tiếng Nhật)'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-600 transition-colors">
                <label htmlFor="jd-upload-jp" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">
                      {t.jobImportJdDragDropText || 'Kéo thả file JD (JP) vào đây'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {t.jobImportJdOrText || 'hoặc'}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {t.jobImportJdChooseFileText || 'Chọn file từ máy tính'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {t.jobImportJdSupportedTypes || 'Hỗ trợ PDF, DOC, DOCX'}
                    </p>
                  </div>
                  <input
                    id="jd-upload-jp"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleJdFileJpChange}
                    className="hidden"
                  />
                </label>
              </div>
              {jdFileJp && (
                <div className="mt-2 text-xs text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>
                    {(t.jobImportJdSelectedFileLabel || 'File đã chọn: {name}')
                      .replace('{name}', jdFileJp.name)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setJdFileJp(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab ngôn ngữ: Việt | English | 日本語 — ô chung (jobCode, status, slug, category, company, ...) hiển thị ở cả 3 tab */}
        <div className="flex gap-1 p-1 rounded-lg border bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
          {[
            { id: 'vi', label: 'Tiếng Việt' },
            { id: 'en', label: 'English' },
            { id: 'jp', label: '日本語' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLanguageTab(tab.id)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                languageTab === tab.id
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Left Column */}
        <div className="space-y-3">
          {/* Block 1: Thông tin cơ bản — theo spec: Tiêu đề, Mã + Trạng thái, Lĩnh vực, Loại công việc, Hình thức, Số lượng tuyển dụng, Điểm nổi bật */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Briefcase className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.jobBasicInfoSectionTitle || 'Thông tin cơ bản'}
            </h2>
            <div className="space-y-3">
              {/* 1. Tiêu đề việc làm */}
              {languageTab === 'vi' && (
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobTitleLabel || 'Tiêu đề việc làm'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="VD: Software Engineer - React/Node.js Developer"
                    required
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{
                      borderColor: errors.title ? '#ef4444' : '#d1d5db',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.title ? '#ef4444' : '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.title && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.title}</p>}
                </div>
              )}
              {languageTab === 'en' && (
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {(t.jobTitleLabel || 'Tiêu đề việc làm') + ' (EN)'}
                  </label>
                  <input
                    type="text"
                    name="titleEn"
                    value={formData.titleEn}
                    onChange={handleInputChange}
                    placeholder="Job title in English"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{ borderColor: '#d1d5db', outline: 'none' }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              )}
              {languageTab === 'jp' && (
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {(t.jobTitleLabel || 'Tiêu đề việc làm') + ' (JP)'}
                  </label>
                  <input
                    type="text"
                    name="titleJp"
                    value={formData.titleJp}
                    onChange={handleInputChange}
                    placeholder="求人票のタイトル（日本語）"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{ borderColor: '#d1d5db', outline: 'none' }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              )}

              {/* 2. Mã công việc + 3. Trạng thái (cùng hàng) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {(t.jobCode || 'Mã công việc')} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="jobCode"
                    value={formData.jobCode}
                    onChange={handleInputChange}
                    placeholder="VD: JOB-001"
                    required
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{
                      borderColor: errors.jobCode ? '#ef4444' : '#d1d5db',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.jobCode ? '#ef4444' : '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.jobCode && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.jobCode}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {(t.status || 'Trạng thái')} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{
                      borderColor: '#d1d5db',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="0">{t.jobStatusDraft || 'Draft'}</option>
                    <option value="1">{t.jobStatusPublished || 'Published'}</option>
                    <option value="2">{t.jobStatusClosed || 'Closed'}</option>
                    <option value="3">{t.jobStatusExpired || 'Expired'}</option>
                  </select>
                </div>
              </div>

              {/* 4. Lĩnh vực (Chọn 1 option) - danh sách giống block Lĩnh vực kinh doanh */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  Lĩnh vực <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="businessSectorKey"
                  value={formData.businessSectorKey}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.categoryId ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">
                    {t.jobCategorySelectPlaceholder || t.pleaseSelect || 'Chọn lĩnh vực'}
                  </option>
                  {BUSINESS_SECTOR_OPTIONS.map((option) => {
                    const label =
                      language === 'en'
                        ? option.en || option.vi
                        : language === 'ja'
                        ? option.ja || option.vi
                        : option.vi;
                    const value = option.key || option.vi;
                    return (
                      <option key={`sector-${value}`} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 5. Loại công việc – chọn bằng popup, hỗ trợ chọn loại cha/con */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.jobTypeLabel || 'Loại công việc'} <span style={{ color: '#ef4444' }}>*</span>
                  <span className="text-gray-500 font-normal ml-1">({t.pleaseSelect || 'Chọn 1 option'})</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setSelectedJobTypeParentId(null); setShowJobTypeModal(true); }}
                  className="w-full px-3 py-2 border rounded-lg text-xs flex items-center justify-between"
                  style={{
                    borderColor: errors.categoryId ? '#ef4444' : '#d1d5db',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <span className="truncate text-left" style={{ color: formData.categoryId ? '#111827' : '#9ca3af' }}>
                    {(() => {
                      const selected = categories.find(c => String(c.id) === String(formData.categoryId));
                      if (selected) return pickByLanguage(selected, 'name');
                      return t.jobCategorySelectPlaceholder || t.pleaseSelect || 'Chọn loại công việc';
                    })()}
                  </span>
                  <span className="ml-2 text-gray-400 text-xs">
                    ▼
                  </span>
                </button>
                {errors.categoryId && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.categoryId}</p>}
              </div>

              {/* 6. Hình thức tuyển dụng + Tư cách lưu trú */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobRecruitmentTypeLabel || 'Hình thức tuyển dụng'} <span className="text-gray-500 font-normal">({t.jobRecruitmentTypePlaceholder || 'Chọn option nhân viên chính thức/hợp đồng...'})</span>
                  </label>
                  <select
                    name="recruitmentType"
                    value={formData.recruitmentType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">{t.jobRecruitmentTypePlaceholder || 'Chọn'}</option>
                    <option value="1">{t.jobRecruitmentTypeOption1 || 'Nhân viên chính thức'}</option>
                    <option value="2">{t.jobRecruitmentTypeOption2 || 'Nhân viên hợp đồng có thời hạn'}</option>
                    <option value="3">{t.jobRecruitmentTypeOption3 || 'Nhân viên phái cử'}</option>
                    <option value="4">{t.jobRecruitmentTypeOption4 || 'Nhân viên bán thời gian'}</option>
                    <option value="5">{t.jobRecruitmentTypeOption5 || 'Hợp đồng uỷ thác'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {languageTab === 'jp' ? '在留資格' : languageTab === 'en' ? 'Residence status' : 'Tư cách lưu trú'}
                  </label>
                  <select
                    value={(() => {
                      const v = String(formData.residenceStatus ?? '').trim().toLowerCase();
                      const e = String(formData.residenceStatusEn ?? '').trim().toLowerCase();
                      const j = String(formData.residenceStatusJp ?? '').trim();

                      if (v.includes('kỹ thuật') || e.includes('engineer') || j.includes('技術')) return 'engineer';
                      if (v.includes('chuyên gia trình độ cao') || e.includes('highly skilled') || j.includes('高度専門職')) return 'hsp';
                      if (v.includes('lao động kỹ năng') || e.includes('technical intern') || j.includes('技能実習')) return 'titp';
                      if (v.includes('kỹ năng đặc định') || e.includes('specified skilled') || j.includes('特定技能')) return 'ssw';
                      if (v.includes('du học') || e.includes('student') || j.includes('留学')) return 'student';
                      if (v.includes('phụ thuộc') || e.includes('dependent') || j.includes('家族滞在')) return 'dependent';
                      if (v.includes('ngắn hạn') || e.includes('short-term') || j.includes('短期滞在')) return 'short';
                      if (v.includes('vĩnh trú') || e.includes('permanent') || j.includes('永住')) return 'pr';
                      if (v.includes('vợ/chồng') || e.includes('spouse') || j.includes('配偶者')) return 'spouse';
                      return '';
                    })()}
                    onChange={(e) => {
                      const val = e.target.value;
                      const setAll = (vi, en, jp) =>
                        setFormData((prev) => ({
                          ...prev,
                          residenceStatus: vi,
                          residenceStatusEn: en,
                          residenceStatusJp: jp,
                        }));

                      if (val === 'engineer') return setAll(
                        'Visa lao động (kỹ thuật - nhân văn)',
                        'Engineer/Specialist in Humanities/International Services',
                        '技術・人文知識・国際業務'
                      );
                      if (val === 'hsp') return setAll(
                        'Visa chuyên gia trình độ cao',
                        'Highly Skilled Professional',
                        '高度専門職'
                      );
                      if (val === 'titp') return setAll(
                        'Visa lao động kỹ năng',
                        'Technical Intern Training',
                        '技能実習'
                      );
                      if (val === 'ssw') return setAll(
                        'Visa kỹ năng đặc định',
                        'Specified Skilled Worker',
                        '特定技能'
                      );
                      if (val === 'student') return setAll(
                        'Visa du học',
                        'Student',
                        '留学'
                      );
                      if (val === 'dependent') return setAll(
                        'Visa phụ thuộc gia đình',
                        'Dependent',
                        '家族滞在'
                      );
                      if (val === 'short') return setAll(
                        'Visa ngắn hạn',
                        'Short-term stay',
                        '短期滞在'
                      );
                      if (val === 'pr') return setAll(
                        'Vĩnh trú',
                        'Permanent resident',
                        '永住者'
                      );
                      if (val === 'spouse') return setAll(
                        'Vợ/chồng người Nhật',
                        'Spouse of Japanese national',
                        '日本人の配偶者等'
                      );

                      setFormData((prev) => ({ ...prev, residenceStatus: '', residenceStatusEn: '', residenceStatusJp: '' }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">{t.selectLabel || 'Chọn'}</option>
                    <option value="engineer">{languageTab === 'jp' ? '技術・人文知識・国際業務' : languageTab === 'en' ? 'Engineer/Specialist in Humanities/International Services' : 'Visa lao động (kỹ thuật - nhân văn)'}</option>
                    <option value="hsp">{languageTab === 'jp' ? '高度専門職' : languageTab === 'en' ? 'Highly Skilled Professional' : 'Visa chuyên gia trình độ cao'}</option>
                    <option value="titp">{languageTab === 'jp' ? '技能実習' : languageTab === 'en' ? 'Technical Intern Training' : 'Visa lao động kỹ năng'}</option>
                    <option value="ssw">{languageTab === 'jp' ? '特定技能' : languageTab === 'en' ? 'Specified Skilled Worker' : 'Visa kỹ năng đặc định'}</option>
                    <option value="student">{languageTab === 'jp' ? '留学' : languageTab === 'en' ? 'Student' : 'Visa du học'}</option>
                    <option value="dependent">{languageTab === 'jp' ? '家族滞在' : languageTab === 'en' ? 'Dependent' : 'Visa phụ thuộc gia đình'}</option>
                    <option value="short">{languageTab === 'jp' ? '短期滞在' : languageTab === 'en' ? 'Short-term stay' : 'Visa ngắn hạn'}</option>
                    <option value="pr">{languageTab === 'jp' ? '永住者' : languageTab === 'en' ? 'Permanent resident' : 'Vĩnh trú'}</option>
                    <option value="spouse">{languageTab === 'jp' ? '日本人の配偶者等' : languageTab === 'en' ? 'Spouse of Japanese national' : 'Vợ/chồng người Nhật'}</option>
                  </select>
                </div>
              </div>

              {/* 7. Số lượng tuyển dụng — dropdown, lưu vào workingLocations[0].numberOfHires */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.numberOfRecruitsLabel || 'Số lượng tuyển dụng'}
                </label>
                <select
                  value={(workingLocations && workingLocations[0] && workingLocations[0].numberOfHires) ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setWorkingLocations((prev) => {
                      const next = Array.isArray(prev) && prev.length > 0 ? [...prev] : [{ location: '', country: '', numberOfHires: '' }];
                      if (!next[0]) next[0] = { location: '', country: '', numberOfHires: '' };
                      next[0] = { ...next[0], numberOfHires: v };
                      return next;
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">{t.addJobSelect || 'Chọn'}</option>
                  {NUMBER_OF_HIRES_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* 8. Điểm nổi bật (Chọn option như file JD template) */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.jobHighlightsLabel || 'Điểm nổi bật của công việc'} <span className="text-gray-500 font-normal">({t.jobHighlightsHint || 'Chọn option...'})</span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {JOB_HIGHLIGHT_OPTIONS.map((opt) => {
                    const label = getHighlightLabel(opt.key);
                    const selected = highlightKeys.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          syncHighlightsToForm((prev) =>
                            prev.includes(opt.key)
                              ? prev.filter((k) => k !== opt.key)
                              : [...prev, opt.key]
                          )
                        }
                        className="px-2 py-1 rounded-full text-[11px] border transition-colors"
                        style={{
                          backgroundColor: selected ? '#2563eb' : '#f3f4f6',
                          color: selected ? '#ffffff' : '#374151',
                          borderColor: selected ? '#2563eb' : '#e5e7eb',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slug (kỹ thuật, ẩn gọn) */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.slugLabel || 'Slug'} <span style={{ color: '#ef4444' }}>*</span>
                  <span className="text-[10px] ml-2" style={{ color: '#6b7280' }}>
                    {t.slugAutoFromTitleHint || '(Tự động tạo từ tiêu đề)'}
                  </span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="VD: software-engineer-react-nodejs-developer"
                  required
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: errors.slug ? '#ef4444' : '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.slug ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.slug && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.slug}</p>}
              </div>
            </div>
          </div>

          {/* Chi tiết tuyển dụng — gộp chung mục 9–28 */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Users className="w-4 h-4 text-blue-600" />
              Chi tiết tuyển dụng
            </h2>
            <div className="space-y-4">
          {/* 9. Mô tả công việc */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">
              {t.jobDescriptionLabel || 'Mô tả công việc'} <span className="text-gray-500 font-normal">(Điền text)</span>
            </label>
            {languageTab === 'vi' && (
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Mô tả chi tiết về công việc..." rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
            )}
            {languageTab === 'en' && (
              <textarea name="descriptionEn" value={formData.descriptionEn} onChange={handleInputChange} placeholder="Job description in English" rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
            )}
            {languageTab === 'jp' && (
              <textarea name="descriptionJp" value={formData.descriptionJp} onChange={handleInputChange} placeholder="求人票の仕事内容（日本語）" rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
            )}
          </div>
          {/* 10. Lý do ứng tuyển (nếu có) */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">
              {t.jobInstructionLabel || 'Lý do ứng tuyển (nếu có)'} <span className="text-gray-500 font-normal">(Điền text)</span>
            </label>
            {languageTab === 'vi' && (
              <textarea name="instruction" value={formData.instruction} onChange={handleInputChange} placeholder="Lý do ứng tuyển (nếu có)..." rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
            )}
            {languageTab === 'en' && (
              <textarea name="instructionEn" value={formData.instructionEn} onChange={handleInputChange} placeholder="Reason for applying (if any)" rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
            )}
            {languageTab === 'jp' && (
              <textarea name="instructionJp" value={formData.instructionJp} onChange={handleInputChange} placeholder="応募理由（あれば）" rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
            )}
          </div>
          {/* 11. Điều kiện bắt buộc + 12. Điều kiện ưu tiên — cùng state requirements */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              {t.jobRequiredConditionsLabel || 'Điều kiện ứng tuyển bắt buộc'}
            </label>
            {/* Chọn nhanh điều kiện (bố cục dọc, đồng bộ nhãn với form JD) — chọn option là tự thêm vào danh sách */}
            <div className="mb-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-3">
              <span className="text-[10px] font-medium text-gray-700 block mb-2">Điều kiện có sẵn (chọn để thêm):</span>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">Trình độ tiếng Nhật</label>
                  <select
                    value={presetJapanese}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPresetJapanese(val);
                      const isFromPreset = (r) => r.type === 'language' && JAPANESE_LEVEL_OPTIONS.some((o) => r.content === o.vi || r.contentEn === o.en || r.contentJp === o.jp);
                      if (val) {
                        const opt = JAPANESE_LEVEL_OPTIONS.find((o) => o.value === val);
                        if (opt) setRequirements((prev) => [...prev.filter((r) => !isFromPreset(r)), { content: opt.vi, contentEn: opt.en, contentJp: opt.jp, type: 'language', status: 'required' }]);
                      } else setRequirements((prev) => prev.filter((r) => !isFromPreset(r)));
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">— Chọn —</option>
                    {JAPANESE_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{languageTab === 'vi' ? opt.vi : languageTab === 'en' ? opt.en : opt.jp}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">Số năm kinh nghiệm theo vị trí</label>
                  <select
                    value={presetExperience}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPresetExperience(val);
                      const isFromPreset = (r) => r.type === 'experience' && EXPERIENCE_YEARS_OPTIONS.some((o) => r.content === o.vi || r.contentEn === o.en || r.contentJp === o.jp);
                      if (val) {
                        const opt = EXPERIENCE_YEARS_OPTIONS.find((o) => o.value === val);
                        if (opt) setRequirements((prev) => [...prev.filter((r) => !isFromPreset(r)), { content: opt.vi, contentEn: opt.en, contentJp: opt.jp, type: 'experience', status: 'required' }]);
                      } else setRequirements((prev) => prev.filter((r) => !isFromPreset(r)));
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">— Chọn —</option>
                    {EXPERIENCE_YEARS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{languageTab === 'vi' ? opt.vi : languageTab === 'en' ? opt.en : opt.jp}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">Bằng lái xe</label>
                  <select
                    value={presetDriver}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPresetDriver(val);
                      const isFromPreset = (r) => r.type === 'certification' && DRIVER_LICENSE_OPTIONS.some((o) => r.content === o.vi || r.contentEn === o.en || r.contentJp === o.jp);
                      if (val) {
                        const opt = DRIVER_LICENSE_OPTIONS.find((o) => o.value === val);
                        if (opt) setRequirements((prev) => [...prev.filter((r) => !isFromPreset(r)), { content: opt.vi, contentEn: opt.en, contentJp: opt.jp, type: 'certification', status: 'required' }]);
                      } else setRequirements((prev) => prev.filter((r) => !isFromPreset(r)));
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">— Chọn —</option>
                    {DRIVER_LICENSE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{languageTab === 'vi' ? opt.vi : languageTab === 'en' ? opt.en : opt.jp}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500">Loại: technique, experience, language, certification</span>
              <button type="button" onClick={() => setRequirements([...requirements, { content: '', contentEn: '', contentJp: '', type: '', status: '' }])} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Plus className="w-3 h-3" /> {t.jobRequirementAdd || 'Thêm yêu cầu'}
              </button>
            </div>
            <div className="space-y-2 mb-3">
              {requirements.filter(r => r.type === 'technique' || r.type === 'experience' || r.type === 'language' || r.type === 'certification' || !r.type).map((req) => {
                const index = requirements.indexOf(req);
                return (
                  <div key={index} className="p-2 border border-gray-200 rounded-lg space-y-2">
                    <div className="space-y-1">
                      {languageTab === 'vi' && <textarea placeholder={t.jobRequirementContentPlaceholder || 'Nội dung yêu cầu...'} value={req.content} onChange={(e) => { const newReqs = [...requirements]; newReqs[index].content = e.target.value; setRequirements(newReqs); }} rows="2" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />}
                      {languageTab === 'en' && <textarea placeholder="Requirement in English" value={req.contentEn || ''} onChange={(e) => { const newReqs = [...requirements]; newReqs[index].contentEn = e.target.value; setRequirements(newReqs); }} rows="2" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />}
                      {languageTab === 'jp' && <textarea placeholder="応募条件（日本語）" value={req.contentJp || ''} onChange={(e) => { const newReqs = [...requirements]; newReqs[index].contentJp = e.target.value; setRequirements(newReqs); }} rows="2" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />}
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <select value={req.type || ''} onChange={(e) => { const newReqs = [...requirements]; newReqs[index].type = e.target.value; setRequirements(newReqs); }} className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600">
                        <option value="">{t.jobRequirementTypePlaceholder || 'Chọn loại'}</option>
                        <option value="technique">{t.jobRequirementTypeTechnique || 'Kỹ thuật'}</option>
                        <option value="experience">{t.jobRequirementTypeExperience || 'Kinh nghiệm'}</option>
                        <option value="language">{t.jobRequirementTypeLanguage || 'Ngôn ngữ'}</option>
                        <option value="certification">{t.jobRequirementTypeCertification || 'Chứng chỉ'}</option>
                      </select>
                      <select value={req.status || ''} onChange={(e) => { const newReqs = [...requirements]; newReqs[index].status = e.target.value; setRequirements(newReqs); }} className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600">
                        <option value="">{t.jobRequirementStatusPlaceholder || 'Trạng thái'}</option>
                        <option value="required">{t.jobRequirementStatusRequired || 'Bắt buộc'}</option>
                        <option value="optional">{t.jobRequirementStatusOptional || 'Tùy chọn'}</option>
                      </select>
                      <button type="button" onClick={() => setRequirements(requirements.filter((_, i) => i !== index))} className="p-1.5 text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <label className="block text-xs font-semibold text-gray-900 mb-2 mt-3">
              {t.jobPreferredConditionsLabel || 'Điều kiện ưu tiên'}
            </label>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">Loại: education / skill / other</span>
              <button type="button" onClick={() => setRequirements([...requirements, { content: '', contentEn: '', contentJp: '', type: 'education', status: 'preferred' }])} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Plus className="w-3 h-3" /> {t.jobRequirementAdd || 'Thêm điều kiện ưu tiên'}
              </button>
            </div>
            {requirements.filter(r => r.type === 'education' || r.type === 'skill' || r.type === 'other').map((req) => {
              const index = requirements.indexOf(req);
              return (
                <div key={`pref-${index}`} className="mb-2 p-2 border border-gray-200 rounded-lg space-y-2">
                  <div className="space-y-1">
                    {languageTab === 'vi' && <textarea placeholder={t.jobRequirementContentPlaceholder || 'Nội dung...'} value={req.content} onChange={(e) => { const newReqs = [...requirements]; newReqs[index].content = e.target.value; setRequirements(newReqs); }} rows="2" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />}
                    {languageTab === 'en' && <textarea placeholder="Preferred in English" value={req.contentEn || ''} onChange={(e) => { const newReqs = [...requirements]; newReqs[index].contentEn = e.target.value; setRequirements(newReqs); }} rows="2" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />}
                    {languageTab === 'jp' && <textarea placeholder="歓迎条件（日本語）" value={req.contentJp || ''} onChange={(e) => { const newReqs = [...requirements]; newReqs[index].contentJp = e.target.value; setRequirements(newReqs); }} rows="2" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />}
                  </div>
                  <div className="flex gap-2 items-center">
                    <select value={req.type || ''} onChange={(e) => { const newReqs = [...requirements]; newReqs[index].type = e.target.value; setRequirements(newReqs); }} className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600">
                      <option value="education">{t.jobRequirementTypeEducation || 'Học vấn'}</option>
                      <option value="skill">{t.jobRequirementTypeSkill || 'Kỹ năng'}</option>
                      <option value="other">{t.jobRequirementTypeOther || 'Khác'}</option>
                    </select>
                    <button type="button" onClick={() => setRequirements(requirements.filter((_, i) => i !== index))} className="p-1.5 text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Salary & Commission (13–17) */}
          <div className="rounded-lg p-3 border border-gray-200 bg-gray-50/50">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              {t.jobSectionSalaryCommission || 'Lương'}
            </h3>
            <div className="space-y-3">
              {/* Salary Ranges */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobSalaryLabel || 'Mức lương'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setSalaryRanges([...salaryRanges, { salaryRange: '', type: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.jobSalaryAdd || 'Thêm mức lương'}
                  </button>
                </div>
                {salaryRanges.map((sr, index) => (
                  <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={t.jobSalaryPlaceholder || 'Mức lương (VD: 500-700万円)'}
                        value={sr.salaryRange}
                        onChange={(e) => {
                          const newRanges = [...salaryRanges];
                          newRanges[index].salaryRange = e.target.value;
                          setSalaryRanges(newRanges);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <div className="flex gap-1">
                        <select
                          value={sr.type || ''}
                          onChange={(e) => {
                            const newRanges = [...salaryRanges];
                            newRanges[index].type = e.target.value;
                            setSalaryRanges(newRanges);
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="">{t.jobSalaryTypePlaceholder || 'Chọn loại'}</option>
                          <option value="yearly">{t.salaryTypeYearly || 'Thu nhập năm'}</option>
                          <option value="monthly">{t.salaryTypeMonthly || 'Lương tháng'}</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setSalaryRanges(salaryRanges.filter((_, i) => i !== index))}
                          className="p-1.5 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Salary Range Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobSalaryDetailLabel || 'Chi tiết mức lương'}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSalaryRangeDetails([
                        ...salaryRangeDetails,
                        { content: '', contentEn: '', contentJp: '' }
                      ])
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.jobSalaryDetailAdd || 'Thêm chi tiết'}
                  </button>
                </div>
                {salaryRangeDetails.map((srd, index) => (
                  <div key={index} className="mb-3 space-y-1">
                    <div className="flex gap-2">
                      {languageTab === 'vi' && (
                        <textarea
                          placeholder={t.jobSalaryDetailPlaceholder || 'Chi tiết mức lương...'}
                          value={srd.content}
                          onChange={(e) => {
                            const newDetails = [...salaryRangeDetails];
                            newDetails[index].content = e.target.value;
                            setSalaryRangeDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'en' && (
                        <textarea
                          placeholder="Salary details in English"
                          value={srd.contentEn || ''}
                          onChange={(e) => {
                            const newDetails = [...salaryRangeDetails];
                            newDetails[index].contentEn = e.target.value;
                            setSalaryRangeDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'jp' && (
                        <textarea
                          placeholder="給与詳細（日本語）"
                          value={srd.contentJp || ''}
                          onChange={(e) => {
                            const newDetails = [...salaryRangeDetails];
                            newDetails[index].contentJp = e.target.value;
                            setSalaryRangeDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setSalaryRangeDetails(
                            salaryRangeDetails.filter((_, i) => i !== index)
                          )
                        }
                        className="p-1.5 text-red-500 hover:text-red-700 self-start"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobBonusLabel || 'Thưởng'}
                  </label>
                  {languageTab === 'vi' && (
                    <input
                      type="text"
                      name="bonus"
                      value={formData.bonus}
                      onChange={handleInputChange}
                      placeholder="VD: 2 lần/năm, tối đa 198万円"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'en' && (
                    <input
                      type="text"
                      name="bonusEn"
                      value={formData.bonusEn}
                      onChange={handleInputChange}
                      placeholder="Bonus details in English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <input
                      type="text"
                      name="bonusJp"
                      value={formData.bonusJp}
                      onChange={handleInputChange}
                      placeholder="賞与の詳細（日本語）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobSalaryReviewLabel || 'Đánh giá lương'}
                  </label>
                  {languageTab === 'vi' && (
                    <input
                      type="text"
                      name="salaryReview"
                      value={formData.salaryReview}
                      onChange={handleInputChange}
                      placeholder="VD: Hàng năm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'en' && (
                    <input
                      type="text"
                      name="salaryReviewEn"
                      value={formData.salaryReviewEn}
                      onChange={handleInputChange}
                      placeholder="Salary review details in English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <input
                      type="text"
                      name="salaryReviewJp"
                      value={formData.salaryReviewJp}
                      onChange={handleInputChange}
                      placeholder="昇給に関する詳細（日本語）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>
              </div>

              {/* Commission Type */}

            </div>
          </div>

          {/* Location (19–20) */}
          <div className="rounded-lg p-3 border border-gray-200 bg-gray-50/50">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {t.jobSectionLocation || t.workLocation || 'Địa điểm làm việc'}
            </h3>
             <div className="space-y-3">
              {/* Quick Select: Country and Provinces */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.quickSelectWorkLocation || 'Chọn nhanh địa điểm làm việc'}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t.selectCountryLabel || 'Chọn quốc gia'}
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setShowLocationModal(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">{t.selectCountryPlaceholder || '-- Chọn quốc gia --'}</option>
                      <option value="Vietnam">{language === 'ja' ? 'ベトナム' : language === 'en' ? 'Vietnam' : 'Việt Nam'}</option>
                      <option value="Japan">{language === 'ja' ? '日本' : language === 'en' ? 'Japan' : 'Nhật Bản'}</option>
                      <option value="Other">{t.countryOtherOption || 'Khác (Nhập tùy chỉnh)'}</option>
                    </select>
                  </div>

                  {(selectedCountry === 'Vietnam' || selectedCountry === 'Japan') && (
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(true)}
                      className="w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedCountry === 'Vietnam'
                        ? (t.selectProvincesLabel || 'Chọn tỉnh/thành phố')
                        : (languageTab === 'jp' ? '地域・都道府県・市区町村を選択' : languageTab === 'en' ? 'Select region, prefecture, city/ward' : 'Chọn vùng, tỉnh/thành, quận/huyện')}
                    </button>
                  )}
                  
                  {selectedCountry === 'Other' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t.customLocationLabel || 'Nhập địa điểm tùy chỉnh'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setWorkingLocations([...workingLocations, { location: '', country: '' }])}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t.customLocationAddButton || 'Thêm địa điểm tùy chỉnh'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Popup chọn địa điểm (Việt Nam / Nhật Bản) */}
              {showLocationModal && (selectedCountry === 'Vietnam' || selectedCountry === 'Japan') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowLocationModal(false)}>
                  <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {selectedCountry === 'Vietnam'
                          ? (t.selectProvincesLabel || 'Chọn tỉnh/thành phố (có thể chọn nhiều)')
                          : (languageTab === 'jp' ? '地域・都道府県・市区町村を選択' : languageTab === 'en' ? 'Select region, prefecture, city/ward' : 'Chọn vùng, tỉnh/thành, quận/huyện')}
                      </h3>
                      <button type="button" onClick={() => setShowLocationModal(false)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 overflow-y-auto flex-1">
                      {selectedCountry === 'Vietnam' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">{t.selectProvincesLabel || 'Chọn tỉnh/thành phố (có thể chọn nhiều)'}</span>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => { const existing = new Set(workingLocations.map((wl) => `${wl.location}_${wl.country}`)); const toAdd = countryProvincesData.Vietnam.filter((p) => !existing.has(`${p}_Vietnam`)).map((province) => ({ location: province, country: 'Vietnam' })); setWorkingLocations((prev) => [...prev, ...toAdd]); }} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">{t.selectAll || 'Chọn tất cả'}</button>
                              <button type="button" onClick={() => setWorkingLocations((prev) => prev.filter((wl) => wl.country !== 'Vietnam'))} className="text-[10px] text-gray-600 hover:text-gray-700 font-medium">{t.clearAll || 'Bỏ chọn tất cả'}</button>
                            </div>
                          </div>
                          <div className="max-h-[60vh] overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white">
                            <div className="grid grid-cols-2 gap-2">
                              {countryProvincesData.Vietnam.map((province) => {
                                const isSelected = workingLocations.some((wl) => wl.country === 'Vietnam' && wl.location === province);
                                return (
                                  <label key={province} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={!!isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          if (!workingLocations.some((wl) => wl.location === province && wl.country === 'Vietnam'))
                                            setWorkingLocations((prev) => [...prev, { location: province, country: 'Vietnam' }]);
                                        } else {
                                          setWorkingLocations((prev) => prev.filter((wl) => !(wl.location === province && wl.country === 'Vietnam')));
                                        }
                                      }}
                                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                                    />
                                    <span className="text-xs text-gray-700">{province}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedCountry === 'Japan' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-gray-700">{languageTab === 'jp' ? '地域を選択' : languageTab === 'en' ? 'Select region' : 'Chọn vùng'}</label>
                                <button
                                  type="button"
                                  disabled={bulkJapanAdding}
                                  onClick={() => addAllJapanLocationsForPrefCodes(JAPAN_REGIONS.flatMap((r) => r.prefectureCodes))}
                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
                                >
                                  {languageTab === 'jp' ? 'すべて' : languageTab === 'en' ? 'Select all' : 'Chọn tất cả'}
                                </button>
                              </div>
                              <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-lg p-1.5 bg-white">
                                {JAPAN_REGIONS.map((reg) => (
                                  <div key={reg.id} onClick={() => { setSelectedJapanRegion(reg.id); setSelectedJapanPrefecture(null); }} className={`px-2 py-1.5 rounded text-xs cursor-pointer ${selectedJapanRegion === reg.id ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-50'}`}>
                                    {languageTab === 'jp' ? reg.ja : reg.en}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-gray-700">{languageTab === 'jp' ? '都道府県を選択' : languageTab === 'en' ? 'Select prefecture' : 'Chọn tỉnh/thành'}</label>
                                <button
                                  type="button"
                                  disabled={!selectedJapanRegion || bulkJapanAdding}
                                  onClick={() => {
                                    const codes = JAPAN_REGIONS.find((r) => r.id === selectedJapanRegion)?.prefectureCodes || [];
                                    addAllJapanLocationsForPrefCodes(codes);
                                  }}
                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
                                >
                                  {languageTab === 'jp' ? 'すべて' : languageTab === 'en' ? 'Select all' : 'Chọn tất cả'}
                                </button>
                              </div>
                              <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-lg p-1.5 bg-white">
                                {selectedJapanRegion && JAPAN_REGIONS.find((r) => r.id === selectedJapanRegion)?.prefectureCodes.map((code) => {
                                  const pref = JAPAN_PREFECTURES[code];
                                  if (!pref) return null;
                                  const label = languageTab === 'jp' ? pref.ja : pref.en;
                                  return (
                                    <div key={code} onClick={() => setSelectedJapanPrefecture(code)} className={`px-2 py-1.5 rounded text-xs cursor-pointer ${selectedJapanPrefecture === code ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-50'}`}>
                                      {label}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-gray-700">{languageTab === 'jp' ? '市区郡を選択' : languageTab === 'en' ? 'Select city/ward' : 'Chọn quận/huyện'}</label>
                                <button
                                  type="button"
                                  disabled={!selectedJapanPrefecture || japanCitiesLoading || bulkJapanAdding}
                                  onClick={() => addAllJapanLocationsForPrefCodes([selectedJapanPrefecture])}
                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
                                >
                                  {languageTab === 'jp' ? 'すべて' : languageTab === 'en' ? 'Select all' : 'Chọn tất cả'}
                                </button>
                              </div>
                              <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-lg p-1.5 bg-white">
                                {japanCitiesLoading ? <div className="text-xs text-gray-500 p-2">Loading...</div> : (() => {
                                  const { tree } = japanLocationData;
                                  const pref = selectedJapanPrefecture ? JAPAN_PREFECTURES[selectedJapanPrefecture] : null;
                                  const prefJa = pref?.ja || '';
                                  const prefEn = pref?.en || '';
                                  const toRomaji = (kana, fallback) => (kana ? kanaToRomaji(kana) : fallback);

                                  // Persist Japan selections in a stable form so UI can switch by languageTab.
                                  // - location: alphabet/romaji (for vi/en)
                                  // - locationJp: Japanese (for jp)
                                  // - jpId: stable key for checked/duplicate handling
                                  const selectedJapanIds = new Set(
                                    workingLocations
                                      .filter((wl) => wl.country === 'Japan')
                                      .map((wl) => wl.jpId || `${wl.location}_${wl.country}`)
                                  );

                                  const makeLocObj = (nameJa, nameKana) => {
                                    const ja = (prefJa + ' ' + nameJa).trim();
                                    const alpha = (prefEn + ' ' + toRomaji(nameKana, nameJa)).trim();
                                    const id = `${selectedJapanPrefecture || ''}|${nameJa}`; // stable per prefecture + JA name
                                    return {
                                      id,
                                      ja,
                                      alpha,
                                      display: languageTab === 'jp' ? ja : alpha,
                                    };
                                  };

                                  const allLocs = tree.flatMap((c) => {
                                    if (c.standalone) return [makeLocObj(c.name, c.nameKana)];
                                    return (c.wards || []).map((w) => makeLocObj(w.fullName, w.fullNameKana));
                                  });

                                  const allSelected = allLocs.length > 0 && allLocs.every((loc) => selectedJapanIds.has(loc.id));
                                  const toggleAll = (checked) => {
                                    const existingJapanIds = new Set(
                                      workingLocations
                                        .filter((wl) => wl.country === 'Japan')
                                        .map((wl) => wl.jpId || `${wl.location}_${wl.country}`)
                                    );
                                    if (checked) {
                                      const toAdd = allLocs
                                        .filter((loc) => !existingJapanIds.has(loc.id))
                                        .map((loc) => ({
                                          location: loc.alpha,
                                          locationJp: loc.ja,
                                          country: 'Japan',
                                          jpId: loc.id,
                                        }));
                                      setWorkingLocations((prev) => [...prev, ...toAdd]);
                                    } else {
                                      const removeIds = new Set(allLocs.map((l) => l.id));
                                      setWorkingLocations((prev) =>
                                        prev.filter((wl) => wl.country !== 'Japan' || !removeIds.has(wl.jpId || `${wl.location}_${wl.country}`))
                                      );
                                    }
                                  };
                                  const toggleCity = (city, checked) => {
                                    const cityLocs = city.standalone
                                      ? [makeLocObj(city.name, city.nameKana)]
                                      : (city.wards || []).map((w) => makeLocObj(w.fullName, w.fullNameKana));
                                    if (checked) {
                                      const existingJapanIds = new Set(
                                        workingLocations
                                          .filter((wl) => wl.country === 'Japan')
                                          .map((wl) => wl.jpId || `${wl.location}_${wl.country}`)
                                      );
                                      const toAdd = cityLocs
                                        .filter((loc) => !existingJapanIds.has(loc.id))
                                        .map((loc) => ({
                                          location: loc.alpha,
                                          locationJp: loc.ja,
                                          country: 'Japan',
                                          jpId: loc.id,
                                        }));
                                      setWorkingLocations((prev) => [...prev, ...toAdd]);
                                    } else {
                                      const removeIds = new Set(cityLocs.map((l) => l.id));
                                      setWorkingLocations((prev) =>
                                        prev.filter((wl) => wl.country !== 'Japan' || !removeIds.has(wl.jpId || `${wl.location}_${wl.country}`))
                                      );
                                    }
                                  };
                                  const toggleWard = (fullName, fullNameKana, checked) => {
                                    const loc = makeLocObj(fullName, fullNameKana);
                                    if (checked) {
                                      if (!workingLocations.some((wl) => wl.country === 'Japan' && (wl.jpId || `${wl.location}_${wl.country}`) === loc.id))
                                        setWorkingLocations((prev) => [...prev, { location: loc.alpha, locationJp: loc.ja, country: 'Japan', jpId: loc.id }]);
                                    } else {
                                      setWorkingLocations((prev) =>
                                        prev.filter((wl) => !(wl.country === 'Japan' && (wl.jpId || `${wl.location}_${wl.country}`) === loc.id))
                                      );
                                    }
                                  };
                                  const isCitySelected = (city) => {
                                    const locs = city.standalone
                                      ? [makeLocObj(city.name, city.nameKana)]
                                      : (city.wards || []).map((w) => makeLocObj(w.fullName, w.fullNameKana));
                                    return locs.length > 0 && locs.every((l) => selectedJapanIds.has(l.id));
                                  };
                                  return (
                                    <>
                                      {selectedJapanPrefecture && allLocs.length > 0 && (
                                        <label className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                          <input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600" />
                                          <span className="text-xs font-medium">{languageTab === 'jp' ? 'すべて' : languageTab === 'en' ? 'All' : 'Tất cả'}</span>
                                        </label>
                                      )}
                                      {tree.map((city) => (
                                        <div key={city.name}>
                                          <label className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                            <input type="checkbox" checked={isCitySelected(city)} onChange={(e) => toggleCity(city, e.target.checked)} className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600" />
                                            <span className="text-xs font-medium text-gray-800">
                                              {languageTab === 'jp' ? city.name : toRomaji(city.nameKana, city.name)}
                                            </span>
                                          </label>
                                          {city.wards && city.wards.length > 0 && (
                                            <div className="ml-4 pl-1 border-l border-gray-200">
                                              {city.wards.map((w) => {
                                                const loc = makeLocObj(w.fullName, w.fullNameKana);
                                                const isWardSelected = selectedJapanIds.has(loc.id);
                                                return (
                                                  <label key={w.fullName} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                                    <input type="checkbox" checked={!!isWardSelected} onChange={(e) => toggleWard(w.fullName, w.fullNameKana, e.target.checked)} className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600" />
                                                    <span className="text-xs text-gray-700">
                                                      {languageTab === 'jp' ? w.fullName : toRomaji(w.fullNameKana, w.fullName)}
                                                    </span>
                                                  </label>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button type="button" onClick={() => setShowLocationModal(false)} className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">
                        {languageTab === 'jp' ? '閉じる' : languageTab === 'en' ? 'Close' : 'Đóng'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Working Locations List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {(t.selectedLocationsLabel || 'Danh sách địa điểm đã chọn ({count})')
                      .replace('{count}', workingLocations.length)}
                  </label>
                </div>
                {workingLocations.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {workingLocations.map((wl, index) => {
                      const isEmpty = !wl.location || !wl.country;
                      return (
                        <div key={index} className={`flex items-center gap-2 p-2 border rounded-lg ${isEmpty ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                          {isEmpty ? (
                            // Show input fields for empty locations (custom locations)
                            <div className="flex gap-1 flex-1">
                        <input
                                type="text"
                          placeholder={t.locationPlaceholder || 'Địa điểm'}
                                value={wl.location || ''}
                                onChange={(e) => {
                                  const newLocs = [...workingLocations];
                                  newLocs[index].location = e.target.value;
                                  setWorkingLocations(newLocs);
                                }}
                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                        <input
                                type="text"
                          placeholder={t.countryPlaceholder || 'Quốc gia'}
                                value={wl.country || ''}
                                onChange={(e) => {
                                  const newLocs = [...workingLocations];
                                  newLocs[index].country = e.target.value;
                                  setWorkingLocations(newLocs);
                                }}
                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            </div>
                          ) : (
                            // Show read-only display for completed locations
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-900">
                                {wl.country === 'Japan' && languageTab === 'jp' ? (wl.locationJp || wl.location) : wl.location}
                              </div>
                              <div className="text-[10px] text-gray-500">{wl.country}</div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setWorkingLocations(workingLocations.filter((_, i) => i !== index))}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                            title="Xóa"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                    {t.noLocationsSelectedMessage ||
                      'Chưa có địa điểm nào. Chọn quốc gia và tỉnh/thành phố ở trên hoặc thêm địa điểm tùy chỉnh.'}
                  </p>
                )}
              </div>
              
              {/* Working Location Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobLocationDetailsLabel || 'Chi tiết địa điểm làm việc'}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkingLocationDetails([
                        ...workingLocationDetails,
                        { content: '', contentEn: '', contentJp: '' }
                      ])
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.jobLocationDetailsAdd || 'Thêm chi tiết'}
                  </button>
                </div>
                {workingLocationDetails.map((wld, index) => (
                  <div key={index} className="mb-3 space-y-1">
                    <div className="flex gap-2">
                      {languageTab === 'vi' && (
                        <textarea
                          placeholder={t.jobLocationDetailsPlaceholder || 'Chi tiết địa điểm làm việc...'}
                          value={wld.content}
                          onChange={(e) => {
                            const newDetails = [...workingLocationDetails];
                            newDetails[index].content = e.target.value;
                            setWorkingLocationDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'en' && (
                        <textarea
                          placeholder="Work location details in English"
                          value={wld.contentEn || ''}
                          onChange={(e) => {
                            const newDetails = [...workingLocationDetails];
                            newDetails[index].contentEn = e.target.value;
                            setWorkingLocationDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'jp' && (
                        <textarea
                          placeholder="勤務地の詳細（日本語）"
                          value={wld.contentJp || ''}
                          onChange={(e) => {
                            const newDetails = [...workingLocationDetails];
                            newDetails[index].contentJp = e.target.value;
                            setWorkingLocationDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setWorkingLocationDetails(
                            workingLocationDetails.filter((_, i) => i !== index)
                          )
                        }
                        className="p-1.5 text-red-500 hover:text-red-700 self-start"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.interviewLocationLabel || 'Địa điểm phỏng vấn'}
                </label>
                <select
                  name="interviewLocation"
                  value={formData.interviewLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">{t.selectLabel || 'Chọn'}</option>
                  <option value="1">{languageTab === 'jp' ? 'ベトナム' : languageTab === 'en' ? 'Vietnam' : 'Việt Nam'}</option>
                  <option value="2">{languageTab === 'jp' ? '日本' : languageTab === 'en' ? 'Japan' : 'Nhật Bản'}</option>
                  <option value="3">{languageTab === 'jp' ? 'ベトナム＆日本' : languageTab === 'en' ? 'Vietnam & Japan' : 'Việt Nam & Nhật Bản'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* 18. Khả năng chuyển vùng */}
          <div className="rounded-lg p-3 border border-gray-200 bg-gray-50/50">
            <label className="block text-xs font-bold mb-2">
              {t.transferAbilityLabel || 'Khả năng chuyển vùng'}
            </label>
            <select
              value={(() => {
                const v = String(formData.transferAbility ?? '').trim().toLowerCase();
                const e = String(formData.transferAbilityEn ?? '').trim().toLowerCase();
                const j = String(formData.transferAbilityJp ?? '').trim();
                if (v === 'có thể' || v === 'có' || e === 'yes' || j === '可') return 'yes';
                if (v === 'không thể' || v === 'không' || e === 'no' || j === '不可') return 'no';
                return '';
              })()}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'yes') {
                  setFormData(prev => ({ ...prev, transferAbility: 'Có thể', transferAbilityEn: 'Yes', transferAbilityJp: '可' }));
                } else if (val === 'no') {
                  setFormData(prev => ({ ...prev, transferAbility: 'Không thể', transferAbilityEn: 'No', transferAbilityJp: '不可' }));
                } else {
                  setFormData(prev => ({ ...prev, transferAbility: '', transferAbilityEn: '', transferAbilityJp: '' }));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">{t.transferAbilityPlaceholder || 'Chọn'}</option>
              <option value="yes">{t.transferAbilityYes || 'Có thể'}</option>
              <option value="no">{t.transferAbilityNo || 'Không thể'}</option>
            </select>
          </div>

          {/* Benefits (24) */}
          <div className="rounded-lg p-3 border border-gray-200 bg-gray-50/50">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              {t.jobSectionBenefits || 'Phúc lợi'}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Social Insurance */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobBenefitsSocialInsuranceLabel || 'Bảo hiểm xã hội'}
                  </label>
                  {languageTab === 'vi' && (
                    <textarea
                      name="socialInsurance"
                      value={formData.socialInsurance}
                      onChange={handleInputChange}
                      placeholder="VD: Có"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y min-h-[60px]"
                    />
                  )}
                  {languageTab === 'en' && (
                    <textarea
                      name="socialInsuranceEn"
                      value={formData.socialInsuranceEn}
                      onChange={handleInputChange}
                      placeholder="Social insurance details in English"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y min-h-[60px]"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <textarea
                      name="socialInsuranceJp"
                      value={formData.socialInsuranceJp}
                      onChange={handleInputChange}
                      placeholder="社会保険に関する詳細（日本語）"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y min-h-[60px]"
                    />
                  )}
                </div>
                {/* Transportation */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobBenefitsTransportationLabel || 'Phụ cấp đi lại'}
                  </label>
                  {languageTab === 'vi' && (
                    <textarea
                      name="transportation"
                      value={formData.transportation}
                      onChange={handleInputChange}
                      placeholder="VD: Có, tối đa 15,000円/tháng"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y min-h-[60px]"
                    />
                  )}
                  {languageTab === 'en' && (
                    <textarea
                      name="transportationEn"
                      value={formData.transportationEn}
                      onChange={handleInputChange}
                      placeholder="Transportation allowance details in English"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y min-h-[60px]"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <textarea
                      name="transportationJp"
                      value={formData.transportationJp}
                      onChange={handleInputChange}
                      placeholder="交通費補助の詳細（日本語）"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y min-h-[60px]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Working Time (21–23, 25–26) */}
          <div className="rounded-lg p-3 border border-gray-200 bg-gray-50/50">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {t.jobSectionWorkingTime || 'Thời gian làm việc'}
            </h3>
            <div className="space-y-3">
              {/* Working Hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobWorkingHoursLabel || 'Giờ làm việc'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setWorkingHours([...workingHours, { workingHours: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.jobWorkingHoursAdd || 'Thêm giờ làm việc'}
                  </button>
                </div>
                {workingHours.map((wh, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <input
                      type="text"
                      placeholder={t.jobWorkingHoursPlaceholder || 'Giờ làm việc (VD: 9:00 - 18:00)'}
                      value={wh.workingHours}
                      onChange={(e) => {
                        const newHours = [...workingHours];
                        newHours[index].workingHours = e.target.value;
                        setWorkingHours(newHours);
                      }}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setWorkingHours(workingHours.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Working Hour Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobWorkingHourDetailsLabel || 'Chi tiết giờ làm việc'}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkingHourDetails([
                        ...workingHourDetails,
                        { content: '', contentEn: '', contentJp: '' }
                      ])
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.jobWorkingHourDetailsAdd || 'Thêm chi tiết'}
                  </button>
                </div>
                {workingHourDetails.map((whd, index) => (
                  <div key={index} className="mb-3 space-y-1">
                    <div className="flex gap-2">
                      {languageTab === 'vi' && (
                        <textarea
                          placeholder={t.jobWorkingHourDetailsPlaceholder || 'Chi tiết giờ làm việc...'}
                          value={whd.content}
                          onChange={(e) => {
                            const newDetails = [...workingHourDetails];
                            newDetails[index].content = e.target.value;
                            setWorkingHourDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'en' && (
                        <textarea
                          placeholder="Working hour details in English"
                          value={whd.contentEn || ''}
                          onChange={(e) => {
                            const newDetails = [...workingHourDetails];
                            newDetails[index].contentEn = e.target.value;
                            setWorkingHourDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'jp' && (
                        <textarea
                          placeholder="勤務時間の詳細（日本語）"
                          value={whd.contentJp || ''}
                          onChange={(e) => {
                            const newDetails = [...workingHourDetails];
                            newDetails[index].contentJp = e.target.value;
                            setWorkingHourDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setWorkingHourDetails(
                            workingHourDetails.filter((_, i) => i !== index)
                          )
                        }
                        className="p-1.5 text-red-500 hover:text-red-700 self-start"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Break time */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobBreakTimeLabel || 'Thời gian nghỉ'}
                  </label>
                  {languageTab === 'vi' && (
                    <input
                      type="text"
                      name="breakTime"
                      value={formData.breakTime}
                      onChange={handleInputChange}
                      placeholder="VD: 60 phút"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'en' && (
                    <input
                      type="text"
                      name="breakTimeEn"
                      value={formData.breakTimeEn}
                      onChange={handleInputChange}
                      placeholder="Break time details in English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <input
                      type="text"
                      name="breakTimeJp"
                      value={formData.breakTimeJp}
                      onChange={handleInputChange}
                      placeholder="休憩時間の詳細（日本語）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>
                {/* Overtime summary */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobOvertimeLabel || 'Làm thêm giờ'}
                  </label>
                  <select
                    value={(() => {
                      const v = String(formData.overtime ?? '').trim().toLowerCase();
                      const e = String(formData.overtimeEn ?? '').trim().toLowerCase();
                      const j = String(formData.overtimeJp ?? '').trim();
                      if (
                        v === 'không làm thêm giờ' ||
                        e === 'no overtime' ||
                        e === 'none' ||
                        j === '残業なし'
                      ) return 'none';
                      if (
                        v === 'dưới 10 tiếng/ tháng' ||
                        v === 'dưới 10 tiếng/tháng' ||
                        e === 'under 10 hours/month' ||
                        e === 'below 10 hours/month' ||
                        j === '月10時間未満'
                      ) return 'under10';
                      if (
                        v === 'dưới 20 tiếng/ tháng' ||
                        v === 'dưới 20 tiếng/tháng' ||
                        e === 'under 20 hours/month' ||
                        e === 'below 20 hours/month' ||
                        j === '月20時間未満'
                      ) return 'under20';
                      return '';
                    })()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'none') {
                        setFormData((prev) => ({
                          ...prev,
                          overtime: 'Không làm thêm giờ',
                          overtimeEn: 'No overtime',
                          overtimeJp: '残業なし',
                        }));
                        return;
                      }
                      if (val === 'under10') {
                        setFormData((prev) => ({
                          ...prev,
                          overtime: 'Dưới 10 tiếng/ tháng',
                          overtimeEn: 'Under 10 hours/month',
                          overtimeJp: '月10時間未満',
                        }));
                        return;
                      }
                      if (val === 'under20') {
                        setFormData((prev) => ({
                          ...prev,
                          overtime: 'Dưới 20 tiếng/ tháng',
                          overtimeEn: 'Under 20 hours/month',
                          overtimeJp: '月20時間未満',
                        }));
                        return;
                      }
                      setFormData((prev) => ({ ...prev, overtime: '', overtimeEn: '', overtimeJp: '' }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">{t.selectLabel || 'Chọn'}</option>
                    <option value="none">
                      {language === 'ja' ? '残業なし' : language === 'en' ? 'No overtime' : 'Không làm thêm giờ'}
                    </option>
                    <option value="under10">
                      {language === 'ja' ? '月10時間未満' : language === 'en' ? 'Under 10 hours/month' : 'Dưới 10 tiếng/ tháng'}
                    </option>
                    <option value="under20">
                      {language === 'ja' ? '月20時間未満' : language === 'en' ? 'Under 20 hours/month' : 'Dưới 20 tiếng/ tháng'}
                    </option>
                  </select>
                </div>
              </div>
              
              {/* Chi tiết về làm thêm (gộp Phụ cấp + Chi tiết phụ cấp) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobOvertimeAllowanceDetailLabel || 'Chi tiết về làm thêm'}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setOvertimeAllowanceDetails([
                        ...overtimeAllowanceDetails,
                        { content: '', contentEn: '', contentJp: '' }
                      ])
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.jobOvertimeAllowanceDetailAdd || 'Thêm chi tiết'}
                  </button>
                </div>
                {overtimeAllowanceDetails.map((oad, index) => (
                  <div key={index} className="mb-3 space-y-1">
                    <div className="flex gap-2">
                      {languageTab === 'vi' && (
                        <textarea
                          placeholder={t.jobOvertimeAllowanceDetailPlaceholder || 'Chi tiết về làm thêm...'}
                          value={oad.content}
                          onChange={(e) => {
                            const newDetails = [...overtimeAllowanceDetails];
                            newDetails[index].content = e.target.value;
                            setOvertimeAllowanceDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'en' && (
                        <textarea
                          placeholder="Overtime allowance details in English"
                          value={oad.contentEn || ''}
                          onChange={(e) => {
                            const newDetails = [...overtimeAllowanceDetails];
                            newDetails[index].contentEn = e.target.value;
                            setOvertimeAllowanceDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'jp' && (
                        <textarea
                          placeholder="残業手当の詳細（日本語）"
                          value={oad.contentJp || ''}
                          onChange={(e) => {
                            const newDetails = [...overtimeAllowanceDetails];
                            newDetails[index].contentJp = e.target.value;
                            setOvertimeAllowanceDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setOvertimeAllowanceDetails(
                            overtimeAllowanceDetails.filter((_, i) => i !== index)
                          )
                        }
                        className="p-1.5 text-red-500 hover:text-red-700 self-start"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Holidays */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobHolidaysLabel || 'Ngày nghỉ'}
                  </label>
                  <select
                    value={(() => {
                      const v = String(formData.holidays ?? '').trim().toLowerCase();
                      const e = String(formData.holidaysEn ?? '').trim().toLowerCase();
                      const j = String(formData.holidaysJp ?? '').trim();

                      if (v === 'nghỉ t7, cn' || v === 'nghỉ t7,cn' || e === 'sat & sun off' || e === 'sat/sun off' || j === '土日休み') return 'weekend';
                      if (v === 'nghỉ hoàn toàn 2 ngày mỗi tuần' || e === 'two full days off per week' || e === 'two days off per week' || j === '完全週休2日') return 'twoDays';
                      if (v === 'nghỉ 1–2 ngày mỗi tuần (theo lịch ca)' || v === 'nghỉ 1-2 ngày mỗi tuần (theo lịch ca)' || e === '1–2 days off per week (shift-based)' || e === '1-2 days off per week (shift-based)' || j === 'シフトにより週休1〜2日') return 'oneToTwoShift';
                      if (v === 'nghỉ theo ca' || e === 'shift-based days off' || e === 'days off by shift' || j === 'シフト休') return 'shiftOff';
                      if (v === 'làm việc luân phiên / xoay ca' || v === 'làm việc luân phiên/ xoay ca' || e === 'rotating shifts' || e === 'rotation / shift work' || j === '交代制／シフト制') return 'rotating';
                      if (v === 'nghỉ theo lịch công ty' || e === 'company calendar' || e === 'according to company calendar' || j === '会社カレンダーによる休日') return 'companyCalendar';
                      if (v === 'nghỉ theo lịch dự án' || e === 'project schedule' || e === 'according to project schedule' || j === 'プロジェクトスケジュールによる休日') return 'projectSchedule';

                      return '';
                    })()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'weekend') {
                        setFormData((prev) => ({ ...prev, holidays: 'Nghỉ T7, CN', holidaysEn: 'Sat/Sun off', holidaysJp: '土日休み' }));
                        return;
                      }
                      if (val === 'twoDays') {
                        setFormData((prev) => ({ ...prev, holidays: 'Nghỉ hoàn toàn 2 ngày mỗi tuần', holidaysEn: 'Two full days off per week', holidaysJp: '完全週休2日' }));
                        return;
                      }
                      if (val === 'oneToTwoShift') {
                        setFormData((prev) => ({ ...prev, holidays: 'Nghỉ 1–2 ngày mỗi tuần (theo lịch ca)', holidaysEn: '1–2 days off per week (shift-based)', holidaysJp: 'シフトにより週休1〜2日' }));
                        return;
                      }
                      if (val === 'shiftOff') {
                        setFormData((prev) => ({ ...prev, holidays: 'Nghỉ theo ca', holidaysEn: 'Shift-based days off', holidaysJp: 'シフト休' }));
                        return;
                      }
                      if (val === 'rotating') {
                        setFormData((prev) => ({ ...prev, holidays: 'Làm việc luân phiên / xoay ca', holidaysEn: 'Rotating shifts / shift work', holidaysJp: '交代制／シフト制' }));
                        return;
                      }
                      if (val === 'companyCalendar') {
                        setFormData((prev) => ({ ...prev, holidays: 'Nghỉ theo lịch công ty', holidaysEn: 'According to company calendar', holidaysJp: '会社カレンダーによる休日' }));
                        return;
                      }
                      if (val === 'projectSchedule') {
                        setFormData((prev) => ({ ...prev, holidays: 'Nghỉ theo lịch dự án', holidaysEn: 'According to project schedule', holidaysJp: 'プロジェクトスケジュールによる休日' }));
                        return;
                      }
                      setFormData((prev) => ({ ...prev, holidays: '', holidaysEn: '', holidaysJp: '' }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">{t.selectLabel || 'Chọn'}</option>
                    <option value="weekend">{language === 'ja' ? '土日休み' : language === 'en' ? 'Sat/Sun off' : 'Nghỉ T7, CN'}</option>
                    <option value="twoDays">{language === 'ja' ? '完全週休2日' : language === 'en' ? 'Two full days off per week' : 'Nghỉ hoàn toàn 2 ngày mỗi tuần'}</option>
                    <option value="oneToTwoShift">{language === 'ja' ? 'シフトにより週休1〜2日' : language === 'en' ? '1–2 days off per week (shift-based)' : 'Nghỉ 1–2 ngày mỗi tuần (theo lịch ca)'}</option>
                    <option value="shiftOff">{language === 'ja' ? 'シフト休' : language === 'en' ? 'Shift-based days off' : 'Nghỉ theo ca'}</option>
                    <option value="rotating">{language === 'ja' ? '交代制／シフト制' : language === 'en' ? 'Rotating shifts / shift work' : 'Làm việc luân phiên / xoay ca'}</option>
                    <option value="companyCalendar">{language === 'ja' ? '会社カレンダーによる休日' : language === 'en' ? 'According to company calendar' : 'Nghỉ theo lịch công ty'}</option>
                    <option value="projectSchedule">{language === 'ja' ? 'プロジェクトスケジュールによる休日' : language === 'en' ? 'According to project schedule' : 'Nghỉ theo lịch dự án'}</option>
                  </select>
                  {/* Chi tiết về ngày nghỉ */}
                  <label className="block text-[11px] font-semibold mt-2" style={{ color: '#111827' }}>
                    {t.jobHolidaysDetailLabel || 'Chi tiết về ngày nghỉ'}
                  </label>
                  {languageTab === 'vi' && (
                    <textarea
                      name="holidayDetails"
                      value={formData.holidayDetails || ''}
                      onChange={handleInputChange}
                      placeholder={t.jobHolidaysDetailPlaceholder || 'Chi tiết về ngày nghỉ (ví dụ: Nghỉ lễ theo lịch Nhật/Việt, số ngày phép năm, v.v.)'}
                      rows="2"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  )}
                  {languageTab === 'en' && (
                    <textarea
                      name="holidayDetailsEn"
                      value={formData.holidayDetailsEn || ''}
                      onChange={handleInputChange}
                      placeholder="Holiday details in English (e.g. national holidays, annual leave, etc.)"
                      rows="2"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <textarea
                      name="holidayDetailsJp"
                      value={formData.holidayDetailsJp || ''}
                      onChange={handleInputChange}
                      placeholder="休日の詳細（例：日本の祝日、有給休暇日数など）"
                      rows="2"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* 27. Thời hạn hợp đồng */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">
              {t.jobContractPeriodLabel || 'Thời hạn hợp đồng'}
            </label>
            {languageTab === 'vi' && (
              <input
                type="text"
                name="contractPeriod"
                value={formData.contractPeriod}
                onChange={handleInputChange}
                placeholder={t.jobContractPeriodPlaceholder || 'VD: Không thời hạn, 1 năm, 2 năm'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            )}
            {languageTab === 'en' && (
              <input
                type="text"
                name="contractPeriodEn"
                value={formData.contractPeriodEn}
                onChange={handleInputChange}
                placeholder="Contract period in English"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            )}
            {languageTab === 'jp' && (
              <input
                type="text"
                name="contractPeriodJp"
                value={formData.contractPeriodJp}
                onChange={handleInputChange}
                placeholder="契約期間（日本語）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            )}
          </div>
          {/* 28. Thử việc */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">
              {(t.jobProbationLabel) || 'Thử việc'}
            </label>
            {languageTab === 'vi' && (
              <input
                type="text"
                name="probationPeriod"
                value={formData.probationPeriod}
                onChange={handleInputChange}
                placeholder={t.jobProbationPlaceholder || 'VD: 2 tháng, 3 tháng, không thử việc'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            )}
            {languageTab === 'en' && (
              <input
                type="text"
                name="probationPeriodEn"
                value={formData.probationPeriodEn}
                onChange={handleInputChange}
                placeholder="Probation period in English"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            )}
            {languageTab === 'jp' && (
              <input
                type="text"
                name="probationPeriodJp"
                value={formData.probationPeriodJp}
                onChange={handleInputChange}
                placeholder="試用期間（日本語）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            )}
          </div>
          {/* 29. Chi tiết về thử việc */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">
              {(t.jobProbationDetailLabel) || 'Chi tiết về thử việc'}
            </label>
            {languageTab === 'vi' && (
              <textarea
                name="probationDetail"
                value={formData.probationDetail}
                onChange={handleInputChange}
                placeholder={t.jobProbationDetailPlaceholder || 'VD: Lương trong thời gian thử việc, BHXH trong thời gian thử việc...'}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            )}
            {languageTab === 'en' && (
              <textarea
                name="probationDetailEn"
                value={formData.probationDetailEn}
                onChange={handleInputChange}
                placeholder="Probation details in English"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            )}
            {languageTab === 'jp' && (
              <textarea
                name="probationDetailJp"
                value={formData.probationDetailJp}
                onChange={handleInputChange}
                placeholder="試用期間の詳細（日本語）"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            )}
          </div>
          {/* 30. Quy trình tuyển dụng */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">
              {t.jobRecruitmentProcessLabel || 'Quy trình tuyển dụng'} <span className="text-gray-500 font-normal">(điền text)</span>
            </label>
            {languageTab === 'vi' && (
              <textarea name="recruitmentProcess" value={formData.recruitmentProcess} onChange={handleInputChange} placeholder={t.jobRecruitmentProcessPlaceholder || 'VD: Phỏng vấn 1 vòng, Test kỹ năng...'} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
            )}
            {languageTab === 'en' && (
              <textarea name="recruitmentProcessEn" value={formData.recruitmentProcessEn} onChange={handleInputChange} placeholder="Recruitment process in English" rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
            )}
            {languageTab === 'jp' && (
              <textarea name="recruitmentProcessJp" value={formData.recruitmentProcessJp} onChange={handleInputChange} placeholder="選考フロー（日本語）" rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
            )}
          </div>
          {/* Hạn nộp hồ sơ */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
              {t.applicationDeadline || 'Hạn nộp hồ sơ'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
            </div>
          </div>

          {/* Block 3: Thông tin công ty tuyển dụng */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Building2 className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.jobRecruitingCompanySectionTitle || 'Thông tin công ty tuyển dụng'}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobRecruitingCompanyNameLabel || 'Tên công ty tuyển dụng'}
                  </label>
                  <input
                    type="text"
                    value={recruitingCompany.companyName}
                    onChange={(e) => setRecruitingCompany({ ...recruitingCompany, companyName: e.target.value })}
                    placeholder="VD: Công ty ABC"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{
                      borderColor: '#d1d5db',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobSourceCompanyLabel || 'Công ty nguồn'}
                  </label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleCompanyChange}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{
                      borderColor: '#d1d5db',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">
                      {t.jobSourceCompanySelectPlaceholder || t.jobCompanySelectPlaceholder || 'Chọn công ty (tùy chọn)'}
                    </option>
                    {companies.map((company, compIdx) => (
                      <option key={`company-${company.id}-${compIdx}`} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobRecruitingCompanyRevenueLabel || 'Doanh thu'}
                  </label>
                  <input
                    type="text"
                    value={recruitingCompany.revenue}
                    onChange={(e) => setRecruitingCompany({ ...recruitingCompany, revenue: e.target.value })}
                    placeholder="VD: 100 tỷ VND"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobRecruitingCompanyEmployeesLabel || 'Số nhân viên'}
                  </label>
                  <input
                    type="text"
                    value={recruitingCompany.numberOfEmployees}
                    onChange={(e) => setRecruitingCompany({ ...recruitingCompany, numberOfEmployees: e.target.value })}
                    placeholder="VD: 500-1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {languageTab === 'vi' && (
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                      {t.jobRecruitingCompanyHeadquartersLabel || 'Trụ sở tại'}
                    </label>
                    <input
                      type="text"
                      value={recruitingCompany.headquarters}
                      onChange={(e) => setRecruitingCompany({ ...recruitingCompany, headquarters: e.target.value })}
                      placeholder="VD: Tokyo, Japan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}
                {languageTab === 'en' && (
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                      {(t.jobRecruitingCompanyHeadquartersLabel || 'Trụ sở tại') + ' (EN)'}
                    </label>
                    <input
                      type="text"
                      value={recruitingCompany.headquartersEn}
                      onChange={(e) => setRecruitingCompany({ ...recruitingCompany, headquartersEn: e.target.value })}
                      placeholder="Headquarters in English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}
                {languageTab === 'jp' && (
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                      {(t.jobRecruitingCompanyHeadquartersLabel || 'Trụ sở tại') + ' (JP)'}
                    </label>
                    <input
                      type="text"
                      value={recruitingCompany.headquartersJp}
                      onChange={(e) => setRecruitingCompany({ ...recruitingCompany, headquartersJp: e.target.value })}
                      placeholder="本社所在地（日本語）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobRecruitingCompanyEstablishedDateLabel || 'Thành lập'}
                  </label>
                  <input
                    type="text"
                    value={recruitingCompany.establishedDate}
                    onChange={(e) => setRecruitingCompany({ ...recruitingCompany, establishedDate: e.target.value })}
                    placeholder="VD: 2010"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobRecruitingCompanyStockLabel || 'Thông tin sàn chứng khoán'}
                  </label>
                  <input
                    type="text"
                    value={recruitingCompany.stockExchangeInfo}
                    onChange={(e) => setRecruitingCompany({ ...recruitingCompany, stockExchangeInfo: e.target.value })}
                    placeholder={language === 'ja' ? '例: https://example.com' : language === 'en' ? 'e.g. https://example.com' : 'VD: https://example.com'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobRecruitingCompanyCapitalLabel || 'Vốn đầu tư'}
                  </label>
                  <input
                    type="text"
                    value={recruitingCompany.investmentCapital}
                    onChange={(e) => setRecruitingCompany({ ...recruitingCompany, investmentCapital: e.target.value })}
                    placeholder="VD: 50 tỷ VND"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              {languageTab === 'vi' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    {t.jobRecruitingCompanyIntroLabel || 'Giới thiệu chung về công ty'}
                  </label>
                  <textarea
                    value={recruitingCompany.companyIntroduction}
                    onChange={(e) => setRecruitingCompany({ ...recruitingCompany, companyIntroduction: e.target.value })}
                    placeholder="Giới thiệu về công ty..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
              )}
              {languageTab === 'en' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    {(t.jobRecruitingCompanyIntroLabel || 'Giới thiệu chung về công ty') + ' (EN)'}
                  </label>
                  <textarea
                    value={recruitingCompany.companyIntroductionEn}
                    onChange={(e) => setRecruitingCompany({ ...recruitingCompany, companyIntroductionEn: e.target.value })}
                    placeholder="Company introduction in English"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
              )}
              {languageTab === 'jp' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    {(t.jobRecruitingCompanyIntroLabel || 'Giới thiệu chung về công ty') + ' (JP)'}
                  </label>
                  <textarea
                    value={recruitingCompany.companyIntroductionJp}
                    onChange={(e) => setRecruitingCompany({ ...recruitingCompany, companyIntroductionJp: e.target.value })}
                    placeholder="会社概要（日本語）"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobRecruitingCompanyServicesLabel || 'Dịch vụ cung cấp'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setRecruitingCompany({
                      ...recruitingCompany,
                      services: [
                        ...recruitingCompany.services,
                        {
                          serviceName: '',
                          serviceNameEn: '',
                          serviceNameJp: '',
                          order: recruitingCompany.services.length
                        }
                      ]
                    })}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.jobRecruitingCompanyServicesAdd || 'Thêm dịch vụ'}
                  </button>
                </div>
                {recruitingCompany.services.map((service, index) => (
                  <div key={index} className="mb-3 space-y-1">
                    <div className="flex gap-2">
                      {languageTab === 'vi' && (
                        <input
                          type="text"
                          placeholder={t.jobRecruitingCompanyServiceNamePlaceholder || 'Tên dịch vụ'}
                          value={service.serviceName}
                          onChange={(e) => {
                            const newServices = [...recruitingCompany.services];
                            newServices[index].serviceName = e.target.value;
                            setRecruitingCompany({ ...recruitingCompany, services: newServices });
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      )}
                      {languageTab === 'en' && (
                        <input
                          type="text"
                          placeholder="Service name in English"
                          value={service.serviceNameEn || ''}
                          onChange={(e) => {
                            const newServices = [...recruitingCompany.services];
                            newServices[index].serviceNameEn = e.target.value;
                            setRecruitingCompany({ ...recruitingCompany, services: newServices });
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      )}
                      {languageTab === 'jp' && (
                        <input
                          type="text"
                          placeholder="サービス名（日本語）"
                          value={service.serviceNameJp || ''}
                          onChange={(e) => {
                            const newServices = [...recruitingCompany.services];
                            newServices[index].serviceNameJp = e.target.value;
                            setRecruitingCompany({ ...recruitingCompany, services: newServices });
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setRecruitingCompany({
                          ...recruitingCompany,
                          services: recruitingCompany.services.filter((_, i) => i !== index)
                        })}
                        className="p-1.5 text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.jobRecruitingCompanyBusinessSectorsLabel || 'Lĩnh vực kinh doanh (có thể chọn nhiều)'}
                </label>
                {/* Ô dropdown giống Lĩnh vực ở Thông tin cơ bản, nhưng cho phép thêm nhiều mục */}
                <div className="flex gap-2 mb-2">
                  <select
                    name="recruitingBusinessSectorKey"
                    value={recruitingBusinessSectorKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRecruitingBusinessSectorKey(val);
                      if (!val) return;
                      const opt = BUSINESS_SECTOR_OPTIONS.find(o => (o.key || o.vi) === val);
                      if (!opt) return;
                      const sectorName = opt.vi;
                      // Nếu đã có rồi thì không thêm nữa
                      const exists = (recruitingCompany.businessSectors || []).some(
                        bs => (bs.sectorName || '').trim() === sectorName
                      );
                      if (exists) return;
                      setRecruitingCompany(prev => ({
                        ...prev,
                        businessSectors: [
                          ...(prev.businessSectors || []),
                          {
                            sectorName,
                            sectorNameEn: opt.en || '',
                            sectorNameJp: opt.ja || '',
                            order: (prev.businessSectors || []).length
                          }
                        ]
                      }));
                      // Reset dropdown sau khi thêm
                      setRecruitingBusinessSectorKey('');
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-xs"
                    style={{
                      borderColor: '#d1d5db',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">
                      {t.jobCategorySelectPlaceholder || t.pleaseSelect || 'Chọn lĩnh vực'}
                    </option>
                    {BUSINESS_SECTOR_OPTIONS.map((option) => {
                      const label =
                        language === 'en'
                          ? option.en || option.vi
                          : language === 'ja'
                          ? option.ja || option.vi
                          : option.vi;
                      const value = option.key || option.vi;
                      return (
                        <option key={`recruit-sector-${value}`} value={value}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {/* Danh sách các lĩnh vực đã chọn cho doanh nghiệp, có thể xóa từng mục */}
                <div className="flex flex-wrap gap-1">
                  {(recruitingCompany.businessSectors || []).map((bs, idx) => (
                    <span
                      key={`selected-sector-${idx}`}
                      className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] border border-blue-200"
                    >
                      {(bs.sectorName || '').trim()}
                      <button
                        type="button"
                        onClick={() =>
                          setRecruitingCompany(prev => ({
                            ...prev,
                            businessSectors: (prev.businessSectors || []).filter((_, i) => i !== idx)
                          }))
                        }
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Campaigns */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Tag className="w-4 h-4 text-blue-600" />
              {t.jobCampaignSectionTitle || 'Chiến dịch'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.jobCampaignSelectLabel || 'Chọn chiến dịch'}
                </label>
                <select
                  multiple
                  value={selectedCampaignIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedCampaignIds(selected);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px]"
                  size="5"
                >
                  {campaigns.map((campaign, campIdx) => {
                    const name = pickByLanguage(campaign, 'name');
                    const statusLabel =
                      campaign.status === 1
                        ? (t.campaignStatusActive || '(Đang hoạt động)')
                        : campaign.status === 0
                        ? (t.campaignStatusInactive || '(Chưa bắt đầu)')
                        : (t.campaignStatusEnded || '(Đã kết thúc)');
                    return (
                      <option key={`campaign-${campaign.id}-${campIdx}`} value={campaign.id}>
                        {name} {statusLabel}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  {t.jobCampaignMultiSelectHint || 'Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều chiến dịch'}
                </p>
                {selectedCampaignIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCampaignIds.map((campaignId, tagIdx) => {
                      const campaign = campaigns.find(c => c.id === parseInt(campaignId));
                      if (!campaign) return null;
                      const name = pickByLanguage(campaign, 'name');
                      return (
                        <span
                          key={`campaign-tag-${campaignId}-${tagIdx}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={() => setSelectedCampaignIds(selectedCampaignIds.filter(id => id !== campaignId))}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chi tiết hoa hồng (Job Values) — UI lấy từ sss.ts, không có nút Thêm Type/Value */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Money className="w-4 h-4 text-blue-600" />
              {t.jobCommissionDetailSectionTitle || 'Cài đặt phí'}
            </h2>
            <div className="space-y-3">
              {/* Commission Type */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Loại hoa hồng <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobCommissionType"
                  value={formData.jobCommissionType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="fixed">Số tiền cố định</option>
                  <option value="percent">Phần trăm</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  {formData.jobCommissionType === 'fixed'
                    ? 'Giá trị trong Job Values sẽ được hiểu là số tiền cố định (VND). Ví dụ: 50000000 = 50 triệu VND'
                    : 'Giá trị trong Job Values sẽ được hiểu là phần trăm (%). Ví dụ: 30 = 30%'}
                </p>
              </div>
              {jobValues.map((jv, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Job Value #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setJobValues(jobValues.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-1">{t.typesLabel || 'Type'}</label>
                      <select
                        value={jv.typeId ?? ''}
                        onChange={async (e) => {
                          const selectedTypeId = e.target.value ? parseInt(e.target.value, 10) : null;
                          if (selectedTypeId) {
                            const response = await apiService.getValuesByType(selectedTypeId);
                            if (response.success && response.data) {
                              const valuesForType = response.data.values || [];
                              setValuesByType(prev => ({ ...prev, [selectedTypeId]: valuesForType }));
                              if (selectedTypeId === 2) {
                                const newJobValues = [...jobValues];
                                newJobValues[index] = { ...newJobValues[index], typeId: selectedTypeId, valueId: '', value: newJobValues[index].value ?? '', isRequired: newJobValues[index].isRequired ?? false };
                                setJobValues(newJobValues);
                              } else if (valuesForType.length > 0) {
                                const newJobValues = jobValues.filter((_, i) => i !== index);
                                const newJobValueCards = valuesForType.map(value => ({
                                  typeId: selectedTypeId,
                                  valueId: value.id,
                                  value: '',
                                  isRequired: false
                                }));
                                newJobValues.splice(index, 0, ...newJobValueCards);
                                setJobValues(newJobValues);
                              } else {
                                const newJobValues = [...jobValues];
                                newJobValues[index] = { ...newJobValues[index], typeId: selectedTypeId, valueId: '', value: newJobValues[index].value ?? '', isRequired: newJobValues[index].isRequired ?? false };
                                setJobValues(newJobValues);
                              }
                            }
                          } else {
                            const newJobValues = [...jobValues];
                            newJobValues[index] = { ...newJobValues[index], typeId: '', valueId: '', value: newJobValues[index].value ?? '', isRequired: newJobValues[index].isRequired ?? false };
                            setJobValues(newJobValues);
                          }
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">{t.selectType || t.typesLabel || 'Chọn Type'}</option>
                        {(types || []).map((type, typeIdx) => (
                          <option key={`type-${type.id}-${typeIdx}`} value={type.id}>
                            {pickByLanguage(type, 'typename')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-1">{t.valuesLabel || 'Value'}</label>
                      <select
                        value={jv.valueId ?? ''}
                        onChange={(e) => {
                          const newJobValues = [...jobValues];
                          newJobValues[index] = { ...newJobValues[index], valueId: e.target.value ? parseInt(e.target.value, 10) : '', value: newJobValues[index].value ?? '', isRequired: newJobValues[index].isRequired ?? false };
                          setJobValues(newJobValues);
                        }}
                        disabled={!jv.typeId}
                        required={jv.typeId === 2}
                        className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed ${jv.typeId === 2 && !jv.valueId ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Chọn Value{jv.typeId === 2 ? ' *' : ''}</option>
                        {(valuesByType[jv.typeId] || []).map((value, valIdx) => (
                          <option key={`val-${jv.typeId}-${value.id}-${valIdx}`} value={value.id}>
                            {pickByLanguage(value, 'valuename')}
                            {value.comparisonOperator && (
                              ` (${value.comparisonOperator} ${value.comparisonValue || ''}${value.comparisonOperator === 'between' ? ` - ${value.comparisonValueEnd || ''}` : ''})`
                            )}
                          </option>
                        ))}
                      </select>
                      {jv.typeId === 2 && !jv.valueId && (
                        <p className="text-[10px] text-red-500 mt-1">Vui lòng chọn Value (bắt buộc cho Type này)</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Giá trị cụ thể (value)
                      {formData.jobCommissionType === 'fixed' && <span className="text-gray-500 text-[10px] ml-1">(VND)</span>}
                      {formData.jobCommissionType === 'percent' && <span className="text-gray-500 text-[10px] ml-1">(%)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={formData.jobCommissionType === 'percent' ? '0.01' : '1'}
                        min="0"
                        max={formData.jobCommissionType === 'percent' ? '100' : undefined}
                        value={jv.value || ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (formData.jobCommissionType === 'percent' && inputValue && parseFloat(inputValue) > 100) {
                            alert('Phần trăm không được vượt quá 100%');
                            return;
                          }
                          const newJobValues = [...jobValues];
                          newJobValues[index] = { ...newJobValues[index], value: inputValue, typeId: newJobValues[index].typeId, valueId: newJobValues[index].valueId, isRequired: newJobValues[index].isRequired ?? false };
                          setJobValues(newJobValues);
                        }}
                        placeholder={formData.jobCommissionType === 'fixed' ? 'VD: 50000000 (VND)' : 'VD: 30 (%)'}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {formData.jobCommissionType === 'percent' && jv.value && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-500">%</span>
                      )}
                      {formData.jobCommissionType === 'fixed' && jv.value && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-500">VND</span>
                      )}
                    </div>
                    {formData.jobCommissionType === 'percent' && jv.value && parseFloat(jv.value) > 100 && (
                      <p className="text-[10px] text-red-500 mt-1">Phần trăm không được vượt quá 100%</p>
                    )}
                    {jv.value && formData.jobCommissionType === 'fixed' && (
                      <p className="text-[10px] text-gray-500 mt-1">{parseFloat(jv.value).toLocaleString('vi-VN')} VND</p>
                    )}
                    {jv.value && formData.jobCommissionType === 'percent' && (
                      <p className="text-[10px] text-gray-500 mt-1">{parseFloat(jv.value)}%</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jv.isRequired || false}
                      onChange={(e) => {
                        const newJobValues = [...jobValues];
                        newJobValues[index] = { ...newJobValues[index], isRequired: e.target.checked, typeId: newJobValues[index].typeId, valueId: newJobValues[index].valueId, value: newJobValues[index].value ?? '' };
                        setJobValues(newJobValues);
                      }}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                    />
                    <label className="text-xs font-semibold text-gray-900">Bắt buộc</label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setJobValues([...jobValues, { typeId: '', valueId: '', value: '', isRequired: false }])}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm Job Value
              </button>
              {errors.jobValues && <p className="text-[10px] text-red-500 mt-2">{errors.jobValues}</p>}
            </div>
          </div>

          {/* Status & Options */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              {t.jobOptionsSectionTitle || 'Tùy chọn'}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPinned"
                  checked={formData.isPinned}
                  onChange={handleInputChange}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label className="text-xs font-semibold text-gray-900">
                  Ghim lên đầu
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isHot"
                  checked={formData.isHot}
                  onChange={handleInputChange}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label className="text-xs font-semibold text-gray-900">
                  Việc làm hot
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
        </div>

        {/* Cột phải: Preview JD - có thể sửa trực tiếp trên form JD */}
        <div className="flex flex-col min-h-[320px] lg:min-h-0">
          <div
            className="rounded-lg border overflow-hidden flex flex-col flex-1 min-h-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)]"
            style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}
          >
            <button
              type="button"
              onClick={() => setShowJdTemplatePreview((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 border-b text-left font-semibold text-sm transition-colors hover:bg-gray-50 flex-shrink-0"
              style={{ color: '#111827', borderColor: '#e5e7eb' }}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" style={{ color: '#2563eb' }} />
                Xem JD theo template
                <span className="text-xs font-normal text-gray-500">
                  ({languageTab === 'vi' ? 'Tiếng Việt' : languageTab === 'en' ? 'English' : '日本語'})
                </span>
              </span>
              <span className="text-xs font-normal text-gray-500">
                {showJdTemplatePreview ? 'Thu gọn' : 'Mở rộng'}
              </span>
            </button>
            {showJdTemplatePreview && (
              <div
                className="p-4 overflow-y-auto flex-1 min-h-0"
                style={{ backgroundColor: '#fafafa' }}
              >
                {/* JD theo ngôn ngữ: Vi / EN / JP — đồng bộ với tab form */}
                <JdTemplate
                  lang={languageTab}
                  formData={formData}
                  setFormData={setFormData}
                  recruitingCompany={recruitingCompany}
                  setRecruitingCompany={setRecruitingCompany}
                  categories={categories}
                  jobValues={jobValues}
                  workingLocations={workingLocations}
                  setWorkingLocations={setWorkingLocations}
                  salaryRanges={salaryRanges}
                  setSalaryRanges={setSalaryRanges}
                  salaryRangeDetails={salaryRangeDetails}
                  setSalaryRangeDetails={setSalaryRangeDetails}
                  workingLocationDetails={workingLocationDetails}
                  setWorkingLocationDetails={setWorkingLocationDetails}
                  overtimeAllowances={overtimeAllowances}
                  overtimeAllowanceDetails={overtimeAllowanceDetails}
                  setOvertimeAllowanceDetails={setOvertimeAllowanceDetails}
                  requirements={requirements}
                  setRequirements={setRequirements}
                  workingHours={workingHours}
                  workingHourDetails={workingHourDetails}
                  setWorkingHourDetails={setWorkingHourDetails}
                />
              </div>
            )}
            <div className="flex gap-2 p-4 border-t flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
              <button
                type="button"
                onClick={handleCancel}
                onMouseEnter={() => setHoveredCancelButton(true)}
                onMouseLeave={() => setHoveredCancelButton(false)}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: hoveredCancelButton ? '#e5e7eb' : '#f3f4f6',
                  color: '#374151'
                }}
              >
                <X className="w-3.5 h-3.5" />
                {t.cancel || 'Hủy'}
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                onMouseEnter={() => !loading && setHoveredSaveButton(true)}
                onMouseLeave={() => setHoveredSaveButton(false)}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: loading 
                    ? '#93c5fd' 
                    : (hoveredSaveButton ? '#1d4ed8' : '#2563eb'),
                  color: 'white',
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                <Save className="w-3.5 h-3.5" />
                {loading ? (jobId ? 'Đang cập nhật...' : 'Đang lưu...') : (jobId ? 'Cập nhật công việc' : 'Lưu công việc')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Type */}
      {showAddTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddTypeModal(false)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{t.addTypeModalTitle}</h3>
              <button
                onClick={() => {
                  setShowAddTypeModal(false);
                  setNewTypeName('');
                  setNewTypeNameEn('');
                  setNewTypeNameJp('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.typeNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder={t.typeNamePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">{t.typeNameEnLabel}</label>
                <input
                  type="text"
                  value={newTypeNameEn}
                  onChange={(e) => setNewTypeNameEn(e.target.value)}
                  placeholder={t.typeNamePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">{t.typeNameJpLabel}</label>
                <input
                  type="text"
                  value={newTypeNameJp}
                  onChange={(e) => setNewTypeNameJp(e.target.value)}
                  placeholder={t.typeNamePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTypeModal(false);
                    setNewTypeName('');
                    setNewTypeNameEn('');
                    setNewTypeNameJp('');
                    setCvField('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleCreateType}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t.createType}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Type */}
      {showEditTypeModal && editingType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditTypeModal(false)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{t.editTypeModalTitle}</h3>
              <button
                onClick={() => {
                  setShowEditTypeModal(false);
                  setEditingType(null);
                  setNewTypeName('');
                  setNewTypeNameEn('');
                  setNewTypeNameJp('');
                  setCvField('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.typeNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder={t.typeNamePlaceholderEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">{t.typeNameEnLabel}</label>
                <input
                  type="text"
                  value={newTypeNameEn}
                  onChange={(e) => setNewTypeNameEn(e.target.value)}
                  placeholder={t.typeNamePlaceholderEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">{t.typeNameJpLabel}</label>
                <input
                  type="text"
                  value={newTypeNameJp}
                  onChange={(e) => setNewTypeNameJp(e.target.value)}
                  placeholder={t.typeNamePlaceholderEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">{t.cvFieldLabel}</label>
                <select
                  value={cvField}
                  onChange={(e) => setCvField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">{t.cvFieldNoCompare}</option>
                  <option value="jlptLevel">jlptLevel (JLPT Level)</option>
                  <option value="experienceYears">experienceYears (Số năm kinh nghiệm)</option>
                  <option value="specialization">specialization (Chuyên ngành)</option>
                  <option value="qualification">qualification (Bằng cấp)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">{t.cvFieldHint}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTypeModal(false);
                    setEditingType(null);
                    setNewTypeName('');
                    setNewTypeNameEn('');
                    setNewTypeNameJp('');
                    setCvField('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleEditType}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t.updateType}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Value */}
      {showAddValueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddValueModal(false)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{t.addValueModalTitle}</h3>
              <button
                onClick={() => {
                  setShowAddValueModal(false);
                  setNewValueNames('');
                  setNewValueNamesEn('');
                  setNewValueNamesJp('');
                  setSelectedTypeForValue('');
                  setUseComparisonOperator(false);
                  setComparisonOperator('');
                  setComparisonValue('');
                  setComparisonValueEnd('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.typeLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTypeForValue}
                  onChange={(e) => setSelectedTypeForValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">{t.selectType}</option>
                  {types.map((type, typeIdx) => (
                    <option key={`type-modal-${type.id}-${typeIdx}`} value={type.id}>
                      {pickByLanguage(type, 'typename')}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Comparison Operator Toggle */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={useComparisonOperator}
                  onChange={(e) => {
                    setUseComparisonOperator(e.target.checked);
                    if (!e.target.checked) {
                      setComparisonOperator('');
                      setComparisonValue('');
                      setComparisonValueEnd('');
                    }
                  }}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label className="text-xs font-semibold text-gray-900">{t.useComparisonOperator}</label>
              </div>
              
              {useComparisonOperator && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                      {t.comparisonOperatorLabel} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={comparisonOperator}
                      onChange={(e) => handleComparisonOperatorChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">{t.selectOperator}</option>
                      <option value=">=">Lớn hơn hoặc bằng (&gt;=)</option>
                      <option value="<=">Nhỏ hơn hoặc bằng (&lt;=)</option>
                      <option value=">">Lớn hơn (&gt;)</option>
                      <option value="<">Nhỏ hơn (&lt;)</option>
                      <option value="=">Bằng (=)</option>
                      <option value="between">Trong khoảng (between)</option>
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">
                      <strong>{t.comparisonNote}</strong>
                      <br />
                      <strong>{t.comparisonExample}</strong>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.comparisonValueLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={comparisonValue}
                        onChange={(e) => setComparisonValue(e.target.value)}
                        placeholder="VD: 3 (cho N3 hoặc 3 năm)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    {comparisonOperator === 'between' && (
                      <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                          {t.comparisonValueEndLabel} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={comparisonValueEnd}
                          onChange={(e) => setComparisonValueEnd(e.target.value)}
                          placeholder="VD: 5 (cho N5 hoặc 5 năm)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.valueNameLabel} <span className="text-red-500">*</span>
                  {!useComparisonOperator && (
                    <span className="text-gray-500 text-[10px] ml-2">{t.valueNameMultiHint}</span>
                  )}
                  {useComparisonOperator && (
                    <span className="text-gray-500 text-[10px] ml-2">{t.valueNameSingleHint}</span>
                  )}
                </label>
                {useComparisonOperator ? (
                  <input
                    type="text"
                    value={newValueNames}
                    onChange={(e) => setNewValueNames(e.target.value)}
                    placeholder="VD: Từ N3 trở lên, Trên 3 năm kinh nghiệm..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    autoFocus
                  />
                ) : (
                  <textarea
                    value={newValueNames}
                    onChange={(e) => setNewValueNames(e.target.value)}
                    placeholder="VD:&#10;Junior&#10;Senior&#10;Expert"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    autoFocus
                  />
                )}
                {!useComparisonOperator && (
                  <>
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{t.valueNameEnLabel}</label>
                      <textarea
                        value={newValueNamesEn}
                        onChange={(e) => setNewValueNamesEn(e.target.value)}
                        placeholder="English, one per line"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                      />
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{t.valueNameJpLabel}</label>
                      <textarea
                        value={newValueNamesJp}
                        onChange={(e) => setNewValueNamesJp(e.target.value)}
                        placeholder="日本語、1行に1つ"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                      />
                    </div>
                  </>
                )}
                {useComparisonOperator && (
                  <>
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{t.valueNameEnLabel}</label>
                      <input
                        type="text"
                        value={newValueNamesEn}
                        onChange={(e) => setNewValueNamesEn(e.target.value)}
                        placeholder="English"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{t.valueNameJpLabel}</label>
                      <input
                        type="text"
                        value={newValueNamesJp}
                        onChange={(e) => setNewValueNamesJp(e.target.value)}
                        placeholder="日本語"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </>
                )}
                {!useComparisonOperator && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    Nhập nhiều Value, mỗi Value trên một dòng. Hệ thống sẽ tạo tất cả các Value cùng lúc.
                  </p>
                )}
                {useComparisonOperator && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    Ví dụ: "Từ N3 trở lên", "Trên 3 năm kinh nghiệm", "Từ 2 đến 5 năm"
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddValueModal(false);
                    setNewValueNames('');
                    setNewValueNamesEn('');
                    setNewValueNamesJp('');
                    setSelectedTypeForValue('');
                    setUseComparisonOperator(false);
                    setComparisonOperator('');
                    setComparisonValue('');
                    setComparisonValueEnd('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleCreateValue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  {useComparisonOperator ? t.createValue : t.createValues}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Value */}
      {showEditValueModal && editingValue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditValueModal(false)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{t.editValueModalTitle}</h3>
              <button
                onClick={() => {
                  setShowEditValueModal(false);
                  setEditingValue(null);
                  setNewValueNames('');
                  setNewValueNameEn('');
                  setNewValueNameJp('');
                  setSelectedTypeForValue('');
                  setUseComparisonOperator(false);
                  setComparisonOperator('');
                  setComparisonValue('');
                  setComparisonValueEnd('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.typeLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTypeForValue}
                  onChange={(e) => setSelectedTypeForValue(e.target.value)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-100"
                >
                  <option value="">{t.selectType}</option>
                  {types.map((type, typeIdx) => (
                    <option key={`type-edit-${type.id}-${typeIdx}`} value={type.id}>
                      {pickByLanguage(type, 'typename')}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">{t.cannotChangeTypeWhenEdit}</p>
              </div>
              
              {/* Comparison Operator Toggle */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={useComparisonOperator}
                  onChange={(e) => {
                    setUseComparisonOperator(e.target.checked);
                    if (!e.target.checked) {
                      setComparisonOperator('');
                      setComparisonValue('');
                      setComparisonValueEnd('');
                    }
                  }}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label className="text-xs font-semibold text-gray-900">{t.useComparisonOperator}</label>
              </div>
              
              {useComparisonOperator && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                      {t.comparisonOperatorLabel} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={comparisonOperator}
                      onChange={(e) => handleComparisonOperatorChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">{t.selectOperator}</option>
                      <option value=">=">Lớn hơn hoặc bằng (&gt;=)</option>
                      <option value="<=">Nhỏ hơn hoặc bằng (&lt;=)</option>
                      <option value=">">Lớn hơn (&gt;)</option>
                      <option value="<">Nhỏ hơn (&lt;)</option>
                      <option value="=">Bằng (=)</option>
                      <option value="between">Trong khoảng (between)</option>
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">
                      <strong>{t.comparisonNote}</strong>
                      <br />
                      <strong>{t.comparisonExample}</strong>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.comparisonValueLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={comparisonValue}
                        onChange={(e) => setComparisonValue(e.target.value)}
                        placeholder="VD: 3 (cho N3 hoặc 3 năm)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    {comparisonOperator === 'between' && (
                      <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                          {t.comparisonValueEndLabel} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={comparisonValueEnd}
                          onChange={(e) => setComparisonValueEnd(e.target.value)}
                          placeholder="VD: 5 (cho N5 hoặc 5 năm)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.valueNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newValueNames}
                  onChange={(e) => setNewValueNames(e.target.value)}
                  placeholder="VD: Từ N3 trở lên, Trên 3 năm kinh nghiệm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Ví dụ: "Từ N3 trở lên", "Trên 3 năm kinh nghiệm", "Từ 2 đến 5 năm"
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">{t.valueNameEnLabel}</label>
                <input
                  type="text"
                  value={newValueNameEn}
                  onChange={(e) => setNewValueNameEn(e.target.value)}
                  placeholder="English"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">{t.valueNameJpLabel}</label>
                <input
                  type="text"
                  value={newValueNameJp}
                  onChange={(e) => setNewValueNameJp(e.target.value)}
                  placeholder="日本語"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditValueModal(false);
                    setEditingValue(null);
                    setNewValueNames('');
                    setNewValueNameEn('');
                    setNewValueNameJp('');
                    setSelectedTypeForValue('');
                    setUseComparisonOperator(false);
                    setComparisonOperator('');
                    setComparisonValue('');
                    setComparisonValueEnd('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleEditValue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t.updateValue}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddJobPage;

