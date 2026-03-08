export interface ServiceJob {
  id: number;
  customer_id: number;
  device_id: number;
  status_id: number;
  transaction_id?: number | null;
  problem_description: string;
  service_fee?: number | null;
  shop_id?: number | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  device?: Device;
  status?: Status;
  transaction?: TransactionSummary;
}

export interface Customer {
  id: number;
  full_name: string;
  phone_number?: string | null;
  email?: string | null;
}

export interface Device {
  id: number;
  name: string;
  brand_id: number;
  level_device_id: number;
}

export interface Status {
  id: number;
  code: string;
  name: string;
}

export interface TransactionSummary {
  id: number;
  grand_total: number;
  paid_amount: number;
  change_amount: number;
}

export interface CreateServiceJobRequest {
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  device_id: number;
  problem_description: string;
  shop_id?: number;
}

export interface UpdateServiceStatusRequest {
  status_code: 'service_job_new' | 'service_job_progress' | 'service_job_done';
  auto_checkout?: boolean;
  payment_method_id?: number;
  paid_amount?: number;
  discount?: number;
  tax?: number;
  service_fee?: number;
}

export interface UpdateServiceStatusResponse {
  service_job: ServiceJob;
  transaction?: TransactionSummary;
}
