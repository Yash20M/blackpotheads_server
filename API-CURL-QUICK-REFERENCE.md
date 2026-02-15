# API cURL Quick Reference

## Setup
```bash
# Set base URL
BASE_URL="http://localhost:3000"

# After login, save token
TOKEN="your_jwt_token_here"
ADMIN_TOKEN="your_admin_token_here"
```

## Authentication

```bash
# Register
curl -X POST $BASE_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Products

```bash
# Get all products with pagination
curl -X GET "$BASE_URL/api/v1/products?page=1&limit=100"

# Get by category
curl -X GET "$BASE_URL/api/v1/products/category/Shiva?page=1&limit=10"
curl -X GET "$BASE_URL/api/v1/products/category/Shrooms"
curl -X GET "$BASE_URL/api/v1/products/category/LSD"
curl -X GET "$BASE_URL/api/v1/products/category/Chakras"
curl -X GET "$BASE_URL/api/v1/products/category/Dark"
curl -X GET "$BASE_URL/api/v1/products/category/Rick%20n%20Morty"

# Get featured
curl -X GET "$BASE_URL/api/v1/products/featured?limit=10"

# Get by ID
curl -X GET $BASE_URL/api/v1/products/PRODUCT_ID
```

## Cart

```bash
# Add to cart
curl -X POST $BASE_URL/api/v1/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":2,"size":"L"}'

# Get cart
curl -X GET $BASE_URL/api/v1/cart/get-cart \
  -H "Authorization: Bearer $TOKEN"

# Update quantity
curl -X PUT $BASE_URL/api/v1/cart/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":3}'

# Remove item
curl -X DELETE $BASE_URL/api/v1/cart/remove/PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"

# Clear cart
curl -X DELETE $BASE_URL/api/v1/cart/clear-cart \
  -H "Authorization: Bearer $TOKEN"
```


## Wishlist

```bash
# Add/Remove (toggle)
curl -X POST $BASE_URL/api/v1/wishlist/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID"}'

# Get wishlist
curl -X GET $BASE_URL/api/v1/wishlist/get \
  -H "Authorization: Bearer $TOKEN"

# Get by category
curl -X GET "$BASE_URL/api/v1/wishlist/get?category=Shiva" \
  -H "Authorization: Bearer $TOKEN"

# Remove
curl -X DELETE $BASE_URL/api/v1/wishlist/remove/PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Orders

```bash
# Create order
curl -X POST $BASE_URL/api/v1/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "totalAmount":1598,
    "address":{
      "line1":"123 Main Street",
      "city":"Mumbai",
      "state":"Maharashtra",
      "pincode":"400001",
      "country":"India"
    },
    "paymentMethod":"COD"
  }'

# Get orders
curl -X GET "$BASE_URL/api/v1/orders?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Get order by ID
curl -X GET $BASE_URL/api/v1/orders/ORDER_ID \
  -H "Authorization: Bearer $TOKEN"

# Update order
curl -X PUT $BASE_URL/api/v1/orders/ORDER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address":{"line1":"New Address"}}'

# Delete order
curl -X DELETE $BASE_URL/api/v1/orders/ORDER_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Admin - Authentication

```bash
# Admin login
curl -X POST $BASE_URL/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Admin - Products

```bash
# Create product
curl -X POST $BASE_URL/api/admin/add-product \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Cosmic Shiva T-Shirt" \
  -F "description=Beautiful cosmic design" \
  -F "price=899" \
  -F "category=Shiva" \
  -F "sizes=S" -F "sizes=M" -F "sizes=L" -F "sizes=XL" \
  -F "stock=50" \
  -F "isFeatured=true" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"

# Get all products
curl -X GET "$BASE_URL/api/admin/get-all-products?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Update product
curl -X PUT $BASE_URL/api/admin/update-product/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Updated Name" \
  -F "price=999" \
  -F "stock=30"

# Delete product
curl -X DELETE $BASE_URL/api/admin/delete-product/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Admin - Orders

```bash
# Get all orders
curl -X GET "$BASE_URL/api/admin/get-all-orders?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Filter by status
curl -X GET "$BASE_URL/api/admin/get-all-orders?filter=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Filter by category
curl -X GET "$BASE_URL/api/admin/get-all-orders?category=Shiva" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Search orders
curl -X GET "$BASE_URL/api/admin/get-all-orders?search=john" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Combined filters
curl -X GET "$BASE_URL/api/admin/get-all-orders?filter=delivered&category=Shrooms&search=john&page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get order by ID
curl -X GET $BASE_URL/api/admin/get-order/ORDER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Update order status
curl -X PUT $BASE_URL/api/admin/update-order/ORDER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"Shipped"}'

# Delete order
curl -X DELETE $BASE_URL/api/admin/delete-order/ORDER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get statistics
curl -X GET $BASE_URL/api/admin/order-statistics \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Admin - QR Code

```bash
# Upload QR code
curl -X POST $BASE_URL/api/admin/add-qr \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "qr=@/path/to/qr-code.png"

# Get QR code
curl -X GET $BASE_URL/api/v1/get-qr \
  -H "Authorization: Bearer $TOKEN"
```

## User Profile

```bash
# Get profile
curl -X GET $BASE_URL/api/v1/user/profile \
  -H "Authorization: Bearer $TOKEN"

# Update profile
curl -X PUT $BASE_URL/api/v1/user/update-profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"new@example.com"}'
```

## Health Check

```bash
# Check server health
curl -X GET $BASE_URL/api/v1/health
```

## Complete Test Flow

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# 1. Register
echo "1. Registering user..."
curl -X POST $BASE_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 2. Login and get token
echo -e "\n\n2. Logging in..."
TOKEN=$(curl -s -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 3. Get products
echo -e "\n\n3. Getting Shiva products..."
PRODUCTS=$(curl -s -X GET "$BASE_URL/api/v1/products/category/Shiva?limit=1")
echo $PRODUCTS | jq '.'

# Extract first product ID
PRODUCT_ID=$(echo $PRODUCTS | jq -r '.products[0]._id')
echo "Product ID: $PRODUCT_ID"

# 4. Add to wishlist
echo -e "\n\n4. Adding to wishlist..."
curl -X POST $BASE_URL/api/v1/wishlist/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\"}"

# 5. Add to cart
echo -e "\n\n5. Adding to cart..."
curl -X POST $BASE_URL/api/v1/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":2,\"size\":\"L\"}"

# 6. Get cart
echo -e "\n\n6. Getting cart..."
curl -X GET $BASE_URL/api/v1/cart/get-cart \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 7. Create order
echo -e "\n\n7. Creating order..."
curl -X POST $BASE_URL/api/v1/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "totalAmount":1598,
    "address":{
      "line1":"123 Main St",
      "city":"Mumbai",
      "state":"Maharashtra",
      "pincode":"400001",
      "country":"India"
    },
    "paymentMethod":"COD"
  }' | jq '.'

# 8. Get orders
echo -e "\n\n8. Getting orders..."
curl -X GET "$BASE_URL/api/v1/orders?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n\nTest flow completed!"
```

## Categories Reference

Valid categories (case-sensitive):
- `Shiva`
- `Shrooms`
- `LSD`
- `Chakras`
- `Dark`
- `Rick n Morty`

## Sizes Reference

Valid sizes:
- `S` - Small
- `M` - Medium
- `L` - Large
- `XL` - Extra Large

## Order Status Values

Valid status values (case-sensitive):
- `Pending`
- `Processing`
- `Shipped`
- `Out for Delivery`
- `Delivered`
- `Cancelled`
