import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
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
  Download,
  Archive,
  ExternalLink,
  UserCircle,
} from 'lucide-react';
import apiService from '../../services/api';
import NominationChat from '../Chat/NominationChat';
import NominationTimeline from '../Chat/NominationTimeline';
import { getJobApplicationStatus, getJobApplicationStatusOptionsByLanguage, getJobApplicationStatusLabelByLanguage } from '../../utils/jobApplicationStatus';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

/** Đồng bộ với NominationChat.jsx */
const STATUSES_REQUIRE_REJECTION = [4, 6, 10, 13, 16];
const STATUSES_REQUIRE_INTERVIEW_SCHEDULE = [7, 8];

const pickByLanguage = (viText, enText, jpText, lang) => {
  if (lang === 'en') return enText || viText || '';
  if (lang === 'ja') return jpText || enText || viText || '';
  return viText || enText || jpText || '';
};

const NominationDetailContent = ({ variant }) => {
  const { nominationId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const isAdmin = variant === 'admin';
  const basePath = isAdmin ? '/admin' : '/agent';

  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [statusPaymentAmount, setStatusPaymentAmount] = useState('');
  const [statusInterviewDate, setStatusInterviewDate] = useState('');
  const [statusInterviewTime, setStatusInterviewTime] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cvFileList, setCvFileList] = useState({ originals: [], templates: [] });
  const [loadingUsedCv, setLoadingUsedCv] = useState(false);
  const [downloadingUsedCvZip, setDownloadingUsedCvZip] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [activeCvTab, setActiveCvTab] = useState(0);

  const STATUS_PAID = 15;

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
      const response = isAdmin
        ? await apiService.getAdminJobApplicationById(nominationId)
        : await apiService.getJobApplicationById(nominationId);

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
        const data = isAdmin
          ? await apiService.getAdminCVFileList(cvId)
          : await apiService.getCtvCVFileList(cvId);
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
  }, [nomination, isAdmin]);

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
      const { blob, filename } = isAdmin
        ? await apiService.downloadAdminCVZip(nomination.cv.id, scope, template)
        : await apiService.downloadCtvCVZip(nomination.cv.id, scope, template);
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
        navigate(`${basePath}/nominations`);
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

  const resetStatusModal = () => {
    setShowStatusModal(false);
    setNewStatus(null);
    setStatusReason('');
    setStatusPaymentAmount('');
    setStatusInterviewDate('');
    setStatusInterviewTime('');
  };

  const handleUpdateStatus = async () => {
    if (!nomination?.id) return;
    const statusNum = newStatus != null ? parseInt(newStatus, 10) : nomination.status;
    if (Number.isNaN(statusNum) || statusNum < 1 || statusNum > 16) {
      alert(t.selectValidStatus);
      return;
    }

    if (STATUSES_REQUIRE_INTERVIEW_SCHEDULE.includes(statusNum)) {
      if (!statusInterviewDate || !statusInterviewTime) {
        alert(t.chatErrorInterviewRequired);
        return;
      }
    }
    if (statusNum === STATUS_PAID) {
      const amount = parseFloat(statusPaymentAmount);
      if (Number.isNaN(amount) || amount < 0) {
        alert(t.chatErrorPaymentAmountRequired || t.enterValidPayment);
        return;
      }
    }

    if (
      statusNum === nomination.status &&
      !statusReason.trim() &&
      statusNum !== STATUS_PAID &&
      !STATUSES_REQUIRE_INTERVIEW_SCHEDULE.includes(statusNum)
    ) {
      resetStatusModal();
      return;
    }
    if (STATUSES_REQUIRE_REJECTION.includes(statusNum) && !statusReason.trim()) {
      alert(t.chatReasonRequired || 'Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      setUpdatingStatus(true);

      if (STATUSES_REQUIRE_INTERVIEW_SCHEDULE.includes(statusNum)) {
        const dateTime = new Date(`${statusInterviewDate}T${statusInterviewTime}`);
        const calendarData = {
          jobApplicationId: parseInt(nomination.id, 10),
          eventType: 1,
          startAt: dateTime.toISOString(),
          title: 'Phỏng vấn ứng viên',
          description: `Lịch phỏng vấn cho đơn ứng tuyển #${nomination.id}`,
          ...(nomination.collaboratorId && { collaboratorId: parseInt(nomination.collaboratorId, 10) })
        };
        const calendarResponse = await apiService.createAdminCalendar(calendarData);
        if (!calendarResponse?.success) {
          alert(calendarResponse?.message || t.chatErrorCreateSchedule);
          return;
        }
        const updateResponse = await apiService.updateAdminJobApplication(nomination.id, {
          interviewDate: dateTime.toISOString(),
          status: statusNum
        });
        if (!updateResponse.success) {
          alert(updateResponse.message || t.chatErrorUpdateApplication);
          return;
        }
        await apiService.createAdminMessage({
          jobApplicationId: parseInt(nomination.id, 10),
          content: `Đã đặt lịch phỏng vấn: ${statusInterviewDate} ${statusInterviewTime}`,
          type: 'system'
        });
        loadNominationDetail();
        resetStatusModal();
        alert(t.chatSuccessInterviewScheduled);
        return;
      }

      if (statusNum === nomination.status && statusNum !== STATUS_PAID) {
        const response = await apiService.updateAdminJobApplication(nomination.id, {
          status: nomination.status,
          rejectNote: statusReason.trim()
        });
        if (response.success) {
          loadNominationDetail();
          resetStatusModal();
        } else {
          alert(response.message || t.updateFailed);
        }
        return;
      }

      const rejectNote = STATUSES_REQUIRE_REJECTION.includes(statusNum) ? statusReason.trim() : null;
      const paymentAmount = statusNum === STATUS_PAID ? parseFloat(statusPaymentAmount) : null;
      const response = await apiService.updateJobApplicationStatus(
        nomination.id,
        statusNum,
        rejectNote,
        paymentAmount
      );
      if (response.success) {
        loadNominationDetail();
        resetStatusModal();
        alert(response.message || (t.updateSuccess || ''));
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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-gray-400" style={{ borderTopColor: '#6b7280' }}></div>
      </div>
    );
  }

  if (error || !nomination) {
    return (
      <div className="rounded-lg border p-8 text-center shadow-sm" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
        <p className="text-sm" style={{ color: '#dc2626' }}>{error || t.nominationNotFound}</p>
        <button
          onClick={() => navigate(`${basePath}/nominations`)}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
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

  const usedCvPath = nomination.cvPath || nomination.cv_path || '';
  let usedCvKind = null;
  let usedTemplateName = null;
  if (usedCvPath) {
    const lower = String(usedCvPath).toLowerCase();
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

  const selectedStatusForModal = newStatus ?? nomination.status;
  const showSameStatusOnlyNote =
    selectedStatusForModal === nomination.status &&
    selectedStatusForModal !== STATUS_PAID &&
    !STATUSES_REQUIRE_INTERVIEW_SCHEDULE.includes(selectedStatusForModal) &&
    !STATUSES_REQUIRE_REJECTION.includes(selectedStatusForModal);
  const statusModalSubmitDisabled =
    updatingStatus ||
    (STATUSES_REQUIRE_REJECTION.includes(selectedStatusForModal) && !statusReason.trim()) ||
    (STATUSES_REQUIRE_INTERVIEW_SCHEDULE.includes(selectedStatusForModal) && (!statusInterviewDate || !statusInterviewTime)) ||
    (selectedStatusForModal === STATUS_PAID &&
      (Number.isNaN(parseFloat(statusPaymentAmount)) || parseFloat(statusPaymentAmount) < 0));

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-4 flex-1 min-h-0" style={{ backgroundColor: '#f9fafb' }}>
        <div className="w-[20%] min-w-[180px] flex-shrink-0">
          <NominationTimeline nomination={nomination} />
        </div>

        <div className="flex-1 min-w-0">
          <NominationChat
            jobApplicationId={nomination.id}
            userType={isAdmin ? 'admin' : 'ctv'}
            introCandidateName={cv.fullName || cv.name || nomination.name || '—'}
            introJobTitle={
              job.id
                ? pickByLanguage(job.title, job.titleEn || job.title_en, job.titleJp || job.title_jp, language)
                : '—'
            }
            {...(isAdmin && {
              collaboratorId: nomination.collaboratorId,
              currentStatus: nomination.status,
              onStatusUpdated: () => loadNominationDetail()
            })}
            onScheduleInterview={() => loadNominationDetail()}
            onScheduleNyusha={() => loadNominationDetail()}
          />
        </div>

        <div className="w-[20%] max-w-[320px] flex-shrink-0 overflow-y-auto space-y-3">
          <div className="rounded-lg p-3 border shadow-sm bg-white" style={{ borderColor: '#f3f4f6' }}>
            <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: '#f3f4f6' }}>
              <h2 className="text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wide" style={{ color: '#111827' }}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6b7280' }} />
                {t.nominationInfoBlock}
              </h2>
              {usedCvKind && cv.id && usedCvFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setActiveCvTab(0); setShowCvModal(true); }}
                  className="text-[10px] px-2 py-0.5 rounded border"
                  style={{ color: '#374151', borderColor: '#e5e7eb', backgroundColor: 'white' }}
                >
                  Xem CV
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.colId}</label>
                <p className="text-[11px] font-medium" style={{ color: '#111827' }}>{nomination.id}</p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.statusLabel}</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium border" style={{ backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' }}>
                    {getStatusIcon(nomination.status)}
                    {statusLabelText}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewStatus(null);
                        setStatusReason('');
                        setStatusPaymentAmount('');
                        setStatusInterviewDate('');
                        setStatusInterviewTime('');
                        setShowStatusModal(true);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded border font-medium"
                      style={{ color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
                    >
                      {t.changeStatusButton}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.colNominationDate}</label>
                <p className="text-[11px] flex items-center gap-0.5" style={{ color: '#111827' }}>
                  <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                  {formatDate(nomination.appliedAt)}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.colInterviewDate}</label>
                <p className="text-[11px] flex items-center gap-0.5" style={{ color: '#111827' }}>
                  <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                  {formatDate(nomination.interviewDate)}
                </p>
              </div>
              {nomination.referralFee && (
                <div>
                  <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.colReferralFee}</label>
                  <p className="text-[11px] font-semibold flex items-center gap-0.5" style={{ color: '#111827' }}>
                    <DollarSign className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                    {nomination.referralFee.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              )}
              {(nomination.annualSalary || nomination.monthlySalary) && (
                <div>
                  <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.salaryLabel}</label>
                  <p className="text-[11px]" style={{ color: '#111827' }}>
                    {nomination.annualSalary
                      ? `${nomination.annualSalary.toLocaleString('vi-VN')}万円/năm`
                      : `${nomination.monthlySalary.toLocaleString('vi-VN')}万円/tháng`}
                  </p>
                </div>
              )}
              {nomination.notes && (
                <div>
                  <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.notesLabel}</label>
                  <p className="text-[11px] whitespace-pre-wrap" style={{ color: '#111827' }}>{nomination.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg p-3 border shadow-sm bg-white" style={{ borderColor: '#f3f4f6' }}>
            <h2 className="text-[10px] font-bold mb-3 flex items-center gap-1.5 pb-2 border-b uppercase tracking-wide" style={{ color: '#111827', borderColor: '#f3f4f6' }}>
              <User className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6b7280' }} />
              {t.candidateInfo}
            </h2>
            {cv.id ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: '#111827' }}>{cv.fullName || cv.name || '—'}</p>
                    <p className="text-[10px]" style={{ color: '#6b7280' }}>{cv.code || '—'}</p>
                  </div>
                  <button
                    onClick={() => navigate(`${basePath}/candidates/${cv.id}`)}
                    onMouseEnter={() => setHoveredViewCandidateButton(true)}
                    onMouseLeave={() => setHoveredViewCandidateButton(false)}
                    className="text-[10px] flex items-center gap-0.5"
                    style={{
                      color: hoveredViewCandidateButton ? '#1e40af' : '#2563eb'
                    }}
                  >
                    {t.viewDetail}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.email}</label>
                    <p className="text-[11px] flex items-center gap-0.5" style={{ color: '#111827' }}>
                      <Mail className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                      {cv.email || nomination.email || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.phone}</label>
                    <p className="text-[11px] flex items-center gap-0.5" style={{ color: '#111827' }}>
                      <Phone className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                      {cv.phone || nomination.phone || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.birthDate}</label>
                    <p className="text-[11px]" style={{ color: '#111827' }}>{formatDate(cv.birthDate || nomination.birthDate)}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.gender}</label>
                    <p className="text-[11px]" style={{ color: '#111827' }}>
                      {cv.gender === 1 || cv.gender === '男' ? t.genderMale : cv.gender === 2 || cv.gender === '女' ? t.genderFemale : '—'}
                    </p>
                  </div>
                  {cv.addressCurrent && (
                    <div>
                      <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.address}</label>
                      <p className="text-[11px] flex items-center gap-0.5" style={{ color: '#111827' }}>
                        <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                        {cv.addressCurrent}
                      </p>
                    </div>
                  )}
                </div>
                {isAdmin && cv.curriculumVitae && (
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.cvFile}</label>
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
                      className="inline-flex items-center gap-0.5 text-[10px] bg-transparent border-0 p-0 cursor-pointer"
                      style={{
                        color: hoveredDownloadCVButton ? '#1e40af' : '#2563eb'
                      }}
                    >
                      <Download className="w-3 h-3" />
                      {t.downloadCV}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.nameLabel}</label>
                  <p className="text-[11px]" style={{ color: '#111827' }}>{nomination.name || '—'}</p>
                </div>
                {nomination.email && (
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.email}</label>
                    <p className="text-[11px]" style={{ color: '#111827' }}>{nomination.email}</p>
                  </div>
                )}
                {nomination.phone && (
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.phone}</label>
                    <p className="text-[11px]" style={{ color: '#111827' }}>{nomination.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg p-3 border shadow-sm bg-white" style={{ borderColor: '#f3f4f6' }}>
            <h2 className="text-[10px] font-bold mb-3 flex items-center gap-1.5 pb-2 border-b uppercase tracking-wide" style={{ color: '#111827', borderColor: '#f3f4f6' }}>
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6b7280' }} />
              {t.jobInfo}
            </h2>
            {job.id ? (
              (() => {
                const jobTitle = pickByLanguage(job.title, job.titleEn || job.title_en, job.titleJp || job.title_jp, language);
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold" style={{ color: '#111827' }}>{jobTitle || '—'}</p>
                        <p className="text-[10px]" style={{ color: '#6b7280' }}>{job.jobCode || job.id}</p>
                      </div>
                      <button
                        onClick={() => navigate(`${basePath}/jobs/${job.id}`)}
                        onMouseEnter={() => setHoveredViewJobButton(true)}
                        onMouseLeave={() => setHoveredViewJobButton(false)}
                        className="text-[10px] flex items-center gap-0.5"
                        style={{
                          color: hoveredViewJobButton ? '#1e40af' : '#2563eb'
                        }}
                      >
                        {t.viewDetail}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    {companyDisplay && (
                      <div>
                        <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.company}</label>
                        <p className="text-[11px] flex items-center gap-0.5" style={{ color: '#111827' }}>
                          <Building2 className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                          {companyDisplay}
                        </p>
                      </div>
                    )}
                    {jobDescriptionText && (
                      <div>
                        <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.jobDescriptionLabel}</label>
                        <p className="text-[11px] line-clamp-3" style={{ color: '#111827' }}>{jobDescriptionText.replace(/<[^>]*>/g, '').trim() || jobDescriptionText}</p>
                      </div>
                    )}
                    {estimatedSalaryText && (
                      <div>
                        <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.estimatedSalary}</label>
                        <p className="text-[11px]" style={{ color: '#111827' }}>{estimatedSalaryText}</p>
                      </div>
                    )}
                    {workLocationText && (
                      <div>
                        <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#6b7280' }}>{t.workLocation}</label>
                        <p className="text-[11px] flex items-center gap-0.5" style={{ color: '#111827' }}>
                          <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                          {workLocationText}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-[11px]" style={{ color: '#6b7280' }}>{t.noJobInfo}</p>
            )}
          </div>

          {isAdmin && collaborator.id && (
            <div className="rounded-lg p-3 border shadow-sm bg-white" style={{ borderColor: '#f3f4f6' }}>
              <h2 className="text-[10px] font-bold mb-3 flex items-center gap-1.5 pb-2 border-b uppercase tracking-wide" style={{ color: '#111827', borderColor: '#f3f4f6' }}>
                <UserCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6b7280' }} />
                {t.collaboratorSectionTitle}
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold" style={{ color: '#111827' }}>{collaborator.name || '—'}</p>
                  <p className="text-[10px]" style={{ color: '#6b7280' }}>{collaborator.code || collaborator.id}</p>
                </div>
                <button
                  onClick={() => navigate(`${basePath}/collaborators/${collaborator.id}`)}
                  onMouseEnter={() => setHoveredViewCollaboratorButton(true)}
                  onMouseLeave={() => setHoveredViewCollaboratorButton(false)}
                  className="text-[10px] flex items-center gap-0.5"
                  style={{
                    color: hoveredViewCollaboratorButton ? '#1e40af' : '#2563eb'
                  }}
                >
                  {t.viewDetail}
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCvModal && usedCvFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(15,23,42,0.2)' }}>
          <div className="bg-white rounded-xl shadow-xl border max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col" style={{ borderColor: '#f3f4f6' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#f3f4f6' }}>
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
                  className="px-3 py-1.5 text-xs rounded-lg border inline-flex items-center gap-1"
                  style={{ borderColor: '#2563eb', color: '#2563eb', backgroundColor: 'white' }}
                >
                  <Archive className="w-3.5 h-3.5" />
                  {downloadingUsedCvZip ? 'Đang nén…' : 'Tải ZIP'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCvModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border"
                  style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="px-4 pt-3 border-b overflow-x-auto" style={{ borderColor: '#f3f4f6' }}>
              <div className="flex gap-2">
                {usedCvFiles.map((file, idx) => {
                  const title = file.name || file.label || `File ${idx + 1}`;
                  const isActive = idx === activeCvTab;
                  return (
                    <button
                      key={`cv-tab-${idx}`}
                      type="button"
                      onClick={() => setActiveCvTab(idx)}
                      className="px-3 py-1.5 text-xs border-b-2 transition-colors"
                      style={{
                        color: isActive ? '#2563eb' : '#6b7280',
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
                  <div className="flex-1 border rounded-lg" style={{ borderColor: '#f3f4f6' }}>
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

      {isAdmin && showStatusModal && nomination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(15,23,42,0.2)' }}>
          <div className="rounded-xl shadow-lg border w-full max-w-md mx-4 p-5 bg-white" style={{ borderColor: '#f3f4f6' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>{t.changeStatusModalTitle}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{t.newStatusLabel}</label>
                <select
                  value={newStatus ?? nomination.status}
                  onChange={(e) => {
                    setNewStatus(parseInt(e.target.value, 10));
                    setStatusReason('');
                    setStatusPaymentAmount('');
                    setStatusInterviewDate('');
                    setStatusInterviewTime('');
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  {getJobApplicationStatusOptionsByLanguage(language).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {STATUSES_REQUIRE_REJECTION.includes(selectedStatusForModal) && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    {t.reasonNoteOptional || 'Lý do từ chối'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder={t.placeholderReasonStatus || 'Nhập lý do từ chối...'}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                </div>
              )}
              {STATUSES_REQUIRE_INTERVIEW_SCHEDULE.includes(selectedStatusForModal) && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{t.chatDate || 'Ngày'}</label>
                    <input
                      type="date"
                      value={statusInterviewDate}
                      onChange={(e) => setStatusInterviewDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{ borderColor: '#e5e7eb' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{t.chatTime || 'Giờ'}</label>
                    <input
                      type="time"
                      value={statusInterviewTime}
                      onChange={(e) => setStatusInterviewTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{ borderColor: '#e5e7eb' }}
                    />
                  </div>
                </>
              )}
              {selectedStatusForModal === STATUS_PAID && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    {t.chatPaymentAmount || t.paymentAmountLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={statusPaymentAmount}
                    onChange={(e) => setStatusPaymentAmount(e.target.value)}
                    placeholder={t.chatPaymentAmountPlaceholder || t.placeholderPaymentAmount}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                    {t.chatPaymentRequestCreatedPaid || ''}
                  </p>
                </div>
              )}
              {showSameStatusOnlyNote && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{t.reasonNoteOptional}</label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder={t.placeholderReasonStatus}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button
                type="button"
                onClick={resetStatusModal}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
                style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={statusModalSubmitDisabled}
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

export default NominationDetailContent;
