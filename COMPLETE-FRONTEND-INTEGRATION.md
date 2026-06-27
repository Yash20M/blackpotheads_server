# Complete Frontend Integration Guide

## 🎯 Overview

Complete e-commerce system with guest checkout, easy tracking, and password reset!

**All Features:**
- ✅ Guest checkout (COD + Online Payment)
- ✅ Track orders with just Email or Phone
- ✅ Automatic order linking on registration
- ✅ **Forgot Password (Email + Phone verification)** 🆕
- ✅ User registration and login
- ✅ XXL size support

---

## 📡 API Endpoints

### Base URL
```
http://your-api-url/api/v1
```

---

## 1️⃣ Authentication

### Register

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "linkedOrders": 2
}
```

### Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login Successfull",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

### Forgot Password (NEW)

**Endpoint:** `POST /auth/forgot-password`

**Request:**
```json
{
  "email": "john@example.com",
  "phone": "9876543210",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

**Validation:**
- Email must be valid format
- Phone must be exactly 10 digits
- Phone must match the account's registered phone
- Password must be at least 8 characters
- newPassword and confirmPassword must match

**Error Responses:**
```json
{"success": false, "message": "All fields are required"}
{"success": false, "message": "Please enter a valid email address"}
{"success": false, "message": "Please enter a valid 10-digit phone number"}
{"success": false, "message": "Password must be at least 8 characters long"}
{"success": false, "message": "Passwords do not match"}
{"success": false, "message": "No account found with this email"}
{"success": false, "message": "Phone number does not match our records"}
```

---

## 2️⃣ Guest Checkout

### COD Order

**Endpoint:** `POST /orders/guest/create`

**Request:**
```json
{
  "guestInfo": {
    "name": "Guest User",
    "email": "guest@example.com",
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

### Online Payment

**Step 1:** `POST /orders/guest/create-razorpay-order`
**Step 2:** `POST /orders/guest/verify-payment`

---

## 3️⃣ Track Orders

**Endpoint:** `POST /orders/guest/track-by-contact`

**Request:**
```json
{
  "email": "guest@example.com"
}
```

**OR**

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
  "orders": [...]
}
```

---

## 🎨 Frontend Components

### Forgot Password Form

```javascript
import { useState } from 'react';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://your-api-url/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <h1>Reset Password</h1>
      <p className="subtitle">Enter your email and phone number to reset your password</p>

      <form onSubmit={handleSubmit} className="forgot-password-form">
        {/* Email Field */}
        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Phone Field */}
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="Enter your phone (10 digits)"
            maxLength="10"
            required
          />
          <small>Enter the phone number registered with your account</small>
        </div>

        {/* New Password Field */}
        <div className="form-group">
          <label>New Password *</label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            placeholder="Enter new password (min 8 characters)"
            required
          />
        </div>

        {/* Confirm Password Field */}
        <div className="form-group">
          <label>Confirm New Password *</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="Confirm new password"
            required
          />
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Success Message */}
        {message && <div className="success-message">{message}</div>}

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>

        {/* Back to Login */}
        <div className="back-to-login">
          <a href="/login">Back to Login</a>
        </div>
      </form>

      {/* Info Box */}
      <div className="info-box">
        <h3>ℹ️ How it works</h3>
        <ol>
          <li>Enter your registered email address</li>
          <li>Enter your registered phone number for verification</li>
          <li>Create a new password</li>
          <li>Your password will be updated immediately</li>
        </ol>
      </div>
    </div>
  );
};

export default ForgotPassword;
```

---

### Login Form (with Forgot Password link)

```javascript
const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('http://your-api-url/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = '/dashboard';
    } else {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />

      {error && <div className="error-message">{error}</div>}

      <button type="submit">Login</button>

      {/* Forgot Password Link */}
      <div className="forgot-password-link">
        <a href="/forgot-password">Forgot Password?</a>
      </div>

      <div className="register-link">
        Don't have an account? <a href="/register">Register</a>
      </div>
    </form>
  );
};
```

---

### Register Form

```javascript
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const response = await fetch('http://your-api-url/api/v1/auth/register', {
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
        alert(`Account created! ${result.linkedOrders} order(s) linked.`);
      }
      window.location.href = '/login';
    } else {
      alert(result.message);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Create Account</h2>
      
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

      <div className="login-link">
        Already have an account? <a href="/login">Login</a>
      </div>
    </form>
  );
};
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
      const response = await fetch('http://your-api-url/api/v1/orders/guest/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const result = await response.json();
      if (result.success) {
        window.location.href = `/order-confirmation/${result.order._id}`;
      }
    } else {
      // Online payment flow (Razorpay)
      // See previous documentation for complete implementation
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Guest Checkout</h2>
      
      <input type="text" placeholder="Name" required
        onChange={(e) => setFormData({...formData, name: e.target.value})} />
      
      <input type="email" placeholder="Email" required
        onChange={(e) => setFormData({...formData, email: e.target.value})} />
      
      <input type="tel" placeholder="Phone" maxLength="10" required
        onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      
      <input type="text" placeholder="Address" required
        onChange={(e) => setFormData({...formData, addressLine1: e.target.value})} />
      
      <input type="text" placeholder="City" required
        onChange={(e) => setFormData({...formData, city: e.target.value})} />
      
      <input type="text" placeholder="State" required
        onChange={(e) => setFormData({...formData, state: e.target.value})} />
      
      <input type="text" placeholder="Pincode" maxLength="6" required
        onChange={(e) => setFormData({...formData, pincode: e.target.value})} />

      <div>
        <label>
          <input type="radio" value="COD" checked={paymentMethod === 'COD'}
            onChange={(e) => setPaymentMethod(e.target.value)} />
          Cash on Delivery
        </label>
        <label>
          <input type="radio" value="Online" checked={paymentMethod === 'Online'}
            onChange={(e) => setPaymentMethod(e.target.value)} />
          Pay Online
        </label>
      </div>

      <button type="submit">
        {paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
      </button>
    </form>
  );
};
```

---

### Track Orders Page

```javascript
const TrackOrders = () => {
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('email');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);

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
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Track Your Orders</h1>
      
      <form onSubmit={handleTrack}>
        <div>
          <label>
            <input type="radio" value="email" checked={contactType === 'email'}
              onChange={(e) => setContactType(e.target.value)} />
            Email
          </label>
          <label>
            <input type="radio" value="phone" checked={contactType === 'phone'}
              onChange={(e) => setContactType(e.target.value)} />
            Phone
          </label>
        </div>

        <input
          type={contactType === 'email' ? 'email' : 'tel'}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={contactType === 'email' ? 'Enter email' : 'Enter phone'}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Track Orders'}
        </button>
      </form>

      {/* Display orders */}
      {orders.map(order => (
        <div key={order._id}>
          <h3>Order #{order._id.slice(-8)}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ₹{order.totalAmount}</p>
        </div>
      ))}
    </div>
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

### Forgot Password
1. **No OTP/Email**: Simple verification using email + phone
2. **Phone Verification**: Phone must match registered phone
3. **Instant Update**: Password updated immediately in database
4. **Secure**: Password is hashed before saving

### For Users
1. **Easy Password Reset**: Just need email and phone
2. **No Waiting**: Instant password reset
3. **Secure**: Phone number verification required

### For Developers
1. **Password Hashing**: Automatic via User model pre-save hook
2. **Validation**: All fields validated server-side
3. **Case Insensitive**: Email matching is case-insensitive
4. **Error Messages**: Clear error messages for all scenarios

---

## 🧪 Testing

### Test Forgot Password

```bash
# 1. Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "phone":"9876543210",
    "password":"oldpassword123"
  }'

# 2. Reset password
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "phone":"9876543210",
    "newPassword":"newpassword123",
    "confirmPassword":"newpassword123"
  }'

# Response: "Password reset successful"

# 3. Login with new password
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"newpassword123"
  }'

# Success! ✓
```

---

## ❌ Common Errors

| Error | Solution |
|-------|----------|
| "All fields are required" | Fill all fields |
| "Please enter a valid email address" | Check email format |
| "Please enter a valid 10-digit phone number" | Use 10 digits only |
| "Password must be at least 8 characters long" | Use min 8 characters |
| "Passwords do not match" | Ensure both passwords match |
| "No account found with this email" | Check email is correct |
| "Phone number does not match our records" | Use registered phone number |

---

## 📊 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login user |
| `/auth/forgot-password` | POST | **Reset password** |
| `/orders/guest/create` | POST | Create COD order |
| `/orders/guest/create-razorpay-order` | POST | Create online order |
| `/orders/guest/verify-payment` | POST | Verify payment |
| `/orders/guest/track-by-contact` | POST | Track by email/phone |
| `/orders` | GET | Get user orders (auth) |

---

## ✅ Summary

**Complete Features:**
- ✅ User registration with order linking
- ✅ User login with JWT token
- ✅ **Forgot password with email + phone verification**
- ✅ Guest checkout (COD + Online)
- ✅ Easy order tracking (no Order ID needed)
- ✅ Automatic order linking
- ✅ XXL size support

**Ready to implement!** All backend complete. Copy the code and integrate into your frontend.
