"use client";

import { useEffect, useMemo, useState } from "react";

import { CartItem, clearCart, getCart, getCartTotal, removeFromCart, updateQuantity } from "../../components/cart-storage";

function formatCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  const total = useMemo(() => getCartTotal(items), [items]);

  async function handleWhatsAppCheckout() {
    if (items.length === 0) return;

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
      if (outOfStock.length > 0) {
        const details = outOfStock
          .map((entry) => `${entry.latestName}: pediste ${entry.quantity}, disponible ${entry.latestStock}`)
          .join(" | ");
        setCheckoutError(`Stock insuficiente. ${details}`);
        return;
      }

      const computedTotal = validations.reduce((acc, entry) => acc + entry.latestPrice * entry.quantity, 0);

      const lines = validations.map((entry, index) => {
        const subtotal = entry.latestPrice * entry.quantity;
        return `${index + 1}. ${entry.latestName}\n   - Cantidad: ${entry.quantity}\n   - Precio unitario: ${formatCop(entry.latestPrice)}\n   - Subtotal: ${formatCop(subtotal)}`;
      });

      const message = [
        "Hola MotoTech, quiero finalizar mi compra:",
        "",
        ...lines,
        "",
        `Total pedido: ${formatCop(computedTotal)}`,
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
    <main style={{ background: "#0a0a0c", minHeight: "100vh", color: "#f8fafc", padding: "28px 16px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Carrito de compras</h1>
        <p style={{ color: "#94a3b8" }}>Revisa tus repuestos seleccionados antes de pagar.</p>

        {items.length === 0 && (
          <div style={{ marginTop: 18, padding: 16, border: "1px dashed rgba(255,255,255,0.3)", borderRadius: 10 }}>
            Tu carrito esta vacio. Ve al catalogo y agrega productos.
          </div>
        )}

        {items.length > 0 && (
          <section
            style={{
              marginTop: 18,
              background: "#141418",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((item) => (
                <article
                  key={item.id}
                  style={{
                    background: "#1b1b22",
                    borderRadius: 10,
                    padding: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 6px" }}>{item.name}</h3>
                    <p style={{ margin: 0, color: "#cbd5e1" }}>{formatCop(item.price)} c/u</p>
                    <a href={`/productos/${item.slug}`} style={{ color: "#fb923c", fontSize: 13 }}>
                      Ver ficha tecnica
                    </a>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                      style={{ width: 70, padding: 8, borderRadius: 6, border: "1px solid #374151", background: "#0f172a", color: "#fff" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      style={{ border: "none", background: "#7f1d1d", color: "#fff", padding: "8px 10px", borderRadius: 6 }}
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <strong style={{ fontSize: 20 }}>Total: {formatCop(total)}</strong>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href="/"
                  style={{ textDecoration: "none", border: "1px solid #334155", color: "#e2e8f0", padding: "10px 14px", borderRadius: 8 }}
                >
                  Seguir comprando
                </a>
                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  disabled={isCheckingOut}
                  style={{
                    border: "none",
                    background: isCheckingOut ? "#166534" : "#25d366",
                    color: "#fff",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: isCheckingOut ? "wait" : "pointer",
                  }}
                >
                  {isCheckingOut ? "Validando stock..." : "Finalizar Compra por WhatsApp"}
                </button>
                <button
                  type="button"
                  onClick={() => clearCart()}
                  style={{ border: "none", background: "#334155", color: "#fff", padding: "10px 14px", borderRadius: 8 }}
                >
                  Vaciar carrito
                </button>
              </div>
            </div>

            {checkoutError && (
              <p
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#7f1d1d",
                  color: "#fee2e2",
                }}
              >
                {checkoutError}
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
