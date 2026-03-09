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
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  Menu,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [showNominationSubmenu, setShowNominationSubmenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
  // Hover states
  const [hoveredMenuItemIndex, setHoveredMenuItemIndex] = useState(null);
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

  // Auto-expand submenu if on nominations page
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
    <div className={`hidden lg:flex ${isExpanded ? 'w-64' : 'w-28'} h-screen flex flex-col transition-all duration-300`} style={{ backgroundColor: 'white', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      {/* Logo Section */}
      <div className={`${isExpanded ? 'p-6' : 'p-4'} border-b flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`} style={{ borderColor: '#f3f4f6' }}>
        <Link to="/agent" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
            <Check className="w-5 h-5" style={{ color: 'white' }} />
          </div>
          {isExpanded && <span className="text-xl font-bold" style={{ color: '#111827' }}>JobShare</span>}
        </Link>
      </div>

      {/* Team/Space Selector */}
      {isExpanded && (
        <div className="px-4 pt-4 pb-2">
          <div 
            onMouseEnter={() => setHoveredTeamSelector(true)}
            onMouseLeave={() => setHoveredTeamSelector(false)}
            className="rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors"
            style={{
              backgroundColor: hoveredTeamSelector ? '#f3f4f6' : '#f9fafb'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
                <span className="text-xs font-semibold" style={{ color: 'white' }}>E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs" style={{ color: '#6b7280' }}>Elux Space</span>
                <span className="text-sm font-medium" style={{ color: '#111827' }}>HR Team</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: '#9ca3af' }} />
          </div>
        </div>
      )}

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* General Section */}
        <div className="mb-6">
          {isExpanded && (
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: '#6b7280' }}>
              {t.general}
            </h3>
          )}
          <div className="space-y-1">
            {generalItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <div key={item.id}>
                  {item.hasSubmenu ? (
                    <button
                      onClick={() => {
                        if (isExpanded) {
                          setShowNominationSubmenu(!showNominationSubmenu);
                        }
                        navigate(item.path);
                      }}
                      onMouseEnter={() => setHoveredMenuItemIndex(item.id)}
                      onMouseLeave={() => setHoveredMenuItemIndex(null)}
                      className={`w-full flex ${isExpanded ? 'items-center gap-3' : 'flex-col items-center gap-1'} px-2 py-2.5 rounded-lg transition-colors relative`}
                      style={{
                        backgroundColor: active 
                          ? '#f3f4f6' 
                          : (hoveredMenuItemIndex === item.id ? '#f9fafb' : 'transparent'),
                        color: active ? '#dc2626' : '#374151'
                      }}
                    >
                      <span className="relative inline-flex">
                        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: active ? '#dc2626' : '#4b5563' }} />
                        {item.id === 'quan-ly-tien-cu' && unreadMessageCount > 0 && (
                          <span
                            className="absolute -top-0.5 -right-0.5 min-w-[8px] h-2 rounded-full flex items-center justify-center text-[10px] font-semibold"
                            style={{ backgroundColor: '#dc2626', color: '#fff', padding: '0 4px' }}
                            title={`${unreadMessageCount} tin nhắn chưa đọc`}
                          >
                            {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                          </span>
                        )}
                      </span>
                      {isExpanded ? (
                        <>
                          <span className="text-sm font-medium flex-1 text-left" style={{ color: active ? '#dc2626' : '#374151' }}>
                            {item.label}
                          </span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${showNominationSubmenu ? 'rotate-90' : ''}`} style={{ color: '#9ca3af' }} />
                        </>
                      ) : (
                        <span className="text-[10px] font-medium text-center leading-tight break-words" style={{ color: active ? '#dc2626' : '#374151' }}>
                          {item.label}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      onMouseEnter={() => setHoveredMenuItemIndex(item.id)}
                      onMouseLeave={() => setHoveredMenuItemIndex(null)}
                      className={`w-full flex ${isExpanded ? 'items-center gap-3' : 'flex-col items-center gap-1'} px-2 py-2.5 rounded-lg transition-colors`}
                      style={{
                        backgroundColor: active 
                          ? '#f3f4f6' 
                          : (hoveredMenuItemIndex === item.id ? '#f9fafb' : 'transparent'),
                        color: active ? '#dc2626' : '#374151'
                      }}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: active ? '#dc2626' : '#4b5563' }} />
                      {isExpanded ? (
                        <span className="text-sm font-medium flex-1 text-left" style={{ color: active ? '#dc2626' : '#374151' }}>
                          {item.label}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-center leading-tight break-words" style={{ color: active ? '#dc2626' : '#374151' }}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  )}
                  {item.hasSubmenu && showNominationSubmenu && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {/* Submenu items can be added here */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Others Section */}
        <div className={`${isExpanded ? 'border-t' : ''} pt-6`} style={isExpanded ? { borderColor: '#e5e7eb' } : {}}>
          {isExpanded && (
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: '#6b7280' }}>
              {t.others}
            </h3>
          )}
          <div className="space-y-1">
            {otherItems.map((item) => {
              const Icon = item.icon;
              const active = !item.externalUrl && isActive(item.path);
              const sharedClassName = `w-full flex ${isExpanded ? 'items-center gap-3' : 'flex-col items-center gap-1'} px-2 py-2.5 rounded-lg transition-colors`;
              const sharedStyle = {
                backgroundColor: hoveredMenuItemIndex === item.id ? '#f9fafb' : 'transparent',
                color: '#374151'
              };
              const content = (
                <>
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: '#4b5563' }} />
                  {isExpanded ? (
                    <span className="text-sm font-medium flex-1 text-left" style={{ color: '#374151' }}>
                      {item.label}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-center leading-tight break-words" style={{ color: '#374151' }}>
                      {item.label}
                    </span>
                  )}
                </>
              );

              if (item.externalUrl) {
                return (
                  <a
                    key={item.id}
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredMenuItemIndex(item.id)}
                    onMouseLeave={() => setHoveredMenuItemIndex(null)}
                    className={sharedClassName}
                    style={sharedStyle}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onMouseEnter={() => setHoveredMenuItemIndex(item.id)}
                  onMouseLeave={() => setHoveredMenuItemIndex(null)}
                  className={sharedClassName}
                  style={{
                    backgroundColor: active ? '#f3f4f6' : (hoveredMenuItemIndex === item.id ? '#f9fafb' : 'transparent'),
                    color: active ? '#dc2626' : '#374151'
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: active ? '#dc2626' : '#4b5563' }} />
                  {isExpanded ? (
                    <span className="text-sm font-medium flex-1 text-left" style={{ color: active ? '#dc2626' : '#374151' }}>
                      {item.label}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-center leading-tight break-words" style={{ color: active ? '#dc2626' : '#374151' }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <div className={`${isExpanded ? 'p-4' : 'p-2'} border-t`} style={{ borderColor: '#f3f4f6' }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setHoveredExpandButton(true)}
          onMouseLeave={() => setHoveredExpandButton(false)}
          className={`w-full rounded-lg ${isExpanded ? 'px-3 py-2.5 flex items-center gap-2' : 'px-2 py-2 flex flex-col items-center gap-1'} transition-colors`}
          style={{
            backgroundColor: hoveredExpandButton ? '#b91c1c' : '#dc2626',
            color: 'white'
          }}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Thu gọn</span>
            </>
          ) : (
            <>
              <Menu className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] font-medium text-center leading-tight break-words">Mở rộng</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default Sidebar;

