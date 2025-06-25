import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart } from "@/components/shopping-cart";
import { CheckoutModal } from "@/components/checkout-modal";
import { Link } from "wouter";
import { Star, Package, Store, ShoppingCart as CartIcon } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getCartFromLocalStorage, addToCartLocal } from "@/utils/cart";
import { Product, CartItem } from "@/utils/types";


export default function Storefront() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [localCart, setLocalCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setLocalCart(getCartFromLocalStorage());
  }, []);

  const { data: products = [], isLoading: productsLoading } = useQuery<
    Product[]
  >({
    // queryKey: ["/api/products"],
    queryKey: ["/products/dummy"],
  });

  // const { data: cartItems = [], refetch: refetchCart } = useQuery<CartItem[]>({
  //   queryKey: ["/api/cart"],
  //   enabled: !!user,
  // });

  const handleAddToCart = (
    product: Product,
    selectedColor: { name: string; hex: string; imageUrl: string } | null,
    selectedSize: string | null,
    goToCheckout?: boolean
  ) => {
    const updatedProduct: Product = { ...product, selectedColor, selectedSize };
    // if (user) {
    //   addToCartMutation.mutate(id, {
    //     onSuccess: () => {
    //       if (goToCheckout) setIsCheckoutOpen(true);
    //     },
    //   });
    // } else {
    addToCartLocal(updatedProduct);
    const updated = getCartFromLocalStorage();
    setLocalCart(updated);
    toast({ title: "Added to cart", description: "Saved locally" });
    if (goToCheckout) setIsCheckoutOpen(true);
    // }
  };

  // const addToCartMutation = useMutation({
  //   mutationFn: async (productId: number) => {
  //     if (!user) {
  //       window.location.href = "/api/login";
  //       return;
  //     }
  //     await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  //     toast({
  //       title: "Added to cart",
  //       description: "Product added to your cart successfully",
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Error",
  //       description: "Failed to add product to cart",
  //       variant: "destructive",
  //     });
  //   },
  // });

  // const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartItemCount = localCart.reduce((sum, item) => sum + item.quantity, 0);

  // Group products by vendor for better organization
  const productsByVendor = products.reduce((acc, product) => {
    const vendorName = product.vendor?.name || "Unknown Store";
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(product);
    return acc;
  }, {});

  // Get unique stores with their details
  const stores = Object.entries(productsByVendor).map(
    ([vendorName, products]) => {
      const vendor = products[0]?.vendor;
      return {
        id: vendor?.id,
        name: vendorName,
        logo: vendor?.logo,
        rating: vendor?.rating || 4.5, // Default rating if not available
        productCount: products.length,
        products: products,
      };
    }
  );

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
              {/* {isAuthenticated && ( */}
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
              {/* )} */}
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

      {/* Hero Section */}
      <div className="relative">
        <div
          className="h-96 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')",
          }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
              <h1 className="text-5xl font-bold mb-4">Premium Marketplace</h1>
              <p className="text-xl mb-8">
                Discover amazing products from top vendors
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Browse Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <Card
                key={store.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {store.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1">
                            {store.rating.toFixed(1)}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center">
                          <Package className="w-4 h-4" />
                          <span className="ml-1">
                            {store.productCount} products
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {store.products.slice(0, 4).map((product) => (
                      <img
                        key={product.id}
                        src={
                          product.imageUrl ||
                          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop"
                        }
                        alt={product.name}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      document
                        .getElementById(`store-${store.id}`)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View Store
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Featured Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=200&fit=crop"
              alt="Electronics"
              className="w-full h-48 rounded-lg object-cover group-hover:scale-105 transition-transform"
            />
            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              Electronics
            </h3>
            <p className="text-gray-600">Latest gadgets and tech</p>
          </div>
          <div className="text-center group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop"
              alt="Fashion"
              className="w-full h-48 rounded-lg object-cover group-hover:scale-105 transition-transform"
            />
            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              Fashion
            </h3>
            <p className="text-gray-600">Trendy clothing and accessories</p>
          </div>
          <div className="text-center group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop"
              alt="Home & Garden"
              className="w-full h-48 rounded-lg object-cover group-hover:scale-105 transition-transform"
            />
            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              Home & Garden
            </h3>
            <p className="text-gray-600">Furniture and decor</p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            All Products
          </h2>

          {productsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-box-open text-gray-400 text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Products Available
              </h3>
              <p className="text-gray-600">
                Check back later for new products!
              </p>
            </div>
          ) : (
            Object.entries(productsByVendor).map(
              ([vendorName, vendorProducts], index) => (
                <div
                  key={vendorProducts[0]?.vendor?.id}
                  id={`store-${vendorProducts[0]?.vendor?.id}`}
                  className="mb-12 scroll-mt-16"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {vendorName}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1">
                          {vendorProducts[0]?.vendor?.rating?.toFixed(1) ||
                            "4.5"}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <Package className="w-4 h-4" />
                        <span className="ml-1">
                          {vendorProducts.length} products
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {vendorProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        // addToCart={(id, goToCheckout) => {
                        //   addToCartMutation.mutate(id, {
                        //     onSuccess: () => {
                        //       setAddingProductId(null);
                        //       if (goToCheckout) setIsCheckoutOpen(true);
                        //     },
                        //   });
                        // }}
                        addToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        // cartItems={cartItems}
        cartItems={localCart}
        // refetchCart={refetchCart}
        setLocalCart={setLocalCart}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        // cartItems={cartItems}
        cartItems={localCart}
        onOrderComplete={() => {
          setIsCheckoutOpen(false);
          // refetchCart();
        }}
      />
    </div>
  );
}
