import { ClipboardList, User } from 'lucide-react';
import Modal from '../ui/Modal';
import { Input } from '../ui/Input';
import type { Device } from '../../types/serviceJob';
import type { DeviceBrand, DeviceModel } from '../../types/deviceCatalog';
import type { ServiceJobFormState } from '../../types/serviceUI';

interface ServiceAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitError: string;
  form: ServiceJobFormState;
  setForm: React.Dispatch<React.SetStateAction<ServiceJobFormState>>;
  devices: Device[];
  brands: DeviceBrand[];
  models: DeviceModel[];
}

const ServiceAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
  form,
  setForm,
  devices,
  brands,
  models,
}: ServiceAddModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Service Baru"
      size="lg"
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        {submitError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
            {submitError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center text-sm uppercase tracking-wider text-primary">
              <User className="h-4 w-4 mr-2" /> Data Pelanggan
            </h4>
            <Input
              label="Nama Pelanggan"
              placeholder="Nama lengkap"
              value={form.customer_name}
              onChange={(e) => setForm((prev) => ({ ...prev, customer_name: e.target.value }))}
              required
            />
            <Input
              label="Nomor HP"
              placeholder="08xxxxxxxxxx"
              value={form.customer_phone}
              onChange={(e) => setForm((prev) => ({ ...prev, customer_phone: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@contoh.com"
              value={form.customer_email}
              onChange={(e) => setForm((prev) => ({ ...prev, customer_email: e.target.value }))}
            />
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center text-sm uppercase tracking-wider text-primary">
              <ClipboardList className="h-4 w-4 mr-2" /> Data Perangkat
            </h4>
            <div className="space-y-2">
              <Input
                label="Perangkat"
                placeholder="Contoh: iPhone 11"
                value={form.device_query}
                onChange={(e) => setForm((prev) => ({ ...prev, device_query: e.target.value }))}
                list="device-options"
                required
              />
              <datalist id="device-options">
                {devices.map((device) => (
                  <option key={device.id} value={device.name} />
                ))}
              </datalist>
              <p className="text-xs text-slate-500 font-semibold">
                Ketik nama perangkat. Jika belum ada, sistem akan membuat perangkat baru.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Brand (Wajib jika device baru)"
                placeholder="Contoh: Samsung"
                value={form.device_brand_query}
                onChange={(e) => setForm((prev) => ({ ...prev, device_brand_query: e.target.value }))}
                list="brand-options"
              />
              <Input
                label="Model (Wajib jika device baru)"
                placeholder="Contoh: Galaxy A15"
                value={form.device_model_query}
                onChange={(e) => setForm((prev) => ({ ...prev, device_model_query: e.target.value }))}
                list="model-options"
              />
            </div>
            <datalist id="brand-options">
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name} />
              ))}
            </datalist>
            <datalist id="model-options">
              {models.map((model) => (
                <option key={model.id} value={model.name} />
              ))}
            </datalist>
            <Input
              label="Keluhan / Masalah"
              placeholder="Contoh: LCD pecah, baterai drop, mati total"
              value={form.problem_description}
              onChange={(e) => setForm((prev) => ({ ...prev, problem_description: e.target.value }))}
              required
            />
            <Input
              label="Estimasi Biaya (Rp)"
              type="number"
              placeholder="0"
              value={form.estimated_fee}
              onChange={(e) => setForm((prev) => ({ ...prev, estimated_fee: e.target.value }))}
              helperText="Estimasi akan disimpan sebagai catatan biaya awal."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ServiceAddModal;
