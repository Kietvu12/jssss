import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { getJobApplicationStatus, getJobApplicationStatusOptionsByLanguage, getJobApplicationStatusLabelByLanguage } from '../../utils/jobApplicationStatus';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import {
  Search,
  Filter,
  ExternalLink,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  Briefcase,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Send,
} from 'lucide-react';


const pickByLanguage = (viText, enText, jpText, lang) => {
  if (lang === 'en') return enText || viText || '—';
  if (lang === 'ja') return jpText || enText || viText || '—';
  return viText || enText || jpText || '—';
};

const NominationsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [rawJobApplications, setRawJobApplications] = useState([]);
  const [unreadByJobApplication, setUnreadByJobApplication] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  const [sortBy, setSortBy] = useState('appliedDate'); // 'candidateName' or 'appliedDate'
  const [sortOrder, setSortOrder] = useState('DESC'); // 'ASC' or 'DESC'

  // Hover states
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredPaginationButton, setHoveredPaginationButton] = useState(null);
  const [hoveredTableRow, setHoveredTableRow] = useState(null);
  const [hoveredViewButton, setHoveredViewButton] = useState(null);
  const [hoveredMoreButton, setHoveredMoreButton] = useState(null);
  const [hoveredSortHeader, setHoveredSortHeader] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [focusedSelect, setFocusedSelect] = useState(null);

  // Map status từ số sang object (sử dụng utility function)
  const mapStatus = (status) => {
    const statusInfo = getJobApplicationStatus(status);
    // Map category to simple value for filter compatibility
    let key = 'pending';
    if (statusInfo.category === 'success' || status === 8 || status === 11) {
      key = 'accepted';
    } else if (statusInfo.category === 'rejected' || statusInfo.category === 'cancelled') {
      key = 'rejected';
    } else if (statusInfo.category === 'interview') {
      key = 'interviewed';
    } else if (statusInfo.category === 'processing') {
      key = 'pending';
    }
    return { key, label: statusInfo.label, color: statusInfo.color };
  };

  const statusFilterOptions = getJobApplicationStatusOptionsByLanguage(language);

  // Load nominations từ API
  const loadNominations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'applied_at',
        sortOrder: 'DESC'
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (dateFrom) {
        params.appliedFrom = dateFrom;
      }

      if (dateTo) {
        params.appliedTo = dateTo;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const [response, unreadMap] = await Promise.all([
        apiService.getJobApplications(params),
        apiService.getCTVUnreadByJobApplication().catch(() => ({}))
      ]);

      if (response.success && response.data) {
        setUnreadByJobApplication(unreadMap || {});
        setRawJobApplications(response.data.jobApplications || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: currentPage,
          limit: itemsPerPage,
          totalPages: 1
        });
      } else {
        setError(response.message || t.errorLoadNominations);
        setRawJobApplications([]);
      }
    } catch (err) {
      console.error('Error loading nominations:', err);
      setError(err.message || t.errorLoadNominationsGeneric);
      setRawJobApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNominations();
  }, [currentPage, itemsPerPage, statusFilter, dateFrom, dateTo]);

  const nominations = useMemo(() => {
    const rc = (raw) => {
      const company = raw?.recruitingCompany || raw?.company;
      return pickByLanguage(
        company?.companyName,
        company?.companyNameEn || company?.company_name_en,
        company?.companyNameJp || company?.company_name_jp,
        language
      );
    };
    const mapped = rawJobApplications.map((app) => {
      const statusInfo = mapStatus(app.status);
      const job = app.job;
      const jobTitle = pickByLanguage(
        job?.title,
        job?.titleEn || job?.title_en,
        job?.titleJp || job?.title_jp,
        language
      );
      const companyName = rc(job) || '—';
      return {
        id: app.id,
        candidateName: app.name || app.cv?.name || '—',
        candidateId: app.cv?.code || app.cvCode || '—',
        jobTitle: jobTitle || '—',
        jobId: app.jobId,
        companyName,
        status: statusInfo.key,
        statusLabel: getJobApplicationStatusLabelByLanguage(app.status, language),
        statusColor: statusInfo.color,
        appliedDate: app.appliedAt || app.applied_at || app.createdAt || app.created_at,
        interviewDate: app.interviewDate || app.interview_date || '—',
        referralFee: app.referralFee || app.referral_fee || 0,
        cvId: app.cv?.id || app.cvId,
        jobSlug: job?.slug,
      };
    });
    return [...mapped].sort((a, b) => {
      if (sortBy === 'candidateName') {
        const nameA = (a.candidateName || '').toLowerCase();
        const nameB = (b.candidateName || '').toLowerCase();
        return sortOrder === 'ASC' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (sortBy === 'appliedDate') {
        const dateA = new Date(a.appliedDate || 0).getTime();
        const dateB = new Date(b.appliedDate || 0).getTime();
        return sortOrder === 'ASC' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [rawJobApplications, language, sortBy, sortOrder]);

  const totalItems = pagination.total;
  const totalPages = pagination.totalPages;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#fef9c3', color: '#854d0e' };
      case 'interviewed':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'accepted':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'rejected':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'interviewed':
        return <AlertCircle className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(nominations.map((_, index) => index)));
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
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadNominations();
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Set new column and default to ASC
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ChevronUp className="w-3 h-3" style={{ color: '#9ca3af', opacity: 0.5 }} />;
    }
    return sortOrder === 'ASC' 
      ? <ChevronUp className="w-3 h-3" style={{ color: '#2563eb' }} />
      : <ChevronDown className="w-3 h-3" style={{ color: '#2563eb' }} />;
  };

  const truncateText = (text, maxLength = 40) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="rounded-2xl p-4 border mb-4 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder={t.searchPlaceholderNominations}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setFocusedInput('search')}
                onBlur={() => setFocusedInput(null)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none text-sm"
                style={{
                  borderColor: focusedInput === 'search' ? '#dc2626' : '#d1d5db',
                  boxShadow: focusedInput === 'search' ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : 'none'
                }}
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            onMouseEnter={() => setHoveredSearchButton(true)}
            onMouseLeave={() => setHoveredSearchButton(false)}
            className="px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            style={{
              backgroundColor: hoveredSearchButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            <Search className="w-4 h-4" />
            {t.search}
          </button>
          <button
            onClick={handleReset}
            onMouseEnter={() => setHoveredResetButton(true)}
            onMouseLeave={() => setHoveredResetButton(false)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            style={{
              backgroundColor: hoveredResetButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            {t.reset}
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: '#6b7280' }} />
            <label className="text-sm font-bold" style={{ color: '#111827' }}>{t.statusLabel}:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              onFocus={() => setFocusedSelect('status')}
              onBlur={() => setFocusedSelect(null)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none min-w-[220px]"
              style={{
                borderColor: focusedSelect === 'status' ? '#dc2626' : '#d1d5db',
                boxShadow: focusedSelect === 'status' ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : 'none'
              }}
            >
              <option value="">{t.allStatuses}</option>
              {statusFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold" style={{ color: '#111827' }}>{t.dateFrom}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              onFocus={() => setFocusedInput('dateFrom')}
              onBlur={() => setFocusedInput(null)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{
                borderColor: focusedInput === 'dateFrom' ? '#dc2626' : '#d1d5db',
                boxShadow: focusedInput === 'dateFrom' ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : 'none'
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold" style={{ color: '#111827' }}>{t.dateTo}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              onFocus={() => setFocusedInput('dateTo')}
              onBlur={() => setFocusedInput(null)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{
                borderColor: focusedInput === 'dateTo' ? '#dc2626' : '#d1d5db',
                boxShadow: focusedInput === 'dateTo' ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            onMouseEnter={() => currentPage !== 1 && setHoveredPaginationButton('first')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            className="px-2 py-1 border rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: hoveredPaginationButton === 'first' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151'
            }}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            onMouseEnter={() => currentPage !== 1 && setHoveredPaginationButton('prev')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            className="px-2 py-1 border rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: hoveredPaginationButton === 'prev' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(Math.min(7, totalPages))].map((_, i) => {
            const pageNum = i + 1;
            const isActive = currentPage === pageNum;
            const isHovered = hoveredPaginationButton === `page-${pageNum}`;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                onMouseEnter={() => !isActive && setHoveredPaginationButton(`page-${pageNum}`)}
                onMouseLeave={() => setHoveredPaginationButton(null)}
                className="px-3 py-1 rounded text-sm font-bold transition-colors"
                style={{
                  backgroundColor: isActive ? '#dc2626' : isHovered ? '#f9fafb' : 'white',
                  color: isActive ? 'white' : '#374151',
                  border: isActive ? 'none' : '1px solid #d1d5db',
                  borderColor: isActive ? 'transparent' : '#d1d5db'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationButton('next')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            className="px-2 py-1 border rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: hoveredPaginationButton === 'next' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151'
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationButton('last')}
            onMouseLeave={() => setHoveredPaginationButton(null)}
            className="px-2 py-1 border rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: hoveredPaginationButton === 'last' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151'
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
            onFocus={() => setFocusedSelect('itemsPerPage')}
            onBlur={() => setFocusedSelect(null)}
            className="px-3 py-1 border rounded text-sm font-bold focus:outline-none"
            style={{
              borderColor: focusedSelect === 'itemsPerPage' ? '#dc2626' : '#d1d5db',
              color: '#374151',
              boxShadow: focusedSelect === 'itemsPerPage' ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : 'none'
            }}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm font-bold" style={{ color: '#374151' }}>{totalItems} {t.resultsCount}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-2xl border min-h-0 relative" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-4 py-3 text-center text-xs font-bold border-b w-12" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === nominations.length && nominations.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded"
                    style={{ 
                      accentColor: '#dc2626',
                      borderColor: '#d1d5db'
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colId}</th>
                <th 
                  className="px-4 py-3 text-left text-xs font-bold border-b cursor-pointer select-none"
                  onClick={() => handleSort('candidateName')}
                  onMouseEnter={() => setHoveredSortHeader('candidateName')}
                  onMouseLeave={() => setHoveredSortHeader(null)}
                  style={{ 
                    color: '#111827', 
                    borderColor: '#e5e7eb',
                    backgroundColor: hoveredSortHeader === 'candidateName' ? '#f3f4f6' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-1">
                    {t.colCandidate}
                    {getSortIcon('candidateName')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colJob}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.statusLabel}</th>
                <th 
                  className="px-4 py-3 text-left text-xs font-bold border-b cursor-pointer select-none"
                  onClick={() => handleSort('appliedDate')}
                  onMouseEnter={() => setHoveredSortHeader('appliedDate')}
                  onMouseLeave={() => setHoveredSortHeader(null)}
                  style={{ 
                    color: '#111827', 
                    borderColor: '#e5e7eb',
                    backgroundColor: hoveredSortHeader === 'appliedDate' ? '#f3f4f6' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-1">
                    {t.colNominationDate}
                    {getSortIcon('appliedDate')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colInterviewDate}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colReferralFee}</th>
                <th className="px-4 py-3 text-center text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center" style={{ color: '#6b7280' }}>
                    {t.loadingData}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center" style={{ color: '#ef4444' }}>
                    {error}
                  </td>
                </tr>
              ) : nominations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center" style={{ color: '#6b7280' }}>
                    {t.noNominationsFound}
                  </td>
                </tr>
              ) : (
                nominations.map((nomination, index) => {
                  const isRowHovered = hoveredTableRow === nomination.id;
                  return (
                <tr
                  key={nomination.id}
                  onMouseEnter={() => setHoveredTableRow(nomination.id)}
                  onMouseLeave={() => setHoveredTableRow(null)}
                  className="transition-colors"
                  style={{
                    backgroundColor: isRowHovered ? '#f9fafb' : 'transparent'
                  }}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => handleSelectRow(index)}
                      className="w-4 h-4 rounded"
                      style={{ 
                        accentColor: '#dc2626',
                        borderColor: '#d1d5db'
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/agent/nominations/${nomination.id}`)}
                      onMouseEnter={() => setHoveredViewButton(`id-${nomination.id}`)}
                      onMouseLeave={() => setHoveredViewButton(null)}
                      className="font-medium text-xs flex items-center gap-1 transition-colors"
                      style={{
                        color: hoveredViewButton === `id-${nomination.id}` ? '#1e40af' : '#2563eb'
                      }}
                    >
                      {nomination.id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0" style={{ backgroundColor: '#a855f7' }}>
                        {nomination.candidateName && nomination.candidateName !== '—' ? nomination.candidateName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        {nomination.cvId ? (
                          <button
                            onClick={() => navigate(`/agent/candidates/${nomination.cvId}`)}
                            onMouseEnter={() => setHoveredViewButton(`candidate-${nomination.id}`)}
                            onMouseLeave={() => setHoveredViewButton(null)}
                            className="text-sm font-semibold truncate block w-full text-left transition-colors"
                            title={nomination.candidateName}
                            style={{
                              color: hoveredViewButton === `candidate-${nomination.id}` ? '#2563eb' : '#111827'
                            }}
                          >
                            {nomination.candidateName}
                          </button>
                        ) : (
                          <span className="text-sm font-semibold truncate block" style={{ color: '#111827' }} title={nomination.candidateName}>
                            {nomination.candidateName}
                          </span>
                        )}
                        <p className="text-xs truncate" style={{ color: '#6b7280' }}>{nomination.candidateId}</p>
                        {(unreadByJobApplication[nomination.id] || 0) > 0 && (
                          <span
                            className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                            style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
title={t.unreadMessageTitle}
                            >
                            {unreadByJobApplication[nomination.id]} {t.unreadMessages}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {nomination.jobId ? (
                      <button
                        onClick={() => navigate(`/agent/jobs/${nomination.jobId}${nomination.jobSlug ? `?slug=${nomination.jobSlug}` : ''}`)}
                        onMouseEnter={() => setHoveredViewButton(`job-${nomination.id}`)}
                        onMouseLeave={() => setHoveredViewButton(null)}
                        className="text-left block transition-colors"
                        title={nomination.jobTitle}
                        style={{
                          color: hoveredViewButton === `job-${nomination.id}` ? '#2563eb' : '#111827'
                        }}
                      >
                        <span className="text-xs font-medium line-clamp-2 block">
                          {truncateText(nomination.jobTitle, 48)}
                        </span>
                        <span className="text-[10px] block mt-0.5" style={{ color: '#6b7280' }}>
                          {nomination.companyName}
                        </span>
                      </button>
                    ) : (
                      <div className="text-left block">
                        <span className="text-xs font-medium line-clamp-2 block" style={{ color: '#111827' }} title={nomination.jobTitle}>
                          {truncateText(nomination.jobTitle, 48)}
                        </span>
                        <span className="text-[10px] block mt-0.5" style={{ color: '#6b7280' }}>
                          {nomination.companyName}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={getStatusColor(nomination.status)}>
                      {getStatusIcon(nomination.status)}
                      {nomination.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>
                    {nomination.appliedDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {new Date(nomination.appliedDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>
                    {nomination.interviewDate && nomination.interviewDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {new Date(nomination.interviewDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#111827' }}>
                      <DollarSign className="w-3 h-3" style={{ color: '#16a34a' }} />
                      {nomination.referralFee > 0 ? `${nomination.referralFee.toLocaleString('vi-VN')}đ` : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/agent/nominations/${nomination.id}`)}
                        onMouseEnter={() => setHoveredViewButton(`view-${nomination.id}`)}
                        onMouseLeave={() => setHoveredViewButton(null)}
                        className="p-1 rounded transition-colors"
                        title={t.viewDetail}
                        style={{
                          color: hoveredViewButton === `view-${nomination.id}` ? '#1e40af' : '#2563eb',
                          backgroundColor: hoveredViewButton === `view-${nomination.id}` ? '#eff6ff' : 'transparent'
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onMouseEnter={() => setHoveredMoreButton(nomination.id)}
                        onMouseLeave={() => setHoveredMoreButton(null)}
                        className="p-1 rounded transition-colors"
                        style={{
                          color: hoveredMoreButton === nomination.id ? '#1f2937' : '#4b5563',
                          backgroundColor: hoveredMoreButton === nomination.id ? '#f3f4f6' : 'transparent'
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
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

export default NominationsPage;
