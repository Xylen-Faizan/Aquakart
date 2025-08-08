-- Create order_status enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
    END IF;
END$$;

-- Create orders table
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid not null references public.customers(id) on delete cascade,
    vendor_id uuid not null references public.vendors(id) on delete cascade,
    status public.order_status not null default 'pending',
    total_amount decimal(10, 2) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create order_items table
create table if not exists public.order_items (
    id uuid default gen_random_uuid() primary key,
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity integer not null,
    price_per_unit decimal(10, 2) not null,
    created_at timestamptz not null default now()
);

-- Enable RLS for orders and order_items
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Drop existing policies if they exist
DO $$
BEGIN
    -- Orders table policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Customers can view their own orders') THEN
        DROP POLICY "Customers can view their own orders" ON public.orders;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Vendors can view their own orders') THEN
        DROP POLICY "Vendors can view their own orders" ON public.orders;
    END IF;
    
    -- Order items table policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Customers can view items from their orders') THEN
        DROP POLICY "Customers can view items from their orders" ON public.order_items;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Vendors can view items from their orders') THEN
        DROP POLICY "Vendors can view items from their orders" ON public.order_items;
    END IF;
END $$;

-- Create policies for orders table
CREATE POLICY "Customers can view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated 
USING (customer_id = auth.uid());

CREATE POLICY "Vendors can view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated 
USING (vendor_id = auth.uid());

-- Create policies for order_items table
CREATE POLICY "Customers can view items from their orders" 
ON public.order_items 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = order_id 
        AND customer_id = auth.uid()
    )
);

CREATE POLICY "Vendors can view items from their orders" 
ON public.order_items 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = order_id 
        AND vendor_id = auth.uid()
    )
);

-- Create a trigger to update the updated_at column for orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
