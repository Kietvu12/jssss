import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UserPlus, Users, Briefcase } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import { fetchDashboard, fetchDashboardChart } from '../../store/actions/dashboardActions';

const AgentHomePageSession1 = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { loading, overview, applicationsByStatus, chartData } = useSelector(
    (state) => state.dashboard
  );

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchDashboardChart({ type: 'month' }));
  }, [dispatch]);

  // Calculate metrics based on Redux state and current language
  const metrics = useMemo(() => {
    // Tính toán số lượng ứng viên (totalApplications)
    const totalApplications = overview.totalApplications || 0;
    
    // Tính toán số lượng đã phỏng vấn
    // Sử dụng interviewedCount từ API (đã tính dựa trên status 3, 4 hoặc có interview_date)
    const interviewedCount = overview.interviewedCount || 0;
    
    // Số lượng đã tuyển (nyusha - status 8)
    const hiredCount = overview.nyushaCount || 0;

    // Lấy chart data cho applications
    let applicationChartData = [0, 0, 0, 0, 0, 0, 0];
    if (chartData.applications && chartData.applications.length > 0) {
      const last7Months = chartData.applications.slice(-7);
      applicationChartData = last7Months.map(item => item.count || 0);
      // Pad với 0 nếu không đủ 7 tháng
      while (applicationChartData.length < 7) {
        applicationChartData.unshift(0);
      }
    }

    // Tính trend (so sánh tháng gần nhất với tháng trước)
    let applicantTrend = '0%';
    let applicantIsPositive = true;
    if (applicationChartData.length >= 2) {
      const current = applicationChartData[applicationChartData.length - 1];
      const previous = applicationChartData[applicationChartData.length - 2];
      if (previous > 0) {
        const change = ((current - previous) / previous) * 100;
        applicantTrend = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        applicantIsPositive = change >= 0;
      }
    }

    return [
      {
        title: t.applicant,
        value: totalApplications.toString(),
        trend: applicantTrend,
        trendText: t.lastMonth,
        isPositive: applicantIsPositive,
        icon: UserPlus,
        chartData: applicationChartData,
      },
      {
        title: t.interviewed,
        value: interviewedCount.toString(),
        trend: '0%', // Có thể tính toán tương tự nếu có chart data cho interviewed
        trendText: t.lastMonth,
        isPositive: true,
        icon: Users,
        chartData: applicationChartData, // Tạm thời dùng chung data
      },
      {
        title: t.hired,
        value: hiredCount.toString(),
        trend: '0%', // Có thể tính toán tương tự nếu có chart data cho hired
        trendText: t.lastMonth,
        isPositive: true,
        icon: Briefcase,
        chartData: applicationChartData, // Tạm thời dùng chung data
      },
    ];
  }, [overview, applicationsByStatus, chartData.applications, language, t]);

  const MiniBarChart = ({ data, isPositive }) => {
    const maxValue = Math.max(...data, 1); // Tránh chia cho 0
    
    return (
      <div className="flex items-end gap-2 h-14">
        {data.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isLast = index === data.length - 1;
          
          let backgroundColor;
          if (isLast) {
            backgroundColor = isPositive ? '#16a34a' : '#dc2626';
          } else {
            backgroundColor = isPositive ? '#bbf7d0' : '#fecaca';
          }
          
          return (
            <div
              key={index}
              className="w-3 rounded-t"
              style={{ 
                height: `${height}%`,
                backgroundColor: backgroundColor
              }}
            />
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg shadow-sm p-4 sm:p-6 border flex flex-col gap-4"
              style={{
                backgroundColor: 'white',
                borderColor: '#f3f4f6'
              }}
            >
              <div className="animate-pulse">
                <div className="h-4 rounded w-3/4 mb-4" style={{ backgroundColor: '#e5e7eb' }}></div>
                <div className="h-8 rounded w-1/2" style={{ backgroundColor: '#e5e7eb' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <div
              key={index}
              className="rounded-lg shadow-sm p-4 sm:p-6 border flex flex-col gap-4"
              style={{
                backgroundColor: 'white',
                borderColor: '#f3f4f6'
              }}
            >
              {/* Row 1: Icon + Title */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f3e8ff' }}>
                  <Icon className="w-6 h-6" style={{ color: '#9333ea' }} />
                </div>
                <h3 className="text-sm font-medium" style={{ color: '#4b5563' }}>
                  {metric.title}
                </h3>
              </div>
              
              {/* Row 2: Value + Chart */}
              <div className="flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#111827' }}>{metric.value}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span
                      className="text-xs sm:text-sm font-medium"
                      style={{
                        color: metric.isPositive ? '#16a34a' : '#dc2626'
                      }}
                    >
                      {metric.isPositive ? '▲' : '▼'} {metric.trend}
                    </span>
                    <span className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                      {metric.trendText}
                    </span>
                  </div>
                </div>
                
                {/* Chart */}
                <div className="flex-shrink-0 hidden sm:block">
                  <MiniBarChart data={metric.chartData} isPositive={metric.isPositive} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentHomePageSession1;
