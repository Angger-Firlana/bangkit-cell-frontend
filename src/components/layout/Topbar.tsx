import React from 'react';
import { Bell, Search, ChevronDown, Menu } from 'lucide-react';

interface TopbarProps {
  title: string;
  onMenuClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ title, onMenuClick }) => {
  return (
    <header className="h-16 bg-white/70 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 fixed top-0 right-0 left-0 lg:left-64 z-30 transition-all duration-300">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="p-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight line-clamp-1">
            {title}
          </h2>
          <p className="hidden sm:block text-[10px] font-medium text-slate-400 uppercase tracking-widest -mt-0.5">
            Bangkit Cell Management
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="hidden md:flex items-center bg-slate-50 rounded-lg px-4 py-2 border border-slate-200 focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/50 transition-all">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            className="bg-transparent border-none outline-none text-sm text-slate-600 w-32 xl:w-64 focus:w-48 xl:focus:w-80 transition-all duration-300"
          />
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative transition-all group">
            <Bell className="h-5 w-5 group-hover:text-primary transition-colors" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1 sm:mx-2"></div>
          
          <button className="flex items-center space-x-2 sm:space-x-3 p-1 hover:bg-slate-50 rounded-lg transition-all group">
            <div className="h-8 w-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
              AD
            </div>
            <div className="text-left hidden xs:block">
              <p className="text-sm font-semibold text-slate-700 leading-none">Admin</p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">Super Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
