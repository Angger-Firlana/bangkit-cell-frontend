import type { Device, Status } from './serviceJob';

export interface ListingPhone {
  id: number;
  device_id: number;
  purchased_price: number;
  price: number;
  condition: string;
  serial_number: string;
  sold_at?: string | null;
  status_id: number;
  created_at?: string;
  updated_at?: string;
  device?: Device;
  status?: Status;
}

export interface CreateListingPhoneRequest {
  device_id: number;
  purchased_price: number;
  price: number;
  condition: string;
  serial_number: string;
}
