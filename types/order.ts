export type OrderStatus = 'delivered' | 'processing' | 'cancelled' | 'shipped';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ShippingAddress {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: ShippingAddress;
}
