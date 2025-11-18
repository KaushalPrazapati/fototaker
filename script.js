// Firebase Configuration Check
console.log('Initializing Firebase...');

// Check if Firebase is already initialized
if (typeof firebaseConfig === 'undefined') {
    console.log('Firebase config not found in HTML, initializing...');
    
    // Firebase Configuration
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
        console.log('Firebase initialized successfully');
    } else {
        console.log('Firebase already initialized');
    }
} else {
    console.log('Firebase config found in HTML');
}

// Firebase services reference with error handling
let db, storage;
try {
    db = firebase.firestore();
    storage = firebase.storage();
    console.log('Firebase services initialized');
} catch (error) {
    console.error('Firebase services error:', error);
    // Fallback: Create dummy objects to prevent errors
    db = { 
        collection: () => ({ 
            get: () => Promise.resolve({ forEach: () => {} }),
            add: () => Promise.resolve()
        }) 
    };
    storage = {};
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Set background color based on type
    const backgroundColor = type === 'success' ? '#27ae60' : 
                           type === 'error' ? '#e74c3c' : '#3498db';
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;

    // Close button functionality
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

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    document.body.appendChild(notification);
}

// Service Name Mapping
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

// Category Name Mapping
function getCategoryDisplayName(category) {
    const categoryMap = {
        'wedding': 'Wedding Photography',
        'pre-wedding': 'Pre-Wedding Shoots',
        'portrait': 'Portrait Photography',
        'events': 'Events',
        'drone': 'Drone Shots',
        'birthday': 'Birthday Party',
        'corporate': 'Corporate Event',
        'family': 'Family Portrait',
        'maternity': 'Maternity Shoot'
    };
    return categoryMap[category] || category || 'Photography';
}

// Image Error Handler
function handleImageError(img) {
    console.log('Image failed to load:', img.src);
    if (!img.src.includes('picsum.photos')) {
        img.src = 'https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100);
    }
}

// Logo Error Handler
function handleLogoError(img) {
    console.log('Logo failed to load:', img.src);
    
    // Fallback to single logo if theme-specific logos don't exist
    if (img.src.includes('logo-light.png') || img.src.includes('logo-dark.png')) {
        img.src = 'image/logo.png';
        img.classList.remove('logo-img-light', 'logo-img-dark');
    }
}

// Founder image error handler
function handleFounderImageError(img) {
    console.log('Founder image failed to load:', img.src);
    
    // Set default professional placeholder
    const placeholder = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    img.src = placeholder;
}

// WhatsApp Integration
function openWhatsApp(prefilledMessage = '') {
    const phone = '917324883263';
    const message = prefilledMessage || 'Hello! I want to book photography/videography services';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Scroll to Booking with Service Pre-selection
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

// Send WhatsApp Booking Notification
function sendWhatsAppBookingNotification(bookingData) {
    const phone = '917324883263';
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
    window.open(whatsappURL, '_blank');
}

// Form Validation
function validateForm(formData, requiredFields) {
    for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === '') {
            return { isValid: false, message: `Please fill in ${field}` };
        }
    }
    return { isValid: true };
}

// ==================== MAIN INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing website');
    
    // Make body visible immediately
    document.body.style.visibility = 'visible';
    
    // Initialize all systems
    initTheme();
    initNavigation();
    initPortfolioSystem();
    initServiceAnimations();
    initBookingSystem();
    initContactForm();
    initAboutSection();
    
    console.log('Website initialized successfully');
    
    // Add image error handlers to all images
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            handleImageError(this);
        };
    });
});

// ==================== THEME MANAGEMENT ====================

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (!themeToggle) {
        console.error('Theme toggle button not found!');
        return;
    }
    
    const themeIcon = themeToggle.querySelector('i');
    
    // Get saved theme or system preference
    const getSavedTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        
        // Check system preference
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
        
        updateNavbarBackground();
        updateLogosForTheme(theme === 'dark');
    };
    
    // Update logos for theme
    function updateLogosForTheme(isDark) {
        const lightLogos = document.querySelectorAll('.logo-img-light');
        const darkLogos = document.querySelectorAll('.logo-img-dark');
        
        if (isDark) {
            lightLogos.forEach(logo => logo.style.display = 'none');
            darkLogos.forEach(logo => logo.style.display = 'block');
        } else {
            lightLogos.forEach(logo => logo.style.display = 'block');
            darkLogos.forEach(logo => logo.style.display = 'none');
        }
    }
    
    // Update navbar background based on scroll
    function updateNavbarBackground() {
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
    }
    
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

// ==================== NAVIGATION MANAGEMENT ====================

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

// ==================== PORTFOLIO SYSTEM ====================

function initPortfolioSystem() {
    loadLimitedPortfolio();
}

// Load portfolio for home page
async function loadLimitedPortfolio() {
    try {
        console.log('Loading portfolio with separate sections from Firebase...');
        
        // Load portfolio images
        const portfolioSnapshot = await db.collection('portfolio')
            .orderBy('createdAt', 'desc')
            .limit(6)
            .get();
        
        const portfolioData = [];
        portfolioSnapshot.forEach((doc) => {
            const data = doc.data();
            portfolioData.push({
                id: doc.id,
                type: 'image',
                ...data
            });
        });
        
        // Load videos for portfolio
        const videosSnapshot = await db.collection('videos')
            .orderBy('createdAt', 'desc')
            .limit(3)
            .get();
        
        const videosData = [];
        videosSnapshot.forEach((doc) => {
            const data = doc.data();
            videosData.push({
                id: doc.id,
                type: 'video',
                ...data
            });
        });
        
        console.log('Portfolio images loaded:', portfolioData.length);
        console.log('Portfolio videos loaded:', videosData.length);
        
        if (portfolioData.length > 0 || videosData.length > 0) {
            displayPortfolioSections(portfolioData, videosData);
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

// Load portfolio from localStorage (admin panel data)
function loadPortfolioFromLocalStorage() {
    try {
        const portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
        const videoData = JSON.parse(localStorage.getItem('videoData')) || [];
        
        const imagesData = portfolioData.slice(0, 6).map(item => ({ ...item, type: 'image' }));
        const videosData = videoData.slice(0, 3).map(item => ({ ...item, type: 'video' }));
        
        if (imagesData.length > 0 || videosData.length > 0) {
            displayPortfolioSections(imagesData, videosData);
        } else {
            // Final fallback - default portfolio
            displayDefaultPortfolio();
        }
    } catch (error) {
        console.error('Error loading portfolio from localStorage:', error);
        displayDefaultPortfolio();
    }
}

// Display portfolio in separate sections
function displayPortfolioSections(imagesData, videosData) {
    displayPortfolioImages(imagesData);
    displayPortfolioVideos(videosData);
}

// Display portfolio images
function displayPortfolioImages(imagesData) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    if (!portfolioGrid) return;
    
    if (imagesData.length === 0) {
        portfolioGrid.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1;">
                <p>No portfolio images available yet.</p>
                <p>Check back later for updates!</p>
            </div>
        `;
        return;
    }
    
    const portfolioHTML = imagesData.map(item => `
        <div class="portfolio-item" data-type="image" data-id="${item.id}">
            <img src="${item.image || 'https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100)}" 
                 alt="${item.title || 'Portfolio Image'}" 
                 class="portfolio-img"
                 onerror="handleImageError(this)">
            <div class="portfolio-overlay">
                <h3>${item.title || 'Portfolio Item'}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <small>${getCategoryDisplayName(item.category) || 'Photography'}</small>
            </div>
        </div>
    `).join('');
    
    portfolioGrid.innerHTML = portfolioHTML;
    initPortfolioAnimations();
    initPortfolioModal();
}

// Display portfolio videos
function displayPortfolioVideos(videosData) {
    const videosGrid = document.querySelector('.videos-grid');
    
    if (!videosGrid) return;
    
    if (videosData.length === 0) {
        videosGrid.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1;">
                <p>No videos available yet.</p>
                <p>Check back later for video content!</p>
            </div>
        `;
        return;
    }
    
    const videosHTML = videosData.map(item => `
        <div class="video-item" data-type="video" data-id="${item.id}">
            <img src="${item.thumbnail || 'https://picsum.photos/400/225?random=' + Math.floor(Math.random() * 100)}" 
                 alt="${item.title || 'Video'}" 
                 class="video-thumbnail"
                 onerror="handleImageError(this)">
            <div class="video-play-icon" onclick="playVideo('${item.url}', '${item.platform}', '${item.title || 'Video'}')">
                <i class="fas fa-play"></i>
            </div>
            <div class="video-badge">
                <i class="fab fa-youtube"></i> Video
            </div>
            <div class="video-overlay">
                <h3>${item.title || 'Video'}</h3>
                <p>${item.description || 'Watch our video content'}</p>
                <small>${getCategoryDisplayName(item.category) || 'Video'}</small>
            </div>
        </div>
    `).join('');
    
    videosGrid.innerHTML = videosHTML;
    initVideoAnimations();
}

// Default portfolio (when no data available)
function displayDefaultPortfolio() {
    const defaultImages = [
        { title: 'Wedding Photography', description: 'Beautiful moments from special days', category: 'wedding', type: 'image' },
        { title: 'Pre-Wedding Shoots', description: 'Romantic couple photoshoots', category: 'pre-wedding', type: 'image' },
        { title: 'Portrait Photography', description: 'Professional portrait sessions', category: 'portrait', type: 'image' },
        { title: 'Event Photography', description: 'Capturing special occasions', category: 'events', type: 'image' },
        { title: 'Drone Photography', description: 'Aerial views and perspectives', category: 'drone', type: 'image' },
        { title: 'Candid Photography', description: 'Natural and spontaneous moments', category: 'portrait', type: 'image' }
    ];
    
    const defaultVideos = [
        { title: 'Wedding Highlights', description: 'Cinematic wedding film', category: 'wedding', type: 'video' },
        { title: 'Pre-Wedding Film', description: 'Romantic couple video', category: 'pre-wedding', type: 'video' },
        { title: 'Event Coverage', description: 'Special moments compilation', category: 'events', type: 'video' }
    ];
    
    displayPortfolioImages(defaultImages);
    displayPortfolioVideos(defaultVideos);
}

// ==================== IMAGE MODAL SYSTEM ====================

function initPortfolioModal() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const imageSrc = this.querySelector('.portfolio-img').src;
            const title = this.querySelector('h3')?.textContent || 'Portfolio Image';
            const description = this.querySelector('p')?.textContent || '';
            const category = this.querySelector('small')?.textContent || '';
            
            showImageModal(imageSrc, title, description, category);
        });
    });
}

// Show image modal
function showImageModal(imageSrc, title, description, category) {
    // Remove existing modal first
    const existingModal = document.querySelector('.image-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'image-modal active';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeImageModal()">
                <i class="fas fa-times"></i>
            </button>
            <img src="${imageSrc}" alt="${title}" class="modal-image" 
                 onerror="this.src='https://picsum.photos/600/800?random=1'">
            <div class="modal-info">
                <h3>${title}</h3>
                ${description ? `<p>${description}</p>` : ''}
                <small>${category}</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Close with Escape key
    const closeWithEscape = function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
            document.removeEventListener('keydown', closeWithEscape);
        }
    };
    document.addEventListener('keydown', closeWithEscape);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// Close image modal
function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            // Restore body scroll
            document.body.style.overflow = '';
        }, 300);
    }
}

// Video play function
function playVideo(videoUrl, platform, videoTitle = 'Video') {
    // Redirect to portfolio page for videos or open in modal
    window.location.href = 'portfolio/portfolio.html#videos';
}

// ==================== ANIMATION SYSTEMS ====================

// Initialize portfolio animations
function initPortfolioAnimations() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const observer = new IntersectionObserver((entries) => {
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
        item.style.transform = 'scale(0.9)';
        item.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(item);
    });
}

// Initialize video animations
function initVideoAnimations() {
    const videoItems = document.querySelectorAll('.video-item');
    const observer = new IntersectionObserver((entries) => {
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

    videoItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        item.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(item);
    });
}

// Service animations
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

// About section animations
function initAboutSection() {
    const aboutSections = [
        document.querySelector('.about-main-grid'),
        document.querySelector('.founders-grid')
    ];
    
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 300);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    aboutSections.forEach(section => {
        if (section) aboutObserver.observe(section);
    });
}

// ==================== BOOKING SYSTEM ====================

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

// Save booking to Firebase
async function saveBookingToFirebase(bookingData) {
    try {
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

// ==================== CONTACT FORM ====================

function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // FormSubmit.co will handle the submission
            showNotification('Sending your message...', 'info');
        });
    }
}

// ==================== GLOBAL FUNCTIONS ====================

// Make functions globally available
window.closeImageModal = closeImageModal;
window.openWhatsApp = openWhatsApp;
window.scrollToBooking = scrollToBooking;
window.handleImageError = handleImageError;
window.handleLogoError = handleLogoError;
window.handleFounderImageError = handleFounderImageError;
window.playVideo = playVideo;

// ==================== ANIMATED STATS SYSTEM ====================

function initAnimatedStats() {
    const statsSection = document.querySelector('.stats-box');
    const statNumbers = document.querySelectorAll('.stat-number');
    const statItems = document.querySelectorAll('.stat-item');
    
    if (!statsSection || statNumbers.length === 0) return;
    
    let animationStarted = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animationStarted) {
                animationStarted = true;
                startStatsAnimation();
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    });
    
    observer.observe(statsSection);
}

function startStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach((item, index) => {
        // Add animation with delay
        setTimeout(() => {
            item.classList.add('animate');
            
            // Remove animation class after completion
            setTimeout(() => {
                item.classList.remove('animate');
            }, 600);
        }, index * 300);
    });
    
    statNumbers.forEach((stat, index) => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        // Start counting with delay for each stat
        setTimeout(() => {
            const timer = setInterval(() => {
                current += step;
                
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                    stat.classList.add('animated');
                    
                    // Remove animation after some time
                    setTimeout(() => {
                        stat.classList.remove('animated');
                    }, 1000);
                }
                
                // Format number (add + for thousands)
                if (target >= 1000) {
                    stat.textContent = `+${Math.floor(current)}`;
                } else {
                    stat.textContent = `+${Math.floor(current)}`;
                }
            }, 16);
        }, index * 400); // Staggered delay
    });
}

// More advanced counting with easing
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const easeOutQuart = (t) => 1 - --t * t * t * t;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.floor(start + (end - start) * easedProgress);
        
        if (end >= 1000) {
            element.textContent = `+${current}`;
        } else {
            element.textContent = `+${current}`;
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.add('animated');
            setTimeout(() => element.classList.remove('animated'), 1000);
        }
    }
    
    requestAnimationFrame(update);
}

// Enhanced stats animation with better performance
function initEnhancedStats() {
    const statsSection = document.querySelector('.stats-box');
    if (!statsSection) return;
    
    let animated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                animateAllStats();
            }
        });
    }, {
        threshold: 0.6,
        rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(statsSection);
}

function animateAllStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const statItems = document.querySelectorAll('.stat-item');
    
    statNumbers.forEach((stat, index) => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 1800 + (index * 200); // Staggered duration
        
        setTimeout(() => {
            // Add animation class to parent item
            statItems[index].classList.add('animate');
            
            // Start number animation
            animateNumber(stat, 0, target, duration);
            
            // Remove animation class
            setTimeout(() => {
                statItems[index].classList.remove('animate');
            }, 600);
        }, index * 300); // Staggered start
    });
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Use enhanced version for better animation
    initEnhancedStats();
});

// Optional: Hide on scroll down, show on scroll up
function initScrollBehavior() {
    let lastScrollTop = 0;
    const floatingBtn = document.getElementById('floatingWhatsApp');
    
    if (!floatingBtn) return;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down - hide button
            floatingBtn.style.transform = 'translateY(100px)';
            floatingBtn.style.opacity = '0';
        } else {
            // Scrolling up - show button
            floatingBtn.style.transform = 'translateY(0)';
            floatingBtn.style.opacity = '1';
        }
        
        lastScrollTop = scrollTop;
    }, { passive: true });
}

// Call this in init if you want scroll behavior
// initScrollBehavior();

// ==================== TESTIMONIALS SYSTEM ====================

function initTestimonials() {
    const testimonials = [
        {
            id: 1,
            content: "FotoTaker made our wedding day absolutely magical! The photos captured every emotion perfectly. Kunal and his team were professional, creative, and so much fun to work with. We'll cherish these memories forever!",
            author: "Priya & Rahul",
            event: "Wedding Photography",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 2,
            content: "Our pre-wedding shoot was an incredible experience! The team took us to beautiful locations in Patna and made us feel so comfortable. The photos look like they're from a fashion magazine! Highly recommended!",
            author: "Anjali & Amit",
            event: "Pre-Wedding Shoot",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 3,
            content: "We hired FotoTaker for our corporate event and were blown away by their professionalism. They captured all the important moments without being intrusive. The delivery was super fast and quality was exceptional!",
            author: "Neha Sharma",
            event: "Corporate Event",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 4,
            content: "Family photoshoot with FotoTaker was amazing! They handled our kids so well and got natural, beautiful shots. The editing was perfect - not too much, just enhanced our natural moments. Will definitely book again!",
            author: "The Verma Family",
            event: "Family Portrait",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 5,
            content: "Kunal from FotoTaker is a true artist! He understood exactly what we wanted for our maternity shoot. The locations, lighting, and poses were perfect. These photos will be treasured forever. Thank you!",
            author: "Sneha & Raj",
            event: "Maternity Shoot",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face"
        }
    ];

    let currentSlide = 0;
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('testimonialDots');
    
    if (!track || !dotsContainer) return;

    // Initialize testimonials
    renderTestimonials(testimonials);
    createDots(testimonials.length);
    showSlide(currentSlide);

    // Event listeners
    document.getElementById('prevTestimonial')?.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
        showSlide(currentSlide);
    });

    document.getElementById('nextTestimonial')?.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % testimonials.length;
        showSlide(currentSlide);
    });

    // Auto slide every 5 seconds
    setInterval(() => {
        currentSlide = (currentSlide + 1) % testimonials.length;
        showSlide(currentSlide);
    }, 5000);
}

function renderTestimonials(testimonials) {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;

    track.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial-slide" data-id="${testimonial.id}">
            <div class="testimonial-card">
                <div class="testimonial-content">
                    ${testimonial.content}
                </div>
                <div class="testimonial-author">
                    <img src="${testimonial.avatar}" 
                         alt="${testimonial.author}" 
                         class="author-avatar"
                         onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'">
                    <div class="author-info">
                        <h4>${testimonial.author}</h4>
                        <p>${testimonial.event}</p>
                        <div class="author-rating">
                            ${'<i class="fas fa-star"></i>'.repeat(testimonial.rating)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function createDots(count) {
    const dotsContainer = document.getElementById('testimonialDots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = Array.from({ length: count }, (_, i) => 
        `<div class="slider-dot" data-index="${i}"></div>`
    ).join('');

    // Add click event to dots
    dotsContainer.querySelectorAll('.slider-dot').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
}

function showSlide(index) {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (slides.length === 0) return;

    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Show current slide
    slides[index].classList.add('active');
    dots[index]?.classList.add('active');

    // Move track
    const track = document.getElementById('testimonialTrack');
    if (track) {
        track.style.transform = `translateX(-${index * 100}%)`;
    }
}

function openGoogleReviews() {
    // Replace with your actual Google Reviews URL
    const googleReviewsURL = "https://share.google/3dhU1uojRLm0hevp7";
    window.open(googleReviewsURL, '_blank');
    
    // Track in analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'engagement',
            'event_label': 'google_reviews'
        });
    }
}

// Initialize testimonials when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initTestimonials();
});

