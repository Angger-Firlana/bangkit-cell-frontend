import { useMemo, useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Plus, Minus, CreditCard, X, ChevronUp, Printer } from 'lucide-react';
import { usePOS } from '../hooks/usePOS';
import { formatCurrency } from '../utils/format';
import EmptyState from '../components/common/EmptyState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import clsx from 'clsx';
import { Capacitor } from '@capacitor/core';
import BluetoothPrinterPickerModal from '../components/bluetooth/BluetoothPrinterPickerModal';
import {
  buildTransactionReceipt,
  connectBluetoothPrinter,
  printBluetoothText,
  type BluetoothPrinterConnection,
} from '../utils/bluetoothPrinter';
import type { Transaction } from '../types/pos';

const POSPage = () => {
  const nativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const { products, cart, paymentMethods, total, isLoading, error, addToCart, updateQty, checkout } = usePOS();
  const [query, setQuery] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [printerError, setPrinterError] = useState('');
  const [printerStatus, setPrinterStatus] = useState<'idle' | 'connecting' | 'connected' | 'printing'>('idle');
  const printerRef = useRef<BluetoothPrinterConnection | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isPrinterPickerOpen, setIsPrinterPickerOpen] = useState(false);
  const [pendingPrint, setPendingPrint] = useState(false);

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
      const response = await checkout({
        payment_method_id: paymentMethodId,
        paid_amount: Number(paidAmount || total),
      });
      setLastTransaction(response.data ?? null);
      setPaidAmount('');
      setIsCartOpen(false);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Gagal memproses transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const doPrintTerminal = async () => {
    if (!lastTransaction) {
      setPrinterError('Belum ada transaksi yang bisa dicetak.');
      return;
    }
    setPrinterError('');
    try {
      if (!printerRef.current) {
        setPrinterStatus('connecting');
        printerRef.current = await connectBluetoothPrinter();
        setPrinterStatus('connected');
      }
      setPrinterStatus('printing');
      const receipt = buildTransactionReceipt(lastTransaction);
      await printBluetoothText(printerRef.current, receipt);
      setPrinterStatus('connected');
    } catch (err: any) {
      setPrinterStatus('idle');
      setPrinterError(err?.message || 'Gagal mengirim data ke printer.');
    }
  };

  const handlePrintTerminal = async () => {
    if (nativeAndroid && !printerRef.current && printerStatus !== 'connected') {
      setPendingPrint(true);
      setIsPrinterPickerOpen(true);
      return;
    }
    await doPrintTerminal();
  };

  return (
    <div className="relative flex flex-col lg:flex-row h-full gap-6 pb-20 lg:pb-0 min-h-[calc(100vh-12rem)]">
      <BluetoothPrinterPickerModal
        isOpen={isPrinterPickerOpen}
        onClose={() => {
          setIsPrinterPickerOpen(false);
          setPendingPrint(false);
        }}
        onConnected={() => {
          if (!pendingPrint) return;
          setIsPrinterPickerOpen(false);
          setPendingPrint(false);
          doPrintTerminal();
        }}
      />
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm sm:text-base"
            />
          </div>
        </Card>

        {error && (
          <div className="mb-6 p-4 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl uppercase tracking-wider">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-32 bg-slate-100 rounded-2xl"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="Produk Tidak Ditemukan"
            message="Coba gunakan kata kunci pencarian yang berbeda."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product.id)}
                className="group border border-slate-100 rounded-2xl p-4 hover:border-primary/50 cursor-pointer transition-all bg-white hover:shadow-lg hover:shadow-slate-200/60 flex flex-col justify-between text-left relative overflow-hidden active:scale-95"
              >
                <div className="relative z-10">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex items-center mt-2">
                    <span className={clsx(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter",
                      product.stock > 5 ? "bg-slate-100 text-slate-500" : "bg-rose-50 text-rose-500"
                    )}>
                      Stok: {product.stock}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between relative z-10">
                  <p className="text-primary font-bold text-sm sm:text-base">{formatCurrency(product.price)}</p>
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-2 -bottom-2 h-16 w-16 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar - Desktop */}
      <div className="hidden lg:flex w-96 sticky top-24 h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center text-sm uppercase tracking-widest">
            <ShoppingCart className="h-4 w-4 mr-2 text-primary" />
            Keranjang
          </h2>
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg shadow-primary/20">{cart.length} Item</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="p-4 bg-slate-50 rounded-full mb-4">
                <ShoppingCart className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Keranjang Kosong</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Pilih produk untuk mulai transaksi</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product_id} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-primary transition-colors">{item.name}</h4>
                  <p className="text-primary font-bold text-xs mt-0.5">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4 shrink-0">
                  <button className="p-1.5 bg-white border border-slate-100 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm" onClick={() => updateQty(item.product_id, -1)}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-bold text-slate-800 text-xs w-5 text-center">{item.qty}</span>
                  <button className="p-1.5 bg-white border border-slate-100 rounded-lg hover:bg-emerald-50 hover:text-emerald-500 transition-colors shadow-sm" onClick={() => updateQty(item.product_id, 1)}>
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 space-y-4">
          {submitError && (
            <div className="text-[10px] font-bold text-rose-600 bg-rose-100/50 border border-rose-100 p-2.5 rounded-xl uppercase tracking-wider text-center">
              {submitError}
            </div>
          )}
          {printerError && (
            <div className="text-[10px] font-bold text-rose-600 bg-rose-100/50 border border-rose-100 p-2.5 rounded-xl uppercase tracking-wider text-center">
              {printerError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-3">
            <Select
              label="Pembayaran"
              options={paymentMethods.map(m => ({ label: m.name, value: m.id }))}
              value={paymentMethodId ?? ''}
              onChange={(e) => setPaymentMethodId(Number(e.target.value))}
              className="bg-white"
            />
            <Input
              label="Bayar"
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder={String(total)}
              className="bg-white"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>Status Printer</span>
            <span>{printerStatus === 'connected' ? 'Terhubung' : 'Belum Terhubung'}</span>
          </div>
          <div className="pt-2 flex justify-between items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tagihan</span>
            <span className="text-xl font-bold text-slate-800 tracking-tight">{formatCurrency(total)}</span>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting || paymentMethodId === null}
            className="w-full"
            isLoading={isSubmitting}
            leftIcon={<CreditCard className="h-4 w-4" />}
          >
            Selesaikan Bayar
          </Button>
          <Button
            onClick={handlePrintTerminal}
            disabled={printerStatus === 'connecting' || printerStatus === 'printing'}
            className="w-full"
            variant="outline"
            leftIcon={<Printer className="h-4 w-4" />}
          >
            {printerStatus === 'connecting'
              ? 'Menghubungkan Printer...'
              : printerStatus === 'printing'
              ? 'Mencetak...'
              : 'Print Terminal'}
          </Button>
          {nativeAndroid && (
            <Button
              onClick={() => setIsPrinterPickerOpen(true)}
              className="w-full"
              variant="secondary"
              disabled={printerStatus === 'connecting' || printerStatus === 'printing'}
            >
              Pilih Printer
            </Button>
          )}
          <p className="text-[10px] font-medium text-slate-400 text-center">
            {nativeAndroid
              ? 'Pilih printer sekali, lalu cukup tekan Print.'
              : 'Gunakan Chrome/Edge (Android atau desktop) dan pastikan printer dalam mode BLE.'
            }
          </p>
        </div>
      </div>

      {/* Mobile Cart Bottom Sheet */}
      <div className={clsx(
        "lg:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-in-out",
        isCartOpen ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
      )}>
        {/* Backdrop */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm -z-10" onClick={() => setIsCartOpen(false)} />
        )}
        
        <div className="bg-white rounded-t-[2.5rem] shadow-2xl border-t border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Handle/Trigger */}
          <div 
            className="p-5 flex items-center justify-between cursor-pointer"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Belanja</p>
                <p className="text-lg font-bold text-slate-800 tracking-tight">{formatCurrency(total)}</p>
              </div>
            </div>
            <div className="p-2 rounded-full bg-slate-50 text-slate-400">
              {isCartOpen ? <X className="h-5 w-5" /> : <ChevronUp className="h-5 w-5 animate-bounce" />}
            </div>
          </div>

          {/* Cart Content */}
          {isCartOpen && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3">
                {cart.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Kosong</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                        <p className="text-primary font-bold text-sm mt-0.5">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center space-x-3 ml-4 shrink-0">
                        <button className="p-2 bg-white rounded-xl shadow-sm text-slate-500 active:bg-rose-50" onClick={() => updateQty(item.product_id, -1)}>
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold text-slate-800 w-4 text-center">{item.qty}</span>
                        <button className="p-2 bg-white rounded-xl shadow-sm text-slate-500 active:bg-emerald-50" onClick={() => updateQty(item.product_id, 1)}>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                {printerError && (
                  <div className="text-[10px] font-bold text-rose-600 bg-rose-100/50 border border-rose-100 p-2.5 rounded-xl uppercase tracking-wider text-center">
                    {printerError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Metode"
                    options={paymentMethods.map(m => ({ label: m.name, value: m.id }))}
                    value={paymentMethodId ?? ''}
                    onChange={(e) => setPaymentMethodId(Number(e.target.value))}
                  />
                  <Input
                    label="Nominal"
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder={String(total)}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Status Printer</span>
                  <span>{printerStatus === 'connected' ? 'Terhubung' : 'Belum Terhubung'}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isSubmitting || paymentMethodId === null}
                  className="w-full py-4 rounded-2xl shadow-xl shadow-primary/30"
                  isLoading={isSubmitting}
                  leftIcon={<CreditCard className="h-5 w-5" />}
                >
                  Bayar & Selesaikan
                </Button>
                <Button
                  onClick={handlePrintTerminal}
                  disabled={printerStatus === 'connecting' || printerStatus === 'printing'}
                  className="w-full"
                  variant="outline"
                  leftIcon={<Printer className="h-5 w-5" />}
                >
                  {printerStatus === 'connecting'
                    ? 'Menghubungkan Printer...'
                    : printerStatus === 'printing'
                    ? 'Mencetak...'
                    : 'Print Terminal'}
                </Button>
                {nativeAndroid && (
                  <Button
                    onClick={() => setIsPrinterPickerOpen(true)}
                    className="w-full"
                    variant="secondary"
                    disabled={printerStatus === 'connecting' || printerStatus === 'printing'}
                  >
                    Pilih Printer
                  </Button>
                )}
                <p className="text-[10px] font-medium text-slate-400 text-center">
                  {nativeAndroid
                    ? 'Pilih printer sekali, lalu cukup tekan Print.'
                    : 'Gunakan Chrome/Edge (Android atau desktop) dan pastikan printer dalam mode BLE.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSPage;
