import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import {
  Search,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const CollaboratorApprovalPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: 0, // Chỉ tài khoản chưa kích hoạt (inactive)
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await apiService.getCollaborators(params);
      if (response.success && response.data) {
        setCollaborators(response.data.collaborators || []);
        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            limit: itemsPerPage,
            totalPages: 0,
          }
        );
      }
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, [currentPage, itemsPerPage]);

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(collaborators.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleApproveBulk = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      alert(t.collaboratorApprovalNoSelection);
      return;
    }
    if (!window.confirm(t.collaboratorApprovalConfirmBulk.replace('{count}', ids.length))) return;
    try {
      setApproving(true);
      const response = await apiService.approveCollaboratorsBulk(ids);
      if (response.success) {
        alert(response.message || t.collaboratorApprovalSuccess);
        setSelectedIds(new Set());
        loadCollaborators();
      } else {
        alert(response.message || t.collaboratorApprovalFailure);
      }
    } catch (error) {
      alert(error.message || t.collaboratorApprovalErrorGeneric);
    } finally {
      setApproving(false);
    }
  };

  const handleApproveOne = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(t.collaboratorApprovalConfirmOne)) return;
    try {
      setApproving(true);
      const response = await apiService.approveCollaborator(id);
      if (response.success) {
        alert(t.collaboratorApprovalSuccess);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        loadCollaborators();
      } else {
        alert(response.message || t.collaboratorApprovalFailure);
      }
    } catch (error) {
      alert(error.message || t.collaboratorApprovalErrorGeneric);
    } finally {
      setApproving(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCollaborators();
  };

  const allSelected = collaborators.length > 0 && selectedIds.size === collaborators.length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="rounded-lg p-3 border mb-3 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <h1 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>
          {t.collaboratorApprovalTitle}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder={t.collaboratorApprovalSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-1.5 border rounded text-sm"
              style={{ borderColor: '#d1d5db', outline: 'none' }}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 rounded text-sm font-semibold flex items-center gap-1.5 text-white"
            style={{ backgroundColor: '#2563eb' }}
          >
            <Search className="w-4 h-4" />
            {t.search}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1.5 rounded text-sm font-semibold border"
            style={{ borderColor: '#d1d5db', color: '#374151' }}
          >
            {t.collaboratorApprovalClearSelection}
          </button>
          <button
            onClick={handleApproveBulk}
            disabled={approving || selectedIds.size === 0}
            className="px-4 py-1.5 rounded text-sm font-semibold flex items-center gap-1.5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#16a34a' }}
          >
            <CheckCircle className="w-4 h-4" />
            {t.collaboratorApprovalApproveSelected} ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-1.5 py-1 border rounded text-xs font-semibold disabled:opacity-50"
            style={{ borderColor: '#d1d5db', color: '#374151' }}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-1.5 py-1 border rounded text-xs font-semibold disabled:opacity-50"
            style={{ borderColor: '#d1d5db', color: '#374151' }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs" style={{ color: '#374151' }}>
            {t.pageOf} {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-1.5 py-1 border rounded text-xs font-semibold disabled:opacity-50"
            style={{ borderColor: '#d1d5db', color: '#374151' }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="px-1.5 py-1 border rounded text-xs font-semibold disabled:opacity-50"
            style={{ borderColor: '#d1d5db', color: '#374151' }}
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
            className="px-2 py-1 border rounded text-xs"
            style={{ borderColor: '#d1d5db', outline: 'none' }}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-xs" style={{ color: '#374151' }}>{totalItems} {t.collaboratorApprovalPendingCountLabel}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-lg border min-h-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <table className="w-full">
          <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th className="px-3 py-2 text-center text-xs font-semibold border-b w-12" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#2563eb' }}
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Mã CTV</th>
              <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colName}</th>
              <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colEmail}</th>
              <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colPhone}</th>
              <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colRegisteredDate}</th>
              <th className="px-3 py-2 text-center text-xs font-semibold border-b w-28" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-3 py-8 text-center text-sm" style={{ color: '#6b7280' }}>
                  {t.loadingData}
                </td>
              </tr>
            ) : collaborators.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-3 py-8 text-center text-sm" style={{ color: '#6b7280' }}>
                  {t.noCollaboratorsPendingApproval}
                </td>
              </tr>
            ) : (
              collaborators.map((c) => {
                const createdAt = c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString(
                      language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN'
                    )
                  : '-';
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50"
                    onClick={() => navigate(`/admin/collaborators/${c.id}`)}
                  >
                    <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => handleSelectRow(c.id)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#2563eb' }}
                      />
                    </td>
                    <td className="px-3 py-2 text-sm" style={{ color: '#111827' }}>{c.code || '-'}</td>
                    <td className="px-3 py-2 text-sm" style={{ color: '#111827' }}>{c.name || '-'}</td>
                    <td className="px-3 py-2 text-sm" style={{ color: '#374151' }}>{c.email || '-'}</td>
                    <td className="px-3 py-2 text-sm" style={{ color: '#374151' }}>{c.phone || '-'}</td>
                    <td className="px-3 py-2 text-sm" style={{ color: '#374151' }}>{createdAt}</td>
                    <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleApproveOne(c.id, e)}
                        disabled={approving}
                        className="px-2 py-1 rounded text-xs font-semibold text-white disabled:opacity-50"
                        style={{ backgroundColor: '#16a34a' }}
                      >
                        {t.approve}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollaboratorApprovalPage;
