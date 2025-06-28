import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { addToCartLocal } from "@/utils/cart";
import { Product } from "@/utils/types";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";


const ProductDetails: React.FC = () => {
  // Get productId from URL
  const params = useParams();
  const productId = params.id;
  const [quantity, setQuantity] = useState<number>(1);



  const { isAuthenticated } = useAuth();
    const [location, setLocation] = useLocation();
    const { toast } = useToast();
  
    const [hoverImage, setHoverImage] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<{
      name: string;
      hex: string;
      imageUrl: string;
    } | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product>({
    queryKey: [`/products/dummy/${productId}`],
    enabled: !!productId,
  });


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    console.error("Error fetching product:", error);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error loading product details.</div>
      </div>
    );
  }

  const displayImage = hoverImage
    ? hoverImage
    : selectedColor
    ? selectedColor.imageUrl
    : product.imageUrl;

  const canAdd =
    product.isActive && selectedColor !== null && selectedSize !== null;

  const handleAddToCart = (
    product: Product,
    selectedColor: { name: string; hex: string; imageUrl: string } | null,
    selectedSize: string | null,
  ) => {
    const updatedProduct: Product = { ...product, selectedColor, selectedSize };
    addToCartLocal(updatedProduct, quantity);
    toast({ title: "Added to cart", description: "Saved locally" });
  };

  return (
    <StoreLayout>
      <div className="mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Image Section */}
          <div className="sm:w-1/3">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {!product.isActive && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-semibold">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="md:w-1/2">
            <div className="mb-2 text-sm text-gray-500">
              {product.vendor.name}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm text-gray-600 mb-2">
              {product.description}
            </p>
            <div className="text-2xl font-bold mb-2">₹{product.price}</div>

            <p className="text-green-500 mb-2 line-clamp-3">
              {product.isActive ? "In Stock" : "Out of Stock"}
            </p>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-2">
                <div className="text-sm font-medium">Color:</div>
                <div className="flex items-center gap-2">
                  {product.colors.map((color) => {
                    const isSel = selectedColor?.name === color.name;
                    return (
                      <Tooltip key={color.name}>
                        <TooltipTrigger asChild>
                          <div
                            className={
                              `rounded-md border-2 cursor-pointer transition ` +
                              (isSel
                                ? "border-primary ring-2 ring-primary"
                                : "border-gray-200")
                            }
                            onMouseEnter={() => setHoverImage(color.imageUrl)}
                            onMouseLeave={() => setHoverImage(null)}
                            onClick={() => setSelectedColor(color)}
                          >
                            <img
                              src={color.imageUrl}
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <span className="text-sm">{color.name}</span>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium mb-1">Size:</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((size) => {
                    const isSel = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={
                          `px-3 py-1 border rounded-md text-sm transition ` +
                          (isSel
                            ? "border-primary bg-primary/10"
                            : "border-gray-300 hover:border-gray-500")
                        }
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Quantity</h3>
              <div className="flex border border-gray-300 rounded w-32">
                <button
                  className="px-3 py-1 text-xl"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full text-center focus:outline-none"
                  min="1"
                  max={product.stock}
                />
                <button
                  className="px-3 py-1 text-xl"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Info */}
            <p className="text-sm mb-6">
              {product.stock > 0
                ? `In Stock (${product.stock} available)`
                : "Out of Stock"}
            </p>

            {/* Add to Cart Button */}
            <div
              onClick={() => {
                if (!canAdd) {
                  alert("Please select size and color to perform this action.");
                }
              }}
              className="flex gap-2"
            >
              <Button
                onClick={() =>
                  handleAddToCart(product, selectedColor, selectedSize, false)
                }
                disabled={!canAdd}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {/* {addingProductId === product.id ? ( */}
                {/* <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> */}
                {/* ) : ( */}
                "Add to Cart"
                {/* )} */}
              </Button>
              <Button
                onClick={() =>
                  isAuthenticated
                    ? handleAddToCart(product, selectedColor, selectedSize, quantity, true)
                    : setLocation("/login")
                }
                disabled={!canAdd}
                size="sm"
                className="flex-1"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default ProductDetails;
