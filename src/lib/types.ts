
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  images: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  disabled: boolean;
};

export type Order = {
  id:string;
  userId: string;
  customerInfo: {
    name: string;
    phone:string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: number; // Stored as a timestamp
};
