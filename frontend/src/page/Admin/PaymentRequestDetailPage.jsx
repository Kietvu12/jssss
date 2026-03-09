import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  Building2,
  FileText,
  Edit,
  Eye,
} from 'lucide-react';

const PaymentRequestDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    status: '',
    note: '',
    rejectedReason: '',
  });

  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredEditButton, setHoveredEditButton] = useState(false);
  const [hoveredCancelButton, setHoveredCancelButton] = useState(false);
  const [hoveredSaveButton, setHoveredSaveButton] = useState(false);
  const [hoveredCollaboratorLink, setHoveredCollaboratorLink] = useState(false);
  const [hoveredJobApplicationLink, setHoveredJobApplicationLink] = useState(false);
  const [hoveredJobLink, setHoveredJobLink] = useState(false);
  const [hoveredCandidateLink, setHoveredCandidateLink] = useState(false);
  const [hoveredApproveButton, setHoveredApproveButton] = useState(false);
  const [hoveredRejectButton, setHoveredRejectButton] = useState(false);
  const [hoveredMarkAsPaidButton, setHoveredMarkAsPaidButton] = useState(false);

  useEffect(() => {
    if (id) {
      loadPaymentRequest();
    }
  }, [id]);

  const loadPaymentRequest = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminPaymentRequestById(id);
      if (response.success && response.data?.paymentRequest) {
        const pr = response.data.paymentRequest;
        setPaymentRequest(pr);
        setFormData({
          amount: pr.amount || '',
          status: pr.status !== undefined ? pr.status.toString() : '',
          note: pr.note || '',
          rejectedReason: pr.rejectedReason || '',
        });
      } else {
        alert('Không tìm thấy đơn yêu cầu thanh toán');
        navigate('/admin/payments');
      }
    } catch (error) {
      console.error('Error loading payment request:', error);
      alert('Lỗi khi tải thông tin đơn yêu cầu thanh toán');
      navigate('/admin/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        status: formData.status ? parseInt(formData.status) : undefined,
        note: formData.note || undefined,
        rejectedReason: formData.rejectedReason || undefined,
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const response = await apiService.updateAdminPaymentRequest(id, updateData);
      if (response.success) {
        alert('Cập nhật đơn yêu cầu thanh toán thành công!');
        setIsEditing(false);
        await loadPaymentRequest();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật đơn yêu cầu thanh toán');
      }
    } catch (error) {
      console.error('Error updating payment request:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật đơn yêu cầu thanh toán');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (window.confirm('Bạn có chắc muốn duyệt yêu cầu thanh toán này?')) {
      try {
        setSaving(true);
        const amount = formData.amount ? parseFloat(formData.amount) : undefined;
        const response = await apiService.approvePaymentRequest(id, formData.note, amount);
        if (response.success) {
          alert('Duyệt yêu cầu thanh toán thành công!');
          await loadPaymentRequest();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi duyệt yêu cầu thanh toán');
        }
      } catch (error) {
        console.error('Error approving payment request:', error);
        alert(error.message || 'Có lỗi xảy ra khi duyệt yêu cầu thanh toán');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleReject = async () => {
    if (!formData.rejectedReason || !formData.rejectedReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    if (window.confirm('Bạn có chắc muốn từ chối yêu cầu thanh toán này?')) {
      try {
        setSaving(true);
        const response = await apiService.rejectPaymentRequest(id, formData.rejectedReason.trim(), formData.note);
        if (response.success) {
          alert('Từ chối yêu cầu thanh toán thành công!');
          await loadPaymentRequest();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi từ chối yêu cầu thanh toán');
        }
      } catch (error) {
        console.error('Error rejecting payment request:', error);
        alert(error.message || 'Có lỗi xảy ra khi từ chối yêu cầu thanh toán');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleMarkAsPaid = async () => {
    if (window.confirm('Bạn có chắc muốn đánh dấu đã thanh toán cho yêu cầu này?')) {
      try {
        setSaving(true);
        const amount = formData.amount ? parseFloat(formData.amount) : undefined;
        const response = await apiService.markPaymentRequestAsPaid(id, formData.note, amount);
        if (response.success) {
          alert('Đánh dấu đã thanh toán thành công!');
          await loadPaymentRequest();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi đánh dấu đã thanh toán');
        }
      } catch (error) {
        console.error('Error marking payment as paid:', error);
        alert(error.message || 'Có lỗi xảy ra khi đánh dấu đã thanh toán');
      } finally {
        setSaving(false);
      }
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      0: { label: 'Chờ duyệt', style: { backgroundColor: '#fef9c3', color: '#854d0e' }, icon: Clock },
      1: { label: 'Đã duyệt', style: { backgroundColor: '#dbeafe', color: '#1e40af' }, icon: AlertCircle },
      2: { label: 'Đã từ chối', style: { backgroundColor: '#fee2e2', color: '#991b1b' }, icon: XCircle },
      3: { label: 'Đã thanh toán', style: { backgroundColor: '#dcfce7', color: '#166534' }, icon: CheckCircle },
    };
    return statusMap[status] || { label: 'Không xác định', style: { backgroundColor: '#f3f4f6', color: '#1f2937' }, icon: Clock };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-3" style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }}></div>
          <p className="text-xs" style={{ color: '#4b5563' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!paymentRequest) {
    return null;
  }

  const statusInfo = getStatusLabel(paymentRequest.status);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/payments')}
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
            <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Chi tiết đơn yêu cầu thanh toán</h1>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>ID: {id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
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
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    amount: paymentRequest.amount || '',
                    status: paymentRequest.status !== undefined ? paymentRequest.status.toString() : '',
                    note: paymentRequest.note || '',
                    rejectedReason: paymentRequest.rejectedReason || '',
                  });
                }}
                onMouseEnter={() => setHoveredCancelButton(true)}
                onMouseLeave={() => setHoveredCancelButton(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: hoveredCancelButton ? '#e5e7eb' : '#f3f4f6',
                  color: '#374151'
                }}
              >
                <X className="w-3.5 h-3.5" />
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                onMouseEnter={() => !saving && setHoveredSaveButton(true)}
                onMouseLeave={() => setHoveredSaveButton(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: saving ? '#9ca3af' : (hoveredSaveButton ? '#1d4ed8' : '#2563eb'),
                  color: 'white',
                  opacity: saving ? 0.5 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Payment Request Information */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <DollarSign className="w-4 h-4" style={{ color: '#2563eb' }} />
              Thông tin đơn yêu cầu
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    Số tiền <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="VD: 500000"
                      min="0"
                      step="0.01"
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
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: '#111827' }}>
                      <DollarSign className="w-4 h-4" style={{ color: '#16a34a' }} />
                      {paymentRequest.amount ? parseFloat(paymentRequest.amount).toLocaleString('vi-VN') : '0'}đ
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    Trạng thái
                  </label>
                  {isEditing ? (
                    <select
                      name="status"
                      value={formData.status}
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
                      <option value="0">Chờ duyệt</option>
                      <option value="1">Đã duyệt</option>
                      <option value="2">Đã từ chối</option>
                      <option value="3">Đã thanh toán</option>
                    </select>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold" style={statusInfo.style}>
                      {React.createElement(statusInfo.icon, { className: "w-3.5 h-3.5" })}
                      {statusInfo.label}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                  Ghi chú
                </label>
                {isEditing ? (
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Nhập ghi chú..."
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
                ) : (
                  <p className="text-xs p-3 rounded-lg min-h-[60px]" style={{ color: '#374151', backgroundColor: '#f9fafb' }}>
                    {paymentRequest.note || '—'}
                  </p>
                )}
              </div>
              {paymentRequest.status === 2 && (
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#111827' }}>
                    Lý do từ chối
                  </label>
                  {isEditing ? (
                    <textarea
                      name="rejectedReason"
                      value={formData.rejectedReason}
                      onChange={handleInputChange}
                      placeholder="Nhập lý do từ chối..."
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
                  ) : (
                    <p className="text-xs p-3 rounded-lg" style={{ color: '#b91c1c', backgroundColor: '#fef2f2' }}>
                      {paymentRequest.rejectedReason || '—'}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>
                    Ngày yêu cầu
                  </label>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#374151' }}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {paymentRequest.createdAt ? new Date(paymentRequest.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>
                    Ngày duyệt
                  </label>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#374151' }}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {paymentRequest.approvedAt ? new Date(paymentRequest.approvedAt).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>
                    Ngày thanh toán
                  </label>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#374151' }}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {paymentRequest.status === 3 && paymentRequest.updatedAt ? new Date(paymentRequest.updatedAt).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>
                    Cập nhật lần cuối
                  </label>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#374151' }}>
                    <Clock className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {paymentRequest.updatedAt ? new Date(paymentRequest.updatedAt).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collaborator Information */}
          {paymentRequest.collaborator && (
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                <User className="w-4 h-4" style={{ color: '#2563eb' }} />
                Thông tin CTV
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>
                    Tên CTV
                  </label>
                  <button
                    onClick={() => navigate(`/admin/collaborators/${paymentRequest.collaboratorId}`)}
                    onMouseEnter={() => setHoveredCollaboratorLink(true)}
                    onMouseLeave={() => setHoveredCollaboratorLink(false)}
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{
                      color: hoveredCollaboratorLink ? '#1e40af' : '#2563eb'
                    }}
                  >
                    <User className="w-3.5 h-3.5" />
                    {paymentRequest.collaborator.name || '—'}
                  </button>
                  <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>ID: {paymentRequest.collaboratorId}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Job Application Information */}
          {paymentRequest.jobApplication && (
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                <Briefcase className="w-4 h-4" style={{ color: '#2563eb' }} />
                Thông tin đơn ứng tuyển
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>
                    ID đơn ứng tuyển
                  </label>
                  <button
                    onClick={() => navigate(`/admin/nominations/${paymentRequest.jobApplicationId}`)}
                    onMouseEnter={() => setHoveredJobApplicationLink(true)}
                    onMouseLeave={() => setHoveredJobApplicationLink(false)}
                    className="text-xs font-semibold"
                    style={{
                      color: hoveredJobApplicationLink ? '#1e40af' : '#2563eb'
                    }}
                  >
                    {paymentRequest.jobApplicationId}
                  </button>
                </div>
                {paymentRequest.jobApplication.job && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>
                      Công việc
                    </label>
                    <button
                      onClick={() => navigate(`/admin/jobs/${paymentRequest.jobApplication.jobId}`)}
                      onMouseEnter={() => setHoveredJobLink(true)}
                      onMouseLeave={() => setHoveredJobLink(false)}
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{
                        color: hoveredJobLink ? '#2563eb' : '#111827'
                      }}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      {paymentRequest.jobApplication.job.title || '—'}
                    </button>
                  </div>
                )}
                {paymentRequest.jobApplication.job?.company && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>
                      Công ty
                    </label>
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#374151' }}>
                      <Building2 className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                      {paymentRequest.jobApplication.job.company.name || '—'}
                    </div>
                  </div>
                )}
                {paymentRequest.jobApplication.cv && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>
                      Ứng viên
                    </label>
                    <button
                      onClick={() => navigate(`/admin/candidates/${paymentRequest.jobApplication.cvId || paymentRequest.jobApplication.cv.id}`)}
                      onMouseEnter={() => setHoveredCandidateLink(true)}
                      onMouseLeave={() => setHoveredCandidateLink(false)}
                      className="text-xs font-semibold"
                      style={{
                        color: hoveredCandidateLink ? '#2563eb' : '#111827'
                      }}
                    >
                      {paymentRequest.jobApplication.cv.name || paymentRequest.jobApplication.cv.fullName || '—'}
                    </button>
                    {paymentRequest.jobApplication.cv.code && (
                      <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>Mã CV: {paymentRequest.jobApplication.cv.code}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-sm font-bold mb-4 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Thao tác</h2>
              <p className="text-xs mb-3" style={{ color: '#6b7280' }}>
                Số tiền không được tính tự động. Vui lòng nhập số tiền cần thanh toán trước khi duyệt hoặc đánh dấu đã thanh toán.
              </p>
              {(paymentRequest.status === 0 || paymentRequest.status === 1) && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Số tiền cần thanh toán (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="VD: 500000"
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    style={{ borderColor: '#d1d5db', outline: 'none' }}
                  />
                </div>
              )}
              <div className="space-y-2">
                {paymentRequest.status === 0 && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={saving}
                      onMouseEnter={() => !saving && setHoveredApproveButton(true)}
                      onMouseLeave={() => setHoveredApproveButton(false)}
                      className="w-full px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: saving ? '#9ca3af' : (hoveredApproveButton ? '#15803d' : '#16a34a'),
                        color: 'white',
                        opacity: saving ? 0.5 : 1,
                        cursor: saving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Duyệt yêu cầu
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={saving}
                      onMouseEnter={() => !saving && setHoveredRejectButton(true)}
                      onMouseLeave={() => setHoveredRejectButton(false)}
                      className="w-full px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: saving ? '#9ca3af' : (hoveredRejectButton ? '#b91c1c' : '#dc2626'),
                        color: 'white',
                        opacity: saving ? 0.5 : 1,
                        cursor: saving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Từ chối yêu cầu
                    </button>
                  </>
                )}
                {paymentRequest.status === 1 && (
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={saving}
                    onMouseEnter={() => !saving && setHoveredMarkAsPaidButton(true)}
                    onMouseLeave={() => setHoveredMarkAsPaidButton(false)}
                    className="w-full px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: saving ? '#9ca3af' : (hoveredMarkAsPaidButton ? '#15803d' : '#16a34a'),
                      color: 'white',
                      opacity: saving ? 0.5 : 1,
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Đánh dấu đã thanh toán
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRequestDetailPage;

