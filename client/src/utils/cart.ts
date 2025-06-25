const CART_KEY = "cart";
import { Product, CartItem } from "@/utils/types";

export function getCartFromLocalStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  const json = localStorage.getItem(CART_KEY);
  return json ? JSON.parse(json) : [];
}

export function saveCartToLocalStorage(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCartLocal(product: Product, qty = 1) {
  const items = getCartFromLocalStorage();
  const id = [product.id, product?.selectedColor?.name, product?.selectedSize].join("-");
  const existing = items.find((i) => i.id === id);
  if (existing) {
    existing.quantity += qty;
  } else {
    items.push({
      id,
      product,
      quantity: qty,
    });
  }
  saveCartToLocalStorage(items);
  console.log("Cart updated:", items);
}

export function updateCartItemLocal(cartItemId: string, quantity: number) {
  const items = getCartFromLocalStorage().map((i) =>
    i.id === cartItemId ? { ...i, quantity } : i
  );
  saveCartToLocalStorage(items);
}

export function removeFromCartLocal(cartItemId: string) {
  const items = getCartFromLocalStorage().filter(
    (i) => i.id !== cartItemId
  );
  saveCartToLocalStorage(items);
}

export function clearCartLocal() {
  localStorage.removeItem(CART_KEY);
}
