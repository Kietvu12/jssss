import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Search,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Edit,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  History,
  Clock,
  RefreshCw,
  Folder,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import { getJobApplicationStatus, getJobApplicationStatusLabelByLanguage } from '../../utils/jobApplicationStatus';
import AddCandidateForm from '../../component/Shared/AddCandidateForm';
import CvFilePreview from '../../component/Admin/CvFilePreview';

const pickByLanguage = (viText, enText, jpText, lang) => {
  if (lang === 'en') return enText || viText || '';
  if (lang === 'ja') return jpText || enText || viText || '';
  return viText || enText || jpText || '';
};

const NominationPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  
  const [activeTab, setActiveTab] = useState('existing'); // 'existing', 'new', 'history', 'recent'
  const [step, setStep] = useState('select'); // 'select' or 'confirm'
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvStorages, setCvStorages] = useState([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [selectedCV, setSelectedCV] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingCV, setEditingCV] = useState(false);
  const [cvEditData, setCvEditData] = useState({});
  const [savingCV, setSavingCV] = useState(false);
  const [cvSource, setCvSource] = useState('original'); // fallback
  const [selectedTemplate, setSelectedTemplate] = useState('Common');
  const [cvSnapshots, setCvSnapshots] = useState([]);
  const [cvFoldersLoading, setCvFoldersLoading] = useState(false);
  const [selectedCvFolderPath, setSelectedCvFolderPath] = useState(''); // path of selected folder for cv_path
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // New states for history and recent CVs
  const [nominationHistory, setNominationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('');
  const [recentCVs, setRecentCVs] = useState([]);
  const [loadingRecentCVs, setLoadingRecentCVs] = useState(false);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotalItems, setRecentTotalItems] = useState(0);
  const [recentTotalPages, setRecentTotalPages] = useState(0);
  const [previewOption, setPreviewOption] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredBackButtonConfirm, setHoveredBackButtonConfirm] = useState(false);
  const [hoveredEditButton, setHoveredEditButton] = useState(false);
  const [hoveredCancelButton, setHoveredCancelButton] = useState(false);
  const [hoveredSaveButton, setHoveredSaveButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [hoveredSubmitButton, setHoveredSubmitButton] = useState(false);
  const [hoveredCVItem, setHoveredCVItem] = useState(null);
  const [hoveredPaginationButton, setHoveredPaginationButton] = useState(null);
  const [hoveredRecentPaginationButton, setHoveredRecentPaginationButton] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [focusedSelect, setFocusedSelect] = useState(null);

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  useEffect(() => {
    if (activeTab === 'existing' && step === 'select') {
      loadCVStorages();
    } else if (activeTab === 'history') {
      loadNominationHistory();
    } else if (activeTab === 'recent') {
      loadRecentCVs();
    }
  }, [jobId, activeTab, step, currentPage, itemsPerPage, searchTerm, historySearchTerm, historyStatusFilter, recentPage]);

  useEffect(() => {
    if (step !== 'confirm' || !selectedCV) {
      setCvSnapshots([]);
      setSelectedCvFolderPath('');
      setCvFoldersLoading(false);
      return;
    }

    setCvFoldersLoading(false);
    const originalFolderPath = selectedCV.cvOriginalPath || null;
    const templateFolderPath = selectedCV.curriculumVitae || null;
    const list = [];
    if (originalFolderPath || templateFolderPath) {
      list.push({
        dateTime: null,
        originalFolderPath,
        templateFolderPath,
      });
    }
    setCvSnapshots(list);
    if (list.length > 0) {
      const first = list[0];
      const path = first.originalFolderPath || first.templateFolderPath || '';
      setSelectedCvFolderPath(path ? String(path).replace(/\/+$/, '') : '');
    } else {
      setSelectedCvFolderPath('');
    }
  }, [step, selectedCV]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobById(jobId);
      
      if (response.success && response.data?.job) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Error loading job detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCVStorages = async () => {
    try {
      setLoadingCVs(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        isDuplicate: '0' // Only show non-duplicate CVs
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await apiService.getCVStorages(params);
      if (response.success && response.data) {
        setCvStorages(response.data.cvs || []);
        setTotalItems(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      }
    } catch (error) {
      console.error('Error loading CV storages:', error);
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleSelectCV = async (cvId) => {
    try {
      setLoading(true);
      const cvResponse = await apiService.getCVStorageById(cvId);
      
      if (!cvResponse.success || !cvResponse.data?.cv) {
        alert('Không tìm thấy thông tin ứng viên');
        return;
      }

      const cv = cvResponse.data.cv;

      // Check if CV is duplicate
      if (cv.isDuplicate) {
        alert(t.duplicateCVWarning || 'Hồ sơ này đã được đánh dấu là trùng lặp. Không thể tiến cử.');
        return;
      }

      // Get gender value (default to empty string if not valid)
      let genderValue = '';
      if (cv.gender) {
        const parsedGender = parseInt(cv.gender);
        if (!isNaN(parsedGender) && (parsedGender === 1 || parsedGender === 2)) {
          genderValue = parsedGender.toString();
        }
      }

      setSelectedCvId(cvId);
      setSelectedCV(cv);
      setCvEditData({
        name: cv.name || '',
        furigana: cv.furigana || '',
        email: cv.email || '',
        phone: cv.phone || '',
        birthDate: cv.birthDate || '',
        age: cv.ages || cv.age || '',
        gender: genderValue,
        addressCurrent: cv.addressCurrent || cv.address || '',
        currentIncome: cv.currentIncome || '',
        desiredIncome: cv.desiredIncome || '',
        desiredWorkLocation: cv.desiredWorkLocation || '',
        nyushaTime: cv.nyushaTime || '',
        strengths: cv.strengths || '',
        motivation: cv.motivation || '',
      });
      setStep('confirm');
    } catch (error) {
      console.error('Error loading CV:', error);
      alert('Có lỗi xảy ra khi tải thông tin ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCVEdit = async () => {
    if (!selectedCvId) return;

    try {
      setSavingCV(true);
      const formData = new FormData();
      
      // Map edited data to form fields
      formData.append('nameKanji', cvEditData.name || '');
      formData.append('nameKana', cvEditData.furigana || '');
      formData.append('email', cvEditData.email || '');
      formData.append('phone', cvEditData.phone || '');
      formData.append('birthDate', cvEditData.birthDate || '');
      formData.append('age', cvEditData.age || '');
      formData.append('gender', cvEditData.gender || '');
      formData.append('address', cvEditData.addressCurrent || '');
      formData.append('currentSalary', cvEditData.currentIncome || '');
      formData.append('desiredSalary', cvEditData.desiredIncome || '');
      formData.append('desiredLocation', cvEditData.desiredWorkLocation || '');
      formData.append('nyushaTime', cvEditData.nyushaTime || '');
      formData.append('strengths', cvEditData.strengths || '');
      formData.append('motivation', cvEditData.motivation || '');

      const response = await apiService.updateCVStorage(selectedCvId, formData);
      
      if (response.success) {
        // Reload CV data
        const cvResponse = await apiService.getCVStorageById(selectedCvId);
        if (cvResponse.success && cvResponse.data?.cv) {
          setSelectedCV(cvResponse.data.cv);
          setCvEditData({
            name: cvResponse.data.cv.name || '',
            furigana: cvResponse.data.cv.furigana || '',
            email: cvResponse.data.cv.email || '',
            phone: cvResponse.data.cv.phone || '',
            birthDate: cvResponse.data.cv.birthDate || '',
            age: cvResponse.data.cv.ages || cvResponse.data.cv.age || '',
            gender: cvResponse.data.cv.gender?.toString() || '',
            addressCurrent: cvResponse.data.cv.addressCurrent || cvResponse.data.cv.address || '',
            currentIncome: cvResponse.data.cv.currentIncome || '',
            desiredIncome: cvResponse.data.cv.desiredIncome || '',
            desiredWorkLocation: cvResponse.data.cv.desiredWorkLocation || '',
            nyushaTime: cvResponse.data.cv.nyushaTime || '',
            strengths: cvResponse.data.cv.strengths || '',
            motivation: cvResponse.data.cv.motivation || '',
          });
        }
        setEditingCV(false);
        alert('Đã cập nhật thông tin ứng viên thành công!');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error saving CV edit:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSavingCV(false);
    }
  };

  const handleSubmitNomination = async () => {
    if (!selectedCV) {
      alert('Vui lòng chọn ứng viên');
      return;
    }

    if (!jobId) {
      alert('ID việc làm là bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      
      // Use edited data if available, otherwise use original CV data
      const cvData = editingCV ? cvEditData : {
        name: selectedCV.name || '',
        furigana: selectedCV.furigana || '',
        email: selectedCV.email || '',
        phone: selectedCV.phone || '',
        birthDate: selectedCV.birthDate || '',
        ages: selectedCV.ages || selectedCV.age || '',
        gender: selectedCV.gender?.toString() || '',
        addressCurrent: selectedCV.addressCurrent || selectedCV.address || '',
        currentIncome: selectedCV.currentIncome || '',
        desiredIncome: selectedCV.desiredIncome || '',
        desiredWorkLocation: selectedCV.desiredWorkLocation || '',
        nyushaTime: selectedCV.nyushaTime || '',
        strengths: selectedCV.strengths || '',
        motivation: selectedCV.motivation || '',
      };

      // Create job application with CV storage
      // Send as JSON instead of FormData since backend expects req.body
      const requestData = {
        jobId: String(jobId || ''), // Ensure jobId is a string
        cvCode: selectedCV.code || '',
        ...(selectedCvFolderPath ? { cvPath: selectedCvFolderPath } : { cvSource, template: cvSource === 'template' ? selectedTemplate : undefined }),
        name: cvData.name,
        furigana: cvData.furigana,
        email: cvData.email,
        phone: cvData.phone,
        addressCurrent: cvData.addressCurrent,
        birthDate: cvData.birthDate,
        ages: cvData.ages || cvData.age || '',
        gender: cvData.gender,
        currentIncome: cvData.currentIncome,
        desiredIncome: cvData.desiredIncome,
        desiredWorkLocation: cvData.desiredWorkLocation,
        nyushaTime: cvData.nyushaTime,
        selfPromotion: cvData.strengths,
        reasonApply: cvData.motivation,
        cvType: 1 // Existing CV
      };

      // Debug: Log request data to check jobId
      console.log('Submitting nomination with jobId:', requestData.jobId);
      console.log('Full request data:', requestData);

      const response = await apiService.createJobApplication(requestData);

      if (response.success) {
        alert(t.nominationSuccess || 'Tiến cử thành công!');
        navigate(`/agent/jobs/${jobId}`);
      }
    } catch (error) {
      console.error('Error submitting nomination:', error);
      alert(error.message || 'Có lỗi xảy ra khi tiến cử');
    } finally {
      setSubmitting(false);
    }
  };

  // Note: Filtering is now done on backend via search param, but we keep this for client-side filtering if needed
  const filteredCVStorages = cvStorages;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const formatGender = (gender) => {
    if (gender === '1' || gender === 1) return 'Nam';
    if (gender === '2' || gender === 2) return 'Nữ';
    return '—';
  };

  const loadNominationHistory = async () => {
    try {
      setLoadingHistory(true);
      const params = {
        limit: 100 // Get more records to group properly
      };
      if (historySearchTerm) {
        params.search = historySearchTerm;
      }
      if (historyStatusFilter) {
        params.status = historyStatusFilter;
      }
      // Get history for all candidates
      const response = await apiService.getJobApplications(params);
      if (response.success && response.data) {
        // Group by company (recruitingCompany takes priority, then company)
        const grouped = {};
        (response.data.jobApplications || []).forEach(app => {
          const rc = app.job?.recruitingCompany || app.job?.company;
          const companyName = pickByLanguage(
            rc?.companyName || rc?.name,
            rc?.companyNameEn || rc?.company_name_en,
            rc?.companyNameJp || rc?.company_name_jp,
            language
          ) || 'N/A';
          if (!grouped[companyName]) {
            grouped[companyName] = [];
          }
          grouped[companyName].push(app);
        });
        // Sort companies by number of applications (descending)
        const sortedGroups = Object.entries(grouped)
          .map(([company, apps]) => ({
            company,
            applications: apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          }))
          .sort((a, b) => b.applications.length - a.applications.length);
        setNominationHistory(sortedGroups);
      }
    } catch (error) {
      console.error('Error loading nomination history:', error);
      setNominationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadRecentCVs = async () => {
    try {
      setLoadingRecentCVs(true);
      const params = {
        page: recentPage,
        limit: itemsPerPage,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        isDuplicate: '0'
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await apiService.getRecentUpdatedCVs(params);
      if (response.success && response.data) {
        setRecentCVs(response.data.cvs || []);
        setRecentTotalItems(response.data.pagination?.total || 0);
        setRecentTotalPages(response.data.pagination?.totalPages || 0);
      }
    } catch (error) {
      console.error('Error loading recent CVs:', error);
      setRecentCVs([]);
    } finally {
      setLoadingRecentCVs(false);
    }
  };

  if (loading && step === 'select') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
          <p style={{ color: '#4b5563' }}>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Confirmation Step
  if (step === 'confirm' && selectedCV) {
    const folderOptions = [];
    for (const snap of cvSnapshots) {
      if (snap.originalFolderPath) {
        folderOptions.push({
          path: snap.originalFolderPath.replace(/\/+$/, ''),
          label: 'CV_original',
          kind: 'original',
        });
      }
      if (snap.templateFolderPath) {
        const base = snap.templateFolderPath.replace(/\/+$/, '');
        for (const tpl of ['Common', 'IT', 'Technical']) {
          folderOptions.push({
            path: `${base}/${tpl}`,
            label: `CV_Template / ${tpl}`,
            kind: 'template',
            template: tpl,
          });
        }
      }
    }

    const handlePreviewFolder = async (opt, event) => {
      if (event) event.stopPropagation();
      try {
        let url = null;
        if (opt.kind === 'original') {
          url = await apiService.getCtvCVFileUrl(selectedCvId, 'cvOriginalPath', 'view', { index: 0 });
        } else if (opt.kind === 'template') {
          url = await apiService.getCtvCVFileUrl(selectedCvId, 'curriculumVitae', 'view', {
            template: opt.template,
            document: 'rirekisho',
          });
        }
        if (url) {
          setPreviewOption(opt);
          setPreviewUrl(url);
        } else {
          alert('Không tìm thấy file CV để xem.');
        }
      } catch (err) {
        console.error('Error opening CV preview:', err);
        alert('Không mở được file CV. Vui lòng thử lại.');
      }
    };

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-2xl p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setStep('select');
                setSelectedCvId(null);
                setSelectedCV(null);
                setEditingCV(false);
              }}
              onMouseEnter={() => setHoveredBackButtonConfirm(true)}
              onMouseLeave={() => setHoveredBackButtonConfirm(false)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: hoveredBackButtonConfirm ? '#f3f4f6' : 'transparent'
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#374151' }} />
            </button>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#111827' }}>{t.confirmNominationTitle}</h1>
              <p className="text-sm mt-1" style={{ color: '#4b5563' }}>{t.confirmNominationDesc}</p>
            </div>
          </div>
        </div>

        {/* Job Information */}
        {job && (
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6" style={{ color: '#2563eb' }} />
              <h2 className="text-lg font-bold" style={{ color: '#111827' }}>Thông tin công việc</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tiêu đề</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{pickByLanguage(job.title, job.titleEn || job.title_en, job.titleJp || job.title_jp, language)}</p>
              </div>
              {job.company && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Công ty</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{pickByLanguage(job.company.name, job.company.nameEn || job.company.name_en, job.company.nameJp || job.company.name_jp, language)}</p>
                </div>
              )}
              {(job.recruitingCompany?.companyName || job.recruitingCompany?.companyNameEn || job.recruitingCompany?.companyNameJp) && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Công ty tuyển dụng</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{pickByLanguage(job.recruitingCompany?.companyName, job.recruitingCompany?.companyNameEn || job.recruitingCompany?.company_name_en, job.recruitingCompany?.companyNameJp || job.recruitingCompany?.company_name_jp, language)}</p>
                </div>
              )}
              {job.workLocation && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa điểm</label>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {job.workLocation}
                  </p>
                </div>
              )}
              {job.estimatedSalary && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương ước tính</label>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                    <DollarSign className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {job.estimatedSalary}
                  </p>
                </div>
              )}
              {job.category && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Danh mục</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{pickByLanguage(job.category.name, job.category.nameEn || job.category.name_en, job.category.nameJp || job.category.name_jp, language)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Information */}
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" style={{ color: '#2563eb' }} />
              <h2 className="text-lg font-bold" style={{ color: '#111827' }}>Thông tin ứng viên</h2>
            </div>
            {!editingCV ? (
              <button
                onClick={() => setEditingCV(true)}
                onMouseEnter={() => setHoveredEditButton(true)}
                onMouseLeave={() => setHoveredEditButton(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: hoveredEditButton ? '#1d4ed8' : '#2563eb',
                  color: 'white'
                }}
              >
                <Edit className="w-3.5 h-3.5" />
                Sửa nhanh
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCV(false);
                    // Reset to original data
                    setCvEditData({
                      name: selectedCV.name || '',
                      furigana: selectedCV.furigana || '',
                      email: selectedCV.email || '',
                      phone: selectedCV.phone || '',
                      birthDate: selectedCV.birthDate || '',
                      age: selectedCV.ages || selectedCV.age || '',
                      gender: selectedCV.gender?.toString() || '',
                      addressCurrent: selectedCV.addressCurrent || selectedCV.address || '',
                      currentIncome: selectedCV.currentIncome || '',
                      desiredIncome: selectedCV.desiredIncome || '',
                      desiredWorkLocation: selectedCV.desiredWorkLocation || '',
                      nyushaTime: selectedCV.nyushaTime || '',
                      strengths: selectedCV.strengths || '',
                      motivation: selectedCV.motivation || '',
                    });
                  }}
                  onMouseEnter={() => setHoveredCancelButton(true)}
                  onMouseLeave={() => setHoveredCancelButton(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  style={{
                    backgroundColor: hoveredCancelButton ? '#e5e7eb' : '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  Hủy
                </button>
                <button
                  onClick={handleSaveCVEdit}
                  disabled={savingCV}
                  onMouseEnter={() => !savingCV && setHoveredSaveButton(true)}
                  onMouseLeave={() => setHoveredSaveButton(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  style={{
                    backgroundColor: hoveredSaveButton ? '#16a34a' : '#22c55e',
                    color: 'white'
                  }}
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingCV ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          {editingCV ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Họ tên (Kanji) *</label>
                <input
                  type="text"
                  value={cvEditData.name}
                  onChange={(e) => setCvEditData({ ...cvEditData, name: e.target.value })}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'name' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'name' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Họ tên (Kana)</label>
                <input
                  type="text"
                  value={cvEditData.furigana}
                  onChange={(e) => setCvEditData({ ...cvEditData, furigana: e.target.value })}
                  onFocus={() => setFocusedInput('furigana')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'furigana' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'furigana' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Email</label>
                <input
                  type="email"
                  value={cvEditData.email}
                  onChange={(e) => setCvEditData({ ...cvEditData, email: e.target.value })}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'email' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'email' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Số điện thoại</label>
                <input
                  type="tel"
                  value={cvEditData.phone}
                  onChange={(e) => setCvEditData({ ...cvEditData, phone: e.target.value })}
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'phone' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'phone' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Ngày sinh</label>
                <input
                  type="date"
                  value={cvEditData.birthDate}
                  onChange={(e) => setCvEditData({ ...cvEditData, birthDate: e.target.value })}
                  onFocus={() => setFocusedInput('birthDate')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'birthDate' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'birthDate' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Tuổi</label>
                <input
                  type="number"
                  value={cvEditData.age}
                  onChange={(e) => setCvEditData({ ...cvEditData, age: e.target.value })}
                  onFocus={() => setFocusedInput('age')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'age' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'age' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Giới tính *</label>
                <select
                  value={cvEditData.gender}
                  onChange={(e) => setCvEditData({ ...cvEditData, gender: e.target.value })}
                  onFocus={() => setFocusedSelect('gender')}
                  onBlur={() => setFocusedSelect(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedSelect === 'gender' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedSelect === 'gender' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                >
                  <option value="">Chọn</option>
                  <option value="1">Nam</option>
                  <option value="2">Nữ</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Địa chỉ</label>
                <input
                  type="text"
                  value={cvEditData.addressCurrent}
                  onChange={(e) => setCvEditData({ ...cvEditData, addressCurrent: e.target.value })}
                  onFocus={() => setFocusedInput('addressCurrent')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'addressCurrent' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'addressCurrent' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Lương hiện tại</label>
                <input
                  type="text"
                  value={cvEditData.currentIncome}
                  onChange={(e) => setCvEditData({ ...cvEditData, currentIncome: e.target.value })}
                  onFocus={() => setFocusedInput('currentIncome')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'currentIncome' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'currentIncome' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Lương mong muốn</label>
                <input
                  type="text"
                  value={cvEditData.desiredIncome}
                  onChange={(e) => setCvEditData({ ...cvEditData, desiredIncome: e.target.value })}
                  onFocus={() => setFocusedInput('desiredIncome')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'desiredIncome' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'desiredIncome' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Địa điểm mong muốn</label>
                <input
                  type="text"
                  value={cvEditData.desiredWorkLocation}
                  onChange={(e) => setCvEditData({ ...cvEditData, desiredWorkLocation: e.target.value })}
                  onFocus={() => setFocusedInput('desiredWorkLocation')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'desiredWorkLocation' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'desiredWorkLocation' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Thời gian nhập công ty</label>
                <input
                  type="text"
                  value={cvEditData.nyushaTime}
                  onChange={(e) => setCvEditData({ ...cvEditData, nyushaTime: e.target.value })}
                  onFocus={() => setFocusedInput('nyushaTime')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'nyushaTime' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'nyushaTime' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Điểm mạnh</label>
                <textarea
                  value={cvEditData.strengths}
                  onChange={(e) => setCvEditData({ ...cvEditData, strengths: e.target.value })}
                  onFocus={() => setFocusedInput('strengths')}
                  onBlur={() => setFocusedInput(null)}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'strengths' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'strengths' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Động lực</label>
                <textarea
                  value={cvEditData.motivation}
                  onChange={(e) => setCvEditData({ ...cvEditData, motivation: e.target.value })}
                  onFocus={() => setFocusedInput('motivation')}
                  onBlur={() => setFocusedInput(null)}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'motivation' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'motivation' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mã CV</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{selectedCV.code || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Họ tên (Kanji)</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.name || selectedCV.name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Họ tên (Kana)</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.furigana || selectedCV.furigana || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Email</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {cvEditData.email || selectedCV.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Số điện thoại</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {cvEditData.phone || selectedCV.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày sinh</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {formatDate(cvEditData.birthDate || selectedCV.birthDate)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tuổi</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.age || selectedCV.ages || selectedCV.age || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Giới tính</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatGender(cvEditData.gender || selectedCV.gender)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa chỉ</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.addressCurrent || selectedCV.addressCurrent || selectedCV.address || '—'}</p>
              </div>
              {cvEditData.currentIncome || selectedCV.currentIncome ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương hiện tại</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.currentIncome || selectedCV.currentIncome}</p>
                </div>
              ) : null}
              {cvEditData.desiredIncome || selectedCV.desiredIncome ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương mong muốn</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.desiredIncome || selectedCV.desiredIncome}</p>
                </div>
              ) : null}
              {cvEditData.desiredWorkLocation || selectedCV.desiredWorkLocation ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa điểm mong muốn</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.desiredWorkLocation || selectedCV.desiredWorkLocation}</p>
                </div>
              ) : null}
              {cvEditData.nyushaTime || selectedCV.nyushaTime ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Thời gian nhập công ty</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.nyushaTime || selectedCV.nyushaTime}</p>
                </div>
              ) : null}
              {cvEditData.strengths || selectedCV.strengths ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Điểm mạnh</label>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{cvEditData.strengths || selectedCV.strengths}</p>
                </div>
              ) : null}
              {cvEditData.motivation || selectedCV.motivation ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Động lực</label>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{cvEditData.motivation || selectedCV.motivation}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          {/* Chọn folder CV dùng để tiến cử */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
              <span className="text-sm font-semibold" style={{ color: '#374151' }}>Chọn folder CV dùng để tiến cử</span>
            </div>
            {cvFoldersLoading && (
              <p className="text-xs mb-2" style={{ color: '#6b7280' }}>Đang tải danh sách folder...</p>
            )}
            {!cvFoldersLoading && folderOptions.length === 0 && (
              <p className="text-xs mb-2" style={{ color: '#6b7280' }}>Không tìm thấy folder CV trong hồ sơ này. Sẽ dùng CV hiện tại.</p>
            )}
            {!cvFoldersLoading && folderOptions.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border p-2" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                {folderOptions.map((opt) => (
                  <button
                    key={opt.path}
                    type="button"
                    onClick={() => setSelectedCvFolderPath(opt.path)}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                    style={{
                      backgroundColor: selectedCvFolderPath === opt.path ? '#dbeafe' : 'transparent',
                      color: selectedCvFolderPath === opt.path ? '#1d4ed8' : '#374151',
                      border: selectedCvFolderPath === opt.path ? '1px solid #93c5fd' : '1px solid transparent'
                    }}
                  >
                    <Folder className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
                    <span className="truncate flex-1">{opt.label}</span>
                    <span
                      onClick={(e) => handlePreviewFolder(opt, e)}
                      className="text-xs underline"
                      style={{ color: selectedCvFolderPath === opt.path ? '#1d4ed8' : '#2563eb' }}
                    >
                      Xem
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {previewUrl && previewOption && (
            <div className="mt-3">
              <CvFilePreview
                viewUrl={previewUrl}
                filePath="cv.pdf"
                title={previewOption.label}
                onDownload={previewUrl ? () => window.open(previewUrl, '_blank') : undefined}
                cvStorageId={selectedCvId}
                fileType={previewOption.kind === 'original' ? 'cvOriginalPath' : 'curriculumVitae'}
                getFileContent={apiService.getCtvCVFileContent}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setStep('select');
              setSelectedCvId(null);
              setSelectedCV(null);
              setEditingCV(false);
            }}
            onMouseEnter={() => setHoveredBackToListButton(true)}
            onMouseLeave={() => setHoveredBackToListButton(false)}
            className="px-4 py-2 border rounded-lg font-medium transition-colors"
            style={{
              borderColor: '#d1d5db',
              color: '#374151',
              backgroundColor: hoveredBackToListButton ? '#f3f4f6' : 'transparent'
            }}
          >
            {t.back}
          </button>
          <button
            onClick={handleSubmitNomination}
            disabled={submitting || editingCV}
            onMouseEnter={() => !submitting && !editingCV && setHoveredSubmitButton(true)}
            onMouseLeave={() => setHoveredSubmitButton(false)}
            className="px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              backgroundColor: hoveredSubmitButton ? '#facc15' : '#fbbf24',
              color: '#1e40af'
            }}
          >
            {submitting ? t.submitting : t.confirmSubmit}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        </div>
      </div>
    );
  }

  // Selection Step
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/agent/jobs/${jobId}`)}
            onMouseEnter={() => setHoveredBackButton(true)}
            onMouseLeave={() => setHoveredBackButton(false)}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: hoveredBackButton ? '#f3f4f6' : 'transparent'
            }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#374151' }} />
          </button>
        </div>
      </div>

      {/* Job Summary Section */}
      {job && (
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#dbeafe' }}>
              <Briefcase className="w-8 h-8" style={{ color: '#2563eb' }} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-2" style={{ color: '#111827' }}>{pickByLanguage(job.title, job.titleEn || job.title_en, job.titleJp || job.title_jp, language)}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {(job.company || job.recruitingCompany) && (
                  <div className="flex items-center gap-2" style={{ color: '#4b5563' }}>
                    <Building2 className="w-4 h-4" />
                    <span>{pickByLanguage((job.recruitingCompany || job.company)?.companyName || (job.company?.name), (job.recruitingCompany || job.company)?.companyNameEn || (job.recruitingCompany || job.company)?.company_name_en, (job.recruitingCompany || job.company)?.companyNameJp || (job.recruitingCompany || job.company)?.company_name_jp, language)}</span>
                  </div>
                )}
                {job.workLocation && (
                  <div className="flex items-center gap-2" style={{ color: '#4b5563' }}>
                    <MapPin className="w-4 h-4" />
                    <span>{job.workLocation}</span>
                  </div>
                )}
                {job.estimatedSalary && (
                  <div className="flex items-center gap-2" style={{ color: '#4b5563' }}>
                    <DollarSign className="w-4 h-4" />
                    <span>{job.estimatedSalary}</span>
                  </div>
                )}
                {job.category && (
                  <div className="flex items-center gap-2" style={{ color: '#4b5563' }}>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#f3f4f6' }}>{pickByLanguage(job.category.name, job.category.nameEn || job.category.name_en, job.category.nameJp || job.category.name_jp, language)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-xl border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex border-b overflow-x-auto" style={{ borderColor: '#e5e7eb' }}>
          <button
            onClick={() => setActiveTab('existing')}
            onMouseEnter={() => activeTab !== 'existing' && setHoveredPaginationButton('existing-tab')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            className="px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2"
            style={{
              backgroundColor: activeTab === 'existing' ? '#eff6ff' : hoveredPaginationButton === 'existing-tab' ? '#f9fafb' : 'transparent',
              color: activeTab === 'existing' ? '#1d4ed8' : hoveredPaginationButton === 'existing-tab' ? '#111827' : '#4b5563',
              borderColor: activeTab === 'existing' ? '#1d4ed8' : 'transparent'
            }}
          >
            {t.selectExistingCV || 'Chọn ứng viên có sẵn'}
          </button>
          {/* Ẩn tab CV cập nhật gần nhất và Lịch sử tiến cử */}
          <button
            onClick={() => setActiveTab('recent')}
            onMouseEnter={() => activeTab !== 'recent' && setHoveredPaginationButton('recent-tab')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            className="px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 hidden"
            style={{
              backgroundColor: activeTab === 'recent' ? '#eff6ff' : hoveredPaginationButton === 'recent-tab' ? '#f9fafb' : 'transparent',
              color: activeTab === 'recent' ? '#1d4ed8' : hoveredPaginationButton === 'recent-tab' ? '#111827' : '#4b5563',
              borderColor: activeTab === 'recent' ? '#1d4ed8' : 'transparent'
            }}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              CV được cập nhật gần nhất
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            onMouseEnter={() => activeTab !== 'history' && setHoveredPaginationButton('history-tab')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            className="px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 hidden"
            style={{
              backgroundColor: activeTab === 'history' ? '#eff6ff' : hoveredPaginationButton === 'history-tab' ? '#f9fafb' : 'transparent',
              color: activeTab === 'history' ? '#1d4ed8' : hoveredPaginationButton === 'history-tab' ? '#111827' : '#4b5563',
              borderColor: activeTab === 'history' ? '#1d4ed8' : 'transparent'
            }}
          >
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              {t.nominationHistoryTab}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('new')}
            onMouseEnter={() => activeTab !== 'new' && setHoveredPaginationButton('new-tab')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            className="px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2"
            style={{
              backgroundColor: activeTab === 'new' ? '#eff6ff' : hoveredPaginationButton === 'new-tab' ? '#f9fafb' : 'transparent',
              color: activeTab === 'new' ? '#1d4ed8' : hoveredPaginationButton === 'new-tab' ? '#111827' : '#4b5563',
              borderColor: activeTab === 'new' ? '#1d4ed8' : 'transparent'
            }}
          >
            {t.createNewCV || 'Tạo hồ sơ mới'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'existing' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder={t.searchCV || 'Tìm kiếm ứng viên...'}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  onFocus={() => setFocusedInput('search')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'search' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'search' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>

              {/* CV List */}
              {loadingCVs ? (
                <div className="text-center py-8" style={{ color: '#6b7280' }}>
                  {t.loading || 'Đang tải...'}
                </div>
              ) : filteredCVStorages.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#6b7280' }}>
                  {t.noCVFound || 'Không tìm thấy ứng viên nào'}
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-200 overflow-y-auto">
                    {filteredCVStorages.map((cv) => {
                      const canSelect = !cv.isDuplicate;
                      const isHovered = hoveredCVItem === cv.id;
                      
                      return (
                        <div
                          key={cv.id}
                          onClick={() => canSelect && handleSelectCV(cv.id)}
                          onMouseEnter={() => canSelect && setHoveredCVItem(cv.id)}
                          onMouseLeave={() => setHoveredCVItem(null)}
                          className="p-4 border-2 rounded-lg transition-all"
                          style={{
                            borderColor: !canSelect 
                              ? '#e5e7eb' 
                              : selectedCvId === cv.id
                              ? '#2563eb'
                              : isHovered
                              ? '#9ca3af'
                              : '#e5e7eb',
                            backgroundColor: !canSelect 
                              ? '#f9fafb' 
                              : selectedCvId === cv.id
                              ? '#eff6ff'
                              : 'white',
                            opacity: !canSelect ? 0.6 : 1,
                            cursor: !canSelect ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#2563eb' }}>
                                {cv.name ? cv.name.charAt(0) : '?'}
                              </div>
                              <div>
                                <p className="font-semibold" style={{ color: '#111827' }}>{cv.name || 'N/A'}</p>
                                <p className="text-sm" style={{ color: '#4b5563' }}>{cv.email || 'N/A'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs" style={{ color: '#6b7280' }}>{cv.code}</p>
                                  {cv.status !== undefined && (
                                    <>
                                      <span className="text-xs" style={{ color: '#9ca3af' }}>•</span>
                                      <span className="text-xs" style={{ color: '#6b7280' }}>
                                        Loại hồ sơ: {
                                          cv.status === 0 ? 'Draft' :
                                          cv.status === 1 ? 'Active' :
                                          cv.status === 2 ? 'Archived' : '—'
                                        }
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedCvId === cv.id && canSelect && (
                              <CheckCircle className="w-6 h-6" style={{ color: '#2563eb' }} />
                            )}
                          </div>
                          {cv.isDuplicate && (
                            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: '#dc2626' }}>
                              <AlertTriangle className="w-4 h-4" />
                              <span>{t.duplicateCVWarning || 'Hồ sơ trùng lặp'}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          onMouseEnter={() => currentPage !== 1 && setHoveredPaginationButton('first')}
                          onMouseLeave={() => setHoveredPaginationButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: hoveredPaginationButton === 'first' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151'
                          }}
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          onMouseEnter={() => currentPage !== 1 && setHoveredPaginationButton('prev')}
                          onMouseLeave={() => setHoveredPaginationButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: hoveredPaginationButton === 'prev' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151'
                          }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(7, totalPages))].map((_, i) => {
                          // Calculate page numbers to show
                          let pageNum;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (currentPage <= 4) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = currentPage - 3 + i;
                          }
                          
                          if (pageNum < 1 || pageNum > totalPages) return null;
                          
                          const isActive = currentPage === pageNum;
                          const isHovered = hoveredPaginationButton === `page-${pageNum}`;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              onMouseEnter={() => !isActive && setHoveredPaginationButton(`page-${pageNum}`)}
                              onMouseLeave={() => setHoveredPaginationButton(null)}
                              className="px-3 py-1 rounded text-sm font-bold transition-colors"
                              style={{
                                backgroundColor: isActive ? '#2563eb' : isHovered ? '#f9fafb' : 'white',
                                color: isActive ? 'white' : '#374151',
                                border: isActive ? 'none' : '1px solid #d1d5db',
                                borderColor: isActive ? 'transparent' : '#d1d5db'
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationButton('next')}
                          onMouseLeave={() => setHoveredPaginationButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: hoveredPaginationButton === 'next' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151'
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationButton('last')}
                          onMouseLeave={() => setHoveredPaginationButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: hoveredPaginationButton === 'last' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151'
                          }}
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: '#4b5563' }}>
                          {t.page || 'Trang'} {currentPage} / {totalPages} ({totalItems} {t.results || 'kết quả'})
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          onFocus={() => setFocusedSelect('itemsPerPage')}
                          onBlur={() => setFocusedSelect(null)}
                          className="px-2 py-1 border rounded text-sm"
                          style={{
                            borderColor: focusedSelect === 'itemsPerPage' ? '#2563eb' : '#d1d5db',
                            boxShadow: focusedSelect === 'itemsPerPage' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                          }}
                        >
                          <option value="10">10 / {t.page || 'trang'}</option>
                          <option value="20">20 / {t.page || 'trang'}</option>
                          <option value="50">50 / {t.page || 'trang'}</option>
                          <option value="100">100 / {t.page || 'trang'}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'recent' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm CV được cập nhật gần nhất..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setRecentPage(1);
                  }}
                  onFocus={() => setFocusedInput('recent-search')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{
                    borderColor: focusedInput === 'recent-search' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedInput === 'recent-search' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                />
              </div>

              {/* Recent CVs List */}
              {loadingRecentCVs ? (
                <div className="text-center py-8 text-sm" style={{ color: '#6b7280' }}>
                  Đang tải...
                </div>
              ) : recentCVs.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: '#6b7280' }}>
                  Không có CV nào được cập nhật gần đây
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {recentCVs.map((cv) => {
                      const canSelect = !cv.isDuplicate;
                      const isHovered = hoveredCVItem === `recent-${cv.id}`;
                      
                      return (
                        <div
                          key={cv.id}
                          onClick={() => canSelect && handleSelectCV(cv.id)}
                          onMouseEnter={() => canSelect && setHoveredCVItem(`recent-${cv.id}`)}
                          onMouseLeave={() => setHoveredCVItem(null)}
                          className="p-3 border rounded-lg transition-all"
                          style={{
                            borderColor: !canSelect 
                              ? '#e5e7eb' 
                              : selectedCvId === cv.id
                              ? '#2563eb'
                              : isHovered
                              ? '#9ca3af'
                              : '#e5e7eb',
                            backgroundColor: !canSelect 
                              ? '#f9fafb' 
                              : selectedCvId === cv.id
                              ? '#eff6ff'
                              : 'white',
                            opacity: !canSelect ? 0.6 : 1,
                            cursor: !canSelect ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: '#2563eb' }}>
                                {cv.name ? cv.name.charAt(0) : '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: '#111827' }}>{cv.name || 'N/A'}</p>
                                <p className="text-xs truncate" style={{ color: '#4b5563' }}>{cv.email || 'N/A'}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs" style={{ color: '#6b7280' }}>{cv.code}</p>
                                  {cv.updatedAt && (
                                    <>
                                      <span className="text-xs" style={{ color: '#9ca3af' }}>•</span>
                                      <span className="text-xs" style={{ color: '#6b7280' }}>
                                        Cập nhật: {formatDate(cv.updatedAt)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedCvId === cv.id && canSelect && (
                              <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#2563eb' }} />
                            )}
                            {!canSelect && (
                              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#f97316' }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {recentTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setRecentPage(1)}
                          disabled={recentPage === 1}
                          onMouseEnter={() => recentPage !== 1 && setHoveredRecentPaginationButton('first')}
                          onMouseLeave={() => setHoveredRecentPaginationButton(null)}
                          className="px-2 py-1 border rounded text-xs font-bold disabled:opacity-50"
                          style={{
                            backgroundColor: hoveredRecentPaginationButton === 'first' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151'
                          }}
                        >
                          <ChevronsLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRecentPage(recentPage - 1)}
                          disabled={recentPage === 1}
                          onMouseEnter={() => recentPage !== 1 && setHoveredRecentPaginationButton('prev')}
                          onMouseLeave={() => setHoveredRecentPaginationButton(null)}
                          className="px-2 py-1 border rounded text-xs font-bold disabled:opacity-50"
                          style={{
                            backgroundColor: hoveredRecentPaginationButton === 'prev' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151'
                          }}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs px-2" style={{ color: '#4b5563' }}>
                          Trang {recentPage} / {recentTotalPages}
                        </span>
                        <button
                          onClick={() => setRecentPage(recentPage + 1)}
                          disabled={recentPage === recentTotalPages}
                          onMouseEnter={() => recentPage !== recentTotalPages && setHoveredRecentPaginationButton('next')}
                          onMouseLeave={() => setHoveredRecentPaginationButton(null)}
                          className="px-2 py-1 border rounded text-xs font-bold disabled:opacity-50"
                          style={{
                            backgroundColor: hoveredRecentPaginationButton === 'next' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151'
                          }}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRecentPage(recentTotalPages)}
                          disabled={recentPage === recentTotalPages}
                          onMouseEnter={() => recentPage !== recentTotalPages && setHoveredRecentPaginationButton('last')}
                          onMouseLeave={() => setHoveredRecentPaginationButton(null)}
                          className="px-2 py-1 border rounded text-xs font-bold disabled:opacity-50"
                          style={{
                            backgroundColor: hoveredRecentPaginationButton === 'last' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151'
                          }}
                        >
                          <ChevronsRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs" style={{ color: '#4b5563' }}>
                        {recentTotalItems} kết quả
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-4">
              {/* Search và Filter trạng thái */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên ứng viên, công ty..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    onFocus={() => setFocusedInput('history-search')}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none"
                    style={{
                      borderColor: focusedInput === 'history-search' ? '#2563eb' : '#d1d5db',
                      boxShadow: focusedInput === 'history-search' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                    }}
                  />
                </div>
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  onFocus={() => setFocusedSelect('history-status')}
                  onBlur={() => setFocusedSelect(null)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none min-w-[200px]"
                  style={{
                    borderColor: focusedSelect === 'history-status' ? '#2563eb' : '#d1d5db',
                    boxShadow: focusedSelect === 'history-status' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  {getJobApplicationStatusOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* History List */}
              {loadingHistory ? (
                <div className="text-center py-8 text-sm" style={{ color: '#6b7280' }}>
                  {t.loadingData}
                </div>
              ) : nominationHistory.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: '#6b7280' }}>
                  {t.noNominationHistory}
                </div>
              ) : (
                <div className="space-y-2">
                  {nominationHistory.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg"
                      style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}
                    >
                      <p className="font-semibold text-sm mb-2" style={{ color: '#111827' }}>
                        Cty {index + 1}: {item.company}
                      </p>
                      <div className="space-y-1.5 pl-2 border-l-2" style={{ borderColor: '#e5e7eb' }}>
                        {item.applications.map((app) => {
                          const statusInfo = app.status ? getJobApplicationStatus(app.status) : null;
                          const getStatusStyle = () => {
                            if (!statusInfo) return { backgroundColor: '#f3f4f6', color: '#1f2937' };
                            if (statusInfo.category === 'success') return { backgroundColor: '#dcfce7', color: '#166534' };
                            if (statusInfo.category === 'rejected' || statusInfo.category === 'cancelled') return { backgroundColor: '#fee2e2', color: '#991b1b' };
                            if (statusInfo.category === 'interview' || statusInfo.category === 'waiting') return { backgroundColor: '#dbeafe', color: '#1e40af' };
                            return { backgroundColor: '#fef9c3', color: '#854d0e' };
                          };
                          const jobTitle = app.job ? pickByLanguage(app.job.title, app.job.titleEn || app.job.title_en, app.job.titleJp || app.job.title_jp, language) : '';
                          return (
                            <div key={app.id} className="text-xs" style={{ color: '#4b5563' }}>
                              <span className="font-medium">{app.cv?.name || app.name || 'N/A'}</span>
                              {jobTitle && (
                                <span style={{ color: '#6b7280' }}> - {jobTitle}</span>
                              )}
                              {app.status != null && statusInfo && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={getStatusStyle()}>
                                  {getJobApplicationStatusLabelByLanguage(app.status, language)}
                                </span>
                              )}
                              <span className="ml-2" style={{ color: '#9ca3af' }}>
                                ({formatDate(app.createdAt)})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <AddCandidateForm 
              jobId={jobId}
              onSuccess={() => navigate(`/agent/jobs/${jobId}`)}
              onCancel={() => navigate(`/agent/jobs/${jobId}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NominationPage;
