const IMAGE_BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api';
let allCars = [];
let currentCars = [];

// Initialize carousels
function initializeCarousels() {
    document.querySelectorAll('.car-carousel').forEach(carousel => {
        new Swiper(carousel.querySelector('.swiper'), {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
            pagination: {
                el: carousel.querySelector('.swiper-pagination'),
                clickable: true,
            },
            navigation: {
                nextEl: carousel.querySelector('.swiper-button-next'),
                prevEl: carousel.querySelector('.swiper-button-prev'),
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
        });
    });
}

// Load cars when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('IdealCar website loaded');
    loadCars();
    
    // Add contact form submit handler
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitContactForm();
    });
    
    // Add search input listeners for real-time filtering
    document.getElementById('searchMake').addEventListener('input', filterCars);
    document.getElementById('searchModel').addEventListener('input', filterCars);
    document.getElementById('searchPrice').addEventListener('change', filterCars);
    document.getElementById('searchYear').addEventListener('change', filterCars);
    document.getElementById('searchTransmission').addEventListener('change', filterCars);
    document.getElementById('searchFuel').addEventListener('change', filterCars);
});

async function loadCars() {
    try {
        console.log('Fetching cars from:', `${API_URL}/cars`);
        
        document.getElementById('loading').style.display = 'block';
        document.getElementById('carsGrid').innerHTML = '';
        
        const response = await fetch(`${API_URL}/cars`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allCars = await response.json();
        console.log('Cars received:', allCars.length);
        
        document.getElementById('loading').style.display = 'none';
        
        if (!allCars || allCars.length === 0) {
            showNoCarsMessage();
            return;
        }
        
        // Format prices to ZAR
        allCars.forEach(car => {
            car.priceZAR = formatZAR(car.price);
        });
        
        currentCars = [...allCars];
        displayCars(currentCars);
        
    } catch (error) {
        console.error('Error loading cars:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('carsGrid').innerHTML = 
            `<div style="text-align:center;padding:40px;color:red;grid-column:1/-1;">
                <h3>Error loading cars</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="background:#1a237e;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">
                    Try Again
                </button>
            </div>`;
    }
}

function displayCars(cars) {
    const carsGrid = document.getElementById('carsGrid');
    carsGrid.innerHTML = '';
    
    if (cars.length === 0) {
        showNoCarsMessage();
        return;
    }
    
    // Show results count
    const resultsInfo = document.createElement('div');
    resultsInfo.style.gridColumn = '1/-1';
    resultsInfo.style.textAlign = 'center';
    resultsInfo.style.marginBottom = '20px';
    resultsInfo.style.color = '#666';
    resultsInfo.innerHTML = `<p>Showing ${cars.length} of ${allCars.length} vehicles</p>`;
    carsGrid.appendChild(resultsInfo);
    
    cars.forEach(car => {
        try {
            const carCard = createCarCard(car);
            carsGrid.appendChild(carCard);
        } catch (error) {
            console.error('Error creating car card:', error, car);
        }
    });
    
    setTimeout(initializeCarousels, 100);
}

function createCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    
    // Handle images
    const images = car.images || [];
    const hasImages = images.length > 0;
    
    // Create carousel HTML
    let carouselHTML = '';
    if (hasImages) {
        carouselHTML = `
            <div class="car-carousel">
                <div class="swiper">
                    <div class="swiper-wrapper">
                        ${images.map((img, index) => {
                            const imageUrl = img.startsWith('http') 
                                ? img 
                                : `http://localhost:3000/uploads/${img}`;
                            
                            return `
                                <div class="swiper-slide">
                                    <img src="${imageUrl}" 
                                         alt="${car.make} ${car.model} - Image ${index + 1}"
                                         class="car-image"
                                         onclick="openImageModal('${imageUrl}', '${car.make} ${car.model}')"
                                         onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"300\"><rect width=\"400\" height=\"300\" fill=\"%23f0f0f0\"/><text x=\"200\" y=\"150\" font-family=\"Arial\" font-size=\"16\" text-anchor=\"middle\" fill=\"%23666\">${car.make} ${car.model}</text></svg>'"
                                         style="cursor: pointer;">
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="swiper-button-next"></div>
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-pagination"></div>
                </div>
            </div>
        `;
    } else {
        carouselHTML = `
            <div class="car-carousel">
                <div class="swiper">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide">
                            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f0f0f0'/><text x='200' y='120' font-family='Arial' font-size='24' text-anchor='middle' fill='%23666'>🚗</text><text x='200' y='160' font-family='Arial' font-size='16' text-anchor='middle' fill='%23333'>${car.make} ${car.model}</text><text x='200' y='190' font-family='Arial' font-size='14' text-anchor='middle' fill='%23666'>Photos coming soon</text></svg>"
                                 alt="${car.make} ${car.model}" 
                                 class="car-image"
                                 style="cursor: pointer;"
                                 onclick="openImageModal('', '${car.make} ${car.model}')">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Create features HTML
    let featuresHTML = '';
    if (car.features && car.features.length > 0) {
        const displayedFeatures = car.features.slice(0, 3);
        const extraFeatures = car.features.length - 3;
        
        featuresHTML = `
            <div class="car-features">
                <div class="features-title">Features:</div>
                <div class="features-list">
                    ${displayedFeatures.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    ${extraFeatures > 0 ? `<span class="feature-tag">+${extraFeatures} more</span>` : ''}
                </div>
            </div>
        `;
    }
    
    // Create WhatsApp message
    const whatsappMessage = encodeURIComponent(
        `Hi IdealCar, I'm interested in the ${car.make} ${car.model} (${car.year}) listed for ${car.priceZAR}. Can you please provide more information?`
    );
    
    card.innerHTML = `
        ${carouselHTML}
        <div class="car-info">
            <div class="car-title">
                <span>${car.make} ${car.model}</span>
                <span class="car-year">${car.year}</span>
            </div>
            
            <p class="car-price">
                <span class="price-prefix">From</span> 
                <span class="zar-price">${car.priceZAR}</span>
            </p>
            
            <div class="car-details-grid">
                <div class="detail-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <div>
                        <div class="detail-label">Mileage</div>
                        <div class="detail-value">${car.mileage || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-cog"></i>
                    <div>
                        <div class="detail-label">Transmission</div>
                        <div class="detail-value">${car.transmission || 'Automatic'}</div>
                    </div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-gas-pump"></i>
                    <div>
                        <div class="detail-label">Fuel Type</div>
                        <div class="detail-value">${car.fuel || 'Petrol'}</div>
                    </div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-cogs"></i>
                    <div>
                        <div class="detail-label">Engine</div>
                        <div class="detail-value">${car.engine || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-palette"></i>
                    <div>
                        <div class="detail-label">Color</div>
                        <div class="detail-value">${car.color || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-door-closed"></i>
                    <div>
                        <div class="detail-label">Doors</div>
                        <div class="detail-value">${car.doors || 4}</div>
                    </div>
                </div>
            </div>
            
            ${featuresHTML}
            
            <p class="car-description">${car.description || 'No description available.'}</p>
            
            <button class="whatsapp-btn" onclick="contactWhatsApp('${car.make} ${car.model} (${car.year})', '${car.priceZAR}')">
                <i class="fab fa-whatsapp"></i> WhatsApp Inquiry
            </button>
            
            <button class="contact-btn" onclick="showContactForm('${car.make} ${car.model}')">
                <i class="fas fa-envelope"></i> Email Inquiry
            </button>
        </div>
    `;
    
    return card;
}

// Filter cars based on search criteria
function filterCars() {
    const make = document.getElementById('searchMake').value.toLowerCase();
    const model = document.getElementById('searchModel').value.toLowerCase();
    const maxPrice = parseInt(document.getElementById('searchPrice').value) || Infinity;
    const minYear = parseInt(document.getElementById('searchYear').value) || 0;
    const transmission = document.getElementById('searchTransmission').value;
    const fuel = document.getElementById('searchFuel').value;
    
    currentCars = allCars.filter(car => {
        // Check make
        if (make && !car.make.toLowerCase().includes(make)) return false;
        
        // Check model
        if (model && !car.model.toLowerCase().includes(model)) return false;
        
        // Check price
        if (car.price > maxPrice) return false;
        
        // Check year
        if (car.year < minYear) return false;
        
        // Check transmission
        if (transmission && car.transmission !== transmission) return false;
        
        // Check fuel type
        if (fuel && car.fuel !== fuel) return false;
        
        return true;
    });
    
    displayCars(currentCars);
    
    // Show/hide no results message
    const noResults = document.getElementById('noResults');
    if (currentCars.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

function clearFilters() {
    document.getElementById('searchMake').value = '';
    document.getElementById('searchModel').value = '';
    document.getElementById('searchPrice').value = '';
    document.getElementById('searchYear').value = '';
    document.getElementById('searchTransmission').value = '';
    document.getElementById('searchFuel').value = '';
    
    currentCars = [...allCars];
    displayCars(currentCars);
    document.getElementById('noResults').style.display = 'none';
}

function showNoCarsMessage() {
    document.getElementById('carsGrid').innerHTML = 
        '<div style="text-align:center;padding:40px;grid-column:1/-1;color:#666;">' +
        '<h3>No vehicles available at the moment</h3>' +
        '<p>Check back soon for new listings or contact us for specific requests.</p>' +
        '</div>';
}

// Contact functions
function contactWhatsApp(carName, price) {
    const message = encodeURIComponent(
        `Hi IdealCar,\n\nI'm interested in the ${carName} listed for ${price}.\n\nPlease provide:\n1. Availability\n2. Service history\n3. Additional photos\n4. Test drive availability\n\nThank you!`
    );
    
    window.open(`https://wa.me/275551234567?text=${message}`, '_blank');
}

function showContactForm(carName) {
    document.getElementById('contactSubject').value = `Inquiry about: ${carName}`;
    document.getElementById('contactMessage').focus();
    
    // Scroll to contact form
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

async function submitContactForm() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    // Simple validation
    if (!name || !email || !phone || !message) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Validate South African phone number (basic)
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        alert('Please enter a valid South African phone number');
        return;
    }
    
    // Show loading
    const submitBtn = document.querySelector('.submit-button');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, subject, message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`✅ ${data.message}\n\nReference: ${data.reference}`);
            document.getElementById('contactForm').reset();
        } else {
            alert(`❌ ${data.message || 'Failed to send message. Please try again.'}`);
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        alert('❌ Network error. Please try again or contact us directly.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Image modal functions
function openImageModal(imageUrl, title) {
    if (!imageUrl) {
        alert('No image available for this vehicle');
        return;
    }
    
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    modalImage.innerHTML = `
        <img src="${imageUrl}" 
             alt="${title}" 
             style="max-width:100%; max-height:90vh; border-radius:5px;">
        <p style="color:white; text-align:center; margin-top:10px;">${title}</p>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside the image
document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Format price to ZAR
function formatZAR(amount) {
    if (!amount) return 'R0';
    return 'R' + Math.round(amount).toLocaleString('en-ZA');
}

// Blog Modal Functions
async function loadBlogPosts() {
    try {
        const response = await fetch(`${API_URL}/blog`);
        const posts = await response.json();
        
        const blogGrid = document.querySelector('.blog-grid');
        if (blogGrid) {
            blogGrid.innerHTML = posts.map(post => `
                <div class="blog-card">
                    <img src="${post.image}" alt="${post.title}" class="blog-image">
                    <div class="blog-content">
                        <span class="blog-category">${post.category || 'General'}</span>
                        <h3 class="blog-title">${post.title}</h3>
                        <p class="blog-excerpt">${post.excerpt}</p>
                        <div class="blog-meta">
                            <span><i class="far fa-calendar"></i> ${post.date}</span>
                            <span><i class="far fa-clock"></i> ${post.readTime}</span>
                            <span><i class="far fa-user"></i> ${post.author}</span>
                        </div>
                        <a href="#" class="read-more" onclick="openBlogModal(${post.id}); return false;">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

function openBlogModal(postId) {
    fetch(`${API_URL}/blog/${postId}`)
        .then(response => response.json())
        .then(post => {
            const modal = document.createElement('div');
            modal.className = 'blog-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                overflow-y: auto;
            `;
            
            modal.innerHTML = `
                <div class="blog-modal-content" style="
                    background: white;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    border-radius: 10px;
                    position: relative;
                ">
                    <button class="blog-modal-close" onclick="this.parentElement.parentElement.remove(); document.body.style.overflow='auto'" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: #e74c3c;
                        color: white;
                        border: none;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        font-size: 20px;
                        cursor: pointer;
                        z-index: 2001;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <i class="fas fa-times"></i>
                    </button>
                    <img src="${post.image}" alt="${post.title}" style="width:100%; height:300px; object-fit:cover; border-radius:10px 10px 0 0;">
                    
                    <div style="padding: 30px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h2 style="color:#1a237e; margin:0;">${post.title}</h2>
                            <span style="background:#FFD700; color:#1a237e; padding:5px 15px; border-radius:20px; font-weight:bold;">
                                ${post.category || 'General'}
                            </span>
                        </div>
                        
                        <div style="display:flex; gap:20px; color:#666; margin-bottom:30px; font-size:0.9rem;">
                            <span><i class="far fa-calendar"></i> ${post.date}</span>
                            <span><i class="far fa-clock"></i> ${post.readTime}</span>
                            <span><i class="far fa-user"></i> ${post.author}</span>
                        </div>
                        
                        <div class="blog-full-content">
                            ${post.fullContent}
                        </div>
                        
                        <div style="margin-top:40px; padding-top:20px; border-top:2px solid #f0f0f0;">
                            <h3 style="color:#1a237e;">Share this article:</h3>
                            <div style="display:flex; gap:10px; margin-top:15px;">
                                <button onclick="shareOnFacebook('${post.title}', '${window.location.href}')" style="
                                    background: #1877F2;
                                    color: white;
                                    border: none;
                                    padding: 10px 15px;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                ">
                                    <i class="fab fa-facebook"></i> Facebook
                                </button>
                                <button onclick="shareOnWhatsApp('${post.title}', '${window.location.href}')" style="
                                    background: #25D366;
                                    color: white;
                                    border: none;
                                    padding: 10px 15px;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                ">
                                    <i class="fab fa-whatsapp"></i> WhatsApp
                                </button>
                                <button onclick="shareOnTwitter('${post.title}', '${window.location.href}')" style="
                                    background: #1DA1F2;
                                    color: white;
                                    border: none;
                                    padding: 10px 15px;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                ">
                                    <i class="fab fa-twitter"></i> Twitter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
            // Scroll to top of modal
            modal.querySelector('.blog-modal-content').scrollTop = 0;
        })
        .catch(error => {
            console.error('Error loading blog post:', error);
            alert('Error loading blog post. Please try again.');
        });
}

// Share functions
function shareOnFacebook(title, url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`, '_blank');
}

function shareOnWhatsApp(title, url) {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
}

function shareOnTwitter(title, url) {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
}

// Update DOMContentLoaded to load blog posts
document.addEventListener('DOMContentLoaded', function() {
    console.log('IdealCar website loaded');
    loadCars();
    loadBlogPosts();
    
    // Add contact form submit handler
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitContactForm();
    });
    
    // Add search input listeners for real-time filtering
    document.getElementById('searchMake').addEventListener('input', filterCars);
    document.getElementById('searchModel').addEventListener('input', filterCars);
    document.getElementById('searchPrice').addEventListener('change', filterCars);
    document.getElementById('searchYear').addEventListener('change', filterCars);
    document.getElementById('searchTransmission').addEventListener('change', filterCars);
    document.getElementById('searchFuel').addEventListener('change', filterCars);
});

// Make functions available globally
window.loadCars = loadCars;
window.filterCars = filterCars;
window.clearFilters = clearFilters;
window.contactWhatsApp = contactWhatsApp;
window.showContactForm = showContactForm;
window.openImageModal = openImageModal;
window.closeModal = closeModal;