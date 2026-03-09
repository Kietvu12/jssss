import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
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
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  Building2,
  Download,
} from 'lucide-react';


const PaymentHistoryPage = () => {
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
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });

  // Hover states
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredExportButton, setHoveredExportButton] = useState(false);
  const [hoveredPaginationButton, setHoveredPaginationButton] = useState(null);
  const [hoveredTableRow, setHoveredTableRow] = useState(null);
  const [hoveredViewButton, setHoveredViewButton] = useState(null);
  const [hoveredMoreButton, setHoveredMoreButton] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [focusedSelect, setFocusedSelect] = useState(null);

  const mapStatus = (status) => {
    const statusMap = {
      0: { key: 'pending', label: t.paymentStatusPending },
      1: { key: 'approved', label: t.paymentStatusApproved },
      2: { key: 'rejected', label: t.paymentStatusRejected },
      3: { key: 'paid', label: t.paymentStatusPaid },
    };
    return statusMap[status] ?? { key: 'pending', label: t.paymentStatusPending };
  };

  // Map status từ string sang số (cho filter)
  const mapStatusToNumber = (statusString) => {
    const statusMap = {
      'pending': 0,
      'approved': 1,
      'rejected': 2,
      'paid': 3,
    };
    return statusMap[statusString] !== undefined ? statusMap[statusString] : '';
  };

  // Load payments từ API
  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      if (statusFilter) {
        params.status = mapStatusToNumber(statusFilter);
      }

      if (dateFrom) {
        params.startDate = dateFrom;
      }

      if (dateTo) {
        params.endDate = dateTo;
      }

      const response = await apiService.getPaymentRequests(params);

      if (response.success && response.data) {
        // Map dữ liệu từ API sang format của component
        const mappedPayments = response.data.paymentRequests.map((payment) => {
          const statusInfo = mapStatus(payment.status);
          return {
            id: payment.id,
            requestId: payment.id.toString(), // Sử dụng ID làm requestId
            candidateName: payment.jobApplication?.cv?.fullName || payment.jobApplication?.name || '—',
            candidateId: payment.jobApplication?.cv?.code || '—',
            jobTitle: payment.jobApplication?.job?.title || '—',
            jobId: payment.jobApplication?.jobId,
            companyName: payment.jobApplication?.job?.company?.name || payment.jobApplication?.job?.companyName || '—',
            applicationId: payment.jobApplicationId,
            amount: payment.amount || 0,
            status: statusInfo.key,
            statusLabel: statusInfo.label,
            requestDate: payment.createdAt || payment.created_at,
            approvedDate: payment.approvedAt || payment.approved_at || '—',
            paidDate: payment.status === 3 ? (payment.updatedAt || payment.updated_at || '—') : '—',
            paymentMethod: payment.paymentMethod || payment.payment_method || '—',
            cvId: payment.jobApplication?.cvId || payment.jobApplication?.cv?.id,
            jobSlug: payment.jobApplication?.job?.slug,
          };
        });

        setPayments(mappedPayments);
        setPagination(response.data.pagination || {
          total: 0,
          page: currentPage,
          limit: itemsPerPage,
          totalPages: 1
        });
      } else {
        setError(response.message || t.errorLoadPaymentHistory);
        setPayments([]);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      setError(err.message || t.errorLoadPaymentHistoryGeneric);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [currentPage, itemsPerPage, statusFilter, dateFrom, dateTo]);

  const totalItems = pagination.total;
  const totalPages = pagination.totalPages;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#fef9c3', color: '#854d0e' };
      case 'approved':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'paid':
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
      case 'approved':
        return <AlertCircle className="w-4 h-4" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(payments.map((_, index) => index)));
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
    loadPayments();
  };

  const totalAmount = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'approved' || p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

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
                placeholder={t.paymentSearchPlaceholder}
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
          <button 
            onMouseEnter={() => setHoveredExportButton(true)}
            onMouseLeave={() => setHoveredExportButton(false)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            style={{
              backgroundColor: hoveredExportButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            <Download className="w-4 h-4" />
            {t.exportExcel}
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
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none"
              style={{
                borderColor: focusedSelect === 'status' ? '#dc2626' : '#d1d5db',
                boxShadow: focusedSelect === 'status' ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : 'none'
              }}
            >
              <option value="">{t.all}</option>
              <option value="pending">{t.paymentStatusPending}</option>
              <option value="approved">{t.paymentStatusApproved}</option>
              <option value="paid">{t.paymentStatusPaid}</option>
              <option value="rejected">{t.paymentStatusRejected}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold" style={{ color: '#111827' }}>{t.dateFromLabel}</label>
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
            <label className="text-sm font-bold" style={{ color: '#111827' }}>{t.dateToLabel}</label>
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

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex items-center gap-6 flex-wrap" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" style={{ color: '#16a34a' }} />
            <div>
              <p className="text-xs" style={{ color: '#4b5563' }}>{t.totalPaid}</p>
              <p className="text-lg font-bold" style={{ color: '#16a34a' }}>
                {totalAmount.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: '#ca8a04' }} />
            <div>
              <p className="text-xs" style={{ color: '#4b5563' }}>{t.pendingPayment}</p>
              <p className="text-lg font-bold" style={{ color: '#ca8a04' }}>
                {pendingAmount.toLocaleString('vi-VN')}đ
              </p>
            </div>
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
            let pageNum;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else {
              if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
            }
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
                    checked={selectedRows.size === payments.length && payments.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded"
                    style={{ 
                      accentColor: '#dc2626',
                      borderColor: '#d1d5db'
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colId}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.requestCode}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colCandidate}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colJob}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.company}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.amountLabel}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.statusLabel}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.requestDate}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.approvedDate}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.paidDate}</th>
                <th className="px-4 py-3 text-left text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.paymentMethod}</th>
                <th className="px-4 py-3 text-center text-xs font-bold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center" style={{ color: '#6b7280' }}>
                    {t.loadingData}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center" style={{ color: '#ef4444' }}>
                    {error}
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center" style={{ color: '#6b7280' }}>
                    {t.noPaymentRequests}
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => {
                  const isRowHovered = hoveredTableRow === payment.id;
                  return (
                <tr
                  key={payment.id}
                  onMouseEnter={() => setHoveredTableRow(payment.id)}
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
                      onClick={() => navigate(`/agent/payment-history/${payment.id}`)}
                      onMouseEnter={() => setHoveredViewButton(`id-${payment.id}`)}
                      onMouseLeave={() => setHoveredViewButton(null)}
                      className="font-medium text-xs flex items-center gap-1 transition-colors"
                      style={{
                        color: hoveredViewButton === `id-${payment.id}` ? '#1e40af' : '#2563eb'
                      }}
                    >
                      {payment.id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/agent/nominations/${payment.applicationId}`)}
                      onMouseEnter={() => setHoveredViewButton(`request-${payment.id}`)}
                      onMouseLeave={() => setHoveredViewButton(null)}
                      className="font-medium text-xs transition-colors"
                      style={{
                        color: hoveredViewButton === `request-${payment.id}` ? '#1e40af' : '#2563eb'
                      }}
                    >
                      {payment.requestId}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{ backgroundColor: '#a855f7' }}>
                        {payment.candidateName.charAt(0)}
                      </div>
                      <div>
                        {payment.cvId ? (
                          <button
                            onClick={() => navigate(`/agent/candidates/${payment.cvId}`)}
                            onMouseEnter={() => setHoveredViewButton(`candidate-${payment.id}`)}
                            onMouseLeave={() => setHoveredViewButton(null)}
                            className="text-sm font-semibold transition-colors"
                            style={{
                              color: hoveredViewButton === `candidate-${payment.id}` ? '#2563eb' : '#111827'
                            }}
                          >
                            {payment.candidateName}
                          </button>
                        ) : (
                          <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                            {payment.candidateName}
                          </span>
                        )}
                        <p className="text-xs" style={{ color: '#6b7280' }}>{payment.candidateId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {payment.jobId ? (
                      <button
                        onClick={() => navigate(`/agent/jobs/${payment.jobId}${payment.jobSlug ? `?slug=${payment.jobSlug}` : ''}`)}
                        onMouseEnter={() => setHoveredViewButton(`job-${payment.id}`)}
                        onMouseLeave={() => setHoveredViewButton(null)}
                        className="text-sm font-medium flex items-center gap-1 transition-colors"
                        style={{
                          color: hoveredViewButton === `job-${payment.id}` ? '#2563eb' : '#111827'
                        }}
                      >
                        <Briefcase className="w-3 h-3" />
                        {payment.jobTitle}
                      </button>
                    ) : (
                      <span className="text-sm font-medium flex items-center gap-1" style={{ color: '#111827' }}>
                        <Briefcase className="w-3 h-3" />
                        {payment.jobTitle}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm" style={{ color: '#374151' }}>
                      <Building2 className="w-3 h-3" style={{ color: '#9ca3af' }} />
                      {payment.companyName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm font-bold" style={{ color: '#111827' }}>
                      <DollarSign className="w-4 h-4" style={{ color: '#16a34a' }} />
                      {payment.amount.toLocaleString('vi-VN')}đ
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={getStatusColor(payment.status)}>
                      {getStatusIcon(payment.status)}
                      {payment.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>
                    {payment.requestDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {new Date(payment.requestDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>
                    {payment.approvedDate && payment.approvedDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {new Date(payment.approvedDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>
                    {payment.paidDate && payment.paidDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {new Date(payment.paidDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>{payment.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/agent/payment-history/${payment.id}`)}
                        onMouseEnter={() => setHoveredViewButton(`view-${payment.id}`)}
                        onMouseLeave={() => setHoveredViewButton(null)}
                        className="p-1 rounded transition-colors"
                        title={t.viewDetail}
                        style={{
                          color: hoveredViewButton === `view-${payment.id}` ? '#1e40af' : '#2563eb',
                          backgroundColor: hoveredViewButton === `view-${payment.id}` ? '#eff6ff' : 'transparent'
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onMouseEnter={() => setHoveredMoreButton(payment.id)}
                        onMouseLeave={() => setHoveredMoreButton(null)}
                        className="p-1 rounded transition-colors"
                        style={{
                          color: hoveredMoreButton === payment.id ? '#1f2937' : '#4b5563',
                          backgroundColor: hoveredMoreButton === payment.id ? '#f3f4f6' : 'transparent'
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

export default PaymentHistoryPage;
