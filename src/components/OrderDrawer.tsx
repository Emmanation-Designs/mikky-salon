import React from 'react';
import { X, Trash2, Plus, Minus, Scissors, ArrowRight, ShoppingBag } from 'lucide-react';
import { useOrderCart } from '../context/OrderCartContext';
import { useBusiness } from '../context/BusinessContext';

export const OrderDrawer: React.FC = () => {
  const {
    items,
    selectedHairstyle,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    removeService,
    updateQuantity,
    selectHairstyle,
    clearCart,
    totalEstimatedAmount,
    totalItemCount,
  } = useOrderCart();
  const { settings } = useBusiness();

  if (!isCartOpen) return null;

  const formatPrice = (amount: number) => {
    return `${settings.currency_symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-md border-l border-neutral-900 bg-black p-5 sm:p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Order Summary ({totalItemCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Selected Hairstyle Reference */}
            {selectedHairstyle && (
              <div className="mt-4 rounded-xl border border-red-600/30 bg-red-950/20 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold shrink-0">
                    <Scissors className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-red-400">Attached Hairstyle Reference</div>
                    <div className="font-bold text-white text-sm">{selectedHairstyle.name}</div>
                  </div>
                </div>
                <button
                  onClick={() => selectHairstyle(null)}
                  className="text-neutral-400 hover:text-white p-1"
                  title="Remove hairstyle reference"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="my-6 flex-1 overflow-y-auto pr-1 space-y-3">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-500 mb-3">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-white">Your order draft is empty</p>
                <p className="mt-1 text-xs text-neutral-400 max-w-xs mx-auto">
                  Select a haircut or beard grooming service to start your order.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const effectivePrice =
                  item.service.promo_price && item.service.promo_price > 0
                    ? item.service.promo_price
                    : item.service.price;
                const lineTotal = effectivePrice * item.quantity;

                return (
                  <div
                    key={item.service.id}
                    className="rounded-xl border border-neutral-900 bg-[#0A0A0A] p-3.5 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.service.name}</h4>
                        <div className="mt-0.5 text-xs text-neutral-400">
                          {formatPrice(effectivePrice)} each
                        </div>
                      </div>
                      <button
                        onClick={() => removeService(item.service.id)}
                        className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-900 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-neutral-900 rounded-lg border border-neutral-800 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.service.id, -1)}
                          className="h-7 w-7 flex items-center justify-center text-neutral-300 hover:bg-neutral-800 rounded"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.service.id, 1)}
                          className="h-7 w-7 flex items-center justify-center text-neutral-300 hover:bg-neutral-800 rounded"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-sm font-extrabold text-white tabular-nums">
                        {formatPrice(lineTotal)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-neutral-900 pt-4 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Estimated Total</span>
                  <span className="text-xl font-black text-white tabular-nums">
                    {formatPrice(totalEstimatedAmount)}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Pay in cash or transfer at the salon after service.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearCart}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 active:scale-98 transition-all shadow-lg shadow-red-950/50"
                >
                  <span>Proceed to Details</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
