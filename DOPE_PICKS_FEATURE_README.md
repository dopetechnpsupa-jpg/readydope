# Dope Picks Feature

## Overview
The Dope Picks feature allows administrators to manually select which products appear in the "Dope Picks" section on the homepage, instead of using random selection.

## Features

### 1. Manual Product Selection
- Admins can now manually select products to feature in the Dope Picks section
- Products can be toggled on/off using a star icon in the admin panel
- The selection is persistent and stored in the database

### 2. Visual Indicators
- **Star Icon**: Appears next to each product in the admin panel
- **Filled Star**: Product is currently in Dope Picks (yellow background)
- **Empty Star**: Product is not in Dope Picks (gray background)
- **Hover Tooltip**: Shows "Add to Dope Picks" or "Remove from Dope Picks"

### 3. Admin Panel Integration
- Star icon button added to each product card in the Products tab
- Checkbox option in Add/Edit Product forms
- Real-time updates when toggling dope pick status

## Database Changes

### New Column
- `is_dope_pick` (BOOLEAN) - Added to the `products` table
- Default value: `FALSE`
- Indexed for better query performance

### Migration Script
Run the `database-migration.sql` script in your Supabase SQL editor to:
1. Add the `is_dope_pick` column
2. Set default values for existing products
3. Create an index for performance

## How to Use

### For Administrators

#### 1. Toggle Dope Pick Status
1. Go to the DopeTech Admin panel (`/dopetechadmin`)
2. Navigate to the Products tab
3. Click the star icon next to any product:
   - **Empty star** → Click to add to Dope Picks
   - **Filled star** → Click to remove from Dope Picks

#### 2. Set Dope Pick Status During Creation
1. Click "Add Product" in the admin panel
2. Check the "Add to Dope Picks" checkbox if desired
3. Save the product

#### 3. Modify Dope Pick Status
1. Click the edit button (pencil icon) on any product
2. Check/uncheck the "Add to Dope Picks" checkbox
3. Save changes

### For Users
- The Dope Picks section on the homepage will now show only manually selected products
- If no products are manually selected, the system falls back to the original random selection
- Maximum of 6 products displayed in the Dope Picks section

## Technical Implementation

### Backend Changes
- `Product` interface updated with `is_dope_pick?: boolean` field
- `getDopePicks()` function modified to query by `is_dope_pick = true`
- `toggleDopePick()` function added for real-time status updates
- `addProduct()` and `updateProduct()` functions updated to handle the new field

### Frontend Changes
- Star icon button added to product cards in admin panel
- Checkbox controls added to Add/Edit Product forms
- Real-time state updates when toggling dope pick status
- Toast notifications for user feedback

### API Endpoints
- No new API endpoints required
- Uses existing product management functions with enhanced data handling

## Benefits

1. **Better Control**: Admins can curate exactly which products to feature
2. **Consistent Experience**: Users see the same featured products instead of random selections
3. **Marketing Flexibility**: Highlight specific products, new arrivals, or promotional items
4. **Performance**: Indexed database queries for faster dope picks retrieval

## Fallback Behavior

If no products are manually selected as dope picks:
- The system falls back to the original random selection algorithm
- Uses products with `hidden_on_home = false`
- Maintains the same user experience as before

## Future Enhancements

Potential improvements for future versions:
- Bulk selection of multiple products
- Scheduled dope picks (time-based featuring)
- Category-based dope picks
- Analytics on dope picks performance
- A/B testing for different dope picks selections
