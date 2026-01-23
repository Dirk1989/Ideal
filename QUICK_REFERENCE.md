# Quick Reference - IdealCar Security Implementation

## Critical Changes Summary

### 🔐 Authentication
```javascript
// All admin routes now require:
Authorization: Bearer {token}

// Get token from login:
POST /api/admin/login
Body: { "password": "ChangeMe!Secure123" }
Response: { "success": true, "token": "64-char-hex-string", "expiresIn": 86400 }
```

### 🛡️ Protected Admin Endpoints
```javascript
// Requires valid Bearer token in Authorization header
POST   /api/admin/cars          // Create car
PUT    /api/admin/cars/:id      // Update car
DELETE /api/admin/cars/:id      // Delete car

POST   /api/admin/blog          // Create blog post
PUT    /api/admin/blog/:id      // Update blog post
DELETE /api/admin/blog/:id      // Delete blog post

POST   /api/admin/dealers       // Create dealer
PUT    /api/admin/dealers/:id   // Update dealer
DELETE /api/admin/dealers/:id   // Delete dealer
```

### 📋 Public Endpoints (No Auth)
```javascript
GET  /api/cars                  // List all cars
GET  /api/cars/:id              // Get specific car
GET  /api/blog                  // List blog posts
GET  /api/blog/:id              // Get specific post
GET  /api/dealers               // List active dealers
GET  /api/dealers/:id           // Get specific dealer
POST /api/contact               // Submit contact form
```

### 📁 Data Persistence
```
backend/
├── data/                    // Data files (auto-created)
│   ├── cars.json
│   ├── blog.json
│   └── dealers.json
├── uploads/                 // Uploaded images
├── server.js               // Main application
├── package.json
└── .env                    // Configuration (create from .env.example)
```

### 🔧 Environment Configuration
```bash
# Create .env file
cp backend/.env.example backend/.env

# Edit .env with your settings:
PORT=3000
NODE_ENV=development|production
ADMIN_PASSWORD=YourSecurePassword123!@#
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500
```

### 📊 Frontend Configuration
```javascript
// Automatically detects environment:
// Development: http://localhost:3000
// Production: Uses current domain

const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : window.location.origin;
const API_URL = `${API_BASE}/api`;
```

### ✅ Input Validation Examples
```javascript
// Email validation
validateEmail('user@example.com')      // ✅ Valid
validateEmail('invalid.email')         // ❌ Invalid

// Phone validation
validatePhone('+27 82 123 4567')       // ✅ Valid
validatePhone('123')                   // ❌ Invalid

// Input sanitization
sanitizeInput('<script>alert(1)</script>')  // ✅ Removes HTML
sanitizeInput('very long input...' + 'x'.repeat(500))  // ✅ Truncates to 500 chars
```

### 📤 File Upload Rules
```javascript
// Maximum: 5MB per file, 10 files per request
// Allowed types: JPEG, PNG, WebP, GIF
// Filenames: Auto-randomized (e.g., a1b2c3d4e5f6g7h8.jpg)

// Example error responses:
{ "error": "File too large (max 5MB)" }
{ "error": "Too many files" }
{ "error": "Only image files (JPEG, PNG, WebP, GIF) are allowed" }
```

### 🚨 Rate Limiting
```javascript
// Limit: 100 requests per IP per 15 minutes
// Response when limit exceeded:
HTTP 429 Too Many Requests
{ "error": "Too many requests" }
```

### 🔍 CORS Configuration
```javascript
// Development: Allows localhost
// Production: Only allows specified origins

// To allow new domain in production:
// Update .env: ALLOWED_ORIGINS=https://newdomain.com,https://www.newdomain.com
```

### 🔒 Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

### 💾 API Response Format
```javascript
// Success response
{
  "success": true,
  "car": { /* car data */ }
}

// Error response
{
  "success": false,
  "error": "Description of what went wrong"
}

// Status codes used:
200  // Success
400  // Bad Request (invalid input)
401  // Unauthorized (missing/invalid token)
404  // Not Found
429  // Too Many Requests (rate limited)
500  // Server Error
```

### 🧪 Testing Authentication
```bash
# 1. Get token
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"ChangeMe!Secure123"}'

# Response:
{
  "success": true,
  "token": "64-character-hex-string",
  "expiresIn": 86400
}

# 2. Use token for admin operations
curl -X POST http://localhost:3000/api/admin/cars \
  -H "Authorization: Bearer 64-character-hex-string" \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota","model":"Camry","year":2022,"price":250000}'
```

### 📝 Common Error Messages
```
// Authentication
"Unauthorized"                              // Missing/invalid token
"Invalid password"                          // Wrong password
"Password required"                         // No password provided

// Validation
"Missing required fields"                   // Incomplete data
"Invalid email format"                      // Bad email
"Invalid phone format"                      // Bad phone number
"Invalid year"                              // Year outside valid range
"Invalid price"                             // Negative or invalid price

// Files
"File too large (max 5MB)"                  // Upload too big
"Too many files"                            // More than 10 files
"Only image files are allowed"              // Wrong file type

// Rate limiting
"Too many requests"                         // HTTP 429

// Server
"Server error"                              // (Details in development mode)
```

### 🚀 Deployment Checklist
```
[ ] Update ADMIN_PASSWORD in .env
[ ] Set NODE_ENV=production
[ ] Update ALLOWED_ORIGINS to production domain
[ ] Enable HTTPS/SSL
[ ] Test authentication flow
[ ] Test file uploads
[ ] Test rate limiting
[ ] Set up data backups
[ ] Monitor error logs
[ ] Review security headers
```

### 📚 Documentation Files
- `SECURITY.md` - Detailed security documentation
- `IMPROVEMENTS.md` - Complete list of all improvements
- `README.md` - General setup and usage
- `GETTING_STARTED.md` - Beginner guide

### 🆘 Troubleshooting

**Issue:** Admin operations return 401 Unauthorized
```
✅ Solution: Include valid Bearer token in Authorization header
Header: Authorization: Bearer {valid-token-from-login}
```

**Issue:** CORS error when accessing from different domain
```
✅ Solution: Add domain to ALLOWED_ORIGINS in .env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Issue:** File upload fails with "File too large"
```
✅ Solution: Keep files under 5MB
✅ Solution: Compress images before upload (Photoshop, TinyPNG, etc.)
```

**Issue:** Form shows "Invalid email format"
```
✅ Solution: Use valid email format: user@example.com
```

**Issue:** Server won't start
```
✅ Solution: Check if port 3000 is already in use
✅ Solution: Change PORT in .env to 3001 or another free port
```

---

**For detailed information, see:**
- 🔐 Security details: `SECURITY.md`
- 📋 All improvements: `IMPROVEMENTS.md`
- 🚀 Quick setup: `README.md`
