import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  DollarSign,
  Award,
  Building2,
  Info,
  CheckCircle,
  XCircle,
  Briefcase,
  Users,
  Globe,
  CreditCard,
  FileText,
  ClipboardList,
} from 'lucide-react';
import apiService from '../../services/api';

const AdminCollaboratorDetailPage = () => {
  const { collaboratorId } = useParams();
  const navigate = useNavigate();
  const [collaborator, setCollaborator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [deleting, setDeleting] = useState(false);
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredEditButton, setHoveredEditButton] = useState(false);
  const [hoveredDeleteButton, setHoveredDeleteButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [hoveredTabIndex, setHoveredTabIndex] = useState(null);
  const [hoveredLinkIndex, setHoveredLinkIndex] = useState(null);

  useEffect(() => {
    loadCollaboratorDetail();
  }, [collaboratorId]);

  const loadCollaboratorDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCollaboratorById(collaboratorId);
      
      if (response.success && response.data?.collaborator) {
        setCollaborator(response.data.collaborator);
      } else {
        setError(response.message || 'Không tìm thấy thông tin CTV');
      }
    } catch (error) {
      console.error('Error loading collaborator detail:', error);
      setError(error.message || 'Lỗi khi tải thông tin CTV');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa CTV này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiService.deleteCollaborator(collaboratorId);
      if (response.success) {
        alert('Xóa CTV thành công!');
        navigate('/admin/collaborators');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa CTV');
      }
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa CTV');
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
    if (gender === 1 || gender === '1') return 'Nam';
    if (gender === 2 || gender === '2') return 'Nữ';
    if (gender === 3 || gender === '3') return 'Khác';
    return '—';
  };

  const formatStatus = (status) => {
    if (status === 0) return 'Ngừng hoạt động';
    if (status === 1) return 'Đang hoạt động';
    return '—';
  };

  const getStatusColor = (status) => {
    if (status === 1) return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' };
    if (status === 0) return { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' };
    return { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' };
  };

  const formatOrganizationType = (type) => {
    if (type === 'individual') return 'Cá nhân';
    if (type === 'company') return 'Công ty';
    if (type === 'organization') return 'Tổ chức';
    return type || '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
      </div>
    );
  }

  if (error || !collaborator) {
    return (
      <div className="rounded-lg border p-8 text-center" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <p className="text-sm" style={{ color: '#dc2626' }}>{error || 'Không tìm thấy thông tin CTV'}</p>
        <button
          onClick={() => navigate('/admin/collaborators')}
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

  const tabs = [
    { id: 'info', label: 'Thông tin cơ bản', icon: User },
    { id: 'contact', label: 'Liên hệ', icon: Mail },
    { id: 'organization', label: 'Tổ chức', icon: Building2 },
    { id: 'banking', label: 'Ngân hàng', icon: CreditCard },
    { id: 'rank', label: 'Cấp độ & Điểm', icon: Award },
    { id: 'survey', label: 'Khảo sát đăng ký (Form HQA)', icon: ClipboardList },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/collaborators')}
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
            <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Chi tiết CTV</h1>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              {collaborator.code || collaboratorId} - {collaborator.name || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium border" style={getStatusColor(collaborator.status)}>
            {formatStatus(collaborator.status)}
          </span>
          <button
            onClick={() => navigate(`/admin/collaborators/${collaboratorId}/edit`)}
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
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex border-b overflow-x-auto" style={{ borderColor: '#e5e7eb' }}>
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => !isActive && setHoveredTabIndex(index)}
                onMouseLeave={() => setHoveredTabIndex(null)}
                className="flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap"
                style={{
                  borderColor: isActive ? '#2563eb' : 'transparent',
                  color: isActive 
                    ? '#2563eb' 
                    : (hoveredTabIndex === index ? '#111827' : '#4b5563'),
                  backgroundColor: isActive 
                    ? '#eff6ff' 
                    : (hoveredTabIndex === index ? '#f9fafb' : 'transparent')
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mã CTV</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{collaborator.code || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tên CTV</label>
                <p className="text-sm" style={{ color: '#111827' }}>{collaborator.name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Email</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {collaborator.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Số điện thoại</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {collaborator.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày sinh</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {formatDate(collaborator.birthday)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Giới tính</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatGender(collaborator.gender)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Loại tổ chức</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatOrganizationType(collaborator.organizationType)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Trạng thái</label>
                <span className="inline-block px-2 py-1 rounded text-xs font-medium border" style={getStatusColor(collaborator.status)}>
                  {formatStatus(collaborator.status)}
                </span>
              </div>
              {collaborator.description && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mô tả</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{collaborator.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Email</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {collaborator.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Số điện thoại</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {collaborator.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Quốc gia</label>
                <p className="text-sm" style={{ color: '#111827' }}>{collaborator.country || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mã bưu điện</label>
                <p className="text-sm" style={{ color: '#111827' }}>{collaborator.postCode || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa chỉ</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {collaborator.address || '—'}
                </p>
              </div>
              {collaborator.facebook && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Facebook</label>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                    <Globe className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    <a 
                      href={collaborator.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onMouseEnter={() => setHoveredLinkIndex(0)}
                      onMouseLeave={() => setHoveredLinkIndex(null)}
                      style={{
                        color: hoveredLinkIndex === 0 ? '#1d4ed8' : '#2563eb',
                        textDecoration: hoveredLinkIndex === 0 ? 'underline' : 'none'
                      }}
                    >
                      {collaborator.facebook}
                    </a>
                  </p>
                </div>
              )}
              {collaborator.zalo && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Zalo</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{collaborator.zalo}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Loại tổ chức</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatOrganizationType(collaborator.organizationType)}</p>
              </div>
              {collaborator.organizationType !== 'individual' && (
                <>
                  {collaborator.companyName && (
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tên công ty</label>
                      <p className="text-sm" style={{ color: '#111827' }}>{collaborator.companyName}</p>
                    </div>
                  )}
                  {collaborator.taxCode && (
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mã số thuế</label>
                      <p className="text-sm" style={{ color: '#111827' }}>{collaborator.taxCode}</p>
                    </div>
                  )}
                  {collaborator.website && (
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Website</label>
                      <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                        <Globe className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                        <a 
                          href={collaborator.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onMouseEnter={() => setHoveredLinkIndex(1)}
                          onMouseLeave={() => setHoveredLinkIndex(null)}
                          style={{
                            color: hoveredLinkIndex === 1 ? '#1d4ed8' : '#2563eb',
                            textDecoration: hoveredLinkIndex === 1 ? 'underline' : 'none'
                          }}
                        >
                          {collaborator.website}
                        </a>
                      </p>
                    </div>
                  )}
                  {collaborator.businessAddress && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa chỉ kinh doanh</label>
                      <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                        <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                        {collaborator.businessAddress}
                      </p>
                    </div>
                  )}
                  {collaborator.businessLicense && (
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Giấy phép kinh doanh</label>
                      <p className="text-sm" style={{ color: '#111827' }}>{collaborator.businessLicense}</p>
                    </div>
                  )}
                  {collaborator.organizationLink && (
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Link tổ chức</label>
                      <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                        <Globe className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                        <a 
                          href={collaborator.organizationLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onMouseEnter={() => setHoveredLinkIndex(2)}
                          onMouseLeave={() => setHoveredLinkIndex(null)}
                          style={{
                            color: hoveredLinkIndex === 2 ? '#1d4ed8' : '#2563eb',
                            textDecoration: hoveredLinkIndex === 2 ? 'underline' : 'none'
                          }}
                        >
                          {collaborator.organizationLink}
                        </a>
                      </p>
                    </div>
                  )}
                </>
              )}
              {collaborator.group && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Nhóm</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{collaborator.group.name || collaborator.group.code || '—'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'banking' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tên ngân hàng</label>
                <p className="text-sm" style={{ color: '#111827' }}>{collaborator.bankName || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Số tài khoản</label>
                <p className="text-sm" style={{ color: '#111827' }}>{collaborator.bankAccount || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tên chủ tài khoản</label>
                <p className="text-sm" style={{ color: '#111827' }}>{collaborator.bankAccountName || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Chi nhánh</label>
                <p className="text-sm" style={{ color: '#111827' }}>{collaborator.bankBranch || '—'}</p>
              </div>
            </div>
          )}

          {activeTab === 'rank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collaborator.rankLevel && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Cấp độ</label>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{collaborator.rankLevel.name || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Phần trăm hoa hồng</label>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{collaborator.rankLevel.percent || 0}%</p>
                  </div>
                  {collaborator.rankLevel.pointsRequired && (
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Điểm yêu cầu</label>
                      <p className="text-sm" style={{ color: '#111827' }}>{collaborator.rankLevel.pointsRequired}</p>
                    </div>
                  )}
                  {collaborator.rankLevel.description && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mô tả cấp độ</label>
                      <p className="text-sm" style={{ color: '#111827' }}>{collaborator.rankLevel.description}</p>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Điểm hiện tại</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{collaborator.points || 0}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày tham gia</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {formatDate(collaborator.createdAt)}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'survey' && (
            <div className="space-y-4">
              <p className="text-xs" style={{ color: '#6b7280' }}>
                Các câu trả lời khảo sát khi CTV đăng ký (Form đăng ký HQA gửi CHÍ). Dữ liệu đồng bộ từ sheet sẽ hiển thị tại đây.
              </p>
              {collaborator.registrationSurveyData || collaborator.surveyResponses ? (
                <div className="rounded-lg border p-4 bg-gray-50" style={{ borderColor: '#e5e7eb' }}>
                  <pre className="text-xs whitespace-pre-wrap font-sans" style={{ color: '#111827' }}>
                    {typeof (collaborator.registrationSurveyData || collaborator.surveyResponses) === 'string'
                      ? (collaborator.registrationSurveyData || collaborator.surveyResponses)
                      : JSON.stringify(collaborator.registrationSurveyData || collaborator.surveyResponses, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }}>
                  <ClipboardList className="w-10 h-10 mx-auto mb-2" style={{ color: '#9ca3af' }} />
                  <p className="text-sm" style={{ color: '#6b7280' }}>Chưa có dữ liệu khảo sát đăng ký</p>
                  <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Dữ liệu từ Form đăng ký HQA (gửi CHÍ) sẽ hiển thị khi được đồng bộ.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCollaboratorDetailPage;

