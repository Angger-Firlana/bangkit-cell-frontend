export interface Product {
  id: number;
  name: string;
  type: string;
  cost_price: number;
  sell_price: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface InventoryItem {
  id: number;
  product_id: number;
  current_stock: number;
  reserved_stock?: number;
  product: Product;
}

export interface StockAdjustmentRequest {
  product_id: number;
  type: 'IN' | 'OUT';
  qty: number;
  notes?: string;
  shop_id?: number;
}
