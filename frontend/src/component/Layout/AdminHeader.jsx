import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, Search, Settings, LogOut, Globe, ChevronDown, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';


const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const languageMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const t = translations[language] || translations.vi;
  
  // Hover states
  const [hoveredLanguageButton, setHoveredLanguageButton] = useState(false);
  const [hoveredLanguageMenuItemIndex, setHoveredLanguageMenuItemIndex] = useState(null);
  const [hoveredNotificationButton, setHoveredNotificationButton] = useState(false);
  const [hoveredUserButton, setHoveredUserButton] = useState(false);
  const [hoveredUserMenuItemIndex, setHoveredUserMenuItemIndex] = useState(null);

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

  // Mapping routes to page titles
  const getPageTitle = () => {
    const routeMap = {
      '/admin': t.adminDashboard,
      '/admin/collaborators': t.adminCollaboratorManagement,
      '/admin/candidates': t.adminCandidateManagement,
      '/admin/jobs': t.adminJobManagement,
      '/admin/nominations': t.adminNominationManagement,
      '/admin/payments': t.adminPaymentManagement,
      '/admin/companies': t.adminSourceCompanyManagement,
      '/admin/reports': t.adminReport,
      '/admin/accounts': t.adminAccountManagement,
      '/admin/campaigns': t.adminCampaigns,
      '/admin/emails': t.adminSystemEmail,
      '/admin/settings': t.adminSettings,
    };

    // Check exact match first
    if (routeMap[location.pathname]) {
      return routeMap[location.pathname];
    }

    // Check if path starts with any route (for nested routes)
    for (const [route, title] of Object.entries(routeMap)) {
      if (location.pathname.startsWith(route) && route !== '/admin') {
        return title;
      }
    }

    return routeMap['/admin']; // Default title
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  return (
    <header className="px-6 py-4 shadow-sm sticky top-0 z-50 border-b" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <h1 className="text-xl font-semibold" style={{ color: '#111827' }}>{getPageTitle()}</h1>
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder={t.adminSearchPlaceholder}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none w-64"
              style={{ borderColor: '#d1d5db' }}
            />
          </div>

          {/* Language Switcher */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              onMouseEnter={() => setHoveredLanguageButton(true)}
              onMouseLeave={() => setHoveredLanguageButton(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
              style={{
                backgroundColor: hoveredLanguageButton ? '#e5e7eb' : '#f3f4f6'
              }}
            >
              <Globe className="w-4 h-4" style={{ color: '#374151' }} />
              <span className="text-sm font-medium" style={{ color: '#374151' }}>
                {languages.find(lang => lang.code === language)?.flag}
              </span>
              <ChevronDown className="w-4 h-4" style={{ color: '#374151' }} />
            </button>
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowLanguageMenu(false);
                    }}
                    onMouseEnter={() => setHoveredLanguageMenuItemIndex(lang.code)}
                    onMouseLeave={() => setHoveredLanguageMenuItemIndex(null)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors"
                    style={{
                      backgroundColor: language === lang.code 
                        ? '#fef2f2' 
                        : (hoveredLanguageMenuItemIndex === lang.code ? '#f9fafb' : 'transparent'),
                      color: language === lang.code ? '#dc2626' : '#374151'
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                    {language === lang.code && (
                      <span className="ml-auto" style={{ color: '#dc2626' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* Notification Bell */}
          <button 
            onMouseEnter={() => setHoveredNotificationButton(true)}
            onMouseLeave={() => setHoveredNotificationButton(false)}
            className="rounded-lg p-2.5 relative transition-colors"
            style={{
              backgroundColor: hoveredNotificationButton ? '#e5e7eb' : '#f3f4f6'
            }}
          >
            <Bell className="w-5 h-5" style={{ color: '#374151' }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }}></span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              onMouseEnter={() => setHoveredUserButton(true)}
              onMouseLeave={() => setHoveredUserButton(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
              style={{
                backgroundColor: hoveredUserButton ? '#e5e7eb' : '#f3f4f6'
              }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
                <User className="w-4 h-4" style={{ color: 'white' }} />
              </div>
              {userInfo && (
                <div className="hidden md:block text-left">
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{userInfo.name || t.adminDefaultName}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{userInfo.email || ''}</p>
                </div>
              )}
              {!userInfo && (
                <div className="hidden md:block text-left">
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{t.adminDefaultName}</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>{t.adminDefaultEmail}</p>
                </div>
              )}
              <ChevronDown className="w-4 h-4" style={{ color: '#374151' }} />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border z-50" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                {userInfo && (
                  <div className="p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{userInfo.name || t.adminDefaultName}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{userInfo.email || ''}</p>
                  </div>
                )}
                {!userInfo && (
                  <div className="p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{t.adminDefaultName}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{t.adminDefaultEmail}</p>
                  </div>
                )}
                <div className="py-1">
                  <button 
                    onMouseEnter={() => setHoveredUserMenuItemIndex('account')}
                    onMouseLeave={() => setHoveredUserMenuItemIndex(null)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
                    style={{
                      color: '#374151',
                      backgroundColor: hoveredUserMenuItemIndex === 'account' ? '#f9fafb' : 'transparent'
                    }}
                  >
                    <User className="w-4 h-4" />
                    {t.adminAccountInfo}
                  </button>
                  <button 
                    onMouseEnter={() => setHoveredUserMenuItemIndex('settings')}
                    onMouseLeave={() => setHoveredUserMenuItemIndex(null)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
                    style={{
                      color: '#374151',
                      backgroundColor: hoveredUserMenuItemIndex === 'settings' ? '#f9fafb' : 'transparent'
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    {t.adminSettings}
                  </button>
                  <div className="border-t my-1" style={{ borderColor: '#e5e7eb' }}></div>
                  <button
                    onClick={handleLogout}
                    onMouseEnter={() => setHoveredUserMenuItemIndex('logout')}
                    onMouseLeave={() => setHoveredUserMenuItemIndex(null)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
                    style={{
                      color: '#dc2626',
                      backgroundColor: hoveredUserMenuItemIndex === 'logout' ? '#fef2f2' : 'transparent'
                    }}
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

