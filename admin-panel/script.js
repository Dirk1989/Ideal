// ======================
// AUTHENTICATION CHECK
// ======================
const TOKEN = localStorage.getItem('idealcarAdminToken') || localStorage.getItem('adminToken');

if (!TOKEN) {
    alert('Please login first');
    window.location.href = 'login.html';
}

// ======================
// CONFIGURATION
// ======================
const API_URL = 'http://localhost:3000/api';

// ======================
// DOM ELEMENTS
// ======================
const carForm = document.getElementById('carForm');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const carsList = document.getElementById('carsList');
const imagesInput = document.getElementById('images');
const fileList = document.getElementById('fileList');

// ======================
// STATE VARIABLES
// ======================
let isEditing = false;
let currentCarId = null;
let features = [];

// ======================
// INITIALIZATION
// ======================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin panel loaded');
    loadCars();
    
    // Add form submit handler
    if (carForm) {
        carForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitCar();
        });
    }
    
    // Cancel button handler
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
    }
    
    // File input display
    if (imagesInput) {
        imagesInput.addEventListener('change', updateFileList);
    }
    
    // Features initialization
    renderFeatures();
});

// ======================
// FILE HANDLING
// ======================
function updateFileList(e) {
    const files = e.target.files;
    
    if (fileList) {
        fileList.innerHTML = '';
        
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                `;
                fileList.appendChild(fileItem);
            });
        }
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ======================
// FEATURES MANAGEMENT
// ======================
window.addFeature = function() {
    const input = document.getElementById('featureInput');
    const feature = input.value.trim();
    
    if (feature && !features.includes(feature)) {
        features.push(feature);
        renderFeatures();
        input.value = '';
        input.focus();
    }
};

window.removeFeature = function(index) {
    features.splice(index, 1);
    renderFeatures();
};

function renderFeatures() {
    const container = document.getElementById('featuresList');
    if (!container) return;
    
    container.innerHTML = '';
    
    features.forEach((feature, index) => {
        const tag = document.createElement('span');
        tag.className = 'feature-tag';
        tag.innerHTML = `${feature} <i class="fas fa-times" onclick="removeFeature(${index})"></i>`;
        container.appendChild(tag);
    });
    
    if (features.length === 0) {
        container.innerHTML = '<span style="color:#666;font-style:italic;">No features added yet</span>';
    }
}

// ======================
// CAR MANAGEMENT
// ======================
async function loadCars() {
    try {
        console.log('Loading cars from:', `${API_URL}/cars`);
        const response = await fetch(`${API_URL}/cars`);
        const cars = await response.json();
        
        displayCars(cars);
        updateStats(cars);
        
    } catch (error) {
        console.error('Error loading cars:', error);
        if (carsList) {
            carsList.innerHTML = '<p style="color: red; padding: 20px;">Error loading cars. Is backend running?</p>';
        }
    }
}

function displayCars(cars) {
    if (!carsList) return;
    
    if (cars.length === 0) {
        carsList.innerHTML = '<p style="text-align: center; padding: 30px; color: #666;">No cars yet. Add your first car!</p>';
        return;
    }
    
    let html = '';
    cars.forEach(car => {
        const firstImage = car.images && car.images.length > 0 ? car.images[0] : null;
        const imageUrl = firstImage 
            ? `http://localhost:3000/uploads/${firstImage}`
            : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="75"><rect width="100" height="75" fill="#f0f0f0"/><text x="50" y="38" font-family="Arial" font-size="12" text-anchor="middle" fill="#666">Car</text></svg>';
        
        html += `
            <div class="car-item">
                <div class="car-header">
                    <h3 class="car-title">${car.make} ${car.model} (${car.year})</h3>
                    <div class="car-price">R${car.price.toLocaleString('en-ZA')}</div>
                </div>
                
                <div class="car-details">
                    <div><strong>Specs:</strong> ${car.mileage} • ${car.transmission} • ${car.fuel}</div>
                    <div><strong>Engine:</strong> ${car.engine} • <strong>Color:</strong> ${car.color}</div>
                    <div><strong>Condition:</strong> ${car.condition}</div>
                </div>
                
                ${car.images && car.images.length > 0 ? `
                    <div class="car-images">
                        ${car.images.slice(0, 4).map(img => `
                            <img src="http://localhost:3000/uploads/${img}" 
                                 alt="Car photo" 
                                 onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\"><rect width=\"60\" height=\"60\" fill=\"%23f0f0f0\"/><text x=\"30\" y=\"30\" font-family=\"Arial\" font-size=\"10\" text-anchor=\"middle\" fill=\"%23666\">Car</text></svg>'">
                        `).join('')}
                        ${car.images.length > 4 ? `<span>+${car.images.length - 4} more</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="car-actions">
                    <button class="btn-edit" onclick="editCar(${car.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteCar(${car.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    carsList.innerHTML = html;
}

async function submitCar() {
    const formData = new FormData();
    
    // Add car data
    formData.append('make', document.getElementById('make').value);
    formData.append('model', document.getElementById('model').value);
    formData.append('year', document.getElementById('year').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('mileage', document.getElementById('mileage').value);
    formData.append('transmission', document.getElementById('transmission').value);
    formData.append('fuel', document.getElementById('fuel').value);
    formData.append('engine', document.getElementById('engine').value);
    formData.append('color', document.getElementById('color').value);
    formData.append('condition', document.getElementById('condition').value);
    formData.append('doors', document.getElementById('doors').value);
    formData.append('seats', document.getElementById('seats').value);
    formData.append('description', document.getElementById('description').value);
    
    // Add features
    if (features.length > 0) {
        formData.append('features', features.join(','));
    }
    
    // Add images
    const imageFiles = imagesInput.files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }
    
    try {
        let url = `${API_URL}/admin/cars`;
        let method = 'POST';
        
        if (isEditing) {
            url = `${API_URL}/admin/cars/${currentCarId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(isEditing ? 'Car updated successfully!' : 'Car added successfully!');
            resetForm();
            await loadCars();
        } else {
            throw new Error(data.error || 'Operation failed');
        }
        
    } catch (error) {
        console.error('Error saving car:', error);
        alert(`Error: ${error.message}`);
    }
}

window.editCar = async function(id) {
    try {
        const response = await fetch(`${API_URL}/cars`);
        const cars = await response.json();
        const car = cars.find(c => c.id === id);
        
        if (car) {
            // Fill form with car data
            document.getElementById('make').value = car.make;
            document.getElementById('model').value = car.model;
            document.getElementById('year').value = car.year;
            document.getElementById('price').value = car.price;
            document.getElementById('mileage').value = car.mileage;
            document.getElementById('transmission').value = car.transmission;
            document.getElementById('fuel').value = car.fuel;
            document.getElementById('engine').value = car.engine;
            document.getElementById('color').value = car.color;
            document.getElementById('condition').value = car.condition;
            document.getElementById('doors').value = car.doors;
            document.getElementById('seats').value = car.seats;
            document.getElementById('description').value = car.description;
            
            // Set features
            features = car.features || [];
            renderFeatures();
            
            // Update UI for editing
            isEditing = true;
            currentCarId = id;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Car';
            cancelBtn.style.display = 'inline-block';
            
            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading car for edit:', error);
        alert('Error loading car data');
    }
};

window.deleteCar = async function(id) {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/cars/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Car deleted successfully!');
            await loadCars();
        } else {
            throw new Error('Failed to delete car');
        }
    } catch (error) {
        console.error('Error deleting car:', error);
        alert('Error deleting car.');
    }
};

function resetForm() {
    if (carForm) carForm.reset();
    isEditing = false;
    currentCarId = null;
    features = [];
    renderFeatures();
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Car';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (fileList) fileList.innerHTML = '';
    if (imagesInput) imagesInput.value = '';
}

// Add this after the existing blog routes:

// Blog management routes
app.get('/api/admin/blog', (req, res) => {
    res.json(blogPosts);
});

app.get('/api/admin/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const post = blogPosts.find(p => p.id === id);
    post ? res.json(post) : res.status(404).json({ error: 'Post not found' });
});

app.post('/api/admin/blog', (req, res) => {
    try {
        const newPost = {
            id: blogPosts.length + 1,
            title: req.body.title,
            excerpt: req.body.excerpt,
            fullContent: req.body.fullContent,
            image: req.body.image || 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&h=500&fit=crop',
            date: req.body.date || new Date().toISOString().split('T')[0],
            readTime: req.body.readTime || '5 min',
            author: req.body.author || 'Dirkl',
            category: req.body.category || 'General'
        };
        
        blogPosts.unshift(newPost); // Add to beginning
        res.json({ success: true, post: newPost });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/admin/blog/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = blogPosts.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        const updatedPost = {
            ...blogPosts[index],
            title: req.body.title,
            excerpt: req.body.excerpt,
            fullContent: req.body.fullContent,
            image: req.body.image || blogPosts[index].image,
            readTime: req.body.readTime || blogPosts[index].readTime,
            author: req.body.author || blogPosts[index].author,
            category: req.body.category || blogPosts[index].category
        };
        
        blogPosts[index] = updatedPost;
        res.json({ success: true, post: updatedPost });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/admin/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const newPosts = blogPosts.filter(p => p.id !== id);
    
    if (newPosts.length < blogPosts.length) {
        blogPosts = newPosts;
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'Post not found' });
    }
});

// ======================
// STATS FUNCTIONS
// ======================
function updateStats(cars) {
    const totalCars = cars.length;
    const totalImages = cars.reduce((sum, car) => sum + (car.images ? car.images.length : 0), 0);
    const avgPrice = cars.length > 0 
        ? Math.round(cars.reduce((sum, car) => sum + car.price, 0) / cars.length)
        : 0;
    
    const totalCarsEl = document.getElementById('totalCars');
    const totalImagesEl = document.getElementById('totalImages');
    const avgPriceEl = document.getElementById('avgPrice');
    
    if (totalCarsEl) totalCarsEl.textContent = totalCars;
    if (totalImagesEl) totalImagesEl.textContent = totalImages;
    if (avgPriceEl) avgPriceEl.textContent = 'R' + avgPrice.toLocaleString('en-ZA');
}

// ======================
// GLOBAL FUNCTIONS
// ======================
window.logout = function() {
    localStorage.removeItem('idealcarAdminToken');
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
};