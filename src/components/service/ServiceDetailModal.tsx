import Modal from '../ui/Modal';
import StatusPill from '../common/StatusPill';
import { Input, Select } from '../ui/Input';
import { formatCurrency, formatDateTime } from '../../utils/format';
import type { ServiceJob, ServiceJobPart } from '../../types/serviceJob';
import type { PaymentMethod } from '../../types/pos';
import type { PartFormState, CheckoutFormState } from '../../types/serviceUI';

type StatusTone = { label: string; tone: 'warning' | 'info' | 'success' | 'neutral' };

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string;
  service: ServiceJob | null;
  getStatusTone: (statusCode?: string) => StatusTone;
  parts: ServiceJobPart[];
  partsSubtotal: number;
  partsLoading: boolean;
  partsError: string;
  partForm: PartFormState;
  setPartForm: React.Dispatch<React.SetStateAction<PartFormState>>;
  productOptions: { label: string; value: string | number }[];
  inventoryLoading: boolean;
  onProductFocus: () => void;
  isPartSubmitting: boolean;
  partSubmitError: string;
  onAddPart: () => void;
  onRemovePart: (partId: number) => void;
  printerError: string;
  printerStatus: 'idle' | 'connecting' | 'connected' | 'printing';
  onPrint: () => void;
  checkoutError: string;
  checkoutForm: CheckoutFormState;
  setCheckoutForm: React.Dispatch<React.SetStateAction<CheckoutFormState>>;
  paymentMethods: PaymentMethod[];
  isCheckoutSubmitting: boolean;
  onCheckout: () => void;
  computedGrandTotal: number;
  onPaidAmountChange: (value: string) => void;
  productPriceMap: Map<number, number>;
}

const ServiceDetailModal = ({
  isOpen,
  onClose,
  isLoading,
  error,
  service,
  getStatusTone,
  parts,
  partsSubtotal,
  partsLoading,
  partsError,
  partForm,
  setPartForm,
  productOptions,
  inventoryLoading,
  onProductFocus,
  isPartSubmitting,
  partSubmitError,
  onAddPart,
  onRemovePart,
  printerError,
  printerStatus,
  onPrint,
  checkoutError,
  checkoutForm,
  setCheckoutForm,
  paymentMethods,
  isCheckoutSubmitting,
  onCheckout,
  computedGrandTotal,
  onPaidAmountChange,
  productPriceMap,
}: ServiceDetailModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Service" size="lg">
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-slate-100 rounded-lg"></div>
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
          <div className="h-20 bg-slate-100 rounded-2xl"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
          {error}
        </div>
      ) : service ? (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">ID Service</p>
                <p className="text-lg font-black text-slate-900">JOB-{service.id}</p>
              </div>
              <StatusPill label={service.status?.name ?? 'Unknown'} tone={getStatusTone(service.status?.code).tone} />
            </div>
            <div className="text-sm text-slate-500 font-semibold">
              Dibuat: {formatDateTime(service.created_at)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Pelanggan</p>
              <p className="text-base font-black text-slate-900">{service.customer?.full_name ?? '-'}</p>
              <p className="text-sm text-slate-500 font-semibold">{service.customer?.phone_number ?? '-'}</p>
              <p className="text-sm text-slate-500 font-semibold">{service.customer?.email ?? '-'}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Perangkat</p>
              <p className="text-base font-black text-slate-900">{service.device?.name ?? '-'}</p>
              <p className="text-sm text-slate-500 font-semibold">Keluhan</p>
              <p className="text-sm text-slate-700">{service.problem_description}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Sparepart</p>
            {partsError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
                {partsError}
              </div>
            )}
            {partsLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-10 bg-slate-100 rounded-xl"></div>
                <div className="h-10 bg-slate-100 rounded-xl"></div>
              </div>
            ) : parts.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada sparepart ditambahkan.</p>
            ) : (
              <div className="space-y-3">
                {parts.map((part) => {
                  const unitPrice = part.price ?? part.product?.sell_price ?? 0;
                  const lineTotal = Number(unitPrice) * (part.qty ?? 0);
                  return (
                    <div key={part.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">{part.product?.name ?? 'Produk'}</p>
                        <p className="text-xs text-slate-500 font-semibold">
                          Qty {part.qty} x {formatCurrency(Number(unitPrice))}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-900">
                          {formatCurrency(lineTotal)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Hapus sparepart ini?')) {
                              onRemovePart(part.id);
                            }
                          }}
                          className="text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest"
                          disabled={isPartSubmitting}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                  <span>Subtotal Sparepart</span>
                  <span>{formatCurrency(partsSubtotal)}</span>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 space-y-4">
              {partSubmitError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
                  {partSubmitError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Produk"
                  options={productOptions}
                  value={partForm.product_id}
                  onChange={(e) => {
                    const productId = Number(e.target.value);
                    const defaultPrice = productPriceMap.get(productId);
                    setPartForm((prev) => ({
                      ...prev,
                      product_id: e.target.value,
                      price: defaultPrice !== undefined ? String(defaultPrice) : prev.price,
                      }));
                    }}
                  onFocus={onProductFocus}
                  disabled={inventoryLoading}
                />
                <Input
                  label="Qty"
                  type="number"
                  placeholder="1"
                  value={partForm.qty}
                  onChange={(e) => setPartForm((prev) => ({ ...prev, qty: e.target.value }))}
                />
                <Input
                  label="Harga (Opsional)"
                  type="number"
                  placeholder="Harga custom"
                  value={partForm.price}
                  onChange={(e) => setPartForm((prev) => ({ ...prev, price: e.target.value }))}
                />
                <Input
                  label="Catatan"
                  placeholder="Contoh: diskon, bonus, dll"
                  value={partForm.notes}
                  onChange={(e) => setPartForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onAddPart}
                  disabled={isPartSubmitting || !partForm.product_id}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all disabled:opacity-70"
                >
                  {isPartSubmitting ? 'Menyimpan...' : 'Tambah Sparepart'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Ringkasan Biaya</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Estimasi Biaya</p>
                <p className="text-base font-black text-slate-900">
                  {service.estimated_fee !== null && service.estimated_fee !== undefined
                    ? formatCurrency(service.estimated_fee)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Biaya Service</p>
                <p className="text-base font-black text-slate-900">
                  {service.service_fee !== null && service.service_fee !== undefined
                    ? formatCurrency(service.service_fee)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Transaksi</p>
                <p className="text-base font-black text-slate-900">
                  {service.transaction?.grand_total !== null && service.transaction?.grand_total !== undefined
                    ? formatCurrency(service.transaction.grand_total)
                    : '-'}
                </p>
              </div>
            </div>
            {service.transaction && (
              <div className="pt-3 border-t border-slate-100 text-sm text-slate-600 space-y-1">
                <p className="font-bold text-slate-700">Transaksi #{service.transaction.id}</p>
                <p>Dibayar: {formatCurrency(service.transaction.paid_amount)}</p>
                <p>Kembalian: {formatCurrency(service.transaction.change_amount)}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Cetak Bluetooth</p>
            <p className="text-sm text-slate-500">
              Pastikan printer thermal Bluetooth aktif dan sudah dalam mode BLE.
            </p>
            {printerError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
                {printerError}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onPrint}
                className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70"
                disabled={printerStatus === 'connecting' || printerStatus === 'printing'}
              >
                {printerStatus === 'connecting'
                  ? 'Menghubungkan...'
                  : printerStatus === 'printing'
                    ? 'Mencetak...'
                    : 'Print Thermal'}
              </button>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {printerStatus === 'connected' ? 'Printer Terhubung' : 'Belum Terhubung'}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Selesaikan & Checkout</p>
            {checkoutError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
                {checkoutError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Metode Pembayaran"
                options={[
                  { label: 'Pilih Metode', value: '' },
                  ...paymentMethods.map((method) => ({ label: method.name, value: method.id })),
                ]}
                value={checkoutForm.payment_method_id}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, payment_method_id: e.target.value }))}
              />
              <Input
                label="Nominal Bayar (Rp)"
                type="number"
                placeholder="0"
                value={checkoutForm.paid_amount}
                onChange={(e) => onPaidAmountChange(e.target.value)}
              />
              <Input
                label="Biaya Service (Rp)"
                type="number"
                placeholder="0"
                value={checkoutForm.service_fee}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, service_fee: e.target.value }))}
              />
              <Input
                label="Diskon (Rp)"
                type="number"
                placeholder="0"
                value={checkoutForm.discount}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, discount: e.target.value }))}
              />
              <Input
                label="Pajak (Rp)"
                type="number"
                placeholder="0"
                value={checkoutForm.tax}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, tax: e.target.value }))}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCheckout}
                disabled={isCheckoutSubmitting}
                className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70"
              >
                {isCheckoutSubmitting ? 'Memproses...' : 'Selesai & Checkout'}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-slate-600">
              <span>Grand Total</span>
              <span>{formatCurrency(computedGrandTotal)}</span>
            </div>
            <p className="text-xs text-slate-500">
              Catatan: proses checkout butuh minimal 1 sparepart terpasang di service job.
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default ServiceDetailModal;
