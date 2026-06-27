# Featured Video System

## Overview
Simple video management system where admin can upload/update a single featured video that's publicly accessible without authentication.

## API Endpoints

### Public Endpoint (No Authentication Required)

#### Get Featured Video
```
GET /api/v1/video/featured
```

**Response:**
```json
{
  "success": true,
  "video": {
    "_id": "video_id",
    "title": "Featured Video",
    "description": "Video description",
    "videoUrl": "https://res.cloudinary.com/...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Admin Endpoints (Authentication Required)

#### Upload/Update Featured Video
```
POST /api/admin/video/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
video: <video_file>  // Required
title: "My Featured Video"  // Optional
description: "Video description"  // Optional
```

**Response:**
```json
{
  "success": true,
  "message": "Featured video uploaded successfully",
  "video": {
    "_id": "video_id",
    "title": "My Featured Video",
    "description": "Video description",
    "videoUrl": "https://res.cloudinary.com/...",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Video Details (Admin)
```
GET /api/admin/video
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "video": {
    "_id": "video_id",
    "title": "Featured Video",
    "description": "Video description",
    "videoUrl": "https://res.cloudinary.com/...",
    "isActive": true,
    "uploadedBy": {
      "_id": "admin_id",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Toggle Video Status
```
PATCH /api/admin/video/toggle-status
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Video activated successfully",
  "video": {
    "_id": "video_id",
    "title": "Featured Video",
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Delete Featured Video
```
DELETE /api/admin/video
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Featured video deleted successfully"
}
```

## Features

### Single Video System
- Only one featured video can exist at a time
- Uploading a new video automatically replaces the existing one
- Old video is automatically deleted from Cloudinary

### Public Access
- Featured video is accessible without authentication
- Perfect for promotional content, announcements, etc.

### Admin Management
- Upload video files (MP4, AVI, MOV, etc.)
- Update title and description
- Toggle active/inactive status
- View upload details
- Delete video completely

### Cloudinary Integration
- Videos stored on Cloudinary CDN
- Automatic cleanup of old videos
- Optimized video delivery

## Usage Examples

### Frontend Integration (Public)
```javascript
// Fetch featured video (no auth required)
const response = await fetch('/api/v1/video/featured');
const data = await response.json();

if (data.success) {
  const videoUrl = data.video.videoUrl;
  // Display video in your app
}
```

### Admin Upload
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('title', 'New Featured Video');
formData.append('description', 'Check out our latest update!');

const response = await fetch('/api/v1/video/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

## Database Schema

### Video Model
```javascript
{
  title: String,           // Video title
  description: String,     // Video description
  videoUrl: String,        // Cloudinary video URL
  publicId: String,        // Cloudinary public ID
  isActive: Boolean,       // Active status
  uploadedBy: ObjectId,    // Admin who uploaded
  createdAt: Date,         // Upload date
  updatedAt: Date          // Last update
}
```

## Error Handling

### Common Errors

**No video file:**
```json
{
  "success": false,
  "message": "Video file is required"
}
```

**Invalid file type:**
```json
{
  "success": false,
  "message": "Only video files are allowed"
}
```

**Video not found:**
```json
{
  "success": false,
  "message": "No featured video found"
}
```

**Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. Admin token required."
}
```

## File Upload Limits

- Supported formats: MP4, AVI, MOV, WMV, FLV, MKV
- File size: Limited by Cloudinary settings
- Only video MIME types accepted

## Security

- ✅ Admin authentication required for upload/management
- ✅ File type validation (videos only)
- ✅ Public read access (no sensitive data exposed)
- ✅ Automatic cleanup of old files

## Notes

- Only one video exists at a time (singleton pattern)
- Replacing video automatically deletes old one from Cloudinary
- Public endpoint has no rate limiting (consider adding if needed)
- Video processing handled by Cloudinary
- Inactive videos are hidden from public endpoint