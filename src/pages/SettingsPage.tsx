import { Save } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import MasterDataPanel from '../components/settings/MasterDataPanel';
import { Button } from '../components/ui/Button';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useEffect } from 'react';
import { useBluetoothStore } from '../stores/useBluetoothStore';

const SettingsPage = () => {
  const { canInstall, installed, install } = usePwaInstall();
  const bluetooth = useBluetoothStore();
  const initBluetooth = useBluetoothStore((s) => s.init);

  useEffect(() => {
    initBluetooth();
  }, [initBluetooth]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pengaturan"
        subtitle="Kelola informasi toko dan master data perangkat."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Pengaturan Toko"
          subtitle="Informasi dasar toko dan struk."
          className="lg:col-span-2"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
              <input
                type="text"
                defaultValue="Bangkit Cell"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                rows={3}
                defaultValue="Jl. Raya Merdeka No. 45, Jakarta Selatan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
              <input
                type="text"
                defaultValue="0812-3456-7890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesan Struk Footer</label>
              <input
                type="text"
                defaultValue="Terima kasih telah berbelanja di Bangkit Cell!"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
                <Save className="h-5 w-5 mr-2" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <MasterDataPanel />

          <Card
            title="Aplikasi Mobile (PWA)"
            subtitle="Install di HP agar terasa seperti aplikasi."
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    Status: {installed ? 'Terpasang' : canInstall ? 'Siap di-install' : 'Belum tersedia'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Android: buka via Chrome lalu gunakan tombol Install. iPhone: biasanya lewat Share → Add to Home Screen.
                  </p>
                </div>
                <Button
                  onClick={() => install()}
                  disabled={!canInstall || installed}
                  variant={canInstall && !installed ? 'secondary' : 'outline'}
                >
                  Install
                </Button>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed">
                <p className="font-semibold text-slate-700">Catatan Bluetooth</p>
                <p>
                  Web Bluetooth untuk printer biasanya bekerja di Chrome/Edge Android atau desktop, dan butuh HTTPS (kecuali localhost).
                </p>
              </div>
            </div>
          </Card>

          <Card
            title="Bluetooth (Native Android)"
            subtitle="Koneksi printer/device via Bluetooth klasik (SPP)."
          >
            {!bluetooth.isNativeAndroid ? (
              <div className="text-sm text-slate-600">
                Fitur ini hanya tersedia saat app dijalankan sebagai aplikasi Android (Capacitor).
              </div>
            ) : !bluetooth.supported ? (
              <div className="text-sm text-slate-600">
                Device ini tidak mendukung Bluetooth.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      Status: {bluetooth.connected ? 'Terhubung' : bluetooth.connecting ? 'Menghubungkan...' : 'Belum terhubung'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {bluetooth.connectedAddress ? `Device: ${bluetooth.connectedAddress}` : bluetooth.enabled ? 'Bluetooth aktif' : 'Bluetooth nonaktif'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!bluetooth.enabled ? (
                      <Button variant="secondary" onClick={() => bluetooth.requestEnable()}>
                        Aktifkan
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => bluetooth.refreshBondedDevices()}>
                        Refresh
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Device ter-pair</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bluetooth.selectedAddress ?? ''}
                    onChange={(e) => bluetooth.selectDevice(e.target.value || null)}
                    disabled={!bluetooth.enabled || bluetooth.devices.length === 0 || bluetooth.connected}
                  >
                    {bluetooth.devices.length === 0 ? (
                      <option value="">
                        {bluetooth.enabled ? 'Belum ada device (tap Refresh)' : 'Bluetooth nonaktif'}
                      </option>
                    ) : (
                      bluetooth.devices.map((d) => (
                        <option key={d.address} value={d.address}>
                          {(d.name ?? 'Unknown')} — {d.address}
                        </option>
                      ))
                    )}
                  </select>

                  <div className="flex items-center gap-2 pt-2">
                    {bluetooth.connected ? (
                      <Button variant="danger" onClick={() => bluetooth.disconnect()}>
                        Putuskan
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => bluetooth.connectSelected()}
                        disabled={!bluetooth.enabled || !bluetooth.selectedAddress || bluetooth.connecting}
                        isLoading={bluetooth.connecting}
                      >
                        Connect
                      </Button>
                    )}
                  </div>

                  {bluetooth.lastError && (
                    <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-2">
                      <div>{bluetooth.lastError}</div>
                      {(bluetooth.lastError.toLowerCase().includes('izin') || bluetooth.lastError.toLowerCase().includes('permission')) && (
                        <Button variant="outline" size="sm" onClick={() => bluetooth.openAppSettings()}>
                          Buka Pengaturan Izin
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-slate-500 leading-relaxed">
                    Pastikan device sudah pairing di pengaturan Bluetooth Android terlebih dahulu.
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
