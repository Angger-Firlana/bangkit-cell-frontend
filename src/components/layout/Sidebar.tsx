import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Smartphone, 
  ShoppingCart, 
  Repeat, 
  Package, 
  History,
  FileText, 
  Database,
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../stores/useAuthStore';
import LogoMark from '../brand/LogoMark';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleSignOut = () => {
    logout();
    onClose?.();
    navigate('/login', { replace: true });
  };
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Service HP', href: '/service', icon: Smartphone },
    { name: 'Penjualan', href: '/pos', icon: ShoppingCart },
    { name: 'HP Second', href: '/phones', icon: Repeat },
    { name: 'Stok Sparepart', href: '/inventory', icon: Package },
    { name: 'Riwayat', href: '/history', icon: History },
    { name: 'Laporan', href: '/reports', icon: FileText },
    { name: 'Master Data', href: '/master-data', icon: Database },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <div className={clsx(
      "flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto z-50 border-r border-slate-800 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <LogoMark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">BANGKIT<span className="text-primary">CELL</span></h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest -mt-0.5">Management v1.0</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 lg:hidden text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-4 mb-2 mt-4">Main Menu</p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              )
            }
          >
            <item.icon className={clsx(
              "mr-3 h-5 w-5 transition-colors",
              "group-[.active]:text-primary"
            )} />
            {item.name}
            {/* Active Indicator bar */}
            <span className="absolute left-0 w-1 h-6 rounded-r-full bg-primary opacity-0 group-[.active]:opacity-100 transition-opacity"></span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
