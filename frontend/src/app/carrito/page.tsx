"use client";

import { useEffect, useMemo, useState } from "react";

import { CartItem, clearCart, getCart, getCartTotal, removeFromCart, updateQuantity } from "../../components/cart-storage";
import SiteHeader from "../../components/site-header";

function formatCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

interface ClientData {
  name: string;
  email: string;
  phone: string;
  city: string;
}

interface DiscountData {
  code: string;
  percent: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({});
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Cliente
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  // Descuento
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState<DiscountData>({ code: "", percent: 0 });
  const [discountError, setDiscountError] = useState("");
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

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

  useEffect(() => {
    const nextInputs: Record<number, string> = {};
    for (const item of items) {
      nextInputs[item.id] = String(item.quantity);
    }
    setQuantityInputs(nextInputs);
  }, [items]);

  function clampQuantity(value: string): number {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return 1;
    return Math.max(1, parsed);
  }

  function commitQuantity(item: CartItem) {
    const currentInput = quantityInputs[item.id] ?? String(item.quantity);
    const normalizedQuantity = clampQuantity(currentInput);
    setQuantityInputs((prev) => ({ ...prev, [item.id]: String(normalizedQuantity) }));
    updateQuantity(item.id, normalizedQuantity);
  }

  const total = useMemo(() => getCartTotal(items), [items]);
  const discountedTotal = Math.floor(total * (1 - discount.percent / 100));
  const discountAmount = total - discountedTotal;
  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Ingresa un código");
      return;
    }

    setIsValidatingDiscount(true);
    setDiscountError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/coupons/validate?code=${encodeURIComponent(discountCode)}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const data = await response.json();
        setDiscountError(data.detail || "Cupón inválido");
        setDiscount({ code: "", percent: 0 });
        return;
      }

      const data = await response.json();
      setDiscount({ code: discountCode, percent: data.discount_percent });
      setDiscountError("");
    } catch (error) {
      setDiscountError("Error al validar el cupón");
      setDiscount({ code: "", percent: 0 });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  async function handleWhatsAppCheckout() {
    if (items.length === 0) return;

    // Validar datos del cliente
    if (!clientData.name.trim() || !clientData.email.trim() || !clientData.phone.trim()) {
      setCheckoutError("Completa tu nombre, email y teléfono");
      return;
    }

    setCheckoutError("");
    setIsCheckingOut(true);

    try {
      const validations = await Promise.all(
        items.map(async (item) => {
          const response = await fetch(`http://127.0.0.1:8000/products/${item.slug}`, {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error(`No fue posible validar ${item.name}. Intenta de nuevo.`);
          }

          const product = (await response.json()) as {
            id: number;
            name: string;
            slug: string;
            price: number | string;
            stock: number;
          };

          return {
            ...item,
            latestPrice: Number(product.price),
            latestStock: product.stock,
            latestName: product.name,
          };
        })
      );

      const outOfStock = validations.filter((entry) => entry.quantity > entry.latestStock);
      const computedTotal = validations.reduce((acc, entry) => acc + entry.latestPrice * entry.quantity, 0);
      const finalTotal = Math.floor(computedTotal * (1 - discount.percent / 100));

      const lines = validations.map((entry, index) => {
        const subtotal = entry.latestPrice * entry.quantity;
        return `${index + 1}. ${entry.latestName}\n   - Cantidad: ${entry.quantity}\n   - Precio unitario: ${formatCop(entry.latestPrice)}\n   - Subtotal: ${formatCop(subtotal)}`;
      });

      const message = [
        `Hola, soy ${clientData.name}`,
        `Email: ${clientData.email}`,
        `Teléfono: ${clientData.phone}`,
        `Ciudad: ${clientData.city}`,
        "",
        "Quiero finalizar mi compra:",
        "",
        ...lines,
        ...(outOfStock.length > 0
          ? [
              "",
              "Nota disponibilidad:",
              ...outOfStock.map(
                (entry) =>
                  `- ${entry.latestName}: solicito ${entry.quantity} unidades, disponibles hoy ${entry.latestStock}. Si faltan, puedo esperar algunos dias.`
              ),
            ]
          : []),
        "",
        `Total antes de descuento: ${formatCop(computedTotal)}`,
        ...(discount.percent > 0 ? [`Cupón aplicado: -${discount.percent}%`, `Total con descuento: ${formatCop(finalTotal)}`] : []),
        "",
        `Total final: ${formatCop(finalTotal)}`,
        "",
        "Quedo atento(a) al proceso de pago y envio.",
      ].join("\n");

      const urlWhatsApp = `https://wa.me/573218055882?text=${encodeURIComponent(message)}`;
      window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "No se pudo preparar el checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="page-shell">
      <SiteHeader />
      <div className="cart-wrap">
        <header className="cart-headline">
          <div>
            <h1 className="cart-title">Carrito de compras</h1>
            <p className="cart-subtitle">Revisa tus repuestos y confirma tu pedido por WhatsApp en menos de un minuto.</p>
          </div>
        </header>

        {items.length === 0 && (
          <div className="empty-state">
            Tu carrito esta vacio. Ve al catalogo y agrega productos.
          </div>
        )}

        {items.length > 0 && (
          <div className="cart-grid">
            <section className="cart-items">
              {items.map((item) => (
                <article key={item.id} className="cart-item">
                  <div>
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-price">{formatCop(item.price)} c/u</p>
                    <a href={`/productos/${item.slug}`} className="cart-item-link">
                      Ver ficha tecnica
                    </a>
                  </div>

                  <div className="qty-wrap">
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      className="qty-control"
                      value={quantityInputs[item.id] ?? String(item.quantity)}
                      onChange={(event) => {
                        const rawValue = event.target.value;

                        if (rawValue === "") {
                          setQuantityInputs((prev) => ({ ...prev, [item.id]: "" }));
                          return;
                        }

                        if (/^\d+$/.test(rawValue)) {
                          setQuantityInputs((prev) => ({ ...prev, [item.id]: rawValue }));
                        }
                      }}
                      onBlur={() => commitQuantity(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          commitQuantity(item);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="btn-danger"
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))}

              {checkoutError && <p className="checkout-error">{checkoutError}</p>}
            </section>

            <aside className="summary">
              <h2>Datos del cliente</h2>
              <form className="client-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="client-name">Nombre completo *</label>
                  <input
                    id="client-name"
                    type="text"
                    placeholder="Tu nombre"
                    value={clientData.name}
                    onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="client-email">Email *</label>
                  <input
                    id="client-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="client-phone">Teléfono *</label>
                  <input
                    id="client-phone"
                    type="tel"
                    placeholder="+57 300 000 0000"
                    value={clientData.phone}
                    onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="client-city">Ciudad (opcional)</label>
                  <input
                    id="client-city"
                    type="text"
                    placeholder="Medellín, Bogotá, etc"
                    value={clientData.city}
                    onChange={(e) => setClientData({ ...clientData, city: e.target.value })}
                  />
                </div>
              </form>

              <div className="summary-divider"></div>

              <h2>Cupón de descuento</h2>
              <div className="discount-section">
                <div className="discount-input-group">
                  <input
                    type="text"
                    placeholder="Código de cupón"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={isValidatingDiscount}
                  />
                  <button 
                    type="button" 
                    onClick={handleApplyDiscount}
                    disabled={isValidatingDiscount}
                    className="discount-btn"
                  >
                    {isValidatingDiscount ? "..." : "Aplicar"}
                  </button>
                </div>
                {discountError && <p className="discount-error">{discountError}</p>}
                {discount.percent > 0 && <p className="discount-success">✓ Descuento {discount.percent}% aplicado</p>}
              </div>

              <div className="summary-divider"></div>

              <h2>Resumen</h2>
              <p className="summary-row">
                <span>Productos</span>
                <span>{itemCount}</span>
              </p>
              <p className="summary-row">
                <span>Items diferentes</span>
                <span>{items.length}</span>
              </p>
              <p className="summary-row">
                <span>Subtotal</span>
                <span>{formatCop(total)}</span>
              </p>
              {discount.percent > 0 && (
                <p className="summary-row discount-row">
                  <span>Descuento -{discount.percent}%</span>
                  <span style={{ color: "#22c55e" }}>-{formatCop(discountAmount)}</span>
                </p>
              )}
              <p className="summary-row summary-total">
                <span>Total {discount.percent > 0 ? "final" : ""}</span>
                <span>{formatCop(discount.percent > 0 ? discountedTotal : total)}</span>
              </p>

              <div className="summary-actions">
                <a href="/" className="summary-link">
                  Seguir comprando
                </a>
                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  disabled={isCheckingOut}
                  className="summary-btn wa"
                >
                  {isCheckingOut ? "Preparando..." : "Finalizar Compra por WhatsApp"}
                </button>
                <button
                  type="button"
                  onClick={() => clearCart()}
                  className="summary-btn ghost"
                >
                  Vaciar carrito
                </button>
              </div>

              <p className="cart-subtitle" style={{ marginTop: 12 }}>
                Compartimos disponibilidad actual por WhatsApp y, si faltan unidades, coordinamos tiempo de entrega.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
