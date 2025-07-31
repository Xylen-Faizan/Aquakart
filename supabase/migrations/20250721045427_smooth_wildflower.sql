/*
  # Fix Vendor Authentication and RLS Policies

  1. Security Updates
    - Fix RLS policies for vendors table
    - Add proper INSERT policies for vendor registration
    - Update user_roles policies for vendor signup
    - Add helper function for role checking

  2. Authentication Flow
    - Ensure vendors can register and login properly
    - Fix role-based redirects
    - Add proper error handling
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON vendors;
DROP POLICY IF EXISTS "Enable read/update for users based on user_id" ON vendors;
DROP POLICY IF EXISTS "Vendors can read own profile" ON vendors;
DROP POLICY IF EXISTS "Vendors can update own profile" ON vendors;

-- Create proper vendor policies
CREATE POLICY "Vendors can insert own profile"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Vendors can read own profile"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Vendors can update own profile"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Customers can view verified vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (is_verified = true);

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create helper function for role checking
CREATE OR REPLACE FUNCTION has_role(user_id uuid, check_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = has_role.user_id 
    AND user_roles.role = check_role
  );
END;
$$;

-- Ensure customers table has proper policies too
DROP POLICY IF EXISTS "Customers can read own profile" ON customers;
DROP POLICY IF EXISTS "Customers can update own profile" ON customers;

CREATE POLICY "Customers can insert own profile"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Customers can read own profile"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own profile"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);