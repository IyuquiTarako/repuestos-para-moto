"use client";

import { CartProvider } from "@/components/cart-context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
