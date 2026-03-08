import { useCallback, useEffect, useMemo, useState } from 'react';
import inventoryService from '../services/inventory.service';
import posService from '../services/pos.service';
import paymentMethodService from '../services/paymentMethod.service';
import type { InventoryItem } from '../types/inventory';
import type { CreateTransactionRequest, PaymentMethod } from '../types/pos';

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
  available: number;
}

export const usePOS = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getInventory({ per_page: 200 });
      setInventory(response.data?.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat produk.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await paymentMethodService.getAll();
      setPaymentMethods(response.data || []);
    } catch (err) {
      setPaymentMethods([]);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchPaymentMethods();
  }, [fetchInventory, fetchPaymentMethods]);

  const products = useMemo(() => {
    return inventory.map((item) => ({
      id: item.product_id,
      name: item.product?.name ?? 'Produk',
      price: Number(item.product?.sell_price ?? 0),
      stock: item.current_stock ?? 0,
      type: item.product?.type ?? '-',
    }));
  }, [inventory]);

  const addToCart = useCallback((productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === productId);
      if (existing) {
        return prev.map((item) =>
          item.product_id === productId
            ? { ...item, qty: Math.min(item.qty + 1, product.stock) }
            : item
        );
      }
      return [
        ...prev,
        { product_id: productId, name: product.name, price: product.price, qty: 1, available: product.stock },
      ];
    });
  }, [products]);

  const updateQty = useCallback((productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id !== productId) return item;
          const nextQty = Math.max(1, Math.min(item.qty + delta, item.available));
          return { ...item, qty: nextQty };
        })
        .filter((item) => item.qty > 0)
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cart]
  );

  const checkout = useCallback(async (payload: Omit<CreateTransactionRequest, 'items'>) => {
    const items = cart.map((item) => ({
      product_id: item.product_id,
      qty: item.qty,
      price: item.price,
    }));
    const response = await posService.checkout({
      ...payload,
      items,
    });
    clearCart();
    await fetchInventory();
    return response;
  }, [cart, clearCart, fetchInventory]);

  return {
    products,
    cart,
    paymentMethods,
    total,
    isLoading,
    error,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    checkout,
  };
};
