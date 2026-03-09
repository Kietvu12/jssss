import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import { getJobApplicationStatus, getJobApplicationStatusOptionsByLanguage, getJobApplicationStatusLabelByLanguage, isRejectionOrCancelledStatus } from '../../utils/jobApplicationStatus';
import {
  Search,
  Filter,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Briefcase,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Send,
} from 'lucide-react';

const JOB_TITLE_MAX = 48;
const truncate = (str, max) => (str && str.length > max ? str.slice(0, max) + '…' : str || '—');

const AdminNominationsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const pickByLanguage = (item, fieldBase = 'title') => {
    if (!item) return '';
    const vi = item[fieldBase] || '';
    const en = item[`${fieldBase}En`] || '';
    const ja = item[`${fieldBase}Jp`] || '';
    if (language === 'en') return en || vi;
    if (language === 'ja') return ja || vi;
    return vi;
  };
  const [adminProfile, setAdminProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('applied_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [nominations, setNominations] = useState([]);
  const [unreadByJobApplication, setUnreadByJobApplication] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  /** Chế độ xem: 'myAssigned' = chỉ đơn được phân công cho mình (BackOffice mặc định); 'all' = toàn bộ (chỉ sửa được đơn của mình) */
  const [viewMode, setViewMode] = useState('myAssigned');
  
  // Hover states
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredAddNominationButton, setHoveredAddNominationButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredIdLinkIndex, setHoveredIdLinkIndex] = useState(null);
  const [hoveredCandidateLinkIndex, setHoveredCandidateLinkIndex] = useState(null);
  const [hoveredJobLinkIndex, setHoveredJobLinkIndex] = useState(null);
  const [hoveredCollaboratorLinkIndex, setHoveredCollaboratorLinkIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredEditButtonIndex, setHoveredEditButtonIndex] = useState(null);
  const [hoveredDeleteButtonIndex, setHoveredDeleteButtonIndex] = useState(null);

  const [hoveredMemoButtonIndex, setHoveredMemoButtonIndex] = useState(null);

  // Phân công admin phụ trách
  const [admins, setAdmins] = useState([]);
  const [assigningMap, setAssigningMap] = useState({});

  // Trạng thái thay đổi inline
  const [statusChangeModal, setStatusChangeModal] = useState(false);
  const [statusChangeNomination, setStatusChangeNomination] = useState(null);
  const [statusChangeNewStatus, setStatusChangeNewStatus] = useState(null);
  const [statusChangeRejectNote, setStatusChangeRejectNote] = useState('');
  const [statusChangePaymentAmount, setStatusChangePaymentAmount] = useState('');
  const [statusChangeUpdating, setStatusChangeUpdating] = useState(false);

  const STATUS_PAID = 15;

  // Memo panel state
  const [memoPanelOpen, setMemoPanelOpen] = useState(false);
  const [memoPanelNomination, setMemoPanelNomination] = useState(null);
  const [memos, setMemos] = useState([]);
  const [loadingMemos, setLoadingMemos] = useState(false);
  const [memoError, setMemoError] = useState(null);
  const [memoNote, setMemoNote] = useState('');
  const [memoJobSearch, setMemoJobSearch] = useState('');
  const [memoJobResults, setMemoJobResults] = useState([]);
  const [memoJobsLoading, setMemoJobsLoading] = useState(false);
  const [selectedMemoJobs, setSelectedMemoJobs] = useState([]);
  const [showMemoJobDropdown, setShowMemoJobDropdown] = useState(false);
  const [hoveredMemoJobIndex, setHoveredMemoJobIndex] = useState(null);
  const [savingMemo, setSavingMemo] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState(null);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  useEffect(() => {
    loadNominations();
  }, [currentPage, itemsPerPage, statusFilter, dateFrom, dateTo, sortBy, sortOrder, viewMode, adminProfile?.id]);

  const loadAdminProfile = async () => {
    try {
      const response = await apiService.getAdminProfile();
      if (response.success && response.data) {
        const admin = response.data.admin || response.data;
        setAdminProfile(admin);
        // Super Admin mặc định xem toàn bộ; BackOffice mặc định chỉ đơn được phân công
        if (admin?.role === 1) {
          setViewMode('all');
        }
        // Nếu là Super Admin thì load danh sách AdminBackOffice để phân công
        const role = admin?.role;
        if (role === 1) {
          const adminsRes = await apiService.getAdmins({ role: 2, status: 1 });
          if (adminsRes.success && adminsRes.data) {
            setAdmins(adminsRes.data.admins || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };

  const loadNominations = async () => {
    if (viewMode === 'myAssigned' && !adminProfile?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy === 'candidate_name' ? 'applied_at' : (sortBy || 'applied_at'),
        sortOrder: sortOrder || 'DESC'
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      // Date range filter - sử dụng appliedAt
      // Backend chỉ hỗ trợ filter theo 1 ngày, không hỗ trợ range
      // Có thể dùng dateFrom làm appliedAt filter
      if (dateFrom) {
        params.appliedAt = dateFrom;
      }

      // AdminBackOffice: chế độ "chỉ đơn của tôi" thì lọc theo admin phụ trách
      if (viewMode === 'myAssigned' && adminProfile?.id) {
        params.adminResponsibleId = adminProfile.id;
      }

      const [response, unreadMap] = await Promise.all([
        apiService.getAdminJobApplications(params),
        apiService.getAdminUnreadByJobApplication().catch(() => ({}))
      ]);
      if (response.success && response.data) {
        let list = response.data.jobApplications || response.data.applications || [];
        if (sortBy === 'candidate_name' && list.length > 0) {
          const nameA = (a) => (a.cv?.name || a.name || '').toLowerCase();
          list = [...list].sort((a, b) => {
            const cmp = nameA(a).localeCompare(nameA(b));
            return sortOrder === 'ASC' ? cmp : -cmp;
          });
        }
        setNominations(list);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
        setUnreadByJobApplication(unreadMap || {});
      }
    } catch (error) {
      console.error('Error loading nominations:', error);
      setNominations([]);
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = adminProfile?.role === 1;

  const getStaleWarning = (item) => {
    if (!item || !item.updatedAt) return false;
    if (isRejectionOrCancelledStatus(item.status)) return false;
    const updated = new Date(item.updatedAt).getTime();
    const diffDays = (Date.now() - updated) / (1000 * 60 * 60 * 24);
    return diffDays > 5;
  };

  const openMemoPanel = (nomination) => {
    setMemoPanelNomination(nomination);
    setMemoPanelOpen(true);
    setMemoNote('');
    setMemoJobSearch('');
    setSelectedMemoJobs([]);
    setMemoJobResults([]);
    setEditingMemoId(null);
    loadMemos(nomination.id);
  };

  const closeMemoPanel = () => {
    setMemoPanelOpen(false);
    setMemoPanelNomination(null);
    setMemos([]);
    setMemoError(null);
  };

  const loadMemos = async (jobApplicationId) => {
    if (!jobApplicationId) return;
    try {
      setLoadingMemos(true);
      setMemoError(null);
      const res = await apiService.getAdminJobApplicationMemos(jobApplicationId);
      if (res.success && res.data?.memos) {
        setMemos(res.data.memos);
      } else {
        setMemos([]);
      }
    } catch (e) {
      console.error('Error loading memos:', e);
      setMemoError(e.message || 'Không tải được danh sách memo');
      setMemos([]);
    } finally {
      setLoadingMemos(false);
    }
  };

  const handleSearchMemoJobs = async (query) => {
    const q = (query !== undefined ? query : memoJobSearch) || '';
    if (!q.trim()) {
      setMemoJobResults([]);
      return;
    }
    try {
      setMemoJobsLoading(true);
      setShowMemoJobDropdown(true);
      const res = await apiService.getAdminJobs({
        search: q.trim(),
        limit: 10,
        status: 1
      });
      if (res.success && res.data?.jobs) {
        setMemoJobResults(res.data.jobs);
      } else {
        setMemoJobResults([]);
      }
    } catch (e) {
      console.error('Error searching jobs for memo:', e);
      setMemoJobResults([]);
    } finally {
      setMemoJobsLoading(false);
    }
  };

  const startEditMemo = (memo) => {
    setEditingMemoId(memo.id);
    setMemoNote(memo.note || '');
    if (memo.job) {
      setSelectedMemoJobs([memo.job]);
      setMemoJobSearch(memo.job.title || memo.job.jobCode || '');
    } else {
      setSelectedMemoJobs([]);
      setMemoJobSearch('');
    }
  };

  const resetMemoForm = () => {
    setEditingMemoId(null);
    setMemoNote('');
    setMemoJobSearch('');
    setSelectedMemoJobs([]);
    setMemoJobResults([]);
    setShowMemoJobDropdown(false);
  };

  const handleSaveMemo = async () => {
    if (!memoPanelNomination?.id) return;
    const content = (memoNote || '').trim();
    if (!content) {
      alert('Vui lòng nhập nội dung memo');
      return;
    }
    if (!isSuperAdmin) {
      alert('Chỉ Super Admin mới được tạo/sửa memo');
      return;
    }
    try {
      setSavingMemo(true);
      const jobsToAttach = selectedMemoJobs && selectedMemoJobs.length > 0
        ? selectedMemoJobs.filter((j, idx, arr) => j && arr.findIndex(x => x.id === j.id) === idx)
        : [];

      const requests = [];

      if (editingMemoId) {
        // Cập nhật memo hiện tại với job đầu tiên (hoặc null nếu không chọn job)
        const mainJob = jobsToAttach[0] || null;
        const payloadUpdate = {
          note: content,
          jobId: mainJob ? mainJob.id : null
        };
        requests.push(apiService.updateAdminJobApplicationMemo(memoPanelNomination.id, editingMemoId, payloadUpdate));

        // Nếu chọn thêm job khác ngoài job chính → tạo memo mới cho từng job đó
        if (jobsToAttach.length > 1) {
          for (let i = 1; i < jobsToAttach.length; i += 1) {
            const jobItem = jobsToAttach[i];
            requests.push(
              apiService.createAdminJobApplicationMemo(memoPanelNomination.id, {
                note: content,
                jobId: jobItem.id
              })
            );
          }
        }
      } else {
        if (jobsToAttach.length > 0) {
          // Tạo 1 memo cho mỗi job được chọn
          jobsToAttach.forEach(jobItem => {
            requests.push(
              apiService.createAdminJobApplicationMemo(memoPanelNomination.id, {
                note: content,
                jobId: jobItem.id
              })
            );
          });
        } else {
          // Tạo memo không gắn job
          requests.push(
            apiService.createAdminJobApplicationMemo(memoPanelNomination.id, {
              note: content
            })
          );
        }
      }

      const responses = await Promise.all(requests);
      const anyFailed = responses.some(r => !r || !r.success);

      if (!anyFailed) {
        await loadMemos(memoPanelNomination.id);
        resetMemoForm();
        // Sau khi SuperAdmin cập nhật memo, reload danh sách nomination để cột memo (nếu dùng) đồng bộ
        loadNominations();
      } else {
        alert('Không thể lưu một số memo, vui lòng kiểm tra lại.');
      }
    } catch (e) {
      console.error('Error saving memo:', e);
      alert(e.message || 'Không thể lưu memo');
    } finally {
      setSavingMemo(false);
    }
  };

  const handleAssignAdmin = async (application, adminId) => {
    if (!adminId) return;
    const appId = application.id;
    setAssigningMap(prev => ({ ...prev, [appId]: true }));
    try {
      const payload = { adminResponsibleId: parseInt(adminId, 10) };
      const res = await apiService.updateAdminJobApplication(appId, payload);
      if (!res.success) {
        alert(res.message || t.errorAssignAdmin);
      } else {
        loadNominations();
      }
    } catch (error) {
      console.error('Error assigning admin to job application:', error);
      alert(error.message || t.errorAssignAdmin);
    } finally {
      setAssigningMap(prev => ({ ...prev, [appId]: false }));
    }
  };

  // Map status số → label (theo ngôn ngữ) + value + color cho style và filter
  const getStatusLabel = (status) => {
    const statusInfo = getJobApplicationStatus(status);
    let value = 'pending';
    if (statusInfo.category === 'success') value = 'accepted';
    else if (statusInfo.category === 'rejected' || statusInfo.category === 'cancelled') value = 'rejected';
    else if (statusInfo.category === 'interview') value = 'interviewed';
    const label = getJobApplicationStatusLabelByLanguage(status, language);
    return { label, value, color: statusInfo.color };
  };

  // Sample data - nominations/applications (fallback)
  const sampleNominations = [
    {
      id: 'APP001',
      candidateName: 'Nguyen Van A',
      candidateId: '00044572',
      jobTitle: 'Software Engineer',
      jobId: 'JOB001',
      companyName: 'Tech Company A',
      collaboratorName: 'CTV001',
      status: 'pending',
      statusLabel: 'Đang chờ',
      appliedDate: '2025-01-15',
      interviewDate: '2025-01-20',
      referralFee: 500000,
      salary: '800万円',
    },
    {
      id: 'APP002',
      candidateName: 'Tran Thi B',
      candidateId: '00044064',
      jobTitle: 'Project Manager',
      jobId: 'JOB002',
      companyName: 'Business Corp',
      collaboratorName: 'CTV002',
      status: 'interviewed',
      statusLabel: 'Đã phỏng vấn',
      appliedDate: '2025-01-10',
      interviewDate: '2025-01-18',
      referralFee: 800000,
      salary: '1000万円',
    },
    {
      id: 'APP003',
      candidateName: 'Le Van C',
      candidateId: '00043293',
      jobTitle: 'Frontend Developer',
      jobId: 'JOB003',
      companyName: 'Web Solutions',
      collaboratorName: 'CTV003',
      status: 'accepted',
      statusLabel: 'Đã nhận việc',
      appliedDate: '2025-01-05',
      interviewDate: '2025-01-12',
      referralFee: 600000,
      salary: '750万円',
    },
    {
      id: 'APP004',
      candidateName: 'Pham Thi D',
      candidateId: '00043103',
      jobTitle: 'Backend Developer',
      jobId: 'JOB004',
      companyName: 'Tech Startup',
      collaboratorName: 'CTV001',
      status: 'rejected',
      statusLabel: 'Đã từ chối',
      appliedDate: '2025-01-08',
      interviewDate: '2025-01-15',
      referralFee: 0,
      salary: '—',
    },
    {
      id: 'APP005',
      candidateName: 'Hoang Van E',
      candidateId: '00042979',
      jobTitle: 'DevOps Engineer',
      jobId: 'JOB005',
      companyName: 'Cloud Services',
      collaboratorName: 'CTV004',
      status: 'pending',
      statusLabel: 'Đang chờ',
      appliedDate: '2025-01-20',
      interviewDate: '—',
      referralFee: 700000,
      salary: '900万円',
    },
    {
      id: 'APP006',
      candidateName: 'Vu Thi F',
      candidateId: '00042966',
      jobTitle: 'UI/UX Designer',
      jobId: 'JOB006',
      companyName: 'Design Studio',
      collaboratorName: 'CTV002',
      status: 'interviewed',
      statusLabel: 'Đã phỏng vấn',
      appliedDate: '2025-01-12',
      interviewDate: '2025-01-19',
      referralFee: 550000,
      salary: '700万円',
    },
    {
      id: 'APP007',
      candidateName: 'Dao Van G',
      candidateId: '00042950',
      jobTitle: 'Data Analyst',
      jobId: 'JOB007',
      companyName: 'Data Corp',
      collaboratorName: 'CTV005',
      status: 'accepted',
      statusLabel: 'Đã nhận việc',
      appliedDate: '2025-01-03',
      interviewDate: '2025-01-10',
      referralFee: 650000,
      salary: '850万円',
    },
    {
      id: 'APP008',
      candidateName: 'Bui Thi H',
      candidateId: '00042949',
      jobTitle: 'QA Engineer',
      jobId: 'JOB008',
      companyName: 'Quality Assurance Inc',
      collaboratorName: 'CTV003',
      status: 'pending',
      statusLabel: 'Đang chờ',
      appliedDate: '2025-01-18',
      interviewDate: '—',
      referralFee: 500000,
      salary: '650万円',
    },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  const getStatusColorStyle = (status) => {
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
        return <Clock className="w-3.5 h-3.5" />;
      case 'interviewed':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'accepted':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
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
    loadNominations();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadNominations();
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDeleteNomination.replace('{id}', id))) {
      try {
        const response = await apiService.deleteAdminJobApplication(id);
        if (response.success) {
          alert(t.deleteNominationSuccess);
          loadNominations();
        } else {
          alert(response.message || t.errorDeleteNomination);
        }
      } catch (error) {
        console.error('Error deleting nomination:', error);
        alert(error.message || t.errorDeleteNomination);
      }
    }
  };

  const handleStatusSelectChange = (nomination, newStatusNum) => {
    if (newStatusNum === nomination.status) return;
    if (newStatusNum === STATUS_PAID || isRejectionOrCancelledStatus(newStatusNum)) {
      setStatusChangeNomination(nomination);
      setStatusChangeNewStatus(newStatusNum);
      setStatusChangeRejectNote(nomination.rejectNote || '');
      setStatusChangePaymentAmount('');
      setStatusChangeModal(true);
    } else {
      doUpdateStatus(nomination.id, newStatusNum, null, null);
    }
  };

  const doUpdateStatus = async (id, statusNum, rejectNote, paymentAmount) => {
    try {
      setStatusChangeUpdating(true);
      const response = await apiService.updateJobApplicationStatus(id, statusNum, rejectNote, paymentAmount);
      if (response.success) {
        setStatusChangeModal(false);
        setStatusChangeNomination(null);
        setStatusChangeRejectNote('');
        setStatusChangePaymentAmount('');
        loadNominations();
      } else {
        alert(response.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setStatusChangeUpdating(false);
    }
  };

  const handleStatusChangeModalConfirm = () => {
    if (!statusChangeNomination) return;
    if (statusChangeNewStatus === STATUS_PAID) {
      const amount = parseFloat(statusChangePaymentAmount);
      if (Number.isNaN(amount) || amount < 0) {
        alert('Vui lòng nhập số tiền thanh toán hợp lệ');
        return;
      }
      doUpdateStatus(statusChangeNomination.id, STATUS_PAID, null, amount);
    } else {
      doUpdateStatus(
        statusChangeNomination.id,
        statusChangeNewStatus,
        statusChangeRejectNote.trim() || null,
        null
      );
    }
  };

  const isInterviewStatus = (status) => {
    const info = getStatusLabel(status);
    return info.value === 'interviewed' || (status >= 7 && status <= 9);
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'candidate_name' ? 'ASC' : 'DESC');
    }
    setCurrentPage(1);
  };

  const SortableTh = ({ label, sortKey }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold border-b cursor-pointer select-none hover:bg-gray-100 transition-colors"
      style={{ color: '#111827', borderColor: '#e5e7eb' }}
      onClick={() => toggleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === sortKey && (
          sortOrder === 'ASC' ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#2563eb' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#2563eb' }} />
        )}
      </div>
    </th>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="rounded-lg p-3 border mb-3 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder={t.searchPlaceholderNominations}
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
            {t.reset}
          </button>
          <button
            onClick={() => {
              setViewMode(viewMode === 'myAssigned' ? 'all' : 'myAssigned');
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 border"
            style={{
              backgroundColor: viewMode === 'all' ? '#eff6ff' : 'white',
              color: viewMode === 'all' ? '#1d4ed8' : '#374151',
              borderColor: '#93c5fd'
            }}
            title={viewMode === 'myAssigned' ? t.viewModeTitleAll : t.viewModeTitleMy}
          >
            {viewMode === 'myAssigned'
              ? t.viewAllNominations
              : t.viewMyAssignedOnly}
          </button>
          <button
            onClick={() => navigate('/admin/nominations/create')}
            onMouseEnter={() => setHoveredAddNominationButton(true)}
            onMouseLeave={() => setHoveredAddNominationButton(false)}
            className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredAddNominationButton ? '#eab308' : '#facc15',
              color: '#111827'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addNominationButton}
          </button>
        </div>
        {adminProfile && (
          <p className="text-[11px] mt-1" style={{ color: '#6b7280' }}>
            {viewMode === 'myAssigned'
              ? t.viewingMyAssigned
              : t.viewingAll}
          </p>
        )}

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.statusLabel}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 border rounded text-xs min-w-[200px]"
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
              <option value="">{t.allStatuses}</option>
              {getJobApplicationStatusOptionsByLanguage(language).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.dateFromLabel}</label>
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
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.dateToLabel}</label>
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
          <span className="text-xs font-semibold" style={{ color: '#374151' }}>{totalItems} items</span>
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
                    checked={selectedRows.size === nominations.length && nominations.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded"
                    style={{
                      accentColor: '#2563eb',
                      borderColor: '#d1d5db'
                    }}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colId}</th>
                <SortableTh label={t.colCandidate} sortKey="candidate_name" />
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colJob}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colAdminResponsible}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colStatus}</th>
                <SortableTh label={t.colNominationDate} sortKey="applied_at" />
                <th className="px-3 py-2 text-center text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    {t.loadingData}
                  </td>
                </tr>
              ) : nominations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    {t.noData}
                  </td>
                </tr>
              ) : (
                nominations.map((nomination, index) => {
                  const statusInfo = getStatusLabel(nomination.status);
                  const appliedDate = nomination.appliedAt 
                    ? new Date(nomination.appliedAt).toLocaleDateString('vi-VN')
                    : '-';
                  const interviewDateStr = nomination.interviewDate 
                    ? new Date(nomination.interviewDate).toLocaleDateString('vi-VN')
                    : null;
                  const showInterviewDate = interviewDateStr && isInterviewStatus(nomination.status);

                  const statusStyle = getStatusColorStyle(statusInfo.value);
                  const isStale = getStaleWarning(nomination);
                  const assigning = !!assigningMap[nomination.id];
                  const isOwner = isSuperAdmin || (adminProfile && nomination.adminResponsibleId === adminProfile.id);
                  return (
                    <tr
                      key={nomination.id}
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
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/nominations/${nomination.id}`)}
                            onMouseEnter={() => setHoveredIdLinkIndex(index)}
                            onMouseLeave={() => setHoveredIdLinkIndex(null)}
                            className="font-medium text-xs flex items-center gap-1"
                            style={{
                              color: hoveredIdLinkIndex === index ? '#1e40af' : '#2563eb'
                            }}
                          >
                            {nomination.id}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          {isStale && (
                            <AlertCircle
                              className="w-3.5 h-3.5"
                              style={{ color: '#eab308' }}
                              title={t.nominationStaleWarning}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-[10px]" style={{ backgroundColor: '#a855f7' }}>
                            {(nomination.cv?.name || nomination.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            {nomination.cvId ? (
                              <button
                                onClick={() => navigate(`/admin/candidates/${nomination.cvId}`)}
                                onMouseEnter={() => setHoveredCandidateLinkIndex(index)}
                                onMouseLeave={() => setHoveredCandidateLinkIndex(null)}
                                className="text-xs font-semibold block"
                                style={{
                                  color: hoveredCandidateLinkIndex === index ? '#2563eb' : '#111827'
                                }}
                              >
                                {nomination.cv?.name || nomination.name || '-'}
                              </button>
                            ) : (
                              <span className="text-xs font-semibold" style={{ color: '#111827' }}>
                                {nomination.cv?.name || nomination.name || '-'}
                              </span>
                            )}
                            {(nomination.collaborator?.code || nomination.collaborator?.name) && (
                              <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>
                                CTV: {nomination.collaborator?.name || nomination.collaborator?.code}
                              </p>
                            )}
                            {(unreadByJobApplication[nomination.id] || 0) > 0 && (
                              <span
                                className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
                                title={t.unreadMessageTitle}
                              >
                                {unreadByJobApplication[nomination.id]} tin nhắn
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 max-w-[200px]">
                        {nomination.jobId ? (
                          <button
                            onClick={() => navigate(`/admin/jobs/${nomination.jobId}`)}
                            onMouseEnter={() => setHoveredJobLinkIndex(index)}
                            onMouseLeave={() => setHoveredJobLinkIndex(null)}
                            className="text-left block"
                            style={{
                              color: hoveredJobLinkIndex === index ? '#2563eb' : '#111827'
                            }}
                          >
                            <span className="text-xs font-medium line-clamp-2">
                              {truncate(pickByLanguage(nomination.job, 'title') || nomination.job?.jobCode || '-', JOB_TITLE_MAX)}
                            </span>
                            <span className="text-[10px] block mt-0.5" style={{ color: '#6b7280' }}>
                              {nomination.job?.recruitingCompany?.companyName || '—'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: '#374151' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          {nomination.adminResponsibleId ? (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 flex-shrink-0" style={{ color: '#60a5fa' }} />
                              <span className="text-xs font-medium" style={{ color: '#1e3a8a' }}>
                                {nomination.adminResponsible?.name || nomination.adminResponsible?.email || '-'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium" style={{ color: '#dc2626' }}>{t.notAssignedAdmin}</span>
                          )}
                          {isSuperAdmin && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <select
                                value={nomination.adminResponsible?.id || ''}
                                onChange={(e) => handleAssignAdmin(nomination, e.target.value)}
                                disabled={assigning}
                                className="border rounded px-1 py-0.5 text-[11px]"
                                style={{ borderColor: '#d1d5db', minWidth: '130px' }}
                              >
                                <option value="">{t.notAssignedAdminOption}</option>
                                {admins.map(admin => (
                                  <option key={admin.id} value={admin.id}>
                                    {admin.name}
                                  </option>
                                ))}
                              </select>
                              {assigning && (
                                <span className="text-[10px]" style={{ color: '#6b7280' }}>
                                  {t.saving}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <select
                            value={nomination.status}
                            onChange={(e) => handleStatusSelectChange(nomination, parseInt(e.target.value, 10))}
                            disabled={!isSuperAdmin && !isOwner}
                            className="w-full max-w-[200px] px-2 py-1 rounded text-[10px] font-semibold border cursor-pointer"
                            style={{
                              backgroundColor: statusStyle.backgroundColor,
                              color: statusStyle.color,
                              borderColor: '#d1d5db',
                              outline: 'none'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getJobApplicationStatusOptionsByLanguage(language).map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {showInterviewDate && (
                            <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>PV: {interviewDateStr}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: '#9ca3af' }} />
                          {appliedDate}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          {(isSuperAdmin || isOwner) && (
                            <button
                              onClick={() => openMemoPanel(nomination)}
                              onMouseEnter={() => setHoveredMemoButtonIndex(index)}
                              onMouseLeave={() => setHoveredMemoButtonIndex(null)}
                              className="relative px-2 py-1 rounded text-[11px] font-semibold border transition-colors"
                              style={{
                                borderColor: '#fecaca',
                                backgroundColor: hoveredMemoButtonIndex === index ? '#fee2e2' : '#fff1f2',
                                color: '#b91c1c'
                              }}
                              title={t.viewMemoTitle}
                            >
                              {nomination.memo && (
                                <span
                                  className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full border-2"
                                  style={{ backgroundColor: '#b91c1c', borderColor: '#fff1f2' }}
                                />
                              )}
                              Memo
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/nominations/${nomination.id}`)}
                            onMouseEnter={() => setHoveredViewButtonIndex(index)}
                            onMouseLeave={() => setHoveredViewButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredViewButtonIndex === index ? '#1e40af' : '#2563eb',
                              backgroundColor: hoveredViewButtonIndex === index ? '#eff6ff' : 'transparent'
                            }}
                            title={t.viewDetail}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {(isSuperAdmin || isOwner) && (
                            <button
                              onClick={() => navigate(`/admin/nominations/${nomination.id}/edit`)}
                              onMouseEnter={() => setHoveredEditButtonIndex(index)}
                              onMouseLeave={() => setHoveredEditButtonIndex(null)}
                              className="p-1 rounded transition-colors"
                              style={{
                                color: hoveredEditButtonIndex === index ? '#1f2937' : '#4b5563',
                                backgroundColor: hoveredEditButtonIndex === index ? '#f3f4f6' : 'transparent'
                              }}
                              title={t.edit}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {(isSuperAdmin || isOwner) && (
                            <button
                              onClick={() => handleDelete(nomination.id)}
                              onMouseEnter={() => setHoveredDeleteButtonIndex(index)}
                              onMouseLeave={() => setHoveredDeleteButtonIndex(null)}
                              className="p-1 rounded transition-colors"
                              style={{
                                color: hoveredDeleteButtonIndex === index ? '#991b1b' : '#dc2626',
                                backgroundColor: hoveredDeleteButtonIndex === index ? '#fef2f2' : 'transparent'
                              }}
                              title={t.delete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* Modal nhập lý do từ chối hoặc số tiền thanh toán khi đổi trạng thái */}
      {statusChangeModal && statusChangeNomination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-xl shadow-lg w-full max-w-md mx-4 p-5" style={{ backgroundColor: 'white' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>
              {statusChangeNewStatus === STATUS_PAID ? t.statusChangeTitlePayment : t.statusChangeTitleReject}
            </h3>
            <p className="text-sm mb-3" style={{ color: '#6b7280' }}>
              {statusChangeNewStatus === STATUS_PAID
                ? t.statusChangeDescPayment.replace('{status}', getJobApplicationStatusLabelByLanguage(statusChangeNewStatus, language)).replace('{id}', statusChangeNomination.id)
                : t.statusChangeDescReject.replace('{status}', getJobApplicationStatusLabelByLanguage(statusChangeNewStatus, language)).replace('{id}', statusChangeNomination.id)}
            </p>
            {statusChangeNewStatus === STATUS_PAID ? (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{t.paymentAmountLabel}</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={statusChangePaymentAmount}
                  onChange={(e) => setStatusChangePaymentAmount(e.target.value)}
                  placeholder={t.placeholderPaymentAmount}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#d1d5db', outline: 'none' }}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{t.rejectReasonLabel}</label>
                <textarea
                  value={statusChangeRejectNote}
                  onChange={(e) => setStatusChangeRejectNote(e.target.value)}
                  placeholder={t.placeholderRejectReason}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#d1d5db', outline: 'none' }}
                />
              </div>
            )}
            <div className="flex gap-2 mt-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  setStatusChangeModal(false);
                  setStatusChangeNomination(null);
                  setStatusChangeRejectNote('');
                  setStatusChangePaymentAmount('');
                }}
                disabled={statusChangeUpdating}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
                style={{ borderColor: '#d1d5db', color: '#374151' }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleStatusChangeModalConfirm}
                disabled={statusChangeUpdating || (statusChangeNewStatus === STATUS_PAID && !statusChangePaymentAmount.trim())}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: '#2563eb' }}
              >
                {statusChangeUpdating ? t.updating : t.updateButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memo Drawer */}
      {memoPanelOpen && memoPanelNomination && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={closeMemoPanel}
          />
          {/* Panel */}
          <div className="relative w-full max-w-md h-full bg-rose-50 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3 p-4 pb-2 flex-shrink-0">
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#b91c1c' }}>
                  {t.memoForNomination}{memoPanelNomination.id}
                </h2>
                <p className="text-[11px] mt-1" style={{ color: '#7f1d1d' }}>
                  {t.candidateLabelShort} {memoPanelNomination.cv?.name || memoPanelNomination.name || '-'}
                </p>
                <p className="text-[11px]" style={{ color: '#7f1d1d' }}>
                  {t.colJob}: {pickByLanguage(memoPanelNomination.job, 'title') || memoPanelNomination.job?.jobCode || '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeMemoPanel}
                className="text-xs px-2 py-1 rounded border"
                style={{ borderColor: '#fecaca', color: '#7f1d1d' }}
              >
                {t.closeButton}
              </button>
            </div>

            {/* Form create / edit memo */}
            {isSuperAdmin && (
              <div className="px-4 pb-3 border-b" style={{ borderColor: '#fecaca' }}>
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: '#7f1d1d' }}>
                    {editingMemoId ? t.editMemo : t.addMemo}
                  </label>
                  <textarea
                    value={memoNote}
                    onChange={(e) => setMemoNote(e.target.value)}
                    rows={3}
                    placeholder={t.placeholderMemo}
                    className="w-full px-3 py-2 rounded text-xs"
                    style={{ borderColor: '#fecaca', outline: 'none', backgroundColor: 'white' }}
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: '#7f1d1d' }}>
                    {t.suggestJobLabel}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#fca5a5' }} />
                    <input
                      type="text"
                      placeholder={t.placeholderMemoJobSearch}
                      value={memoJobSearch}
                      onChange={(e) => {
                        const value = e.target.value;
                        setMemoJobSearch(value);
                        const trimmed = value.trim();
                        if (trimmed.length >= 2) {
                          handleSearchMemoJobs(trimmed);
                        } else {
                          setMemoJobResults([]);
                        }
                      }}
                      onFocus={() => setShowMemoJobDropdown(true)}
                      onBlur={() => {
                        // Delay để click vào item trong dropdown vẫn hoạt động
                        setTimeout(() => setShowMemoJobDropdown(false), 150);
                      }}
                      className="w-full pl-10 pr-3 py-2 rounded text-xs"
                      style={{ borderColor: '#fecaca', outline: 'none', backgroundColor: 'white' }}
                    />
                    {selectedMemoJobs && selectedMemoJobs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedMemoJobs.map(jobItem => (
                          <div
                            key={jobItem.id}
                            className="px-2 py-1 rounded-full border flex items-center gap-1"
                            style={{ borderColor: '#fecaca', backgroundColor: '#fff1f2' }}
                          >
                            <span className="text-[11px]" style={{ color: '#7f1d1d' }}>
                              {pickByLanguage(jobItem, 'title') || jobItem.jobCode || `Job #${jobItem.id}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedMemoJobs(prev => prev.filter(j => j.id !== jobItem.id))}
                              className="text-[11px]"
                              style={{ color: '#b91c1c' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {showMemoJobDropdown && (memoJobsLoading || memoJobResults.length > 0) && (
                      <div className="absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ backgroundColor: 'white', borderColor: '#fecaca' }}>
                        {memoJobsLoading ? (
                          <div className="p-3 text-xs" style={{ color: '#6b7280' }}>Đang tìm job...</div>
                        ) : (
                          memoJobResults.map((jobItem, index) => (
                            <button
                              key={jobItem.id}
                              type="button"
                              onClick={() => {
                                setSelectedMemoJobs(prev => {
                                  if (prev.find(j => j.id === jobItem.id)) return prev;
                                  return [...prev, jobItem];
                                });
                              }}
                              onMouseEnter={() => setHoveredMemoJobIndex(index)}
                              onMouseLeave={() => setHoveredMemoJobIndex(null)}
                              className="w-full px-3 py-2 text-left text-xs"
                              style={{
                                backgroundColor: hoveredMemoJobIndex === index ? '#fef2f2' : 'transparent',
                                color: '#111827'
                              }}
                            >
                              <div className="font-medium">{pickByLanguage(jobItem, 'title') || jobItem.jobCode}</div>
                              <div className="text-[10px]" style={{ color: '#6b7280' }}>
                                Mã: {jobItem.jobCode || jobItem.id}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  {editingMemoId && (
                    <button
                      type="button"
                      onClick={resetMemoForm}
                      className="text-[11px]"
                      style={{ color: '#7f1d1d' }}
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveMemo}
                    disabled={savingMemo}
                    className="ml-auto px-4 py-2 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: '#b91c1c',
                      color: 'white',
                      opacity: savingMemo ? 0.7 : 1
                    }}
                  >
                    {savingMemo ? 'Đang lưu...' : (editingMemoId ? 'Cập nhật memo' : 'Lưu memo')}
                  </button>
                </div>
              </div>
            )}

            {/* Memo list */}
            <div className="mb-3 px-4 max-h-[50vh] overflow-y-auto flex-1">
              {loadingMemos ? (
                <p className="text-xs" style={{ color: '#6b7280' }}>Đang tải memo...</p>
              ) : memoError ? (
                <p className="text-xs" style={{ color: '#b91c1c' }}>{memoError}</p>
              ) : memos.length === 0 ? (
                <p className="text-xs" style={{ color: '#6b7280' }}>Chưa có memo nào cho đơn này.</p>
              ) : (
                memos.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 mb-2 rounded border text-xs"
                    style={{
                      backgroundColor: editingMemoId === m.id ? '#fee2e2' : 'white',
                      borderColor: '#fecaca',
                      color: '#374151'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">
                        {m.creator?.name || 'Super Admin'}
                      </span>
                      <span className="text-[10px]" style={{ color: '#9ca3af' }}>
                        {m.created_at ? new Date(m.created_at).toLocaleString('vi-VN') : ''}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap mb-1">{m.note}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {m.job && (
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/jobs/${m.job.id}`)}
                            className="text-[11px] inline-flex items-center gap-1"
                            style={{ color: '#2563eb' }}
                          >
                            <Briefcase className="w-3 h-3" />
                            {pickByLanguage(m.job, 'title') || m.job.jobCode || `Job #${m.job.id}`}
                          </button>
                        )}
                      </div>
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => startEditMemo(m)}
                          className="text-[11px]"
                          style={{ color: '#b91c1c' }}
                        >
                          Sửa
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNominationsPage;

