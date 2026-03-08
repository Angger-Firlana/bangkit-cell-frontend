import React, { useState } from 'react';
import { Search, Filter, Plus, AlertTriangle, Package, DollarSign, Barcode, Tag } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';

const InventoryPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const inventory = [
    { id: 'PRD-001', name: 'LCD iPhone 11 (Original)', category: 'Sparepart', stock: 5, minStock: 5, costPrice: 350000, sellPrice: 450000, sku: 'LCD-IP11-ORI' },
    { id: 'PRD-002', name: 'Tempered Glass Universal', category: 'Aksesoris', stock: 50, minStock: 20, costPrice: 5000, sellPrice: 25000, sku: 'TG-UNIV' },
    { id: 'PRD-003', name: 'Baterai Xiaomi BN45', category: 'Sparepart', stock: 4, minStock: 5, costPrice: 65000, sellPrice: 85000, sku: 'BAT-BN45' },
    { id: 'PRD-004', name: 'Kabel Data Type-C Baseus', category: 'Aksesoris', stock: 12, minStock: 10, costPrice: 15000, sellPrice: 35000, sku: 'KAB-TC-BAS' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stok Sparepart</h1>
          <p className="text-gray-500 text-sm">Kelola inventaris barang dan aksesoris</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 font-bold"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Produk
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Cari nama produk, kategori, atau SKU..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button className="px-4 py-2.5 border border-gray-200 rounded-xl flex items-center text-gray-600 hover:bg-gray-50 font-medium transition-colors">
          <Filter className="h-5 w-5 mr-2" />
          Filter
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">SKU / Kode</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Nama Produk</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono font-bold text-gray-500 uppercase tracking-tighter">{item.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-bold">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={clsx('text-lg font-black', item.stock <= item.minStock ? 'text-red-600' : 'text-gray-900')}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">Rp {item.sellPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {item.stock <= item.minStock ? (
                      <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-100 px-2.5 py-1 rounded-full w-fit border border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Restock
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                        Tersedia
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:text-blue-800 text-sm font-black uppercase tracking-tighter">Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Produk */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Tambah Produk Baru"
        size="lg"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-bold text-gray-900 flex items-center text-sm uppercase tracking-wider text-primary">
                <Package className="h-4 w-4 mr-2" /> Detail Barang
              </h4>
              <Input label="Nama Produk" placeholder="Contoh: LCD iPhone 12 Original" />
            </div>
            <div className="space-y-4">
              <Input label="SKU / Barcode" placeholder="LCD-IP12-ORI" />
              <Select 
                label="Kategori" 
                options={[
                  { label: 'Pilih Kategori', value: '' },
                  { label: 'Sparepart', value: 'sparepart' },
                  { label: 'Aksesoris', value: 'aksesoris' },
                  { label: 'Tools', value: 'tools' },
                ]} 
              />
            </div>
            <div className="space-y-4">
              <Input label="Stok Awal" type="number" placeholder="0" />
              <Input label="Minimal Stok" type="number" placeholder="5" helperText="Peringatan saat stok di bawah angka ini" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center text-sm uppercase tracking-wider text-primary">
              <DollarSign className="h-4 w-4 mr-2" /> Harga & Keuntungan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Harga Modal (Rp)" type="number" placeholder="0" />
              <Input label="Harga Jual (Rp)" type="number" placeholder="0" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button 
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
