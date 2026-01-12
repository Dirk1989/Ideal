# IdealCar - Car Dealership Website

A modern, full-stack car dealership website with admin panel for managing vehicle listings and blog posts.

## 🚗 Features

### Public Website
- **Vehicle Listings**: Browse available cars with detailed specifications
- **Advanced Search**: Filter by make, model, price, year, transmission, and fuel type
- **Image Gallery**: Swiper carousel for multiple car images
- **Contact Forms**: WhatsApp and email inquiry options
- **Blog Section**: Read automotive articles and guides
- **Responsive Design**: Mobile-friendly interface

### Admin Panel
- **Car Management**: Add, edit, and delete vehicle listings
- **Blog Management**: Create and manage blog posts
- **Image Upload**: Multi-image support for vehicles
- **Statistics Dashboard**: View total cars, images, and average prices
- **Secure Login**: Password-protected admin access

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

## 🚀 Installation

1. **Clone or download the repository**

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start the backend server**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

   The server will start on http://localhost:3000

5. **Open the website**
   - Public Site: Open `public-site/index.html` in your browser
   - Admin Panel: Open `admin-panel/index.html` in your browser

## 🔐 Default Login

- **Password**: `admin123`

⚠️ **Important**: Change the default password in production!

## 📁 Project Structure

```
Idealcar/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Dependencies
│   └── uploads/           # Uploaded images
├── admin-panel/
│   ├── index.html         # Car management
│   ├── blog-admin.html    # Blog management
│   ├── login.html         # Admin login
│   ├── script.js          # Admin functionality
│   └── style.css          # Admin styles
├── public-site/
│   ├── index.html         # Main website
│   ├── blog.html          # Blog page
│   ├── script.js          # Public functionality
│   └── style.css          # Public styles
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🛠️ Technologies Used

### Backend
- Express.js
- Multer (file uploads)
- CORS

### Frontend
- Vanilla JavaScript
- HTML5 & CSS3
- Swiper.js (image carousels)
- Font Awesome (icons)

## 📝 API Endpoints

### Public Endpoints
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get single car
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:id` - Get single blog post
- `POST /api/contact` - Submit contact form

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/cars` - Create car listing
- `PUT /api/admin/cars/:id` - Update car listing
- `DELETE /api/admin/cars/:id` - Delete car listing
- `POST /api/admin/blog` - Create blog post
- `PUT /api/admin/blog/:id` - Update blog post
- `DELETE /api/admin/blog/:id` - Delete blog post

## 🔧 Configuration

### Change Admin Password
Edit `.env` file:
```
ADMIN_PASSWORD=your_secure_password_here
```

### Change Port
Edit `.env` file:
```
PORT=3001
```

### WhatsApp Number
Update in `.env`:
```
WHATSAPP_NUMBER=27XXXXXXXXX
```

## 🚀 Deployment

### Backend (Node.js)
1. Deploy to platforms like Heroku, Railway, or DigitalOcean
2. Set environment variables on the platform
3. Update API URLs in frontend files

### Frontend (Static Files)
1. Deploy to Netlify, Vercel, or GitHub Pages
2. Update API_URL in script files to point to your backend

## 🐛 Troubleshooting

### Backend not starting
- Check if port 3000 is available
- Verify Node.js installation: `node --version`
- Install dependencies: `npm install`

### Images not loading
- Verify backend is running
- Check uploads folder exists
- Check browser console for errors

### CORS errors
- Ensure allowed origins in server.js match your frontend URL
- Check browser console for specific CORS messages

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

This is a personal project by DirkL. Feel free to fork and customize for your own use.

## 📄 License

This project is open source and available for personal and commercial use.

## 👤 Author

**DirkL**
- IdealCar Dealership Owner
- Project Manager

## 📞 Support

For issues or questions, use the contact form on the website or reach out via WhatsApp.

---

Made with ❤️ by DirkL
