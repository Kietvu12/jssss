import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Flag,
  FileCheck,
  FileText,
  History,
  Mail,
  HelpCircle,
  FileType,
  Phone,
  ChevronRight,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [showNominationSubmenu, setShowNominationSubmenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const [hoveredMenuItemIndex, setHoveredMenuItemIndex] = useState(null);
  const [hoveredSubmenuItemIndex, setHoveredSubmenuItemIndex] = useState(null);
  const [hoveredTeamSelector, setHoveredTeamSelector] = useState(false);
  const [hoveredExpandButton, setHoveredExpandButton] = useState(false);

  const generalItems = [
    { id: 'thong-tin-chung', label: t.generalInfo, icon: LayoutGrid, path: '/agent' },
    { id: 'danh-sach-viec-lam', label: t.jobList, icon: Flag, path: '/agent/jobs' },
    { id: 'ho-so-ung-vien', label: t.candidateProfile, icon: FileCheck, path: '/agent/candidates' },
    { id: 'quan-ly-tien-cu', label: t.nominationManagement, icon: FileText, path: '/agent/nominations', hasSubmenu: true },
    { id: 'lich-su-thanh-toan', label: t.paymentHistory, icon: History, path: '/agent/payment-history' },
  ];

  const ZALO_HOTLINE_URL = 'https://zalo.me/0972899728';
  const otherItems = [
    { id: 'lien-he', label: t.contact, icon: Mail, path: '/agent/contact' },
    { id: 'cau-hoi-thuong-gap', label: t.faq, icon: HelpCircle, path: '/agent/faq' },
    { id: 'dieu-khoan-su-dung', label: t.terms, icon: FileType, path: '/agent/terms' },
    { id: 'hotline-zalo', label: t.hotline, icon: Phone, path: '/agent/hotline', externalUrl: ZALO_HOTLINE_URL },
  ];

  const isActive = (path) => {
    if (path === '/agent') {
      return location.pathname === '/agent' || location.pathname === '/agent/';
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    if (location.pathname.startsWith('/agent/nominations')) {
      setShowNominationSubmenu(true);
    }
  }, [location.pathname]);

  const fetchUnreadMessageCount = async () => {
    try {
      const count = await apiService.getCTVUnreadMessageCount();
      setUnreadMessageCount(typeof count === 'number' ? count : 0);
    } catch {
      setUnreadMessageCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadMessageCount();
    const interval = setInterval(fetchUnreadMessageCount, 60000);
    const onFocus = () => fetchUnreadMessageCount();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return (
    <div
      className={`hidden lg:flex ${isExpanded ? 'w-52' : 'w-20'} h-screen flex flex-col shadow-sm border-r transition-all duration-300 relative`}
      style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
    >
      {/* Logo Section */}
      <div
        className={`${isExpanded ? 'px-4 py-4' : 'p-3'} border-b flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
        style={{ borderColor: '#f3f4f6' }}
      >
        <Link to="/agent" className="flex items-center cursor-pointer overflow-hidden">
          <img
            src="/landing/jobshare-logo.png"
            alt="JobShare"
            className={`object-contain ${isExpanded ? 'max-h-9 w-auto' : 'h-8 w-auto max-w-full'}`}
          />
        </Link>
      </div>

      {/* Team/Space Selector - keep for Agent, compact when expanded */}
      {isExpanded && (
        <div className="px-2.5 pt-3 pb-1">
          <div
            onMouseEnter={() => setHoveredTeamSelector(true)}
            onMouseLeave={() => setHoveredTeamSelector(false)}
            className="rounded-lg p-2 flex items-center justify-between cursor-pointer transition-colors"
            style={{ backgroundColor: hoveredTeamSelector ? '#f3f4f6' : '#f9fafb' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#dc2626' }}>
                <span className="text-[10px] font-semibold" style={{ color: 'white' }}>E</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] truncate" style={{ color: '#6b7280' }}>Elux Space</span>
                <span className="text-[11px] font-medium truncate" style={{ color: '#111827' }}>HR Team</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Section - same padding and item style as AdminSidebar */}
      <div className="flex-1 overflow-y-auto overflow-x-visible px-2.5 py-3">
        <div className="space-y-1">
          {isExpanded && (
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: '#6b7280' }}>
              {t.general}
            </p>
          )}
          {generalItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            if (item.hasSubmenu) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (isExpanded) {
                        setShowNominationSubmenu(!showNominationSubmenu);
                      }
                      navigate(item.path);
                    }}
                    onMouseEnter={() => setHoveredMenuItemIndex(item.id)}
                    onMouseLeave={() => setHoveredMenuItemIndex(null)}
                    className={`w-full flex ${isExpanded ? 'items-center gap-2' : 'items-center justify-center'} px-2 py-1.5 rounded-lg transition-colors relative`}
                    style={{
                      backgroundColor: active ? '#f3f4f6' : (hoveredMenuItemIndex === item.id ? '#f9fafb' : 'transparent'),
                      color: active ? '#dc2626' : '#374151',
                    }}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <span className="relative inline-flex">
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? '#dc2626' : '#4b5563' }} />
                      {item.id === 'quan-ly-tien-cu' && unreadMessageCount > 0 && (
                        <span
                          className="absolute -top-0.5 -right-0.5 min-w-[8px] h-2 rounded-full flex items-center justify-center text-[9px] font-semibold"
                          style={{ backgroundColor: '#dc2626', color: '#fff', padding: '0 4px' }}
                          title={language === 'en' ? `${unreadMessageCount} unread messages` : language === 'ja' ? `${unreadMessageCount} 件の未読` : `${unreadMessageCount} tin nhắn chưa đọc`}
                        >
                          {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                        </span>
                      )}
                    </span>
                    {isExpanded && (
                      <>
                        <span className="text-[11px] sm:text-xs font-medium flex-1 text-left" style={{ color: active ? '#dc2626' : '#374151' }}>
                          {item.label}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showNominationSubmenu ? 'rotate-90' : ''}`} style={{ color: '#9ca3af' }} />
                      </>
                    )}
                  </button>
                  {showNominationSubmenu && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      <Link
                        to="/agent/nominations"
                        onMouseEnter={() => setHoveredSubmenuItemIndex('list')}
                        onMouseLeave={() => setHoveredSubmenuItemIndex(null)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                        style={{
                          backgroundColor: location.pathname === '/agent/nominations' ? '#fef2f2' : (hoveredSubmenuItemIndex === 'list' ? '#f9fafb' : 'transparent'),
                          color: location.pathname === '/agent/nominations' ? '#dc2626' : '#374151',
                        }}
                      >
                        <FileText className="w-3.5 h-3.5" style={{ color: location.pathname === '/agent/nominations' ? '#dc2626' : '#6b7280' }} />
                        <span className="text-[11px] flex-1 text-left" style={{ color: location.pathname === '/agent/nominations' ? '#dc2626' : '#374151' }}>
                          {t.nominationList || t.nominationManagement}
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                onMouseEnter={() => setHoveredMenuItemIndex(item.id)}
                onMouseLeave={() => setHoveredMenuItemIndex(null)}
                className={`w-full flex ${isExpanded ? 'items-center gap-2' : 'items-center justify-center'} px-2 py-1.5 rounded-lg transition-colors relative`}
                style={{
                  backgroundColor: active ? '#f3f4f6' : (hoveredMenuItemIndex === item.id ? '#f9fafb' : 'transparent'),
                  color: active ? '#dc2626' : '#374151',
                }}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? '#dc2626' : '#4b5563' }} />
                {isExpanded && (
                  <span className="text-[11px] sm:text-xs font-medium flex-1 text-left" style={{ color: active ? '#dc2626' : '#374151' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Others Section */}
        <div className={`${isExpanded ? 'border-t mt-3 pt-3' : 'mt-3'} space-y-1`} style={isExpanded ? { borderColor: '#e5e7eb' } : {}}>
          {isExpanded && (
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: '#6b7280' }}>
              {t.others}
            </p>
          )}
          {otherItems.map((item) => {
            const Icon = item.icon;
            const active = !item.externalUrl && isActive(item.path);
            const sharedClass = `w-full flex ${isExpanded ? 'items-center gap-2' : 'items-center justify-center'} px-2 py-1.5 rounded-lg transition-colors`;
            const sharedStyle = {
              backgroundColor: active ? '#f3f4f6' : (hoveredMenuItemIndex === item.id ? '#f9fafb' : 'transparent'),
              color: active ? '#dc2626' : '#374151',
            };

            if (item.externalUrl) {
              return (
                <a
                  key={item.id}
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredMenuItemIndex(item.id)}
                  onMouseLeave={() => setHoveredMenuItemIndex(null)}
                  className={sharedClass}
                  style={{ ...sharedStyle, color: '#374151' }}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#4b5563' }} />
                  {isExpanded && (
                    <span className="text-[11px] font-medium flex-1 text-left" style={{ color: '#374151' }}>{item.label}</span>
                  )}
                </a>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                onMouseEnter={() => setHoveredMenuItemIndex(item.id)}
                onMouseLeave={() => setHoveredMenuItemIndex(null)}
                className={sharedClass}
                style={sharedStyle}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? '#dc2626' : '#4b5563' }} />
                {isExpanded && (
                  <span className="text-[11px] font-medium flex-1 text-left" style={{ color: active ? '#dc2626' : '#374151' }}>{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Expand/Collapse Button - same style as AdminSidebar */}
      <div className={`${isExpanded ? 'px-3 py-3' : 'px-2 py-2'} border-t`} style={{ borderColor: '#f3f4f6' }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setHoveredExpandButton(true)}
          onMouseLeave={() => setHoveredExpandButton(false)}
          className={`w-full rounded-lg ${isExpanded ? 'px-2.5 py-2 flex items-center gap-1.5' : 'px-2 py-1.5 flex items-center justify-center'} transition-colors`}
          style={{
            backgroundColor: hoveredExpandButton ? '#b91c1c' : '#dc2626',
            color: 'white',
          }}
          title={!isExpanded ? (language === 'vi' ? 'Mở rộng' : language === 'en' ? 'Expand' : '展開') : undefined}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">{language === 'vi' ? 'Thu gọn' : language === 'en' ? 'Collapse' : '折りたたむ'}</span>
            </>
          ) : (
            <Menu className="w-5 h-5 flex-shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
