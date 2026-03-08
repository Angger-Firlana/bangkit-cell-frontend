import { Tag, Smartphone, DollarSign, Camera, CheckCircle, Calendar } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import type { ListingPhone } from '../../types/phone';
import { formatCurrency, formatDateTime } from '../../utils/format';
import StatusPill from '../common/StatusPill';

interface PhoneDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: ListingPhone | null;
  onMarkSold: (id: number) => void;
  isProcessing: boolean;
}

const PhoneDetailModal = ({
  isOpen,
  onClose,
  phone,
  onMarkSold,
  isProcessing,
}: PhoneDetailModalProps) => {
  if (!phone) return null;

  const isSold = phone.status?.code === 'listing_phone_sold' || Boolean(phone.sold_at);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Unit HP Second"
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image & Status */}
        <div className="space-y-6">
          <div className="aspect-square bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-100 relative group">
            {phone.image_url ? (
              <img
                src={phone.image_url}
                alt={phone.device?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Camera className="h-12 w-12 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Tidak Ada Foto</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4">
              <StatusPill status={phone.status} />
            </div>
            
            {isSold && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                <div className="bg-white px-6 py-2 rounded-full shadow-2xl transform -rotate-12 border-2 border-slate-900">
                  <span className="text-xl font-black uppercase tracking-widest text-slate-900">SUDAH TERJUAL</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4 flex items-center">
              <Calendar className="h-3 w-3 mr-2" /> Riwayat Unit
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Ditambahkan</span>
                <span className="text-xs font-bold text-slate-800">{formatDateTime(phone.created_at || '')}</span>
              </div>
              {phone.sold_at && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-rose-500 uppercase">Terjual Pada</span>
                  <span className="text-xs font-bold text-rose-600">{formatDateTime(phone.sold_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-8">
            <section>
              <h4 className="font-bold text-primary text-[10px] uppercase tracking-widest mb-3 flex items-center">
                <Smartphone className="h-4 w-4 mr-2" /> Spesifikasi Unit
              </h4>
              <h3 className="text-3xl font-black text-slate-900 leading-tight mb-2">
                {phone.device?.name ?? 'Unknown Device'}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg uppercase tracking-wider border border-slate-200">
                  SN: {phone.serial_number}
                </span>
                <span className="px-3 py-1.5 bg-blue-50 text-primary text-[11px] font-bold rounded-lg uppercase tracking-wider border border-blue-100">
                  {phone.condition}
                </span>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                  <Tag className="h-3 w-3 mr-1" /> Harga Beli
                </p>
                <p className="text-lg font-bold text-slate-700">{formatCurrency(phone.purchased_price)}</p>
              </div>
              <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" /> Harga Jual
                </p>
                <p className="text-lg font-bold text-primary">{formatCurrency(phone.price)}</p>
              </div>
            </section>

            <section className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Potensi Keuntungan</p>
                  <p className="text-2xl font-black text-emerald-700">{formatCurrency(phone.price - phone.purchased_price)}</p>
                </div>
                <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </section>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Tutup
            </Button>
            {!isSold && (
              <Button
                variant="primary"
                onClick={() => onMarkSold(phone.id)}
                isLoading={isProcessing}
                className="flex-[2] shadow-xl shadow-primary/20"
              >
                Tandai Terjual
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PhoneDetailModal;
