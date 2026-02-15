# API Response Examples

Complete examples of API responses for all endpoints.

## Authentication Responses

### Register User - Success
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YTFiMmMzZDRlNWY2ZzdoOGk5ajBrMSIsImlhdCI6MTcwNTMxNDYwMCwiZXhwIjoxNzA1OTE5NDAwfQ.abc123def456"
}
```

### Login - Success
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false
  }
}
```

### Login - Error (Invalid Credentials)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Product Responses

### Get Products by Category - Success
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "totalProducts": 15,
  "products": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Shiva Meditation T-Shirt",
      "description": "Premium cotton T-shirt featuring Lord Shiva in deep meditation",
      "price": 799,
      "category": "Shiva",
      "sizes": ["S", "M", "L", "XL"],
      "images": [
        "https://res.cloudinary.com/demo/image/upload/v1234567890/shiva-1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1234567890/shiva-2.jpg"
      ],
      "stock": 50,
      "isFeatured": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Shiva Trishul T-Shirt",
      "description": "Powerful Trishul design representing Lord Shiva's divine weapon",
      "price": 799,
      "category": "Shiva",
      "sizes": ["S", "M", "L", "XL"],
      "images": [
        "https://res.cloudinary.com/demo/image/upload/v1234567890/trishul-1.jpg"
      ],
      "stock": 30,
      "isFeatured": false,
      "createdAt": "2024-01-12T09:00:00.000Z",
      "updatedAt": "2024-01-12T09:00:00.000Z"
    }
  ]
}
```

### Get Featured Products - Success
```json
{
  "success": true,
  "totalProducts": 6,
  "products": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Shiva Meditation T-Shirt",
      "category": "Shiva",
      "price": 799,
      "images": ["url1", "url2"],
      "isFeatured": true
    }
  ]
}
```

### Get Product by ID - Success
```json
{
  "success": true,
  "product": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Cosmic Shrooms T-Shirt",
    "description": "Psychedelic mushroom design with vibrant colors",
    "price": 899,
    "category": "Shrooms",
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://res.cloudinary.com/demo/image/upload/v1234567890/shrooms-1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1234567890/shrooms-2.jpg"
    ],
    "stock": 40,
    "isFeatured": true,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Product - Error (Not Found)
```json
{
  "success": false,
  "message": "Product not found"
}
```


## Cart Responses

### Add to Cart - Success
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "user": "65a1b2c3d4e5f6g7h8i9j0k1",
    "items": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
        "product": "65a1b2c3d4e5f6g7h8i9j0k2",
        "category": "Shiva",
        "quantity": 2,
        "size": "L",
        "priceSnapshot": 799
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### Get Cart - Success
```json
{
  "success": true,
  "cart": [
    {
      "product": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Shiva Meditation T-Shirt",
        "description": "Premium cotton T-shirt...",
        "price": 799,
        "category": "Shiva",
        "sizes": ["S", "M", "L", "XL"],
        "images": [
          "https://res.cloudinary.com/demo/image/upload/v1234567890/shiva-1.jpg",
          "https://res.cloudinary.com/demo/image/upload/v1234567890/shiva-2.jpg"
        ],
        "stock": 50,
        "isFeatured": true
      },
      "category": "Shiva",
      "quantity": 2,
      "size": "L",
      "priceSnapshot": 799
    },
    {
      "product": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
        "name": "Cosmic Shrooms T-Shirt",
        "price": 899,
        "category": "Shrooms",
        "images": ["url1", "url2"]
      },
      "category": "Shrooms",
      "quantity": 1,
      "size": "M",
      "priceSnapshot": 899
    }
  ],
  "totalAmount": 2497
}
```

### Get Cart - Empty
```json
{
  "message": "Cart not found"
}
```

### Update Cart - Success
```json
{
  "success": true,
  "message": "Cart updated",
  "cart": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "user": "65a1b2c3d4e5f6g7h8i9j0k1",
    "items": [
      {
        "product": "65a1b2c3d4e5f6g7h8i9j0k2",
        "category": "Shiva",
        "quantity": 3,
        "size": "L",
        "priceSnapshot": 799
      }
    ]
  }
}
```

### Remove from Cart - Success
```json
{
  "success": true,
  "message": "Product removed from cart",
  "cart": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "user": "65a1b2c3d4e5f6g7h8i9j0k1",
    "items": []
  }
}
```

### Clear Cart - Success
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

## Wishlist Responses

### Add to Wishlist - Success (Added)
```json
{
  "success": true,
  "message": "Product added to wishlist"
}
```

### Add to Wishlist - Success (Removed)
```json
{
  "success": true,
  "message": "Product removed from wishlist"
}
```

### Get Wishlist - Success
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k7",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "products": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Shiva Meditation T-Shirt",
      "category": "Shiva",
      "price": 799,
      "images": [
        "https://res.cloudinary.com/demo/image/upload/v1234567890/shiva-1.jpg"
      ],
      "sizes": ["S", "M", "L", "XL"],
      "stock": 50,
      "isFeatured": true
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "name": "Fractal LSD T-Shirt",
      "category": "LSD",
      "price": 899,
      "images": ["url1", "url2"],
      "sizes": ["S", "M", "L", "XL"],
      "stock": 42,
      "isFeatured": true
    }
  ],
  "cartCount": 2
}
```

### Get Wishlist - Empty
```json
{
  "message": "Wishlist not found"
}
```

## Order Responses

### Create Order - Success
```json
{
  "success": true,
  "message": "Order created",
  "order": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
    "user": "65a1b2c3d4e5f6g7h8i9j0k1",
    "items": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
        "product": "65a1b2c3d4e5f6g7h8i9j0k2",
        "category": "Shiva",
        "size": "L",
        "quantity": 2,
        "price": 799
      },
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0ka",
        "product": "65a1b2c3d4e5f6g7h8i9j0k3",
        "category": "Shrooms",
        "size": "M",
        "quantity": 1,
        "price": 899
      }
    ],
    "totalAmount": 2497,
    "address": {
      "line1": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "status": "Pending",
    "paymentMethod": "COD",
    "createdAt": "2024-01-15T10:40:00.000Z"
  }
}
```

### Create Order - Error (Empty Cart)
```json
{
  "message": "Cart is empty"
}
```

### Create Order - Error (Amount Mismatch)
```json
{
  "message": "Total amount is not correct"
}
```

### Get Orders - Success
```json
{
  "orders": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "user": "65a1b2c3d4e5f6g7h8i9j0k1",
      "items": [
        {
          "product": {
            "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
            "name": "Shiva Meditation T-Shirt",
            "category": "Shiva",
            "images": ["url1"]
          },
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
      "status": "Delivered",
      "paymentMethod": "COD",
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  ],
  "totalPages": 3
}
```

### Get Order by ID - Success
```json
{
  "order": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
    "user": "65a1b2c3d4e5f6g7h8i9j0k1",
    "items": [
      {
        "product": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
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
    "address": {...},
    "status": "Shipped",
    "paymentMethod": "COD",
    "createdAt": "2024-01-15T10:40:00.000Z"
  }
}
```


## Admin Responses

### Admin Login - Success
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Admin Login - Error (Not Admin)
```json
{
  "success": false,
  "message": "You are not authorized to access this resource"
}
```

### Create Product (Admin) - Success
```json
{
  "success": true,
  "message": "T-shirt product created successfully",
  "product": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0kb",
    "name": "Cosmic Shiva T-Shirt",
    "description": "Beautiful cosmic design featuring Lord Shiva",
    "price": 899,
    "category": "Shiva",
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      {
        "public_id": "products/abc123",
        "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/cosmic-shiva.jpg"
      }
    ],
    "stock": 50,
    "isFeatured": true,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### Create Product - Error (Invalid Category)
```json
{
  "success": false,
  "message": "Invalid category. Must be one of: Shiva, Shrooms, LSD, Chakras, Dark, Rick n Morty"
}
```

### Get All Products (Admin) - Success
```json
{
  "success": true,
  "currentPage": 1,
  "totalPages": 5,
  "totalProducts": 48,
  "products": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Shiva Meditation T-Shirt",
      "description": "Premium cotton T-shirt...",
      "price": 799,
      "category": "Shiva",
      "sizes": ["S", "M", "L", "XL"],
      "images": [
        {
          "public_id": "products/xyz789",
          "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/shiva-1.jpg"
        }
      ],
      "stock": 50,
      "isFeatured": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Update Product (Admin) - Success
```json
{
  "success": true,
  "product": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Updated Shiva T-Shirt",
    "price": 999,
    "category": "Shiva",
    "stock": 30,
    "isFeatured": true,
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### Delete Product (Admin) - Success
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Get All Orders (Admin) - Success
```json
{
  "success": true,
  "orders": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "user": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": {
            "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
            "name": "Shiva Meditation T-Shirt",
            "category": "Shiva",
            "images": [
              {
                "public_id": "products/xyz789",
                "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/shiva-1.jpg"
              }
            ]
          },
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
      "createdAt": "2024-01-15T10:40:00.000Z"
    }
  ],
  "qrImage": {
    "public_id": "qr/payment_qr",
    "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/qr-code.png"
  },
  "currentPage": 1,
  "totalPages": 5,
  "totalOrders": 48,
  "appliedFilters": {
    "search": "",
    "filter": "",
    "category": ""
  }
}
```

### Get All Orders - Filtered by Status
```json
{
  "success": true,
  "orders": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "status": "Pending",
      "totalAmount": 1598,
      "user": {...},
      "items": [...]
    }
  ],
  "currentPage": 1,
  "totalPages": 2,
  "totalOrders": 15,
  "appliedFilters": {
    "search": "",
    "filter": "pending",
    "category": ""
  }
}
```

### Get All Orders - Filtered by Category
```json
{
  "success": true,
  "orders": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "items": [
        {
          "category": "Shiva",
          "product": {...}
        }
      ],
      "totalAmount": 1598
    }
  ],
  "currentPage": 1,
  "totalPages": 3,
  "totalOrders": 28,
  "appliedFilters": {
    "search": "",
    "filter": "",
    "category": "Shiva"
  }
}
```

### Get All Orders - Search Results
```json
{
  "success": true,
  "orders": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [...],
      "totalAmount": 1598
    }
  ],
  "currentPage": 1,
  "totalPages": 1,
  "totalOrders": 3,
  "appliedFilters": {
    "search": "john",
    "filter": "",
    "category": ""
  }
}
```

### Update Order Status (Admin) - Success
```json
{
  "success": true,
  "message": "Order updated successfully",
  "order": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [...],
    "totalAmount": 1598,
    "status": "Shipped",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Update Order Status - Error (Invalid Status)
```json
{
  "success": false,
  "message": "Invalid status. Valid statuses are: Pending, Processing, Shipped, Out for Delivery, Delivered, Cancelled"
}
```

### Delete Order (Admin) - Success
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

### Get Order Statistics (Admin) - Success
```json
{
  "success": true,
  "statusCounts": [
    { "_id": "Delivered", "count": 45 },
    { "_id": "Pending", "count": 15 },
    { "_id": "Shipped", "count": 12 },
    { "_id": "Processing", "count": 8 },
    { "_id": "Out for Delivery", "count": 5 },
    { "_id": "Cancelled", "count": 3 }
  ],
  "allStatuses": [
    "Pending",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
  ],
  "totalOrders": 88,
  "sampleOrders": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "totalAmount": 1598,
      "status": "Pending"
    }
  ]
}
```

### Upload QR Code (Admin) - Success
```json
{
  "success": true,
  "message": "QR image uploaded successfully",
  "qr": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0kc",
    "qrImage": {
      "public_id": "qr/payment_qr_123",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/qr-code.png"
    },
    "createdAt": "2024-01-15T12:30:00.000Z",
    "updatedAt": "2024-01-15T12:30:00.000Z"
  }
}
```

### Get QR Code - Success
```json
{
  "success": true,
  "qrImage": {
    "public_id": "qr/payment_qr_123",
    "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/qr-code.png"
  }
}
```

### Get QR Code - Not Found
```json
{
  "success": false,
  "message": "QR image not found"
}
```

## User Profile Responses

### Get Profile - Success
```json
{
  "success": true,
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Profile - Success
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "isAdmin": false,
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

## Health Check Response

### Health Check - Success
```json
{
  "status": "success",
  "message": "Server is healthy",
  "timestamp": "2024-01-15T14:00:00.000Z",
  "uptime": 86400
}
```

---

## Response Field Descriptions

### Common Fields
- `success`: Boolean indicating if request was successful
- `message`: Human-readable message about the operation
- `error`: Detailed error information (only in error responses)

### Product Fields
- `_id`: Unique product identifier
- `name`: Product name
- `description`: Product description
- `price`: Price in currency units (e.g., 799 = ₹799)
- `category`: One of 6 T-shirt categories
- `sizes`: Available sizes array
- `images`: Array of image objects with public_id and url
- `stock`: Available quantity
- `isFeatured`: Boolean for featured products
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Cart/Order Item Fields
- `product`: Product reference or populated object
- `category`: T-shirt category
- `size`: Selected size (S, M, L, XL)
- `quantity`: Number of items
- `price`/`priceSnapshot`: Price at time of adding to cart/order

### Order Fields
- `user`: User reference or populated object
- `items`: Array of order items
- `totalAmount`: Total order value
- `address`: Delivery address object
- `status`: Order status (Pending, Processing, etc.)
- `paymentMethod`: Payment method (COD, etc.)
- `createdAt`: Order creation timestamp

### Pagination Fields
- `page`: Current page number
- `limit`: Items per page
- `totalPages`: Total number of pages
- `totalProducts`/`totalOrders`: Total count of items

---

**Note**: All timestamps are in ISO 8601 format (UTC)
