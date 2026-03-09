import React, { useState, useEffect } from 'react';
import { MoreVertical, Eye, TrendingUp, TrendingDown, Minus, Briefcase, Users, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const AdminDashboardSession3 = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [loading, setLoading] = useState(true);
  const [topViewedJobs, setTopViewedJobs] = useState([]);
  const [topCollaborators, setTopCollaborators] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs statistics
      const jobsResponse = await api.getJobStatistics();
      if (jobsResponse.success && jobsResponse.data?.jobsWithMostApplications) {
        const jobs = jobsResponse.data.jobsWithMostApplications.slice(0, 6).map((job, index) => ({
          id: job.id,
          title: job.title,
          company: job.companyName || 'N/A',
          views: parseInt(job.applicationsCount || 0),
          change: index % 3 === 0 ? 0 : (index % 2 === 0 ? 10 : -8),
          changeType: index % 3 === 0 ? 'neutral' : (index % 2 === 0 ? 'up' : 'down'),
        }));
        setTopViewedJobs(jobs);
      }

      // Fetch collaborator statistics
      const collaboratorsResponse = await apiService.getCollaboratorStatistics({ limit: 6 });
      if (collaboratorsResponse.success && collaboratorsResponse.data?.topByApplications) {
        const collaborators = collaboratorsResponse.data.topByApplications.map((ctv, index) => ({
          id: ctv.id,
          name: ctv.name || t.adminDashboardNa,
          code: `CTV${String(ctv.id).padStart(3, '0')}`,
          nominations: parseInt(ctv.applicationsCount || 0),
          change: index % 3 === 0 ? 0 : (index % 2 === 0 ? 12 : -8),
          changeType: index % 3 === 0 ? 'neutral' : (index % 2 === 0 ? 'up' : 'down'),
        }));
        setTopCollaborators(collaborators);
      }

      // Fetch dashboard và application statistics để tạo recent activities
      const [dashboardResponse, applicationsResponse] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getApplicationStatistics(),
      ]);

      if (dashboardResponse.success && applicationsResponse.success) {
        const activities = [
          {
            id: 1,
            type: 'nomination',
            descriptionKey: 'adminDashboardTotalApplications',
            value: dashboardResponse.data?.applications?.total || 0,
            change: 0,
            changeType: 'up',
          },
          {
            id: 2,
            type: 'payment',
            descriptionKey: 'adminDashboardPaymentRequestsLabel',
            value: dashboardResponse.data?.paymentRequests?.total || 0,
            change: 0,
            changeType: 'up',
          },
          {
            id: 3,
            type: 'revenue',
            descriptionKey: 'adminDashboardPaidLabel',
            value: dashboardResponse.data?.paymentRequests?.paid || 0,
            isCurrency: false,
            change: 0,
            changeType: 'up',
          },
          {
            id: 4,
            type: 'candidate',
            descriptionKey: 'adminDashboardApprovedCandidates',
            value: dashboardResponse.data?.applications?.approved || 0,
            change: 0,
            changeType: 'up',
          },
          {
            id: 5,
            type: 'message',
            descriptionKey: 'adminDashboardNyusha',
            value: dashboardResponse.data?.applications?.nyusha || 0,
            change: 0,
            changeType: 'up',
          },
          {
            id: 6,
            type: 'other',
            descriptionKey: 'adminDashboardTotalCv',
            value: dashboardResponse.data?.cvs?.total || 0,
            change: 0,
            changeType: 'up',
          },
        ];
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'up':
        return 'bg-green-100 text-green-700';
      case 'down':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const formatValue = (value, isCurrency = false) => {
    if (isCurrency) {
      return `$${value.toLocaleString('en-US')}`;
    }
    return value.toLocaleString('en-US');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Widget 1: Job nhiều lượt xem nhất */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Job nhiều ứng tuyển nhất</h3>
            <p className="text-sm text-gray-500">Việc làm có nhiều ứng tuyển</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {topViewedJobs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">{t.noData}</p>
          ) : (
            topViewedJobs.map((job, index) => (
            <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 truncate">{job.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatValue(job.views)}</p>
                  <p className="text-xs text-gray-500">lượt xem</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getChangeColor(job.changeType)}`}>
                  {getChangeIcon(job.changeType)}
                  {job.change > 0 ? '+' : ''}{job.change}%
                </span>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Widget 2: Bảng xếp hạng CTV */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.adminDashboardCollaboratorRanking}</h3>
            <p className="text-sm text-gray-500">{t.adminDashboardCollaboratorRankingDesc}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {topCollaborators.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">{t.noData}</p>
          ) : (
            topCollaborators.map((collaborator, index) => (
            <div key={collaborator.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{collaborator.name}</p>
                  <p className="text-xs text-gray-500 truncate">{collaborator.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatValue(collaborator.nominations)}</p>
                  <p className="text-xs text-gray-500">{t.adminDashboardNominationsLabel}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getChangeColor(collaborator.changeType)}`}>
                  {getChangeIcon(collaborator.changeType)}
                  {collaborator.change > 0 ? '+' : ''}{collaborator.change}%
                </span>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Widget 3: Hoạt động gần đây */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.adminDashboardOverviewStats}</h3>
            <p className="text-sm text-gray-500">{t.adminDashboardOverviewStatsDesc}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">{t.noData}</p>
          ) : (
            recentActivities.map((activity) => {
            const getIcon = () => {
              switch (activity.type) {
                case 'nomination':
                  return <Briefcase className="w-5 h-5 text-purple-600" />;
                case 'payment':
                  return <TrendingUp className="w-5 h-5 text-blue-600" />;
                case 'revenue':
                  return <TrendingUp className="w-5 h-5 text-orange-600" />;
                case 'candidate':
                  return <Users className="w-5 h-5 text-blue-600" />;
                case 'message':
                  return <Clock className="w-5 h-5 text-pink-600" />;
                default:
                  return <Clock className="w-5 h-5 text-purple-600" />;
              }
            };

            const getIconBg = () => {
              switch (activity.type) {
                case 'nomination':
                  return 'bg-purple-100';
                case 'payment':
                  return 'bg-blue-100';
                case 'revenue':
                  return 'bg-orange-100';
                case 'candidate':
                  return 'bg-blue-100';
                case 'message':
                  return 'bg-pink-100';
                default:
                  return 'bg-purple-100';
              }
            };

            return (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 ${getIconBg()} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {getIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{t[activity.descriptionKey]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatValue(activity.value, activity.isCurrency)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getChangeColor(activity.changeType)}`}>
                    {getChangeIcon(activity.changeType)}
                    {activity.change > 0 ? '+' : ''}{activity.change}%
                  </span>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSession3;

