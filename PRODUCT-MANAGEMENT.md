# Product Management Guide

This guide explains how to manage products, categories, and the filtering system in your 4M-style e-commerce website.

## 📁 File Structure

```
my-store/
├── public/data/
│   ├── products.json              # Main product data
│   └── product-categories.json    # Category configuration
├── src/data/
│   └── helpers.ts                 # Data access functions
└── src/pages/products/
    └── index.astro               # Products listing page
```

## 🏷️ Product Categories

### Category Configuration File
**Location:** `/public/data/product-categories.json`

This file defines the hierarchical category structure. Each category can have multiple subcategories.

```json
{
  "categories": [
    {
      "id": "science-education",
      "name": "Science Education Toys",
      "description": "Educational toys that make science fun and accessible",
      "subcategories": [
        {
          "id": "green-science",
          "name": "Green Science",
          "description": "Eco-friendly science experiments and renewable energy projects"
        }
      ]
    }
  ]
}
```

### Adding New Categories

1. **Add to category configuration:**
   ```json
   {
     "id": "new-category-id",
     "name": "Display Name",
     "description": "Category description",
     "subcategories": [...]
   }
   ```

2. **Update products to use the new category:**
   - Set `category` field to the new category ID
   - Set `subcategory` field to a subcategory ID

### Category Guidelines
- Use kebab-case for IDs (e.g., `science-education`)
- Keep names concise but descriptive
- Descriptions should explain what products fit in this category
- Subcategories are optional but recommended for better organization

## 📦 Product Data Structure

### Product Schema
**Location:** `/public/data/products.json`

```json
{
  "id": "unique-product-id",
  "product_code": "00-03267",           // 4M-style product code
  "name": "Product Name",
  "description": "Detailed description",
  "price": 24.99,
  "category": "science-education",       // Must match category ID
  "subcategory": "green-science",       // Must match subcategory ID
  "tags": ["tag1", "tag2"],            // Searchable keywords
  "images": {
    "main": "/images/products/product/main.jpg",
    "gallery": ["image1.jpg", "image2.jpg"]
  },
  "specifications": {
    "age_range": "8+ years",
    "includes": ["item1", "item2"]
  },
  "featured": true,                     // Show in featured sections
  "hot_item": true,                     // Mark as trending/popular item
  "created_at": "2026-01-15"
}
```

### Required Fields
- `id`: Unique identifier (kebab-case recommended)
- `product_code`: 4M-style code (format: XX-XXXXX)
- `name`: Product display name
- `description`: Detailed product description
- `price`: Numeric price value
- `category`: Must match a category ID from categories config
- `subcategory`: Must match a subcategory ID
- `featured`: Boolean for featured product status (used for backend logic, not displayed)
- `hot_item`: Boolean for trending/popular item status (displays "Hot" badge)
- `price`: Numeric price value (stored but not displayed on product cards)

### Adding New Products

1. **Create product entry in `/public/data/products.json`**
2. **Add product images to `/public/images/products/[product-folder]/`**
3. **Ensure category and subcategory IDs exist in categories config**

## 🔍 Search & Filter Features

### Search Functionality
The search bar searches across:
- Product names
- Product codes (e.g., "00-03267")
- Product descriptions
- Tags

### Filter Options
1. **Category Filter**: Hierarchical navigation with main categories and subcategories
2. **Hot Items Filter**: All Items / Hot Items Only / Regular Items Only
3. **Sort Options**: Name, Price, Product Code

### Customizing Filters

To modify search/filter behavior, edit the JavaScript in `/src/pages/products/index.astro`:

```javascript
// Search filter logic
const matchesSearch = !searchTerm || 
  name.includes(searchTerm) || 
  code.includes(searchTerm) ||
  description.includes(searchTerm) ||
  tags.includes(searchTerm);
```

## 🛠️ Configuration Management

### Updating Category Structure

**⚠️ Important:** When changing category structure:

1. **Update categories config first:** `/public/data/product-categories.json`
2. **Update existing products:** Ensure all products use valid category/subcategory IDs
3. **Test the filters:** Verify all categories appear correctly in the UI

### Data Validation

The system includes TypeScript interfaces for data validation:
- `Product` interface in `/src/data/helpers.ts`
- `ProductCategory` and `ProductSubcategory` interfaces

### Helper Functions

Available data access functions in `/src/data/helpers.ts`:
- `getProducts()`: Get all products
- `getProductCategories()`: Get category configuration
- `getCategoryById(id)`: Get specific category
- `searchProducts(products, term)`: Search products
- `getProductsByCategory(category)`: Filter by category
- `getFeaturedProducts()`: Get all featured products
- `getHotProducts()`: Get all hot/trending products

## 🎨 UI Customization

### Category Navigation Styling
Categories are displayed as tabs with hover effects. Customize in the Astro component:
```astro
<button class="category-tab whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors hover:text-primary hover:border-primary">
```

### Product Card Layout
Product cards show:
- Product image
- Hot Item badge (top-left corner, when applicable)
- Category badge and product code
- Product name and description
- "Details" button

### Badge System
- **Hot Item Badge**: Orange badge for trending/popular items (no emoji)

## 🚀 Best Practices

1. **Product Codes**: Use consistent format (XX-XXXXX) for easy searching
2. **Images**: Optimize images for web (WebP format recommended)
3. **Categories**: Keep hierarchy shallow (max 2 levels: category → subcategory)
4. **Tags**: Use relevant, searchable keywords
5. **Descriptions**: Write clear, informative product descriptions
6. **Hot Items**: Review and update hot item status regularly for marketing impact

## 🔧 Troubleshooting

### Products Not Appearing
- Check category/subcategory IDs match categories config
- Verify JSON syntax is valid
- Ensure `hot_item` and `featured` are boolean, not string
- Verify `featured` and `hot_item` fields are present

### Search Not Working
- Check product has searchable content (name, code, description, tags)
- Verify search terms are being converted to lowercase

### Hot Items Filter Not Working
- Verify `hot_item` field is boolean (true/false), not string
- Check that products have the `hot_item` field present

### Categories Not Showing
- Verify categories config file exists and is valid JSON
- Check category structure matches expected format
- Ensure subcategories array exists (can be empty)

## 🔥 Hot Items Feature

The `hot_item` field allows you to mark products as trending or popular. This feature:

### Usage
- Set `"hot_item": true` in product data to mark as hot
- Hot items display with a 🔥 orange badge
- Filter products to show only hot items or exclude them
- Use for seasonal promotions, bestsellers, or trending products

### Marketing Applications
- **Seasonal Campaigns**: Mark holiday-themed products as hot
- **New Releases**: Highlight recently launched products
- **Bestsellers**: Showcase top-performing items
- **Limited Time**: Create urgency for special offers

### Management Tips
- Review and update hot items regularly (monthly/quarterly)
- Don't mark too many items as hot (loses impact)
- Consider combining with featured status for maximum visibility
- Use analytics to identify which products should be marked as hot

## 📝 Future Enhancements

Consider these features for future development:
- Price range filtering
- Advanced search with multiple criteria
- Product comparison tool
- Bulk product import/export
- Category-specific product templates
- Multi-language category names
- Hot items analytics and automatic detection
- Time-based hot item expiration