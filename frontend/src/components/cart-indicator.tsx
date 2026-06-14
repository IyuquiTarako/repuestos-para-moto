"use client";

import { useEffect, useMemo, useState } from "react";

import { CartItem, getCart, getCartTotal } from "./cart-storage";

function formatCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartIndicator() {
  const [items, setItems] = useState<CartItem[]>([]);

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
  const total = useMemo(() => getCartTotal(items), [items]);
  const previewItems = items.slice(0, 4);

  return (
    <a href="/carrito" className="cart-indicator" aria-label="Ir al carrito">
      <span>Carrito</span>
      {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}

      <div className="cart-popover" role="status" aria-live="polite">
        {items.length === 0 && <p className="cart-empty">Aun no agregas productos.</p>}

        {items.length > 0 && (
          <>
            <ul className="cart-preview-list">
              {previewItems.map((item) => (
                <li key={item.id} className="cart-preview-item">
                  <span className="cart-preview-name">{item.name}</span>
                  <span className="cart-preview-qty">x{item.quantity}</span>
                </li>
              ))}
            </ul>

            {items.length > previewItems.length && (
              <p className="cart-more">+{items.length - previewItems.length} producto(s) mas</p>
            )}

            <p className="cart-total">Total: {formatCop(total)}</p>
            <span className="cart-go">Ver carrito</span>
          </>
        )}
      </div>
    </a>
  );
}
