import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, Search, Settings, LogOut, Languages, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const ICON_TINT = '#b07a8a';
const BREADCRUMB_COLOR = '#67748E';
const TITLE_COLOR = '#441C2C';

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const notify = useNotification();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const userMenuRef = useRef(null);
  const t = translations[language] || translations.vi;
  const uiText = {
    searchPlaceholder: language === 'vi' ? 'Tìm kiếm' : language === 'en' ? 'Search' : '検索',
    notifications: language === 'vi' ? 'Thông báo' : language === 'en' ? 'Notifications' : '通知',
    autoParseTitle: language === 'vi' ? 'Auto-parse CV' : language === 'en' ? 'Auto-parse CV' : 'CV自動解析',
    autoParseOn: language === 'vi' ? 'Tắt auto-parse CV' : language === 'en' ? 'Turn off auto-parse CV' : 'CV自動解析をオフ',
    autoParseOff: language === 'vi' ? 'Bật auto-parse CV' : language === 'en' ? 'Turn on auto-parse CV' : 'CV自動解析をオン',
    info: language === 'vi' ? 'Thông tin' : language === 'en' ? 'Info' : '情報'
  };
  const [hoveredUserMenuItemIndex, setHoveredUserMenuItemIndex] = useState(null);
  const [autoParseRunning, setAutoParseRunning] = useState(false);
  const [autoParseBusy, setAutoParseBusy] = useState(false);

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUserInfo(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user info:', e);
      }
    }
  }, []);

  const routeMap = {
    '/admin': t.adminDashboard,
    '/admin/collaborators': t.adminCollaboratorManagement,
    '/admin/candidates': t.adminCandidateManagement,
    '/admin/jobs': t.adminJobManagement,
    '/admin/job-categories': t.adminJobCategoryManagement,
    '/admin/nominations': t.adminNominationManagement,
    '/admin/payments': t.adminPaymentManagement,
    '/admin/companies': t.adminSourceCompanyManagement,
    '/admin/reports': t.adminReport,
    '/admin/accounts': t.adminAccountManagement,
    '/admin/campaigns': t.adminCampaigns,
    '/admin/emails': t.adminSystemEmail,
    '/admin/settings': t.adminSettings,
    '/admin/posts': 'Bài viết',
  };

  const getPageTitle = () => {
    if (routeMap[location.pathname]) return routeMap[location.pathname];
    for (const [route, title] of Object.entries(routeMap)) {
      if (location.pathname.startsWith(route) && route !== '/admin') return title;
    }
    return routeMap['/admin'];
  };

  const getBreadcrumb = () => {
    const title = getPageTitle();
    const label = location.pathname === '/admin' ? t.adminDashboard : title;
    return `Pages / ${label}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleLanguage = () => {
    const next =
      language === 'vi'
        ? 'en'
        : language === 'en'
        ? 'ja'
        : 'vi';
    changeLanguage(next);
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await apiService.logoutAdmin();
      // Xóa thông tin đăng nhập
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      // Chuyển về trang đăng nhập
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn xóa thông tin và chuyển về trang đăng nhập ngay cả khi API lỗi
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      navigate('/login');
    }
  };

  const handleToggleAutoParse = async () => {
    if (autoParseBusy) return;
    setAutoParseBusy(true);
    try {
      // Toggle theo trạng thái backend để tránh lệch state khi reload trang.
      // - Nếu chưa chạy => start
      // - Nếu đang chạy => start trả 409 => tự gọi stop
      try {
        const res = await apiService.startAutoParseCVs();
        if (!res?.success) throw new Error(res?.message || 'Không thể bắt đầu auto-parse CV');
        setAutoParseRunning(true);
        notify.info('Đã bật auto-parse CV (chạy ngầm).');
      } catch (err) {
        if (err?.status === 409) {
          const res = await apiService.stopAutoParseCVs();
          if (!res?.success) throw new Error(res?.message || 'Không thể tắt auto-parse CV');
          const { processed, success, failed } = res?.data || {};
          setAutoParseRunning(false);
          notify.success(
            `Đã duyệt ${processed || 0} CV. Thành công: ${success || 0}. Thất bại: ${failed || 0}.`
          );
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('auto-parse toggle error:', err);
      notify.error(err?.message || 'Có lỗi khi thao tác auto-parse CV');
    } finally {
      setAutoParseBusy(false);
    }
  };

  return (
    <header className="px-6 py-1 sm:py-2 md:py-2.5 sticky top-0 z-50 bg-transparent">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: breadcrumb + title */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-[7px] sm:text-[10px] md:text-xs" style={{ color: BREADCRUMB_COLOR }}>
            {getBreadcrumb()}
          </p>
          <h1 className="text-[9px] sm:text-sm md:text-lg font-bold truncate" style={{ color: TITLE_COLOR }}>
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: single rounded container */}
        <div
          className="flex items-center gap-0.5 sm:gap-1.5 md:gap-2 px-1.5 sm:px-2.5 md:px-3.5 py-0.5 sm:py-1 md:py-1.5 rounded-2xl border bg-white"
          style={{
            borderColor: 'rgba(0,0,0,0.06)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2" style={{ color: ICON_TINT }} />
            <input
              type="text"
              placeholder={uiText.searchPlaceholder}
              className="pl-6 pr-2 py-1 rounded-lg text-[10px] sm:text-xs md:text-sm focus:outline-none w-28 md:w-40 bg-transparent border-0 focus:ring-0"
              style={{ color: '#1e293b' }}
            />
          </div>

          <div className="hidden md:block w-px h-6 bg-gray-200" aria-hidden />

          <button type="button" className="p-0.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label={uiText.notifications}>
            <Bell className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" style={{ color: ICON_TINT }} />
          </button>

          {/* Auto-parse CV toggle */}
          <button
            type="button"
            onClick={handleToggleAutoParse}
            disabled={autoParseBusy}
            className="p-0.5 rounded-lg hover:bg-gray-100 transition-colors hidden sm:inline-flex items-center"
            style={{
              cursor: autoParseBusy ? 'not-allowed' : 'pointer',
              opacity: autoParseBusy ? 0.6 : 1
            }}
            aria-label={uiText.autoParseTitle}
            title={autoParseRunning ? uiText.autoParseOn : uiText.autoParseOff}
            role="switch"
            aria-checked={autoParseRunning}
          >
            {/* iOS-style switch */}
            <span
              className="relative inline-block flex-shrink-0"
              style={{
                width: 26,
                height: 14,
                borderRadius: 9999,
                backgroundColor: autoParseRunning ? '#2563eb' : '#e5e7eb',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <span
                className="absolute top-0.5 rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  // Track width: 26px, knob width: 12px, keep ~2px padding on each side
                  left: autoParseRunning ? 12 : 2,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                  transition: 'left 160ms ease'
                }}
              />
            </span>
            <span className="ml-1 text-[9px] font-semibold" style={{ color: '#374151' }}>
              AI Parse
            </span>
          </button>

          {/* Language toggle */}
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="p-0.5 rounded-lg hover:bg-gray-100 transition-colors hidden sm:inline-flex items-center gap-0.5"
            aria-label="Change language"
          >
            <Languages className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" style={{ color: ICON_TINT }} />
            <span className="hidden md:inline text-[9px] font-medium text-gray-700">
              {language.toUpperCase()}
            </span>
          </button>

          <button
            type="button"
            className="p-0.5 rounded-lg hover:bg-gray-100 transition-colors hidden md:inline-flex"
            aria-label={uiText.info}
          >
            <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" style={{ color: ICON_TINT }} />
          </button>

          <div className="hidden md:block w-px h-6 bg-gray-200" aria-hidden />

          {/* User avatar + dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-0.5 rounded-full p-0.5 hover:opacity-90 transition-opacity"
            >
              <div
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200"
                style={{ backgroundColor: '#e2e8f0' }}
              >
                <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" style={{ color: ICON_TINT }} />
              </div>
            </button>
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border z-50 bg-white"
                style={{ borderColor: '#e5e7eb', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
              >
                <div className="p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-sm font-medium text-gray-900">{userInfo?.name || t.adminDefaultName}</p>
                  <p className="text-xs text-gray-500">{userInfo?.email || t.adminDefaultEmail}</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredUserMenuItemIndex('account')}
                    onMouseLeave={() => setHoveredUserMenuItemIndex(null)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {t.adminAccountInfo}
                  </button>
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredUserMenuItemIndex('settings')}
                    onMouseLeave={() => setHoveredUserMenuItemIndex(null)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {t.adminSettings}
                  </button>
                  <div className="border-t my-1" style={{ borderColor: '#e5e7eb' }} />
                  <button
                    type="button"
                    onClick={handleLogout}
                    onMouseEnter={() => setHoveredUserMenuItemIndex('logout')}
                    onMouseLeave={() => setHoveredUserMenuItemIndex(null)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.adminLogout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

