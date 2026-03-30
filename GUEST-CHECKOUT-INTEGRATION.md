# Guest Checkout - Complete Integration Guide

## 🎯 Overview

Complete guest checkout system with automatic order linking when users register!

**Key Features:**
- ✅ Order without account creation
- ✅ Cash on Delivery (COD) supported
- ✅ Online Payment (Razorpay) supported
- ✅ Track orders with Order ID + Email/Phone
- ✅ **Automatic order linking when guest registers** 🆕
- ✅ Automatic stock management
- ✅ Complete validation

---

## 🔗 Guest Order Linking Feature

### How It Works

1. **Guest places order** with email: `user@example.com` and phone: `9876543210`
2. **Later, guest registers** using the same email or phone
3. **System automatically links** all previous guest orders to the new account
4. **User sees all orders** in "My Orders" after registration

### Example Flow

```
Step 1: Guest Order
- Email: bappu@gmail.com
- Phone: 1515151515
- Order ID: abc123
- Status: Guest Order

Step 2: User Registers
- Email: bappu@gmail.com
- Phone: 1515151515
- Account Created ✓

Step 3: Automatic Linking
- Order abc123 linked to user account ✓
- isGuestOrder: false
- user: user_id

Step 4: View Orders
- User logs in
- Sees order abc123 in "My Orders" ✓
```

---

## 📡 API Endpoints

### Base URL
```
http://your-api-url/api/v1
```

---

## 💰 Payment Methods

### Method 1: Cash on Delivery (COD)

**Endpoint:** `POST /orders/guest/create`

**Authentication:** None required

**Request Body:**
```json
{
  "guestInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "items": [
    {
      "product": "product_id_here",
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

**Success Response (201):**
```json
{
  "success": true,
  "message": "Guest order created successfully",
  "order": {
    "_id": "67890abcdef",
    "isGuestOrder": true,
    "guestInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "items": [...],
    "totalAmount": 2500,
    "status": "Pending",
    "paymentMethod": "COD"
  },
  "trackingInfo": {
    "orderId": "67890abcdef",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

---

### Method 2: Online Payment (Razorpay)

#### Step 1: Create Razorpay Order

**Endpoint:** `POST /orders/guest/create-razorpay-order`

**Request Body:** Same as COD (without paymentMethod field)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Razorpay order created for guest",
  "razorpayOrder": {
    "id": "order_razorpay_id",
    "amount": 250000,
    "currency": "INR"
  },
  "orderId": "67890abcdef",
  "key": "rzp_test_xxxxx"
}
```

#### Step 2: Verify Payment

**Endpoint:** `POST /orders/guest/verify-payment`

**Request Body:**
```json
{
  "razorpayOrderId": "order_razorpay_id",
  "razorpayPaymentId": "pay_razorpay_id",
  "razorpaySignature": "signature_from_razorpay",
  "orderId": "67890abcdef",
  "guestInfo": {
    "email": "john@example.com"
  }
}
```

---

### Track Guest Order

**Endpoint:** `POST /orders/guest/track`

**Request Body:**
```json
{
  "orderId": "67890abcdef",
  "email": "john@example.com"
}
```

**OR**

```json
{
  "orderId": "67890abcdef",
  "phone": "9876543210"
}
```

---

### Register User (Links Guest Orders)

**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securepassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "linkedOrders": 3
}
```

**Note:** `linkedOrders` shows how many guest orders were automatically linked to the new account.

---

## 🎨 Frontend Implementation

### Step 1: Guest Checkout Form

```javascript
import { useState } from 'react';

const GuestCheckoutForm = ({ cartItems, totalAmount }) => {
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCODOrder = async () => {
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
      paymentMethod: 'COD'
    };

    try {
      const response = await fetch('http://your-api-url/api/v1/orders/guest/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('guestOrderId', result.order._id);
        localStorage.setItem('guestOrderEmail', formData.email);
        window.location.href = `/order-confirmation/${result.order._id}`;
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('COD order failed:', error);
      alert('Failed to create order');
    }
  };

  const handleOnlinePayment = async () => {
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
      totalAmount: totalAmount
    };

    try {
      const response = await fetch('http://your-api-url/api/v1/orders/guest/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message);
        return;
      }

      const options = {
        key: result.key,
        amount: result.razorpayOrder.amount,
        currency: result.razorpayOrder.currency,
        name: 'Your Store Name',
        order_id: result.razorpayOrder.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        handler: async function (response) {
          await verifyPayment(response, result.orderId);
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Online payment failed:', error);
      alert('Failed to initiate payment');
    }
  };

  const verifyPayment = async (razorpayResponse, orderId) => {
    try {
      const response = await fetch('http://your-api-url/api/v1/orders/guest/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: razorpayResponse.razorpay_order_id,
          razorpayPaymentId: razorpayResponse.razorpay_payment_id,
          razorpaySignature: razorpayResponse.razorpay_signature,
          orderId: orderId,
          guestInfo: { email: formData.email }
        })
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('guestOrderId', result.order._id);
        localStorage.setItem('guestOrderEmail', formData.email);
        window.location.href = `/order-confirmation/${result.order._id}`;
      } else {
        alert('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    if (paymentMethod === 'COD') {
      await handleCODOrder();
    } else {
      await handleOnlinePayment();
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Guest Info Fields */}
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      {errors.name && <span className="error">{errors.name}</span>}

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      {errors.email && <span className="error">{errors.email}</span>}

      <input
        type="tel"
        placeholder="Phone (10 digits)"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        maxLength="10"
      />
      {errors.phone && <span className="error">{errors.phone}</span>}

      {/* Address Fields */}
      <input
        type="text"
        placeholder="Address"
        value={formData.addressLine1}
        onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
      />

      <input
        type="text"
        placeholder="City"
        value={formData.city}
        onChange={(e) => setFormData({...formData, city: e.target.value})}
      />

      <input
        type="text"
        placeholder="State"
        value={formData.state}
        onChange={(e) => setFormData({...formData, state: e.target.value})}
      />

      <input
        type="text"
        placeholder="Pincode"
        value={formData.pincode}
        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
        maxLength="6"
      />

      {/* Payment Method Selection */}
      <div>
        <label>
          <input
            type="radio"
            value="COD"
            checked={paymentMethod === 'COD'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash on Delivery
        </label>

        <label>
          <input
            type="radio"
            value="Online"
            checked={paymentMethod === 'Online'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Pay Online
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
      </button>

      {/* Registration Prompt */}
      <div className="registration-prompt">
        <p>💡 Tip: Register after placing your order to track all your orders in one place!</p>
      </div>
    </form>
  );
};

export default GuestCheckoutForm;
```

**Add Razorpay script to HTML:**
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

### Step 2: Registration with Order Linking

```javascript
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
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
        // Show success message with linked orders count
        if (result.linkedOrders > 0) {
          setMessage(`Account created! ${result.linkedOrders} previous order(s) linked to your account.`);
        } else {
          setMessage('Account created successfully!');
        }
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Create Account</h2>
      
      {message && <div className="success-message">{message}</div>}

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />

      <input
        type="tel"
        placeholder="Phone (10 digits)"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        maxLength="10"
        required
      />

      <input
        type="password"
        placeholder="Password (min 8 characters)"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        required
      />

      <button type="submit">Register</button>

      <p className="info-text">
        ℹ️ If you placed orders as a guest with this email/phone, 
        they will be automatically linked to your account!
      </p>
    </form>
  );
};

export default RegisterForm;
```

---

### Step 3: Order Confirmation with Registration Prompt

```javascript
const OrderConfirmation = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const email = localStorage.getItem('guestOrderEmail');

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
      <h1>✓ Order Confirmed!</h1>
      
      {/* Order Details */}
      <div className="order-info">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
        <p><strong>Payment:</strong> {order.paymentMethod}</p>
      </div>

      {/* Registration Prompt for Guest Users */}
      <div className="registration-prompt-box">
        <h3>🎉 Want to track your orders easily?</h3>
        <p>Create an account and all your orders will be automatically linked!</p>
        <button onClick={() => window.location.href = '/register'}>
          Create Account
        </button>
        <p className="small-text">
          Use the same email ({order.guestInfo.email}) to link this order
        </p>
      </div>

      {/* Track Order Link */}
      <button onClick={() => window.location.href = '/track-order'}>
        Track Order
      </button>
    </div>
  );
};

export default OrderConfirmation;
```

---

## 📋 Valid Values

### Available Sizes
```
S, M, L, XL, XXL
```

### Available Categories
```
Shiva, Shrooms, ACID, Chakras, Dark, Rick n Morty
```

---

## ⚠️ Important Notes

### For Users
1. **Save Order ID**: Save your Order ID after placing order
2. **Register Later**: You can register anytime with the same email/phone
3. **Auto Linking**: Previous guest orders automatically link when you register
4. **Track Orders**: Track guest orders or login to see all orders
5. **Payment Options**: Both COD and Online payment supported

### For Developers
1. **Order Linking**: Happens automatically during registration
2. **Email/Phone Match**: System matches by email OR phone
3. **Case Insensitive**: Email matching is case-insensitive
4. **Multiple Orders**: All matching guest orders are linked
5. **No Duplicates**: Once linked, orders show in user's account
6. **Valid Sizes**: Only S, M, L, XL, XXL allowed
7. **Valid Categories**: Only listed categories allowed

---

## 🔄 Order Linking Logic

### Backend Process

```javascript
// During registration
1. Create new user account
2. Find all guest orders with matching email OR phone
3. Update those orders:
   - Set user: newUserId
   - Set isGuestOrder: false
4. Return linkedOrders count
5. User can now see all orders in "My Orders"
```

### Database Changes

```javascript
// Before Registration
{
  _id: "order123",
  isGuestOrder: true,
  guestInfo: {
    email: "user@example.com",
    phone: "9876543210"
  },
  user: null
}

// After Registration
{
  _id: "order123",
  isGuestOrder: false,
  guestInfo: {
    email: "user@example.com",
    phone: "9876543210"
  },
  user: "user_id_here"
}
```

---

## ❌ Common Errors & Solutions

| Error | Solution |
|-------|----------|
| "Guest name, email, and phone number are required" | Fill all guest info fields |
| "Please provide a valid email address" | Check email format |
| "Please provide a valid 10-digit phone number" | Use exactly 10 digits |
| "User already exists" | Email already registered, login instead |
| "is not a valid enum value for path sizes" | Use only: S, M, L, XL, XXL |
| "Product validation failed" | Check size and category are valid |
| "Order not found" | Check Order ID is correct |
| "Email or phone number does not match order records" | Use correct email/phone |

---

## 🧪 Testing

### Test Guest Order + Registration Flow

```bash
# Step 1: Create guest order
curl -X POST http://localhost:3000/api/v1/orders/guest/create \
  -H "Content-Type: application/json" \
  -d '{
    "guestInfo": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "9876543210"
    },
    "items": [{
      "product": "PRODUCT_ID",
      "category": "Shiva",
      "size": "M",
      "quantity": 1
    }],
    "address": {
      "line1": "123 Test St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "totalAmount": 999,
    "paymentMethod": "COD"
  }'

# Step 2: Register with same email/phone
curl -X POST http://localhost:3000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'

# Response will show: "linkedOrders": 1

# Step 3: Login and get orders
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Use token to get orders
curl -X GET http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN"

# You'll see the guest order in the response!
```

---

## 🚀 Implementation Checklist

### Backend (✅ Complete)
- [x] Guest order creation (COD)
- [x] Guest order creation (Online)
- [x] Payment verification
- [x] Order tracking
- [x] User registration
- [x] Automatic order linking
- [x] Size validation (S, M, L, XL, XXL)

### Frontend (To Do)
- [ ] Guest checkout form
- [ ] Payment method selection
- [ ] Razorpay integration
- [ ] Order confirmation page
- [ ] Registration prompt after order
- [ ] Registration form
- [ ] Show linked orders count
- [ ] Track order page
- [ ] My Orders page

---

## 💡 UX Recommendations

### 1. After Guest Order
Show prominent message:
```
"Want to track your orders easily? 
Create an account and this order will be automatically linked!"
[Create Account Button]
```

### 2. During Registration
Show info text:
```
"ℹ️ If you placed orders as a guest with this email/phone, 
they will be automatically linked to your account!"
```

### 3. After Registration
Show success message:
```
"Account created! 3 previous order(s) linked to your account."
```

### 4. In My Orders
Show all orders (including converted guest orders) with no distinction

---

## 📊 API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/orders/guest/create` | POST | No | Create COD order |
| `/orders/guest/create-razorpay-order` | POST | No | Create online payment order |
| `/orders/guest/verify-payment` | POST | No | Verify online payment |
| `/orders/guest/track` | POST | No | Track order |
| `/orders/guest/:orderId` | GET | No | Get order details |
| `/register` | POST | No | Register + Link orders |
| `/login` | POST | No | Login |
| `/orders` | GET | Yes | Get user orders |

---

## ✅ Summary

**What's New:**
- ✅ Automatic order linking when guest registers
- ✅ Orders linked by email OR phone
- ✅ Multiple orders can be linked at once
- ✅ Seamless user experience
- ✅ XXL size support added

**User Flow:**
1. Guest places order → Order saved with guest info
2. Guest registers → System finds matching orders
3. Orders automatically linked → User sees all orders
4. User logs in → All orders visible in "My Orders"

**Ready to implement!** All backend work is complete. Just copy the code and integrate into your frontend.
