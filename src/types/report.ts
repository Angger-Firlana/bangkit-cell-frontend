export interface ReportPeriod {
  from: string;
  to: string;
}

export interface SalesReport {
  period: ReportPeriod;
  transactions: {
    count: number;
    revenue: number;
  };
  products: {
    items_sold: number;
    revenue: number;
    estimated_cost: number;
    estimated_profit: number;
  };
}

export interface ServiceReport {
  period: ReportPeriod;
  total_jobs: number;
  by_status: Record<string, number>;
  revenue: {
    service_fee: number;
    service_fee_items: number;
    total: number;
  };
}

export interface InventoryReport {
  period: ReportPeriod;
  low_stock_threshold: number;
  low_stock_items: any[];
  movements: Record<string, { count: number; qty: number }>;
}

export interface DashboardStats {
  service_in_count: number;
  service_completed_count: number;
  low_stock_count: number;
  today_revenue: number;
}
