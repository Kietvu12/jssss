import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Users,
  FileText,
  Award,
  Heart,
  Share2,
  Copy,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Phone,
  Mail,
  Globe,
  Check,
  XCircle,
  AlertCircle,
  Bookmark,
  Settings,
  User,
  UserPlus,
  Plus,
  Download,
  Zap,
  Edit
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import apiService from '../../services/api';
import { getJobApplicationStatus, getJobApplicationStatusLabelByLanguage } from '../../utils/jobApplicationStatus';

const pickByLanguage = (viText, enText, jpText, lang) => {
  if (lang === 'en') return enText || viText || '';
  if (lang === 'ja') return jpText || enText || viText || '';
  return viText || enText || jpText || '';
};

// Nhãn giao diện đa ngôn ngữ (dùng t(key) trong component, language từ useLanguage)
const LABELS = {
  tabGeneral: { vi: 'Thông tin chung', en: 'General', ja: '一般' },
  tabQa: { vi: 'Q&A', en: 'Q&A', ja: 'Q&A' },
  tabRejected: { vi: 'Thông tin tiến cử bị từ chối', en: 'Rejected nominations', ja: '辞退された推薦' },
  tabSuccess: { vi: 'Thông tin tiến cử thành công', en: 'Successful nominations', ja: '成功した推薦' },
  sectionMain: { vi: 'Thông tin chung', en: 'General', ja: '一般' },
  sectionRequirements: { vi: 'Điều kiện ứng tuyển', en: 'Application conditions', ja: '応募条件' },
  sectionBenefits: { vi: 'Chính sách đãi ngộ', en: 'Benefits & policy', ja: '待遇・福利厚生' },
  sectionInterview: { vi: 'Quy trình phỏng vấn', en: 'Interview process', ja: '面接プロセス' },
  sectionCompany: { vi: 'Thông tin công ty', en: 'Company info', ja: '企業情報' },
  labelJobContent: { vi: 'Nội dung công việc:', en: 'Job content:', ja: '仕事内容:' },
  labelSalary: { vi: 'Mức lương:', en: 'Salary:', ja: '給与:' },
  labelAge: { vi: 'Tuổi', en: 'Age', ja: '年齢' },
  labelNationality: { vi: 'Quốc tịch', en: 'Nationality', ja: '国籍' },
  labelEducation: { vi: 'Trình độ học vấn', en: 'Education', ja: '学歴' },
  labelTechSpecs: { vi: 'Thông số kỹ thuật', en: 'Technical specs', ja: '技術スペック' },
  labelRequired: { vi: 'Bắt buộc', en: 'Required', ja: '必須' },
  labelApplicationConditions: { vi: 'Điều kiện ứng dụng:', en: 'Application conditions:', ja: '応募条件:' },
  labelWelcomeConditions: { vi: 'Điều kiện chào mừng', en: 'Welcome conditions', ja: '歓迎条件' },
  labelNgTarget: { vi: 'Mục tiêu NG', en: 'NG target', ja: 'NG対象' },
  labelBenefits: { vi: 'Phúc lợi:', en: 'Benefits:', ja: '福利厚生:' },
  labelWorkingHours: { vi: 'Thời gian làm việc:', en: 'Working hours:', ja: '勤務時間:' },
  labelOvertimeAllowance: { vi: 'Phụ cấp làm thêm:', en: 'Overtime allowance:', ja: '残業手当:' },
  labelSmokingPolicy: { vi: 'Chính sách hút thuốc:', en: 'Smoking policy:', ja: '喫煙ポリシー:' },
  labelSmokingPolicyDetail: { vi: 'Chi tiết chính sách hút thuốc:', en: 'Smoking policy details:', ja: '喫煙ポリシー詳細:' },
  labelRecruitingCompany: { vi: 'Công ty tuyển dụng:', en: 'Recruiting company:', ja: '採用企業:' },
  labelRevenue: { vi: 'Doanh thu:', en: 'Revenue:', ja: '売上:' },
  labelEmployees: { vi: 'Số nhân viên:', en: 'Employees:', ja: '従業員数:' },
  labelHeadquarters: { vi: 'Trụ sở:', en: 'Headquarters:', ja: '本社:' },
  labelEstablished: { vi: 'Thành lập:', en: 'Established:', ja: '設立:' },
  labelServices: { vi: 'Dịch vụ:', en: 'Services:', ja: 'サービス:' },
  labelSectors: { vi: 'Lĩnh vực:', en: 'Sectors:', ja: '分野:' },
  labelYearsExpIndustry: { vi: 'Số năm kinh nghiệm (ngành):', en: 'Years of experience (industry):', ja: '経験年数（業界）:' },
  labelYearsExpJob: { vi: 'Số năm kinh nghiệm (loại công việc):', en: 'Years of experience (job type):', ja: '経験年数（職種）:' },
  labelOtherExp: { vi: 'Kinh nghiệm khác:', en: 'Other experience:', ja: 'その他経験:' },
  noIndustryExp: { vi: 'Không cho phép kinh nghiệm trong ngành', en: 'No industry experience allowed', ja: '業界経験不可' },
  noExpOk: { vi: 'Không có kinh nghiệm trong bất kỳ loại công việc OK', en: 'No experience in any job type OK', ja: '職種不問・未経験OK' },
  noExpAny: { vi: 'Không có (hoàn toàn thiếu kinh nghiệm OK)', en: 'None (no experience OK)', ja: 'なし（未経験OK）' },
  btnEdit: { vi: 'Chỉnh sửa', en: 'Edit', ja: '編集' },
  btnSuggestCandidate: { vi: 'Đề xuất ứng viên', en: 'Suggest candidate', ja: '候補者を推薦' },
  btnCopyUrl: { vi: 'Sao chép URL', en: 'Copy URL', ja: 'URLをコピー' },
  btnDownloadJd: { vi: 'Tải JD', en: 'Download JD', ja: 'JDをダウンロード' },
  jdVietnamese: { vi: 'JD tiếng Việt', en: 'JD Vietnamese', ja: 'JDベトナム語' },
  jdEnglish: { vi: 'JD tiếng Anh', en: 'JD English', ja: 'JD英語' },
  jdJapanese: { vi: 'JD tiếng Nhật', en: 'JD Japanese', ja: 'JD日本語' },
  h2Rejected: { vi: 'Thông tin tiến cử bị từ chối', en: 'Rejected nominations', ja: '辞退された推薦' },
  h2Success: { vi: 'Thông tin tiến cử thành công', en: 'Successful nominations', ja: '成功した推薦' },
  pRejected: { vi: 'Các đơn tiến cử vào công việc này (theo cá nhân Admin/CTV đăng nhập) có trạng thái từ chối/trượt và lý do.', en: 'Nominations for this job (for the logged-in Admin/CTV) with rejected/failed status and reason.', ja: 'この仕事への推薦（ログイン中のAdmin/CTV）で辞退・不合格の状態と理由。' },
  pSuccess: { vi: 'Các đơn tiến cử vào công việc này (theo cá nhân Admin/CTV đăng nhập) đã trúng tuyển / vào công ty / đã thanh toán.', en: 'Nominations for this job that have been accepted / joined company / paid.', ja: 'この仕事への推薦で合格・入社・支払い済み。' },
  thCandidate: { vi: 'Ứng viên / Mã CV', en: 'Candidate / CV code', ja: '候補者/CVコード' },
  thStatus: { vi: 'Trạng thái', en: 'Status', ja: '状態' },
  thRejectReason: { vi: 'Lý do từ chối', en: 'Reject reason', ja: '辞退理由' },
  thNominationDate: { vi: 'Ngày tiến cử', en: 'Nomination date', ja: '推薦日' },
  noRejected: { vi: 'Chưa có đơn tiến cử nào bị từ chối.', en: 'No rejected nominations yet.', ja: '辞退された推薦はまだありません。' },
  noSuccess: { vi: 'Chưa có đơn tiến cử thành công.', en: 'No successful nominations yet.', ja: '成功した推薦はまだありません。' },
  faqTitle: { vi: 'Câu hỏi thường gặp', en: 'FAQ', ja: 'よくある質問' },
  faqMock: { vi: 'Dữ liệu mẫu (mock). Sẽ kết nối dữ liệu thật sau.', en: 'Sample data (mock). Will connect real data later.', ja: 'サンプルデータ。後で実データに接続します。' },
  recruitmentType1: { vi: 'Nhân viên chính thức', en: 'Permanent employee', ja: '正社員' },
  recruitmentType2: { vi: 'Nhân viên chính thức (công ty haken; hợp đồng vô thời hạn)', en: 'Permanent (haken; indefinite contract)', ja: '正社員（派遣元；無期契約）' },
  recruitmentType3: { vi: 'Nhân viên haken (hợp đồng có thời hạn)', en: 'Temporary staff (fixed-term contract)', ja: '派遣社員（有期契約）' },
  recruitmentType4: { vi: 'Nhân viên hợp đồng', en: 'Contract employee', ja: '契約社員' },
  interviewLoc1: { vi: 'Việt Nam', en: 'Vietnam', ja: 'ベトナム' },
  interviewLoc2: { vi: 'Nhật Bản', en: 'Japan', ja: '日本' },
  interviewLoc3: { vi: 'Việt Nam & Nhật Bản', en: 'Vietnam & Japan', ja: 'ベトナム・日本' },
  unknown: { vi: 'Không xác định', en: 'Unknown', ja: '不明' },
  tagDirectApply: { vi: 'Ứng tuyển trực tiếp', en: 'Direct apply', ja: '直接応募' },
  tagFulltime: { vi: 'Nhân viên toàn thời gian (hợp đồng lâu dài)', en: 'Full-time (long-term contract)', ja: '正社員（長期契約）' },
  jobFeatureWeekendOff: { vi: 'Đóng cửa vào cuối tuần và ngày lễ', en: 'Closed on weekends and holidays', ja: '週末・祝日休み' },
  jobFeatureMaternityLeave: { vi: 'Có chế độ nghỉ thai sản/cha con', en: 'Maternity/paternity leave', ja: '産休・育休制度あり' },
  jobFeatureScoutOk: { vi: 'Scout OK (công bố tên công ty OK)', en: 'Scout OK (company name disclosure OK)', ja: 'スカウトOK（会社名公表OK）' },
  jobFeatureNoExpOk: { vi: 'Không có kinh nghiệm trong bất kỳ loại công việc OK', en: 'No experience in any job type OK', ja: '職種不問・未経験OK' },
  jobFeatureNoIndustryExpOk: { vi: 'Không cho phép kinh nghiệm trong ngành', en: 'No industry experience allowed', ja: '業界経験不可' },
  jobFeatureMediaOk: { vi: 'Media publication OK (công bố tên công ty OK)', en: 'Media publication OK', ja: 'メディア掲載OK' },
  jobFeatureCompletelyNoExpOk: { vi: 'Hoàn toàn thiếu kinh nghiệm OK', en: 'No experience OK', ja: '未経験OK' },
  quickInfoTitle: { vi: 'Thông tin nhanh', en: 'Quick info', ja: 'クイック情報' },
  labelAnnualIncome: { vi: 'Thu nhập năm:', en: 'Annual income:', ja: '年収:' },
  labelCategory: { vi: 'Danh mục:', en: 'Category:', ja: '分類:' },
  labelGender: { vi: 'Giới tính:', en: 'Gender:', ja: '性別:' },
  labelLocation: { vi: 'Nơi làm việc:', en: 'Location:', ja: '勤務地:' },
  saveToList: { vi: 'Lưu danh sách', en: 'Save to list', ja: 'リストに保存' },
  saveToListTitle: { vi: 'Lưu công việc vào danh sách', en: 'Save job to list', ja: '仕事をリストに保存' },
  noListsYet: { vi: 'Chưa có danh sách nào. Tạo danh sách mới để lưu công việc.', en: 'No lists yet. Create one to save this job.', ja: 'リストがまだありません。この仕事を保存するリストを作成してください。' },
  createNewList: { vi: 'Tạo danh sách mới', en: 'Create new list', ja: '新規リスト作成' },
  newListName: { vi: 'Tên danh sách mới', en: 'New list name', ja: '新規リスト名' },
  newListNamePlaceholder: { vi: 'VD: Việc làm IT yêu thích', en: 'e.g. Favourite IT jobs', ja: '例：お気に入りIT仕事' },
  cancel: { vi: 'Hủy', en: 'Cancel', ja: 'キャンセル' },
  creating: { vi: 'Đang tạo...', en: 'Creating...', ja: '作成中...' },
  createAndSave: { vi: 'Tạo và lưu', en: 'Create & save', ja: '作成して保存' },
  btnBack: { vi: 'Quay lại', en: 'Back', ja: '戻る' },
  labelJobId: { vi: 'ID công việc:', en: 'Job ID:', ja: '求人ID:' },
  labelJobCategory: { vi: 'Phân loại công việc:', en: 'Job category:', ja: '求人分類:' },
  labelRecruitingCompanies: { vi: 'Các công ty tuyển dụng:', en: 'Recruiting companies:', ja: '採用企業:' },
  backToJobList: { vi: 'Quay lại danh sách việc làm', en: 'Back to job list', ja: '求人一覧に戻る' },
};

// Helper function to strip HTML tags and format text
const stripHtml = (html) => {
  if (!html) return '';
  if (!html.includes('<')) return html;
  
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    
    // Convert <br> to newlines
    const breaks = tmp.querySelectorAll('br');
    breaks.forEach(br => br.replaceWith('\n'));
    
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
    
    // Convert <ul><li> and <ol><li> to bullet points
    const lists = tmp.querySelectorAll('ul, ol');
    lists.forEach(list => {
      const items = list.querySelectorAll('li');
      const bulletPoints = Array.from(items)
        .map(li => li.textContent.trim())
        .filter(Boolean)
        .map(text => `• ${text}`)
        .join('\n');
      
      if (bulletPoints) {
        const textNode = document.createTextNode(`\n${bulletPoints}\n`);
        if (list.parentNode) {
          list.parentNode.replaceChild(textNode, list);
        }
      } else {
        list.remove();
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
    // Fallback: simple regex to remove HTML tags
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
};

/**
 * Chi tiết việc làm dùng chung cho Agent, Admin, Admin Group.
 * @param {Function} getJobApi - Hàm load job (vd: apiService.getJobById hoặc apiService.getAdminJobById)
 * @param {string} backPath - Đường quay lại danh sách (vd: '/agent/jobs', '/admin/jobs', '/admin/group-jobs')
 * @param {boolean} showEditButton - Chỉ SuperAdmin/AdminBackOffice mới true
 * @param {string} [editPath] - Đường sửa job (vd: '/admin/jobs/:id/edit')
 */
const JobDetailPage = ({ getJobApi, backPath = '/agent/jobs', showEditButton = false, editPath }) => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => (LABELS[key] && (LABELS[key][language] ?? LABELS[key].vi)) ?? key;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    requirements: true,
    location: true,
    benefits: true,
    interview: true,
    company: true,
  });

  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredEditButton, setHoveredEditButton] = useState(false);
  const [hoveredCollapsibleCard, setHoveredCollapsibleCard] = useState({});
  const [hoveredSuggestButton, setHoveredSuggestButton] = useState(false);
  const [hoveredCopyButton, setHoveredCopyButton] = useState(false);
  const [hoveredDownloadButton, setHoveredDownloadButton] = useState(false);
  const [hoveredSaveButton, setHoveredSaveButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [showSaveToListModal, setShowSaveToListModal] = useState(false);
  const [saveToListLists, setSaveToListLists] = useState([]);
  const [loadingSaveToListLists, setLoadingSaveToListLists] = useState(false);
  const [saveToListMessage, setSaveToListMessage] = useState(null);
  const [showCreateListInSaveModal, setShowCreateListInSaveModal] = useState(false);
  const [newListNameInSaveModal, setNewListNameInSaveModal] = useState('');
  const [creatingListInSaveModal, setCreatingListInSaveModal] = useState(false);
  const [openDownloadMenu, setOpenDownloadMenu] = useState(false);

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'qa' | 'rejected' | 'success'
  const [jobApplications, setJobApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const useAdminAPI = backPath?.startsWith('/admin');

  const REJECTED_STATUSES = [1, 4, 6, 10, 13, 16];
  const SUCCESS_STATUSES = [12, 14, 15];
  const MOCK_QA = [
    { q: 'Công ty có hỗ trợ visa cho ứng viên nước ngoài không?', a: 'Có, công ty hỗ trợ tư vấn và thủ tục visa cho ứng viên đủ điều kiện.' },
    { q: 'Thời gian thử việc là bao lâu?', a: 'Thời gian thử việc thường từ 3–6 tháng tùy vị trí, được ghi rõ trong thông tin tuyển dụng.' },
    { q: 'Có thể làm việc từ xa một phần không?', a: 'Tùy từng vị trí và phòng ban, một số vị trí có chế độ remote. Chi tiết xem tại mô tả công việc.' },
  ];

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  useEffect(() => {
    if (!jobId || !job) return;
    let cancelled = false;
    setLoadingApplications(true);
    const fetchApi = useAdminAPI ? apiService.getAdminJobApplications : apiService.getJobApplications;
    fetchApi({ jobId: Number(jobId), limit: 200 })
      .then((res) => {
        if (!cancelled) setJobApplications(res?.data?.jobApplications ?? []);
      })
      .catch(() => { if (!cancelled) setJobApplications([]); })
      .finally(() => { if (!cancelled) setLoadingApplications(false); });
    return () => { cancelled = true; };
  }, [jobId, job, useAdminAPI]);

  useEffect(() => {
    if (!showSaveToListModal) return;
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
  }, [showSaveToListModal]);

  const loadJobDetail = async () => {
    if (!getJobApi) return;
    try {
      setLoading(true);
      setError(null);
      const response = await getJobApi(jobId);
      if (response.success && response.data?.job) {
        setJob(response.data.job);
        setIsFavorite(response.data.job.isFavorite || false);
      } else {
        setError('Không tìm thấy thông tin việc làm');
      }
    } catch (err) {
      console.error('Error loading job detail:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải thông tin việc làm');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleOpenSaveToList = () => {
    setShowSaveToListModal(true);
    setShowCreateListInSaveModal(false);
    setNewListNameInSaveModal('');
    setSaveToListMessage(null);
  };

  const handleAddJobToList = async (listId) => {
    if (!jobId) return;
    setSaveToListMessage(null);
    try {
      await apiService.addJobToSavedList(listId, { jobId });
      setSaveToListMessage(language === 'vi' ? 'Đã thêm vào danh sách.' : 'Added to list.');
      setIsFavorite(true);
      setTimeout(() => { setShowSaveToListModal(false); }, 800);
    } catch (e) {
      setSaveToListMessage(e?.message || (language === 'vi' ? 'Thêm thất bại.' : 'Failed.'));
    }
  };

  const handleCreateListAndAddJob = async () => {
    const name = newListNameInSaveModal.trim();
    if (!name || creatingListInSaveModal || !jobId) return;
    setCreatingListInSaveModal(true);
    setSaveToListMessage(null);
    try {
      const createRes = await apiService.createSavedList({ name });
      if (!createRes.success || !createRes.data?.id) throw new Error('Create failed');
      await apiService.addJobToSavedList(createRes.data.id, { jobId });
      setSaveToListMessage(language === 'vi' ? 'Đã tạo danh sách và thêm công việc.' : 'List created and job added.');
      setIsFavorite(true);
      setShowCreateListInSaveModal(false);
      setNewListNameInSaveModal('');
      setSaveToListLists((prev) => [...prev, createRes.data]);
      setTimeout(() => { setShowSaveToListModal(false); }, 800);
    } catch (e) {
      setSaveToListMessage(e?.message || (language === 'vi' ? 'Tạo danh sách thất bại.' : 'Failed.'));
    } finally {
      setCreatingListInSaveModal(false);
    }
  };

  const handleDownloadJD = async (fileType = 'jdFile') => {
    const id = job?.id || jobId;
    if (!id) return;
    try {
      const getUrl = useAdminAPI ? apiService.getAdminJobFileUrl : apiService.getCtvJobFileUrl;
      const url = await getUrl(id, fileType, 'download');
      if (url) window.open(url, '_blank');
      else alert(language === 'vi' ? 'Công việc này chưa có file JD.' : 'No JD file.');
    } catch (e) {
      alert(e?.message || (language === 'vi' ? 'Không tải được JD.' : 'Failed to download JD.'));
    }
  };

  const basePath = backPath.replace(/\/$/, '');
  const handleApply = () => {
    navigate(`${basePath}/${jobId}/nominate`);
  };
  const handleEdit = () => {
    const path = editPath ? editPath.replace(':id', jobId) : `${basePath}/${jobId}/edit`;
    navigate(path);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Collapsible Card Component
  const CollapsibleCard = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    children, 
    defaultExpanded = true,
    className = ''
  }) => {
    const isExpanded = expandedSections[sectionKey] ?? defaultExpanded;
    const isHovered = hoveredCollapsibleCard[sectionKey] || false;
    
    return (
      <div className={`rounded-xl transition-shadow ${className}`} style={{ backgroundColor: 'white', borderColor: '#e5e7eb', borderWidth: '1px', borderStyle: 'solid', boxShadow: isHovered ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} onMouseEnter={() => setHoveredCollapsibleCard(prev => ({ ...prev, [sectionKey]: true }))} onMouseLeave={() => setHoveredCollapsibleCard(prev => ({ ...prev, [sectionKey]: false }))}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-5 sm:p-6 transition-colors rounded-t-xl"
          style={{
            backgroundColor: isHovered ? '#f9fafb' : 'transparent'
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#2563eb' }} />}
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-left" style={{ color: '#111827' }}>
              {title}
            </h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform" style={{ color: '#6b7280' }} />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform" style={{ color: '#6b7280' }} />
          )}
        </button>
        {isExpanded && (
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4 border-t" style={{ borderColor: '#f3f4f6' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'white' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
          <p style={{ color: '#4b5563' }}>Đang tải thông tin việc làm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'white' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: '#ef4444' }}>{error}</p>
          <button
            onClick={() => navigate(backPath)}
            onMouseEnter={() => setHoveredBackToListButton(true)}
            onMouseLeave={() => setHoveredBackToListButton(false)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            {t('backToJobList')}
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  // Format data - dùng trường *_en, *_jp theo ngôn ngữ (fallback vi)
  const pick = (vi, en, jp) => pickByLanguage(vi, en, jp, language);

  const techniqueRequirements = (job.requirements || [])
    .filter(req => req.type === 'technique')
    .map(req => ({
      content: stripHtml(pick(req.content, req.contentEn || req.content_en, req.contentJp || req.content_jp) || ''),
      status: req.status
    }));

  const educationRequirements = (job.requirements || [])
    .filter(req => req.type === 'education')
    .map(req => ({
      content: stripHtml(pick(req.content, req.contentEn || req.content_en, req.contentJp || req.content_jp) || ''),
      status: req.status
    }));

  const workingLocations = (job.workingLocationDetails || [])
    .map(detail => {
      const content = pick(detail.content, detail.contentEn || detail.content_en, detail.contentJp || detail.content_jp);
      if (!content) return null;
      const stripped = stripHtml(content);
      return stripped.split('\n').map(loc => loc.trim()).filter(Boolean);
    })
    .filter(Boolean)
    .flat();
  const workingLocationsFromTable = (job.workingLocations || []).map(loc => {
    const locText = pick(loc.location, loc.locationEn || loc.location_en, loc.locationJp || loc.location_jp);
    const countryText = pick(loc.country, loc.countryEn || loc.country_en, loc.countryJp || loc.country_jp);
    return [locText, countryText].filter(Boolean).join(' - ');
  }).filter(Boolean);
  const allWorkingLocations = workingLocations.length ? workingLocations : workingLocationsFromTable;

  const salaryRanges = (job.salaryRangeDetails || [])
    .map(detail => stripHtml(pick(detail.content, detail.contentEn || detail.content_en, detail.contentJp || detail.content_jp) || ''))
    .filter(Boolean);
  if (salaryRanges.length === 0 && (job.salaryRanges || []).length > 0) {
    job.salaryRanges.forEach(sr => {
      const text = pick(sr.salaryRange, sr.salaryRangeEn || sr.salary_range_en, sr.salaryRangeJp || sr.salary_range_jp);
      if (text) salaryRanges.push(text);
    });
  }

  const overtimeAllowances = (job.overtimeAllowanceDetails || [])
    .map(detail => stripHtml(pick(detail.content, detail.contentEn || detail.content_en, detail.contentJp || detail.content_jp) || ''))
    .filter(Boolean);
  if (overtimeAllowances.length === 0 && (job.overtimeAllowances || []).length > 0) {
    job.overtimeAllowances.forEach(oa => {
      const text = pick(oa.overtimeAllowanceRange, oa.overtimeAllowanceRangeEn || oa.overtime_allowance_range_en, oa.overtimeAllowanceRangeJp || oa.overtime_allowance_range_jp);
      if (text) overtimeAllowances.push(text);
    });
  }

  const smokingPolicyDetails = (job.smokingPolicyDetails || [])
    .map(detail => stripHtml(pick(detail.content, detail.contentEn || detail.content_en, detail.contentJp || detail.content_jp) || ''))
    .filter(Boolean);

  const workingHours = (job.workingHourDetails || [])
    .map(detail => stripHtml(pick(detail.content, detail.contentEn || detail.content_en, detail.contentJp || detail.content_jp) || ''))
    .filter(Boolean);
  if (workingHours.length === 0 && (job.workingHours || []).length > 0) {
    job.workingHours.forEach(wh => {
      const text = pick(wh.workingHours, wh.workingHoursEn || wh.working_hours_en, wh.workingHoursJp || wh.working_hours_jp);
      if (text) workingHours.push(text);
    });
  }

  const businessFields = (job.company?.businessFields || [])
    .map(field => stripHtml(pick(field.content, field.contentEn || field.content_en, field.contentJp || field.content_jp) || ''))
    .filter(Boolean);

  const offices = job.company?.offices || [];

  const getRecruitmentTypeText = (type) => {
    const key = type === 1 ? 'recruitmentType1' : type === 2 ? 'recruitmentType2' : type === 3 ? 'recruitmentType3' : type === 4 ? 'recruitmentType4' : 'unknown';
    return t(key);
  };

  const getInterviewLocationText = (loc) => {
    const key = loc === 1 ? 'interviewLoc1' : loc === 2 ? 'interviewLoc2' : loc === 3 ? 'interviewLoc3' : 'unknown';
    return t(key);
  };

  const benefits = (job.benefits || [])
    .map(benefit => stripHtml(pick(benefit.content, benefit.contentEn || benefit.content_en, benefit.contentJp || benefit.content_jp) || ''))
    .filter(Boolean);

  const smokingLabels = { vi: { allow: 'Cho phép hút thuốc', deny: 'Không cho phép hút thuốc' }, en: { allow: 'Smoking allowed', deny: 'Smoking not allowed' }, ja: { allow: '喫煙可', deny: '喫煙不可' } };
  const smokingPolicies = (job.smokingPolicies || [])
    .map(policy => (language === 'en' ? smokingLabels.en : language === 'ja' ? smokingLabels.ja : smokingLabels.vi)[policy.allow ? 'allow' : 'deny']);

  // Get job tags
  const jobTags = [];
  if (job.isHot) {
    jobTags.push({ label: 'JobShare Selection', color: 'green' });
  }
  const isInCampaign = job.jobCampaigns && job.jobCampaigns.length > 0;
  if (isInCampaign) {
    jobTags.push({ label: 'Campaign', color: 'blue' });
  } else if (job.isPinned) {
    jobTags.push({ label: t('tagDirectApply'), color: 'orange' });
  }
  if (job.recruitmentType === 1) {
    jobTags.push({ label: t('tagFulltime'), color: 'blue' });
  }

  const applicationConditions = (job.requirements || [])
    .filter(req => req.type === 'application')
    .map(req => stripHtml(pick(req.content, req.contentEn || req.content_en, req.contentJp || req.content_jp) || ''));

  const disqualifications = (job.disqualifications || [])
    .map(item => stripHtml(pick(item.content, item.contentEn || item.content_en, item.contentJp || item.content_jp) || item.name || ''))
    .filter(Boolean);

  const welcomeConditions = (job.welcomeConditions || [])
    .map(item => stripHtml(pick(item.content, item.contentEn || item.content_en, item.contentJp || item.content_jp) || item.name || ''))
    .filter(Boolean);

  const jobFeatures = [];
  if (job.weekendOff) jobFeatures.push(t('jobFeatureWeekendOff'));
  if (job.maternityLeave) jobFeatures.push(t('jobFeatureMaternityLeave'));
  if (job.scoutOk) jobFeatures.push(t('jobFeatureScoutOk'));
  if (job.noExpOk) jobFeatures.push(t('jobFeatureNoExpOk'));
  if (job.noIndustryExpOk) jobFeatures.push(t('jobFeatureNoIndustryExpOk'));
  if (job.mediaOk) jobFeatures.push(t('jobFeatureMediaOk'));
  if (job.completelyNoExpOk) jobFeatures.push(t('jobFeatureCompletelyNoExpOk'));

  // Calculate commission for main card
  const getCommissionText = () => {
    if (job.jobValues && job.jobValues.length > 0) {
      const firstJobValue = job.jobValues[0];
      const value = firstJobValue.value;
      if (value !== null && value !== undefined) {
        if (job.jobCommissionType === 'percent') {
          return `${parseFloat(value).toLocaleString('vi-VN')}%`;
        } else {
          return `${parseFloat(value).toLocaleString('vi-VN')} triệu`;
        }
      }
    }
    return 'Liên hệ';
  };

  // Điều kiện phí: tính commissionTiers + commissionText giống AgentJobsPageSession2 (rankMultiplier = 1)
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

  const allJobValuesForCommission = job.jobValues || job.profits || [];
  const commissionTypeIds = [1, 2, 3, 4];
  const jobValuesForCommission = allJobValuesForCommission.filter(jv => {
    const tid = jv.typeId ?? jv.id_typename ?? jv.type?.id;
    const tname = (jv.type?.typename || '').toLowerCase();
    if (tid === 2 || tid === '2' || tname === 'phí' || tname === 'commission') return true;
    if (commissionTypeIds.includes(Number(tid))) return true;
    if (jv.type?.cvField && (jv.value !== null && jv.value !== undefined && jv.value !== '')) return true;
    return false;
  });

  // Giống trang danh sách: ẩn nhãn điều kiện phí khi job_type = 2 và value 6/7
  const hideCommissionConditionLabel = jobValuesForCommission.some(jv => {
    const tid = Number(jv.typeId ?? jv.type?.id ?? 0);
    const valueId = jv.valueId ?? jv.valueRef?.id;
    const val = jv.value;
    const numVal = val !== null && val !== undefined && val !== '' ? Number(val) : null;
    return tid === 2 && (Number(valueId) === 6 || Number(valueId) === 7 || numVal === 6 || numVal === 7);
  });

  let detailCommissionText = 'Liên hệ';
  let detailCommissionTiers = [];
  const rankMultiplier = 1;
  const jobCampaigns = job.jobCampaigns || [];
  const hasCampaignPercent = jobCampaigns.length > 0 && jobCampaigns[0]?.campaign?.percent != null;
  const campaignPercent = hasCampaignPercent ? Number(jobCampaigns[0].campaign.percent) : null;
  const isJPY = job.interviewLocation === 2;
  const currencyUnit = isJPY ? 'JPY' : 'VND';

  const formatAmountWithCurrency = (amount) => {
    const n = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    const opts = n >= 1 && n === Math.floor(n) ? { maximumFractionDigits: 0 } : { minimumFractionDigits: n < 1 ? 2 : 1, maximumFractionDigits: 2 };
    const formatted = n.toLocaleString('vi-VN', opts);
    return isJPY ? `${formatted} ${currencyUnit}` : `${formatted} triệu ${currencyUnit}`;
  };
  const formatCommissionForDisplay = (amount) => {
    if (amount >= 1000) return isJPY ? Math.round(amount).toLocaleString('vi-VN') : (amount / 1000000).toFixed(1).replace(/\.?0+$/, '');
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

  const apiSalaryRanges = job.salaryRanges || [];
  const yearSalaryRange = apiSalaryRanges.find(sr => {
    const t = (sr.type || '').toLowerCase();
    return t === 'year' || t === 'năm';
  });
  let rawRange = yearSalaryRange?.salaryRange ?? yearSalaryRange?.salary_range ?? '';
  if (!rawRange && apiSalaryRanges.length > 0) {
    for (const sr of apiSalaryRanges) {
      const r = sr.salaryRange ?? sr.salary_range ?? '';
      if (r && /[\d.,]+\s*[-–—]\s*[\d.,]+/.test(r)) { rawRange = r; break; }
    }
  }
  if (!rawRange && (job.salaryRangeDetails || []).length > 0) {
    const sources = (job.salaryRangeDetails || []).map(d => (d.content || '').replace(/<[^>]*>/g, ' ')).filter(Boolean);
    for (const str of sources) {
      const m = String(str).match(/([\d.,]+)\s*[-–—]\s*([\d.,]+)/);
      if (m) { rawRange = `${m[1]} - ${m[2]}`; break; }
    }
  }
  const salaryRangeData = rawRange ? parseSalaryRangeRaw(rawRange) : null;

  if (job.computedCampaignCommission) {
    const { min, max } = job.computedCampaignCommission;
    const ctvMin = min * rankMultiplier;
    const ctvMax = max * rankMultiplier;
    detailCommissionText = formatRangeWithCurrency(ctvMin, ctvMax, formatCommissionForDisplay);
    detailCommissionTiers = [{ label: 'Campaign', amount: detailCommissionText }];
  } else if (hasCampaignPercent && campaignPercent > 0 && salaryRangeData) {
    const platformCommissionMin = salaryRangeData.min * (campaignPercent / 100);
    const platformCommissionMax = salaryRangeData.max * (campaignPercent / 100);
    const ctvMinAmount = platformCommissionMin * rankMultiplier;
    const ctvMaxAmount = platformCommissionMax * rankMultiplier;
    detailCommissionText = formatRangeWithCurrency(ctvMinAmount, ctvMaxAmount, formatCommissionForDisplay);
    detailCommissionTiers = [{ label: 'Campaign', amount: detailCommissionText }];
  } else if (jobValuesForCommission.length > 0) {
    const firstJv = jobValuesForCommission[0];
    const commissionType = job.jobCommissionType || 'fixed';
    const value = firstJv.value;
    const valueId = firstJv.valueId ?? firstJv.valueRef?.id;
    const effectivePercent = (commissionType === 'percent' && hasCampaignPercent) ? campaignPercent : (parseFloat(value) || 0);

    if (valueId === 6 && value !== null && value !== undefined) {
      if (commissionType === 'fixed') {
        const fixedAmount = parseFloat(value) || 0;
        if (fixedAmount > 0) {
          detailCommissionText = formatAmountWithCurrency(fixedAmount * rankMultiplier);
        }
      } else if (commissionType === 'percent' && salaryRangeData) {
        const platformCommissionMin = salaryRangeData.min * (effectivePercent / 100);
        const platformCommissionMax = salaryRangeData.max * (effectivePercent / 100);
        detailCommissionText = formatRangeWithCurrency(platformCommissionMin * rankMultiplier, platformCommissionMax * rankMultiplier, formatCommissionForDisplay);
      } else {
        detailCommissionText = `${effectivePercent}%`;
      }
    } else {
      if (salaryRangeData && commissionType === 'percent' && (value !== null && value !== undefined)) {
        const platformCommissionMin = salaryRangeData.min * (effectivePercent / 100);
        const platformCommissionMax = salaryRangeData.max * (effectivePercent / 100);
        detailCommissionText = formatRangeWithCurrency(platformCommissionMin * rankMultiplier, platformCommissionMax * rankMultiplier, formatCommissionForDisplay);
      } else if (commissionType === 'fixed' && value !== null && value !== undefined) {
        const amount = parseFloat(value) || 0;
        if (amount > 0) detailCommissionText = formatAmountWithCurrency(amount * rankMultiplier);
      } else if (commissionType === 'percent') {
        detailCommissionText = `${effectivePercent}%`;
      }
    }

    // Đồng bộ với trang danh sách: khi hideCommissionConditionLabel chỉ hiển thị một dòng số tiền
    if (hideCommissionConditionLabel) {
      detailCommissionTiers = [{ label: '', amount: detailCommissionText }];
    } else {
      detailCommissionTiers = jobValuesForCommission.map((jv) => {
        const tierCommissionType = job.jobCommissionType || 'fixed';
        const rawValue = jv.value;
        let amountText = '';
        if (rawValue !== null && rawValue !== undefined && rawValue !== '') {
          if (tierCommissionType === 'percent') {
            const tierPercent = parseFloat(rawValue) || 0;
            const effectivePct = campaignPercent != null ? campaignPercent : tierPercent;
            if (salaryRangeData && effectivePct > 0) {
              const pMin = salaryRangeData.min * (effectivePct / 100) * rankMultiplier;
              const pMax = salaryRangeData.max * (effectivePct / 100) * rankMultiplier;
              amountText = formatRangeWithCurrency(pMin, pMax, formatCommissionForDisplay);
            } else {
              amountText = `${tierPercent.toLocaleString('vi-VN')}%`;
            }
          } else {
            const amt = parseFloat(rawValue) || 0;
            amountText = amt > 0 ? formatAmountWithCurrency(amt * rankMultiplier) : '';
          }
        }
        const valueRef = jv.valueRef || {};
        const conditionLabel = pick(valueRef.valuename, valueRef.valuenameEn || valueRef.valuename_en, valueRef.valuenameJp || valueRef.valuename_jp) || (language === 'vi' ? 'Phí' : 'Fee');
        return (conditionLabel || amountText) ? { label: conditionLabel, amount: amountText || detailCommissionText } : null;
      }).filter(Boolean);
      if (detailCommissionTiers.length === 0 && detailCommissionText !== 'Liên hệ') {
        detailCommissionTiers = [{ label: language === 'vi' ? 'Phí' : 'Fee', amount: detailCommissionText }];
      }
    }
  }

  // Helper function to get tag color style
  const getTagColorStyle = (color) => {
    const colors = {
      green: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' },
      orange: { backgroundColor: '#fed7aa', color: '#9a3412', borderColor: '#fdba74' },
      blue: { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' },
    };
    return colors[color] || colors.green;
  };

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

  const displayTitle = pick(job.title, job.titleEn || job.title_en, job.titleJp || job.title_jp) || job.title;
  const displayCategoryName = (job.category && pick(job.category.name, job.category.nameEn || job.category.name_en, job.category.nameJp || job.category.name_jp)) || job.category?.name || '';
  const rc = job.recruitingCompany;
  const displayCompanyName = (rc && (pick(rc.companyName, rc.companyNameEn || rc.company_name_en, rc.companyNameJp || rc.company_name_jp) || rc.companyName)) ?? '';
  const displayCompanyRevenue = rc && pick(rc.revenue, rc.revenueEn || rc.revenue_en, rc.revenueJp || rc.revenue_jp);
  const displayCompanyEmployees = rc && pick(rc.numberOfEmployees, rc.numberOfEmployeesEn || rc.number_of_employees_en, rc.numberOfEmployeesJp || rc.number_of_employees_jp);
  const displayCompanyHeadquarters = rc && pick(rc.headquarters, rc.headquartersEn || rc.headquarters_en, rc.headquartersJp || rc.headquarters_jp);
  const displayCompanyEstablished = rc && pick(rc.establishedDate, rc.establishedDateEn || rc.established_date_en, rc.establishedDateJp || rc.established_date_jp);
  const displayCompanyIntroduction = rc && pick(rc.companyIntroduction, rc.companyIntroductionEn || rc.company_introduction_en, rc.companyIntroductionJp || rc.company_introduction_jp);
  const displayDescription = stripHtml(pick(job.description, job.descriptionEn || job.description_en, job.descriptionJp || job.description_jp) || '');
  const displaySalaryRanges = salaryRanges;
  const displayAgeRange = job.ageRange ?? '';
  const displayNationality = job.nationality ?? '';
  const displayEducationLevel = job.educationLevel ?? '';
  const displayWorkingLocations = allWorkingLocations;
  const displayGender = job.gender ?? '';
  const displayApplicationConditions = applicationConditions;
  const displayTechniqueContents = techniqueRequirements.map((r) => r.content);
  const displayBenefits = benefits;
  const displayInstruction = stripHtml(pick(job.instruction, job.instructionEn || job.instruction_en, job.instructionJp || job.instruction_jp) || '');
  const displayJobTags = jobTags;

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full overflow-hidden p-4 sm:p-5 lg:p-6" style={{ backgroundColor: '#f9fafb' }}>
      {/* Main Content - Left Column */}
      <div className="flex-1 overflow-y-auto min-w-0 custom-scrollbar">
        <div className="border rounded-lg p-4 sm:p-5 transition-shadow" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div className="w-full max-w-none space-y-5">
          {/* Header Section: trái = tiêu đề + meta, phải = thẻ phí */}
          <div className="rounded-lg p-4 sm:p-5" style={{ backgroundColor: 'transparent' }}>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-start">
              {/* Cột trái: Quay lại, ID, tags, tiêu đề, category, company, features */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => navigate(backPath)}
                  onMouseEnter={() => setHoveredBackButton(true)}
                  onMouseLeave={() => setHoveredBackButton(false)}
                  className="mb-5 flex items-center gap-2 transition-colors text-sm sm:text-base group"
                  style={{
                    color: hoveredBackButton ? '#111827' : '#4b5563'
                  }}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" style={{ transform: hoveredBackButton ? 'translateX(-4px)' : 'translateX(0)' }} />
                  <span>{t('btnBack')}</span>
                </button>

                <div className="text-xs sm:text-sm mb-3" style={{ color: '#6b7280' }}>
                  {t('labelJobId')} <span className="font-semibold" style={{ color: '#374151' }}>{job.jobCode || job.id}</span>
                </div>

                {displayJobTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {displayJobTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                        style={getTagColorStyle(tag.color)}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}

                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 leading-tight" style={{ color: '#2563eb' }}>
                  {displayTitle}
                </h1>

                {(job.category || displayCategoryName) && (
                  <div className="text-xs sm:text-sm mb-3" style={{ color: '#374151' }}>
                    <span className="font-semibold" style={{ color: '#4b5563' }}>{t('labelJobCategory')}</span>
                    <span className="ml-2">{displayCategoryName || job.category?.name || ''}</span>
                  </div>
                )}

                <div className="flex items-start gap-2 mb-4">
                  <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6b7280' }} />
                  <div className="text-xs sm:text-sm" style={{ color: '#374151' }}>
                    <span className="font-semibold" style={{ color: '#4b5563' }}>{t('labelRecruitingCompanies')}</span>
                    <span className="ml-2">{displayCompanyName || 'N/A'}</span>
                  </div>
                </div>

                {jobFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {jobFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border"
                        style={{ backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cột phải: Thẻ điều kiện phí + khung thông tin nhanh (thu nhập năm, danh mục, giới tính, nơi làm việc) */}
              {((detailCommissionTiers.length > 0 || detailCommissionText !== 'Liên hệ') || (displaySalaryRanges?.length > 0 || displayCategoryName || displayGender || (displayWorkingLocations?.length > 0))) && (
                <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-2">
                  {/* Block điều kiện phí - giữ như cũ */}
                  {(detailCommissionTiers.length > 0 || detailCommissionText !== 'Liên hệ') && (
                    <div className="flex flex-col gap-1.5">
                      {isInCampaign && (
                        <span
                          className="self-start px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-br-md text-white"
                          style={{ backgroundColor: '#dc2626' }}
                        >
                          Campaign
                        </span>
                      )}
                      <div
                        className="flex rounded-md overflow-hidden shadow-sm border"
                        style={{ borderColor: useAdminAPI ? '#7c3aed' : '#0d6bbd' }}
                      >
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
                              : (language === 'vi' ? 'Phí giới thiệu dự kiến của bạn' : language === 'en' ? 'Estimated referral fee for you' : '想定紹介料（あなた）')}
                          </span>
                        </div>
                        {hideCommissionConditionLabel && detailCommissionTiers.length > 0 ? (
                          <div
                            className="flex-1 min-w-0 px-2 py-1.5 text-[10px] sm:text-[12px] font-bold flex items-center justify-center text-center leading-snug"
                            style={{
                              backgroundColor: useAdminAPI ? '#DF2020' : '#007ac3',
                              color: '#ffffff',
                            }}
                            title={detailCommissionTiers[0]?.amount || detailCommissionText}
                          >
                            {detailCommissionTiers[0]?.amount || detailCommissionText}
                          </div>
                        ) : detailCommissionTiers.length > 0 ? (
                          <div className="flex-1 min-w-0 flex flex-col">
                            {detailCommissionTiers.map((tier, index) => (
                              <div
                                key={index}
                                className="flex min-h-[36px]"
                                style={{
                                  borderTop: index === 0 ? 'none' : `1px solid ${useAdminAPI ? '#9ca3af' : '#d1d5db'}`,
                                }}
                              >
                                <div
                                  className="w-24 sm:w-28 flex-shrink-0 px-2 py-1.5 text-[10px] sm:text-[11px] font-semibold flex items-center justify-center text-center leading-snug"
                                  style={{
                                    backgroundColor: useAdminAPI ? '#EB9696' : '#e5f0fb',
                                    color: useAdminAPI ? '#ffffff' : '#0d6bbd',
                                  }}
                                >
                                  <span className="break-words line-clamp-2">{tier.label}</span>
                                </div>
                                <div
                                  className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[12px] font-bold flex items-center justify-center text-center leading-snug"
                                  style={{
                                    backgroundColor: useAdminAPI ? '#DF2020' : '#007ac3',
                                    color: '#ffffff',
                                  }}
                                >
                                  <span className="break-words" title={tier.amount}>{tier.amount}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            className="flex-1 min-w-0 px-2 py-1.5 text-[10px] sm:text-[11px] font-bold flex items-center justify-center text-center break-words"
                            style={{
                              backgroundColor: useAdminAPI ? '#DF2020' : '#007ac3',
                              color: '#ffffff',
                            }}
                            title={detailCommissionText}
                          >
                            {detailCommissionText}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Khung nhỏ dưới điều kiện phí: thu nhập năm, danh mục, giới tính, nơi làm việc (chỉ hiển thị khi có dữ liệu) */}
                  {(displaySalaryRanges?.length > 0 || displayCategoryName || displayGender || (displayWorkingLocations?.length > 0)) && (
                    <div className="rounded-lg border p-3 text-xs" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                      <div className="font-semibold mb-2" style={{ color: '#374151' }}>
                        {t('quickInfoTitle')}
                      </div>
                      <div className="space-y-1.5">
                        {displaySalaryRanges?.length > 0 && (
                          <div>
                            <span className="text-gray-500 font-medium">{t('labelAnnualIncome')}</span>
                            <span className="ml-1" style={{ color: '#111827' }}>{displaySalaryRanges.join(', ')}</span>
                          </div>
                        )}
                        {displayCategoryName && (
                          <div>
                            <span className="text-gray-500 font-medium">{t('labelCategory')}</span>
                            <span className="ml-1" style={{ color: '#111827' }}>{displayCategoryName}</span>
                          </div>
                        )}
                        {displayGender && (
                          <div>
                            <span className="text-gray-500 font-medium">{t('labelGender')}</span>
                            <span className="ml-1" style={{ color: '#111827' }}>{displayGender}</span>
                          </div>
                        )}
                        {displayWorkingLocations?.length > 0 && (
                          <div>
                            <span className="text-gray-500 font-medium">{t('labelLocation')}</span>
                            <span className="ml-1 block mt-0.5" style={{ color: '#111827' }}>{displayWorkingLocations.slice(0, 3).join(', ')}{displayWorkingLocations.length > 3 ? ` (+${displayWorkingLocations.length - 3})` : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date Information */}
          {(updatedAt || publishedAt) && (
            <div className="rounded-xl shadow-sm p-4 sm:p-5" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                {updatedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6b7280' }} />
                    <span className="font-medium">Ngày cập nhật {updatedAt}</span>
                  </div>
                )}
                {updatedAt && publishedAt && (
                  <div className="hidden sm:block h-5 w-px" style={{ backgroundColor: '#d1d5db' }}></div>
                )}
                {publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6b7280' }} />
                    <span className="font-medium">Ngày xuất bản {publishedAt}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4 Tab */}
          <div className="flex border-b gap-1" style={{ borderColor: '#e5e7eb' }}>
            {[
              { key: 'general', label: t('tabGeneral') },
              { key: 'qa', label: t('tabQa') },
              { key: 'rejected', label: t('tabRejected') },
              { key: 'success', label: t('tabSuccess') },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className="px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px"
                style={{
                  color: activeTab === key ? '#2563eb' : '#6b7280',
                  borderBottomColor: activeTab === key ? '#2563eb' : 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'general' && (
          <>
          <CollapsibleCard
            title={t('sectionMain')}
            icon={FileText}
            sectionKey="main"
            defaultExpanded={true}
          >
            <div className="space-y-5 pt-2">
              {/* Job Description */}
              {(job.description || displayDescription) && (
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#1f2937' }}>{t('labelJobContent')}</div>
                  <div className="leading-relaxed whitespace-pre-line text-xs sm:text-sm" style={{ color: '#374151' }}>
                    {displayDescription}
                  </div>
                </div>
              )}

              {/* Salary Range */}
              {displaySalaryRanges.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#1f2937' }}>{t('labelSalary')}</div>
                  <ul className="space-y-2 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                    {displaySalaryRanges.map((salary, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1" style={{ color: '#2563eb' }}>•</span>
                        <span>{salary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Info Grid - chỉ giữ Tuổi, Quốc tịch, Trình độ (phí/category/company/nơi làm việc đã có ở khung bên cạnh tiêu đề job) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                {/* Age */}
                {displayAgeRange && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                      {t('labelAge')}
                    </div>
                    <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>{displayAgeRange}</div>
                  </div>
                )}

                {/* Nationality */}
                {displayNationality && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                      {t('labelNationality')}
                    </div>
                    <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>{displayNationality}</div>
                  </div>
                )}

                {/* Education Level */}
                {displayEducationLevel && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                      {t('labelEducation')}
                    </div>
                    <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>{displayEducationLevel}</div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title={t('sectionRequirements')}
            icon={Users}
            sectionKey="requirements"
            defaultExpanded={true}
          >
            <div className="space-y-6 pt-2">
              {/* Candidate Profile (Thông số kỹ thuật) */}
              <div>
                <div className="text-xs sm:text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#ea580c' }} />
                  {t('labelTechSpecs')}
                </div>
                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Age */}
                  {displayAgeRange && (
                    <div className="flex items-start gap-2">
                      <span className="min-w-[120px]" style={{ color: '#6b7280' }}>{t('labelAge')}:</span>
                      <span className="font-medium" style={{ color: '#111827' }}>{displayAgeRange}</span>
                    </div>
                  )}

                  {/* Education */}
                  {displayEducationLevel && (
                    <div className="flex items-start gap-2">
                      <span className="min-w-[120px]" style={{ color: '#6b7280' }}>{t('labelEducation')}:</span>
                      <span className="font-medium" style={{ color: '#111827' }}>{displayEducationLevel}</span>
                    </div>
                  )}

                  {/* Nationality */}
                  {displayNationality && (
                    <div className="flex items-start gap-2">
                      <span className="min-w-[120px]" style={{ color: '#6b7280' }}>{t('labelNationality')}:</span>
                      <span className="font-medium" style={{ color: '#111827' }}>{displayNationality}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <span className="min-w-[120px]" style={{ color: '#6b7280' }}>{t('labelYearsExpIndustry')}</span>
                    <span className="font-medium" style={{ color: '#111827' }}>{t('noIndustryExp')}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="min-w-[120px]" style={{ color: '#6b7280' }}>{t('labelOtherExp')}</span>
                    <span className="font-medium" style={{ color: '#111827' }}>{t('noExpAny')}</span>
                  </div>
                </div>
              </div>

              {/* Required (Bắt buộc) */}
              {(displayTechniqueContents.length > 0 || displayApplicationConditions.length > 0) && (
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#111827' }}>{t('labelRequired')}</div>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <span className="min-w-[120px]" style={{ color: '#6b7280' }}>{t('labelYearsExpJob')}</span>
                      <span className="font-medium" style={{ color: '#111827' }}>{t('noExpOk')}</span>
                    </div>

                    {displayApplicationConditions.length > 0 && (
                      <div>
                        <div className="mb-2" style={{ color: '#6b7280' }}>{t('labelApplicationConditions')}</div>
                        <ul className="space-y-1 ml-4">
                          {displayApplicationConditions.map((condition, index) => (
                            <li key={index} style={{ color: '#111827' }}>
                              ■ {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technique Requirements as Application Conditions */}
                    {displayTechniqueContents.length > 0 && displayApplicationConditions.length === 0 && (
                      <div>
                        <div className="mb-2" style={{ color: '#6b7280' }}>{t('labelApplicationConditions')}</div>
                        <ul className="space-y-1 ml-4">
                          {displayTechniqueContents.map((content, index) => (
                            <li key={index} style={{ color: '#111827' }}>
                              ■ {content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Welcome Conditions */}
              {welcomeConditions.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#111827' }}>{t('labelWelcomeConditions')}</div>
                  <ul className="space-y-1 text-xs sm:text-sm ml-4" style={{ color: '#4b5563' }}>
                    {welcomeConditions.map((condition, index) => (
                      <li key={index}>• {condition}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disqualifications (Mục tiêu NG) */}
              {disqualifications.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#111827' }}>{t('labelNgTarget')}</div>
                  <ul className="space-y-1 text-xs sm:text-sm ml-4" style={{ color: '#4b5563' }}>
                    {disqualifications.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleCard>

          {(benefits.length > 0 || workingHours.length > 0 || overtimeAllowances.length > 0 || smokingPolicies.length > 0 || smokingPolicyDetails.length > 0) && (
            <CollapsibleCard
              title={t('sectionBenefits')}
              icon={Award}
              sectionKey="benefits"
              defaultExpanded={true}
            >
              <div className="space-y-4 pt-2">
                {displayBenefits.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>{t('labelBenefits')}</div>
                    <ul className="space-y-2 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {displayBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1 flex-shrink-0" style={{ color: '#9ca3af' }}>•</span>
                          <span className="flex-1">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {workingHours.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>{t('labelWorkingHours')}</div>
                    <ul className="space-y-1 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {workingHours.map((hour, index) => (
                        <li key={index}>• {hour}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {overtimeAllowances.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>{t('labelOvertimeAllowance')}</div>
                    <ul className="space-y-1 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {overtimeAllowances.map((allowance, index) => (
                        <li key={index}>• {allowance}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {smokingPolicies.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>{t('labelSmokingPolicy')}</div>
                    <ul className="space-y-1 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {smokingPolicies.map((policy, index) => (
                        <li key={index}>• {policy}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {smokingPolicyDetails.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>{t('labelSmokingPolicyDetail')}</div>
                    <ul className="space-y-1 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {smokingPolicyDetails.map((detail, index) => (
                        <li key={index}>• {detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          )}

          {(job.instruction || displayInstruction) && (
            <CollapsibleCard
              title={t('sectionInterview')}
              icon={AlertCircle}
              sectionKey="interview"
              defaultExpanded={true}
            >
              <div className="pt-2 text-xs sm:text-sm leading-relaxed whitespace-pre-line" style={{ color: '#4b5563' }}>
                {displayInstruction}
              </div>
            </CollapsibleCard>
          )}

          {job.recruitingCompany && (
            <CollapsibleCard
              title={t('sectionCompany')}
              icon={Building2}
              sectionKey="company"
              defaultExpanded={true}
            >
              <div className="space-y-4 pt-2">
                {/* Recruiting Company */}
                {job.recruitingCompany && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-3" style={{ color: '#374151' }}>{t('labelRecruitingCompany')}</div>
                    <div className="space-y-2 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {job.recruitingCompany.companyName && (
                        <div className="font-semibold text-sm sm:text-base" style={{ color: '#111827' }}>{job.recruitingCompany.companyName}</div>
                      )}
                      {displayCompanyRevenue && (
                        <div>
                          <span className="font-medium">{t('labelRevenue')}</span> {displayCompanyRevenue}
                        </div>
                      )}
                      {displayCompanyEmployees && (
                        <div>
                          <span className="font-medium">{t('labelEmployees')}</span> {displayCompanyEmployees}
                        </div>
                      )}
                      {displayCompanyHeadquarters && (
                        <div>
                          <span className="font-medium">{t('labelHeadquarters')}</span> {displayCompanyHeadquarters}
                        </div>
                      )}
                      {displayCompanyEstablished && (
                        <div>
                          <span className="font-medium">{t('labelEstablished')}</span> {displayCompanyEstablished}
                        </div>
                      )}
                    </div>
                    {displayCompanyIntroduction && (
                      <p className="text-xs sm:text-sm leading-relaxed mt-3" style={{ color: '#4b5563' }}>
                        {stripHtml(displayCompanyIntroduction)}
                      </p>
                    )}
                    {job.recruitingCompany.services && job.recruitingCompany.services.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-2" style={{ color: '#6b7280' }}>{t('labelServices')}</div>
                        <div className="flex flex-wrap gap-1">
                          {job.recruitingCompany.services.map((service, index) => (
                            <span key={index} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                              {service.serviceName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {job.recruitingCompany.businessSectors && job.recruitingCompany.businessSectors.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-2" style={{ color: '#6b7280' }}>{t('labelSectors')}</div>
                        <div className="flex flex-wrap gap-1">
                          {job.recruitingCompany.businessSectors.map((sector, index) => (
                            <span key={index} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>
                              {sector.sectorName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                    )}
              </div>
            </CollapsibleCard>
          )}
          </>
          )}

          {activeTab === 'qa' && (
            <div className="rounded-xl shadow-sm p-5 sm:p-6 space-y-4" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
              <h2 className="text-lg font-bold" style={{ color: '#111827' }}>{t('faqTitle')}</h2>
              <p className="text-sm" style={{ color: '#6b7280' }}>{t('faqMock')}</p>
              <div className="space-y-4">
                {MOCK_QA.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4" style={{ borderColor: '#e5e7eb' }}>
                    <p className="font-semibold text-sm mb-2" style={{ color: '#374151' }}>Q: {item.q}</p>
                    <p className="text-sm" style={{ color: '#4b5563' }}>A: {item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="rounded-xl shadow-sm p-5 sm:p-6" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>{t('h2Rejected')}</h2>
              <p className="text-xs mb-4" style={{ color: '#6b7280' }}>{t('pRejected')}</p>
              {loadingApplications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                </div>
              ) : (() => {
                const rejected = jobApplications.filter((app) => REJECTED_STATUSES.includes(Number(app.status)));
                if (rejected.length === 0) {
                  return <p className="text-sm py-4" style={{ color: '#6b7280' }}>{t('noRejected')}</p>;
                }
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#374151' }}>{t('thCandidate')}</th>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#374151' }}>{t('thStatus')}</th>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#374151' }}>{t('thRejectReason')}</th>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#374151' }}>{t('thNominationDate')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rejected.map((app) => (
                          <tr key={app.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td className="py-2 px-3" style={{ color: '#111827' }}>{app.cv?.name || app.cv?.code || `#${app.id}`}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-xs border" style={{ backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>{getJobApplicationStatusLabelByLanguage(app.status, language)}</span></td>
                            <td className="py-2 px-3" style={{ color: '#4b5563' }}>{app.rejectNote || '—'}</td>
                            <td className="py-2 px-3" style={{ color: '#6b7280' }}>{app.appliedAt ? formatDate(app.appliedAt) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'success' && (
            <div className="rounded-xl shadow-sm p-5 sm:p-6" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>{t('h2Success')}</h2>
              <p className="text-xs mb-4" style={{ color: '#6b7280' }}>{t('pSuccess')}</p>
              {loadingApplications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                </div>
              ) : (() => {
                const success = jobApplications.filter((app) => SUCCESS_STATUSES.includes(Number(app.status)));
                if (success.length === 0) {
                  return <p className="text-sm py-4" style={{ color: '#6b7280' }}>{t('noSuccess')}</p>;
                }
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#374151' }}>{t('thCandidate')}</th>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#374151' }}>{t('thStatus')}</th>
                          <th className="text-left py-2 px-3 font-semibold" style={{ color: '#374151' }}>{t('thNominationDate')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {success.map((app) => (
                          <tr key={app.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td className="py-2 px-3" style={{ color: '#111827' }}>{app.cv?.name || app.cv?.code || `#${app.id}`}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-xs border" style={{ backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>{getJobApplicationStatusLabelByLanguage(app.status, language)}</span></td>
                            <td className="py-2 px-3" style={{ color: '#6b7280' }}>{app.appliedAt ? formatDate(app.appliedAt) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
        </div>
      </div>

      {/* Sidebar - Right Column */}
      <div className="w-full lg:w-52 xl:w-56 flex-shrink-0">
        <div className="sticky top-4 lg:top-6">
          {/* Action Buttons - compact */}
          <div className="space-y-2">
            {showEditButton && (
              <button
                onClick={handleEdit}
                onMouseEnter={() => setHoveredEditButton(true)}
                onMouseLeave={() => setHoveredEditButton(false)}
                className="w-full py-2 px-3 rounded-lg transition-all duration-200 font-semibold text-xs flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: hoveredEditButton ? '#1d4ed8' : '#2563eb',
                  color: 'white',
                  boxShadow: hoveredEditButton ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{t('btnEdit')}</span>
              </button>
            )}
            {/* Suggest Candidate Button - Yellow */}
            <button
              onClick={handleApply}
              onMouseEnter={() => setHoveredSuggestButton(true)}
              onMouseLeave={() => setHoveredSuggestButton(false)}
              className="w-full py-2 px-3 rounded-lg transition-all duration-200 font-semibold text-xs flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: hoveredSuggestButton ? '#facc15' : '#fbbf24',
                color: '#111827',
                boxShadow: hoveredSuggestButton ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('btnSuggestCandidate')}</span>
            </button>

            {/* Copy URL Button - Light Blue */}
            <button
              onClick={handleCopyUrl}
              onMouseEnter={() => setHoveredCopyButton(true)}
              onMouseLeave={() => setHoveredCopyButton(false)}
              className="w-full border py-2 px-3 rounded-lg transition-all duration-200 font-semibold text-xs flex items-center justify-center gap-1.5"
              style={{
                borderColor: '#93c5fd',
                backgroundColor: hoveredCopyButton ? '#eff6ff' : 'white',
                color: '#2563eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <Copy className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-center leading-tight">{t('btnCopyUrl')}</span>
            </button>

            {/* Download JD Button with dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDownloadMenu(!openDownloadMenu)}
                onMouseEnter={() => setHoveredDownloadButton(true)}
                onMouseLeave={() => setHoveredDownloadButton(false)}
                className="w-full border py-2 px-3 rounded-lg transition-all duration-200 font-semibold text-xs flex items-center justify-center gap-1.5"
                style={{
                  borderColor: '#93c5fd',
                  backgroundColor: hoveredDownloadButton ? '#eff6ff' : 'white',
                  color: '#2563eb',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('btnDownloadJd')}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDownloadMenu ? 'rotate-180' : ''}`} />
              </button>
              {openDownloadMenu && (
                <div
                  className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg text-xs py-1"
                  style={{ borderColor: '#e5e7eb' }}
                  onMouseLeave={() => setOpenDownloadMenu(false)}
                >
                  <button
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    onClick={() => { handleDownloadJD('jdFile'); setOpenDownloadMenu(false); }}
                  >
                    {t('jdVietnamese')}
                  </button>
                  <button
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50"
                    onClick={() => { handleDownloadJD('jdFile'); setOpenDownloadMenu(false); }}
                  >
                    {t('jdEnglish')}
                  </button>
                  <button
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50"
                    onClick={() => { handleDownloadJD('jdFile'); setOpenDownloadMenu(false); }}
                  >
                    {t('jdJapanese')}
                  </button>
                </div>
              )}
            </div>

            {/* Save to list Button */}
            <button
              onClick={handleOpenSaveToList}
              onMouseEnter={() => setHoveredSaveButton(true)}
              onMouseLeave={() => setHoveredSaveButton(false)}
              className="w-full border py-2 px-3 rounded-lg transition-all duration-200 font-semibold text-xs flex items-center justify-center gap-1.5"
              style={{
                borderColor: '#93c5fd',
                backgroundColor: hoveredSaveButton ? '#eff6ff' : 'white',
                color: '#2563eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{t('saveToList')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Modal Lưu vào danh sách */}
    {showSaveToListModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }} onClick={() => !creatingListInSaveModal && setShowSaveToListModal(false)}>
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('saveToListTitle')}
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
                  <p className="text-sm text-gray-600">{t('noListsYet')}</p>
                  <button
                    type="button"
                    onClick={() => setShowCreateListInSaveModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {t('createNewList')}
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
                  {t('createNewList')}
                </button>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">{t('newListName')}</p>
              <input
                type="text"
                value={newListNameInSaveModal}
                onChange={(e) => setNewListNameInSaveModal(e.target.value)}
                placeholder={t('newListNamePlaceholder')}
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
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  disabled={!newListNameInSaveModal.trim() || creatingListInSaveModal}
                  onClick={handleCreateListAndAddJob}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {creatingListInSaveModal ? t('creating') : t('createAndSave')}
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

export default JobDetailPage;
