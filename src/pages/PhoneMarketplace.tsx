import { useMemo, useState } from 'react';
import { Plus, Tag, Smartphone, DollarSign, Camera, Search } from 'lucide-react';
import clsx from 'clsx';
import Modal from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { usePhones } from '../hooks/usePhones';
import { formatCurrency } from '../utils/format';

interface PhoneListingFormState {
  device_id: string;
  device_query: string;
  condition: string;
  serial_number: string;
  purchased_price: string;
  price: string;
  image: File | null;
}

const PhoneMarketplace = () => {
  const { listings, devices, statuses, pagination, isLoading, error, createListing, updateFilters, filters, setPage } = usePhones();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState<PhoneListingFormState>({
    device_id: '',
    device_query: '',
    condition: '',
    serial_number: '',
    purchased_price: '',
    price: '',
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const deviceOptions = useMemo(() => {
    return [
      { label: 'Pilih perangkat', value: '' },
      ...devices.map((device) => ({ label: device.name, value: device.id })),
    ];
  }, [devices]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await createListing({
        device_id: form.device_id ? Number(form.device_id) : null,
        device_query: form.device_query,
        condition: form.condition,
        serial_number: form.serial_number,
        purchased_price: Number(form.purchased_price),
        price: Number(form.price),
        image: form.image,
      });
      setIsAddModalOpen(false);
      setForm({
        device_id: '',
        device_query: '',
        condition: '',
        serial_number: '',
        purchased_price: '',
        price: '',
        image: null,
      });
      setPreviewUrl(null);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Gagal menyimpan listing HP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = useMemo(() => {
    return [
      { label: 'Semua Status', value: '' },
      ...statuses.map((status) => ({ label: status.name, value: status.code })),
    ];
  }, [statuses]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pasar HP Second"
        subtitle="Kelola stok unit handphone bekas"
        actions={(
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 font-bold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah Unit
          </button>
        )}
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Cari serial number atau device..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            label="Status"
            options={statusOptions}
            value={filters.status_code}
            onChange={(e) => updateFilters({ status_code: e.target.value })}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-72 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState title="Belum Ada Listing" message="Tambahkan unit HP second agar tampil di daftar." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((phone) => {
            const isSold = phone.status?.code === 'listing_phone_sold' || Boolean(phone.sold_at);
            return (
              <div key={phone.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 relative overflow-hidden">
                  {phone.image_url ? (
                    <img
                      src={phone.image_url}
                      alt={phone.device?.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black uppercase text-gray-600 border border-gray-200">
                      {phone.device?.name ?? 'Device'}
                    </span>
                  </div>
                  {isSold && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] z-10">
                      <span className="bg-white text-gray-900 px-4 py-1 rounded-full font-black uppercase tracking-widest text-sm transform -rotate-12 shadow-2xl">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                      {phone.device?.name ?? 'Unknown Device'}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 mt-2 font-bold uppercase tracking-tighter">
                      <Tag className="h-3 w-3 mr-1 text-primary" />
                      {phone.condition}
                    </div>
                    <div className="text-[11px] text-slate-400 font-bold mt-2">
                      SN: {phone.serial_number}
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                    <p className="text-lg font-black text-primary">{formatCurrency(phone.price)}</p>
                    <button className="text-xs font-black text-gray-400 hover:text-primary uppercase tracking-widest">Detail</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          onPageChange={setPage}
        />
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Unit HP Second"
        size="lg"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {submitError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 flex items-center text-sm uppercase tracking-wider text-primary">
                <Smartphone className="h-4 w-4 mr-2" /> Spesifikasi Unit
              </h4>
              <Select
                label="Perangkat (Daftar)"
                options={deviceOptions}
                value={form.device_id}
                onChange={(e) => {
                  const selected = devices.find((device) => String(device.id) === e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    device_id: e.target.value,
                    device_query: selected?.name ?? prev.device_query,
                  }));
                }}
              />
              <div className="space-y-2">
                <Input
                  label="Perangkat (Ketik Nama)"
                  placeholder="Contoh: iPhone 11"
                  value={form.device_query}
                  onChange={(e) => setForm((prev) => ({ ...prev, device_query: e.target.value }))}
                  list="phone-device-options"
                  required
                />
                <datalist id="phone-device-options">
                  {devices.map((device) => (
                    <option key={device.id} value={device.name} />
                  ))}
                </datalist>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Sistem akan mencocokkan nama dengan katalog.
                </p>
              </div>
              <Input
                label="Kondisi"
                placeholder="Contoh: Mulus 98%, Fullset"
                value={form.condition}
                onChange={(e) => setForm((prev) => ({ ...prev, condition: e.target.value }))}
                required
              />
              <Input
                label="Serial Number"
                placeholder="IMEI / SN"
                value={form.serial_number}
                onChange={(e) => setForm((prev) => ({ ...prev, serial_number: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 flex items-center text-sm uppercase tracking-wider text-primary">
                <Camera className="h-4 w-4 mr-2" /> Foto Unit
              </h4>
              <label className="block">
                <div className={clsx(
                  "border-2 border-dashed rounded-2xl h-[240px] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden relative group",
                  previewUrl ? "border-primary bg-white" : "border-gray-200 bg-gray-50 hover:border-primary hover:text-primary"
                )}>
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                        <span className="ml-2 text-white font-bold text-xs uppercase tracking-widest">Ganti Foto</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Plus className="h-8 w-8 mb-2 text-gray-400 group-hover:text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-primary">Upload Foto</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-gray-900 flex items-center text-sm uppercase tracking-wider text-primary">
              <DollarSign className="h-4 w-4 mr-2" /> Informasi Harga
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Harga Beli (Rp)"
                type="number"
                placeholder="0"
                value={form.purchased_price}
                onChange={(e) => setForm((prev) => ({ ...prev, purchased_price: e.target.value }))}
                required
              />
              <Input
                label="Harga Jual (Rp)"
                type="number"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
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
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70"
            >
              {isSubmitting ? 'Menyimpan...' : 'Listing Unit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PhoneMarketplace;
