// Simple and Fixed Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing website');
    
    // Initialize Firebase first
    initFirebase();
    
    // Initialize all systems
    initTheme();
    initNavigation();
    initPortfolioAnimations();
    initServiceAnimations();
    initBookingSystem();
    initContactForm();
    
    // Load limited portfolio for home page
    loadLimitedPortfolio();
    
    console.log('Website initialized successfully');
});

// Firebase Initialization
function initFirebase() {
    // Your Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyC-25CvcxzGmFuw3wRg-T9U-eKPuckFw0c",
        authDomain: "fototaker-studio.firebaseapp.com",
        projectId: "fototaker-studio",
        storageBucket: "fototaker-studio.firebasestorage.app",
        messagingSenderId: "401638389477",
        appId: "1:401638389477:web:a8af16d0f9b49bf8dc460c",
        measurementId: "G-W4NT35YBQJ"
    };

    // Initialize Firebase only if not already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}

// Theme Management (YOUR EXISTING CODE IS PERFECT)
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (!themeToggle) {
        console.error('Theme toggle button not found!');
        return;
    }
    
    const themeIcon = themeToggle.querySelector('i');
    
    // Check saved theme or system preference
    const getSavedTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };
    
    // Apply theme function
    const applyTheme = (theme) => {
        console.log('Applying theme:', theme);
        
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        
        // Update navbar background
        updateNavbarBackground();
    };
    
    // Update navbar background based on scroll and theme
    const updateNavbarBackground = () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        if (window.scrollY > 100) {
            navbar.style.background = body.classList.contains('dark-theme') 
                ? 'rgba(17, 24, 39, 0.98)' 
                : 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = body.classList.contains('dark-theme')
                ? 'rgba(17, 24, 39, 0.95)'
                : 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    };
    
    // Initialize theme
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    
    // Theme toggle click event
    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Theme toggle clicked');
        
        const isDark = body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        
        console.log('Switching to theme:', newTheme);
        
        // Apply new theme
        applyTheme(newTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
    });
    
    // Scroll event for navbar
    window.addEventListener('scroll', updateNavbarBackground);
}

// Navigation Management (YOUR EXISTING CODE IS PERFECT)
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    // Mobile navigation toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Close mobile menu function
    function closeMobileMenu() {
        if (navMenu) navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
    }
    
    // Navigation smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#home') {
                e.preventDefault();
                closeMobileMenu();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    closeMobileMenu();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Active navigation link on scroll
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link.box-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && navToggle && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target) &&
            navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Set active link on page load
    updateActiveNavLink();
}

// Portfolio System - UPDATED
// Load limited portfolio for home page
async function loadLimitedPortfolio() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    if (!portfolioGrid) return;
    
    try {
        // First try to load from Firebase
        const db = firebase.firestore();
        const querySnapshot = await db.collection('portfolio')
            .orderBy('createdAt', 'desc')
            .limit(6)
            .get();
        
        const portfolioData = [];
        querySnapshot.forEach((doc) => {
            portfolioData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        if (portfolioData.length > 0) {
            displayPortfolioItems(portfolioData);
        } else {
            // If no Firebase data, try localStorage (from admin panel)
            loadPortfolioFromLocalStorage();
        }
    } catch (error) {
        console.log('Error loading portfolio from Firebase:', error);
        // Fallback to localStorage
        loadPortfolioFromLocalStorage();
    }
}

// Load portfolio from localStorage (admin panel data)
function loadPortfolioFromLocalStorage() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
    
    if (portfolioData.length > 0) {
        displayPortfolioItems(portfolioData);
    } else {
        // Final fallback - default portfolio
        displayDefaultPortfolio();
    }
}

// Display portfolio items
function displayPortfolioItems(items) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    if (!portfolioGrid) return;
    
    // Take only first 6 items for home page
    const limitedItems = items.slice(0, 6);
    
    portfolioGrid.innerHTML = limitedItems.map(item => `
        <div class="portfolio-item">
            <img src="${item.image}" alt="${item.title}" class="portfolio-img" 
                 onerror="this.src='https://picsum.photos/400/600?random=${Math.floor(Math.random() * 100)}'">
            <div class="portfolio-overlay">
                <h3>${item.title}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <small>${getCategoryDisplayName(item.category)}</small>
            </div>
        </div>
    `).join('');
    
    initPortfolioAnimations();
}

// Default portfolio (when no data available)
function displayDefaultPortfolio() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    if (!portfolioGrid) return;
    
    portfolioGrid.innerHTML = `
        <div class="portfolio-item">
            <img src="https://picsum.photos/400/600?random=1" alt="Wedding Photography" class="portfolio-img">
            <div class="portfolio-overlay">
                <h3>Wedding Photography</h3>
                <p>Beautiful moments from special days</p>
            </div>
        </div>
        <div class="portfolio-item">
            <img src="https://picsum.photos/400/600?random=2" alt="Pre-Wedding Shoots" class="portfolio-img">
            <div class="portfolio-overlay">
                <h3>Pre-Wedding Shoots</h3>
                <p>Romantic couple photoshoots</p>
            </div>
        </div>
        <div class="portfolio-item">
            <img src="https://picsum.photos/400/600?random=3" alt="Portrait Photography" class="portfolio-img">
            <div class="portfolio-overlay">
                <h3>Portrait Photography</h3>
                <p>Professional portrait sessions</p>
            </div>
        </div>
        <div class="portfolio-item">
            <img src="https://picsum.photos/400/600?random=4" alt="Event Photography" class="portfolio-img">
            <div class="portfolio-overlay">
                <h3>Event Photography</h3>
                <p>Capturing special occasions</p>
            </div>
        </div>
        <div class="portfolio-item">
            <img src="https://picsum.photos/400/600?random=5" alt="Drone Photography" class="portfolio-img">
            <div class="portfolio-overlay">
                <h3>Drone Photography</h3>
                <p>Aerial views and perspectives</p>
            </div>
        </div>
        <div class="portfolio-item">
            <img src="https://picsum.photos/400/600?random=6" alt="Candid Photography" class="portfolio-img">
            <div class="portfolio-overlay">
                <h3>Candid Photography</h3>
                <p>Natural and spontaneous moments</p>
            </div>
        </div>
    `;
    
    initPortfolioAnimations();
}

// Initialize portfolio animations (YOUR EXISTING CODE IS PERFECT)
function initPortfolioAnimations() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const portfolioObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'scale(1)';
                }, index * 150);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    portfolioItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
        item.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        portfolioObserver.observe(item);
    });
}

// Service animations (YOUR EXISTING CODE IS PERFECT)
function initServiceAnimations() {
    const serviceCards = document.querySelectorAll('.service-card');
    const serviceObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        serviceObserver.observe(card);
    });
}

// Booking System (YOUR EXISTING CODE IS PERFECT)
function initBookingSystem() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                serviceType: document.getElementById('serviceType').value,
                eventDate: document.getElementById('eventDate').value,
                location: document.getElementById('location').value,
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            try {
                // Show loading
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Request...';
                submitBtn.disabled = true;
                
                // Save to Firebase
                await saveBookingToFirebase(formData);
                
                // Send WhatsApp notification
                sendWhatsAppBookingNotification(formData);
                
                // Show success message
                showNotification(`Thank you ${formData.name}! Your ${getServiceDisplayName(formData.serviceType)} request has been sent. We'll contact you within 2 hours.`, 'success');
                
                // Reset form
                this.reset();
                
            } catch (error) {
                console.error('Booking error:', error);
                showNotification('Error sending booking request. Please try again or contact us directly via WhatsApp.', 'error');
            } finally {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Booking Request';
                submitBtn.disabled = false;
            }
        });
    }
}

// Save booking to Firebase (YOUR EXISTING CODE IS PERFECT)
async function saveBookingToFirebase(bookingData) {
    try {
        const db = firebase.firestore();
        await db.collection('bookings').add(bookingData);
        console.log('Booking saved to Firebase');
    } catch (error) {
        console.error('Error saving booking:', error);
        throw error;
    }
}

// Contact Form Handler (YOUR EXISTING CODE IS PERFECT)
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[name="name"]').value;
            const email = this.querySelector('input[name="email"]').value;
            const phone = this.querySelector('input[name="phone"]').value;
            const message = this.querySelector('textarea[name="message"]').value;
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                const formData = {
                    name,
                    email,
                    phone,
                    message,
                    timestamp: new Date().toISOString()
                };
                
                // Save to localStorage for demo
                let existingData = JSON.parse(localStorage.getItem('contactSubmissions')) || [];
                existingData.push(formData);
                localStorage.setItem('contactSubmissions', JSON.stringify(existingData));
                
                showNotification(`Thank you ${name}! Your message has been sent successfully.`, 'success');
                
                this.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
}

// WhatsApp integration (YOUR EXISTING CODE IS PERFECT)
function openWhatsApp(prefilledMessage = '') {
    const phone = '919471640485';
    const message = prefilledMessage || 'Hello! I want to book photography/videography services';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Scroll to booking with pre-selected service (YOUR EXISTING CODE IS PERFECT)
function scrollToBooking(serviceType) {
    const bookingSection = document.getElementById('booking');
    const serviceSelect = document.getElementById('serviceType');
    
    if (bookingSection && serviceSelect) {
        serviceSelect.value = serviceType;
        bookingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Send WhatsApp notification for booking (YOUR EXISTING CODE IS PERFECT)
function sendWhatsAppBookingNotification(bookingData) {
    const phone = '919471640485';
    const serviceName = getServiceDisplayName(bookingData.serviceType);
    
    const message = `📸 NEW BOOKING REQUEST - ${serviceName.toUpperCase()}

👤 Client: ${bookingData.name}
📞 Phone: ${bookingData.phone}
📧 Email: ${bookingData.email || 'Not provided'}

🎯 Service: ${serviceName}
📅 Date: ${bookingData.eventDate || 'Not specified'}
📍 Location: ${bookingData.location || 'Not specified'}

📝 Requirements:
${bookingData.message || 'No additional details'}

⏰ Received: ${new Date().toLocaleString()}
🌐 Source: Website Booking Form`;

    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');
}

// Helper function to get service display name (YOUR EXISTING CODE IS PERFECT)
function getServiceDisplayName(serviceKey) {
    const serviceNames = {
        'wedding-photography': 'Wedding Photography',
        'wedding-videography': 'Wedding Videography', 
        'wedding-combo': 'Wedding Photo+Video Combo',
        'pre-wedding-shoot': 'Pre-Wedding Shoot',
        'birthday-photography': 'Birthday Photography',
        'anniversary-shoot': 'Anniversary Shoot',
        'corporate-event': 'Corporate Event Coverage',
        'baby-shower': 'Baby Shower Photography',
        'engagement': 'Engagement Ceremony',
        'family-portrait': 'Family Portrait',
        'couple-shoot': 'Couple Shoot',
        'maternity-shoot': 'Maternity Photography',
        'newborn-photography': 'Newborn Photography',
        'professional-portfolio': 'Professional Portfolio',
        'drone-photography': 'Drone Photography',
        'aerial-videography': 'Aerial Videography',
        'commercial-photography': 'Commercial Photography',
        'product-photography': 'Product Photography',
        'real-estate-photography': 'Real Estate Photography',
        'video-editing': 'Video Editing',
        'photo-editing': 'Photo Editing',
        'album-design': 'Photo Album Design',
        'cinematic-video': 'Cinematic Video Making',
        'other': 'Photography Service'
    };
    
    return serviceNames[serviceKey] || 'Photography Service';
}

// Helper function to get category display name (YOUR EXISTING CODE IS PERFECT)
function getCategoryDisplayName(category) {
    const categoryMap = {
        'wedding': 'Wedding Photography',
        'pre-wedding': 'Pre-Wedding Shoots',
        'portrait': 'Portrait Photography',
        'events': 'Events',
        'drone': 'Drone Shots'
    };
    return categoryMap[category] || category;
}

// Notification system (YOUR EXISTING CODE IS PERFECT)
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: 10px;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    document.body.appendChild(notification);
}

// Handle image errors gracefully (YOUR EXISTING CODE IS PERFECT)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            console.log('Image failed to load:', this.src);
            if (!this.src.includes('picsum.photos')) {
                this.src = 'https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100);
            }
        };
    });
});

// Make body visible after loading (YOUR EXISTING CODE IS PERFECT)
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.visibility = 'visible';
});
