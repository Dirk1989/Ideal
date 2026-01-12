# IdealCar - Quick Start Guide

Welcome to IdealCar! This guide will help you get started in just a few minutes.

## 🚀 Quick Start (3 Steps)

### Step 1: Install Node.js
If you haven't already, download and install Node.js from:
https://nodejs.org/

Verify installation by opening Command Prompt and running:
```
node --version
```

### Step 2: Start the Backend Server
**Option A: Double-click the batch file**
- Simply double-click `START_SERVER.bat`
- The script will install dependencies and start the server automatically

**Option B: Manual start**
```bash
cd backend
npm install
npm start
```

### Step 3: Open the Websites
**Option A: Double-click the batch file**
- Double-click `OPEN_WEBSITES.bat`
- All websites will open in your default browser

**Option B: Manual opening**
- Open `public-site/index.html` in your browser
- Open `admin-panel/login.html` for admin access
- Open `test.html` to run system tests

## 🔐 Admin Access

**Default Login Credentials:**
- Password: `admin123`

⚠️ **Security Note**: Change this password in production!

## 📋 What Can You Do?

### Public Website (`public-site/index.html`)
- ✅ Browse available cars
- ✅ Search and filter vehicles
- ✅ View detailed specifications
- ✅ Contact via WhatsApp or email
- ✅ Read blog articles

### Admin Panel (`admin-panel/login.html`)
After logging in:
- ✅ Add/Edit/Delete car listings
- ✅ Upload multiple images per car
- ✅ Manage blog posts
- ✅ View statistics

### System Test (`test.html`)
- ✅ Test backend connectivity
- ✅ Verify API endpoints
- ✅ Check data integrity
- ✅ View test logs

## 🛠️ Troubleshooting

### Backend won't start
1. Make sure Node.js is installed
2. Check if port 3000 is available
3. Try running `npm install` in the backend folder

### Images not loading
1. Verify backend is running
2. Check `backend/uploads/` folder exists
3. Look for errors in browser console

### Can't login to admin
1. Make sure backend is running
2. Check browser console for errors
3. Try password: `admin123`

### Website can't connect to backend
1. Ensure backend is running on http://localhost:3000
2. Check for CORS errors in console
3. Try refreshing the page

## 📁 Project Structure

```
Idealcar/
├── START_SERVER.bat        ← Start backend (double-click)
├── OPEN_WEBSITES.bat        ← Open all sites (double-click)
├── test.html                ← System test page
├── README.md                ← Full documentation
├── GETTING_STARTED.md       ← This file
│
├── backend/
│   ├── server.js            ← Express API server
│   ├── package.json         ← Dependencies
│   └── uploads/             ← Uploaded images
│
├── admin-panel/
│   ├── index.html           ← Car management
│   ├── blog-admin.html      ← Blog management
│   ├── login.html           ← Admin login
│   └── script.js            ← Admin functions
│
└── public-site/
    ├── index.html           ← Main website
    └── script.js            ← Public functions
```

## 💡 Tips

1. **First Time Setup**: Run `START_SERVER.bat` first, then `OPEN_WEBSITES.bat`

2. **Testing**: Open `test.html` to verify everything is working correctly

3. **Adding Cars**: 
   - Login to admin panel
   - Click "Add Car"
   - Fill in details and upload images
   - Submit

4. **Blog Posts**: 
   - Login to admin panel
   - Navigate to Blog Admin
   - Create new posts with images

5. **Backend URL**: If you need to change the port, edit `.env` file

## 🎯 Next Steps

1. ✅ Start the backend server
2. ✅ Open the public website
3. ✅ Login to admin panel
4. ✅ Add your first car listing
5. ✅ Create a blog post
6. ✅ Customize the design

## 📞 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Run `test.html` to diagnose problems
3. Check browser console for errors (F12)
4. Check backend terminal for error messages

## 🔒 Security Checklist (Before Going Live)

- [ ] Change admin password in `.env`
- [ ] Update CORS settings for production domain
- [ ] Set up proper database (currently in-memory)
- [ ] Configure environment variables
- [ ] Set up SSL/HTTPS
- [ ] Implement rate limiting
- [ ] Add backup system

## 🎉 You're All Set!

Enjoy using IdealCar! The system is now ready for managing your car dealership.

For more detailed information, see [README.md](README.md)

---

Made with ❤️ by DirkL
