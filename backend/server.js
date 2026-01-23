const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Load environment variables (optional - requires dotenv package)
if (fs.existsSync('.env')) {
    try {
        require('dotenv').config();
    } catch (e) {
        console.log('dotenv not installed, using default values');
    }
}

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ======================
// 1. SECURITY & MIDDLEWARE
// ======================

// Request size limit
app.use(express.json({ limit: '10mb' }));

// CORS configuration - Proper setup for production
const allowedOrigins = (NODE_ENV === 'production') 
    ? (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:8000'
    ];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else if (NODE_ENV === 'development') {
            // Allow in development
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Helmet-like security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Rate limiting (simple implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100;

app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }
    
    const requests = requestCounts.get(ip).filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (requests.length >= RATE_LIMIT_MAX) {
        return res.status(429).json({ success: false, error: 'Too many requests' });
    }
    
    requests.push(now);
    requestCounts.set(ip, requests);
    next();
});

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// 2. DATA PERSISTENCE LAYER
// ======================
const DATA_DIR = path.join(__dirname, 'data');
const CARS_FILE = path.join(DATA_DIR, 'cars.json');
const BLOG_FILE = path.join(DATA_DIR, 'blog.json');
const DEALERS_FILE = path.join(DATA_DIR, 'dealers.json');

// Initialize data directory
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize data
function loadData(file, defaultData) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (err) {
        console.error(`Error loading ${file}:`, err.message);
    }
    return defaultData;
}

function saveData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error(`Error saving to ${file}:`, err.message);
    }
}

// ======================
// 3. UPLOADS FOLDER & MULTER SETUP
// ======================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate safe filename
        const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed MIME types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10
    }
});

// ======================
// 4. AUTHENTICATION & VALIDATION
// ======================

// Generate secure token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Validate admin token
const adminTokens = new Set();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe!Secure123';

function verifyAdminToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !adminTokens.has(token)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    next();
}

// Input sanitization
function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .slice(0, 500); // Limit length
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    return phoneRegex.test(phone);
}

let cars = loadData(CARS_FILE, [{
    id: Date.now(),
    dealerId: 1,
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 250000,
    description: 'Excellent condition, low mileage, one owner.',
    images: [],
    mileage: '15,000 km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    engine: '2.5L 4-cylinder',
    color: 'White',
    doors: 4,
    seats: 5,
    condition: 'Excellent',
    category: 'Used',
    featured: false,
    features: ['Leather Seats', 'Sunroof', 'Backup Camera']
}]);

let blogPosts = loadData(BLOG_FILE, [{
    id: 1,
    title: 'How to Buy a Used Car in South Africa - Complete Guide 2024',
    excerpt: 'Everything you need to know about purchasing pre-owned vehicles in South Africa.',
    fullContent: '<h2>How to Buy a Used Car in South Africa</h2><p>...</p>',
    image: 'https://images.unsplash.com/photo-1493238792000-8113da705763',
    date: '2024-01-15',
    readTime: '8 min',
    author: 'DirkL',
    category: 'Buying Guide',
    tags: ['used cars', 'South Africa']
}]);

let dealers = loadData(DEALERS_FILE, [{
    id: 1,
    name: 'DirkL Motors',
    email: 'dirk@idealcar.co.za',
    phone: '0123456789',
    location: 'Johannesburg, Gauteng',
    description: 'Premium used car dealership specializing in quality vehicles',
    logo: null,
    banner: null,
    status: 'active',
    createdAt: new Date().toISOString()
}]);

// ======================
// 5. PUBLIC ROUTES
// ======================
app.get('/', (req, res) => {
    res.json({
        message: 'IdealCar Backend API',
        version: '1.0.0',
        endpoints: {
            cars: '/api/cars',
            blog: '/api/blog',
            dealers: '/api/dealers',
            contact: '/api/contact',
            adminLogin: '/api/admin/login'
        }
    });
});

app.get('/api/cars', (req, res) => {
    try {
        res.json(cars || []);
    } catch (err) {
        console.error('Error fetching cars:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/api/cars/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid car ID' });
        
        const car = cars?.find(c => c.id === id);
        if (!car) return res.status(404).json({ error: 'Car not found' });
        res.json(car);
    } catch (err) {
        console.error('Error fetching car:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/api/blog', (req, res) => {
    try {
        res.json(blogPosts || []);
    } catch (err) {
        console.error('Error fetching blog posts:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/api/blog/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid post ID' });
        
        const post = blogPosts?.find(p => p.id === id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        console.error('Error fetching blog post:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/api/dealers', (req, res) => {
    try {
        const activeDealers = dealers?.filter(d => d?.status === 'active') || [];
        res.json(activeDealers);
    } catch (err) {
        console.error('Error fetching dealers:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/api/dealers/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid dealer ID' });
        
        const dealer = dealers?.find(d => d?.id === id);
        if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
        res.json(dealer);
    } catch (err) {
        console.error('Error fetching dealer:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/api/dealers/:id/cars', (req, res) => {
    try {
        const dealerId = Number(req.params.id);
        if (isNaN(dealerId)) return res.status(400).json({ error: 'Invalid dealer ID' });
        
        const dealerCars = cars?.filter(c => c?.dealerId === dealerId) || [];
        res.json(dealerCars);
    } catch (err) {
        console.error('Error fetching dealer cars:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ======================
// 6. ADMIN AUTHENTICATION
// ======================
app.post('/api/admin/login', (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ success: false, error: 'Password required' });
        }
        
        if (password !== ADMIN_PASSWORD) {
            // Log failed attempts
            console.warn(`Failed login attempt from ${req.ip}`);
            return res.status(401).json({ success: false, error: 'Invalid password' });
        }
        
        const token = generateToken();
        adminTokens.add(token);
        
        // Token expires in 24 hours
        setTimeout(() => adminTokens.delete(token), 24 * 60 * 60 * 1000);
        
        res.json({
            success: true,
            token: token,
            expiresIn: 24 * 60 * 60,
            message: 'Login successful'
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ======================
// 7. ADMIN CAR ROUTES
// ======================
app.post('/api/admin/cars', verifyAdminToken, upload.array('images', 10), (req, res) => {
    try {
        const { make, model, year, price, dealerId, description, mileage, transmission, fuel, engine, color, condition, doors, seats, category, featured, features } = req.body;
        
        // Validate required fields
        if (!make || !model || !year || !price) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        // Validate and sanitize inputs
        const yearNum = Number(year);
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
            return res.status(400).json({ success: false, error: 'Invalid year' });
        }
        
        const priceNum = Number(price);
        if (isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({ success: false, error: 'Invalid price' });
        }
        
        const newCar = {
            id: Date.now(),
            dealerId: Number(dealerId) || 1,
            make: sanitizeInput(make),
            model: sanitizeInput(model),
            year: yearNum,
            price: priceNum,
            description: sanitizeInput(description || ''),
            images: req.files?.map(f => `/uploads/${f.filename}`) || [],
            mileage: sanitizeInput(mileage || 'N/A'),
            transmission: sanitizeInput(transmission || 'Automatic'),
            fuel: sanitizeInput(fuel || 'Petrol'),
            engine: sanitizeInput(engine || 'N/A'),
            color: sanitizeInput(color || 'N/A'),
            doors: Math.max(1, Math.min(Number(doors) || 4, 10)),
            seats: Math.max(1, Math.min(Number(seats) || 5, 10)),
            condition: sanitizeInput(condition || 'Good'),
            category: sanitizeInput(category || 'Used'),
            featured: featured === 'true',
            features: (features ? String(features).split(',').map(f => sanitizeInput(f)) : []).filter(f => f)
        };
        
        cars.push(newCar);
        saveData(CARS_FILE, cars);
        console.log(`✓ New car added: ${newCar.make} ${newCar.model} (ID: ${newCar.id})`);
        
        res.json({ success: true, car: newCar });
    } catch (err) {
        console.error('Error adding car:', err);
        res.status(500).json({ success: false, error: 'Failed to add car' });
    }
});

app.put('/api/admin/cars/:id', verifyAdminToken, upload.array('images', 10), (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid car ID' });
        
        const index = cars?.findIndex(c => c?.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Car not found' });
        }
        
        const car = cars[index];
        const { year, price, doors, seats } = req.body;
        
        // Validate optional numeric fields
        if (year) {
            const yearNum = Number(year);
            if (isNaN(yearNum) || yearNum < 1900) return res.status(400).json({ error: 'Invalid year' });
        }
        if (price) {
            const priceNum = Number(price);
            if (isNaN(priceNum) || priceNum < 0) return res.status(400).json({ error: 'Invalid price' });
        }
        
        cars[index] = {
            ...car,
            make: req.body.make ? sanitizeInput(req.body.make) : car.make,
            model: req.body.model ? sanitizeInput(req.body.model) : car.model,
            year: year ? Number(year) : car.year,
            price: price ? Number(price) : car.price,
            description: req.body.description ? sanitizeInput(req.body.description) : car.description,
            doors: doors ? Math.max(1, Math.min(Number(doors), 10)) : car.doors,
            seats: seats ? Math.max(1, Math.min(Number(seats), 10)) : car.seats,
            images: req.files?.length ? req.files.map(f => `/uploads/${f.filename}`) : car.images,
            features: req.body.features 
                ? String(req.body.features).split(',').map(f => sanitizeInput(f)).filter(f => f)
                : car.features
        };
        
        saveData(CARS_FILE, cars);
        res.json({ success: true, car: cars[index] });
    } catch (err) {
        console.error('Error updating car:', err);
        res.status(500).json({ success: false, error: 'Failed to update car' });
    }
});

app.delete('/api/admin/cars/:id', verifyAdminToken, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid car ID' });
        
        const initialLength = cars?.length || 0;
        cars = cars?.filter(c => c?.id !== id) || [];
        
        if (cars.length === initialLength) {
            return res.status(404).json({ success: false, error: 'Car not found' });
        }
        
        saveData(CARS_FILE, cars);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting car:', err);
        res.status(500).json({ success: false, error: 'Failed to delete car' });
    }
});

// ======================
// 8. ADMIN BLOG ROUTES
// ======================
app.post('/api/admin/blog', verifyAdminToken, upload.single('image'), (req, res) => {
    try {
        const { title, excerpt, fullContent, author, category, readTime, tags } = req.body;
        
        if (!title || !excerpt) {
            return res.status(400).json({ success: false, error: 'Title and excerpt required' });
        }
        
        const newPost = {
            id: Date.now(),
            title: sanitizeInput(title),
            excerpt: sanitizeInput(excerpt),
            fullContent: sanitizeInput(fullContent || excerpt),
            image: req.file ? `/uploads/${req.file.filename}` : 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=800',
            date: new Date().toISOString().split('T')[0],
            readTime: sanitizeInput(readTime || '5 min'),
            author: sanitizeInput(author || 'DirkL'),
            category: sanitizeInput(category || 'General'),
            tags: (tags ? String(tags).split(',').map(t => sanitizeInput(t)) : []).filter(t => t)
        };
        
        blogPosts.push(newPost);
        saveData(BLOG_FILE, blogPosts);
        console.log(`✓ New blog post created: ${newPost.title}`);
        
        res.json({ success: true, post: newPost });
    } catch (err) {
        console.error('Error creating blog post:', err);
        res.status(500).json({ success: false, error: 'Failed to create blog post' });
    }
});

app.put('/api/admin/blog/:id', verifyAdminToken, upload.single('image'), (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid post ID' });
        
        const index = blogPosts?.findIndex(p => p?.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        const post = blogPosts[index];
        blogPosts[index] = {
            ...post,
            title: req.body.title ? sanitizeInput(req.body.title) : post.title,
            excerpt: req.body.excerpt ? sanitizeInput(req.body.excerpt) : post.excerpt,
            fullContent: req.body.fullContent ? sanitizeInput(req.body.fullContent) : post.fullContent,
            image: req.file ? `/uploads/${req.file.filename}` : post.image,
            readTime: req.body.readTime ? sanitizeInput(req.body.readTime) : post.readTime,
            author: req.body.author ? sanitizeInput(req.body.author) : post.author,
            category: req.body.category ? sanitizeInput(req.body.category) : post.category,
            tags: req.body.tags ? String(req.body.tags).split(',').map(t => sanitizeInput(t)).filter(t => t) : post.tags
        };
        
        saveData(BLOG_FILE, blogPosts);
        res.json({ success: true, post: blogPosts[index] });
    } catch (err) {
        console.error('Error updating blog post:', err);
        res.status(500).json({ success: false, error: 'Failed to update blog post' });
    }
});

app.delete('/api/admin/blog/:id', verifyAdminToken, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid post ID' });
        
        const initialLength = blogPosts?.length || 0;
        blogPosts = blogPosts?.filter(p => p?.id !== id) || [];
        
        if (blogPosts.length === initialLength) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        saveData(BLOG_FILE, blogPosts);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting blog post:', err);
        res.status(500).json({ success: false, error: 'Failed to delete blog post' });
    }
});

// ======================
// 9. ADMIN DEALER ROUTES
// ======================
app.post('/api/admin/dealers', verifyAdminToken, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), (req, res) => {
    try {
        const { name, email, phone, location, description } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'Name and email required' });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }
        
        if (phone && !validatePhone(phone)) {
            return res.status(400).json({ success: false, error: 'Invalid phone format' });
        }
        
        const newDealer = {
            id: Date.now(),
            name: sanitizeInput(name),
            email: sanitizeInput(email),
            phone: phone ? sanitizeInput(phone) : '',
            location: location ? sanitizeInput(location) : '',
            description: description ? sanitizeInput(description) : '',
            logo: req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : null,
            banner: req.files?.banner ? `/uploads/${req.files.banner[0].filename}` : null,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        dealers.push(newDealer);
        saveData(DEALERS_FILE, dealers);
        console.log(`✓ New dealer created: ${newDealer.name}`);
        
        res.json({ success: true, dealer: newDealer });
    } catch (err) {
        console.error('Error creating dealer:', err);
        res.status(500).json({ success: false, error: 'Failed to create dealer' });
    }
});

app.put('/api/admin/dealers/:id', verifyAdminToken, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid dealer ID' });
        
        const index = dealers?.findIndex(d => d?.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Dealer not found' });
        }
        
        const dealer = dealers[index];
        
        if (req.body.email && !validateEmail(req.body.email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }
        
        if (req.body.phone && !validatePhone(req.body.phone)) {
            return res.status(400).json({ success: false, error: 'Invalid phone format' });
        }
        
        dealers[index] = {
            ...dealer,
            name: req.body.name ? sanitizeInput(req.body.name) : dealer.name,
            email: req.body.email ? sanitizeInput(req.body.email) : dealer.email,
            phone: req.body.phone ? sanitizeInput(req.body.phone) : dealer.phone,
            location: req.body.location ? sanitizeInput(req.body.location) : dealer.location,
            description: req.body.description ? sanitizeInput(req.body.description) : dealer.description,
            logo: req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : dealer.logo,
            banner: req.files?.banner ? `/uploads/${req.files.banner[0].filename}` : dealer.banner,
            status: req.body.status || dealer.status
        };
        
        saveData(DEALERS_FILE, dealers);
        res.json({ success: true, dealer: dealers[index] });
    } catch (err) {
        console.error('Error updating dealer:', err);
        res.status(500).json({ success: false, error: 'Failed to update dealer' });
    }
});

app.delete('/api/admin/dealers/:id', verifyAdminToken, (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid dealer ID' });
        
        const index = dealers?.findIndex(d => d?.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Dealer not found' });
        }
        
        dealers[index].status = 'inactive';
        saveData(DEALERS_FILE, dealers);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting dealer:', err);
        res.status(500).json({ success: false, error: 'Failed to delete dealer' });
    }
});

// ======================
// 10. CONTACT FORM
// ======================
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Name, email, and message required' });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }
        
        if (phone && !validatePhone(phone)) {
            return res.status(400).json({ success: false, error: 'Invalid phone format' });
        }
        
        // Sanitize inputs
        const sanitized = {
            name: sanitizeInput(name),
            email: sanitizeInput(email),
            phone: phone ? sanitizeInput(phone) : '',
            subject: subject ? sanitizeInput(subject) : '',
            message: sanitizeInput(message)
        };
        
        const reference = 'IC' + Date.now().toString().slice(-8);
        
        console.log('Contact Form Submission:');
        console.log('Reference:', reference);
        console.log('Name:', sanitized.name);
        console.log('Email:', sanitized.email);
        console.log('Phone:', sanitized.phone);
        console.log('Subject:', sanitized.subject);
        console.log('Message:', sanitized.message);
        
        // TODO: Send email notification (implement with nodemailer or similar)
        
        res.json({
            success: true,
            message: 'Thank you for contacting us! We\'ll respond within 24 hours.',
            reference: reference
        });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ success: false, error: 'Failed to submit form' });
    }
});

// ======================
// 11. ERROR HANDLING
// ======================
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File too large (max 5MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, error: 'Too many files' });
    }
    if (err.message?.includes('image')) {
        return res.status(400).json({ success: false, error: err.message });
    }
    
    res.status(err.status || 500).json({
        success: false,
        error: NODE_ENV === 'production' ? 'Server error' : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ======================
// 12. START SERVER
// ======================
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚗  IdealCar Backend API');
    console.log('='.repeat(60));
    console.log(`📡  Server: http://localhost:${PORT}`);
    console.log(`📁  Uploads: http://localhost:${PORT}/uploads`);
    console.log(`🔐  Environment: ${NODE_ENV}`);
    console.log(`⚠️   Admin Password: ${ADMIN_PASSWORD === 'ChangeMe!Secure123' ? '⚠️ USING DEFAULT (CHANGE IN PRODUCTION)' : '✓ Using environment variable'}`);
    console.log('='.repeat(60));
    console.log(`📊  Stats:`);
    console.log(`   • Dealers: ${dealers?.filter(d => d?.status === 'active').length || 0}`);
    console.log(`   • Cars: ${cars?.length || 0}`);
    console.log(`   • Blog Posts: ${blogPosts?.length || 0}`);
    console.log('='.repeat(60) + '\n');
});

module.exports = app;
