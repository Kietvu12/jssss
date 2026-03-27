import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  UserPlus,
  ChevronDown,
  Plus,
  X,
  Edit,
  Eye,
  Trash2,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import apiService from '../../services/api';


const AgentJobsPageSession2 = ({ jobs: propJobs, filters, showAllJobs = false, enablePagination = false, useAdminAPI = false, onJobDeleted, onJobClick, hideViewMoreButton = false }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [ctvProfile, setCtvProfile] = useState(null);
  const limit = showAllJobs ? 10 : 3; // Show 10 jobs per page if showAllJobs, otherwise 3
  
  // Hover states
  const [hoveredPaginationButton, setHoveredPaginationButton] = useState(null);
  const [hoveredJobCardIndex, setHoveredJobCardIndex] = useState(null);
  const [hoveredDownloadButtonIndex, setHoveredDownloadButtonIndex] = useState(null);
  const [hoveredSaveButtonIndex, setHoveredSaveButtonIndex] = useState(null);
  const [hoveredSuggestButtonIndex, setHoveredSuggestButtonIndex] = useState(null);
  const [hoveredViewMoreButton, setHoveredViewMoreButton] = useState(false);
  const [openDownloadMenuJobId, setOpenDownloadMenuJobId] = useState(null);
  // Lưu job vào Saved List (chỉ CTV)
  const [showSaveToListModal, setShowSaveToListModal] = useState(false);
  const [saveToListJobId, setSaveToListJobId] = useState(null);
  const [saveToListLists, setSaveToListLists] = useState([]);
  const [loadingSaveToListLists, setLoadingSaveToListLists] = useState(false);
  const [saveToListMessage, setSaveToListMessage] = useState(null);
  const [showCreateListInSaveModal, setShowCreateListInSaveModal] = useState(false);
  const [newListNameInSaveModal, setNewListNameInSaveModal] = useState('');
  const [creatingListInSaveModal, setCreatingListInSaveModal] = useState(false);

  // Load CTV profile to get rank level (only for CTV users)
  useEffect(() => {
    if (!useAdminAPI) {
      const loadCTVProfile = async () => {
        try {
          const response = await apiService.getCTVProfile();
          if (response.success && response.data) {
            setCtvProfile(response.data.collaborator || response.data);
          }
        } catch (error) {
          console.error('Error loading CTV profile:', error);
        }
      };
      loadCTVProfile();
    }
  }, [useAdminAPI]);

  // Load saved lists when "Save to list" modal opens
  useEffect(() => {
    if (!showSaveToListModal || !saveToListJobId) return;
    let cancelled = false;
    setLoadingSaveToListLists(true);
    setSaveToListMessage(null);
    apiService.getSavedLists({ page: 1, limit: 100 })
      .then((res) => {
        if (!cancelled && res.success && res.data?.items) setSaveToListLists(res.data.items);
        else if (!cancelled) setSaveToListLists([]);
      })
      .catch(() => { if (!cancelled) setSaveToListLists([]); })
      .finally(() => { if (!cancelled) setLoadingSaveToListLists(false); });
    return () => { cancelled = true; };
  }, [showSaveToListModal, saveToListJobId]);

  const handleOpenSaveToList = (jobId) => {
    setSaveToListJobId(jobId);
    setShowSaveToListModal(true);
    setShowCreateListInSaveModal(false);
    setNewListNameInSaveModal('');
    setSaveToListMessage(null);
  };

  const handleAddJobToList = async (listId) => {
    if (!saveToListJobId) return;
    setSaveToListMessage(null);
    try {
      await apiService.addJobToSavedList(listId, { jobId: saveToListJobId });
      setSaveToListMessage(language === 'vi' ? 'Đã thêm vào danh sách.' : 'Added to list.');
      setTimeout(() => { setShowSaveToListModal(false); setSaveToListJobId(null); }, 800);
    } catch (e) {
      setSaveToListMessage(e?.message || (language === 'vi' ? 'Thêm thất bại.' : 'Failed.'));
    }
  };

  const handleDownloadJD = async (job, fileType = 'jdFile') => {
    if (!job?.id) return;
    setOpenDownloadMenuJobId(null);
    try {
      const url = useAdminAPI
        ? await apiService.getAdminJobFileUrl(job.id, fileType, 'download')
        : await apiService.getCtvJobFileUrl(job.id, fileType, 'download');
      if (url) window.open(url, '_blank');
      else alert(language === 'vi' ? 'Công việc này chưa có file JD.' : 'No JD file.');
    } catch (e) {
      const msg = e?.message || (language === 'vi' ? 'Không tải được JD.' : 'Failed to download JD.');
      alert(msg);
    }
  };

  const handleCreateListAndAddJob = async () => {
    const name = newListNameInSaveModal.trim();
    if (!name || creatingListInSaveModal || !saveToListJobId) return;
    setCreatingListInSaveModal(true);
    setSaveToListMessage(null);
    try {
      const createRes = await apiService.createSavedList({ name });
      if (!createRes.success || !createRes.data?.id) throw new Error('Create failed');
      await apiService.addJobToSavedList(createRes.data.id, { jobId: saveToListJobId });
      setSaveToListMessage(language === 'vi' ? 'Đã tạo danh sách và thêm công việc.' : 'List created and job added.');
      setShowCreateListInSaveModal(false);
      setNewListNameInSaveModal('');
      setSaveToListLists((prev) => [...prev, createRes.data]);
      setTimeout(() => { setShowSaveToListModal(false); setSaveToListJobId(null); }, 800);
    } catch (e) {
      setSaveToListMessage(e?.message || (language === 'vi' ? 'Tạo danh sách thất bại.' : 'Failed.'));
    } finally {
      setCreatingListInSaveModal(false);
    }
  };

  // Load initial jobs on mount (only if no propJobs and no filters)
  useEffect(() => {
    if (propJobs === undefined || propJobs === null) {
      // Only load if no special filters from URL
      if (!filters || (!filters.campaignId && !filters.pickupId && !filters.postId && !filters.isHot && !filters.isPinned)) {
        loadInitialJobs(1);
      }
    }
  }, []);

  // Update jobs when propJobs changes (from search)
  useEffect(() => {
    if (propJobs !== undefined && propJobs !== null) {
      const list = Array.isArray(propJobs) ? propJobs : [];
      if (showAllJobs) {
        setJobs(list);
        setTotalJobs(list.length);
        setTotalPages(Math.max(1, Math.ceil(list.length / limit)));
        setCurrentPage(1);
      } else {
        setJobs(list.slice(0, 3));
        setTotalJobs(list.length);
      }
    }
  }, [propJobs, showAllJobs, limit]);

  // Load jobs when filters change or page changes (only if showAllJobs and enablePagination and no propJobs from search)
  useEffect(() => {
    if (showAllJobs && enablePagination && propJobs === null) {
      // Reset to page 1 when filters change
      if (filters && (filters.campaignId || filters.pickupId || filters.postId || filters.isHot || filters.isPinned)) {
        setCurrentPage(1);
        loadInitialJobs(1);
      } else if (!filters || (!filters.campaignId && !filters.pickupId && !filters.postId && !filters.isHot && !filters.isPinned)) {
        // Load with current page if no special filters
        loadInitialJobs(currentPage);
      }
    }
  }, [currentPage, filters]);

  const loadInitialJobs = async (page = 1) => {
    try {
      setLoading(true);
      // Build params with current filters if available
      const params = { page, limit };
      
      if (filters) {
        // Apply filters from search
        if (filters.keyword && filters.keyword.trim()) {
          params.search = filters.keyword.trim();
        }
        // Category filter - ưu tiên jobTypeIds (Loại công việc), sau đó fieldIds (Lĩnh vực), cuối cùng businessTypeIds (Loại hình kinh doanh)
        if (filters.jobTypeIds && filters.jobTypeIds.length > 0) {
          params.categoryId = parseInt(filters.jobTypeIds[0]);
        } else if (filters.fieldIds && filters.fieldIds.length > 0) {
          params.categoryId = parseInt(filters.fieldIds[0]);
        } else if (filters.businessTypeIds && filters.businessTypeIds.length > 0) {
          params.categoryId = parseInt(filters.businessTypeIds[0]);
        }
        // Support old filter names for backward compatibility
        if (!params.categoryId) {
          if (filters.jobChildIds && filters.jobChildIds.length > 0) {
            params.categoryId = parseInt(filters.jobChildIds[0]);
          } else if (filters.jobParentIds && filters.jobParentIds.length > 0) {
            params.categoryId = parseInt(filters.jobParentIds[0]);
          }
        }
        if (filters.locations && filters.locations.length > 0) {
          params.location = filters.locations[0];
        }
        if (filters.salaryMin) {
          params.minSalary = String(filters.salaryMin);
        }
        if (filters.salaryMax) {
          params.maxSalary = String(filters.salaryMax);
        }
        // Support campaign, article, event, pickup, post filters
        if (filters.campaignId) {
          params.campaignId = filters.campaignId;
        }
        if (filters.articleId) {
          params.articleId = filters.articleId;
        }
        if (filters.eventId) {
          params.eventId = filters.eventId;
        }
        if (filters.pickupId) {
          params.pickupId = filters.pickupId;
        }
        if (filters.postId) {
          params.postId = filters.postId;
        }
        if (filters.isHot) {
          params.isHot = true;
        }
        if (filters.isPinned) {
          params.isPinned = true;
        }
      }
      
      params.sortBy = 'created_at';
      params.sortOrder = 'DESC';
      
      // Use getAdminJobs for admin users, getCTVJobs for CTV users
      const response = useAdminAPI 
        ? await apiService.getAdminJobs(params)
        : await apiService.getCTVJobs(params);
      if (response.success && response.data) {
        setJobs(response.data.jobs || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalJobs(response.data.pagination.total || 0);
          setCurrentPage(response.data.pagination.page || 1);
        }
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Mock data for job listings (removed - no longer used)
const mockJobs = [
  {
    id: '00304192-9fcd0',
    tags: [
      { label: 'JobShare Selection', color: 'green' },
      { label: 'Ứng tuyển trực tiếp', color: 'orange' },
      { label: 'Nhân viên chính thức (hợp đồng không thời hạn)', color: 'blue' },
    ],
    title: '【Tuyển dụng toàn quốc!】Chuyển việc OK ở bất kỳ đâu tại Nhật Bản. Bắt đầu từ số không trong quản lý thi công xây dựng ~ Chào đón người chưa có kinh nghiệm ● Đào tạo & hỗ trợ chu đáo để bắt đầu yên tâm. Phụ nữ cũng đang hoạt động tích cực ~',
    category: 'Kỹ thuật xây dựng & dân dụng / Quản lý thi công & Giám sát công trình【Xây dựng】',
    company: 'Công ty TNHH Nikken Total Sourcing',
    keywords: [
      'Chấp nhận chưa có kinh nghiệm nghề',
      'Chấp nhận chưa có kinh nghiệm ngành',
      'Chấp nhận hoàn toàn chưa có kinh nghiệm',
      'Đăng tải trên phương tiện truyền thông OK (công khai tên công ty)',
      'Tuyển dụng qua headhunter OK (công khai tên công ty)',
      'Nghỉ thứ 7 và Chủ nhật',
      'Có thành tích nghỉ thai sản/nuôi con',
    ],
    details: [
      'Hỗ trợ toàn quốc, quản lý thi công xây dựng cho người chưa có kinh nghiệm, phí giới thiệu 77 triệu yên, đào tạo chu đáo, tuyển gấp bắt đầu giữa tháng 1',
      'Mã việc làm: 00318682-b9948 - Đảm bảo phỏng vấn cho tất cả ứng viên',
      'Tỉnh Mie Yokkaichi / Kỹ sư bảo trì thiết bị bán dẫn / Chấp nhận chưa có kinh nghiệm',
      'Tuyển chọn tốc độ',
    ],
    commission: {
      company: 'Cố định 77 triệu yên',
      full: 'Cố định 77 triệu yên',
      sameDayPayment: true,
    },
  },
  {
    id: '00180228-54b9a',
    tags: [
      { label: 'JobShare Selection', color: 'green' },
      { label: 'Ứng tuyển trực tiếp', color: 'orange' },
      { label: 'Nhân viên chính thức (hợp đồng không thời hạn)', color: 'blue' },
    ],
    title: 'Thực hiện tuyển chọn 1 ngày! Tuyển chọn tốc độ cao Nhân viên bảo vệ quen thuộc với "Bạn có đang SECOM không?"! (Beat Engineer) ◆ Lương trung bình 621 triệu yên/năm / Thưởng tối đa 198 triệu yên / Có nhà ở công ty & ký túc xá độc thân / OK nghỉ 10 ngày liên tiếp',
    category: 'Công nhân kỹ năng, Thiết bị, Giao thông & Vận tải / Bảo vệ, Bảo vệ',
    company: 'Công ty TNHH SECOM',
    keywords: [
      'Chấp nhận chưa có kinh nghiệm nghề',
      'Chấp nhận chưa có kinh nghiệm ngành',
      'Chấp nhận hoàn toàn chưa có kinh nghiệm',
      'Đăng tải trên phương tiện truyền thông OK (công khai tên công ty)',
      'Tuyển dụng qua headhunter OK (công khai tên công ty)',
      'Có thể sử dụng tiếng Anh',
      'Có chế độ nhà ở công ty / Hỗ trợ tiền thuê nhà',
    ],
    details: [
      'Giới hạn khu vực',
      'Tổ chức hội tuyển chọn 1 ngày',
      'Tuyển chọn tốc độ cao nhanh hơn cả tuyển chọn thông thường',
      'Lịch trình cũng mở vào tháng 1/2026',
    ],
    commission: {
      company: '36% lương lý thuyết hàng năm',
      full: '36% lương lý thuyết hàng năm',
      sameDayPayment: true,
    },
  },
];

  const translations = {
    vi: {
      headerTitle: 'JobShare Workstation',
      viewSkilledJobs: 'Xem việc làm kỹ năng quốc tế',
      viewNoExpJobs: 'Xem việc làm chấp nhận chưa có kinh nghiệm',
      companyInfo: 'Hội thảo thông tin công ty tuyển dụng',
      jobId: 'Mã việc làm',
      jobCategory: 'Phân loại nghề nghiệp',
      hiringCompany: 'Công ty tuyển dụng',
      companyCommission: 'Có thể nhận',
      fullAmount: 'Toàn bộ',
      sameDayPayment: 'Có thể thanh toán trong ngày',
      viewMore: 'Xem thêm JobShare Workstation khác',
    },
    en: {
      headerTitle: 'JobShare Workstation',
      viewSkilledJobs: 'View skilled foreign worker jobs',
      viewNoExpJobs: 'View jobs OK for no experience',
      companyInfo: 'Company information session for hiring companies',
      jobId: 'Job ID',
      jobCategory: 'Job Category',
      hiringCompany: 'Hiring Company',
      companyCommission: 'Your company',
      fullAmount: 'Full amount',
      sameDayPayment: 'Same-day deposit OK',
      viewMore: 'View other JobShare Workstation',
    },
    ja: {
      headerTitle: 'JobShare Workstation',
      viewSkilledJobs: '技人国求人を見る',
      viewNoExpJobs: '未経験OK求人を見る',
      companyInfo: '採用企業会社説明会',
      jobId: '求人ID',
      jobCategory: '職種分類',
      hiringCompany: '採用企業',
      companyCommission: '貴社',
      fullAmount: '全額',
      sameDayPayment: '即日入金OK',
      viewMore: '他のJobShare Workstationを見る',
    },
  };

  const t = translations[language] || translations.vi;

  const pickByLanguage = (viText, enText, jpText) => {
    if (language === 'en') return enText || viText || '';
    if (language === 'ja') return jpText || enText || viText || '';
    return viText || enText || jpText || '';
  };

  const getTagColorClass = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[color] || colors.green;
  };

  const getTagInlineStyle = (color) => {
    const colorMap = {
      green: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' },
      orange: { backgroundColor: '#fed7aa', color: '#9a3412', borderColor: '#fdba74' },
      blue: { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' },
    };
    return colorMap[color] || colorMap.green;
  };

  // Strip HTML tags and format text
  const stripHtml = (html) => {
    if (!html) return '';
    
    // Check if it's already plain text
    if (!html.includes('<')) return html;
    
    try {
      // Create a temporary div element
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      
      // Convert <ul><li> and <ol><li> to bullet points
      const lists = tmp.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const items = list.querySelectorAll('li');
        const bulletPoints = Array.from(items).map(li => {
          const text = li.textContent.trim();
          return text ? `• ${text}` : '';
        }).filter(Boolean).join('\n');
        
        if (bulletPoints) {
          const textNode = document.createTextNode(bulletPoints);
          if (list.parentNode) {
            list.parentNode.replaceChild(textNode, list);
          }
        } else {
          list.remove();
        }
      });
      
      // Convert <br> to newlines
      const breaks = tmp.querySelectorAll('br');
      breaks.forEach(br => {
        br.replaceWith('\n');
      });
      
      // Convert <p> to newlines
      const paragraphs = tmp.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text) {
          p.replaceWith(`\n${text}\n`);
        } else {
          p.remove();
        }
      });
      
      // Get text content
      let text = tmp.textContent || tmp.innerText || '';
      
      // Clean up extra whitespace and newlines
      text = text
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive newlines
        .replace(/[ \t]+/g, ' ') // Multiple spaces to single space
        .trim();
      
      return text;
    } catch (error) {
      console.error('Error stripping HTML:', error);
      // Fallback: simple regex to remove HTML tags
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
  };

  // Format job data from API
  const formatJob = (job) => {
    const tags = [];
    if (job.isHot) {
      tags.push({ label: 'JobShare Selection', color: 'green' });
    }
    // Check if job belongs to a campaign (from jobCampaigns)
    const isInCampaign = job.jobCampaigns && job.jobCampaigns.length > 0;
    // Priority: Campaign tag should be shown if job is in campaign
    // Only show "Ứng tuyển trực tiếp" if job is pinned but NOT in campaign
    if (isInCampaign) {
      tags.push({ label: 'Campaign', color: 'blue' });
    } else if (job.isPinned) {
      tags.push({ label: 'Ứng tuyển trực tiếp', color: 'orange' });
    }

    // Helper: parse salary range về đơn vị gốc (yen/VND) để nhân đúng với %:
    // 3.000.000 × 30% = 900.000 (không dùng 3 để nhân)
    const parseSalaryRangeRaw = (rangeStr) => {
      if (!rangeStr) return null;
      const m = String(rangeStr).trim().match(/([\d.,]+)\s*[-–—]\s*([\d.,]+)/);
      if (!m) return null;
      const parseNum = (s) => {
        const cleaned = String(s).replace(/[.,]/g, '');
        const num = parseFloat(cleaned) || 0;
        const digitCount = cleaned.replace(/[^0-9]/g, '').length;
        if (digitCount >= 7) return num;
        return num * 1000000;
      };
      const min = parseNum(m[1]);
      const max = parseNum(m[2]);
      if (min <= 0 || max <= 0) return null;
      return { min, max };
    };

    // Helper function to parse number from string with thousand separators
    // Salary range can be in different formats:
    // - "3.000.000" = 3,000,000 base units = 3 million (7 digits)
    // - "343.800.000" = 343,800,000 base units = 343.8 million (9 digits)
    // - "343.800" = 343.8 million (already in millions, 6 digits with separator)
    // - "3" = 3 million (already in millions, 1 digit)
    const parseNumber = (str) => {
      if (!str) return 0;
      const originalStr = String(str);
      // Remove all dots and commas (thousand separators), then parse
      const cleaned = originalStr.replace(/[.,]/g, '');
      const num = parseFloat(cleaned) || 0;
      
      // Count digits to determine the scale
      const digitCount = cleaned.replace(/[^0-9]/g, '').length;
      const hasSeparators = /[.,]/.test(originalStr);
      
      // If number has 7+ digits, it's definitely in base units (yen/VND)
      // Convert to millions: 3,000,000 -> 3 million
      if (digitCount >= 7) {
        return num / 1000000;
      }
      // If number has 4-6 digits with separators, it could be:
      // - "3.000" = 3,000 (thousands) -> 3 million if it's actually 3,000,000
      // - "343.800" = 343.8 million (already in millions with decimal separator)
      // We need to check: if it has a pattern like "343.800" (digits.digits), treat as decimal
      else if (digitCount >= 4 && hasSeparators) {
        // Check if it looks like a decimal in millions (e.g., "343.800" = 343.8)
        // Pattern: digits.digits where the part after dot is 3 digits (thousand separator in decimal)
        const decimalPattern = /^(\d+)\.(\d{3})$/;
        if (decimalPattern.test(originalStr)) {
          // It's already in millions with decimal separator: "343.800" = 343.8 million
          // Parse as decimal: replace the last dot with nothing, then divide by 1000
          // "343.800" -> "343800" -> 343800 -> 343.8
          const beforeDot = originalStr.split('.')[0];
          const afterDot = originalStr.split('.').slice(1).join('');
          return parseFloat(beforeDot + '.' + afterDot);
        }
        // Otherwise, it's likely thousands that need conversion
        // "3.000" = 3,000 -> 3 million (if it's actually 3,000,000)
        return num / 1000;
      }
      // If number is small (< 1000) or has 1-3 digits, assume it's already in millions
      // Example: "3" = 3 million
      else {
        return num;
      }
    };

    // Helper function to parse salary range "min - max" (supports thousand separators)
    const parseSalaryRange = (rangeStr) => {
      if (!rangeStr) return null;
      // Match pattern: "number - number" (supports dots, commas, spaces)
      // Examples: "3.000.000 - 8.000.000", "3000000 - 8000000", "3,000,000 - 8,000,000"
      const rangeMatch = rangeStr.match(/([\d.,]+)\s*-\s*([\d.,]+)/);
      if (rangeMatch) {
        const minSalary = parseNumber(rangeMatch[1]);
        const maxSalary = parseNumber(rangeMatch[2]);
        if (minSalary > 0 && maxSalary > 0) {
          return { min: minSalary, max: maxSalary, avg: (minSalary + maxSalary) / 2 };
        }
      }
      return null;
    };

    // Calculate commission based on salary range, job percent, and CTV rank percent
    // Lấy job_values có commission: Phí (typeId 2), JLPT (1), JLPT-range (3), JLPT_range (4) - backend dùng cả những type này
    const allJobValues = job.jobValues || job.profits || [];
    const commissionTypeIds = [1, 2, 3, 4]; // Phí, JLPT, JLPT-range, JLPT_range
    const jobValues = allJobValues.filter(jv => {
      const tid = jv.typeId ?? jv.id_typename ?? jv.type?.id;
      const tname = (jv.type?.typename || '').toLowerCase();
      if (tid === 2 || tid === '2' || tname === 'phí' || tname === 'commission') return true;
      if (commissionTypeIds.includes(Number(tid))) return true;
      if (jv.type?.cvField && (jv.value !== null && jv.value !== undefined && jv.value !== '')) return true; // type có cvField + có value = commission tier
      return false;
    });
    // Ẩn block "tên điều kiện phí" (cột giữa) khi job_type = 2 và job_value = 6 hoặc 7
    const hideCommissionConditionLabel = jobValues.some(jv => {
      const tid = Number(jv.typeId ?? jv.type?.id ?? 0);
      const valueId = jv.valueId ?? jv.valueRef?.id;
      const val = jv.value;
      const numVal = val !== null && val !== undefined && val !== '' ? Number(val) : null;
      return tid === 2 && (Number(valueId) === 6 || Number(valueId) === 7 || numVal === 6 || numVal === 7);
    });
    let commissionText = 'Liên hệ';
    let commissionTiers = [];
    let isCommissionFromCampaign = false;
    
    // Campaign: nếu job thuộc campaign thì dùng % của campaign để tính phí
    const jobCampaigns = job.jobCampaigns || [];
    const hasCampaignPercent = jobCampaigns.length > 0 && jobCampaigns[0]?.campaign?.percent != null;
    const campaignPercent = hasCampaignPercent ? Number(jobCampaigns[0].campaign.percent) : null;
    
    // Admin: bỏ qua nhân rank. CTV: nhân với % rank_level
    const ctvRankPercent = ctvProfile?.rankLevel?.percent ? parseFloat(ctvProfile.rankLevel.percent) : 0;
    const rankMultiplier = useAdminAPI ? 1 : (ctvRankPercent > 0 ? ctvRankPercent / 100 : 1);
    
    // Xác định đơn vị tiền theo interview_location: 1=VN→VND, 2=JP→JPY, 3=VND
    const isJPY = job.interviewLocation === 2;
    const currencyUnit = isJPY ? 'JPY' : 'VND';

    // Helper: format số tiền theo đơn vị (JPY hoặc triệu VND)
    const formatAmountWithCurrency = (amount) => {
      const n = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
      const opts = n >= 1 && n === Math.floor(n)
        ? { maximumFractionDigits: 0 }
        : { minimumFractionDigits: n < 1 ? 2 : 1, maximumFractionDigits: 2 };
      const formatted = n.toLocaleString('vi-VN', opts);
      return isJPY ? `${formatted} ${currencyUnit}` : `${formatted} triệu ${currencyUnit}`;
    };
    // Format commission: JPY = giá trị gốc (900.000), VND = chia 1M ra triệu (0,9)
    const formatCommissionForDisplay = (amount) => {
      if (amount >= 1000) {
        return isJPY ? Math.round(amount).toLocaleString('vi-VN') : (amount / 1000000).toFixed(1).replace(/\.?0+$/, '');
      }
      if (amount < 1) return amount.toFixed(2).replace(/\.?0+$/, '');
      if (amount < 10) return amount.toFixed(1).replace(/\.?0+$/, '');
      return Math.round(amount).toString();
    };
    const formatRangeWithCurrency = (min, max, formatFn) => {
      const fm = formatFn ? formatFn(min) : (min < 1 ? min.toFixed(2) : min < 10 ? min.toFixed(1) : Math.round(min).toString());
      const fx = formatFn ? formatFn(max) : (max < 1 ? max.toFixed(2) : max < 10 ? max.toFixed(1) : Math.round(max).toString());
      const sep = isJPY ? '.' : ',';
      return isJPY ? `${fm.replace('.', sep)} - ${fx.replace('.', sep)} ${currencyUnit}` : `${fm.replace('.', sep)} - ${fx.replace('.', sep)} triệu ${currencyUnit}`;
    };

    // Get salary range with type = "year" (min-max theo chuỗi)
    // Hỗ trợ cả salaryRange (camelCase) và salary_range (snake_case) từ API
    const salaryRanges = job.salaryRanges || [];
    const yearSalaryRange = salaryRanges.find(sr => {
      const t = (sr.type || '').toLowerCase();
      return t === 'year' || t === 'năm';
    });
    let rawRange = yearSalaryRange?.salaryRange ?? yearSalaryRange?.salary_range ?? '';
    // Nếu không có year, thử bất kỳ salary range nào có pattern "min - max"
    if (!rawRange && salaryRanges.length > 0) {
      for (const sr of salaryRanges) {
        const r = sr.salaryRange ?? sr.salary_range ?? '';
        if (r && /[\d.,]+\s*[-–—]\s*[\d.,]+/.test(r)) { rawRange = r; break; }
      }
    }
    // Fallback: parse từ salaryRangeDetails hoặc salaryText (content có thể chứa "3.000.000 - 7.500.000")
    if (!rawRange) {
      const sources = [
        ...(job.salaryRangeDetails || []).map(d => (d.content || '').replace(/<[^>]*>/g, ' ')),
        job.estimatedSalary || job.estimated_salary || ''
      ].filter(Boolean);
      for (const str of sources) {
        const m = String(str).match(/([\d.,]+)\s*[-–—]\s*([\d.,]+)/);
        if (m) { rawRange = `${m[1]} - ${m[2]}`; break; }
      }
    }
    const salaryRangeData = rawRange ? parseSalaryRangeRaw(rawRange) : null;

    // Admin: chỉ hiển thị % hoặc số tiền nhận từ khách, không tính tiền từ % × lương
    const adminOnlyPercentOrAmount = useAdminAPI;

    // Backend đã tính sẵn (salary gốc × campaign%): min/max là giá trị gốc (yen/VND)
    if (job.computedCampaignCommission) {
      const { min, max } = job.computedCampaignCommission;
      isCommissionFromCampaign = true;
      if (adminOnlyPercentOrAmount && hasCampaignPercent && campaignPercent != null) {
        commissionText = `${campaignPercent}%`;
        commissionTiers = [{ label: 'Campaign', amount: commissionText }];
      } else {
        const ctvMin = min * rankMultiplier;
        const ctvMax = max * rankMultiplier;
        commissionText = formatRangeWithCurrency(ctvMin, ctvMax, formatCommissionForDisplay);
        commissionTiers = [{ label: 'Campaign', amount: commissionText }];
      }
    }
    // Campaign + salary range: tính phí theo lương gốc × campaign% (fallback khi backend chưa gửi)
    else if (hasCampaignPercent && campaignPercent > 0 && salaryRangeData) {
      isCommissionFromCampaign = true;
      if (adminOnlyPercentOrAmount) {
        commissionText = `${campaignPercent}%`;
        commissionTiers = [{ label: 'Campaign', amount: commissionText }];
      } else {
        const platformCommissionMin = salaryRangeData.min * (campaignPercent / 100);
        const platformCommissionMax = salaryRangeData.max * (campaignPercent / 100);
        const ctvMinAmount = platformCommissionMin * rankMultiplier;
        const ctvMaxAmount = platformCommissionMax * rankMultiplier;
        commissionText = formatRangeWithCurrency(ctvMinAmount, ctvMaxAmount, formatCommissionForDisplay);
        commissionTiers = [{ label: 'Campaign', amount: commissionText }];
      }
    } else if (jobValues.length > 0) {
      const firstJobValue = jobValues[0];
      const commissionType = job.jobCommissionType || 'fixed';
      const value = firstJobValue.value;
      const valueId = firstJobValue.valueId || firstJobValue.valueRef?.id;
      // Khi job thuộc campaign và campaign có percent: dùng campaign percent thay cho % của job
      const effectivePercent = (commissionType === 'percent' && hasCampaignPercent)
        ? campaignPercent
        : (parseFloat(value) || 0);
      if (commissionType === 'percent' && hasCampaignPercent) {
        isCommissionFromCampaign = true;
      }
      
      // Check if valueId = 6 (exception case - display fixed amount directly)
      if (valueId === 6) {
        if (value !== null && value !== undefined) {
          if (commissionType === 'fixed') {
            const fixedAmount = parseFloat(value) || 0;
            if (fixedAmount > 0) {
              const displayAmount = fixedAmount * rankMultiplier;
              commissionText = formatAmountWithCurrency(displayAmount);
            }
          } else if (commissionType === 'percent') {
            if (adminOnlyPercentOrAmount) {
              commissionText = `${effectivePercent}%`;
            } else if (salaryRangeData) {
              const jobPercent = effectivePercent;
              const platformCommissionMin = salaryRangeData.min * (jobPercent / 100);
              const platformCommissionMax = salaryRangeData.max * (jobPercent / 100);
              const ctvMinAmount = platformCommissionMin * rankMultiplier;
              const ctvMaxAmount = platformCommissionMax * rankMultiplier;
              commissionText = formatRangeWithCurrency(ctvMinAmount, ctvMaxAmount, formatCommissionForDisplay);
            } else {
              commissionText = `${effectivePercent}%`;
            }
          }
        }
      } else {
        // Normal case
        if (adminOnlyPercentOrAmount && commissionType === 'percent') {
          commissionText = `${effectivePercent}%`;
        } else if (salaryRangeData && commissionType === 'percent' && (value !== null && value !== undefined || isCommissionFromCampaign)) {
          const jobPercent = effectivePercent;
          const platformCommissionMin = salaryRangeData.min * (jobPercent / 100);
          const platformCommissionMax = salaryRangeData.max * (jobPercent / 100);
          const ctvMinAmount = platformCommissionMin * rankMultiplier;
          const ctvMaxAmount = platformCommissionMax * rankMultiplier;
          commissionText = formatRangeWithCurrency(ctvMinAmount, ctvMaxAmount, formatCommissionForDisplay);
        } else if (commissionType === 'fixed' && value !== null && value !== undefined) {
          const amount = parseFloat(value) || 0;
          if (amount > 0) {
            const displayAmount = amount * rankMultiplier;
            commissionText = formatAmountWithCurrency(displayAmount);
          }
        } else if (commissionType === 'percent' && (value !== null && value !== undefined || isCommissionFromCampaign)) {
          commissionText = `${effectivePercent}%`;
        }
      }

      // Build commission tiers: nếu phí theo campaign thì chỉ 1 tier "Campaign" với số tiền đã tính
      if (isCommissionFromCampaign && commissionText !== 'Liên hệ') {
        commissionTiers = [{ label: 'Campaign', amount: commissionText }];
      } else {
      commissionTiers = jobValues.map((jv) => {
        const tierCommissionType = job.jobCommissionType || 'fixed';
        const rawValue = jv.value;
        let amountText = '';
        if (rawValue !== null && rawValue !== undefined && rawValue !== '') {
          if (tierCommissionType === 'percent') {
            const tierPercent = parseFloat(rawValue) || 0;
            const effectivePct = isCommissionFromCampaign && campaignPercent != null ? campaignPercent : tierPercent;
            if (adminOnlyPercentOrAmount) {
              amountText = `${effectivePct.toLocaleString('vi-VN')}%`;
            } else if (salaryRangeData && effectivePct > 0) {
              const pMin = salaryRangeData.min * (effectivePct / 100) * rankMultiplier;
              const pMax = salaryRangeData.max * (effectivePct / 100) * rankMultiplier;
              amountText = formatRangeWithCurrency(pMin, pMax, formatCommissionForDisplay);
            } else {
              amountText = `${tierPercent.toLocaleString('vi-VN')}%`;
            }
          } else {
            const amt = parseFloat(rawValue) || 0;
            const displayAmt = amt > 0 ? amt * rankMultiplier : 0;
            amountText = displayAmt > 0 ? formatAmountWithCurrency(displayAmt) : '';
          }
        }
        const valueRef = jv.valueRef || {};
        const conditionLabel = valueRef.valuename || (language === 'vi' ? 'Phí' : 'Fee');
        return (conditionLabel || amountText)
          ? { label: conditionLabel, amount: amountText || commissionText }
          : null;
      }).filter(Boolean);
      }
    }

    const requirements = job.requirements || [];
    const techniqueRequirements = requirements
      .filter(req => req.type === 'technique')
      .map(req => stripHtml(pickByLanguage(req.content, req.contentEn || req.content_en, req.contentJp || req.content_jp) || ''));
    const educationRequirements = requirements
      .filter(req => req.type === 'education')
      .map(req => stripHtml(pickByLanguage(req.content, req.contentEn || req.content_en, req.contentJp || req.content_jp) || ''));
    
    const applicationRequirements = requirements
      .filter(req => req.type === 'application')
      .map(req => stripHtml(pickByLanguage(req.content, req.contentEn || req.content_en, req.contentJp || req.content_jp) || ''));
    
    // If no application type, combine technique and education as application conditions
    const applicationConditions = applicationRequirements.length > 0 
      ? applicationRequirements 
      : [...techniqueRequirements, ...educationRequirements];

    // Get job content (description)
    const description = pickByLanguage(
      job.description,
      job.descriptionEn || job.description_en,
      job.descriptionJp || job.description_jp
    );
    const jobContent = stripHtml(description || job.jobContent || '');

    // Get working location details (hỗ trợ cả Admin API và CTV API) + fallback từ workingLocations
    const workingLocationDetails = job.workingLocationDetails || [];
    const workLocation = job.workLocation || job.work_location || '';
    let locationText = workingLocationDetails
      .map(detail => {
        const content = pickByLanguage(
          detail.content,
          detail.contentEn || detail.content_en,
          detail.contentJp || detail.content_jp
        );
        return stripHtml(content || '');
      })
      .filter(Boolean)
      .join(', ');
    if (!locationText && (job.workingLocations || []).length > 0) {
      locationText = job.workingLocations
        .map(loc => {
          const locText = pickByLanguage(loc.location, loc.locationEn || loc.location_en, loc.locationJp || loc.location_jp);
          const countryText = pickByLanguage(loc.country, loc.countryEn || loc.country_en, loc.countryJp || loc.country_jp);
          return [locText, countryText].filter(Boolean).join(' - ');
        })
        .filter(Boolean)
        .join(', ');
    }
    if (!locationText) locationText = stripHtml(workLocation || '');

    // Get salary range details + fallback từ salaryRanges
    const salaryRangeDetails = job.salaryRangeDetails || [];
    const estimatedSalary = job.estimatedSalary || job.estimated_salary || '';
    let salaryText = salaryRangeDetails
      .map(detail => {
        const content = pickByLanguage(
          detail.content,
          detail.contentEn || detail.content_en,
          detail.contentJp || detail.content_jp
        );
        return stripHtml(content || '');
      })
      .filter(Boolean)
      .join(', ');
    if (!salaryText && (job.salaryRanges || []).length > 0) {
      salaryText = job.salaryRanges
        .map(sr => pickByLanguage(sr.salaryRange, sr.salaryRangeEn || sr.salary_range_en, sr.salaryRangeJp || sr.salary_range_jp))
        .filter(Boolean)
        .join(', ');
    }
    if (!salaryText) salaryText = stripHtml(estimatedSalary || '');
    
    // Get additional info
    const ageRange = job.ageRange || job.age || '';
    const nationality = job.nationality || '';
    const gender = job.gender || '';
    const educationLevel = job.educationLevel || '';
    const category = pickByLanguage(
      job.category?.name,
      job.category?.nameEn || job.category?.name_en,
      job.category?.nameJp || job.category?.name_jp
    ) || job.category?.name || '';
    
    // Format dates
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch (error) {
        return '';
      }
    };
    
    const updatedAt = formatDate(job.updatedAt);
    const publishedAt = formatDate(job.publishedAt || job.createdAt);

    const title = pickByLanguage(
      job.title,
      job.titleEn || job.title_en,
      job.titleJp || job.title_jp
    );

    return {
      id: String(job.id),
      jobCode: job.jobCode || job.id,
      tags,
      title: title || '',
      company: job.recruitingCompany?.companyName || job.company?.name || '',
      recruitingCompany: job.recruitingCompany,
      category,
      techniqueRequirements,
      educationRequirements,
      applicationConditions,
      jobContent,
      location: locationText,
      salary: salaryText,
      commission: commissionText,
      commissionTiers,
      hideCommissionConditionLabel: !!hideCommissionConditionLabel,
      isCommissionFromCampaign,
      isInCampaign,
      ageRange,
      nationality,
      gender,
      educationLevel,
      updatedAt,
      publishedAt,
    };
  };

  const displayJobs = useMemo(() => jobs.length > 0 ? jobs.map(formatJob) : [], [jobs, ctvProfile, useAdminAPI, language]);

  const jobsToRender = displayJobs;

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f1f1;
        }
      `}</style>
      <div className="w-full h-full flex flex-col">
        {/* Job Listings with Scroll */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 min-h-0 relative">
        {/* Pagination - Show at top if showAllJobs and enablePagination */}
        {showAllJobs && enablePagination && (
          <div className="sticky top-0 z-10 mb-4 rounded-lg shadow-sm p-2 sm:p-3" style={{ backgroundColor: 'white', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="text-xs sm:text-sm w-full sm:w-auto flex items-center gap-2 flex-wrap" style={{ color: '#4b5563' }}>
                <span>
                  {language === 'vi' 
                    ? `Hiển thị ${jobs.length} / ${totalJobs} công việc`
                    : language === 'en'
                    ? `Showing ${jobs.length} / ${totalJobs} jobs`
                    : `${jobs.length} / ${totalJobs} 件を表示`
                  }
                </span>
              </div>
              <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || loading}
                  onMouseEnter={() => setHoveredPaginationButton('first')}
                  onMouseLeave={() => setHoveredPaginationButton(null)}
                  className="flex items-center justify-center w-4 h-4 text-sm font-medium rounded-lg transition-colors"
                  title={language === 'vi' ? 'Trang đầu' : language === 'en' ? 'First page' : '最初のページ'}
                  style={{
                    color: '#374151',
                    backgroundColor: hoveredPaginationButton === 'first' && !(currentPage === 1 || loading) ? '#e5e7eb' : '#f3f4f6',
                    opacity: (currentPage === 1 || loading) ? 0.5 : 1,
                    cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-2" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  onMouseEnter={() => setHoveredPaginationButton('prev')}
                  onMouseLeave={() => setHoveredPaginationButton(null)}
                  className="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors"
                  title={language === 'vi' ? 'Trang trước' : language === 'en' ? 'Previous page' : '前のページ'}
                  style={{
                    color: '#374151',
                    backgroundColor: hoveredPaginationButton === 'prev' && !(currentPage === 1 || loading) ? '#e5e7eb' : '#f3f4f6',
                    opacity: (currentPage === 1 || loading) ? 0.5 : 1,
                    cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        onMouseEnter={() => setHoveredPaginationButton(`page-${pageNum}`)}
                        onMouseLeave={() => setHoveredPaginationButton(null)}
                        className="w-8 h-8 text-xs font-medium rounded-lg transition-colors"
                        style={{
                          backgroundColor: isActive ? '#2563eb' : (hoveredPaginationButton === `page-${pageNum}` ? '#e5e7eb' : '#f3f4f6'),
                          color: isActive ? 'white' : '#374151',
                          opacity: loading ? 0.5 : 1,
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  onMouseEnter={() => setHoveredPaginationButton('next')}
                  onMouseLeave={() => setHoveredPaginationButton(null)}
                  className="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors"
                  title={language === 'vi' ? 'Trang sau' : language === 'en' ? 'Next page' : '次のページ'}
                  style={{
                    color: '#374151',
                    backgroundColor: hoveredPaginationButton === 'next' && !(currentPage === totalPages || loading) ? '#e5e7eb' : '#f3f4f6',
                    opacity: (currentPage === totalPages || loading) ? 0.5 : 1,
                    cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || loading}
                  onMouseEnter={() => setHoveredPaginationButton('last')}
                  onMouseLeave={() => setHoveredPaginationButton(null)}
                  className="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors"
                  title={language === 'vi' ? 'Trang cuối' : language === 'en' ? 'Last page' : '最後のページ'}
                  style={{
                    color: '#374151',
                    backgroundColor: hoveredPaginationButton === 'last' && !(currentPage === totalPages || loading) ? '#e5e7eb' : '#f3f4f6',
                    opacity: (currentPage === totalPages || loading) ? 0.5 : 1,
                    cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div style={{ color: '#6b7280' }}>Đang tải...</div>
          </div>
        ) : jobsToRender.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg mb-2" style={{ color: '#6b7280' }}>Không tìm thấy công việc nào</p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Vui lòng thử lại với bộ lọc khác</p>
            </div>
          </div>
        ) : (
        <div className={`space-y-3 ${showAllJobs && enablePagination ? '' : 'pb-20'}`}>
            {jobsToRender.map((job) => (
            <div
              key={job.id}
              onClick={() => {
                if (onJobClick) {
                  onJobClick(job);
                  return;
                }
                if (useAdminAPI) {
                  const currentPath = window.location.pathname;
                  if (currentPath.includes('/admin/group-jobs')) {
                    sessionStorage.setItem('jobDetailReferrer', '/admin/group-jobs');
                  } else {
                    sessionStorage.setItem('jobDetailReferrer', '/admin/jobs');
                  }
                }
                const fromPage = useAdminAPI 
                  ? (window.location.pathname.includes('/admin/group-jobs') ? 'group-jobs' : 'jobs')
                  : 'agent-jobs';
                navigate(useAdminAPI ? `/admin/jobs/${job.id}` : `/agent/jobs/${job.id}`, {
                  state: { from: fromPage }
                });
              }}
              onMouseEnter={() => setHoveredJobCardIndex(job.id)}
              onMouseLeave={() => setHoveredJobCardIndex(null)}
              className="border rounded-lg p-3 transition-all duration-200 cursor-pointer min-h-[320px] flex flex-col"
              style={{
                backgroundColor: 'white',
                borderColor: '#e5e7eb',
                boxShadow: hoveredJobCardIndex === job.id ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
                {/* Main Content - Left Column */}
                <div className="flex-1 flex flex-col min-w-0 space-y-2">
                  {/* Header: Code + Tags + Title + Category + Company */}
                  <div className="space-y-1.5 pb-2 border-b flex-shrink-0" style={{ borderColor: '#f3f4f6' }}>
                    <div className="text-[11px] font-medium" style={{ color: '#6b7280' }}>
                      {language === 'vi' ? 'ID công việc' : language === 'en' ? 'Job ID' : '求人ID'}: <span style={{ color: '#374151' }}>{job.jobCode}</span>
                    </div>
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={getTagInlineStyle(tag.color)}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="text-sm font-bold leading-tight line-clamp-2 pr-1" style={{ color: '#2563eb' }}>{job.title}</h2>
                    {job.category && (
                      <div className="text-[11px] line-clamp-1" style={{ color: '#374151' }}>
                        <span className="font-semibold" style={{ color: '#4b5563' }}>{language === 'vi' ? 'Phân loại' : language === 'en' ? 'Category' : '職種'}:</span>
                        <span className="ml-1 break-words">{job.category}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-1">
                      <Building2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#6b7280' }} />
                      <div className="text-[11px] line-clamp-1" style={{ color: '#374151' }}>
                        <span className="font-semibold" style={{ color: '#4b5563' }}>{t.hiringCompany}:</span>
                        <span className="ml-1">{job.recruitingCompany?.companyName || job.company?.name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nội dung + Điều kiện: cùng chiều cao cố định */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-h-0">
                    {job.jobContent ? (
                      <div className="flex flex-col h-[120px] border rounded-md flex-shrink-0 overflow-hidden" style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}>
                        <div className="px-2 py-1 border-b flex-shrink-0 text-[10px] font-semibold" style={{ borderColor: '#e5e7eb', color: '#374151' }}>
                          {language === 'vi' ? 'Nội dung công việc' : language === 'en' ? 'Job Content' : '仕事内容'}
                        </div>
                        <div className="flex-1 overflow-y-auto px-2 py-1.5 text-[11px] leading-snug whitespace-pre-line custom-scrollbar min-h-0" style={{ color: '#374151' }}>{job.jobContent}</div>
                      </div>
                    ) : (
                      <div className="h-[120px] rounded-md flex-shrink-0" style={{ backgroundColor: '#f9fafb', border: '1px dashed #e5e7eb' }} />
                    )}
                    {job.applicationConditions && job.applicationConditions.length > 0 ? (
                      <div className="flex flex-col h-[120px] border rounded-md flex-shrink-0 overflow-hidden" style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}>
                        <div className="px-2 py-1 border-b flex-shrink-0 text-[10px] font-semibold" style={{ borderColor: '#e5e7eb', color: '#374151' }}>
                          {language === 'vi' ? 'Điều kiện ứng tuyển' : language === 'en' ? 'Conditions' : '応募条件'}
                        </div>
                        <div className="flex-1 overflow-y-auto px-2 py-1.5 text-[11px] space-y-1 custom-scrollbar min-h-0" style={{ color: '#374151' }}>
                          {job.applicationConditions.map((condition, index) => (
                            <div key={index} className="flex items-start gap-1">
                              <span className="flex-shrink-0 font-bold" style={{ color: '#3b82f6' }}>•</span>
                              <span className="whitespace-pre-line leading-snug line-clamp-2">{condition}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[120px] rounded-md flex-shrink-0" style={{ backgroundColor: '#f9fafb', border: '1px dashed #e5e7eb' }} />
                    )}
                  </div>
                </div>

                {/* Side Panel - Right: đủ rộng để hiển thị commission (900.000 - 2.250.000 JPY) */}
                <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-2">
                  {job.commissionTiers && job.commissionTiers.length > 0 ? (
                    <div className="flex-shrink-0 flex flex-col gap-1.5">
                      <div
                        className="flex rounded-md overflow-hidden shadow-sm border"
                        style={{
                          borderColor: '#7c3aed',
                        }}
                      >
                        {/* Left label spanning rows */}
                        <div
                          className="flex-[0_0_35%] min-w-0 px-2 py-2 text-[10px] font-medium flex items-center justify-center text-center leading-snug whitespace-normal"
                          style={{
                            backgroundColor: useAdminAPI ? '#5F5F5F' : '#4b4f5a',
                            color: '#ffffff',
                          }}
                        >
                          <span className="line-clamp-3">
                            {useAdminAPI
                              ? (language === 'vi' ? 'Phí giới thiệu JobShare nhận từ khách hàng' : 'Referral fee (JS receives)')
                              : (language === 'vi'
                                ? 'Phí giới thiệu dự kiến của bạn'
                                : language === 'en'
                                ? 'Estimated referral fee for you'
                                : '想定紹介料（あなた）')}
                          </span>
                        </div>
                        {/* Right: condition + amount. Khi hideCommissionConditionLabel (type 2, value 6/7) chỉ 1 dòng nền đỏ, không có dòng trắng bên dưới */}
                        {job.hideCommissionConditionLabel ? (
                          <div
                            className="flex-1 min-w-0 px-2 sm:px-3 py-2 text-[10px] sm:text-[12px] font-bold flex items-center justify-center text-center leading-snug"
                            style={{
                              backgroundColor: '#DF2020',
                              color: '#ffffff',
                            }}
                          >
                            <span className="break-words" title={job.commissionTiers[0]?.amount || job.commission}>
                              {job.commissionTiers[0]?.amount || job.commission}
                            </span>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 flex flex-col">
                            {job.commissionTiers.map((tier, index) => (
                              <div
                                key={index}
                                className="flex min-h-[36px]"
                                style={{
                                  borderTop: index === 0 ? 'none' : '1px solid #9ca3af',
                                }}
                              >
                                <div
                                  className="w-24 sm:w-28 flex-shrink-0 px-2 py-1.5 text-[10px] sm:text-[11px] font-semibold flex items-center justify-center text-center leading-snug"
                                  style={{
                                    backgroundColor: useAdminAPI
                                      ? (job.isInCampaign ? '#e5f0fb' : '#EB9696')
                                      : '#EB9696',
                                    color: useAdminAPI
                                      ? (job.isInCampaign ? '#0d6bbd' : '#ffffff')
                                      : '#ffffff',
                                  }}
                                >
                                  <span className="break-words line-clamp-2">{tier.label}</span>
                                </div>
                                <div
                                  className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[12px] font-bold flex items-center justify-center text-center leading-snug"
                                  style={{
                                    backgroundColor: '#DF2020',
                                    color: '#ffffff',
                                  }}
                                >
                                  <span className="break-words" title={tier.amount || job.commission}>
                                    {tier.amount || job.commission}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : job.commission ? (
                    <div className="flex-shrink-0 flex flex-col gap-1.5">
                      <div
                        className="flex items-stretch rounded-md overflow-hidden shadow-sm border"
                        style={{ borderColor: '#7c3aed' }}
                      >
                        <div
                          className="flex-[0_0_45%] min-w-0 px-2 py-1 text-[10px] font-medium flex items-center justify-center text-center leading-snug whitespace-normal"
                          style={{
                            backgroundColor: useAdminAPI ? '#5F5F5F' : '#4b4f5a',
                            color: '#ffffff',
                          }}
                        >
                          <span className="line-clamp-2">
                            {useAdminAPI
                              ? (language === 'vi' ? 'Phí giới thiệu JobShare nhận từ khách hàng' : 'Referral fee (JS receives)')
                              : (language === 'vi'
                                ? 'Phí giới thiệu dự kiến của bạn'
                                : language === 'en'
                                ? 'Estimated referral fee for you'
                                : '想定紹介料（あなた）')}
                          </span>
                        </div>
                        <div
                          className="flex-1 min-w-0 px-2 py-1.5 text-[10px] sm:text-[11px] font-bold flex items-center justify-center text-center break-words"
                          style={{
                            backgroundColor: '#DF2020',
                            color: '#ffffff',
                          }}
                          title={job.commission}
                        >
                          {job.commission}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[52px] rounded-md flex-shrink-0" style={{ backgroundColor: '#f9fafb', border: '1px dashed #e5e7eb' }} />
                  )}
                  <div className="border rounded-md p-2 flex-1 min-h-0 overflow-y-auto custom-scrollbar" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                    <div className="text-[10px] font-bold pb-1 border-b mb-1.5" style={{ color: '#374151', borderColor: '#e5e7eb' }}>
                      {language === 'vi' ? 'Thông tin nhanh' : language === 'en' ? 'Quick Info' : 'クイック情報'}
                    </div>
                    <div className="space-y-1.5">
                      {job.salary && (
                        <div className="pb-1.5 border-b" style={{ borderColor: '#e5e7eb' }}>
                          <div className="text-[9px] font-semibold uppercase text-gray-500">{language === 'vi' ? 'Thu nhập/năm' : language === 'en' ? 'Annual' : '年収'}</div>
                          <div className="text-[11px] font-medium break-words line-clamp-2" style={{ color: '#111827' }}>{job.salary}</div>
                        </div>
                      )}
                      {job.ageRange && (
                        <div className="pb-1.5 border-b" style={{ borderColor: '#e5e7eb' }}>
                          <div className="text-[9px] font-semibold uppercase text-gray-500">{language === 'vi' ? 'Tuổi' : language === 'en' ? 'Age' : '年齢'}</div>
                          <div className="text-[11px] font-medium break-words" style={{ color: '#111827' }}>{job.ageRange}</div>
                        </div>
                      )}
                      {job.nationality && (
                        <div className="pb-1.5 border-b" style={{ borderColor: '#e5e7eb' }}>
                          <div className="text-[9px] font-semibold uppercase text-gray-500">{language === 'vi' ? 'Quốc tịch' : language === 'en' ? 'Nationality' : '国籍'}</div>
                          <div className="text-[11px] font-medium break-words" style={{ color: '#111827' }}>{job.nationality}</div>
                        </div>
                      )}
                      {job.gender && (
                        <div className="pb-1.5 border-b" style={{ borderColor: '#e5e7eb' }}>
                          <div className="text-[9px] font-semibold uppercase text-gray-500">{language === 'vi' ? 'Giới tính' : language === 'en' ? 'Gender' : '性別'}</div>
                          <div className="text-[11px] font-medium break-words" style={{ color: '#111827' }}>{job.gender}</div>
                        </div>
                      )}
                      {job.educationLevel && (
                        <div className="pb-1.5 border-b" style={{ borderColor: '#e5e7eb' }}>
                          <div className="text-[9px] font-semibold uppercase text-gray-500">{language === 'vi' ? 'Học vấn' : language === 'en' ? 'Education' : '学歴'}</div>
                          <div className="text-[11px] font-medium break-words line-clamp-2" style={{ color: '#111827' }}>{job.educationLevel}</div>
                        </div>
                      )}
                      {job.location && (
                        <div className="pb-1.5" style={{ borderColor: '#e5e7eb' }}>
                          <div className="text-[9px] font-semibold uppercase text-gray-500">{language === 'vi' ? 'Nơi làm việc' : language === 'en' ? 'Location' : '勤務地'}</div>
                          <div className="text-[11px] font-medium leading-snug whitespace-pre-line break-words line-clamp-2" style={{ color: '#111827' }}>{job.location}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: ngày + nút - gọn, cố định */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 mt-2 border-t flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
                <div className="flex items-center gap-2 text-[11px]" style={{ color: '#6b7280' }}>
                  {job.updatedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />{language === 'vi' ? 'Cập nhật' : language === 'en' ? 'Updated' : '更新'}: {job.updatedAt}
                    </span>
                  )}
                  {job.publishedAt && (
                    <>
                      {job.updatedAt && <span className="text-gray-300">|</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />{language === 'vi' ? 'Xuất bản' : language === 'en' ? 'Published' : '公開'}: {job.publishedAt}
                      </span>
                    </>
                  )}
                  {!job.updatedAt && !job.publishedAt && <span />}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap relative">
                  {useAdminAPI ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/${job.id}`); }}
                        className="flex items-center gap-1 px-2 py-1.5 border rounded-md text-[11px] font-medium transition-colors"
                        style={{ borderColor: '#93c5fd', color: '#2563eb' }}
                      >
                        <Eye className="w-3 h-3" /> Xem
                      </button>
                      {/* Tải JD - giống bên CTV */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDownloadMenuJobId(openDownloadMenuJobId === job.id ? null : job.id);
                          }}
                          onMouseEnter={() => setHoveredDownloadButtonIndex(job.id)}
                          onMouseLeave={() => setHoveredDownloadButtonIndex(null)}
                          className="flex items-center gap-1 px-2 py-1.5 border rounded-md text-[11px] font-medium transition-colors"
                          style={{ borderColor: '#93c5fd', color: '#2563eb', backgroundColor: hoveredDownloadButtonIndex === job.id ? '#eff6ff' : 'transparent' }}
                        >
                          <Download className="w-3 h-3" /><span className="hidden sm:inline">{language === 'vi' ? 'Tải JD' : language === 'en' ? 'Download JD' : 'JDをダウンロード'}</span>
                        </button>
                        {openDownloadMenuJobId === job.id && (
                          <div
                            className="absolute z-20 mt-1 w-40 bg-white border rounded-md shadow-lg text-[11px]"
                            style={{ borderColor: '#e5e7eb' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
                              onClick={() => handleDownloadJD(job, 'jdFile')}
                            >
                              {language === 'vi' ? 'JD tiếng Việt' : language === 'en' ? 'JD Vietnamese' : 'JDベトナム語'}
                            </button>
                            <button
                              className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
                              onClick={() => handleDownloadJD(job, 'jdFileEn')}
                            >
                              {language === 'vi' ? 'JD tiếng Anh' : language === 'en' ? 'JD English' : 'JD英語'}
                            </button>
                            <button
                              className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
                              onClick={() => handleDownloadJD(job, 'jdFileJp')}
                            >
                              {language === 'vi' ? 'JD tiếng Nhật' : language === 'en' ? 'JD Japanese' : 'JD日本語'}
                            </button>
                            <button
                              className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
                              onClick={() => handleDownloadJD(job, 'jdOriginalFile')}
                            >
                              {language === 'vi' ? 'JD gốc' : language === 'en' ? 'JD original' : 'JD原本'}
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/${job.id}/edit`); }}
                        className="flex items-center gap-1 px-2 py-1.5 border rounded-md text-[11px] font-medium transition-colors"
                        style={{ borderColor: '#d1d5db', color: '#374151' }}
                      >
                        <Edit className="w-3 h-3" /> Sửa
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); /* TODO: toggle public/draft */ }}
                        className="flex items-center gap-1 px-2 py-1.5 border rounded-md text-[11px] font-medium transition-colors"
                        style={{ borderColor: job.status === 1 ? '#86efac' : '#fde68a', color: job.status === 1 ? '#166534' : '#92400e' }}
                      >
                        <Globe className="w-3 h-3" /> {job.status === 1 ? 'Public' : 'Draft'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(language === 'vi' ? 'Bạn có chắc muốn xóa job này?' : 'Delete this job?')) {
                            apiService.deleteAdminJob(job.id).then(() => {
                              if (onJobDeleted) onJobDeleted(job.id);
                            }).catch((err) => alert(err?.message || 'Lỗi'));
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1.5 border rounded-md text-[11px] font-medium transition-colors"
                        style={{ borderColor: '#fca5a5', color: '#dc2626' }}
                      >
                        <Trash2 className="w-3 h-3" /> Xóa
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenSaveToList(job.id); }}
                        onMouseEnter={() => setHoveredSaveButtonIndex(job.id)}
                        onMouseLeave={() => setHoveredSaveButtonIndex(null)}
                        className="flex items-center gap-1 px-2 py-1.5 border rounded-md text-[11px] font-medium transition-colors"
                        style={{ borderColor: '#93c5fd', color: '#2563eb', backgroundColor: hoveredSaveButtonIndex === job.id ? '#eff6ff' : 'transparent' }}
                      >
                        <Heart className="w-3 h-3" /><span>{language === 'vi' ? 'Lưu trữ' : 'Save'}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/${job.id}/nominate`); }}
                        onMouseEnter={() => setHoveredSuggestButtonIndex(job.id)}
                        onMouseLeave={() => setHoveredSuggestButtonIndex(null)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors"
                        style={{ backgroundColor: hoveredSuggestButtonIndex === job.id ? '#fde047' : '#facc15', color: '#111827' }}
                      >
                        <UserPlus className="w-3 h-3" /><span className="hidden sm:inline">{language === 'vi' ? 'Đề cử ứng viên' : 'Suggest'}</span>
                      </button>
                    </>
                  ) : (
                  <>
                  {/* Download Button + Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDownloadMenuJobId(openDownloadMenuJobId === job.id ? null : job.id);
                      }}
                      onMouseEnter={() => setHoveredDownloadButtonIndex(job.id)}
                      onMouseLeave={() => setHoveredDownloadButtonIndex(null)}
                      className="flex items-center gap-1 px-2 py-1.5 border rounded-md text-[11px] font-medium transition-colors"
                      style={{ borderColor: '#93c5fd', color: '#2563eb', backgroundColor: hoveredDownloadButtonIndex === job.id ? '#eff6ff' : 'transparent' }}
                    >
                      <Download className="w-3 h-3" /><span className="hidden sm:inline">{language === 'vi' ? 'Tải JD' : language === 'en' ? 'Download JD' : 'JDをダウンロード'}</span>
                    </button>
                    {openDownloadMenuJobId === job.id && (
                      <div
                        className="absolute z-20 mt-1 w-40 bg-white border rounded-md shadow-lg text-[11px]"
                        style={{ borderColor: '#e5e7eb' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
                          onClick={() => handleDownloadJD(job, 'jdFile')}
                        >
                          {language === 'vi' ? 'JD tiếng Việt' : language === 'en' ? 'JD Vietnamese' : 'JDベトナム語'}
                        </button>
                        <button
                          className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
                          onClick={() => handleDownloadJD(job, 'jdFileEn')}
                        >
                          {language === 'vi' ? 'JD tiếng Anh' : language === 'en' ? 'JD English' : 'JD英語'}
                        </button>
                        <button
                          className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
                          onClick={() => handleDownloadJD(job, 'jdFileJp')}
                        >
                          {language === 'vi' ? 'JD tiếng Nhật' : language === 'en' ? 'JD Japanese' : 'JD日本語'}
                        </button>
                        <button
                          className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
                          onClick={() => handleDownloadJD(job, 'jdOriginalFile')}
                        >
                          {language === 'vi' ? 'JD gốc' : language === 'en' ? 'JD original' : 'JD原本'}
                        </button>
                      </div>
                    )}
                  </div>
                  {!useAdminAPI && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenSaveToList(job.id); }}
                    onMouseEnter={() => setHoveredSaveButtonIndex(job.id)}
                    onMouseLeave={() => setHoveredSaveButtonIndex(null)}
                    className="flex items-center gap-1 px-2 py-1.5 border rounded-md text-[11px] font-medium transition-colors"
                    style={{ borderColor: '#93c5fd', color: '#2563eb', backgroundColor: hoveredSaveButtonIndex === job.id ? '#eff6ff' : 'transparent' }}
                  >
                    <Heart className="w-3 h-3" /><span>{language === 'vi' ? 'Lưu' : 'Save'}</span>
                  </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/agent/jobs/${job.id}/nominate`); }}
                    onMouseEnter={() => setHoveredSuggestButtonIndex(job.id)}
                    onMouseLeave={() => setHoveredSuggestButtonIndex(null)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors"
                    style={{ backgroundColor: hoveredSuggestButtonIndex === job.id ? '#fde047' : '#facc15', color: '#111827' }}
                  >
                    <UserPlus className="w-3 h-3" /><span className="hidden sm:inline">{language === 'vi' ? 'Tiến cử ứng viên' : 'Suggest'}</span>
                  </button>
                  </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        
        {/* Footer - Show viewMore button if not pagination and not hidden (e.g. in slide-in panel) */}
        {!hideViewMoreButton && (!showAllJobs || !enablePagination) ? (
          <div className="sticky bottom-4 text-center z-10 mt-4">
            <button 
              onClick={() => navigate(useAdminAPI ? '/admin/jobs' : '/agent/jobs')}
              onMouseEnter={() => setHoveredViewMoreButton(true)}
              onMouseLeave={() => setHoveredViewMoreButton(false)}
              className="px-8 py-4 rounded-lg transition-colors font-semibold text-lg shadow-2xl"
              style={{
                backgroundColor: hoveredViewMoreButton ? '#2563eb' : '#2563eb',
                color: 'white',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {t.viewMore}
            </button>
          </div>
        ) : null}
      </div>
    </div>

    {/* Modal chọn danh sách để lưu job (chỉ CTV) */}
    {showSaveToListModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }} onClick={() => !creatingListInSaveModal && setShowSaveToListModal(false)}>
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'vi' ? 'Lưu công việc vào danh sách' : 'Save job to list'}
            </h3>
            <button type="button" onClick={() => !creatingListInSaveModal && setShowSaveToListModal(false)} className="p-1 rounded hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {saveToListMessage && (
            <p className={`text-sm mb-3 ${saveToListMessage.includes('thất bại') || saveToListMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {saveToListMessage}
            </p>
          )}
          {!showCreateListInSaveModal ? (
            <>
              {loadingSaveToListLists ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : saveToListLists.length === 0 ? (
                <div className="py-4 space-y-3">
                  <p className="text-sm text-gray-600">{language === 'vi' ? 'Chưa có danh sách nào. Tạo danh sách mới để lưu công việc.' : 'No lists yet. Create one to save this job.'}</p>
                  <button
                    type="button"
                    onClick={() => setShowCreateListInSaveModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'vi' ? 'Tạo danh sách mới' : 'Create new list'}
                  </button>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 min-h-0 space-y-2">
                  {saveToListLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => handleAddJobToList(list.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors font-medium text-gray-900"
                    >
                      {list.name}
                    </button>
                  ))}
                </div>
              )}
              {saveToListLists.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCreateListInSaveModal(true)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'vi' ? 'Tạo danh sách mới' : 'Create new list'}
                </button>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">{language === 'vi' ? 'Tên danh sách mới' : 'New list name'}</p>
              <input
                type="text"
                value={newListNameInSaveModal}
                onChange={(e) => setNewListNameInSaveModal(e.target.value)}
                placeholder={language === 'vi' ? 'VD: Việc làm IT yêu thích' : 'e.g. Favourite IT jobs'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={creatingListInSaveModal}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => !creatingListInSaveModal && setShowCreateListInSaveModal(false)}
                  disabled={creatingListInSaveModal}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={!newListNameInSaveModal.trim() || creatingListInSaveModal}
                  onClick={handleCreateListAndAddJob}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {creatingListInSaveModal ? (language === 'vi' ? 'Đang tạo...' : 'Creating...') : (language === 'vi' ? 'Tạo và lưu' : 'Create & save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default AgentJobsPageSession2;

