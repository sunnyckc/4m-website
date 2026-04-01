# 4M Image Download Instructions

## Manual Download Process

Since you're working for 4M and have access to their assets, here's how to systematically download their product images:

### Method 1: Browser Developer Tools

1. **Open each product page** in your browser
2. **Open Developer Tools** (F12 or right-click → Inspect)
3. **Go to Network tab** and filter by "Images"
4. **Reload the page** to capture all image requests
5. **Look for product images** (usually largest files)
6. **Right-click on image URLs** and "Open in new tab"
7. **Save images** to the appropriate product folders

### Method 2: Direct Image URL Pattern

Based on the 4M website structure, images might follow patterns like:
- `https://9swyzc.webcoix.com/upload/subpage1/[product-id]/image_1/[filename].jpg`
- `https://9swyzc.webcoix.com/images/products/[product-code]/[filename].jpg`

### Method 3: Contact 4M IT Department

Since you work for 4M, the fastest approach might be to:
1. Contact the IT/Web department
2. Request access to the product image repository
3. Get direct access to high-resolution product images
4. Obtain image usage guidelines and specifications

## Folder Structure to Maintain

```
my-store/public/images/products/
├── windmill-generator/
│   ├── main.jpg
│   ├── gallery-1.jpg
│   ├── gallery-2.jpg
│   └── gallery-3.jpg
├── potato-clock/
│   ├── main.jpg
│   ├── gallery-1.jpg
│   └── gallery-2.jpg
├── weather-station/
│   ├── main.jpg
│   ├── gallery-1.jpg
│   ├── gallery-2.jpg
│   └── gallery-3.jpg
└── [other-products]/
    └── ...
```

## Image Specifications

Based on the website analysis, maintain these specifications:
- **Main Images**: High resolution product shots on white background
- **Gallery Images**: Multiple angles, in-use shots, packaging
- **Format**: JPG or PNG
- **Size**: Optimize for web (under 500KB per image)
- **Dimensions**: Consistent aspect ratio (preferably square or 4:3)

## Quality Guidelines

1. **Main Image**: Clean product shot with packaging
2. **Gallery Image 1**: Product assembled/in use
3. **Gallery Image 2**: Components/parts laid out
4. **Gallery Image 3**: Packaging or instruction manual
5. **Additional Images**: Action shots, educational context

## Integration with Current Data

The product JSON is already structured to use these images:
```json
"images": {
  "main": "/images/products/windmill-generator/main.jpg",
  "gallery": [
    "/images/products/windmill-generator/gallery-1.jpg",
    "/images/products/windmill-generator/gallery-2.jpg",
    "/images/products/windmill-generator/gallery-3.jpg"
  ]
}
```

## Testing

After downloading images:
1. Start the development server: `npm run dev`
2. Navigate to `/products` page
3. Verify all images load correctly
4. Check image quality and consistency
5. Test on different screen sizes

## Backup Plan

If direct download isn't possible:
1. Use the generated placeholder images temporarily
2. Replace them gradually with real 4M images
3. Maintain the same file naming convention
4. Update image paths in the JSON as needed