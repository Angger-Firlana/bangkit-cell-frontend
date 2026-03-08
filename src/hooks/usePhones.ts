import { useCallback, useEffect, useState } from 'react';
import catalogService from '../services/catalog.service';
import phoneService from '../services/phone.service';
import type { Paginated } from '../types/common';
import type { Device, Status } from '../types/serviceJob';
import type { CreateListingPhoneRequest, ListingPhone } from '../types/phone';

interface PhoneState {
  items: ListingPhone[];
  pagination: Paginated<ListingPhone> | null;
  isLoading: boolean;
  error: string | null;
}

export const usePhones = () => {
  const [state, setState] = useState<PhoneState>({
    items: [],
    pagination: null,
    isLoading: true,
    error: null,
  });
  const [devices, setDevices] = useState<Device[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [filters, setFilters] = useState({
    status_code: '',
    search: '',
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

  const fetchPhones = useCallback(async (nextFilters = filters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await phoneService.getListings({
        status_code: nextFilters.status_code || undefined,
        search: nextFilters.search || undefined,
        page: nextFilters.page,
        per_page: nextFilters.per_page,
      });
      const payload = response.data;
      setState({
        items: payload?.data ?? [],
        pagination: payload ?? null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        items: [],
        pagination: null,
        isLoading: false,
        error: error?.response?.data?.message || 'Gagal memuat data HP second.',
      });
    }
  }, [filters]);

  const fetchCatalogs = useCallback(async () => {
    try {
      const [devicesResponse, statusesResponse] = await Promise.all([
        catalogService.getDevices(),
        catalogService.getPhoneStatuses(),
      ]);
      setDevices(normalizeList<Device>(devicesResponse?.data ?? devicesResponse));
      setStatuses(normalizeList<Status>(statusesResponse?.data ?? statusesResponse));
    } catch (error) {
      setDevices([]);
      setStatuses([]);
    }
  }, []);

  const createListing = useCallback(async (payload: CreateListingPhoneRequest) => {
    const response = await phoneService.createListing(payload);
    await fetchPhones();
    return response;
  }, [fetchPhones]);

  const updateFilters = useCallback((next: Partial<typeof filters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...next, page: next.page ?? 1 };
      fetchPhones(updated);
      return updated;
    });
  }, [fetchPhones]);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => {
      const updated = { ...prev, page };
      fetchPhones(updated);
      return updated;
    });
  }, [fetchPhones]);

  useEffect(() => {
    fetchPhones();
    fetchCatalogs();
  }, [fetchPhones, fetchCatalogs]);

  return {
    listings: state.items,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    devices,
    statuses,
    filters,
    refresh: fetchPhones,
    createListing,
    updateFilters,
    setPage,
  };
};
