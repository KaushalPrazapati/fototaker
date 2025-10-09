// Simple and Fixed Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing website');
    
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

// Theme Management (FIXED)
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

// Navigation Management (FIXED)
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

// Portfolio System - COMPLETELY FIXED
let currentPortfolioPage = 0;
const portfolioPerPage = 6;

// Load limited portfolio for home page
async function loadLimitedPortfolio() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    if (!portfolioGrid) return;
    
    try {
        console.log('Loading portfolio from Firebase...');
        
        // First try to load from Firebase
        const db = firebase.firestore();
        const querySnapshot = await db.collection('portfolio')
            .orderBy('createdAt', 'desc')
            .limit(portfolioPerPage)
            .get();
        
        const portfolioData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            portfolioData.push({
                id: doc.id,
                ...data
            });
        });
        
        console.log('Portfolio data loaded:', portfolioData);
        
        if (portfolioData.length > 0) {
            displayPortfolioItems(portfolioData);
        } else {
            // If no Firebase data, try localStorage
            loadPortfolioFromLocalStorage();
        }
    } catch (error) {
        console.error('Error loading portfolio from Firebase:', error);
        // Fallback to localStorage
        loadPortfolioFromLocalStorage();
    }
}

// Load more portfolio items
async function loadMorePortfolio() {
    try {
        const db = firebase.firestore();
        currentPortfolioPage++;
        
        const querySnapshot = await db.collection('portfolio')
            .orderBy('createdAt', 'desc')
            .limit(portfolioPerPage)
            .startAfter(currentPortfolioPage * portfolioPerPage)
            .get();
        
        const portfolioData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            portfolioData.push({
                id: doc.id,
                ...data
            });
        });
        
        if (portfolioData.length > 0) {
            displayPortfolioItems(portfolioData, true);
        } else {
            showNotification('No more portfolio items to load!', 'info');
        }
    } catch (error) {
        console.error('Error loading more portfolio:', error);
        showNotification('Error loading more portfolio items', 'error');
    }
}

// Load portfolio from localStorage (admin panel data)
function loadPortfolioFromLocalStorage() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
    
    if (portfolioData.length > 0) {
        displayPortfolioItems(portfolioData.slice(0, portfolioPerPage));
    } else {
        // Final fallback - default portfolio
        displayDefaultPortfolio();
    }
}

// Display portfolio items
function displayPortfolioItems(items, append = false) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    if (!portfolioGrid) return;
    
    const portfolioHTML = items.map(item => `
        <div class="portfolio-item">
            <img src="${item.image || 'https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100)}" 
                 alt="${item.title || 'Portfolio Image'}" 
                 class="portfolio-img"
                 onerror="this.src='https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100)">
            <div class="portfolio-overlay">
                <h3>${item.title || 'Portfolio Item'}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <small>${getCategoryDisplayName(item.category) || 'Photography'}</small>
            </div>
        </div>
    `).join('');
    
    if (append) {
        portfolioGrid.innerHTML += portfolioHTML;
    } else {
        portfolioGrid.innerHTML = portfolioHTML;
    }
    
    initPortfolioAnimations();
}

// Default portfolio (when no data available)
function displayDefaultPortfolio() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    if (!portfolioGrid) return;
    
    const defaultPortfolio = [
        { title: 'Wedding Photography', description: 'Beautiful moments from special days', category: 'wedding' },
        { title: 'Pre-Wedding Shoots', description: 'Romantic couple photoshoots', category: 'pre-wedding' },
        { title: 'Portrait Photography', description: 'Professional portrait sessions', category: 'portrait' },
        { title: 'Event Photography', description: 'Capturing special occasions', category: 'events' },
        { title: 'Drone Photography', description: 'Aerial views and perspectives', category: 'drone' },
        { title: 'Candid Photography', description: 'Natural and spontaneous moments', category: 'portrait' }
    ];
    
    const portfolioHTML = defaultPortfolio.map((item, index) => `
        <div class="portfolio-item">
            <img src="https://picsum.photos/400/600?random=${index + 10}" 
                 alt="${item.title}" 
                 class="portfolio-img"
                 onerror="this.src='https://picsum.photos/400/600?random=${index + 20}'">
            <div class="portfolio-overlay">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <small>${getCategoryDisplayName(item.category)}</small>
            </div>
        </div>
    `).join('');
    
    portfolioGrid.innerHTML = portfolioHTML;
    initPortfolioAnimations();
}

// Initialize portfolio animations (FIXED)
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

// Service animations (FIXED)
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

// Booking System (FIXED)
function initBookingSystem() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                serviceType: document.getElementById('serviceType').value,
                eventDate: document.getElementById('eventDate').value,
                location: document.getElementById('location').value.trim(),
                message: document.getElementById('message').value.trim(),
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            
            // Basic validation
            if (!formData.name || !formData.phone || !formData.serviceType) {
                showNotification('Please fill in all required fields (Name, Phone, Service Type)', 'error');
                return;
            }
            
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

// Save booking to Firebase (FIXED)
async function saveBookingToFirebase(bookingData) {
    try {
        const db = firebase.firestore();
        await db.collection('bookings').add(bookingData);
        console.log('Booking saved to Firebase');
        return true;
    } catch (error) {
        console.error('Error saving booking:', error);
        
        // Fallback to localStorage
        try {
            let existingBookings = JSON.parse(localStorage.getItem('bookingRequests')) || [];
            existingBookings.push(bookingData);
            localStorage.setItem('bookingRequests', JSON.stringify(existingBookings));
            console.log('Booking saved to localStorage as fallback');
            return true;
        } catch (fallbackError) {
            console.error('Fallback save also failed:', fallbackError);
            throw error;
        }
    }
}

// Contact Form Handler (FIXED)
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.querySelector('input[name="name"]').value.trim(),
                email: this.querySelector('input[name="email"]').value.trim(),
                phone: this.querySelector('input[name="phone"]').value.trim(),
                message: this.querySelector('textarea[name="message"]').value.trim(),
                timestamp: new Date().toISOString()
            };
            
            // Validation
            if (!formData.name || !formData.email || !formData.message) {
                showNotification('Please fill in all required fields (Name, Email, Message)', 'error');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                try {
                    // Save to localStorage
                    let existingData = JSON.parse(localStorage.getItem('contactSubmissions')) || [];
                    existingData.push(formData);
                    localStorage.setItem('contactSubmissions', JSON.stringify(existingData));
                    
                    showNotification(`Thank you ${formData.name}! Your message has been sent successfully.`, 'success');
                    
                    this.reset();
                } catch (error) {
                    console.error('Contact form error:', error);
                    showNotification('Error sending message. Please try again.', 'error');
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }, 1500);
        });
    }
}

// WhatsApp integration (FIXED)
function openWhatsApp(prefilledMessage = '') {
    const phone = '919471640485';
    const message = prefilledMessage || 'Hello! I want to book photography/videography services';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Scroll to booking with pre-selected service (FIXED)
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

// Send WhatsApp notification for booking (FIXED)
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

// Helper function to get service display name (FIXED)
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

// Helper function to get category display name (FIXED)
function getCategoryDisplayName(category) {
    const categoryMap = {
        'wedding': 'Wedding Photography',
        'pre-wedding': 'Pre-Wedding Shoots',
        'portrait': 'Portrait Photography',
        'events': 'Events',
        'drone': 'Drone Shots'
    };
    return categoryMap[category] || category || 'Photography';
}

// Notification system (FIXED)
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

// Handle image errors gracefully (FIXED)
function handleImageError(img) {
    console.log('Image failed to load:', img.src);
    if (!img.src.includes('picsum.photos')) {
        img.src = 'https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100);
    }
}

// Make body visible after loading (FIXED)
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.visibility = 'visible';
    
    // Add image error handlers
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            handleImageError(this);
        };
    });
});
