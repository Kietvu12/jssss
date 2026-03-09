import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const AgentHomePageSession2 = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFilterButtonHovered, setIsFilterButtonHovered] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [donutData, setDonutData] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [chartData, setChartData] = useState({
    months: [],
    offerData: [],
    rejectionData: [],
  });

  useEffect(() => {
    loadChartData();
  }, [language]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const dateParams = {};
      if (filterStartDate) dateParams.startDate = filterStartDate;
      if (filterEndDate) dateParams.endDate = filterEndDate;

      const [categoryRes, offerRejectionRes] = await Promise.all([
        apiService.getCategoryDistribution(dateParams),
        apiService.getOfferRejectionStats({ type: 'month', ...dateParams })
      ]);

      // Donut: phân bố theo job category (nhóm ngành nghề) – backend trả về categories: [{ id, name, slug, count }]
      let categories = categoryRes?.success && categoryRes?.data?.categories
        ? categoryRes.data.categories
        : [];
      if (!Array.isArray(categories)) {
        if (categories && typeof categories === 'object' && categories.id) {
          categories = [categories];
        } else {
          categories = [];
        }
      }
      
      // Đảm bảo categories là array
      if (Array.isArray(categories) && categories.length > 0) {
        const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
        
        // Tạo dữ liệu cho biểu đồ phân bố theo nhóm ngành nghề
        const donutItems = categories.map((category, index) => ({
          label: category.name || '',
          value: parseInt(category.count || 0),
          color: colors[index % colors.length],
        })).filter(item => item.value > 0 && item.label);

        setDonutData(donutItems);
        
        // Tính tổng số đơn ứng tuyển
        const total = donutItems.reduce((sum, item) => sum + item.value, 0);
        setTotalApplications(total);
      } else {
        setDonutData([]);
        setTotalApplications(0);
      }

      // Load line chart data (offer và rejection)
      if (offerRejectionRes?.success && offerRejectionRes?.data) {
        const rawOffers = offerRejectionRes.data.offers;
        const rawRejections = offerRejectionRes.data.rejections;
        const offers = Array.isArray(rawOffers) ? rawOffers : (rawOffers ? [rawOffers] : []);
        const rejections = Array.isArray(rawRejections) ? rawRejections : (rawRejections ? [rawRejections] : []);

        // Luôn lấy đúng 6 tháng gần nhất để biểu đồ line có 6 điểm nối liền
        const now = new Date();
        const sortedPeriods = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          sortedPeriods.push(`${y}-${m}`);
        }

        const months = sortedPeriods.map(period => {
          if (period && period.includes('-')) {
            const parts = period.split('-');
            if (parts.length === 2) {
              const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
              return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'en' ? 'en-US' : 'ja-JP', { month: 'short' });
            }
          }
          return period || '';
        });

        const offerData = sortedPeriods.map(period => {
          const offer = offers.find(o => o && o.period === period);
          return offer ? (parseInt(offer.count, 10) || 0) : 0;
        });
        const rejectionData = sortedPeriods.map(period => {
          const rejection = rejections.find(r => r && r.period === period);
          return rejection ? (parseInt(rejection.count, 10) || 0) : 0;
        });

        setChartData({
          months,
          offerData,
          rejectionData,
        });
      } else {
        console.warn('Offer/Rejection response is invalid:', offerRejectionRes);
        // Set empty data if response is invalid
        setChartData({
          months: [],
          offerData: [],
          rejectionData: [],
        });
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Set empty data on error
      setDonutData([]);
      setTotalApplications(0);
      setChartData({
        months: [],
        offerData: [],
        rejectionData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate arc segments with gaps
  const calculateArcSegments = (data, gapDegrees = 24) => {
    if (!data || data.length === 0) return [];
    
    const radius = 70;
    const centerX = 100;
    const centerY = 100;
    const strokeWidth = 20;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) return [];
    
    const totalGaps = gapDegrees * data.length;
    const availableDegrees = 360 - totalGaps;
    
    let currentAngle = -90;
    const arcs = [];
    
    data.forEach((item) => {
      const percentage = item.value / total;
      const sweepAngle = (percentage * availableDegrees);
      
      const startAngleRad = (currentAngle * Math.PI) / 180;
      const endAngleRad = ((currentAngle + sweepAngle) * Math.PI) / 180;
      
      const largeArcFlag = sweepAngle > 180 ? 1 : 0;
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      arcs.push({
        path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        color: item.color,
        label: item.label,
        value: item.value,
        strokeWidth: strokeWidth,
      });
      
      currentAngle += sweepAngle + gapDegrees;
    });
    
    return arcs;
  };

  const arcSegments = calculateArcSegments(donutData, 30);

  const chartHeight = 160;
  const chartWidth = 600;
  const padding = { left: 24, right: 24, top: 20, bottom: 36 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-6">
          <div className="rounded-lg shadow-sm p-3 border" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
            <div className="animate-pulse h-64"></div>
          </div>
          <div className="rounded-lg shadow-sm p-3 border" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
            <div className="animate-pulse h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-6">
        {/* Card 1: Phân bố theo nhóm ngành nghề (jobCategory) – số đơn ứng tuyển theo từng nhóm */}
        <div className="rounded-lg shadow-sm p-3 sm:p-4 border flex flex-col" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
          <h3 className="text-sm sm:text-base font-semibold mb-0.5" style={{ color: '#111827' }}>
            {t.agentHomeDistributionByCategory}
          </h3>
          <p className="text-xs mb-2" style={{ color: '#6b7280' }}>
            {t.agentHomeDistributionByCategoryDesc}
          </p>
          
          {donutData.length > 0 ? (
            <div className="flex flex-col items-center flex-1">
              {/* Arc Segmented Ring Chart */}
              <div className="relative mb-3 flex-shrink-0" style={{ padding: '8px', overflow: 'visible' }}>
                <svg width="200" height="200" viewBox="-20 -20 240 240" className="drop-shadow-sm" style={{ overflow: 'visible' }}>
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  {arcSegments.map((arc, index) => {
                    const isHovered = hoveredIndex === index;
                    return (
                      <g 
                        key={index}
                        style={{
                          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                          transformOrigin: '100px 100px',
                          transition: 'transform 0.3s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <path
                          d={arc.path}
                          fill="none"
                          stroke={arc.color}
                          strokeWidth={isHovered ? arc.strokeWidth + 4 : arc.strokeWidth}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            filter: isHovered ? 'url(#glow) drop-shadow(0 6px 12px rgba(0,0,0,0.25))' : 'none',
                            transition: 'stroke-width 0.3s ease, filter 0.3s ease',
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>
                
                {/* Center text – thu nhỏ */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none scale-90">
                  <p className="text-xl font-bold leading-tight" style={{ color: '#111827' }}>{totalApplications}</p>
                  <p className="text-[10px] leading-tight" style={{ color: '#6b7280' }}>
                    {t.agentHomeApplications}
                  </p>
                </div>
                
                {/* Tooltip Card */}
                {hoveredIndex !== null && hoveredIndex < donutData.length && (
                  <div 
                    className="absolute rounded-lg shadow-xl border p-2.5 z-10 pointer-events-none animate-fadeIn"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -130%)',
                      minWidth: '110px',
                      backgroundColor: 'white',
                      borderColor: '#e5e7eb'
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: donutData[hoveredIndex].color }}
                        />
                        <span className="text-xs font-medium" style={{ color: '#374151' }}>
                          {donutData[hoveredIndex].label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold" style={{ color: '#111827' }}>
                          {donutData[hoveredIndex].value}
                        </p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          {totalApplications > 0 ? ((donutData[hoveredIndex].value / totalApplications) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 w-full mt-auto">
                {donutData.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium" style={{ color: '#111827' }}>{item.value}</span>
                    </div>
                    <span className="text-xs text-center leading-tight" style={{ color: '#4b5563' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color: '#6b7280' }}>
              {t.noData}
            </div>
          )}
        </div>

        {/* Card 2: Đơn được Offer và Bị Từ chối (theo trạng thái) */}
        <div className="rounded-lg shadow-sm p-3 sm:p-4 border" style={{ overflow: 'visible', backgroundColor: 'white', borderColor: '#f3f4f6' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
            <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#111827' }}>
              {t.agentHomeOffersRejections}
            </h3>
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowFilterPanel((v) => !v)}
                onMouseEnter={() => setIsFilterButtonHovered(true)}
                onMouseLeave={() => setIsFilterButtonHovered(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{
                  color: '#374151',
                  backgroundColor: isFilterButtonHovered || showFilterPanel ? '#e5e7eb' : '#f3f4f6'
                }}
              >
                <Filter className="w-3.5 h-3.5" />
                {t.filters || 'Bộ lọc'}
              </button>
              {showFilterPanel && (
                <div 
                  className="absolute right-0 top-full mt-1 z-20 rounded-lg border shadow-lg p-3 min-w-[220px]"
                  style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}
                >
                  <p className="text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                    {t.agentHomeFilterByDate}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs mb-0.5" style={{ color: '#6b7280' }}>{t.agentHomeStartDate}</label>
                      <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border rounded"
                        style={{ borderColor: '#d1d5db' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5" style={{ color: '#6b7280' }}>{t.agentHomeEndDate}</label>
                      <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border rounded"
                        style={{ borderColor: '#d1d5db' }}
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterStartDate('');
                          setFilterEndDate('');
                          setShowFilterPanel(false);
                          loadChartData();
                        }}
                        className="flex-1 px-2 py-1.5 text-xs font-medium rounded border"
                        style={{ borderColor: '#d1d5db', color: '#6b7280' }}
                      >
                        {t.agentHomeClear}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowFilterPanel(false);
                          loadChartData();
                        }}
                        className="flex-1 px-2 py-1.5 text-xs font-medium rounded"
                        style={{ backgroundColor: '#2563eb', color: 'white' }}
                      >
                        {t.agentHomeApply}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5" style={{ backgroundColor: '#10B981' }}></div>
              <span className="text-xs" style={{ color: '#4b5563' }}>
                {t.agentHomeOffered}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5" style={{ backgroundColor: '#EF4444' }}></div>
              <span className="text-xs" style={{ color: '#4b5563' }}>
                {t.agentHomeRejected}
              </span>
            </div>
          </div>
          
          {/* Line Chart – fit trong card, scale theo width */}
          {chartData.months.length > 0 ? (
            <div className="w-full" style={{ maxWidth: '100%' }}>
              <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="xMidYMid meet"
                className="block"
              >
                {(() => {
                  const maxValue = Math.max(...chartData.offerData, ...chartData.rejectionData, 1);
                  const n = chartData.months.length;
                  const step = n > 1 ? innerWidth / (n - 1) : innerWidth;

                  const getX = (index) => padding.left + index * step;
                  const getY = (value) => padding.top + innerHeight - (maxValue > 0 ? (value / maxValue) * innerHeight : 0);

                  return (
                    <>
                      {/* Offer line */}
                      <polyline
                        points={chartData.months.map((_, i) => `${getX(i)},${getY(chartData.offerData[i] || 0)}`).join(' ')}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Rejection line */}
                      <polyline
                        points={chartData.months.map((_, i) => `${getX(i)},${getY(chartData.rejectionData[i] || 0)}`).join(' ')}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Offer points */}
                      {chartData.months.map((_, index) => {
                        const x = getX(index);
                        const y = getY(chartData.offerData[index] || 0);
                        const isHovered = hoveredPointIndex === index;
                        return (
                          <g key={`offer-${index}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isHovered ? 7 : 5}
                              fill="#10B981"
                              stroke="white"
                              strokeWidth={isHovered ? 2.5 : 2}
                              style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                              onMouseEnter={() => setHoveredPointIndex(index)}
                              onMouseLeave={() => setHoveredPointIndex(null)}
                            />
                            {isHovered && (
                              <g>
                                <rect x={x - 52} y={y - 52} width="104" height="42" fill="#1F2937" rx="4" />
                                <text x={x} y={y - 34} fill="white" fontSize="10" fontWeight="500" textAnchor="middle">
                                  {t.agentHomeOfferLabel} {chartData.offerData[index]}
                                </text>
                                <text x={x} y={y - 21} fill="white" fontSize="10" fontWeight="500" textAnchor="middle">
                                  {t.agentHomeRejectLabel} {chartData.rejectionData[index]}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                      {/* Rejection points */}
                      {chartData.months.map((_, index) => {
                        const x = getX(index);
                        const y = getY(chartData.rejectionData[index] || 0);
                        const isHovered = hoveredPointIndex === index;
                        return (
                          <g key={`reject-${index}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isHovered ? 7 : 5}
                              fill="#EF4444"
                              stroke="white"
                              strokeWidth={isHovered ? 2.5 : 2}
                              style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                              onMouseEnter={() => setHoveredPointIndex(index)}
                              onMouseLeave={() => setHoveredPointIndex(null)}
                            />
                          </g>
                        );
                      })}
                      {/* X-axis labels */}
                      {chartData.months.map((month, index) => (
                        <text
                          key={`label-${index}`}
                          x={getX(index)}
                          y={chartHeight - 10}
                          textAnchor="middle"
                          fill="#6B7280"
                          fontSize="10"
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
            <div className="flex items-center justify-center h-64" style={{ color: '#6b7280' }}>
              {t.noData || 'No data'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentHomePageSession2;
