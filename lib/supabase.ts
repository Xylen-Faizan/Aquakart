import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom storage adapter for AsyncStorage
const storageAdapter = {
  getItem: (key: string) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key);
  },
};

// Polyfill for structuredClone if not available
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter, // Use the custom adapter
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types
export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer extends User {
  addresses: Address[];
  default_address_id?: string;
  loyalty_points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  eco_mode: boolean;
  total_orders: number;
  total_spent: number;
}

export interface Vendor extends User {
  business_name: string;
  license_number: string;
  service_radius: number;
  location: {
    latitude: number;
    longitude: number;
  };
  is_online: boolean;
  is_verified: boolean;
  rating: number;
  total_deliveries: number;
  total_earnings: number;
  brands: string[];
  working_hours: {
    start: string;
    end: string;
  };
}

export interface Address {
  id: string;
  user_id: string;
  title: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
}

export interface Order {
  id: string;
  customer_id: string;
  vendor_id: string;
  items: OrderItem[];
  total_amount: number;
  delivery_fee: number;
  status: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  delivery_address: Address;
  estimated_delivery_time: string;
  actual_delivery_time?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method: 'card' | 'upi' | 'cod';
  stripe_payment_intent_id?: string;
  vendor_location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  brand: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Inventory {
  id: string;
  vendor_id: string;
  brand: string;
  size: string;
  stock: number;
  price: number;
  is_available: boolean;
}