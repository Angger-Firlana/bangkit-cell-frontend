import React, { useMemo, useState } from 'react';
import { Search, Filter, Plus, Package } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { clsx } from 'clsx';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { useInventory } from '../hooks/useInventory';
import { formatCurrency } from '../utils/format';
import type { InventoryItem } from '../types/inventory';

const InventoryPage = () => {
  const { inventory, pagination, isLoading, error, adjustStock, setPage } = useInventory();
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    product_id: '',
    type: 'IN',
    qty: '',
    notes: '',
  });

  const filteredInventory = useMemo(() => {
    if (!search.trim()) return inventory;
    const query = search.toLowerCase();
    return inventory.filter((item) => {
      const name = item.product?.name?.toLowerCase() ?? '';
      const type = item.product?.type?.toLowerCase() ?? '';
      const id = String(item.product_id ?? item.id).toLowerCase();
      return name.includes(query) || type.includes(query) || id.includes(query);
    });
  }, [inventory, search]);

  const productOptions = useMemo(
    () => [
      { label: 'Pilih Produk', value: '' },
      ...inventory.map((item) => ({
        label: `${item.product?.name ?? 'Produk'} (ID ${item.product_id ?? item.id})`,
        value: item.product_id ?? item.id,
      })),
    ],
    [inventory]
  );

  const openAdjustModal = (item?: InventoryItem) => {
    setSubmitError('');
    if (item) {
      setSelectedItem(item);
      setForm((prev) => ({
        ...prev,
        product_id: String(item.product_id ?? item.id),
      }));
    } else {
      setSelectedItem(null);
      setForm({ product_id: '', type: 'IN', qty: '', notes: '' });
    }
    setIsAdjustModalOpen(true);
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await adjustStock({
        product_id: Number(form.product_id),
        type: form.type as 'IN' | 'OUT',
        qty: Number(form.qty),
        notes: form.notes || undefined,
      });
      setIsAdjustModalOpen(false);
      setForm({ product_id: '', type: 'IN', qty: '', notes: '' });
      setSelectedItem(null);
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setSubmitError((errorList?.[0] as string) || payload?.message || 'Gagal memperbarui stok.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stok Sparepart"
        subtitle="Kelola inventaris barang dan aksesoris"
        actions={(
          <button
            onClick={() => openAdjustModal()}
            className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 font-bold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Penyesuaian Stok
          </button>
        )}
      />

      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Cari sparepart..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm transition-all"
          />
        </div>
        <button className="px-4 py-2.5 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-24 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredInventory.length === 0 ? (
        <EmptyState title="Belum Ada Inventaris" message="Data inventaris akan muncul setelah stok masuk." />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">ID</th>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Produk</th>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Kategori</th>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Stok</th>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Harga</th>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInventory.map((item) => {
                    const stock = item.current_stock ?? 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 font-mono tracking-tighter">
                          {item.product_id ?? item.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.product?.name ?? '-'}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{item.product?.type ?? '-'}</td>
                        <td className="px-6 py-4">
                          <span className={clsx('text-base font-bold', stock <= 3 ? 'text-rose-500' : 'text-slate-800')}>
                            {stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">
                          {item.product?.sell_price !== undefined
                            ? formatCurrency(Number(item.product.sell_price))
                            : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {stock <= 0 ? (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                              Habis
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                              Tersedia
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openAdjustModal(item)}
                            className="text-[10px] font-bold text-primary hover:text-primary-dark uppercase tracking-widest px-3 py-1.5 hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredInventory.map((item) => {
              const stock = item.current_stock ?? 0;
              return (
                <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{item.product?.name ?? '-'}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {item.product_id ?? item.id}</p>
                    </div>
                    {stock <= 0 ? (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">Habis</span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">Tersedia</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 my-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stok</p>
                      <p className={clsx('text-lg font-bold', stock <= 3 ? 'text-rose-500' : 'text-slate-800')}>{stock}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Harga</p>
                      <p className="text-sm font-bold text-primary">{formatCurrency(Number(item.product?.sell_price ?? 0))}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{item.product?.type ?? '-'}</span>
                    <Button variant="ghost" size="sm" onClick={() => openAdjustModal(item)} className="text-[10px] uppercase tracking-widest">
                      Update Stok
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pagination && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          onPageChange={setPage}
        />
      )}

      {/* Modal Tambah Produk */}
      <Modal 
        isOpen={isAdjustModalOpen} 
        onClose={() => setIsAdjustModalOpen(false)} 
        title={selectedItem ? `Penyesuaian Stok - ${selectedItem.product?.name ?? 'Produk'}` : 'Penyesuaian Stok'}
        size="lg"
      >
        <form className="space-y-6" onSubmit={handleAdjust}>
          {submitError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
              {submitError}
            </div>
          )}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center text-sm uppercase tracking-wider text-primary">
              <Package className="h-4 w-4 mr-2" /> Detail Penyesuaian
            </h4>
            <Select
              label="Produk"
              options={productOptions}
              value={form.product_id}
              onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value }))}
              required
              disabled={Boolean(selectedItem)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Tipe"
                options={[
                  { label: 'Stok Masuk', value: 'IN' },
                  { label: 'Stok Keluar', value: 'OUT' },
                ]}
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                required
              />
              <Input
                label="Jumlah"
                type="number"
                placeholder="0"
                value={form.qty}
                onChange={(e) => setForm((prev) => ({ ...prev, qty: e.target.value }))}
                required
              />
            </div>
            <Input
              label="Catatan"
              placeholder="Contoh: Restock supplier, koreksi stok, dll"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button 
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
