import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Service, Hairstyle, CartItem } from '../types/database';

interface OrderCartContextType {
  items: CartItem[];
  selectedHairstyle: Hairstyle | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  updateQuantity: (serviceId: string, delta: number) => void;
  selectHairstyle: (hairstyle: Hairstyle | null) => void;
  clearCart: () => void;
  totalEstimatedAmount: number;
  totalItemCount: number;
}

const CART_STORAGE_KEY = 'mikkys_order_cart_draft';

const OrderCartContext = createContext<OrderCartContextType | undefined>(undefined);

export const OrderCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Keep sessionStorage in sync so in-progress orders are not lost on refresh or login switch
  useEffect(() => {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  const addService = (service: Service) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeService = (serviceId: string) => {
    setItems((prev) => prev.filter((item) => item.service.id !== serviceId));
  };

  const updateQuantity = (serviceId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.service.id === serviceId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const selectHairstyle = (hairstyle: Hairstyle | null) => {
    setSelectedHairstyle(hairstyle);
    // If hairstyle has an associated service and it's not in cart, automatically add it or offer it
    if (hairstyle?.service) {
      const srv = hairstyle.service;
      setItems((prev) => {
        if (!prev.some((item) => item.service.id === srv.id)) {
          return [...prev, { service: srv, quantity: 1 }];
        }
        return prev;
      });
    }
  };

  const clearCart = () => {
    setItems([]);
    setSelectedHairstyle(null);
    try {
      sessionStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const totalEstimatedAmount = items.reduce((sum, item) => {
    const effectivePrice =
      item.service.promo_price && item.service.promo_price > 0
        ? item.service.promo_price
        : item.service.price;
    return sum + effectivePrice * item.quantity;
  }, 0);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <OrderCartContext.Provider
      value={{
        items,
        selectedHairstyle,
        isCartOpen,
        isCheckoutOpen,
        setIsCartOpen,
        setIsCheckoutOpen,
        addService,
        removeService,
        updateQuantity,
        selectHairstyle,
        clearCart,
        totalEstimatedAmount,
        totalItemCount,
      }}
    >
      {children}
    </OrderCartContext.Provider>
  );
};

export const useOrderCart = () => {
  const context = useContext(OrderCartContext);
  if (!context) {
    throw new Error('useOrderCart must be used within an OrderCartProvider');
  }
  return context;
};
