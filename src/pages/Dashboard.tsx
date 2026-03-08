import { Briefcase, CheckCircle, AlertTriangle, TrendingUp, Plus, ArrowRight, User, Clock, Smartphone } from 'lucide-react';
import { Card, CardStats } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Dashboard = () => {
  const recentActivities = [
    { id: 1, type: 'service', title: 'iPhone 11 - Ganti LCD', customer: 'Budi Santoso', status: 'In Progress', time: '2 jam yang lalu', amount: 'Rp 850.000' },
    { id: 2, type: 'sale', title: 'Samsung A54 Second', customer: 'Siti Aminah', status: 'Completed', time: '4 jam yang lalu', amount: 'Rp 3.200.000' },
    { id: 3, type: 'inventory', title: 'Baterai iPhone X (5 Pcs)', customer: 'Restock', status: 'Added', time: '5 jam yang lalu', amount: 'N/A' },
    { id: 4, type: 'service', title: 'Oppo Reno 8 - Matot', customer: 'Iwan Fals', status: 'Pending', time: '1 hari yang lalu', amount: 'Rp 1.200.000' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Selamat Datang, Admin</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Berikut adalah ringkasan bisnis Anda hari ini.</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" leftIcon={<Plus className="h-4 w-4" />}>
            Laporan
          </Button>
          <Button size="sm" className="w-full sm:w-auto" leftIcon={<Plus className="h-4 w-4" />}>
            Transaksi Baru
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <CardStats 
          title="Service Masuk" 
          value="12" 
          icon={<Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: "12% dari kemarin", positive: true }}
        />
        <CardStats 
          title="Service Selesai" 
          value="8" 
          icon={<CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
          className="bg-emerald-50/20 border-emerald-100"
        />
        <CardStats 
          title="Stok Menipis" 
          value="3" 
          icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: "Perlu restock", positive: false }}
          className="bg-rose-50/20 border-rose-100"
        />
        <CardStats 
          title="Omzet Hari Ini" 
          value="Rp 2.5jt" 
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: "8% dari kemarin", positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column - Activities & Actions */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          <Card 
            title="Aktivitas Terbaru" 
            subtitle="Transaksi dan pengerjaan terakhir"
            headerAction={<Button variant="ghost" size="sm">Lihat Semua</Button>}
          >
            <div className="divide-y divide-slate-50">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 sm:p-3 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {activity.type === 'service' ? <Smartphone className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[10px] sm:text-xs font-medium text-slate-400 flex items-center">
                          <User className="h-3 w-3 mr-1" /> {activity.customer}
                        </span>
                        <span className="text-slate-200 text-[10px]">•</span>
                        <span className="text-[10px] sm:text-xs font-medium text-slate-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden xs:block">
                    <p className="text-sm font-bold text-slate-800">{activity.amount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      activity.status === 'Completed' || activity.status === 'Added' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-amber-100 text-amber-600'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Aksi Cepat" subtitle="Akses fitur utama dalam satu klik">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-primary hover:border-primary transition-all duration-300 text-left">
                <div className="p-3 bg-white shadow-sm rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-white">Input Service</p>
                  <p className="text-xs font-medium text-slate-400 group-hover:text-white/70">Terima unit baru</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-slate-300 group-hover:text-white" />
              </button>
              <button className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-primary hover:border-primary transition-all duration-300 text-left">
                <div className="p-3 bg-white shadow-sm rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-white">Tambah Stok</p>
                  <p className="text-xs font-medium text-slate-400 group-hover:text-white/70">Sparepart & Unit</p>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-slate-300 group-hover:text-white" />
              </button>
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
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kapasitas Service</p>
                    <p className="text-sm font-bold text-slate-800">16/20 Unit</p>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[80%] rounded-full shadow-sm"></div>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 mt-2">80% dari beban kerja maksimal</p>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Bulanan</p>
                    <p className="text-sm font-bold text-slate-800">Rp 45jt / 60jt</p>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[75%] rounded-full shadow-sm"></div>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 mt-2">75% tercapai bulan ini</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Pengingat" subtitle="Perlu perhatian segera">
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-800">LCD iPhone 11 Habis</p>
                  <p className="text-[10px] font-medium text-rose-600 mt-0.5">Segera pesan ke supplier</p>
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">3 Service Terlambat</p>
                  <p className="text-[10px] font-medium text-amber-600 mt-0.5">Melebihi estimasi 2 hari</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
