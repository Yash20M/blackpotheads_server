# Video API Structure - Updated

## New API Structure

### Public Endpoints (No Authentication)
```
GET  /api/v1/video/featured          - Get featured video (public access)
```

### Admin Endpoints (Admin Authentication Required)
```
POST /api/admin/video/upload         - Upload/update featured video
GET  /api/admin/video                - Get video details (admin view)
PATCH /api/admin/video/toggle-status - Toggle video active status
DELETE /api/admin/video              - Delete featured video
```

## Complete Flow

### 1. Admin Login
```bash
POST /api/admin/login
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

### 2. Upload Video (Admin)
```bash
POST /api/admin/video/upload
Authorization: Bearer <admin_token_from_login>
Content-Type: multipart/form-data

Form data:
- video: <video_file>
- title: "Featured Video" (optional)
- description: "Description" (optional)
```

### 3. View Video (Public - No Auth)
```bash
GET /api/v1/video/featured
```

## Key Changes

1. **Admin video endpoints moved to `/api/admin/video/`** 
   - Previously: `/api/v1/video/upload` → Now: `/api/admin/video/upload`
   - Previously: `/api/v1/video/admin` → Now: `/api/admin/video`
   - Previously: `/api/v1/video/toggle-status` → Now: `/api/admin/video/toggle-status`
   - Previously: `/api/v1/video/delete` → Now: `/api/admin/video`

2. **Public endpoint remains at `/api/v1/video/featured`**

3. **All admin endpoints require admin token** (from `/api/admin/login`)

## Testing

### Test Admin Upload
```bash
# 1. Login as admin
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}'

# 2. Copy token from response

# 3. Upload video
curl -X POST http://localhost:3000/api/admin/video/upload \
  -H "Authorization: Bearer <admin_token>" \
  -F "video=@/path/to/video.mp4" \
  -F "title=Featured Video" \
  -F "description=Check this out!"
```

### Test Public Access
```bash
# No authentication needed
curl http://localhost:3000/api/v1/video/featured
```

## Benefits

✅ **Clean separation** - Admin APIs under `/api/admin/`
✅ **Consistent structure** - All admin features in one place
✅ **Security** - Admin endpoints require proper admin tokens
✅ **Public access** - Video remains accessible without authentication
✅ **Easy to manage** - Clear API organization