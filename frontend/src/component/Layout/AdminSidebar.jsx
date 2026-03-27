import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  FileCheck,
  DollarSign,
  Building2,
  BarChart3,
  UserCog,
  Megaphone,
  Mail,
  ChevronRight,
  Calendar,
  ChevronLeft,
  List,
  UserPlus,
  FolderTree,
  UserCheck,
  Handshake,
  Menu,
  CheckCircle,
  Newspaper,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [showCollaboratorSubmenu, setShowCollaboratorSubmenu] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownItem, setDropdownItem] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef({});
  
  // Hover states
  const [hoveredMenuItemIndex, setHoveredMenuItemIndex] = useState(null);
  const [hoveredSubmenuItemIndex, setHoveredSubmenuItemIndex] = useState(null);
  const [hoveredAccountsItem, setHoveredAccountsItem] = useState(false);
  const [hoveredJobCategoryItem, setHoveredJobCategoryItem] = useState(false);
  const [hoveredExpandButton, setHoveredExpandButton] = useState(false);
  const [hoveredDropdownItemIndex, setHoveredDropdownItemIndex] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Check if user is Super Admin (role = 1)
  const isSuperAdmin = adminProfile?.role === 1;
  // Check if user is AdminBackOffice (role = 2)
  const isAdminBackOffice = adminProfile?.role === 2;
  // Check if user is Admin CA Team (role = 3)
  const isAdminCATeam = adminProfile?.role === 3;

  // Base menu items - visible to all roles
  const baseMenuItems = [
    { 
      id: 'dashboard', 
      label: t.adminDashboard, 
      icon: LayoutDashboard, 
      path: '/admin',
      roles: [1, 2, 3] // All roles
    },
  ];

  // Menu items for Super Admin and Admin Backoffice
  const adminMenuItems = [
    { 
      id: 'quan-ly-ctv', 
      label: t.adminCollaboratorManagement, 
      icon: Users, 
      path: '/admin/collaborators',
      hasSubmenu: true,
      roles: [1, 2], // Super Admin and Admin Backoffice
      submenu: [
        {
          id: 'danh-sach-ctv',
          label: t.adminCollaboratorList,
          icon: List,
          path: '/admin/collaborators',
        },
        {
          id: 'phe-duyet-ctv',
          label: t.adminCollaboratorApproval,
          icon: CheckCircle,
          path: '/admin/collaborators/approval',
        },
        {
          id: 'them-moi-ctv',
          label: t.adminCollaboratorCreate,
          icon: UserPlus,
          path: '/admin/collaborators/new',
          roles: [1], // Only Super Admin
        },
      ]
    },
    { 
      id: 'quan-ly-ho-so-ung-vien', 
      label: t.adminCandidateManagement, 
      icon: FileText, 
      path: '/admin/candidates',
      roles: [1, 2] // Super Admin and Admin Backoffice
    },
    { 
      id: 'quan-ly-cong-viec', 
      label: t.adminJobManagement, 
      icon: Briefcase, 
      path: '/admin/jobs',
      roles: [1, 2] // Super Admin and Admin Backoffice
    },
    { 
      id: 'quan-ly-don-tien-cu', 
      label: t.adminNominationManagement, 
      icon: FileCheck, 
      path: '/admin/nominations',
      roles: [1, 2, 3] // All roles
    },
    { 
      id: 'quan-ly-thanh-toan', 
      label: t.adminPaymentManagement, 
      icon: DollarSign, 
      path: '/admin/payments',
      roles: [1, 2, 3] // All roles
    },
    { 
      id: 'quan-ly-doanh-nghiep', 
      label: t.adminSourceCompanyManagement, 
      icon: Building2, 
      path: '/admin/companies',
      roles: [1] // Only Super Admin
    },
    { 
      id: 'bao-cao-thong-ke', 
      label: t.adminReport, 
      icon: BarChart3, 
      path: '/admin/reports',
      roles: [1, 2] // Super Admin and Admin Backoffice
    },
    { 
      id: 'chien-dich', 
      label: t.adminCampaigns, 
      icon: Megaphone, 
      path: '/admin/campaigns',
      roles: [1] // Only Super Admin
    },
    { 
      id: 'quan-ly-bai-viet', 
      label: t.adminPostManagement, 
      icon: Newspaper, 
      path: '/admin/posts',
      roles: [1, 2] // Super Admin and Admin Backoffice
    },
    { 
      id: 'quan-ly-su-kien', 
      label: t.adminEventManagement || 'Quản lý sự kiện', 
      icon: Calendar, 
      path: '/admin/events',
      roles: [1, 2] // Super Admin and Admin Backoffice
    },
    { 
      id: 'email-he-thong', 
      label: t.adminSystemEmail, 
      icon: Mail, 
      path: '/admin/emails',
      roles: [1] // Only Super Admin
    },
  ];

  // Menu items for Admin CA Team (role = 3) - limited access
  const adminCATeamMenuItems = [
    { 
      id: 'thong-tin-nhom', 
      label: t.adminGroupInfo, 
      icon: Users, 
      path: '/admin/my-group',
      roles: [3] // Only Admin CA Team
    },
    { 
      id: 'ctv-nhom', 
      label: t.adminGroupCollaborators, 
      icon: Users, 
      path: '/admin/group-collaborators',
      roles: [3] // Only Admin CA Team
    },
    { 
      id: 'danh-sach-viec-lam-nhom', 
      label: t.adminGroupJobs, 
      icon: Briefcase, 
      path: '/admin/group-jobs',
      roles: [3] // Only Admin CA Team
    },
    { 
      id: 'ho-so-ung-vien-nhom', 
      label: t.adminGroupCandidates, 
      icon: FileText, 
      path: '/admin/group-candidates',
      roles: [3] // Only Admin CA Team
    },
  ];

  // Filter menu items based on role
  const menuItems = [
    ...baseMenuItems,
    ...adminMenuItems.filter(item => {
      if (item.roles && !item.roles.includes(adminProfile?.role)) {
        return false;
      }
      // Filter submenu items
      if (item.hasSubmenu && item.submenu) {
        item.submenu = item.submenu.filter(subItem => {
          if (subItem.roles && !subItem.roles.includes(adminProfile?.role)) {
            return false;
          }
          return true;
        });
        // Only show parent if it has visible submenu items
        return item.submenu.length > 0;
      }
      return true;
    }),
    ...adminCATeamMenuItems.filter(item => {
      return item.roles && item.roles.includes(adminProfile?.role);
    })
  ];

  // Add menu items based on role
  const roleBasedMenuItems = [];
  
  // Super Admin: Quản lý phân công phụ trách (Quản lý nhóm đã ẩn)
  if (isSuperAdmin) {
    roleBasedMenuItems.push({
      id: 'phan-cong-ctv',
      label: t.adminAssignmentManagement,
      icon: Handshake,
      path: '/admin/collaborator-assignments',
    });
  }
  
  // AdminBackOffice: CTV được phân công
  if (isAdminBackOffice) {
    roleBasedMenuItems.push({
      id: 'ctv-duoc-phan-cong',
      label: t.adminAssignedCollaborators,
      icon: UserCheck,
      path: '/admin/my-assigned-collaborators',
    });
  }

  // Combine menu items
  const allMenuItems = [...menuItems, ...roleBasedMenuItems];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  // Load admin profile
  const fetchUnreadMessageCount = async () => {
    try {
      const count = await apiService.getAdminUnreadMessageCount();
      setUnreadMessageCount(typeof count === 'number' ? count : 0);
    } catch {
      setUnreadMessageCount(0);
    }
  };

  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const response = await apiService.getAdminProfile();
        if (response.success && response.data?.admin) {
          setAdminProfile(response.data.admin);
        }
      } catch (error) {
        console.error('Error loading admin profile:', error);
      }
    };
    loadAdminProfile();
  }, []);

  // Fetch unread message count (admin chưa đọc tin từ CTV) và refresh định kỳ / khi focus
  useEffect(() => {
    if (!adminProfile) return;
    fetchUnreadMessageCount();
    const interval = setInterval(fetchUnreadMessageCount, 60000);
    const onFocus = () => fetchUnreadMessageCount();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [adminProfile]);

  // Auto-expand submenu if on collaborators pages
  useEffect(() => {
    if (location.pathname.startsWith('/admin/collaborators')) {
      setShowCollaboratorSubmenu(true);
    }
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown) {
        // Check if click is outside both the button and the dropdown
        const button = buttonRefs.current[dropdownItem?.id];
        const dropdown = document.querySelector('[data-dropdown="admin-sidebar"]');
        
        if (button && dropdown) {
          const isClickInsideButton = button.contains(event.target);
          const isClickInsideDropdown = dropdown.contains(event.target);
          
          if (!isClickInsideButton && !isClickInsideDropdown) {
            setShowDropdown(false);
          }
        } else if (!button && !dropdown) {
          setShowDropdown(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, dropdownItem]);

  // Close dropdown when sidebar expands
  useEffect(() => {
    if (isExpanded) {
      setShowDropdown(false);
    }
  }, [isExpanded]);


  return (
    <>
    <div
      className={`hidden lg:flex ${isExpanded ? 'w-52' : 'w-20'} h-screen flex flex-col shadow-sm border-r transition-all duration-300 relative`}
      style={{ backgroundColor: 'white', borderColor: '#e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
    >
      {/* Logo Section */}
      <div
        className={`${isExpanded ? 'px-4 py-4' : 'p-3'} border-b flex items-center ${
          isExpanded ? 'justify-start' : 'justify-center'
        }`}
        style={{ borderColor: '#f3f4f6' }}
      >
        <Link to="/admin" className="flex items-center cursor-pointer overflow-hidden">
          <img
            src="/landing/jobshare-logo.png"
            alt="JobShare"
            className={`object-contain ${isExpanded ? 'max-h-9 w-auto' : 'h-8 w-auto max-w-full'}`}
          />
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto overflow-x-visible px-2.5 py-3">
        <div className="space-y-1">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            if (item.hasSubmenu) {
              return (
                <div key={item.id} className="relative">
                  <button
                    ref={(el) => (buttonRefs.current[item.id] = el)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isExpanded) {
                        setShowCollaboratorSubmenu(!showCollaboratorSubmenu);
                      } else {
                        // Show dropdown when collapsed
                        if (buttonRefs.current[item.id]) {
                          const rect = buttonRefs.current[item.id].getBoundingClientRect();
                          setDropdownPosition({
                            top: rect.top,
                            left: rect.right + 8 // 8px gap
                          });
                        }
                        // Toggle dropdown
                        if (showDropdown && dropdownItem?.id === item.id) {
                          setShowDropdown(false);
                        } else {
                          setShowDropdown(true);
                          setDropdownItem(item);
                        }
                      }
                    }}
                    onMouseEnter={() => setHoveredMenuItemIndex(item.id)}
                    onMouseLeave={() => setHoveredMenuItemIndex(null)}
                    className={`w-full flex ${
                      isExpanded ? 'items-center gap-2' : 'items-center justify-center'
                    } px-2 py-1.5 rounded-lg transition-colors relative`}
                    style={{
                      backgroundColor: active 
                        ? '#f3f4f6' 
                        : (hoveredMenuItemIndex === item.id ? '#f9fafb' : 'transparent'),
                      color: active ? '#dc2626' : '#374151'
                    }}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? '#dc2626' : '#4b5563' }} />
                    {isExpanded && (
                      <>
                        <span className="text-[11px] sm:text-xs font-medium flex-1 text-left" style={{ color: active ? '#dc2626' : '#374151' }}>
                          {item.label}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCollaboratorSubmenu ? 'rotate-90' : ''}`} style={{ color: '#9ca3af' }} />
                      </>
                    )}
                  </button>
                  {showCollaboratorSubmenu && item.submenu && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = location.pathname === subItem.path || 
                          (subItem.path === '/admin/collaborators' && location.pathname === '/admin/collaborators');
                        
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            onMouseEnter={() => setHoveredSubmenuItemIndex(subItem.id)}
                            onMouseLeave={() => setHoveredSubmenuItemIndex(null)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                            style={{
                              backgroundColor: subActive 
                                ? '#fef2f2' 
                                : (hoveredSubmenuItemIndex === subItem.id ? '#f9fafb' : 'transparent'),
                              color: subActive ? '#dc2626' : '#374151'
                            }}
                          >
                            <SubIcon className="w-3.5 h-3.5" style={{ color: subActive ? '#dc2626' : '#6b7280' }} />
                            <span className={`text-[11px] flex-1 text-left ${subActive ? 'font-medium' : ''}`} style={{ color: subActive ? '#dc2626' : '#374151' }}>
                              {subItem.label}
                            </span>
                          </Link>
                        );
                      })}
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
                  backgroundColor: active 
                    ? '#f3f4f6' 
                    : (hoveredMenuItemIndex === item.id ? '#f9fafb' : 'transparent'),
                  color: active ? '#dc2626' : '#374151'
                }}
                title={!isExpanded ? item.label : undefined}
              >
                <span className="relative inline-flex">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? '#dc2626' : '#4b5563' }} />
                  {item.id === 'quan-ly-don-tien-cu' && unreadMessageCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[8px] h-2 rounded-full flex items-center justify-center text-[9px] font-semibold"
                      style={{ backgroundColor: '#dc2626', color: '#fff', padding: '0 4px' }}
                      title={
                        language === 'en'
                          ? `${unreadMessageCount} unread messages`
                          : language === 'ja'
                          ? `${unreadMessageCount} 件の未読メッセージ`
                          : `${unreadMessageCount} tin nhắn chưa đọc`
                      }
                    >
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </span>
                {isExpanded && (
                  <span className="text-[11px] sm:text-xs font-medium flex-1 text-left" style={{ color: active ? '#dc2626' : '#374151' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Account Management Section */}
      <div className={`${isExpanded ? 'px-3 py-3' : 'px-2 py-2'} border-t`} style={{ borderColor: '#f3f4f6' }}>
        <Link
          to="/admin/accounts"
          onMouseEnter={() => setHoveredAccountsItem(true)}
          onMouseLeave={() => setHoveredAccountsItem(false)}
          className={`w-full flex ${isExpanded ? 'items-center gap-2' : 'items-center justify-center'} px-2 py-1.5 rounded-lg transition-colors`}
          style={{
            backgroundColor: isActive('/admin/accounts')
              ? '#f3f4f6'
              : (hoveredAccountsItem ? '#f9fafb' : 'transparent'),
            color: isActive('/admin/accounts') ? '#dc2626' : '#374151'
          }}
          title={!isExpanded ? t.adminAccountManagement : undefined}
        >
          <UserCog className="w-4 h-4 flex-shrink-0" style={{ color: isActive('/admin/accounts') ? '#dc2626' : '#4b5563' }} />
          {isExpanded && (
            <span className="text-[11px] font-medium" style={{ color: isActive('/admin/accounts') ? '#dc2626' : '#374151' }}>
              {t.adminAccountManagement}
            </span>
          )}
        </Link>
      </div>

      {/* Job Category Section (replace Settings) */}
      <div className={`${isExpanded ? 'px-3' : 'px-2'} pb-3`}>
        {isSuperAdmin && (
          <Link
            to="/admin/job-categories"
            onMouseEnter={() => setHoveredJobCategoryItem(true)}
            onMouseLeave={() => setHoveredJobCategoryItem(false)}
            className={`w-full flex ${isExpanded ? 'items-center gap-2' : 'items-center justify-center'} px-2 py-1.5 rounded-lg transition-colors`}
            style={{
              backgroundColor: isActive('/admin/job-categories')
                ? '#f3f4f6'
                : (hoveredJobCategoryItem ? '#f9fafb' : 'transparent'),
              color: isActive('/admin/job-categories') ? '#dc2626' : '#374151'
            }}
            title={!isExpanded ? t.adminJobCategoryManagement : undefined}
          >
            <FolderTree className="w-4 h-4 flex-shrink-0" style={{ color: isActive('/admin/job-categories') ? '#dc2626' : '#4b5563' }} />
            {isExpanded && (
              <span className="text-[11px] font-medium" style={{ color: isActive('/admin/job-categories') ? '#dc2626' : '#374151' }}>
                {t.adminJobCategoryManagement}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Expand/Collapse Button */}
      <div className={`${isExpanded ? 'px-3 py-3' : 'px-2 py-2'} border-t`} style={{ borderColor: '#f3f4f6' }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setHoveredExpandButton(true)}
          onMouseLeave={() => setHoveredExpandButton(false)}
          className={`w-full rounded-lg ${isExpanded ? 'px-2.5 py-2 flex items-center gap-1.5' : 'px-2 py-1.5 flex items-center justify-center'} transition-colors`}
          style={{
            backgroundColor: hoveredExpandButton ? '#b91c1c' : '#dc2626',
            color: 'white'
          }}
          title={!isExpanded ? t.adminSidebarExpand : undefined}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">{t.adminSidebarCollapse}</span>
            </>
          ) : (
            <Menu className="w-5 h-5 flex-shrink-0" />
          )}
        </button>
      </div>
    </div>
    
    {/* Dropdown Portal - Render outside sidebar to avoid overflow issues */}
    {!isExpanded && showDropdown && dropdownItem?.submenu && (
      <div 
        data-dropdown="admin-sidebar"
        className="fixed rounded-lg shadow-xl border py-1 min-w-[200px] z-[9999]"
        style={{
          backgroundColor: 'white',
          borderColor: '#e5e7eb',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`
        }}
      >
        {dropdownItem.submenu.map((subItem) => {
          const SubIcon = subItem.icon;
          const subActive = location.pathname === subItem.path || 
            (subItem.path === '/admin/collaborators' && location.pathname === '/admin/collaborators');
          
          return (
            <Link
              key={subItem.id}
              to={subItem.path}
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(false);
              }}
              onMouseEnter={() => setHoveredDropdownItemIndex(subItem.id)}
              onMouseLeave={() => setHoveredDropdownItemIndex(null)}
              className="w-full flex items-center gap-2 px-3 py-2 transition-colors"
              style={{
                backgroundColor: subActive 
                  ? '#fef2f2' 
                  : (hoveredDropdownItemIndex === subItem.id ? '#f9fafb' : 'transparent'),
                color: subActive ? '#dc2626' : '#374151'
              }}
            >
              <SubIcon className="w-4 h-4" style={{ color: subActive ? '#dc2626' : '#6b7280' }} />
              <span className={`text-sm flex-1 text-left ${subActive ? 'font-medium' : ''}`} style={{ color: subActive ? '#dc2626' : '#374151' }}>
                {subItem.label}
              </span>
            </Link>
          );
        })}
      </div>
    )}
    </>
  );
};

export default AdminSidebar;

