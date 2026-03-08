export interface ServiceJobFormState {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  device_query: string;
  device_brand_query: string;
  device_model_query: string;
  problem_description: string;
  estimated_fee: string;
}

export interface PartFormState {
  product_id: string;
  qty: string;
  price: string;
  notes: string;
}

export interface CheckoutFormState {
  payment_method_id: string;
  paid_amount: string;
  discount: string;
  tax: string;
  service_fee: string;
}
