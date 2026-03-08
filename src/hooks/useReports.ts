import { useCallback, useEffect, useMemo, useState } from 'react';
import reportService from '../services/report.service';
import type { DashboardStats, InventoryReport, SalesReport, ServiceReport } from '../types/report';

interface ReportsState {
  sales: SalesReport | null;
  service: ServiceReport | null;
  inventory: InventoryReport | null;
  isLoading: boolean;
  error: string | null;
}

export const useReports = () => {
  const [state, setState] = useState<ReportsState>({
    sales: null,
    service: null,
    inventory: null,
    isLoading: true,
    error: null,
  });

  const fetchReports = useCallback(async (params?: Record<string, any>) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const [sales, service, inventory] = await Promise.all([
        reportService.getSalesReport(params),
        reportService.getServiceReport(params),
        reportService.getInventoryReport(params),
      ]);
      setState({
        sales: sales.data,
        service: service.data,
        inventory: inventory.data,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        sales: null,
        service: null,
        inventory: null,
        isLoading: false,
        error: error?.response?.data?.message || 'Gagal memuat laporan.',
      });
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const dashboardStats: DashboardStats | null = useMemo(() => {
    if (!state.sales || !state.service || !state.inventory) return null;
    const serviceInCount = state.service.by_status?.service_job_new ?? 0;
    const serviceCompleted = state.service.by_status?.service_job_done ?? 0;
    const lowStockCount = state.inventory.low_stock_items?.length ?? 0;
    const todayRevenue = state.sales.transactions?.revenue ?? 0;

    return {
      service_in_count: serviceInCount,
      service_completed_count: serviceCompleted,
      low_stock_count: lowStockCount,
      today_revenue: todayRevenue,
    };
  }, [state.inventory, state.sales, state.service]);

  return {
    ...state,
    dashboardStats,
    refresh: fetchReports,
  };
};
