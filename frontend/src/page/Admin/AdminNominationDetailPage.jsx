import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Briefcase,
  Building2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  Archive,
  ExternalLink,
  GraduationCap,
  Award,
  UserCircle,
} from 'lucide-react';
import apiService from '../../services/api';
import NominationChat from '../../component/Chat/NominationChat';
import NominationTimeline from '../../component/Chat/NominationTimeline';
import { getJobApplicationStatus, getJobApplicationStatusOptionsByLanguage, getJobApplicationStatusLabelByLanguage } from '../../utils/jobApplicationStatus';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import CvFilePreview from '../../component/Admin/CvFilePreview';

const pickByLanguage = (viText, enText, jpText, lang) => {
  if (lang === 'en') return enText || viText || '';
  if (lang === 'ja') return jpText || enText || viText || '';
  return viText || enText || jpText || '';
};

const AdminNominationDetailPage = () => {
  const { nominationId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [statusPaymentAmount, setStatusPaymentAmount] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cvFileList, setCvFileList] = useState({ originals: [], templates: [] });
  const [loadingUsedCv, setLoadingUsedCv] = useState(false);
  const [downloadingUsedCvZip, setDownloadingUsedCvZip] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [activeCvTab, setActiveCvTab] = useState(0);

  const STATUS_PAID = 15;
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredEditButton, setHoveredEditButton] = useState(false);
  const [hoveredDeleteButton, setHoveredDeleteButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [hoveredViewCandidateButton, setHoveredViewCandidateButton] = useState(false);
  const [hoveredViewJobButton, setHoveredViewJobButton] = useState(false);
  const [hoveredViewCollaboratorButton, setHoveredViewCollaboratorButton] = useState(false);
  const [hoveredDownloadCVButton, setHoveredDownloadCVButton] = useState(false);

  useEffect(() => {
    loadNominationDetail();
  }, [nominationId]);

  const loadNominationDetail = async () => {
    if (!nominationId) {
      setError(t.invalidNominationId);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminJobApplicationById(nominationId);
      
      if (response.success && response.data?.jobApplication) {
        setNomination(response.data.jobApplication);
      } else {
        setError(response.message || t.nominationNotFound);
      }
    } catch (err) {
      console.error('Error loading nomination detail:', err);
      setError(err.message || t.errorLoadNominationDetail);
    } finally {
      setLoading(false);
    }
  };

  // Load list of CV files for this nomination's CV
  useEffect(() => {
    if (!nomination || !nomination.cv || !nomination.cv.id) {
      setCvFileList({ originals: [], templates: [] });
      return;
    }
    const cvId = nomination.cv.id;
    setLoadingUsedCv(true);
    let cancelled = false;
    (async () => {
      try {
        const data = await apiService.getAdminCVFileList(cvId);
        if (!cancelled) {
          setCvFileList(data || { originals: [], templates: [] });
        }
      } catch {
        if (!cancelled) {
          setCvFileList({ originals: [], templates: [] });
        }
      } finally {
        if (!cancelled) {
          setLoadingUsedCv(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nomination]);

  const downloadUsedCvZip = async () => {
    if (!nomination?.cv?.id) return;
    const usedCvPath = nomination.cvPath || nomination.cv_path || '';
    let usedCvKind = null;
    let usedTemplateName = null;
    if (usedCvPath) {
      const lower = String(usedCvPath).toLowerCase();
      if (lower.includes('cv_original') || lower.includes('original')) {
        usedCvKind = 'original';
      } else if (lower.includes('cv_template') || lower.includes('template')) {
        usedCvKind = 'template';
        if (lower.includes('common')) usedTemplateName = 'Common';
        else if (lower.includes('/it') || lower.includes('\\it') || /it$/i.test(lower)) usedTemplateName = 'IT';
        else if (lower.includes('technical')) usedTemplateName = 'Technical';
      }
    }
    const scope = usedCvKind === 'original' ? 'original' : 'template';
    const template = usedCvKind === 'original' ? 'all' : (usedTemplateName || 'all');
    setDownloadingUsedCvZip(true);
    try {
      const { blob, filename } = await apiService.downloadAdminCVZip(nomination.cv.id, scope, template);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'cv-folder.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(t.errorDownloadZip || 'Không thể tải ZIP.');
    } finally {
      setDownloadingUsedCvZip(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t.confirmDeleteNominationDetail)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiService.deleteAdminJobApplication(nominationId);
      if (response.success) {
        alert(t.deleteNominationSuccess);
        navigate('/admin/nominations');
      } else {
        alert(response.message || t.errorDeleteNomination);
      }
    } catch (err) {
      console.error('Error deleting nomination:', err);
      alert(err.message || t.errorDeleteNomination);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatus = async () => {
    const statusNum = newStatus != null ? parseInt(newStatus, 10) : nomination.status;
    if (Number.isNaN(statusNum) || statusNum < 1 || statusNum > 17) {
      alert(t.selectValidStatus);
      return;
    }
    if (statusNum === STATUS_PAID) {
      const amount = parseFloat(statusPaymentAmount);
      if (Number.isNaN(amount) || amount < 0) {
        alert(t.enterValidPayment);
        return;
      }
    }
    if (statusNum === nomination.status && !statusReason.trim() && statusNum !== STATUS_PAID) {
      setShowStatusModal(false);
      return;
    }
    if (statusNum === nomination.status && statusReason.trim() && statusNum !== STATUS_PAID) {
      // Chỉ cập nhật lý do thì gọi PUT
      try {
        setUpdatingStatus(true);
        const response = await apiService.updateAdminJobApplication(nomination.id, {
          status: nomination.status,
          rejectNote: statusReason.trim()
        });
        if (response.success) {
          loadNominationDetail();
          setShowStatusModal(false);
          setStatusReason('');
        } else {
          alert(response.message || t.updateFailed);
        }
      } catch (e) {
        alert(e.message || t.updateFailed);
      } finally {
        setUpdatingStatus(false);
      }
      return;
    }
    try {
      setUpdatingStatus(true);
      const response = await apiService.updateJobApplicationStatus(
        nomination.id,
        statusNum,
        statusReason.trim() || null,
        statusNum === STATUS_PAID ? parseFloat(statusPaymentAmount) : null
      );
      if (response.success) {
        loadNominationDetail();
        setShowStatusModal(false);
        setStatusReason('');
        setStatusPaymentAmount('');
      } else {
        alert(response.message || t.changeStatusFailed);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      const msg = err?.data?.message || err?.message || t.changeStatusFailed;
      alert(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const formatStatus = (status) => {
    return getJobApplicationStatus(status);
  };

  const getStatusIcon = (status) => {
    const info = getJobApplicationStatus(status);
    if (info.category === 'success') return <CheckCircle className="w-4 h-4" />;
    if (info.category === 'rejected' || info.category === 'cancelled') return <XCircle className="w-4 h-4" />;
    if (info.category === 'interview') return <AlertCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
      </div>
    );
  }

  if (error || !nomination) {
    return (
      <div className="rounded-lg border p-8 text-center" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <p className="text-sm" style={{ color: '#dc2626' }}>{error || t.nominationNotFound}</p>
        <button
          onClick={() => navigate('/admin/nominations')}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
        >
          {t.backToList}
        </button>
      </div>
    );
  }

  const statusInfo = formatStatus(nomination.status);
  const statusLabelText = getJobApplicationStatusLabelByLanguage(nomination.status, language);
  const cv = nomination.cv || {};
  const job = nomination.job || {};
  const collaborator = nomination.collaborator || {};

  // Determine which CV folder was used for this nomination based on cvPath
  const usedCvPath = nomination.cvPath || nomination.cv_path || '';
  let usedCvKind = null; // 'original' | 'template'
  let usedTemplateName = null; // 'Common' | 'IT' | 'Technical'
  if (usedCvPath) {
    const lower = String(usedCvPath).toLowerCase();
    // Chỉ cần có chữ "original" hoặc "template" trong path là nhận
    if (lower.includes('original')) {
      usedCvKind = 'original';
    } else if (lower.includes('template')) {
      usedCvKind = 'template';
      if (lower.includes('common')) {
        usedTemplateName = 'Common';
      } else if (lower.includes('/it') || lower.includes('\\it') || /it$/i.test(lower)) {
        usedTemplateName = 'IT';
      } else if (lower.includes('technical')) {
        usedTemplateName = 'Technical';
      }
    }
  }

  // Build list of files belonging to the used CV folder
  const originalsForUsedCv = cvFileList.originals || [];
  const templatesForUsedCv = cvFileList.templates || [];
  const templatesByNameForUsedCv = { Common: [], IT: [], Technical: [] };
  templatesForUsedCv.forEach((tpl) => {
    if (tpl?.template && templatesByNameForUsedCv[tpl.template]) {
      templatesByNameForUsedCv[tpl.template].push(tpl);
    }
  });
  const usedCvFiles =
    usedCvKind === 'original'
      ? originalsForUsedCv
      : (usedTemplateName && templatesByNameForUsedCv[usedTemplateName]) || [];

  // Parse JSON fields
  const educations = cv.educations 
    ? (typeof cv.educations === 'string' ? JSON.parse(cv.educations) : cv.educations)
    : [];
  const workExperiences = cv.workExperiences 
    ? (typeof cv.workExperiences === 'string' ? JSON.parse(cv.workExperiences) : cv.workExperiences)
    : [];
  const certificates = cv.certificates 
    ? (typeof cv.certificates === 'string' ? JSON.parse(cv.certificates) : cv.certificates)
    : [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/nominations')}
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
            <h1 className="text-lg font-bold" style={{ color: '#111827' }}>{t.nominationDetailTitle}</h1>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              ID: {nomination.id} - {nomination.name || cv.fullName || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1" style={statusInfo.style || { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' }}>
            {getStatusIcon(nomination.status)}
            <span className="ml-1">{statusLabelText}</span>
          </span>
          <button
            type="button"
            onClick={() => { setNewStatus(nomination.status); setStatusReason(nomination.rejectNote || ''); setStatusPaymentAmount(''); setShowStatusModal(true); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border"
            style={{ borderColor: '#d1d5db', color: '#374151' }}
          >
            {t.changeStatusButton}
          </button>
          <button
            onClick={() => navigate(`/admin/nominations/${nominationId}/edit`)}
            onMouseEnter={() => setHoveredEditButton(true)}
            onMouseLeave={() => setHoveredEditButton(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredEditButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            <Edit className="w-3.5 h-3.5" />
            {t.edit}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            onMouseEnter={() => !deleting && setHoveredDeleteButton(true)}
            onMouseLeave={() => setHoveredDeleteButton(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: deleting
                ? '#fca5a5'
                : (hoveredDeleteButton ? '#b91c1c' : '#dc2626'),
              color: 'white',
              opacity: deleting ? 0.5 : 1,
              cursor: deleting ? 'not-allowed' : 'pointer'
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.delete}
          </button>
        </div>
      </div>

      {/* Main Content - 3 Column Layout: timeline + chat rộng, cột phải 1/5 */}
      <div className="flex gap-3 h-[calc(100vh-180px)]">
        {/* Left Column - Timeline (rộng hơn) */}
        <div className="w-[20%] min-w-[180px] flex-shrink-0">
          <NominationTimeline nomination={nomination} />
        </div>

        {/* Middle Column - Chat (phần còn lại) */}
        <div className="flex-1 min-w-0">
          <NominationChat 
            jobApplicationId={nomination.id} 
            userType="admin"
            collaboratorId={nomination.collaboratorId}
            currentStatus={nomination.status}
            onStatusUpdated={() => loadNominationDetail()}
            onScheduleInterview={() => loadNominationDetail()}
            onScheduleNyusha={() => loadNominationDetail()}
          />
        </div>

        {/* Right Column - Thông tin ứng viên + đơn (1/5 màn hình) */}
        <div className="w-[20%] max-w-[320px] flex-shrink-0 overflow-y-auto space-y-3">
          {/* Nomination Information */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
                {t.nominationInfoBlock}
              </h2>
              {usedCvKind && cv.id && usedCvFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setActiveCvTab(0); setShowCvModal(true); }}
                  className="text-[11px] px-2 py-0.5 rounded border"
                  style={{ color: '#4b5563', borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
                >
                  Xem CV
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.colId}</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{nomination.id}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.statusLabel}</label>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border" style={statusInfo.style || { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' }}>
                  {getStatusIcon(nomination.status)}
                  {statusLabelText}
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.colNominationDate}</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {formatDate(nomination.appliedAt)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.colInterviewDate}</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {formatDate(nomination.interviewDate)}
                </p>
              </div>
              {nomination.referralFee && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.colReferralFee}</label>
                  <p className="text-sm font-semibold flex items-center gap-1" style={{ color: '#111827' }}>
                    <DollarSign className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
                    {nomination.referralFee.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              )}
              {(nomination.annualSalary || nomination.monthlySalary) && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.salaryLabel}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>
                    {nomination.annualSalary 
                      ? `${nomination.annualSalary.toLocaleString('vi-VN')}万円/năm`
                      : `${nomination.monthlySalary.toLocaleString('vi-VN')}万円/tháng`}
                  </p>
                </div>
              )}
              {nomination.notes && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.notesLabel}</label>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{nomination.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Information */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <User className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.candidateInfo}
            </h2>
            {cv.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#111827' }}>{cv.fullName || cv.name || '—'}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{cv.code || '—'}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/candidates/${cv.id}`)}
                    onMouseEnter={() => setHoveredViewCandidateButton(true)}
                    onMouseLeave={() => setHoveredViewCandidateButton(false)}
                    className="text-xs flex items-center gap-1"
                    style={{
                      color: hoveredViewCandidateButton ? '#1e40af' : '#2563eb'
                    }}
                  >
                    {t.viewDetail}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.email}</label>
                    <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                      <Mail className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                      {cv.email || nomination.email || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.phone}</label>
                    <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                      <Phone className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                      {cv.phone || nomination.phone || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.birthDate}</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{formatDate(cv.birthDate || nomination.birthDate)}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.gender}</label>
                    <p className="text-sm" style={{ color: '#111827' }}>
                      {cv.gender === 1 || cv.gender === '男' ? t.genderMale : cv.gender === 2 || cv.gender === '女' ? t.genderFemale : '—'}
                    </p>
                  </div>
                  {cv.addressCurrent && (
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.address}</label>
                      <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                        <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                        {cv.addressCurrent}
                      </p>
                    </div>
                  )}
                </div>
                {cv.curriculumVitae && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.cvFile}</label>
                    <button
                      type="button"
                      onClick={async () => {
                        const p = (cv.curriculumVitae || '').replace(/^\/+/, '');
                        const isS3 = (p.startsWith('apply/') || p.includes('cvs/') || p.includes('jobs/')) && !p.startsWith('uploads/') && !p.startsWith('http');
                        try {
                          const url = isS3
                            ? await apiService.getAdminCVFileUrl(cv.id, 'curriculumVitae', 'view')
                            : `${(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')}/${p}`;
                          if (url) window.open(url, '_blank');
                        } catch (e) {
                          console.error(e);
                          alert(t.errorOpenCV);
                        }
                      }}
                      onMouseEnter={() => setHoveredDownloadCVButton(true)}
                      onMouseLeave={() => setHoveredDownloadCVButton(false)}
                      className="inline-flex items-center gap-1 text-xs bg-transparent border-0 p-0 cursor-pointer"
                      style={{
                        color: hoveredDownloadCVButton ? '#1e40af' : '#2563eb'
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t.downloadCV}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.nameLabel}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{nomination.name || '—'}</p>
                </div>
                {nomination.email && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.email}</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{nomination.email}</p>
                  </div>
                )}
                {nomination.phone && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.phone}</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{nomination.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Information */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Briefcase className="w-4 h-4" style={{ color: '#2563eb' }} />
              {t.jobInfo}
            </h2>
            {job.id ? (
              (() => {
                const jobTitle = pickByLanguage(job.title, job.titleEn || job.title_en, job.titleJp || job.title_jp, language);
                // Thẻ Thông tin công việc: chỉ hiển thị công ty tuyển dụng (recruitingCompany), không dùng công ty nguồn (company)
                const recruitingCompany = job.recruitingCompany;
                const companyDisplay = recruitingCompany
                  ? pickByLanguage(
                      recruitingCompany.companyName || recruitingCompany.name,
                      recruitingCompany.companyNameEn || recruitingCompany.company_name_en,
                      recruitingCompany.companyNameJp || recruitingCompany.company_name_jp,
                      language
                    )
                  : '';
                const jobDescriptionText = pickByLanguage(job.description, job.descriptionEn || job.description_en, job.descriptionJp || job.description_jp, language);
                const estimatedSalaryText = pickByLanguage(job.estimatedSalary, job.estimatedSalaryEn || job.estimated_salary_en, job.estimatedSalaryJp || job.estimated_salary_jp, language);
                const workLocationText = pickByLanguage(job.workLocation, job.workLocationEn || job.work_location_en, job.workLocationJp || job.work_location_jp, language);
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#111827' }}>{jobTitle || '—'}</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>{job.jobCode || job.id}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/jobs/${job.id}`)}
                        onMouseEnter={() => setHoveredViewJobButton(true)}
                        onMouseLeave={() => setHoveredViewJobButton(false)}
                        className="text-xs flex items-center gap-1"
                        style={{
                          color: hoveredViewJobButton ? '#1e40af' : '#2563eb'
                        }}
                      >
                        {t.viewDetail}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    {companyDisplay && (
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.company}</label>
                        <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                          <Building2 className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                          {companyDisplay}
                        </p>
                      </div>
                    )}
                    {jobDescriptionText && (
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.jobDescriptionLabel}</label>
                        <p className="text-sm line-clamp-3" style={{ color: '#111827' }}>{jobDescriptionText.replace(/<[^>]*>/g, '').trim() || jobDescriptionText}</p>
                      </div>
                    )}
                    {estimatedSalaryText && (
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.estimatedSalary}</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{estimatedSalaryText}</p>
                      </div>
                    )}
                    {workLocationText && (
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.workLocation}</label>
                        <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                          <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                          {workLocationText}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-sm" style={{ color: '#6b7280' }}>{t.noJobInfo}</p>
            )}
          </div>

          {/* Collaborator Information */}
          {collaborator.id && (
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                <UserCircle className="w-4 h-4" style={{ color: '#2563eb' }} />
                {t.collaboratorSectionTitle}
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>{collaborator.name || '—'}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{collaborator.code || collaborator.id}</p>
                </div>
                <button
                  onClick={() => navigate(`/admin/collaborators/${collaborator.id}`)}
                  onMouseEnter={() => setHoveredViewCollaboratorButton(true)}
                  onMouseLeave={() => setHoveredViewCollaboratorButton(false)}
                  className="text-xs flex items-center gap-1"
                  style={{
                    color: hoveredViewCollaboratorButton ? '#1e40af' : '#2563eb'
                  }}
                >
                  {t.viewDetail}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal xem CV ứng tuyển theo từng file (tab) */}
      {showCvModal && usedCvFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(15,23,42,0.35)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#e5e7eb' }}>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
                  CV ứng tuyển - {usedCvKind === 'original' ? 'CV_original' : `CV_Template / ${usedTemplateName || '—'}`}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                  Mỗi tab là một file trong folder này.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadUsedCvZip}
                  disabled={downloadingUsedCvZip}
                  className="px-2 py-1 text-xs rounded border inline-flex items-center gap-1"
                  style={{ borderColor: '#d1d5db', color: '#2563eb', backgroundColor: '#eff6ff' }}
                >
                  <Archive className="w-3.5 h-3.5" />
                  {downloadingUsedCvZip ? 'Đang nén…' : 'Tải ZIP'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCvModal(false)}
                  className="px-2 py-1 text-xs rounded border"
                  style={{ borderColor: '#d1d5db', color: '#374151' }}
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="px-4 pt-3 border-b overflow-x-auto" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex gap-2">
                {usedCvFiles.map((file, idx) => {
                  const title = file.name || file.label || `File ${idx + 1}`;
                  const isActive = idx === activeCvTab;
                  return (
                    <button
                      key={`cv-tab-${idx}`}
                      type="button"
                      onClick={() => setActiveCvTab(idx)}
                      className="px-3 py-1.5 rounded-t-md text-xs border-b-2"
                      style={{
                        backgroundColor: isActive ? '#eff6ff' : 'transparent',
                        color: isActive ? '#1d4ed8' : '#4b5563',
                        borderColor: isActive ? '#2563eb' : 'transparent'
                      }}
                    >
                      {title}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 min-h-0 p-4">
              {usedCvFiles[activeCvTab] && (
                <div className="h-full flex flex-col gap-2">
                  <div className="text-xs" style={{ color: '#6b7280' }}>
                    Đang xem:&nbsp;
                    <span className="font-medium" style={{ color: '#111827' }}>
                      {usedCvFiles[activeCvTab].name || usedCvFiles[activeCvTab].label || `File ${activeCvTab + 1}`}
                    </span>
                  </div>
                  <div className="flex-1 border rounded" style={{ borderColor: '#e5e7eb' }}>
                    <iframe
                      title="CV preview"
                      src={usedCvFiles[activeCvTab].viewUrl}
                      className="w-full h-full"
                      style={{ minHeight: '500px', border: 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal đổi trạng thái - tạo tin nhắn tự động trong chat */}
      {showStatusModal && nomination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-xl shadow-lg w-full max-w-md mx-4 p-5" style={{ backgroundColor: 'white' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>{t.changeStatusModalTitle}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{t.newStatusLabel}</label>
                <select
                  value={newStatus ?? nomination.status}
                  onChange={(e) => { setNewStatus(parseInt(e.target.value, 10)); setStatusPaymentAmount(''); }}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#d1d5db' }}
                >
                  {getJobApplicationStatusOptionsByLanguage(language).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {(newStatus ?? nomination.status) === STATUS_PAID ? (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{t.paymentAmountLabel} <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={statusPaymentAmount}
                    onChange={(e) => setStatusPaymentAmount(e.target.value)}
                    placeholder={t.placeholderPaymentAmount}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ borderColor: '#d1d5db' }}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{t.reasonNoteOptional}</label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder={t.placeholderReasonStatus}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ borderColor: '#d1d5db' }}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button
                type="button"
                onClick={() => { setShowStatusModal(false); setStatusReason(''); setStatusPaymentAmount(''); }}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
                style={{ borderColor: '#d1d5db', color: '#374151' }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updatingStatus || ((newStatus ?? nomination.status) === STATUS_PAID && !statusPaymentAmount.trim())}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: '#2563eb' }}
              >
                {updatingStatus ? t.updating : t.updateButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNominationDetailPage;

