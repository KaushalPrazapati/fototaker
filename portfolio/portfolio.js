// Portfolio Page JavaScript - COMPLETELY FIXED
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio page loaded');
    
    // Initialize all systems
    initTheme();
    initNavigation();
    initPortfolioFilters();
    initPortfolioLoading();
    
    // Make body visible
    document.body.classList.add('loaded');
    
    console.log('Portfolio page initialized');
});

// Portfolio state management
let currentPortfolioPage = 0;
const portfolioPerPage = 12;
let allPortfolioItems = [];
let filteredPortfolioItems = [];
let currentFilter = 'all';

// Initialize portfolio filters
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            currentFilter = filter;
            filterPortfolioItems(filter);
        });
    });
}

// Filter portfolio items
function filterPortfolioItems(filter) {
    if (filter === 'all') {
        filteredPortfolioItems = [...allPortfolioItems];
    } else {
        filteredPortfolioItems = allPortfolioItems.filter(item => 
            item.category === filter
        );
    }
    
    // Reset pagination
    currentPortfolioPage = 0;
    
    // Display filtered items
    displayPortfolioPage();
}

// Initialize portfolio loading
async function initPortfolioLoading() {
    try {
        await loadAllPortfolioItems();
        initPortfolioAnimations();
        setupLoadMore();
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showDefaultPortfolio();
    }
}

// Load all portfolio items from Firebase
async function loadAllPortfolioItems() {
    const portfolioGrid = document.getElementById('portfolioGridFull');
    
    if (!portfolioGrid) return;
    
    try {
        console.log('Loading portfolio from Firebase...');
        
        // First try Firebase
        const db = firebase.firestore();
        const querySnapshot = await db.collection('portfolio')
            .orderBy('createdAt', 'desc')
            .get();
        
        const portfolioData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            portfolioData.push({
                id: doc.id,
                ...data
            });
        });
        
        console.log('Portfolio data loaded:', portfolioData.length, 'items');
        
        if (portfolioData.length > 0) {
            allPortfolioItems = portfolioData;
            filteredPortfolioItems = [...portfolioData];
            displayPortfolioPage();
        } else {
            // Fallback to localStorage (admin panel data)
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
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
    
    if (portfolioData.length > 0) {
        allPortfolioItems = portfolioData;
        filteredPortfolioItems = [...portfolioData];
        displayPortfolioPage();
    } else {
        // Final fallback - default portfolio
        showDefaultPortfolio();
    }
}

// Display current page of portfolio items
function displayPortfolioPage() {
    const portfolioGrid = document.getElementById('portfolioGridFull');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!portfolioGrid) return;
    
    const startIndex = currentPortfolioPage * portfolioPerPage;
    const endIndex = startIndex + portfolioPerPage;
    const itemsToShow = filteredPortfolioItems.slice(0, endIndex);
    
    if (itemsToShow.length === 0) {
        portfolioGrid.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1;">
                <p>No portfolio items found for this filter.</p>
                <p>Try selecting a different category or check back later.</p>
            </div>
        `;
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    portfolioGrid.innerHTML = itemsToShow.map(item => `
        <div class="portfolio-item-full" data-categories="${item.category || 'all'}">
            <img src="${item.image || 'https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100)}" 
                 alt="${item.title || 'Portfolio Image'}" 
                 onerror="handleImageError(this)">
            <div class="portfolio-overlay-full">
                <h3>${item.title || 'Portfolio Item'}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <small>${getCategoryDisplayName(item.category)}</small>
            </div>
            <div class="category-badge">${getCategoryDisplayName(item.category)}</div>
        </div>
    `).join('');
    
    // Update load more button
    if (loadMoreBtn) {
        if (endIndex >= filteredPortfolioItems.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
            loadMoreBtn.disabled = false;
            document.getElementById('loadMoreSpinner').style.display = 'none';
            document.getElementById('loadMoreText').textContent = 'Load More';
        }
    }
    
    // Re-initialize animations after loading content
    initPortfolioAnimations();
}

// Load more portfolio items
async function loadMorePortfolio() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreSpinner = document.getElementById('loadMoreSpinner');
    const loadMoreText = document.getElementById('loadMoreText');
    
    if (!loadMoreBtn) return;
    
    try {
        loadMoreBtn.disabled = true;
        loadMoreSpinner.style.display = 'inline-block';
        loadMoreText.textContent = 'Loading...';
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentPortfolioPage++;
        displayPortfolioPage();
        
    } catch (error) {
        console.error('Error loading more portfolio items:', error);
        showNotification('Error loading more items', 'error');
        loadMoreBtn.disabled = false;
        loadMoreSpinner.style.display = 'none';
        loadMoreText.textContent = 'Load More';
    }
}

// Setup load more functionality
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePortfolio);
    }
}

// Initialize portfolio animations
function initPortfolioAnimations() {
    const portfolioItems = document.querySelectorAll('.portfolio-item-full');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'scale(1)';
                }, index * 100);
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
        observer.observe(item);
    });
}

// Show default portfolio (fallback)
function showDefaultPortfolio() {
    const defaultItems = [
        { category: 'wedding', title: 'Beautiful Wedding Ceremony', description: 'Traditional wedding moments', image: 'https://picsum.photos/400/600?random=1' },
        { category: 'pre-wedding', title: 'Romantic Pre-Wedding', description: 'Couple photoshoot in nature', image: 'https://picsum.photos/400/600?random=2' },
        { category: 'portrait', title: 'Professional Portrait', description: 'Studio portrait session', image: 'https://picsum.photos/400/600?random=3' },
        { category: 'events', title: 'Corporate Event', description: 'Business conference coverage', image: 'https://picsum.photos/400/600?random=4' },
        { category: 'wedding', title: 'Candid Wedding Moments', description: 'Natural and emotional shots', image: 'https://picsum.photos/400/600?random=5' },
        { category: 'pre-wedding', title: 'Urban Couple Shoot', description: 'Cityscape photography', image: 'https://picsum.photos/400/600?random=6' },
        { category: 'portrait', title: 'Family Portrait', description: 'Multi-generational family photos', image: 'https://picsum.photos/400/600?random=7' },
        { category: 'events', title: 'Birthday Celebration', description: 'Special birthday event', image: 'https://picsum.photos/400/600?random=8' },
        { category: 'wedding', title: 'Traditional Ceremony', description: 'Cultural wedding traditions', image: 'https://picsum.photos/400/600?random=9' },
        { category: 'pre-wedding', title: 'Beach Shoot', description: 'Sunset couple photos', image: 'https://picsum.photos/400/600?random=10' },
        { category: 'portrait', title: 'Maternity Shoot', description: 'Pregnancy photography', image: 'https://picsum.photos/400/600?random=11' },
        { category: 'events', title: 'Anniversary Party', description: '25 years celebration', image: 'https://picsum.photos/400/600?random=12' },
        { category: 'wedding', title: 'Reception Decor', description: 'Beautiful venue setup', image: 'https://picsum.photos/400/600?random=13' },
        { category: 'pre-wedding', title: 'Winter Couple', description: 'Snowy romantic shoot', image: 'https://picsum.photos/400/600?random=14' },
        { category: 'portrait', title: 'Newborn Photos', description: 'Baby photography session', image: 'https://picsum.photos/400/600?random=15' },
        { category: 'events', title: 'Product Launch', description: 'Corporate product event', image: 'https://picsum.photos/400/600?random=16' }
    ];
    
    allPortfolioItems = defaultItems;
    filteredPortfolioItems = [...defaultItems];
    displayPortfolioPage();
}

// Helper function to get category display name
function getCategoryDisplayName(category) {
    const categoryMap = {
        'wedding': 'Wedding',
        'pre-wedding': 'Pre-Wedding',
        'portrait': 'Portrait',
        'events': 'Events',
        'drone': 'Drone'
    };
    return categoryMap[category] || 'Photography';
}

// Image error handler
function handleImageError(img) {
    console.log('Image failed to load:', img.src);
    if (!img.src.includes('picsum.photos')) {
        img.src = 'https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100);
    }
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

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (!themeToggle) return;
    
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
    };
    
    // Initialize theme
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    
    // Theme toggle click event
    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isDark = body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Navigation Management
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
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && navToggle && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target) &&
            navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
}

// WhatsApp integration for portfolio page
function openWhatsApp(prefilledMessage = '') {
    const phone = '919471640485';
    const message = prefilledMessage || 'Hello! I saw your portfolio and want to book photography/videography services';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Handle image errors on page load
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            handleImageError(this);
        };
    });
});
