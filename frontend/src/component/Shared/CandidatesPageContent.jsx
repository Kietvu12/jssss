import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { getCVStatusStyle, getCVStatusLabel, getCVStatusOptions } from '../../utils/cvStatus';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import {
  Search,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  Edit,
  Trash2,
  AlertTriangle,
  Table,
} from 'lucide-react';
import BulkImportCandidatesModal from './BulkImportCandidatesModal';

/**
 * Shared candidates list for Admin and Agent.
 * @param {'admin'|'agent'} variant - Controls API, routes, columns, and Edit/Delete visibility.
 */
const CandidatesPageContent = ({ variant = 'admin' }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const isAdmin = variant === 'admin';
  const basePath = isAdmin ? '/admin/candidates' : '/agent/candidates';

  const [adminProfile, setAdminProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
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
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredInfoButton, setHoveredInfoButton] = useState(false);
  const [hoveredAddCandidateButton, setHoveredAddCandidateButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredCollaboratorLinkIndex, setHoveredCollaboratorLinkIndex] = useState(null);
  const [hoveredApplicationsLinkIndex, setHoveredApplicationsLinkIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredEditButtonIndex, setHoveredEditButtonIndex] = useState(null);
  const [hoveredDeleteButtonIndex, setHoveredDeleteButtonIndex] = useState(null);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [hoveredBulkImportButton, setHoveredBulkImportButton] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
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
  }, [isAdmin]);

  useEffect(() => {
    loadCandidates();
  }, [currentPage, itemsPerPage, selectedStatus, sortColumn, sortDirection, searchQuery]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const normalizedSearch = searchQuery.trim().toLowerCase();
      const hasSearch = normalizedSearch.length > 0;
      const matchesSearch = (candidate) => {
        if (!normalizedSearch) return true;
        const name = (candidate?.name || '').toLowerCase();
        const fullName = (candidate?.fullName || '').toLowerCase();
        const nameKanji = (candidate?.nameKanji || '').toLowerCase();
        const email = (candidate?.email || '').toLowerCase();
        const phone = String(candidate?.phone || '').toLowerCase();

        return (
          name.includes(normalizedSearch) ||
          fullName.includes(normalizedSearch) ||
          nameKanji.includes(normalizedSearch) ||
          email.includes(normalizedSearch) ||
          phone.includes(normalizedSearch)
        );
      };
      const paginateLocal = (list) => {
        const total = list.length;
        const totalPagesLocal = Math.max(1, Math.ceil(total / itemsPerPage));
        const safePage = Math.min(currentPage, totalPagesLocal);
        const start = (safePage - 1) * itemsPerPage;
        const pageItems = list.slice(start, start + itemsPerPage);
        setCandidates(pageItems);
        setPagination({
          total,
          page: safePage,
          limit: itemsPerPage,
          totalPages: totalPagesLocal
        });
        if (safePage !== currentPage) setCurrentPage(safePage);
      };
      if (isAdmin) {
        const params = hasSearch
          ? { page: 1, limit: 1000 } // search theo name/email/phone ở client-side
          : { page: currentPage, limit: itemsPerPage };
        if (!hasSearch && searchQuery) params.search = searchQuery;
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
          if (normalizedSearch) {
            list = list.filter(matchesSearch);
          }
          if (hasSearch) {
            paginateLocal(list);
          } else {
            setCandidates(list);
            setPagination(response.data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
          }
        }
      } else {
        const params = hasSearch
          ? { page: 1, limit: 1000 } // search theo name/email/phone ở client-side
          : { page: currentPage, limit: itemsPerPage };
        if (!hasSearch && searchQuery) params.search = searchQuery;
        if (selectedStatus) params.status = selectedStatus;
        if (sortColumn) {
          params.sortBy = sortColumn;
          params.sortOrder = sortDirection;
        }
        const response = await apiService.getCVStorages(params);
        if (response.success && response.data) {
          let list = response.data.cvs || [];
          if (sortColumn && list.length > 0) {
            list = [...list].sort((a, b) => {
              let aVal, bVal;
              switch (sortColumn) {
                case 'name':
                  aVal = (a.name || a.nameKanji || '').toLowerCase();
                  bVal = (b.name || b.nameKanji || '').toLowerCase();
                  break;
                case 'applicationsCount':
                  aVal = a.applicationsCount ?? 0;
                  bVal = b.applicationsCount ?? 0;
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
              if (sortDirection === 'asc') return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
              return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            });
          }
          if (normalizedSearch) {
            list = list.filter(matchesSearch);
          }
          if (hasSearch) {
            paginateLocal(list);
          } else {
            setCandidates(list);
            setPagination(response.data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
          }
        }
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
    if (newSelected.has(index)) newSelected.delete(index);
    else newSelected.add(index);
    setSelectedRows(newSelected);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSortColumn('');
    setSortDirection('asc');
    setCurrentPage(1);
    loadCandidates();
  };

  const handleDelete = async (candidateId, e) => {
    e.stopPropagation();
    const confirmMsg = isAdmin ? t.confirmDeleteCandidateAdmin : t.confirmDeleteCandidate;
    const errorMsg = isAdmin ? t.errorDeleteCandidateAdmin : t.errorDeleteCandidate;
    if (!window.confirm(confirmMsg)) return;
    try {
      const response = isAdmin
        ? await apiService.deleteAdminCV(candidateId)
        : await apiService.deleteCVStorage(candidateId);
      if (response.success) {
        loadCandidates();
      } else {
        alert(response.message || errorMsg);
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert(errorMsg);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const locale = language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN';
      return new Date(dateString).toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return '—';
    }
  };

  const isSuperAdmin = adminProfile?.role === 1;
  const showEditDelete = isAdmin ? isSuperAdmin : true;
  const statusOptions = isAdmin
    ? getCVStatusOptions(language)
    : [
        { value: '0', label: t.draft || 'Draft' },
        { value: '1', label: t.active || 'Active' },
        { value: '2', label: t.archived || 'Archived' },
      ];
  const colCount = isAdmin ? 10 : 6;

  const displayName = (c) => c.name || c.fullName || c.nameKanji || 'N/A';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isAdmin && (
        <BulkImportCandidatesModal
          isOpen={bulkImportModalOpen}
          onClose={() => setBulkImportModalOpen(false)}
          onSuccess={loadCandidates}
        />
      )}
      <div className="w-full px-0 py-1.5 mb-1.5 flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap justify-between w-full">
          <div className="flex items-center px-3 py-1.5 rounded-full bg-white text-[12px] sm:text-[13px] min-w-[220px] flex-1">
            <Search className="w-3.5 h-3.5 mr-2 flex-shrink-0" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder={isAdmin ? t.searchPlaceholderAdmin : t.placeholderCandidateName}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-transparent outline-none text-[12px] sm:text-[13px]"
              style={{ border: 'none' }}
            />
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <button
              onClick={handleReset}
              onMouseEnter={() => setHoveredResetButton(true)}
              onMouseLeave={() => setHoveredResetButton(false)}
              className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-colors"
              style={{ backgroundColor: hoveredResetButton ? '#e5e7eb' : '#f3f4f6', color: '#374151' }}
            >
              {t.reset}
            </button>
            <button
              onMouseEnter={() => setHoveredInfoButton(true)}
              onMouseLeave={() => setHoveredInfoButton(false)}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: hoveredInfoButton ? '#1f2937' : '#4b5563' }}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[11px] sm:text-xs font-semibold"
                style={{ color: '#374151' }}
              >
                {t.cvStatus || t.status}
                <ChevronDown className="w-3 h-3" />
              </button>
              {isStatusFilterOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-white p-3 z-20 text-[11px] sm:text-xs" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="candidate-status-filter"
                        value=""
                        checked={selectedStatus === ''}
                        onChange={() => { setSelectedStatus(''); setCurrentPage(1); setIsStatusFilterOpen(false); }}
                        className="w-3.5 h-3.5"
                        style={{ accentColor: '#2563eb' }}
                      />
                      <span>{t.allStatus}</span>
                    </label>
                    {statusOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="candidate-status-filter"
                          value={String(opt.value)}
                          checked={selectedStatus === String(opt.value)}
                          onChange={() => { setSelectedStatus(String(opt.value)); setCurrentPage(1); setIsStatusFilterOpen(false); }}
                          className="w-3.5 h-3.5"
                          style={{ accentColor: '#2563eb' }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setBulkImportModalOpen(true)}
                onMouseEnter={() => setHoveredBulkImportButton(true)}
                onMouseLeave={() => setHoveredBulkImportButton(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-colors border"
                style={{
                  backgroundColor: hoveredBulkImportButton ? '#eff6ff' : 'white',
                  borderColor: '#2563eb',
                  color: '#1d4ed8'
                }}
              >
                <Table className="w-3.5 h-3.5 flex-shrink-0" />
                {t.candidatesPageBulkImport || 'Import Excel'}
              </button>
            )}
            <button
              onClick={() => navigate(`${basePath}/create`)}
              onMouseEnter={() => setHoveredAddCandidateButton(true)}
              onMouseLeave={() => setHoveredAddCandidateButton(false)}
              className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-colors"
              style={{
                backgroundColor: hoveredAddCandidateButton ? '#dc2626' : '#ef4444',
                color: 'white'
              }}
            >
              {t.addCandidateShort}
            </button>
          </div>
        </div>
      </div>

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
              borderColor: '#d1d5db', color: '#374151',
              opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
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
              borderColor: '#d1d5db', color: '#374151',
              opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {[...Array(Math.min(7, totalPages))].map((_, i) => {
            let pageNum;
            if (totalPages <= 7) pageNum = i + 1;
            else if (currentPage <= 4) pageNum = i + 1;
            else if (currentPage >= totalPages - 3) pageNum = totalPages - 6 + i;
            else pageNum = currentPage - 3 + i;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                onMouseEnter={() => currentPage !== pageNum && setHoveredPaginationButtonIndex(pageNum)}
                onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: currentPage === pageNum ? '#2563eb' : (hoveredPaginationButtonIndex === pageNum ? '#f9fafb' : 'white'),
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
              borderColor: '#d1d5db', color: '#374151',
              opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
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
              borderColor: '#d1d5db', color: '#374151',
              opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2.5 py-1 border rounded text-xs font-semibold"
            style={{ borderColor: '#d1d5db', color: '#374151', outline: 'none' }}
            onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-xs font-semibold" style={{ color: '#374151' }}>{totalItems} {t.items}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <div className="overflow-x-auto h-full">
          <table className="w-full table-auto border-separate" style={{ borderSpacing: '0 8px' }}>
            <thead className="sticky top-0 z-10" style={{ backgroundColor: 'white' }}>
              <tr>
                <th className="px-2 py-1.5 text-center text-[10px] font-bold w-10" style={{ color: '#111827' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === candidates.length && candidates.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded"
                    style={{ accentColor: '#2563eb', borderColor: '#d1d5db' }}
                  />
                </th>
                <th
                  className="px-2.5 py-1.5 text-left text-[10px] font-bold cursor-pointer transition-colors min-w-[160px]"
                  style={{ color: '#111827', backgroundColor: hoveredTableHeader === 'name' ? '#f3f4f6' : 'transparent' }}
                  onClick={() => handleSort('name')}
                  onMouseEnter={() => setHoveredTableHeader('name')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                >
                  <div className="flex items-center gap-1">{t.candidateName} {getSortIcon('name')}</div>
                </th>
                <th className="px-2.5 py-1.5 text-left text-[10px] font-bold min-w-[120px]" style={{ color: '#111827' }}>{t.cvStatus || t.status}</th>
                <th
                  className="px-2.5 py-1.5 text-left text-[10px] font-bold cursor-pointer transition-colors min-w-[120px]"
                  style={{ color: '#111827', backgroundColor: hoveredTableHeader === 'applicationsCount' ? '#f3f4f6' : 'transparent' }}
                  onClick={() => handleSort('applicationsCount')}
                  onMouseEnter={() => setHoveredTableHeader('applicationsCount')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                >
                  <div className="flex items-center gap-1">{t.numberOfApplications} {getSortIcon('applicationsCount')}</div>
                </th>
                <th
                  className="px-2.5 py-1.5 text-left text-[10px] font-bold cursor-pointer transition-colors min-w-[120px]"
                  style={{ color: '#111827', backgroundColor: hoveredTableHeader === 'createdAt' ? '#f3f4f6' : 'transparent' }}
                  onClick={() => handleSort('createdAt')}
                  onMouseEnter={() => setHoveredTableHeader('createdAt')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                >
                  <div className="flex items-center gap-1">{t.createdDate} {getSortIcon('createdAt')}</div>
                </th>
                {isAdmin && (
                  <>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-bold min-w-[110px]" style={{ color: '#111827' }}>{t.colEmail}</th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-bold min-w-[90px]" style={{ color: '#111827' }}>{t.colPhone}</th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-bold min-w-[90px] whitespace-nowrap" style={{ color: '#111827' }}>{t.colCtvName}</th>
                    <th className="px-2.5 py-1.5 text-left text-[10px] font-bold min-w-[90px] whitespace-nowrap" style={{ color: '#111827' }}>{t.colAdminName}</th>
                  </>
                )}
                <th className="px-2.5 py-1.5 text-center text-[10px] font-bold min-w-[130px]" style={{ color: '#111827' }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="px-3 py-6 text-center text-[10px]" style={{ color: '#6b7280' }}>{t.loadingCandidates}</td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-3 py-6 text-center text-[10px]" style={{ color: '#6b7280' }}>{t.noCandidatesFound}</td>
                </tr>
              ) : (
                candidates.map((candidate, index) => {
                  const s = getCVStatusStyle(candidate.status);
                  const ctvName = candidate.collaborator?.name || candidate.collaborator?.fullName || candidate.collaborator?.code || '—';
                  return (
                    <tr
                      key={candidate.id}
                      className="transition-colors"
                      style={{
                        backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'white',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
                        borderRadius: 12,
                      }}
                      onClick={() => navigate(`${basePath}/${candidate.id}`)}
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                    >
                      <td className="px-2 py-1.5 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleSelectRow(index)}
                          className="w-3.5 h-3.5 rounded"
                          style={{ accentColor: '#2563eb', borderColor: '#d1d5db' }}
                        />
                      </td>
                      <td className="px-2.5 py-1.5 text-[10px] cursor-pointer align-middle" style={{ color: '#111827' }}>
                        <div>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="font-medium">{displayName(candidate)}</span>
                            {!isAdmin && candidate.isDuplicate && (
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: '#f97316' }} title={t.duplicate} />
                            )}
                          </div>
                          <div className="text-[9px]" style={{ color: '#6b7280' }}>
                            ID: {candidate.code || candidate.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-2.5 py-1.5 align-middle">
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {getCVStatusLabel(candidate.status, language)}
                        </span>
                      </td>
                      <td className="px-2.5 py-1.5 align-middle">
                        <div className="flex items-center gap-0.5">
                          <span className="text-[10px] font-medium" style={{ color: '#111827' }}>{candidate.applicationsCount ?? 0}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/${candidate.id}/applications`); }}
                            onMouseEnter={() => setHoveredApplicationsLinkIndex(index)}
                            onMouseLeave={() => setHoveredApplicationsLinkIndex(null)}
                            className="p-0.5"
                            style={{ color: hoveredApplicationsLinkIndex === index ? '#1e40af' : '#2563eb' }}
                            title={t.viewApplications}
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-2.5 py-1.5 text-[10px] align-middle" style={{ color: '#374151' }}>{formatDate(candidate.createdAt || candidate.created_at)}</td>
                      {isAdmin && (
                        <>
                          <td className="px-2.5 py-1.5 text-[10px] align-middle" style={{ color: '#374151' }}>
                            {candidate.email && candidate.email.includes('@') ? (
                              <div className="flex items-center gap-0.5">
                                <Mail className="w-2 h-2 flex-shrink-0" style={{ color: '#9ca3af' }} />
                                <span className="truncate max-w-[100px]">{candidate.email}</span>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-2.5 py-1.5 text-[10px] align-middle" style={{ color: '#374151' }}>
                            {candidate.phone ? (
                              <div className="flex items-center gap-0.5">
                                <Phone className="w-2 h-2 flex-shrink-0" style={{ color: '#9ca3af' }} />
                                <span className="truncate">{candidate.phone}</span>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-2.5 py-1.5 align-middle">
                            {candidate.collaborator ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/collaborators/${candidate.collaborator.id}`); }}
                                onMouseEnter={() => setHoveredCollaboratorLinkIndex(index)}
                                onMouseLeave={() => setHoveredCollaboratorLinkIndex(null)}
                                className="text-[10px] font-medium text-left"
                                style={{ color: hoveredCollaboratorLinkIndex === index ? '#1e40af' : '#2563eb' }}
                              >
                                {ctvName}
                              </button>
                            ) : (
                              <span className="text-[10px]" style={{ color: '#6b7280' }}>—</span>
                            )}
                          </td>
                          <td className="px-2.5 py-1.5 text-[10px] align-middle" style={{ color: '#374151' }}>{candidate.admin?.name || '—'}</td>
                        </>
                      )}
                      <td className="px-2.5 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/${candidate.id}`); }}
                            onMouseEnter={() => setHoveredViewButtonIndex(index)}
                            onMouseLeave={() => setHoveredViewButtonIndex(null)}
                            className="p-0.5 rounded transition-colors"
                            style={{ color: hoveredViewButtonIndex === index ? '#374151' : '#6b7280', backgroundColor: hoveredViewButtonIndex === index ? '#f3f4f6' : 'transparent' }}
                            title={t.viewDetail}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          {showEditDelete && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/${candidate.id}/edit`); }}
                                onMouseEnter={() => setHoveredEditButtonIndex(index)}
                                onMouseLeave={() => setHoveredEditButtonIndex(null)}
                                className="p-0.5 rounded transition-colors"
                                style={{ color: hoveredEditButtonIndex === index ? '#374151' : '#6b7280', backgroundColor: hoveredEditButtonIndex === index ? '#f3f4f6' : 'transparent' }}
                                title={t.editTitle}
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(candidate.id, e)}
                                onMouseEnter={() => setHoveredDeleteButtonIndex(index)}
                                onMouseLeave={() => setHoveredDeleteButtonIndex(null)}
                                className="p-0.5 rounded transition-colors"
                                style={{ color: hoveredDeleteButtonIndex === index ? '#374151' : '#6b7280', backgroundColor: hoveredDeleteButtonIndex === index ? '#f3f4f6' : 'transparent' }}
                                title={t.deleteTitle}
                              >
                                <Trash2 className="w-3 h-3" />
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

export default CandidatesPageContent;
