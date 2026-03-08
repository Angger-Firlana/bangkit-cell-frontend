import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Select } from '../components/ui/Input';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { useServiceJobs } from '../hooks/useServiceJobs';
import serviceJobService from '../services/serviceJob.service';
import inventoryService from '../services/inventory.service';
import type { ServiceJob, ServiceJobPart } from '../types/serviceJob';
import {
  buildServiceReceipt,
  connectBluetoothPrinter,
  printBluetoothText,
  type BluetoothPrinterConnection,
} from '../utils/bluetoothPrinter';
import paymentMethodService from '../services/paymentMethod.service';
import type { PaymentMethod } from '../types/pos';
import type { InventoryItem } from '../types/inventory';
import ServiceTable from '../components/service/ServiceTable';
import ServiceAddModal from '../components/service/ServiceAddModal';
import ServiceDetailModal from '../components/service/ServiceDetailModal';
import type { CheckoutFormState, PartFormState, ServiceJobFormState } from '../types/serviceUI';

const ServicePage = () => {
  const { serviceJobs, devices, statuses, pagination, isLoading, error, createServiceJob, updateFilters, filters, setPage, refresh } = useServiceJobs();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState<ServiceJobFormState>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    device_query: '',
    problem_description: '',
    estimated_fee: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailService, setDetailService] = useState<ServiceJob | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [printerError, setPrinterError] = useState('');
  const [printerStatus, setPrinterStatus] = useState<'idle' | 'connecting' | 'connected' | 'printing'>('idle');
  const printerRef = useRef<BluetoothPrinterConnection | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormState>({
    payment_method_id: '',
    paid_amount: '',
    discount: '',
    tax: '',
    service_fee: '',
  });
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const [parts, setParts] = useState<ServiceJobPart[]>([]);
  const [partsSubtotal, setPartsSubtotal] = useState(0);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState('');
  const [partForm, setPartForm] = useState<PartFormState>({
    product_id: '',
    qty: '1',
    price: '',
    notes: '',
  });
  const [isPartSubmitting, setIsPartSubmitting] = useState(false);
  const [partSubmitError, setPartSubmitError] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [autoFillPaid, setAutoFillPaid] = useState(true);

  const statusOptions = useMemo(() => {
    return [
      { label: 'Semua Status', value: '' },
      ...statuses.map((status) => ({ label: status.name, value: status.code })),
    ];
  }, [statuses]);

  const productOptions = useMemo(() => {
    return [
      { label: 'Pilih Produk', value: '' },
      ...inventoryItems.map((item) => ({
        label: `${item.product?.name ?? 'Produk'} (Stok ${item.current_stock ?? 0})`,
        value: item.product_id ?? item.id,
      })),
    ];
  }, [inventoryItems]);

  const productPriceMap = useMemo(() => {
    const map = new Map<number, number>();
    inventoryItems.forEach((item) => {
      const price = item.product?.sell_price;
      if (price !== undefined && price !== null) {
        map.set(item.product_id ?? item.id, Number(price));
      }
    });
    return map;
  }, [inventoryItems]);

  const computedServiceFee = useMemo(() => {
    if (checkoutForm.service_fee) {
      return Number(checkoutForm.service_fee) || 0;
    }
    return detailService?.service_fee ? Number(detailService.service_fee) : 0;
  }, [checkoutForm.service_fee, detailService?.service_fee]);

  const computedDiscount = useMemo(() => (checkoutForm.discount ? Number(checkoutForm.discount) || 0 : 0), [checkoutForm.discount]);
  const computedTax = useMemo(() => (checkoutForm.tax ? Number(checkoutForm.tax) || 0 : 0), [checkoutForm.tax]);
  const computedGrandTotal = useMemo(() => {
    const subtotal = partsSubtotal ?? 0;
    return Math.max(0, subtotal + computedServiceFee - computedDiscount + computedTax);
  }, [partsSubtotal, computedServiceFee, computedDiscount, computedTax]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const deviceName = form.device_query.trim();
      if (!deviceName) {
        setSubmitError('Nama perangkat wajib diisi.');
        setIsSubmitting(false);
        return;
      }

      const normalizedQuery = deviceName.toLowerCase();
      const exactMatch = devices.find((device) => device.name.toLowerCase() === normalizedQuery);
      const partialMatches = devices.filter((device) => device.name.toLowerCase().includes(normalizedQuery));
      const deviceId = exactMatch?.id ?? (partialMatches.length === 1 ? partialMatches[0].id : null);

      if (!deviceId) {
        setSubmitError('Perangkat tidak ditemukan. Tambahkan di Master Data terlebih dahulu.');
        setIsSubmitting(false);
        return;
      }

      await createServiceJob({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone || undefined,
        customer_email: form.customer_email || undefined,
        device_id: deviceId,
        problem_description: form.problem_description,
        estimated_fee: form.estimated_fee ? Number(form.estimated_fee) : undefined,
      });
      setIsAddModalOpen(false);
      setForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        device_query: '',
        problem_description: '',
        estimated_fee: '',
      });
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Gagal menyimpan data service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInventoryItems = async () => {
    setInventoryLoading(true);
    try {
      const response = await inventoryService.getInventory({ per_page: 200 });
      setInventoryItems(response.data?.data ?? []);
    } catch (err) {
      setInventoryItems([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchParts = async (serviceId: number) => {
    setPartsLoading(true);
    setPartsError('');
    try {
      const response = await serviceJobService.listParts(serviceId);
      setParts(response.data?.parts ?? []);
      setPartsSubtotal(response.data?.summary?.subtotal ?? 0);
    } catch (err: any) {
      setParts([]);
      setPartsSubtotal(0);
      setPartsError(err?.response?.data?.message || 'Gagal memuat sparepart.');
    } finally {
      setPartsLoading(false);
    }
  };

  const handleAddPart = async () => {
    if (!detailService) return;
    setPartSubmitError('');
    setIsPartSubmitting(true);
    try {
      await serviceJobService.addPart(detailService.id, {
        product_id: Number(partForm.product_id),
        qty: Number(partForm.qty),
        price: partForm.price ? Number(partForm.price) : undefined,
        notes: partForm.notes || undefined,
      });
      setPartForm({ product_id: '', qty: '1', price: '', notes: '' });
      await fetchParts(detailService.id);
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setPartSubmitError((errorList?.[0] as string) || payload?.message || 'Gagal menambah sparepart.');
    } finally {
      setIsPartSubmitting(false);
    }
  };

  const handleRemovePart = async (partId: number) => {
    if (!detailService) return;
    setPartSubmitError('');
    setIsPartSubmitting(true);
    try {
      await serviceJobService.removePart(detailService.id, partId);
      await fetchParts(detailService.id);
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setPartSubmitError((errorList?.[0] as string) || payload?.message || 'Gagal menghapus sparepart.');
    } finally {
      setIsPartSubmitting(false);
    }
  };

  const statusTone = (statusCode?: string) => {
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

  const openDetail = async (serviceId: number) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setDetailError('');
    setPrinterError('');
    setCheckoutError('');
    setPartSubmitError('');
    setAutoFillPaid(true);
    try {
      const [detailResponse, partsResponse] = await Promise.all([
        serviceJobService.getById(serviceId),
        serviceJobService.listParts(serviceId),
      ]);

      setDetailService(detailResponse.data ?? null);
      setParts(partsResponse.data?.parts ?? []);
      setPartsSubtotal(partsResponse.data?.summary?.subtotal ?? 0);
      setCheckoutForm((prev) => ({
        ...prev,
        service_fee: detailResponse.data?.service_fee !== undefined && detailResponse.data?.service_fee !== null
          ? String(detailResponse.data.service_fee)
          : prev.service_fee,
      }));
    } catch (err: any) {
      setDetailService(null);
      setDetailError(err?.response?.data?.message || 'Gagal memuat detail service.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!detailService) return;
    setPrinterError('');
    try {
      if (!printerRef.current) {
        setPrinterStatus('connecting');
        printerRef.current = await connectBluetoothPrinter();
        setPrinterStatus('connected');
      }
      setPrinterStatus('printing');
      const receipt = buildServiceReceipt(detailService);
      await printBluetoothText(printerRef.current, receipt);
      setPrinterStatus('connected');
    } catch (err: any) {
      setPrinterStatus('idle');
      setPrinterError(err?.message || 'Gagal mengirim data ke printer.');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentMethodService.getAll();
      const list = response.data || [];
      setPaymentMethods(list);
      if (list.length > 0 && !checkoutForm.payment_method_id) {
        setCheckoutForm((prev) => ({ ...prev, payment_method_id: String(list[0].id) }));
      }
    } catch (err) {
      setPaymentMethods([]);
    }
  };

  const handleCheckout = async () => {
    if (!detailService) return;
    setCheckoutError('');
    if (!checkoutForm.payment_method_id) {
      setCheckoutError('Metode pembayaran wajib dipilih.');
      return;
    }
    if (parts.length === 0) {
      setCheckoutError('Tambahkan minimal 1 sparepart sebelum checkout.');
      return;
    }
    setIsCheckoutSubmitting(true);
    try {
      if (detailService.status?.code === 'service_job_new') {
        await serviceJobService.updateStatus(detailService.id, {
          status_code: 'service_job_progress',
        });
      }
      const paidAmount = checkoutForm.paid_amount
        ? Number(checkoutForm.paid_amount)
        : computedGrandTotal;
      const response = await serviceJobService.updateStatus(detailService.id, {
        status_code: 'service_job_done',
        auto_checkout: true,
        payment_method_id: Number(checkoutForm.payment_method_id),
        paid_amount: paidAmount,
        discount: checkoutForm.discount ? Number(checkoutForm.discount) : undefined,
        tax: checkoutForm.tax ? Number(checkoutForm.tax) : undefined,
        service_fee: checkoutForm.service_fee ? Number(checkoutForm.service_fee) : undefined,
      });
      setDetailService(response.data?.service_job ?? detailService);
      await refresh();
      await fetchParts(detailService.id);
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setCheckoutError((errorList?.[0] as string) || payload?.message || 'Gagal menyelesaikan service.');
    } finally {
      setIsCheckoutSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (!autoFillPaid) return;
    if (!detailService) return;
    setCheckoutForm((prev) => ({
      ...prev,
      paid_amount: computedGrandTotal ? String(computedGrandTotal) : prev.paid_amount,
    }));
  }, [autoFillPaid, computedGrandTotal, detailService]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Antrian Service"
        subtitle={`Total ${serviceJobs.length} Perangkat Terdaftar`}
        actions={(
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-white px-8 py-3 rounded-2xl flex items-center hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/30 font-black"
          >
            <Plus className="h-5 w-5 mr-2" />
            Input Baru
          </button>
        )}
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            value={filters.customer_query}
            onChange={(e) => updateFilters({ customer_query: e.target.value })}
            placeholder="Cari nama pelanggan atau nomor HP..."
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

      {!isLoading && serviceJobs.length === 0 ? (
        <EmptyState
          title="Belum Ada Service"
          message="Mulai catat service masuk agar proses teknisi dan kasir lebih rapi."
          icon={<Search className="h-5 w-5" />}
          action={(
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-800 transition-all"
            >
              Input Service Baru
            </button>
          )}
        />
      ) : (
        <ServiceTable
          serviceJobs={serviceJobs}
          getStatusTone={statusTone}
          onOpenDetail={openDetail}
        />
      )}

      {pagination && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          onPageChange={setPage}
        />
      )}
      <ServiceAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        form={form}
        setForm={setForm}
        devices={devices}
      />

      <ServiceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isLoading={detailLoading}
        error={detailError}
        service={detailService}
        getStatusTone={statusTone}
        parts={parts}
        partsSubtotal={partsSubtotal}
        partsLoading={partsLoading}
        partsError={partsError}
        partForm={partForm}
        setPartForm={setPartForm}
        productOptions={productOptions}
        inventoryLoading={inventoryLoading}
        onProductFocus={() => {
          if (inventoryItems.length === 0 && !inventoryLoading) {
            fetchInventoryItems();
          }
        }}
        isPartSubmitting={isPartSubmitting}
        partSubmitError={partSubmitError}
        onAddPart={handleAddPart}
        onRemovePart={handleRemovePart}
        printerError={printerError}
        printerStatus={printerStatus}
        onPrint={handlePrint}
        checkoutError={checkoutError}
        checkoutForm={checkoutForm}
        setCheckoutForm={setCheckoutForm}
        paymentMethods={paymentMethods}
        isCheckoutSubmitting={isCheckoutSubmitting}
        onCheckout={handleCheckout}
        computedGrandTotal={computedGrandTotal}
        onPaidAmountChange={(value) => {
          setAutoFillPaid(false);
          setCheckoutForm((prev) => ({ ...prev, paid_amount: value }));
        }}
        productPriceMap={productPriceMap}
      />
    </div>
  );
};

export default ServicePage;

