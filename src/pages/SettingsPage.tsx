import { Save } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import MasterDataPanel from '../components/settings/MasterDataPanel';
import { Button } from '../components/ui/Button';
import { usePwaInstall } from '../hooks/usePwaInstall';

const SettingsPage = () => {
  const { canInstall, installed, install } = usePwaInstall();

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
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
