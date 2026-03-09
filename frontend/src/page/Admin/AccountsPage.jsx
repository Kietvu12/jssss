import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Shield,
  Building2,
  AlertCircle,
} from 'lucide-react';

const AccountsPage = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('admin'); // 'admin' or 'collaborator'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Hover states
  const [hoveredCreateButton, setHoveredCreateButton] = useState(false);
  const [hoveredAdminTab, setHoveredAdminTab] = useState(false);
  const [hoveredCollaboratorTab, setHoveredCollaboratorTab] = useState(false);
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredActionButtonIndex, setHoveredActionButtonIndex] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
    if (accountType === 'admin') {
      loadAdmins();
    } else {
      loadCollaborators();
    }
  }, [accountType, currentPage, itemsPerPage, roleFilter, statusFilter]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await apiService.getAdmins(params);
      if (response.success && response.data) {
        setAccounts(response.data.admins || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter) {
        params.status = statusFilter === '1' ? 1 : statusFilter === '0' ? 0 : '';
      }

      const response = await apiService.getCollaborators(params);
      if (response.success && response.data) {
        setAccounts(response.data.collaborators || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    if (accountType === 'admin') {
      loadAdmins();
    } else {
      loadCollaborators();
    }
  };

  const handleDelete = async (accountId) => {
    try {
      setDeleting(true);
      if (accountType === 'admin') {
        await apiService.deleteAdmin(accountId);
      } else {
        await apiService.deleteCollaborator(accountId);
      }
      setDeleteConfirm(null);
      if (accountType === 'admin') {
        loadAdmins();
      } else {
        loadCollaborators();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.message || 'Không thể xóa tài khoản');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 1:
        return { 
          label: 'Super Admin', 
          style: { backgroundColor: '#f3e8ff', color: '#6b21a8' }, 
          icon: Shield 
        };
      case 2:
        return { 
          label: 'Admin Backoffice', 
          style: { backgroundColor: '#dbeafe', color: '#1e40af' }, 
          icon: Users 
        };
      case 3:
        return { 
          label: 'Admin CA Team', 
          style: { backgroundColor: '#dcfce7', color: '#166534' }, 
          icon: Building2 
        };
      default:
        return { 
          label: 'Unknown', 
          style: { backgroundColor: '#f3f4f6', color: '#1f2937' }, 
          icon: User 
        };
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Quản lý tài khoản</h1>
          <p className="text-sm mt-1" style={{ color: '#4b5563' }}>Quản lý tài khoản admin và CTV trong hệ thống</p>
        </div>
        <button
          onClick={() => {
            if (accountType === 'admin') {
              navigate('/admin/accounts/new');
            } else {
              navigate('/admin/collaborators/new');
            }
          }}
          onMouseEnter={() => setHoveredCreateButton(true)}
          onMouseLeave={() => setHoveredCreateButton(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: hoveredCreateButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Tạo tài khoản mới</span>
        </button>
      </div>

      {/* Account Type Tabs */}
      <div className="rounded-lg shadow-sm border p-1" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div className="flex gap-1">
          <button
            onClick={() => setAccountType('admin')}
            onMouseEnter={() => setHoveredAdminTab(true)}
            onMouseLeave={() => setHoveredAdminTab(false)}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: accountType === 'admin' 
                ? '#2563eb' 
                : (hoveredAdminTab ? '#f3f4f6' : 'transparent'),
              color: accountType === 'admin' ? 'white' : '#374151'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </div>
          </button>
          <button
            onClick={() => setAccountType('collaborator')}
            onMouseEnter={() => setHoveredCollaboratorTab(true)}
            onMouseLeave={() => setHoveredCollaboratorTab(false)}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: accountType === 'collaborator' 
                ? '#2563eb' 
                : (hoveredCollaboratorTab ? '#f3f4f6' : 'transparent'),
              color: accountType === 'collaborator' ? 'white' : '#374151'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span>Cộng tác viên (CTV)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg shadow-sm border p-4" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                style={{
                  borderColor: '#d1d5db',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
          {accountType === 'admin' && (
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg"
              style={{
                borderColor: '#d1d5db',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="1">Super Admin</option>
              <option value="2">Admin Backoffice</option>
              <option value="3">Admin CA Team</option>
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg"
            style={{
              borderColor: '#d1d5db',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Không hoạt động</option>
          </select>
          <button
            onClick={handleSearch}
            onMouseEnter={() => setHoveredSearchButton(true)}
            onMouseLeave={() => setHoveredSearchButton(false)}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: hoveredSearchButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-lg shadow-sm border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2563eb' }} />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
            <p style={{ color: '#4b5563' }}>Không có tài khoản nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#111827' }}>Tài khoản</th>
                    {accountType === 'admin' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#111827' }}>Vai trò</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#111827' }}>Nhóm</th>
                      </>
                    )}
                    {accountType === 'collaborator' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#111827' }}>Mã CTV</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#111827' }}>Địa chỉ</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#111827' }}>Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#111827' }}>Ngày tạo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase" style={{ color: '#111827' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {accounts.map((account, index) => {
                    if (accountType === 'admin') {
                      const roleInfo = getRoleLabel(account.role);
                      const RoleIcon = roleInfo.icon;
                      const actionButtonKey = `admin-${account.id}`;
                      return (
                        <tr 
                          key={account.id} 
                          onMouseEnter={() => setHoveredRowIndex(index)}
                          onMouseLeave={() => setHoveredRowIndex(null)}
                          style={{
                            backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                                <Shield className="w-5 h-5" style={{ color: '#2563eb' }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#111827' }}>{account.name || account.email}</p>
                                <p className="text-xs" style={{ color: '#4b5563' }}>{account.email}</p>
                                {account.phone && (
                                  <p className="text-xs" style={{ color: '#6b7280' }}>{account.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={roleInfo.style}>
                              <RoleIcon className="w-3 h-3" />
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {account.group ? (
                              <span className="text-sm" style={{ color: '#374151' }}>{account.group.name}</span>
                            ) : (
                              <span className="text-sm" style={{ color: '#9ca3af' }}>—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {account.isActive && account.status === 1 ? (
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
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm" style={{ color: '#374151' }}>{formatDate(account.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/admin/accounts/${account.id}`)}
                                onMouseEnter={() => setHoveredActionButtonIndex(`${actionButtonKey}-view`)}
                                onMouseLeave={() => setHoveredActionButtonIndex(null)}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: '#2563eb',
                                  backgroundColor: hoveredActionButtonIndex === `${actionButtonKey}-view` ? '#eff6ff' : 'transparent'
                                }}
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/accounts/${account.id}/edit`)}
                                onMouseEnter={() => setHoveredActionButtonIndex(`${actionButtonKey}-edit`)}
                                onMouseLeave={() => setHoveredActionButtonIndex(null)}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: '#4b5563',
                                  backgroundColor: hoveredActionButtonIndex === `${actionButtonKey}-edit` ? '#f9fafb' : 'transparent'
                                }}
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(account)}
                                onMouseEnter={() => setHoveredActionButtonIndex(`${actionButtonKey}-delete`)}
                                onMouseLeave={() => setHoveredActionButtonIndex(null)}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: '#dc2626',
                                  backgroundColor: hoveredActionButtonIndex === `${actionButtonKey}-delete` ? '#fef2f2' : 'transparent'
                                }}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      // Collaborator
                      const actionButtonKey = `collaborator-${account.id}`;
                      return (
                        <tr 
                          key={account.id} 
                          onMouseEnter={() => setHoveredRowIndex(index)}
                          onMouseLeave={() => setHoveredRowIndex(null)}
                          style={{
                            backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                                <Users className="w-5 h-5" style={{ color: '#16a34a' }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#111827' }}>{account.name || account.email}</p>
                                <p className="text-xs" style={{ color: '#4b5563' }}>{account.email}</p>
                                {account.phone && (
                                  <p className="text-xs" style={{ color: '#6b7280' }}>{account.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium" style={{ color: '#111827' }}>{account.code || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm" style={{ color: '#374151' }}>{account.address || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            {account.status === 1 ? (
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
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm" style={{ color: '#374151' }}>{formatDate(account.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/admin/collaborators/${account.id}`)}
                                onMouseEnter={() => setHoveredActionButtonIndex(`${actionButtonKey}-view`)}
                                onMouseLeave={() => setHoveredActionButtonIndex(null)}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: '#2563eb',
                                  backgroundColor: hoveredActionButtonIndex === `${actionButtonKey}-view` ? '#eff6ff' : 'transparent'
                                }}
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/collaborators/${account.id}/edit`)}
                                onMouseEnter={() => setHoveredActionButtonIndex(`${actionButtonKey}-edit`)}
                                onMouseLeave={() => setHoveredActionButtonIndex(null)}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: '#4b5563',
                                  backgroundColor: hoveredActionButtonIndex === `${actionButtonKey}-edit` ? '#f9fafb' : 'transparent'
                                }}
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(account)}
                                onMouseEnter={() => setHoveredActionButtonIndex(`${actionButtonKey}-delete`)}
                                onMouseLeave={() => setHoveredActionButtonIndex(null)}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  color: '#dc2626',
                                  backgroundColor: hoveredActionButtonIndex === `${actionButtonKey}-delete` ? '#fef2f2' : 'transparent'
                                }}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: '#e5e7eb' }}>
                <div className="text-sm" style={{ color: '#374151' }}>
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} tài khoản
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={pagination.page === 1}
                    onMouseEnter={() => !(pagination.page === 1) && setHoveredPaginationButtonIndex('first')}
                    onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                    className="p-2 border rounded-lg disabled:cursor-not-allowed transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      opacity: pagination.page === 1 ? 0.5 : 1,
                      backgroundColor: hoveredPaginationButtonIndex === 'first' && pagination.page !== 1 ? '#f9fafb' : 'transparent'
                    }}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    onMouseEnter={() => !(pagination.page === 1) && setHoveredPaginationButtonIndex('prev')}
                    onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                    className="p-2 border rounded-lg disabled:cursor-not-allowed transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      opacity: pagination.page === 1 ? 0.5 : 1,
                      backgroundColor: hoveredPaginationButtonIndex === 'prev' && pagination.page !== 1 ? '#f9fafb' : 'transparent'
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm" style={{ color: '#374151' }}>
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    onMouseEnter={() => !(pagination.page >= pagination.totalPages) && setHoveredPaginationButtonIndex('next')}
                    onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                    className="p-2 border rounded-lg disabled:cursor-not-allowed transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                      backgroundColor: hoveredPaginationButtonIndex === 'next' && pagination.page < pagination.totalPages ? '#f9fafb' : 'transparent'
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages}
                    onMouseEnter={() => !(pagination.page >= pagination.totalPages) && setHoveredPaginationButtonIndex('last')}
                    onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                    className="p-2 border rounded-lg disabled:cursor-not-allowed transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                      backgroundColor: hoveredPaginationButtonIndex === 'last' && pagination.page < pagination.totalPages ? '#f9fafb' : 'transparent'
                    }}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AccountsPage;
