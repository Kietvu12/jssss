import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Mail,
  Plus,
  RefreshCw,
  Send,
  Search,
  Trash2,
  Power,
  PowerOff,
  CheckCircle,
  Circle,
  Paperclip,
  ChevronRight,
  Building2,
  Users,
  UserCircle,
  X
} from 'lucide-react';
import apiService from '../../services/api';

const FOLDERS = [
  { id: 'inbox', label: 'Hộp thư đến', icon: Mail },
  { id: 'sentitems', label: 'Đã gửi', icon: Send },
  { id: 'drafts', label: 'Bản nháp', icon: Mail }
];

const RECIPIENT_TYPE = { to: 'Đến', cc: 'CC', bcc: 'BCC' };

const EmailsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [connections, setConnections] = useState([]);
  const [emails, setEmails] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ folder: 'inbox', isRead: '', search: '' });
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'compose'
  const [composeData, setComposeData] = useState({
    connectionId: '',
    subject: '',
    body: '',
    recipients: [] // [{ email, label, type: 'to'|'cc'|'bcc' }]
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState('to');
  const [companyEmails, setCompanyEmails] = useState([]);
  const [collaboratorEmails, setCollaboratorEmails] = useState([]);
  const [groupEmails, setGroupEmails] = useState([]);
  const [loadingPicker, setLoadingPicker] = useState(false);
  const [pickerSource, setPickerSource] = useState('companies'); // companies | collaborators | groups
  const [pickerSelections, setPickerSelections] = useState([]);

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const email = searchParams.get('email');
    if (success === 'connected' && email) {
      alert(`Đã kết nối thành công với ${email}`);
      setSearchParams({});
      loadConnections();
    } else if (error) {
      alert(`Lỗi kết nối: ${error}`);
      setSearchParams({});
    } else {
      loadConnections();
    }
  }, []);

  useEffect(() => {
    if (selectedConnection) loadEmails();
  }, [selectedConnection, pagination.page, filters]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOutlookConnections();
      if (response.success && response.data?.length > 0) {
        setConnections(response.data);
        if (!selectedConnection) {
          setSelectedConnection(response.data[0].id);
          setComposeData(prev => ({ ...prev, connectionId: response.data[0].id }));
        }
      } else {
        setConnections([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadEmails = async () => {
    if (!selectedConnection) return;
    try {
      setLoading(true);
      const params = {
        connectionId: selectedConnection,
        folder: filters.folder,
        page: pagination.page,
        limit: pagination.limit
      };
      if (filters.isRead !== '') params.isRead = filters.isRead;
      if (filters.search) params.search = filters.search;
      const response = await apiService.getSyncedEmails(params);
      if (response.success) {
        setEmails(response.data.emails || []);
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCompaniesForPicker = useCallback(async () => {
    try {
      setLoadingPicker(true);
      const res = await apiService.getCompanies({ limit: 500, include: 'emailAddresses' });
      if (res.success && res.data?.companies) {
        const flat = [];
        res.data.companies.forEach(c => {
          (c.emailAddresses || []).forEach(ea => {
            flat.push({ email: ea.email, label: `${c.name} (${ea.email})`, source: 'company', companyId: c.id, emailId: ea.id });
          });
        });
        setCompanyEmails(flat);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPicker(false);
    }
  }, []);

  const loadCollaboratorsForPicker = useCallback(async () => {
    try {
      setLoadingPicker(true);
      const res = await apiService.getCollaborators({ limit: 500 });
      if (res.success && res.data?.collaborators) {
        const flat = res.data.collaborators
          .filter(c => c.email)
          .map(c => ({ email: c.email, label: `${c.name || c.email} (${c.email})`, source: 'collaborator', id: c.id }));
        setCollaboratorEmails(flat);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPicker(false);
    }
  }, []);

  const loadGroupsForPicker = useCallback(async () => {
    try {
      setLoadingPicker(true);
      const res = await apiService.getGroups({ limit: 100 });
      if (res.success && res.data?.groups) {
        const flat = [];
        res.data.groups.forEach(g => {
          (g.admins || []).forEach(a => {
            if (a.email) flat.push({ email: a.email, label: `${g.name} - ${a.name} (${a.email})`, source: 'group', groupId: g.id, adminId: a.id });
          });
        });
        setGroupEmails(flat);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPicker(false);
    }
  }, []);

  const handleConnect = async () => {
    try {
      const res = await apiService.getOutlookAuthorizationUrl();
      if (res.success) window.location.href = res.data.authorizationUrl;
    } catch (e) {
      alert('Lỗi kết nối Outlook: ' + (e.message || 'Unknown'));
    }
  };

  const handleSync = async () => {
    if (!selectedConnection) return;
    try {
      setSyncing(true);
      const res = await apiService.syncOutlookEmails({ connectionId: selectedConnection, folder: filters.folder, limit: 100 });
      if (res.success) {
        alert(`Đồng bộ: ${res.data.syncedCount} mới, ${res.data.updatedCount} cập nhật`);
        loadEmails();
        loadConnections();
      }
    } catch (e) {
      alert('Lỗi đồng bộ: ' + (e.message || 'Unknown'));
    } finally {
      setSyncing(false);
    }
  };

  const handleEmailClick = async (email) => {
    try {
      const res = await apiService.getSyncedEmailDetail(email.id);
      if (res.success) {
        setSelectedEmail(res.data);
        if (!email.isRead) {
          await apiService.markEmailAsRead(email.id);
          loadEmails();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addRecipients = (type) => {
    setPickerType(type);
    setPickerOpen(true);
    setPickerSelections([]);
    if (pickerSource === 'companies') loadCompaniesForPicker();
    else if (pickerSource === 'collaborators') loadCollaboratorsForPicker();
    else loadGroupsForPicker();
  };

  const applyPicker = () => {
    const list = pickerSource === 'companies' ? companyEmails : pickerSource === 'collaborators' ? collaboratorEmails : groupEmails;
    const toAdd = list.filter((_, i) => pickerSelections.includes(i)).map(item => ({ email: item.email, label: item.label, type: pickerType }));
    setComposeData(prev => ({
      ...prev,
      recipients: [...prev.recipients, ...toAdd]
    }));
    setPickerOpen(false);
    setPickerSelections([]);
  };

  const removeRecipient = (index) => {
    setComposeData(prev => ({ ...prev, recipients: prev.recipients.filter((_, i) => i !== index) }));
  };

  const setRecipientType = (index, type) => {
    setComposeData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => (i === index ? { ...r, type } : r))
    }));
  };

  const handleSendEmail = async () => {
    const to = composeData.recipients.filter(r => r.type === 'to').map(r => r.email);
    if (!to.length || !composeData.subject?.trim()) {
      alert('Vui lòng thêm ít nhất một người nhận (Đến) và tiêu đề.');
      return;
    }
    try {
      setLoading(true);
      const res = await apiService.sendOutlookEmail({
        connectionId: composeData.connectionId || selectedConnection,
        to,
        cc: composeData.recipients.filter(r => r.type === 'cc').map(r => r.email),
        bcc: composeData.recipients.filter(r => r.type === 'bcc').map(r => r.email),
        subject: composeData.subject,
        body: composeData.body || '',
        bodyType: 'HTML'
      });
      if (res.success) {
        alert('Đã gửi email thành công.');
        setView('list');
        setComposeData({ connectionId: selectedConnection || '', subject: '', body: '', recipients: [] });
        // Chuyển sang "Đã gửi" và tải lại (backend đã đồng bộ sentitems vào DB sau khi gửi)
        setFilters(prev => ({ ...prev, folder: 'sentitems' }));
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    } catch (e) {
      alert('Lỗi gửi email: ' + (e.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (id) => {
    if (!confirm('Xóa kết nối này?')) return;
    try {
      const res = await apiService.deleteOutlookConnection(id);
      if (res.success) {
        loadConnections();
        if (selectedConnection === id) setSelectedConnection(null);
      }
    } catch (e) {
      alert('Lỗi: ' + (e.message || 'Unknown'));
    }
  };

  const handleToggleSync = async (id) => {
    try {
      await apiService.toggleOutlookSync(id);
      loadConnections();
    } catch (e) {
      alert('Lỗi: ' + (e.message || 'Unknown'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const pickerList = pickerSource === 'companies' ? companyEmails : pickerSource === 'collaborators' ? collaboratorEmails : groupEmails;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Left sidebar - Outlook style */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-3 border-b border-slate-200">
          <button
            onClick={() => { setView('compose'); setSelectedEmail(null); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#2563eb', color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            Soạn thư
          </button>
        </div>
        <div className="p-2">
          {FOLDERS.map(f => (
            <button
              key={f.id}
              onClick={() => { setFilters(prev => ({ ...prev, folder: f.id })); setPagination(prev => ({ ...prev, page: 1 })); setSelectedEmail(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: filters.folder === f.id ? '#eff6ff' : 'transparent',
                color: filters.folder === f.id ? '#1d4ed8' : '#475569',
                fontWeight: filters.folder === f.id ? 600 : 400
              }}
            >
              <f.icon className="w-4 h-4 flex-shrink-0" />
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-2 border-t border-slate-200">
          <p className="px-2 py-1 text-xs font-medium text-slate-400 uppercase tracking-wider">Tài khoản</p>
          {connections.length === 0 && !loading && (
            <button
              onClick={handleConnect}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ color: '#2563eb' }}
            >
              <Mail className="w-4 h-4" />
              Kết nối Outlook
            </button>
          )}
          {connections.map(conn => (
            <div
              key={conn.id}
              className="rounded-lg border cursor-pointer transition-colors mb-1"
              style={{
                borderColor: selectedConnection === conn.id ? '#93c5fd' : 'transparent',
                backgroundColor: selectedConnection === conn.id ? 'rgba(239, 246, 255, 0.8)' : 'transparent'
              }}
              onClick={() => { setSelectedConnection(conn.id); setComposeData(prev => ({ ...prev, connectionId: conn.id })); }}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-700 truncate flex-1">{conn.email}</span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleSync(conn.id); }}
                    className="p-1 rounded"
                    style={{ color: conn.syncEnabled ? '#16a34a' : '#64748b' }}
                    title={conn.syncEnabled ? 'Tắt đồng bộ' : 'Bật đồng bộ'}
                  >
                    {conn.syncEnabled ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteConnection(conn.id); }}
                    className="p-1 rounded"
                    style={{ color: '#dc2626' }}
                    title="Xóa kết nối"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedConnection && (
          <div className="p-2 border-t border-slate-200">
            <button
              onClick={handleConnect}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ color: '#64748b' }}
            >
              <Plus className="w-3 h-3" />
              Thêm tài khoản
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ color: '#64748b', opacity: syncing ? 0.6 : 1 }}
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
            </button>
          </div>
        )}
      </div>

      {/* Center - Email list */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        <div className="p-2 border-b border-slate-200 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm trong thư..."
              value={filters.search}
              onChange={(e) => { setFilters(prev => ({ ...prev, search: e.target.value })); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filters.isRead}
            onChange={(e) => { setFilters(prev => ({ ...prev, isRead: e.target.value })); setPagination(prev => ({ ...prev, page: 1 })); }}
            className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="false">Chưa đọc</option>
            <option value="true">Đã đọc</option>
          </select>
        </div>
        <div className="flex-1 overflow-auto">
          {!selectedConnection && (
            <div className="p-6 text-center text-slate-500 text-sm">Chọn hoặc kết nối tài khoản Outlook</div>
          )}
          {selectedConnection && loading && emails.length === 0 && (
            <div className="p-6 flex flex-col items-center justify-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm">Đang tải...</span>
            </div>
          )}
          {selectedConnection && !loading && emails.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">Không có thư nào</div>
          )}
          {selectedConnection && emails.length > 0 && (
            <div className="divide-y divide-slate-100">
              {emails.map((email, index) => (
                <div
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  className="px-3 py-2.5 cursor-pointer transition-colors flex gap-2"
                  style={{
                    backgroundColor: selectedEmail?.id === email.id ? '#eff6ff' : !email.isRead ? 'rgba(248, 250, 252, 0.9)' : 'transparent'
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5" style={{ color: email.isRead ? '#cbd5e1' : '#3b82f6' }}>
                    {email.isRead ? <Circle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium text-slate-800 truncate">{email.fromName || email.fromEmail}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(email.receivedDateTime)}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate mt-0.5">{email.subject || '(Không tiêu đề)'}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{email.bodyPreview || ''}</p>
                    {email.hasAttachments && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                        <Paperclip className="w-3 h-3" /> Đính kèm
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {pagination.totalPages > 1 && (
          <div className="p-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Trang {pagination.page}/{pagination.totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-2 py-1 rounded border"
                style={{ borderColor: '#e2e8f0', color: '#334155', opacity: pagination.page === 1 ? 0.5 : 1 }}
              >Trước</button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-2 py-1 rounded border"
                style={{ borderColor: '#e2e8f0', color: '#334155', opacity: pagination.page >= pagination.totalPages ? 0.5 : 1 }}
              >Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* Right - Reading pane or Compose */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {view === 'compose' ? (
          <>
            <div className="border-b border-slate-200 px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Soạn thư mới</h3>
              <button onClick={() => setView('list')} className="p-2 rounded-lg" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Recipients: To / CC / BCC as type selector + list */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(['to', 'cc', 'bcc']).map(type => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span className="text-sm text-slate-500 w-10">{RECIPIENT_TYPE[type]}</span>
                      <button
                        type="button"
                        onClick={() => addRecipients(type)}
                        className="px-3 py-1.5 rounded-lg border border-dashed text-sm"
                        style={{ borderColor: '#cbd5e1', color: '#475569' }}
                      >
                        + Thêm
                      </button>
                    </div>
                  ))}
                </div>
                {composeData.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {composeData.recipients.map((r, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200"
                      >
                        <select
                          value={r.type}
                          onChange={(e) => setRecipientType(i, e.target.value)}
                          className="text-xs font-medium text-slate-600 bg-transparent border-0 cursor-pointer focus:ring-0 p-0"
                        >
                          <option value="to">Đến</option>
                          <option value="cc">CC</option>
                          <option value="bcc">BCC</option>
                        </select>
                        <span className="text-sm text-slate-700 max-w-[180px] truncate" title={r.email}>{r.label || r.email}</span>
                        <button type="button" onClick={() => removeRecipient(i)} className="p-0.5 rounded" style={{ color: '#64748b' }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Tiêu đề email"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                <textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Nội dung (có thể dùng HTML)"
                  rows={12}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setView('list')}
                  className="px-4 py-2 rounded-lg border flex items-center gap-2"
                  style={{ borderColor: '#e2e8f0', color: '#475569' }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg flex items-center gap-2"
                  style={{ backgroundColor: '#2563eb', color: '#fff', opacity: loading ? 0.6 : 1 }}
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </div>
          </>
        ) : selectedEmail ? (
          <>
            <div className="border-b border-slate-200 px-4 py-2 flex items-center gap-2">
              <button onClick={() => setSelectedEmail(null)} className="p-1.5 rounded-lg" style={{ color: '#475569' }}>
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h3 className="text-lg font-semibold text-slate-800 truncate flex-1">{selectedEmail.subject}</h3>
            </div>
            <div className="flex-1 overflow-auto p-4 text-sm">
              <div className="space-y-2 mb-4">
                <p><span className="text-slate-500">Từ:</span> {selectedEmail.fromName} &lt;{selectedEmail.fromEmail}&gt;</p>
                <p><span className="text-slate-500">Đến:</span> {selectedEmail.toRecipients?.map(r => r.email).join(', ')}</p>
                {selectedEmail.ccRecipients?.length > 0 && <p><span className="text-slate-500">CC:</span> {selectedEmail.ccRecipients.map(r => r.email).join(', ')}</p>}
                <p><span className="text-slate-500">Ngày:</span> {new Date(selectedEmail.receivedDateTime).toLocaleString('vi-VN')}</p>
              </div>
              <div className="prose prose-sm max-w-none border-t border-slate-200 pt-4" dangerouslySetInnerHTML={{ __html: selectedEmail.body || selectedEmail.bodyPreview || '' }} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>Chọn thư để xem hoặc nhấn &quot;Soạn thư&quot;</p>
            </div>
          </div>
        )}
      </div>

      {/* Picker modal: chọn từ danh sách Doanh nghiệp / CTV / Admin group */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPickerOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-semibold text-slate-800">Chọn người nhận ({RECIPIENT_TYPE[pickerType]})</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => { setPickerSource('companies'); loadCompaniesForPicker(); }}
                  className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5"
                  style={{
                    backgroundColor: pickerSource === 'companies' ? '#dbeafe' : '#f1f5f9',
                    color: pickerSource === 'companies' ? '#1d4ed8' : '#475569'
                  }}
                >
                  <Building2 className="w-4 h-4" /> Doanh nghiệp
                </button>
                <button
                  onClick={() => { setPickerSource('collaborators'); loadCollaboratorsForPicker(); }}
                  className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5"
                  style={{
                    backgroundColor: pickerSource === 'collaborators' ? '#dbeafe' : '#f1f5f9',
                    color: pickerSource === 'collaborators' ? '#1d4ed8' : '#475569'
                  }}
                >
                  <UserCircle className="w-4 h-4" /> CTV
                </button>
                <button
                  onClick={() => { setPickerSource('groups'); loadGroupsForPicker(); }}
                  className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5"
                  style={{
                    backgroundColor: pickerSource === 'groups' ? '#dbeafe' : '#f1f5f9',
                    color: pickerSource === 'groups' ? '#1d4ed8' : '#475569'
                  }}
                >
                  <Users className="w-4 h-4" /> Nhóm Admin
                </button>
              </div>
              <button onClick={() => setPickerOpen(false)} className="p-2 rounded-lg" style={{ color: '#64748b' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {loadingPicker && (
                <div className="flex justify-center py-8"><RefreshCw className="w-8 h-8 animate-spin text-slate-400" /></div>
              )}
              {!loadingPicker && pickerList.length === 0 && <p className="text-slate-500 text-center py-6">Không có email nào</p>}
              {!loadingPicker && pickerList.length > 0 && (
                <div className="space-y-1">
                  {pickerList.map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={pickerSelections.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) setPickerSelections(prev => [...prev, index]);
                          else setPickerSelections(prev => prev.filter(i => i !== index));
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 truncate flex-1" title={item.label}>{item.label}</span>
                      <span className="text-xs text-slate-400">{item.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setPickerOpen(false)}
                className="px-4 py-2 rounded-lg border"
                style={{ borderColor: '#e2e8f0', color: '#475569' }}
              >
                Đóng
              </button>
              <button
                onClick={applyPicker}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#2563eb', color: '#fff' }}
              >
                Thêm {pickerSelections.length} người nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailsPage;
