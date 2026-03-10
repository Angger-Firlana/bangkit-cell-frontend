import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Capacitor } from '@capacitor/core';
import { BluetoothNative, type BondedBluetoothDevice, type ConnectionStateEvent } from '../native/BluetoothNative';

const isNativeAndroid = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

export interface BluetoothState {
  isNativeAndroid: boolean;
  supported: boolean;
  enabled: boolean;
  permissionGranted: boolean;
  devices: BondedBluetoothDevice[];
  selectedAddress: string | null;
  connecting: boolean;
  connected: boolean;
  connectedAddress: string | null;
  lastError: string | null;
  initialized: boolean;

  init: () => Promise<void>;
  selectDevice: (address: string | null) => void;
  requestEnable: () => Promise<void>;
  openAppSettings: () => Promise<void>;
  refreshBondedDevices: () => Promise<void>;
  connectSelected: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useBluetoothStore = create<BluetoothState>()(
  persist(
    (set, get) => ({
      isNativeAndroid: isNativeAndroid(),
      supported: false,
      enabled: false,
      permissionGranted: false,
      devices: [],
      selectedAddress: null,
      connecting: false,
      connected: false,
      connectedAddress: null,
      lastError: null,
      initialized: false,

      init: async () => {
        if (get().initialized) return;

        const nativeAndroid = isNativeAndroid();
        set({ isNativeAndroid: nativeAndroid, initialized: true });
        if (!nativeAndroid) return;

        try {
          const supportedRes = await BluetoothNative.isSupported();
          set({ supported: supportedRes.supported });
          if (!supportedRes.supported) return;

          const enabledRes = await BluetoothNative.isEnabled();
          set({ enabled: enabledRes.enabled });

          const connectionRes = await BluetoothNative.getConnection();
          set({
            connected: connectionRes.connected,
            connectedAddress: connectionRes.address,
            selectedAddress: connectionRes.address ?? get().selectedAddress,
          });

          await BluetoothNative.addListener('connectionState', (event: ConnectionStateEvent) => {
            if (event.state === 'connecting') {
              set({ connecting: true, lastError: null, connectedAddress: event.address ?? get().connectedAddress });
              return;
            }
            if (event.state === 'connected') {
              set({
                connecting: false,
                connected: true,
                connectedAddress: event.address ?? get().connectedAddress,
                selectedAddress: event.address ?? get().selectedAddress,
                lastError: null,
              });
              return;
            }
            if (event.state === 'disconnected') {
              set({ connecting: false, connected: false, connectedAddress: null });
              return;
            }
            if (event.state === 'error') {
              set({ connecting: false, connected: false, connectedAddress: null, lastError: event.message ?? 'Bluetooth error' });
            }
          });
        } catch (e) {
          set({ lastError: e instanceof Error ? e.message : String(e) });
        }
      },

      selectDevice: (address) => set({ selectedAddress: address }),

      requestEnable: async () => {
        if (!isNativeAndroid()) return;
        set({ lastError: null });
        try {
          const res = await BluetoothNative.requestEnable();
          set({ enabled: res.enabled });
        } catch (e) {
          set({ lastError: e instanceof Error ? e.message : String(e) });
        }
      },

      openAppSettings: async () => {
        if (!isNativeAndroid()) return;
        try {
          await BluetoothNative.openAppSettings();
        } catch (e) {
          set({ lastError: e instanceof Error ? e.message : String(e) });
        }
      },

      refreshBondedDevices: async () => {
        if (!isNativeAndroid()) return;
        set({ lastError: null });
        try {
          const permRes = await BluetoothNative.requestPermissions();
          set({ permissionGranted: permRes.granted });
          if (!permRes.granted) return;

          const res = await BluetoothNative.listBondedDevices();
          const devices = res.devices ?? [];
          set({ devices });
          if (!get().selectedAddress && devices.length > 0) {
            set({ selectedAddress: devices[0]?.address ?? null });
          }
        } catch (e) {
          set({ lastError: e instanceof Error ? e.message : String(e) });
        }
      },

      connectSelected: async () => {
        if (!isNativeAndroid()) return;
        const address = get().selectedAddress;
        if (!address) {
          set({ lastError: 'Pilih device Bluetooth dulu.' });
          return;
        }

        set({ lastError: null, connecting: true });
        try {
          const permRes = await BluetoothNative.requestPermissions();
          set({ permissionGranted: permRes.granted });
          if (!permRes.granted) {
            set({ connecting: false });
            return;
          }

          const enabledRes = await BluetoothNative.isEnabled();
          set({ enabled: enabledRes.enabled });
          if (!enabledRes.enabled) {
            set({ connecting: false, lastError: 'Bluetooth belum aktif.' });
            return;
          }

          await BluetoothNative.connect({ address });
        } catch (e) {
          set({ connecting: false, lastError: e instanceof Error ? e.message : String(e) });
        }
      },

      disconnect: async () => {
        if (!isNativeAndroid()) return;
        set({ lastError: null });
        try {
          await BluetoothNative.disconnect();
          set({ connected: false, connecting: false, connectedAddress: null });
        } catch (e) {
          set({ lastError: e instanceof Error ? e.message : String(e) });
        }
      },
    }),
    {
      name: 'bangkit-cell-bluetooth',
      partialize: (state) => ({ selectedAddress: state.selectedAddress }),
    }
  )
);
