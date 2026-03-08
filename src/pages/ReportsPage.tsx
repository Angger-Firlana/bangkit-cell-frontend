import { Calendar, Download } from 'lucide-react';
import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { formatCurrency } from '../utils/format';
import EmptyState from '../components/common/EmptyState';

const ReportsPage = () => {
  const { sales, service, inventory, isLoading, error, refresh } = useReports();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleApply = () => {
    refresh({
      from: from || undefined,
      to: to || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Bisnis</h1>
        <button className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors">
          <Download className="h-5 w-5 mr-2" />
          Export Excel
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="font-medium">Periode:</span>
        </div>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleApply}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          Terapkan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="bg-slate-100 h-52 rounded-xl"></div>
          <div className="bg-slate-100 h-52 rounded-xl"></div>
        </div>
      ) : !sales || !service ? (
        <EmptyState title="Laporan Belum Tersedia" message="Pastikan ada transaksi dan service untuk menampilkan laporan." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Penjualan</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Total Transaksi</span>
                <span className="font-bold text-gray-900">{sales.transactions.count}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Pendapatan Kotor</span>
                <span className="font-bold text-green-600">{formatCurrency(sales.transactions.revenue)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Estimasi Profit</span>
                <span className="font-bold text-blue-600">{formatCurrency(sales.products.estimated_profit)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Performa Service</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Service Masuk</span>
                <span className="font-bold text-gray-900">{service.total_jobs}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Service Selesai</span>
                <span className="font-bold text-green-600">{service.by_status?.service_job_done ?? 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Pending</span>
                <span className="font-bold text-orange-600">{service.by_status?.service_job_new ?? 0}</span>
              </div>
            </div>
          </div>

          {inventory && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Stok</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Low Stock</p>
                  <p className="text-xl font-black text-slate-900 mt-2">{inventory.low_stock_items?.length ?? 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Stock In</p>
                  <p className="text-xl font-black text-slate-900 mt-2">{inventory.movements?.IN?.qty ?? 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Stock Out</p>
                  <p className="text-xl font-black text-slate-900 mt-2">{inventory.movements?.OUT?.qty ?? 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
