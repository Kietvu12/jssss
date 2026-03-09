import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CvTemplateCommon from './CvTemplateCommon';
import CvTemplateIt from './CvTemplateIt';
import CvTemplateTechnical from './CvTemplateTechnical';
import DatePicker, { registerLocale } from 'react-datepicker';
import vi from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('vi', vi);
import apiService from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Briefcase,
  FileText,
  Award,
  UserCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Upload,
  Plus,
  Save,
  X,
  Trash2,
  Eye,
  ChevronDown,
} from 'lucide-react';


/**
 * Form tạo/chỉnh sửa ứng viên – dùng chung cho Agent và Admin.
 * Props: isAdmin (bool), jobId (optional, flow tiến cử), candidateId (optional, Admin hoặc Agent edit), onSuccess, onCancel (callbacks khi dùng trong modal).
 */
const AddCandidateForm = ({ isAdmin = false, jobId = null, candidateId: candidateIdProp = null, onSuccess = null, onCancel = null }) => {
  const navigate = useNavigate();
  const { candidateId: candidateIdFromParams } = useParams();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const candidateId = candidateIdProp ?? candidateIdFromParams;
  const [formData, setFormData] = useState({
    collaboratorId: '',
    // Personal Information
    nameKanji: '',
    nameKana: '',
    birthDate: '',
    age: '',
    gender: '',
    postalCode: '',
    address: '',
    phone: '',
    email: '',
    // Residence & Visa Information
    addressOrigin: '',
    nearestStationLine: '',
    nearestStationName: '',
    dependentsCount: '',
    hasSpouse: '',
    spouseDependent: '',
    passport: '',
    currentResidence: '',
    jpResidenceStatus: '',
    visaExpirationDate: '',
    otherCountry: '',
    // Nhật滞在目的 (mục đích ở Nhật) – map ra preview
    stayPurpose: '',
    // 外国語の会話レベル
    jpConversationLevel: '',
    enConversationLevel: '',
    otherConversationLevel: '',
    // Education
    educations: [],
    // Work Experience
    workExperiences: [],
    /** Số block 職務経歴 (bằng rirekisho.work_history.length khi load từ API). Dùng để form shokumu chỉ hiển thị đúng số mục. */
    workHistoryCount: undefined,
    // Skills & Certificates
    technicalSkills: '',
    certificates: [],
    learnedTools: [],
    experienceTools: [],
    jlptLevel: '',
    toeicScore: '',
    ieltsScore: '',
    experienceYears: '',
    specialization: '',
    qualification: '',
    hasDrivingLicense: '',
    // Self Introduction
    careerSummary: '',
    strengths: '',
    hobbiesSpecialSkills: '',
    motivation: '',
    remarks: '', // 備考 (chi chú)
    languageSkillRemarks: '', // 言語スキル補足説明 (bảng 外国語の会話レベル), tách riêng jlptLevel
    // Preferences
    currentSalary: '',
    desiredSalary: '',
    desiredPosition: '',
    desiredLocation: '',
    desiredStartDate: '',
    // Ngày hiển thị trên CV (履歴書 / 職務経歴書) – có thể sửa, mặc định theo ngày hiện tại
    cvDocumentDate: '',
  });
  const [cvFiles, setCvFiles] = useState([]);
  const [cvPreviews, setCvPreviews] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null); // data URL hoặc URL từ server (khi edit)
  const [cvPdfPreviewUrl, setCvPdfPreviewUrl] = useState(null); // object URL cho embed PDF đầu tiên
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState({ current: 0, total: 0 });
  const [parseError, setParseError] = useState(null);
  const [parseSuccess, setParseSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredCancelButton, setHoveredCancelButton] = useState(false);
  const [hoveredSaveButton, setHoveredSaveButton] = useState(false);
  const [hoveredUploadArea, setHoveredUploadArea] = useState(false);
  const [hoveredAddMoreButton, setHoveredAddMoreButton] = useState(false);
  const [hoveredRemoveCvButtonIndex, setHoveredRemoveCvButtonIndex] = useState(null);
  const [hoveredClearAllButton, setHoveredClearAllButton] = useState(false);
  const [hoveredAddEducationButton, setHoveredAddEducationButton] = useState(false);
  const [hoveredRemoveEducationButtonIndex, setHoveredRemoveEducationButtonIndex] = useState(null);
  const [hoveredAddWorkExperienceButton, setHoveredAddWorkExperienceButton] = useState(false);
  const [hoveredRemoveWorkExperienceButtonIndex, setHoveredRemoveWorkExperienceButtonIndex] = useState(null);
  const [hoveredAddCertificateButton, setHoveredAddCertificateButton] = useState(false);
  const [hoveredRemoveCertificateButtonIndex, setHoveredRemoveCertificateButtonIndex] = useState(null);
  const [hoveredAddLearnedToolButton, setHoveredAddLearnedToolButton] = useState(false);
  const [hoveredRemoveLearnedToolButtonIndex, setHoveredRemoveLearnedToolButtonIndex] = useState(null);
  const [hoveredAddExperienceToolButton, setHoveredAddExperienceToolButton] = useState(false);
  const [hoveredRemoveExperienceToolButtonIndex, setHoveredRemoveExperienceToolButtonIndex] = useState(null);
  const [showCvPreview, setShowCvPreview] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cvTemplate, setCvTemplate] = useState('common'); // 'common' | 'cv_it' | 'cv_technical'
  const [cvFormatTab, setCvFormatTab] = useState('rirekisho'); // 'rirekisho' | 'shokumu' (chỉ dùng khi cvTemplate === 'common')
  const [cvTechnicalTab, setCvTechnicalTab] = useState('rirekisho'); // 'rirekisho' | 'shokumu' (chỉ dùng khi cvTemplate === 'cv_technical')
  const [cvItTab, setCvItTab] = useState('rirekisho'); // 'rirekisho' | 'shokumu' (chỉ dùng khi cvTemplate === 'cv_it')
  const [focusedCvArrayField, setFocusedCvArrayField] = useState(null); // 'arrayName-index-subfield' khi đang focus để không bị React ghi đè nội dung
  // CTV autocomplete: tìm theo tên, gợi ý
  const [collaboratorSearchQuery, setCollaboratorSearchQuery] = useState('');
  const [collaboratorSuggestions, setCollaboratorSuggestions] = useState([]);
  const [collaboratorDropdownOpen, setCollaboratorDropdownOpen] = useState(false);
  const [collaboratorDisplayName, setCollaboratorDisplayName] = useState('');
  const collaboratorSearchDebounceRef = useRef(null);
  const collaboratorDropdownRef = useRef(null);
  /** Ref để tránh React Strict Mode gọi setState 2 lần → chèn 2 cặp hàng. Chỉ áp dụng insert khi ref khớp, rồi clear ref. */
  const cvInsertPendingRef = useRef(null);
  /** Đường dẫn file CV gốc đã lưu (khi sửa ứng viên) – hiển thị trong block Upload CV */
  const [existingCvOriginalPath, setExistingCvOriginalPath] = useState('');
  /** Danh sách file CV gốc hiện có (khi sửa) – từ API cv-file-list */
  const [existingOriginals, setExistingOriginals] = useState([]);
  /** Bật tự động phân tích CV khi thêm file. Mặc định tắt khi đang chỉnh sửa. */
  const [autoParseCv, setAutoParseCv] = useState(true);

  useEffect(() => {
    if (candidateId) {
      loadCandidateData();
      setShowCvPreview(true); // Luôn mở panel CV bên cạnh khi vào màn sửa
      setAutoParseCv(false); // Mặc định tắt phân tích khi vào trang chỉnh sửa
    } else {
      setExistingCvOriginalPath('');
      setExistingOriginals([]);
      setAutoParseCv(true);
    }
  }, [candidateId]);

  // Tìm kiếm CTV theo tên (debounce)
  useEffect(() => {
    if (!isAdmin) return;
    const q = (collaboratorSearchQuery || '').trim();
    if (collaboratorSearchDebounceRef.current) clearTimeout(collaboratorSearchDebounceRef.current);
    if (!q) {
      setCollaboratorSuggestions([]);
      return;
    }
    collaboratorSearchDebounceRef.current = setTimeout(() => {
      apiService.getCollaborators({ search: q, limit: 15 })
        .then((res) => {
          if (res?.success && res?.data?.collaborators) {
            setCollaboratorSuggestions(res.data.collaborators);
          } else {
            setCollaboratorSuggestions([]);
          }
        })
        .catch(() => setCollaboratorSuggestions([]));
    }, 300);
    return () => { if (collaboratorSearchDebounceRef.current) clearTimeout(collaboratorSearchDebounceRef.current); };
  }, [collaboratorSearchQuery, isAdmin]);

  // Đóng dropdown CTV khi click bên ngoài
  useEffect(() => {
    if (!collaboratorDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (collaboratorDropdownRef.current && !collaboratorDropdownRef.current.contains(e.target)) {
        setCollaboratorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [collaboratorDropdownOpen]);

  // Object URL cho PDF đầu tiên (embed trong template) - revoke khi unmount hoặc đổi file
  useEffect(() => {
    if (cvFiles.length > 0 && cvFiles[0]) {
      const url = URL.createObjectURL(cvFiles[0]);
      setCvPdfPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setCvPdfPreviewUrl(null);
    return () => {};
  }, [cvFiles.length, cvFiles[0]?.name, cvFiles[0]?.size]);

  const loadCandidateData = async () => {
    try {
      setLoading(true);
      const response = isAdmin
        ? await apiService.getAdminCVById(candidateId)
        : await apiService.getCVStorageById(candidateId);
      if (response.success && response.data?.cv) {
        const cv = response.data.cv;
        setExistingCvOriginalPath(cv.cvOriginalPath || cv.originalFilePath || '');
        try {
          const listData = isAdmin ? await apiService.getAdminCVFileList(candidateId) : await apiService.getCtvCVFileList(candidateId);
          setExistingOriginals(listData?.originals || []);
        } catch (err) {
          setExistingOriginals([]);
        }

        // API trả về schema mới { rirekisho, shokumu_keirekisho }
        if (cv.rirekisho) {
          mergeResumeData(cv);
          setFormData(prev => ({
            ...prev,
            collaboratorId: cv.collaboratorId != null ? String(cv.collaboratorId) : prev.collaboratorId,
          }));
          if (cv.collaboratorId && cv.collaborator) {
            setCollaboratorDisplayName(cv.collaborator.name || cv.collaborator.email || cv.collaborator.code || `ID ${cv.collaboratorId}`);
          } else {
            setCollaboratorDisplayName('');
          }
          setCollaboratorSearchQuery('');
          setCollaboratorSuggestions([]);
          setLoading(false);
          return;
        }

        // Schema cũ (flat cv)
        let birthDate = cv.birthDate || '';
        // Ensure date format is correct
        if (birthDate && !birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const parsedDate = new Date(birthDate);
          if (!isNaN(parsedDate.getTime())) {
            birthDate = parsedDate.toISOString().split('T')[0];
          } else {
            birthDate = '';
          }
        }
        const calculatedAge = birthDate ? calculateAge(new Date(birthDate)) : (cv.ages || cv.age || '');
        
        let visaExpirationDate = cv.visaExpirationDate || '';
        if (visaExpirationDate && !visaExpirationDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const parsedDate = new Date(visaExpirationDate);
          if (!isNaN(parsedDate.getTime())) {
            visaExpirationDate = parsedDate.toISOString().split('T')[0];
          } else {
            visaExpirationDate = '';
          }
        }
        
        setFormData({
          collaboratorId: cv.collaboratorId != null ? String(cv.collaboratorId) : '',
          nameKanji: cv.name || cv.nameKanji || '',
          nameKana: cv.furigana || cv.nameKana || '',
          birthDate: birthDate,
          age: calculatedAge,
          gender: cv.gender === 1 ? '男' : cv.gender === 2 ? '女' : '',
          postalCode: cv.postalCode || '',
          address: cv.addressCurrent || cv.address || '',
          phone: cv.phone || '',
          email: cv.email || '',
          // Residence & Visa Information
          addressOrigin: cv.addressOrigin || '',
          nearestStationLine: cv.nearestStationLine || '',
          nearestStationName: cv.nearestStationName || '',
          dependentsCount: cv.dependentsCount != null ? String(cv.dependentsCount) : '',
          hasSpouse: cv.hasSpouse === 1 || cv.hasSpouse === '1' || cv.hasSpouse === '有' ? '有' : (cv.hasSpouse === 0 || cv.hasSpouse === '0' || cv.hasSpouse === '無' ? '無' : ''),
          spouseDependent: cv.spouseDependent === 1 || cv.spouseDependent === '1' || cv.spouseDependent === '有' ? '有' : (cv.spouseDependent === 0 || cv.spouseDependent === '0' || cv.spouseDependent === '無' ? '無' : ''),
          passport: cv.passport ? cv.passport.toString() : '',
          currentResidence: cv.currentResidence ? cv.currentResidence.toString() : '',
          jpResidenceStatus: cv.jpResidenceStatus ? cv.jpResidenceStatus.toString() : '',
          visaExpirationDate: visaExpirationDate,
          otherCountry: cv.otherCountry || '',
          educations: normalizeEducationsFromLegacy(cv.educations ? (typeof cv.educations === 'string' ? JSON.parse(cv.educations) : cv.educations) : []),
          workExperiences: expandWorkExperiencesFromBlock(cv.workExperiences ? (typeof cv.workExperiences === 'string' ? JSON.parse(cv.workExperiences) : cv.workExperiences) : []),
          technicalSkills: cv.technicalSkills || '',
          certificates: cv.certificates ? (typeof cv.certificates === 'string' ? JSON.parse(cv.certificates) : cv.certificates) : [],
          learnedTools: cv.learnedTools ? (typeof cv.learnedTools === 'string' ? JSON.parse(cv.learnedTools) : cv.learnedTools) : [],
          experienceTools: cv.experienceTools ? (typeof cv.experienceTools === 'string' ? JSON.parse(cv.experienceTools) : cv.experienceTools) : [],
          jlptLevel: cv.jlptLevel ? cv.jlptLevel.toString() : '',
          toeicScore: cv.toeicScore != null ? cv.toeicScore.toString() : '',
          ieltsScore: cv.ieltsScore != null ? cv.ieltsScore.toString() : '',
          experienceYears: cv.experienceYears ? cv.experienceYears.toString() : '',
          specialization: cv.specialization ? cv.specialization.toString() : '',
          qualification: cv.qualification ? cv.qualification.toString() : '',
          hasDrivingLicense: cv.hasDrivingLicense != null ? cv.hasDrivingLicense.toString() : '',
          careerSummary: cv.careerSummary || '',
          strengths: cv.strengths || '',
          remarks: cv.notes || '',
          languageSkillRemarks: cv.languageSkillRemarks || '',
          hobbiesSpecialSkills: cv.hobbiesSpecialSkills || cv.hobbiesOrSpecialSkills || '',
          motivation: cv.motivation || '',
          currentSalary: cv.currentIncome ? `${cv.currentIncome}万円` : cv.currentSalary || '', // Map from currentIncome
          desiredSalary: cv.desiredIncome ? `${cv.desiredIncome}万円` : cv.desiredSalary || '', // Map from desiredIncome
          desiredPosition: cv.desiredPosition || '',
          desiredLocation: cv.desiredWorkLocation || cv.desiredLocation || '', // Map from desiredWorkLocation
          desiredStartDate: cv.nyushaTime || cv.desiredStartDate || '', // Map from nyushaTime
        });
        // Hiển thị tên CTV khi load (ô CTV tìm theo tên)
        if (cv.collaboratorId && cv.collaborator) {
          setCollaboratorDisplayName(cv.collaborator.name || cv.collaborator.email || cv.collaborator.code || `ID ${cv.collaboratorId}`);
        } else {
          setCollaboratorDisplayName('');
        }
        setCollaboratorSearchQuery('');
        setCollaboratorSuggestions([]);
        // Ảnh chân dung không lưu DB, chỉ nhúng vào PDF khi lưu; khi mở lại form sẽ trống
      } else {
        setExistingCvOriginalPath('');
      }
    } catch (error) {
      console.error('Error loading candidate data:', error);
      alert('Lỗi khi tải thông tin ứng viên');
      setExistingCvOriginalPath('');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (JPG, PNG, ...)');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  /** Mở preview trong popup. tab: 'rirekisho' | 'shokumu' | 'all' – chỉ xem 1 phần hoặc cả 2. */
  const handleBackendPreviewWithOptions = async (template, tab = 'all') => {
    try {
      setPreviewLoading(true);
      setShowPreviewModal(true);
      const payload = {
        ...formData,
        cvTemplate: template || 'common',
        tab: (tab === 'rirekisho' || tab === 'shokumu') ? tab : 'all',
        avatarBase64: typeof avatarPreview === 'string' && avatarPreview.startsWith('data:')
          ? avatarPreview
          : undefined,
      };
      const res = isAdmin
        ? await apiService.previewAdminCVTemplate(payload)
        : await apiService.previewCTVCVTemplate(payload);
      if (!res.ok) {
        alert(`Preview thất bại (status ${res.status})`);
        setShowPreviewModal(false);
        return;
      }
      setPreviewHtml(res.html || '');
    } catch (e) {
      console.error('Error previewing CV template:', e);
      alert('Có lỗi khi preview CV template.');
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleBackendPreview = async () => {
    try {
      setPreviewLoading(true);
      setShowPreviewModal(true);
      const payload = {
        ...formData,
        cvTemplate: cvTemplate || 'common',
        tab: 'all',
        avatarBase64: typeof avatarPreview === 'string' && avatarPreview.startsWith('data:')
          ? avatarPreview
          : undefined,
      };
      const res = isAdmin
        ? await apiService.previewAdminCVTemplate(payload)
        : await apiService.previewCTVCVTemplate(payload);
      if (!res.ok) {
        alert(`Preview thất bại (status ${res.status})`);
        setShowPreviewModal(false);
        return;
      }
      setPreviewHtml(res.html || '');
    } catch (e) {
      console.error('Error previewing CV template:', e);
      alert('Có lỗi khi preview CV template.');
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  /** Ngày mặc định trên CV (YYYY年M月D日 hoặc + 現在) */
  const getDefaultCvDate = (withCurrent = true) => {
    const d = new Date();
    const s = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return withCurrent ? `${s}現在` : s;
  };

  /** Ô text trong preview CV: cho phép sửa trực tiếp, đồng bộ vào formData khi blur. Không trả key trong props để tránh spread key vào JSX. */
  const cvEditable = (field, className = '', style = {}) => ({
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: (e) => {
      const v = (e.currentTarget.textContent || '').trim();
      setFormData(prev => ({ ...prev, [field]: v || '' }));
    },
    className,
    style: { outline: 'none', minHeight: '1.2em', ...style },
    children: (formData[field] || '').trim() || '　',
  });

  /** Ô text có giá trị mặc định khi trống (dùng cho ngày CV). displayTransform(value): chuẩn hóa khi hiển thị (vd bỏ "現在" ở cuối). */
  const cvEditableWithDefault = (field, defaultVal, className = '', style = {}, displayTransform = (v) => v) => {
    const raw = (formData[field] || '').trim() || defaultVal;
    const display = typeof displayTransform === 'function' ? displayTransform(raw) : raw;
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: (e) => {
        const v = (e.currentTarget.textContent || '').trim();
        setFormData(prev => ({ ...prev, [field]: v || '' }));
      },
      className,
      style: { outline: 'none', minHeight: '1.2em', ...style },
      children: display,
    };
  };
  /** Ô text cho mảng: đồng bộ [arrayName][index][subfield]. displayValue = giá trị hiển thị (nếu khác value).
   * Khi focus không truyền children để React không ghi đè → tránh lỗi ký tự sai thứ tự. Chỉ cập nhật state khi blur.
   *  certificates + subfield 'yearMonth': hiển thị dạng "YYYY年MM月", khi trống "　年　月" để user nhập trước 年 và 月. */
  const cvEditableArray = (arrayName, index, subfield, className = '', style = {}, displayValue = undefined) => {
    const arr = formData[arrayName] || [];
    const item = arr[index] || {};
    const isYearMonth = arrayName === 'certificates' && subfield === 'yearMonth';
    const value = isYearMonth ? ((item.year || '') + (item.month || '')) : (item[subfield] ?? '');
    const show = displayValue !== undefined
      ? String(displayValue).trim() || '　'
      : isYearMonth
        ? ((item.year || '　　') + '年' + (item.month || '　　') + '月')
        : (String(value).trim() || '　');
    const cellKey = `${arrayName}-${index}-${subfield}`;
    const isFocused = focusedCvArrayField === cellKey;

    const applyValue = (v) => {
        setFormData(prev => {
          const next = [...(prev[arrayName] || [])];
          while (next.length <= index) next.push({});
        if (arrayName === 'certificates' && subfield === 'yearMonth') {
          let y = '', m = '';
          const str = String(v || '').trim();
          if (str.includes('年') || str.includes('月')) {
            const byNen = str.split('年');
            const yPart = (byNen[0] || '').replace(/\s/g, '');
            const rest = (byNen[1] || '').split('月')[0] || '';
            const mPart = rest.replace(/\s/g, '');
            y = (yPart.match(/\d+/g) || []).join('').slice(0, 4) || yPart.slice(0, 4);
            m = (mPart.match(/\d+/g) || []).join('').slice(0, 2) || mPart.slice(0, 2);
          }
          if (y === '' && m === '') {
            const s = str.replace(/\D/g, '');
            if (s.length >= 6) {
              y = s.slice(0, 4);
              m = s.slice(4, 6);
            } else if (s.length === 4) {
              y = '20' + s.slice(0, 2);
              m = s.slice(2, 4);
            } else if (s.length === 2) {
              m = s;
            } else {
              y = s;
            }
          }
          next[index] = { ...next[index], year: y, month: m };
        } else if (arrayName === 'educations' && (subfield === 'year' || subfield === 'endYear') && v.includes('/')) {
          const [yRaw, mRaw] = v.split('/').map(s => s.trim());
          const y = yRaw || '';
          const m = mRaw || '';
          if (subfield === 'year') {
            next[index] = { ...next[index], year: y, month: m };
          } else {
            next[index] = { ...next[index], endYear: y, endMonth: m };
          }
        } else {
          next[index] = { ...next[index], [subfield]: v || '' };
          if (arrayName === 'educations' && subfield === 'content') {
            const parts = (v || '').trim().split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
            next[index].school_name = parts[0] ?? '';
            next[index].major = parts.slice(1).join(' / ') ?? '';
          }
        }
          return { ...prev, [arrayName]: next };
        });
    };

    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      tabIndex: 0,
      onFocus: (e) => {
        setFocusedCvArrayField(cellKey);
        const el = e.currentTarget;
        const content = show || '　';
        requestAnimationFrame(() => {
          if (el && document.activeElement === el) el.textContent = content;
        });
      },
      onBlur: (e) => {
        setFocusedCvArrayField(null);
        const v = (e.currentTarget.textContent || '').trim();
        applyValue(v);
      },
      className,
      style: { outline: 'none', minHeight: '1em', minWidth: '1.5em', display: 'inline-block', cursor: 'text', ...style },
      children: isFocused ? undefined : show,
    };
  };

  // API Base URL for CV parsing
  const API_BASE_URL = 'http://13.229.250.2/api_ai';

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
    if (isNaN(birth.getTime())) return '';
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  /** Trả về Date hợp lệ hoặc null để tránh react-datepicker ném "Invalid time value". */
  const safeDateForPicker = (value) => {
    if (value == null || value === '') return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  // Handle date change from DatePicker
  const handleBirthDateChange = (date) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      const age = calculateAge(date);
      setFormData(prev => ({
        ...prev,
        birthDate: dateString,
        age: age
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        birthDate: '',
        age: ''
      }));
    }
    // Clear error
    if (errors.birthDate) {
      setErrors(prev => ({
        ...prev,
        birthDate: ''
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Auto-calculate age when birthDate changes
      if (name === 'birthDate' && value) {
        const age = calculateAge(value);
        newData.age = age;
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

  /** Parse API date string (e.g. "2020-04", "2020/09", "2020年4月", "2026-03-05") to { year, month } for form. */
  const parseApiDateToYearMonth = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return { year: '', month: '' };
    const s = String(dateStr).trim();
    const iso = s.match(/^(\d{4})[-](\d{1,2})/);
    if (iso) return { year: iso[1], month: String(parseInt(iso[2], 10)) };
    const slash = s.match(/^(\d{4})\/(\d{1,2})/);
    if (slash) return { year: slash[1], month: String(parseInt(slash[2], 10)) };
    const jp = s.match(/(\d{4})年(\d{1,2})/);
    if (jp) return { year: jp[1], month: String(parseInt(jp[2], 10)) };
    return { year: '', month: '' };
  };

  const toSchoolNameMajor = (content) => {
    const s = (content || '').trim().replace(/\s*(入学|卒業)\s*$/, '').trim();
    const parts = s.split(/\s*\/\s*/).map(p => p.trim()).filter(Boolean);
    return { school_name: parts[0] || '', major: parts.slice(1).join(' / ') || '', content: s };
  };

  /** Chuẩn hóa educations lưu cũ (2 dòng 入学/卒業 mỗi trường) thành 1 dòng/trường có endYear, endMonth, school_name, major. */
  const normalizeEducationsFromLegacy = (list) => {
    if (!list || !Array.isArray(list)) return [];
    const result = [];
    let pending = null; // { schoolLabel, year, month }
    for (const edu of list) {
      const content = (edu.content || '').trim();
      const year = (edu.year ?? '').toString().trim();
      const month = (edu.month ?? '').toString().trim();
      const endYear = (edu.endYear ?? '').toString().trim();
      const endMonth = (edu.endMonth ?? '').toString().trim();
      if (endYear !== '' || endMonth !== '' || !content.endsWith(' 入学') && !content.endsWith(' 卒業')) {
        if (pending) {
          const p = toSchoolNameMajor(pending.schoolLabel);
          result.push({ ...p, year: pending.year, month: pending.month, endYear: '', endMonth: '' });
          pending = null;
        }
        const schoolLabel = content.replace(/\s*(入学|卒業)\s*$/, '').trim();
        const p = toSchoolNameMajor(schoolLabel || content);
        result.push({ ...p, year, month, endYear, endMonth });
        continue;
      }
      if (content.endsWith(' 入学')) {
        if (pending) {
          const p = toSchoolNameMajor(pending.schoolLabel);
          result.push({ ...p, year: pending.year, month: pending.month, endYear: '', endMonth: '' });
        }
        pending = { schoolLabel: content.replace(/\s*入学\s*$/, '').trim(), year, month };
      } else if (content.endsWith(' 卒業')) {
        const schoolLabel = content.replace(/\s*卒業\s*$/, '').trim();
        if (pending && pending.schoolLabel === schoolLabel) {
          const p = toSchoolNameMajor(schoolLabel);
          result.push({ ...p, year: pending.year, month: pending.month, endYear: year, endMonth: month });
          pending = null;
        } else {
          if (pending) {
            const p = toSchoolNameMajor(pending.schoolLabel);
            result.push({ ...p, year: pending.year, month: pending.month, endYear: '', endMonth: '' });
          }
          pending = null;
          const p = toSchoolNameMajor(schoolLabel);
          result.push({ ...p, year: '', month: '', endYear: year, endMonth: month });
        }
      } else {
        if (pending) {
          const p = toSchoolNameMajor(pending.schoolLabel);
          result.push({ ...p, year: pending.year, month: pending.month, endYear: '', endMonth: '' });
        }
        pending = null;
        const p = toSchoolNameMajor(content);
        result.push({ ...p, year, month, endYear: '', endMonth: '' });
      }
    }
    if (pending) {
      const p = toSchoolNameMajor(pending.schoolLabel);
      result.push({ ...p, year: pending.year, month: pending.month, endYear: '', endMonth: '' });
    }
    return result;
  };

  /** Từ block (1 item = 1 kinh nghiệm có period "start ~ end") mở rộng thành 2 dòng 職歴 mỗi item: 入社 + 退社. */
  const expandWorkExperiencesFromBlock = (list) => {
    if (!list || !Array.isArray(list)) return [];
    const result = [];
    for (const we of list) {
      const cn = (we.company_name || '').trim();
      if (cn.endsWith(' 入社') || cn.endsWith(' 退社')) {
        result.push({ ...we });
        continue;
      }
      const period = we.period || '';
      const parts = period.split(/\s*~\s*/).map(s => s.trim());
      const startStr = parts[0] || '';
      const endStr = parts[1] || '';
      const startYm = parseApiDateToYearMonth(startStr);
      const endYm = parseApiDateToYearMonth(endStr);
      const base = { business_purpose: we.business_purpose || '', scale_role: we.scale_role || '', description: we.description || '', tools_tech: we.tools_tech || '', period };
      result.push({ ...base, year: startYm.year, month: startYm.month, company_name: cn ? `${cn} 入社` : '入社' });
      result.push({ ...base, year: endYm.year, month: endYm.month, company_name: cn ? `${cn} 退社` : '退社' });
    }
    return result;
  };

  /** Map API response { rirekisho, shokumu_keirekisho } (schema mới) -> formData. */
  const mergeResumeData = (parsedData) => {
    const rr = parsedData.rirekisho || {};
    const sk = parsedData.shokumu_keirekisho || {};

    let birthDateValue = rr.birth_date || '';
    if (birthDateValue && typeof birthDateValue === 'string' && !birthDateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parsedDate = new Date(birthDateValue);
      if (!isNaN(parsedDate.getTime())) {
        birthDateValue = parsedDate.toISOString().split('T')[0];
      } else {
        birthDateValue = '';
      }
    }
    const calculatedAge = birthDateValue
      ? calculateAge(new Date(birthDateValue))
      : (rr.age != null ? String(rr.age) : '');

    const mapSpouseFlag = (val) => {
      if (val === true) return '有';
      if (val === false) return '無';
      return '';
    };

    // education_history: 1 item = 1 dòng form. 入学年月 = start_date, 卒業年月 = end_date. school_name, major giữ nguyên.
    const mappedEducations = rr.education_history?.length > 0
      ? rr.education_history.map(edu => {
          const startYm = parseApiDateToYearMonth(edu.start_date || '');
          const endYm = parseApiDateToYearMonth(edu.end_date || '');
          return {
            school_name: (edu.school_name || '').trim(),
            major: (edu.major || '').trim(),
            year: startYm.year,
            month: startYm.month,
            endYear: endYm.year,
            endMonth: endYm.month,
            content: [edu.school_name, edu.major].filter(Boolean).join(' / ') || ''
          };
        })
      : null;

    // licenses_qualifications: [{ year, month, name }] -> certificates
    const mappedCertificates = rr.licenses_qualifications?.length > 0
      ? rr.licenses_qualifications.map(lic => ({
          year: lic.year != null ? String(lic.year) : '',
          month: lic.month != null ? String(lic.month) : '',
          name: lic.name || ''
        }))
      : null;

    const isEndDateCurrent = (endDate) => {
      if (!endDate || typeof endDate !== 'string') return false;
      const s = String(endDate).trim();
      const lower = s.toLowerCase();
      return s === '現在' || lower === 'đến nay' || lower === 'present' || lower === 'current' || s.includes('現在');
    };
    // work_history (rirekisho): mỗi item tạo 2 dòng 職歴 — 入社 (start_date) + 退社 (end_date). Nếu end_date là "現在"/"đến nay" thì dòng end: 年・月 trống, 職歴 = "現在に至る"
    const workFromRirekisho = rr.work_history?.length > 0
      ? rr.work_history.flatMap(w => {
          const companyName = w.company_name || '';
          const period = [w.start_date, w.end_date].filter(Boolean).join(' ~ ') || '';
          const startYm = parseApiDateToYearMonth(w.start_date || '');
          const endYm = parseApiDateToYearMonth(w.end_date || '');
          const base = { business_purpose: '', scale_role: w.department_role || '', description: '', tools_tech: '', period };
          const rows = [];
          if (w.start_date) {
            rows.push({ year: startYm.year, month: startYm.month, company_name: companyName ? `${companyName} 入社` : '入社', ...base });
          }
          if (w.end_date) {
            if (isEndDateCurrent(w.end_date)) {
              rows.push({ year: '', month: '', company_name: '現在に至る', ...base });
            } else {
              rows.push({ year: endYm.year, month: endYm.month, company_name: companyName ? `${companyName} 退社` : '退社', ...base });
            }
          }
          if (rows.length === 0) {
            rows.push({ year: '', month: '', company_name: companyName, ...base });
          }
          return rows;
        })
      : null;

    // job_history (shokumu): 1 item per job → mở rộng thành 2 dòng 職歴 (入社 + 退社) mỗi job
    const workFromShokumuRaw = sk.job_history?.length > 0
      ? sk.job_history.map(job => ({
          period: [job.period_start, job.period_end].filter(Boolean).join(' ~ '),
          company_name: job.company_name || '',
          business_purpose: job.business_objective || '',
          scale_role: job.team_size_role || '',
          description: job.responsibilities || '',
          tools_tech: Array.isArray(job.tools) ? job.tools.join(', ') : (job.tools || '')
        }))
      : null;
    const workFromShokumu = workFromShokumuRaw?.length ? expandWorkExperiencesFromBlock(workFromShokumuRaw) : null;

    // qualifications (shokumu): [{ name, acquired_date }] -> merge into certificates if we use shokumu certs
    const certsFromShokumu = sk.qualifications?.length > 0
      ? sk.qualifications.map(q => {
          const { year, month } = parseApiDateToYearMonth(q.acquired_date || '');
          return { year, month, name: q.name || '' };
        })
      : null;
    
    setFormData(prev => ({
      ...prev,
      nameKanji: rr.full_name || prev.nameKanji,
      nameKana: rr.name_furigana || prev.nameKana,
      birthDate: birthDateValue || prev.birthDate,
      age: calculatedAge || prev.age,
      gender: rr.gender || prev.gender,
      postalCode: rr.postal_code || prev.postalCode,
      address: rr.address || prev.address,
      phone: rr.phone || prev.phone,
      email: rr.email || prev.email,
      addressOrigin: rr.emergency_contact_address || prev.addressOrigin,
      nearestStationName: rr.nearest_station || prev.nearestStationName,
      dependentsCount: rr.dependents_count != null ? String(rr.dependents_count) : prev.dependentsCount,
      hasSpouse: rr.has_spouse != null ? mapSpouseFlag(rr.has_spouse) : prev.hasSpouse,
      spouseDependent: rr.spouse_support_obligation != null ? mapSpouseFlag(rr.spouse_support_obligation) : prev.spouseDependent,
      jpResidenceStatus: rr.residence_status || prev.jpResidenceStatus,
      visaExpirationDate: rr.residence_expiry || prev.visaExpirationDate,
      stayPurpose: rr.stay_purpose || rr.stayPurpose || prev.stayPurpose,
      jpConversationLevel: rr.jp_conversation_level || rr.jpConversationLevel || prev.jpConversationLevel,
      enConversationLevel: rr.en_conversation_level || rr.enConversationLevel || prev.enConversationLevel,
      otherConversationLevel: rr.other_conversation_level || rr.otherConversationLevel || prev.otherConversationLevel,
      cvDocumentDate: rr.creation_date || sk.creation_date || prev.cvDocumentDate,

      educations: mappedEducations ?? prev.educations,
      certificates: mappedCertificates ?? (certsFromShokumu?.length ? certsFromShokumu : prev.certificates),
      // Ưu tiên job_history (shokumu) khi có — đủ field: business_objective, team_size_role, responsibilities, tools cho tab 職務経歴書.
      // work_history (rirekisho) dùng khi không có job_history.
      workExperiences: workFromShokumu ?? workFromRirekisho ?? prev.workExperiences,
      workHistoryCount: (sk.job_history?.length != null && sk.job_history.length > 0) ? sk.job_history.length : (rr.work_history?.length != null ? rr.work_history.length : prev.workHistoryCount),

      technicalSkills: sk.skills_and_knowledge?.length > 0 ? sk.skills_and_knowledge.join(', ') : prev.technicalSkills,
      careerSummary: sk.summary || prev.careerSummary,
      strengths: rr.self_pr || sk.self_pr || prev.strengths,
      hobbiesSpecialSkills: rr.hobbies_skills || prev.hobbiesSpecialSkills,
      motivation: rr.motivation || prev.motivation,

      currentSalary: rr.current_salary != null ? String(rr.current_salary) : prev.currentSalary,
      desiredSalary: rr.expected_salary != null ? String(rr.expected_salary) : prev.desiredSalary,
      desiredPosition: rr.desired_role || prev.desiredPosition,
      desiredLocation: rr.desired_location || prev.desiredLocation,
      desiredStartDate: rr.available_start_date || prev.desiredStartDate,
    }));
  };

  /** Map formData -> API shape { rirekisho, shokumu_keirekisho } (để gửi API hoặc lưu). */
  const formDataToApi = () => {
    const fd = formData;
    const mapSpouseToBool = (v) => (v === '有' ? true : v === '無' ? false : undefined);

    // 1 dòng form = 1 item education_history: school_name, major, start_date (入学年月), end_date (卒業年月)
    const education_history = (() => {
      const list = fd.educations || [];
      return list.map(edu => {
        const year = (edu.year || '').toString().trim();
        const month = (edu.month || '').toString().trim();
        const endYear = (edu.endYear ?? '').toString().trim();
        const endMonth = (edu.endMonth ?? '').toString().trim();
        const startDate = [year, month].filter(Boolean).length ? `${year}/${month}` : undefined;
        const endDate = [endYear, endMonth].filter(Boolean).length ? `${endYear}/${endMonth}` : undefined;
        let school_name = (edu.school_name ?? '').toString().trim();
        let major = (edu.major ?? '').toString().trim();
        if (!school_name && !major && (edu.content || '').trim()) {
          const parts = (edu.content || '').trim().split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
          school_name = parts[0] || '';
          major = parts.slice(1).join(' / ') || '';
        }
        return { school_name: school_name || undefined, major: major || undefined, start_date: startDate, end_date: endDate };
      });
    })();

    // Gộp 2 dòng 入社 / 退社 (cùng công ty) thành 1 item work_history có start_date + end_date
    const work_historyMerged = (() => {
      const list = fd.workExperiences || [];
      const result = [];
      let pending = null; // { companyName, startDate, firstRow }
      for (const we of list) {
        const cn = (we.company_name || '').trim();
        const year = (we.year || '').toString().trim();
        const month = (we.month || '').toString().trim();
        const dateStr = [year, month].filter(Boolean).length ? `${year}/${month}` : undefined;
        if (cn.endsWith(' 入社')) {
          const companyName = cn.replace(/\s*入社\s*$/, '').trim();
          if (pending) result.push({ company_name: pending.companyName, department_role: pending.firstRow?.scale_role || pending.firstRow?.description, start_date: pending.startDate, end_date: undefined });
          pending = { companyName, startDate: dateStr, firstRow: we };
        } else if (cn.endsWith(' 退社')) {
          const companyName = cn.replace(/\s*退社\s*$/, '').trim();
          if (pending && pending.companyName === companyName) {
            result.push({ company_name: companyName, department_role: pending.firstRow?.scale_role || pending.firstRow?.description, start_date: pending.startDate, end_date: dateStr, firstRow: pending.firstRow });
            pending = null;
          } else {
            if (pending) { result.push({ company_name: pending.companyName, department_role: pending.firstRow?.scale_role, start_date: pending.startDate, end_date: undefined }); pending = null; }
            result.push({ company_name: companyName, department_role: we.scale_role || we.description, start_date: undefined, end_date: dateStr, firstRow: we });
          }
        } else if (cn === '現在に至る') {
          if (pending) {
            result.push({ company_name: pending.companyName, department_role: pending.firstRow?.scale_role || pending.firstRow?.description, start_date: pending.startDate, end_date: '現在', firstRow: pending.firstRow });
            pending = null;
          }
        } else {
          if (pending) { result.push({ company_name: pending.companyName, department_role: pending.firstRow?.scale_role, start_date: pending.startDate, end_date: undefined }); pending = null; }
          const periodStr = we.period || '';
          const parts = periodStr.split(/\s*~\s*/).map(s => s.trim());
          result.push({ company_name: cn, department_role: we.scale_role || we.description, start_date: parts[0] || dateStr, end_date: parts[1] || undefined, firstRow: we });
        }
      }
      if (pending) result.push({ company_name: pending.companyName, department_role: pending.firstRow?.scale_role, start_date: pending.startDate, end_date: undefined });
      return result;
    })();

    const work_history = work_historyMerged.map(w => ({
      company_name: w.company_name || '',
      department_role: w.department_role || undefined,
      start_date: w.start_date || '',
      end_date: w.end_date || '',
    }));

    const licenses_qualifications = (fd.certificates || []).map(c => ({
      year: c.year ? parseInt(c.year, 10) : 0,
      month: c.month ? parseInt(c.month, 10) : 0,
      name: c.name || '',
    }));

    const rirekisho = {
      creation_date: fd.cvDocumentDate || undefined,
      name_furigana: fd.nameKana || undefined,
      full_name: fd.nameKanji || undefined,
      birth_date: fd.birthDate || undefined,
      age: fd.age ? parseInt(fd.age, 10) : 0,
      gender: fd.gender || undefined,
      postal_code: fd.postalCode || undefined,
      address: fd.address || undefined,
      address_furigana: undefined,
      phone: fd.phone || undefined,
      email: fd.email || undefined,
      emergency_contact_address: fd.addressOrigin || undefined,
      education_history: education_history.length ? education_history : undefined,
      work_history: work_history.length ? work_history : undefined,
      licenses_qualifications: licenses_qualifications.length ? licenses_qualifications : undefined,
      nearest_station: fd.nearestStationName || fd.nearestStationLine ? [fd.nearestStationLine, fd.nearestStationName].filter(Boolean).join(' ') : undefined,
      dependents_count: fd.dependentsCount !== '' ? parseInt(fd.dependentsCount, 10) : 0,
      has_spouse: mapSpouseToBool(fd.hasSpouse),
      spouse_support_obligation: mapSpouseToBool(fd.spouseDependent),
      residence_status: fd.jpResidenceStatus || undefined,
      stay_purpose: fd.stayPurpose || undefined,
      jp_conversation_level: fd.jpConversationLevel || undefined,
      en_conversation_level: fd.enConversationLevel || undefined,
      other_conversation_level: fd.otherConversationLevel || undefined,
      residence_expiry: fd.visaExpirationDate || undefined,
      self_pr: fd.strengths || undefined,
      hobbies_skills: fd.hobbiesSpecialSkills || undefined,
      motivation: fd.motivation || undefined,
      current_salary: fd.currentSalary ? parseInt(String(fd.currentSalary).replace(/\D/g, ''), 10) : 0,
      expected_salary: fd.desiredSalary ? parseInt(String(fd.desiredSalary).replace(/\D/g, ''), 10) : 0,
      desired_role: fd.desiredPosition || undefined,
      desired_location: fd.desiredLocation || undefined,
      available_start_date: fd.desiredStartDate || undefined,
    };

    const job_history = work_historyMerged.map(w => {
      const we = w.firstRow || {};
      const companyName = (w.company_name || '').replace(/\s*入社\s*$|\s*退社\s*$/g, '').trim();
      return {
        period_start: w.start_date || '',
        period_end: w.end_date || '',
        company_name: companyName || we.company_name || '',
        business_objective: we.business_purpose || '',
        team_size_role: we.scale_role || '',
        responsibilities: we.description || '',
        tools: (we.tools_tech || '').split(/[,、]/).map(t => t.trim()).filter(Boolean),
      };
    });

    const qualifications = (fd.certificates || []).map(c => {
      const y = c.year || '';
      const m = c.month || '';
      const acquired_date = [y, m].filter(Boolean).length ? `${y}年${m}月` : undefined;
      return { name: c.name || '', acquired_date: acquired_date || '' };
    });

    const shokumu_keirekisho = {
      creation_date: fd.cvDocumentDate || undefined,
      full_name: fd.nameKanji || undefined,
      summary: fd.careerSummary || undefined,
      job_history: job_history.length ? job_history : undefined,
      skills_and_knowledge: (fd.technicalSkills || '').split(/[,、]/).map(s => s.trim()).filter(Boolean),
      qualifications: qualifications.length ? qualifications : undefined,
      self_pr: fd.strengths || undefined,
    };

    return { rirekisho, shokumu_keirekisho };
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter PDF files only
    const pdfFiles = files.filter(f => {
      // Check both MIME type and file extension
      const isPDF = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      // Check file size (max 10MB)
      const isValidSize = f.size <= 10 * 1024 * 1024;
      return isPDF && isValidSize;
    });

    if (pdfFiles.length === 0) {
      const invalidFiles = files.filter(f => {
        const isPDF = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        const isValidSize = f.size <= 10 * 1024 * 1024;
        return !isPDF || !isValidSize;
      });
      
      let errorMsg = 'Vui lòng chọn file PDF';
      if (invalidFiles.length > 0) {
        const tooLarge = invalidFiles.filter(f => f.size > 10 * 1024 * 1024);
        if (tooLarge.length > 0) {
          errorMsg = `Một số file quá lớn (tối đa 10MB): ${tooLarge.map(f => f.name).join(', ')}`;
        } else {
          errorMsg = 'Vui lòng chọn file PDF hợp lệ';
        }
      }
      setParseError(errorMsg);
      return;
    }

    // Add files to state
    setCvFiles(prev => [...prev, ...pdfFiles]);
    setParseError(null);
    setParseSuccess(null);

    // Create previews for new files with error handling
    pdfFiles.forEach((file, fileIndex) => {
      try {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          if (reader.result) {
            setCvPreviews(prev => [...prev, { name: file.name, url: reader.result }]);
          } else {
            console.warn(`Failed to read file: ${file.name}`);
            // Still add file to previews but without URL
            setCvPreviews(prev => [...prev, { name: file.name, url: null }]);
          }
        };
        
        reader.onerror = (error) => {
          console.error(`Error reading file ${file.name}:`, error);
          setParseError(`Không thể đọc file: ${file.name}. Vui lòng thử lại.`);
          // Remove the file from state if read fails
          setCvFiles(prev => prev.filter((_, i) => i !== prev.length - pdfFiles.length + fileIndex));
        };
        
        reader.onabort = () => {
          console.warn(`File reading aborted: ${file.name}`);
          setCvFiles(prev => prev.filter((_, i) => i !== prev.length - pdfFiles.length + fileIndex));
        };
        
        // Read file as data URL
        reader.readAsDataURL(file);
      } catch (error) {
        console.error(`Error setting up FileReader for ${file.name}:`, error);
        setParseError(`Lỗi khi xử lý file: ${file.name}. ${error.message}`);
        // Remove the file from state
        setCvFiles(prev => prev.filter((_, i) => i !== prev.length - pdfFiles.length + fileIndex));
      }
    });

    // Khi chỉnh sửa hoặc tắt tự động phân tích: không gọi API phân tích CV
    if (candidateId || !autoParseCv) {
      setParseSuccess(
        candidateId
          ? `Đã thêm ${pdfFiles.length} file. Phân tích CV bị tắt khi chỉnh sửa.`
          : `Đã thêm ${pdfFiles.length} file. Bật "Tự động phân tích CV" để trích xuất dữ liệu.`
      );
      return;
    }

    // Parse all PDF files in a single request (giống Swagger: List[UploadFile])
    setIsParsing(true);
    setParseProgress({ current: 0, total: pdfFiles.length });

      try {
        const formDataUpload = new FormData();
      pdfFiles.forEach((file) => {
        formDataUpload.append('files', file);
      });

        const controller = new AbortController();
      // Thời gian phân tích CV có thể lâu (LLM + nhiều file) ⇒ tăng timeout lên 2 phút
      const timeoutId = setTimeout(() => controller.abort(), 3000000); // 120 seconds timeout

        let response;
        try {
          response = await fetch(`${API_BASE_URL}/resume/parse-candidate`, {
            method: 'POST',
            body: formDataUpload,
            signal: controller.signal,
            headers: {
              // Don't set Content-Type, let browser set it with boundary for FormData
            }
          });
          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
        console.warn(`Skipping parse for batch:`, fetchError.message);
        setParseSuccess(`Đã thêm ${pdfFiles.length} file CV. Không thể phân tích tự động, vui lòng điền thông tin thủ công.`);
        setIsParsing(false);
        return;
      }

      setParseProgress({ current: pdfFiles.length, total: pdfFiles.length });

        if (!response.ok) {
        console.warn(`Skipping parse for batch: Server returned ${response.status}`);
        setParseSuccess(`Đã thêm ${pdfFiles.length} file CV. Không thể phân tích tự động, vui lòng điền thông tin thủ công.`);
        setIsParsing(false);
        return;
        }

        let resumeData;
        try {
          resumeData = await response.json();
        } catch (jsonError) {
        console.warn(`Skipping parse for batch: Invalid response format`, jsonError);
        setParseSuccess(`Đã thêm ${pdfFiles.length} file CV. Không thể phân tích tự động, vui lòng điền thông tin thủ công.`);
        setIsParsing(false);
        return;
      }

        if (resumeData && Object.keys(resumeData).length > 0) {
        console.log(`Parsed ResumeData from batch:`, resumeData);
          mergeResumeData(resumeData);
        setParseSuccess(`Đã trích xuất dữ liệu từ ${pdfFiles.length}/${pdfFiles.length} file CV thành công!`);
        } else {
        console.warn(`Skipping parse for batch: Empty response data`);
        setParseSuccess(`Đã thêm ${pdfFiles.length} file CV. Không thể phân tích tự động, vui lòng điền thông tin thủ công.`);
        }
      } catch (err) {
      console.warn(`Skipping parse for batch:`, err.message);
      setParseSuccess(`Đã thêm ${pdfFiles.length} file CV. Không thể phân tích tự động, vui lòng điền thông tin thủ công.`);
    } finally {
    setIsParsing(false);
    }
  };

  const handleRemoveCV = (index) => {
    if (index !== undefined) {
      // Remove specific file
      setCvFiles(prev => prev.filter((_, i) => i !== index));
      setCvPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove all files
      setCvFiles([]);
      setCvPreviews([]);
    }
    setParseError(null);
    setParseSuccess(null);
    // Clear error
    if (errors.cvFiles) {
      setErrors(prev => ({
        ...prev,
        cvFiles: ''
      }));
    }
  };

  // Education handlers — 1 dòng = 1 item education_history (school_name, major, 入学年月=year/month, 卒業年月=endYear/endMonth)
  const handleAddEducation = () => {
    cvInsertPendingRef.current = { type: 'addEducation' };
    setFormData(prev => {
      const r = cvInsertPendingRef.current;
      if (!r || r.type !== 'addEducation') return prev;
      cvInsertPendingRef.current = null;
      return {
      ...prev,
        educations: [...(prev.educations || []), { school_name: '', major: '', year: '', month: '', endYear: '', endMonth: '', content: '' }]
      };
    });
  };

  /** Chèn 1 học vấn tại vị trí index (dùng cho nút 挿入 giữa 2 hàng). Ref tránh Strict Mode gọi 2 lần → chèn 2 mục. */
  const handleInsertEducationAt = (index) => {
    cvInsertPendingRef.current = { type: 'education', index };
    setFormData(prev => {
      const r = cvInsertPendingRef.current;
      if (!r || r.type !== 'education' || r.index !== index) return prev;
      cvInsertPendingRef.current = null;
      const next = [...(prev.educations || [])];
      next.splice(index, 0, { school_name: '', major: '', year: '', month: '', endYear: '', endMonth: '', content: '' });
      return { ...prev, educations: next };
    });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...formData.educations];
    const item = updated[index] || {};
    updated[index] = { ...item, [field]: value };
    if (field === 'school_name' || field === 'major') {
      const sn = field === 'school_name' ? (value || '').trim() : (item.school_name ?? '').toString().trim();
      const mj = field === 'major' ? (value || '').trim() : (item.major ?? '').toString().trim();
      updated[index].content = [sn, mj].filter(Boolean).join(' / ') || '';
    } else if (field === 'content') {
      const parts = (value || '').trim().split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
      updated[index].school_name = parts[0] ?? '';
      updated[index].major = parts.slice(1).join(' / ') ?? '';
    }
    setFormData(prev => ({ ...prev, educations: updated }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index)
    }));
  };

  // Employment handlers — 職歴: thêm tay chỉ 1 hàng đơn; API có thể trả về cặp 入社/退社 (2 item)
  const handleAddWorkExperience = () => {
    cvInsertPendingRef.current = { type: 'addWork' };
    setFormData(prev => {
      const r = cvInsertPendingRef.current;
      if (!r || r.type !== 'addWork') return prev;
      cvInsertPendingRef.current = null;
      const nextList = [...(prev.workExperiences || []),
        { year: '', month: '', period: '', company_name: '', business_purpose: '', scale_role: '', description: '', tools_tech: '' }
      ];
      const nextBlockCount = (prev.workHistoryCount != null ? prev.workHistoryCount : (prev.workExperiences?.length || 0)) + 1;
      return { ...prev, workExperiences: nextList, workHistoryCount: nextBlockCount };
    });
  };

  /** Thêm 1 bảng 職務経歴 (2 block) – dùng cho tab Shokumu CV IT. */
  const handleAddShokumuTable = () => {
    cvInsertPendingRef.current = { type: 'addShokumuTable' };
    setFormData(prev => {
      const r = cvInsertPendingRef.current;
      if (!r || r.type !== 'addShokumuTable') return prev;
      cvInsertPendingRef.current = null;
      const empty = { year: '', month: '', period: '', company_name: '', business_purpose: '', scale_role: '', description: '', tools_tech: '' };
      const nextList = [...(prev.workExperiences || []), empty, { ...empty }];
      const nextBlockCount = (prev.workHistoryCount != null ? prev.workHistoryCount : (prev.workExperiences?.length || 0)) + 2;
      return { ...prev, workExperiences: nextList, workHistoryCount: nextBlockCount };
    });
  };

  /** Chèn 1 hàng 職歴 tại vị trí index (dùng cho nút 挿入 giữa 2 hàng). Ref tránh Strict Mode chèn 2 lần. */
  const handleInsertWorkExperienceAt = (index) => {
    cvInsertPendingRef.current = { type: 'work', index };
    setFormData(prev => {
      const r = cvInsertPendingRef.current;
      if (!r || r.type !== 'work' || r.index !== index) return prev;
      cvInsertPendingRef.current = null;
      const list = [...(prev.workExperiences || [])];
      list.splice(index, 0, { year: '', month: '', period: '', company_name: '', business_purpose: '', scale_role: '', description: '', tools_tech: '' });
      const nextBlockCount = (prev.workHistoryCount != null ? prev.workHistoryCount : list.length);
      return { ...prev, workExperiences: list, workHistoryCount: nextBlockCount };
    });
  };

  /** Chèn 1 block 職歴 (2 dòng 入社/退社) tại vị trí blockIndex (dùng cho bảng 期間/就業先/企業名 khi hiển thị 1 row/block). */
  const handleInsertWorkExperienceBlockAt = (blockIndex) => {
    const rawIdx = blockIndex * 2;
    const empty = { year: '', month: '', period: '', company_name: '', business_purpose: '', scale_role: '', description: '', tools_tech: '' };
    cvInsertPendingRef.current = { type: 'workBlock', rawIdx };
    setFormData(prev => {
      const r = cvInsertPendingRef.current;
      if (!r || r.type !== 'workBlock' || r.rawIdx !== rawIdx) return prev;
      cvInsertPendingRef.current = null;
      const list = [...(prev.workExperiences || [])];
      list.splice(rawIdx, 0, { ...empty }, { ...empty });
      const nextBlockCount = (prev.workHistoryCount != null ? prev.workHistoryCount : Math.ceil(list.length / 2)) + 1;
      return { ...prev, workExperiences: list, workHistoryCount: nextBlockCount };
    });
  };

  const updateEmployment = (index, field, value) => {
    const updated = [...(formData.workExperiences || [])];
    if (!updated[index]) updated[index] = {};
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, workExperiences: updated }));
  };

  /** Cập nhật một cặp 職歴 (1 kinh nghiệm = 2 dòng) — dùng từ block khi sửa period/company_name. */
  const updateEmploymentPair = (blockIndex, field, value) => {
    const list = [...(formData.workExperiences || [])];
    const i0 = blockIndex * 2;
    const i1 = blockIndex * 2 + 1;
    const row0 = list[i0] || {};
    const row1 = list[i1] || {};
    if (field === 'period') {
      const parts = (value || '').split(/\s*~\s*/).map(s => s.trim());
      const startYm = parseApiDateToYearMonth(parts[0] || '');
      const endYm = parseApiDateToYearMonth(parts[1] || '');
      const periodStr = [parts[0], parts[1]].filter(Boolean).join(' ~ ');
      const cn0 = (row0.company_name || '').replace(/\s*入社\s*$/, '').trim();
      const cn1 = (row1.company_name || '').replace(/\s*退社\s*$/, '').trim();
      const companyBase = cn0 || cn1;
      list[i0] = { ...row0, year: startYm.year, month: startYm.month, period: periodStr, company_name: companyBase ? `${companyBase} 入社` : '入社' };
      list[i1] = { ...row1, year: endYm.year, month: endYm.month, period: periodStr, company_name: companyBase ? `${companyBase} 退社` : '退社' };
    } else if (field === 'company_name') {
      const base = (value || '').trim();
      list[i0] = { ...row0, company_name: base ? `${base} 入社` : '入社' };
      list[i1] = { ...row1, company_name: base ? `${base} 退社` : '退社' };
    } else {
      list[i0] = { ...row0, [field]: value };
      list[i1] = { ...row1, [field]: value };
    }
    setFormData(prev => ({ ...prev, workExperiences: list }));
  };

  /** Toggle checkbox 役割・担当業務 / 作業工程 trong bảng 職務経歴 (Shokumu). workIndex = index trong workExperiences, type = 'role' | 'process', key = 'PM' | '要件定義' | ... */
  const toggleShokumuCheckbox = (workIndex, type, key) => {
    const field = type === 'role' ? 'roleCheckboxes' : 'processCheckboxes';
    setFormData(prev => {
      const list = [...(prev.workExperiences || [])];
      const row = list[workIndex] || {};
      const arr = row[field] && Array.isArray(row[field]) ? [...row[field]] : [];
      const idx = arr.indexOf(key);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(key);
      list[workIndex] = { ...row, [field]: arr };
      return { ...prev, workExperiences: list };
    });
  };

  const removeEmployment = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index)
    }));
  };

  /** Xóa một kinh nghiệm (cả cặp 入社 + 退社) — index = block index (thứ tự card). */
  const removeEmploymentPair = (blockIndex) => {
    setFormData(prev => {
      const list = prev.workExperiences || [];
      const i0 = blockIndex * 2;
      const i1 = blockIndex * 2 + 1;
      const nextList = list.filter((_, i) => i !== i0 && i !== i1);
      const nextBlockCount = Math.max(1, (prev.workHistoryCount != null ? prev.workHistoryCount : Math.ceil(list.length / 2)) - 1);
      return { ...prev, workExperiences: nextList, workHistoryCount: nextBlockCount };
    });
  };

  // Certificate handlers
  const handleAddCertificate = () => {
    cvInsertPendingRef.current = { type: 'addCertificate' };
    setFormData(prev => {
      const r = cvInsertPendingRef.current;
      if (!r || r.type !== 'addCertificate') return prev;
      cvInsertPendingRef.current = null;
      return {
      ...prev,
        certificates: [...(prev.certificates || []), { year: '', month: '', name: '' }]
      };
    });
  };

  /** Chèn 1免許・資格 tại vị trí index (dùng cho nút 挿入 giữa 2 hàng). Ref tránh Strict Mode chèn 2 mục. */
  const handleInsertCertificateAt = (index) => {
    cvInsertPendingRef.current = { type: 'certificate', index };
    setFormData(prev => {
      const r = cvInsertPendingRef.current;
      if (!r || r.type !== 'certificate' || r.index !== index) return prev;
      cvInsertPendingRef.current = null;
      const next = [...(prev.certificates || [])];
      next.splice(index, 0, { year: '', month: '', name: '' });
      return { ...prev, certificates: next };
    });
  };

  const updateCertificate = (index, field, value) => {
    const updated = [...formData.certificates];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, certificates: updated }));
  };

  const removeCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  // Tools handlers
  const handleAddLearnedTool = () => {
    setFormData(prev => ({
      ...prev,
      learnedTools: [...prev.learnedTools, '']
    }));
  };

  const updateLearnedTool = (index, value) => {
    const updated = [...formData.learnedTools];
    updated[index] = value;
    setFormData(prev => ({ ...prev, learnedTools: updated }));
  };

  const removeLearnedTool = (index) => {
    setFormData(prev => ({
      ...prev,
      learnedTools: prev.learnedTools.filter((_, i) => i !== index)
    }));
  };

  const handleInsertLearnedToolAt = (index) => {
    setFormData(prev => {
      const next = [...(prev.learnedTools || [])];
      next.splice(index + 1, 0, '');
      return { ...prev, learnedTools: next };
    });
  };

  const handleAddExperienceTool = () => {
    setFormData(prev => ({
      ...prev,
      experienceTools: [...prev.experienceTools, '']
    }));
  };

  const updateExperienceTool = (index, value) => {
    const updated = [...formData.experienceTools];
    updated[index] = value;
    setFormData(prev => ({ ...prev, experienceTools: updated }));
  };

  // Toggle checkbox cho bảng 使用可能ツール・ソフトウェア等枠
  const isToolChecked = (type, name) => {
    const list = type === 'learned' ? (formData.learnedTools || []) : (formData.experienceTools || []);
    return list.includes(name);
  };

  const toggleToolCheckbox = (type, name) => {
    setFormData(prev => {
      const key = type === 'learned' ? 'learnedTools' : 'experienceTools';
      const list = prev[key] || [];
      const exists = list.includes(name);
      const nextList = exists ? list.filter(t => t !== name) : [...list, name];
      return { ...prev, [key]: nextList };
    });
  };

  const removeExperienceTool = (index) => {
    setFormData(prev => ({
      ...prev,
      experienceTools: prev.experienceTools.filter((_, i) => i !== index)
    }));
  };

  const handleInsertExperienceToolAt = (index) => {
    setFormData(prev => {
      const next = [...(prev.experienceTools || [])];
      next.splice(index + 1, 0, '');
      return { ...prev, experienceTools: next };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isAdmin) return true;
    // Validate collaboratorId if provided (Admin only) — luôn coi là string (có thể là number từ API)
    const collaboratorIdStr = formData.collaboratorId != null ? String(formData.collaboratorId).trim() : '';
    if (collaboratorIdStr) {
      const collaboratorIdInt = parseInt(collaboratorIdStr, 10);
      if (isNaN(collaboratorIdInt) || collaboratorIdInt <= 0) {
        newErrors.collaboratorId = 'ID CTV phải là số nguyên dương';
      }
    }
    if (!formData.nameKanji || !formData.nameKanji.trim()) {
      newErrors.nameKanji = 'Họ tên (Kanji) là bắt buộc';
    }
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!candidateId && cvFiles.length === 0) {
      newErrors.cvFiles = 'File CV là bắt buộc';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdmin && !validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const submitFormData = new FormData();
      
      // Map frontend field names to backend field names
      // Personal info
      submitFormData.append('nameKanji', formData.nameKanji || '');
      submitFormData.append('nameKana', formData.nameKana || '');
      submitFormData.append('birthDate', formData.birthDate || '');
      submitFormData.append('age', formData.age || '');
      // Gender: convert from "男"/"女" to 1/2, or keep as is if already number
      let genderValue = formData.gender || '';
      if (genderValue === '男') genderValue = '1';
      else if (genderValue === '女') genderValue = '2';
      submitFormData.append('gender', genderValue);
      
      // Contact info
      submitFormData.append('postalCode', formData.postalCode || '');
      submitFormData.append('address', formData.address || ''); // Backend will map to addressCurrent
      submitFormData.append('phone', formData.phone || '');
      submitFormData.append('email', formData.email || '');
      
      // Residence & Visa Information
      submitFormData.append('addressOrigin', formData.addressOrigin || '');
      if (formData.nearestStationLine) submitFormData.append('nearestStationLine', formData.nearestStationLine);
      if (formData.nearestStationName) submitFormData.append('nearestStationName', formData.nearestStationName);
      if (formData.dependentsCount !== '') submitFormData.append('dependentsCount', formData.dependentsCount);
      if (formData.hasSpouse) submitFormData.append('hasSpouse', formData.hasSpouse === '有' ? '1' : '0');
      if (formData.spouseDependent) submitFormData.append('spouseDependent', formData.spouseDependent === '有' ? '1' : '0');
      if (formData.passport) submitFormData.append('passport', formData.passport);
      if (formData.currentResidence) submitFormData.append('currentResidence', formData.currentResidence);
      if (formData.jpResidenceStatus) submitFormData.append('jpResidenceStatus', formData.jpResidenceStatus);
      if (formData.stayPurpose) submitFormData.append('stayPurpose', formData.stayPurpose);
      if (formData.jpConversationLevel) submitFormData.append('jpConversationLevel', formData.jpConversationLevel);
      if (formData.enConversationLevel) submitFormData.append('enConversationLevel', formData.enConversationLevel);
      if (formData.otherConversationLevel) submitFormData.append('otherConversationLevel', formData.otherConversationLevel);
      submitFormData.append('visaExpirationDate', formData.visaExpirationDate || '');
      submitFormData.append('otherCountry', formData.otherCountry || '');
      
      // JSON fields - send as JSON strings (backend will parse)
      submitFormData.append('educations', JSON.stringify(formData.educations || []));
      submitFormData.append('workExperiences', JSON.stringify(formData.workExperiences || []));
      submitFormData.append('certificates', JSON.stringify(formData.certificates || []));
      if (formData.learnedTools && formData.learnedTools.length > 0) {
        submitFormData.append('learnedTools', JSON.stringify(formData.learnedTools));
      }
      if (formData.experienceTools && formData.experienceTools.length > 0) {
        submitFormData.append('experienceTools', JSON.stringify(formData.experienceTools));
      }
      
      // Skills and summary
      submitFormData.append('technicalSkills', formData.technicalSkills || '');
      if (formData.jlptLevel) submitFormData.append('jlptLevel', formData.jlptLevel);
      if (formData.toeicScore !== undefined && formData.toeicScore !== '') submitFormData.append('toeicScore', formData.toeicScore);
      if (formData.ieltsScore !== undefined && formData.ieltsScore !== '') submitFormData.append('ieltsScore', formData.ieltsScore);
      if (formData.experienceYears) submitFormData.append('experienceYears', formData.experienceYears);
      if (formData.specialization) submitFormData.append('specialization', formData.specialization);
      if (formData.qualification) submitFormData.append('qualification', formData.qualification);
      if (formData.hasDrivingLicense !== '') submitFormData.append('hasDrivingLicense', formData.hasDrivingLicense);
      submitFormData.append('careerSummary', formData.careerSummary || '');
      submitFormData.append('strengths', formData.strengths || '');
      submitFormData.append('notes', formData.remarks || '');
      submitFormData.append('languageSkillRemarks', formData.languageSkillRemarks || '');
      submitFormData.append('hobbiesSpecialSkills', formData.hobbiesSpecialSkills || '');
      submitFormData.append('motivation', formData.motivation || '');
      
      // Preferences
      submitFormData.append('currentSalary', formData.currentSalary || '');
      submitFormData.append('desiredSalary', formData.desiredSalary || '');
      submitFormData.append('desiredPosition', formData.desiredPosition || '');
      submitFormData.append('desiredLocation', formData.desiredLocation || '');
      submitFormData.append('desiredStartDate', formData.desiredStartDate || '');
      
      // Collaborator ID (Admin only) — có thể là number từ API
      const collaboratorIdStr = formData.collaboratorId != null ? String(formData.collaboratorId).trim() : '';
      if (isAdmin && collaboratorIdStr) {
        submitFormData.append('collaboratorId', collaboratorIdStr);
      }

      // Template đã chọn: đồng bộ với form, backend dùng để tạo PDF
      submitFormData.append('cvTemplate', cvTemplate || 'common');
      
      // File upload
      if (cvFiles.length > 0) {
        cvFiles.forEach((file) => {
          submitFormData.append('cvFile', file);
        });
      }
      if (avatarFile) {
        submitFormData.append('avatarPhoto', avatarFile);
      } else if (avatarPreview && typeof avatarPreview === 'string' && avatarPreview.startsWith('data:')) {
        try {
          const res = await fetch(avatarPreview);
          const blob = await res.blob();
          submitFormData.append('avatarPhoto', blob, 'avatar.jpg');
        } catch (_) {}
      }
      // Fallback: gửi luôn data URL để backend nhúng vào PDF nếu file không tới
      if (avatarPreview && typeof avatarPreview === 'string' && avatarPreview.startsWith('data:')) {
        submitFormData.append('avatarBase64', avatarPreview);
      }

      if (isAdmin) {
      const response = candidateId 
        ? await apiService.updateAdminCV(candidateId, submitFormData)
        : await apiService.createAdminCV(submitFormData);
      if (response.success) {
        alert(candidateId ? 'Ứng viên đã được cập nhật thành công!' : 'Ứng viên đã được lưu thành công!');
        navigate(candidateId ? `/admin/candidates/${candidateId}` : '/admin/candidates');
      } else {
        const errorMsg = response.message || (candidateId ? 'Có lỗi xảy ra khi cập nhật ứng viên' : 'Có lỗi xảy ra khi tạo ứng viên');
        alert(errorMsg);
        if (errorMsg.includes('CTV') || errorMsg.includes('collaborator') || errorMsg.includes('collaborator_id')) {
          setErrors(prev => ({ ...prev, collaboratorId: errorMsg }));
          }
        }
      } else {
        // Agent: tạo mới hoặc cập nhật (khi candidateId)
        const response = candidateId
          ? await apiService.updateCVStorage(candidateId, submitFormData)
          : await apiService.createCVStorage(submitFormData);
        if (!candidateId && jobId && response.success && response.data?.cv) {
          try {
            await apiService.createJobApplication({
              jobId: parseInt(jobId),
              cvCode: response.data.cv.code,
              cvSource: 'original'
            });
          } catch (nominateError) {
            console.error('Error creating nomination:', nominateError);
            alert('CV đã được tạo thành công nhưng có lỗi khi tiến cử. Vui lòng thử lại.');
          }
        }
        if (response.success) {
          if (candidateId) {
            alert('Ứng viên đã được cập nhật thành công!');
            if (onSuccess) onSuccess();
            else navigate(`/agent/candidates/${candidateId}`);
          } else {
            const isDuplicate = response.data?.duplicateInfo?.isDuplicate ?? response.data?.isDuplicate;
            if (jobId) {
              alert(isDuplicate ? 'Tiến cử thành công! Hồ sơ đã được đánh dấu trùng với hồ sơ có sẵn trong hệ thống.' : 'Tiến cử thành công!');
              if (onSuccess) onSuccess();
              else navigate(`/agent/jobs/${jobId}`);
            } else {
              alert(isDuplicate ? 'Hồ sơ đã được lưu thành công. Lưu ý: trùng với hồ sơ đã có trong hệ thống.' : 'Ứng viên đã được lưu thành công!');
              if (onSuccess) onSuccess();
              else navigate('/agent/candidates');
            }
          }
        } else {
          alert(response.message || (candidateId ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi lưu thông tin'));
        }
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      const errorMessage = error.message || (isAdmin ? 'Có lỗi xảy ra khi tạo ứng viên' : 'Có lỗi xảy ra khi lưu thông tin');
      alert(errorMessage);
      if (isAdmin && (errorMessage.includes('CTV') || errorMessage.includes('collaborator') || errorMessage.includes('collaborator_id') || errorMessage.includes('foreign key'))) {
        setErrors(prev => ({ 
          ...prev, 
          collaboratorId: errorMessage.includes('CTV') ? errorMessage : 'ID CTV không tồn tại. Vui lòng kiểm tra lại hoặc để trống.'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      if (onCancel) {
        onCancel();
      } else if (isAdmin) {
        navigate(candidateId ? `/admin/candidates/${candidateId}` : '/admin/candidates');
      } else {
        navigate(candidateId ? `/agent/candidates/${candidateId}` : (jobId ? `/agent/jobs/${jobId}` : '/agent/candidates'));
      }
    }
  };

  const getBackPath = () => {
    if (isAdmin) return candidateId ? `/admin/candidates/${candidateId}` : '/admin/candidates';
    if (candidateId) return `/agent/candidates/${candidateId}`;
    return jobId ? `/agent/jobs/${jobId}` : '/agent/candidates';
  };

  return (
    <div className="space-y-3">
      {/* Header - ẩn khi Agent ở chế độ tiến cử (có jobId), sticky khi cuộn */}
      {(!jobId || isAdmin) && (
      <div className="sticky top-0 z-10 rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onCancel && jobId ? onCancel() : navigate(getBackPath()))}
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
            <h1 className="text-lg font-bold" style={{ color: '#111827' }}>{candidateId ? (t.addCandidateTitleEdit || 'Chỉnh sửa ứng viên') : (t.addCandidateTitleNew || 'Tạo ứng viên')}</h1>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>{candidateId ? (t.addCandidateSubtitleEdit || 'Cập nhật thông tin ứng viên') : (t.addCandidateSubtitleNew || 'Thêm thông tin ứng viên mới vào hệ thống')}</p>
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
            {t.cancelButton || 'Hủy'}
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
            {candidateId ? (t.addCandidateUpdate || 'Cập nhật ứng viên') : (t.addCandidateSave || 'Lưu ứng viên')}
          </button>
        </div>
      </div>
      )}

      {/* Upload CV - block riêng trên cùng */}
      <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
          <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
          {t.addCandidateUploadCv || 'Upload CV'}
        </h2>
        {candidateId && existingOriginals.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold mb-2" style={{ color: '#6b7280' }}>{t.addCandidateOriginalFileLabel || 'Các file CV gốc hiện tại:'}</p>
            <div className="space-y-2">
              {existingOriginals.map((item, idx) => (
                <div key={idx} className="rounded-lg p-3 border flex items-center justify-between flex-wrap gap-2" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#16a34a' }} />
                    <span className="text-xs truncate" style={{ color: '#15803d' }} title={item.name}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.viewUrl && (
                      <a href={item.viewUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-2 py-1 rounded" style={{ color: '#2563eb', backgroundColor: '#eff6ff' }}>
                        {t.view || 'Xem'}
                      </a>
                    )}
                    {item.downloadUrl && (
                      <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" download className="text-xs font-medium px-2 py-1 rounded" style={{ color: '#15803d', backgroundColor: '#dcfce7' }}>
                        {t.download || 'Tải'}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>{t.addCandidateAddNewFilesOptional || 'Thêm file mới bên dưới (tùy chọn). Khi lưu sẽ tạo bản snapshot mới.'}</p>
          </div>
        )}
        <div className="mb-3 flex items-center gap-2">
          <input
            id="auto-parse-cv"
            type="checkbox"
            checked={autoParseCv}
            onChange={(e) => setAutoParseCv(e.target.checked)}
            disabled={!!candidateId}
            className="rounded border-gray-300"
          />
          <label htmlFor="auto-parse-cv" className="text-xs" style={{ color: candidateId ? '#9ca3af' : '#374151' }}>
            {t.addCandidateAutoParseCv || 'Tự động phân tích CV khi thêm file'}
            {candidateId && <span className="ml-1" style={{ color: '#6b7280' }}>(tắt khi chỉnh sửa)</span>}
          </label>
        </div>
        {cvFiles.length === 0 ? (
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
            onMouseEnter={() => setHoveredUploadArea(true)}
            onMouseLeave={() => setHoveredUploadArea(false)}
            style={{
              borderColor: hoveredUploadArea ? '#2563eb' : '#d1d5db'
            }}
          >
            <label htmlFor="cv-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                  <Upload className="w-6 h-6" style={{ color: '#9ca3af' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.addCandidateDragDrop || 'Kéo thả file CV vào đây'}</p>
                  <p className="text-[10px]" style={{ color: '#6b7280' }}>{t.addCandidateOr || 'hoặc'}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: '#2563eb' }}>{t.addCandidateSelectFile || 'Chọn file từ máy tính'}</p>
                </div>
                <p className="text-[10px]" style={{ color: '#6b7280' }}>{t.addCandidateSupportPdf || 'Hỗ trợ nhiều file PDF - Tự động trích xuất dữ liệu'}</p>
              </div>
              <input
                id="cv-upload"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              {cvFiles.map((file, index) => (
                <div key={index} className="rounded-lg p-3 border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                        <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: '#111827' }}>{file.name}</p>
                        <p className="text-[10px]" style={{ color: '#6b7280' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCV(index)}
                      onMouseEnter={() => setHoveredRemoveCvButtonIndex(index)}
                      onMouseLeave={() => setHoveredRemoveCvButtonIndex(null)}
                      className="p-1"
                      disabled={isParsing}
                      style={{
                        color: hoveredRemoveCvButtonIndex === index ? '#dc2626' : '#9ca3af',
                        opacity: isParsing ? 0.5 : 1,
                        cursor: isParsing ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label htmlFor="cv-upload-more" className="block">
              <div 
                className="w-full px-4 py-2 border border-dashed rounded-lg text-xs font-medium transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
                onMouseEnter={() => setHoveredAddMoreButton(true)}
                onMouseLeave={() => setHoveredAddMoreButton(false)}
                style={{
                  borderColor: hoveredAddMoreButton ? '#2563eb' : '#d1d5db',
                  color: hoveredAddMoreButton ? '#2563eb' : '#4b5563'
                }}
              >
                <Plus className="w-3.5 h-3.5" /> {t.addCandidateAddPdf || 'Thêm file PDF'}
              </div>
              <input
                id="cv-upload-more"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={isParsing}
              />
            </label>
            {isParsing && (
              <div className="rounded-lg p-3 border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-spin w-4 h-4 border-2 rounded-full" style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }}></div>
                  <p className="text-xs font-medium" style={{ color: '#1e40af' }}>
                    {t.addCandidateParsingCv || 'Đang phân tích CV bằng AI...'} ({parseProgress.current}/{parseProgress.total})
                  </p>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#bfdbfe' }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(parseProgress.current / parseProgress.total) * 100}%`, backgroundColor: '#2563eb' }}
                  ></div>
                </div>
              </div>
            )}
            {parseError && (
              <div className="rounded-lg p-3 border flex items-start gap-2" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                <span className="mt-0.5 text-xs" style={{ color: '#dc2626' }}>⚠️</span>
                <pre className="flex-1 text-xs font-medium whitespace-pre-wrap" style={{ color: '#991b1b' }}>{parseError}</pre>
                <button type="button" onClick={() => setParseError(null)} className="text-xs" style={{ color: '#dc2626' }}>✕</button>
              </div>
            )}
            {parseSuccess && (
              <div className="rounded-lg p-3 border flex items-center gap-2" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <span className="text-xs" style={{ color: '#16a34a' }}>✓</span>
                <p className="flex-1 text-xs font-medium" style={{ color: '#166534' }}>{parseSuccess}</p>
              </div>
            )}
            {cvFiles.length > 1 && !isParsing && (
              <button
                type="button"
                onClick={() => handleRemoveCV()}
                onMouseEnter={() => setHoveredClearAllButton(true)}
                onMouseLeave={() => setHoveredClearAllButton(false)}
                className="w-full px-4 py-2 text-xs rounded-lg transition-colors"
                style={{ color: '#dc2626', backgroundColor: hoveredClearAllButton ? '#fef2f2' : 'transparent' }}
              >
                {t.addCandidateRemoveAllFiles || 'Xóa tất cả file'}
              </button>
            )}
          </div>
        )}
        {errors.cvFiles && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.cvFiles}</p>}
      </div>

      {/* Giao diện 2 cột: cột trái form nhập (1 cột), cột phải template CV (upload đã để trên đầu) */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-3 items-stretch">
        <div className="min-h-0">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
        {/* Block 1: Thông tin CTV (chỉ hiển thị cho Admin) */}
        {isAdmin && (
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <User className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.addCandidateBlock1CtvInfo || 'Thông tin CTV (nếu có)'}
            </h2>
            <div className="space-y-2">
              <p className="text-[10px]" style={{ color: '#6b7280' }}>
                {t.addCandidateCollaboratorEmptyHint || 'Để trống nếu ứng viên không thuộc CTV nào'}
              </p>
              <div ref={collaboratorDropdownRef} className="relative">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateCollaboratorLabel || 'CTV phụ trách'}
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={formData.collaboratorId ? collaboratorDisplayName : collaboratorSearchQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCollaboratorSearchQuery(v);
                    if (formData.collaboratorId) {
                      setFormData(prev => ({ ...prev, collaboratorId: '' }));
                      setCollaboratorDisplayName('');
                    }
                    setCollaboratorDropdownOpen(true);
                  }}
                  placeholder={t.addCandidateCollaboratorPlaceholder || 'Nhập tên hoặc email CTV để tìm kiếm...'}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: errors.collaboratorId ? '#ef4444' : '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                    setCollaboratorDropdownOpen(true);
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.collaboratorId ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {collaboratorDropdownOpen && (collaboratorSearchQuery.trim() || collaboratorSuggestions.length > 0) && (
                  <ul
                    className="absolute z-50 w-full mt-1 py-1 border rounded-lg shadow-lg bg-white max-h-48 overflow-auto text-xs"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    {collaboratorSuggestions.length === 0 ? (
                      <li className="px-3 py-2 text-gray-500">{t.addCandidateCollaboratorSearchHint || 'Nhập tên hoặc email để tìm CTV...'}</li>
                    ) : (
                      collaboratorSuggestions.map((c) => (
                        <li
                          key={c.id}
                          role="button"
                          tabIndex={0}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex flex-col"
                          style={{ color: '#111827' }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFormData(prev => ({ ...prev, collaboratorId: String(c.id) }));
                            setCollaboratorDisplayName(c.name || c.email || c.code || `ID ${c.id}`);
                            setCollaboratorSearchQuery('');
                            setCollaboratorSuggestions([]);
                            setCollaboratorDropdownOpen(false);
                          }}
                        >
                          <span className="font-medium">{c.name || (t.addCandidateNoName || '(Không tên)')}</span>
                          {(c.email || c.code) && <span className="text-gray-500">{[c.email, c.code].filter(Boolean).join(' · ')}</span>}
                        </li>
                      ))
                    )}
                  </ul>
                )}
                {errors.collaboratorId && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.collaboratorId}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Left Column */}
        <div className="space-y-3">
          {/* Block 2: Thông tin cơ bản ứng viên */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <User className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.addCandidateBlock2BasicInfo || 'Thông tin cơ bản của ứng viên'}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateNameKanji || 'Họ tên (Kanji) - 氏名'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nameKanji"
                    value={formData.nameKanji}
                    onChange={handleInputChange}
                    placeholder={t.addCandidatePlaceholderNameKanji || 'VD: 山田 太郎'}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{
                      borderColor: errors.nameKanji ? '#ef4444' : '#d1d5db',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.nameKanji ? '#ef4444' : '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.nameKanji && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.nameKanji}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateNameKana || 'Họ tên (Kana) - ふりがな'}
                  </label>
                  <input
                    type="text"
                    name="nameKana"
                    value={formData.nameKana}
                    onChange={handleInputChange}
                    placeholder={t.addCandidatePlaceholderNameKana || 'VD: やまだ たろう'}
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
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateBirthDate || 'Ngày sinh - 生年月日'}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 z-10 pointer-events-none" style={{ color: '#9ca3af' }} />
                    <DatePicker
                      selected={safeDateForPicker(formData.birthDate)}
                      onChange={handleBirthDateChange}
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                      placeholderText={t.addCandidateSelectBirthDate || 'Chọn ngày sinh'}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
                      style={{
                        borderColor: '#d1d5db',
                        outline: 'none'
                      }}
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={100}
                      scrollableYearDropdown
                      locale="vi"
                      isClearable
                      peekNextMonth
                      showMonthYearPicker={false}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateAge || 'Tuổi - 満歳'}
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="30"
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg text-xs cursor-not-allowed"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: '#f9fafb',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateGender || 'Giới tính - 性別'}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
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
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">{t.addCandidateSelect || 'Chọn'}</option>
                    <option value="男">{t.addCandidateGenderMale || 'Nam (男)'}</option>
                    <option value="女">{t.addCandidateGenderFemale || 'Nữ (女)'}</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-3 mt-3" style={{ borderColor: '#e5e7eb' }}>
                <h3 className="text-xs font-bold mb-3" style={{ color: '#374151' }}>
                  {t.addCandidateContactInfo || 'Thông tin liên hệ (連絡先)'}
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidatePostalCode || 'Mã bưu điện - 〒'}
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder={t.addCandidatePlaceholderPostal || '123-4567'}
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
                        {t.addCandidateAddress || 'Địa chỉ - 現住所'}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder={t.addCandidatePlaceholderAddress || '東京都渋谷区...'}
                          className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
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
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidatePhone || 'Điện thoại - 電話'}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={t.addCandidatePlaceholderPhone || '090-1234-5678'}
                          className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
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
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidateEmail || 'Email'}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t.addCandidatePlaceholderEmail || 'email@example.com'}
                          className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
                          style={{
                            borderColor: errors.email ? '#ef4444' : '#d1d5db',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#2563eb';
                            e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      {errors.email && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.email}</p>}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Residence & Visa Information */}
              <div className="border-t pt-3 mt-3" style={{ borderColor: '#e5e7eb' }}>
                <h3 className="text-xs font-bold mb-3" style={{ color: '#374151' }}>
                  {t.addCandidateResidenceVisa || 'Thông tin cư trú & Visa (在留情報)'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                      {t.addCandidateOriginLabel || 'Địa chỉ gốc - 出身地'}
                    </label>
                    <input
                      type="text"
                      name="addressOrigin"
                      value={formData.addressOrigin}
                      onChange={handleInputChange}
                      placeholder={t.addCandidatePlaceholderOrigin || 'VD: ベトナム ホーチミン市'}
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
                  {/* 現住所の最寄り駅・扶養家族数・配偶者 (Rirekisho) - tách hàng để tránh chồng chéo khi zoom */}
                  <div className="space-y-3">
                    <div className="min-w-0">
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidateNearestStation || '現住所の最寄り駅 - 線・駅'}
                      </label>
                      <div className="flex flex-wrap gap-2 min-w-0">
                        <input
                          type="text"
                          name="nearestStationLine"
                          value={formData.nearestStationLine}
                          onChange={handleInputChange}
                          placeholder={t.addCandidatePlaceholderLine || '線 (VD: 山手線)'}
                          className="min-w-0 flex-1 px-3 py-2 border rounded-lg text-xs"
                          style={{ borderColor: '#d1d5db', outline: 'none', minWidth: '120px' }}
                        />
                        <input
                          type="text"
                          name="nearestStationName"
                          value={formData.nearestStationName}
                          onChange={handleInputChange}
                          placeholder={t.addCandidatePlaceholderStation || '駅 (VD: 渋谷)'}
                          className="min-w-0 flex-1 px-3 py-2 border rounded-lg text-xs"
                          style={{ borderColor: '#d1d5db', outline: 'none', minWidth: '120px' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 min-w-0">
                    <div className="min-w-0">
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidateDependentsLabel || '扶養家族数(配偶者を除く) - 人'}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="dependentsCount"
                        value={formData.dependentsCount}
                        onChange={handleInputChange}
                        placeholder={t.addCandidatePlaceholderDependents || 'Số người (0, 1, 2...)'}
                        className="w-full min-w-0 px-3 py-2 border rounded-lg text-xs"
                        style={{ borderColor: '#d1d5db', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidateSpouse || '配偶者 - 有・無'}
                      </label>
                      <select
                        name="hasSpouse"
                        value={formData.hasSpouse}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                        style={{ borderColor: '#d1d5db', outline: 'none' }}
                      >
                        <option value="">{t.addCandidateSelect || 'Chọn'}</option>
                        <option value="有">{t.addCandidateHasYes || '有 (Có)'}</option>
                        <option value="無">{t.addCandidateHasNo || '無 (Không)'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidateSpouseDependent || '配偶者の扶養義務 - 有・無'}
                      </label>
                      <select
                        name="spouseDependent"
                        value={formData.spouseDependent}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                        style={{ borderColor: '#d1d5db', outline: 'none' }}
                      >
                        <option value="">{t.addCandidateSelect || 'Chọn'}</option>
                        <option value="有">{t.addCandidateHasYes || '有 (Có)'}</option>
                        <option value="無">{t.addCandidateHasNo || '無 (Không)'}</option>
                      </select>
                    </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidatePassport || 'Passport - パスポート'}
                      </label>
                      <select
                        name="passport"
                        value={formData.passport}
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
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">{t.addCandidateSelect || 'Chọn'}</option>
                        <option value="1">{t.addCandidateYes || 'Có'}</option>
                        <option value="0">{t.addCandidateNo || 'Không'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidateCurrentResidence || 'Nơi cư trú hiện tại - 現在の居住地'}
                      </label>
                      <select
                        name="currentResidence"
                        value={formData.currentResidence}
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
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">{t.addCandidateSelect || 'Chọn'}</option>
                        <option value="1">{t.addCandidateJapan || 'Nhật Bản'}</option>
                        <option value="2">{t.addCandidateVietnam || 'Việt Nam'}</option>
                        <option value="3">{t.addCandidateOther || 'Khác'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidateResidenceStatus || 'Tình trạng cư trú tại Nhật - 在留資格'}
                      </label>
                      <select
                        name="jpResidenceStatus"
                        value={formData.jpResidenceStatus}
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
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">{t.addCandidateSelect || 'Chọn'}</option>
                        <option value="1">{t.addCandidateResStatusTech || '技術・人文知識・国際業務'}</option>
                        <option value="2">{t.addCandidateResStatusSpecific || '特定技能'}</option>
                        <option value="3">{t.addCandidateResStatusStudent || '留学'}</option>
                        <option value="4">{t.addCandidateResStatusPermanent || '永住者'}</option>
                        <option value="5">{t.addCandidateResStatusSpouse || '日本人の配偶者等'}</option>
                        <option value="6">{t.addCandidateResStatusSettled || '定住者'}</option>
                        <option value="7">{t.addCandidateResStatusOther || 'その他'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                        {t.addCandidateVisaExpiry || 'Ngày hết hạn Visa - 在留期限'}
                      </label>
                      <DatePicker
                        selected={safeDateForPicker(formData.visaExpirationDate)}
                        onChange={(date) => {
                          if (date) {
                            setFormData(prev => ({
                              ...prev,
                              visaExpirationDate: date.toISOString().split('T')[0]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              visaExpirationDate: ''
                            }));
                          }
                        }}
                        dateFormat="yyyy-MM-dd"
                        placeholderText={t.addCandidateSelectExpiry || 'Chọn ngày hết hạn'}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                        style={{
                          borderColor: '#d1d5db',
                          outline: 'none'
                        }}
                        isClearable
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                      {t.addCandidateOtherCountryLabel || 'Quốc gia khác - その他の国'}
                    </label>
                    <input
                      type="text"
                      name="otherCountry"
                      value={formData.otherCountry}
                      onChange={handleInputChange}
                      placeholder={t.addCandidatePlaceholderOtherCountry || 'VD: アメリカ'}
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
                </div>
              </div>
            </div>
          </div>

          {/* Block 3: Học vấn & Kinh nghiệm */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <GraduationCap className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.addCandidateBlock3Education || 'Học vấn (学歴)'}
            </h2>
            <div className="space-y-3">
              {formData.educations.map((edu, index) => (
                <div key={index} className="p-3 rounded-lg border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold" style={{ color: '#6b7280' }}>#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      onMouseEnter={() => setHoveredRemoveEducationButtonIndex(index)}
                      onMouseLeave={() => setHoveredRemoveEducationButtonIndex(null)}
                      style={{
                        color: hoveredRemoveEducationButtonIndex === index ? '#b91c1c' : '#ef4444'
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      value={edu.content ?? ''}
                      onChange={(e) => updateEducation(index, 'content', e.target.value)}
                      placeholder={t.addCandidatePlaceholderSchool || 'Tên trường, ngành học...'}
                      className="w-full px-2 py-1.5 border rounded text-xs"
                      style={{ borderColor: '#d1d5db' }}
                    />
                    <div className="grid grid-cols-6 gap-2 items-center">
                      <span className="text-[10px] text-gray-500">入学</span>
                      <input type="text" value={edu.year ?? ''} onChange={(e) => updateEducation(index, 'year', e.target.value)} placeholder="年" className="px-2 py-1.5 border rounded text-xs" style={{ borderColor: '#d1d5db' }} />
                      <input type="text" value={edu.month ?? ''} onChange={(e) => updateEducation(index, 'month', e.target.value)} placeholder="月" className="px-2 py-1.5 border rounded text-xs" style={{ borderColor: '#d1d5db' }} />
                      <span className="text-[10px] text-gray-500">卒業</span>
                      <input type="text" value={edu.endYear ?? ''} onChange={(e) => updateEducation(index, 'endYear', e.target.value)} placeholder="年" className="px-2 py-1.5 border rounded text-xs" style={{ borderColor: '#d1d5db' }} />
                      <input type="text" value={edu.endMonth ?? ''} onChange={(e) => updateEducation(index, 'endMonth', e.target.value)} placeholder="月" className="px-2 py-1.5 border rounded text-xs" style={{ borderColor: '#d1d5db' }} />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddEducation}
                onMouseEnter={() => setHoveredAddEducationButton(true)}
                onMouseLeave={() => setHoveredAddEducationButton(false)}
                className="w-full px-4 py-2 border-2 border-dashed rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                style={{
                  borderColor: hoveredAddEducationButton ? '#2563eb' : '#d1d5db',
                  color: hoveredAddEducationButton ? '#2563eb' : '#4b5563'
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addCandidateAddEducation || 'Thêm học vấn'}
              </button>
            </div>
          </div>

          {/* Work Experience — 1 card = 1 kinh nghiệm (cặp 入社 + 退社), bảng 職歴 hiển thị 2 dòng/card */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Briefcase className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.addCandidateBlock3WorkExp || 'Kinh nghiệm làm việc (職歴)'}
            </h2>
            <div className="space-y-3">
              {(() => {
                const list = formData.workExperiences || [];
                const pairs = [];
                for (let i = 0; i < list.length; i += 2) pairs.push(list.slice(i, i + 2));
                return pairs.map((pair, blockIndex) => {
                  const row0 = pair[0] || {};
                  const row1 = pair[1] || {};
                  const periodDisplay = row0.period || ([row0.year, row0.month, row1.year, row1.month].every(Boolean)
                    ? `${row0.year}/${row0.month} ~ ${row1.year}/${row1.month}` : '');
                  const companyDisplay = (row0.company_name || '').replace(/\s*入社\s*$/, '').trim();
                  return (
                <div key={blockIndex} className="p-3 rounded-lg border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold" style={{ color: '#6b7280' }}>#{blockIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEmploymentPair(blockIndex)}
                      onMouseEnter={() => setHoveredRemoveWorkExperienceButtonIndex(blockIndex)}
                      onMouseLeave={() => setHoveredRemoveWorkExperienceButtonIndex(null)}
                      style={{
                        color: hoveredRemoveWorkExperienceButtonIndex === blockIndex ? '#b91c1c' : '#ef4444'
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={periodDisplay}
                        onChange={(e) => updateEmploymentPair(blockIndex, 'period', e.target.value)}
                        placeholder={t.addCandidatePlaceholderPeriod || 'Thời gian (YYYY/MM - YYYY/MM)'}
                        className="px-2 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db' }}
                      />
                      <input
                        type="text"
                        value={companyDisplay}
                        onChange={(e) => updateEmploymentPair(blockIndex, 'company_name', e.target.value)}
                        placeholder={t.addCandidatePlaceholderCompany || 'Tên công ty'}
                        className="px-2 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db' }}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={row0.business_purpose}
                        onChange={(e) => updateEmploymentPair(blockIndex, 'business_purpose', e.target.value)}
                        placeholder={t.addCandidatePlaceholderBusiness || 'Lĩnh vực kinh doanh (事業目的)'}
                        className="px-2 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db' }}
                      />
                      <input
                        type="text"
                        value={row0.scale_role}
                        onChange={(e) => updateEmploymentPair(blockIndex, 'scale_role', e.target.value)}
                        placeholder={t.addCandidatePlaceholderScale || 'Quy mô / Vai trò (規模／役割)'}
                        className="px-2 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db' }}
                      />
                    </div>
                    <textarea
                      value={row0.description}
                      onChange={(e) => updateEmploymentPair(blockIndex, 'description', e.target.value)}
                      placeholder={t.addCandidatePlaceholderJobDesc || 'Mô tả công việc (業務内容)'}
                      rows={2}
                      className="w-full px-2 py-1.5 border rounded text-xs"
                      style={{ borderColor: '#d1d5db' }}
                    />
                    <input
                      type="text"
                      value={row0.tools_tech}
                      onChange={(e) => updateEmploymentPair(blockIndex, 'tools_tech', e.target.value)}
                      placeholder={t.addCandidatePlaceholderTools || 'Công cụ, công nghệ (ツール)'}
                      className="w-full px-2 py-1.5 border rounded text-xs"
                      style={{ borderColor: '#d1d5db' }}
                    />
                  </div>
                </div>
                  );
                });
              })()}
              <button
                type="button"
                onClick={handleAddWorkExperience}
                onMouseEnter={() => setHoveredAddWorkExperienceButton(true)}
                onMouseLeave={() => setHoveredAddWorkExperienceButton(false)}
                className="w-full px-4 py-2 border-2 border-dashed rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                style={{
                  borderColor: hoveredAddWorkExperienceButton ? '#2563eb' : '#d1d5db',
                  color: hoveredAddWorkExperienceButton ? '#2563eb' : '#4b5563'
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addCandidateAddWorkExp || 'Thêm kinh nghiệm'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Ảnh chân dung (証明写真) - thuộc Block 2 trong layout mới, nhưng hiển thị cột phải để dễ xem */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <UserCircle className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.addCandidatePortrait || 'Ảnh chân dung (証明写真)'}
            </h2>
            <p className="text-[10px] mb-3" style={{ color: '#6b7280' }}>{t.addCandidatePortraitHint || 'Ảnh sẽ hiển thị đúng vị trí trong template CV và được xuất kèm khi tải PDF.'}</p>
            {!avatarPreview ? (
              <label className="block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-blue-400" style={{ borderColor: '#e5e7eb' }}>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#9ca3af' }} />
                <span className="text-xs font-medium" style={{ color: '#374151' }}>{t.addCandidateSelectImage || 'Chọn ảnh (JPG, PNG)'}</span>
              </label>
            ) : (
              <div className="flex items-start gap-3">
                {/* Khung ảnh cố định 3:4 (96×128px) */}
                <div className="rounded border flex-shrink-0 overflow-hidden bg-gray-100" style={{ borderColor: '#e5e7eb', width: 96, height: 128 }}>
                  <img src={avatarPreview} alt="Chân dung" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-2" style={{ color: '#111827' }}>{t.addCandidatePortraitSelected || 'Đã chọn ảnh chân dung'}</p>
                  <button type="button" onClick={handleRemoveAvatar} className="text-xs px-3 py-1.5 rounded border transition-colors" style={{ borderColor: '#e5e7eb', color: '#dc2626' }}>
                    {t.addCandidateRemoveImage || 'Xóa ảnh'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Kỹ năng & Chứng chỉ */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Award className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.addCandidateBlock4SkillsCerts || 'Thông tin Kỹ năng & Chứng chỉ (資格)'}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateJlptLabel || 'JLPT Level - 日本語能力試験'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold pointer-events-none" style={{ color: '#4b5563' }}>N</span>
                    <input
                      type="number"
                      name="jlptLevel"
                      value={formData.jlptLevel}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                      placeholder="1-5"
                      className="w-full pl-6 pr-3 py-2 border rounded-lg text-xs"
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
                  <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>{t.addCandidateJlptHint || 'Nhập số từ 1 (N1) đến 5 (N5)'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateExpYears || 'Số năm kinh nghiệm - 経験年数'}
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    placeholder={t.addCandidatePlaceholderExpYears || 'VD: 3'}
                    min="0"
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
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateSpecialization || 'Chuyên ngành - 専門分野'}
                  </label>
                  <input
                    type="number"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder={t.addCandidatePlaceholderSpecialization || 'ID chuyên ngành'}
                    min="0"
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
                    {t.addCandidateQualification || 'Bằng cấp - 資格'}
                  </label>
                  <input
                    type="number"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    placeholder={t.addCandidatePlaceholderQualification || 'ID bằng cấp'}
                    min="0"
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
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateTechnicalSkills || 'Kỹ năng kỹ thuật (活かせる経験・知識・技術)'}
                </label>
                <textarea
                  name="technicalSkills"
                  value={formData.technicalSkills}
                  onChange={handleInputChange}
                  placeholder={t.addCandidatePlaceholderTechSkills || 'VD: Project Management, React, Python...'}
                  rows="3"
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
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateCertificatesLabel || 'Chứng chỉ (免許・資格)'}
                </label>
                <div className="space-y-2">
                  {formData.certificates.map((cert, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={cert.year}
                        onChange={(e) => updateCertificate(index, 'year', e.target.value)}
                        placeholder={t.addCandidatePlaceholderYear || 'Năm (年)'}
                        className="w-16 px-2 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db' }}
                      />
                      <input
                        type="text"
                        value={cert.month}
                        onChange={(e) => updateCertificate(index, 'month', e.target.value)}
                        placeholder={t.addCandidatePlaceholderMonth || 'Tháng (月)'}
                        className="w-16 px-2 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db' }}
                      />
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                        placeholder={t.addCandidatePlaceholderCertName || 'Tên chứng chỉ'}
                        className="flex-1 px-2 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        onMouseEnter={() => setHoveredRemoveCertificateButtonIndex(index)}
                        onMouseLeave={() => setHoveredRemoveCertificateButtonIndex(null)}
                        style={{
                          color: hoveredRemoveCertificateButtonIndex === index ? '#b91c1c' : '#ef4444'
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCertificate}
                    onMouseEnter={() => setHoveredAddCertificateButton(true)}
                    onMouseLeave={() => setHoveredAddCertificateButton(false)}
                    className="text-xs flex items-center gap-1"
                    style={{
                      color: hoveredAddCertificateButton ? '#1d4ed8' : '#2563eb'
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.addCandidateAddCertificate || 'Thêm chứng chỉ'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateLearnedToolsLabel || 'Công cụ đã học - 学習したツール'}
                </label>
                <div className="space-y-2">
                  {formData.learnedTools.map((tool, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={tool}
                        onChange={(e) => updateLearnedTool(index, e.target.value)}
                        placeholder={t.addCandidatePlaceholderLearned || 'VD: React, Python, Docker...'}
                        className="flex-1 px-2 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleInsertLearnedToolAt(index)}
                        className="text-xs px-1.5 py-1 rounded border transition-colors"
                        style={{ borderColor: '#d1d5db', color: '#2563eb' }}
                        title={t.addCandidateInsertRow || 'Chèn dòng tại đây'}
                      >
                        {t.addCandidateInsertRow || 'Chèn'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLearnedTool(index)}
                        onMouseEnter={() => setHoveredRemoveLearnedToolButtonIndex(index)}
                        onMouseLeave={() => setHoveredRemoveLearnedToolButtonIndex(null)}
                        style={{
                          color: hoveredRemoveLearnedToolButtonIndex === index ? '#b91c1c' : '#ef4444'
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddLearnedTool}
                    onMouseEnter={() => setHoveredAddLearnedToolButton(true)}
                    onMouseLeave={() => setHoveredAddLearnedToolButton(false)}
                    className="text-xs flex items-center gap-1"
                    style={{
                      color: hoveredAddLearnedToolButton ? '#1d4ed8' : '#2563eb'
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.addCandidateAddLearnedTool || 'Thêm công cụ đã học'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateExpToolsLabel || 'Công cụ có kinh nghiệm - 経験のあるツール'}
                </label>
                <div className="space-y-2">
                  {formData.experienceTools.map((tool, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={tool}
                        onChange={(e) => updateExperienceTool(index, e.target.value)}
                        placeholder={t.addCandidatePlaceholderExp || 'VD: AWS, Kubernetes, TypeScript...'}
                        className="flex-1 px-2 py-1.5 border rounded text-xs"
                        style={{ borderColor: '#d1d5db' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleInsertExperienceToolAt(index)}
                        className="text-xs px-1.5 py-1 rounded border transition-colors"
                        style={{ borderColor: '#d1d5db', color: '#2563eb' }}
                        title={t.addCandidateInsertRow || 'Chèn dòng tại đây'}
                      >
                        {t.addCandidateInsertRow || 'Chèn'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExperienceTool(index)}
                        onMouseEnter={() => setHoveredRemoveExperienceToolButtonIndex(index)}
                        onMouseLeave={() => setHoveredRemoveExperienceToolButtonIndex(null)}
                        style={{
                          color: hoveredRemoveExperienceToolButtonIndex === index ? '#b91c1c' : '#ef4444'
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddExperienceTool}
                    onMouseEnter={() => setHoveredAddExperienceToolButton(true)}
                    onMouseLeave={() => setHoveredAddExperienceToolButton(false)}
                    className="text-xs flex items-center gap-1"
                    style={{
                      color: hoveredAddExperienceToolButton ? '#1d4ed8' : '#2563eb'
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.addCandidateAddExpTool || 'Thêm công cụ có kinh nghiệm'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Giới thiệu bản thân */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <UserCircle className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.addCandidateBlock5SelfIntro || 'Giới thiệu bản thân (自己PR)'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateCareerSummary || 'Tóm tắt nghề nghiệp (職務要約)'}
                </label>
                <textarea
                  name="careerSummary"
                  value={formData.careerSummary}
                  onChange={handleInputChange}
                  placeholder={t.addCandidatePlaceholderSummary || 'Tóm tắt kinh nghiệm làm việc...'}
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
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateStrengths || 'Điểm mạnh (自己PR)'}
                </label>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleInputChange}
                  placeholder={t.addCandidatePlaceholderStrengths || 'Điểm mạnh của bạn...'}
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
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateHobbies || '趣味・特技 (Sở thích / Kỹ năng đặc biệt)'}
                </label>
                <textarea
                  name="hobbiesSpecialSkills"
                  value={formData.hobbiesSpecialSkills}
                  onChange={handleInputChange}
                  placeholder={t.addCandidatePlaceholderHobbies || 'VD: 読書、プログラミング...'}
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
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateMotivationLabel || 'Động lực ứng tuyển (志望動機)'}
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  placeholder={t.addCandidatePlaceholderMotivation || 'Lý do muốn ứng tuyển...'}
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
            </div>
          </div>

          {/* Mong muốn */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              {t.addCandidateBlock6Preferences || 'Mong muốn (希望)'}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateCurrentSalaryLabel || 'Lương hiện tại (現在年収)'}
                  </label>
                  <input
                    type="text"
                    name="currentSalary"
                    value={formData.currentSalary}
                    onChange={handleInputChange}
                    placeholder={t.addCandidatePlaceholderCurrentSalary || 'VD: 500万円'}
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
                    {t.addCandidateDesiredSalaryLabel || 'Lương mong muốn (希望年収)'}
                  </label>
                  <input
                    type="text"
                    name="desiredSalary"
                    value={formData.desiredSalary}
                    onChange={handleInputChange}
                    placeholder={t.addCandidatePlaceholderDesiredSalary || 'VD: 600万円'}
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
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  {t.addCandidateDesiredPosition || 'Vị trí mong muốn (希望職種)'}
                </label>
                <input
                  type="text"
                  name="desiredPosition"
                  value={formData.desiredPosition}
                  onChange={handleInputChange}
                  placeholder={t.addCandidatePlaceholderPosition || 'VD: Software Engineer'}
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
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    {t.addCandidateDesiredLocation || 'Địa điểm (希望勤務地)'}
                  </label>
                  <input
                    type="text"
                    name="desiredLocation"
                    value={formData.desiredLocation}
                    onChange={handleInputChange}
                    placeholder={t.addCandidatePlaceholderLocation || 'VD: Tokyo'}
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
                    {t.addCandidateDesiredStartDate || 'Ngày bắt đầu (希望入社日)'}
                  </label>
                  <input
                    type="text"
                    name="desiredStartDate"
                    value={formData.desiredStartDate}
                    onChange={handleInputChange}
                    placeholder={t.addCandidatePlaceholderStartDate || 'VD: 2025年4月'}
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
              </div>
            </div>
          </div>
        </div>
      </form>
        </div>

        {/* Cột bên phải: Xem CV theo template - fill chiều cao, không trống */}
        <div className="flex flex-col min-h-[320px] lg:min-h-0">
          <div
            className="rounded-lg border overflow-hidden flex flex-col flex-1 min-h-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)]"
            style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
            <button
              type="button"
              onClick={() => setShowCvPreview((v) => !v)}
              className="flex items-center gap-2 text-left font-semibold text-sm transition-colors hover:bg-gray-50 flex-1"
              style={{ color: '#111827' }}
            >
              <Eye className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.addCandidateCvPreview || 'Xem CV theo template'}
            </button>
            </div>
            {showCvPreview && (
              <div
                className="p-4 overflow-y-auto flex-1 min-h-0 bg-gray-50"
                style={{
                  backgroundColor: '#fafafa',
                }}
              >
                {/* Chọn template: Template chung | CV_It | CV kĩ thuật */}
                <div className="flex flex-wrap gap-2 mb-3 items-center w-full">
                  <button
                    type="button"
                    onClick={() => setCvTemplate('common')}
                    className="px-3 py-2 text-xs font-medium rounded-md border transition-colors"
                    style={{
                      color: cvTemplate === 'common' ? '#2563eb' : '#6b7280',
                      borderColor: cvTemplate === 'common' ? '#2563eb' : '#e5e7eb',
                      backgroundColor: cvTemplate === 'common' ? '#eff6ff' : 'white',
                    }}
                  >
                    {t.addCandidateTemplateCommon || 'Template chung'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCvTemplate('cv_it')}
                    className="px-3 py-2 text-xs font-medium rounded-md border transition-colors"
                    style={{
                      color: cvTemplate === 'cv_it' ? '#2563eb' : '#6b7280',
                      borderColor: cvTemplate === 'cv_it' ? '#2563eb' : '#e5e7eb',
                      backgroundColor: cvTemplate === 'cv_it' ? '#eff6ff' : 'white',
                    }}
                  >
                    {t.addCandidateTemplateCvIt || 'CV IT'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCvTemplate('cv_technical')}
                    className="px-3 py-2 text-xs font-medium rounded-md border transition-colors"
                    style={{
                      color: cvTemplate === 'cv_technical' ? '#2563eb' : '#6b7280',
                      borderColor: cvTemplate === 'cv_technical' ? '#2563eb' : '#e5e7eb',
                      backgroundColor: cvTemplate === 'cv_technical' ? '#eff6ff' : 'white',
                    }}
                  >
                    {t.addCandidateTemplateCvTech || 'CV kĩ thuật'}
                  </button>
                </div>

                {/* Template chung */}
                {cvTemplate === 'common' && (
                  <CvTemplateCommon
                    formData={formData}
                    cvFormatTab={cvFormatTab}
                    setCvFormatTab={setCvFormatTab}
                    cvEditable={cvEditable}
                    cvEditableArray={cvEditableArray}
                    cvEditableWithDefault={cvEditableWithDefault}
                    getDefaultCvDate={getDefaultCvDate}
                    handleAddEducation={handleAddEducation}
                    handleAddWorkExperience={handleAddWorkExperience}
                    handleAddCertificate={handleAddCertificate}
                    handleInsertEducationAt={handleInsertEducationAt}
                    handleInsertWorkExperienceAt={handleInsertWorkExperienceAt}
                    handleInsertCertificateAt={handleInsertCertificateAt}
                    handleBackendPreviewWithOptions={handleBackendPreviewWithOptions}
                    avatarPreview={avatarPreview}
                  />
                )}

                {/* CV IT Template */}
                        {cvTemplate === 'cv_it' && (
                  <CvTemplateIt
                    formData={formData}
                    setFormData={setFormData}
                    activeTab={cvItTab}
                    setActiveTab={setCvItTab}
                    cvEditable={cvEditable}
                    cvEditableArray={cvEditableArray}
                    cvEditableWithDefault={cvEditableWithDefault}
                    getDefaultCvDate={getDefaultCvDate}
                    updateEmployment={updateEmployment}
                    updateEmploymentPair={updateEmploymentPair}
                    toggleShokumuCheckbox={toggleShokumuCheckbox}
                    handleAddWorkExperience={handleAddWorkExperience}
                    handleAddShokumuTable={handleAddShokumuTable}
                    handleInsertWorkExperienceAt={handleInsertWorkExperienceAt}
                    handleInsertWorkExperienceBlockAt={handleInsertWorkExperienceBlockAt}
                    handleBackendPreviewWithOptions={handleBackendPreviewWithOptions}
                    avatarPreview={avatarPreview}
                  />
                )}

                {/* CV Kỹ thuật Template */}
                {cvTemplate === 'cv_technical' && (
                  <CvTemplateTechnical
                    formData={formData}
                    setFormData={setFormData}
                    activeTab={cvTechnicalTab}
                    setActiveTab={setCvTechnicalTab}
                    cvEditable={cvEditable}
                    cvEditableArray={cvEditableArray}
                    cvEditableWithDefault={cvEditableWithDefault}
                    getDefaultCvDate={getDefaultCvDate}
                    isToolChecked={isToolChecked}
                    toggleToolCheckbox={toggleToolCheckbox}
                    updateEmployment={updateEmployment}
                    updateEmploymentPair={updateEmploymentPair}
                    toggleShokumuCheckbox={toggleShokumuCheckbox}
                    handleAddWorkExperience={handleAddWorkExperience}
                    handleInsertWorkExperienceAt={handleInsertWorkExperienceAt}
                    handleInsertWorkExperienceBlockAt={handleInsertWorkExperienceBlockAt}
                    handleBackendPreviewWithOptions={handleBackendPreviewWithOptions}
                    avatarPreview={avatarPreview}
                  />
                        )}
                      </div>
                    )}
                  </div>
        </div>
      </div>

      {/* Footer cho chế độ tiến cử (có jobId) */}
      {jobId && (
        <div className="flex justify-end gap-3 pt-4 border-t rounded-2xl p-4 mt-4" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
        <button
          type="button"
          onClick={handleCancel}
            className="px-4 py-2 border rounded-lg font-medium transition-colors"
          style={{
              borderColor: '#d1d5db',
              color: '#374151',
              backgroundColor: '#f3f4f6'
          }}
        >
          {t.cancelButton || 'Hủy'}
        </button>
        <button
            type="button"
          onClick={handleSubmit}
          disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold transition-colors"
          style={{
              backgroundColor: loading ? '#93c5fd' : '#facc15',
              color: '#1e3a8a',
              opacity: loading ? 0.7 : 1
            }}
          >
            {t.addCandidateNominate || 'Tiến cử ứng viên'}
        </button>
      </div>
      )}

      {/* Popup preview CV – cả 2 tab (履歴書 + 職務経歴書), không điều hướng */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={() => { setShowPreviewModal(false); setPreviewHtml(''); }}
        >
          <div
            className="relative rounded-xl shadow-2xl flex flex-col bg-white overflow-hidden"
            style={{ width: '95vw', maxWidth: '960px', maxHeight: '95vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>Preview CV (履歴書 + 職務経歴書)</span>
              <button
                type="button"
                onClick={() => { setShowPreviewModal(false); setPreviewHtml(''); }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {previewLoading ? (
              <div className="flex items-center justify-center p-16">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: '#2563eb' }} />
              </div>
            ) : (
              <iframe
                srcDoc={previewHtml}
                title="Preview CV"
                className="w-full border-0 flex-1 min-h-0"
                style={{ minHeight: '75vh' }}
              />
            )}
          </div>
      </div>
      )}
    </div>
  );
};

export default AddCandidateForm;

