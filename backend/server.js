const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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

// ======================
// 1. MIDDLEWARE
// ======================

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // For development, allow all origins
            callback(null, true);
        }
    },
    credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// 2. UPLOADS FOLDER
// ======================
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// ======================
// 3. MULTER SETUP
// ======================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// ======================
// 4. SAMPLE DATA
// ======================
let cars = [
    {
        id: Date.now(),
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
        features: ['Leather Seats', 'Sunroof', 'Backup Camera']
    }
];

let blogPosts = [
    {
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
    }
];

// ======================
// 5. PUBLIC ROUTES
// ======================
app.get('/', (req, res) => {
    res.json({
        message: 'IdealCar Backend API',
        endpoints: {
            cars: '/api/cars',
            blog: '/api/blog',
            adminLogin: '/api/admin/login'
        }
    });
});

app.get('/api/cars', (req, res) => {
    res.json(cars);
});

app.get('/api/cars/:id', (req, res) => {
    const car = cars.find(c => c.id === Number(req.params.id));
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
});

app.get('/api/blog', (req, res) => {
    res.json(blogPosts);
});

app.get('/api/blog/:id', (req, res) => {
    const post = blogPosts.find(p => p.id === Number(req.params.id));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
});

// ======================
// 6. ADMIN ROUTES
// ======================
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    // In production, use environment variable and proper hashing
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (!password) {
        return res.status(400).json({ 
            success: false, 
            error: 'Password required' 
        });
    }
    
    if (password === ADMIN_PASSWORD) {
        res.json({
            success: true,
            token: 'idealcar-admin-token-2024',
            message: 'Login successful'
        });
    } else {
        res.status(401).json({ 
            success: false, 
            error: 'Invalid password' 
        });
    }
});

app.post('/api/admin/cars', upload.array('images', 10), (req, res) => {
    try {
        // Validate required fields
        if (!req.body.make || !req.body.model || !req.body.year || !req.body.price) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: make, model, year, price' 
            });
        }
        
        // Validate year
        const year = Number(req.body.year);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid year' 
            });
        }
        
        // Validate price
        const price = Number(req.body.price);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid price' 
            });
        }
        
        const newCar = {
            id: Date.now(),
            make: req.body.make.trim(),
            model: req.body.model.trim(),
            year: year,
            price: price,
            description: req.body.description ? req.body.description.trim() : '',
            images: req.files ? req.files.map(f => `/uploads/${f.filename}`) : [],
            mileage: req.body.mileage || 'N/A',
            transmission: req.body.transmission || 'Automatic',
            fuel: req.body.fuel || 'Petrol',
            engine: req.body.engine || 'N/A',
            color: req.body.color || 'N/A',
            doors: Number(req.body.doors) || 4,
            seats: Number(req.body.seats) || 5,
            condition: req.body.condition || 'Good',
            features: req.body.features
                ? req.body.features.split(',').map(f => f.trim()).filter(f => f)
                : []
        };

        cars.push(newCar);
        console.log(`✓ New car added: ${newCar.make} ${newCar.model} (ID: ${newCar.id})`);
        res.json({ success: true, car: newCar });
    } catch (err) {
        console.error('Error adding car:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/admin/cars/:id', upload.array('images', 10), (req, res) => {
    const index = cars.findIndex(c => c.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, error: 'Car not found' });
    }

    const car = cars[index];

    cars[index] = {
        ...car,
        ...req.body,
        year: req.body.year ? Number(req.body.year) : car.year,
        price: req.body.price ? Number(req.body.price) : car.price,
        doors: req.body.doors ? Number(req.body.doors) : car.doors,
        seats: req.body.seats ? Number(req.body.seats) : car.seats,
        images: req.files?.length
            ? req.files.map(f => `/uploads/${f.filename}`)
            : car.images,
        features: req.body.features
            ? req.body.features.split(',').map(f => f.trim()).filter(f => f)
            : car.features
    };

    res.json({ success: true, car: cars[index] });
});

app.delete('/api/admin/cars/:id', (req, res) => {
    const before = cars.length;
    cars = cars.filter(c => c.id !== Number(req.params.id));
    if (cars.length === before) {
        return res.status(404).json({ success: false, error: 'Car not found' });
    }
    res.json({ success: true });
});

// ======================
// BLOG ADMIN ROUTES
// ======================

// Create blog post with image upload
app.post('/api/admin/blog', upload.single('image'), (req, res) => {
    try {
        // Validate required fields
        if (!req.body.title || !req.body.excerpt) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: title, excerpt' 
            });
        }
        
        const newPost = {
            id: Date.now(),
            title: req.body.title.trim(),
            excerpt: req.body.excerpt.trim(),
            fullContent: req.body.fullContent ? req.body.fullContent.trim() : req.body.excerpt.trim(),
            image: req.file ? `/uploads/${req.file.filename}` : 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=800',
            date: new Date().toISOString().split('T')[0],
            readTime: req.body.readTime || '5 min',
            author: req.body.author || 'DirkL',
            category: req.body.category || 'General',
            tags: req.body.tags
                ? req.body.tags.split(',').map(t => t.trim()).filter(t => t)
                : []
        };

        blogPosts.push(newPost);
        console.log(`✓ New blog post created: ${newPost.title} (ID: ${newPost.id})`);

        res.json({
            success: true,
            post: newPost
        });

    } catch (err) {
        console.error('Error creating blog post:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to create blog post: ' + err.message
        });
    }
});


// Update blog post
app.put('/api/admin/blog/:id', upload.single('image'), (req, res) => {
    try {
        const index = blogPosts.findIndex(p => p.id === Number(req.params.id));
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        const post = blogPosts[index];
        blogPosts[index] = {
            ...post,
            title: req.body.title || post.title,
            excerpt: req.body.excerpt || post.excerpt,
            fullContent: req.body.fullContent || post.fullContent,
            image: req.file ? `/uploads/${req.file.filename}` : post.image,
            readTime: req.body.readTime || post.readTime,
            author: req.body.author || post.author,
            category: req.body.category || post.category,
            tags: req.body.tags
                ? req.body.tags.split(',').map(t => t.trim())
                : post.tags
        };

        res.json({ success: true, post: blogPosts[index] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to update post' });
    }
});

// Delete blog post
app.delete('/api/admin/blog/:id', (req, res) => {
    const before = blogPosts.length;
    blogPosts = blogPosts.filter(p => p.id !== Number(req.params.id));
    if (blogPosts.length === before) {
        return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true });
});

// ======================
// 7. CONTACT
// ======================
app.post('/api/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
    }
    
    // Generate reference number
    const reference = 'IC' + Date.now().toString().slice(-8);
    
    console.log('Contact Form Submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('Reference:', reference);
    
    res.json({ 
        success: true, 
        message: 'Thank you for contacting us! We\'ll respond within 24 hours.',
        reference: reference
    });
});

// ======================
// 8. ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
    if (err.message?.includes('image')) {
        return res.status(400).json({ success: false, error: err.message });
    }
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
});

// ======================
// 9. START SERVER
// ======================
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚗  IdealCar Backend API');
    console.log('='.repeat(50));
    console.log(`📡  Server: http://localhost:${PORT}`);
    console.log(`📁  Uploads: http://localhost:${PORT}/uploads`);
    console.log(`📊  API Docs: http://localhost:${PORT}/`);
    console.log(`👤  Admin: Use password "${process.env.ADMIN_PASSWORD || 'admin123'}"`);
    console.log('='.repeat(50));
    console.log(`📝  Total Cars: ${cars.length}`);
    console.log(`📝  Total Blog Posts: ${blogPosts.length}`);
    console.log('='.repeat(50) + '\n');
});
