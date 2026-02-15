# Postman Collection Setup Guide

## Quick Import

You can import the cURL commands from `API-CURL-QUICK-REFERENCE.md` directly into Postman:
1. Open Postman
2. Click "Import" button
3. Select "Raw text"
4. Paste any cURL command
5. Click "Import"

## Environment Variables Setup

Create a Postman environment with these variables:

```json
{
  "name": "T-Shirt Store - Local",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "enabled": true
    },
    {
      "key": "token",
      "value": "",
      "enabled": true
    },
    {
      "key": "admin_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "product_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "order_id",
      "value": "",
      "enabled": true
    }
  ]
}
```

## Auto-Save Token Script

Add this to the "Tests" tab of your login requests:

```javascript
// For user login
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.token) {
        pm.environment.set("token", response.token);
        console.log("Token saved:", response.token);
    }
}

// For admin login
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.token) {
        pm.environment.set("admin_token", response.token);
        console.log("Admin token saved:", response.token);
    }
}
```

## Auto-Save Product ID Script

Add this to "Tests" tab when getting products:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.products && response.products.length > 0) {
        pm.environment.set("product_id", response.products[0]._id);
        console.log("Product ID saved:", response.products[0]._id);
    }
}
```

## Collection Structure

```
T-Shirt Store API
├── 1. Authentication
│   ├── Register User
│   └── Login User
├── 2. User
│   ├── Get Profile
│   └── Update Profile
├── 3. Products
│   ├── Get Products - Shiva
│   ├── Get Products - Shrooms
│   ├── Get Products - LSD
│   ├── Get Products - Chakras
│   ├── Get Products - Dark
│   ├── Get Products - Rick n Morty
│   ├── Get Featured Products
│   ├── Get Product by ID
│   └── Get QR Code
├── 4. Cart
│   ├── Add to Cart
│   ├── Get Cart
│   ├── Update Cart
│   ├── Remove from Cart
│   └── Clear Cart
├── 5. Wishlist
│   ├── Add to Wishlist
│   ├── Get Wishlist
│   ├── Get Wishlist by Category
│   └── Remove from Wishlist
├── 6. Orders
│   ├── Create Order
│   ├── Get Orders
│   ├── Get Order by ID
│   ├── Update Order
│   └── Delete Order
└── 7. Admin
    ├── Admin Login
    ├── Create Product
    ├── Get All Products
    ├── Update Product
    ├── Delete Product
    ├── Get All Orders
    ├── Get All Orders - Filter by Status
    ├── Get All Orders - Filter by Category
    ├── Get All Orders - Search
    ├── Get Order by ID
    ├── Update Order Status
    ├── Delete Order
    ├── Get Order Statistics
    └── Upload QR Code
```


## Sample Requests

### 1. Register User
```
Method: POST
URL: {{base_url}}/api/v1/auth/register
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login User
```
Method: POST
URL: {{base_url}}/api/v1/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "john@example.com",
  "password": "password123"
}
Tests Script:
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
}
```

### 3. Get Products by Category
```
Method: GET
URL: {{base_url}}/api/v1/products/category/Shiva
Query Params:
  page: 1
  limit: 10
Tests Script:
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.products && response.products.length > 0) {
        pm.environment.set("product_id", response.products[0]._id);
    }
}
```

### 4. Add to Cart
```
Method: POST
URL: {{base_url}}/api/v1/cart/add
Headers:
  Content-Type: application/json
  Authorization: Bearer {{token}}
Body (raw JSON):
{
  "productId": "{{product_id}}",
  "quantity": 2,
  "size": "L"
}
```

### 5. Get Cart
```
Method: GET
URL: {{base_url}}/api/v1/cart/get-cart
Headers:
  Authorization: Bearer {{token}}
```

### 6. Create Order
```
Method: POST
URL: {{base_url}}/api/v1/orders/create
Headers:
  Content-Type: application/json
  Authorization: Bearer {{token}}
Body (raw JSON):
{
  "totalAmount": 1598,
  "address": {
    "line1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "paymentMethod": "COD"
}
Tests Script:
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("order_id", response.order._id);
}
```

### 7. Admin Login
```
Method: POST
URL: {{base_url}}/api/admin/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "admin@example.com",
  "password": "admin123"
}
Tests Script:
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("admin_token", response.token);
}
```

### 8. Create Product (Admin)
```
Method: POST
URL: {{base_url}}/api/admin/add-product
Headers:
  Authorization: Bearer {{admin_token}}
Body (form-data):
  name: Cosmic Shiva T-Shirt
  description: Beautiful cosmic design featuring Lord Shiva
  price: 899
  category: Shiva
  sizes: S
  sizes: M
  sizes: L
  sizes: XL
  stock: 50
  isFeatured: true
  images: [file] (select image files)
```

### 9. Get All Orders (Admin)
```
Method: GET
URL: {{base_url}}/api/admin/get-all-orders
Headers:
  Authorization: Bearer {{admin_token}}
Query Params:
  page: 1
  limit: 10
  filter: pending (optional)
  category: Shiva (optional)
  search: john (optional)
```

### 10. Update Order Status (Admin)
```
Method: PUT
URL: {{base_url}}/api/admin/update-order/{{order_id}}
Headers:
  Content-Type: application/json
  Authorization: Bearer {{admin_token}}
Body (raw JSON):
{
  "status": "Shipped"
}
```

## Pre-request Scripts

### Global Pre-request Script
Add this to Collection settings > Pre-request Scripts:

```javascript
// Log request details
console.log("Request:", pm.request.method, pm.request.url.toString());

// Check if token exists for protected routes
const url = pm.request.url.toString();
const needsAuth = url.includes('/cart/') || 
                  url.includes('/wishlist/') || 
                  url.includes('/orders/') ||
                  url.includes('/user/');

if (needsAuth) {
    const token = pm.environment.get("token");
    if (!token) {
        console.warn("Warning: No token found. Please login first.");
    }
}

// Check if admin token exists for admin routes
if (url.includes('/admin/') && !url.includes('/login')) {
    const adminToken = pm.environment.get("admin_token");
    if (!adminToken) {
        console.warn("Warning: No admin token found. Please login as admin first.");
    }
}
```

## Test Scripts

### Global Test Script
Add this to Collection settings > Tests:

```javascript
// Log response
console.log("Response Status:", pm.response.code);
console.log("Response Time:", pm.response.responseTime + "ms");

// Basic tests
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});

// Status code tests
if (pm.response.code === 200 || pm.response.code === 201) {
    pm.test("Request was successful", function () {
        pm.response.to.have.status(200);
    });
}

if (pm.response.code === 400) {
    pm.test("Bad request - check your data", function () {
        const jsonData = pm.response.json();
        console.log("Error:", jsonData.message);
    });
}

if (pm.response.code === 401) {
    pm.test("Unauthorized - check your token", function () {
        console.log("Token might be expired or invalid");
    });
}
```

## Workflow Testing

### Test Sequence 1: User Registration to Order
```
1. Register User
2. Login User (saves token)
3. Get Products - Shiva (saves product_id)
4. Add to Cart
5. Get Cart
6. Create Order (saves order_id)
7. Get Orders
8. Get Order by ID
```

### Test Sequence 2: Admin Product Management
```
1. Admin Login (saves admin_token)
2. Create Product
3. Get All Products
4. Update Product
5. Get All Orders
6. Update Order Status
```

### Test Sequence 3: Complete Shopping Flow
```
1. Login User
2. Get Featured Products
3. Get Products by Category
4. Add to Wishlist
5. Add to Cart
6. Update Cart Quantity
7. Get Cart
8. Create Order
9. Get Orders
```

## Tips

1. **Use Variables**: Always use `{{variable}}` syntax for dynamic values
2. **Chain Requests**: Use Tests scripts to save IDs for next requests
3. **Organize**: Group related requests in folders
4. **Document**: Add descriptions to each request
5. **Share**: Export collection to share with team
6. **Version Control**: Keep collection JSON in git

## Export Collection

To export your collection:
1. Click on collection name
2. Click three dots (...)
3. Select "Export"
4. Choose "Collection v2.1"
5. Save JSON file

## Import Collection

To import:
1. Click "Import" button
2. Select "Upload Files"
3. Choose the JSON file
4. Click "Import"

## Common Issues

### Issue: 401 Unauthorized
**Solution**: Check if token is set in environment variables

### Issue: 400 Bad Request - Invalid Category
**Solution**: Use exact category names (case-sensitive):
- Shiva, Shrooms, LSD, Chakras, Dark, Rick n Morty

### Issue: File Upload Not Working
**Solution**: 
- Use form-data body type
- Field name should be "images" (multiple files)
- For QR: field name should be "qr"

### Issue: Token Expired
**Solution**: Login again to get new token

## Advanced Features

### Collection Runner
Run entire collection automatically:
1. Click "Runner" button
2. Select collection
3. Select environment
4. Set iterations and delay
5. Click "Run"

### Monitor Collection
Set up monitoring:
1. Click "Monitors" tab
2. Create new monitor
3. Select collection and environment
4. Set schedule
5. Configure notifications

### Mock Server
Create mock responses:
1. Click collection three dots
2. Select "Mock Collection"
3. Configure mock server
4. Use mock URL for testing

---

**Pro Tip**: Use Postman's "Code" button to generate cURL, JavaScript, Python, and other language snippets from your requests!
