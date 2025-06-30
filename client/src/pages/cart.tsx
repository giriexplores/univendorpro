import React, { useEffect, useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import {
  getCartFromLocalStorage,
  updateCartItemLocal,
  removeFromCartLocal,
} from "@/utils/cart";
import { CartItem as CartItemType } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { CheckoutModal } from "@/components/checkout-modal";
import DashboardLayout from "@/components/layout/dashboard-layout";

function CartPage() {
  const [localCart, setLocalCart] = useState<CartItemType[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    setLocalCart(getCartFromLocalStorage());
  }, []);

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) return;
    updateCartItemLocal(productId, quantity);
    setLocalCart(getCartFromLocalStorage());
  };

  const handleDeleteItem = (productId: number) => {
    removeFromCartLocal(productId);
    setLocalCart(getCartFromLocalStorage());
  };

  const subtotal = localCart.reduce(
    (sum, item) =>
      sum +
      parseFloat(item?.product?.sellingPrice || item?.product?.price) *
        item?.quantity,
    0
  );

  const taxRate = 0.18;
  const taxAmount = subtotal * taxRate;
  const shippingFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + taxAmount + shippingFee;

  if (localCart.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="text-primary mb-4">
            <ShoppingBag className="h-16 w-16" />
          </div>
          <p className="mt-4 text-lg font-bold">Your cart is empty!</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Go ahead, add something to your cart. It’s lonely in here!
          </p>
          <Link
            href="/store"
            className="text-primary mt-3 text-sm hover:underline sm:text-base"
          >
            Take me shopping!
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Your Shopping Cart</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {localCart.map((item, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 border-b border-gray-200 pb-4"
              >
                <div className="flex flex-col items-start justify-center w-20">
                  <img
                    src={
                      item.product?.selectedColor?.imageUrl ||
                      item.product?.imageUrl ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop"
                    }
                    alt={item.product?.name}
                    className="w-20 h-20 rounded-lg object-contain"
                  />
                  {item.product?.selectedColor && (
                    <span className="text-xs text-gray-500 mt-1">
                      Color: {item.product?.selectedColor?.name}
                    </span>
                  )}
                  {item.product?.selectedSize && (
                    <span className="text-xs text-gray-500 mt-1">
                      Size: {item.product?.selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {item.product?.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {item.product?.vendor?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{item.product?.sellingPrice || item.product?.price}
                    </span>
                    {item.product?.mrp &&
                      parseFloat(item.product?.mrp) >
                        parseFloat(
                          item.product?.sellingPrice || item.product?.price
                        ) && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item.product?.mrp}
                        </span>
                      )}
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹
                    {(
                      parseFloat(
                        item.product?.sellingPrice || item.product?.price
                      ) * item.quantity
                    ).toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="mt-2 h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card text-card-foreground w-full self-start rounded-lg p-4 shadow-md">
            <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({localCart.length} items):</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>
              {subtotal < 500 && (
                <p className="text-xs text-gray-500">
                  Add ₹{(500 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary text-2xl font-bold">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
            <Button
              onClick={() => setIsCheckoutOpen(true)}
              className="mt-4 w-full"
              size="lg"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>

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
    </DashboardLayout>
  );
}

export default CartPage;
