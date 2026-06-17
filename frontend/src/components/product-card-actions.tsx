"use client";

import { useState } from "react";

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

export default function ProductCardActions({ product }: Props) {
  const { items, openDrawer } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isInCart = items.some((item) => item.id === product.id);
  const quantity = items.find((item) => item.id === product.id)?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product, 1);
    openDrawer();
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1100);
  };

  return (
    <button
      className={`btn-card btn-card-prominent ${isInCart ? "btn-card-in-cart" : ""}`}
      type="button"
      title="Agregar al carrito"
      onClick={handleAddToCart}
    >
      {isInCart ? `Agregado ✓ (${quantity})` : "Agregar al carrito"}
    </button>
  );
}
