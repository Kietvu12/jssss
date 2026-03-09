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
  ExternalLink,
  Edit,
  MessageCircle,
  Archive,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import NominationChat from '../../component/Chat/NominationChat';
import NominationTimeline from '../../component/Chat/NominationTimeline';
import { getJobApplicationStatus, getJobApplicationStatusLabelByLanguage } from '../../utils/jobApplicationStatus';
import CvFilePreview from '../../component/Admin/CvFilePreview';

const pickByLanguage = (viText, enText, jpText, lang) => {
  if (lang === 'en') return enText || viText || '';
  if (lang === 'ja') return jpText || enText || viText || '';
  return viText || enText || jpText || '';
};

const NominationDetail = () => {
  const { nominationId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cvFileList, setCvFileList] = useState({ originals: [], templates: [] });
  const [loadingUsedCv, setLoadingUsedCv] = useState(false);
  const [downloadingUsedCvZip, setDownloadingUsedCvZip] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [activeCvTab, setActiveCvTab] = useState(0);

  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [hoveredViewCandidateButton, setHoveredViewCandidateButton] = useState(false);
  const [hoveredViewJobButton, setHoveredViewJobButton] = useState(false);

  useEffect(() => {
    loadNominationDetail();
  }, [nominationId]);

  const loadNominationDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getJobApplicationById(nominationId);
      
      if (response.success && response.data?.jobApplication) {
        setNomination(response.data.jobApplication);
      } else {
        setError(response.message || t.nominationNotFound);
      }
    } catch (error) {
      console.error('Error loading nomination detail:', error);
      setError(error.message || t.errorLoadNominationDetail);
    } finally {
      setLoading(false);
    }
  };

  // Load list of CV files to determine which files were actually used for this nomination
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
        const data = await apiService.getCtvCVFileList(cvId);
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
      if (lower.includes('original')) {
        usedCvKind = 'original';
      } else if (lower.includes('template')) {
        usedCvKind = 'template';
        if (lower.includes('common')) usedTemplateName = 'Common';
        else if (lower.includes('it')) usedTemplateName = 'IT';
        else if (lower.includes('technical')) usedTemplateName = 'Technical';
      }
    }
    const scope = usedCvKind === 'original' ? 'original' : 'template';
    const template = usedCvKind === 'original' ? 'all' : (usedTemplateName || 'all');
    setDownloadingUsedCvZip(true);
    try {
      const { blob, filename } = await apiService.downloadCtvCVZip(nomination.cv.id, scope, template);
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
    const statusInfo = getJobApplicationStatus(status);
    // Convert Tailwind color classes to inline styles
    const colorStyle = convertColorClassesToStyle(statusInfo.color);
    return {
      ...statusInfo,
      colorStyle
    };
  };

  // Helper function to convert Tailwind color classes to inline styles
  const convertColorClassesToStyle = (colorClasses) => {
    if (!colorClasses) return { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' };
    
    const colorMap = {
      'bg-yellow-100': { backgroundColor: '#fef9c3' },
      'text-yellow-800': { color: '#854d0e' },
      'border-yellow-300': { borderColor: '#fde047' },
      'bg-blue-100': { backgroundColor: '#dbeafe' },
      'text-blue-800': { color: '#1e40af' },
      'border-blue-300': { borderColor: '#93c5fd' },
      'bg-purple-100': { backgroundColor: '#f3e8ff' },
      'text-purple-800': { color: '#6b21a8' },
      'border-purple-300': { borderColor: '#c084fc' },
      'bg-indigo-100': { backgroundColor: '#e0e7ff' },
      'text-indigo-800': { color: '#3730a3' },
      'border-indigo-300': { borderColor: '#a5b4fc' },
      'bg-cyan-100': { backgroundColor: '#cffafe' },
      'text-cyan-800': { color: '#155e75' },
      'border-cyan-300': { borderColor: '#67e8f9' },
      'bg-teal-100': { backgroundColor: '#ccfbf1' },
      'text-teal-800': { color: '#115e59' },
      'border-teal-300': { borderColor: '#5eead4' },
      'bg-sky-100': { backgroundColor: '#e0f2fe' },
      'text-sky-800': { color: '#0c4a6e' },
      'border-sky-300': { borderColor: '#7dd3fc' },
      'bg-green-100': { backgroundColor: '#dcfce7' },
      'text-green-800': { color: '#166534' },
      'border-green-300': { borderColor: '#86efac' },
      'bg-amber-100': { backgroundColor: '#fef3c7' },
      'text-amber-800': { color: '#92400e' },
      'border-amber-300': { borderColor: '#fcd34d' },
      'bg-orange-100': { backgroundColor: '#fed7aa' },
      'text-orange-800': { color: '#9a3412' },
      'border-orange-300': { borderColor: '#fdba74' },
      'bg-emerald-100': { backgroundColor: '#d1fae5' },
      'text-emerald-800': { color: '#065f46' },
      'border-emerald-300': { borderColor: '#6ee7b7' },
      'bg-red-100': { backgroundColor: '#fee2e2' },
      'text-red-800': { color: '#991b1b' },
      'border-red-300': { borderColor: '#fca5a5' },
      'bg-gray-100': { backgroundColor: '#f3f4f6' },
      'text-gray-800': { color: '#1f2937' },
      'border-gray-300': { borderColor: '#d1d5db' },
    };

    const classes = colorClasses.split(' ');
    const style = {};
    classes.forEach(cls => {
      if (colorMap[cls]) {
        Object.assign(style, colorMap[cls]);
      }
    });

    return Object.keys(style).length > 0 ? style : { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#ef4444' }}></div>
          <p style={{ color: '#4b5563' }}>{t.loadingNominationDetail}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="mb-4" style={{ color: '#ef4444' }}>{error}</div>
        <button
          onClick={() => navigate('/agent/nominations')}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
        >
          {t.backToNominationsList}
        </button>
      </div>
    );
  }

  if (!nomination) {
    return (
      <div className="text-center py-8">
        <p className="mb-4" style={{ color: '#4b5563' }}>{t.nominationNotFound}</p>
        <button
          onClick={() => navigate('/agent/nominations')}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
        >
          {t.backToNominationsList}
        </button>
      </div>
    );
  }

  const statusInfo = formatStatus(nomination.status);
  const statusLabel = getJobApplicationStatusLabelByLanguage(nomination.status, language);
  const job = nomination.job || {};
  const cv = nomination.cv || {};
  const jobTitle = pickByLanguage(job.title, job.titleEn || job.title_en, job.titleJp || job.title_jp, language);
  // Thẻ Thông tin công việc: chỉ hiển thị công ty tuyển dụng (recruitingCompany), không dùng công ty nguồn (company)
  const recruitingCompany = job.recruitingCompany;
  const companyName = recruitingCompany
    ? pickByLanguage(recruitingCompany.companyName || recruitingCompany.name, recruitingCompany.companyNameEn || recruitingCompany.company_name_en, recruitingCompany.companyNameJp || recruitingCompany.company_name_jp, language)
    : '';
  const categoryName = job.category ? pickByLanguage(job.category.name, job.category.nameEn || job.category.name_en, job.category.nameJp || job.category.name_jp, language) : '';
  const jobDescriptionText = pickByLanguage(job.description, job.descriptionEn || job.description_en, job.descriptionJp || job.description_jp, language);
  const jobDescriptionDisplay = jobDescriptionText ? String(jobDescriptionText).replace(/<[^>]*>/g, '').trim() : '';

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

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/agent/nominations')}
              onMouseEnter={() => setHoveredBackButton(true)}
              onMouseLeave={() => setHoveredBackButton(false)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: hoveredBackButton ? '#f3f4f6' : 'transparent'
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#374151' }} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>{t.nominationDetailTitle}</h1>
              <p className="text-sm mt-1" style={{ color: '#4b5563' }}>ID: {nomination.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={statusInfo.colorStyle || { backgroundColor: '#f3f4f6', color: '#1f2937' }}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Content - 3 Column Layout: timeline + chat rộng, cột phải 1/5 */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="flex gap-6 h-full">
          {/* Left Column - Timeline (rộng hơn) */}
          <div className="w-[20%] min-w-[180px] flex-shrink-0">
            <NominationTimeline nomination={nomination} />
          </div>

          {/* Middle Column - Chat (phần còn lại) */}
          <div className="flex-1 min-w-0">
            <NominationChat 
              jobApplicationId={nomination.id} 
              userType="ctv"
              onScheduleInterview={() => loadNominationDetail()}
              onScheduleNyusha={() => loadNominationDetail()}
            />
          </div>

          {/* Right Column - Thông tin ứng viên + đơn (1/5 màn hình) */}
          <div className="w-[20%] max-w-[320px] flex-shrink-0 overflow-y-auto space-y-6">
            {/* Candidate Info Card */}
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                  <User className="w-6 h-6" style={{ color: '#ef4444' }} />
                  {t.candidateInfo}
                </h2>
                {cv.id && (
                  <button
                    onClick={() => navigate(`/agent/candidates/${cv.id}`)}
                    onMouseEnter={() => setHoveredViewCandidateButton(true)}
                    onMouseLeave={() => setHoveredViewCandidateButton(false)}
                    className="text-sm font-medium flex items-center gap-1 transition-colors"
                    style={{
                      color: hoveredViewCandidateButton ? '#1e40af' : '#2563eb'
                    }}
                  >
                    {t.viewDetail}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.fullName}</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{cv.name || nomination.name || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.furigana}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cv.furigana || nomination.furigana || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.email}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Mail className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {cv.email || nomination.email || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.phone}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Phone className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {cv.phone || nomination.phone || '—'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.address}</label>
                  <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    {cv.addressCurrent || nomination.addressCurrent || '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.birthDate}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(cv.birthDate || nomination.birthDate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.age}</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{cv.ages || nomination.ages || '—'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.gender}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>
                    {nomination.gender === 1 ? t.male : nomination.gender === 2 ? t.female : '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.currentSalary}</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{cv.currentIncome || nomination.currentIncome || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.desiredSalary}</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{cv.desiredIncome || nomination.desiredIncome || '—'}</p>
                  </div>
                </div>
                {cv.code && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.cvCode}</label>
                    <p className="text-sm font-mono" style={{ color: '#111827' }}>{cv.code}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Details Card */}
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                  <FileText className="w-6 h-6" style={{ color: '#ef4444' }} />
                  {t.applicationInfo}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.statusLabel}</label>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={statusInfo.colorStyle || { backgroundColor: '#f3f4f6', color: '#1f2937' }}>
                    {statusLabel}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.colAppliedDate}</label>
                  <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    {formatDate(nomination.appliedAt || nomination.applied_at)}
                  </p>
                </div>
                {nomination.interviewDate || nomination.interview_date ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.interviewDate}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(nomination.interviewDate || nomination.interview_date)}
                    </p>
                  </div>
                ) : null}
                {nomination.interviewRound2Date || nomination.interview_round2_date ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.interviewRound2Date}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(nomination.interviewRound2Date || nomination.interview_round2_date)}
                    </p>
                  </div>
                ) : null}
                {nomination.nyushaDate || nomination.nyusha_date ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.nyushaDate}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(nomination.nyushaDate || nomination.nyusha_date)}
                    </p>
                  </div>
                ) : null}
                {nomination.monthlySalary || nomination.monthly_salary ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Lương tháng</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <DollarSign className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {nomination.monthlySalary || nomination.monthly_salary}
                    </p>
                  </div>
                ) : null}
                {nomination.selfPromotion || nomination.self_promotion ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.selfPromotion}</label>
                    <p className="text-sm whitespace-pre-wrap p-4 rounded-lg" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>
                      {nomination.selfPromotion || nomination.self_promotion}
                    </p>
                  </div>
                ) : null}
                {nomination.reasonApply || nomination.reason_apply ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.reasonApply}</label>
                    <p className="text-sm whitespace-pre-wrap p-4 rounded-lg" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>
                      {nomination.reasonApply || nomination.reason_apply}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Job Info Card */}
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                  <Briefcase className="w-6 h-6" style={{ color: '#ef4444' }} />
                  {t.jobInfo}
                </h2>
                {job.id && (
                  <button
                    onClick={() => navigate(`/agent/jobs/${job.id}`)}
                    onMouseEnter={() => setHoveredViewJobButton(true)}
                    onMouseLeave={() => setHoveredViewJobButton(false)}
                    className="text-sm font-medium flex items-center gap-1 transition-colors"
                    style={{
                      color: hoveredViewJobButton ? '#1e40af' : '#2563eb'
                    }}
                  >
                    {t.viewDetail}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.jobTitleLabel}</label>
                  <p className="text-lg font-semibold" style={{ color: '#111827' }}>{jobTitle || '—'}</p>
                </div>
                {job.jobCode && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.jobCode}</label>
                    <p className="text-sm font-mono" style={{ color: '#111827' }}>{job.jobCode}</p>
                  </div>
                )}
                {companyName && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.company}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Building2 className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {companyName}
                    </p>
                  </div>
                )}
                {job.category && categoryName && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.category}</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{categoryName}</p>
                  </div>
                )}
                {job.workLocation && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.workLocation}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <MapPin className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {job.workLocation}
                    </p>
                  </div>
                )}
                {job.estimatedSalary && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.estimatedSalary}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <DollarSign className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {job.estimatedSalary}
                    </p>
                  </div>
                )}
                {jobDescriptionDisplay && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.jobDescription}</label>
                    <div className="text-sm whitespace-pre-wrap p-4 rounded-lg max-h-60 overflow-y-auto" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>
                      {jobDescriptionDisplay}
                    </div>
                  </div>
                )}
                {job.deadline && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>{t.applicationDeadline}</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Clock className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(job.deadline)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default NominationDetail;

