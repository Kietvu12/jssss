import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const BottomNavbar = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language];
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
  // Hover states
  const [hoveredNavItemIndex, setHoveredNavItemIndex] = useState(null);

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

  const generalItems = [
    { id: 'thong-tin-chung', label: t.generalInfo, icon: LayoutGrid, path: '/agent' },
    { id: 'danh-sach-viec-lam', label: t.jobList, icon: Flag, path: '/agent/jobs' },
    { id: 'ho-so-ung-vien', label: t.candidateProfile, icon: FileCheck, path: '/agent/candidates' },
    { id: 'quan-ly-tien-cu', label: t.nominationManagement, icon: FileText, path: '/agent/nominations' },
    { id: 'lich-su-thanh-toan', label: t.paymentHistory, icon: History, path: '/agent/payment-history' },
  ];

  const otherItems = [
    { id: 'lien-he', label: t.contact, icon: Mail, path: '/agent/contact' },
    { id: 'cau-hoi-thuong-gap', label: t.faq, icon: HelpCircle, path: '/agent/faq' },
    { id: 'dieu-khoan-su-dung', label: t.terms, icon: FileType, path: '/agent/terms' },
    { id: 'hotline-zalo', label: t.hotline, icon: Phone, path: '/agent/hotline' },
  ];

  const isActive = (path) => {
    if (path === '/agent') {
      return location.pathname === '/agent' || location.pathname === '/agent/';
    }
    return location.pathname.startsWith(path);
  };

  // Show first 5 general items (most important)
  const navItems = generalItems.slice(0, 5);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t shadow-lg z-50" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onMouseEnter={() => setHoveredNavItemIndex(item.id)}
              onMouseLeave={() => setHoveredNavItemIndex(null)}
              className="flex items-center justify-center p-2.5 rounded-lg transition-colors relative"
              style={{
                backgroundColor: active 
                  ? '#fef2f2' 
                  : (hoveredNavItemIndex === item.id ? '#f9fafb' : 'transparent'),
                color: active ? '#dc2626' : '#6b7280'
              }}
              title={item.label}
            >
              <span className="relative inline-flex">
                <Icon className="w-5 h-5" style={{ color: active ? '#dc2626' : '#6b7280' }} />
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
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavbar;

