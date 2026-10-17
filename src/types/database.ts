export type UserRole = 'customer' | 'admin';

export type OrderStatus = 
  | 'pending'
  | 'contacted'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  id: string;
  salon_name: string;
  salon_phone: string;
  admin_email: string;
  description: string;
  address: string;
  opening_hours: string;
  currency_symbol: string;
  currency_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Service {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  duration_minutes: number;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  category?: ServiceCategory;
}

export interface Hairstyle {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  service_id: string | null;
  price_hint: number | null;
  is_published: boolean;
  display_order: number;
  created_at?: string;
  service?: Service;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id: string | null;
  service_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_reference: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string; // digits only international format (e.g., 2349038418469)
  customer_notes: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  hairstyle_id: string | null;
  hairstyle_name: string | null;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  status_history?: OrderStatusHistoryItem[];
}

export interface CartItem {
  service: Service;
  quantity: number;
}
