import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck,
  FileText,
  DollarSign,
  BarChart3,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import apiService from '../../services/api';

const MyGroupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);
  
  // Hover states
  const [hoveredViewCollaboratorsButton, setHoveredViewCollaboratorsButton] = useState(false);
  const [hoveredViewNominationsButton, setHoveredViewNominationsButton] = useState(false);
  const [hoveredViewPaymentsButton, setHoveredViewPaymentsButton] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, []);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load group info and statistics in parallel
      const [groupResponse, statsResponse] = await Promise.all([
        apiService.getMyGroup(),
        apiService.getMyGroupStatistics()
      ]);

      if (groupResponse.success) {
        setGroup(groupResponse.data.group);
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }
    } catch (err) {
      console.error('Error loading group data:', err);
      setError(err.message || 'Không thể tải thông tin nhóm');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2563eb' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg p-4" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', border: '1px solid' }}>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5" style={{ color: '#dc2626' }} />
            <p style={{ color: '#991b1b' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6">
        <div className="rounded-lg p-4" style={{ backgroundColor: '#fefce8', borderColor: '#fde047', border: '1px solid' }}>
          <p style={{ color: '#854d0e' }}>Bạn chưa được gán vào nhóm nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Thông tin nhóm</h1>
          <p className="text-sm mt-1" style={{ color: '#4b5563' }}>Xem thông tin và thống kê nhóm của bạn</p>
        </div>
      </div>

      {/* Group Info Card */}
      <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Thông tin nhóm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium" style={{ color: '#374151' }}>Tên nhóm</label>
            <p className="text-sm mt-1" style={{ color: '#111827' }}>{group.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: '#374151' }}>Mã nhóm</label>
            <p className="text-sm mt-1" style={{ color: '#111827' }}>{group.code}</p>
          </div>
          {group.referralCode && (
            <div>
              <label className="text-sm font-medium" style={{ color: '#374151' }}>Mã giới thiệu</label>
              <p className="text-sm mt-1" style={{ color: '#111827' }}>{group.referralCode}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium" style={{ color: '#374151' }}>Trạng thái</label>
            <div className="mt-1">
              {group.status === 1 ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                  <CheckCircle className="w-3 h-3" />
                  Đang hoạt động
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                  <XCircle className="w-3 h-3" />
                  Không hoạt động
                </span>
              )}
            </div>
          </div>
          {group.description && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium" style={{ color: '#374151' }}>Mô tả</label>
              <p className="text-sm mt-1" style={{ color: '#111827' }}>{group.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <>
          {/* Group Statistics */}
          <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Thống kê nhóm</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg p-4 border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                    <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>Số CTV</p>
                    <p className="text-xl font-bold" style={{ color: '#111827' }}>
                      {statistics.groupStatistics?.collaboratorCount || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg p-4 border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                    <FileCheck className="w-5 h-5" style={{ color: '#16a34a' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>Số đơn ứng tuyển</p>
                    <p className="text-xl font-bold" style={{ color: '#111827' }}>
                      {statistics.groupStatistics?.jobApplicationCount || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg p-4 border" style={{ backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3e8ff' }}>
                    <FileText className="w-5 h-5" style={{ color: '#9333ea' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>Số CV</p>
                    <p className="text-xl font-bold" style={{ color: '#111827' }}>
                      {statistics.groupStatistics?.cvCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Statistics */}
          <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Thống kê cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg p-4 border" style={{ backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e0e7ff' }}>
                    <Users className="w-5 h-5" style={{ color: '#4f46e5' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>CTV được phân công</p>
                    <p className="text-xl font-bold" style={{ color: '#111827' }}>
                      {statistics.personalStatistics?.collaboratorCount || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg p-4 border" style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ffedd5' }}>
                    <FileCheck className="w-5 h-5" style={{ color: '#ea580c' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>Đơn đã xử lý</p>
                    <p className="text-xl font-bold" style={{ color: '#111827' }}>
                      {statistics.personalStatistics?.jobApplicationCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Admins in Group */}
      {group.admins && group.admins.length > 0 && (
        <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Thành viên nhóm</h2>
          <div className="space-y-3">
            {group.admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                    <User className="w-5 h-5" style={{ color: '#2563eb' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{admin.name || admin.email}</p>
                    <p className="text-xs" style={{ color: '#4b5563' }}>{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {admin.isActive && admin.status === 1 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                      <CheckCircle className="w-3 h-3" />
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                      <XCircle className="w-3 h-3" />
                      Không hoạt động
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/group-collaborators')}
            onMouseEnter={() => setHoveredViewCollaboratorsButton(true)}
            onMouseLeave={() => setHoveredViewCollaboratorsButton(false)}
            className="flex items-center gap-3 p-4 rounded-lg border transition-colors"
            style={{
              backgroundColor: hoveredViewCollaboratorsButton ? '#dbeafe' : '#eff6ff',
              borderColor: '#bfdbfe'
            }}
          >
            <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
            <span className="text-sm font-medium" style={{ color: '#1e3a8a' }}>Xem CTV của nhóm</span>
          </button>
          <button
            onClick={() => navigate('/admin/nominations')}
            onMouseEnter={() => setHoveredViewNominationsButton(true)}
            onMouseLeave={() => setHoveredViewNominationsButton(false)}
            className="flex items-center gap-3 p-4 rounded-lg border transition-colors"
            style={{
              backgroundColor: hoveredViewNominationsButton ? '#bbf7d0' : '#f0fdf4',
              borderColor: '#86efac'
            }}
          >
            <FileCheck className="w-5 h-5" style={{ color: '#16a34a' }} />
            <span className="text-sm font-medium" style={{ color: '#14532d' }}>Xem đơn ứng tuyển</span>
          </button>
          <button
            onClick={() => navigate('/admin/payments')}
            onMouseEnter={() => setHoveredViewPaymentsButton(true)}
            onMouseLeave={() => setHoveredViewPaymentsButton(false)}
            className="flex items-center gap-3 p-4 rounded-lg border transition-colors"
            style={{
              backgroundColor: hoveredViewPaymentsButton ? '#e9d5ff' : '#faf5ff',
              borderColor: '#d8b4fe'
            }}
          >
            <DollarSign className="w-5 h-5" style={{ color: '#9333ea' }} />
            <span className="text-sm font-medium" style={{ color: '#581c87' }}>Xem thanh toán</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyGroupPage;

