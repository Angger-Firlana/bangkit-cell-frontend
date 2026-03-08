import type { ServiceJob } from '../types/serviceJob';
import { formatCurrency, formatDateTime } from './format';

export type BluetoothPrinterConnection = {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  characteristic: BluetoothRemoteGATTCharacteristic;
};

const DEFAULT_SERVICE_UUIDS: BluetoothServiceUUID[] = [
  0xFFE0,
  0xFF00,
  0x18F0,
  0xFFF0,
];

const DEFAULT_CHARACTERISTIC_UUIDS: BluetoothCharacteristicUUID[] = [
  0xFFE1,
  0xFF02,
  0xFF01,
  0xFFF1,
];

const encoder = new TextEncoder();

const chunkSize = 20;

const findWritableCharacteristic = async (
  services: BluetoothRemoteGATTService[]
): Promise<BluetoothRemoteGATTCharacteristic | null> => {
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
  services: BluetoothRemoteGATTService[]
): Promise<BluetoothRemoteGATTCharacteristic | null> => {
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
  if (!navigator.bluetooth) {
    throw new Error('Browser tidak mendukung Web Bluetooth. Gunakan Chrome/Edge di desktop.');
  }

  const device = await navigator.bluetooth.requestDevice({
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

  return { device, server, characteristic: writableCharacteristic };
};

const writeChunk = async (
  characteristic: BluetoothRemoteGATTCharacteristic,
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
