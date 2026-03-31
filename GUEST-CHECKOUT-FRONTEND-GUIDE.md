# Guest Checkout - Complete Frontend Integration Guide

## 🎯 Overview

Complete guest checkout system with easy order tracking that works even after registration!

**Key Features:**
- ✅ Order without account creation
- ✅ Cash on Delivery (COD) + Online Payment (Razorpay)
- ✅ **Track orders with just Email or Phone** 🆕
- ✅ **Tracking works even after registration** 🆕
- ✅ No Order ID needed for tracking
- ✅ Automatic order linking when guest registers
- ✅ See all orders (guest + linked) in one place
- ✅ XXL size support

---

## 🔍 How Tracking Works

### Scenario 1: Pure Guest Order
```
1. Guest places order → email: guest@gmail.com
2. Guest tracks order → Enter: guest@gmail.com
3. Result: ✓ Order found and displayed
```

### Scenario 2: Guest Order + Registration
```
1. Guest places order → email: guest@gmail.com
2. Guest registers → Same email: guest@gmail.com
3. Orders automatically linked to account ✓
4. User logs out
5. User tracks without login → Enter: guest@gmail.com
6. Result: ✓ All orders found (including linked ones)
```

**Important:** Tracking works for ALL orders placed with that email/phone, whether they're still guest orders or have been linked to an account!

---

## 📡 API Endpoints

### Base URL
```
http://your-api-url/api/v1
```

---

## 1️⃣ Create Guest Order

### COD Order

**Endpoint:** `POST /orders/guest/create`

**Request:**
```json
{
  "guestInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "items": [
    {
      "product": "product_id",
      "category": "Shiva",
      "size": "M",
      "quantity": 2
    }
  ],
  "address": {
    "line1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "totalAmount": 2500,
  "paymentMethod": "COD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guest order created successfully",
  "order": {
    "_id": "order123",
    "guestInfo": {...},
    "totalAmount": 2500,
    "status": "Pending"
  }
}
```

### Online Payment Order

**Step 1:** `POST /orders/guest/create-razorpay-order`

**Request:** Same as COD (without paymentMethod)

**Response:**
```json
{
  "success": true,
  "razorpayOrder": {
    "id": "order_razorpay_id",
    "amount": 250000,
    "currency": "INR"
  },
  "orderId": "order123",
  "key": "rzp_test_xxxxx"
}
```

**Step 2:** `POST /orders/guest/verify-payment`

**Request:**
```json
{
  "razorpayOrderId": "order_razorpay_id",
  "razorpayPaymentId": "pay_razorpay_id",
  "razorpaySignature": "signature",
  "orderId": "order123",
  "guestInfo": {
    "email": "john@example.com"
  }
}
```

---

## 2️⃣ Track Orders (Easy Method)

### Track by Email or Phone

**Endpoint:** `POST /orders/guest/track-by-contact`

**Request (Email):**
```json
{
  "email": "john@example.com"
}
```

**Request (Phone):**
```json
{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "orders": [
    {
      "_id": "order123",
      "orderNumber": "order123",
      "guestInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "items": [...],
      "totalAmount": 2500,
      "status": "Shipped",
      "paymentMethod": "COD",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isLinkedToAccount": false
    },
    {
      "_id": "order456",
      "status": "Delivered",
      "isLinkedToAccount": true
    }
  ]
}
```

**Note:** `isLinkedToAccount` tells you if the order was linked to a user account.

---

## 3️⃣ Register User (Auto-links orders)

**Endpoint:** `POST /register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "linkedOrders": 3
}
```

---

## 🎨 Frontend Implementation

### Track Orders Page

```javascript
import { useState } from 'react';

const TrackOrders = () => {
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('email');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setOrders([]);

    if (!contact.trim()) {
      setError('Please enter your email or phone number');
      return;
    }

    // Validate
    if (contactType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      setError('Please enter a valid email address');
      return;
    }

    if (contactType === 'phone' && !/^[0-9]{10}$/.test(contact)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const requestBody = contactType === 'email' 
        ? { email: contact }
        : { phone: contact };

      const response = await fetch('http://your-api-url/api/v1/orders/guest/track-by-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        setOrders(result.orders);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Tracking failed:', error);
      setError('Failed to track orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#FFA500',
      'Processing': '#2196F3',
      'Shipped': '#9C27B0',
      'Out for Delivery': '#FF9800',
      'Delivered': '#4CAF50',
      'Cancelled': '#F44336'
    };
    return colors[status] || '#000';
  };

  return (
    <div className="track-orders-page">
      <h1>Track Your Orders</h1>
      <p className="subtitle">Enter your email or phone to see all your orders</p>

      {/* Tracking Form */}
      <form onSubmit={handleTrack} className="track-form">
        {/* Contact Type Selection */}
        <div className="contact-type-selector">
          <label>
            <input
              type="radio"
              value="email"
              checked={contactType === 'email'}
              onChange={(e) => {
                setContactType(e.target.value);
                setContact('');
                setError('');
              }}
            />
            Email
          </label>
          <label>
            <input
              type="radio"
              value="phone"
              checked={contactType === 'phone'}
              onChange={(e) => {
                setContactType(e.target.value);
                setContact('');
                setError('');
              }}
            />
            Phone
          </label>
        </div>

        {/* Input Field */}
        <div className="form-group">
          <input
            type={contactType === 'email' ? 'email' : 'tel'}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={contactType === 'email' ? 'Enter your email' : 'Enter your phone (10 digits)'}
            maxLength={contactType === 'phone' ? '10' : undefined}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Track Orders'}
        </button>
      </form>

      {/* Orders List */}
      {orders.length > 0 && (
        <div className="orders-list">
          <h2>Your Orders ({orders.length})</h2>
          
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Order Header */}
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-8)}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.isLinkedToAccount && (
                    <span className="linked-badge">✓ Linked to Account</span>
                  )}
                </div>
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h4>{item.product.name}</h4>
                      <p>Size: {item.size} | Qty: {item.quantity}</p>
                      <p className="item-price">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="order-footer">
                <div className="order-total">
                  <strong>Total:</strong> ₹{order.totalAmount}
                </div>
                <div className="payment-method">
                  {order.paymentMethod}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="delivery-address">
                <strong>Delivery Address:</strong>
                <p>{order.address.line1}</p>
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Prompt */}
      {orders.length > 0 && orders.some(o => !o.isLinkedToAccount) && (
        <div className="registration-prompt">
          <h3>💡 Want to manage your orders easily?</h3>
          <p>Create an account to see all your orders in one place!</p>
          <button onClick={() => window.location.href = '/register'}>
            Create Account
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackOrders;
```

---

### Guest Checkout Form

```javascript
const GuestCheckoutForm = ({ cartItems, totalAmount }) => {
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    addressLine1: '', city: '', state: '', pincode: '', country: 'India'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const orderData = {
      guestInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      },
      items: cartItems.map(item => ({
        product: item.productId,
        category: item.category,
        size: item.size,
        quantity: item.quantity
      })),
      address: {
        line1: formData.addressLine1,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country
      },
      totalAmount: totalAmount,
      paymentMethod: paymentMethod
    };

    if (paymentMethod === 'COD') {
      // COD Order
      const response = await fetch('http://your-api-url/api/v1/orders/guest/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const result = await response.json();
      if (result.success) {
        localStorage.setItem('guestEmail', formData.email);
        window.location.href = `/order-confirmation/${result.order._id}`;
      }
    } else {
      // Online Payment
      const response = await fetch('http://your-api-url/api/v1/orders/guest/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const result = await response.json();
      
      if (result.success) {
        const options = {
          key: result.key,
          amount: result.razorpayOrder.amount,
          currency: result.razorpayOrder.currency,
          order_id: result.razorpayOrder.id,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          handler: async function (razorpayResponse) {
            await fetch('http://your-api-url/api/v1/orders/guest/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
                orderId: result.orderId,
                guestInfo: { email: formData.email }
              })
            });
            localStorage.setItem('guestEmail', formData.email);
            window.location.href = `/order-confirmation/${result.orderId}`;
          }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Guest Checkout</h2>
      
      <input type="text" placeholder="Name" required
        onChange={(e) => setFormData({...formData, name: e.target.value})} />
      
      <input type="email" placeholder="Email" required
        onChange={(e) => setFormData({...formData, email: e.target.value})} />
      
      <input type="tel" placeholder="Phone (10 digits)" maxLength="10" required
        onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      
      <input type="text" placeholder="Address" required
        onChange={(e) => setFormData({...formData, addressLine1: e.target.value})} />
      
      <input type="text" placeholder="City" required
        onChange={(e) => setFormData({...formData, city: e.target.value})} />
      
      <input type="text" placeholder="State" required
        onChange={(e) => setFormData({...formData, state: e.target.value})} />
      
      <input type="text" placeholder="Pincode" maxLength="6" required
        onChange={(e) => setFormData({...formData, pincode: e.target.value})} />

      <div className="payment-selection">
        <label>
          <input type="radio" value="COD" checked={paymentMethod === 'COD'}
            onChange={(e) => setPaymentMethod(e.target.value)} />
          💵 Cash on Delivery
        </label>
        <label>
          <input type="radio" value="Online" checked={paymentMethod === 'Online'}
            onChange={(e) => setPaymentMethod(e.target.value)} />
          💳 Pay Online
        </label>
      </div>

      <button type="submit">
        {paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
      </button>

      <p className="track-info">
        💡 Track your order anytime using just your email or phone!
      </p>
    </form>
  );
};
```

**Add Razorpay script to HTML:**
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

### Order Confirmation Page

```javascript
const OrderConfirmation = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const email = localStorage.getItem('guestEmail');

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await fetch(
        `http://your-api-url/api/v1/orders/guest/${orderId}?email=${email}`
      );
      const result = await response.json();
      if (result.success) setOrder(result.order);
    };
    fetchOrder();
  }, [orderId, email]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="order-confirmation">
      <div className="success-icon">✓</div>
      <h1>Order Confirmed!</h1>
      <p className="success-message">
        {order.paymentMethod === 'COD' 
          ? 'Your order has been placed. Pay on delivery.' 
          : 'Payment successful! Your order is confirmed.'}
      </p>

      <div className="order-details">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
        <p><strong>Payment:</strong> {order.paymentMethod}</p>
        <p><strong>Status:</strong> {order.status}</p>
      </div>

      <div className="track-info-box">
        <h3>📦 Track Your Order</h3>
        <p>You can track your order anytime using:</p>
        <ul>
          <li><strong>Email:</strong> {order.guestInfo.email}</li>
          <li><strong>Phone:</strong> {order.guestInfo.phone}</li>
        </ul>
        <p className="highlight">✨ No Order ID needed!</p>
        <button onClick={() => window.location.href = '/track-orders'}>
          Track Orders
        </button>
      </div>

      <div className="registration-prompt">
        <h3>🎉 Create an Account</h3>
        <p>Register with the same email/phone to:</p>
        <ul>
          <li>See all your orders in one place</li>
          <li>Manage orders easily</li>
          <li>Track orders even after registration</li>
        </ul>
        <button onClick={() => window.location.href = '/register'}>
          Create Account
        </button>
      </div>
    </div>
  );
};
```

---

### Registration Form

```javascript
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const response = await fetch('http://your-api-url/api/v1/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
    });

    const result = await response.json();

    if (result.success) {
      if (result.linkedOrders > 0) {
        setMessage(`✓ Account created! ${result.linkedOrders} order(s) linked to your account.`);
      } else {
        setMessage('✓ Account created successfully!');
      }
      setTimeout(() => window.location.href = '/login', 2000);
    } else {
      alert(result.message);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Create Account</h2>
      
      {message && <div className="success-message">{message}</div>}

      <input type="text" placeholder="Name" required
        onChange={(e) => setFormData({...formData, name: e.target.value})} />
      
      <input type="email" placeholder="Email" required
        onChange={(e) => setFormData({...formData, email: e.target.value})} />
      
      <input type="tel" placeholder="Phone (10 digits)" maxLength="10" required
        onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      
      <input type="password" placeholder="Password (min 8 chars)" required
        onChange={(e) => setFormData({...formData, password: e.target.value})} />
      
      <input type="password" placeholder="Confirm Password" required
        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />

      <button type="submit">Register</button>

      <div className="info-box">
        <p>ℹ️ <strong>Good News!</strong></p>
        <p>If you placed orders as a guest with this email/phone, they will be automatically linked to your account!</p>
        <p>You can still track them without logging in using your email/phone.</p>
      </div>
    </form>
  );
};
```

---

## 📋 Valid Values

### Sizes
```
S, M, L, XL, XXL
```

### Categories
```
Shiva, Shrooms, ACID, Chakras, Dark, Rick n Morty
```

---

## ⚠️ Important Notes

### For Users
1. **Easy Tracking**: Just use email or phone - no Order ID needed
2. **Works After Registration**: Track orders even after creating account
3. **Multiple Orders**: See all your orders at once
4. **No Login Required**: Track orders without logging in

### For Developers
1. **Fixed Tracking**: Now finds orders even after they're linked to accounts
2. **Query by guestInfo**: Searches guestInfo field, not isGuestOrder flag
3. **isLinkedToAccount**: Response includes flag showing if order is linked
4. **Case Insensitive**: Email matching is case-insensitive
5. **Sorted by Date**: Orders returned newest first

---

## 🔄 How It Works

### Database Structure

**Guest Order (Before Registration):**
```javascript
{
  _id: "order123",
  isGuestOrder: true,
  user: null,
  guestInfo: {
    email: "guest@gmail.com",
    phone: "9876543210"
  }
}
```

**Linked Order (After Registration):**
```javascript
{
  _id: "order123",
  isGuestOrder: false,
  user: "user_id_here",
  guestInfo: {
    email: "guest@gmail.com",  // Still preserved!
    phone: "9876543210"
  }
}
```

**Key Point:** `guestInfo` is preserved even after linking, so tracking still works!

---

## 🧪 Testing

### Complete Flow Test

```bash
# 1. Create guest order
curl -X POST http://localhost:3000/api/v1/orders/guest/create \
  -H "Content-Type: application/json" \
  -d '{
    "guestInfo": {"name":"Test","email":"guest@gmail.com","phone":"1515151515"},
    "items": [{"product":"PRODUCT_ID","category":"Shiva","size":"M","quantity":1}],
    "address": {"line1":"123 St","city":"Mumbai","state":"Maharashtra","pincode":"400001","country":"India"},
    "totalAmount": 999,
    "paymentMethod": "COD"
  }'

# 2. Track as guest (works!)
curl -X POST http://localhost:3000/api/v1/orders/guest/track-by-contact \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@gmail.com"}'

# 3. Register with same email
curl -X POST http://localhost:3000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"guest@gmail.com",
    "phone":"1515151515",
    "password":"password123"
  }'

# Response: "linkedOrders": 1

# 4. Track again without login (still works!)
curl -X POST http://localhost:3000/api/v1/orders/guest/track-by-contact \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@gmail.com"}'

# Result: ✓ Order found with "isLinkedToAccount": true
```

---

## ❌ Common Errors

| Error | Solution |
|-------|----------|
| "Either email or phone number is required" | Provide email OR phone |
| "No orders found with this email or phone number" | Check email/phone is correct |
| "Please provide a valid email address" | Check email format |
| "Please provide a valid 10-digit phone number" | Use 10 digits only |
| "is not a valid enum value for path sizes" | Use: S, M, L, XL, XXL |
| "User already exists" | Email already registered, login instead |

---

## 📊 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/orders/guest/create` | POST | Create COD order |
| `/orders/guest/create-razorpay-order` | POST | Create online order |
| `/orders/guest/verify-payment` | POST | Verify payment |
| `/orders/guest/track-by-contact` | POST | **Track by email/phone** |
| `/orders/guest/:orderId` | GET | Get order details |
| `/register` | POST | Register + link orders |
| `/login` | POST | Login |
| `/orders` | GET | Get user orders (auth required) |

---

## ✅ Summary

**What's Fixed:**
- ✅ Tracking now works even after registration
- ✅ Searches by guestInfo (not isGuestOrder flag)
- ✅ Returns all orders (guest + linked)
- ✅ Shows isLinkedToAccount flag

**User Flow:**
1. Guest places order → Saves email/phone
2. Guest tracks order → Works! ✓
3. Guest registers → Orders linked
4. User logs out
5. User tracks without login → Still works! ✓

**Perfect for:**
- Users who forget to login
- Users who want quick tracking
- Users who registered after ordering
- Users who prefer not to login

**Ready to implement!** All backend complete. Copy the code and integrate.
