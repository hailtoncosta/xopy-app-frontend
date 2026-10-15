export interface Product {
  id: number | string;
  name: string;
  price: string;
  image: string;
  category?: string;
  type: 'produto' | 'serviço' | 'decoração';
  rating?: number;
  isOffer?: boolean;
  offerPrice?: string;
  description?: string;
  stock?: number;
  sku?: string;
  brand?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: number;
  userId: number;
  products: Product[];
  total: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
}