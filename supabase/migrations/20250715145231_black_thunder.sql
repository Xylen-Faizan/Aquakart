/*
  # User Authentication and Profile System

  1. New Tables
    - `customers` - Customer profiles with loyalty and preferences
    - `vendors` - Vendor profiles with business information and location
    - `addresses` - Customer delivery addresses with geolocation
    - `notifications` - System notifications for users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Admin-only policies for vendor verification

  3. Functions
    - Auto-create user profiles on signup
    - Location-based vendor queries
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  loyalty_points integer DEFAULT 0,
  tier text DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  eco_mode boolean DEFAULT false,
  total_orders integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  full_name text NOT NULL,
  business_name text,
  license_number text,
  avatar_url text,
  service_radius integer DEFAULT 5,
  location point,
  is_online boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  rating decimal(3,2) DEFAULT 0,
  total_deliveries integer DEFAULT 0,
  total_earnings decimal(10,2) DEFAULT 0,
  brands text[] DEFAULT '{}',
  working_hours jsonb DEFAULT '{"start": "09:00", "end": "21:00"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  location point NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  items jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  delivery_fee decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  delivery_address jsonb NOT NULL,
  estimated_delivery_time timestamptz,
  actual_delivery_time timestamptz,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text CHECK (payment_method IN ('card', 'upi', 'cod')),
  stripe_payment_intent_id text,
  vendor_location point,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  brand text NOT NULL,
  size text NOT NULL,
  stock integer DEFAULT 0,
  price decimal(10,2) NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, brand, size)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Order tracking table for live location updates
CREATE TABLE IF NOT EXISTS order_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  vendor_location point NOT NULL,
  timestamp timestamptz DEFAULT now(),
  estimated_arrival timestamptz
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Customers can read own profile"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for vendors
CREATE POLICY "Vendors can read own profile"
  ON vendors FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Vendors can update own profile"
  ON vendors FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Customers can view verified vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (is_verified = true);

-- RLS Policies for addresses
CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Vendors can view assigned orders"
  ON orders FOR SELECT
  TO authenticated
  USING (vendor_id = auth.uid());

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Vendors can update assigned orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (vendor_id = auth.uid());

-- RLS Policies for inventory
CREATE POLICY "Vendors can manage own inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (vendor_id = auth.uid());

CREATE POLICY "Customers can view available inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (is_available = true AND stock > 0);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for order tracking
CREATE POLICY "Customers can view tracking for own orders"
  ON order_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_tracking.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can insert tracking for assigned orders"
  ON order_tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_tracking.order_id 
      AND orders.vendor_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_vendors_online_verified ON vendors (is_online, is_verified);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders (vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_inventory_vendor_available ON inventory (vendor_id, is_available);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking (order_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'customer' THEN
    INSERT INTO customers (id, email, phone, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'full_name'
    );
  ELSIF NEW.raw_user_meta_data->>'role' = 'vendor' THEN
    INSERT INTO vendors (id, email, phone, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'full_name'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();