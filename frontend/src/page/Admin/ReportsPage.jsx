import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  MousePointer,
  UserPlus,
  Sparkles
} from 'lucide-react';
import apiService from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

const ReportsPage = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;

  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nomination');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Super Admin data
  const [nominationData, setNominationData] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [hrData, setHrData] = useState(null);
  
  // Regular Admin data
  const [myPerformanceData, setMyPerformanceData] = useState(null);

  const dateLocale = language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN';

  const pickByLanguage = (viText, enText, jpText) => {
    if (language === 'en') return enText || viText || '';
    if (language === 'ja') return jpText || enText || viText || '';
    return viText || enText || jpText || '';
  };

  const getStatusLabel = (status) => {
    const key = `reportsStatus${status}`;
    return t[key] || `Status ${status}`;
  };

  // Hover states
  const [hoveredTabNomination, setHoveredTabNomination] = useState(false);
  const [hoveredTabPlatform, setHoveredTabPlatform] = useState(false);
  const [hoveredTabHr, setHoveredTabHr] = useState(false);
  const [hoveredExportAllButton, setHoveredExportAllButton] = useState(false);
  const [hoveredExportStatusButton, setHoveredExportStatusButton] = useState({});

  useEffect(() => {
    loadAdminProfile();
  }, []);

  useEffect(() => {
    if (adminProfile) {
      if (adminProfile.role === 1) {
        // Super Admin
        loadSuperAdminReports();
      } else {
        // Regular Admin
        loadMyPerformance();
      }
    }
  }, [adminProfile, startDate, endDate, statusFilter, activeTab]);

  const loadAdminProfile = async () => {
    try {
      const response = await apiService.getAdminProfile();
      if (response.success && response.data?.admin) {
        setAdminProfile(response.data.admin);
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuperAdminReports = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      if (activeTab === 'nomination') {
        const response = await apiService.getNominationEffectiveness(params);
        if (response.success) {
          setNominationData(response.data);
        }
      } else if (activeTab === 'platform') {
        const response = await apiService.getPlatformEffectiveness(params);
        if (response.success) {
          setPlatformData(response.data);
        }
      } else if (activeTab === 'hr') {
        const response = await apiService.getHREffectiveness(params);
        if (response.success) {
          setHrData(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadMyPerformance = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (statusFilter) params.status = statusFilter;

      const response = await apiService.getMyPerformance(params);
      if (response.success) {
        setMyPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Error loading my performance:', error);
    }
  };

  const exportData = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const convertToCSV = (data) => {
    if (!data || !data.applications) return '';
    const headers = [t.colId || 'ID', t.reportsColTitle || 'Job Title', t.reportsColJobCode || 'Job Code', t.reportsColCandidate || 'Candidate', 'Code', t.colStatus || 'Status', t.reportsColCreatedAt || 'Created', t.reportsColUpdated || 'Updated'];
    const rows = data.applications.map(app => [
      app.id,
      pickByLanguage(app.jobTitle, app.jobTitleEn || app.job_title_en, app.jobTitleJp || app.job_title_jp) || app.jobTitle || '',
      app.jobCode || '',
      app.candidateName || '',
      app.candidateCode || '',
      getStatusLabel(app.status),
      app.createdAt,
      app.updatedAt
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
          <p style={{ color: '#4b5563' }}>{t.loading}</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = adminProfile?.role === 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>{t.reportsTitle}</h2>
          <p style={{ color: '#4b5563' }}>
            {isSuperAdmin ? t.reportsSubtitleSuper : t.reportsSubtitleRegular}
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="rounded-lg shadow p-4 flex items-center gap-4" style={{ backgroundColor: 'white' }}>
        <Filter className="w-5 h-5" style={{ color: '#6b7280' }} />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#374151' }}>{t.dateFromShort}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
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
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#374151' }}>{t.dateToShort}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
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
        {!isSuperAdmin && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: '#374151' }}>{t.statusFilterLabel}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
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
              <option value="1">{t.reportsStatus1}</option>
              <option value="2">{t.reportsStatus2}</option>
              <option value="8">{t.reportsStatus8}</option>
              <option value="11">{t.reportsStatus11}</option>
              <option value="15">{t.reportsStatus15}</option>
            </select>
          </div>
        )}
      </div>

      {isSuperAdmin ? (
        /* Super Admin Reports */
        <div className="space-y-6">
          {/* Tabs */}
          <div className="rounded-lg shadow" style={{ backgroundColor: 'white' }}>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <button
                onClick={() => setActiveTab('nomination')}
                onMouseEnter={() => activeTab !== 'nomination' && setHoveredTabNomination(true)}
                onMouseLeave={() => setHoveredTabNomination(false)}
                className="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === 'nomination' ? '#2563eb' : 'transparent',
                  color: activeTab === 'nomination' ? '#2563eb' : (hoveredTabNomination ? '#111827' : '#4b5563')
                }}
              >
                {t.tabNominationEffectiveness}
              </button>
              <button
                onClick={() => setActiveTab('platform')}
                onMouseEnter={() => activeTab !== 'platform' && setHoveredTabPlatform(true)}
                onMouseLeave={() => setHoveredTabPlatform(false)}
                className="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === 'platform' ? '#2563eb' : 'transparent',
                  color: activeTab === 'platform' ? '#2563eb' : (hoveredTabPlatform ? '#111827' : '#4b5563')
                }}
              >
                {t.tabPlatformEffectiveness}
              </button>
              <button
                onClick={() => setActiveTab('hr')}
                onMouseEnter={() => activeTab !== 'hr' && setHoveredTabHr(true)}
                onMouseLeave={() => setHoveredTabHr(false)}
                className="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === 'hr' ? '#2563eb' : 'transparent',
                  color: activeTab === 'hr' ? '#2563eb' : (hoveredTabHr ? '#111827' : '#4b5563')
                }}
              >
                {t.tabHrEffectiveness}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'nomination' && nominationData && (
                <div className="space-y-6">
                  <p className="text-sm pb-2 border-b" style={{ color: '#6b7280', borderColor: '#e5e7eb' }}>
                    {t.nominationTabDesc}
                  </p>
                  {/* Revenue Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: '#4b5563' }}>{t.reportsTotalRevenue}</p>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                            {nominationData.totalRevenue?.toLocaleString(dateLocale)}đ
                          </p>
                        </div>
                        <DollarSign className="w-10 h-10" style={{ color: '#16a34a' }} />
                      </div>
                    </div>
                    <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: '#4b5563' }}>{t.reportsEffectiveCVs}</p>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                            {nominationData.effectiveCVs || 0}
                          </p>
                        </div>
                        <FileText className="w-10 h-10" style={{ color: '#2563eb' }} />
                      </div>
                    </div>
                    <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #faf5ff, #f3e8ff)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: '#4b5563' }}>{t.reportsTotalApplications}</p>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                            {Object.values(nominationData.applicationsByStatus || {}).reduce((a, b) => a + b, 0)}
                          </p>
                        </div>
                        <Briefcase className="w-10 h-10" style={{ color: '#9333ea' }} />
                      </div>
                    </div>
                  </div>

                  {/* Applications by Status */}
                  <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t.applicationStatuses}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(nominationData.applicationsByStatus || {}).map(([status, count]) => (
                        <div key={status} className="border rounded p-3" style={{ borderColor: '#e5e7eb' }}>
                          <p className="text-xs mb-1" style={{ color: '#4b5563' }}>{getStatusLabel(parseInt(status))}</p>
                          <p className="text-xl font-bold" style={{ color: '#111827' }}>{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Jobs */}
                  {nominationData.jobEffectiveness && nominationData.jobEffectiveness.length > 0 && (
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t.jobEffectivenessTitle}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                              <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.reportsColJobCode}</th>
                              <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.reportsColTitle}</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>{t.reportsColTotalApplications}</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>{t.reportsColNyusha}</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>{t.reportsColPaid}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                            {nominationData.jobEffectiveness.slice(0, 10).map((job) => (
                              <tr key={job.id}>
                                <td className="px-4 py-2" style={{ color: '#111827' }}>{job.jobCode}</td>
                                <td className="px-4 py-2" style={{ color: '#111827' }}>{pickByLanguage(job.title, job.titleEn || job.title_en, job.titleJp || job.title_jp) || job.title}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{job.totalApplications}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{job.nyushaCount}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{job.paidCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Category Distribution */}
                  {nominationData.categoryDistribution && nominationData.categoryDistribution.length > 0 && (
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t.categoryDistributionTitle}</h3>
                      <div className="space-y-2">
                        {nominationData.categoryDistribution.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#374151' }}>{pickByLanguage(cat.name, cat.nameEn || cat.name_en, cat.nameJp || cat.name_jp) || cat.name}</span>
                            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{cat.applicationCount} {t.applicationsCountUnit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'platform' && platformData && (
                <div className="space-y-6">
                  <p className="text-sm pb-2 border-b" style={{ color: '#6b7280', borderColor: '#e5e7eb' }}>
                    {t.platformTabDesc}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs" style={{ color: '#4b5563' }}>{t.reportsVisits}</p>
                        <Eye className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      </div>
                      <p className="text-xl font-bold" style={{ color: '#111827' }}>{(platformData.visits ?? platformData.pageViews) != null ? (platformData.visits ?? platformData.pageViews) : '—'}</p>
                    </div>
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs" style={{ color: '#4b5563' }}>{t.reportsPageViews}</p>
                        <Eye className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      </div>
                      <p className="text-xl font-bold" style={{ color: '#111827' }}>{platformData.pageViews ?? 0}</p>
                    </div>
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs" style={{ color: '#4b5563' }}>{t.reportsLandingPageClicks}</p>
                        <MousePointer className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      </div>
                      <p className="text-xl font-bold" style={{ color: '#111827' }}>{platformData.landingPageClicks ?? 0}</p>
                    </div>
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs" style={{ color: '#4b5563' }}>{t.reportsRegistrations}</p>
                        <UserPlus className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      </div>
                      <p className="text-xl font-bold" style={{ color: '#111827' }}>{platformData.registrations ?? 0}</p>
                    </div>
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs" style={{ color: '#4b5563' }}>{t.reportsTotalCollaborators}</p>
                        <Users className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      </div>
                      <p className="text-xl font-bold" style={{ color: '#111827' }}>{platformData.totalCollaborators ?? 0}</p>
                    </div>
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs" style={{ color: '#4b5563' }}>{t.reportsNewJobs}</p>
                        <Briefcase className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      </div>
                      <p className="text-xl font-bold" style={{ color: '#111827' }}>{platformData.newJobs ?? 0}</p>
                    </div>
                    <div className="rounded-lg p-4 border col-span-2 md:col-span-2" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs" style={{ color: '#4b5563' }}>{t.reportsAiMatching}</p>
                        <Sparkles className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm" style={{ color: '#374151' }}>{t.reportsSuccess}: {platformData.aiMatchingEffectiveness?.successfulMatches ?? 0} / {platformData.aiMatchingEffectiveness?.totalMatches ?? 0}</span>
                        <span className="text-sm font-semibold" style={{ color: '#111827' }}>{t.reportsRate}: {platformData.aiMatchingEffectiveness?.successRate != null ? `${Number(platformData.aiMatchingEffectiveness.successRate).toFixed(1)}%` : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hr' && hrData && (
                <div className="space-y-6">
                  <p className="text-sm pb-2 border-b" style={{ color: '#6b7280', borderColor: '#e5e7eb' }}>
                    {t.hrTabDesc}
                  </p>
                  {hrData.superAdminAssignments && (
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                      <h3 className="text-sm font-semibold mb-2" style={{ color: '#1e40af' }}>{t.superAdminAssignmentsTitle}</h3>
                      <p className="text-lg font-bold" style={{ color: '#111827' }}>
                        {(t.assignmentsToAdmins || '{total} đơn → {admins} người phụ trách')
                          .replace('{total}', hrData.superAdminAssignments.totalAssignments ?? 0)
                          .replace('{admins}', hrData.superAdminAssignments.uniqueAdmins ?? 0)}
                      </p>
                    </div>
                  )}
                  {hrData.adminPerformance && hrData.adminPerformance.length > 0 && (
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t.adminPerformanceTitle}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                              <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.reportsColName}</th>
                              <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.reportsColEmail}</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>{t.reportsColTotalAssigned}</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>{t.reportsColSuccessful}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                            {hrData.adminPerformance.map((admin) => (
                              <tr key={admin.id}>
                                <td className="px-4 py-2" style={{ color: '#111827' }}>{admin.name}</td>
                                <td className="px-4 py-2" style={{ color: '#111827' }}>{admin.email}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{admin.totalAssigned}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{admin.successfulApplications}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {hrData.avgApplicationsPerDay && hrData.avgApplicationsPerDay.length > 0 && (
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t.avgApplicationsPerDayTitle}</h3>
                      <div className="space-y-2">
                        {hrData.avgApplicationsPerDay.map((item) => (
                          <div key={item.adminId} className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#374151' }}>{item.adminName}</span>
                            <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                              {(t.perDayTotalFormat || '{avg} đơn/ngày ({total} tổng)').replace('{avg}', item.avgPerDay).replace('{total}', item.totalAssigned)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {hrData.avgApplicationsPerDay.length > 0 && (
                        <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                          {t.fastestReceptionLabel} <strong>{hrData.avgApplicationsPerDay[0]?.adminName ?? '—'}</strong>
                          {hrData.fastestChatResponseAdmin != null && (
                            <span> • {t.fastestChatResponseLabel} <strong>{hrData.fastestChatResponseAdmin}</strong></span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Regular Admin Reports */
        myPerformanceData && (
          <div className="space-y-6">
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h3 className="text-lg font-bold mb-4 pb-2 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.reportSection1Title}</h3>
              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>{t.reportSection1Desc}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#4b5563' }}>{t.reportsTotalRevenue}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                        {myPerformanceData.totalRevenue?.toLocaleString(dateLocale)}đ
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10" style={{ color: '#16a34a' }} />
                  </div>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#4b5563' }}>{t.reportsTotalProcessed}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                        {myPerformanceData.totalApplications || 0}
                      </p>
                    </div>
                    <Briefcase className="w-10 h-10" style={{ color: '#2563eb' }} />
                  </div>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #faf5ff, #f3e8ff)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#4b5563' }}>{t.reportsAvgProcessingSpeed}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                        {myPerformanceData.avgProcessingHours || 0} {t.hoursUnit}
                      </p>
                    </div>
                    <Clock className="w-10 h-10" style={{ color: '#9333ea' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h3 className="text-lg font-bold mb-2 pb-2 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>{t.reportSection2Title}</h3>
              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>{t.reportSection2Desc}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="rounded-lg px-4 py-2 border" style={{ borderColor: '#e5e7eb' }}>
                  <span className="text-xs" style={{ color: '#6b7280' }}>{t.avgProcessingSpeedLabel}</span>
                  <p className="text-xl font-bold" style={{ color: '#111827' }}>{myPerformanceData.avgProcessingHours || 0} {t.hoursUnit}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>{t.applicationsByStatusTitle}</h3>
                <button
                  onClick={() => exportData(myPerformanceData, `bao-cao-${new Date().toISOString().split('T')[0]}.csv`)}
                  onMouseEnter={() => setHoveredExportAllButton(true)}
                  onMouseLeave={() => setHoveredExportAllButton(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: hoveredExportAllButton ? '#1d4ed8' : '#2563eb',
                    color: 'white'
                  }}
                >
                  <Download className="w-4 h-4" />
                  {t.exportAll}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(myPerformanceData.applicationsByStatus || {}).map(([status, count]) => (
                  <div key={status} className="rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
                    <p className="text-xs mb-1" style={{ color: '#4b5563' }}>{getStatusLabel(parseInt(status))}</p>
                    <p className="text-xl font-bold" style={{ color: '#111827' }}>{count}</p>
                    <button
                      onClick={() => {
                        const filtered = myPerformanceData.applications.filter(app => app.status === parseInt(status));
                        exportData({ applications: filtered }, `bao-cao-status-${status}-${new Date().toISOString().split('T')[0]}.csv`);
                      }}
                      onMouseEnter={() => setHoveredExportStatusButton(prev => ({ ...prev, [status]: true }))}
                      onMouseLeave={() => setHoveredExportStatusButton(prev => ({ ...prev, [status]: false }))}
                      className="mt-2 text-xs"
                      style={{
                        color: hoveredExportStatusButton[status] ? '#1e40af' : '#2563eb'
                      }}
                    >
                      {t.exportByStatus}
                    </button>
                  </div>
                ))}
              </div>

              {myPerformanceData.applications && myPerformanceData.applications.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.colId}</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.reportsColJob}</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.reportsColCandidate}</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.colStatus}</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.reportsColCreatedAt}</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>{t.reportsColUpdated}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                      {myPerformanceData.applications.map((app) => (
                        <tr key={app.id}>
                          <td className="px-4 py-2" style={{ color: '#111827' }}>{app.id}</td>
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium" style={{ color: '#111827' }}>{pickByLanguage(app.jobTitle, app.jobTitleEn || app.job_title_en, app.jobTitleJp || app.job_title_jp) || app.jobTitle}</p>
                              <p className="text-xs" style={{ color: '#6b7280' }}>{app.jobCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium" style={{ color: '#111827' }}>{app.candidateName}</p>
                              <p className="text-xs" style={{ color: '#6b7280' }}>{app.candidateCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}>
                              {getStatusLabel(app.status)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs" style={{ color: '#4b5563' }}>
                            {new Date(app.createdAt).toLocaleDateString(dateLocale)}
                          </td>
                          <td className="px-4 py-2 text-xs" style={{ color: '#4b5563' }}>
                            {new Date(app.updatedAt).toLocaleDateString(dateLocale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ReportsPage;
