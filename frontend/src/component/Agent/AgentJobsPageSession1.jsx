import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Globe,
  Star,
  CheckSquare,
  Plus,
  X,
  ChevronDown,
  Clock,
  RotateCw,
  Bookmark,
  Heart,
  Info,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import { BUSINESS_SECTOR_OPTIONS } from '../../utils/businessSectorOptions';
import { JAPAN_REGIONS, JAPAN_PREFECTURES, fetchJapanCitiesByPrefecture, kanaToRomaji } from '../../utils/japanLocationData';


// Mock data for static options
const mockLocations = [
  'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Fukuoka', 'Sapporo', 'Sendai',
  'Hiroshima', 'Kobe', 'Chiba', 'Saitama', 'Kanagawa', 'Aichi', 'Hyogo'
];

/** Tỉnh/thành Việt Nam — chọn phẳng giống AddJob */
const VIETNAM_PROVINCES = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu',
  'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương',
  'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
  'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương',
  'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình',
  'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh',
  'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
];

const LOCATION_FILTER_COUNTRY_KEYS = ['Vietnam', 'Japan'];

const countryFilterLabel = (key, lang) => {
  if (key === 'Vietnam') return lang === 'en' ? 'Vietnam' : lang === 'ja' ? 'ベトナム' : 'Việt Nam';
  if (key === 'Japan') return lang === 'en' ? 'Japan' : lang === 'ja' ? '日本' : 'Nhật Bản';
  return key;
};

const mockEmploymentTypes = [
  'Nhân viên chính thức',
  'Nhân viên hợp đồng',
  'Bán thời gian / Thời vụ',
  'Nhân viên tạm thời',
  'Ủy thác công việc',
];


const mockHighlights = [
  'Chưa có kinh nghiệm OK',
  'Ít làm thêm giờ',
  'Nghỉ thứ 7, Chủ nhật, ngày lễ',
  'Có thể làm việc từ xa',
  'Không chuyển công tác',
  'Có tăng lương',
  'Có thưởng',
  'Có bảo hiểm xã hội đầy đủ',
];

// Header Navigation Buttons Component
const HeaderNavigationButtons = ({ 
  onSearchHistoryClick, 
  onSavedCriteriaClick, 
  onSavedListClick,
  compact = false,
  hoveredNavButtonIndex,
  setHoveredNavButtonIndex,
  savedListsTotalJobs = 0
}) => {
  if (compact) {
    return (
      <div className="mb-1">
        <div className="flex items-center gap-0">
          <button
            onClick={onSearchHistoryClick}
            onMouseEnter={() => setHoveredNavButtonIndex('history-compact')}
            onMouseLeave={() => setHoveredNavButtonIndex(null)}
            className="flex items-center gap-1 px-1.5 py-0.5 transition-colors justify-center text-[9px]"
            style={{
              backgroundColor: hoveredNavButtonIndex === 'history-compact' ? '#f9fafb' : 'transparent'
            }}
          >
            <Clock className="w-2.5 h-2.5" style={{ color: '#f97316' }} />
            <span className="font-medium truncate" style={{ color: '#1e3a8a' }}>Lịch sử</span>
          </button>
          <span className="text-[9px]" style={{ color: '#d1d5db' }}>|</span>
          <button
            onClick={onSavedCriteriaClick}
            onMouseEnter={() => setHoveredNavButtonIndex('criteria-compact')}
            onMouseLeave={() => setHoveredNavButtonIndex(null)}
            className="flex items-center gap-1 px-1.5 py-0.5 transition-colors justify-center text-[9px]"
            style={{
              backgroundColor: hoveredNavButtonIndex === 'criteria-compact' ? '#f9fafb' : 'transparent'
            }}
          >
            <Bookmark className="w-2.5 h-2.5" style={{ color: '#60a5fa' }} />
            <span className="font-medium truncate" style={{ color: '#1e3a8a' }}>Tiêu chí đã lưu</span>
          </button>
          <span className="text-[9px]" style={{ color: '#d1d5db' }}>|</span>
          <button
            onClick={onSavedListClick}
            onMouseEnter={() => setHoveredNavButtonIndex('list-compact')}
            onMouseLeave={() => setHoveredNavButtonIndex(null)}
            className="flex items-center gap-1 px-1.5 py-0.5 transition-colors justify-center text-[9px]"
            style={{
              backgroundColor: hoveredNavButtonIndex === 'list-compact' ? '#f9fafb' : 'transparent'
            }}
          >
            <Heart className="w-2.5 h-2.5" style={{ color: '#ef4444' }} />
            <span className="font-medium truncate" style={{ color: '#1e3a8a' }}>Danh sách{savedListsTotalJobs > 0 ? ` (${savedListsTotalJobs})` : ''}</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-2">
      <div className="flex items-center gap-0">
        <button
          onClick={onSearchHistoryClick}
          onMouseEnter={() => setHoveredNavButtonIndex('history')}
          onMouseLeave={() => setHoveredNavButtonIndex(null)}
          className="flex items-center gap-1 px-2 py-1 transition-colors justify-center text-[9px]"
          style={{
            backgroundColor: hoveredNavButtonIndex === 'history' ? '#f9fafb' : 'transparent'
          }}
        >
          <Clock className="w-3 h-3" style={{ color: '#f97316' }} />
          <span className="font-medium whitespace-nowrap" style={{ color: '#1e3a8a' }}>Lịch sử tìm kiếm</span>
        </button>
        <span className="text-[9px]" style={{ color: '#d1d5db' }}>|</span>
        <button
          onClick={onSavedCriteriaClick}
          onMouseEnter={() => setHoveredNavButtonIndex('criteria')}
          onMouseLeave={() => setHoveredNavButtonIndex(null)}
          className="flex items-center gap-1 px-2 py-1 transition-colors justify-center text-[9px]"
          style={{
            backgroundColor: hoveredNavButtonIndex === 'criteria' ? '#f9fafb' : 'transparent'
          }}
        >
          <Bookmark className="w-3 h-3" style={{ color: '#60a5fa' }} />
          <span className="font-medium whitespace-nowrap" style={{ color: '#1e3a8a' }}>Tiêu chí tìm kiếm đã lưu</span>
        </button>
        <span className="text-[9px]" style={{ color: '#d1d5db' }}>|</span>
        <button
          onClick={onSavedListClick}
          onMouseEnter={() => setHoveredNavButtonIndex('list')}
          onMouseLeave={() => setHoveredNavButtonIndex(null)}
          className="flex items-center gap-1 px-2 py-1 transition-colors justify-center text-[9px]"
          style={{
            backgroundColor: hoveredNavButtonIndex === 'list' ? '#f9fafb' : 'transparent'
          }}
        >
          <Heart className="w-3 h-3" style={{ color: '#ef4444' }} />
          <span className="font-medium whitespace-nowrap" style={{ color: '#1e3a8a' }}>
            Danh sách lưu giữ{savedListsTotalJobs > 0 ? <span className="font-bold"> {savedListsTotalJobs} miếng</span> : null}
          </span>
        </button>
      </div>
    </div>
  );
};

// FilterBlock đặt ngoài component để không bị tạo mới mỗi lần render (tránh input mất focus khi gõ)
const FilterBlock = ({ 
  icon: Icon, 
  label, 
  children, 
  helperText,
  compact = false
}) => (
  <div className="flex gap-1 min-w-0 items-start">
    <div className="flex-shrink-0 leading-none">
      <Icon className="w-3 h-3 text-gray-600" />
    </div>
    <div className="flex-1 space-y-0.5 min-w-0">
      <label className="text-[9px] font-medium text-gray-700 block h-3 leading-3">{label}</label>
      {children}
      {helperText && (
        <p className="text-[9px] text-gray-500">{helperText}</p>
      )}
    </div>
  </div>
);

const AgentJobsPageSession1 = ({ onSearch, onFiltersChange, compact = false, useAdminAPI = false, adminCompanyId = '', adminHasCampaign = false, adminCreatedFrom = '', adminCreatedTo = '', adminJapaneseLevel = '', adminRecruitmentLocation = '', adminWorkLocation = '' }) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const keywordInputRef = useRef(null);

  // State
  const [filters, setFilters] = useState({
    keyword: '',
    locations: [], // Array of { country: string, location: string }
    fieldIds: [], // Loại công việc
    jobTypeIds: [], // Ngành nghề
    sectorNames: [], // Lĩnh vực kinh doanh
    age: null,
    salaryMin: '',
    salaryMax: '',
    employmentType: null,
    highlights: [],
    booleans: {
      noExperienceOk: false,
      underOneYearOk: false,
      graduatingSoonOk: false,
      remoteOk: false,
    },
  });

  // const [showKeywordMode, setShowKeywordMode] = useState(false); // Đã bỏ OR/AND cho keyword
  const [showLocationModal, setShowLocationModal] = useState(false); // Show both modals together
  const [selectedCountries, setSelectedCountries] = useState([]); // Array of selected countries
  /** Nhật Bản: vùng → tỉnh → phường/thành (giống AddJob) */
  const [japanFilterRegion, setJapanFilterRegion] = useState(null);
  const [japanFilterPrefecture, setJapanFilterPrefecture] = useState(null);
  const [japanFilterData, setJapanFilterData] = useState({ flat: [], tree: [] });
  const [japanFilterLoading, setJapanFilterLoading] = useState(false);

  // Sync selectedCountries with filters.locations when modal opens
  useEffect(() => {
    if (showLocationModal) {
      const countries = new Set();
      filters.locations.forEach(loc => {
        if (loc.country) countries.add(loc.country);
      });
      setSelectedCountries(Array.from(countries));
    }
  }, [showLocationModal]);

  useEffect(() => {
    if (!selectedCountries.includes('Japan')) {
      setJapanFilterRegion(null);
      setJapanFilterPrefecture(null);
      setJapanFilterData({ flat: [], tree: [] });
    }
  }, [selectedCountries]);

  useEffect(() => {
    if (!japanFilterPrefecture) {
      setJapanFilterData({ flat: [], tree: [] });
      return;
    }
    let cancelled = false;
    setJapanFilterLoading(true);
    fetchJapanCitiesByPrefecture(japanFilterPrefecture)
      .then((r) => {
        if (!cancelled) setJapanFilterData(r || { flat: [], tree: [] });
      })
      .catch(() => {
        if (!cancelled) setJapanFilterData({ flat: [], tree: [] });
      })
      .finally(() => {
        if (!cancelled) setJapanFilterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [japanFilterPrefecture]);
  const [showFieldJobTypeModal, setShowFieldJobTypeModal] = useState(false); // Dual modal for field and job type
  const [showSectorModal, setShowSectorModal] = useState(false); // Modal chọn lĩnh vực kinh doanh
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingJobTypes, setLoadingJobTypes] = useState(false);
  const [availableFields, setAvailableFields] = useState([]);
  const [availableJobTypes, setAvailableJobTypes] = useState([]); // All job types with parentId
  const [categoryTree, setCategoryTree] = useState([]); // Full category tree for nested display
  const [selectedFields, setSelectedFields] = useState([]); // Selected fields for dual modal
  const [resultCount, setResultCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [locations, setLocations] = useState([]); // Địa điểm làm việc
  const [loading, setLoading] = useState(false);
  
  // New modal states
  const [showSearchHistoryModal, setShowSearchHistoryModal] = useState(false);
  const [showSavedCriteriaModal, setShowSavedCriteriaModal] = useState(false);
  const [showSavedListModal, setShowSavedListModal] = useState(false);
  const [showSaveCriteriaNameModal, setShowSaveCriteriaNameModal] = useState(false);
  const [saveCriteriaNameInput, setSaveCriteriaNameInput] = useState('');
  const [savedCriteriaRefreshTrigger, setSavedCriteriaRefreshTrigger] = useState(0);
  const [savedListsTotalJobs, setSavedListsTotalJobs] = useState(0); // tổng số job trong tất cả list (để hiển thị header)
  
  // Hover states
  const [hoveredNavButtonIndex, setHoveredNavButtonIndex] = useState(null);
  const [hoveredLocationButton, setHoveredLocationButton] = useState(false);
  const [hoveredFieldButton, setHoveredFieldButton] = useState(false);
  const [hoveredJobTypeButton, setHoveredJobTypeButton] = useState(false);
  const [hoveredSectorButton, setHoveredSectorButton] = useState(false);
  const [hoveredHighlightButton, setHoveredHighlightButton] = useState(false);
  const [hoveredCheckboxIndex, setHoveredCheckboxIndex] = useState(null);
  const [hoveredClearButton, setHoveredClearButton] = useState(false);
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredSaveSearchButton, setHoveredSaveSearchButton] = useState(false);
  const [hoveredModalCloseButton, setHoveredModalCloseButton] = useState(null);
  const [hoveredModalConfirmButton, setHoveredModalConfirmButton] = useState(null);
  const [hoveredModalItemIndex, setHoveredModalItemIndex] = useState(null);
  const [hoveredSlideModalCloseButton, setHoveredSlideModalCloseButton] = useState(false);
  const [hoveredSearchHistoryButtonIndex, setHoveredSearchHistoryButtonIndex] = useState(null);
  const [hoveredSavedCriteriaButtonIndex, setHoveredSavedCriteriaButtonIndex] = useState(null);
  const [hoveredSavedListButtonIndex, setHoveredSavedListButtonIndex] = useState(null);

  // Load data on mount (reload categories when useAdminAPI thay đổi)
  useEffect(() => {
    loadCategoryTree();
    loadLocations();
  }, [useAdminAPI]);

  // Load category tree (full hierarchy)
  const loadCategoryTree = async () => {
    try {
      setLoadingFields(true);
      setLoadingJobTypes(true);
      
      const processTree = (tree) => {
        if (!tree || !Array.isArray(tree)) return;
        setCategoryTree(tree);
        const flattenTree = (categories, level = 0) => {
          let result = [];
          categories.forEach(cat => {
            result.push({
              ...cat,
              id: String(cat.id),
              level: level,
              parentId: cat.parentId ? String(cat.parentId) : null
            });
            if (cat.children && cat.children.length > 0) {
              result = result.concat(flattenTree(cat.children, level + 1));
            }
          });
          return result;
        };
        const allCategories = flattenTree(tree);
        const fields = allCategories.filter(cat => !cat.parentId);
        const jobTypes = allCategories.filter(cat => cat.parentId);
        setAvailableFields(fields.map(cat => ({
          id: cat.id,
          name: cat.name,
          nameEn: cat.nameEn,
          nameJp: cat.nameJp,
          level: cat.level
        })));
        setAvailableJobTypes(jobTypes.map(cat => ({
          id: cat.id,
          name: cat.name,
          nameEn: cat.nameEn,
          nameJp: cat.nameJp,
          parentId: cat.parentId,
          level: cat.level
        })));
      };

      // Dùng API tương ứng: Admin khi useAdminAPI, CTV khi dùng trang Agent
      try {
        const treeResponse = useAdminAPI
          ? await apiService.getJobCategoryTree({ status: 1 })
          : await apiService.getCTVJobCategoryTree();
        if (treeResponse?.success && treeResponse?.data?.tree) {
          processTree(treeResponse.data.tree);
          return;
        }
      } catch (treeError) {
        console.log('Tree API not available, falling back to flat list:', treeError?.message);
      }
      
      // Fallback: Load flat list với limit cao, rồi build lại cây phân cấp
      try {
        const fetchCategories = useAdminAPI
          ? () => apiService.getJobCategories({ status: 1, limit: 500 })
          : () => apiService.getCTVJobCategories({ status: 1, limit: 500 });
        const response = await fetchCategories();
        if (response?.success && response?.data?.categories?.length > 0) {
          const allCategories = response.data.categories.map(cat => ({
            id: String(cat.id),
            name: cat.name,
            nameEn: cat.nameEn,
            nameJp: cat.nameJp,
            parentId: cat.parentId ? String(cat.parentId) : null,
            order: cat.order ?? 0
          }));
          const fields = allCategories.filter(cat => !cat.parentId);
          const jobTypes = allCategories.filter(cat => cat.parentId);
          setAvailableFields(fields);
          setAvailableJobTypes(jobTypes);
          // Build tree từ flat list để panel bên phải hiển thị được Ngành nghề
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
          setCategoryTree(buildTree(allCategories));
        }
      } catch (categoryError) {
        console.log('Cannot load job categories:', categoryError?.message);
        setAvailableFields([]);
        setAvailableJobTypes([]);
        setCategoryTree([]);
      }
    } catch (error) {
      console.error('Error loading category tree:', error);
      setAvailableFields([]);
      setAvailableJobTypes([]);
      setCategoryTree([]);
    } finally {
      setLoadingFields(false);
      setLoadingJobTypes(false);
    }
  };

  // Helper: Lấy ID của category + tất cả con cháu (dùng khi chọn danh mục cha)
  const getCategoryAndDescendantIds = (category) => {
    const ids = [String(category.id)];
    if (category.children && category.children.length > 0) {
      category.children.forEach((child) => {
        ids.push(...getCategoryAndDescendantIds(child));
      });
    }
    return ids;
  };

  // Lấy tất cả ID Chi tiết (job type) dưới một Loại công việc (field) trong tree
  const getAllDetailIdsUnderField = (fieldInTree) => {
    if (!fieldInTree?.children?.length) return [];
    return fieldInTree.children.flatMap((child) => getCategoryAndDescendantIds(child));
  };

  // Chọn tất cả Chi tiết thuộc một Loại công việc
  const selectAllDetailsForField = (ids) => {
    if (!ids.length) return;
    setFilters((prev) => {
      const next = new Set(prev.jobTypeIds.map(String));
      ids.forEach((id) => next.add(String(id)));
      return { ...prev, jobTypeIds: Array.from(next) };
    });
  };

  // Bỏ chọn tất cả Chi tiết thuộc một Loại công việc
  const deselectAllDetailsForField = (ids) => {
    if (!ids.length) return;
    const toRemove = new Set(ids.map(String));
    setFilters((prev) => ({
      ...prev,
      jobTypeIds: prev.jobTypeIds.filter((id) => !toRemove.has(String(id))),
    }));
  };

  // Toggle chọn/bỏ chọn tất cả Chi tiết theo checkbox
  const toggleSelectAllDetailsForField = (ids) => {
    if (!ids.length) return;
    const currentSet = new Set(filters.jobTypeIds.map(String));
    const allSelected = ids.every((id) => currentSet.has(String(id)));
    if (allSelected) deselectAllDetailsForField(ids);
    else selectAllDetailsForField(ids);
  };

  // Helper: Find all descendants of a category (including nested children)
  const findAllDescendants = (categoryId, tree = categoryTree) => {
    const result = [];
    
    const findInTree = (categories, targetId) => {
      for (const cat of categories) {
        if (cat.id === String(targetId) || cat.id === targetId) {
          // Found the category, add all its descendants
          const addDescendants = (children) => {
            children.forEach(child => {
              result.push(String(child.id));
              if (child.children && child.children.length > 0) {
                addDescendants(child.children);
              }
            });
          };
          if (cat.children && cat.children.length > 0) {
            addDescendants(cat.children);
          }
          return true;
        }
        if (cat.children && cat.children.length > 0) {
          if (findInTree(cat.children, targetId)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findInTree(tree, categoryId);
    return result;
  };

  // Sync selectedFields with filters.fieldIds when modal opens
  useEffect(() => {
    if (showFieldJobTypeModal) {
      setSelectedFields(filters.fieldIds);
    }
  }, [showFieldJobTypeModal]);

  // Get job types for selected fields (including nested descendants)
  const getJobTypesForSelectedFields = () => {
    const allDescendantIds = new Set();
    
    selectedFields.forEach(fieldId => {
      // Get direct children
      const directChildren = availableJobTypes.filter(jt => jt.parentId === fieldId);
      directChildren.forEach(jt => allDescendantIds.add(jt.id));
      
      // Get nested descendants from tree
      const nestedDescendants = findAllDescendants(fieldId);
      nestedDescendants.forEach(id => allDescendantIds.add(id));
    });
    
    return availableJobTypes.filter(jt => allDescendantIds.has(jt.id));
  };

  // Load locations from jobs (working locations)
  const loadLocations = async () => {
    try {
      // Load jobs to extract unique locations
      const response = useAdminAPI 
        ? await apiService.getAdminJobs({ page: 1, limit: 1000 })
        : await apiService.getCTVJobs({ page: 1, limit: 1000 });
      if (response.success && response.data?.jobs) {
        // Lưu tổng số job để dùng làm mặc định khi chưa có điều kiện tìm kiếm
        const total =
          (response.data.pagination && response.data.pagination.total) ||
          response.data.total ||
          response.data.jobs.length ||
          0;
        setResultCount(total);

        // Trích xuất danh sách location như logic ban đầu
        const locationSet = new Set();
        response.data.jobs.forEach(job => {
          if (job.workingLocations && job.workingLocations.length > 0) {
            job.workingLocations.forEach(wl => {
              if (wl.location) {
                locationSet.add(wl.location);
              }
            });
          }
        });
        if (locationSet.size > 0) {
          setLocations(Array.from(locationSet).sort());
        } else {
          // Fallback nếu API không trả workingLocations
          setLocations(mockLocations);
        }
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      // Fallback: dùng mockLocations cho UI, giữ nguyên resultCount (0)
      setLocations(mockLocations);
    }
  };

  // Animate displayCount from 0 -> resultCount mỗi khi resultCount thay đổi
  useEffect(() => {
    let frameId;
    const duration = 600; // ms
    const start = performance.now();
    const from = 0;
    const to = resultCount;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(from + (to - from) * eased);
      setDisplayCount(current);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [resultCount]);


  const handleSearch = async () => {
    try {
      setLoading(true);
      const trimmedKeyword = (filters.keyword ?? '').trim();

      // Build query params
      const params = {
        page: 1,
        limit: 10,
      };

      // Keyword search
      if (trimmedKeyword) {
        params.search = trimmedKeyword;
      }

      // Category filter - ưu tiên jobTypeIds (Ngành nghề), sau đó fieldIds (Loại công việc)
      // Filter theo job_category_id trong bảng jobs
      if (filters.jobTypeIds.length > 0) {
        // Nếu có nhiều job types, lấy đầu tiên (API chỉ hỗ trợ 1 jobCategoryId)
        params.jobCategoryId = parseInt(filters.jobTypeIds[0]);
      } else if (filters.fieldIds.length > 0) {
        // Nếu không có ngành nghề, dùng loại công việc
        params.jobCategoryId = parseInt(filters.fieldIds[0]);
      }

      // Lĩnh vực kinh doanh filter
      if (filters.sectorNames?.length > 0) {
        params.sectorNames = filters.sectorNames.join(',');
      }

      // Location filter - có thể gửi nhiều location hoặc chỉ lấy đầu tiên
      // API hiện tại chỉ hỗ trợ 1 location, nên lấy đầu tiên
      if (filters.locations.length > 0) {
        // locations is now array of { country, location }
        const firstLocation = filters.locations[0];
        params.location = typeof firstLocation === 'string' 
          ? firstLocation 
          : firstLocation.location;
      }

      // Salary filters - range lương
      if (filters.salaryMin) {
        params.minSalary = parseFloat(filters.salaryMin);
      }

      if (filters.salaryMax) {
        params.maxSalary = parseFloat(filters.salaryMax);
      }

      // Hot jobs filter (nếu có highlight "Hot" hoặc checkbox nào đó)
      // Có thể thêm logic để set isHot dựa trên filters.booleans hoặc highlights

      // Sort options (có thể thêm UI để chọn sort)
      params.sortBy = 'created_at';
      params.sortOrder = 'DESC';

      if (useAdminAPI) {
        if (adminCompanyId) params.companyId = adminCompanyId;
        if (adminHasCampaign) params.hasCampaign = '1';
        if (adminCreatedFrom) params.createdFrom = adminCreatedFrom;
        if (adminCreatedTo) params.createdTo = adminCreatedTo;
        if (adminJapaneseLevel) params.japaneseLevel = adminJapaneseLevel;
        if (adminRecruitmentLocation) params.recruitmentLocation = adminRecruitmentLocation;
        if (adminWorkLocation) params.workLocation = adminWorkLocation;
      }

      const response = useAdminAPI 
        ? await apiService.getAdminJobs(params)
        : await apiService.getCTVJobs(params);
      if (response.success && response.data) {
        const total = response.data.pagination?.total || 0;
        setResultCount(total);
        if (onSearch) onSearch(response.data.jobs || []);
        if (onFiltersChange) onFiltersChange({ ...filters, keyword: trimmedKeyword });
        if (!useAdminAPI && (trimmedKeyword || (filters && Object.keys(filters).length > 0))) {
          apiService.saveCTVSearchHistory({
            keyword: trimmedKeyword,
            filters: { ...filters, keyword: trimmedKeyword },
            resultCount: total
          }).catch(() => {});
        }
      } else {
        // Nếu không có kết quả, vẫn truyền empty array
        setResultCount(0);
        if (onSearch) {
          onSearch([]);
        }
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
      setResultCount(0);
      // Truyền empty array khi có lỗi
      if (onSearch) {
        onSearch([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Build params và gọi API tìm kiếm (dùng filters + keyword truyền vào)
  const runSearchWithFilters = async (filterState, keywordStr) => {
    const trimmedKeyword = (keywordStr ?? '').trim();
    const params = { page: 1, limit: 10, sortBy: 'created_at', sortOrder: 'DESC' };
    if (trimmedKeyword) params.search = trimmedKeyword;
    if (filterState.jobTypeIds?.length > 0) params.jobCategoryId = parseInt(filterState.jobTypeIds[0]);
    else if (filterState.fieldIds?.length > 0) params.jobCategoryId = parseInt(filterState.fieldIds[0]);
    if (filterState.sectorNames?.length > 0) params.sectorNames = filterState.sectorNames.join(',');
    if (filterState.locations?.length > 0) {
      const first = filterState.locations[0];
      params.location = typeof first === 'string' ? first : first?.location;
    }
    if (filterState.salaryMin) params.minSalary = parseFloat(filterState.salaryMin);
    if (filterState.salaryMax) params.maxSalary = parseFloat(filterState.salaryMax);
    if (useAdminAPI) {
      if (adminCompanyId) params.companyId = adminCompanyId;
      if (adminHasCampaign) params.hasCampaign = '1';
      if (adminCreatedFrom) params.createdFrom = adminCreatedFrom;
      if (adminCreatedTo) params.createdTo = adminCreatedTo;
      if (adminJapaneseLevel) params.japaneseLevel = adminJapaneseLevel;
      if (adminRecruitmentLocation) params.recruitmentLocation = adminRecruitmentLocation;
      if (adminWorkLocation) params.workLocation = adminWorkLocation;
    }
    const response = useAdminAPI
      ? await apiService.getAdminJobs(params)
      : await apiService.getCTVJobs(params);
    if (response.success && response.data) {
      setResultCount(response.data.pagination?.total ?? 0);
      if (onSearch) onSearch(response.data.jobs || []);
      if (onFiltersChange) onFiltersChange({ ...filterState, keyword: keywordStr });
    } else {
      setResultCount(0);
      if (onSearch) onSearch([]);
    }
  };

  // Áp dụng tiêu chí từ lịch sử tìm kiếm hoặc tiêu chí đã lưu, rồi gọi tìm kiếm
  const applyFiltersAndSearch = async (payload) => {
    const nextFilters = payload.filters && typeof payload.filters === 'object'
      ? {
          keyword: payload.filters.keyword ?? payload.keyword ?? '',
          locations: Array.isArray(payload.filters.locations) ? payload.filters.locations : [],
          fieldIds: Array.isArray(payload.filters.fieldIds) ? payload.filters.fieldIds : [],
          jobTypeIds: Array.isArray(payload.filters.jobTypeIds) ? payload.filters.jobTypeIds : [],
          sectorNames: Array.isArray(payload.filters.sectorNames) ? payload.filters.sectorNames : [],
          age: payload.filters.age ?? null,
          salaryMin: payload.filters.salaryMin ?? '',
          salaryMax: payload.filters.salaryMax ?? '',
          employmentType: payload.filters.employmentType ?? null,
          highlights: Array.isArray(payload.filters.highlights) ? payload.filters.highlights : [],
          booleans: {
            noExperienceOk: !!(payload.filters.booleans && payload.filters.booleans.noExperienceOk),
            underOneYearOk: !!(payload.filters.booleans && payload.filters.booleans.underOneYearOk),
            graduatingSoonOk: !!(payload.filters.booleans && payload.filters.booleans.graduatingSoonOk),
            remoteOk: !!(payload.filters.booleans && payload.filters.booleans.remoteOk),
          },
        }
      : filters;
    const keyword = payload.keyword ?? payload.filters?.keyword ?? '';
    setFilters(nextFilters);
    setShowSearchHistoryModal(false);
    setShowSavedCriteriaModal(false);
    try {
      setLoading(true);
      await runSearchWithFilters(nextFilters, keyword);
    } catch (e) {
      console.error(e);
      setResultCount(0);
      if (onSearch) onSearch([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setFilters({
      keyword: '',
      locations: [],
      fieldIds: [],
      jobTypeIds: [],
      sectorNames: [],
      age: null,
      salaryMin: '',
      salaryMax: '',
      employmentType: null,
      highlights: [],
      booleans: {
        noExperienceOk: false,
        underOneYearOk: false,
        graduatingSoonOk: false,
        remoteOk: false,
      },
    });
  };

  const toggleCountry = (country) => {
    setSelectedCountries(prev => {
      if (prev.includes(country)) {
        // Remove country and all its locations
        const newCountries = prev.filter(c => c !== country);
        setFilters(prevFilters => ({
          ...prevFilters,
          locations: prevFilters.locations.filter(loc => loc.country !== country)
        }));
        return newCountries;
      } else {
        // Add country
        return [...prev, country];
      }
    });
  };

  const toggleLocation = (location, country) => {
    setFilters(prev => {
      const existingIndex = prev.locations.findIndex(
        loc => loc.country === country && loc.location === location
      );
      
      if (existingIndex >= 0) {
        // Remove location
        return {
      ...prev,
          locations: prev.locations.filter((_, index) => index !== existingIndex)
        };
      } else {
        // Add location
        return {
          ...prev,
          locations: [...prev.locations, { country, location }]
        };
      }
    });
  };

  const getAvailableProvinces = () => {
    const allProvinces = [];
    selectedCountries.forEach((country) => {
      if (country === 'Vietnam') {
        VIETNAM_PROVINCES.forEach((province) => {
          allProvinces.push({ country, location: province });
        });
      }
    });
    return allProvinces;
  };

  const toggleJapanLocationEntry = ({ location, locationJp, jpId }) => {
    setFilters((prev) => {
      const idx = prev.locations.findIndex(
        (l) =>
          l.country === 'Japan' &&
          (jpId ? l.jpId === jpId : l.location === location)
      );
      if (idx >= 0) {
        return { ...prev, locations: prev.locations.filter((_, i) => i !== idx) };
      }
      return {
        ...prev,
        locations: [...prev.locations, { country: 'Japan', location, locationJp, jpId }],
      };
    });
  };

  const applyJapanLocationBulk = (add, locObjs) => {
    setFilters((prev) => {
      const ids = new Set(locObjs.map((l) => l.id));
      let next = [...prev.locations];
      if (add) {
        const have = new Set(next.filter((l) => l.country === 'Japan').map((l) => l.jpId));
        locObjs.forEach((loc) => {
          if (!have.has(loc.id)) {
            next.push({ country: 'Japan', location: loc.alpha, locationJp: loc.ja, jpId: loc.id });
            have.add(loc.id);
          }
        });
      } else {
        next = next.filter((l) => l.country !== 'Japan' || !ids.has(l.jpId));
      }
      return { ...prev, locations: next };
    });
  };

  const getSelectedLocationsDisplay = () => {
    if (filters.locations.length === 0) return '';
    
    // Group by country
    const byCountry = {};
    filters.locations.forEach(loc => {
      if (!byCountry[loc.country]) {
        byCountry[loc.country] = [];
      }
      const disp =
        loc.country === 'Japan' && language === 'ja' && loc.locationJp
          ? loc.locationJp
          : loc.location;
      byCountry[loc.country].push(disp);
    });
    
    // Format: "Vietnam: Hà Nội, Hồ Chí Minh; Japan: Tokyo, Osaka"
    return Object.entries(byCountry)
      .map(([country, locations]) => `${country}: ${locations.join(', ')}`)
      .join('; ');
  };

  const toggleField = (fieldId) => {
    setSelectedFields(prev => {
      const newFields = prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId];
      
      // Update filters.fieldIds
      setFilters(prevFilters => {
        // Remove job types that belong to removed fields
        const newJobTypeIds = prevFilters.jobTypeIds.filter(jtId => {
          const jobType = availableJobTypes.find(jt => jt.id === jtId);
          return jobType && newFields.includes(jobType.parentId);
        });
        
        return {
          ...prevFilters,
          fieldIds: newFields,
          jobTypeIds: newJobTypeIds
        };
      });
      
      return newFields;
    });
  };

  const toggleJobType = (jobTypeId) => {
    setFilters(prev => {
      const existingIndex = prev.jobTypeIds.findIndex(id => id === jobTypeId);
      
      if (existingIndex >= 0) {
        // Remove job type
        return {
      ...prev,
          jobTypeIds: prev.jobTypeIds.filter((_, index) => index !== existingIndex)
        };
      } else {
        // Add job type
        return {
          ...prev,
          jobTypeIds: [...prev.jobTypeIds, jobTypeId]
        };
      }
    });
  };

  // Khi chọn 1 danh mục con có children → chọn/bỏ chọn tất cả con cháu của nó
  const toggleJobTypeWithDescendants = (category) => {
    const idsToToggle = getCategoryAndDescendantIds(category);
    const anySelected = idsToToggle.some(id => filters.jobTypeIds.includes(id));

    setFilters(prev => {
      if (anySelected) {
        const toRemove = new Set(idsToToggle);
        return {
          ...prev,
          jobTypeIds: prev.jobTypeIds.filter(id => !toRemove.has(id))
        };
      } else {
        const toAdd = new Set(idsToToggle);
        const existing = new Set(prev.jobTypeIds);
        toAdd.forEach(id => existing.add(id));
        return {
          ...prev,
          jobTypeIds: Array.from(existing)
        };
      }
    });
  };


  const toggleHighlight = (highlight) => {
    setFilters(prev => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter(h => h !== highlight)
        : [...prev.highlights, highlight],
    }));
  };

  /** Tên danh mục theo ngôn ngữ (name / nameEn / nameJp) */
  const getCategoryDisplayName = (cat) => {
    if (!cat) return '';
    if (language === 'vi') return cat.name || '';
    if (language === 'en') return cat.nameEn || cat.name || '';
    return cat.nameJp || cat.nameEn || cat.name || '';
  };

  const getSelectedFieldNames = () => {
    return filters.fieldIds
      .map(id => getCategoryDisplayName(availableFields.find(f => f.id === id)))
      .filter(Boolean)
      .join(', ');
  };

  const getSelectedJobTypeNames = () => {
    return filters.jobTypeIds
      .map(id => getCategoryDisplayName(availableJobTypes.find(jt => jt.id === id)))
      .filter(Boolean)
      .join(', ');
  };

  /** Tất cả lựa chọn Loại công việc + Ngành nghề (để hiển thị trong 1 ô) */
  const getSelectedCategoryDisplay = () => {
    const fieldNames = getSelectedFieldNames();
    const jobTypeNames = getSelectedJobTypeNames();
    return [fieldNames, jobTypeNames].filter(Boolean).join(', ');
  };

  const getSelectedSectorNames = () => {
    return (filters.sectorNames || []).join(', ');
  };

  const getSelectedHighlightsNames = () => {
    return filters.highlights.join(', ');
  };

  // Modal Component
  const MultiSelectModal = ({ 
    isOpen, 
    onClose, 
    title, 
    options, 
    selected, 
    onToggle,
    loading = false,
    isSingleSelect = false
  }) => {
    if (!isOpen) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
        onClick={onClose}
      >
        <div className="rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
            <h3 className="text-base font-semibold" style={{ color: '#111827' }}>{title}</h3>
            <button 
              onClick={onClose} 
              onMouseEnter={() => setHoveredModalCloseButton('multiselect')}
              onMouseLeave={() => setHoveredModalCloseButton(null)}
              className="p-1 rounded transition-colors"
              style={{
                backgroundColor: hoveredModalCloseButton === 'multiselect' ? '#f3f4f6' : 'transparent'
              }}
            >
              <X className="w-5 h-5" style={{ color: '#4b5563' }} />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : options.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'vi' ? 'Không có dữ liệu' : language === 'en' ? 'No data' : 'データなし'}
              </div>
            ) : (
              <div className="space-y-2">
                {options.map((option) => {
                  const id = typeof option === 'string' ? option : option.id;
                  const name = typeof option === 'string' ? option : option.name;
                  const isSelected = selected.includes(id);
                  
                  if (isSingleSelect) {
                    // Single select: click to select and close
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          onToggle(id);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer text-left transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-600' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs text-gray-900">{name}</span>
                      </button>
                    );
                  }
                  
                  // Multi select: checkbox
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-900">{name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {!isSingleSelect && (
          <div className="p-4 border-t" style={{ borderColor: '#e5e7eb' }}>
            <button
              onClick={onClose}
              onMouseEnter={() => setHoveredModalConfirmButton('multiselect')}
              onMouseLeave={() => setHoveredModalConfirmButton(null)}
              className="w-full py-2 px-4 rounded-lg transition-colors font-medium"
              style={{
                backgroundColor: hoveredModalConfirmButton === 'multiselect' ? '#2563eb' : '#2563eb',
                color: 'white'
              }}
            >
              {language === 'vi' ? 'Xác nhận' : language === 'en' ? 'Confirm' : '確認'}
            </button>
          </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>
      <div className={`${compact ? "w-full h-full lg:h-full flex flex-col" : "w-full sm:w-[400px] md:w-[500px] h-full flex flex-col"}`}>
        {/* Header Navigation */}
        <div className="flex-shrink-0 mb-1 sm:mb-2">
          <HeaderNavigationButtons
            onSearchHistoryClick={() => setShowSearchHistoryModal(true)}
            onSavedCriteriaClick={() => setShowSavedCriteriaModal(true)}
            onSavedListClick={() => setShowSavedListModal(true)}
            compact={compact}
            hoveredNavButtonIndex={hoveredNavButtonIndex}
            setHoveredNavButtonIndex={setHoveredNavButtonIndex}
            savedListsTotalJobs={savedListsTotalJobs}
          />
        </div>

      <div className={`flex-1 flex flex-col bg-white ${compact ? 'rounded-lg' : 'rounded-2xl'} border border-gray-200 overflow-hidden min-h-0`}>
        {/* Scrollable Form Content */}
        <div className={`flex-1 overflow-y-auto ${compact ? 'p-1.5' : 'p-2'} ${compact ? 'space-y-1.5' : 'space-y-2'} custom-scrollbar min-h-0`}>
          {/* A. Freeword / Keyword - controlled để tránh bị xóa khi re-render */}
        <FilterBlock icon={Search} label={language === 'vi' ? 'Từ khóa' : language === 'en' ? 'Keyword' : 'フリーワード'} compact={compact}>
          <div className="relative">
            <input
              type="text"
              ref={keywordInputRef}
              value={filters.keyword ?? ''}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              placeholder={language === 'vi' ? 'ID, tên job, nội dung công việc…' : language === 'en' ? 'ID, job name, job description…' : 'ID、求人名、業務内容…'}
              className="w-full px-2 py-1 text-[9px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </FilterBlock>

        {/* B. Địa điểm làm việc */}
        <FilterBlock icon={MapPin} label={language === 'vi' ? 'Địa điểm làm việc' : language === 'en' ? 'Work Location' : '勤務地'} compact={compact}>
          <div className="flex gap-1 items-center">
            <input
              type="text"
              readOnly
              value={getSelectedLocationsDisplay()}
              placeholder={language === 'vi' ? 'Chọn địa điểm làm việc' : language === 'en' ? 'Select work location' : '勤務地を選択'}
              className="flex-1 px-2 py-1 text-[9px] border border-gray-300 rounded bg-gray-50 cursor-pointer"
              onClick={() => setShowLocationModal(true)}
            />
            <button
              onClick={() => setShowLocationModal(true)}
              onMouseEnter={() => setHoveredLocationButton(true)}
              onMouseLeave={() => setHoveredLocationButton(false)}
              className="px-1.5 py-1 border rounded transition-colors flex-shrink-0"
              style={{
                borderColor: '#d1d5db',
                backgroundColor: hoveredLocationButton ? '#f9fafb' : 'transparent'
              }}
            >
              <Plus className="w-3 h-3" style={{ color: '#4b5563' }} />
            </button>
          </div>
        </FilterBlock>

        {/* Loại công việc (gộp cả loại + ngành nghề, tất cả tìm kiếm ở đây) */}
        <FilterBlock 
          icon={Briefcase} 
          label={t.agentJobsJobType}
          compact={compact}
        >
          <div className="flex gap-1 items-center">
            <input
              type="text"
              readOnly
              value={getSelectedCategoryDisplay() || ''}
              placeholder={t.agentJobsSelectJobTypePlaceholder}
              className="flex-1 px-2 py-1 text-[9px] border border-gray-300 rounded bg-gray-50 cursor-pointer"
              onClick={() => setShowFieldJobTypeModal(true)}
            />
            <button
              onClick={() => setShowFieldJobTypeModal(true)}
              className="px-1.5 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </FilterBlock>

        {/* D2. Lĩnh vực */}
        <FilterBlock 
          icon={Building2} 
          label={language === 'vi' ? 'Lĩnh vực' : language === 'en' ? 'Business Sector' : '業種'}
          compact={compact}
        >
          <div className="flex gap-1 items-center">
            <input
              type="text"
              readOnly
              value={getSelectedSectorNames() || ''}
              placeholder={language === 'vi' ? 'Chọn lĩnh vực kinh doanh' : language === 'en' ? 'Select business sector' : '業種を選択'}
              className="flex-1 px-2 py-1 text-[9px] border border-gray-300 rounded bg-gray-50 cursor-pointer"
              onClick={() => setShowSectorModal(true)}
            />
            <button
              onClick={() => setShowSectorModal(true)}
              className="px-1.5 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </FilterBlock>

        {/* E. Tuổi */}
        <FilterBlock icon={Calendar} label={language === 'vi' ? 'Tuổi' : language === 'en' ? 'Age' : '年齢'} compact={compact}>
          <div className="flex items-center gap-1 flex-wrap">
            <select
              value={filters.age || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value || null }))}
              className="flex-1 min-w-0 px-2 py-1 text-[9px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{language === 'vi' ? 'Chọn tuổi' : language === 'en' ? 'Select age' : '選択'}</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="30">30</option>
              <option value="35">35</option>
              <option value="40">40</option>
            </select>
            <span className="text-[9px] text-gray-500 whitespace-nowrap flex-shrink-0">
              {language === 'vi' ? 'tuổi có thể ứng tuyển' : language === 'en' ? 'years old' : '歳で応募可能'}
            </span>
          </div>
        </FilterBlock>

        {/* F. Range lương */}
        <FilterBlock icon={DollarSign} label={language === 'vi' ? 'Range lương' : language === 'en' ? 'Salary Range' : '給与範囲'} compact={compact}>
          <div className="flex items-center gap-1 min-w-0 flex-wrap">
            <input
              type="number"
              value={filters.salaryMin}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value ? Number(e.target.value) : '' }))}
              placeholder={language === 'vi' ? 'Từ' : language === 'en' ? 'From' : 'から'}
              className="flex-1 min-w-[60px] px-2 py-1 text-[9px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500 flex-shrink-0 text-[9px]">~</span>
            <input
              type="number"
              value={filters.salaryMax}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value ? Number(e.target.value) : '' }))}
              placeholder={language === 'vi' ? 'Đến' : language === 'en' ? 'To' : 'まで'}
              className="flex-1 min-w-[60px] px-2 py-1 text-[9px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-[9px] text-gray-500 whitespace-nowrap flex-shrink-0">
              {language === 'vi' ? 'triệu' : language === 'en' ? 'million' : '万円'}
            </span>
          </div>
        </FilterBlock>

        {/* G. Hình thức tuyển dụng */}
        <FilterBlock icon={FileText} label={language === 'vi' ? 'Hình thức tuyển dụng' : language === 'en' ? 'Employment Type' : '雇用形態'} compact={compact}>
          <select
            value={filters.employmentType || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value || null }))}
            className="w-full px-2 py-1 text-[9px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{language === 'vi' ? 'Chọn hình thức' : language === 'en' ? 'Select type' : '選択'}</option>
            {mockEmploymentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </FilterBlock>

        {/* I. Điểm nổi bật */}
        <FilterBlock icon={Star} label={language === 'vi' ? 'Điểm nổi bật của job' : language === 'en' ? 'Job Highlights' : '求人の特徴'} compact={compact}>
          <div className="flex gap-1 items-center">
            <input
              type="text"
              readOnly
              value={getSelectedHighlightsNames() || ''}
              placeholder={language === 'vi' ? 'Chọn điểm nổi bật' : language === 'en' ? 'Select highlights' : '特徴を選択'}
              className="flex-1 px-2 py-1 text-[9px] border border-gray-300 rounded bg-gray-50 cursor-pointer"
              onClick={() => setShowHighlightModal(true)}
            />
            <button
              onClick={() => setShowHighlightModal(true)}
              className="px-1.5 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </FilterBlock>

        {/* J. Nhóm checkbox Yes/No */}
        <FilterBlock icon={CheckSquare} label={language === 'vi' ? 'Điều kiện' : language === 'en' ? 'Conditions' : '条件'} compact={compact}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <label className="flex items-start gap-1 p-1 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.booleans.noExperienceOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, noExperienceOk: e.target.checked }
                }))}
                className="mt-0.5 w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-[9px] text-gray-700 leading-tight">
                {language === 'vi' ? 'Chưa có kinh nghiệm OK' : language === 'en' ? 'No experience OK' : '未経験OK'}
              </span>
            </label>
            <label className="flex items-start gap-1 p-1 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.booleans.underOneYearOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, underOneYearOk: e.target.checked }
                }))}
                className="mt-0.5 w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-[9px] text-gray-700 leading-tight">
                {language === 'vi' ? 'Kinh nghiệm dưới 1 năm OK' : language === 'en' ? 'Under 1 year exp OK' : '経験1年未満OK'}
              </span>
            </label>
            <label className="flex items-start gap-1 p-1 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.booleans.graduatingSoonOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, graduatingSoonOk: e.target.checked }
                }))}
                className="mt-0.5 w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-[9px] text-gray-700 leading-tight">
                {language === 'vi' ? 'Ứng viên sắp tốt nghiệp OK' : language === 'en' ? 'Graduating soon OK' : '卒業予定者OK'}
              </span>
            </label>
            <label className="flex items-start gap-1 p-1 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.booleans.remoteOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, remoteOk: e.target.checked }
                }))}
                className="mt-0.5 w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-[9px] text-gray-700 leading-tight">
                {language === 'vi' ? 'Remote / Full remote Ok' : language === 'en' ? 'Remote / Full remote OK' : 'リモート・在宅OK'}
              </span>
            </label>
          </div>
        </FilterBlock>
        </div>

        {/* Fixed Buttons Row */}
        <div className={`flex-shrink-0 border-t border-gray-200 bg-white ${compact ? 'p-1.5' : 'p-2'} ${compact ? 'rounded-b-lg' : 'rounded-b-2xl'}`}>
          <div className="space-y-1">
            <div className={`flex ${compact ? 'gap-1' : 'gap-1'} flex-col sm:flex-row`}>
              <button
                onClick={handleClearAll}
                onMouseEnter={() => setHoveredClearButton(true)}
                onMouseLeave={() => setHoveredClearButton(false)}
                className={`flex-1 ${compact ? 'py-1 px-2 text-[9px]' : 'py-1.5 px-2 text-[9px]'} font-medium rounded transition-colors`}
                style={{
                  color: '#374151',
                  backgroundColor: hoveredClearButton ? '#e5e7eb' : '#f3f4f6'
                }}
              >
                {language === 'vi' ? 'Xóa điều kiện' : language === 'en' ? 'Clear filters' : '条件をクリア'}
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                onMouseEnter={() => setHoveredSearchButton(true)}
                onMouseLeave={() => setHoveredSearchButton(false)}
                className={`flex-1 ${compact ? 'h-7' : 'h-8'} rounded flex items-center justify-center gap-1 transition-colors shadow-md`}
                style={{
                  backgroundColor: hoveredSearchButton ? '#eab308' : '#facc15',
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {loading ? (
                  <RotateCw className="w-3 h-3 animate-spin" style={{ color: '#1f2937' }} />
                ) : (
                  <Search className="w-3 h-3" style={{ color: '#1f2937' }} />
                )}
                <span className="text-[9px] font-semibold" style={{ color: '#1f2937' }}>
                  {language === 'vi'
                    ? `Tìm ${displayCount.toLocaleString('vi-VN')} job`
                    : language === 'en'
                    ? `Search ${displayCount.toLocaleString()} jobs`
                    : `${displayCount.toLocaleString('ja-JP')} 件の求人を検索`}
                </span>
              </button>
            </div>
            <p className="text-center text-[9px] text-gray-600">
              {language === 'vi' 
                ? `Đang hiển thị ${displayCount.toLocaleString('vi-VN')} việc phù hợp với điều kiện lọc`
                : language === 'en'
                ? `Showing ${displayCount.toLocaleString()} jobs matching your filters`
                : `${displayCount.toLocaleString('ja-JP')} 件の条件に合う求人を表示中`}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setSaveCriteriaNameInput('');
                  setShowSaveCriteriaNameModal(true);
                }}
                onMouseEnter={() => setHoveredSaveSearchButton(true)}
                onMouseLeave={() => setHoveredSaveSearchButton(false)}
                className="px-2 py-0.5 text-[9px] rounded border font-medium transition-colors"
                style={{
                  borderColor: '#60a5fa',
                  color: '#1d4ed8',
                  backgroundColor: hoveredSaveSearchButton ? '#eff6ff' : 'white'
                }}
              >
                {language === 'vi' ? 'Lưu điều kiện đang tìm' : language === 'en' ? 'Save current filters' : '現在の条件を保存'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Dual Modal: Country and Location Selection */}
      {showLocationModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
          onClick={() => {
            setShowLocationModal(false);
            setSelectedCountries([]);
            setJapanFilterRegion(null);
            setJapanFilterPrefecture(null);
          }}
        >
          <div 
            className="rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col lg:flex-row" 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            {/* Left Panel: Country Selection */}
            <div className="w-full lg:w-[220px] flex-shrink-0 border-b lg:border-b-0 lg:border-r flex flex-col" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                <h3 className="text-base font-semibold" style={{ color: '#111827' }}>
                  {language === 'vi' ? 'Chọn quốc gia' : language === 'en' ? 'Select Country' : '国を選択'}
                </h3>
                <button 
                  onClick={() => {
                    setShowLocationModal(false);
                    setSelectedCountries([]);
                    setJapanFilterRegion(null);
                    setJapanFilterPrefecture(null);
                  }}
                  onMouseEnter={() => setHoveredModalCloseButton('location')}
                  onMouseLeave={() => setHoveredModalCloseButton(null)}
                  className="p-1 rounded transition-colors"
                  style={{
                    backgroundColor: hoveredModalCloseButton === 'location' ? '#f3f4f6' : 'transparent'
                  }}
                >
                  <X className="w-5 h-5" style={{ color: '#4b5563' }} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {LOCATION_FILTER_COUNTRY_KEYS.map((country) => {
                    const isSelected = selectedCountries.includes(country);
                    return (
                      <label
                        key={country}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCountry(country)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-900">{countryFilterLabel(country, language)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel: Việt Nam = tỉnh phẳng; Nhật = vùng → tỉnh → phường */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {language === 'vi'
                    ? 'Chọn địa điểm làm việc'
                    : language === 'en'
                    ? 'Select work location'
                    : '勤務地を選択'}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {selectedCountries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {language === 'vi'
                      ? 'Vui lòng chọn quốc gia trước'
                      : language === 'en'
                      ? 'Please select a country first'
                      : 'まず国を選択してください'}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedCountries.includes('Vietnam') && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-2">
                          {countryFilterLabel('Vietnam', language)}
                        </h4>
                        <p className="text-[11px] text-gray-500 mb-2">
                          {language === 'vi'
                            ? 'Chọn một hoặc nhiều tỉnh/thành'
                            : language === 'en'
                            ? 'Select one or more provinces/cities'
                            : '都道府県・都市を選択'}
                        </p>
                        <div className="max-h-[36vh] overflow-y-auto border border-gray-100 rounded-lg p-2 space-y-0.5">
                          {VIETNAM_PROVINCES.map((province) => {
                            const isSelected = filters.locations.some(
                              (l) => l.country === 'Vietnam' && l.location === province
                            );
                            return (
                              <label
                                key={province}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleLocation(province, 'Vietnam')}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-900">{province}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedCountries.includes('Japan') && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-1">
                          {countryFilterLabel('Japan', language)}
                        </h4>
                        <p className="text-[11px] text-gray-500 mb-2">
                          {language === 'vi'
                            ? 'Chọn vùng → tỉnh/thành → phường/quận (có thể chọn nhiều)'
                            : language === 'en'
                            ? 'Region → prefecture → city/ward (multi-select)'
                            : '地域 → 都道府県 → 市区町村'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="border rounded-lg overflow-hidden flex flex-col max-h-[38vh]">
                            <div className="text-[10px] font-semibold px-2 py-1 bg-gray-100 text-gray-700 shrink-0">
                              {language === 'vi' ? 'Vùng' : language === 'en' ? 'Region' : '地域'}
                            </div>
                            <div className="overflow-y-auto flex-1 p-1">
                              {JAPAN_REGIONS.map((reg) => (
                                <button
                                  key={reg.id}
                                  type="button"
                                  onClick={() => {
                                    setJapanFilterRegion(reg.id);
                                    setJapanFilterPrefecture(null);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded text-xs cursor-pointer ${
                                    japanFilterRegion === reg.id
                                      ? 'bg-blue-100 text-blue-800 font-medium'
                                      : 'hover:bg-gray-50 text-gray-800'
                                  }`}
                                >
                                  {language === 'ja' ? reg.ja : reg.en}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="border rounded-lg overflow-hidden flex flex-col max-h-[38vh]">
                            <div className="text-[10px] font-semibold px-2 py-1 bg-gray-100 text-gray-700 shrink-0">
                              {language === 'vi' ? 'Tỉnh / thành' : language === 'en' ? 'Prefecture' : '都道府県'}
                            </div>
                            <div className="overflow-y-auto flex-1 p-1">
                              {!japanFilterRegion && (
                                <div className="text-xs text-gray-400 p-2">
                                  {language === 'vi'
                                    ? 'Chọn vùng trước'
                                    : language === 'en'
                                    ? 'Select a region'
                                    : '地域を選んでください'}
                                </div>
                              )}
                              {japanFilterRegion &&
                                (JAPAN_REGIONS.find((r) => r.id === japanFilterRegion)?.prefectureCodes || []).map(
                                  (code) => {
                                    const pref = JAPAN_PREFECTURES[code];
                                    if (!pref) return null;
                                    return (
                                      <button
                                        key={code}
                                        type="button"
                                        onClick={() => setJapanFilterPrefecture(code)}
                                        className={`w-full text-left px-2 py-1.5 rounded text-xs cursor-pointer ${
                                          japanFilterPrefecture === code
                                            ? 'bg-blue-100 text-blue-800 font-medium'
                                            : 'hover:bg-gray-50 text-gray-800'
                                        }`}
                                      >
                                        {language === 'ja' ? pref.ja : pref.en}
                                      </button>
                                    );
                                  }
                                )}
                            </div>
                          </div>
                          <div className="border rounded-lg overflow-hidden flex flex-col max-h-[38vh] sm:max-h-[42vh]">
                            <div className="text-[10px] font-semibold px-2 py-1 bg-gray-100 text-gray-700 shrink-0">
                              {language === 'vi' ? 'Phường / quận' : language === 'en' ? 'City / ward' : '市区町村'}
                            </div>
                            <div className="overflow-y-auto flex-1 p-1">
                              {japanFilterLoading && (
                                <div className="text-xs text-gray-500 p-2">Loading…</div>
                              )}
                              {!japanFilterLoading && japanFilterPrefecture && (() => {
                                const { tree } = japanFilterData;
                                const pref = JAPAN_PREFECTURES[japanFilterPrefecture];
                                const prefJa = pref?.ja || '';
                                const prefEn = pref?.en || '';
                                const toR = (kana, fb) => (kana ? kanaToRomaji(kana) : fb);
                                const makeLoc = (nameJa, nameKana) => {
                                  const ja = `${prefJa} ${nameJa}`.trim();
                                  const alpha = `${prefEn} ${toR(nameKana, nameJa)}`.trim();
                                  const id = `${japanFilterPrefecture}|${nameJa}`;
                                  return { id, ja, alpha };
                                };
                                const selectedIds = new Set(
                                  filters.locations
                                    .filter((l) => l.country === 'Japan')
                                    .map((l) => l.jpId || `${l.location}_Japan`)
                                );
                                const allLocs = tree.flatMap((c) =>
                                  c.standalone
                                    ? [makeLoc(c.name, c.nameKana)]
                                    : (c.wards || []).map((w) => makeLoc(w.fullName, w.fullNameKana))
                                );
                                if (allLocs.length === 0) {
                                  return (
                                    <div className="text-xs text-gray-400 p-2">
                                      {language === 'vi'
                                        ? 'Không có dữ liệu'
                                        : language === 'en'
                                        ? 'No data'
                                        : 'データがありません'}
                                    </div>
                                  );
                                }
                                const allOn = allLocs.length > 0 && allLocs.every((loc) => selectedIds.has(loc.id));
                                return (
                                  <>
                                    <label className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={allOn}
                                        onChange={(e) => applyJapanLocationBulk(e.target.checked, allLocs)}
                                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300"
                                      />
                                      <span className="text-xs font-medium">
                                        {language === 'vi' ? 'Tất cả' : language === 'en' ? 'All' : 'すべて'}
                                      </span>
                                    </label>
                                    {tree.map((city) => {
                                      const cityLocs = city.standalone
                                        ? [makeLoc(city.name, city.nameKana)]
                                        : (city.wards || []).map((w) => makeLoc(w.fullName, w.fullNameKana));
                                      const cityOn =
                                        cityLocs.length > 0 && cityLocs.every((l) => selectedIds.has(l.id));
                                      return (
                                        <div key={city.name}>
                                          <label className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={cityOn}
                                              onChange={(e) => applyJapanLocationBulk(e.target.checked, cityLocs)}
                                              className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300"
                                            />
                                            <span className="text-xs font-medium text-gray-800">
                                              {language === 'ja' ? city.name : toR(city.nameKana, city.name)}
                                            </span>
                                          </label>
                                          {city.wards && city.wards.length > 0 && (
                                            <div className="ml-3 pl-2 border-l border-gray-200">
                                              {city.wards.map((w) => {
                                                const loc = makeLoc(w.fullName, w.fullNameKana);
                                                const on = selectedIds.has(loc.id);
                                                return (
                                                  <label
                                                    key={w.fullName}
                                                    className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={on}
                                                      onChange={() =>
                                                        toggleJapanLocationEntry({
                                                          location: loc.alpha,
                                                          locationJp: loc.ja,
                                                          jpId: loc.id,
                                                        })
                                                      }
                                                      className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300"
                                                    />
                                                    <span className="text-xs text-gray-700">
                                                      {language === 'ja' ? w.fullName : toR(w.fullNameKana, w.fullName)}
                                                    </span>
                                                  </label>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                              {!japanFilterLoading && japanFilterRegion && !japanFilterPrefecture && (
                                <div className="text-xs text-gray-400 p-2">
                                  {language === 'vi'
                                    ? 'Chọn tỉnh/thành'
                                    : language === 'en'
                                    ? 'Select prefecture'
                                    : '都道府県を選んでください'}
                                </div>
                              )}
                              {!japanFilterLoading && !japanFilterRegion && (
                                <div className="text-xs text-gray-400 p-2">
                                  {language === 'vi'
                                    ? 'Chọn vùng và tỉnh'
                                    : language === 'en'
                                    ? 'Select region & prefecture'
                                    : '地域と都道府県を選んでください'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    setSelectedCountries([]);
                    setJapanFilterRegion(null);
                    setJapanFilterPrefecture(null);
                  }}
                  onMouseEnter={() => setHoveredModalConfirmButton('location')}
                  onMouseLeave={() => setHoveredModalConfirmButton(null)}
                  className="w-full py-2 px-4 rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: hoveredModalConfirmButton === 'location' ? '#2563eb' : '#2563eb',
                    color: 'white'
                  }}
                >
                  {language === 'vi' ? 'Xác nhận' : language === 'en' ? 'Confirm' : '確認'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Dual Modal: Field and Job Type Selection */}
      {showFieldJobTypeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
          onClick={() => {
            setShowFieldJobTypeModal(false);
            setSelectedFields([]);
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Panel: Field Selection */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {t.agentJobsSelectJobType}
                </h3>
                <button 
                  onClick={() => {
                    setShowFieldJobTypeModal(false);
                    setSelectedFields([]);
                  }} 
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {loadingFields ? (
                  <div className="text-center py-8 text-gray-500 text-sm">{t.loading}</div>
                ) : (
                  <div className="space-y-1">
                    {/* Chỉ hiển thị các lĩnh vực cha (parentId = null) */}
                    {categoryTree.length > 0 ? (
                      // Chỉ render các category top-level (không có parentId)
                      categoryTree
                        .filter(cat => !cat.parentId) // Chỉ lấy các category cha
                        .map((cat) => {
                          const catId = String(cat.id);
                          const isSelected = selectedFields.includes(catId);
                          
                          return (
                            <label
                              key={catId}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleField(catId)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-900 flex-1">
                                {getCategoryDisplayName(cat)}
                              </span>
                            </label>
                          );
                        })
                    ) : (
                      // Fallback: flat list - chỉ lấy các field không có parentId
                      availableFields
                        .filter(field => !field.parentId)
                        .map((field) => {
                          const isSelected = selectedFields.includes(field.id);
                          return (
                            <label
                              key={field.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleField(field.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-900">{getCategoryDisplayName(field)}</span>
                            </label>
                          );
                        })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Job Type Selection */}
            <div className="w-1/2 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
<h3 className="text-base font-semibold text-gray-900">
                {t.agentJobsDetails}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {loadingJobTypes ? (
                  <div className="text-center py-8 text-gray-500 text-sm">{t.loading}</div>
                ) : selectedFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {t.agentJobsSelectJobTypeFirst}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedFields.map((fieldId) => {
                      // Tìm field trong tree
                      const findCategoryInTree = (categories, targetId) => {
                        for (const cat of categories) {
                          if (String(cat.id) === String(targetId)) {
                            return cat;
                          }
                          if (cat.children && cat.children.length > 0) {
                            const found = findCategoryInTree(cat.children, targetId);
                            if (found) return found;
                          }
                        }
                        return null;
                      };
                      
                      const fieldInTree = findCategoryInTree(categoryTree, fieldId);
                      const field = availableFields.find(f => f.id === fieldId) || 
                                   (fieldInTree ? { id: String(fieldInTree.id), name: fieldInTree.name, nameEn: fieldInTree.nameEn, nameJp: fieldInTree.nameJp } : null);
                      
                      if (!field && !fieldInTree) return null;
                      
                      // Render nested job types với cấu trúc phân cấp đầy đủ
                      const renderNestedJobTypes = (category, level = 0) => {
                        if (!category.children || category.children.length === 0) return null;
                        
                        return (
                          <div className="space-y-1">
                            {category.children.map((child) => {
                              const childId = String(child.id);
                              const hasChildren = child.children && child.children.length > 0;
                              const idsInGroup = hasChildren ? getCategoryAndDescendantIds(child) : [childId];
                              const isSelected = hasChildren
                                ? idsInGroup.some(id => filters.jobTypeIds.includes(id))
                                : filters.jobTypeIds.includes(childId);
                              
                              return (
                                <div key={childId}>
                                  <label
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    style={{ paddingLeft: `${level * 20}px` }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => hasChildren
                                        ? toggleJobTypeWithDescendants(child)
                                        : toggleJobType(childId)
                                      }
                                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                    />
                                    <span className="text-xs text-gray-900 flex-1">
                                      {level > 0 && <span className="text-gray-400 mr-1">└─</span>}
                                      {getCategoryDisplayName(child)}
                                    </span>
                                  </label>
                                  {/* Render children của child (con của con) */}
                                  {hasChildren && (
                                    <div>
                                      {renderNestedJobTypes(child, level + 1)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      };
                      
                      // Nếu có field trong tree và có children, render tree structure
                      if (fieldInTree && fieldInTree.children && fieldInTree.children.length > 0) {
                        const detailIdsForField = getAllDetailIdsUnderField(fieldInTree);
                        const allChecked = detailIdsForField.length > 0 && detailIdsForField.every((id) => filters.jobTypeIds.map(String).includes(String(id)));
                        const someChecked = detailIdsForField.length > 0 && detailIdsForField.some((id) => filters.jobTypeIds.map(String).includes(String(id)));
                        return (
                          <div key={fieldId} className="space-y-2">
                            <label className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-2 cursor-pointer">
                              {detailIdsForField.length > 0 && (
                                <input
                                  type="checkbox"
                                  checked={allChecked}
                                  ref={(el) => {
                                    if (el) el.indeterminate = someChecked && !allChecked;
                                  }}
                                  onChange={() => toggleSelectAllDetailsForField(detailIdsForField)}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                />
                              )}
<h4 className="text-sm font-medium text-gray-700">
                                {getCategoryDisplayName(fieldInTree)}
                              </h4>
                              {detailIdsForField.length > 0 && (
                                <span className="text-xs text-gray-500">
                                ({t.selectAll})
                                </span>
                              )}
                            </label>
                            {renderNestedJobTypes(fieldInTree, 0)}
                          </div>
                        );
                      }
                      
                      // Fallback: Nếu không có tree structure, dùng flat list với descendants
                      const allDescendantIds = findAllDescendants(fieldId);
                      const directChildren = availableJobTypes.filter(jt => jt.parentId === fieldId);
                      const allJobTypesForField = [
                        ...directChildren,
                        ...availableJobTypes.filter(jt => allDescendantIds.includes(jt.id) && jt.parentId !== fieldId)
                      ];
                      
                      // Remove duplicates
                      const uniqueJobTypes = Array.from(
                        new Map(allJobTypesForField.map(jt => [jt.id, jt])).values()
                      );
                      
                      const detailIdsFlat = uniqueJobTypes.map((jt) => jt.id);
                      const allCheckedFlat = detailIdsFlat.length > 0 && detailIdsFlat.every((id) => filters.jobTypeIds.map(String).includes(String(id)));
                      const someCheckedFlat = detailIdsFlat.length > 0 && detailIdsFlat.some((id) => filters.jobTypeIds.map(String).includes(String(id)));
                      return (
                        <div key={fieldId} className="space-y-2">
                          <label className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-2 cursor-pointer">
                            {detailIdsFlat.length > 0 && (
                              <input
                                type="checkbox"
                                checked={allCheckedFlat}
                                ref={(el) => {
                                  if (el) el.indeterminate = someCheckedFlat && !allCheckedFlat;
                                }}
                                onChange={() => toggleSelectAllDetailsForField(detailIdsFlat)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                              />
                            )}
                            <h4 className="text-sm font-medium text-gray-700">
                              {getCategoryDisplayName(field || fieldInTree)}
                            </h4>
                            {detailIdsFlat.length > 0 && (
                              <span className="text-xs text-gray-500">
                                ({t.selectAll})
                              </span>
                            )}
                          </label>
                          <div className="space-y-1">
                            {uniqueJobTypes.map((jobType) => {
                              const isSelected = filters.jobTypeIds.includes(jobType.id);
                              return (
                                <label
                                  key={jobType.id}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleJobType(jobType.id)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="text-xs text-gray-900">{getCategoryDisplayName(jobType)}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                <button
                  onClick={() => {
                    setShowFieldJobTypeModal(false);
                    setSelectedFields([]);
                  }}
                  onMouseEnter={() => setHoveredModalConfirmButton('field')}
                  onMouseLeave={() => setHoveredModalConfirmButton(null)}
                  className="w-full py-2 px-4 rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: hoveredModalConfirmButton === 'field' ? '#2563eb' : '#2563eb',
                    color: 'white'
                  }}
                >
                  {language === 'vi' ? 'Xác nhận' : language === 'en' ? 'Confirm' : '確認'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Lĩnh vực kinh doanh */}
      {showSectorModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
          onClick={() => setShowSectorModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">
                {language === 'vi' ? 'Chọn lĩnh vực kinh doanh' : language === 'en' ? 'Select business sector' : '業種を選択'}
              </h3>
              <button 
                onClick={() => setShowSectorModal(false)} 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {BUSINESS_SECTOR_OPTIONS.map((option) => {
                  const value = option.vi; // canonical value for filters/API
                  const label =
                    language === 'en'
                      ? option.en || option.vi
                      : language === 'ja'
                      ? option.ja || option.vi
                      : option.vi;
                  const isSelected = (filters.sectorNames || []).includes(value);
                  return (
                    <label
                      key={option.key}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setFilters(prev => {
                            const current = prev.sectorNames || [];
                            if (current.includes(value)) {
                              return { ...prev, sectorNames: current.filter(s => s !== value) };
                            }
                            return { ...prev, sectorNames: [...current, value] };
                          });
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                      />
                      <span className="text-xs text-gray-900 flex-1">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t" style={{ borderColor: '#e5e7eb' }}>
              <button
                onClick={() => setShowSectorModal(false)}
                onMouseEnter={() => setHoveredModalConfirmButton('sector')}
                onMouseLeave={() => setHoveredModalConfirmButton(null)}
                className="w-full py-2 px-4 rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: hoveredModalConfirmButton === 'sector' ? '#1d4ed8' : '#2563eb',
                  color: 'white'
                }}
              >
                {language === 'vi' ? 'Xác nhận' : language === 'en' ? 'Confirm' : '確認'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MultiSelectModal
        isOpen={showHighlightModal}
        onClose={() => setShowHighlightModal(false)}
        title={language === 'vi' ? 'Chọn điểm nổi bật' : language === 'en' ? 'Select Highlights' : '特徴を選択'}
        options={mockHighlights}
        selected={filters.highlights}
        onToggle={toggleHighlight}
      />

      {/* Search History Modal */}
      <SlideInModal
        isOpen={showSearchHistoryModal}
        onClose={() => setShowSearchHistoryModal(false)}
        title="Lịch sử tìm kiếm"
        hoveredSlideModalCloseButton={hoveredSlideModalCloseButton}
        setHoveredSlideModalCloseButton={setHoveredSlideModalCloseButton}
      >
        <SearchHistoryContent
          isOpen={showSearchHistoryModal}
          onApply={applyFiltersAndSearch}
          language={language}
        />
      </SlideInModal>

      {/* Saved Criteria Modal */}
      <SlideInModal
        isOpen={showSavedCriteriaModal}
        onClose={() => setShowSavedCriteriaModal(false)}
        title="Tiêu chí tìm kiếm đã lưu"
        hoveredSlideModalCloseButton={hoveredSlideModalCloseButton}
        setHoveredSlideModalCloseButton={setHoveredSlideModalCloseButton}
      >
        <SavedCriteriaContent
          isOpen={showSavedCriteriaModal}
          refreshTrigger={savedCriteriaRefreshTrigger}
          onApply={applyFiltersAndSearch}
          onDelete={async (id) => {
            try {
              await apiService.deleteSavedSearchCriteria(id);
              setSavedCriteriaRefreshTrigger((t) => t + 1);
            } catch (e) {
              console.error(e);
            }
          }}
          onSaveCurrentClick={() => {
            setShowSavedCriteriaModal(false);
            setSaveCriteriaNameInput('');
            setShowSaveCriteriaNameModal(true);
          }}
          language={language}
        />
      </SlideInModal>

      {/* Modal nhập tên khi lưu tiêu chí */}
      {showSaveCriteriaNameModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} onClick={() => setShowSaveCriteriaNameModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {language === 'vi' ? 'Đặt tên tiêu chí' : language === 'en' ? 'Name this criteria' : '条件の名前'}
            </h3>
            <input
              type="text"
              value={saveCriteriaNameInput}
              onChange={(e) => setSaveCriteriaNameInput(e.target.value)}
              placeholder={language === 'vi' ? 'VD: Tìm IT Tokyo' : 'e.g. IT Tokyo'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowSaveCriteriaNameModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const name = saveCriteriaNameInput.trim();
                  if (!name) return;
                  try {
                    const keywordVal = filters.keyword ?? '';
                    await apiService.createSavedSearchCriteria({
                      name,
                      filters: { ...filters, keyword: keywordVal }
                    });
                    setShowSaveCriteriaNameModal(false);
                    setSaveCriteriaNameInput('');
                    setSavedCriteriaRefreshTrigger((t) => t + 1);
                    setShowSavedCriteriaModal(true);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {language === 'vi' ? 'Lưu' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved List Modal */}
      <SlideInModal
        isOpen={showSavedListModal}
        onClose={() => setShowSavedListModal(false)}
        title="Danh sách lưu giữ"
        hoveredSlideModalCloseButton={hoveredSlideModalCloseButton}
        setHoveredSlideModalCloseButton={setHoveredSlideModalCloseButton}
      >
        <SavedListContent
          isOpen={showSavedListModal}
          language={language}
          onTotalJobsChange={setSavedListsTotalJobs}
        />
      </SlideInModal>
      </div>
    </>
  );
};

// Slide In Modal Component
const SlideInModal = ({ isOpen, onClose, title, children, hoveredSlideModalCloseButton, setHoveredSlideModalCloseButton }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after mount
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0)',
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={`fixed inset-y-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '40vw' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
            <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>{title}</h2>
            <button
              onClick={onClose}
              onMouseEnter={() => setHoveredSlideModalCloseButton(true)}
              onMouseLeave={() => setHoveredSlideModalCloseButton(false)}
              className="p-2 rounded-full transition-colors"
              style={{
                backgroundColor: hoveredSlideModalCloseButton ? '#f3f4f6' : 'transparent'
              }}
            >
              <X className="w-5 h-5" style={{ color: '#4b5563' }} />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

// Search History Content
const SearchHistoryContent = ({ isOpen, onApply, language }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    apiService.getCTVSearchHistory({ page: 1, limit: 50 })
      .then((res) => {
        if (!cancelled && res.success && res.data?.searchHistory) setItems(res.data.searchHistory);
      })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen]);

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg p-3 flex items-start gap-2" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: '1px', borderStyle: 'solid' }}>
        <div className="rounded-full p-1 flex-shrink-0 mt-0.5" style={{ backgroundColor: '#3b82f6' }}>
          <Info className="w-3 h-3" style={{ color: 'white' }} />
        </div>
        <p className="text-xs" style={{ color: '#1e3a8a' }}>
          {language === 'vi' ? '50 tiêu chí tìm kiếm gần đây nhất được hiển thị.' : 'Up to 50 recent search criteria.'}
        </p>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{language === 'vi' ? 'Chưa có lịch sử tìm kiếm.' : 'No search history.'}</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{item.keyword || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  {item.filters && typeof item.filters === 'object' && Object.keys(item.filters).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                      {item.filters.keyword && <span className="px-2 py-1 bg-gray-100 rounded">Từ khóa: {item.filters.keyword}</span>}
                      {item.filters.locations?.length > 0 && <span className="px-2 py-1 bg-gray-100 rounded">Địa điểm</span>}
                      {item.filters.fieldIds?.length > 0 && <span className="px-2 py-1 bg-gray-100 rounded">Loại công việc</span>}
                      {item.filters.jobTypeIds?.length > 0 && <span className="px-2 py-1 bg-gray-100 rounded">Chi tiết</span>}
                      {item.filters.sectorNames?.length > 0 && <span className="px-2 py-1 bg-gray-100 rounded">Lĩnh vực</span>}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onApply?.({ keyword: item.keyword, filters: item.filters })}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-xs font-medium whitespace-nowrap flex-shrink-0"
                  style={{ backgroundColor: hoveredId === item.id ? '#bfdbfe' : '#dbeafe', color: '#1e40af' }}
                >
                  <Search className="w-4 h-4" />
                  <span>{language === 'vi' ? 'Tìm kiếm theo tiêu chí này' : 'Search with this'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Saved Criteria Content
const SavedCriteriaContent = ({ isOpen, refreshTrigger, onApply, onDelete, onSaveCurrentClick, language }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    apiService.getSavedSearchCriteria({ page: 1, limit: 50 })
      .then((res) => {
        if (!cancelled && res.success && res.data?.items) setItems(res.data.items);
        else if (!cancelled) setItems([]);
      })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, refreshTrigger]);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg p-3 flex items-start gap-2" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: '1px', borderStyle: 'solid' }}>
        <div className="rounded-full p-1 flex-shrink-0 mt-0.5" style={{ backgroundColor: '#3b82f6' }}>
          <Info className="w-3 h-3" style={{ color: 'white' }} />
        </div>
        <p className="text-xs" style={{ color: '#1e3a8a' }}>
          {language === 'vi' ? 'Các tiêu chí tìm kiếm đã lưu của bạn.' : 'Your saved search criteria.'}
        </p>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{language === 'vi' ? 'Chưa lưu tiêu chí nào.' : 'No saved criteria.'}</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <button type="button" onClick={() => onDelete?.(item.id)} className="text-red-500 hover:text-red-700 p-1 flex-shrink-0" aria-label="Xóa">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.updatedAt || item.createdAt)}</span>
                  </div>
                  {item.filters && typeof item.filters === 'object' && (
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                      {item.filters.keyword && <span className="px-2 py-1 bg-gray-100 rounded">Từ khóa</span>}
                      {item.filters.locations?.length > 0 && <span className="px-2 py-1 bg-gray-100 rounded">Địa điểm</span>}
                      {item.filters.fieldIds?.length > 0 && <span className="px-2 py-1 bg-gray-100 rounded">Loại công việc</span>}
                      {item.filters.jobTypeIds?.length > 0 && <span className="px-2 py-1 bg-gray-100 rounded">Chi tiết</span>}
                      {item.filters.sectorNames?.length > 0 && <span className="px-2 py-1 bg-gray-100 rounded">Lĩnh vực</span>}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onApply?.({ keyword: item.filters?.keyword, filters: item.filters })}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-xs font-medium whitespace-nowrap flex-shrink-0"
                  style={{ backgroundColor: hoveredId === item.id ? '#bfdbfe' : '#dbeafe', color: '#1e40af' }}
                >
                  <Search className="w-4 h-4" />
                  <span>{language === 'vi' ? 'Áp dụng tiêu chí này' : 'Apply'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onSaveCurrentClick}
        className="w-full py-3 text-xs text-blue-600 hover:text-blue-700 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium"
      >
        + {language === 'vi' ? 'Lưu tiêu chí hiện tại' : 'Save current criteria'}
      </button>
    </div>
  );
};

// Saved List Content
const SavedListContent = ({ isOpen, language, onTotalJobsChange }) => {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [listJobs, setListJobs] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [hoveredJobId, setHoveredJobId] = useState(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListNameInput, setNewListNameInput] = useState('');
  const [listsRefreshTrigger, setListsRefreshTrigger] = useState(0);
  const [creatingList, setCreatingList] = useState(false);

  useEffect(() => {
    if (isOpen) setSelectedListId(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingLists(true);
    setListJobs([]);
    apiService.getSavedLists({ page: 1, limit: 100 })
      .then((res) => {
        if (!cancelled && res.success && res.data?.items) {
          setLists(res.data.items);
          const items = res.data.items;
          if (items.length > 0 && onTotalJobsChange) {
            Promise.all(items.slice(0, 20).map((l) => apiService.getSavedListJobs(l.id)))
              .then((arr) => {
                if (cancelled) return;
                const total = arr.reduce((sum, r) => sum + (r.data?.length ?? 0), 0);
                onTotalJobsChange(total);
              })
              .catch(() => { if (!cancelled) onTotalJobsChange(0); });
          } else if (onTotalJobsChange) onTotalJobsChange(0);
        } else if (!cancelled) setLists([]);
      })
      .catch(() => { if (!cancelled) setLists([]); })
      .finally(() => { if (!cancelled) setLoadingLists(false); });
    return () => { cancelled = true; };
  }, [isOpen, onTotalJobsChange, listsRefreshTrigger]);

  useEffect(() => {
    if (!selectedListId) {
      setListJobs([]);
      return;
    }
    let cancelled = false;
    setLoadingJobs(true);
    apiService.getSavedListJobs(selectedListId)
      .then((res) => {
        if (!cancelled && res.success && Array.isArray(res.data)) setListJobs(res.data);
        else if (!cancelled) setListJobs([]);
      })
      .catch(() => { if (!cancelled) setListJobs([]); })
      .finally(() => { if (!cancelled) setLoadingJobs(false); });
    return () => { cancelled = true; };
  }, [selectedListId]);

  const removeJob = async (listId, jobId) => {
    try {
      await apiService.removeJobFromSavedList(listId, jobId);
      setListJobs((prev) => prev.filter((e) => e.jobId !== jobId && e.job?.id !== jobId));
      if (onTotalJobsChange) onTotalJobsChange((prev) => Math.max(0, (prev ?? 0) - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const totalJobs = listJobs.length;
  const selectedList = lists.find((l) => l.id === selectedListId);

  return (
    <div className="space-y-4">
      <div className="rounded-lg p-3 flex items-start gap-2" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: '1px', borderStyle: 'solid' }}>
        <div className="rounded-full p-1 flex-shrink-0 mt-0.5" style={{ backgroundColor: '#3b82f6' }}>
          <Info className="w-3 h-3" style={{ color: 'white' }} />
        </div>
        <p className="text-xs" style={{ color: '#1e3a8a' }}>
          {language === 'vi' ? 'Các danh sách (playlist) việc làm đã lưu. Chọn một danh sách để xem job.' : 'Your saved job lists. Select a list to view jobs.'}
        </p>
      </div>
      {loadingLists ? (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      ) : lists.length === 0 ? (
        <div className="text-center py-6 space-y-4">
          <p className="text-gray-500">{language === 'vi' ? 'Chưa có danh sách nào.' : 'No saved lists.'}</p>
          <button
            type="button"
            onClick={() => { setNewListNameInput(''); setShowCreateListModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            {language === 'vi' ? 'Tạo danh sách lưu giữ' : 'Create saved list'}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-medium text-gray-700">{language === 'vi' ? 'Chọn danh sách:' : 'Select list:'}</p>
              <button
                type="button"
                onClick={() => { setNewListNameInput(''); setShowCreateListModal(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                {language === 'vi' ? 'Tạo danh sách' : 'New list'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {lists.map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setSelectedListId(selectedListId === list.id ? null : list.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedListId === list.id ? 'bg-blue-100 border-blue-400 text-blue-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {list.name}
                </button>
              ))}
            </div>
          </div>
          {selectedListId && (
            <div className="border-t pt-4" style={{ borderColor: '#e5e7eb' }}>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {selectedList?.name} {language === 'vi' ? '— việc làm:' : '— jobs:'}
              </p>
              {loadingJobs ? (
                <div className="text-center py-6 text-gray-500">Loading...</div>
              ) : listJobs.length === 0 ? (
                <div className="text-center py-6 text-gray-500">{language === 'vi' ? 'Chưa có job trong list.' : 'No jobs in this list.'}</div>
              ) : (
                <div className="space-y-3">
                  {listJobs.map((entry) => {
                    const job = entry.job || {};
                    const jobId = job.id ?? entry.jobId;
                    return (
                      <div key={entry.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-2 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{job.title || '—'}</h3>
                            <div className="text-xs text-gray-600">
                              {job.jobCode && <span>Mã: {job.jobCode}</span>}
                              {job.deadline && <span className="ml-2">Hạn: {job.deadline}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => removeJob(selectedListId, jobId)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-red-200 text-red-600 hover:bg-red-50"
                              aria-label={language === 'vi' ? 'Xóa khỏi danh sách lưu giữ' : 'Remove from saved list'}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{language === 'vi' ? 'Xóa khỏi danh sách lưu giữ' : 'Remove from list'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => window.open(`/agent/jobs?jobId=${jobId}`, '_blank')}
                              onMouseEnter={() => setHoveredJobId(entry.id)}
                              onMouseLeave={() => setHoveredJobId(null)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                              style={{ backgroundColor: hoveredJobId === entry.id ? '#bfdbfe' : '#dbeafe', color: '#1e40af' }}
                            >
                              <Search className="w-4 h-4" />
                              <span>{language === 'vi' ? 'Xem chi tiết' : 'View'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal tạo danh sách mới */}
      {showCreateListModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} onClick={() => !creatingList && setShowCreateListModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {language === 'vi' ? 'Tạo danh sách lưu giữ' : 'Create saved list'}
            </h3>
            <input
              type="text"
              value={newListNameInput}
              onChange={(e) => setNewListNameInput(e.target.value)}
              placeholder={language === 'vi' ? 'Tên danh sách (VD: Việc làm IT yêu thích)' : 'List name'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={creatingList}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => !creatingList && setShowCreateListModal(false)}
                disabled={creatingList}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={creatingList || !newListNameInput.trim()}
                onClick={async () => {
                  const name = newListNameInput.trim();
                  if (!name || creatingList) return;
                  setCreatingList(true);
                  try {
                    const res = await apiService.createSavedList({ name });
                    if (res.success && res.data?.id) {
                      setShowCreateListModal(false);
                      setNewListNameInput('');
                      setListsRefreshTrigger((t) => t + 1);
                      setSelectedListId(res.data.id);
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setCreatingList(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {creatingList ? (language === 'vi' ? 'Đang tạo...' : 'Creating...') : (language === 'vi' ? 'Tạo' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentJobsPageSession1;


