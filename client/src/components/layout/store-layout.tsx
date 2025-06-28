// components/Layout.tsx
import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart } from "@/components/shopping-cart";
import { CheckoutModal } from "@/components/checkout-modal";
import { getCartFromLocalStorage } from "@/utils/cart";
import { CartItem } from "@/utils/types";
import { ShoppingCart as CartIcon } from "lucide-react";
import { Link } from "wouter";

type LayoutProps = {
  children: ReactNode;
};

export function StoreLayout({ children }: LayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [localCart, setLocalCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setLocalCart(getCartFromLocalStorage());
    
    const syncCart = () => {
      setLocalCart(getCartFromLocalStorage());
    };

    // Called when localStorage changes in any tab
    window.addEventListener("storage", syncCart);

    // Called when same-tab components use `localStorage` directly
    const interval = setInterval(syncCart, 1000); // polling as fallback

    return () => {
      window.removeEventListener("storage", syncCart);
      clearInterval(interval);
    };
  }, []);

  const cartItemCount = localCart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900 cursor-pointer">
                SaaSCommerce
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <div
                className="relative cursor-pointer"
                onClick={() => setIsCartOpen(true)}
              >
                <CartIcon className="w-6 h-6 text-gray-600 hover:text-primary" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700">
                    {user?.firstName || user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/api/logout")}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => (window.location.href = "/login")}
                  size="sm"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      {children}

      {/* Shopping Cart Sidebar */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        cartItems={localCart}
        setLocalCart={setLocalCart}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={localCart}
        onOrderComplete={() => {
          setIsCheckoutOpen(false);
        }}
      />
    </div>
  );
}
