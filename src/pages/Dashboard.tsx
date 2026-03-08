import { Briefcase, CheckCircle, AlertTriangle, TrendingUp, Plus, ArrowRight, User, Clock, Smartphone } from 'lucide-react';
import { Card, CardStats } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StatusPill from '../components/common/StatusPill';
import { useReports } from '../hooks/useReports';
import { useServiceJobs } from '../hooks/useServiceJobs';
import { useInventory } from '../hooks/useInventory';
import { formatCurrency, formatDateTime } from '../utils/format';
import { Link } from 'react-router-dom';
import serviceJobService from '../services/serviceJob.service';
import type { ServiceJob } from '../types/serviceJob';
import { useState } from 'react';

const Dashboard = () => {
  const { dashboardStats, isLoading: isReportsLoading } = useReports();
  const { serviceJobs, isLoading: isJobsLoading } = useServiceJobs();
  const { inventory, isLoading: isInventoryLoading } = useInventory();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailJob, setDetailJob] = useState<ServiceJob | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const isLoading = isReportsLoading || isJobsLoading || isInventoryLoading;

  // Filter low stock items (current_stock <= 3)
  const lowStockItems = inventory.filter(item => (item.current_stock ?? 0) <= 3).slice(0, 3);
  
  // Recent service activities
  const recentServiceJobs = serviceJobs.slice(0, 5);

  const getStatusTone = (statusCode?: string) => {
    switch (statusCode) {
      case 'service_job_new':
        return { label: 'Menunggu', tone: 'warning' as const };
      case 'service_job_progress':
        return { label: 'Dikerjakan', tone: 'info' as const };
      case 'service_job_done':
        return { label: 'Selesai', tone: 'success' as const };
      default:
        return { label: 'Unknown', tone: 'neutral' as const };
    }
  };

  const openDetail = async (jobId: number) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setDetailError('');
    try {
      const response = await serviceJobService.getById(jobId);
      setDetailJob(response.data ?? null);
    } catch (err: any) {
      setDetailJob(null);
      setDetailError(err?.response?.data?.message || 'Gagal memuat detail service.');
    } finally {
      setDetailLoading(false);
    }
  };

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
                recentServiceJobs.map((job) => {
                  const status = getStatusTone(job.status?.code);
                  return (
                    <div
                      key={job.id}
                      onClick={() => openDetail(job.id)}
                      className="py-4 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-xl"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-2 sm:p-3 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {job.device?.name ?? 'Perangkat'} <span className="text-[10px] font-bold text-primary uppercase tracking-wider">JOB-{job.id}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] sm:text-xs font-medium text-slate-400 flex items-center">
                              <User className="h-3 w-3 mr-1" /> {job.customer?.full_name ?? '-'}
                            </span>
                            <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                              {job.customer?.phone_number ?? '-'}
                            </span>
                            <span className="text-[10px] sm:text-xs font-medium text-slate-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> {formatDateTime(job.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[420px]">
                            {job.problem_description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right hidden xs:flex flex-col items-end space-y-2">
                        <p className="text-sm font-bold text-slate-800">
                          Est: {job.estimated_fee ? formatCurrency(Number(job.estimated_fee)) : '-'}
                        </p>
                        <StatusPill label={status.label} tone={status.tone} />
                      </div>
                    </div>
                  );
                })
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

      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Service"
        size="lg"
      >
        {detailLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-slate-100 rounded-lg"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
          </div>
        ) : detailError ? (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
            {detailError}
          </div>
        ) : detailJob ? (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">ID Service</p>
                  <p className="text-lg font-black text-slate-900">JOB-{detailJob.id}</p>
                </div>
                <StatusPill label={getStatusTone(detailJob.status?.code).label} tone={getStatusTone(detailJob.status?.code).tone} />
              </div>
              <div className="text-sm text-slate-500 font-semibold">
                Dibuat: {formatDateTime(detailJob.created_at)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Pelanggan</p>
                <p className="text-base font-black text-slate-900">{detailJob.customer?.full_name ?? '-'}</p>
                <p className="text-sm text-slate-500 font-semibold">{detailJob.customer?.phone_number ?? '-'}</p>
                <p className="text-sm text-slate-500 font-semibold">{detailJob.customer?.email ?? '-'}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Perangkat</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-base font-black text-slate-900">{detailJob.device?.name ?? '-'}</p>
                </div>
                <p className="text-sm text-slate-500 font-semibold mt-2">Keluhan</p>
                <p className="text-sm text-slate-700">{detailJob.problem_description}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Estimasi</p>
              <p className="text-lg font-black text-slate-900">
                {detailJob.estimated_fee ? formatCurrency(Number(detailJob.estimated_fee)) : '-'}
              </p>
            </div>

            <div className="flex justify-end">
              <Link to="/service">
                <Button size="sm">Buka Manajemen Service</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Dashboard;




