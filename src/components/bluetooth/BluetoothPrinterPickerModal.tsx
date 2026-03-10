import { useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { useBluetoothStore } from '../../stores/useBluetoothStore';

const printerScore = (name: string | null) => {
  if (!name) return 0;
  const n = name.toLowerCase();
  let score = 0;
  if (n.includes('printer')) score += 6;
  if (n.includes('thermal')) score += 6;
  if (n.includes('pos')) score += 4;
  if (n.includes('esc')) score += 3;
  if (n.includes('epson')) score += 3;
  if (n.includes('xprinter')) score += 3;
  if (n.includes('gprinter')) score += 3;
  if (n.includes('zjiang') || n.includes('zj-')) score += 2;
  if (n.includes('bixolon')) score += 2;
  if (n.includes('star')) score += 2;
  if (n.includes('rp-') || n.includes('rpp')) score += 2;
  if (n.includes('tm-')) score += 2;
  return score;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: (address: string) => void;
};

const BluetoothPrinterPickerModal = ({ isOpen, onClose, onConnected }: Props) => {
  const nativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const init = useBluetoothStore((s) => s.init);
  const refreshBondedDevices = useBluetoothStore((s) => s.refreshBondedDevices);
  const requestEnable = useBluetoothStore((s) => s.requestEnable);
  const openAppSettings = useBluetoothStore((s) => s.openAppSettings);
  const devices = useBluetoothStore((s) => s.devices);
  const enabled = useBluetoothStore((s) => s.enabled);
  const supported = useBluetoothStore((s) => s.supported);
  const selectedAddress = useBluetoothStore((s) => s.selectedAddress);
  const connecting = useBluetoothStore((s) => s.connecting);
  const connected = useBluetoothStore((s) => s.connected);
  const lastError = useBluetoothStore((s) => s.lastError);
  const selectDevice = useBluetoothStore((s) => s.selectDevice);
  const connectSelected = useBluetoothStore((s) => s.connectSelected);

  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (!nativeAndroid) return;
    init().catch(() => undefined);
  }, [init, isOpen, nativeAndroid]);

  useEffect(() => {
    if (!isOpen) return;
    if (!nativeAndroid) return;
    if (!enabled) return;
    refreshBondedDevices().catch(() => undefined);
  }, [enabled, isOpen, nativeAndroid, refreshBondedDevices]);

  const recommended = useMemo(() => {
    if (devices.length === 0) return null;
    if (devices.length === 1) return devices[0] ?? null;
    const scored = devices
      .map((d) => ({ d, score: printerScore(d.name) }))
      .sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (!best) return null;
    return best.score >= 6 ? best.d : null;
  }, [devices]);

  const filteredDevices = useMemo(() => {
    if (!filter.trim()) return devices;
    const q = filter.toLowerCase();
    return devices.filter((d) => (d.name ?? '').toLowerCase().includes(q) || d.address.toLowerCase().includes(q));
  }, [devices, filter]);

  const handleConnect = async (address: string) => {
    selectDevice(address);
    try {
      await connectSelected();
      onConnected?.(address);
      onClose();
    } catch {
      // store already captures error
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Printer Bluetooth" size="lg">
      {!nativeAndroid ? (
        <div className="text-sm text-slate-600">Fitur ini hanya tersedia di aplikasi Android (Capacitor).</div>
      ) : !supported ? (
        <div className="text-sm text-slate-600">Device ini tidak mendukung Bluetooth.</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">
                {connected ? 'Printer terhubung' : enabled ? 'Bluetooth aktif' : 'Bluetooth nonaktif'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih dari device yang sudah pairing di Android.
              </p>
            </div>
            {!enabled ? (
              <Button variant="secondary" onClick={() => requestEnable()}>
                Aktifkan Bluetooth
              </Button>
            ) : (
              <Button variant="outline" onClick={() => refreshBondedDevices()}>
                Refresh
              </Button>
            )}
          </div>

          {lastError && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-2">
              <div>{lastError}</div>
              {(lastError.toLowerCase().includes('izin') || lastError.toLowerCase().includes('permission')) && (
                <Button variant="outline" size="sm" onClick={() => openAppSettings()}>
                  Buka Pengaturan Izin
                </Button>
              )}
            </div>
          )}

          {enabled && (
            <>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Cari Printer
                </label>
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Ketik nama printer..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 transition-all outline-none text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-sm"
                />
              </div>

              {recommended && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Disarankan</p>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{recommended.name ?? 'Printer'}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{recommended.address}</p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleConnect(recommended.address)}
                    disabled={connecting}
                    isLoading={connecting}
                  >
                    Sambungkan
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Device Ter-pair ({filteredDevices.length})
                </p>
                <div className="space-y-2">
                  {filteredDevices.length === 0 ? (
                    <div className="text-sm text-slate-600 bg-white border border-slate-100 rounded-2xl p-4">
                      Tidak ada device. Pair printer dulu di pengaturan Bluetooth Android.
                    </div>
                  ) : (
                    filteredDevices.map((d) => {
                      const active = (selectedAddress ?? '') === d.address;
                      return (
                        <button
                          key={d.address}
                          type="button"
                          onClick={() => handleConnect(d.address)}
                          disabled={connecting}
                          className={[
                            'w-full text-left p-4 rounded-2xl border transition-all',
                            'active:scale-[0.99] disabled:opacity-70',
                            active ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:bg-slate-50',
                          ].join(' ')}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 line-clamp-1">{d.name ?? 'Unknown'}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{d.address}</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              {active ? 'Dipilih' : 'Pilih'}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default BluetoothPrinterPickerModal;

