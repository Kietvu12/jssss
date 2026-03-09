import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, Users, Briefcase } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api.js';

const AdminDashboardSession1 = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán tổng doanh thu từ payments
  const calculateTotalRevenue = () => {
    if (!dashboardData?.paymentRequests) return 0;
    // Giả sử doanh thu là tổng số tiền đã thanh toán (status = 2)
    // Cần lấy từ payment statistics
    return 0; // Sẽ cập nhật sau khi có payment statistics
  };

  // Format số với dấu phẩy
  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('en-US');
  };

  // Tính phần trăm progress
  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: t.adminDashboardTotalCtv,
      value: formatNumber(dashboardData?.collaborators?.total || 0),
      icon: Users,
      iconColor: 'bg-purple-100',
      iconBg: 'text-purple-600',
      progressLabel: t.adminDashboardActive,
      progressValue: calculateProgress(
        dashboardData?.collaborators?.active || 0,
        dashboardData?.collaborators?.total || 1
      ),
      progressColor: 'bg-purple-600',
      progressTextColor: 'text-purple-600',
      changePercent: 0,
      changeValue: `${formatNumber(dashboardData?.collaborators?.active || 0)} ${t.adminDashboardSuffixActive}`,
      changeColor: 'text-teal-600',
    },
    {
      title: t.adminDashboardTotalJobs,
      value: formatNumber(dashboardData?.jobs?.total || 0),
      icon: Briefcase,
      iconColor: 'bg-teal-100',
      iconBg: 'text-teal-600',
      progressLabel: t.adminDashboardPublished,
      progressValue: calculateProgress(
        dashboardData?.jobs?.published || 0,
        dashboardData?.jobs?.total || 1
      ),
      progressColor: 'bg-teal-600',
      progressTextColor: 'text-teal-600',
      changePercent: 0,
      changeValue: `${formatNumber(dashboardData?.jobs?.published || 0)} ${t.adminDashboardSuffixPublished}`,
      changeColor: 'text-teal-600',
    },
    {
      title: t.adminDashboardApplications,
      value: formatNumber(dashboardData?.applications?.total || 0),
      icon: ShoppingCart,
      iconColor: 'bg-blue-100',
      iconBg: 'text-blue-600',
      progressLabel: t.adminDashboardApproved,
      progressValue: calculateProgress(
        dashboardData?.applications?.approved || 0,
        dashboardData?.applications?.total || 1
      ),
      progressColor: 'bg-blue-600',
      progressTextColor: 'text-blue-600',
      changePercent: 0,
      changeValue: `${formatNumber(dashboardData?.applications?.approved || 0)} ${t.adminDashboardSuffixApproved}`,
      changeColor: 'text-teal-600',
    },
    {
      title: t.adminDashboardPaymentRequests,
      value: formatNumber(dashboardData?.paymentRequests?.total || 0),
      icon: DollarSign,
      iconColor: 'bg-orange-100',
      iconBg: 'text-orange-600',
      progressLabel: t.adminDashboardPaid,
      progressValue: calculateProgress(
        dashboardData?.paymentRequests?.paid || 0,
        dashboardData?.paymentRequests?.total || 1
      ),
      progressColor: 'bg-orange-600',
      progressTextColor: 'text-orange-600',
      changePercent: 0,
      changeValue: `${formatNumber(dashboardData?.paymentRequests?.paid || 0)} ${t.adminDashboardSuffixPaid}`,
      changeColor: 'text-teal-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">{card.title}</h3>
              <div className={`${card.iconColor} p-2 rounded-lg`}>
                <Icon className={`w-5 h-5 ${card.iconBg}`} />
              </div>
            </div>

            {/* Value */}
            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">{card.progressLabel}</span>
                <span className={`text-xs font-semibold ${card.progressTextColor}`}>
                  {card.progressValue}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${card.progressColor} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${card.progressValue}%` }}
                ></div>
              </div>
            </div>

            {/* Change Indicator */}
            <div className="flex items-center gap-2">
              {card.changePercent > 0 && (
                <span className={`text-sm font-semibold ${card.changeColor}`}>
                  {card.changePercent}% ▲
                </span>
              )}
              <span className="text-sm text-gray-500">{card.changeValue}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminDashboardSession1;

