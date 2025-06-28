// components/ProductCard.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Product } from "@/utils/types";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  addToCart: (
    product: Product,
    selectedColor: { name: string; hex: string; imageUrl: string } | null,
    selectedSize: string | null,
    goToCheckout?: boolean
  ) => void;
}

export function ProductCard({ product, addToCart }: ProductCardProps) {
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

  const displayImage = hoverImage
    ? hoverImage
    : selectedColor
    ? selectedColor.imageUrl
    : product.imageUrl;

  const canAdd =
    product.isActive && selectedColor !== null && selectedSize !== null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/product/${product.id}`} className="no-underline">
        <div className="relative" onMouseLeave={() => setHoverImage(null)}>
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-48 object-contain group-hover:scale-105 transition-transform"
          />
          {!product.isActive && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                ₹{product.sellingPrice || product.price}
              </span>
              {product.mrp &&
                parseFloat(product.mrp) >
                  parseFloat(product.sellingPrice || product.price) && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.mrp}
                  </span>
                )}
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex flex-col items-start">
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

        <div
          onClick={() => {
            if (!canAdd) {
              toast({
                title: "Selection Required",
                description:
                  "Please select size and color to perform this action.",
              });
            }
          }}
          className="flex gap-2"
        >
          <Button
            onClick={() =>
              addToCart(product, selectedColor, selectedSize, false)
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
            onClick={() => {
              if (!isAuthenticated) {
                toast({
                  title: "Login Required",
                  description:
                    "Please login to buy products.",
                });
                setLocation("/login");
              } else {
                addToCart(product, selectedColor, selectedSize, true);
              }
            }}
            disabled={!canAdd}
            size="sm"
            className="flex-1"
          >
            Buy Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
