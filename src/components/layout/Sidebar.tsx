import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Smartphone, 
  ShoppingCart, 
  Repeat, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Service HP', href: '/service', icon: Smartphone },
    { name: 'Penjualan', href: '/pos', icon: ShoppingCart },
    { name: 'HP Second', href: '/phones', icon: Repeat },
    { name: 'Stok Sparepart', href: '/inventory', icon: Package },
    { name: 'Laporan', href: '/reports', icon: FileText },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 bg-[#0F172A] text-white h-screen fixed left-0 top-0 overflow-y-auto z-40 border-r border-white/5 shadow-2xl">
      <div className="p-8 mb-4">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
            <Zap className="h-6 w-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">BANGKIT<span className="text-primary font-black">CELL</span></h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] -mt-1">System v1.0</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-4 mb-4">Main Navigation</p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary text-white shadow-xl shadow-blue-900/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <item.icon className={clsx(
              "mr-3 h-5 w-5 transition-colors",
              "group-hover:text-white"
            )} />
            {item.name}
            {/* Active Indicator dot */}
            <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white opacity-0 group-[.active]:opacity-100 transition-opacity"></span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-white/5 rounded-3xl p-4 border border-white/5 mb-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Cloud Sync</p>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4 rounded-full"></div>
          </div>
        </div>
        <button className="flex items-center justify-center w-full px-4 py-4 text-sm font-black text-red-400 hover:text-white hover:bg-red-500 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-red-500/20">
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
