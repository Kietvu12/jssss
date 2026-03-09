/**
 * Đảm bảo base URL luôn kết thúc bằng /api (backend mount prefix).
 * Tránh 404 "Route not found" khi VITE_API_BASE_URL thiếu /api (vd: http://localhost:3000).
 */
function ensureApiSuffix(url) {
  if (!url || typeof url !== 'string') return url;
  const u = url.trim().replace(/\/+$/, '');
  return u.endsWith('/api') ? u : `${u}/api`;
}

/**
 * API base URL. Khi chạy qua HTTPS (VD: VS Code Dev Tunnels), trình duyệt chặn mixed content (HTTPS page gọi HTTP).
 * - Ưu tiên: VITE_API_BASE_URL (trong .env, không có khoảng trắng thừa trước tên biến)
 * - Nếu trang đang HTTPS mà env là http: hoặc chưa set: tự suy backend tunnel (đổi -5173 sang -3000 trong host)
 * - Còn lại: http://192.168.1.196:3000/api (dev local)
 * - Luôn chuẩn hóa để base kết thúc bằng /api (route backend là /api/admin/..., /api/ctv/...).
 */
function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  if (fromEnv && typeof fromEnv === 'string') {
    const url = fromEnv.trim().replace(/\/$/, '');
    if (url.startsWith('https')) return ensureApiSuffix(url);
    if (isHttps && url.startsWith('http:')) { /* mixed content, bỏ qua env, suy từ tunnel bên dưới */ }
    else if (url.startsWith('http')) return ensureApiSuffix(url);
  }
  if (isHttps && typeof window !== 'undefined') {
    const host = window.location.host;
    if (host.includes('-5173')) {
      const apiHost = host.replace(/-5173\b/, '-3000');
      return `${window.location.protocol}//${apiHost}/api`;
    }
  }
  const base = (fromEnv && typeof fromEnv === 'string' && fromEnv.trim().startsWith('http'))
    ? fromEnv.trim().replace(/\/+$/, '')
    : 'http://192.168.1.196:3000';
  return ensureApiSuffix(base);
}
const API_BASE_URL = getApiBaseUrl();

/**
 * Get authorization header
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/**
 * Handle API response.
 * Khi proxy (Nginx) trả 413, body thường là HTML → parse JSON sẽ lỗi. Đọc text trước, parse an toàn.
 */
const handleResponse = async (response) => {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // Proxy trả HTML (vd: 413 Request Entity Too Large)
    if (response.status === 413) {
      const error = new Error(
        'Dung lượng request quá lớn (file/ảnh). Vui lòng giảm kích thước file hoặc nhờ quản trị viên cấu hình Nginx: client_max_body_size 15m;'
      );
      error.status = 413;
      error.data = { message: error.message };
      throw error;
    }
    const error = new Error(
      response.status ? `Lỗi ${response.status}: ${response.statusText}` : 'Phản hồi không hợp lệ'
    );
    error.status = response.status;
    error.data = {};
    throw error;
  }
  if (!response.ok) {
    const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

/**
 * API Service - Centralized API calls
 */
const apiService = {
  /**
   * CTV Authentication
   */
  loginCTV: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/ctv/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  registerCTV: async (data) => {
    const response = await fetch(`${API_BASE_URL}/ctv/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getCTVProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateCTVProfile: async (data) => {
    const response = await fetch(`${API_BASE_URL}/ctv/auth/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  logoutCTV: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Authentication
   */
  loginAdmin: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  logoutAdmin: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Dashboard – thống kê tổng quan (CTV, Jobs, Ứng tuyển, Yêu cầu thanh toán)
   */
  getAdminDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /** Thống kê jobs (hot jobs) cho dashboard */
  getJobStatistics: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/job-statistics?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /** Đơn tiến cử thành công/thất bại theo tháng (biểu đồ line) */
  getAdminDashboardNominationOverTime: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/nomination-over-time?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Management APIs
   */
  getAdmins: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/admins?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdmin: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateAdmin: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteAdmin: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Dashboard APIs (CTV)
   */
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getDashboardChart: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/dashboard/chart?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CV Statistics API (CTV)
   */
  getCVStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/statistics`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CV Management APIs (CTV)
   */
  getCVStorages: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/cvs?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCVStorageById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * @param {string} cvId
   * @param {string} fileType - 'curriculumVitae' | 'cvOriginalPath' | 'cvCareerHistoryPath' | 'otherDocuments'
   * @param {string} purpose - 'view' | 'download'
   * @param {{ template?: string, document?: string, index?: number }} [params] - for snapshot folder: template (Common|IT|Technical), document (rirekisho|shokumu), index (for CV gốc)
   */
  getCtvCVFileUrl: async (cvId, fileType = 'curriculumVitae', purpose = 'view', params = {}) => {
    const search = new URLSearchParams({ fileType, purpose });
    if (params.template != null) search.set('template', String(params.template));
    if (params.document != null) search.set('document', String(params.document));
    if (params.index != null) search.set('index', String(params.index));
    const response = await fetch(
      `${API_BASE_URL}/ctv/cvs/${cvId}/view-url?${search.toString()}`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data?.data?.url || null;
  },

  getCtvCVFileContent: async (cvStorageId, fileType = 'curriculumVitae', params = {}) => {
    const search = new URLSearchParams({ fileType });
    if (params.template != null) search.set('template', String(params.template));
    if (params.document != null) search.set('document', String(params.document));
    if (params.index != null) search.set('index', String(params.index));
    const response = await fetch(
      `${API_BASE_URL}/ctv/cvs/${cvStorageId}/file-content?${search.toString()}`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || `HTTP ${response.status}`);
    }
    return response.arrayBuffer();
  },

  /**
   * List all CV files (originals + templates) with view/download URLs
   * @returns {Promise<{ originals: Array<{ index, name, viewUrl, downloadUrl }>, templates: Array<{ template, document, label, viewUrl, downloadUrl }> }>}
   */
  getCtvCVFileList: async (cvId) => {
    const response = await fetch(
      `${API_BASE_URL}/ctv/cvs/${cvId}/cv-file-list`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data?.data || { originals: [], templates: [] };
  },

  /**
   * Download ZIP (Agent/CTV) via authenticated request.
   * @param {string|number} cvId
   * @param {'original'|'template'} scope
   * @param {'all'|'Common'|'IT'|'Technical'} template
   * @returns {Promise<{ blob: Blob, filename: string }>}
   */
  downloadCtvCVZip: async (cvId, scope = 'template', template = 'all', dateTime = null) => {
    const search = new URLSearchParams({ scope, template });
    if (dateTime) search.set('dateTime', String(dateTime));
    const response = await fetch(
      `${API_BASE_URL}/ctv/cvs/${cvId}/download-zip?${search.toString()}`,
      { method: 'GET', headers: { ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}) } }
    );
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `HTTP ${response.status}`);
    }
    const cd = response.headers.get('content-disposition') || '';
    const m = cd.match(/filename\\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i);
    const filename = decodeURIComponent((m && (m[1] || m[2])) || `cv_${cvId}.zip`);
    const blob = await response.blob();
    return { blob, filename };
  },

  getCtvCVSnapshots: async (cvId, params = {}) => {
    const search = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/ctv/cvs/${cvId}/snapshots${search ? `?${search}` : ''}`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data?.data?.snapshots || [];
  },

  rollbackCtvCV: async (cvId, srcDateTime) => {
    const response = await fetch(
      `${API_BASE_URL}/ctv/cvs/${cvId}/rollback`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ srcDateTime: String(srcDateTime) })
      }
    );
    return handleResponse(response);
  },

  /**
   * Get nomination history for a candidate (by CV code or email)
   */
  getCandidateNominationHistory: async (cvCode, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications/candidates/${cvCode}/nomination-history?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get recently updated CVs for replacement
   */
  getRecentUpdatedCVs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/recent?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createCVStorage: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
      },
      body: formData
    });
    return handleResponse(response);
  },

  updateCVStorage: async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/${id}`, {
      method: 'PUT',
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
      },
      body: formData
    });
    return handleResponse(response);
  },

  deleteCVStorage: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  checkDuplicateCV: async (data) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/check-duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  /**
   * Job Application APIs (CTV)
   */
  getJobApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getJobApplicationById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createJobApplication: async (formData) => {
    // Check if formData is FormData or regular object
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  updateJobApplication: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteJobApplication: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Dashboard Category Distribution API (CTV)
   * Phân bố đơn theo nhóm ngành nghề (jobCategory). Params: startDate, endDate (YYYY-MM-DD, optional).
   */
  getCategoryDistribution: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `${API_BASE_URL}/ctv/dashboard/category-distribution?${queryString}`
      : `${API_BASE_URL}/ctv/dashboard/category-distribution`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Dashboard Offer/Rejection Stats API (CTV)
   * Params: type ('month'|'week'), startDate, endDate (YYYY-MM-DD, optional).
   */
  getOfferRejectionStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/dashboard/offer-rejection?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Schedule API (CTV)
   */
  getSchedule: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/calendars/schedule?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createCTVCalendar: async (calendarData) => {
    console.log('[API Service] createCTVCalendar called with:', calendarData);
    console.log('[API Service] API_BASE_URL:', API_BASE_URL);
    console.log('[API Service] URL:', `${API_BASE_URL}/ctv/calendars`);
    console.log('[API Service] Headers:', getAuthHeaders());
    
    try {
      const response = await fetch(`${API_BASE_URL}/ctv/calendars`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(calendarData)
      });
      console.log('[API Service] Fetch response received:', response.status, response.statusText);
      const result = await handleResponse(response);
      console.log('[API Service] handleResponse result:', result);
      return result;
    } catch (error) {
      console.error('[API Service] Error in createCTVCalendar:', error);
      throw error;
    }
  },

  /**
   * Job Pickups API (CTV)
   */
  getCTVJobPickups: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/job-pickups?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Campaigns API (CTV)
   */
  getCTVCampaigns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/campaigns?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Posts API (CTV)
   */
  getCTVPosts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/posts?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Jobs API (CTV)
   */
  getCTVJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/jobs?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get jobs by campaign ID (CTV)
   */
  getCTVJobsByCampaign: async (campaignId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/jobs/by-campaign/${campaignId}?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get jobs by job pickup ID (CTV)
   */
  getCTVJobsByJobPickup: async (jobPickupId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/jobs/by-job-pickup/${jobPickupId}?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get job by ID (CTV)
   */
  getJobById: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/jobs/${jobId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCtvJobFileUrl: async (jobId, fileType = 'jdFile', purpose = 'view') => {
    const response = await fetch(
      `${API_BASE_URL}/ctv/jobs/${jobId}/view-url?fileType=${encodeURIComponent(fileType)}&purpose=${encodeURIComponent(purpose)}`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data?.data?.url || null;
  },

  /**
   * Get job categories (CTV)
   * Can be used to get parent categories (parentId: null) or children (parentId: number)
   */
  getCTVJobCategories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/job-categories?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get job category tree (CTV)
   * Returns hierarchical tree structure of all categories
   */
  getCTVJobCategoryTree: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/job-categories/tree`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get job category children (CTV)
   * Get children categories of a specific parent category
   */
  getJobCategoryChildren: async (parentId, params = {}) => {
    const queryParams = { ...params, parentId };
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/job-categories?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CTV Search History
   */
  getCTVSearchHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/search-history?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  saveCTVSearchHistory: async (body) => {
    const response = await fetch(`${API_BASE_URL}/ctv/search-history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  clearCTVSearchHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/search-history`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  deleteCTVSearchHistoryItem: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/search-history/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CTV Saved Search Criteria (tiêu chí tìm kiếm đã lưu)
   */
  getSavedSearchCriteria: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/saved-search-criteria?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getSavedSearchCriteriaById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-search-criteria/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  createSavedSearchCriteria: async (body) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-search-criteria`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  updateSavedSearchCriteria: async (id, body) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-search-criteria/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  deleteSavedSearchCriteria: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-search-criteria/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CTV Saved Lists (playlist / danh sách lưu giữ)
   */
  getSavedLists: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/saved-lists?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getSavedListById: async (listId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-lists/${listId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  createSavedList: async (body) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-lists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  updateSavedList: async (listId, body) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-lists/${listId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  deleteSavedList: async (listId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-lists/${listId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getSavedListJobs: async (listId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-lists/${listId}/jobs`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  addJobToSavedList: async (listId, body) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-lists/${listId}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  removeJobFromSavedList: async (listId, jobId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-lists/${listId}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  reorderSavedListJobs: async (listId, jobIds) => {
    const response = await fetch(`${API_BASE_URL}/ctv/saved-lists/${listId}/jobs/reorder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ jobIds })
    });
    return handleResponse(response);
  },

  /**
   * Admin Job Management APIs
   */
  getAdminJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/jobs?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminJobById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminJobFileUrl: async (jobId, fileType = 'jdFile', purpose = 'view') => {
    const response = await fetch(
      `${API_BASE_URL}/admin/jobs/${jobId}/view-url?fileType=${encodeURIComponent(fileType)}&purpose=${encodeURIComponent(purpose)}`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data?.data?.url || null;
  },

  createAdminJob: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/jobs`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  updateAdminJob: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
      method: 'PUT',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  deleteAdminJob: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  toggleJobPinned: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}/toggle-pinned`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  toggleJobHot: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}/toggle-hot`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateJobStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  /**
   * Admin Company APIs
   */
  getCompanies: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/companies?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCompanyById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createCompany: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/companies`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateCompany: async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
      method: 'PUT',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteCompany: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  toggleCompanyStatus: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/companies/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Job Category APIs
   */
  getJobCategories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/job-categories?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getJobCategoryTree: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${API_BASE_URL}/admin/job-categories/tree?${qs}` : `${API_BASE_URL}/admin/job-categories/tree`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getJobCategoryById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createJobCategory: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateJobCategory: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteJobCategory: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Type & Value APIs (for job_values)
   */
  getTypes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/types?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAllTypes: async (includeValues = false) => {
    const queryString = new URLSearchParams({ includeValues: includeValues ? 'true' : 'false' }).toString();
    const response = await fetch(`${API_BASE_URL}/admin/types/all?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getValues: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/values?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getValuesByType: async (typeId) => {
    const response = await fetch(`${API_BASE_URL}/admin/values/by-type/${typeId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createType: async (typeData) => {
    const response = await fetch(`${API_BASE_URL}/admin/types`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(typeData)
    });
    return handleResponse(response);
  },

  createValue: async (valueData) => {
    const response = await fetch(`${API_BASE_URL}/admin/values`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(valueData)
    });
    return handleResponse(response);
  },

  updateType: async (typeId, typeData) => {
    const response = await fetch(`${API_BASE_URL}/admin/types/${typeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(typeData)
    });
    return handleResponse(response);
  },

  deleteType: async (typeId) => {
    const response = await fetch(`${API_BASE_URL}/admin/types/${typeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateValue: async (valueId, valueData) => {
    const response = await fetch(`${API_BASE_URL}/admin/values/${valueId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(valueData)
    });
    return handleResponse(response);
  },

  deleteValue: async (valueId) => {
    const response = await fetch(`${API_BASE_URL}/admin/values/${valueId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin CV (Candidate) APIs
   */
  getAdminCVs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/cvs?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminCVById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/cvs/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminCV: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/cvs`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  previewAdminCVTemplate: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/admin/cvs/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
      },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, html: text };
  },

  /** Preview CV template (CTV khi tạo/sửa UV) – cùng payload với admin */
  previewCTVCVTemplate: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/preview`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, html: text };
  },

  updateAdminCV: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/cvs/${id}`, {
      method: 'PUT',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  deleteAdminCV: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/cvs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminCVHistory: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/cvs/${id}/history`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Lấy URL để xem hoặc tải file CV (signed URL nếu S3, URL tĩnh nếu local)
   * @param {string} cvStorageId - id cv_storages
   * @param {string} fileType - 'curriculumVitae' | 'cvOriginalPath' | 'cvCareerHistoryPath' | 'otherDocuments'
   * @param {string} purpose - 'view' | 'download'
   * @param {{ template?: string, document?: string, index?: number }} [params] - for snapshot: template (Common|IT|Technical), document (rirekisho|shokumu), index (CV gốc)
   */
  getAdminCVFileUrl: async (cvStorageId, fileType = 'curriculumVitae', purpose = 'view', params = {}) => {
    const search = new URLSearchParams({ fileType, purpose });
    if (params.template != null) search.set('template', String(params.template));
    if (params.document != null) search.set('document', String(params.document));
    if (params.index != null) search.set('index', String(params.index));
    const response = await fetch(
      `${API_BASE_URL}/admin/cv-storages/${cvStorageId}/view-url?${search.toString()}`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data?.data?.url || null;
  },

  /**
   * Lấy nội dung file qua proxy (có auth) để preview DOCX/DOC/XLSX tránh CORS.
   * @param {string|number} cvStorageId
   * @param {string} fileType - 'curriculumVitae' | 'cvOriginalPath' | 'cvCareerHistoryPath' | 'otherDocuments'
   * @param {{ template?: string, document?: string, index?: number }} [params]
   * @returns {Promise<ArrayBuffer>}
   */
  getAdminCVFileContent: async (cvStorageId, fileType = 'curriculumVitae', params = {}) => {
    const search = new URLSearchParams({ fileType });
    if (params.template != null) search.set('template', String(params.template));
    if (params.document != null) search.set('document', String(params.document));
    if (params.index != null) search.set('index', String(params.index));
    const response = await fetch(
      `${API_BASE_URL}/admin/cv-storages/${cvStorageId}/file-content?${search.toString()}`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || `HTTP ${response.status}`);
    }
    return response.arrayBuffer();
  },

  /**
   * List all CV files (originals + templates) with view/download URLs
   * @returns {Promise<{ originals: Array<{ index, name, viewUrl, downloadUrl }>, templates: Array<{ template, document, label, viewUrl, downloadUrl }> }>}
   */
  getAdminCVFileList: async (cvStorageId) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/cv-storages/${cvStorageId}/cv-file-list`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data?.data || { originals: [], templates: [] };
  },

  /**
   * Download ZIP (Admin) via authenticated request.
   * @param {string|number} cvStorageId
   * @param {'original'|'template'} scope
   * @param {'all'|'Common'|'IT'|'Technical'} template
   * @returns {Promise<{ blob: Blob, filename: string }>}
   */
  downloadAdminCVZip: async (cvStorageId, scope = 'template', template = 'all', dateTime = null) => {
    const search = new URLSearchParams({ scope, template });
    if (dateTime) search.set('dateTime', String(dateTime));
    const response = await fetch(
      `${API_BASE_URL}/admin/cv-storages/${cvStorageId}/download-zip?${search.toString()}`,
      { method: 'GET', headers: { ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}) } }
    );
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `HTTP ${response.status}`);
    }
    const cd = response.headers.get('content-disposition') || '';
    const m = cd.match(/filename\\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i);
    const filename = decodeURIComponent((m && (m[1] || m[2])) || `cv_${cvStorageId}.zip`);
    const blob = await response.blob();
    return { blob, filename };
  },

  getAdminCVSnapshots: async (cvStorageId, params = {}) => {
    const search = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/admin/cv-storages/${cvStorageId}/snapshots${search ? `?${search}` : ''}`,
      { method: 'GET', headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data?.data?.snapshots || [];
  },

  rollbackAdminCV: async (cvStorageId, srcDateTime) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/cv-storages/${cvStorageId}/rollback`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ srcDateTime: String(srcDateTime) })
      }
    );
    return handleResponse(response);
  },

  /**
   * Admin Job Application (Nomination) APIs
   */
  getAdminJobApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/job-applications?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminJobApplicationById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminJobApplication: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/job-applications`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  updateAdminJobApplication: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}`, {
      method: 'PUT',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  deleteAdminJobApplication: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateJobApplicationStatus: async (id, status, rejectNote = null, paymentAmount = null) => {
    const statusNum = typeof status === 'number' ? status : parseInt(status, 10);
    const body = { status: statusNum };
    if (rejectNote !== undefined && rejectNote !== null && String(rejectNote).trim() !== '') {
      body.rejectNote = String(rejectNote).trim();
    }
    if (paymentAmount !== undefined && paymentAmount !== null && paymentAmount !== '') {
      const amount = typeof paymentAmount === 'number' ? paymentAmount : parseFloat(paymentAmount);
      if (!Number.isNaN(amount)) {
        body.paymentAmount = amount;
      }
    }
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  /**
   * Admin Job Application Memos
   */
  getAdminJobApplicationMemos: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}/memos`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminJobApplicationMemo: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}/memos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateAdminJobApplicationMemo: async (id, memoId, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}/memos/${memoId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  /**
   * Admin Collaborator APIs
   */
  getCollaborators: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/collaborators?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCollaboratorById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborators/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createCollaborator: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborators`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteCollaborator: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborators/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  approveCollaborator: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborators/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  approveCollaboratorsBulk: async (ids) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborators/approve-bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids })
    });
    return handleResponse(response);
  },

  /**
   * Admin Campaign APIs
   */
  getAdminCampaigns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/campaigns?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminCampaignById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminCampaign: async (campaignData) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(campaignData)
    });
    return handleResponse(response);
  },

  updateAdminCampaign: async (id, campaignData) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(campaignData)
    });
    return handleResponse(response);
  },

  deleteAdminCampaign: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateCampaignStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  /**
   * Admin Message APIs
   */
  getAdminMessages: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/messages?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminMessagesByJobApplication: async (jobApplicationId) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/job-application/${jobApplicationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminUnreadMessageCount: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const res = await handleResponse(response);
    return res?.data?.count ?? 0;
  },

  getAdminUnreadByJobApplication: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/unread-by-application`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const res = await handleResponse(response);
    return res?.data?.unreadByJobApplication ?? {};
  },

  createAdminMessage: async (messageData) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData)
    });
    return handleResponse(response);
  },

  deleteAdminMessage: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markMessageReadByAdmin: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}/mark-read-admin`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markAllMessagesReadByAdmin: async (jobApplicationId) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/job-application/${jobApplicationId}/mark-all-read-admin`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Calendar APIs
   */
  getAdminCalendars: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/calendars?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminCalendar: async (calendarData) => {
    console.log('[API Service] createAdminCalendar called with:', calendarData);
    console.log('[API Service] API_BASE_URL:', API_BASE_URL);
    console.log('[API Service] URL:', `${API_BASE_URL}/admin/calendars`);
    console.log('[API Service] Headers:', getAuthHeaders());
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/calendars`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(calendarData)
      });
      console.log('[API Service] Fetch response received:', response.status, response.statusText);
      const result = await handleResponse(response);
      console.log('[API Service] handleResponse result:', result);
      return result;
    } catch (error) {
      console.error('[API Service] Error in createAdminCalendar:', error);
      throw error;
    }
  },

  updateAdminCalendar: async (id, calendarData) => {
    const response = await fetch(`${API_BASE_URL}/admin/calendars/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(calendarData)
    });
    return handleResponse(response);
  },

  deleteAdminCalendar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/calendars/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CTV Message APIs
   */
  getCTVMessagesByJobApplication: async (jobApplicationId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/job-application/${jobApplicationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCTVUnreadMessageCount: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const res = await handleResponse(response);
    return res?.data?.count ?? 0;
  },

  getCTVUnreadByJobApplication: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/unread-by-application`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const res = await handleResponse(response);
    return res?.data?.unreadByJobApplication ?? {};
  },

  getCTVAdminsForMessage: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/messages/admins?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createCTVMessage: async (messageData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData)
    });
    return handleResponse(response);
  },

  deleteCTVMessage: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markCTVMessageRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/${id}/mark-read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markAllCTVMessagesRead: async (jobApplicationId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/job-application/${jobApplicationId}/mark-all-read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CTV Payment Request APIs
   */
  getPaymentRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getPaymentRequestById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createPaymentRequest: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  updatePaymentRequest: async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  deletePaymentRequest: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Payment Request APIs
   */
  getAdminPaymentRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminPaymentRequestById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  approvePaymentRequest: async (id, note, amount) => {
    const body = { note };
    if (amount != null && !Number.isNaN(parseFloat(amount))) {
      body.amount = parseFloat(amount);
    }
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  rejectPaymentRequest: async (id, rejectedReason, note) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rejectedReason, note })
    });
    return handleResponse(response);
  },

  markPaymentRequestAsPaid: async (id, note, amount) => {
    const body = { note };
    if (amount != null && !Number.isNaN(parseFloat(amount))) {
      body.amount = parseFloat(amount);
    }
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}/mark-paid`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  updateAdminPaymentRequest: async (id, updateData) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  deleteAdminPaymentRequest: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Collaborator Assignment APIs
   */
  getCollaboratorAssignments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /** Danh sách hồ sơ ứng viên (cv_storages) chưa được giao cho AdminBackOffice */
  getUnassignedCvStorages: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments/unassigned?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getMyAssignedCollaborators: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments/my-assigned?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCollaboratorAssignmentById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /** data: { cvStorageId, adminId, notes? } */
  createCollaboratorAssignment: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  /** data: { cvStorageIds, adminId, notes? } */
  bulkAssignCollaborators: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateCollaboratorAssignment: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteCollaboratorAssignment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCollaboratorAssignmentHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments/history?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCollaboratorAssignmentStatistics: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/collaborator-assignments/statistics?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Group Management APIs
   */
  getGroups: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/groups?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAllGroups: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getGroupById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createGroup: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateGroup: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteGroup: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  assignAdminToGroup: async (groupId, adminId) => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}/assign-admin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminId })
    });
    return handleResponse(response);
  },

  bulkAssignAdminsToGroup: async (groupId, adminIds) => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}/bulk-assign-admins`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminIds })
    });
    return handleResponse(response);
  },

  removeAdminFromGroup: async (groupId, adminId) => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}/remove-admin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminId })
    });
    return handleResponse(response);
  },

  getGroupStatistics: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${id}/statistics`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getGroupHistory: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/groups/${id}/history?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getMyGroup: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/my-group`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getMyGroupStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/my-group/statistics`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Reports API
   */
  getNominationEffectiveness: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/reports/nomination-effectiveness?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getPlatformEffectiveness: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/reports/platform-effectiveness?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getHREffectiveness: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/reports/hr-effectiveness?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getMyPerformance: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/reports/my-performance?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Outlook Email API
   */
  getOutlookAuthorizationUrl: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/emails/outlook/authorize`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getOutlookConnections: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/emails/outlook/connections`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  syncOutlookEmails: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/emails/outlook/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getSyncedEmails: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/emails/outlook/synced?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getSyncedEmailDetail: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/emails/outlook/synced/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  sendOutlookEmail: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/emails/outlook/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  markEmailAsRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/emails/outlook/synced/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  deleteOutlookConnection: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/emails/outlook/connections/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  toggleOutlookSync: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/emails/outlook/connections/${id}/toggle-sync`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
};

export default apiService;
