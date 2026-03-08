import { useEffect, useMemo, useState } from 'react';
import { Receipt, Smartphone, Package, Wrench } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency, formatDateTime } from '../utils/format';
import posService from '../services/pos.service';
import phoneService from '../services/phone.service';
import serviceJobService from '../services/serviceJob.service';
import type { Transaction } from '../types/pos';
import type { ListingPhone } from '../types/phone';
import type { ServiceJob } from '../types/serviceJob';

type HistoryTab = 'sales' | 'phones' | 'parts' | 'service';

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState<HistoryTab>('sales');
  const [sales, setSales] = useState<Transaction[]>([]);
  const [phones, setPhones] = useState<ListingPhone[]>([]);
  const [services, setServices] = useState<ServiceJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadedTabs, setLoadedTabs] = useState<Record<HistoryTab, boolean>>({
    sales: false,
    phones: false,
    parts: false,
    service: false,
  });

  const fetchSales = async () => {
    const response = await posService.getTransactions({ per_page: 20 });
    setSales(response.data?.data ?? []);
  };

  const fetchPhones = async () => {
    const response = await phoneService.getListings({ per_page: 20, status_code: 'listing_phone_sold' });
    const list = response.data?.data ?? [];
    setPhones(list);
  };

  const fetchServices = async () => {
    const response = await serviceJobService.getAll({ per_page: 20 });
    setServices(response.data?.data ?? []);
  };

  const loadTab = async (tab: HistoryTab) => {
    if (loadedTabs[tab]) return;
    setIsLoading(true);
    setError('');
    try {
      if (tab === 'sales' || tab === 'parts') {
        await fetchSales();
      }
      if (tab === 'phones') {
        await fetchPhones();
      }
      if (tab === 'service') {
        await fetchServices();
      }
      setLoadedTabs((prev) => ({ ...prev, [tab]: true }));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat riwayat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);

  const soldPhones = useMemo(() => {
    return phones.filter((phone) => Boolean(phone.sold_at) || phone.status?.code === 'listing_phone_sold');
  }, [phones]);

  const sparepartHistory = useMemo(() => {
    const rows: {
      id: string;
      name: string;
      qty: number;
      total: number;
      date: string;
      transactionId: number;
    }[] = [];

    sales.forEach((trx) => {
      trx.transaction_details?.forEach((detail) => {
        if (!detail.item || detail.item_type?.toLowerCase().includes('product')) {
          rows.push({
            id: `${trx.id}-${detail.id}`,
            name: detail.item?.name ?? `Produk #${detail.item_id}`,
            qty: detail.qty,
            total: Number(detail.total_price),
            date: trx.transaction_date,
            transactionId: trx.id,
          });
        }
      });
    });

    return rows;
  }, [sales]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Riwayat"
        subtitle="Lihat transaksi, service, HP second, dan sparepart dengan jelas."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'sales' ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'}`}
        >
          <Receipt className="h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-bold text-slate-800">Penjualan</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('phones')}
          className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'phones' ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'}`}
        >
          <Smartphone className="h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-bold text-slate-800">HP Second</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('parts')}
          className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'parts' ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'}`}
        >
          <Package className="h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-bold text-slate-800">Sparepart</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('service')}
          className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'service' ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'}`}
        >
          <Wrench className="h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-bold text-slate-800">Service HP</p>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-slate-100 rounded-2xl"></div>
          <div className="h-20 bg-slate-100 rounded-2xl"></div>
          <div className="h-20 bg-slate-100 rounded-2xl"></div>
        </div>
      ) : activeTab === 'sales' ? (
        <div className="space-y-3">
          {sales.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada data penjualan.</p>
          ) : (
            sales.map((trx) => (
              <div key={trx.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">Transaksi #{trx.id}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(trx.transaction_date)}</p>
                  <p className="text-xs text-slate-500">Pelanggan: {trx.customer?.full_name ?? '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">{formatCurrency(Number(trx.grand_total))}</p>
                  <p className="text-xs text-slate-500">{trx.payment_method?.name ?? '-'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'phones' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {soldPhones.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada HP second terjual.</p>
          ) : (
            soldPhones.map((phone) => (
              <div key={phone.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
                  {phone.image_url ? (
                    <img src={phone.image_url} alt={phone.device?.name ?? 'Unit'} className="h-full w-full object-cover" />
                  ) : (
                    <Smartphone className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{phone.device?.name ?? 'Unit'}</p>
                  <p className="text-xs text-slate-500">SN: {phone.serial_number}</p>
                  <p className="text-xs text-slate-500">Terjual: {phone.sold_at ? formatDateTime(phone.sold_at) : '-'}</p>
                  <p className="text-sm font-black text-primary mt-1">{formatCurrency(Number(phone.price))}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'parts' ? (
        <div className="space-y-3">
          {sparepartHistory.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada history sparepart.</p>
          ) : (
            sparepartHistory.map((row) => (
              <div key={row.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{row.name}</p>
                  <p className="text-xs text-slate-500">Qty: {row.qty} • Transaksi #{row.transactionId}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(row.date)}</p>
                </div>
                <div className="text-right text-sm font-black text-primary">
                  {formatCurrency(Number(row.total))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {services.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada history service.</p>
          ) : (
            services.map((job) => (
              <div key={job.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{job.device?.name ?? 'Perangkat'} • JOB-{job.id}</p>
                  <p className="text-xs text-slate-500">{job.customer?.full_name ?? '-'}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(job.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">
                    Est: {job.estimated_fee ? formatCurrency(Number(job.estimated_fee)) : '-'}
                  </p>
                  <p className="text-xs text-slate-500">{job.status?.name ?? '-'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
