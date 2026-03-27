import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFAFA' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto pt-0 px-6 pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

