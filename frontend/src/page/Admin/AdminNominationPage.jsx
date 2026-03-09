import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  CheckCircle,
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
  Folder,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import AddCandidateForm from '../../component/Shared/AddCandidateForm';
import CvFilePreview from '../../component/Admin/CvFilePreview';

const AdminNominationPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'new'
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
  const [cvSnapshots, setCvSnapshots] = useState([]);
  const [cvFoldersLoading, setCvFoldersLoading] = useState(false);
  const [selectedCvFolderPath, setSelectedCvFolderPath] = useState('');
  const [cvFileList, setCvFileList] = useState({ originals: [], templates: [] });
  const [openFolders, setOpenFolders] = useState({});
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredBackToSelectButton, setHoveredBackToSelectButton] = useState(false);
  const [hoveredEditCVButton, setHoveredEditCVButton] = useState(false);
  const [hoveredCancelCVButton, setHoveredCancelCVButton] = useState(false);
  const [hoveredSaveCVButton, setHoveredSaveCVButton] = useState(false);
  const [hoveredBackToSelectConfirmButton, setHoveredBackToSelectConfirmButton] = useState(false);
  const [hoveredConfirmNominationButton, setHoveredConfirmNominationButton] = useState(false);
  const [hoveredTabExisting, setHoveredTabExisting] = useState(false);
  const [hoveredTabNew, setHoveredTabNew] = useState(false);
  const [hoveredCvCardIndex, setHoveredCvCardIndex] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  useEffect(() => {
    if (activeTab === 'existing' && step === 'select') {
      loadCVStorages();
    }
  }, [jobId, activeTab, step, currentPage, itemsPerPage, searchTerm]);

  // Build CV folder list from CV paths in DB when confirming nomination
  useEffect(() => {
    if (step !== 'confirm' || !selectedCV) {
      setCvSnapshots([]);
      setSelectedCvFolderPath('');
      setCvFoldersLoading(false);
      setCvFileList({ originals: [], templates: [] });
      setOpenFolders({});
      return;
    }

    setCvFoldersLoading(true);
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

    let cancelled = false;
    (async () => {
      try {
        const data = await apiService.getAdminCVFileList(selectedCvId);
        if (!cancelled) {
          setCvFileList(data || { originals: [], templates: [] });
        }
      } catch {
        if (!cancelled) {
          setCvFileList({ originals: [], templates: [] });
        }
      } finally {
        if (!cancelled) {
          setCvFoldersLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, selectedCV, selectedCvId]);

  const toggleFolderOpen = (folderId) => {
    setOpenFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminJobById(jobId);
      
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
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await apiService.getAdminCVs(params);
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
      const cvResponse = await apiService.getAdminCVById(cvId);
      
      if (!cvResponse.success || !cvResponse.data?.cv) {
        alert(t.adminNominationCvNotFound);
        return;
      }

      const cv = cvResponse.data.cv;

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
        name: cv.name || cv.fullName || '',
        furigana: cv.furigana || '',
        email: cv.email || '',
        phone: cv.phone || '',
        birthDate: cv.birthDate || '',
        age: cv.ages || cv.age || '',
        gender: genderValue,
        addressCurrent: cv.addressCurrent || cv.address || '',
        currentIncome: cv.currentIncome || cv.currentSalary || '',
        desiredIncome: cv.desiredIncome || cv.desiredSalary || '',
        desiredWorkLocation: cv.desiredWorkLocation || cv.desiredLocation || '',
        nyushaTime: cv.nyushaTime || '',
        strengths: cv.strengths || '',
        motivation: cv.motivation || '',
      });
      setStep('confirm');
    } catch (error) {
      console.error('Error loading CV:', error);
      alert(t.adminNominationErrorLoadCv);
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

      const response = await apiService.updateAdminCV(selectedCvId, formData);
      
      if (response.success) {
        // Reload CV data
        const cvResponse = await apiService.getAdminCVById(selectedCvId);
        if (cvResponse.success && cvResponse.data?.cv) {
          setSelectedCV(cvResponse.data.cv);
          setCvEditData({
            name: cvResponse.data.cv.name || cvResponse.data.cv.fullName || '',
            furigana: cvResponse.data.cv.furigana || '',
            email: cvResponse.data.cv.email || '',
            phone: cvResponse.data.cv.phone || '',
            birthDate: cvResponse.data.cv.birthDate || '',
            age: cvResponse.data.cv.ages || cvResponse.data.cv.age || '',
            gender: cvResponse.data.cv.gender?.toString() || '',
            addressCurrent: cvResponse.data.cv.addressCurrent || cvResponse.data.cv.address || '',
            currentIncome: cvResponse.data.cv.currentIncome || cvResponse.data.cv.currentSalary || '',
            desiredIncome: cvResponse.data.cv.desiredIncome || cvResponse.data.cv.desiredSalary || '',
            desiredWorkLocation: cvResponse.data.cv.desiredWorkLocation || cvResponse.data.cv.desiredLocation || '',
            nyushaTime: cvResponse.data.cv.nyushaTime || '',
            strengths: cvResponse.data.cv.strengths || '',
            motivation: cvResponse.data.cv.motivation || '',
          });
        }
        setEditingCV(false);
        alert(t.adminNominationCvUpdateSuccess);
      } else {
        alert(response.message || t.adminNominationCvUpdateError);
      }
    } catch (error) {
      console.error('Error saving CV edit:', error);
      alert(error.message || t.adminNominationCvUpdateError);
    } finally {
      setSavingCV(false);
    }
  };

  const handleSubmitNomination = async () => {
    if (!selectedCV) {
      alert(t.adminNominationPleaseSelectCandidate);
      return;
    }

    if (!jobId) {
      alert(t.adminNominationJobIdRequired);
      return;
    }

    try {
      setSubmitting(true);
      
      // Use edited data if available, otherwise use original CV data
      const cvData = editingCV ? cvEditData : {
        name: selectedCV.name || selectedCV.fullName || '',
        furigana: selectedCV.furigana || '',
        email: selectedCV.email || '',
        phone: selectedCV.phone || '',
        birthDate: selectedCV.birthDate || '',
        ages: selectedCV.ages || selectedCV.age || '',
        gender: selectedCV.gender?.toString() || '',
        addressCurrent: selectedCV.addressCurrent || selectedCV.address || '',
        currentIncome: selectedCV.currentIncome || selectedCV.currentSalary || '',
        desiredIncome: selectedCV.desiredIncome || selectedCV.desiredSalary || '',
        desiredWorkLocation: selectedCV.desiredWorkLocation || selectedCV.desiredLocation || '',
        nyushaTime: selectedCV.nyushaTime || '',
        strengths: selectedCV.strengths || '',
        motivation: selectedCV.motivation || '',
      };

      // Create job application with CV storage
      // Send as JSON since backend expects req.body (not FormData)
      const requestData = {
        jobId: parseInt(jobId), // Backend expects integer
        cvCode: selectedCV.code || selectedCV.id?.toString() || '', // Backend expects cvCode, not cvId
      };

      // CV folder path (khi đã chọn folder tại bước xác nhận)
      if (selectedCvFolderPath && selectedCvFolderPath.trim()) {
        requestData.cvPath = selectedCvFolderPath.trim();
      }

      // Debug: Log request data to check jobId
      console.log('Submitting nomination with jobId:', requestData.jobId);
      console.log('Full request data:', requestData);

      const response = await apiService.createAdminJobApplication(requestData);

      if (response.success) {
        alert(t.nominationSuccess);
        navigate(`/admin/jobs/${jobId}`);
      } else {
        alert(response.message || t.adminNominationErrorSubmit);
      }
    } catch (error) {
      console.error('Error submitting nomination:', error);
      alert(error.message || t.adminNominationErrorSubmit);
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
    if (gender === '1' || gender === 1) return t.genderMale;
    if (gender === '2' || gender === 2) return t.genderFemale;
    return '—';
  };

  if (loading && step === 'select') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
          <p style={{ color: '#4b5563' }}>{t.adminNominationLoadingInfo}</p>
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
          id: 'CV_original',
          path: snap.originalFolderPath.replace(/\/+$/, ''),
          label: 'CV_original',
          kind: 'original',
        });
      }
      if (snap.templateFolderPath) {
        const base = snap.templateFolderPath.replace(/\/+$/, '');
        for (const tpl of ['Common', 'IT', 'Technical']) {
          folderOptions.push({
            id: `CV_Template/${tpl}`,
            path: `${base}/${tpl}`,
            label: `CV_Template / ${tpl}`,
            kind: 'template',
            template: tpl,
          });
        }
      }
    }

    const templatesByName = { Common: [], IT: [], Technical: [] };
    (cvFileList.templates || []).forEach((tpl) => {
      if (tpl?.template && templatesByName[tpl.template]) {
        templatesByName[tpl.template].push(tpl);
      }
    });

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
              onMouseEnter={() => setHoveredBackToSelectButton(true)}
              onMouseLeave={() => setHoveredBackToSelectButton(false)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: hoveredBackToSelectButton ? '#f3f4f6' : 'transparent'
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#374151' }} />
            </button>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#111827' }}>{t.adminNominationConfirmTitle}</h1>
              <p className="text-sm mt-1" style={{ color: '#4b5563' }}>{t.adminNominationConfirmSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Job Information */}
        {job && (
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6" style={{ color: '#2563eb' }} />
              <h2 className="text-lg font-bold" style={{ color: '#111827' }}>{t.jobInfo}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.title}</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{job.title}</p>
              </div>
              {job.company && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.company}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{job.company.name}</p>
                </div>
              )}
              {job.recruitingCompany?.companyName && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.adminNominationRecruitingCompany}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{job.recruitingCompany.companyName}</p>
                </div>
              )}
              {job.workLocation && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.workLocation}</label>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {job.workLocation}
                  </p>
                </div>
              )}
              {job.estimatedSalary && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.estimatedSalary}</label>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                    <DollarSign className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {job.estimatedSalary}
                  </p>
                </div>
              )}
              {job.category && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.category}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{job.category.name}</p>
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
              <h2 className="text-lg font-bold" style={{ color: '#111827' }}>{t.candidateInfo}</h2>
            </div>
            {!editingCV ? (
              <button
                onClick={() => setEditingCV(true)}
                onMouseEnter={() => setHoveredEditCVButton(true)}
                onMouseLeave={() => setHoveredEditCVButton(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: hoveredEditCVButton ? '#1d4ed8' : '#2563eb',
                  color: 'white'
                }}
              >
                <Edit className="w-3.5 h-3.5" />
                {t.adminNominationQuickEdit}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCV(false);
                    setCvEditData({
                      name: selectedCV.name || selectedCV.fullName || '',
                      furigana: selectedCV.furigana || '',
                      email: selectedCV.email || '',
                      phone: selectedCV.phone || '',
                      birthDate: selectedCV.birthDate || '',
                      age: selectedCV.ages || selectedCV.age || '',
                      gender: selectedCV.gender?.toString() || '',
                      addressCurrent: selectedCV.addressCurrent || selectedCV.address || '',
                      currentIncome: selectedCV.currentIncome || selectedCV.currentSalary || '',
                      desiredIncome: selectedCV.desiredIncome || selectedCV.desiredSalary || '',
                      desiredWorkLocation: selectedCV.desiredWorkLocation || selectedCV.desiredLocation || '',
                      nyushaTime: selectedCV.nyushaTime || '',
                      strengths: selectedCV.strengths || '',
                      motivation: selectedCV.motivation || '',
                    });
                  }}
                  onMouseEnter={() => setHoveredCancelCVButton(true)}
                  onMouseLeave={() => setHoveredCancelCVButton(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  style={{
                    backgroundColor: hoveredCancelCVButton ? '#e5e7eb' : '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveCVEdit}
                  disabled={savingCV}
                  onMouseEnter={() => !savingCV && setHoveredSaveCVButton(true)}
                  onMouseLeave={() => setHoveredSaveCVButton(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  style={{
                    backgroundColor: savingCV
                      ? '#86efac'
                      : (hoveredSaveCVButton ? '#15803d' : '#16a34a'),
                    color: 'white',
                    opacity: savingCV ? 0.5 : 1,
                    cursor: savingCV ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingCV ? t.saving : t.save}
                </button>
              </div>
            )}
          </div>

          {editingCV ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.adminNominationNameKanjiRequired}</label>
                <input
                  type="text"
                  value={cvEditData.name}
                  onChange={(e) => setCvEditData({ ...cvEditData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.nameKana}</label>
                <input
                  type="text"
                  value={cvEditData.furigana}
                  onChange={(e) => setCvEditData({ ...cvEditData, furigana: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.email}</label>
                <input
                  type="email"
                  value={cvEditData.email}
                  onChange={(e) => setCvEditData({ ...cvEditData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.adminNominationPhoneLabel}</label>
                <input
                  type="tel"
                  value={cvEditData.phone}
                  onChange={(e) => setCvEditData({ ...cvEditData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.birthDate}</label>
                <input
                  type="date"
                  value={cvEditData.birthDate}
                  onChange={(e) => setCvEditData({ ...cvEditData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.age}</label>
                <input
                  type="number"
                  value={cvEditData.age}
                  onChange={(e) => setCvEditData({ ...cvEditData, age: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.genderRequired}</label>
                <select
                  value={cvEditData.gender}
                  onChange={(e) => setCvEditData({ ...cvEditData, gender: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                  <option value="">{t.selectOption}</option>
                  <option value="1">{t.genderMale}</option>
                  <option value="2">{t.genderFemale}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.address}</label>
                <input
                  type="text"
                  value={cvEditData.addressCurrent}
                  onChange={(e) => setCvEditData({ ...cvEditData, addressCurrent: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.currentSalary}</label>
                <input
                  type="text"
                  value={cvEditData.currentIncome}
                  onChange={(e) => setCvEditData({ ...cvEditData, currentIncome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.desiredSalary}</label>
                <input
                  type="text"
                  value={cvEditData.desiredIncome}
                  onChange={(e) => setCvEditData({ ...cvEditData, desiredIncome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.desiredLocation}</label>
                <input
                  type="text"
                  value={cvEditData.desiredWorkLocation}
                  onChange={(e) => setCvEditData({ ...cvEditData, desiredWorkLocation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.nyushaTimeLabel}</label>
                <input
                  type="text"
                  value={cvEditData.nyushaTime}
                  onChange={(e) => setCvEditData({ ...cvEditData, nyushaTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.strengthsLabel}</label>
                <textarea
                  value={cvEditData.strengths}
                  onChange={(e) => setCvEditData({ ...cvEditData, strengths: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.motivationLabel}</label>
                <textarea
                  value={cvEditData.motivation}
                  onChange={(e) => setCvEditData({ ...cvEditData, motivation: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.cvCode}</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{selectedCV.code || selectedCV.id || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.nameKanji}</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.name || selectedCV.name || selectedCV.fullName || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.nameKana}</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.furigana || selectedCV.furigana || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.email}</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {cvEditData.email || selectedCV.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.adminNominationPhoneLabel}</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {cvEditData.phone || selectedCV.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.birthDate}</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {formatDate(cvEditData.birthDate || selectedCV.birthDate)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.age}</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.age || selectedCV.ages || selectedCV.age || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.gender}</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatGender(cvEditData.gender || selectedCV.gender)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.address}</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.addressCurrent || selectedCV.addressCurrent || selectedCV.address || '—'}</p>
              </div>
              {cvEditData.currentIncome || selectedCV.currentIncome || selectedCV.currentSalary ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.currentSalary}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.currentIncome || selectedCV.currentIncome || selectedCV.currentSalary}</p>
                </div>
              ) : null}
              {cvEditData.desiredIncome || selectedCV.desiredIncome || selectedCV.desiredSalary ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.desiredSalary}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.desiredIncome || selectedCV.desiredIncome || selectedCV.desiredSalary}</p>
                </div>
              ) : null}
              {cvEditData.desiredWorkLocation || selectedCV.desiredWorkLocation || selectedCV.desiredLocation ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.desiredLocation}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.desiredWorkLocation || selectedCV.desiredWorkLocation || selectedCV.desiredLocation}</p>
                </div>
              ) : null}
              {cvEditData.nyushaTime || selectedCV.nyushaTime ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.nyushaTimeLabel}</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.nyushaTime || selectedCV.nyushaTime}</p>
                </div>
              ) : null}
              {cvEditData.strengths || selectedCV.strengths ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.strengthsLabel}</label>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{cvEditData.strengths || selectedCV.strengths}</p>
                </div>
              ) : null}
              {cvEditData.motivation || selectedCV.motivation ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>{t.motivationLabel}</label>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{cvEditData.motivation || selectedCV.motivation}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Chọn folder CV dùng để tiến cử */}
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-2 mb-2">
            <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
            <span className="text-sm font-semibold" style={{ color: '#374151' }}>
              Chọn folder CV dùng để tiến cử
            </span>
          </div>
          {cvFoldersLoading && (
            <p className="text-xs mb-2" style={{ color: '#6b7280' }}>
              Đang tải danh sách folder...
            </p>
          )}
          {!cvFoldersLoading && folderOptions.length === 0 && (
            <p className="text-xs mb-2" style={{ color: '#6b7280' }}>
              Không tìm thấy folder CV trong hồ sơ này. Sẽ dùng CV hiện tại.
            </p>
          )}
          {!cvFoldersLoading && folderOptions.length > 0 && (
            <div
              className="space-y-3 max-h-[70vh] overflow-y-auto rounded-lg border p-3"
              style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
            >
              {folderOptions.map((opt) => {
                const isOpen = !!openFolders[opt.id];
                const isSelected = selectedCvFolderPath === opt.path;
                const files =
                  opt.kind === 'original'
                    ? cvFileList.originals || []
                    : templatesByName[opt.template] || [];

                return (
                  <div key={opt.id} className="rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                    <button
                      type="button"
                      onClick={() => {
                        toggleFolderOpen(opt.id);
                        setSelectedCvFolderPath(opt.path);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm"
                      style={{
                        backgroundColor: isSelected ? '#dbeafe' : 'transparent',
                        color: isSelected ? '#1d4ed8' : '#374151',
                      }}
                    >
                      <ChevronRight
                        className="w-3 h-3 transition-transform"
                        style={{ color: '#6b7280', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                      <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                      <span className="truncate flex-1">{opt.label}</span>
                    </button>

                    {isOpen && files.length > 0 && (
                      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {files.map((file, idx) => {
                          const filePath =
                            file.name ||
                            (file.label
                              ? (file.label.toLowerCase().endsWith('.pdf') ? file.label : `${file.label}.pdf`)
                              : 'cv.pdf');
                          const title = file.name || file.label || 'CV';
                          return (
                            <CvFilePreview
                              key={`${opt.id}-${idx}`}
                              viewUrl={file.viewUrl}
                              filePath={filePath}
                              title={title}
                              onDownload={
                                file.downloadUrl ? () => window.open(file.downloadUrl, '_blank') : undefined
                              }
                              cvStorageId={selectedCvId}
                              fileType={opt.kind === 'original' ? 'cvOriginalPath' : 'curriculumVitae'}
                            />
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

        {/* Action Buttons */}
        <div className="rounded-2xl p-4 border flex items-center justify-end gap-3" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <button
            onClick={() => {
              setStep('select');
              setSelectedCvId(null);
              setSelectedCV(null);
              setEditingCV(false);
            }}
            onMouseEnter={() => setHoveredBackToSelectConfirmButton(true)}
            onMouseLeave={() => setHoveredBackToSelectConfirmButton(false)}
            className="px-4 py-2 border rounded-lg font-medium transition-colors"
            style={{
              borderColor: '#d1d5db',
              color: '#374151',
              backgroundColor: hoveredBackToSelectConfirmButton ? '#f3f4f6' : 'transparent'
            }}
          >
            {t.adminNominationBack}
          </button>
          <button
            onClick={handleSubmitNomination}
            disabled={submitting || editingCV}
            onMouseEnter={() => !(submitting || editingCV) && setHoveredConfirmNominationButton(true)}
            onMouseLeave={() => setHoveredConfirmNominationButton(false)}
            className="px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor: (submitting || editingCV)
                ? '#fde047'
                : (hoveredConfirmNominationButton ? '#eab308' : '#facc15'),
              color: '#1e40af',
              opacity: (submitting || editingCV) ? 0.5 : 1,
              cursor: (submitting || editingCV) ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? t.submitting : t.adminNominationConfirmButton}
            <ChevronRight className="w-4 h-4" />
          </button>
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
            onClick={() => navigate(`/admin/jobs/${jobId}`)}
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
              <h2 className="text-lg font-bold mb-2" style={{ color: '#111827' }}>{job.title}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {job.company && (
                  <div className="flex items-center gap-2" style={{ color: '#4b5563' }}>
                    <Building2 className="w-4 h-4" />
                    <span>{job.company.name}</span>
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
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#f3f4f6' }}>{job.category.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-2xl border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
          <button
            onClick={() => setActiveTab('existing')}
            onMouseEnter={() => activeTab !== 'existing' && setHoveredTabExisting(true)}
            onMouseLeave={() => setHoveredTabExisting(false)}
            className="flex-1 px-6 py-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'existing' ? '#eff6ff' : (hoveredTabExisting ? '#f9fafb' : 'transparent'),
              color: activeTab === 'existing' ? '#1d4ed8' : (hoveredTabExisting ? '#111827' : '#4b5563'),
              borderBottom: activeTab === 'existing' ? '2px solid #1d4ed8' : '2px solid transparent'
            }}
          >
            {t.selectExistingCV}
          </button>
          <button
            onClick={() => setActiveTab('new')}
            onMouseEnter={() => activeTab !== 'new' && setHoveredTabNew(true)}
            onMouseLeave={() => setHoveredTabNew(false)}
            className="flex-1 px-6 py-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'new' ? '#eff6ff' : (hoveredTabNew ? '#f9fafb' : 'transparent'),
              color: activeTab === 'new' ? '#1d4ed8' : (hoveredTabNew ? '#111827' : '#4b5563'),
              borderBottom: activeTab === 'new' ? '2px solid #1d4ed8' : '2px solid transparent'
            }}
          >
            {t.createNewCV}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'existing' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder={t.searchCV}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
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

              {/* CV List */}
              {loadingCVs ? (
                <div className="text-center py-8" style={{ color: '#6b7280' }}>
                  {t.loading}
                </div>
              ) : filteredCVStorages.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#6b7280' }}>
                  {t.noCVFound}
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-200 overflow-y-auto">
                    {filteredCVStorages.map((cv, index) => {
                      return (
                        <div
                          key={cv.id}
                          onClick={() => handleSelectCV(cv.id)}
                          onMouseEnter={() => setHoveredCvCardIndex(index)}
                          onMouseLeave={() => setHoveredCvCardIndex(null)}
                          className="p-4 border-2 rounded-lg transition-all cursor-pointer"
                          style={{
                            borderColor: selectedCvId === cv.id
                              ? '#2563eb'
                              : (hoveredCvCardIndex === index ? '#9ca3af' : '#e5e7eb'),
                            backgroundColor: selectedCvId === cv.id
                              ? '#eff6ff'
                              : (hoveredCvCardIndex === index ? '#f9fafb' : 'transparent')
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#2563eb' }}>
                                {(cv.name || cv.fullName || '?').charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold" style={{ color: '#111827' }}>{cv.name || cv.fullName || 'N/A'}</p>
                                <p className="text-sm" style={{ color: '#4b5563' }}>{cv.email || 'N/A'}</p>
                                <p className="text-xs" style={{ color: '#6b7280' }}>{cv.code || cv.id}</p>
                              </div>
                            </div>
                            {selectedCvId === cv.id && (
                              <CheckCircle className="w-6 h-6" style={{ color: '#2563eb' }} />
                            )}
                          </div>
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
                          onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('first')}
                          onMouseLeave={() => setHoveredPaginationNavButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: hoveredPaginationNavButton === 'first' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151',
                            opacity: currentPage === 1 ? 0.5 : 1,
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('prev')}
                          onMouseLeave={() => setHoveredPaginationNavButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: hoveredPaginationNavButton === 'prev' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151',
                            opacity: currentPage === 1 ? 0.5 : 1,
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
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
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              onMouseEnter={() => currentPage !== pageNum && setHoveredPaginationButtonIndex(pageNum)}
                              onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                              className="px-3 py-1 rounded text-sm font-bold transition-colors"
                              style={{
                                backgroundColor: currentPage === pageNum
                                  ? '#2563eb'
                                  : (hoveredPaginationButtonIndex === pageNum ? '#f9fafb' : 'white'),
                                border: currentPage === pageNum ? 'none' : '1px solid #d1d5db',
                                color: currentPage === pageNum ? 'white' : '#374151'
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationNavButton('next')}
                          onMouseLeave={() => setHoveredPaginationNavButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: hoveredPaginationNavButton === 'next' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151',
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationNavButton('last')}
                          onMouseLeave={() => setHoveredPaginationNavButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: hoveredPaginationNavButton === 'last' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151',
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: '#4b5563' }}>
                          {t.adminNominationPageInfo.replace('{current}', currentPage).replace('{total}', totalPages).replace('{count}', totalItems)}
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 border rounded text-sm"
                          style={{
                            borderColor: '#d1d5db'
                          }}
                        >
                          <option value="10">{t.perPage10}</option>
                          <option value="20">{t.perPage20}</option>
                          <option value="50">{t.perPage50}</option>
                          <option value="100">{t.perPage100}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <AddCandidateForm 
              isAdmin
              jobId={jobId}
              onSuccess={() => navigate(`/admin/jobs/${jobId}`)}
              onCancel={() => navigate(`/admin/jobs/${jobId}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNominationPage;

