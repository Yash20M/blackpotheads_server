# Inventory Management - CURL Quick Reference

Quick copy-paste CURL commands for testing inventory management endpoints.

## Setup
```bash
# Set your admin token
export ADMIN_TOKEN="your_admin_token_here"
export BASE_URL="http://localhost:3000"
```

---

## 1. Inventory Overview

### Get complete overview
```bash
curl -X GET "$BASE_URL/api/admin/inventory/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Filter by category
```bash
curl -X GET "$BASE_URL/api/admin/inventory/overview?category=Shiva" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get low stock products
```bash
curl -X GET "$BASE_URL/api/admin/inventory/overview?lowStock=true&threshold=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get out of stock products
```bash
curl -X GET "$BASE_URL/api/admin/inventory/overview?outOfStock=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Combined filters
```bash
curl -X GET "$BASE_URL/api/admin/inventory/overview?category=Shrooms&lowStock=true&threshold=15" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 2. Low Stock Alerts

### Get all low stock alerts
```bash
curl -X GET "$BASE_URL/api/admin/inventory/low-stock" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Custom threshold
```bash
curl -X GET "$BASE_URL/api/admin/inventory/low-stock?threshold=15" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Filter by category
```bash
curl -X GET "$BASE_URL/api/admin/inventory/low-stock?category=Dark&threshold=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 3. Update Product Stock

### Set stock to specific value
```bash
curl -X PUT "$BASE_URL/api/admin/inventory/stock/PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 50
  }'
```

### Add to existing stock
```bash
curl -X PUT "$BASE_URL/api/admin/inventory/stock/PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 20,
    "operation": "add"
  }'
```

### Subtract from stock
```bash
curl -X PUT "$BASE_URL/api/admin/inventory/stock/PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 5,
    "operation": "subtract"
  }'
```

---

## 4. Bulk Stock Update

### Update multiple products
```bash
curl -X POST "$BASE_URL/api/admin/inventory/bulk-update" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "productId": "PRODUCT_ID_1",
        "stock": 50,
        "operation": "set"
      },
      {
        "productId": "PRODUCT_ID_2",
        "stock": 10,
        "operation": "add"
      },
      {
        "productId": "PRODUCT_ID_3",
        "stock": 5,
        "operation": "subtract"
      }
    ]
  }'
```

### Restock multiple products
```bash
curl -X POST "$BASE_URL/api/admin/inventory/bulk-update" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"productId": "ID1", "stock": 100, "operation": "set"},
      {"productId": "ID2", "stock": 75, "operation": "set"},
      {"productId": "ID3", "stock": 50, "operation": "set"}
    ]
  }'
```

---

## 5. Category Analytics

### Get all categories analytics
```bash
curl -X GET "$BASE_URL/api/admin/inventory/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get specific category analytics
```bash
curl -X GET "$BASE_URL/api/admin/inventory/analytics?category=Shiva" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### All categories (one by one)
```bash
# Shiva
curl -X GET "$BASE_URL/api/admin/inventory/analytics?category=Shiva" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Shrooms
curl -X GET "$BASE_URL/api/admin/inventory/analytics?category=Shrooms" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# LSD
curl -X GET "$BASE_URL/api/admin/inventory/analytics?category=LSD" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Chakras
curl -X GET "$BASE_URL/api/admin/inventory/analytics?category=Chakras" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Dark
curl -X GET "$BASE_URL/api/admin/inventory/analytics?category=Dark" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Rick n Morty
curl -X GET "$BASE_URL/api/admin/inventory/analytics?category=Rick%20n%20Morty" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 6. Stock Movement Report

### Get all stock movements
```bash
curl -X GET "$BASE_URL/api/admin/inventory/stock-movement" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Filter by date range
```bash
curl -X GET "$BASE_URL/api/admin/inventory/stock-movement?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Filter by category
```bash
curl -X GET "$BASE_URL/api/admin/inventory/stock-movement?category=Shiva" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Date range + category
```bash
curl -X GET "$BASE_URL/api/admin/inventory/stock-movement?startDate=2024-01-01&endDate=2024-12-31&category=Shrooms" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Last 30 days
```bash
# Calculate dates dynamically
START_DATE=$(date -d "30 days ago" +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)

curl -X GET "$BASE_URL/api/admin/inventory/stock-movement?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 7. Products by Category

### Get all Shiva products
```bash
curl -X GET "$BASE_URL/api/admin/inventory/category/Shiva" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get all Shrooms products
```bash
curl -X GET "$BASE_URL/api/admin/inventory/category/Shrooms" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get all LSD products
```bash
curl -X GET "$BASE_URL/api/admin/inventory/category/LSD" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get all Chakras products
```bash
curl -X GET "$BASE_URL/api/admin/inventory/category/Chakras" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get all Dark products
```bash
curl -X GET "$BASE_URL/api/admin/inventory/category/Dark" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get all Rick n Morty products
```bash
curl -X GET "$BASE_URL/api/admin/inventory/category/Rick%20n%20Morty" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Common Workflows

### Daily Inventory Check
```bash
# 1. Check low stock alerts
curl -X GET "$BASE_URL/api/admin/inventory/low-stock?threshold=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Get overall overview
curl -X GET "$BASE_URL/api/admin/inventory/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Restocking Workflow
```bash
# 1. Find products needing restock
curl -X GET "$BASE_URL/api/admin/inventory/low-stock?threshold=15" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Bulk update stock
curl -X POST "$BASE_URL/api/admin/inventory/bulk-update" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"productId": "ID1", "stock": 50, "operation": "add"},
      {"productId": "ID2", "stock": 30, "operation": "add"}
    ]
  }'
```

### Category Performance Review
```bash
# 1. Get category analytics
curl -X GET "$BASE_URL/api/admin/inventory/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Get stock movement for top category
curl -X GET "$BASE_URL/api/admin/inventory/stock-movement?category=Rick%20n%20Morty" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. View all products in that category
curl -X GET "$BASE_URL/api/admin/inventory/category/Rick%20n%20Morty" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Monthly Report Generation
```bash
# Set date range for current month
START_DATE=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)

# 1. Overall analytics
curl -X GET "$BASE_URL/api/admin/inventory/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Stock movement report
curl -X GET "$BASE_URL/api/admin/inventory/stock-movement?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Current inventory status
curl -X GET "$BASE_URL/api/admin/inventory/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Testing Tips

### Save responses to files
```bash
curl -X GET "$BASE_URL/api/admin/inventory/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o inventory-overview.json
```

### Pretty print JSON
```bash
curl -X GET "$BASE_URL/api/admin/inventory/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
```

### Check response status
```bash
curl -X GET "$BASE_URL/api/admin/inventory/low-stock" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"
```

### Silent mode (no progress)
```bash
curl -s -X GET "$BASE_URL/api/admin/inventory/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Error Testing

### Invalid category
```bash
curl -X GET "$BASE_URL/api/admin/inventory/category/InvalidCategory" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Missing authorization
```bash
curl -X GET "$BASE_URL/api/admin/inventory/overview"
```

### Invalid product ID
```bash
curl -X PUT "$BASE_URL/api/admin/inventory/stock/invalid_id" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock": 50}'
```

---

## Batch Operations Script

Save this as `inventory-check.sh`:

```bash
#!/bin/bash

ADMIN_TOKEN="your_token_here"
BASE_URL="http://localhost:3000"

echo "=== Inventory Health Check ==="
echo ""

echo "1. Low Stock Alerts:"
curl -s -X GET "$BASE_URL/api/admin/inventory/low-stock?threshold=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.alerts.total'

echo ""
echo "2. Out of Stock Products:"
curl -s -X GET "$BASE_URL/api/admin/inventory/overview?outOfStock=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.products | length'

echo ""
echo "3. Total Inventory Value:"
curl -s -X GET "$BASE_URL/api/admin/inventory/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.overallStats.totalInventoryValue'

echo ""
echo "4. Category Breakdown:"
curl -s -X GET "$BASE_URL/api/admin/inventory/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.analytics[] | {category: ._id, stock: .totalStock, value: .totalInventoryValue}'
```

Make it executable:
```bash
chmod +x inventory-check.sh
./inventory-check.sh
```
