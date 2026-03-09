import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, User, Globe, ChevronDown, LogOut, MessageCircle, HelpCircle, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';


const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const languageMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const t = translations[language];
  
  // Hover states
  const [hoveredHelpButton, setHoveredHelpButton] = useState(false);
  const [hoveredLanguageButton, setHoveredLanguageButton] = useState(false);
  const [hoveredLanguageMenuItemIndex, setHoveredLanguageMenuItemIndex] = useState(null);
  const [hoveredNotificationButton, setHoveredNotificationButton] = useState(false);
  const [hoveredUserButton, setHoveredUserButton] = useState(false);
  const [hoveredUserMenuItemIndex, setHoveredUserMenuItemIndex] = useState(null);

  // Lấy thông tin user từ localStorage
  const userType = localStorage.getItem('userType');
  const isCTV = userType === 'ctv';

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
      const userType = localStorage.getItem('userType');
      if (userType === 'ctv') {
        await apiService.logoutCTV();
      }
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

  // Mapping routes to page titles
  const getPageTitle = () => {
    const routeMap = {
      '/agent': language === 'vi' ? 'Thông tin chung' : language === 'en' ? 'General Information' : '一般情報',
      '/agent/jobs': language === 'vi' ? 'Danh sách việc làm' : language === 'en' ? 'Job List' : '求人リスト',
      '/agent/candidates': language === 'vi' ? 'Hồ sơ ứng viên' : language === 'en' ? 'Candidate Profile' : '候補者プロフィール',
      '/agent/nominations': language === 'vi' ? 'Quản lý tiến cử' : language === 'en' ? 'Nomination Management' : '推薦管理',
      '/agent/payment-history': language === 'vi' ? 'Lịch sử thanh toán' : language === 'en' ? 'Payment History' : '支払い履歴',
      '/agent/contact': language === 'vi' ? 'Liên hệ' : language === 'en' ? 'Contact' : 'お問い合わせ',
      '/agent/faq': language === 'vi' ? 'Các câu hỏi thường gặp' : language === 'en' ? 'FAQ' : 'よくある質問',
      '/agent/terms': language === 'vi' ? 'Điều khoản sử dụng' : language === 'en' ? 'Terms of Use' : '利用規約',
      '/agent/hotline': language === 'vi' ? 'Hotline hỗ trợ 24/7 qua Zalo' : language === 'en' ? '24/7 Hotline Support via Zalo' : 'Zalo経由24時間ホットラインサポート',
    };

    // Check exact match first
    if (routeMap[location.pathname]) {
      return routeMap[location.pathname];
    }

    // Check if path starts with any route (for nested routes)
    for (const [route, title] of Object.entries(routeMap)) {
      if (location.pathname.startsWith(route) && route !== '/agent') {
        return title;
      }
    }

    return routeMap['/agent']; // Default title
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  return (
    <header className="px-3 sm:px-4 py-2 sm:py-3 shadow-sm border-b" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Left side - Page Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold truncate" style={{ color: '#111827' }}>
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Help Guide Button */}
          <a
            href="https://dust-camel-0dd.notion.site/2c6563f4199880ae9cf0cbe005546446?v=2c6563f41998818a8e4d000cd327e761"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHoveredHelpButton(true)}
            onMouseLeave={() => setHoveredHelpButton(false)}
            className="rounded-lg px-3 py-2 sm:px-3 sm:py-2.5 transition-colors flex items-center gap-2"
            style={{
              backgroundColor: hoveredHelpButton ? '#e5e7eb' : '#f3f4f6'
            }}
            title={language === 'vi' ? 'Hướng dẫn sử dụng' : language === 'en' ? 'User Guide' : 'ユーザーガイド'}
          >
            <BookOpen className="w-5 h-5" style={{ color: '#374151' }} />
            <span className="hidden sm:inline text-sm font-medium" style={{ color: '#374151' }}>
              {language === 'vi' ? 'Hướng dẫn sử dụng' : language === 'en' ? 'User Guide' : 'ユーザーガイド'}
            </span>
          </a>

          {/* Language Switcher */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              onMouseEnter={() => setHoveredLanguageButton(true)}
              onMouseLeave={() => setHoveredLanguageButton(false)}
              className="rounded-lg p-2 sm:p-2.5 transition-colors"
              style={{
                backgroundColor: hoveredLanguageButton ? '#e5e7eb' : '#f3f4f6'
              }}
              title={languages.find(lang => lang.code === language)?.name}
            >
              <Globe className="w-5 h-5" style={{ color: '#374151' }} />
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
            className="rounded-lg p-2 sm:p-2.5 relative transition-colors"
            style={{
              backgroundColor: hoveredNotificationButton ? '#e5e7eb' : '#f3f4f6'
            }}
            title="Thông báo"
          >
            <Bell className="w-5 h-5" style={{ color: '#374151' }} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }}></span>
          </button>

          {/* User Profile: thông tin tài khoản + avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tên, rank, % - ẩn trên màn nhỏ nếu chật */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium truncate max-w-[120px] sm:max-w-[160px]" style={{ color: '#111827' }} title={userInfo?.name || ''}>
                {userInfo?.name || (language === 'vi' ? 'Tài khoản' : language === 'en' ? 'Account' : 'アカウント')}
              </p>
              {isCTV && userInfo?.rankLevel && (
                <p className="text-xs truncate max-w-[120px] sm:max-w-[160px]" style={{ color: '#6b7280' }}>
                  {userInfo.rankLevel.name || '—'} · {userInfo.rankLevel.percent != null ? `${Number(userInfo.rankLevel.percent)}%` : '—'}
                </p>
              )}
            </div>
            {/* Popup neo theo nút avatar để không bị lệch */}
            <div className="relative flex-shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onMouseEnter={() => setHoveredUserButton(true)}
                onMouseLeave={() => setHoveredUserButton(false)}
                className="rounded-lg p-2 sm:p-2.5 transition-colors"
                style={{
                  backgroundColor: hoveredUserButton ? '#e5e7eb' : '#f3f4f6'
                }}
                title={userInfo?.name || 'Tài khoản'}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
                  <User className="w-3.5 h-3.5" style={{ color: 'white' }} />
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg border z-50" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                {userInfo && (
                  <div className="p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{userInfo.name || 'CTV'}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{userInfo.email || ''}</p>
                  </div>
                )}
                <div className="py-1">
                  <Link
                    to={isCTV ? '/agent/profile' : '#'}
                    onClick={() => setShowUserMenu(false)}
                    onMouseEnter={() => setHoveredUserMenuItemIndex('account')}
                    onMouseLeave={() => setHoveredUserMenuItemIndex(null)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
                    style={{
                      backgroundColor: hoveredUserMenuItemIndex === 'account' ? '#f9fafb' : 'transparent',
                      color: '#374151'
                    }}
                  >
                    <User className="w-4 h-4" />
                    {language === 'vi' ? 'Thông tin tài khoản' : language === 'en' ? 'Account info' : 'アカウント情報'}
                  </Link>
                  <div className="border-t my-1" style={{ borderColor: '#e5e7eb' }}></div>
                  <button
                    onClick={handleLogout}
                    onMouseEnter={() => setHoveredUserMenuItemIndex('logout')}
                    onMouseLeave={() => setHoveredUserMenuItemIndex(null)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
                    style={{
                      backgroundColor: hoveredUserMenuItemIndex === 'logout' ? '#fef2f2' : 'transparent',
                      color: '#dc2626'
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;