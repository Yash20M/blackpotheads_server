# T-Shirt Categories Reference

## Strict Category Enum

This backend supports **EXACTLY 6 T-shirt categories**. No other categories are allowed.

### Categories

1. **Shiva** - Spiritual and religious designs featuring Lord Shiva
2. **Shrooms** - Psychedelic mushroom-themed designs
3. **LSD** - Trippy and abstract psychedelic art
4. **Chakras** - Energy center and spiritual alignment designs
5. **Dark** - Gothic, dark aesthetic designs
6. **Rick n Morty** - Official Rick and Morty themed designs

### Usage in Code

```javascript
import { TSHIRT_CATEGORIES } from "../models/Product.js";

// Valid categories
TSHIRT_CATEGORIES.SHIVA          // "Shiva"
TSHIRT_CATEGORIES.SHROOMS        // "Shrooms"
TSHIRT_CATEGORIES.LSD            // "LSD"
TSHIRT_CATEGORIES.CHAKRAS        // "Chakras"
TSHIRT_CATEGORIES.DARK           // "Dark"
TSHIRT_CATEGORIES.RICK_N_MORTY   // "Rick n Morty"
```

### API Examples

#### Create Product
```json
POST /products
{
  "name": "Cosmic Shiva T-Shirt",
  "category": "Shiva",
  "price": 799,
  "sizes": ["S", "M", "L", "XL"],
  "description": "Beautiful Shiva design",
  "stock": 50
}
```

#### Get Products by Category
```
GET /products/category/Shiva
GET /products/category/Shrooms
GET /products/category/LSD
GET /products/category/Chakras
GET /products/category/Dark
GET /products/category/Rick n Morty
```

#### Filter Orders by Category (Admin)
```
GET /admin/orders?category=Shiva
GET /admin/orders?category=Rick n Morty
```

#### Filter Wishlist by Category
```
GET /wishlist?category=Chakras
GET /wishlist?category=Dark
```

### Validation

All product creation and update operations validate the category against this enum. Invalid categories will be rejected with a 400 error:

```json
{
  "success": false,
  "message": "Invalid category. Must be one of: Shiva, Shrooms, LSD, Chakras, Dark, Rick n Morty"
}
```

### Adding New Categories

To add a new category:

1. Update `TSHIRT_CATEGORIES` in `models/Product.js`
2. Update this documentation
3. Add seed data in `utils/data.js`
4. Test all APIs with new category

### Size Options

All T-shirts support these sizes:
- **S** - Small
- **M** - Medium
- **L** - Large
- **XL** - Extra Large

### Notes

- Category names are case-sensitive
- "Rick n Morty" includes a space (not "Rick and Morty")
- Each product must have exactly ONE category
- Categories cannot be mixed or combined
- All cart items, wishlist items, and order items store the category
