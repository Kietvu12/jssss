import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { getCVStatusStyle, getCVStatusLabel, getCVStatusOptions } from '../../utils/cvStatus';
import { getJobApplicationStatus } from '../../utils/jobApplicationStatus';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import {
  Search,
  Plus,
  Settings,
  Info,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
} from 'lucide-react';


const AdminCandidatesPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [adminProfile, setAdminProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showArchiveOnly, setShowArchiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [hoveredTableHeader, setHoveredTableHeader] = useState(null);
  
  // Hover states
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredInfoButton, setHoveredInfoButton] = useState(false);
  const [hoveredAddCandidateButton, setHoveredAddCandidateButton] = useState(false);
  const [hoveredSettingsButton, setHoveredSettingsButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredCandidateIdLinkIndex, setHoveredCandidateIdLinkIndex] = useState(null);
  const [hoveredCollaboratorLinkIndex, setHoveredCollaboratorLinkIndex] = useState(null);
  const [hoveredApplicationsLinkIndex, setHoveredApplicationsLinkIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredEditButtonIndex, setHoveredEditButtonIndex] = useState(null);
  const [hoveredDeleteButtonIndex, setHoveredDeleteButtonIndex] = useState(null);

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
    loadCandidates();
  }, [currentPage, itemsPerPage, selectedStatus, sortColumn, sortDirection]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedStatus) {
        const statusNum = parseInt(selectedStatus, 10);
        if (!Number.isNaN(statusNum) && statusNum >= 1 && statusNum <= 4) {
          params.status = statusNum;
        }
      }

      if (sortColumn) {
        params.sortBy = sortColumn === 'name' ? 'name' : sortColumn === 'applicationsCount' ? 'applicationsCount' : sortColumn === 'createdAt' ? 'createdAt' : '';
        params.sortOrder = sortDirection.toUpperCase();
      }

      const response = await apiService.getAdminCVs(params);
      if (response.success && response.data) {
        let list = response.data.cvs || [];
        if (sortColumn && list.length > 0) {
          list = [...list].sort((a, b) => {
            let aVal, bVal;
            switch (sortColumn) {
              case 'name':
                aVal = (a.name || a.fullName || '').toLowerCase();
                bVal = (b.name || b.fullName || '').toLowerCase();
                break;
              case 'applicationsCount':
                aVal = a.applicationsCount ?? 0;
                bVal = b.applicationsCount ?? 0;
                break;
              case 'createdAt':
                aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                break;
              default:
                return 0;
            }
            if (sortDirection === 'asc') return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
          });
        }
        setCandidates(list);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ChevronUp className="w-3 h-3 opacity-30" style={{ color: '#9ca3af' }} />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="w-3 h-3" style={{ color: '#2563eb' }} />
      : <ChevronDown className="w-3 h-3" style={{ color: '#2563eb' }} />;
  };

  // Sample data (fallback)
  const sampleCandidates = [
    { id: '00044572', name: 'PHAM NGO BINH', email: 'phamngobinh@example.com', phone: '0901234567', inflowPath: 'Website', inHouseResp: 'Nguyen Van A', firstInterview: '2025/01/15', phase: 'Phase 1', recommendations: 1, scouts: 2, scoutStatus: 'Active', finalScoutRelease: '2025/01/20', status: 'active', ctv: 'CTV001' },
    { id: '00044064', name: 'NGUYEN THI NGA', email: 'nguyenthinga@example.com', phone: '0902345678', inflowPath: 'Referral', inHouseResp: 'Nguyen Hai Quang', firstInterview: '2025/12/17', phase: 'Phase 2', recommendations: 1, scouts: 1, scoutStatus: 'Pending', finalScoutRelease: '2025/12/17', status: 'active', ctv: 'CTV002' },
    { id: '00043293', name: 'TRAN VAN CUONG', email: 'tranvancuong@example.com', phone: '0903456789', inflowPath: 'Website', inHouseResp: '—', firstInterview: '2025/12/10', phase: 'Phase 1', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV003' },
    { id: '00043103', name: 'LE THI MAI', email: 'lethimai@example.com', phone: '0904567890', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '2025/12/08', phase: '', recommendations: 1, scouts: 1, scoutStatus: 'Active', finalScoutRelease: '-', status: 'active', ctv: 'CTV004' },
    { id: '00042979', name: 'HOANG VAN DUC', email: 'hoangvanduc@example.com', phone: '0905678901', inflowPath: 'Website', inHouseResp: '—', firstInterview: '2025/12/05', phase: 'Phase 1', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV005' },
    { id: '00042966', name: 'VU THI HOA', email: 'vuthihoa@example.com', phone: '0906789012', inflowPath: 'Referral', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 3, scouts: 2, scoutStatus: 'Active', finalScoutRelease: '-', status: 'active', ctv: 'CTV006' },
    { id: '00042950', name: 'CANDIDATE A', email: 'candidatea@example.com', phone: '0907890123', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV007' },
    { id: '00042949', name: 'CANDIDATE B', email: 'candidateb@example.com', phone: '0908901234', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'inactive', ctv: 'CTV008' },
    { id: '00042948', name: 'CANDIDATE C', email: 'candidatec@example.com', phone: '0909012345', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV009' },
    { id: '00042947', name: 'CANDIDATE D', email: 'candidated@example.com', phone: '0900123456', inflowPath: 'Referral', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 1, scoutStatus: 'Pending', finalScoutRelease: '-', status: 'active', ctv: 'CTV010' },
    { id: '00042946', name: 'CANDIDATE E', email: 'candidatee@example.com', phone: '0901234567', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV011' },
    { id: '00042945', name: 'CANDIDATE F', email: 'candidatef@example.com', phone: '0902345678', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'inactive', ctv: 'CTV012' },
    { id: '00042944', name: 'CANDIDATE G', email: 'candidateg@example.com', phone: '0903456789', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV013' },
    { id: '00042943', name: 'CANDIDATE H', email: 'candidateh@example.com', phone: '0904567890', inflowPath: 'Referral', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV014' },
    { id: '00042942', name: 'CANDIDATE I', email: 'candidatei@example.com', phone: '0905678901', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV015' },
    { id: '00042941', name: 'CANDIDATE J', email: 'candidatej@example.com', phone: '0906789012', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 1, scoutStatus: 'Active', finalScoutRelease: '-', status: 'active', ctv: 'CTV016' },
    { id: '00042940', name: 'CANDIDATE K', email: 'candidatek@example.com', phone: '0907890123', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'inactive', ctv: 'CTV017' },
    { id: '00042939', name: 'CANDIDATE L', email: 'candidatel@example.com', phone: '0908901234', inflowPath: 'Referral', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV018' },
    { id: '00042938', name: 'CANDIDATE M', email: 'candidatem@example.com', phone: '0909012345', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV019' },
    { id: '00042937', name: 'CANDIDATE N', email: 'candidaten@example.com', phone: '0900123456', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV020' },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

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
    setSearchQuery('');
    setSelectedStatus('');
    setShowArchiveOnly(false);
    setSortColumn('');
    setSortDirection('asc');
    setCurrentPage(1);
    loadCandidates();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCandidates();
  };

  const handleDelete = async (candidateId, e) => {
    e.stopPropagation();
    if (!window.confirm(t.confirmDeleteCandidateAdmin)) return;
    try {
      const response = await apiService.deleteAdminCV(candidateId);
      if (response.success) {
        loadCandidates();
      } else {
        alert(response.message || t.errorDeleteCandidateAdmin);
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert(t.errorDeleteCandidateAdmin);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const locale =
        language === 'en' ? 'en-US' :
        language === 'ja' ? 'ja-JP' :
        'vi-VN';
      return new Date(dateString).toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return '—';
    }
  };

  const isSuperAdmin = adminProfile?.role === 1;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="rounded-lg p-3 border mb-3 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder={t.searchPlaceholderAdmin}
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
            onClick={() => navigate('/admin/candidates/create')}
            onMouseEnter={() => setHoveredAddCandidateButton(true)}
            onMouseLeave={() => setHoveredAddCandidateButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredAddCandidateButton ? '#eab308' : '#facc15',
              color: '#111827'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addCandidateShort}
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

        {/* Additional Filters - Trạng thái tương ứng bên CTV: Hoạt động (1) / Lưu trữ (2) */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.cvStatus}</label>
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
              <option value="">{t.allStatus}</option>
              {getCVStatusOptions(language).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchiveOnly}
              onChange={(e) => setShowArchiveOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
              style={{
                accentColor: '#2563eb',
                borderColor: '#d1d5db'
              }}
            />
            <span className="text-xs font-semibold" style={{ color: '#374151' }}>{t.showArchiveOnlyLabel}</span>
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
          <span className="text-xs font-semibold" style={{ color: '#374151' }}>{totalItems} {t.items}</span>
        </div>
      </div>

      {/* Table - bố cục và thứ tự cột giống CTV, thêm cột chỉ Admin (Email, SĐT, Tên CTV, Tên admin) */}
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
                    style={{ accentColor: '#2563eb', borderColor: '#d1d5db' }}
                  />
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-bold border-b cursor-pointer transition-colors min-w-[180px]"
                  style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: hoveredTableHeader === 'name' ? '#f3f4f6' : 'transparent' }}
                  onClick={() => handleSort('name')}
                  onMouseEnter={() => setHoveredTableHeader('name')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                >
                  <div className="flex items-center gap-1">{t.candidateName} {getSortIcon('name')}</div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold border-b min-w-[140px]" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.cvStatus}</th>
                <th
                  className="px-3 py-2 text-left text-xs font-bold border-b cursor-pointer transition-colors min-w-[140px]"
                  style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: hoveredTableHeader === 'applicationsCount' ? '#f3f4f6' : 'transparent' }}
                  onClick={() => handleSort('applicationsCount')}
                  onMouseEnter={() => setHoveredTableHeader('applicationsCount')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                >
                  <div className="flex items-center gap-1">{t.numberOfApplications} {getSortIcon('applicationsCount')}</div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-bold border-b cursor-pointer transition-colors min-w-[130px]"
                  style={{ color: '#111827', borderColor: '#e5e7eb', backgroundColor: hoveredTableHeader === 'createdAt' ? '#f3f4f6' : 'transparent' }}
                  onClick={() => handleSort('createdAt')}
                  onMouseEnter={() => setHoveredTableHeader('createdAt')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                >
                  <div className="flex items-center gap-1">{t.createdDate} {getSortIcon('createdAt')}</div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold border-b min-w-[120px]" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colEmail}</th>
                <th className="px-3 py-2 text-left text-xs font-bold border-b min-w-[100px]" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colPhone}</th>
                <th className="px-3 py-2 text-left text-xs font-bold border-b min-w-[100px] whitespace-nowrap" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colCtvName}</th>
                <th className="px-3 py-2 text-left text-xs font-bold border-b min-w-[100px] whitespace-nowrap" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colAdminName}</th>
                <th className="px-3 py-2 text-center text-xs font-bold border-b min-w-[140px]" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-3 py-6 text-center text-xs" style={{ color: '#6b7280' }}>{t.loadingCandidates}</td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-3 py-6 text-center text-xs" style={{ color: '#6b7280' }}>{t.noCandidatesFound}</td>
                </tr>
              ) : (
                candidates.map((candidate, index) => {
                  const s = getCVStatusStyle(candidate.status);
                  const ctvName = candidate.collaborator?.name || candidate.collaborator?.fullName || candidate.collaborator?.code || '—';
                  return (
                    <tr
                      key={candidate.id}
                      className="transition-colors"
                      style={{ backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent' }}
                      onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                    >
                      <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleSelectRow(index)}
                          className="w-3.5 h-3.5 rounded"
                          style={{ accentColor: '#2563eb', borderColor: '#d1d5db' }}
                        />
                      </td>
                      <td className="px-3 py-2 text-xs cursor-pointer" style={{ color: '#111827' }}>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-medium">{candidate.name || candidate.fullName || candidate.nameKanji || 'N/A'}</span>
                          </div>
                          <div className="text-[10px]" style={{ color: '#6b7280' }}>
                            ID: {candidate.code || candidate.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {getCVStatusLabel(candidate.status, language)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium" style={{ color: '#111827' }}>{candidate.applicationsCount ?? 0}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/candidates/${candidate.id}/applications`); }}
                            onMouseEnter={() => setHoveredApplicationsLinkIndex(index)}
                            onMouseLeave={() => setHoveredApplicationsLinkIndex(null)}
                            className="p-0.5"
                            style={{ color: hoveredApplicationsLinkIndex === index ? '#1e40af' : '#2563eb' }}
                            title={t.viewApplications}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>{formatDate(candidate.createdAt || candidate.created_at)}</td>
                      <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                        {candidate.email && candidate.email.includes('@') ? (
                          <div className="flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                            <span className="truncate max-w-[120px]">{candidate.email}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                        {candidate.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                            <span className="truncate">{candidate.phone}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {candidate.collaborator ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/collaborators/${candidate.collaborator.id}`); }}
                            onMouseEnter={() => setHoveredCollaboratorLinkIndex(index)}
                            onMouseLeave={() => setHoveredCollaboratorLinkIndex(null)}
                            className="text-xs font-medium text-left"
                            style={{ color: hoveredCollaboratorLinkIndex === index ? '#1e40af' : '#2563eb' }}
                          >
                            {ctvName}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: '#6b7280' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>{candidate.admin?.name || '—'}</td>
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/candidates/${candidate.id}`); }}
                            onMouseEnter={() => setHoveredViewButtonIndex(index)}
                            onMouseLeave={() => setHoveredViewButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{ color: hoveredViewButtonIndex === index ? '#1e40af' : '#2563eb', backgroundColor: hoveredViewButtonIndex === index ? '#eff6ff' : 'transparent' }}
                            title={t.viewDetail}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/candidates/${candidate.id}/edit`); }}
                                onMouseEnter={() => setHoveredEditButtonIndex(index)}
                                onMouseLeave={() => setHoveredEditButtonIndex(null)}
                                className="p-1 rounded transition-colors"
                                style={{ color: hoveredEditButtonIndex === index ? '#15803d' : '#16a34a', backgroundColor: hoveredEditButtonIndex === index ? '#dcfce7' : 'transparent' }}
                                title={t.editTitle}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(candidate.id, e)}
                                onMouseEnter={() => setHoveredDeleteButtonIndex(index)}
                                onMouseLeave={() => setHoveredDeleteButtonIndex(null)}
                                className="p-1 rounded transition-colors"
                                style={{ color: hoveredDeleteButtonIndex === index ? '#dc2626' : '#ef4444', backgroundColor: hoveredDeleteButtonIndex === index ? '#fee2e2' : 'transparent' }}
                                title={t.deleteTitle}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
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

export default AdminCandidatesPage;
