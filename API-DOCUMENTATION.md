# T-Shirt Store API Documentation

Base URL: `http://localhost:3000` (or your deployed URL)

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User APIs](#user-apis)
3. [Product APIs](#product-apis)
4. [Cart APIs](#cart-apis)
5. [Wishlist APIs](#wishlist-apis)
6. [Order APIs](#order-apis)
7. [Admin APIs](#admin-apis)

## Authentication Required
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Authentication APIs

### 1.1 Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 1.2 Login User
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```


---

## 2. User APIs

### 2.1 Get User Profile
```bash
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2.2 Update User Profile
```bash
curl -X PUT http://localhost:3000/api/v1/user/update-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }'
```

---

## 3. Product APIs

### 3.1 Get All Products (with Pagination)
```bash
# Get all products with pagination
curl -X GET "http://localhost:3000/api/v1/products?page=1&limit=100"

# Default pagination (page=1, limit=10)
curl -X GET "http://localhost:3000/api/v1/products"
```

**Response:**
```json
{
  "success": true,
  "page": 1,
  "limit": 100,
  "totalPages": 1,
  "totalProducts": 36,
  "products": [...]
}
```

### 3.2 Get Products by Category
```bash
# Get Shiva T-shirts
curl -X GET "http://localhost:3000/api/v1/products/category/Shiva?page=1&limit=10"

# Get Shrooms T-shirts
curl -X GET "http://localhost:3000/api/v1/products/category/Shrooms?page=1&limit=10"

# Get LSD T-shirts
curl -X GET "http://localhost:3000/api/v1/products/category/LSD?page=1&limit=10"

# Get Chakras T-shirts
curl -X GET "http://localhost:3000/api/v1/products/category/Chakras?page=1&limit=10"

# Get Dark T-shirts
curl -X GET "http://localhost:3000/api/v1/products/category/Dark?page=1&limit=10"

# Get Rick n Morty T-shirts
curl -X GET "http://localhost:3000/api/v1/products/category/Rick%20n%20Morty?page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "totalProducts": 15,
  "products": [
    {
      "_id": "product_id",
      "name": "Shiva Meditation T-Shirt",
      "category": "Shiva",
      "price": 799,
      "sizes": ["S", "M", "L", "XL"],
      "images": ["url1", "url2"],
      "description": "Premium cotton T-shirt...",
      "stock": 50,
      "isFeatured": true
    }
  ]
}
```

### 3.3 Get Featured Products
```bash
curl -X GET "http://localhost:3000/api/v1/products/featured?limit=10"
```

### 3.4 Get Product by ID
```bash
curl -X GET http://localhost:3000/api/v1/products/PRODUCT_ID
```

### 3.5 Get QR Code (Payment)
```bash
curl -X GET http://localhost:3000/api/v1/get-qr \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```


---

## 4. Cart APIs

### 4.1 Add to Cart
```bash
curl -X POST http://localhost:3000/api/v1/cart/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 2,
    "size": "L"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart": {
    "_id": "cart_id",
    "user": "user_id",
    "items": [
      {
        "product": "product_id",
        "category": "Shiva",
        "quantity": 2,
        "size": "L",
        "priceSnapshot": 799
      }
    ]
  }
}
```

### 4.2 Get Cart
```bash
curl -X GET http://localhost:3000/api/v1/cart/get-cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "cart": [
    {
      "product": {
        "_id": "product_id",
        "name": "Shiva Meditation T-Shirt",
        "category": "Shiva",
        "price": 799,
        "images": ["url1", "url2"]
      },
      "category": "Shiva",
      "quantity": 2,
      "size": "L",
      "priceSnapshot": 799
    }
  ],
  "totalAmount": 1598
}
```

### 4.3 Update Cart Item Quantity
```bash
curl -X PUT http://localhost:3000/api/v1/cart/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 3
  }'
```

### 4.4 Remove from Cart
```bash
curl -X DELETE http://localhost:3000/api/v1/cart/remove/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4.5 Clear Cart
```bash
curl -X DELETE http://localhost:3000/api/v1/cart/clear-cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```


---

## 5. Wishlist APIs

### 5.1 Add to Wishlist (Toggle)
```bash
curl -X POST http://localhost:3000/api/v1/wishlist/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID"
  }'
```

**Note:** This endpoint toggles - if product exists, it removes it; if not, it adds it.

### 5.2 Get Wishlist
```bash
# Get all wishlist items
curl -X GET http://localhost:3000/api/v1/wishlist/get \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get wishlist filtered by category
curl -X GET "http://localhost:3000/api/v1/wishlist/get?category=Shiva" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "_id": "wishlist_id",
  "userId": "user_id",
  "products": [
    {
      "_id": "product_id",
      "name": "Shiva Meditation T-Shirt",
      "category": "Shiva",
      "price": 799,
      "images": ["url1", "url2"],
      "sizes": ["S", "M", "L", "XL"]
    }
  ],
  "cartCount": 3
}
```

### 5.3 Remove from Wishlist
```bash
curl -X DELETE http://localhost:3000/api/v1/wishlist/remove/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```


---

## 6. Order APIs

### 6.1 Create Order
```bash
curl -X POST http://localhost:3000/api/v1/orders/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "totalAmount": 1598,
    "address": {
      "line1": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "paymentMethod": "COD"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Order created",
  "order": {
    "_id": "order_id",
    "user": "user_id",
    "items": [
      {
        "product": "product_id",
        "category": "Shiva",
        "size": "L",
        "quantity": 2,
        "price": 799
      }
    ],
    "totalAmount": 1598,
    "address": {
      "line1": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "status": "Pending",
    "paymentMethod": "COD",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 6.2 Get User Orders
```bash
# Get all orders with pagination
curl -X GET "http://localhost:3000/api/v1/orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6.3 Get Order by ID
```bash
curl -X GET http://localhost:3000/api/v1/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6.4 Update Order
```bash
curl -X PUT http://localhost:3000/api/v1/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "line1": "456 New Street",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "country": "India"
    }
  }'
```

### 6.5 Delete Order
```bash
curl -X DELETE http://localhost:3000/api/v1/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```


---

## 7. Admin APIs

### 7.1 Admin Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 7.2 Create Product (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/add-product \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -F "name=Cosmic Shiva T-Shirt" \
  -F "description=Beautiful cosmic design featuring Lord Shiva" \
  -F "price=899" \
  -F "category=Shiva" \
  -F "sizes=S" \
  -F "sizes=M" \
  -F "sizes=L" \
  -F "sizes=XL" \
  -F "stock=50" \
  -F "isFeatured=true" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Valid Categories:**
- Shiva
- Shrooms
- LSD
- Chakras
- Dark
- Rick n Morty

### 7.3 Get All Products (Admin)
```bash
curl -X GET "http://localhost:3000/api/admin/get-all-products?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 7.4 Update Product (Admin)
```bash
curl -X PUT http://localhost:3000/api/admin/update-product/PRODUCT_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -F "name=Updated Shiva T-Shirt" \
  -F "price=999" \
  -F "category=Shiva" \
  -F "stock=30" \
  -F "isFeatured=true" \
  -F "images=@/path/to/new-image.jpg"
```

### 7.5 Delete Product (Admin)
```bash
curl -X DELETE http://localhost:3000/api/admin/delete-product/PRODUCT_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```


### 7.6 Get All Orders (Admin)
```bash
# Get all orders
curl -X GET "http://localhost:3000/api/admin/get-all-orders?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Filter by status
curl -X GET "http://localhost:3000/api/admin/get-all-orders?filter=pending" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Filter by category
curl -X GET "http://localhost:3000/api/admin/get-all-orders?category=Shiva" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Search orders
curl -X GET "http://localhost:3000/api/admin/get-all-orders?search=john" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Combined filters
curl -X GET "http://localhost:3000/api/admin/get-all-orders?filter=delivered&category=Shrooms&page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Valid Status Filters:**
- pending
- processing
- shipped
- out for delivery
- delivered
- cancelled

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": {
            "_id": "product_id",
            "name": "Shiva Meditation T-Shirt",
            "category": "Shiva"
          },
          "category": "Shiva",
          "size": "L",
          "quantity": 2,
          "price": 799
        }
      ],
      "totalAmount": 1598,
      "status": "Pending",
      "paymentMethod": "COD",
      "address": {...},
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "qrImage": {
    "public_id": "qr_id",
    "url": "https://cloudinary.com/qr-image.jpg"
  },
  "currentPage": 1,
  "totalPages": 5,
  "totalOrders": 48,
  "appliedFilters": {
    "search": "",
    "filter": "pending",
    "category": "Shiva"
  }
}
```

### 7.7 Get Order by ID (Admin)
```bash
curl -X GET http://localhost:3000/api/admin/get-order/ORDER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 7.8 Update Order Status (Admin)
```bash
curl -X PUT http://localhost:3000/api/admin/update-order/ORDER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Shipped"
  }'
```

**Valid Status Values:**
- Pending
- Processing
- Shipped
- Out for Delivery
- Delivered
- Cancelled

### 7.9 Delete Order (Admin)
```bash
curl -X DELETE http://localhost:3000/api/admin/delete-order/ORDER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 7.10 Get Order Statistics (Admin)
```bash
curl -X GET http://localhost:3000/api/admin/order-statistics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "statusCounts": [
    { "_id": "Pending", "count": 15 },
    { "_id": "Processing", "count": 8 },
    { "_id": "Shipped", "count": 12 },
    { "_id": "Delivered", "count": 45 },
    { "_id": "Cancelled", "count": 3 }
  ],
  "allStatuses": ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
  "totalOrders": 83
}
```

### 7.11 Upload QR Code (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/add-qr \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -F "qr=@/path/to/qr-code.png"
```


---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, invalid data)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not admin)
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. **Authentication**: Most endpoints require JWT token in Authorization header
2. **Admin Routes**: Require admin privileges (isAdmin: true in user document)
3. **File Uploads**: Use `multipart/form-data` for image uploads
4. **Pagination**: Default page=1, limit=10
5. **Categories**: Must be one of the 6 valid T-shirt categories
6. **Sizes**: S, M, L, XL
7. **Price Snapshot**: Cart and orders store price at time of action

---

## Environment Variables Required

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_JWT_SECRET=your_admin_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## Testing Tips

### 1. Get a Token
First, register/login to get a JWT token:
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

echo $TOKEN
```

### 2. Use Token in Requests
```bash
curl -X GET http://localhost:3000/api/v1/cart/get-cart \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Complete Flow
```bash
# 1. Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 2. Login and save token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

# 3. Get products
curl -X GET "http://localhost:3000/api/v1/products/category/Shiva"

# 4. Add to cart
curl -X POST http://localhost:3000/api/v1/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":2,"size":"L"}'

# 5. View cart
curl -X GET http://localhost:3000/api/v1/cart/get-cart \
  -H "Authorization: Bearer $TOKEN"

# 6. Create order
curl -X POST http://localhost:3000/api/v1/orders/create \
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
  }'
```

---

## Postman Collection

You can import these cURL commands into Postman or create a collection with:
- Environment variables for BASE_URL and TOKEN
- Pre-request scripts to auto-refresh tokens
- Test scripts to validate responses

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production:
- 100 requests per 15 minutes for general APIs
- 10 requests per minute for authentication APIs
- 50 requests per minute for admin APIs

---

## Support

For issues or questions:
1. Check error messages in response
2. Verify JWT token is valid
3. Ensure category names match exactly (case-sensitive)
4. Check that all required fields are provided
5. Verify file uploads use correct field names

---

**Last Updated:** January 2024
**API Version:** 1.0
**Backend:** Node.js + Express + MongoDB
