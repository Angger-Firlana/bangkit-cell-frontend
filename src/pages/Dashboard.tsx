import { Briefcase, CheckCircle, AlertTriangle, TrendingUp, Plus, ArrowRight, User, Clock, Smartphone } from 'lucide-react';
import { Card, CardStats } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useReports } from '../hooks/useReports';
import { useServiceJobs } from '../hooks/useServiceJobs';
import { useInventory } from '../hooks/useInventory';
import { formatCurrency, formatDateTime } from '../utils/format';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { dashboardStats, isLoading: isReportsLoading } = useReports();
  const { serviceJobs, isLoading: isJobsLoading } = useServiceJobs();
  const { inventory, isLoading: isInventoryLoading } = useInventory();

  const isLoading = isReportsLoading || isJobsLoading || isInventoryLoading;

  // Filter low stock items (current_stock <= 3)
  const lowStockItems = inventory.filter(item => (item.current_stock ?? 0) <= 3).slice(0, 3);
  
  // Recent service activities
  const recentServiceJobs = serviceJobs.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-2xl w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-slate-100 rounded-[2.5rem]"></div>
          <div className="lg:col-span-4 h-96 bg-slate-100 rounded-[2.5rem]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Selamat Datang, Admin</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Berikut adalah ringkasan bisnis Anda hari ini.</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link to="/reports">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" leftIcon={<TrendingUp className="h-4 w-4" />}>
              Laporan
            </Button>
          </Link>
          <Link to="/pos">
            <Button size="sm" className="w-full sm:w-auto" leftIcon={<Plus className="h-4 w-4" />}>
              Transaksi Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <CardStats 
          title="Service Masuk" 
          value={String(dashboardStats?.service_in_count ?? 0)} 
          icon={<Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: "Status: Baru", positive: true }}
        />
        <CardStats 
          title="Service Selesai" 
          value={String(dashboardStats?.service_completed_count ?? 0)} 
          icon={<CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
          className="bg-emerald-50/20 border-emerald-100"
        />
        <CardStats 
          title="Stok Menipis" 
          value={String(dashboardStats?.low_stock_count ?? 0)} 
          icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: "Perlu restock", positive: false }}
          className="bg-rose-50/20 border-rose-100"
        />
        <CardStats 
          title="Omzet Hari Ini" 
          value={formatCurrency(dashboardStats?.today_revenue ?? 0)} 
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: "Total Penjualan", positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column - Activities & Actions */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          <Card 
            title="Aktivitas Service Terbaru" 
            subtitle="Pengerjaan unit terakhir"
            headerAction={<Link to="/service"><Button variant="ghost" size="sm">Lihat Semua</Button></Link>}
          >
            <div className="divide-y divide-slate-50">
              {recentServiceJobs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada aktivitas service</div>
              ) : (
                recentServiceJobs.map((job) => (
                  <div key={job.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 sm:p-3 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{job.device_name}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 flex items-center">
                            <User className="h-3 w-3 mr-1" /> {job.customer_name}
                          </span>
                          <span className="text-slate-200 text-[10px]">•</span>
                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {formatDateTime(job.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right hidden xs:block">
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(Number(job.estimated_fee || 0))}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter bg-slate-100 text-slate-600">
                        {job.status?.name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="Aksi Cepat" subtitle="Akses fitur utama dalam satu klik">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/service" className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-primary hover:border-primary transition-all duration-300 text-left">
                <div className="p-3 bg-white shadow-sm rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-white">Input Service</p>
                  <p className="text-xs font-medium text-slate-400 group-hover:text-white/70">Terima unit baru</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-slate-300 group-hover:text-white" />
              </Link>
              <Link to="/inventory" className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-primary hover:border-primary transition-all duration-300 text-left">
                <div className="p-3 bg-white shadow-sm rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-white">Tambah Stok</p>
                  <p className="text-xs font-medium text-slate-400 group-hover:text-white/70">Sparepart & Unit</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-slate-300 group-hover:text-white" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column - Status & Analysis */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <Card title="Status Toko" subtitle="Monitoring sistem">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">Sistem Online</p>
                    <p className="text-[10px] font-medium text-slate-400">Database tersinkronisasi</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Service (Hari Ini)</p>
                    <p className="text-sm font-bold text-slate-800">{dashboardStats?.service_completed_count ?? 0}/10</p>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full shadow-sm transition-all duration-1000" 
                      style={{ width: `${Math.min(((dashboardStats?.service_completed_count ?? 0) / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 mt-2">Unit yang telah diselesaikan hari ini</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Pengingat Stok" subtitle="Perlu perhatian segera">
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Stok Aman</p>
                    <p className="text-[10px] font-medium text-emerald-600 mt-0.5">Semua sparepart tersedia cukup.</p>
                  </div>
                </div>
              ) : (
                lowStockItems.map(item => (
                  <div key={item.id} className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-800">{item.product?.name}</p>
                      <p className="text-[10px] font-medium text-rose-600 mt-0.5">Sisa stok: {item.current_stock} unit</p>
                    </div>
                  </div>
                ))
              )}
              {inventory.filter(item => (item.current_stock ?? 0) <= 3).length > 3 && (
                <Link to="/inventory" className="block text-center text-[10px] font-bold text-primary uppercase tracking-widest hover:underline pt-2">
                  Lihat Semua Stok Menipis
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
