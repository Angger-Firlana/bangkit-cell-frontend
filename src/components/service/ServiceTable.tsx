import { Smartphone, ChevronUp } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Perangkat</th>
                <th className="px-8 py-6 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Pelanggan</th>
                <th className="px-8 py-6 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Masuk</th>
                <th className="px-8 py-6 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {serviceJobs.map((service) => {
                const status = getStatusTone(service.status?.code);
                return (
                  <tr key={service.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-200 shadow-sm">
                          <Smartphone className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{service.device?.name ?? '-'}</p>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">JOB-{service.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{service.customer?.full_name ?? '-'}</span>
                        <span className="text-[11px] font-medium text-slate-400 mt-0.5">{service.customer?.phone_number ?? '-'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusPill label={status.label} tone={status.tone} />
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-semibold text-slate-500 tracking-tight">
                        {formatDate(service.created_at)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(service.id)}
                        className="text-xs font-bold text-primary hover:text-primary-dark uppercase tracking-widest px-3 py-1.5 hover:bg-primary/5 rounded-lg transition-colors"
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

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {serviceJobs.map((service) => {
          const status = getStatusTone(service.status?.code);
          return (
            <div 
              key={service.id} 
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
              onClick={() => onOpenDetail(service.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center mr-3 border border-slate-100">
                    <Smartphone className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">{service.device?.name ?? '-'}</h3>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">JOB-{service.id}</p>
                  </div>
                </div>
                <StatusPill label={status.label} tone={status.tone} />
              </div>
              
              <div className="space-y-3 pt-3 border-t border-slate-50">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Pelanggan</span>
                  <span className="font-semibold text-slate-700">{service.customer?.full_name ?? '-'}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Tgl Masuk</span>
                  <span className="font-semibold text-slate-500">{formatDate(service.created_at)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{service.problem_description}</span>
                  <span className="text-xs font-bold text-primary flex items-center">
                    Detail <ChevronUp className="h-3 w-3 ml-1 rotate-90" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceTable;
