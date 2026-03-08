import { Smartphone } from 'lucide-react';
import StatusPill from '../common/StatusPill';
import { formatDate } from '../../utils/format';
import type { ServiceJob } from '../../types/serviceJob';

type StatusTone = { label: string; tone: 'warning' | 'info' | 'success' | 'neutral' };

interface ServiceTableProps {
  serviceJobs: ServiceJob[];
  getStatusTone: (statusCode?: string) => StatusTone;
  onOpenDetail: (serviceId: number) => void;
}

const ServiceTable = ({ serviceJobs, getStatusTone, onOpenDetail }: ServiceTableProps) => {
  return (
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
              <th className="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {serviceJobs.map((service) => {
              const status = getStatusTone(service.status?.code);
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
                  <td className="px-8 py-6 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(service.id)}
                      className="text-xs font-black text-primary hover:text-blue-800 uppercase tracking-widest"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceTable;
