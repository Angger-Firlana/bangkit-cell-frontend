import React from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';

interface TopbarProps {
  title: string;
}

const Topbar: React.FC<TopbarProps> = ({ title }) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-30 transition-all duration-300">
      <div className="flex flex-col">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] -mt-0.5">
          Bangkit Cell Management
        </p>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Cari transaksi atau pelanggan..." 
            className="bg-transparent border-none outline-none text-sm text-slate-600 w-64"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl relative transition-all group">
            <Bell className="h-5 w-5 group-hover:text-primary transition-colors" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-10 w-px bg-slate-200 mx-2"></div>
          
          <button className="flex items-center space-x-3 p-1.5 hover:bg-slate-100 rounded-2xl transition-all group">
            <div className="h-10 w-10 bg-primary shadow-lg shadow-blue-900/20 rounded-xl flex items-center justify-center text-white font-black text-sm">
              AD
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-sm font-black text-slate-900 leading-none">Admin Bangkit</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Super Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
