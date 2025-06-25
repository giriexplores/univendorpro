export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  sellingPrice?: string;
  mrp?: string;
  imageUrl?: string;
  isActive: boolean;
  vendor?: {
    id: number;
    name: string;
    logo?: string;
    rating?: number;
    productCount?: number;
  };
  colors?: { name: string; hex: string; imageUrl: string }[];
  sizes?: string[];
  selectedColor?: { name: string; hex: string; imageUrl: string } | null;
  selectedSize?: string | null;
}


export interface CartItem {
  id: String;
  quantity: number;
  product: Product;
}