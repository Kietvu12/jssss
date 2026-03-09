import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Plus,
  Settings,
  Info,
  ExternalLink,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Globe,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

const CompaniesPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(''); // type 1=Nhật Bản, 2=Việt Nam, 3=Việt & Nhật
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [companies, setCompanies] = useState([]);
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
  const [hoveredRefreshButton, setHoveredRefreshButton] = useState(false);
  const [hoveredAddCompanyButton, setHoveredAddCompanyButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredCompanyIdLinkIndex, setHoveredCompanyIdLinkIndex] = useState(null);
  const [hoveredCompanyNameLinkIndex, setHoveredCompanyNameLinkIndex] = useState(null);
  const [hoveredWebsiteLinkIndex, setHoveredWebsiteLinkIndex] = useState(null);
  const [hoveredJobCountLinkIndex, setHoveredJobCountLinkIndex] = useState(null);
  const [hoveredToggleStatusButtonIndex, setHoveredToggleStatusButtonIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredEditButtonIndex, setHoveredEditButtonIndex] = useState(null);
  const [hoveredDeleteButtonIndex, setHoveredDeleteButtonIndex] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, [currentPage, itemsPerPage, selectedLocation, selectedStatus, searchQuery, language]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'id',
        sortOrder: 'DESC'
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedLocation) {
        params.type = selectedLocation; // 1, 2, 3
      }

      if (selectedStatus) {
        params.status = selectedStatus === 'active' ? '1' : '0';
      }

      const response = await apiService.getCompanies(params);
      if (response.success && response.data) {
        setCompanies(response.data.companies || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: itemsPerPage,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      alert(t.errorLoadCompanies);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t.confirmDeleteCompany.replace('{name}', name))) {
      return;
    }

    try {
      const response = await apiService.deleteCompany(id);
      if (response.success) {
        alert(t.deleteCompanySuccess);
        loadCompanies();
      } else {
        alert(response.message || t.errorDeleteCompany);
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert(error.message || t.errorDeleteCompany);
    }
  };

  const handleToggleStatus = async (company) => {
    try {
      const response = await apiService.toggleCompanyStatus(company.id);
      if (response.success) {
        alert(t.updateStatusSuccess);
        loadCompanies();
      } else {
        alert(response.message || t.errorOccurred);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(error.message || t.errorOccurred);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCompanies();
  };


  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(companies.map((_, index) => index)));
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

  const dateLocale = language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN';
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString(dateLocale);
  };

  const getLocationLabel = (type) => {
    const num = type != null ? Number(type) : null;
    if (num === 1) return t.companyLocationJapan;
    if (num === 2) return t.companyLocationVietnam;
    if (num === 3) return t.companyLocationVietnamJapan;
    return '—';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="rounded-lg p-3 border mb-3 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder={t.companiesSearchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-3 py-1.5 border rounded text-xs"
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
            className="px-4 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
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
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredResetButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            {t.resetButton}
          </button>
          <button
            onClick={loadCompanies}
            onMouseEnter={() => setHoveredRefreshButton(true)}
            onMouseLeave={() => setHoveredRefreshButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredRefreshButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {t.refreshButton}
          </button>
          <button
            onClick={() => navigate('/admin/companies/create')}
            onMouseEnter={() => setHoveredAddCompanyButton(true)}
            onMouseLeave={() => setHoveredAddCompanyButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredAddCompanyButton ? '#eab308' : '#facc15',
              color: '#111827'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addCompanyButton}
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.locationFilterLabel}</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
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
              <option value="1">{t.companyLocationJapan}</option>
              <option value="2">{t.companyLocationVietnam}</option>
              <option value="3">{t.companyLocationVietnamJapan}</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>{t.statusFilterLabel}</label>
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
              <option value="active">{t.statusActive}</option>
              <option value="inactive">{t.statusInactive}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1 || loading}
            onMouseEnter={() => !(currentPage === 1 || loading) && setHoveredPaginationNavButton('first')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'first' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: (currentPage === 1 || loading) ? 0.5 : 1,
              cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            onMouseEnter={() => !(currentPage === 1 || loading) && setHoveredPaginationNavButton('prev')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'prev' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: (currentPage === 1 || loading) ? 0.5 : 1,
              cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {[...Array(Math.min(7, pagination.totalPages))].map((_, i) => {
            const pageNum = i + 1;
            if (pagination.totalPages > 7) {
              // Show first, last, and pages around current
              if (pageNum === 1 || pageNum === pagination.totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    onMouseEnter={() => !loading && currentPage !== pageNum && setHoveredPaginationButtonIndex(pageNum)}
                    onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                    className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: currentPage === pageNum
                        ? '#2563eb'
                        : (hoveredPaginationButtonIndex === pageNum ? '#f9fafb' : 'white'),
                      border: currentPage === pageNum ? 'none' : '1px solid #d1d5db',
                      color: currentPage === pageNum ? 'white' : '#374151',
                      opacity: loading ? 0.5 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                return <span key={pageNum} className="px-1 text-xs" style={{ color: '#9ca3af' }}>...</span>;
              }
              return null;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                disabled={loading}
                onMouseEnter={() => !loading && currentPage !== pageNum && setHoveredPaginationButtonIndex(pageNum)}
                onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: currentPage === pageNum
                    ? '#2563eb'
                    : (hoveredPaginationButtonIndex === pageNum ? '#f9fafb' : 'white'),
                  border: currentPage === pageNum ? 'none' : '1px solid #d1d5db',
                  color: currentPage === pageNum ? 'white' : '#374151',
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages || loading}
            onMouseEnter={() => !(currentPage >= pagination.totalPages || loading) && setHoveredPaginationNavButton('next')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'next' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: (currentPage >= pagination.totalPages || loading) ? 0.5 : 1,
              cursor: (currentPage >= pagination.totalPages || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(pagination.totalPages)}
            disabled={currentPage >= pagination.totalPages || loading}
            onMouseEnter={() => !(currentPage >= pagination.totalPages || loading) && setHoveredPaginationNavButton('last')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'last' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: (currentPage >= pagination.totalPages || loading) ? 0.5 : 1,
              cursor: (currentPage >= pagination.totalPages || loading) ? 'not-allowed' : 'pointer'
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
            disabled={loading}
            className="px-2.5 py-1 border rounded text-xs font-semibold"
            style={{
              borderColor: '#d1d5db',
              color: '#374151',
              outline: 'none',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onFocus={(e) => {
              if (!loading) {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
              }
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
          <span className="text-xs font-semibold" style={{ color: '#374151' }}>
            {pagination.total} {t.itemsCount}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-lg border min-h-0 relative" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: '#6b7280' }}>
            {t.noCompaniesYet}
          </div>
        ) : (
          <div className="overflow-x-auto h-full">
            <table className="w-full">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="px-3 py-2 text-center text-xs font-semibold border-b w-10" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.size === companies.length && companies.length > 0}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 rounded"
                      style={{
                        accentColor: '#2563eb',
                        borderColor: '#d1d5db'
                      }}
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colId}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colCompanyName}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colCompanyCode}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colLocation}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colWebsite}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colJobCount}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colStatus}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colCreatedAt}</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                {companies.map((company, index) => (
                  <tr
                    key={company.id}
                    className="transition-colors"
                    onMouseEnter={() => setHoveredRowIndex(index)}
                    onMouseLeave={() => setHoveredRowIndex(null)}
                    style={{
                      backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                    }}
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
                        onClick={() => navigate(`/admin/companies/${company.id}`)}
                        onMouseEnter={() => setHoveredCompanyIdLinkIndex(index)}
                        onMouseLeave={() => setHoveredCompanyIdLinkIndex(null)}
                        className="font-medium text-xs flex items-center gap-1"
                        style={{
                          color: hoveredCompanyIdLinkIndex === index ? '#1e40af' : '#2563eb'
                        }}
                      >
                        {company.id}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-[10px]" style={{ backgroundColor: '#2563eb' }}>
                            {company.name?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/admin/companies/${company.id}`)}
                          onMouseEnter={() => setHoveredCompanyNameLinkIndex(index)}
                          onMouseLeave={() => setHoveredCompanyNameLinkIndex(null)}
                          className="text-xs font-semibold"
                          style={{
                            color: hoveredCompanyNameLinkIndex === index ? '#2563eb' : '#111827'
                          }}
                        >
                          {company.name || '—'}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-medium" style={{ color: '#374151' }}>{company.companyCode || '—'}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                        {getLocationLabel(company.type)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onMouseEnter={() => setHoveredWebsiteLinkIndex(index)}
                          onMouseLeave={() => setHoveredWebsiteLinkIndex(null)}
                          className="text-xs flex items-center gap-1"
                          style={{
                            color: hoveredWebsiteLinkIndex === index ? '#1e40af' : '#2563eb'
                          }}
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{t.colWebsite}</span>
                        </a>
                      ) : (
                        <span className="text-xs" style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => navigate(`/admin/jobs?company=${company.id}`)}
                        onMouseEnter={() => setHoveredJobCountLinkIndex(index)}
                        onMouseLeave={() => setHoveredJobCountLinkIndex(null)}
                        className="text-xs font-semibold flex items-center gap-1"
                        style={{
                          color: hoveredJobCountLinkIndex === index ? '#1e40af' : '#2563eb'
                        }}
                      >
                        <Briefcase className="w-3 h-3" />
                        {company.jobsCount || 0}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleToggleStatus(company)}
                        onMouseEnter={() => setHoveredToggleStatusButtonIndex(index)}
                        onMouseLeave={() => setHoveredToggleStatusButtonIndex(null)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors"
                        style={{
                          backgroundColor: company.status
                            ? (hoveredToggleStatusButtonIndex === index ? '#bbf7d0' : '#dcfce7')
                            : (hoveredToggleStatusButtonIndex === index ? '#fecaca' : '#fee2e2'),
                          color: company.status ? '#166534' : '#991b1b'
                        }}
                      >
                        {company.status ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {company.status ? t.statusActive : t.statusInactive}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {formatDate(company.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/companies/${company.id}`)}
                          onMouseEnter={() => setHoveredViewButtonIndex(index)}
                          onMouseLeave={() => setHoveredViewButtonIndex(null)}
                          className="p-1 rounded transition-colors"
                          style={{
                            color: hoveredViewButtonIndex === index ? '#1e40af' : '#2563eb',
                            backgroundColor: hoveredViewButtonIndex === index ? '#eff6ff' : 'transparent'
                          }}
                          title={t.viewDetailTooltip}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/companies/${company.id}/edit`)}
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
                        <button
                          onClick={() => handleDelete(company.id, company.name)}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
