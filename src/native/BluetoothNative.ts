import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export type BluetoothConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface BondedBluetoothDevice {
  name: string | null;
  address: string;
}

export interface ConnectionStateEvent {
  state: BluetoothConnectionState;
  message?: string;
  address?: string;
}

export interface BluetoothConnectOptions {
  address: string;
  uuid?: string;
  insecure?: boolean;
}

export interface BluetoothWriteOptions {
  data: string;
  encoding?: 'utf8' | 'base64';
}

export interface BluetoothNativePlugin {
  isSupported(): Promise<{ supported: boolean }>;
  isEnabled(): Promise<{ enabled: boolean }>;
  requestEnable(): Promise<{ enabled: boolean }>;
  openAppSettings(): Promise<{ opened: boolean }>;
  requestPermissions(): Promise<{ granted: boolean }>;
  listBondedDevices(): Promise<{ devices: BondedBluetoothDevice[] }>;
  getConnection(): Promise<{ connected: boolean; address: string | null }>;
  connect(options: BluetoothConnectOptions): Promise<{ connected: boolean; address: string }>;
  disconnect(): Promise<{ disconnected: boolean }>;
  write(options: BluetoothWriteOptions): Promise<{ bytesWritten: number }>;
  addListener(
    eventName: 'connectionState',
    listenerFunc: (event: ConnectionStateEvent) => void
  ): Promise<PluginListenerHandle>;
}

export const BluetoothNative = registerPlugin<BluetoothNativePlugin>('BluetoothNative');
