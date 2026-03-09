import { useEffect, useMemo, useState } from 'react';
import { Plus, Tag, Layers, Smartphone, Search, Edit2, Trash2, Save, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Pagination from '../common/Pagination';
import catalogService from '../../services/catalog.service';
import type { Device } from '../../types/serviceJob';
import type { DeviceBrand, DeviceModel } from '../../types/deviceCatalog';

type TabType = 'brand' | 'model' | 'device';

const MasterDataPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('brand');
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [masterError, setMasterError] = useState('');
  const [isMasterLoading, setIsMasterLoading] = useState(false);

  const [brandName, setBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceBrandQuery, setDeviceBrandQuery] = useState('');
  const [deviceModelQuery, setDeviceModelQuery] = useState('');
  
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [editingBrandName, setEditingBrandName] = useState('');
  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [editingModelName, setEditingModelName] = useState('');
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [editingDeviceName, setEditingDeviceName] = useState('');
  const [editingDeviceBrandQuery, setEditingDeviceBrandQuery] = useState('');
  const [editingDeviceModelQuery, setEditingDeviceModelQuery] = useState('');
  
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [deviceSearch, setDeviceSearch] = useState('');

  const [brandPage, setBrandPage] = useState(1);
  const [modelPage, setModelPage] = useState(1);
  const [devicePage, setDevicePage] = useState(1);
  const itemsPerPage = 8;

  const normalizeList = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === 'object') {
      const nested = (payload as { data?: unknown }).data;
      if (Array.isArray(nested)) return nested;
    }
    return [];
  };

  const resolveByName = <T extends { name: string }>(items: T[], name: string) => {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return null;
    return items.find((item) => item.name.toLowerCase() === normalized) ?? null;
  };

  const brandMap = useMemo(() => {
    const map = new Map<number, string>();
    brands.forEach((brand) => map.set(brand.id, brand.name));
    return map;
  }, [brands]);

  const modelMap = useMemo(() => {
    const map = new Map<number, DeviceModel>();
    models.forEach((model) => map.set(model.id, model));
    return map;
  }, [models]);

  const brandUsage = useMemo(() => {
    const map = new Map<number, number>();
    brands.forEach((brand) => map.set(brand.id, 0));
    devices.forEach((device) => {
      const current = map.get(device.brand_id) ?? 0;
      map.set(device.brand_id, current + 1);
    });
    return map;
  }, [brands, devices]);

  const modelUsage = useMemo(() => {
    const map = new Map<number, number>();
    models.forEach((model) => map.set(model.id, 0));
    devices.forEach((device) => {
      const current = map.get(device.level_device_id) ?? 0;
      map.set(device.level_device_id, current + 1);
    });
    return map;
  }, [models, devices]);

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    const list = query ? brands.filter((brand) => brand.name.toLowerCase().includes(query)) : brands;
    return list;
  }, [brands, brandSearch]);

  const paginatedBrands = useMemo(() => {
    const start = (brandPage - 1) * itemsPerPage;
    return filteredBrands.slice(start, start + itemsPerPage);
  }, [filteredBrands, brandPage]);

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    const list = query ? models.filter((model) => model.name.toLowerCase().includes(query)) : models;
    return list;
  }, [models, modelSearch]);

  const paginatedModels = useMemo(() => {
    const start = (modelPage - 1) * itemsPerPage;
    return filteredModels.slice(start, start + itemsPerPage);
  }, [filteredModels, modelPage]);

  const filteredDevices = useMemo(() => {
    const query = deviceSearch.trim().toLowerCase();
    const list = query ? devices.filter((device) => {
      const bName = brandMap.get(device.brand_id) ?? '';
      const mName = modelMap.get(device.level_device_id)?.name ?? '';
      return (
        device.name.toLowerCase().includes(query) ||
        bName.toLowerCase().includes(query) ||
        mName.toLowerCase().includes(query)
      );
    }) : devices;
    return list;
  }, [devices, deviceSearch, brandMap, modelMap]);

  const paginatedDevices = useMemo(() => {
    const start = (devicePage - 1) * itemsPerPage;
    return filteredDevices.slice(start, start + itemsPerPage);
  }, [filteredDevices, devicePage]);

  const fetchMasterData = async () => {
    setIsMasterLoading(true);
    setMasterError('');
    try {
      const [brandsResponse, modelsResponse, devicesResponse] = await Promise.all([
        catalogService.getDeviceBrands(),
        catalogService.getDeviceModels(),
        catalogService.getDevices(),
      ]);
      setBrands(normalizeList<DeviceBrand>(brandsResponse?.data ?? brandsResponse));
      setModels(normalizeList<DeviceModel>(modelsResponse?.data ?? modelsResponse));
      setDevices(normalizeList<Device>(devicesResponse?.data ?? devicesResponse));
    } catch (err: any) {
      setMasterError(err?.response?.data?.message || 'Gagal memuat master data perangkat.');
    } finally {
      setIsMasterLoading(false);
    }
  };

  const handleCreateBrand = async () => {
    const name = brandName.trim();
    if (!name) {
      setMasterError('Nama brand wajib diisi.');
      return;
    }
    setMasterError('');
    try {
      await catalogService.createDeviceBrand({ name });
      setBrandName('');
      await fetchMasterData();
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setMasterError((errorList?.[0] as string) || payload?.message || 'Gagal menambah brand.');
    }
  };

  const handleCreateModel = async () => {
    const name = modelName.trim();
    if (!name) {
      setMasterError('Nama model wajib diisi.');
      return;
    }
    setMasterError('');
    try {
      await catalogService.createDeviceModel({ name });
      setModelName('');
      await fetchMasterData();
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setMasterError((errorList?.[0] as string) || payload?.message || 'Gagal menambah model.');
    }
  };

  const handleCreateDevice = async () => {
    const name = deviceName.trim();
    if (!name) {
      setMasterError('Nama device wajib diisi.');
      return;
    }
    const brand = resolveByName(brands, deviceBrandQuery);
    const model = resolveByName(models, deviceModelQuery);
    if (!brand || !model) {
      setMasterError('Brand dan model wajib dipilih dari daftar yang ada.');
      return;
    }
    setMasterError('');
    try {
      await catalogService.createDevice({ name, brand_id: brand.id, level_device_id: model.id });
      setDeviceName('');
      setDeviceBrandQuery('');
      setDeviceModelQuery('');
      await fetchMasterData();
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setMasterError((errorList?.[0] as string) || payload?.message || 'Gagal menambah device.');
    }
  };

  const handleEditBrand = (brand: DeviceBrand) => {
    setEditingBrandId(brand.id);
    setEditingBrandName(brand.name);
  };

  const handleUpdateBrand = async () => {
    if (editingBrandId === null) return;
    const name = editingBrandName.trim();
    if (!name) {
      setMasterError('Nama brand wajib diisi.');
      return;
    }
    setMasterError('');
    try {
      await catalogService.updateDeviceBrand(editingBrandId, { name });
      setEditingBrandId(null);
      setEditingBrandName('');
      await fetchMasterData();
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setMasterError((errorList?.[0] as string) || payload?.message || 'Gagal memperbarui brand.');
    }
  };

  const handleDeleteBrand = async (brand: DeviceBrand) => {
    const usage = brandUsage.get(brand.id);
    if ((usage ?? 0) > 0) {
      setMasterError('Brand tidak bisa dihapus karena masih dipakai oleh device.');
      return;
    }
    if (!window.confirm(`Hapus brand ${brand.name}?`)) return;
    setMasterError('');
    try {
      await catalogService.deleteDeviceBrand(brand.id);
      await fetchMasterData();
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setMasterError((errorList?.[0] as string) || payload?.message || 'Gagal menghapus brand.');
    }
  };

  const handleEditModel = (model: DeviceModel) => {
    setEditingModelId(model.id);
    setEditingModelName(model.name);
  };

  const handleUpdateModel = async () => {
    if (editingModelId === null) return;
    const name = editingModelName.trim();
    if (!name) {
      setMasterError('Nama model wajib diisi.');
      return;
    }
    setMasterError('');
    try {
      await catalogService.updateDeviceModel(editingModelId, { name });
      setEditingModelId(null);
      setEditingModelName('');
      await fetchMasterData();
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setMasterError((errorList?.[0] as string) || payload?.message || 'Gagal memperbarui model.');
    }
  };

  const handleDeleteModel = async (model: DeviceModel) => {
    const usedCount = modelUsage.get(model.id) ?? 0;
    if (usedCount > 0) {
      setMasterError('Model tidak bisa dihapus karena masih dipakai oleh device.');
      return;
    }
    if (!window.confirm(`Hapus model ${model.name}?`)) return;
    setMasterError('');
    try {
      await catalogService.deleteDeviceModel(model.id);
      await fetchMasterData();
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setMasterError((errorList?.[0] as string) || payload?.message || 'Gagal menghapus model.');
    }
  };

  const handleEditDevice = (device: Device) => {
    setEditingDeviceId(device.id);
    setEditingDeviceName(device.name);
    setEditingDeviceBrandQuery(brandMap.get(device.brand_id) ?? '');
    const model = modelMap.get(device.level_device_id ?? 0);
    setEditingDeviceModelQuery(model?.name ?? '');
  };

  const handleUpdateDevice = async () => {
    if (editingDeviceId === null) return;
    const name = editingDeviceName.trim();
    if (!name) {
      setMasterError('Nama device wajib diisi.');
      return;
    }
    const brand = resolveByName(brands, editingDeviceBrandQuery);
    const model = resolveByName(models, editingDeviceModelQuery);
    if (!brand || !model) {
      setMasterError('Brand dan model wajib dipilih dari daftar yang ada.');
      return;
    }
    setMasterError('');
    try {
      await catalogService.updateDevice(editingDeviceId, {
        name,
        brand_id: brand.id,
        level_device_id: model.id,
      });
      setEditingDeviceId(null);
      setEditingDeviceName('');
      setEditingDeviceBrandQuery('');
      setEditingDeviceModelQuery('');
      await fetchMasterData();
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setMasterError((errorList?.[0] as string) || payload?.message || 'Gagal memperbarui device.');
    }
  };

  const handleDeleteDevice = async (device: Device) => {
    if (!window.confirm(`Hapus device ${device.name}?`)) return;
    setMasterError('');
    try {
      await catalogService.deleteDevice(device.id);
      await fetchMasterData();
    } catch (err: any) {
      const payload = err?.response?.data;
      const errorList = payload?.errors ? Object.values(payload.errors).flat() : [];
      setMasterError((errorList?.[0] as string) || payload?.message || 'Gagal menghapus device.');
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const tabs = [
    { id: 'brand', label: 'Brand', icon: Tag },
    { id: 'model', label: 'Model', icon: Layers },
    { id: 'device', label: 'Device', icon: Smartphone },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tabs UI */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-fit overflow-x-auto no-scrollbar max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card>
        {masterError && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-3 animate-shake">
            <X className="h-4 w-4 flex-shrink-0" onClick={() => setMasterError('')} />
            {masterError}
          </div>
        )}
        
        {isMasterLoading && (
          <div className="mb-6 text-xs font-semibold text-slate-400 animate-pulse flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-ping" />
            Memuat data...
          </div>
        )}

        {/* Brand Tab Content */}
        {activeTab === 'brand' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Nama brand baru..."
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateBrand()}
                />
                <Button variant="secondary" onClick={handleCreateBrand}>
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Tambah</span>
                </Button>
              </div>
              <div className="sm:w-64 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10"
                  placeholder="Cari brand..."
                  value={brandSearch}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setBrandPage(1);
                  }}
                />
              </div>
            </div>

            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] px-6 py-4 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <span>Nama Brand</span>
                <span>Info Penggunaan</span>
                <span className="text-right px-2">Aksi</span>
              </div>
              <div className="divide-y divide-slate-100">
                {paginatedBrands.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <Tag className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 italic font-medium">Belum ada data brand ditemukan.</p>
                  </div>
                )}
                {paginatedBrands.map((brand) => (
                  <div key={brand.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto] items-start sm:items-center px-6 py-4 bg-white transition-hover gap-3 sm:gap-0">
                    {editingBrandId === brand.id ? (
                      <div className="w-full col-span-3 flex gap-2">
                        <Input
                          value={editingBrandName}
                          onChange={(e) => setEditingBrandName(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateBrand()}
                        />
                        <Button size="sm" variant="secondary" onClick={handleUpdateBrand}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingBrandId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-700">{brand.name}</p>
                        <div className="text-xs text-slate-500 font-medium">
                          {brandUsage.get(brand.id) ?? 0} device terdaftar
                        </div>
                        <div className="flex gap-2 self-end sm:self-auto">
                          <Button size="sm" variant="outline" onClick={() => handleEditBrand(brand)} className="h-8 w-8 p-0">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteBrand(brand)}
                            disabled={(brandUsage.get(brand.id) ?? 0) > 0}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Pagination
              currentPage={brandPage}
              lastPage={Math.max(1, Math.ceil(filteredBrands.length / itemsPerPage))}
              onPageChange={setBrandPage}
            />
          </div>
        )}

        {/* Model Tab Content */}
        {activeTab === 'model' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto] gap-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nama model baru..."
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateModel()}
                />
                <Button variant="secondary" onClick={handleCreateModel}>
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Tambah</span>
                </Button>
              </div>
              <div className="sm:w-64 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10"
                  placeholder="Cari model..."
                  value={modelSearch}
                  onChange={(e) => {
                    setModelSearch(e.target.value);
                    setModelPage(1);
                  }}
                />
              </div>
            </div>

            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] px-6 py-4 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <span>Nama Model</span>
                <span>Info Penggunaan</span>
                <span className="text-right px-2">Aksi</span>
              </div>
              <div className="divide-y divide-slate-100">
                {paginatedModels.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <Layers className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 italic font-medium">Belum ada data model ditemukan.</p>
                  </div>
                )}
                {paginatedModels.map((model) => (
                  <div key={model.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto] items-start sm:items-center px-6 py-4 bg-white gap-3 sm:gap-0">
                    {editingModelId === model.id ? (
                      <div className="w-full col-span-3 flex gap-2">
                        <Input
                          value={editingModelName}
                          onChange={(e) => setEditingModelName(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateModel()}
                        />
                        <Button size="sm" variant="secondary" onClick={handleUpdateModel}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingModelId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-700">{model.name}</p>
                        <div className="text-xs text-slate-500 font-medium">
                          Dipakai {modelUsage.get(model.id) ?? 0} kali
                        </div>
                        <div className="flex gap-2 self-end sm:self-auto">
                          <Button size="sm" variant="outline" onClick={() => handleEditModel(model)} className="h-8 w-8 p-0">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteModel(model)}
                            disabled={(modelUsage.get(model.id) ?? 0) > 0}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Pagination
              currentPage={modelPage}
              lastPage={Math.max(1, Math.ceil(filteredModels.length / itemsPerPage))}
              onPageChange={setModelPage}
            />
          </div>
        )}

        {/* Device Tab Content */}
        {activeTab === 'device' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Nama Device</label>
                  <Input
                    placeholder="Contoh: iPhone 13 Pro"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Brand</label>
                  <Input
                    placeholder="Pilih Brand..."
                    value={deviceBrandQuery}
                    onChange={(e) => setDeviceBrandQuery(e.target.value)}
                    list="brand-options"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Model</label>
                  <Input
                    placeholder="Pilih Model..."
                    value={deviceModelQuery}
                    onChange={(e) => setDeviceModelQuery(e.target.value)}
                    list="model-options"
                  />
                </div>
              </div>
              <Button variant="secondary" onClick={handleCreateDevice} className="w-full sm:w-fit px-8">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Device
              </Button>
              
              <div className="relative pt-2 border-t border-slate-50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10"
                  placeholder="Cari device, brand, atau model..."
                  value={deviceSearch}
                  onChange={(e) => {
                    setDeviceSearch(e.target.value);
                    setDevicePage(1);
                  }}
                />
              </div>
            </div>

            <datalist id="brand-options">
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name} />
              ))}
            </datalist>
            <datalist id="model-options">
              {models.map((model) => (
                <option key={model.id} value={model.name} />
              ))}
            </datalist>

            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] px-6 py-4 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <span>Nama Device</span>
                <span>Brand & Model</span>
                <span className="text-right px-2">Aksi</span>
              </div>
              <div className="divide-y divide-slate-100">
                {paginatedDevices.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <Smartphone className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 italic font-medium">Belum ada data device ditemukan.</p>
                  </div>
                )}
                {paginatedDevices.map((device) => {
                  const model = modelMap.get(device.level_device_id ?? 0);
                  return (
                    <div key={device.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto] items-start sm:items-center px-6 py-4 bg-white gap-3 sm:gap-0 transition-all hover:bg-slate-50/30">
                      {editingDeviceId === device.id ? (
                        <div className="w-full col-span-3 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Input
                              value={editingDeviceName}
                              onChange={(e) => setEditingDeviceName(e.target.value)}
                              autoFocus
                            />
                            <Input
                              value={editingDeviceBrandQuery}
                              onChange={(e) => setEditingDeviceBrandQuery(e.target.value)}
                              list="brand-options"
                            />
                            <Input
                              value={editingDeviceModelQuery}
                              onChange={(e) => setEditingDeviceModelQuery(e.target.value)}
                              list="model-options"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={handleUpdateDevice}>
                              <Save className="h-4 w-4 mr-2" /> Simpan
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingDeviceId(null)}>
                              <X className="h-4 w-4" /> Batal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{device.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">ID: {device.id}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold border border-blue-100 uppercase tracking-tight">
                              {brandMap.get(device.brand_id) ?? 'N/A'}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md text-[10px] font-bold border border-slate-100 uppercase tracking-tight">
                              {model?.name ?? 'N/A'}
                            </span>
                          </div>
                          <div className="flex gap-2 self-end sm:self-auto">
                            <Button size="sm" variant="outline" onClick={() => handleEditDevice(device)} className="h-8 w-8 p-0">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteDevice(device)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <Pagination
              currentPage={devicePage}
              lastPage={Math.max(1, Math.ceil(filteredDevices.length / itemsPerPage))}
              onPageChange={setDevicePage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default MasterDataPanel;
