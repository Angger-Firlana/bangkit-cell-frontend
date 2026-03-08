import { Save } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Toko</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
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
    </div>
  );
};

export default SettingsPage;
