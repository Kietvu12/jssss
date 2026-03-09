import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MoreVertical,
  Flag,
  Headphones,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api.js';

const CAMPAIGN_ICONS = [Calendar, Headphones, Flag];
const CAMPAIGN_COLORS = [
  { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-600' },
  { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-600' },
];

const chartHeight = 280;
const chartWidth = 700;
const padding = { left: 32, right: 32, top: 24, bottom: 44 };

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const AdminDashboardSession2 = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const defaultRange = getDefaultDateRange();
  const [filterStartDate, setFilterStartDate] = useState(defaultRange.startDate);
  const [filterEndDate, setFilterEndDate] = useState(defaultRange.endDate);
  const [startInput, setStartInput] = useState(defaultRange.startDate);
  const [endInput, setEndInput] = useState(defaultRange.endDate);
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [lineChartData, setLineChartData] = useState({
    months: [],
    successData: [],
    failedData: [],
  });
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  const fetchLineChart = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = filterStartDate && filterEndDate
        ? { startDate: filterStartDate, endDate: filterEndDate }
        : { months: 6 };
      const response = await apiService.getAdminDashboardNominationOverTime(params);
      if (response.success && response.data) {
        setLineChartData({
          months: response.data.months || [],
          successData: response.data.successData || [],
          failedData: response.data.failedData || [],
        });
      }
    } catch (error) {
      console.error('Error fetching nomination over time:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchLineChart();
  }, [fetchLineChart]);

  const handleApplyFilter = () => {
    if (startInput && endInput && startInput <= endInput) {
      setFilterStartDate(startInput);
      setFilterEndDate(endInput);
    }
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setCampaignsLoading(true);
        const response = await apiService.getAdminCampaigns({
          status: 1,
          limit: 10,
        });
        const rawList = response.data?.campaigns ?? response.data?.rows ?? [];
        if (response.success && rawList.length) {
          const list = rawList.map((c, index) => {
            const style = CAMPAIGN_COLORS[index % CAMPAIGN_COLORS.length];
            const Icon = CAMPAIGN_ICONS[index % CAMPAIGN_ICONS.length];
            const start = c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : '';
            const end = c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : '';
            const dateRange = start && end ? `${start} - ${end}` : t.adminDashboardActiveDateRange;
            const applicationsCount = c.applicationsCount ?? 0;
            const maxCv = Number(c.maxCv) || 100;
            const progress = Math.min(100, Math.round((applicationsCount / maxCv) * 100));
            return {
              id: c.id,
              name: c.name,
              icon: Icon,
              iconColor: style.bg,
              iconBg: style.text,
              progressColor: style.bar,
              progressTextColor: style.text,
              dateRange,
              applicationsCount,
              budget: t.adminDashboardCvTarget.replace('{count}', applicationsCount.toLocaleString('en-US')).replace('{target}', maxCv),
              progress,
            };
          });
          setCampaigns(list);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      } finally {
        setCampaignsLoading(false);
      }
    };
    fetchCampaigns();
  }, [language]);

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const { months, successData, failedData } = lineChartData;
  const n = months.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Biểu đồ 1: Line – Đơn tiến cử thành công / thất bại theo tháng (6 tháng gần nhất + bộ lọc ngày) */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.adminDashboardNominations}</h3>
            <p className="text-sm text-gray-500">{t.adminDashboardNominationsDesc}</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              {t.adminDashboardSuccess}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              {t.adminDashboardFailed}
            </span>
          </div>
        </div>

        {/* Bộ lọc: Từ ngày – Đến ngày */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600">{t.adminDashboardStartDate}</label>
          <input
            type="date"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <label className="text-sm text-gray-600 ml-2">{t.adminDashboardEndDate}</label>
          <input
            type="date"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleApplyFilter}
            disabled={!startInput || !endInput || startInput > endInput}
            className="px-4 py-1.5 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: (!startInput || !endInput || startInput > endInput) ? '#9ca3af' : '#059669',
              color: '#ffffff',
              opacity: (!startInput || !endInput || startInput > endInput) ? 0.7 : 1,
              cursor: (!startInput || !endInput || startInput > endInput) ? 'not-allowed' : 'pointer',
            }}
          >
            {t.adminDashboardApply}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-lg animate-pulse bg-gray-50" style={{ minHeight: chartHeight }} />
        ) : months.length > 0 ? (
          <div className="w-full" style={{ maxWidth: '100%' }}>
            <svg
              width="100%"
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="block"
            >
              {(() => {
                const maxValue = Math.max(...successData, ...failedData, 1);
                const step = n > 1 ? innerWidth / (n - 1) : innerWidth;
                const getX = (index) => padding.left + index * step;
                const getY = (value) =>
                  padding.top + innerHeight - (maxValue > 0 ? (value / maxValue) * innerHeight : 0);

                return (
                  <>
                    <polyline
                      points={months.map((_, i) => `${getX(i)},${getY(successData[i] || 0)}`).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points={months.map((_, i) => `${getX(i)},${getY(failedData[i] || 0)}`).join(' ')}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {months.map((_, index) => {
                      const x = getX(index);
                      const ySuccess = getY(successData[index] || 0);
                      const isHovered = hoveredPointIndex === index;
                      return (
                        <g key={`success-${index}`}>
                          <circle
                            cx={x}
                            cy={ySuccess}
                            r={isHovered ? 9 : 6}
                            fill="#10b981"
                            stroke="white"
                            strokeWidth={isHovered ? 3 : 2}
                            style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                            onMouseEnter={() => setHoveredPointIndex(index)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />
                          {isHovered && (
                            <g>
                              <rect x={x - 56} y={ySuccess - 52} width="112" height="42" fill="#1F2937" rx="4" />
                              <text x={x} y={ySuccess - 34} fill="white" fontSize="11" fontWeight="500" textAnchor="middle">
                                {t.adminDashboardSuccessLabel} {successData[index] ?? 0}
                              </text>
                              <text x={x} y={ySuccess - 19} fill="white" fontSize="11" fontWeight="500" textAnchor="middle">
                                {t.adminDashboardFailedLabel} {failedData[index] ?? 0}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                    {months.map((_, index) => {
                      const x = getX(index);
                      const yFailed = getY(failedData[index] || 0);
                      const isHovered = hoveredPointIndex === index;
                      return (
                        <circle
                          key={`failed-${index}`}
                          cx={x}
                          cy={yFailed}
                          r={isHovered ? 9 : 6}
                          fill="#EF4444"
                          stroke="white"
                          strokeWidth={isHovered ? 3 : 2}
                          style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                          onMouseEnter={() => setHoveredPointIndex(index)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                        />
                      );
                    })}
                    {months.map((month, index) => (
                      <text
                        key={`label-${index}`}
                        x={getX(index)}
                        y={chartHeight - 14}
                        textAnchor="middle"
                        fill="#6B7280"
                        fontSize="11"
                      >
                        {month}
                      </text>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-500 text-sm rounded-lg bg-gray-50" style={{ minHeight: chartHeight }}>
            {t.adminDashboardNoNominationData}
          </div>
        )}
      </div>

      {/* Biểu đồ 2: Campaign đang Active */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.adminDashboardCampaign}</h3>
          <p className="text-sm text-gray-500">{t.adminDashboardCampaignDesc}</p>
        </div>

        <div className="space-y-4">
          {campaignsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">{t.adminDashboardNoActiveCampaigns}</p>
          ) : (
            campaigns.map((campaign) => {
              const Icon = campaign.icon;
              return (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`${campaign.iconColor} p-2 rounded-lg`}>
                        <Icon className={`w-5 h-5 ${campaign.iconBg}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {campaign.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{campaign.dateRange}</p>
                      </div>
                    </div>
                    <button type="button" className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{campaign.budget}</span>
                      <span className={`text-xs font-semibold ${campaign.progressTextColor}`}>
                        {campaign.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${campaign.progressColor} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
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

export default AdminDashboardSession2;
