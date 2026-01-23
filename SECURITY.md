# Security Best Practices - IdealCar Backend

## Overview
This document outlines the security improvements implemented in the IdealCar backend API.

## Security Features Implemented

### 1. **Authentication & Authorization**
- ✅ Token-based authentication for admin routes
- ✅ Secure token generation using `crypto.randomBytes(32)`
- ✅ Token expiration (24 hours)
- ✅ Authorization header validation (`Bearer token`)
- ✅ All admin operations require valid token

### 2. **Password Security**
- ✅ Environment variable configuration
- ✅ Default secure password: `ChangeMe!Secure123`
- ✅ **IMPORTANT:** Change in production via `.env` file
- ⚠️ Future: Implement bcrypt hashing for added security

### 3. **Input Validation & Sanitization**
- ✅ Email format validation (RFC-compliant regex)
- ✅ Phone number format validation
- ✅ HTML/XSS prevention (removes `<>` characters)
- ✅ Input length limiting (max 500 chars)
- ✅ Numeric validation for year, price, doors, seats
- ✅ Type checking and casting

### 4. **File Upload Security**
- ✅ MIME type whitelist (JPEG, PNG, WebP, GIF only)
- ✅ File size limit (5MB max)
- ✅ File count limit (10 files max)
- ✅ Secure filename generation (crypto-random hex + extension)
- ✅ Prevents filename-based attacks

### 5. **CORS Configuration**
- ✅ Production-safe CORS settings
- ✅ Configurable allowed origins via `ALLOWED_ORIGINS` env var
- ✅ Development mode allows localhost
- ✅ Credentials require explicit origin match
- ✅ HTTP methods restricted to necessary operations

### 6. **Rate Limiting**
- ✅ IP-based rate limiting (100 requests per 15 minutes)
- ✅ Prevents brute force attacks
- ✅ Prevents spam/DoS attacks
- ✅ Configurable via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW`

### 7. **Data Persistence**
- ✅ File-based persistence (JSON)
- ✅ Data saved to `backend/data/` directory
- ✅ Automatic directory creation
- ✅ Error handling for I/O operations
- ✅ Future: Easy migration to MongoDB/PostgreSQL

### 8. **Security Headers**
- ✅ `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- ✅ `X-Frame-Options: DENY` - Prevents clickjacking
- ✅ `X-XSS-Protection: 1; mode=block` - XSS protection
- ✅ `Strict-Transport-Security` - Forces HTTPS in production

### 9. **Error Handling**
- ✅ Environment-aware error messages
- ✅ Production: Generic error messages (no details leaked)
- ✅ Development: Detailed error messages for debugging
- ✅ Multer error handling (file size, count, format)
- ✅ 404 handler for undefined routes

### 10. **Logging & Monitoring**
- ✅ Request logging with IP address
- ✅ Timestamp logging for all requests
- ✅ Failed login attempt logging
- ✅ Operation logging (add, update, delete)
- ✅ Error logging with timestamps

### 11. **API Best Practices**
- ✅ RESTful endpoint design
- ✅ Proper HTTP status codes (400, 401, 404, 429, 500)
- ✅ Consistent JSON response format
- ✅ Proper Content-Type headers
- ✅ Request size limit (10MB)

## Environment Setup

### Development
```bash
# 1. Copy environment template
cp backend/.env.example backend/.env

# 2. Default settings are fine for development
NODE_ENV=development
ADMIN_PASSWORD=ChangeMe!Secure123
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500
```

### Production
```bash
# 1. Copy environment template
cp backend/.env.example backend/.env

# 2. Update with production values
NODE_ENV=production
ADMIN_PASSWORD=YourVerySecure123!@#RandomPassword
ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com

# 3. Start server
npm start
```

## Security Checklist

### Before Production Deployment
- [ ] Change `ADMIN_PASSWORD` in `.env`
- [ ] Update `ALLOWED_ORIGINS` to production domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS headers
- [ ] Review and test rate limiting
- [ ] Set up error logging/monitoring
- [ ] Backup data regularly
- [ ] Use environment variables, not hardcoded values
- [ ] Review uploaded files periodically

### Ongoing Security
- [ ] Monitor failed login attempts
- [ ] Review server logs regularly
- [ ] Update dependencies: `npm audit && npm update`
- [ ] Rotate admin password periodically
- [ ] Monitor API usage patterns
- [ ] Backup critical data
- [ ] Test error handling scenarios

## Recommended Enhancements

### Phase 2 - Database
```javascript
// Replace JSON files with proper database
// Recommended: MongoDB, PostgreSQL, or Firebase
```

### Phase 2 - Email Notifications
```javascript
// Implement email sending for contact form
// Recommended: Nodemailer + SendGrid/Gmail SMTP
```

### Phase 2 - Password Hashing
```bash
npm install bcrypt
// Hash passwords with 10 salt rounds
// bcrypt.hash(password, 10)
```

### Phase 2 - JWT Tokens
```bash
npm install jsonwebtoken
// Replace simple tokens with JWT
// Enables token expiration, claims, signature verification
```

### Phase 2 - Helmet.js
```bash
npm install helmet
// Comprehensive security header management
app.use(helmet());
```

### Phase 2 - API Key Management
```javascript
// For third-party integrations
// Store securely in environment variables
// Validate on each request
```

## API Endpoint Security Summary

| Method | Endpoint | Auth Required | Rate Limit | Validation |
|--------|----------|---------------|------------|-----------|
| GET | /api/cars | ❌ | ✅ | IDs only |
| GET | /api/blog | ❌ | ✅ | IDs only |
| GET | /api/dealers | ❌ | ✅ | IDs only |
| POST | /api/contact | ❌ | ✅ | Email, Phone |
| POST | /api/admin/login | ❌ | ✅ | Password match |
| POST | /api/admin/cars | ✅ | ✅ | Full validation |
| PUT | /api/admin/cars/:id | ✅ | ✅ | Full validation |
| DELETE | /api/admin/cars/:id | ✅ | ✅ | ID only |
| POST | /api/admin/blog | ✅ | ✅ | Full validation |
| PUT | /api/admin/blog/:id | ✅ | ✅ | Full validation |
| DELETE | /api/admin/blog/:id | ✅ | ✅ | ID only |
| POST | /api/admin/dealers | ✅ | ✅ | Full validation |
| PUT | /api/admin/dealers/:id | ✅ | ✅ | Full validation |
| DELETE | /api/admin/dealers/:id | ✅ | ✅ | ID only |

## Support & Questions
For security concerns or questions, please review the code comments or consult the main README.md
