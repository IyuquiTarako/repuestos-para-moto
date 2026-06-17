"use client";

import { useEffect, useState } from "react";

import { CartItem, removeFromCart, updateQuantity } from "./cart-storage";

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
};

function formatCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartSidebar({ isOpen, onClose, items, total }: CartSidebarProps) {
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const discountedTotal = Math.floor(total * (1 - discountPercent / 100));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Ingresa un código de cupón");
      return;
    }

    setIsValidating(true);
    setDiscountError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/coupons/validate?code=${encodeURIComponent(discountCode)}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const data = await response.json();
        setDiscountError(data.detail || "Cupón inválido");
        setDiscountPercent(0);
        return;
      }

      const data = await response.json();
      setDiscountPercent(data.discount_percent);
      setDiscountError("");
    } catch (error) {
      setDiscountError("Error al validar el cupón");
      setDiscountPercent(0);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      {isOpen && <div className="cart-sidebar-overlay" onClick={onClose} />}

      <aside className={`cart-sidebar ${isOpen ? "open" : ""}`}>
        <div className="cart-sidebar-header">
          <h2>Tu carrito</h2>
          <button type="button" className="cart-sidebar-close" onClick={onClose} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>

        <div className="cart-sidebar-content">
          {items.length === 0 ? (
            <p className="cart-sidebar-empty">Tu carrito está vacío</p>
          ) : (
            <>
              <ul className="cart-sidebar-items">
                {items.map((item) => (
                  <li key={item.id} className="cart-sidebar-item">
                    <div className="cart-sidebar-item-image">
                      {/* Aquí iría la imagen del producto si la tuviéramos */}
                      <span className="cart-sidebar-item-icon">{item.name[0]}</span>
                    </div>

                    <div className="cart-sidebar-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-sidebar-item-price">
                        {item.quantity} x {formatCop(item.price)}
                      </p>
                      <p className="cart-sidebar-item-subtotal">{formatCop(item.quantity * item.price)}</p>
                    </div>

                    <div className="cart-sidebar-item-controls">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity - 1 <= 0) {
                            removeFromCart(item.id);
                          } else {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        className="cart-sidebar-btn"
                        aria-label="Disminuir cantidad"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="cart-sidebar-btn"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="cart-sidebar-discount">
                <h3>Aplicar cupón</h3>
                <div className="cart-sidebar-discount-input">
                  <input
                    type="text"
                    placeholder="Código de descuento"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={isValidating}
                  />
                  <button 
                    type="button" 
                    onClick={handleApplyDiscount} 
                    className="cart-sidebar-discount-btn"
                    disabled={isValidating}
                  >
                    {isValidating ? "Validando..." : "Aplicar"}
                  </button>
                </div>
                {discountError && <p className="cart-sidebar-discount-error">{discountError}</p>}
                {discountPercent > 0 && <p className="cart-sidebar-discount-info">✓ Descuento aplicado: -{discountPercent}%</p>}
              </div>
            </>
          )}
        </div>

        <div className="cart-sidebar-footer">
          <div className="cart-sidebar-total">
            <span>Subtotal</span>
            <span>{formatCop(total)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="cart-sidebar-discount-total">
              <span>Descuento ({discountPercent}%)</span>
              <span>-{formatCop(total - discountedTotal)}</span>
            </div>
          )}
          <div className="cart-sidebar-final-total">
            <span>Total</span>
            <span>{formatCop(discountedTotal)}</span>
          </div>

          {items.length > 0 && (
            <a href="/carrito" className="cart-sidebar-checkout-btn">
              Ir al carrito
            </a>
          )}
        </div>
      </aside>
    </>
  );
}
