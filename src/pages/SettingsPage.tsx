import { Plus, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import catalogService from '../services/catalog.service';
import type { Device } from '../types/serviceJob';
import type { DeviceBrand, DeviceModel } from '../types/deviceCatalog';

const SettingsPage = () => {
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [masterError, setMasterError] = useState('');
  const [isMasterLoading, setIsMasterLoading] = useState(false);

  const [brandName, setBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelBrandQuery, setModelBrandQuery] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceBrandQuery, setDeviceBrandQuery] = useState('');
  const [deviceModelQuery, setDeviceModelQuery] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [editingBrandName, setEditingBrandName] = useState('');
  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [editingModelName, setEditingModelName] = useState('');
  const [editingModelBrandQuery, setEditingModelBrandQuery] = useState('');
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [editingDeviceName, setEditingDeviceName] = useState('');
  const [editingDeviceBrandQuery, setEditingDeviceBrandQuery] = useState('');
  const [editingDeviceModelQuery, setEditingDeviceModelQuery] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [deviceSearch, setDeviceSearch] = useState('');

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
    const map = new Map<number, { modelCount: number; deviceCount: number }>();
    brands.forEach((brand) => map.set(brand.id, { modelCount: 0, deviceCount: 0 }));
    models.forEach((model) => {
      const entry = map.get(model.brand_id) ?? { modelCount: 0, deviceCount: 0 };
      entry.modelCount += 1;
      map.set(model.brand_id, entry);
    });
    devices.forEach((device) => {
      const entry = map.get(device.brand_id) ?? { modelCount: 0, deviceCount: 0 };
      entry.deviceCount += 1;
      map.set(device.brand_id, entry);
    });
    return map;
  }, [brands, models, devices]);

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
    if (!query) return brands;
    return brands.filter((brand) => brand.name.toLowerCase().includes(query));
  }, [brands, brandSearch]);

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    if (!query) return models;
    return models.filter((model) => {
      const brandName = brandMap.get(model.brand_id) ?? '';
      return model.name.toLowerCase().includes(query) || brandName.toLowerCase().includes(query);
    });
  }, [models, modelSearch, brandMap]);

  const filteredDevices = useMemo(() => {
    const query = deviceSearch.trim().toLowerCase();
    if (!query) return devices;
    return devices.filter((device) => {
      const brandName = brandMap.get(device.brand_id) ?? '';
      const modelName = modelMap.get(device.level_device_id)?.name ?? '';
      return (
        device.name.toLowerCase().includes(query) ||
        brandName.toLowerCase().includes(query) ||
        modelName.toLowerCase().includes(query)
      );
    });
  }, [devices, deviceSearch, brandMap, modelMap]);

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
    const brand = resolveByName(brands, modelBrandQuery);
    if (!brand) {
      setMasterError('Brand tidak ditemukan. Ketik brand yang sudah ada.');
      return;
    }
    setMasterError('');
    try {
      await catalogService.createDeviceModel({ name, brand_id: brand.id });
      setModelName('');
      setModelBrandQuery('');
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
    if ((usage?.modelCount ?? 0) > 0 || (usage?.deviceCount ?? 0) > 0) {
      setMasterError('Brand tidak bisa dihapus karena masih dipakai oleh model atau device.');
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
    const brandName = brandMap.get(model.brand_id) ?? '';
    setEditingModelBrandQuery(brandName);
  };

  const handleUpdateModel = async () => {
    if (editingModelId === null) return;
    const name = editingModelName.trim();
    if (!name) {
      setMasterError('Nama model wajib diisi.');
      return;
    }
    const brand = resolveByName(brands, editingModelBrandQuery);
    if (!brand) {
      setMasterError('Brand tidak ditemukan. Ketik brand yang sudah ada.');
      return;
    }
    setMasterError('');
    try {
      await catalogService.updateDeviceModel(editingModelId, { name, brand_id: brand.id });
      setEditingModelId(null);
      setEditingModelName('');
      setEditingModelBrandQuery('');
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

        <Card
          title="Master Data"
          subtitle="Brand, model, dan device."
        >
          {masterError && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl">
              {masterError}
            </div>
          )}
          {isMasterLoading && (
            <div className="mb-4 text-xs font-semibold text-slate-400">Memuat master data...</div>
          )}

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Brand</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Nama brand"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleCreateBrand}
                  aria-label="Tambah brand"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Cari brand..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />
              <div className="space-y-2">
                {filteredBrands.length === 0 && (
                  <span className="text-xs text-slate-400">Belum ada brand.</span>
                )}
                {filteredBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    {editingBrandId === brand.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editingBrandName}
                          onChange={(e) => setEditingBrandName(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={handleUpdateBrand}>
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingBrandId(null);
                              setEditingBrandName('');
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{brand.name}</p>
                          <p className="text-[10px] font-medium text-slate-400">
                            ID {brand.id} · {brandUsage.get(brand.id)?.modelCount ?? 0} model · {brandUsage.get(brand.id)?.deviceCount ?? 0} device
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditBrand(brand)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteBrand(brand)}
                            disabled={(brandUsage.get(brand.id)?.modelCount ?? 0) > 0 || (brandUsage.get(brand.id)?.deviceCount ?? 0) > 0}
                          >
                            Hapus
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Model</p>
              <Input
                placeholder="Nama model"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
              <Input
                placeholder="Brand model (ketik brand yang sudah ada)"
                value={modelBrandQuery}
                onChange={(e) => setModelBrandQuery(e.target.value)}
                list="brand-options"
              />
              <datalist id="brand-options">
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name} />
                ))}
              </datalist>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCreateModel}
                className="w-full"
              >
                Tambah Model
              </Button>
              <Input
                placeholder="Cari model atau brand..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
              />
              <div className="space-y-2">
                {filteredModels.length === 0 && (
                  <span className="text-xs text-slate-400">Belum ada model.</span>
                )}
                {filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    {editingModelId === model.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editingModelName}
                          onChange={(e) => setEditingModelName(e.target.value)}
                        />
                        <Input
                          value={editingModelBrandQuery}
                          onChange={(e) => setEditingModelBrandQuery(e.target.value)}
                          list="brand-options"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={handleUpdateModel}>
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingModelId(null);
                              setEditingModelName('');
                              setEditingModelBrandQuery('');
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{model.name}</p>
                          <p className="text-[10px] font-medium text-slate-400">
                            {brandMap.get(model.brand_id) ?? 'Unknown'} · ID {model.id} · Dipakai {modelUsage.get(model.id) ?? 0}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditModel(model)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteModel(model)}
                            disabled={(modelUsage.get(model.id) ?? 0) > 0}
                          >
                            Hapus
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Device</p>
              <Input
                placeholder="Nama device"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
              <Input
                placeholder="Brand device"
                value={deviceBrandQuery}
                onChange={(e) => setDeviceBrandQuery(e.target.value)}
                list="brand-options"
              />
              <Input
                placeholder="Model device"
                value={deviceModelQuery}
                onChange={(e) => setDeviceModelQuery(e.target.value)}
                list="model-options"
              />
              <datalist id="model-options">
                {models.map((model) => (
                  <option key={model.id} value={model.name} />
                ))}
              </datalist>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCreateDevice}
                className="w-full"
              >
                Tambah Device
              </Button>
              <Input
                placeholder="Cari device, brand, atau model..."
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
              />
              <div className="space-y-2">
                {filteredDevices.length === 0 && (
                  <span className="text-xs text-slate-400">Belum ada device.</span>
                )}
                {filteredDevices.map((device) => {
                  const model = modelMap.get(device.level_device_id ?? 0);
                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      {editingDeviceId === device.id ? (
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editingDeviceName}
                            onChange={(e) => setEditingDeviceName(e.target.value)}
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
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={handleUpdateDevice}>
                              Simpan
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingDeviceId(null);
                                setEditingDeviceName('');
                                setEditingDeviceBrandQuery('');
                                setEditingDeviceModelQuery('');
                              }}
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{device.name}</p>
                            <p className="text-[10px] font-medium text-slate-400">
                              {brandMap.get(device.brand_id) ?? 'Unknown'} · {model?.name ?? 'Unknown'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400">ID {device.id}</span>
                            <Button size="sm" variant="outline" onClick={() => handleEditDevice(device)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteDevice(device)}>
                              Hapus
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
