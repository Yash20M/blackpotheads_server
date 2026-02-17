# Inventory Management API Documentation

Complete API reference for the inventory management system with category-based organization.

## Base URL
```
/api/admin
```

## Authentication
All inventory endpoints require admin authentication. Include the admin token in the Authorization header:
```
Authorization: Bearer <admin_token>
```

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory/overview` | Get complete inventory overview with filters |
| GET | `/inventory/low-stock` | Get low stock alerts |
| GET | `/inventory/analytics` | Get category-wise analytics |
| GET | `/inventory/stock-movement` | Get stock movement report |
| GET | `/inventory/category/:category` | Get products by specific category |
| PUT | `/inventory/stock/:id` | Update stock for single product |
| POST | `/inventory/bulk-update` | Bulk update stock for multiple products |

---

## 1. Get Inventory Overview

Get a comprehensive overview of inventory with category-wise breakdown.

### Endpoint
```
GET /api/admin/inventory/overview
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category (Shiva, Shrooms, LSD, Chakras, Dark, Rick n Morty) |
| lowStock | boolean | No | Filter products with low stock (true/false) |
| outOfStock | boolean | No | Filter out-of-stock products (true/false) |
| threshold | number | No | Low stock threshold (default: 10) |

### Example Request
```bash
curl -X GET "http://localhost:3000/api/admin/inventory/overview?category=Shiva&threshold=15" \
  -H "Authorization: Bearer <admin_token>"
```

### Response
```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Cosmic Shiva T-Shirt",
      "category": "Shiva",
      "stock": 8,
      "price": 799,
      "images": ["url1", "url2"],
      "sizes": ["S", "M", "L", "XL"]
    }
  ],
  "categoryStats": [
    {
      "_id": "Shiva",
      "totalProducts": 12,
      "totalStock": 145,
      "averageStock": 12.08,
      "lowStockCount": 3,
      "outOfStockCount": 1,
      "totalValue": 115855
    }
  ],
  "overallStats": {
    "totalProducts": 72,
    "totalStock": 890,
    "lowStockCount": 15,
    "outOfStockCount": 5,
    "totalInventoryValue": 710100
  },
  "filters": {
    "category": "Shiva",
    "lowStock": null,
    "outOfStock": null,
    "threshold": 15
  }
}
```

---

## 2. Get Low Stock Alerts

Get products that are running low on stock.

### Endpoint
```
GET /api/admin/inventory/low-stock
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| threshold | number | No | Stock threshold (default: 10) |
| category | string | No | Filter by category |

### Example Request
```bash
curl -X GET "http://localhost:3000/api/admin/inventory/low-stock?threshold=10" \
  -H "Authorization: Bearer <admin_token>"
```

### Response
```json
{
  "success": true,
  "alerts": {
    "critical": [
      {
        "_id": "product_id",
        "name": "Dark Skull T-Shirt",
        "category": "Dark",
        "stock": 3,
        "price": 799,
        "images": ["url"]
      }
    ],
    "warning": [
      {
        "_id": "product_id",
        "name": "Shiva Meditation T-Shirt",
        "category": "Shiva",
        "stock": 8,
        "price": 799,
        "images": ["url"]
      }
    ],
    "total": 15
  },
  "threshold": 10
}
```

---

## 3. Update Product Stock

Update stock quantity for a single product.

### Endpoint
```
PUT /api/admin/inventory/stock/:id
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product ID |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| stock | number | Yes | Stock quantity |
| operation | string | No | Operation type: 'set' (default), 'add', 'subtract' |

### Example Request
```bash
# Set stock to specific value
curl -X PUT "http://localhost:3000/api/admin/inventory/stock/product_id" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 50
  }'

# Add to existing stock
curl -X PUT "http://localhost:3000/api/admin/inventory/stock/product_id" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 20,
    "operation": "add"
  }'

# Subtract from stock
curl -X PUT "http://localhost:3000/api/admin/inventory/stock/product_id" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 5,
    "operation": "subtract"
  }'
```

### Response
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "product": {
    "_id": "product_id",
    "name": "Cosmic Shiva T-Shirt",
    "category": "Shiva",
    "stock": 50,
    "price": 799
  }
}
```

---

## 4. Bulk Update Stock

Update stock for multiple products at once.

### Endpoint
```
POST /api/admin/inventory/bulk-update
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updates | array | Yes | Array of update objects |

#### Update Object Structure
```json
{
  "productId": "string",
  "stock": "number",
  "operation": "string (set/add/subtract)"
}
```

### Example Request
```bash
curl -X POST "http://localhost:3000/api/admin/inventory/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "productId": "product_id_1",
        "stock": 50,
        "operation": "set"
      },
      {
        "productId": "product_id_2",
        "stock": 10,
        "operation": "add"
      },
      {
        "productId": "product_id_3",
        "stock": 5,
        "operation": "subtract"
      }
    ]
  }'
```

### Response
```json
{
  "success": true,
  "message": "Updated 3 products, 0 failed",
  "results": {
    "success": [
      {
        "productId": "product_id_1",
        "name": "Cosmic Shiva T-Shirt",
        "oldStock": 30,
        "newStock": 50
      },
      {
        "productId": "product_id_2",
        "name": "Mushroom Magic T-Shirt",
        "oldStock": 20,
        "newStock": 30
      }
    ],
    "failed": []
  }
}
```

---

## 5. Get Category Inventory Analytics

Get detailed analytics for inventory by category.

### Endpoint
```
GET /api/admin/inventory/analytics
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by specific category |

### Example Request
```bash
curl -X GET "http://localhost:3000/api/admin/inventory/analytics" \
  -H "Authorization: Bearer <admin_token>"
```

### Response
```json
{
  "success": true,
  "analytics": [
    {
      "_id": "Shiva",
      "totalProducts": 12,
      "totalStock": 145,
      "averageStock": 12.08,
      "minStock": 0,
      "maxStock": 50,
      "averagePrice": 799,
      "totalInventoryValue": 115855,
      "featuredCount": 3
    },
    {
      "_id": "Shrooms",
      "totalProducts": 10,
      "totalStock": 120,
      "averageStock": 12,
      "minStock": 2,
      "maxStock": 45,
      "averagePrice": 799,
      "totalInventoryValue": 95880,
      "featuredCount": 2
    }
  ],
  "topSellingCategories": [
    {
      "_id": "Rick n Morty",
      "totalSold": 245,
      "totalRevenue": 195755
    },
    {
      "_id": "Shiva",
      "totalSold": 198,
      "totalRevenue": 158202
    }
  ]
}
```

---

## 6. Get Stock Movement Report

Get a report of stock movements based on orders.

### Endpoint
```
GET /api/admin/inventory/stock-movement
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Start date (ISO format) |
| endDate | string | No | End date (ISO format) |
| category | string | No | Filter by category |

### Example Request
```bash
curl -X GET "http://localhost:3000/api/admin/inventory/stock-movement?startDate=2024-01-01&endDate=2024-12-31&category=Shiva" \
  -H "Authorization: Bearer <admin_token>"
```

### Response
```json
{
  "success": true,
  "report": [
    {
      "category": "Shiva",
      "productId": "product_id",
      "productName": "Cosmic Shiva T-Shirt",
      "currentStock": 25,
      "totalSold": 45,
      "revenue": 35955
    },
    {
      "category": "Shiva",
      "productId": "product_id_2",
      "productName": "Shiva Meditation T-Shirt",
      "currentStock": 18,
      "totalSold": 32,
      "revenue": 25568
    }
  ],
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "category": "Shiva"
  }
}
```

---

## 7. Get Products by Category

Get all products for a specific category with statistics.

### Endpoint
```
GET /api/admin/inventory/category/:category
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | Yes | Category name (Shiva, Shrooms, LSD, Chakras, Dark, Rick n Morty) |

### Example Request
```bash
curl -X GET "http://localhost:3000/api/admin/inventory/category/Shiva" \
  -H "Authorization: Bearer <admin_token>"
```

### Response
```json
{
  "success": true,
  "category": "Shiva",
  "products": [
    {
      "_id": "product_id",
      "name": "Cosmic Shiva T-Shirt",
      "description": "Beautiful cosmic Shiva design",
      "price": 799,
      "category": "Shiva",
      "stock": 25,
      "sizes": ["S", "M", "L", "XL"],
      "images": ["url1", "url2"],
      "isFeatured": true
    }
  ],
  "stats": {
    "totalProducts": 12,
    "totalStock": 145,
    "averageStock": 12.08,
    "lowStockCount": 3,
    "outOfStockCount": 1,
    "totalValue": 115855
  }
}
```

---

## Categories Reference

Valid category values:
- `Shiva` - Spiritual and religious designs
- `Shrooms` - Psychedelic mushroom themes
- `LSD` - Trippy and abstract art
- `Chakras` - Energy center designs
- `Dark` - Gothic and dark aesthetic
- `Rick n Morty` - Rick and Morty themed

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid category. Must be one of: Shiva, Shrooms, LSD, Chakras, Dark, Rick n Morty"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "You are not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch inventory overview",
  "error": "Error details"
}
```

---

## Use Cases

### 1. Dashboard Overview
```bash
# Get overall inventory status
GET /api/admin/inventory/overview

# Get low stock alerts for dashboard
GET /api/admin/inventory/low-stock?threshold=10
```

### 2. Category Management
```bash
# View all Shiva products
GET /api/admin/inventory/category/Shiva

# Get analytics for specific category
GET /api/admin/inventory/analytics?category=Shiva
```

### 3. Stock Replenishment
```bash
# Find products needing restock
GET /api/admin/inventory/low-stock?threshold=15

# Bulk update after receiving stock
POST /api/admin/inventory/bulk-update
```

### 4. Sales Analysis
```bash
# Get stock movement for last month
GET /api/admin/inventory/stock-movement?startDate=2024-01-01&endDate=2024-01-31

# Get category performance
GET /api/admin/inventory/analytics
```

---

## Best Practices

1. **Regular Monitoring**: Check low stock alerts daily
2. **Threshold Settings**: Adjust threshold based on sales velocity
3. **Bulk Updates**: Use bulk update for efficiency when restocking
4. **Category Analysis**: Review category analytics weekly
5. **Stock Movement**: Track movement reports monthly for trends
6. **Automated Alerts**: Set up notifications for critical stock levels (≤5)

---

## Integration Tips

### Frontend Dashboard
```javascript
// Fetch inventory overview
const getInventoryDashboard = async () => {
  const [overview, alerts, analytics] = await Promise.all([
    fetch('/api/admin/inventory/overview'),
    fetch('/api/admin/inventory/low-stock?threshold=10'),
    fetch('/api/admin/inventory/analytics')
  ]);
  
  return {
    overview: await overview.json(),
    alerts: await alerts.json(),
    analytics: await analytics.json()
  };
};
```

### Stock Update Form
```javascript
// Update single product stock
const updateStock = async (productId, stock, operation = 'set') => {
  const response = await fetch(`/api/admin/inventory/stock/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ stock, operation })
  });
  
  return response.json();
};
```

### Bulk Stock Import
```javascript
// Import stock from CSV/Excel
const bulkImportStock = async (stockData) => {
  const updates = stockData.map(item => ({
    productId: item.id,
    stock: item.quantity,
    operation: 'set'
  }));
  
  const response = await fetch('/api/admin/inventory/bulk-update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ updates })
  });
  
  return response.json();
};
```
