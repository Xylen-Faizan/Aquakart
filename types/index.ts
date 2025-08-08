// This is the central definition for a Product
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    vendor_id: string;
    size: string;
    rating: number;
    delivery_time: string;
  }
  
  // This is the central definition for a Vendor
  // It now correctly includes all the necessary fields
  export interface Vendor {
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    rating: number | null;
    delivery_time_range: string | null;
    is_certified: boolean;
    latitude: number | null;
    longitude: number | null;
  }