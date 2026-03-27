import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronsUpDown,
  MapPin,
  Calendar as CalendarIcon,
  Edit,
  Trash2,
} from 'lucide-react';

const EventsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [eventDateFrom, setEventDateFrom] = useState('');
  const [eventDateTo, setEventDateTo] = useState('');
  const [sortOption, setSortOption] = useState('eventDateDesc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [hoveredAddEventButton, setHoveredAddEventButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredEditButtonIndex, setHoveredEditButtonIndex] = useState(null);
  const [hoveredDeleteButtonIndex, setHoveredDeleteButtonIndex] = useState(null);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isSortFilterOpen, setIsSortFilterOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentPage, itemsPerPage, selectedStatus, sortOption, searchQuery, eventDateFrom, eventDateTo]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      let sortBy = 'start_at';
      let sortOrder = 'DESC';
      if (sortOption.startsWith('alphabet')) {
        sortBy = 'title';
        sortOrder = sortOption === 'alphabetDesc' ? 'DESC' : 'ASC';
      } else if (sortOption.startsWith('eventDate')) {
        sortBy = 'start_at';
        sortOrder = sortOption === 'eventDateAsc' ? 'ASC' : 'DESC';
      }
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
      };
      if (searchQuery?.trim()) params.search = searchQuery.trim();
      if (selectedStatus === 'active') params.status = 1;
      if (selectedStatus === 'ended') params.status = 0;
      if (eventDateFrom) params.eventDateFrom = eventDateFrom;
      if (eventDateTo) params.eventDateTo = eventDateTo;
      const response = await apiService.getAdminEvents(params);
      if (response.success && response.data) {
        setEvents(response.data.events || []);
        setPagination(response.data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = pagination.total || 0;
  const totalPages = Math.max(1, pagination.totalPages || 1);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setEventDateFrom('');
    setEventDateTo('');
    setCurrentPage(1);
    loadEvents();
  };

  const handleEdit = (eventId) => {
    navigate(`/admin/events/${eventId}/edit`);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm(t.eventsConfirmDelete || 'Bạn có chắc muốn xóa sự kiện này?')) {
      try {
        const response = await apiService.deleteAdminEvent(eventId);
        if (response.success) {
          loadEvents();
        } else {
          alert(response.message || t.eventsDeleteError || 'Xóa thất bại');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(error.message || t.eventsDeleteError || 'Xóa thất bại');
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(
      language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN'
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="px-2 sm:px-3 py-1.5 mb-1.5 flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap justify-between">
          <div className="flex items-stretch rounded-lg border border-red-500 bg-white text-[12px] sm:text-[13px] w-full max-w-[500px] overflow-hidden shadow-sm">
            <div className="flex flex-1 items-center gap-2 pl-3 pr-2 py-1.5 min-w-0">
              <Search className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
              <input
                type="text"
                placeholder={t.eventsSearchPlaceholder || 'Tên sự kiện, địa điểm...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 min-w-0 bg-transparent outline-none text-[12px] sm:text-[13px] text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="px-4 py-1.5 rounded-r-lg bg-red-500 text-white font-semibold text-[12px] sm:text-[13px] hover:bg-red-600 transition-colors flex-shrink-0"
            >
              Tìm kiếm
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* Ngày diễn ra */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsDateFilterOpen(!isDateFilterOpen);
                  setIsStatusFilterOpen(false);
                  setIsSortFilterOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[11px] sm:text-xs font-semibold border border-red-500"
                style={{ color: '#374151' }}
              >
                Ngày diễn ra
                <ChevronDown className="w-3 h-3" />
              </button>
              {isDateFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-white p-3 z-20 text-[11px] sm:text-xs" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-700">Từ ngày</span>
                      <input
                        type="date"
                        value={eventDateFrom}
                        onChange={(e) => setEventDateFrom(e.target.value)}
                        className="px-2 py-1 border rounded"
                        style={{ borderColor: '#d1d5db', outline: 'none' }}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-700">Đến ngày</span>
                      <input
                        type="date"
                        value={eventDateTo}
                        onChange={(e) => setEventDateTo(e.target.value)}
                        className="px-2 py-1 border rounded"
                        style={{ borderColor: '#d1d5db', outline: 'none' }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEventDateFrom('');
                        setEventDateTo('');
                      }}
                      className="self-end mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}
                    >
                      Xóa lọc
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trạng thái */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsStatusFilterOpen(!isStatusFilterOpen);
                  setIsDateFilterOpen(false);
                  setIsSortFilterOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[11px] sm:text-xs font-semibold border border-red-500"
                style={{ color: '#374151' }}
              >
                Trạng thái
                <ChevronDown className="w-3 h-3" />
              </button>
              {isStatusFilterOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-white p-3 z-20 text-[11px] sm:text-xs" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="event-status-filter"
                        value=""
                        checked={selectedStatus === ''}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-3.5 h-3.5"
                      />
                      <span>Tất cả</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="event-status-filter"
                        value="active"
                        checked={selectedStatus === 'active'}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-3.5 h-3.5"
                      />
                      <span>{t.eventsStatusActive || 'Đang diễn ra'}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="event-status-filter"
                        value="ended"
                        checked={selectedStatus === 'ended'}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-3.5 h-3.5"
                      />
                      <span>{t.eventsStatusEnded || 'Đã kết thúc'}</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Sắp xếp */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSortFilterOpen(!isSortFilterOpen);
                  setIsDateFilterOpen(false);
                  setIsStatusFilterOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[11px] sm:text-xs font-semibold border border-red-500"
                style={{ color: '#374151' }}
              >
                Sắp xếp
                <ChevronDown className="w-3 h-3" />
              </button>
              {isSortFilterOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border bg-white p-3 z-20 text-[11px] sm:text-xs" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-gray-700">Tên</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSortOption((prev) => (prev === 'alphabetAsc' ? 'alphabetDesc' : 'alphabetAsc'));
                          setCurrentPage(1);
                        }}
                        className="px-2.5 py-0.5 rounded-full border flex items-center gap-1 text-[10px]"
                        style={{
                          borderColor: sortOption.startsWith('alphabet') ? '#2563eb' : '#e5e7eb',
                          backgroundColor: sortOption.startsWith('alphabet') ? '#eff6ff' : 'white',
                          color: sortOption.startsWith('alphabet') ? '#1d4ed8' : '#4b5563',
                        }}
                      >
                        <ChevronsUpDown className="w-3 h-3" />
                        <span>{sortOption === 'alphabetDesc' ? 'Z–A' : 'A–Z'}</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-gray-700">Ngày diễn ra</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSortOption((prev) => (prev === 'eventDateAsc' ? 'eventDateDesc' : 'eventDateAsc'));
                          setCurrentPage(1);
                        }}
                        className="px-2.5 py-0.5 rounded-full border flex items-center gap-1 text-[10px]"
                        style={{
                          borderColor: sortOption.startsWith('eventDate') ? '#2563eb' : '#e5e7eb',
                          backgroundColor: sortOption.startsWith('eventDate') ? '#eff6ff' : 'white',
                          color: sortOption.startsWith('eventDate') ? '#1d4ed8' : '#4b5563',
                        }}
                      >
                        <ChevronsUpDown className="w-3 h-3" />
                        <span>{sortOption === 'eventDateAsc' ? 'Cũ → Mới' : 'Mới → Cũ'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/admin/events/new')}
              onMouseEnter={() => setHoveredAddEventButton(true)}
              onMouseLeave={() => setHoveredAddEventButton(false)}
              className="px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1.5"
              style={{
                backgroundColor: hoveredAddEventButton ? '#b91c1c' : '#dc2626',
                color: 'white',
              }}
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Thêm sự kiện</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 sm:px-3 mb-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('first')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="w-5 h-5 border rounded-full text-[8px] font-semibold flex items-center justify-center transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'first' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('prev')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="w-5 h-5 border rounded-full text-[8px] font-semibold flex items-center justify-center transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'prev' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
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
                className="w-5 h-5 rounded-full text-[8px] font-semibold flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: currentPage === pageNum ? '#ef4444' : hoveredPaginationButtonIndex === pageNum ? '#fef2f2' : 'white',
                  border: currentPage === pageNum ? 'none' : '1px solid #d1d5db',
                  color: currentPage === pageNum ? 'white' : '#374151',
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
            className="w-5 h-5 border rounded-full text-[8px] font-semibold flex items-center justify-center transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'next' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationNavButton('last')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="w-5 h-5 border rounded-full text-[8px] font-semibold flex items-center justify-center transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'last' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-0.5 border rounded-full text-[10px] font-semibold"
            style={{ borderColor: '#d1d5db', color: '#374151', outline: 'none' }}
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
          <span className="text-[10px] font-semibold" style={{ color: '#374151' }}>
            {totalItems} {t.eventsTotalItemsSuffix || 'sự kiện'}
          </span>
        </div>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto min-h-0 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: '#6b7280' }}>
            {t.eventsLoading || 'Đang tải dữ liệu...'}
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: '#6b7280' }}>
            {t.eventsNoData || 'Chưa có sự kiện'}
          </div>
        ) : (
          <div className="p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            {events.map((evt, index) => {
              const isEnded = evt.end_at && new Date(evt.end_at) < new Date();
              const statusLabel = isEnded ? (t.eventsStatusEnded || 'Đã kết thúc') : (t.eventsStatusActive || 'Đang diễn ra');
              return (
                <div
                  key={evt.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/admin/events/${evt.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/admin/events/${evt.id}`);
                    }
                  }}
                  onMouseEnter={() => setHoveredRowIndex(index)}
                  onMouseLeave={() => setHoveredRowIndex(null)}
                  className="relative text-left bg-white rounded-xl border shadow-[0_8px_20px_rgba(15,23,42,0.06)] px-3 sm:px-3.5 py-3 sm:py-3.5 flex flex-col gap-2.5 transition-transform transition-shadow cursor-pointer"
                  style={{
                    borderColor: hoveredRowIndex === index ? '#bfdbfe' : '#e5e7eb',
                    transform: hoveredRowIndex === index ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                >
                  <div className="absolute top-2 left-3 flex items-center gap-1">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                      {statusLabel}
                    </span>
                  </div>
                  <div className="pt-3 flex flex-col gap-1.5">
                    <p className="text-[11px] sm:text-xs font-semibold pr-16" style={{ color: '#111827' }}>
                      {evt.title || evt.name || 'Sự kiện'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px]" style={{ color: '#4b5563' }}>
                      <CalendarIcon className="w-3 h-3 flex-shrink-0" style={{ color: '#9ca3af' }} />
                      <span>{formatDate(evt.start_at)} → {formatDate(evt.end_at)}</span>
                    </div>
                    {evt.location && (
                      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px]" style={{ color: '#4b5563' }}>
                        <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: '#9ca3af' }} />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(evt.id);
                      }}
                      onMouseEnter={() => setHoveredEditButtonIndex(index)}
                      onMouseLeave={() => setHoveredEditButtonIndex(null)}
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-1"
                      style={{
                        backgroundColor: hoveredEditButtonIndex === index ? '#eff6ff' : 'transparent',
                        color: hoveredEditButtonIndex === index ? '#1e40af' : '#2563eb',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      {t.viewDetailShort || t.viewDetail || 'Chi tiết'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(evt.id);
                      }}
                      onMouseEnter={() => setHoveredDeleteButtonIndex(index)}
                      onMouseLeave={() => setHoveredDeleteButtonIndex(null)}
                      className="p-1 rounded-full"
                      style={{
                        backgroundColor: hoveredDeleteButtonIndex === index ? '#fee2e2' : 'transparent',
                        color: hoveredDeleteButtonIndex === index ? '#991b1b' : '#dc2626',
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
