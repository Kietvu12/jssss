import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import {
  Search,
  UserCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Mail,
  Phone,
} from 'lucide-react';

const MyAssignedCollaboratorsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const dateLocale = language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN';
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);

  useEffect(() => {
    loadMyAssigned();
  }, [currentPage, itemsPerPage]);

  const loadMyAssigned = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: 1
      };
      if (searchQuery) params.search = searchQuery;

      const response = await apiService.getMyAssignedCollaborators(params);
      if (response.success && response.data) {
        setAssignments(response.data.assignments || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading assigned CVs:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadMyAssigned();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
          <UserCheck className="w-6 h-6" style={{ color: '#2563eb' }} />
          {t.myAssignedTitle || 'Hồ sơ được giao cho tôi'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
          {t.myAssignedSubtitle || 'Danh sách hồ sơ ứng viên được Super Admin giao cho bạn phụ trách'}
        </p>
      </div>

      <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder={t.myAssignedSearchPlaceholder || 'Tìm theo tên, email, mã hồ sơ...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
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
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              backgroundColor: hoveredSearchButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            {t.searchButton || 'Tìm kiếm'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
            <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>{t.myAssignedLoading || 'Đang tải...'}</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2" style={{ color: '#9ca3af' }} />
            <p className="text-sm" style={{ color: '#6b7280' }}>{t.myAssignedNoData || 'Bạn chưa được giao hồ sơ nào'}</p>
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{t.myAssignedNoDataHint || 'Vui lòng liên hệ Super Admin để được giao hồ sơ phụ trách'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>{t.myAssignedColCandidate || 'Hồ sơ ứng viên'}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>{t.myAssignedColAssignedDate || 'Ngày giao'}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>{t.colActions || 'Thao tác'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {assignments.map((assignment, index) => {
                    const cv = assignment.cvStorage;
                    return (
                      <tr
                        key={assignment.id}
                        style={{
                          backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                        }}
                        onMouseEnter={() => setHoveredRowIndex(index)}
                        onMouseLeave={() => setHoveredRowIndex(null)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: '#dbeafe' }}>
                              <FileText className="w-5 h-5" style={{ color: '#2563eb' }} />
                            </div>
                            <div>
                              <div className="text-sm font-medium" style={{ color: '#111827' }}>
                                {cv?.name || '—'}
                              </div>
                              <div className="text-xs flex items-center gap-2 mt-1" style={{ color: '#6b7280' }}>
                                <span>Mã: {cv?.code || '—'}</span>
                              </div>
                              <div className="text-xs flex items-center gap-2 mt-1" style={{ color: '#6b7280' }}>
                                <Mail className="w-3 h-3" />
                                {cv?.email || '—'}
                              </div>
                              {cv?.phone && (
                                <div className="text-xs flex items-center gap-2 mt-1" style={{ color: '#6b7280' }}>
                                  <Phone className="w-3 h-3" />
                                  {cv.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm" style={{ color: '#111827' }}>
                            {formatDate(assignment.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/candidates/${cv?.id}`)}
                              onMouseEnter={() => setHoveredViewButtonIndex(index)}
                              onMouseLeave={() => setHoveredViewButtonIndex(null)}
                              className="p-1.5 rounded transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                              style={{
                                color: '#2563eb',
                                backgroundColor: hoveredViewButtonIndex === index ? '#eff6ff' : 'transparent'
                              }}
                              title={t.myAssignedViewProfileTooltip || 'Xem chi tiết hồ sơ'}
                            >
                              <Eye className="w-4 h-4" />
                              {t.myAssignedViewProfile || 'Xem hồ sơ'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: '#e5e7eb' }}>
                <div className="text-sm" style={{ color: '#374151' }}>
                  {t.myAssignedPaginationShow || 'Hiển thị'} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} {t.myAssignedPaginationOf || 'của'} {pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('first')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="p-1.5 border rounded transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: hoveredPaginationNavButton === 'first' ? '#f9fafb' : 'transparent',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('prev')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="p-1.5 border rounded transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: hoveredPaginationNavButton === 'prev' ? '#f9fafb' : 'transparent',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm" style={{ color: '#374151' }}>
                    {t.myAssignedPageLabel || 'Trang'} {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                    onMouseEnter={() => currentPage < pagination.totalPages && setHoveredPaginationNavButton('next')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="p-1.5 border rounded transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: hoveredPaginationNavButton === 'next' ? '#f9fafb' : 'transparent',
                      opacity: currentPage === pagination.totalPages ? 0.5 : 1,
                      cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages}
                    onMouseEnter={() => currentPage < pagination.totalPages && setHoveredPaginationNavButton('last')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="p-1.5 border rounded transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: hoveredPaginationNavButton === 'last' ? '#f9fafb' : 'transparent',
                      opacity: currentPage === pagination.totalPages ? 0.5 : 1,
                      cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyAssignedCollaboratorsPage;
