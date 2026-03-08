import { Save } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import MasterDataPanel from '../components/settings/MasterDataPanel';

const SettingsPage = () => {
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

        <MasterDataPanel />
      </div>
    </div>
  );
};

export default SettingsPage;
