import React, { useMemo, useState } from 'react';
import { Search, Filter, Plus, AlertTriangle, Package } from 'lucide-react';
import Modal from '../components/ui/Modal';
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

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Cari nama produk, kategori, atau ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button className="px-4 py-2.5 border border-gray-200 rounded-xl flex items-center text-gray-600 hover:bg-gray-50 font-medium transition-colors">
          <Filter className="h-5 w-5 mr-2" />
          Filter
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-14 bg-gray-50 border-b border-gray-100"></div>
          <div className="h-72 bg-gray-50"></div>
        </div>
      ) : filteredInventory.length === 0 ? (
        <EmptyState title="Belum Ada Inventaris" message="Data inventaris akan muncul setelah stok masuk." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">ID Produk</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Nama Produk</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Stok</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Harga Jual</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInventory.map((item) => {
                  const stock = item.current_stock ?? 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-gray-500 uppercase tracking-tighter">
                        {item.product_id ?? item.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-bold">{item.product?.name ?? '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.product?.type ?? '-'}</td>
                      <td className="px-6 py-4">
                        <span className={clsx('text-lg font-black', stock <= 0 ? 'text-red-600' : 'text-gray-900')}>
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
                          <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-100 px-2.5 py-1 rounded-full w-fit border border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Habis
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                            Tersedia
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => openAdjustModal(item)}
                          className="text-primary hover:text-blue-800 text-sm font-black uppercase tracking-tighter"
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
