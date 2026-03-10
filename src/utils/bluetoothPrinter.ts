import type { ServiceJob } from '../types/serviceJob';
import { formatCurrency, formatDateTime } from './format';
import type { Transaction } from '../types/pos';  
import { Capacitor } from '@capacitor/core';
import { BluetoothNative } from '../native/BluetoothNative';

export type BluetoothPrinterConnection = {
  mode: 'web';
  device: any;
  server: any;
  characteristic: any;
} | {
  mode: 'native';
  address: string;
};

const isNativeAndroid = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

const getPersistedSelectedAddress = (): string | null => {
  try {
    const raw = localStorage.getItem('bangkit-cell-bluetooth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { selectedAddress?: string | null } };
    return parsed?.state?.selectedAddress ?? null;
  } catch {
    return null;
  }
};

const DEFAULT_SERVICE_UUIDS: any[] = [
  0xFFE0,
  0xFF00,
  0x18F0,
  0xFFF0,
];

const DEFAULT_CHARACTERISTIC_UUIDS: any[] = [
  0xFFE1,
  0xFF02,
  0xFF01,
  0xFFF1,
];

const encoder = new TextEncoder();

const chunkSize = 20;

const findWritableCharacteristic = async (
  services: any[]
): Promise<any | null> => {
  for (const service of services) {
    const characteristics = await service.getCharacteristics();
    for (const characteristic of characteristics) {
      if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
        return characteristic;
      }
    }
  }
  return null;
};

const findCharacteristicByUuid = async (
  services: any[]
): Promise<any | null> => {
  for (const service of services) {
    for (const uuid of DEFAULT_CHARACTERISTIC_UUIDS) {
      try {
        const characteristic = await service.getCharacteristic(uuid);
        if (characteristic) {
          return characteristic;
        }
      } catch (error) {
        continue;
      }
    }
  }
  return null;
};

export const connectBluetoothPrinter = async (): Promise<BluetoothPrinterConnection> => {
  if (isNativeAndroid()) {
    const supportedRes = await BluetoothNative.isSupported();
    if (!supportedRes.supported) {
      throw new Error('Device tidak mendukung Bluetooth.');
    }

    const permRes = await BluetoothNative.requestPermissions();
    if (!permRes.granted) {
      throw new Error('Izin Bluetooth ditolak. Buka Pengaturan aplikasi dan izinkan Nearby devices/Bluetooth.');
    }

    const enabledRes = await BluetoothNative.isEnabled();
    if (!enabledRes.enabled) {
      const enableAttempt = await BluetoothNative.requestEnable();
      if (!enableAttempt.enabled) {
        throw new Error('Bluetooth belum aktif.');
      }
    }

    const existing = await BluetoothNative.getConnection();
    if (existing.connected && existing.address) {
      return { mode: 'native', address: existing.address };
    }

    const address = getPersistedSelectedAddress();
    if (!address) {
      throw new Error('Pilih device Bluetooth di Pengaturan > Bluetooth (Native Android), lalu Connect dulu.');
    }

    await BluetoothNative.connect({ address });
    return { mode: 'native', address };
  }

  if (!(navigator as any).bluetooth) {
    throw new Error('Browser tidak mendukung Web Bluetooth. Gunakan Chrome/Edge (Android atau desktop).');
  }
  if (!window.isSecureContext) {
    throw new Error('Web Bluetooth butuh HTTPS (kecuali localhost). Pastikan aplikasi di-host via HTTPS.');
  }

  const device = await (navigator as any).bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: DEFAULT_SERVICE_UUIDS,
  });

  const server = await device.gatt?.connect();
  if (!server) {
    throw new Error('Gagal menyambungkan ke printer.');
  }

  const services = await server.getPrimaryServices();
  const writableCharacteristic =
    (await findWritableCharacteristic(services)) || (await findCharacteristicByUuid(services));

  if (!writableCharacteristic) {
    throw new Error('Karakteristik printer tidak ditemukan. Pastikan printer dalam mode BLE.');
  }

  return { mode: 'web', device, server, characteristic: writableCharacteristic };
};

const writeChunk = async (
  characteristic: any,
  chunk: Uint8Array
) => {
  if (characteristic.properties.writeWithoutResponse) {
    await characteristic.writeValueWithoutResponse(chunk);
    return;
  }
  await characteristic.writeValue(chunk);
};

export const printBluetoothText = async (
  connection: BluetoothPrinterConnection,
  text: string
) => {
  if (connection.mode === 'native') {
    await BluetoothNative.write({ data: text, encoding: 'utf8' });
    return;
  }

  const data = encoder.encode(text);
  for (let offset = 0; offset < data.length; offset += chunkSize) {
    const chunk = data.slice(offset, offset + chunkSize);
    await writeChunk(connection.characteristic, chunk);
  }
};

export const buildServiceReceipt = (service: ServiceJob, shopName = 'Bangkit Cell') => {
  const esc = '\x1B';
  const gs = '\x1D';
  const init = `${esc}@`;
  const cut = `${gs}V\x00`;

  const statusLabel = service.status?.name ?? service.status?.code ?? '-';
  const jobId = `JOB-${service.id}`;
  const createdAt = formatDateTime(service.created_at);
  const customerName = service.customer?.full_name ?? '-';
  const customerPhone = service.customer?.phone_number ?? '-';
  const deviceName = service.device?.name ?? '-';
  const problem = service.problem_description ?? '-';
  const serviceFee =
    service.service_fee !== undefined && service.service_fee !== null
      ? formatCurrency(service.service_fee)
      : '-';
  const estimatedFee =
    service.estimated_fee !== undefined && service.estimated_fee !== null
      ? formatCurrency(service.estimated_fee)
      : '-';
  const transactionTotal =
    service.transaction?.grand_total !== undefined && service.transaction?.grand_total !== null
      ? formatCurrency(service.transaction.grand_total)
      : '-';

  const lines = [
    shopName,
    '==============================',
    `ID: ${jobId}`,
    `Tanggal: ${createdAt}`,
    `Status: ${statusLabel}`,
    '------------------------------',
    `Pelanggan: ${customerName}`,
    `HP: ${customerPhone}`,
    `Perangkat: ${deviceName}`,
    '------------------------------',
    'Keluhan:',
    problem,
    '------------------------------',
    `Estimasi: ${estimatedFee}`,
    `Biaya Service: ${serviceFee}`,
    `Total Transaksi: ${transactionTotal}`,
    '==============================',
    'Terima kasih.',
  ];

  return `${init}${lines.join('\n')}\n\n\n${cut}`;
};

export const buildTransactionReceipt = (transaction: Transaction, shopName = 'Bangkit Cell') => {
  const esc = '\x1B';
  const gs = '\x1D';
  const init = `${esc}@`;
  const cut = `${gs}V\x00`;

  const trxId = `TRX-${transaction.id}`;
  const trxDate = formatDateTime(transaction.transaction_date);
  const customerName = transaction.customer?.full_name ?? '-';
  const paymentMethod = transaction.payment_method?.name ?? '-';
  const lines = [
    shopName,
    '==============================',
    `ID: ${trxId}`,
    `Tanggal: ${trxDate}`,
    '------------------------------',
    `Pelanggan: ${customerName}`,
    `Metode: ${paymentMethod}`,
    '------------------------------',
    'Item:',
  ];

  (transaction.transaction_details ?? []).forEach((detail) => {
    const name = detail.item?.name ?? 'Produk';
    lines.push(`${name}`);
    lines.push(`  x${detail.qty} = ${formatCurrency(Number(detail.total_price))}`);
  });

  lines.push('------------------------------');
  lines.push(`Total: ${formatCurrency(Number(transaction.grand_total))}`);
  lines.push(`Bayar: ${formatCurrency(Number(transaction.paid_amount))}`);
  lines.push(`Kembali: ${formatCurrency(Number(transaction.change_amount))}`);
  lines.push('==============================');
  lines.push('Terima kasih.');

  return `${init}${lines.join('\n')}\n\n\n${cut}`;
};
