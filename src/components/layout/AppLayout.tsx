import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => {
  const location = useLocation();
  
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
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64 transition-all duration-300">
        <Topbar title={getPageTitle(location.pathname)} />
        <main className="flex-1 pt-28 pb-12 px-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
