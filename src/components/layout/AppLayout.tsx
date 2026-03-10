import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Map paths to titles
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Dashboard Overview';
      case '/service': return 'Manajemen Service';
      case '/pos': return 'Point of Sale (Kasir)';
      case '/inventory': return 'Inventaris Sparepart';
      case '/phones': return 'Bursa HP Second';
      case '/reports': return 'Laporan & Analitik';
      case '/settings': return 'Pengaturan Sistem';
      default: return 'Bangkit Cell';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-x-hidden">
      {/* Sidebar - Desktop & Mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
        <Topbar 
          title={getPageTitle(location.pathname)} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 pt-[calc(6rem+env(safe-area-inset-top))] pb-12 px-4 sm:px-6 lg:px-8 w-full">
          <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
