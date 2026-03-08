import { useCallback, useEffect, useState } from 'react';
import serviceJobService from '../services/serviceJob.service';
import catalogService from '../services/catalog.service';
import type { CreateServiceJobRequest, Device, ServiceJob, Status } from '../types/serviceJob';
import type { Paginated } from '../types/common';

interface ServiceJobState {
  items: ServiceJob[];
  pagination: Paginated<ServiceJob> | null;
  isLoading: boolean;
  error: string | null;
}

export const useServiceJobs = () => {
  const [state, setState] = useState<ServiceJobState>({
    items: [],
    pagination: null,
    isLoading: true,
    error: null,
  });
  const [devices, setDevices] = useState<Device[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [filters, setFilters] = useState({
    status_code: '',
    customer_query: '',
    page: 1,
    per_page: 20,
  });

  const normalizeList = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && typeof payload === 'object') {
      const nested = (payload as { data?: unknown }).data;
      if (Array.isArray(nested)) {
        return nested;
      }
    }
    return [];
  };

  const fetchServiceJobs = useCallback(async (nextFilters = filters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await serviceJobService.getAll({
        status_code: nextFilters.status_code || undefined,
        customer_query: nextFilters.customer_query || undefined,
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
        error: error?.response?.data?.message || 'Gagal memuat data service.',
      });
    }
  }, [filters]);

  const fetchCatalogs = useCallback(async () => {
    try {
      const [devicesResponse, statusesResponse] = await Promise.all([
        catalogService.getDevices(),
        catalogService.getServiceStatuses(),
      ]);
      setDevices(normalizeList<Device>(devicesResponse?.data ?? devicesResponse));
      setStatuses(normalizeList<Status>(statusesResponse?.data ?? statusesResponse));
    } catch (error) {
      setDevices([]);
      setStatuses([]);
    }
  }, []);

  const createServiceJob = useCallback(async (payload: CreateServiceJobRequest) => {
    const response = await serviceJobService.create(payload);
    await fetchServiceJobs();
    return response;
  }, [fetchServiceJobs]);

  const updateFilters = useCallback((next: Partial<typeof filters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...next, page: next.page ?? 1 };
      fetchServiceJobs(updated);
      return updated;
    });
  }, [fetchServiceJobs]);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => {
      const updated = { ...prev, page };
      fetchServiceJobs(updated);
      return updated;
    });
  }, [fetchServiceJobs]);

  useEffect(() => {
    fetchServiceJobs();
    fetchCatalogs();
  }, [fetchServiceJobs, fetchCatalogs]);

  return {
    serviceJobs: state.items,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    devices,
    statuses,
    filters,
    refresh: fetchServiceJobs,
    refreshCatalogs: fetchCatalogs,
    createServiceJob,
    updateFilters,
    setPage,
  };
};
