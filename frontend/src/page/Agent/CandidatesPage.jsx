import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Plus,
  Settings,
  Info,
  ExternalLink,
  Send,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Edit,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import { getCVStatus, getCVStatusStyle, getCVStatusLabel } from '../../utils/cvStatus';


const CandidatesPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createdDateFilter, setCreatedDateFilter] = useState('');
  const [onlyMyCandidates, setOnlyMyCandidates] = useState(true); // Default to true for CTV
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  // Sort states
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  
  // Data states
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDuplicateFilter, setIsDuplicateFilter] = useState(''); // Filter by duplicate status

  // Hover states
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredInfoButton, setHoveredInfoButton] = useState(false);
  const [hoveredAddCandidateButton, setHoveredAddCandidateButton] = useState(false);
  const [hoveredSettingsButton, setHoveredSettingsButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationPageButton, setHoveredPaginationPageButton] = useState(null);
  const [hoveredTableHeader, setHoveredTableHeader] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredApplicationsLinkIndex, setHoveredApplicationsLinkIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredEditButtonIndex, setHoveredEditButtonIndex] = useState(null);
  const [hoveredDeleteButtonIndex, setHoveredDeleteButtonIndex] = useState(null);
  const [hoveredMoreButtonIndex, setHoveredMoreButtonIndex] = useState(null);

  // Load candidates data
  useEffect(() => {
    loadCandidates();
  }, [
    currentPage,
    itemsPerPage,
    nameFilter,
    statusFilter,
    createdDateFilter,
    isDuplicateFilter,
    sortColumn,
    sortDirection,
  ]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (nameFilter) {
        params.name = nameFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (createdDateFilter) {
        params.createdDate = createdDateFilter;
      }

      if (isDuplicateFilter !== '') {
        params.isDuplicate = isDuplicateFilter;
      }

      if (sortColumn) {
        params.sortBy = sortColumn;
        params.sortOrder = sortDirection;
      }

      const response = await apiService.getCVStorages(params);

      if (response.success && response.data) {
        let candidatesData = response.data.cvs || [];
        
        // Client-side sorting if API doesn't support it
        if (sortColumn && candidatesData.length > 0) {
          candidatesData = [...candidatesData].sort((a, b) => {
            let aVal, bVal;
            
            switch (sortColumn) {
              case 'name':
                aVal = (a.name || a.nameKanji || '').toLowerCase();
                bVal = (b.name || b.nameKanji || '').toLowerCase();
                break;
              case 'applicationsCount':
                aVal = a.applicationsCount || 0;
                bVal = b.applicationsCount || 0;
                break;
              case 'createdAt': {
                const aDate = a.createdAt || a.created_at || null;
                const bDate = b.createdAt || b.created_at || null;
                aVal = aDate ? new Date(aDate).getTime() : 0;
                bVal = bDate ? new Date(bDate).getTime() : 0;
                break;
              }
              default:
                return 0;
            }
            
            if (sortDirection === 'asc') {
              return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
              return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
          });
        }
        
        setCandidates(candidatesData);
        setTotalItems(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      } else {
        console.error('Error loading candidates:', response.message);
        setCandidates([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(candidates.map((_, index) => index)));
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
    setNameFilter('');
    setStatusFilter('');
    setCreatedDateFilter('');
    setOnlyMyCandidates(true);
    setIsDuplicateFilter('');
    setSortColumn('');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ChevronUp className="w-3 h-3" style={{ color: '#9ca3af', opacity: 0.5 }} />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3" style={{ color: '#374151' }} />
      : <ChevronDown className="w-3 h-3" style={{ color: '#374151' }} />;
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

  const getStatusLabel = (status) => {
    const statusLabels = {
      1: 'Admin đang xử lý hồ sơ',
      2: 'Đang tiến cử',
      3: 'Đang xếp lịch phỏng vấn',
      4: 'Đang phỏng vấn',
      5: 'Đang đợi naitei',
      6: 'Đang thương lượng naitei',
      7: 'Đang đợi nyusha',
      8: 'Đã nyusha',
      9: 'Đang chờ thanh toán với công ty',
      10: 'Gửi yêu cầu thanh toán',
      11: 'Đã thanh toán',
      12: 'Hồ sơ không hợp lệ',
      15: 'Kết quả trượt',
      16: 'Hủy giữa chừng',
      17: 'Không shodaku'
    };
    return statusLabels[status] || `Status ${status}`;
  };

  const handleEdit = (candidateId, e) => {
    e.stopPropagation();
    navigate(`/agent/candidates/${candidateId}/edit`);
  };

  const handleDelete = async (candidateId, e) => {
    e.stopPropagation();
    if (window.confirm(t.confirmDeleteCandidate)) {
      try {
        const response = await apiService.deleteCVStorage(candidateId);
        if (response.success) {
          // Reload candidates after deletion
          loadCandidates();
        } else {
          alert(response.message || t.errorDeleteCandidate);
        }
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert(t.errorDeleteCandidate);
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="rounded-2xl p-4 border mb-4 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold mb-1" style={{ color: '#374151' }}>{t.candidateName}</label>
            <input
              type="text"
              placeholder={t.placeholderCandidateName}
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none text-sm"
              style={{
                borderColor: '#d1d5db'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div className="min-w-[150px]">
            <label className="block text-xs font-bold mb-1" style={{ color: '#374151' }}>{t.status}</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none"
              style={{
                borderColor: '#d1d5db'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">{t.allStatus || t.all}</option>
              <option value="0">{t.draft || 'Draft'}</option>
              <option value="1">{t.active || 'Active'}</option>
              <option value="2">{t.archived || 'Archived'}</option>
            </select>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-xs font-bold mb-1" style={{ color: '#374151' }}>{t.createdDate}</label>
            <input
              type="date"
              value={createdDateFilter}
              onChange={(e) => {
                setCreatedDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none"
              style={{
                borderColor: '#d1d5db'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={handleReset}
            onMouseEnter={() => setHoveredResetButton(true)}
            onMouseLeave={() => setHoveredResetButton(false)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-colors self-end"
            style={{
              backgroundColor: hoveredResetButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            {t.reset || 'Reset'}
          </button>
          <button 
            onMouseEnter={() => setHoveredInfoButton(true)}
            onMouseLeave={() => setHoveredInfoButton(false)}
            className="p-2 self-end"
            style={{
              color: hoveredInfoButton ? '#1f2937' : '#4b5563'
            }}
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/agent/candidates/create')}
            onMouseEnter={() => setHoveredAddCandidateButton(true)}
            onMouseLeave={() => setHoveredAddCandidateButton(false)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 self-end"
            style={{
              backgroundColor: hoveredAddCandidateButton ? '#facc15' : '#fbbf24',
              color: '#111827'
            }}
          >
            <Plus className="w-4 h-4" />
            <Plus className="w-4 h-4" />
            {t.addCandidate || '+ Add a candidate'}
          </button>
          <button 
            onMouseEnter={() => setHoveredSettingsButton(true)}
            onMouseLeave={() => setHoveredSettingsButton(false)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 self-end"
            style={{
              backgroundColor: hoveredSettingsButton ? '#111827' : '#1f2937',
              color: 'white'
            }}
          >
            <Settings className="w-4 h-4" />
            {t.displaySettings || 'Display Settings'}
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold" style={{ color: '#111827' }}>{t.duplicate || 'Duplicate'}</label>
            <select
              value={isDuplicateFilter}
              onChange={(e) => {
                setIsDuplicateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{
                borderColor: '#d1d5db'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">{t.allStatus || t.all}</option>
              <option value="0">{t.notDuplicate || 'Not Duplicate'}</option>
              <option value="1">{t.isDuplicate || 'Duplicate'}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyMyCandidates}
              onChange={(e) => setOnlyMyCandidates(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{
                accentColor: '#ef4444',
                borderColor: '#d1d5db'
              }}
              disabled
            />
            <span className="text-sm font-bold" style={{ color: '#374151' }}>{t.onlyMyCandidates || 'Only show your candidates'}</span>
          </label>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
            
            const isActive = currentPage === pageNum;
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                onMouseEnter={() => !isActive && setHoveredPaginationPageButton(pageNum)}
                onMouseLeave={() => setHoveredPaginationPageButton(null)}
                className="px-3 py-1 rounded text-sm font-bold transition-colors"
                style={{
                  backgroundColor: isActive ? '#ef4444' : (hoveredPaginationPageButton === pageNum ? '#f9fafb' : 'white'),
                  borderColor: isActive ? 'transparent' : '#d1d5db',
                  borderWidth: isActive ? 0 : '1px',
                  borderStyle: isActive ? 'none' : 'solid',
                  color: isActive ? 'white' : '#374151'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            onMouseEnter={() => currentPage < totalPages && setHoveredPaginationNavButton('next')}
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
            onMouseEnter={() => currentPage < totalPages && setHoveredPaginationNavButton('last')}
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
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border rounded text-sm font-bold focus:outline-none"
            style={{
              borderColor: '#d1d5db',
              color: '#374151'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#ef4444';
              e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
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
          <span className="text-sm font-bold" style={{ color: '#374151' }}>{totalItems} {t.items || 'items'}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-xl border min-h-0 relative" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="overflow-x-auto h-full">
          <table className="w-full table-auto">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-2 py-2 text-center text-xs font-bold border-b w-10" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === candidates.length && candidates.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded"
                    style={{
                      accentColor: '#ef4444',
                      borderColor: '#d1d5db'
                    }}
                  />
                </th>
                <th 
                  className="px-3 py-2 text-left text-xs font-bold border-b cursor-pointer transition-colors min-w-[180px]"
                  style={{
                    color: '#111827',
                    borderColor: '#e5e7eb',
                    backgroundColor: hoveredTableHeader === 'name' ? '#f3f4f6' : 'transparent'
                  }}
                  onClick={() => handleSort('name')}
                  onMouseEnter={() => setHoveredTableHeader('name')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    {t.candidateName || 'Tên ứng viên'}
                    {getSortIcon('name')}
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold border-b min-w-[140px]" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                  {t.cvStatus}
                </th>
                <th 
                  className="px-3 py-2 text-left text-xs font-bold border-b cursor-pointer transition-colors min-w-[140px]"
                  style={{
                    color: '#111827',
                    borderColor: '#e5e7eb',
                    backgroundColor: hoveredTableHeader === 'applicationsCount' ? '#f3f4f6' : 'transparent'
                  }}
                  onClick={() => handleSort('applicationsCount')}
                  onMouseEnter={() => setHoveredTableHeader('applicationsCount')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    {t.numberOfApplications || 'Số lượt ứng tuyển'}
                    {getSortIcon('applicationsCount')}
                  </div>
                </th>
                <th 
                  className="px-3 py-2 text-left text-xs font-bold border-b cursor-pointer transition-colors min-w-[130px]"
                  style={{
                    color: '#111827',
                    borderColor: '#e5e7eb',
                    backgroundColor: hoveredTableHeader === 'createdAt' ? '#f3f4f6' : 'transparent'
                  }}
                  onClick={() => handleSort('createdAt')}
                  onMouseEnter={() => setHoveredTableHeader('createdAt')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    {t.createdDate}
                    {getSortIcon('createdAt')}
                  </div>
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold border-b min-w-[140px]" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.actions || 'Thao tác'}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                    <td colSpan="6" className="px-3 py-6 text-center text-xs" style={{ color: '#6b7280' }}>
                    {t.loadingCandidates || 'Đang tải dữ liệu...'}
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-6 text-center text-xs" style={{ color: '#6b7280' }}>
                    {t.noCandidatesFound || 'Không tìm thấy ứng viên nào'}
                  </td>
                </tr>
              ) : (
                candidates.map((candidate, index) => (
                  <tr
                    key={candidate.id}
                    className="transition-colors"
                    style={{
                      backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                    }}
                    onClick={() => navigate(`/agent/candidates/${candidate.id}`)}
                    onMouseEnter={() => setHoveredRowIndex(index)}
                    onMouseLeave={() => setHoveredRowIndex(null)}
                  >
                    <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleSelectRow(index)}
                        className="w-3.5 h-3.5 rounded"
                        style={{
                          accentColor: '#ef4444',
                          borderColor: '#d1d5db'
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-xs cursor-pointer" style={{ color: '#111827' }}>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-medium">{candidate.name || candidate.nameKanji || 'N/A'}</span>
                          {candidate.isDuplicate && (
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: '#f97316' }} title={t.duplicate} />
                          )}
                        </div>
                        <div className="text-[10px]" style={{ color: '#6b7280' }}>
                          ID: {candidate.code || candidate.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {(() => {
                        const s = getCVStatusStyle(candidate.status);
                        return (
                          <span
                            className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                          >
                            {getCVStatusLabel(candidate.status, language)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium" style={{ color: '#111827' }}>{candidate.applicationsCount || 0}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agent/candidates/${candidate.id}/applications`);
                          }}
                          onMouseEnter={() => setHoveredApplicationsLinkIndex(index)}
                          onMouseLeave={() => setHoveredApplicationsLinkIndex(null)}
                          className="p-0.5"
                          style={{
                            color: hoveredApplicationsLinkIndex === index ? '#1e40af' : '#2563eb'
                          }}
                          title={t.viewApplications}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                      {formatDate(candidate.createdAt || candidate.created_at)}
                    </td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agent/candidates/${candidate.id}`);
                          }}
                          onMouseEnter={() => setHoveredViewButtonIndex(index)}
                          onMouseLeave={() => setHoveredViewButtonIndex(null)}
                          className="p-1 rounded transition-colors"
                          style={{
                            color: hoveredViewButtonIndex === index ? '#1e40af' : '#2563eb',
                            backgroundColor: hoveredViewButtonIndex === index ? '#eff6ff' : 'transparent'
                          }}
                          title={t.viewDetail}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => handleEdit(candidate.id, e)}
                          onMouseEnter={() => setHoveredEditButtonIndex(index)}
                          onMouseLeave={() => setHoveredEditButtonIndex(null)}
                          className="p-1 rounded transition-colors"
                          style={{
                            color: hoveredEditButtonIndex === index ? '#15803d' : '#16a34a',
                            backgroundColor: hoveredEditButtonIndex === index ? '#dcfce7' : 'transparent'
                          }}
                          title={t.editTitle}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(candidate.id, e)}
                          onMouseEnter={() => setHoveredDeleteButtonIndex(index)}
                          onMouseLeave={() => setHoveredDeleteButtonIndex(null)}
                          className="p-1 rounded transition-colors"
                          style={{
                            color: hoveredDeleteButtonIndex === index ? '#dc2626' : '#ef4444',
                            backgroundColor: hoveredDeleteButtonIndex === index ? '#fee2e2' : 'transparent'
                          }}
                          title={t.deleteTitle}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          onMouseEnter={() => setHoveredMoreButtonIndex(index)}
                          onMouseLeave={() => setHoveredMoreButtonIndex(null)}
                          className="p-1 rounded transition-colors"
                          style={{
                            color: hoveredMoreButtonIndex === index ? '#1f2937' : '#4b5563',
                            backgroundColor: hoveredMoreButtonIndex === index ? '#f3f4f6' : 'transparent'
                          }}
                          title={t.moreOptions}
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;
