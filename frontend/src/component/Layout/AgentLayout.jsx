import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNavbar from './BottomNavbar';

const AgentLayout = () => {
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default AgentLayout;

