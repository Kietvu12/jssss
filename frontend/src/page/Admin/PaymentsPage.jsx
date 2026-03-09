import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Filter,
  ExternalLink,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  User,
  Briefcase,
  Building2,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

const pickByLanguage = (viText, enText, jpText, lang) => {
  if (lang === 'en') return enText || viText || '';
  if (lang === 'ja') return jpText || enText || viText || '';
  return viText || enText || jpText || '';
};

const getPaymentStatusLabel = (statusKey, t) => {
  const map = {
    pending: t.paymentStatusPending,
    approved: t.paymentStatusApproved,
    rejected: t.paymentStatusRejected,
    paid: t.paymentStatusPaid,
  };
  return map[statusKey] || t.paymentStatusPending;
};

const PaymentsPage = () => {
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
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  // Hover states
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredExportButton, setHoveredExportButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredIdLinkIndex, setHoveredIdLinkIndex] = useState(null);
  const [hoveredRequestIdLinkIndex, setHoveredRequestIdLinkIndex] = useState(null);
  const [hoveredCollaboratorLinkIndex, setHoveredCollaboratorLinkIndex] = useState(null);
  const [hoveredCandidateLinkIndex, setHoveredCandidateLinkIndex] = useState(null);
  const [hoveredJobLinkIndex, setHoveredJobLinkIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredApproveButtonIndex, setHoveredApproveButtonIndex] = useState(null);
  const [hoveredRejectButtonIndex, setHoveredRejectButtonIndex] = useState(null);
  const [hoveredMarkAsPaidButtonIndex, setHoveredMarkAsPaidButtonIndex] = useState(null);
  const [hoveredMoreButtonIndex, setHoveredMoreButtonIndex] = useState(null);

  // Modal state cho Approve / Reject / MarkAsPaid
  const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject' | 'markPaid' | null
  const [modalPayment, setModalPayment] = useState(null);
  const [modalAmount, setModalAmount] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [modalRejectedReason, setModalRejectedReason] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const openModal = (action, payment) => {
    setModalAction(action);
    setModalPayment(payment);
    setModalAmount(String(payment?.amount ?? ''));
    setModalNote('');
    setModalRejectedReason('');
  };

  const closeModal = () => {
    setModalAction(null);
    setModalPayment(null);
    setModalAmount('');
    setModalNote('');
    setModalRejectedReason('');
  };

  // Map status từ số sang string (0: pending, 1: approved, 2: rejected, 3: paid)
  const mapStatus = (status) => {
    const statusMap = {
      0: 'pending',
      1: 'approved',
      2: 'rejected',
      3: 'paid',
    };
    return statusMap[status] ?? 'pending';
  };

  // Load payment requests từ API
  const loadPaymentRequests = async () => {
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

      if (statusFilter) {
        // Map từ string sang số
        const statusMap = {
          'pending': 0,
          'approved': 1,
          'rejected': 2,
          'paid': 3,
        };
        params.status = statusMap[statusFilter] !== undefined ? statusMap[statusFilter] : '';
      }

      if (dateFrom) {
        params.approvedFrom = dateFrom;
      }

      if (dateTo) {
        params.approvedTo = dateTo;
      }

      const response = await apiService.getAdminPaymentRequests(params);

      if (response.success && response.data) {
        const job = (p) => p.jobApplication?.job;
        const rc = (p) => job(p)?.recruitingCompany || job(p)?.company;
        const mappedPayments = response.data.paymentRequests.map((payment) => {
          const statusKey = mapStatus(payment.status);
          const j = job(payment);
          const r = rc(payment);
          const jobTitle = pickByLanguage(
            j?.title,
            j?.titleEn || j?.title_en,
            j?.titleJp || j?.title_jp,
            language
          );
          const companyName = pickByLanguage(
            r?.companyName || r?.name,
            r?.companyNameEn || r?.company_name_en,
            r?.companyNameJp || r?.company_name_jp,
            language
          );
          return {
            id: payment.id,
            requestId: payment.id.toString(),
            collaboratorName: payment.collaborator?.name || '—',
            collaboratorId: payment.collaboratorId,
            candidateName: payment.jobApplication?.cv?.name || payment.jobApplication?.cv?.fullName || '—',
            candidateId: payment.jobApplication?.cv?.code || '—',
            jobTitle: jobTitle || '—',
            jobId: payment.jobApplication?.jobId,
            companyName: companyName || '—',
            applicationId: payment.jobApplicationId,
            amount: parseFloat(payment.amount) || 0,
            status: statusKey,
            requestDate: payment.createdAt || payment.created_at,
            approvedDate: payment.approvedAt || payment.approved_at || '—',
            paidDate: payment.status === 3 ? (payment.updatedAt || payment.updated_at || '—') : '—',
            paymentMethod: '—',
            cvId: payment.jobApplication?.cvId || payment.jobApplication?.cv?.id,
          };
        });

        setPaymentRequests(mappedPayments);
        setPagination(response.data.pagination || {
          total: 0,
          page: currentPage,
          limit: itemsPerPage,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading payment requests:', error);
      setPaymentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentRequests();
  }, [currentPage, itemsPerPage, statusFilter, dateFrom, dateTo, language]);

  // Sample data - payment requests (fallback)
  const samplePaymentRequests = [
    {
      id: 'PAY001',
      requestId: 'REQ001',
      collaboratorName: 'Nguyen Thi X',
      collaboratorId: 'CTV001',
      candidateName: 'Nguyen Van A',
      candidateId: '00044572',
      jobTitle: 'Software Engineer',
      jobId: 'JOB001',
      companyName: 'Tech Company A',
      applicationId: 'APP001',
      amount: 500000,
      status: 'paid',
      statusLabel: 'Đã thanh toán',
      requestDate: '2025-01-10',
      approvedDate: '2025-01-12',
      paidDate: '2025-01-15',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: 'PAY002',
      requestId: 'REQ002',
      collaboratorName: 'Tran Van Y',
      collaboratorId: 'CTV002',
      candidateName: 'Tran Thi B',
      candidateId: '00044064',
      jobTitle: 'Project Manager',
      jobId: 'JOB002',
      companyName: 'Business Corp',
      applicationId: 'APP002',
      amount: 800000,
      status: 'paid',
      statusLabel: 'Đã thanh toán',
      requestDate: '2025-01-08',
      approvedDate: '2025-01-10',
      paidDate: '2025-01-13',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: 'PAY003',
      requestId: 'REQ003',
      collaboratorName: 'Le Thi Z',
      collaboratorId: 'CTV003',
      candidateName: 'Le Van C',
      candidateId: '00043293',
      jobTitle: 'Frontend Developer',
      jobId: 'JOB003',
      companyName: 'Web Solutions',
      applicationId: 'APP003',
      amount: 600000,
      status: 'approved',
      statusLabel: 'Đã duyệt',
      requestDate: '2025-01-15',
      approvedDate: '2025-01-18',
      paidDate: '—',
      paymentMethod: '—',
    },
    {
      id: 'PAY004',
      requestId: 'REQ004',
      collaboratorName: 'Nguyen Thi X',
      collaboratorId: 'CTV001',
      candidateName: 'Pham Thi D',
      candidateId: '00043103',
      jobTitle: 'Backend Developer',
      jobId: 'JOB004',
      companyName: 'Tech Startup',
      applicationId: 'APP004',
      amount: 700000,
      status: 'pending',
      statusLabel: 'Chờ duyệt',
      requestDate: '2025-01-20',
      approvedDate: '—',
      paidDate: '—',
      paymentMethod: '—',
    },
    {
      id: 'PAY005',
      requestId: 'REQ005',
      collaboratorName: 'Pham Van W',
      collaboratorId: 'CTV004',
      candidateName: 'Hoang Van E',
      candidateId: '00042979',
      jobTitle: 'DevOps Engineer',
      jobId: 'JOB005',
      companyName: 'Cloud Services',
      applicationId: 'APP005',
      amount: 550000,
      status: 'rejected',
      statusLabel: 'Đã từ chối',
      requestDate: '2025-01-12',
      approvedDate: '—',
      paidDate: '—',
      paymentMethod: '—',
    },
    {
      id: 'PAY006',
      requestId: 'REQ006',
      collaboratorName: 'Tran Van Y',
      collaboratorId: 'CTV002',
      candidateName: 'Vu Thi F',
      candidateId: '00042966',
      jobTitle: 'UI/UX Designer',
      jobId: 'JOB006',
      companyName: 'Design Studio',
      applicationId: 'APP006',
      amount: 650000,
      status: 'paid',
      statusLabel: 'Đã thanh toán',
      requestDate: '2025-01-05',
      approvedDate: '2025-01-07',
      paidDate: '2025-01-10',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: 'PAY007',
      requestId: 'REQ007',
      collaboratorName: 'Hoang Thi V',
      collaboratorId: 'CTV005',
      candidateName: 'Dao Van G',
      candidateId: '00042950',
      jobTitle: 'Data Analyst',
      jobId: 'JOB007',
      companyName: 'Data Corp',
      applicationId: 'APP007',
      amount: 750000,
      status: 'paid',
      statusLabel: 'Đã thanh toán',
      requestDate: '2025-01-03',
      approvedDate: '2025-01-05',
      paidDate: '2025-01-08',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: 'PAY008',
      requestId: 'REQ008',
      collaboratorName: 'Le Thi Z',
      collaboratorId: 'CTV003',
      candidateName: 'Bui Thi H',
      candidateId: '00042949',
      jobTitle: 'QA Engineer',
      jobId: 'JOB008',
      companyName: 'Quality Assurance Inc',
      applicationId: 'APP008',
      amount: 500000,
      status: 'approved',
      statusLabel: 'Đã duyệt',
      requestDate: '2025-01-18',
      approvedDate: '2025-01-20',
      paidDate: '—',
      paymentMethod: '—',
    },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  // Statistics - tính từ dữ liệu thực tế
  const totalPaid = paymentRequests
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = paymentRequests
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalApproved = paymentRequests
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRejected = paymentRequests
    .filter(p => p.status === 'rejected')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendingCount = paymentRequests.filter(p => p.status === 'pending').length;
  const totalApprovedCount = paymentRequests.filter(p => p.status === 'approved').length;

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
        return <Clock className="w-3.5 h-3.5" />;
      case 'approved':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'paid':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(paymentRequests.map((_, index) => index)));
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
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadPaymentRequests();
  };

  const handleSubmitModal = async () => {
    if (!modalPayment || !modalAction) return;
    const id = modalPayment.id;
    if (modalAction === 'reject' && (!modalRejectedReason || !modalRejectedReason.trim())) {
      alert(t.pleaseEnterRejectReason);
      return;
    }
    try {
      setModalLoading(true);
      let response;
      if (modalAction === 'approve') {
        response = await apiService.approvePaymentRequest(id, modalNote, modalAmount ? parseFloat(modalAmount) : undefined);
      } else if (modalAction === 'reject') {
        response = await apiService.rejectPaymentRequest(id, modalRejectedReason.trim(), modalNote);
      } else if (modalAction === 'markPaid') {
        response = await apiService.markPaymentRequestAsPaid(id, modalNote, modalAmount ? parseFloat(modalAmount) : undefined);
      }
      if (response?.success) {
        alert(modalAction === 'approve' ? t.approvePaymentSuccess : modalAction === 'reject' ? t.rejectPaymentSuccess : t.markPaidSuccess);
        closeModal();
        loadPaymentRequests();
      } else {
        alert(response?.message || t.errorOccurred);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || t.errorOccurred);
    } finally {
      setModalLoading(false);
    }
  };

  const dateLocale = language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN';

  const handleApprove = (payment) => openModal('approve', payment);
  const handleReject = (payment) => openModal('reject', payment);
  const handleMarkAsPaid = (payment) => openModal('markPaid', payment);

  const filteredPayments = paymentRequests;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: '#4b5563' }}>{t.totalPaid}</p>
              <p className="text-lg font-bold" style={{ color: '#16a34a' }}>
                {totalPaid.toLocaleString(dateLocale)}đ
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>
                {paymentRequests.filter(p => p.status === 'paid').length} {t.paymentRequestsCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
              <CheckCircle className="w-6 h-6" style={{ color: '#16a34a' }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: '#4b5563' }}>{t.paymentStatPending}</p>
              <p className="text-lg font-bold" style={{ color: '#ca8a04' }}>
                {totalPending.toLocaleString(dateLocale)}đ
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>
                {totalPendingCount} {t.paymentRequestsCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fef9c3' }}>
              <Clock className="w-6 h-6" style={{ color: '#ca8a04' }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: '#4b5563' }}>{t.paymentStatApprovedAwaiting}</p>
              <p className="text-lg font-bold" style={{ color: '#2563eb' }}>
                {totalApproved.toLocaleString(dateLocale)}đ
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>
                {totalApprovedCount} {t.paymentRequestsCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
              <AlertCircle className="w-6 h-6" style={{ color: '#2563eb' }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: '#4b5563' }}>{t.paymentStatRejected}</p>
              <p className="text-lg font-bold" style={{ color: '#dc2626' }}>
                {totalRejected.toLocaleString(dateLocale)}đ
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>
                {paymentRequests.filter(p => p.status === 'rejected').length} {t.paymentRequestsCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fee2e2' }}>
              <XCircle className="w-6 h-6" style={{ color: '#dc2626' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="rounded-lg p-3 border mb-3 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder={t.paymentsPageSearchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 border rounded-lg text-xs"
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
          </div>
          <button
            onClick={handleSearch}
            onMouseEnter={() => setHoveredSearchButton(true)}
            onMouseLeave={() => setHoveredSearchButton(false)}
            className="px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredSearchButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            <Search className="w-3.5 h-3.5" />
            {t.searchButton}
          </button>
          <button
            onClick={handleReset}
            onMouseEnter={() => setHoveredResetButton(true)}
            onMouseLeave={() => setHoveredResetButton(false)}
            className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors"
            style={{
              backgroundColor: hoveredResetButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            {t.resetButton}
          </button>
          <button
            onMouseEnter={() => setHoveredExportButton(true)}
            onMouseLeave={() => setHoveredExportButton(false)}
            className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredExportButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            <Download className="w-3.5 h-3.5" />
            {t.exportExcel}
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.statusFilterLabel}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="pending">{t.paymentStatusPending}</option>
              <option value="approved">{t.paymentStatusApproved}</option>
              <option value="paid">{t.paymentStatusPaid}</option>
              <option value="rejected">{t.paymentStatusRejected}</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.dateFromShort}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
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
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.dateToShort}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
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
            onMouseEnter={() => currentPage < totalPages && setHoveredPaginationNavButton('next')}
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
            onMouseEnter={() => currentPage < totalPages && setHoveredPaginationNavButton('last')}
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
          <span className="text-xs font-semibold" style={{ color: '#374151' }}>{totalItems} {t.itemsCount}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-lg border min-h-0 relative" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-3 py-2 text-center text-xs font-semibold border-b w-10" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredPayments.length && filteredPayments.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded"
                    style={{
                      accentColor: '#2563eb',
                      borderColor: '#d1d5db'
                    }}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colId}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colRequestCode}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colCtv}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colCandidate}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colJob}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colCompany}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colAmount}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colStatus}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colRequestDate}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colApprovedDate}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colPaidDate}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colPaymentMethod}</th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    {t.loadingData}
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className="transition-colors"
                  style={{
                    backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                  }}
                  onMouseEnter={() => setHoveredRowIndex(index)}
                  onMouseLeave={() => setHoveredRowIndex(null)}
                >
                  <td className="px-3 py-2 text-center">
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
                    <button
                      onClick={() => navigate(`/admin/payments/${payment.id}`)}
                      onMouseEnter={() => setHoveredIdLinkIndex(index)}
                      onMouseLeave={() => setHoveredIdLinkIndex(null)}
                      className="font-medium text-xs flex items-center gap-1"
                      style={{
                        color: hoveredIdLinkIndex === index ? '#1e40af' : '#2563eb'
                      }}
                    >
                      {payment.id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => navigate(`/admin/nominations/${payment.applicationId}`)}
                      onMouseEnter={() => setHoveredRequestIdLinkIndex(index)}
                      onMouseLeave={() => setHoveredRequestIdLinkIndex(null)}
                      className="font-medium text-xs"
                      style={{
                        color: hoveredRequestIdLinkIndex === index ? '#1e40af' : '#2563eb'
                      }}
                    >
                      {payment.requestId}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => navigate(`/admin/collaborators/${payment.collaboratorId}`)}
                      onMouseEnter={() => setHoveredCollaboratorLinkIndex(index)}
                      onMouseLeave={() => setHoveredCollaboratorLinkIndex(null)}
                      className="text-xs font-medium flex items-center gap-1"
                      style={{
                        color: hoveredCollaboratorLinkIndex === index ? '#1e40af' : '#2563eb'
                      }}
                    >
                      <Users className="w-3 h-3" />
                      {payment.collaboratorName}
                    </button>
                    <p className="text-[10px]" style={{ color: '#6b7280' }}>{payment.collaboratorId}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-[10px]" style={{ backgroundColor: '#a855f7' }}>
                        {payment.candidateName.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => navigate(`/admin/candidates/${payment.candidateId}`)}
                          onMouseEnter={() => setHoveredCandidateLinkIndex(index)}
                          onMouseLeave={() => setHoveredCandidateLinkIndex(null)}
                          className="text-xs font-semibold"
                          style={{
                            color: hoveredCandidateLinkIndex === index ? '#2563eb' : '#111827'
                          }}
                        >
                          {payment.candidateName}
                        </button>
                        <p className="text-[10px]" style={{ color: '#6b7280' }}>{payment.candidateId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => navigate(`/admin/jobs/${payment.jobId}`)}
                      onMouseEnter={() => setHoveredJobLinkIndex(index)}
                      onMouseLeave={() => setHoveredJobLinkIndex(null)}
                      className="text-xs font-medium flex items-center gap-1"
                      style={{
                        color: hoveredJobLinkIndex === index ? '#2563eb' : '#111827'
                      }}
                    >
                      <Briefcase className="w-3 h-3" />
                      {payment.jobTitle}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#374151' }}>
                      <Building2 className="w-3 h-3" style={{ color: '#9ca3af' }} />
                      {payment.companyName}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#111827' }}>
                      <DollarSign className="w-3 h-3" style={{ color: '#16a34a' }} />
                      {payment.amount.toLocaleString(dateLocale)}đ
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={getStatusColor(payment.status)}>
                      {getStatusIcon(payment.status)}
                      {getPaymentStatusLabel(payment.status, t)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                      {new Date(payment.requestDate).toLocaleDateString(dateLocale)}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                    {payment.approvedDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {new Date(payment.approvedDate).toLocaleDateString(dateLocale)}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                    {payment.paidDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {new Date(payment.paidDate).toLocaleDateString(dateLocale)}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                    {payment.paymentMethod === 'Chuyển khoản' || payment.paymentMethod === 'Bank transfer' || payment.paymentMethod === '振込' ? t.paymentMethodBankTransfer : payment.paymentMethod}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/payments/${payment.id}`)}
                        onMouseEnter={() => setHoveredViewButtonIndex(index)}
                        onMouseLeave={() => setHoveredViewButtonIndex(null)}
                        className="p-1 rounded transition-colors"
                        style={{
                          color: hoveredViewButtonIndex === index ? '#1e40af' : '#2563eb',
                          backgroundColor: hoveredViewButtonIndex === index ? '#eff6ff' : 'transparent'
                        }}
                        title={t.viewDetailTooltip}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(payment)}
                            onMouseEnter={() => setHoveredApproveButtonIndex(index)}
                            onMouseLeave={() => setHoveredApproveButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredApproveButtonIndex === index ? '#15803d' : '#16a34a',
                              backgroundColor: hoveredApproveButtonIndex === index ? '#dcfce7' : 'transparent'
                            }}
                            title={t.approveTooltip}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReject(payment)}
                            onMouseEnter={() => setHoveredRejectButtonIndex(index)}
                            onMouseLeave={() => setHoveredRejectButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredRejectButtonIndex === index ? '#991b1b' : '#dc2626',
                              backgroundColor: hoveredRejectButtonIndex === index ? '#fee2e2' : 'transparent'
                            }}
                            title={t.rejectTooltip}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {payment.status === 'approved' && (
                        <button
                          onClick={() => handleMarkAsPaid(payment)}
                          onMouseEnter={() => setHoveredMarkAsPaidButtonIndex(index)}
                          onMouseLeave={() => setHoveredMarkAsPaidButtonIndex(null)}
                          className="p-1 rounded transition-colors"
                          style={{
                            color: hoveredMarkAsPaidButtonIndex === index ? '#15803d' : '#16a34a',
                            backgroundColor: hoveredMarkAsPaidButtonIndex === index ? '#dcfce7' : 'transparent'
                          }}
                          title={t.markAsPaidTooltip}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onMouseEnter={() => setHoveredMoreButtonIndex(index)}
                        onMouseLeave={() => setHoveredMoreButtonIndex(null)}
                        className="p-1 rounded transition-colors"
                        style={{
                          color: hoveredMoreButtonIndex === index ? '#1f2937' : '#4b5563',
                          backgroundColor: hoveredMoreButtonIndex === index ? '#f3f4f6' : 'transparent'
                        }}
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

      {/* Modal Approve / Reject / MarkAsPaid */}
      {modalAction && modalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="rounded-lg shadow-xl max-w-md w-full p-4 flex flex-col gap-3" style={{ backgroundColor: 'white' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="text-sm font-bold" style={{ color: '#111827' }}>
                {modalAction === 'approve' && t.modalApprovePaymentTitle}
                {modalAction === 'reject' && t.modalRejectPaymentTitle}
                {modalAction === 'markPaid' && t.modalMarkPaidTitle}
              </h3>
              <button onClick={closeModal} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4" style={{ color: '#6b7280' }} />
              </button>
            </div>
            {(modalAction === 'approve' || modalAction === 'markPaid') && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.amountToPayLabel}</label>
                <input
                  type="number"
                  value={modalAmount}
                  onChange={e => setModalAmount(e.target.value)}
                  placeholder={t.placeholderAmountExample}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  style={{ borderColor: '#d1d5db', outline: 'none' }}
                />
              </div>
            )}
            {modalAction === 'reject' && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.rejectReasonRequired} <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea
                  value={modalRejectedReason}
                  onChange={e => setModalRejectedReason(e.target.value)}
                  placeholder={t.placeholderRejectReason}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-xs resize-none"
                  style={{ borderColor: '#d1d5db', outline: 'none' }}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{t.notesOptional}</label>
              <input
                type="text"
                value={modalNote}
                onChange={e => setModalNote(e.target.value)}
                placeholder={t.placeholderNote}
                className="w-full px-3 py-2 border rounded-lg text-xs"
                style={{ borderColor: '#d1d5db', outline: 'none' }}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                {t.cancel}
              </button>
              <button
                onClick={handleSubmitModal}
                disabled={modalLoading || (modalAction === 'reject' && !modalRejectedReason?.trim())}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: modalAction === 'reject' ? '#dc2626' : '#16a34a' }}
              >
                {modalLoading ? t.processing : (modalAction === 'approve' ? t.approveButton : modalAction === 'reject' ? t.rejectButton : t.confirmButton)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
