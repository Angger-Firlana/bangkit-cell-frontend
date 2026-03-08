import { useMemo, useState } from 'react';
import { Plus, Smartphone, User, ClipboardList, Search } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import StatusPill from '../components/common/StatusPill';
import Pagination from '../components/common/Pagination';
import { useServiceJobs } from '../hooks/useServiceJobs';
import { formatDate } from '../utils/format';

const ServicePage = () => {
  const { serviceJobs, devices, statuses, pagination, isLoading, error, createServiceJob, updateFilters, filters, setPage } = useServiceJobs();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    device_id: '',
    problem_description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const deviceOptions = useMemo(() => {
    return [
      { label: 'Pilih perangkat', value: '' },
      ...devices.map((device) => ({ label: device.name, value: device.id })),
    ];
  }, [devices]);

  const statusOptions = useMemo(() => {
    return [
      { label: 'Semua Status', value: '' },
      ...statuses.map((status) => ({ label: status.name, value: status.code })),
    ];
  }, [statuses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await createServiceJob({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone || undefined,
        customer_email: form.customer_email || undefined,
        device_id: Number(form.device_id),
        problem_description: form.problem_description,
      });
      setIsAddModalOpen(false);
      setForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        device_id: '',
        problem_description: '',
      });
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Gagal menyimpan data service.');
    } finally {
      setIsSubmitting(false);
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
          icon={<Smartphone className="h-5 w-5" />}
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
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Perangkat</th>
                  <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Pelanggan</th>
                  <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Masuk</th>
                  <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Keluhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {serviceJobs.map((service) => {
                  const status = statusTone(service.status?.code);
                  return (
                    <tr key={service.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-200">
                            <Smartphone className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{service.device?.name ?? '-'}</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-tighter mt-0.5">JOB-{service.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{service.customer?.full_name ?? '-'}</span>
                          <span className="text-[11px] font-bold text-slate-400 mt-1">{service.customer?.phone_number ?? '-'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusPill label={status.label} tone={status.tone} />
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900 tracking-tight">
                          {formatDate(service.created_at)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600 max-w-xs">
                        {service.problem_description}
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Input Service Baru"
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
              <Select
                label="Perangkat"
                options={deviceOptions}
                value={form.device_id}
                onChange={(e) => setForm((prev) => ({ ...prev, device_id: e.target.value }))}
                required
              />
              <Input
                label="Keluhan / Masalah"
                placeholder="Contoh: LCD pecah, baterai drop, mati total"
                value={form.problem_description}
                onChange={(e) => setForm((prev) => ({ ...prev, problem_description: e.target.value }))}
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServicePage;
