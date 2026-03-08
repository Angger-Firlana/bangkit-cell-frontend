export interface Transaction {
  id: number;
  operator_id: number;
  customer_id?: number | null;
  transaction_date: string;
  sub_total: number;
  discount?: number | null;
  tax?: number | null;
  grand_total: number;
  paid_amount: number;
  change_amount: number;
  payment_method_id: number;
  status_id: number;
  shop_id?: number | null;
  transaction_details: TransactionDetail[];
  customer?: CustomerSummary | null;
  operator?: OperatorSummary | null;
  payment_method?: PaymentMethod;
  status?: StatusSummary;
}

export interface TransactionDetail {
  id: number;
  transaction_id: number;
  item_type: string;
  item_id: number;
  price: number;
  qty: number;
  total_price: number;
  item?: ProductSummary;
}

export interface CustomerSummary {
  id: number;
  full_name: string;
  phone_number?: string | null;
  email?: string | null;
}

export interface OperatorSummary {
  id: number;
  name: string;
  email: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  category: string;
}

export interface StatusSummary {
  id: number;
  code: string;
  name: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  type: string;
  cost_price: number;
  sell_price: number;
}

export interface CreateTransactionRequest {
  customer_id?: number;
  payment_method_id: number;
  paid_amount: number;
  discount?: number;
  tax?: number;
  shop_id?: number;
  items: TransactionItemRequest[];
}

export interface TransactionItemRequest {
  product_id: number;
  qty: number;
  price?: number;
}
