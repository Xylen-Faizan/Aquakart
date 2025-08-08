-- Add water_score column to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS water_score INTEGER NOT NULL DEFAULT 0;

-- Create a function to update water score when an order is placed
CREATE OR REPLACE FUNCTION update_water_score_on_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET water_score = water_score + 10  -- 10 points per order
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for the function
DROP TRIGGER IF EXISTS on_order_placed_water_score ON orders;
CREATE TRIGGER on_order_placed_water_score
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_water_score_on_order();

-- Create a function to update water score when a bottle is returned
CREATE OR REPLACE FUNCTION update_water_score_on_return()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.returned_at IS NOT NULL AND OLD.returned_at IS NULL THEN
    UPDATE customers
    SET water_score = water_score + 20  -- 20 points per returned bottle
    WHERE id = (
      SELECT customer_id
      FROM orders
      WHERE id = NEW.order_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for the function (assuming you have an order_items table with returned_at)
-- Note: You'll need to create this table if it doesn't exist
-- DROP TRIGGER IF EXISTS on_bottle_returned_water_score ON order_items;
-- CREATE TRIGGER on_bottle_returned_water_score
-- AFTER UPDATE ON order_items
-- FOR EACH ROW
-- WHEN (NEW.returned_at IS DISTINCT FROM OLD.returned_at)
-- EXECUTE FUNCTION update_water_score_on_return();

-- Create a function to update water score when a user subscribes
CREATE OR REPLACE FUNCTION update_water_score_on_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_plan_id IS NOT NULL AND (OLD.subscription_plan_id IS NULL OR OLD.subscription_plan_id != NEW.subscription_plan_id) THEN
    UPDATE customers
    SET water_score = water_score + 50  -- 50 points for subscribing
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for the function
DROP TRIGGER IF EXISTS on_customer_subscription ON customers;
CREATE TRIGGER on_customer_subscription
AFTER UPDATE ON customers
FOR EACH ROW
WHEN (NEW.subscription_plan_id IS DISTINCT FROM OLD.subscription_plan_id)
EXECUTE FUNCTION update_water_score_on_subscription();
