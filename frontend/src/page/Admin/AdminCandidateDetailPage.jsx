import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertTriangle,
  Edit,
  Download,
  Trash2,
  GraduationCap,
  Briefcase,
  Award,
  UserCircle,
  DollarSign,
  Sparkles,
  Folder,
  ChevronRight,
  Archive,
  RotateCcw,
} from 'lucide-react';
import apiService from '../../services/api';
import CvFilePreview from '../../component/Admin/CvFilePreview';

const AdminCandidateDetailPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('detail'); // 'detail' | 'history'
  const [deleting, setDeleting] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredEditButton, setHoveredEditButton] = useState(false);
  const [hoveredDeleteButton, setHoveredDeleteButton] = useState(false);
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

  useEffect(() => {
    loadCandidateDetail();
  }, [candidateId]);

  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const res = await apiService.getAdminProfile();
        if (res.success && res.data?.admin) {
          setAdminProfile(res.data.admin);
        }
      } catch (e) {
        console.error('Error loading admin profile:', e);
      }
    };
    loadAdminProfile();
  }, []);

  useEffect(() => {
    if (!candidate || !candidateId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiService.getAdminCVFileList(candidateId);
        if (!cancelled) setCvFileList(data);
      } catch (e) {
        if (!cancelled) setCvFileList({ originals: [], templates: [] });
      }
    })();
    return () => { cancelled = true; };
  }, [candidate, candidateId]);

  useEffect(() => {
    if (activeTab !== 'history' || !candidateId) return;
    let cancelled = false;
    setHistoryLoading(true);
    apiService.getAdminCVSnapshots(candidateId, { limit: 50 })
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
  }, [activeTab, candidateId]);

  const loadCandidateDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminCVById(candidateId);
      
      if (response.success && response.data?.cv) {
        setCandidate(response.data.cv);
      } else {
        setError(response.message || 'Không tìm thấy thông tin ứng viên');
      }
    } catch (error) {
      console.error('Error loading candidate detail:', error);
      setError(error.message || 'Lỗi khi tải thông tin ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa ứng viên này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiService.deleteAdminCV(candidateId);
      if (response.success) {
        alert('Xóa ứng viên thành công!');
        navigate('/admin/candidates');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa ứng viên');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa ứng viên');
    } finally {
      setDeleting(false);
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

  const formatGender = (gender) => {
    if (gender === 1 || gender === '男') return 'Nam';
    if (gender === 2 || gender === '女') return 'Nữ';
    if (gender === 3) return 'Khác';
    return '—';
  };

  const formatStatus = (status) => {
    if (status === 0) return 'Nháp';
    if (status === 1) return 'Hoạt động';
    if (status === 2) return 'Lưu trữ';
    return '—';
  };

  const getStatusColor = (status) => {
    if (status === 1) return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' };
    if (status === 0) return { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' };
    return { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' };
  };

  const downloadCV = async (cvPath, fileType = 'curriculumVitae') => {
    if (!cvPath) {
      alert('Không có file CV để tải xuống');
      return;
    }
    const params = fileType === 'cvOriginalPath' ? { index: 0 } : fileType === 'cvCareerHistoryPath' ? { document: 'shokumu', template: 'Common' } : { document: 'rirekisho', template: 'Common' };
    try {
      const urlToOpen = await apiService.getAdminCVFileUrl(candidateId, fileType, 'download', params);
      if (!urlToOpen) throw new Error('Không lấy được link tải file');
      const newWindow = window.open(urlToOpen, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        const link = document.createElement('a');
        link.href = urlToOpen;
        link.download = (cvPath.split('/').pop() || '').replace(/^[a-f0-9-]+_/i, '') || 'cv.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Không thể tải file CV. Vui lòng thử lại sau.');
    }
  };

  const toggleFolder = (id) => {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSnapshot = (dateTime) => {
    setOpenSnapshots((prev) => ({ ...prev, [dateTime]: !prev[dateTime] }));
  };

  const toggleSnapshotFolder = (dateTime, folderId) => {
    const key = `${dateTime}::${folderId}`;
    setOpenSnapshotFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const downloadZip = async (scope, template = 'all') => {
    try {
      const { blob, filename } = await apiService.downloadAdminCVZip(candidateId, scope, template);
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
      alert('Không thể tải file ZIP. Vui lòng thử lại.');
    }
  };

  const downloadZipSnapshot = async (dateTime, scope, template = 'all') => {
    try {
      const { blob, filename } = await apiService.downloadAdminCVZip(candidateId, scope, template, dateTime);
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
      alert('Không thể tải file ZIP snapshot. Vui lòng thử lại.');
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
    if (!window.confirm('Rollback về snapshot này sẽ tạo snapshot mới và đặt làm bản hiện tại. Tiếp tục?')) return;
    setRollbackingDateTime(dateTime);
    try {
      await apiService.rollbackAdminCV(candidateId, dateTime);
      await loadCandidateDetail();
      const list = await apiService.getAdminCVSnapshots(candidateId, { limit: 50 });
      setSnapshots(Array.isArray(list) ? list : []);
      const data = await apiService.getAdminCVFileList(candidateId);
      setCvFileList(data || { originals: [], templates: [] });
    } catch (err) {
      alert(err?.message || 'Rollback thất bại. Vui lòng thử lại.');
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

  const isSuperAdmin = adminProfile?.role === 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="rounded-lg border p-8 text-center" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <p className="text-sm" style={{ color: '#dc2626' }}>{error || 'Không tìm thấy thông tin ứng viên'}</p>
        <button
          onClick={() => navigate('/admin/candidates')}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Parse JSON fields
  const educations = candidate.educations 
    ? (typeof candidate.educations === 'string' ? JSON.parse(candidate.educations) : candidate.educations)
    : [];
  const workExperiences = candidate.workExperiences 
    ? (typeof candidate.workExperiences === 'string' ? JSON.parse(candidate.workExperiences) : candidate.workExperiences)
    : [];
  const certificates = candidate.certificates 
    ? (typeof candidate.certificates === 'string' ? JSON.parse(candidate.certificates) : candidate.certificates)
    : [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/candidates')}
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
            <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Chi tiết ứng viên</h1>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              {candidate.code || candidateId} - {candidate.name || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium border" style={getStatusColor(candidate.status)}>
            {formatStatus(candidate.status)}
          </span>
          {candidate.isDuplicate && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: '#fefce8', color: '#854d0e', borderColor: '#fde047' }}>
              <AlertTriangle className="w-3.5 h-3.5" />
              Trùng lặp
            </div>
          )}
          {isSuperAdmin && (
            <button
              onClick={() => navigate(`/admin/candidates/${candidateId}/edit`)}
              onMouseEnter={() => setHoveredEditButton(true)}
              onMouseLeave={() => setHoveredEditButton(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              style={{
                backgroundColor: hoveredEditButton ? '#1d4ed8' : '#2563eb',
                color: 'white'
              }}
            >
              <Edit className="w-3.5 h-3.5" />
              Chỉnh sửa
            </button>
          )}
          {isSuperAdmin && (
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
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* AI đánh giá - Hồ sơ matching với job nào */}
      <div className="rounded-lg p-4 border" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" style={{ color: '#0284c7' }} />
          <h2 className="text-sm font-bold" style={{ color: '#0c4a6e' }}>AI đánh giá - Hồ sơ phù hợp với job nào</h2>
        </div>
        <p className="text-xs" style={{ color: '#0369a1' }}>
          Phần AI sẽ phân tích hồ sơ và gợi ý các vị trí tuyển dụng phù hợp. Chức năng đang được phát triển.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded text-[10px] font-medium" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>Gợi ý job (sắp ra mắt)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('detail')}
          className="px-3 py-2 rounded-lg text-xs font-semibold border"
          style={{
            backgroundColor: activeTab === 'detail' ? '#2563eb' : 'white',
            color: activeTab === 'detail' ? 'white' : '#374151',
            borderColor: activeTab === 'detail' ? '#2563eb' : '#e5e7eb',
          }}
        >
          Chi tiết hồ sơ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className="px-3 py-2 rounded-lg text-xs font-semibold border"
          style={{
            backgroundColor: activeTab === 'history' ? '#2563eb' : 'white',
            color: activeTab === 'history' ? 'white' : '#374151',
            borderColor: activeTab === 'history' ? '#2563eb' : '#e5e7eb',
          }}
        >
          Lịch sử chỉnh sửa
        </button>
      </div>

      {activeTab === 'detail' && (
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Thông tin cá nhân */}
          <section>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
              <User className="w-4 h-4" style={{ color: '#2563eb' }} />
              Thông tin cá nhân
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mã CV</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{candidate.code || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Họ tên (Kanji)</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Họ tên (Kana)</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.furigana || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày sinh</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatDate(candidate.birthDate)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tuổi</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.age || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Giới tính</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatGender(candidate.gender)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Email</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {candidate.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Số điện thoại</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {candidate.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mã bưu điện</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.postalCode || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa chỉ</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {candidate.addressCurrent || candidate.address || '—'}
                </p>
              </div>
              {candidate.collaborator && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>CTV</label>
                  <p className="text-sm" style={{ color: '#111827' }}>
                    {candidate.collaborator.code || candidate.collaborator.name || '—'}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày nhận</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatDate(candidate.receiveDate || candidate.createdAt)}</p>
              </div>
            </div>
          </section>

          {/* Học vấn */}
          <section>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
              <GraduationCap className="w-4 h-4" style={{ color: '#2563eb' }} />
              Học vấn
            </h2>
            <div className="space-y-4">
              {educations.length === 0 ? (
                <p className="text-sm" style={{ color: '#6b7280' }}>Chưa có thông tin học vấn</p>
              ) : (
                educations.map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4" style={{ borderColor: '#e5e7eb' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4" style={{ color: '#2563eb' }} />
                      <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>#{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Năm</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{edu.year || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tháng</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{edu.month || '—'}</p>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Nội dung</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{edu.content || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Kinh nghiệm */}
          <section>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
              <Briefcase className="w-4 h-4" style={{ color: '#2563eb' }} />
              Kinh nghiệm
            </h2>
            <div className="space-y-4">
              {workExperiences.length === 0 ? (
                <p className="text-sm" style={{ color: '#6b7280' }}>Chưa có thông tin kinh nghiệm làm việc</p>
              ) : (
                workExperiences.map((work, index) => (
                  <div key={index} className="border rounded-lg p-4" style={{ borderColor: '#e5e7eb' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4" style={{ color: '#2563eb' }} />
                      <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>#{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Thời gian</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.period || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tên công ty</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.company_name || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lĩnh vực kinh doanh</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.business_purpose || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Quy mô / Vai trò</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.scale_role || '—'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mô tả công việc</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.description || '—'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Công cụ, công nghệ</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.tools_tech || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Kỹ năng & Chứng chỉ */}
          <section>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
              <Award className="w-4 h-4" style={{ color: '#2563eb' }} />
              Kỹ năng & Chứng chỉ
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Kỹ năng kỹ thuật</label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.technicalSkills || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Chứng chỉ</label>
                {certificates.length === 0 ? (
                  <p className="text-sm" style={{ color: '#6b7280' }}>Chưa có chứng chỉ</p>
                ) : (
                  <div className="space-y-2">
                    {certificates.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3 border rounded-lg p-3" style={{ borderColor: '#e5e7eb' }}>
                        <Award className="w-4 h-4" style={{ color: '#2563eb' }} />
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <span className="text-xs" style={{ color: '#6b7280' }}>Năm: </span>
                            <span className="text-sm" style={{ color: '#111827' }}>{cert.year || '—'}</span>
                          </div>
                          <div>
                            <span className="text-xs" style={{ color: '#6b7280' }}>Tháng: </span>
                            <span className="text-sm" style={{ color: '#111827' }}>{cert.month || '—'}</span>
                          </div>
                          <div>
                            <span className="text-xs" style={{ color: '#6b7280' }}>Tên: </span>
                            <span className="text-sm" style={{ color: '#111827' }}>{cert.name || '—'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Giới thiệu */}
          <section>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
              <UserCircle className="w-4 h-4" style={{ color: '#2563eb' }} />
              Giới thiệu
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Tóm tắt nghề nghiệp</label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.careerSummary || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Điểm mạnh</label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.strengths || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Động lực ứng tuyển</label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.motivation || '—'}</p>
              </div>
            </div>
          </section>

          {/* Mong muốn */}
          <section>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
              <DollarSign className="w-4 h-4" style={{ color: '#2563eb' }} />
              Mong muốn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương hiện tại</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.currentSalary || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương mong muốn</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredSalary || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Vị trí mong muốn</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredPosition || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa điểm mong muốn</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredLocation || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày bắt đầu mong muốn</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredStartDate || '—'}</p>
              </div>
            </div>
          </section>

          {/* File CV: gộp theo folder CV_original + CV_Template/Common|IT|Technical */}
          <section>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
              <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
              File CV
            </h2>
            {cvFileList.originals.length > 0 && (
              <div className="mb-3 rounded-lg border overflow-hidden" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                <button
                  type="button"
                  onClick={() => toggleFolder('CV_original')}
                  className="w-full px-3 py-2 flex items-center justify-between border-b"
                  style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronRight
                      className="w-4 h-4 transition-transform"
                      style={{ color: '#6b7280', transform: openFolders.CV_original ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    />
                    <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                    <span className="text-xs font-semibold truncate" style={{ color: '#374151' }}>CV_original</span>
                    <span className="text-[10px]" style={{ color: '#9ca3af' }}>({cvFileList.originals.length} file)</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); downloadZip('original', 'all'); }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold"
                    style={{ backgroundColor: '#e0f2fe', color: '#075985' }}
                    title="Tải ZIP toàn bộ CV gốc"
                  >
                    <Archive className="w-3 h-3" />
                    ZIP
                  </button>
                </button>
                {openFolders.CV_original && (
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cvFileList.originals.map((item) => (
                      <CvFilePreview
                        key={`orig-${item.index}`}
                        viewUrl={item.viewUrl}
                        filePath={item.name}
                        title={item.name}
                        onDownload={item.downloadUrl ? () => window.open(item.downloadUrl, '_blank') : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {cvFileList.templates.length > 0 && (() => {
              const byTemplate = getTemplatesByFolder();
              const order = ['Common', 'IT', 'Technical'];
              return (
                <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                  <button
                    type="button"
                    onClick={() => toggleFolder('CV_Template')}
                    className="w-full px-3 py-2 flex items-center justify-between border-b"
                    style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ChevronRight
                        className="w-4 h-4 transition-transform"
                        style={{ color: '#6b7280', transform: openFolders.CV_Template ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                      <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                      <span className="text-xs font-semibold truncate" style={{ color: '#374151' }}>CV_Template</span>
                      <span className="text-[10px]" style={{ color: '#9ca3af' }}>(履歴書 / 職務経歴書)</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); downloadZip('template', 'all'); }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold"
                      style={{ backgroundColor: '#e0f2fe', color: '#075985' }}
                      title="Tải ZIP cả 3 template"
                    >
                      <Archive className="w-3 h-3" />
                      ZIP all
                    </button>
                  </button>

                  {openFolders.CV_Template && (
                    <div className="p-3 space-y-2">
                      {order.filter((k) => (byTemplate[k] || []).length > 0).map((templateName) => {
                        const folderId = `CV_Template/${templateName}`;
                        return (
                          <div key={folderId} className="rounded border overflow-hidden" style={{ borderColor: '#e5e7eb', backgroundColor: '#fff' }}>
                            <button
                              type="button"
                              onClick={() => toggleFolder(folderId)}
                              className="w-full px-3 py-2 flex items-center gap-2 border-b"
                              style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                            >
                              <ChevronRight
                                className="w-4 h-4 transition-transform"
                                style={{ color: '#6b7280', transform: openFolders[folderId] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                              />
                              <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                              <span className="text-xs font-medium" style={{ color: '#6b7280' }}>{templateName}</span>
                              <span className="text-[10px]" style={{ color: '#9ca3af' }}>({byTemplate[templateName].length} file)</span>
                              <span className="flex-1" />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); downloadZip('template', templateName); }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold"
                                style={{ backgroundColor: '#e0f2fe', color: '#075985' }}
                                title={`Tải ZIP template ${templateName}`}
                              >
                                <Archive className="w-3 h-3" />
                                ZIP
                              </button>
                            </button>
                            {openFolders[folderId] && (
                              <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {byTemplate[templateName].map((item, idx) => (
                                  <CvFilePreview
                                    key={`tpl-${item.template}-${item.document}-${idx}`}
                                    viewUrl={item.viewUrl}
                                    filePath={`${item.document}.pdf`}
                                    title={item.label}
                                    onDownload={item.downloadUrl ? () => window.open(item.downloadUrl, '_blank') : undefined}
                                  />
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
              <p className="text-sm" style={{ color: '#6b7280' }}>Đang tải danh sách file...</p>
            )}
            {candidate.otherDocuments && (
              <div className="mt-3 px-3 py-2 rounded-lg border flex items-center justify-between flex-wrap gap-2" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#6b7280' }} />
                <span className="text-xs font-medium" style={{ color: '#111827' }}>Tài liệu khác</span>
                <span className="text-xs" style={{ color: '#6b7280' }}>{candidate.otherDocuments}</span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadCV(candidate.otherDocuments, 'otherDocuments')}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-gray-200"
                  style={{ color: '#374151' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải xuống
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
            {historyLoading && (
              <p className="text-xs" style={{ color: '#6b7280' }}>Đang tải lịch sử snapshot...</p>
            )}
            {!historyLoading && snapshots.length === 0 && (
              <p className="text-xs" style={{ color: '#6b7280' }}>Chưa có snapshot hoặc không đọc được lịch sử.</p>
            )}

            {snapshots.map((snap) => {
              const dt = snap.dateTime;
              const isOpen = !!openSnapshots[dt];
              const originals = snap.originals || [];
              const templates = snap.templates || {};
              const tplOrder = ['Common', 'IT', 'Technical'];
              return (
                <div key={dt} className="rounded-lg border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
                  <div className="w-full px-3 py-2 flex items-center justify-between" style={{ backgroundColor: '#f9fafb' }}>
                    <button
                      type="button"
                      onClick={() => toggleSnapshot(dt)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left"
                    >
                      <ChevronRight
                        className="w-4 h-4 transition-transform"
                        style={{ color: '#6b7280', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                      <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                      <span className="text-xs font-semibold truncate" style={{ color: '#374151' }}>
                        {formatSnapshotLabel(dt)}
                      </span>
                      <span className="text-[10px]" style={{ color: '#9ca3af' }}>
                        ({originals.length} originals)
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRollbackSnapshot(dt); }}
                      disabled={!!rollbackingDateTime}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold shrink-0"
                      style={{ backgroundColor: '#fef3c7', color: '#b45309' }}
                      title="Rollback về snapshot này (tạo bản mới và đặt làm hiện tại)"
                    >
                      {rollbackingDateTime === dt ? (
                        <span className="animate-spin inline-block w-3 h-3 border border-amber-600 border-t-transparent rounded-full" />
                      ) : (
                        <RotateCcw className="w-3 h-3" />
                      )}
                      Rollback
                    </button>
                  </div>

                  {isOpen && (
                    <div className="p-3 space-y-3">
                      {/* CV_original */}
                      <div className="rounded border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
                        <button
                          type="button"
                          onClick={() => toggleSnapshotFolder(dt, 'CV_original')}
                          className="w-full px-3 py-2 flex items-center justify-between border-b"
                          style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ChevronRight
                              className="w-4 h-4 transition-transform"
                              style={{ color: '#6b7280', transform: openSnapshotFolders[`${dt}::CV_original`] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                            />
                            <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                            <span className="text-xs font-medium" style={{ color: '#6b7280' }}>CV_original</span>
                            <span className="text-[10px]" style={{ color: '#9ca3af' }}>({originals.length} file)</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); downloadZipSnapshot(dt, 'original', 'all'); }}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold"
                            style={{ backgroundColor: '#e0f2fe', color: '#075985' }}
                          >
                            <Archive className="w-3 h-3" />
                            ZIP
                          </button>
                        </button>
                        {openSnapshotFolders[`${dt}::CV_original`] && (
                          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {originals.map((f, idx) => (
                              <CvFilePreview
                                key={`snap-${dt}-orig-${idx}`}
                                viewUrl={f.viewUrl}
                                filePath={f.name}
                                title={f.name}
                                onDownload={f.downloadUrl ? () => window.open(f.downloadUrl, '_blank') : undefined}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CV_Template */}
                      <div className="rounded border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
                        <button
                          type="button"
                          onClick={() => toggleSnapshotFolder(dt, 'CV_Template')}
                          className="w-full px-3 py-2 flex items-center justify-between border-b"
                          style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ChevronRight
                              className="w-4 h-4 transition-transform"
                              style={{ color: '#6b7280', transform: openSnapshotFolders[`${dt}::CV_Template`] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                            />
                            <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                            <span className="text-xs font-medium" style={{ color: '#6b7280' }}>CV_Template</span>
                            <span className="text-[10px]" style={{ color: '#9ca3af' }}>(Common/IT/Technical)</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); downloadZipSnapshot(dt, 'template', 'all'); }}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold"
                            style={{ backgroundColor: '#e0f2fe', color: '#075985' }}
                          >
                            <Archive className="w-3 h-3" />
                            ZIP all
                          </button>
                        </button>

                        {openSnapshotFolders[`${dt}::CV_Template`] && (
                          <div className="p-2 space-y-2">
                            {tplOrder.map((tpl) => {
                              const folderKey = `CV_Template/${tpl}`;
                              const isTplOpen = !!openSnapshotFolders[`${dt}::${folderKey}`];
                              const has = templates?.[tpl]?.rirekisho || templates?.[tpl]?.shokumu;
                              if (!has) return null;
                              return (
                                <div key={folderKey} className="rounded border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
                                  <button
                                    type="button"
                                    onClick={() => toggleSnapshotFolder(dt, folderKey)}
                                    className="w-full px-3 py-2 flex items-center justify-between border-b"
                                    style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <ChevronRight
                                        className="w-4 h-4 transition-transform"
                                        style={{ color: '#6b7280', transform: isTplOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                      />
                                      <Folder className="w-4 h-4" style={{ color: '#f59e0b' }} />
                                      <span className="text-xs font-medium" style={{ color: '#6b7280' }}>{tpl}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); downloadZipSnapshot(dt, 'template', tpl); }}
                                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold"
                                      style={{ backgroundColor: '#e0f2fe', color: '#075985' }}
                                    >
                                      <Archive className="w-3 h-3" />
                                      ZIP
                                    </button>
                                  </button>
                                  {isTplOpen && (
                                    <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {['rirekisho', 'shokumu'].map((doc) => (
                                        <CvFilePreview
                                          key={`snap-${dt}-${tpl}-${doc}`}
                                          viewUrl={templates?.[tpl]?.[doc]?.viewUrl || null}
                                          filePath={`cv-${doc}.pdf`}
                                          title={`${tpl} - ${doc}`}
                                          onDownload={templates?.[tpl]?.[doc]?.downloadUrl ? () => window.open(templates[tpl][doc].downloadUrl, '_blank') : undefined}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidateDetailPage;

