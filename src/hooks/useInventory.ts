import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../services/inventory.service';
import type { InventoryItem, StockAdjustmentRequest } from '../types/inventory';
import type { Paginated } from '../types/common';

interface InventoryState {
  items: InventoryItem[];
  pagination: Paginated<InventoryItem> | null;
  isLoading: boolean;
  error: string | null;
}

export const useInventory = () => {
  const [state, setState] = useState<InventoryState>({
    items: [],
    pagination: null,
    isLoading: true,
    error: null,
  });
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
  });

  const fetchInventory = useCallback(async (nextFilters = filters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await inventoryService.getInventory({
        page: nextFilters.page,
        per_page: nextFilters.per_page,
      });
      const payload = response.data;
      const items = payload?.data ?? [];
      setState({ items, pagination: payload ?? null, isLoading: false, error: null });
    } catch (error: any) {
      setState({
        items: [],
        pagination: null,
        isLoading: false,
        error: error?.response?.data?.message || 'Gagal memuat data inventaris.',
      });
    }
  }, [filters]);

  const adjustStock = useCallback(async (payload: StockAdjustmentRequest) => {
    const response = await inventoryService.adjustStock(payload);
    await fetchInventory();
    return response;
  }, [fetchInventory]);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => {
      const updated = { ...prev, page };
      fetchInventory(updated);
      return updated;
    });
  }, [fetchInventory]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory: state.items,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchInventory,
    adjustStock,
    setPage,
  };
};
