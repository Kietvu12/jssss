import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  GraduationCap,
  Briefcase,
  Award,
  UserCircle,
  DollarSign,
  Folder,
  ChevronRight,
  Archive,
  RotateCcw,
  CheckCircle2,
  Pencil,
  Trash2,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import CvFilePreview from '../Admin/CvFilePreview';

const LABELS_VI = {
  detailTab: 'Chi tiết hồ sơ',
  historyTab: 'Lịch sử chỉnh sửa',
  backToList: 'Quay lại danh sách',
  candidateNotFound: 'Không tìm thấy thông tin ứng viên',
  personalInfo: 'Thông tin cá nhân',
  cvCode: 'Mã CV',
  nameKanji: 'Họ tên (Kanji)',
  nameKana: 'Họ tên (Kana)',
  birthDate: 'Ngày sinh',
  age: 'Tuổi',
  gender: 'Giới tính',
  email: 'Email',
  phone: 'Số điện thoại',
  postalCode: 'Mã bưu điện',
  address: 'Địa chỉ',
  collaborator: 'CTV',
  receiveDate: 'Ngày nhận',
  education: 'Học vấn',
  noEducation: 'Chưa có thông tin học vấn',
  year: 'Năm',
  month: 'Tháng',
  content: 'Nội dung',
  workExp: 'Kinh nghiệm',
  noWorkExp: 'Chưa có thông tin kinh nghiệm làm việc',
  period: 'Thời gian',
  companyName: 'Tên công ty',
  businessField: 'Lĩnh vực kinh doanh',
  scaleRole: 'Quy mô / Vai trò',
  jobDesc: 'Mô tả công việc',
  toolsTech: 'Công cụ, công nghệ',
  skillsCerts: 'Kỹ năng & Chứng chỉ',
  technicalSkills: 'Kỹ năng kỹ thuật',
  certificates: 'Chứng chỉ',
  noCertificates: 'Chưa có chứng chỉ',
  certName: 'Tên',
  introduction: 'Giới thiệu',
  careerSummary: 'Tóm tắt nghề nghiệp',
  strengths: 'Điểm mạnh',
  motivation: 'Động lực ứng tuyển',
  desires: 'Mong muốn',
  currentSalary: 'Lương hiện tại',
  desiredSalary: 'Lương mong muốn',
  desiredPosition: 'Vị trí mong muốn',
  desiredLocation: 'Địa điểm mong muốn',
  desiredStartDate: 'Ngày bắt đầu mong muốn',
  cvFile: 'File CV',
  otherDocs: 'Tài liệu khác',
  download: 'Tải xuống',
  loadingFiles: 'Đang tải danh sách file...',
  duplicate: 'Trùng lặp',
  edit: 'Chỉnh sửa hồ sơ',
  delete: 'Xóa hồ sơ',
  statusDraft: 'Nháp',
  statusActive: 'Hoạt động',
  statusArchived: 'Lưu trữ',
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
  confirmDelete: 'Bạn có chắc muốn xóa ứng viên này? Hành động này không thể hoàn tác.',
  deleteSuccess: 'Xóa ứng viên thành công!',
  deleteError: 'Có lỗi xảy ra khi xóa ứng viên',
  cvNoFile: 'Không có file CV để tải xuống',
  cvLinkError: 'Không lấy được link tải file',
  cvDownloadError: 'Không thể tải file CV. Vui lòng thử lại sau.',
  zipError: 'Không thể tải file ZIP. Vui lòng thử lại.',
  zipSnapshotError: 'Không thể tải file ZIP snapshot. Vui lòng thử lại.',
  rollbackConfirm: 'Rollback về snapshot này sẽ tạo snapshot mới và đặt làm bản hiện tại. Tiếp tục?',
  rollbackFail: 'Rollback thất bại. Vui lòng thử lại.',
  historyLoading: 'Đang tải lịch sử snapshot...',
  noSnapshot: 'Chưa có snapshot hoặc không đọc được lịch sử.',
  matchingTitle: 'Gợi ý việc làm phù hợp (AI)',
  matchingLoading: 'Đang tải gợi ý AI...',
  matchingError: 'Không tải được gợi ý AI.',
  matchingEmpty: 'Chưa có gợi ý phù hợp.',
  matchingScore: 'Điểm match',
  matchingReason: 'Lý do',
  matchingViewReason: 'Xem lý do',
  matchingHideReason: 'Ẩn lý do',
  matchingOpenJob: 'Mở job',
  matchingFilteredNote: 'Chỉ hiển thị các job bạn được xem trên hệ thống (CTV).',
  matchingLoadReasonError: 'Không lấy được lý do.',
};

/**
 * Shared candidate detail page for Admin and Collaborator (CTV).
 * @param { 'admin' | 'collaborator' } variant - Which API and routes to use
 */
const CandidateDetailPage = ({ variant = 'admin' }) => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const lbl = (key) => t[key] ?? LABELS_VI[key] ?? key;

  const isAdmin = variant === 'admin';
  const backPath = isAdmin ? '/admin/candidates' : '/agent/candidates';
  const editPath = isAdmin ? `/admin/candidates/${candidateId}/edit` : `/agent/candidates/${candidateId}/edit`;

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('detail');
  const [deleting, setDeleting] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [cvFileList, setCvFileList] = useState({ originals: [], templates: [] });
  const [openFolders, setOpenFolders] = useState({
    CV_original: false,
    CV_Template: false,
    'CV_Template/Common': false,
    'CV_Template/IT': false,
    'CV_Template/Technical': false,
  });
  const [snapshots, setSnapshots] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [openSnapshots, setOpenSnapshots] = useState({});
  const [openSnapshotFolders, setOpenSnapshotFolders] = useState({});
  const [rollbackingDateTime, setRollbackingDateTime] = useState(null);

  const [aiMatches, setAiMatches] = useState([]);
  const [aiMatchLoading, setAiMatchLoading] = useState(false);
  const [aiMatchError, setAiMatchError] = useState(null);
  const [aiJobTitles, setAiJobTitles] = useState({});
  const [expandedAiJobId, setExpandedAiJobId] = useState(null);
  const [aiReasonByJobId, setAiReasonByJobId] = useState({});
  const [aiReasonLoadingId, setAiReasonLoadingId] = useState(null);

  const loadCandidateDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = isAdmin
        ? await apiService.getAdminCVById(candidateId)
        : await apiService.getCVStorageById(candidateId);
      if (response.success && response.data?.cv) {
        setCandidate(response.data.cv);
      } else {
        setError(response.message || lbl('candidateNotFound'));
      }
    } catch (err) {
      console.error('Error loading candidate detail:', err);
      setError(err.message || (t.errorLoadingCandidate || 'Lỗi khi tải thông tin ứng viên'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidateDetail();
  }, [candidateId]);

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;
    const run = async () => {
      setAiMatchLoading(true);
      setAiMatchError(null);
      setAiMatches([]);
      setAiJobTitles({});
      setExpandedAiJobId(null);
      setAiReasonByJobId({});
      try {
        let allowedJobIds = null;
        if (!isAdmin) {
          allowedJobIds = new Set();
          let page = 1;
          const limit = 500;
          for (let guard = 0; guard < 30; guard += 1) {
            const res = await apiService.getCTVJobs({ page, limit });
            const jobs = res?.data?.jobs || [];
            jobs.forEach((j) => {
              if (j?.id != null) allowedJobIds.add(Number(j.id));
            });
            const pg = res?.data?.pagination;
            const totalPages = pg?.totalPages ?? 1;
            if (page >= totalPages || jobs.length < limit) break;
            page += 1;
          }
        }
        const raw = await apiService.getAiMatchJobsForCv(candidateId);
        const list = Array.isArray(raw) ? raw : [];
        let filtered = list;
        if (allowedJobIds) {
          filtered = list.filter((row) => allowedJobIds.has(Number(row.id)));
        }
        filtered = [...filtered].sort((a, b) => (Number(b.similarity_score) || 0) - (Number(a.similarity_score) || 0));
        if (!cancelled) setAiMatches(filtered);
      } catch (e) {
        console.error('AI match jobs:', e);
        if (!cancelled) setAiMatchError(e?.message || lbl('matchingError'));
      } finally {
        if (!cancelled) setAiMatchLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [candidateId, isAdmin]);

  useEffect(() => {
    if (!aiMatches.length) return;
    let cancelled = false;
    const ids = aiMatches.slice(0, 30).map((m) => Number(m.id)).filter((n) => !Number.isNaN(n));
    const loadTitles = async () => {
      const fn = isAdmin ? apiService.getAdminJobById : apiService.getJobById;
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const r = await fn(id);
            const job = r?.data?.job;
            const title = job?.title || job?.titleJp || job?.titleEn || `#${id}`;
            return [id, title];
          } catch {
            return [id, `#${id}`];
          }
        })
      );
      if (!cancelled) setAiJobTitles(Object.fromEntries(entries));
    };
    loadTitles();
    return () => { cancelled = true; };
  }, [aiMatches, isAdmin]);

  const parseCoreSkillsRaw = (raw) => {
    if (raw == null || raw === '') return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const p = JSON.parse(raw);
        return Array.isArray(p) ? p : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const toggleAiReason = async (jobIdNum) => {
    const key = String(jobIdNum);
    if (expandedAiJobId === key) {
      setExpandedAiJobId(null);
      return;
    }
    setExpandedAiJobId(key);
    if (aiReasonByJobId[key]) return;
    setAiReasonLoadingId(key);
    try {
      const res = await apiService.getAiMatchingReasons({
        jd_id: jobIdNum,
        candidate_id: Number(candidateId),
      });
      const reason =
        res?.matching_reasons?.reason ??
        res?.data?.matching_reasons?.reason ??
        '';
      const text = reason != null && String(reason).trim() ? String(reason).trim() : '';
      setAiReasonByJobId((prev) => ({ ...prev, [key]: text || lbl('matchingLoadReasonError') }));
    } catch (e) {
      setAiReasonByJobId((prev) => ({ ...prev, [key]: e?.message || lbl('matchingLoadReasonError') }));
    } finally {
      setAiReasonLoadingId(null);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    const loadAdminProfile = async () => {
      try {
        const res = await apiService.getAdminProfile();
        if (res.success && res.data?.admin) setAdminProfile(res.data.admin);
      } catch (e) {
        console.error('Error loading admin profile:', e);
      }
    };
    loadAdminProfile();
  }, [isAdmin]);

  useEffect(() => {
    if (!candidate || !candidateId) return;
    let cancelled = false;
    const fetchList = isAdmin ? apiService.getAdminCVFileList : apiService.getCtvCVFileList;
    fetchList(candidateId)
      .then((data) => {
        if (!cancelled) setCvFileList(data || { originals: [], templates: [] });
      })
      .catch(() => {
        if (!cancelled) setCvFileList({ originals: [], templates: [] });
      });
    return () => { cancelled = true; };
  }, [candidate, candidateId, isAdmin]);

  useEffect(() => {
    if (activeTab !== 'history' || !candidateId) return;
    let cancelled = false;
    setHistoryLoading(true);
    const fetchSnapshots = isAdmin ? apiService.getAdminCVSnapshots : apiService.getCtvCVSnapshots;
    fetchSnapshots(candidateId, { limit: 50 })
      .then((list) => {
        if (!cancelled) setSnapshots(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setSnapshots([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab, candidateId, isAdmin]);

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (!window.confirm(lbl('confirmDelete'))) return;
    try {
      setDeleting(true);
      const response = await apiService.deleteAdminCV(candidateId);
      if (response.success) {
        alert(lbl('deleteSuccess'));
        navigate(backPath);
      } else {
        alert(response.message || lbl('deleteError'));
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
      alert(err.message || lbl('deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const formatGender = (g) => {
    if (g === 1 || g === '男') return lbl('male');
    if (g === 2 || g === '女') return lbl('female');
    if (g === 3) return lbl('other');
    return '—';
  };

  const formatStatus = (s) => {
    if (s === 0) return lbl('statusDraft');
    if (s === 1) return lbl('statusActive');
    if (s === 2) return lbl('statusArchived');
    return '—';
  };

  const getStatusColor = (status) => {
    if (status === 1) return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' };
    if (status === 0) return { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' };
    return { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' };
  };

  const getFileUrl = (fileType, params) =>
    isAdmin
      ? apiService.getAdminCVFileUrl(candidateId, fileType, 'download', params)
      : apiService.getCtvCVFileUrl(candidateId, fileType, 'download', params);

  const downloadCV = async (cvPath, fileType = 'curriculumVitae') => {
    if (!cvPath) {
      alert(lbl('cvNoFile'));
      return;
    }
    const params = fileType === 'cvOriginalPath' ? { index: 0 } : fileType === 'cvCareerHistoryPath' ? { document: 'shokumu', template: 'Common' } : { document: 'rirekisho', template: 'Common' };
    try {
      const urlToOpen = await getFileUrl(fileType, params);
      if (!urlToOpen) throw new Error(lbl('cvLinkError'));
      const w = window.open(urlToOpen, '_blank');
      if (!w || w.closed || typeof w.closed === 'undefined') {
        const a = document.createElement('a');
        a.href = urlToOpen;
        a.download = (cvPath.split('/').pop() || '').replace(/^[a-f0-9-]+_/i, '') || 'cv.pdf';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading CV:', err);
      alert(lbl('cvDownloadError'));
    }
  };

  const toggleFolder = (id) => setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleSnapshot = (dateTime) => setOpenSnapshots((prev) => ({ ...prev, [dateTime]: !prev[dateTime] }));
  const toggleSnapshotFolder = (dateTime, folderId) => {
    const key = `${dateTime}::${folderId}`;
    setOpenSnapshotFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const downloadZip = async (scope, template = 'all') => {
    try {
      const fn = isAdmin ? apiService.downloadAdminCVZip : apiService.downloadCtvCVZip;
      const { blob, filename } = await fn(candidateId, scope, template);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'cv.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download zip failed:', e);
      alert(lbl('zipError'));
    }
  };

  const downloadZipSnapshot = async (dateTime, scope, template = 'all') => {
    try {
      const fn = isAdmin ? apiService.downloadAdminCVZip : apiService.downloadCtvCVZip;
      const { blob, filename } = await fn(candidateId, scope, template, dateTime);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'cv.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download zip snapshot failed:', e);
      alert(lbl('zipSnapshotError'));
    }
  };

  const formatSnapshotLabel = (dateTime) => {
    if (!dateTime) return '—';
    const s = String(dateTime);
    const parts = s.split('_');
    if (parts.length !== 2) return s;
    return `${parts[0]} ${parts[1].replace(/-/g, ':')}`;
  };

  const handleRollbackSnapshot = async (dateTime) => {
    if (!candidateId) return;
    if (!window.confirm(lbl('rollbackConfirm'))) return;
    setRollbackingDateTime(dateTime);
    try {
      const rollback = isAdmin ? apiService.rollbackAdminCV : apiService.rollbackCtvCV;
      const getSnapshots = isAdmin ? apiService.getAdminCVSnapshots : apiService.getCtvCVSnapshots;
      const getFileList = isAdmin ? apiService.getAdminCVFileList : apiService.getCtvCVFileList;
      await rollback(candidateId, dateTime);
      await loadCandidateDetail();
      const list = await getSnapshots(candidateId, { limit: 50 });
      setSnapshots(Array.isArray(list) ? list : []);
      const data = await getFileList(candidateId);
      setCvFileList(data || { originals: [], templates: [] });
    } catch (err) {
      alert(err?.message || lbl('rollbackFail'));
    } finally {
      setRollbackingDateTime(null);
    }
  };

  const getTemplatesByFolder = () => {
    const byTemplate = { Common: [], IT: [], Technical: [] };
    (cvFileList.templates || []).forEach((tpl) => {
      if (tpl?.template && byTemplate[tpl.template]) byTemplate[tpl.template].push(tpl);
    });
    return byTemplate;
  };

  const isSuperAdmin = isAdmin && adminProfile?.role === 1;
  const showDelete = isAdmin && isSuperAdmin;
  const showEdit = isAdmin ? isSuperAdmin : true;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }} />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="rounded-lg border p-8 text-center" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <p className="text-sm" style={{ color: '#dc2626' }}>{error || lbl('candidateNotFound')}</p>
        <button
          onClick={() => navigate(backPath)}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white',
          }}
        >
          {t.backToCandidatesShort || lbl('backToList')}
        </button>
      </div>
    );
  }

  const toArray = (v) => {
    if (v == null || v === '') return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try {
        const p = JSON.parse(v);
        return Array.isArray(p) ? p : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  const educations = toArray(candidate.educations);
  const workExperiences = toArray(candidate.workExperiences);
  const certificates = toArray(candidate.certificates);

  const cardStyle = { backgroundColor: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' };

  return (
    <div className="min-h-screen">
      {/* Row 1 — 3 card ngang: Patient | General information | Anamnesis (ứng viên: Kỹ năng & Mong muốn tóm tắt) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative rounded-xl p-6 text-center" style={cardStyle}>
          {(showEdit || showDelete) && (
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {showEdit && (
                <button
                  type="button"
                  onClick={() => navigate(editPath)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border text-gray-500 hover:text-blue-600 hover:border-blue-200 bg-white/90 shadow-sm transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {showDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-8 h-8 flex items-center justify-center rounded-full border text-gray-500 hover:text-red-600 hover:border-red-200 bg-white/90 shadow-sm transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-3" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            {(candidate.name || candidate.fullName || 'U').charAt(0).toUpperCase()}
          </div>
          <p className="font-bold text-base truncate" style={{ color: '#111827' }}>{candidate.name || candidate.fullName || '—'}</p>
          <a href={`tel:${candidate.phone || ''}`} className="text-sm block mt-1 truncate" style={{ color: '#2563eb' }}>{candidate.phone || '—'}</a>
          <p className="text-sm mt-0.5 truncate" style={{ color: '#6b7280' }}>{candidate.email || '—'}</p>
        </div>
        <div className="rounded-xl p-5" style={cardStyle}>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: '#2563eb' }} />
            {t.personalInformation || lbl('personalInfo')}
          </h2>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium" style={{ color: '#6b7280' }}>{t.birthDate || lbl('birthDate')}: </span><span style={{ color: '#111827' }}>{formatDate(candidate.birthDate)}</span></div>
            <div><span className="font-medium" style={{ color: '#6b7280' }}>{t.address || lbl('address')}: </span><span style={{ color: '#111827' }}>{candidate.addressCurrent || candidate.address || '—'}</span></div>
            <div><span className="font-medium" style={{ color: '#6b7280' }}>{t.receiveDate || lbl('receiveDate')}: </span><span style={{ color: '#111827' }}>{formatDate(candidate.receiveDate || candidate.createdAt)}</span></div>
          </div>
        </div>
        <div className="rounded-xl p-5" style={cardStyle}>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: '#2563eb' }} />
            {t.skillsAndCertificates || lbl('skillsCerts')} &amp; {t.desires || lbl('desires')}
          </h2>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium" style={{ color: '#6b7280' }}>{t.technicalSkills || lbl('technicalSkills')}: </span><span className="line-clamp-2" style={{ color: '#111827' }}>{candidate.technicalSkills || '—'}</span></div>
            <div><span className="font-medium" style={{ color: '#6b7280' }}>{t.certificates || lbl('certificates')}: </span><span style={{ color: '#111827' }}>{certificates.length ? certificates.map((c) => c.name || '—').join(', ') : '—'}</span></div>
            <div><span className="font-medium" style={{ color: '#6b7280' }}>{t.desiredSalary || lbl('desiredSalary')}: </span><span style={{ color: '#111827' }}>{candidate.desiredSalary || (candidate.desiredIncome != null ? `${candidate.desiredIncome}万円` : '—')}</span></div>
            <div><span className="font-medium" style={{ color: '#6b7280' }}>{t.desiredPosition || lbl('desiredPosition')}: </span><span style={{ color: '#111827' }}>{candidate.desiredPosition || '—'}</span></div>
          </div>
        </div>
      </div>

      {/* Gợi ý job theo AI */}
      <div className="rounded-xl p-5 mb-6" style={cardStyle}>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
          <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#2563eb' }} />
          {lbl('matchingTitle')}
        </h2>
        {!isAdmin && (
          <p className="text-xs mb-3" style={{ color: '#6b7280' }}>{lbl('matchingFilteredNote')}</p>
        )}
        {aiMatchLoading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {lbl('matchingLoading')}
          </div>
        )}
        {aiMatchError && !aiMatchLoading && (
          <p className="text-sm" style={{ color: '#dc2626' }}>{aiMatchError}</p>
        )}
        {!aiMatchLoading && !aiMatchError && aiMatches.length === 0 && (
          <p className="text-sm" style={{ color: '#6b7280' }}>{lbl('matchingEmpty')}</p>
        )}
        {!aiMatchLoading && !aiMatchError && aiMatches.length > 0 && (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {aiMatches.map((row) => {
              const jid = Number(row.id);
              const key = String(jid);
              const meta = row.metadata || {};
              const skills = parseCoreSkillsRaw(meta.core_skills_raw);
              const title = aiJobTitles[jid] || `#${jid}`;
              const expanded = expandedAiJobId === key;
              return (
                <div key={key} className="rounded-lg border p-3 text-sm" style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate" style={{ color: '#111827' }}>{title}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        ID: {jid} · {lbl('matchingScore')}: {Number(row.similarity_score ?? 0).toFixed(2)}
                      </div>
                      {meta.desired_position && (
                        <div className="text-xs mt-1" style={{ color: '#4b5563' }}>{meta.desired_position}</div>
                      )}
                      {skills.length > 0 && (
                        <div className="text-xs mt-1 line-clamp-2" style={{ color: '#6b7280' }}>{skills.join(', ')}</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate(isAdmin ? `/admin/jobs/${jid}` : `/agent/jobs/${jid}`)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-semibold border"
                        style={{ borderColor: '#2563eb', color: '#2563eb' }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        {lbl('matchingOpenJob')}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAiReason(jid)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-semibold"
                        style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}
                      >
                        {expanded ? lbl('matchingHideReason') : lbl('matchingViewReason')}
                      </button>
                    </div>
                  </div>
                  {expanded && (
                    <div className="mt-3 pt-3 border-t text-xs whitespace-pre-wrap" style={{ borderColor: '#e5e7eb', color: '#374151' }}>
                      <span className="font-semibold">{lbl('matchingReason')}: </span>
                      {aiReasonLoadingId === key && !aiReasonByJobId[key] ? (
                        <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> …</span>
                      ) : (
                        aiReasonByJobId[key] || '—'
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 2 — Trái: Tabs + nội dung (Chi tiết / Lịch sử). Phải: Files + Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6">
        {/* Trái: Card có tabs (Chi tiết hồ sơ | Lịch sử chỉnh sửa) + nội dung bên dưới */}
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
            <button
              type="button"
              onClick={() => setActiveTab('detail')}
              className="flex-1 py-3 px-3 text-xs font-semibold transition-colors"
              style={{ color: activeTab === 'detail' ? '#2563eb' : '#6b7280', borderBottom: activeTab === 'detail' ? '2px solid #2563eb' : '2px solid transparent' }}
            >
              {t.candidateDetail || lbl('detailTab')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className="flex-1 py-3 px-3 text-xs font-semibold transition-colors"
              style={{ color: activeTab === 'history' ? '#2563eb' : '#6b7280', borderBottom: activeTab === 'history' ? '2px solid #2563eb' : '2px solid transparent' }}
            >
              {lbl('historyTab')} ({snapshots.length})
            </button>
          </div>
          {activeTab === 'detail' && (
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
              <section>
                <h3 className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: '#374151' }}><GraduationCap className="w-3.5 h-3.5" style={{ color: '#2563eb' }} /> {t.education || lbl('education')}</h3>
                {educations.length === 0 ? <p className="text-sm" style={{ color: '#6b7280' }}>{t.noEducationInfo || lbl('noEducation')}</p> : (
                  <ul className="space-y-1.5 text-sm">{educations.map((edu, i) => <li key={i} className="pl-3 border-l-2" style={{ borderColor: '#e5e7eb', color: '#111827' }}>{edu.year}/{edu.month} — {edu.content || '—'}</li>)}</ul>
                )}
              </section>
              <section>
                <h3 className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: '#374151' }}><Briefcase className="w-3.5 h-3.5" style={{ color: '#2563eb' }} /> {t.workExperience || lbl('workExp')}</h3>
                {workExperiences.length === 0 ? <p className="text-sm" style={{ color: '#6b7280' }}>{t.noWorkExperienceInfo || lbl('noWorkExp')}</p> : (
                  <ul className="space-y-2 text-sm">{workExperiences.map((work, i) => (
                    <li key={i} className="rounded-lg p-3 border" style={{ borderColor: '#e5e7eb' }}><p className="font-medium" style={{ color: '#111827' }}>{work.company_name || '—'} · {work.period || '—'}</p><p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{work.description || '—'}</p></li>
                  ))}</ul>
                )}
              </section>
              <section>
                <h3 className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: '#374151' }}><UserCircle className="w-3.5 h-3.5" style={{ color: '#2563eb' }} /> {t.introduction || lbl('introduction')}</h3>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.careerSummary || '—'}</p>
                <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.strengths || '—'}</p>
                <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.motivation || '—'}</p>
              </section>
              <section>
                <h3 className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: '#374151' }}><DollarSign className="w-3.5 h-3.5" style={{ color: '#2563eb' }} /> {t.desires || lbl('desires')}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div><span style={{ color: '#6b7280' }}>{t.currentSalary || lbl('currentSalary')}: </span><span style={{ color: '#111827' }}>{candidate.currentSalary || (candidate.currentIncome != null ? `${candidate.currentIncome}万円` : '—')}</span></div>
                  <div><span style={{ color: '#6b7280' }}>{t.desiredSalary || lbl('desiredSalary')}: </span><span style={{ color: '#111827' }}>{candidate.desiredSalary || (candidate.desiredIncome != null ? `${candidate.desiredIncome}万円` : '—')}</span></div>
                  <div><span style={{ color: '#6b7280' }}>{t.desiredPosition || lbl('desiredPosition')}: </span><span style={{ color: '#111827' }}>{candidate.desiredPosition || '—'}</span></div>
                  <div><span style={{ color: '#6b7280' }}>{t.desiredWorkLocation || t.desiredLocation || lbl('desiredLocation')}: </span><span style={{ color: '#111827' }}>{candidate.desiredWorkLocation || candidate.desiredLocation || '—'}</span></div>
                  <div><span style={{ color: '#6b7280' }}>{t.desiredStartDate || lbl('desiredStartDate')}: </span><span style={{ color: '#111827' }}>{candidate.nyushaTime || candidate.desiredStartDate || '—'}</span></div>
                </div>
              </section>
            </div>
          )}
          {activeTab === 'history' && (
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {historyLoading && <p className="text-xs py-2" style={{ color: '#6b7280' }}>{lbl('historyLoading')}</p>}
              {!historyLoading && snapshots.length === 0 && <p className="text-xs py-2" style={{ color: '#6b7280' }}>{lbl('noSnapshot')}</p>}
              {snapshots.map((snap) => {
                const dt = snap.dateTime;
                const isOpen = !!openSnapshots[dt];
                const originals = snap.originals || [];
                const templates = snap.templates || {};
                const tplOrder = ['Common', 'IT', 'Technical'];
                return (
                  <div key={dt} className="rounded-lg border overflow-hidden" style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}>
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <button type="button" onClick={() => toggleSnapshot(dt)} className="flex items-center gap-2 min-w-0 flex-1 text-left">
                        <ChevronRight className="w-4 h-4 shrink-0 transition-transform" style={{ color: '#6b7280', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                        <span className="text-xs font-medium truncate" style={{ color: '#374151' }}>{formatSnapshotLabel(dt)}</span>
                        <span className="text-[10px] shrink-0" style={{ color: '#9ca3af' }}>({originals.length})</span>
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRollbackSnapshot(dt); }} disabled={!!rollbackingDateTime} className="shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                        {rollbackingDateTime === dt ? <span className="animate-spin inline-block w-3 h-3 border border-amber-600 border-t-transparent rounded-full" /> : <RotateCcw className="w-3 h-3" />}
                        Rollback
                      </button>
                    </div>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-0 space-y-2">
                        {originals.map((f, idx) => (
                          <div key={`orig-${idx}`} className="flex items-center gap-2 text-xs py-1">
                            <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: '#6b7280' }} />
                            <span className="truncate" style={{ color: '#374151' }}>{f.name}</span>
                            {f.downloadUrl && <button type="button" onClick={() => window.open(f.downloadUrl, '_blank')} className="shrink-0"><Download className="w-3.5 h-3.5" style={{ color: '#2563eb' }} /></button>}
                          </div>
                        ))}
                        {tplOrder.map((tpl) => {
                          const folderKey = `CV_Template/${tpl}`;
                          const isTplOpen = !!openSnapshotFolders[`${dt}::${folderKey}`];
                          const has = templates?.[tpl]?.rirekisho || templates?.[tpl]?.shokumu;
                          if (!has) return null;
                          return (
                            <div key={folderKey}>
                              <button type="button" onClick={() => toggleSnapshotFolder(dt, folderKey)} className="flex items-center gap-2 w-full text-left py-1 text-xs font-medium" style={{ color: '#374151' }}>
                                <ChevronRight className="w-3.5 h-3.5 transition-transform" style={{ transform: isTplOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                                {tpl}
                              </button>
                              {isTplOpen && (
                                <div className="pl-4 space-y-1">
                                  {['rirekisho', 'shokumu'].map((doc) => templates?.[tpl]?.[doc]?.downloadUrl && (
                                    <button key={doc} type="button" onClick={() => window.open(templates[tpl][doc].downloadUrl, '_blank')} className="flex items-center gap-2 text-xs py-0.5" style={{ color: '#2563eb' }}>
                                      <FileText className="w-3 h-3" /> {doc}.pdf
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phải: 2 card xếp dọc — Files | Notes */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: '#e5e7eb' }}>
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
                {t.cvFile || lbl('cvFile')}
              </h2>
              <button type="button" onClick={() => downloadZip('template', 'all')} className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: '#2563eb', color: '#2563eb', backgroundColor: 'white' }}>DOWNLOAD</button>
            </div>
            <div className="p-4 space-y-2 max-h-[320px] overflow-y-auto">
              {cvFileList.originals.length > 0 && (
                <div>
                  <button type="button" onClick={() => toggleFolder('CV_original')} className="w-full flex items-center justify-between py-2 text-left">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 transition-transform" style={{ transform: openFolders.CV_original ? 'rotate(90deg)' : 'rotate(0deg)', color: '#6b7280' }} />
                      <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                      <span className="text-xs font-semibold" style={{ color: '#374151' }}>CV_original</span>
                      <span className="text-[10px]" style={{ color: '#9ca3af' }}>({cvFileList.originals.length})</span>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); downloadZip('original', 'all'); }} className="text-xs font-semibold" style={{ color: '#2563eb' }}>ZIP</button>
                  </button>
                  {openFolders.CV_original && (
                    <div className="pl-6 pt-1 space-y-1">
                      {cvFileList.originals.map((item) => (
                        <div key={`orig-${item.index}`} className="flex items-center gap-2 py-1.5 text-xs">
                          <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: '#6b7280' }} />
                          <span className="truncate flex-1" style={{ color: '#111827' }}>{item.name}</span>
                          {item.downloadUrl && <button type="button" onClick={() => window.open(item.downloadUrl, '_blank')}><Download className="w-3.5 h-3.5" style={{ color: '#2563eb' }} /></button>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {cvFileList.templates.length > 0 && (() => {
                const byTemplate = getTemplatesByFolder();
                const order = ['Common', 'IT', 'Technical'];
                return (
                  <div className="space-y-1">
                    <button type="button" onClick={() => toggleFolder('CV_Template')} className="w-full flex items-center justify-between py-2 text-left">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 transition-transform" style={{ transform: openFolders.CV_Template ? 'rotate(90deg)' : 'rotate(0deg)', color: '#6b7280' }} />
                        <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                        <span className="text-xs font-semibold" style={{ color: '#374151' }}>CV_Template</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); downloadZip('template', 'all'); }} className="text-xs font-semibold" style={{ color: '#2563eb' }}>ZIP all</button>
                    </button>
                    {openFolders.CV_Template && (
                      <div className="pl-6 space-y-1">
                        {order.filter((k) => (byTemplate[k] || []).length > 0).map((templateName) => {
                          const folderId = `CV_Template/${templateName}`;
                          return (
                            <div key={folderId}>
                              <button type="button" onClick={() => toggleFolder(folderId)} className="w-full flex items-center justify-between py-1 text-left">
                                <span className="text-xs font-medium" style={{ color: '#6b7280' }}>{templateName}</span>
                                <span className="text-[10px]" style={{ color: '#9ca3af' }}>({byTemplate[templateName].length})</span>
                              </button>
                              {openFolders[folderId] && (
                                <div className="pl-3 pt-0.5 space-y-1">
                                  {byTemplate[templateName].map((item, idx) => (
                                    <div key={`tpl-${idx}`} className="flex items-center gap-2 py-1 text-xs">
                                      <FileText className="w-3 h-3 shrink-0" style={{ color: '#6b7280' }} />
                                      <span className="truncate flex-1" style={{ color: '#111827' }}>{item.document}.pdf</span>
                                      {item.downloadUrl && <button type="button" onClick={() => window.open(item.downloadUrl, '_blank')}><Download className="w-3 h-3" style={{ color: '#2563eb' }} /></button>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
              {cvFileList.originals.length === 0 && cvFileList.templates.length === 0 && (candidate.cvOriginalPath || candidate.curriculumVitae) && (
                <p className="text-xs" style={{ color: '#6b7280' }}>{t.loading || lbl('loadingFiles')}</p>
              )}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: '#e5e7eb' }}>
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
                {t.otherDocuments || lbl('otherDocs')} / Ghi chú
              </h2>
              {candidate.otherDocuments && (
                <button type="button" onClick={() => downloadCV(candidate.otherDocuments, 'otherDocuments')} className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: '#2563eb', color: '#2563eb', backgroundColor: 'white' }}>
                  {t.download || lbl('download')}
                </button>
              )}
            </div>
            <div className="p-4">
              {candidate.otherDocuments ? (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 shrink-0" style={{ color: '#6b7280' }} />
                  <span style={{ color: '#111827' }}>{candidate.otherDocuments}</span>
                </div>
              ) : (
                <p className="text-xs" style={{ color: '#9ca3af' }}>Chưa có tài liệu khác hoặc ghi chú.</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CandidateDetailPage;
