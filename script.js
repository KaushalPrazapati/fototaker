// Simple and Fixed Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing theme');
    
    // Theme elements
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
    
    // Mobile Navigation
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
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
    
    // Hero button scroll
    document.querySelectorAll('.btn-primary[href="#portfolio"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const portfolio = document.querySelector('#portfolio');
            if (portfolio) {
                portfolio.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Service cards animation
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
    
    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const phone = this.querySelector('input[type="tel"]').value;
            const message = this.querySelector('textarea').value;
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                const formData = {
                    name,
                    email,
                    phone,
                    message,
                    timestamp: new Date().toISOString()
                };
                
                let existingData = JSON.parse(localStorage.getItem('contactSubmissions')) || [];
                existingData.push(formData);
                localStorage.setItem('contactSubmissions', JSON.stringify(existingData));
                
                showNotification(`Thank you ${name}! We have received your message and will contact you soon.`, 'success');
                
                this.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
    
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
    
    // Load portfolio from Firebase
    loadPortfolioFromFirebase();
    
    console.log('Website initialized successfully');
});

// Load portfolio data from Firebase - SIMPLE VERSION
async function loadPortfolioFromFirebase() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    if (!portfolioGrid) return;
    
    try {
        // Use global firebase object
        const db = firebase.firestore();
        const querySnapshot = await db.collection('portfolio').get();
        const portfolioData = [];
        
        querySnapshot.forEach((doc) => {
            portfolioData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by creation date (newest first)
        portfolioData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (portfolioData.length > 0) {
            displayPortfolioItems(portfolioData);
            console.log('Portfolio loaded from Firebase - Items:', portfolioData.length);
        } else {
            // No data in Firebase, show default portfolio
            displayDefaultPortfolio();
        }
    } catch (error) {
        console.log('Error loading from Firebase:', error);
        // Show default portfolio if Firebase fails
        displayDefaultPortfolio();
    }
}

// Display portfolio items
function displayPortfolioItems(items) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    portfolioGrid.innerHTML = items.map(item => `
        <div class="portfolio-item">
            <img src="${item.image}" alt="${item.title}" class="portfolio-img" 
                 onerror="this.src='https://picsum.photos/400/600?random=${Math.floor(Math.random() * 100)}'">
            <div class="portfolio-overlay">
                <h3>${item.title}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <small>Category: ${getCategoryDisplayName(item.category)}</small>
            </div>
        </div>
    `).join('');
    
    initPortfolioAnimations();
}

// Default portfolio (when no Firebase data)
// function displayDefaultPortfolio() {
//     const portfolioGrid = document.querySelector('.portfolio-grid');
    
//     portfolioGrid.innerHTML = `
//         <div class="portfolio-item">
//             <img src="https://picsum.photos/400/600?random=1" alt="Wedding Photography" class="portfolio-img">
//             <div class="portfolio-overlay">
//                 <h3>Wedding Photography</h3>
//                 <p>Beautiful moments from special days</p>
//             </div>
//         </div>
//         <div class="portfolio-item">
//             <img src="https://picsum.photos/400/600?random=2" alt="Pre-Wedding Shoots" class="portfolio-img">
//             <div class="portfolio-overlay">
//                 <h3>Pre-Wedding Shoots</h3>
//                 <p>Romantic couple photoshoots</p>
//             </div>
//         </div>
//         <div class="portfolio-item">
//             <img src="https://picsum.photos/400/600?random=3" alt="Portrait Photography" class="portfolio-img">
//             <div class="portfolio-overlay">
//                 <h3>Portrait Photography</h3>
//                 <p>Professional portrait sessions</p>
//             </div>
//         </div>
//         <div class="portfolio-item">
//             <img src="https://picsum.photos/400/600?random=4" alt="Event Photography" class="portfolio-img">
//             <div class="portfolio-overlay">
//                 <h3>Event Photography</h3>
//                 <p>Capturing special occasions</p>
//             </div>
//         </div>
//         <div class="portfolio-item">
//             <img src="https://picsum.photos/400/600?random=5" alt="Drone Photography" class="portfolio-img">
//             <div class="portfolio-overlay">
//                 <h3>Drone Photography</h3>
//                 <p>Aerial views and perspectives</p>
//             </div>
//         </div>
//         <div class="portfolio-item">
//             <img src="https://picsum.photos/400/600?random=6" alt="Candid Photography" class="portfolio-img">
//             <div class="portfolio-overlay">
//                 <h3>Candid Photography</h3>
//                 <p>Natural and spontaneous moments</p>
//             </div>
//         </div>
//     `;
    
//     initPortfolioAnimations();
// }

// Initialize portfolio animations
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

// Helper function to get category display name
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

// Notification system
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
        background: ${type === 'success' ? '#27ae60' : '#3498db'};
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

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
`;
document.head.appendChild(style);

// WhatsApp integration
document.addEventListener('DOMContentLoaded', function() {
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], .fa-whatsapp');
    
    whatsappLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href.includes('wa.me')) {
                e.preventDefault();
                const phoneNumber = '919471640485';
                const message = 'Hello! I visited your website and would like to know more about your photography services.';
                const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappURL, '_blank');
            }
        });
    });
});

// Handle image errors gracefully
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

// Handle page errors
window.addEventListener('error', function(e) {
    console.error('Page error:', e.error);
});

// Make body visible after loading
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.visibility = 'visible';
});

