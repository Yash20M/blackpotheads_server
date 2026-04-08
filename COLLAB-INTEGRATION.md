# Collaboration Form - Complete Frontend Integration Guide

## 🎯 Overview

Complete collaboration/contact form system with admin management.

**All Features:**
- ✅ Public form submission (no login required)
- ✅ Email & phone validation
- ✅ Admin dashboard with filters
- ✅ Status management system
- ✅ Search & pagination
- ✅ Status counts dashboard

---

## 📡 API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/collabs/submit` | POST | None | Submit collab form |
| `/api/admin/collabs` | GET | Admin | Get all submissions |
| `/api/admin/collabs/:id` | GET | Admin | Get single submission |
| `/api/admin/collabs/:id/status` | PUT | Admin | Update status |
| `/api/admin/collabs/:id` | DELETE | Admin | Delete submission |

---

## 1️⃣ Public Form Submission

### Submit Collaboration Request

**Endpoint:** `POST /api/v1/collabs/submit`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "message": "I would like to collaborate on designing new t-shirts."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Your collaboration request has been submitted successfully. We'll get back to you soon!",
  "submission": {
    "_id": "67abc123def456",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Validation Rules:**
- All fields required
- Email: valid format (`user@domain.com`)
- Phone: exactly 10 digits
- Message: cannot be empty

**Error Responses:**
```json
{"success": false, "message": "All fields are required"}
{"success": false, "message": "Please enter a valid email address"}
{"success": false, "message": "Please enter a valid 10-digit phone number"}
```

---

## 2️⃣ Admin Endpoints

### Important: Admin Authentication

All admin endpoints require admin token in header:
```
Authorization: Bearer <ADMIN_TOKEN>
```

Admin token is obtained from admin login endpoint: `POST /api/admin/login`

---

### Get All Submissions

**Endpoint:** `GET /api/admin/collabs`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter: all, pending, reviewed, contacted, rejected
- `search` - Search by name, email, or phone
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - asc or desc (default: desc)

**Example:**
```
GET /api/admin/collabs?page=1&limit=10&status=pending&search=john
```

**Response:**
```json
{
  "success": true,
  "collabs": [
    {
      "_id": "67abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "message": "I would like to collaborate...",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalCollabs": 48,
  "counts": {
    "all": 48,
    "pending": 15,
    "reviewed": 20,
    "contacted": 10,
    "rejected": 3
  },
  "filters": {
    "status": "pending",
    "search": "john",
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

---

### Get Single Submission

**Endpoint:** `GET /api/admin/collabs/:id`

**Response:**
```json
{
  "success": true,
  "collab": {
    "_id": "67abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "message": "Full message text here...",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update Status

**Endpoint:** `PUT /api/admin/collabs/:id/status`

**Request:**
```json
{
  "status": "reviewed"
}
```

**Valid Status Values:**
- `pending` - New submission
- `reviewed` - Admin reviewed
- `contacted` - Admin contacted person
- `rejected` - Request rejected

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "collab": {
    "_id": "67abc123",
    "name": "John Doe",
    "status": "reviewed",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Delete Submission

**Endpoint:** `DELETE /api/admin/collabs/:id`

**Response:**
```json
{
  "success": true,
  "message": "Collaboration request deleted successfully"
}
```

---

## 🎨 Frontend React Components

### 1. Public Collaboration Form

```jsx
import { useState } from 'react';

const CollabForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Client-side validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/collabs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="collab-form-container">
      <h2>Let's Collaborate!</h2>
      <p>Have an idea? Want to work together? Fill out the form below.</p>

      {success && (
        <div className="alert alert-success">
          ✅ Your request has been submitted! We'll get back to you soon.
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Your name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="10-digit phone"
            maxLength="10"
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div className="form-group">
          <label>Message *</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder="Tell us about your collaboration idea..."
            rows="5"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default CollabForm;
```

---

### 2. Admin Dashboard - Collabs List

```jsx
import { useState, useEffect } from 'react';

const AdminCollabs = () => {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    search: ''
  });
  const [counts, setCounts] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCollab, setSelectedCollab] = useState(null);

  const fetchCollabs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken'); // Use adminToken
      const params = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        search: filters.search
      });

      const response = await fetch(
        `http://localhost:3000/api/admin/collabs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        setCollabs(result.collabs);
        setCounts(result.counts);
        setTotalPages(result.totalPages);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to fetch collabs:', error);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollabs();
  }, [filters]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:3000/api/admin/collabs/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Status updated successfully');
        fetchCollabs();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:3000/api/admin/collabs/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Deleted successfully');
        fetchCollabs();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      reviewed: '#17a2b8',
      contacted: '#28a745',
      rejected: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="admin-collabs">
      <h1>Collaboration Requests</h1>

      {/* Status Counts Dashboard */}
      <div className="status-counts">
        <div 
          className="count-card"
          onClick={() => setFilters({...filters, status: 'all', page: 1})}
          style={{ borderLeft: '4px solid #007bff' }}
        >
          <h3>{counts.all || 0}</h3>
          <p>Total Requests</p>
        </div>
        <div 
          className="count-card"
          onClick={() => setFilters({...filters, status: 'pending', page: 1})}
          style={{ borderLeft: '4px solid #ffc107' }}
        >
          <h3>{counts.pending || 0}</h3>
          <p>Pending</p>
        </div>
        <div 
          className="count-card"
          onClick={() => setFilters({...filters, status: 'reviewed', page: 1})}
          style={{ borderLeft: '4px solid #17a2b8' }}
        >
          <h3>{counts.reviewed || 0}</h3>
          <p>Reviewed</p>
        </div>
        <div 
          className="count-card"
          onClick={() => setFilters({...filters, status: 'contacted', page: 1})}
          style={{ borderLeft: '4px solid #28a745' }}
        >
          <h3>{counts.contacted || 0}</h3>
          <p>Contacted</p>
        </div>
        <div 
          className="count-card"
          onClick={() => setFilters({...filters, status: 'rejected', page: 1})}
          style={{ borderLeft: '4px solid #dc3545' }}
        >
          <h3>{counts.rejected || 0}</h3>
          <p>Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          className="search-input"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="contacted">Contacted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Collabs Table */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : collabs.length === 0 ? (
        <div className="no-data">No collaboration requests found</div>
      ) : (
        <div className="table-container">
          <table className="collabs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collabs.map((collab) => (
                <tr key={collab._id}>
                  <td>{collab.name}</td>
                  <td>
                    <a href={`mailto:${collab.email}`}>{collab.email}</a>
                  </td>
                  <td>
                    <a href={`tel:${collab.phone}`}>{collab.phone}</a>
                  </td>
                  <td className="message-cell">
                    <span 
                      onClick={() => setSelectedCollab(collab)}
                      style={{ cursor: 'pointer', color: '#007bff' }}
                    >
                      {collab.message.substring(0, 50)}...
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusColor(collab.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      {collab.status}
                    </span>
                  </td>
                  <td>{new Date(collab.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={collab.status}
                      onChange={(e) => handleStatusChange(collab._id, e.target.value)}
                      className="status-select"
                      style={{ marginRight: '10px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => handleDelete(collab._id)}
                      className="btn-delete"
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={filters.page === 1}
          onClick={() => setFilters({...filters, page: filters.page - 1})}
          className="btn-pagination"
        >
          Previous
        </button>
        <span>Page {filters.page} of {totalPages}</span>
        <button
          disabled={filters.page === totalPages}
          onClick={() => setFilters({...filters, page: filters.page + 1})}
          className="btn-pagination"
        >
          Next
        </button>
      </div>

      {/* Detail Modal */}
      {selectedCollab && (
        <div className="modal-overlay" onClick={() => setSelectedCollab(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn"
              onClick={() => setSelectedCollab(null)}
            >
              ×
            </button>
            <h2>Collaboration Request Details</h2>
            <div className="detail-row">
              <strong>Name:</strong> {selectedCollab.name}
            </div>
            <div className="detail-row">
              <strong>Email:</strong> <a href={`mailto:${selectedCollab.email}`}>{selectedCollab.email}</a>
            </div>
            <div className="detail-row">
              <strong>Phone:</strong> <a href={`tel:${selectedCollab.phone}`}>{selectedCollab.phone}</a>
            </div>
            <div className="detail-row">
              <strong>Message:</strong>
              <p>{selectedCollab.message}</p>
            </div>
            <div className="detail-row">
              <strong>Status:</strong> 
              <span style={{ 
                backgroundColor: getStatusColor(selectedCollab.status),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                marginLeft: '10px'
              }}>
                {selectedCollab.status}
              </span>
            </div>
            <div className="detail-row">
              <strong>Submitted:</strong> {new Date(selectedCollab.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollabs;
```

---

## 🎨 CSS Styling

```css
/* Public Form */
.collab-form-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.collab-form-container h2 {
  margin-bottom: 10px;
  color: #333;
}

.collab-form-container p {
  color: #666;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
  background: #0056b3;
}

button[type="submit"]:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Admin Dashboard */
.admin-collabs {
  padding: 20px;
}

.admin-collabs h1 {
  margin-bottom: 30px;
  color: #333;
}

.status-counts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.count-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.count-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.count-card h3 {
  font-size: 36px;
  margin: 0 0 10px 0;
  color: #333;
}

.count-card p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.status-filter {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.collabs-table {
  width: 100%;
  border-collapse: collapse;
}

.collabs-table th,
.collabs-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.collabs-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.collabs-table tbody tr:hover {
  background: #f8f9fa;
}

.message-cell {
  max-width: 200px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.btn-pagination {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-pagination:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #666;
}

.detail-row {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row strong {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.detail-row p {
  margin: 10px 0 0 0;
  color: #666;
  line-height: 1.6;
}
```

---

## 🧪 Testing Commands

### Test Public Form Submission
```bash
curl -X POST http://localhost:3000/api/v1/collabs/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "message": "This is a test collaboration request"
  }'
```

### Test Admin Get All (requires admin token)
```bash
curl -X GET "http://localhost:3000/api/admin/collabs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Update Status
```bash
curl -X PUT http://localhost:3000/api/admin/collabs/COLLAB_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"status": "reviewed"}'
```

### Test Delete
```bash
curl -X DELETE http://localhost:3000/api/admin/collabs/COLLAB_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔑 Important Notes

### Admin Authentication
- Admin endpoints require admin token (not regular user token)
- Get admin token from: `POST /api/admin/login`
- Store in localStorage as `adminToken`
- Include in header: `Authorization: Bearer <adminToken>`

### Token Storage
```javascript
// After admin login
localStorage.setItem('adminToken', result.token);

// When making admin requests
const token = localStorage.getItem('adminToken');
```

### Status Flow
```
pending → reviewed → contacted
                  ↓
              rejected
```

---

## ✅ Complete Integration Checklist

- [ ] Backend server running
- [ ] MongoDB connected
- [ ] Public form page created
- [ ] Admin collabs page created
- [ ] Admin login working
- [ ] Admin token stored correctly
- [ ] Test form submission
- [ ] Test admin view
- [ ] Test status update
- [ ] Test delete functionality
- [ ] Add to admin sidebar navigation

---

## 📊 Database Schema

```javascript
{
  name: String (required, trimmed),
  email: String (required, lowercase, trimmed),
  phone: String (required, trimmed),
  message: String (required),
  status: String (enum: pending/reviewed/contacted/rejected, default: pending),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🎯 Summary

All backend endpoints are complete and working. The collaboration form system includes:

1. Public form with validation
2. Admin dashboard with filtering
3. Status management
4. Search functionality
5. Pagination
6. Status counts
7. Delete functionality

Ready to integrate into your frontend!
