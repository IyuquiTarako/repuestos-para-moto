"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { CartItem, getCart, getCartTotal as calculateTotal } from "./cart-storage";

interface CartContextType {
  items: CartItem[];
  total: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const total = calculateTotal(items);

  const syncCart = useCallback(() => {
    const currentCart = getCart();
    setItems(currentCart);
  }, []);

  useEffect(() => {
    syncCart();
    window.addEventListener("mototech-cart-updated", syncCart);
    return () => window.removeEventListener("mototech-cart-updated", syncCart);
  }, [syncCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
