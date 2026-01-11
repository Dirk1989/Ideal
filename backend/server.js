const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// ======================
// 1. SETUP CORS FIRST!
// ======================
// Allow ALL origins during development
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        
        // Allow all origins during development
        return callback(null, true);
        
        // For production, you would check against a whitelist:
        // const allowedOrigins = ['https://yourdomain.com', 'https://admin.yourdomain.com'];
        // if(allowedOrigins.indexOf(origin) === -1) {
        //     return callback(new Error('CORS policy violation'), false);
        // }
        // return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// ======================
// 2. MULTER SETUP
// ======================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    }
});

// ======================
// 3. SAMPLE DATA
// ======================
let cars = [
    {
        id: 1,
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
        excerpt: 'Everything you need to know about purchasing pre-owned vehicles in South Africa, from budgeting to paperwork.',
        fullContent: `
            <h2>How to Buy a Used Car in South Africa</h2>
            <p>Buying a used car can be an excellent way to get a quality vehicle without breaking the bank. In South Africa's current economic climate, smart purchasing decisions are more important than ever.</p>
            
            <h3>1. Set Your Budget Realistically</h3>
            <p>Before you start looking, determine what you can afford. Remember to include:</p>
            <ul>
                <li><strong>Purchase Price:</strong> Stick to 20% of your annual income as a general rule</li>
                <li><strong>Insurance:</strong> Get quotes before buying</li>
                <li><strong>Registration & License:</strong> Approximately R1,000-R1,500</li>
                <li><strong>Initial Repairs:</strong> Set aside 10% of purchase price for unexpected repairs</li>
            </ul>
            
            <h3>2. Research Popular Models in SA</h3>
            <p>Some of the most reliable used cars in South Africa include:</p>
            <ul>
                <li><strong>Toyota Corolla:</strong> Legendary reliability, parts readily available</li>
                <li><strong>Volkswagen Polo:</strong> Great fuel economy, comfortable ride</li>
                <li><strong>Ford Ranger:</strong> Excellent for work and family</li>
                <li><strong>BMW 3 Series:</strong> Luxury at affordable prices</li>
            </ul>
            
            <h3>3. Where to Look for Used Cars</h3>
            <p>In South Africa, you have several options:</p>
            <ul>
                <li><strong>Dealerships:</strong> Often offer warranty and peace of mind</li>
                <li><strong>AutoTrader:</strong> Largest online marketplace</li>
                <li><strong>Gumtree:</strong> Good for private sellers</li>
                <li><strong>Facebook Marketplace:</strong> Increasingly popular</li>
                <li><strong>Specialized Websites:</strong> Like IdealCar!</li>
            </ul>
            
            <h3>4. Essential Inspection Checklist</h3>
            <p>Always inspect thoroughly before buying:</p>
            
            <h4>Exterior Inspection</h4>
            <ul>
                <li>Check for rust (common in coastal areas)</li>
                <li>Look for paint mismatches indicating repairs</li>
                <li>Test all doors, boot, and bonnet</li>
                <li>Check tyre condition and tread depth</li>
            </ul>
            
            <h4>Interior Inspection</h4>
            <ul>
                <li>Test all electrical features</li>
                <li>Check for water damage or musty smells</li>
                <li>Inspect seat wear for true mileage indication</li>
                <li>Test air conditioning (essential in SA heat)</li>
            </ul>
            
            <h4>Mechanical Inspection</h4>
            <ul>
                <li>Start from cold - listen for unusual noises</li>
                <li>Check for smoke from exhaust</li>
                <li>Test transmission through all gears</li>
                <li>Check brake performance</li>
                <li>Look for fluid leaks under the car</li>
            </ul>
            
            <h3>5. Test Drive Essentials</h3>
            <p>Never skip the test drive. Test:</p>
            <ul>
                <li><strong>Acceleration:</strong> Should be smooth</li>
                <li><strong>Braking:</strong> No pulling to one side</li>
                <li><strong>Steering:</strong> Should be responsive with no play</li>
                <li><strong>Suspension:</strong> Listen for clunks over bumps</li>
                <li><strong>At Highway Speed:</strong> Check for vibrations</li>
            </ul>
            
            <h3>6. Paperwork Verification (CRITICAL)</h3>
            <p>In South Africa, you must check:</p>
            <ul>
                <li><strong>NATIS Certificate:</strong> Verify ownership details</li>
                <li><strong>Roadworthy Certificate:</strong> Valid for 60 days after sale</li>
                <li><strong>Service History:</strong> Complete records are ideal</li>
                <li><strong>VIN Number:</strong> Match with documents and car</li>
                <li><strong>Police Clearance:</strong> If buying from another province</li>
            </ul>
            
            <h3>7. Negotiation Tips</h3>
            <p>South Africans love to negotiate! Tips:</p>
            <ul>
                <li>Research market prices for similar models</li>
                <li>Start 15-20% below asking price</li>
                <li>Point out legitimate issues found during inspection</li>
                <li>Be prepared to walk away if the price isn't right</li>
                <li>Consider timing - end of month often yields better deals</li>
            </ul>
            
            <h3>8. Finalizing the Deal</h3>
            <p>Once you agree on a price:</p>
            <ul>
                <li>Get everything in writing</li>
                <li>Use a secure payment method (EFT recommended)</li>
                <li>Ensure you receive all original documents</li>
                <li>Transfer ownership within 21 days as required by law</li>
                <li>Update your insurance immediately</li>
            </ul>
            
            <h3>9. After Purchase</h3>
            <p>Your responsibilities don't end at purchase:</p>
            <ul>
                <li>Schedule a full service immediately</li>
                <li>Replace all fluids (oil, coolant, brake fluid)</li>
                <li>Check and replace filters if needed</li>
                <li>Consider adding a warranty if available</li>
                <li>Keep all maintenance records for future resale</li>
            </ul>
            
            <h3>10. Common Pitfalls to Avoid</h3>
            <p>Watch out for these red flags:</p>
            <ul>
                <li>Cars with outstanding finance (check through TransUnion)</li>
                <li>Stolen vehicles (verify through SAPS)</li>
                <li>Odometer tampering (common in older luxury cars)</li>
                <li>Rebuilt write-offs (check for salvage title)</li>
                <li>Sellers refusing a proper inspection</li>
            </ul>
            
            <h3>Conclusion</h3>
            <p>Buying a used car in South Africa can be a rewarding experience if done correctly. Take your time, do thorough research, and don't let excitement override common sense. A well-maintained used car can provide years of reliable service and save you significant money compared to buying new.</p>
            
            <p><strong>Happy car hunting from the IdealCar team!</strong></p>
        `,
        image: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&h=500&fit=crop',
        date: '2024-01-15',
        readTime: '8 min',
        author: 'DirkL',
        category: 'Buying Guide',
        tags: ['used cars', 'buying guide', 'South Africa', 'tips', 'inspection']
    }
];

// ======================
// 4. PUBLIC ROUTES
// ======================

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'IdealCar Backend API',
        endpoints: {
            cars: '/api/cars',
            blog: '/api/blog',
            adminLogin: '/api/admin/login (POST)'
        }
    });
});

// Get all cars
app.get('/api/cars', (req, res) => {
    res.json(cars);
});

// Get single car
app.get('/api/cars/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const car = cars.find(c => c.id === id);
    car ? res.json(car) : res.status(404).json({ error: 'Car not found' });
});

// Get all blog posts
app.get('/api/blog', (req, res) => {
    res.json(blogPosts);
});

// Get single blog post
app.get('/api/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const post = blogPosts.find(p => p.id === id);
    post ? res.json(post) : res.status(404).json({ error: 'Post not found' });
});

// ======================
// 5. ADMIN ROUTES
// ======================

// Admin login - SIMPLE WORKING VERSION
app.post('/api/admin/login', (req, res) => {
    console.log('Login attempt received:', req.body);
    
    const { password } = req.body;
    
    // Always return success for testing
    res.json({
        success: true,
        token: 'idealcar-admin-token-2024',
        message: 'Login successful'
    });
    
    // For production, use this instead:
    /*
    if (password === 'admin123') {
        res.json({
            success: true,
            token: 'idealcar-admin-token-2024',
            message: 'Login successful'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }
    */
});

// Add a new car
app.post('/api/admin/cars', upload.array('images', 10), (req, res) => {
    try {
        console.log('Adding car:', req.body);
        console.log('Files:', req.files ? req.files.length : 0);
        
        const newCar = {
            id: cars.length + 1,
            make: req.body.make,
            model: req.body.model,
            year: parseInt(req.body.year),
            price: parseFloat(req.body.price),
            description: req.body.description,
            images: req.files ? req.files.map(f => f.filename) : [],
            mileage: req.body.mileage || 'N/A',
            transmission: req.body.transmission || 'Automatic',
            fuel: req.body.fuel || 'Petrol',
            engine: req.body.engine || 'N/A',
            color: req.body.color || 'N/A',
            doors: parseInt(req.body.doors) || 4,
            seats: parseInt(req.body.seats) || 5,
            condition: req.body.condition || 'Good',
            features: req.body.features ? req.body.features.split(',').map(f => f.trim()) : []
        };
        
        cars.push(newCar);
        res.json({ success: true, car: newCar });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update a car
app.put('/api/admin/cars/:id', upload.array('images', 10), (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = cars.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Car not found' });
        }
        
        const updatedCar = {
            ...cars[index],
            make: req.body.make || cars[index].make,
            model: req.body.model || cars[index].model,
            year: req.body.year ? parseInt(req.body.year) : cars[index].year,
            price: req.body.price ? parseFloat(req.body.price) : cars[index].price,
            description: req.body.description || cars[index].description,
            mileage: req.body.mileage || cars[index].mileage,
            transmission: req.body.transmission || cars[index].transmission,
            fuel: req.body.fuel || cars[index].fuel,
            engine: req.body.engine || cars[index].engine,
            color: req.body.color || cars[index].color,
            doors: req.body.doors ? parseInt(req.body.doors) : cars[index].doors,
            seats: req.body.seats ? parseInt(req.body.seats) : cars[index].seats,
            condition: req.body.condition || cars[index].condition,
            features: req.body.features ? req.body.features.split(',').map(f => f.trim()) : cars[index].features
        };
        
        if (req.files && req.files.length > 0) {
            updatedCar.images = req.files.map(f => f.filename);
        }
        
        cars[index] = updatedCar;
        res.json({ success: true, car: updatedCar });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a car
app.delete('/api/admin/cars/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const newCars = cars.filter(c => c.id !== id);
    
    if (newCars.length < cars.length) {
        cars = newCars;
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'Car not found' });
    }
});

// Contact form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
    }
    
    console.log('Contact form:', { name, email, message });
    res.json({ 
        success: true, 
        message: 'Thank you for your message!' 
    });
});

// ======================
// 6. START SERVER
// ======================
app.listen(PORT, () => {
    console.log(`🚗 IdealCar Backend running on http://localhost:${PORT}`);
    console.log(`📁 Uploads: http://localhost:${PORT}/uploads/`);
    console.log(`🔧 Admin: http://localhost:${PORT}/api/admin/login`);
    console.log(`📝 Test backend: http://localhost:${PORT}/api/cars`);
    console.log(`\n💡 Access admin via: http://localhost:8001/login.html`);
});