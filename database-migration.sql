-- Database Migration: Add is_dope_pick column to products table
-- Run this script in your Supabase SQL editor or database management tool

-- Add the is_dope_pick column to the products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_dope_pick BOOLEAN DEFAULT FALSE;

-- Update existing products to have is_dope_pick = false by default
UPDATE products 
SET is_dope_pick = FALSE 
WHERE is_dope_pick IS NULL;

-- Create an index on the is_dope_pick column for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_dope_pick ON products(is_dope_pick);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'is_dope_pick';
