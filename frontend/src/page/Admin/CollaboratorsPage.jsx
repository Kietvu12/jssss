import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import {
  Search,
  Plus,
  Settings,
  Info,
  ExternalLink,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Phone,
  User,
  DollarSign,
} from 'lucide-react';


const CollaboratorsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [joinDateFrom, setJoinDateFrom] = useState('');
  const [joinDateTo, setJoinDateTo] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  
  // Hover states
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredInfoButton, setHoveredInfoButton] = useState(false);
  const [hoveredAddCollaboratorButton, setHoveredAddCollaboratorButton] = useState(false);
  const [hoveredSettingsButton, setHoveredSettingsButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredCollaboratorIdLinkIndex, setHoveredCollaboratorIdLinkIndex] = useState(null);
  const [hoveredEditButtonIndex, setHoveredEditButtonIndex] = useState(null);
  const [hoveredDeleteButtonIndex, setHoveredDeleteButtonIndex] = useState(null);

  useEffect(() => {
    loadCollaborators();
  }, [currentPage, itemsPerPage, selectedStatus, onlyActive, showInactiveOnly]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (onlyActive) {
        params.status = 1;
      } else if (showInactiveOnly) {
        params.status = 0;
      } else if (selectedStatus) {
        params.status = selectedStatus === 'active' ? 1 : 0;
      }

      const response = await apiService.getCollaborators(params);
      if (response.success && response.data) {
        setCollaborators(response.data.collaborators || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for collaborators (fallback)
  const sampleCollaborators = [
    { 
      id: 'CTV001', 
      name: 'Nguyen Van A', 
      email: 'nguyenvana@example.com', 
      phone: '0901234567', 
      candidatesCount: 15, 
      jobsCount: 8, 
      totalEarned: 12500000, 
      status: 'active', 
      joinDate: '2024/01/15' 
    },
    { 
      id: 'CTV002', 
      name: 'Tran Thi B', 
      email: 'tranthib@example.com', 
      phone: '0902345678', 
      candidatesCount: 23, 
      jobsCount: 12, 
      totalEarned: 18500000, 
      status: 'active', 
      joinDate: '2024/02/20' 
    },
    { 
      id: 'CTV003', 
      name: 'Le Van C', 
      email: 'levanc@example.com', 
      phone: '0903456789', 
      candidatesCount: 8, 
      jobsCount: 5, 
      totalEarned: 7500000, 
      status: 'active', 
      joinDate: '2024/03/10' 
    },
    { 
      id: 'CTV004', 
      name: 'Pham Thi D', 
      email: 'phamthid@example.com', 
      phone: '0904567890', 
      candidatesCount: 31, 
      jobsCount: 18, 
      totalEarned: 24500000, 
      status: 'active', 
      joinDate: '2024/01/05' 
    },
    { 
      id: 'CTV005', 
      name: 'Hoang Van E', 
      email: 'hoangvane@example.com', 
      phone: '0905678901', 
      candidatesCount: 5, 
      jobsCount: 3, 
      totalEarned: 4200000, 
      status: 'inactive', 
      joinDate: '2024/04/15' 
    },
    { 
      id: 'CTV006', 
      name: 'Vu Thi F', 
      email: 'vuthif@example.com', 
      phone: '0906789012', 
      candidatesCount: 19, 
      jobsCount: 11, 
      totalEarned: 15200000, 
      status: 'active', 
      joinDate: '2024/02/28' 
    },
    { 
      id: 'CTV007', 
      name: 'Do Van G', 
      email: 'dovang@example.com', 
      phone: '0907890123', 
      candidatesCount: 12, 
      jobsCount: 7, 
      totalEarned: 9800000, 
      status: 'active', 
      joinDate: '2024/03/22' 
    },
    { 
      id: 'CTV008', 
      name: 'Bui Thi H', 
      email: 'buithih@example.com', 
      phone: '0908901234', 
      candidatesCount: 27, 
      jobsCount: 15, 
      totalEarned: 21000000, 
      status: 'active', 
      joinDate: '2024/01/18' 
    },
    { 
      id: 'CTV009', 
      name: 'Dang Van I', 
      email: 'dangvani@example.com', 
      phone: '0909012345', 
      candidatesCount: 4, 
      jobsCount: 2, 
      totalEarned: 3200000, 
      status: 'inactive', 
      joinDate: '2024/05/10' 
    },
    { 
      id: 'CTV010', 
      name: 'Ngo Thi K', 
      email: 'ngothik@example.com', 
      phone: '0900123456', 
      candidatesCount: 35, 
      jobsCount: 20, 
      totalEarned: 28500000, 
      status: 'active', 
      joinDate: '2023/12/01' 
    },
    { 
      id: 'CTV011', 
      name: 'Ly Van L', 
      email: 'lyvanl@example.com', 
      phone: '0901234567', 
      candidatesCount: 18, 
      jobsCount: 10, 
      totalEarned: 14500000, 
      status: 'active', 
      joinDate: '2024/02/14' 
    },
    { 
      id: 'CTV012', 
      name: 'Truong Thi M', 
      email: 'truongthim@example.com', 
      phone: '0902345678', 
      candidatesCount: 22, 
      jobsCount: 13, 
      totalEarned: 17500000, 
      status: 'active', 
      joinDate: '2024/01/25' 
    },
    { 
      id: 'CTV013', 
      name: 'Vo Van N', 
      email: 'vovann@example.com', 
      phone: '0903456789', 
      candidatesCount: 9, 
      jobsCount: 6, 
      totalEarned: 7200000, 
      status: 'active', 
      joinDate: '2024/03/30' 
    },
    { 
      id: 'CTV014', 
      name: 'Dao Thi O', 
      email: 'daothio@example.com', 
      phone: '0904567890', 
      candidatesCount: 29, 
      jobsCount: 16, 
      totalEarned: 23000000, 
      status: 'active', 
      joinDate: '2024/01/08' 
    },
    { 
      id: 'CTV015', 
      name: 'Duong Van P', 
      email: 'duongvanp@example.com', 
      phone: '0905678901', 
      candidatesCount: 6, 
      jobsCount: 4, 
      totalEarned: 4800000, 
      status: 'inactive', 
      joinDate: '2024/04/20' 
    },
    { 
      id: 'CTV016', 
      name: 'Lam Thi Q', 
      email: 'lamthiq@example.com', 
      phone: '0906789012', 
      candidatesCount: 41, 
      jobsCount: 24, 
      totalEarned: 32500000, 
      status: 'active', 
      joinDate: '2023/11/15' 
    },
    { 
      id: 'CTV017', 
      name: 'Phan Van R', 
      email: 'phanvanr@example.com', 
      phone: '0907890123', 
      candidatesCount: 14, 
      jobsCount: 9, 
      totalEarned: 11200000, 
      status: 'active', 
      joinDate: '2024/02/05' 
    },
    { 
      id: 'CTV018', 
      name: 'Ho Thi S', 
      email: 'hothis@example.com', 
      phone: '0908901234', 
      candidatesCount: 33, 
      jobsCount: 19, 
      totalEarned: 26500000, 
      status: 'active', 
      joinDate: '2023/12/20' 
    },
    { 
      id: 'CTV019', 
      name: 'Mac Van T', 
      email: 'macvant@example.com', 
      phone: '0909012345', 
      candidatesCount: 11, 
      jobsCount: 7, 
      totalEarned: 8900000, 
      status: 'active', 
      joinDate: '2024/03/15' 
    },
    { 
      id: 'CTV020', 
      name: 'Kieu Thi U', 
      email: 'kieuthiu@example.com', 
      phone: '0900123456', 
      candidatesCount: 26, 
      jobsCount: 14, 
      totalEarned: 20500000, 
      status: 'active', 
      joinDate: '2024/01/30' 
    },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(collaborators.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setJoinDateFrom('');
    setJoinDateTo('');
    setOnlyActive(false);
    setShowInactiveOnly(false);
    setCurrentPage(1);
    loadCollaborators();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCollaborators();
  };

  const formatCurrency = (amount) => {
    const locale =
      language === 'en' ? 'en-US' :
      language === 'ja' ? 'ja-JP' :
      'vi-VN';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleEdit = (collaboratorId) => {
    navigate(`/admin/collaborators/${collaboratorId}/edit`);
  };

  const handleDelete = async (collaboratorId) => {
    if (window.confirm(t.collaboratorsConfirmDelete)) {
      try {
        const response = await apiService.deleteCollaborator(collaboratorId);
        if (response.success) {
          alert(response.message || t.collaboratorsDeleteSuccess);
          loadCollaborators();
        } else {
          alert(response.message || t.collaboratorsDeleteError);
        }
      } catch (error) {
        console.error('Error deleting collaborator:', error);
        alert(error.message || t.collaboratorsDeleteError);
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="rounded-lg p-3 border mb-3 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder={t.collaboratorsSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 border rounded text-xs"
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
          <button
            onClick={handleSearch}
            onMouseEnter={() => setHoveredSearchButton(true)}
            onMouseLeave={() => setHoveredSearchButton(false)}
            className="px-4 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredSearchButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            <Search className="w-3.5 h-3.5" />
            {t.search}
          </button>
          <button
            onClick={handleReset}
            onMouseEnter={() => setHoveredResetButton(true)}
            onMouseLeave={() => setHoveredResetButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredResetButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            {t.reset}
          </button>
          <button
            onMouseEnter={() => setHoveredInfoButton(true)}
            onMouseLeave={() => setHoveredInfoButton(false)}
            className="p-1.5"
            style={{
              color: hoveredInfoButton ? '#1f2937' : '#4b5563'
            }}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/admin/collaborators/new')}
            onMouseEnter={() => setHoveredAddCollaboratorButton(true)}
            onMouseLeave={() => setHoveredAddCollaboratorButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredAddCollaboratorButton ? '#eab308' : '#facc15',
              color: '#111827'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm CTV
          </button>
          <button
            onMouseEnter={() => setHoveredSettingsButton(true)}
            onMouseLeave={() => setHoveredSettingsButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredSettingsButton ? '#111827' : '#1f2937',
              color: 'white'
            }}
          >
            <Settings className="w-3.5 h-3.5" />
            {t.settings}
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.collaboratorsStatusLabel}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
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
              <option value="">{t.collaboratorsStatusAll}</option>
              <option value="active">{t.collaboratorsStatusActive}</option>
              <option value="inactive">{t.collaboratorsStatusInactive}</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.collaboratorsJoinDateFrom}</label>
            <input
              type="date"
              value={joinDateFrom}
              onChange={(e) => setJoinDateFrom(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
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
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.collaboratorsJoinDateTo}</label>
            <input
              type="date"
              value={joinDateTo}
              onChange={(e) => setJoinDateTo(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
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
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
              style={{
                accentColor: '#2563eb',
                borderColor: '#d1d5db'
              }}
            />
            <span className="text-xs font-semibold" style={{ color: '#374151' }}>{t.collaboratorsOnlyActive}</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactiveOnly}
              onChange={(e) => setShowInactiveOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
              style={{
                accentColor: '#2563eb',
                borderColor: '#d1d5db'
              }}
            />
            <span className="text-xs font-semibold" style={{ color: '#374151' }}>{t.collaboratorsOnlyInactive}</span>
          </label>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('first')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'first' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('prev')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'prev' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {[...Array(Math.min(7, totalPages))].map((_, i) => {
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
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                onMouseEnter={() => currentPage !== pageNum && setHoveredPaginationButtonIndex(pageNum)}
                onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
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
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'next' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationNavButton('last')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'last' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 border rounded text-xs font-semibold"
            style={{
              borderColor: '#d1d5db',
              color: '#374151',
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
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-xs font-semibold" style={{ color: '#374151' }}>{totalItems} {t.collaboratorsTotalItemsSuffix}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-lg border min-h-0 relative" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-3 py-2 text-center text-[10px] font-semibold border-b w-10" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === collaborators.length && collaborators.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded"
                    style={{
                      accentColor: '#2563eb',
                      borderColor: '#d1d5db'
                    }}
                  />
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.collaboratorsColName}</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.collaboratorsColRank}</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.collaboratorsColEmail}</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.collaboratorsColPhone}</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.collaboratorsColCandidatesCount}</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.collaboratorsColTotalEarned}</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.collaboratorsColStatus}</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.collaboratorsColJoinDate}</th>
                <th className="px-3 py-2 text-center text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    {t.collaboratorsLoading}
                  </td>
                </tr>
              ) : collaborators.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    {t.collaboratorsNoData}
                  </td>
                </tr>
              ) : (
                collaborators.map((collaborator, index) => {
                  const statusLabel = collaborator.status === 1 ? 'active' : 'inactive';
                  const joinDate = collaborator.createdAt 
                    ? new Date(collaborator.createdAt).toLocaleDateString(
                        language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN'
                      )
                    : collaborator.approvedAt 
                    ? new Date(collaborator.approvedAt).toLocaleDateString(
                        language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN'
                      )
                    : '-';
                  
                  return (
                    <tr
                      key={collaborator.id}
                      className="transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                      style={{
                        backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                      }}
                      onClick={() => navigate(`/admin/collaborators/${collaborator.id}`)}
                    >
                      <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleSelectRow(index)}
                          className="w-3.5 h-3.5 rounded"
                          style={{
                            accentColor: '#2563eb',
                            borderColor: '#d1d5db'
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className="text-[11px] font-medium" style={{ color: '#111827' }}>{collaborator.name}</div>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/collaborators/${collaborator.id}`); }}
                            onMouseEnter={() => setHoveredCollaboratorIdLinkIndex(index)}
                            onMouseLeave={() => setHoveredCollaboratorIdLinkIndex(null)}
                            className="text-[10px] flex items-center gap-0.5 mt-0.5"
                            style={{
                              color: hoveredCollaboratorIdLinkIndex === index ? '#1e40af' : '#6b7280'
                            }}
                          >
                            {collaborator.code || collaborator.id}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[11px] font-medium" style={{ color: '#111827' }}>
                          {collaborator.rankLevel?.name || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-[11px] flex items-center gap-1" style={{ color: '#374151' }}>
                          <Mail className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                          <span className="truncate">{collaborator.email || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-[11px] flex items-center gap-1" style={{ color: '#374151' }}>
                          <Phone className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                          <span className="truncate">{collaborator.phone || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <User className="w-2.5 h-2.5" style={{ color: '#9ca3af' }} />
                          <span className="text-[11px] font-medium" style={{ color: '#111827' }}>{collaborator.applicationsCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-2.5 h-2.5" style={{ color: '#16a34a' }} />
                          <span className="text-[11px] font-medium" style={{ color: '#111827' }}>{formatCurrency(collaborator.totalPaid || 0)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <select 
                          value={statusLabel}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: statusLabel === 'active' ? '#dcfce7' : '#fee2e2',
                            color: statusLabel === 'active' ? '#166534' : '#991b1b',
                            border: statusLabel === 'active' ? '1px solid #86efac' : '1px solid #fca5a5',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = '0 0 0 1px rgba(37, 99, 235, 0.5)';
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="active">{t.collaboratorsStatusActive}</option>
                          <option value="inactive">{t.collaboratorsStatusInactive}</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-[11px]" style={{ color: '#374151' }}>{joinDate}</td>
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(collaborator.id);
                            }}
                            onMouseEnter={() => setHoveredEditButtonIndex(index)}
                            onMouseLeave={() => setHoveredEditButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredEditButtonIndex === index ? '#1e40af' : '#2563eb',
                              backgroundColor: hoveredEditButtonIndex === index ? '#eff6ff' : 'transparent'
                            }}
                            title={t.collaboratorsEditTitle}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(collaborator.id);
                            }}
                            onMouseEnter={() => setHoveredDeleteButtonIndex(index)}
                            onMouseLeave={() => setHoveredDeleteButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredDeleteButtonIndex === index ? '#991b1b' : '#dc2626',
                              backgroundColor: hoveredDeleteButtonIndex === index ? '#fef2f2' : 'transparent'
                            }}
                            title={t.collaboratorsDeleteTitle}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsPage;
