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

export default function ProductCardActions({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return (
      <button className="btn-card btn-card-disabled" disabled type="button">
        Agotado
      </button>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          min={1}
          max={product.stock}
          value={quantity}
          onChange={(event) => {
            const next = Number(event.target.value || 1);
            setQuantity(Math.max(1, Math.min(next, product.stock)));
          }}
          style={{
            width: 84,
            border: "1px solid #374151",
            background: "#0f172a",
            color: "#fff",
            borderRadius: 6,
            padding: "8px 10px",
            fontWeight: 700,
          }}
        />
        <button
          className="btn-card"
          type="button"
          title="Agregar al carrito"
          onClick={() => {
            addToCart(product, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 1100);
          }}
        >
          {added ? "Agregado" : "Agregar"}
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1" }}>Maximo: {product.stock}</p>
    </div>
  );
}
