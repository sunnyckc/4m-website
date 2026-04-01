# 4M Product Image Reference Guide

This guide contains the actual 4M product URLs and image references discovered during website analysis for manual download.

## Product Detail Pages Analyzed

### 1. Windmill Generator (00-03267)
- **Product URL**: https://9swyzc.webcoix.com/en/products/835/?back=%2Fen%2Fproducts%2F615%2F
- **Category**: Green Science > Science Education Toys
- **Images**: The page mentions "Video" - likely has product images and video content
- **Manual PDFs**: Available in multiple languages (English, French, German, Dutch, Italian, Spanish, Japanese)

### 2. Potato Clock (00-03275)
- **Product URL**: https://9swyzc.webcoix.com/en/products/834/?back=%2Fen%2Fproducts%2F615%2F
- **Category**: Green Science > Science Education Toys
- **Images**: The page mentions "Video" - likely has product images and video content
- **Manual PDFs**: Available in multiple languages

### 3. Weather Station (00-03279)
- **Product URL**: https://9swyzc.webcoix.com/en/products/833/?back=%2Fen%2Fproducts%2F615%2F
- **Category**: Green Science > Science Education Toys
- **Images**: The page mentions "Video" - likely has product images and video content
- **Manual PDFs**: Available in multiple languages

### 4. Clean Water Science (00-03281)
- **Product URL**: https://9swyzc.webcoix.com/en/products/832/?back=%2Fen%2Fproducts%2F615%2F
- **Category**: Green Science > Science Education Toys
- **Images**: The page mentions "Video" - likely has product images and video content
- **Manual PDFs**: Available in multiple languages

### 5. Salt-Powered Robot (00-03353)
- **Product URL**: https://9swyzc.webcoix.com/en/products/829/?back=%2Fen%2Fproducts%2F615%2F
- **Category**: Green Science > Science Education Toys
- **Images**: The page mentions "Video" - likely has product images and video content
- **Manual PDFs**: Available in multiple languages

### 6. Aqua Robot (00-03415)
- **Product URL**: https://9swyzc.webcoix.com/en/products/826/?back=%2Fen%2Fproducts%2F615%2F
- **Category**: Green Science > Science Education Toys
- **Images**: The page mentions "Video" - likely has product images and video content
- **Manual PDFs**: Available in multiple languages

## Additional Products Found

### 7. Green Rocket (00-03298)
- **Product URL**: https://9swyzc.webcoix.com/en/products/831/?back=%2Fen%2Fproducts%2F615%2F

### 8. Grow-A-Maze (00-03352)
- **Product URL**: https://9swyzc.webcoix.com/en/products/830/?back=%2Fen%2Fproducts%2F615%2F

### 9. Weather Science (00-03402)
- **Product URL**: https://9swyzc.webcoix.com/en/products/828/?back=%2Fen%2Fproducts%2F615%2F

### 10. Paper Making (00-03439)
- **Product URL**: https://9swyzc.webcoix.com/en/products/827/?back=%2Fen%2Fproducts%2F615%2F

### 11. Robot Rover (00-03417)
- **Product URL**: https://9swyzc.webcoix.com/en/products/825/?back=%2Fen%2Fproducts%2F615%2F

### 12. Water Pump (00-03425)
- **Product URL**: https://9swyzc.webcoix.com/en/products/824/?back=%2Fen%2Fproducts%2F615%2F

## Category Pages

### Science Education Toys
- **Main Category**: https://9swyzc.webcoix.com/en/products/615/
- **Green Science Subcategory**: https://9swyzc.webcoix.com/en/products/814/

## Image Extraction Instructions

1. **Visit each product detail page** using the URLs above
2. **Look for image sliders** - each product page mentions "Video" which likely includes product images
3. **Check browser developer tools** to find actual image URLs
4. **Download product images** and save them in the corresponding folders:
   ```
   my-store/public/images/products/[product-id]/main.jpg
   my-store/public/images/products/[product-id]/gallery-1.jpg
   my-store/public/images/products/[product-id]/gallery-2.jpg
   etc.
   ```

## Manual PDF Downloads

Each product has multilingual manuals available at paths like:
- `upload/subpage1/[product-number]/pdf_1/English.pdf`
- `upload/subpage1/[product-number]/pdf_1/French.pdf`
- etc.

## Product Specifications Extracted

All products share similar specifications:
- **Item Size**: Most are 16.7cm x 21.5cm x 5.8cm (some variations)
- **Packaging**: Format like "6/Inner 48/Master 9.2Kg 4.57Cuft"
- **Barcodes**: Format 4893156XXXXXX
- **Age Range**: Typically 8+ years
- **Awards**: Extensive award listings including STEM.org, Red Dot Awards, etc.

## Next Steps

1. Visit each product URL manually
2. Use browser developer tools to find image sources
3. Download images and place them in the appropriate product folders
4. Update the product JSON with any additional details found
5. Test the website with real 4M images

## Notes

- The current 4M website structure uses a content management system
- Product images are likely stored in a media folder on their server
- Video content is also available for most products
- Multi-language support is extensive across all products