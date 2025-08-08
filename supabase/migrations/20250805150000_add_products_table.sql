-- Add products table
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    price decimal(10, 2) not null,
    image_url text,
    vendor_id uuid not null references public.vendors(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS for products table
alter table public.products enable row level security;

-- Drop existing policies if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable read access for all users') THEN
        DROP POLICY "Enable read access for all users" ON public.products;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable insert for vendors') THEN
        DROP POLICY "Enable insert for vendors" ON public.products;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable update for product owner') THEN
        DROP POLICY "Enable update for product owner" ON public.products;
    END IF;
END $$;

-- Create policies for the products table
CREATE POLICY "Enable read access for all users" 
ON public.products 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert for vendors" 
ON public.products 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'vendor'::user_role
    )
);

CREATE POLICY "Enable update for product owner" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- Create a function to update the updated_at column if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
