-- ============================================================================
-- ALPHA MOBILE STOCK SYSTEM - NEON POSTGRESQL AUTOMATED PRICING TRIGGER
-- ============================================================================
-- Description:
-- Automates retail_price calculation and cost breakdown (overhead, profit)
-- at the database level for all products in LKR.
--
-- Compatible with NeonDB (PostgreSQL 15+).
-- Safe to execute directly in the Neon Console SQL Editor.
-- ============================================================================

-- 1. Ensure `store_settings` table exists with required overhead cost columns
CREATE TABLE IF NOT EXISTS store_settings (
    id SERIAL PRIMARY KEY,
    rent_cost NUMERIC(14, 2) DEFAULT 0,
    electricity_cost NUMERIC(14, 2) DEFAULT 0,
    travel_cost NUMERIC(14, 2) DEFAULT 0,
    estimated_monthly_sales NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all columns exist even if the table was created earlier
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS rent_cost NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS electricity_cost NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS travel_cost NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS estimated_monthly_sales NUMERIC(14, 2) DEFAULT 0;

-- Ensure default settings record exists (ID = 1) to prevent empty SELECTs
INSERT INTO store_settings (id, rent_cost, electricity_cost, travel_cost, estimated_monthly_sales)
VALUES (1, 0, 0, 0, 1000)
ON CONFLICT (id) DO NOTHING;


-- 2. Ensure `products` table has all cost and pricing breakdown columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS buying_price NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS profit_margin_percentage NUMERIC(8, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS calculated_overhead NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS calculated_profit NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS retail_price NUMERIC(14, 2) DEFAULT 0;


-- 3. Create or replace the trigger function
CREATE OR REPLACE FUNCTION trg_calculate_product_retail_price()
RETURNS TRIGGER AS $$
DECLARE
    v_rent_cost NUMERIC := 0;
    v_electricity_cost NUMERIC := 0;
    v_travel_cost NUMERIC := 0;
    v_estimated_monthly_sales NUMERIC := 0;
    v_total_overheads NUMERIC := 0;
    v_overhead_per_item NUMERIC := 0;
    v_buying_price NUMERIC := 0;
    v_profit_margin NUMERIC := 0;
    v_base_cost NUMERIC := 0;
    v_profit_amount NUMERIC := 0;
BEGIN
    -- Step 1: Select overhead values from store_settings (assume ID = 1)
    SELECT 
        COALESCE(rent_cost, 0),
        COALESCE(electricity_cost, 0),
        COALESCE(travel_cost, 0),
        COALESCE(estimated_monthly_sales, 0)
    INTO 
        v_rent_cost,
        v_electricity_cost,
        v_travel_cost,
        v_estimated_monthly_sales
    FROM store_settings
    WHERE id = 1;

    -- Fallback safe defaults if no row is returned
    IF NOT FOUND THEN
        v_rent_cost := 0;
        v_electricity_cost := 0;
        v_travel_cost := 0;
        v_estimated_monthly_sales := 0;
    END IF;

    -- Step 2: Calculates total_overheads = rent_cost + electricity_cost + travel_cost
    v_total_overheads := v_rent_cost + v_electricity_cost + v_travel_cost;

    -- Step 3: Calculates overhead_per_item = total_overheads / NULLIF(estimated_monthly_sales, 0)
    -- to safely avoid division by zero
    IF v_estimated_monthly_sales > 0 THEN
        v_overhead_per_item := v_total_overheads / v_estimated_monthly_sales;
    ELSE
        v_overhead_per_item := 0;
    END IF;

    -- Step 4: Sets NEW.calculated_overhead = COALESCE(overhead_per_item, 0)
    NEW.calculated_overhead := ROUND(COALESCE(v_overhead_per_item, 0), 2);

    -- Step 5: Safe handling for buying_price & profit_margin_percentage (prevents NULL arithmetic errors)
    v_buying_price := COALESCE(NEW.buying_price, 0);
    v_profit_margin := COALESCE(NEW.profit_margin_percentage, 0);

    NEW.buying_price := v_buying_price;
    NEW.profit_margin_percentage := v_profit_margin;

    -- Step 6: Calculates base_cost = NEW.buying_price + NEW.calculated_overhead
    v_base_cost := v_buying_price + NEW.calculated_overhead;

    -- Step 7: Calculates profit_amount = base_cost * (NEW.profit_margin_percentage / 100)
    v_profit_amount := v_base_cost * (v_profit_margin / 100.0);

    -- Step 8: Sets NEW.calculated_profit = profit_amount
    NEW.calculated_profit := ROUND(v_profit_amount, 2);

    -- Step 9: Sets NEW.retail_price = ROUND(base_cost + profit_amount) (Round to nearest whole LKR amount)
    NEW.retail_price := ROUND(v_base_cost + v_profit_amount);

    -- Step 10: Seamless Frontend Backward Compatibility:
    -- If the existing products table uses the 'price' column for POS / billing,
    -- automatically keep 'price' synced with 'retail_price' so current screens continue functioning without breaking.
    IF (v_buying_price > 0 OR v_profit_margin > 0) THEN
        NEW.price := NEW.retail_price;
    ELSIF NEW.retail_price IS NOT NULL AND NEW.retail_price > 0 THEN
        NEW.price := NEW.retail_price;
    ELSIF NEW.price IS NOT NULL AND NEW.price > 0 THEN
        -- If an existing frontend screen submitted only 'price', keep it intact
        NEW.retail_price := ROUND(NEW.price);
    ELSE
        NEW.price := NEW.retail_price;
    END IF;

    -- Step 11: Return modified row
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 4. Drop trigger if already exists and attach the BEFORE INSERT OR UPDATE trigger
DROP TRIGGER IF EXISTS trg_calculate_product_retail_price ON products;

CREATE TRIGGER trg_calculate_product_retail_price
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trg_calculate_product_retail_price();

-- ============================================================================
-- VERIFICATION & BULK RECALCULATION (OPTIONAL HELPER)
-- To recalculate all existing products right now against current store_settings:
-- UPDATE products SET updated_at = NOW(); -- or UPDATE products SET buying_price = buying_price;
-- ============================================================================
