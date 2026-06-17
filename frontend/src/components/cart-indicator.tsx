"use client";

import { useEffect, useMemo, useState } from "react";

import { CartItem, getCart } from "./cart-storage";
import { useCart } from "./cart-context";

export default function CartIndicator() {
  const [items, setItems] = useState<CartItem[]>([]);
  const { openDrawer } = useCart();

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();

    window.addEventListener("mototech-cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mototech-cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  return (
    <button
      type="button"
      className="cart-indicator"
      onClick={openDrawer}
      aria-label="Abrir carrito"
    >
      <span aria-hidden="true" className="cart-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 4H5L7.2 14.4C7.3 14.9 7.8 15.2 8.3 15.2H17.7C18.2 15.2 18.7 14.9 18.8 14.4L20.3 7.5H6.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.1" cy="19.2" r="1.4" fill="currentColor" />
          <circle cx="17" cy="19.2" r="1.4" fill="currentColor" />
        </svg>
      </span>
      {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
    </button>
  );
}
