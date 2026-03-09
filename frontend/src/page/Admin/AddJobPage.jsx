import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import { BUSINESS_SECTOR_OPTIONS } from '../../utils/businessSectorOptions';
import JdTemplate from '../../component/Admin/AddJob/JdTemplate';
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
    categoryId: '',
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
    contractPeriod: '',
    contractPeriodEn: '',
    contractPeriodJp: '',
    recruitmentProcess: '',
    recruitmentProcessEn: '',
    recruitmentProcessJp: '',
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
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [salaryRanges, setSalaryRanges] = useState([]);
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
  /** Tab ngôn ngữ form: 'vi' | 'en' | 'jp' — mỗi tab là form nhập riêng cho ngôn ngữ đó; ô chung hiển thị ở cả 3 tab. */
  const [languageTab, setLanguageTab] = useState('vi');

  useEffect(() => {
    loadCategories();
    loadCompanies();
    loadCampaigns();
    loadTypes();
    if (jobId) {
      loadJobData();
    }
  }, [jobId]);

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
          categoryId: job.jobCategoryId || job.categoryId || '',
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
          contractPeriod: job.contractPeriod || '',
          contractPeriodEn: job.contractPeriodEn || job.contract_period_en || '',
          contractPeriodJp: job.contractPeriodJp || job.contract_period_jp || '',
          recruitmentProcess: job.recruitmentProcess || '',
          recruitmentProcessEn: job.recruitmentProcessEn || job.recruitment_process_en || '',
          recruitmentProcessJp: job.recruitmentProcessJp || job.recruitment_process_jp || '',
          highlights: job.highlights || '',
          jobCommissionType: job.jobCommissionType || 'fixed',
          status: job.status !== undefined ? job.status : 1,
          isPinned: job.isPinned || false,
          isHot: job.isHot || false,
        });
        
        // Load related data
        if (job.workingLocations) {
          setWorkingLocations(job.workingLocations.map(wl => ({
            location: wl.location || '',
            country: wl.country || ''
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
          setRequirements(job.requirements.map(req => ({
            content: req.content || '',
            contentEn: req.contentEn || req.content_en || '',
            contentJp: req.contentJp || req.content_jp || '',
            type: req.type || '',
            status: req.status || ''
          })));
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
      const response = await apiService.getJobCategories({ status: 1 });
      if (response.success && response.data) {
        // Flatten tree structure if needed
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
        const flatCats = flattenCategories(response.data.categories || []);
        setCategories(flatCats);
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

  const handleJdFileJpChange = (e) => {
    if (e.target.files[0]) {
      setJdFileJp(e.target.files[0]);
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

    if (!formData.jobCode || !formData.jobCode.trim()) {
      newErrors.jobCode = t.jobCodeRequired || 'Mã việc làm là bắt buộc';
    }

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = t.jobTitleRequired || 'Tiêu đề công việc là bắt buộc';
    }

    if (!formData.slug || !formData.slug.trim()) {
      newErrors.slug = t.slugRequired || 'Slug là bắt buộc';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = t.jobCategoryRequired || 'Danh mục là bắt buộc';
    }

    // Validate: If typeId = 2, valueId is required
    const invalidJobValues = jobValues.filter(jv => jv.typeId === 2 && !jv.valueId);
    if (invalidJobValues.length > 0) {
      newErrors.jobValues = 'Vui lòng chọn Value cho các Type có ID = 2';
    }

    // Validate: Job Values format based on jobCommissionType
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
        contractPeriod: formData.contractPeriod || null,
        contractPeriodEn: formData.contractPeriodEn || null,
        contractPeriodJp: formData.contractPeriodJp || null,
        companyId: formData.companyId ? parseInt(formData.companyId) : null,
        recruitmentProcess: formData.recruitmentProcess || null,
        recruitmentProcessEn: formData.recruitmentProcessEn || null,
        recruitmentProcessJp: formData.recruitmentProcessJp || null,
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
    <div className="space-y-3">
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
        <div className="flex gap-2">
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
          {/* Basic Information — ô chung + ô theo tab */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Briefcase className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.jobBasicInfoSectionTitle || 'Thông tin cơ bản'}
            </h2>
            <div className="space-y-3">
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
              {/* Title theo tab: Vi = title, EN = titleEn, JP = titleJp */}
              {languageTab === 'vi' && (
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobTitleLabel || 'Tiêu đề công việc'} <span style={{ color: '#ef4444' }}>*</span>
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
                    {(t.jobTitleLabel || 'Tiêu đề công việc') + ' (EN)'}
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
                    {(t.jobTitleLabel || 'Tiêu đề công việc') + ' (JP)'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.jobCategoryLabel || 'Danh mục'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{
                      borderColor: errors.categoryId ? '#ef4444' : '#d1d5db',
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
                      {t.jobCategorySelectPlaceholder || t.pleaseSelect || 'Chọn danh mục'}
                    </option>
                    {categories.map((category, catIdx) => (
                      <option key={`cat-${category.id}-${catIdx}`} value={category.id}>
                        {pickByLanguage(category, 'name')}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {(t.jobSourceCompanyLabel || 'Công ty nguồn')} <span style={{ color: '#ef4444' }}>*</span>
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
              {languageTab === 'vi' && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.jobDescriptionLabel || 'Mô tả công việc'}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về công việc..."
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg text-xs resize-none"
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
              )}
              {languageTab === 'en' && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {(t.jobDescriptionLabel || 'Mô tả công việc') + ' (EN)'}
                </label>
                <textarea
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleInputChange}
                  placeholder="Job description in English"
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg text-xs resize-none"
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
              )}
              {languageTab === 'jp' && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {(t.jobDescriptionLabel || 'Mô tả công việc') + ' (JP)'}
                </label>
                <textarea
                  name="descriptionJp"
                  value={formData.descriptionJp}
                  onChange={handleInputChange}
                  placeholder="求人票の仕事内容（日本語）"
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg text-xs resize-none"
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
              )}
              {languageTab === 'vi' && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.jobInstructionLabel || 'Hướng dẫn ứng tuyển'}
                </label>
                <textarea
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  placeholder="Hướng dẫn cách ứng tuyển..."
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg text-xs resize-none"
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
              )}
              {languageTab === 'en' && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {(t.jobInstructionLabel || 'Hướng dẫn ứng tuyển') + ' (EN)'}
                </label>
                <textarea
                  name="instructionEn"
                  value={formData.instructionEn}
                  onChange={handleInputChange}
                  placeholder="Application instruction in English"
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg text-xs resize-none"
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
              )}
              {languageTab === 'jp' && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {(t.jobInstructionLabel || 'Hướng dẫn ứng tuyển') + ' (JP)'}
                </label>
                <textarea
                  name="instructionJp"
                  value={formData.instructionJp}
                  onChange={handleInputChange}
                  placeholder="応募方法（日本語）"
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg text-xs resize-none"
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
              )}

              {/* Hình thức tuyển dụng & Điểm nổi bật – đưa vào cùng block Thông tin cơ bản */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    {t.jobRecruitmentTypeLabel || 'Hình thức tuyển dụng'}
                  </label>
                  <select
                    name="recruitmentType"
                    value={formData.recruitmentType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">{t.jobRecruitmentTypePlaceholder || 'Chọn'}</option>
                    <option value="1">{t.jobRecruitmentTypeOption1 || 'Nhân viên chính thức'}</option>
                    <option value="2">{t.jobRecruitmentTypeOption2 || 'Nhân viên chính thức (công ty haken)'}</option>
                    <option value="3">{t.jobRecruitmentTypeOption3 || 'Nhân viên haken'}</option>
                    <option value="4">{t.jobRecruitmentTypeOption4 || 'Nhân viên hợp đồng'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    {t.jobHighlightsLabel || 'Điểm nổi bật công việc'}
                  </label>
                  <textarea
                    name="highlights"
                    value={formData.highlights}
                    onChange={handleInputChange}
                    placeholder={t.jobHighlightsPlaceholder || 'Nhập điểm nổi bật, mỗi dòng một ý (VD: Tuyển gấp, Chỉ 1 vòng phỏng vấn...)'}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recruiting Company Information */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Building2 className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.jobRecruitingCompanySectionTitle || 'Thông tin công ty tuyển dụng'}
            </h2>
            <div className="space-y-3">
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
                    placeholder="VD: TSE: 1234"
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
              
              {/* Services */}
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
              
              {/* Business Sectors - Chọn từ danh sách có sẵn, có thể chọn nhiều */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {t.jobRecruitingCompanyBusinessSectorsLabel || 'Lĩnh vực kinh doanh (có thể chọn nhiều)'}
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white">
                  <div className="grid grid-cols-1 gap-1">
                    {BUSINESS_SECTOR_OPTIONS.map((option) => {
                      const sectorName = option.vi;
                      const label =
                        language === 'en'
                          ? option.en || option.vi
                          : language === 'ja'
                          ? option.ja || option.vi
                          : option.vi;
                      const selectedSector = recruitingCompany.businessSectors.find(
                        bs => (bs.sectorName || '').trim() === sectorName
                      );
                      const isChecked = !!selectedSector;
                      return (
                        <label
                          key={sectorName}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRecruitingCompany({
                                  ...recruitingCompany,
                                  businessSectors: [
                                    ...recruitingCompany.businessSectors,
                                    {
                                      sectorName,
                                      sectorNameEn: option.en || '',
                                      sectorNameJp: option.ja || '',
                                      order: recruitingCompany.businessSectors.length
                                    }
                                  ]
                                });
                              } else {
                                setRecruitingCompany({
                                  ...recruitingCompany,
                                  businessSectors: recruitingCompany.businessSectors.filter(
                                    bs => (bs.sectorName || '').trim() !== sectorName
                                  )
                                });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                          />
                          <span className="text-xs text-gray-900">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                  {/* Hiển thị lĩnh vực tùy chỉnh (từ dữ liệu cũ không có trong danh sách) */}
                  {recruitingCompany.businessSectors
                    .filter(bs => {
                      const name = (bs.sectorName || '').trim();
                      return name && !BUSINESS_SECTOR_OPTIONS.some(opt => opt.vi === name);
                    })
                    .map((bs, idx) => {
                      const removeIndex = recruitingCompany.businessSectors.findIndex(
                        s => (s.sectorName || '').trim() === (bs.sectorName || '').trim() && s.order === bs.order
                      );
                      return (
                      <div key={`custom-${idx}`} className="flex items-center justify-between p-2 rounded bg-gray-50 mt-1">
                        <span className="text-xs text-gray-700">{bs.sectorName}</span>
                        <button
                          type="button"
                          onClick={() => setRecruitingCompany({
                            ...recruitingCompany,
                            businessSectors: recruitingCompany.businessSectors.filter((_, i) => i !== removeIndex)
                          })}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <MapPin className="w-4 h-4 text-blue-600" />
              {t.jobSectionLocation || t.workLocation || 'Địa điểm làm việc'}
            </h2>
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
                        setSelectedProvinces([]); // Reset selected provinces when country changes
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">{t.selectCountryPlaceholder || '-- Chọn quốc gia --'}</option>
                      <option value="Vietnam">{language === 'ja' ? 'ベトナム' : language === 'en' ? 'Vietnam' : 'Việt Nam'}</option>
                      <option value="Japan">{language === 'ja' ? '日本' : language === 'en' ? 'Japan' : 'Nhật Bản'}</option>
                      <option value="Other">{t.countryOtherOption || 'Khác (Nhập tùy chỉnh)'}</option>
                    </select>
                  </div>
                  
                  {selectedCountry && selectedCountry !== 'Other' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-700">
                          {t.selectProvincesLabel || 'Chọn tỉnh/thành phố (có thể chọn nhiều)'}
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const allProvinces = countryProvincesData[selectedCountry] || [];
                              setSelectedProvinces(allProvinces);
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {t.selectAll || 'Chọn tất cả'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedProvinces([])}
                            className="text-[10px] text-gray-600 hover:text-gray-700 font-medium"
                          >
                            {t.clearAll || 'Bỏ chọn tất cả'}
                          </button>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white">
                        <div className="grid grid-cols-2 gap-2">
                          {(countryProvincesData[selectedCountry] || []).map((province) => (
                            <label
                              key={province}
                              className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedProvinces.includes(province)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProvinces([...selectedProvinces, province]);
                                  } else {
                                    setSelectedProvinces(selectedProvinces.filter(p => p !== province));
                                  }
                                }}
                                className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                              />
                              <span className="text-xs text-gray-700">{province}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {selectedProvinces.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            // Add selected provinces to workingLocations
                            const newLocations = selectedProvinces.map(province => ({
                              location: province,
                              country: selectedCountry === 'Vietnam' ? 'Vietnam' : 'Japan'
                            }));
                            // Remove duplicates
                            const existingLocations = workingLocations.map(wl => `${wl.location}_${wl.country}`);
                            const uniqueNewLocations = newLocations.filter(nl => 
                              !existingLocations.includes(`${nl.location}_${nl.country}`)
                            );
                            setWorkingLocations([...workingLocations, ...uniqueNewLocations]);
                            setSelectedProvinces([]);
                            setSelectedCountry('');
                            alert(
                              (t.jobLocationAddedMessage || 'Đã thêm {count} địa điểm vào danh sách!')
                                .replace('{count}', uniqueNewLocations.length)
                            );
                          }}
                          className="mt-2 w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff'
                          }}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          {(t.jobLocationAddSelectedButton || 'Thêm {count} địa điểm đã chọn')
                            .replace('{count}', selectedProvinces.length)}
                        </button>
                      )}
                    </div>
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
                              <div className="text-xs font-medium text-gray-900">{wl.location}</div>
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
                  <option value="1">{language === 'ja' ? 'ベトナム' : language === 'en' ? 'Vietnam' : 'Việt Nam'}</option>
                  <option value="2">{language === 'ja' ? '日本' : language === 'en' ? 'Japan' : 'Nhật Bản'}</option>
                  <option value="3">{language === 'ja' ? 'ベトナム＆日本' : language === 'en' ? 'Vietnam & Japan' : 'Việt Nam & Nhật Bản'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary & Commission */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <DollarSign className="w-4 h-4 text-blue-600" />
              {t.jobSectionSalaryCommission || 'Lương & Hoa hồng'}
            </h2>
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
                        <input
                          type="text"
                          placeholder={t.jobSalaryTypePlaceholder || 'Loại (VD: yearly, monthly)'}
                          value={sr.type}
                          onChange={(e) => {
                            const newRanges = [...salaryRanges];
                            newRanges[index].type = e.target.value;
                            setSalaryRanges(newRanges);
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
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

          {/* Benefits */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Award className="w-4 h-4 text-blue-600" />
              {t.jobSectionBenefits || 'Phúc lợi'}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Social Insurance */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobBenefitsSocialInsuranceLabel || 'Bảo hiểm xã hội'}
                  </label>
                  {languageTab === 'vi' && (
                    <input
                      type="text"
                      name="socialInsurance"
                      value={formData.socialInsurance}
                      onChange={handleInputChange}
                      placeholder="VD: Có"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'en' && (
                    <input
                      type="text"
                      name="socialInsuranceEn"
                      value={formData.socialInsuranceEn}
                      onChange={handleInputChange}
                      placeholder="Social insurance details in English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <input
                      type="text"
                      name="socialInsuranceJp"
                      value={formData.socialInsuranceJp}
                      onChange={handleInputChange}
                      placeholder="社会保険に関する詳細（日本語）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>
                {/* Transportation */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobBenefitsTransportationLabel || 'Phụ cấp đi lại'}
                  </label>
                  {languageTab === 'vi' && (
                    <input
                      type="text"
                      name="transportation"
                      value={formData.transportation}
                      onChange={handleInputChange}
                      placeholder="VD: Có, tối đa 15,000円/tháng"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'en' && (
                    <input
                      type="text"
                      name="transportationEn"
                      value={formData.transportationEn}
                      onChange={handleInputChange}
                      placeholder="Transportation allowance details in English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <input
                      type="text"
                      name="transportationJp"
                      value={formData.transportationJp}
                      onChange={handleInputChange}
                      placeholder="交通費補助の詳細（日本語）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Working Time */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Clock className="w-4 h-4 text-blue-600" />
              {t.jobSectionWorkingTime || 'Thời gian làm việc'}
            </h2>
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
                  {languageTab === 'vi' && (
                    <input
                      type="text"
                      name="overtime"
                      value={formData.overtime}
                      onChange={handleInputChange}
                      placeholder="VD: Có, tùy dự án"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'en' && (
                    <input
                      type="text"
                      name="overtimeEn"
                      value={formData.overtimeEn}
                      onChange={handleInputChange}
                      placeholder="Overtime summary in English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <input
                      type="text"
                      name="overtimeJp"
                      value={formData.overtimeJp}
                      onChange={handleInputChange}
                      placeholder="残業に関する概要（日本語）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>
              </div>
              
              {/* Overtime Allowances */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobOvertimeAllowanceLabel || 'Phụ cấp làm thêm'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setOvertimeAllowances([...overtimeAllowances, { overtimeAllowanceRange: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.jobOvertimeAllowanceAdd || 'Thêm phụ cấp'}
                  </button>
                </div>
                {overtimeAllowances.map((oa, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <input
                      type="text"
                      placeholder={t.jobOvertimeAllowancePlaceholder || 'Phụ cấp làm thêm (VD: 1.25x)'}
                      value={oa.overtimeAllowanceRange}
                      onChange={(e) => {
                        const newAllowances = [...overtimeAllowances];
                        newAllowances[index].overtimeAllowanceRange = e.target.value;
                        setOvertimeAllowances(newAllowances);
                      }}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setOvertimeAllowances(overtimeAllowances.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Overtime Allowance Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobOvertimeAllowanceDetailLabel || 'Chi tiết phụ cấp làm thêm'}
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
                          placeholder={t.jobOvertimeAllowanceDetailPlaceholder || 'Chi tiết phụ cấp làm thêm...'}
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
              
              <div className="grid grid-cols-2 gap-3">
                {/* Holidays */}
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>
                    {t.jobHolidaysLabel || 'Ngày nghỉ'}
                  </label>
                  {languageTab === 'vi' && (
                    <input
                      type="text"
                      name="holidays"
                      value={formData.holidays}
                      onChange={handleInputChange}
                      placeholder="VD: Thứ 7, Chủ nhật, ngày lễ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'en' && (
                    <input
                      type="text"
                      name="holidaysEn"
                      value={formData.holidaysEn}
                      onChange={handleInputChange}
                      placeholder="Holidays details in English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                  {languageTab === 'jp' && (
                    <input
                      type="text"
                      name="holidaysJp"
                      value={formData.holidaysJp}
                      onChange={handleInputChange}
                      placeholder="休日に関する詳細（日本語）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>
                {/* Deadline */}
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
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Recruitment details (contract, process) */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Users className="w-4 h-4 text-blue-600" />
              {t.jobRecruitmentTypeSectionTitle || 'Chi tiết tuyển dụng'}
            </h2>
            <div className="space-y-3">
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
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  {t.jobRecruitmentProcessLabel || 'Quy trình tuyển dụng'}
                </label>
                {languageTab === 'vi' && (
                  <textarea
                    name="recruitmentProcess"
                    value={formData.recruitmentProcess}
                    onChange={handleInputChange}
                    placeholder={t.jobRecruitmentProcessPlaceholder || 'VD: Phỏng vấn 1 vòng, Test kỹ năng...'}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                )}
                {languageTab === 'en' && (
                  <textarea
                    name="recruitmentProcessEn"
                    value={formData.recruitmentProcessEn}
                    onChange={handleInputChange}
                    placeholder="Recruitment process in English"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                )}
                {languageTab === 'jp' && (
                  <textarea
                    name="recruitmentProcessJp"
                    value={formData.recruitmentProcessJp}
                    onChange={handleInputChange}
                    placeholder="選考フロー（日本語）"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <FileText className="w-4 h-4 text-blue-600" />
              {t.jobRequirementsSectionTitle || 'Yêu cầu công việc'}
            </h2>
              <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-900">
                  {t.jobRequirementLabel || 'Yêu cầu'}
                </label>
                <button
                  type="button"
                    onClick={() => setRequirements([
                      ...requirements,
                      { content: '', contentEn: '', contentJp: '', type: '', status: '' }
                    ])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {t.jobRequirementAdd || 'Thêm yêu cầu'}
                </button>
              </div>
              {requirements.map((req, index) => (
                <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg space-y-2">
                  <div className="space-y-1">
                    {languageTab === 'vi' && (
                      <textarea
                        placeholder={t.jobRequirementContentPlaceholder || 'Nội dung yêu cầu...'}
                        value={req.content}
                        onChange={(e) => {
                          const newReqs = [...requirements];
                          newReqs[index].content = e.target.value;
                          setRequirements(newReqs);
                        }}
                        rows="2"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                      />
                    )}
                    {languageTab === 'en' && (
                      <textarea
                        placeholder="Requirement in English"
                        value={req.contentEn || ''}
                        onChange={(e) => {
                          const newReqs = [...requirements];
                          newReqs[index].contentEn = e.target.value;
                          setRequirements(newReqs);
                        }}
                        rows="2"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                      />
                    )}
                    {languageTab === 'jp' && (
                      <textarea
                        placeholder="応募条件（日本語）"
                        value={req.contentJp || ''}
                        onChange={(e) => {
                          const newReqs = [...requirements];
                          newReqs[index].contentJp = e.target.value;
                          setRequirements(newReqs);
                        }}
                        rows="2"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={req.type || ''}
                      onChange={(e) => {
                        const newReqs = [...requirements];
                        newReqs[index].type = e.target.value;
                        setRequirements(newReqs);
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">{t.jobRequirementTypePlaceholder || 'Chọn loại'}</option>
                      <option value="technique">{t.jobRequirementTypeTechnique || 'Kỹ thuật (technique)'}</option>
                      <option value="education">{t.jobRequirementTypeEducation || 'Học vấn (education)'}</option>
                      <option value="experience">{t.jobRequirementTypeExperience || 'Kinh nghiệm (experience)'}</option>
                      <option value="language">{t.jobRequirementTypeLanguage || 'Ngôn ngữ (language)'}</option>
                      <option value="certification">{t.jobRequirementTypeCertification || 'Chứng chỉ (certification)'}</option>
                      <option value="skill">{t.jobRequirementTypeSkill || 'Kỹ năng (skill)'}</option>
                      <option value="other">{t.jobRequirementTypeOther || 'Khác (other)'}</option>
                    </select>
                    <div className="flex gap-1">
                      <select
                        value={req.status || ''}
                        onChange={(e) => {
                          const newReqs = [...requirements];
                          newReqs[index].status = e.target.value;
                          setRequirements(newReqs);
                        }}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">{t.jobRequirementStatusPlaceholder || 'Chọn trạng thái'}</option>
                        <option value="required">{t.jobRequirementStatusRequired || 'Bắt buộc (required)'}</option>
                        <option value="optional">{t.jobRequirementStatusOptional || 'Tùy chọn (optional)'}</option>
                        <option value="preferred">{t.jobRequirementStatusPreferred || 'Ưu tiên (preferred)'}</option>
                        <option value="nice-to-have">{t.jobRequirementStatusNiceToHave || 'Có thì tốt (nice-to-have)'}</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setRequirements(requirements.filter((_, i) => i !== index))}
                        className="p-1.5 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smoking Policies */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Tag className="w-4 h-4 text-blue-600" />
              {t.jobSmokingPolicySectionTitle || 'Chính sách hút thuốc'}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-900">
                  {t.jobSmokingPolicyLabel || 'Chính sách'}
                </label>
                <button
                  type="button"
                  onClick={() => setSmokingPolicies([...smokingPolicies, { allow: false }])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {t.jobSmokingPolicyAdd || 'Thêm chính sách'}
                </button>
              </div>
              {smokingPolicies.map((sp, index) => (
                <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sp.allow}
                        onChange={(e) => {
                          const newPolicies = [...smokingPolicies];
                          newPolicies[index].allow = e.target.checked;
                          setSmokingPolicies(newPolicies);
                        }}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                      />
                      <label className="text-xs font-semibold text-gray-900">
                        {t.jobSmokingPolicyAllowLabel || 'Cho phép hút thuốc'}
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSmokingPolicies(smokingPolicies.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Smoking Policy Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    {t.jobSmokingPolicyDetailLabel || 'Chi tiết chính sách'}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSmokingPolicyDetails([
                        ...smokingPolicyDetails,
                        { content: '', contentEn: '', contentJp: '' }
                      ])
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.jobSmokingPolicyDetailAdd || 'Thêm chi tiết'}
                  </button>
                </div>
                {smokingPolicyDetails.map((spd, index) => (
                  <div key={index} className="mb-3 space-y-1">
                    <div className="flex gap-2">
                      {languageTab === 'vi' && (
                        <textarea
                          placeholder={t.jobSmokingPolicyDetailPlaceholder || 'Chi tiết chính sách hút thuốc...'}
                          value={spd.content}
                          onChange={(e) => {
                            const newDetails = [...smokingPolicyDetails];
                            newDetails[index].content = e.target.value;
                            setSmokingPolicyDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'en' && (
                        <textarea
                          placeholder="Smoking policy details in English"
                          value={spd.contentEn || ''}
                          onChange={(e) => {
                            const newDetails = [...smokingPolicyDetails];
                            newDetails[index].contentEn = e.target.value;
                            setSmokingPolicyDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      {languageTab === 'jp' && (
                        <textarea
                          placeholder="喫煙ポリシーの詳細（日本語）"
                          value={spd.contentJp || ''}
                          onChange={(e) => {
                            const newDetails = [...smokingPolicyDetails];
                            newDetails[index].contentJp = e.target.value;
                            setSmokingPolicyDetails(newDetails);
                          }}
                          rows="2"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setSmokingPolicyDetails(
                            smokingPolicyDetails.filter((_, i) => i !== index)
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
            </div>
          </div>

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

          {/* Manage Types & Values */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Tag className="w-4 h-4 text-blue-600" />
              {t.jobTypeValueSectionTitle}
            </h2>
            <div className="space-y-4">
              {/* Types Management */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">{t.typesLabel}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTypeModal(true);
                      setNewTypeName('');
                      setNewTypeNameEn('');
                      setNewTypeNameJp('');
                      setCvField('');
                      setEditingType(null);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.addType}
                  </button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {types.map((type, typeIdx) => (
                    <div key={`type-row-${type.id}-${typeIdx}`} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                      <span className="text-xs font-medium text-gray-900">{pickByLanguage(type, 'typename')}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingType(type);
                            setNewTypeName(type.typename || '');
                            setNewTypeNameEn(type.typenameEn || '');
                            setNewTypeNameJp(type.typenameJp || '');
                            setCvField(type.cvField || '');
                            setShowEditTypeModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1"
                          title={t.edit}
                        >
                          {t.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteType(type.id)}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1"
                          title={t.delete}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  ))}
                  {types.length === 0 && (
                    <p className="text-[10px] text-gray-500 text-center py-2">{t.noTypesYet}</p>
                  )}
                </div>
              </div>

              {/* Values Management */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">{t.valuesLabel}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddValueModal(true);
                      setNewValueNames('');
                      setNewValueNamesEn('');
                      setNewValueNamesJp('');
                      setSelectedTypeForValue('');
                      setEditingValue(null);
                      setUseComparisonOperator(false);
                      setComparisonOperator('');
                      setComparisonValue('');
                      setComparisonValueEnd('');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.addValue}
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {types.map((type, typeIdx) => {
                    const typeValues = valuesByType[type.id] || [];
                    if (typeValues.length === 0) return null;
                    return (
                      <div key={`type-values-${type.id}-${typeIdx}`} className="border border-gray-200 rounded p-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">{pickByLanguage(type, 'typename')}:</div>
                        <div className="space-y-1">
                          {typeValues.map((value, valIdx) => (
                            <div key={`val-row-${type.id}-${value.id}-${valIdx}`} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                              <span className="text-xs text-gray-900">
                                {pickByLanguage(value, 'valuename')}
                                {value.comparisonOperator && (
                                  <span className="text-gray-500 ml-1">
                                    ({value.comparisonOperator} {value.comparisonValue}
                                    {value.comparisonOperator === 'between' ? ` - ${value.comparisonValueEnd}` : ''})
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingValue(value);
                                    setNewValueNames(value.valuename || '');
                                    setNewValueNameEn(value.valuenameEn || '');
                                    setNewValueNameJp(value.valuenameJp || '');
                                    setSelectedTypeForValue(value.typeId.toString());
                                    setUseComparisonOperator(!!value.comparisonOperator);
                                    setComparisonOperator(value.comparisonOperator || '');
                                    setComparisonValue(value.comparisonValue || '');
                                    setComparisonValueEnd(value.comparisonValueEnd || '');
                                    setShowEditValueModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-[10px] px-1.5 py-0.5"
                                  title={t.edit}
                                >
                                  {t.edit}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteValue(value.id, value.typeId)}
                                  className="text-red-600 hover:text-red-800 text-[10px] px-1.5 py-0.5"
                                  title={t.delete}
                                >
                                  {t.delete}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(valuesByType).length === 0 && (
                    <p className="text-[10px] text-gray-500 text-center py-2">{t.noValuesYet}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Values (Commission Details) */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Money className="w-4 h-4 text-blue-600" />
              {t.jobCommissionDetailSectionTitle || 'Chi tiết hoa hồng (Job Values)'}
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
                      <div className="flex items-center gap-1 mb-1">
                        <label className="block text-xs font-semibold text-gray-900">Type</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddTypeModal(true);
                            setNewTypeName('');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-[10px] flex items-center gap-0.5"
                          title="Thêm Type mới"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <select
                        value={jv.typeId || ''}
                        onChange={async (e) => {
                          const selectedTypeId = e.target.value ? parseInt(e.target.value) : null;
                          if (selectedTypeId) {
                            // Force reload to ensure all values are loaded
                            const response = await apiService.getValuesByType(selectedTypeId);
                            if (response.success && response.data) {
                              const valuesForType = response.data.values || [];
                              
                              // Update valuesByType state
                              setValuesByType(prev => ({
                                ...prev,
                                [selectedTypeId]: valuesForType
                              }));
                              
                              // Special case: Type ID 2 requires manual value selection
                              if (selectedTypeId === 2) {
                                // Just update the current card, don't create multiple cards
                                const newJobValues = [...jobValues];
                                newJobValues[index].typeId = selectedTypeId;
                                newJobValues[index].valueId = '';
                                setJobValues(newJobValues);
                              } else if (valuesForType.length > 0) {
                                // For other types with values, create cards for each value
                                // Remove current jobValue at this index
                                const newJobValues = jobValues.filter((_, i) => i !== index);
                                
                                // Create new jobValues for each value in the selected type
                                const newJobValueCards = valuesForType.map(value => ({
                                  typeId: selectedTypeId,
                                  valueId: value.id,
                                  value: '',
                                  isRequired: false
                                }));
                                
                                // Insert new cards at the same position
                                newJobValues.splice(index, 0, ...newJobValueCards);
                                
                                setJobValues(newJobValues);
                              } else {
                                // If type has no values, just update the current card
                                const newJobValues = [...jobValues];
                                newJobValues[index].typeId = selectedTypeId;
                                newJobValues[index].valueId = '';
                                setJobValues(newJobValues);
                              }
                            }
                          } else {
                            // If no type selected, just update the current card
                            const newJobValues = [...jobValues];
                            newJobValues[index].typeId = '';
                            newJobValues[index].valueId = '';
                            setJobValues(newJobValues);
                          }
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">{t.selectType}</option>
                        {types.map((type, typeIdx) => (
                          <option key={`type-${type.id}-${typeIdx}`} value={type.id}>
                            {pickByLanguage(type, 'typename')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <label className="block text-xs font-semibold text-gray-900">Value</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!jv.typeId) {
                              alert('Vui lòng chọn Type trước');
                              return;
                            }
                            setSelectedTypeForValue(jv.typeId.toString());
                            setShowAddValueModal(true);
                            setNewValueNames('');
                            setNewValueNamesEn('');
                            setNewValueNamesJp('');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-[10px] flex items-center gap-0.5"
                          title={t.addValueButtonTitle}
                          disabled={!jv.typeId}
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <select
                        value={jv.valueId || ''}
                        onChange={(e) => {
                          const newJobValues = [...jobValues];
                          newJobValues[index].valueId = parseInt(e.target.value);
                          setJobValues(newJobValues);
                        }}
                        disabled={!jv.typeId}
                        required={jv.typeId === 2}
                        className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          jv.typeId === 2 && !jv.valueId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Chọn Value{jv.typeId === 2 ? ' *' : ''}</option>
                        {valuesByType[jv.typeId]?.map((value, valIdx) => (
                          <option key={`val-${jv.typeId}-${value.id}-${valIdx}`} value={value.id}>
                            {pickByLanguage(value, 'valuename')}
                            {value.comparisonOperator && (
                              ` (${value.comparisonOperator} ${value.comparisonValue}${value.comparisonOperator === 'between' ? ` - ${value.comparisonValueEnd}` : ''})`
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
                      {formData.jobCommissionType === 'fixed' && (
                        <span className="text-gray-500 text-[10px] ml-1">(VND)</span>
                      )}
                      {formData.jobCommissionType === 'percent' && (
                        <span className="text-gray-500 text-[10px] ml-1">(%)</span>
                      )}
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
                          // Validate: nếu là percent, không được vượt quá 100
                          if (formData.jobCommissionType === 'percent' && inputValue && parseFloat(inputValue) > 100) {
                            alert('Phần trăm không được vượt quá 100%');
                            return;
                          }
                          const newJobValues = [...jobValues];
                          newJobValues[index].value = inputValue;
                          setJobValues(newJobValues);
                        }}
                        placeholder={
                          formData.jobCommissionType === 'fixed' 
                            ? 'VD: 50000000 (VND)' 
                            : 'VD: 30 (%)'
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {formData.jobCommissionType === 'percent' && jv.value && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-500">
                          %
                        </span>
                      )}
                      {formData.jobCommissionType === 'fixed' && jv.value && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-500">
                          VND
                        </span>
                      )}
                    </div>
                    {formData.jobCommissionType === 'percent' && jv.value && parseFloat(jv.value) > 100 && (
                      <p className="text-[10px] text-red-500 mt-1">Phần trăm không được vượt quá 100%</p>
                    )}
                    {jv.value && formData.jobCommissionType === 'fixed' && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {parseFloat(jv.value).toLocaleString('vi-VN')} VND
                      </p>
                    )}
                    {jv.value && formData.jobCommissionType === 'percent' && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {parseFloat(jv.value)}%
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jv.isRequired || false}
                      onChange={(e) => {
                        const newJobValues = [...jobValues];
                        newJobValues[index].isRequired = e.target.checked;
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
                  salaryRanges={salaryRanges}
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

