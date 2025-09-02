-- Test script to check the current state of the products table
-- Run this in your Supabase SQL editor to debug the issue

-- Check if the is_dope_pick column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'is_dope_pick';

-- Check the current values of is_dope_pick for a few products
SELECT id, name, is_dope_pick, 
       CASE 
         WHEN is_dope_pick IS NULL THEN 'NULL'
         WHEN is_dope_pick = true THEN 'TRUE'
         WHEN is_dope_pick = false THEN 'FALSE'
         ELSE 'UNKNOWN'
       END as status
FROM products 
ORDER BY id 
LIMIT 10;

-- Count how many products have each status
SELECT 
  CASE 
    WHEN is_dope_pick IS NULL THEN 'NULL'
    WHEN is_dope_pick = true THEN 'TRUE'
    WHEN is_dope_pick = false THEN 'FALSE'
    ELSE 'UNKNOWN'
  END as status,
  COUNT(*) as count
FROM products 
GROUP BY is_dope_pick;

-- If the column doesn't exist or has issues, run this to fix it:
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS is_dope_pick BOOLEAN DEFAULT FALSE;
-- UPDATE products SET is_dope_pick = FALSE WHERE is_dope_pick IS NULL;
