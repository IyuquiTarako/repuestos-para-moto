"use client";

import { addToCart } from "./cart-storage";
import { useCart } from "./cart-context";

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
  const { items, openDrawer } = useCart();

  const isInCart = items.some((item) => item.id === product.id);
  const quantity = items.find((item) => item.id === product.id)?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product, 1);
    openDrawer();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button
        type="button"
        onClick={handleAddToCart}
        style={{
          width: "100%",
          border: "none",
          background: isInCart ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #ff7722, #ff5500)",
          color: "#fff",
          padding: "16px 20px",
          borderRadius: 12,
          fontWeight: 800,
          fontSize: 16,
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: isInCart ? "0 0 20px rgba(34, 197, 94, 0.4)" : "0 0 20px rgba(255, 85, 0, 0.4)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        }}
      >
        {isInCart ? `✓ En carrito (${quantity})` : "Agregar al carrito"}
      </button>
      <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 12, textAlign: "center" }}>
        Ajusta la cantidad en el carrito si es necesario
      </p>
    </div>
  );
}
