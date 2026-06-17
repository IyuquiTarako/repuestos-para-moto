export type CartItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  quantity: number;
};

const CART_KEY = "mototech_cart_v1";

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return parseCart(window.localStorage.getItem(CART_KEY));
}

function persistCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("mototech-cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1): void {
  const current = getCart();
  const existing = current.find((product) => product.id === item.id);
  const safeQuantity = Math.max(1, quantity);

  if (existing) {
    existing.quantity = Math.max(1, existing.quantity + safeQuantity);
    persistCart([...current]);
    return;
  }

  persistCart([...current, { ...item, quantity: safeQuantity }]);
}

export function updateQuantity(productId: number, quantity: number): void {
  const current = getCart();
  const next = current
    .map((item) => {
      if (item.id !== productId) return item;
      const safeQty = Math.max(1, quantity);
      return { ...item, quantity: safeQty };
    })
    .filter((item) => item.quantity > 0);

  persistCart(next);
}

export function removeFromCart(productId: number): void {
  const current = getCart();
  const next = current.filter((item) => item.id !== productId);
  persistCart(next);
}

export function clearCart(): void {
  persistCart([]);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}
