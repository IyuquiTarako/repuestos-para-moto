"use client";

import { useState } from "react";

import { addToCart } from "./cart-storage";

type Props = {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
  };
};

export default function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  return (
    <div style={{ marginTop: 14 }}>
      <label style={{ display: "block", marginBottom: 8, color: "#cbd5e1", fontSize: 14 }}>
        Cantidad
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="number"
          min={1}
          max={Math.max(1, product.stock)}
          value={quantity}
          disabled={product.stock === 0}
          onChange={(event) => {
            const next = Number(event.target.value || 1);
            setQuantity(Math.max(1, Math.min(next, product.stock || 1)));
          }}
          style={{
            width: 84,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#fff",
            padding: "10px 12px",
            borderRadius: 8,
            fontWeight: 700,
          }}
        />
        <button
          type="button"
          disabled={product.stock === 0}
          onClick={() => {
            addToCart(product, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
          }}
          style={{
            flex: 1,
            border: "1px solid rgba(255,255,255,0.2)",
            background: product.stock === 0 ? "#4b5563" : added ? "#14532d" : "#ff5500",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 700,
            cursor: product.stock === 0 ? "not-allowed" : "pointer",
          }}
        >
          {product.stock === 0 ? "Agotado" : added ? "Agregado" : "Agregar al carrito"}
        </button>
      </div>
      {product.stock > 0 && (
        <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 0 }}>Maximo disponible: {product.stock}</p>
      )}
    </div>
  );
}
