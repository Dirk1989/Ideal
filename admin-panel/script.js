// ======================
// AUTHENTICATION CHECK
// ======================
const TOKEN = localStorage.getItem('idealcarAdminToken') || localStorage.getItem('adminToken');

if (!TOKEN && window.location.pathname.includes('index.html')) {
    alert('Please login first');
    window.location.href = 'login.html';
}

// ======================
// CONFIGURATION
// ======================
// Configurable API URL - defaults to localhost, can be overridden via environment
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin;
const API_URL = `${API_BASE}/api`;

// ======================
// DOM ELEMENTS (Car Page)
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
// INITIALIZATION (Car Page)
// ======================
if (document.getElementById('carForm')) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Car Admin panel loaded');
        loadDealers();
        loadCars();
        
        // Add New Car Form Handler
        carForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            
            // Add car data to form
            formData.append('dealerId', document.getElementById('dealerId').value);
            formData.append('category', document.getElementById('category').value);
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
                
                if (isEditing && currentCarId) {
                    url = `${API_URL}/admin/cars/${currentCarId}`;
                    method = 'PUT';
                }
                
                const response = await fetch(url, {
                    method: method,
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${TOKEN}`
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert(isEditing ? 'Car updated successfully!' : 'Car added successfully!');
                    resetForm();
                    await loadCars();
                } else {
                    throw new Error(data.error || data.message || 'Operation failed');
                }
                
            } catch (error) {
                console.error('Error saving car:', error);
                alert(`Error: ${error.message}`);
            }
        });
        
        // File input display
        if (imagesInput) {
            imagesInput.addEventListener('change', updateFileList);
        }
        
        // Features initialization
        renderFeatures();
    });
}

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
async function loadDealers() {
    try {
        const response = await fetch(`${API_URL}/dealers`);
        const dealers = await response.json();
        
        const dealerSelect = document.getElementById('dealerId');
        if (dealerSelect) {
            dealerSelect.innerHTML = '<option value="">Select Dealer...</option>';
            dealers.forEach(dealer => {
                const option = document.createElement('option');
                option.value = dealer.id;
                option.textContent = dealer.name;
                dealerSelect.appendChild(option);
            });
            
            // Select first dealer by default if available
            if (dealers.length > 0) {
                dealerSelect.value = dealers[0].id;
            }
        }
    } catch (error) {
        console.error('Error loading dealers:', error);
    }
}

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
    
    if (!cars || cars.length === 0) {
        carsList.innerHTML = '<p style="text-align: center; padding: 30px; color: #666;">No cars yet. Add your first car!</p>';
        return;
    }
    
    let html = '';
    cars.forEach(car => {
        const firstImage = car.images && car.images.length > 0 ? car.images[0] : null;
        let imageUrl;
        if (firstImage) {
            imageUrl = firstImage.startsWith('http') ? firstImage : `http://localhost:3000${firstImage}`;
        } else {
            imageUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="75"><rect width="100" height="75" fill="#f0f0f0"/><text x="50" y="38" font-family="Arial" font-size="12" text-anchor="middle" fill="#666">No Image</text></svg>';
        }
        
        html += `
            <div class="car-item" data-id="${car.id}">
                <div class="car-header">
                    <div>
                        <span style="background: #27ae60; color: white; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; margin-right: 8px;">${car.category || 'Used'}</span>
                        <h3 class="car-title" style="display:inline;">${car.make} ${car.model} (${car.year})</h3>
                    </div>
                    <div class="car-price">R${car.price ? car.price.toLocaleString('en-ZA') : 'N/A'}</div>
                </div>
                
                <div class="car-details">
                    <div><i class="fas fa-tachometer-alt"></i> ${car.mileage || 'N/A'}</div>
                    <div><i class="fas fa-cog"></i> ${car.transmission || 'N/A'}</div>
                    <div><i class="fas fa-gas-pump"></i> ${car.fuel || 'N/A'}</div>
                    <div><i class="fas fa-palette"></i> ${car.color || 'N/A'}</div>
                </div>
                
                ${car.images && car.images.length > 0 ? `
                    <div class="car-images">
                        ${car.images.slice(0, 4).map(img => {
                            const imgUrl = img.startsWith('http') ? img : `http://localhost:3000${img}`;
                            return `
                            <img src="${imgUrl}" 
                                 alt="Car photo" 
                                 onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"60\\" height=\\"60\\"><rect width=\\"60\\" height=\\"60\\" fill=\\"%23f0f0f0\\"/><text x=\\"30\\" y=\\"30\\" font-family=\\"Arial\\" font-size=\\"10\\" text-anchor=\\"middle\\" fill=\\"%23666\\">No Image</text></svg>'">
                        `}).join('')}
                        ${car.images.length > 4 ? `<span>+${car.images.length - 4} more</span>` : ''}
                    </div>
                ` : ''}
                
                <div class="car-actions">
                    <button class="btn-edit" onclick="editCar('${car.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteCar('${car.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    carsList.innerHTML = html;
}

window.editCar = async function(id) {
    try {
        const response = await fetch(`${API_URL}/cars`);
        const cars = await response.json();
        const car = cars.find(c => c.id == id);
        
        if (car) {
            // Fill form with car data
            document.getElementById('dealerId').value = car.dealerId || '';
            document.getElementById('category').value = car.category || 'Used';
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
            
            // Set features - handle both string and array
            if (Array.isArray(car.features)) {
                features = car.features;
            } else if (typeof car.features === 'string') {
                features = car.features.split(',').map(f => f.trim()).filter(f => f);
            } else {
                features = [];
            }
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
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            alert('Car deleted successfully!');
            await loadCars();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete car');
        }
    } catch (error) {
        console.error('Error deleting car:', error);
        alert(`Error deleting car: ${error.message}`);
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
    sessionStorage.clear();
    window.location.href = 'login.html';
};

// ======================
// BLOG ADMIN FUNCTIONALITY (if needed)
// ======================
// This is already handled in blog-admin.html's separate script
// The blog-admin.html has its own separate JavaScript

// ======================
// CANCEL EDIT BUTTON HANDLER
// ======================
if (document.getElementById('cancelBtn')) {
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
}

// ======================
// FEATURE INPUT ENTER KEY HANDLER
// ======================
if (document.getElementById('featureInput')) {
    document.getElementById('featureInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            window.addFeature();
        }
    });
}