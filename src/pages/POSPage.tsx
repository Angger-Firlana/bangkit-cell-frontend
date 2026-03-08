import { useMemo, useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, CreditCard } from 'lucide-react';
import { usePOS } from '../hooks/usePOS';
import { formatCurrency } from '../utils/format';
import EmptyState from '../components/common/EmptyState';

const POSPage = () => {
  const { products, cart, paymentMethods, total, isLoading, error, addToCart, updateQty, checkout } = usePOS();
  const [query, setQuery] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (paymentMethods.length > 0 && paymentMethodId === null) {
      setPaymentMethodId(paymentMethods[0].id);
    }
  }, [paymentMethods, paymentMethodId]);

  const filteredProducts = useMemo(() => {
    if (!query) return products;
    const lower = query.toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(lower));
  }, [products, query]);

  const handleCheckout = async () => {
    if (cart.length === 0 || paymentMethodId === null) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await checkout({
        payment_method_id: paymentMethodId,
        paid_amount: Number(paidAmount || total),
      });
      setPaidAmount('');
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Gagal memproses transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm font-semibold text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-28 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Produk Kosong"
              message="Tambahkan produk di backend agar bisa dijual lewat POS."
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product.id)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors bg-gray-50 hover:bg-white flex flex-col justify-between text-left"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Stok: {product.stock}</p>
                </div>
                <p className="text-blue-600 font-bold mt-3">{formatCurrency(product.price)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
          <h2 className="font-bold text-gray-800 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
            Keranjang
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{cart.length} Item</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map((item) => (
            <div key={item.product_id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                <p className="text-blue-600 font-bold text-sm mt-1">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-1 bg-gray-100 rounded hover:bg-gray-200" onClick={() => updateQty(item.product_id, -1)}>
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="font-semibold text-gray-800 w-6 text-center">{item.qty}</span>
                <button className="p-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => updateQty(item.product_id, 1)}>
                  <Plus className="h-4 w-4 text-blue-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl space-y-4">
          {submitError && (
            <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
              {submitError}
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Metode Pembayaran</label>
            <select
              value={paymentMethodId ?? ''}
              onChange={(e) => setPaymentMethodId(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {paymentMethods.length === 0 && <option value="">Tidak ada metode</option>}
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>{method.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Nominal Dibayar</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder={formatCurrency(total)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-2xl font-bold text-blue-900">{formatCurrency(total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting || paymentMethodId === null}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center disabled:opacity-70"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
