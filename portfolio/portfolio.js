// Portfolio Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio page loaded');
    
    initTheme();
    initNavigation();
    initPortfolioFilters();
    initPortfolioLoading();
    initVideoModal();
    initWhatsAppButtons();
    initLoadMoreButton();
    
    console.log('Portfolio page initialized');
});

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
            filterPortfolioItems(filter);
        });
    });
}

// Filter portfolio items
function filterPortfolioItems(filter) {
    const items = document.querySelectorAll('.portfolio-item-full');
    
    items.forEach(item => {
        const categories = item.getAttribute('data-categories');
        if (!categories) return;
        
        const categoryList = categories.split(' ');
        
        if (filter === 'all' || categoryList.includes(filter)) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 100);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 400);
        }
    });
}

// Initialize portfolio loading
async function initPortfolioLoading() {
    try {
        await loadCompletePortfolio();
        await loadVideosAndReels();
        initPortfolioAnimations();
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showDefaultPortfolio();
        showDefaultVideos();
    }
}

// Load complete portfolio from Firebase
async function loadCompletePortfolio() {
    const portfolioGrid = document.getElementById('portfolioGridFull');
    
    if (!portfolioGrid) return;
    
    try {
        const db = firebase.firestore();
        const querySnapshot = await db.collection('portfolio')
            .orderBy('createdAt', 'desc')
            .get();
        
        const portfolioData = [];
        querySnapshot.forEach((doc) => {
            portfolioData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        if (portfolioData.length > 0) {
            displayCompletePortfolio(portfolioData);
        } else {
            showDefaultPortfolio();
        }
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showDefaultPortfolio();
    }
}

// Display complete portfolio
function displayCompletePortfolio(items) {
    const portfolioGrid = document.getElementById('portfolioGridFull');
    
    if (!portfolioGrid) return;
    
    portfolioGrid.innerHTML = items.map(item => `
        <div class="portfolio-item-full" data-categories="${item.category || 'all'}">
            ${item.type === 'video' ? `
                <video poster="${item.thumbnail}" preload="metadata">
                    <source src="${item.url}" type="video/mp4">
                </video>
                <button class="video-play-btn" data-video="${item.url}">
                    <i class="fas fa-play"></i>
                </button>
            ` : `
                <img src="${item.image}" alt="${item.title}" 
                     onerror="this.src='https://picsum.photos/400/600?random=${Math.floor(Math.random() * 100)}'">
            `}
            <div class="portfolio-overlay-full">
                <h3>${item.title}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <small>${getCategoryDisplayName(item.category)}</small>
            </div>
            <div class="category-badge">${getCategoryDisplayName(item.category)}</div>
        </div>
    `).join('');
    
    // Initialize video play buttons
    initVideoPlayButtons();
}

// Load videos and reels
async function loadVideosAndReels() {
    const videosGrid = document.getElementById('videosGrid');
    
    if (!videosGrid) return;
    
    try {
        const db = firebase.firestore();
        const querySnapshot = await db.collection('videos')
            .orderBy('createdAt', 'desc')
            .limit(6)
            .get();
        
        const videosData = [];
        querySnapshot.forEach((doc) => {
            videosData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        if (videosData.length > 0) {
            displayVideos(videosData);
        } else {
            showDefaultVideos();
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showDefaultVideos();
    }
}

// Display videos
function displayVideos(videos) {
    const videosGrid = document.getElementById('videosGrid');
    
    if (!videosGrid) return;
    
    videosGrid.innerHTML = videos.map(video => `
        <div class="video-card">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}"
                     onerror="this.src='https://picsum.photos/400/600?random=${Math.floor(Math.random() * 100)}'">
                <button class="video-play-btn" data-video="${video.url}">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>${video.description || 'Instagram Reel'}</p>
                <small>${new Date(video.createdAt).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
    
    // Initialize video play buttons
    initVideoPlayButtons();
}

// Initialize video play buttons
function initVideoPlayButtons() {
    const playButtons = document.querySelectorAll('.video-play-btn');
    
    playButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const videoUrl = this.getAttribute('data-video');
            if (videoUrl) {
                playVideo(videoUrl);
            }
        });
    });
}

// Initialize video modal
function initVideoModal() {
    // Check if modal already exists
    let modal = document.querySelector('.video-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <button class="close-modal">&times;</button>
                <video controls>
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Close modal events
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', closeVideoModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeVideoModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });
}

// Play video in modal
function playVideo(videoUrl) {
    const modal = document.querySelector('.video-modal');
    const video = modal.querySelector('video');
    
    if (modal && video) {
        video.src = videoUrl;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Play video
        video.play().catch(e => {
            console.log('Video play failed:', e);
        });
    }
}

// Close video modal
function closeVideoModal() {
    const modal = document.querySelector('.video-modal');
    const video = modal.querySelector('video');
    
    if (modal && video) {
        video.pause();
        video.src = '';
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
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

// Initialize Load More button
function initLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreSpinner = document.getElementById('loadMoreSpinner');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            if (loadMoreSpinner) {
                loadMoreSpinner.style.display = 'inline-block';
            }
            this.disabled = true;
            this.innerHTML = 'Loading...';
            
            // Simulate loading more items
            setTimeout(() => {
                loadMorePortfolioItems();
                if (loadMoreSpinner) {
                    loadMoreSpinner.style.display = 'none';
                }
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-spinner fa-spin" id="loadMoreSpinner" style="display: none;"></i> Load More';
            }, 1500);
        });
    }
}

// Load more portfolio items (simulated)
function loadMorePortfolioItems() {
    // This would typically load more items from Firebase
    // For now, we'll just show a notification
    showNotification('More portfolio items loaded!', 'success');
}

// Initialize WhatsApp buttons
function initWhatsAppButtons() {
    // Add WhatsApp functionality to any button with onclick
    const whatsappButtons = document.querySelectorAll('[onclick*="openWhatsApp"]');
    whatsappButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const onclickAttr = this.getAttribute('onclick');
            const match = onclickAttr.match(/openWhatsApp\('([^']+)'\)/);
            if (match) {
                const message = match[1];
                openWhatsApp(message);
            } else {
                openWhatsApp();
            }
        });
    });
}

// WhatsApp integration
function openWhatsApp(prefilledMessage = '') {
    const phone = '919471640485';
    const message = prefilledMessage || 'Hello! I want to book photography/videography services';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Show default portfolio (fallback)
function showDefaultPortfolio() {
    const portfolioGrid = document.getElementById('portfolioGridFull');
    
    if (!portfolioGrid) return;
    
    const defaultItems = [
        { category: 'wedding', title: 'Wedding Photography', image: 'https://picsum.photos/400/600?random=1' },
        { category: 'pre-wedding', title: 'Pre-Wedding Shoot', image: 'https://picsum.photos/400/600?random=2' },
        { category: 'portrait', title: 'Portrait Session', image: 'https://picsum.photos/400/600?random=3' },
        { category: 'events', title: 'Corporate Event', image: 'https://picsum.photos/400/600?random=4' },
        { category: 'wedding', title: 'Candid Moments', image: 'https://picsum.photos/400/600?random=5' },
        { category: 'pre-wedding', title: 'Couple Shoot', image: 'https://picsum.photos/400/600?random=6' },
        { category: 'portrait', title: 'Family Portrait', image: 'https://picsum.photos/400/600?random=7' },
        { category: 'events', title: 'Birthday Celebration', image: 'https://picsum.photos/400/600?random=8' },
        { category: 'wedding', title: 'Traditional Ceremony', image: 'https://picsum.photos/400/600?random=9' },
        { category: 'pre-wedding', title: 'Outdoor Shoot', image: 'https://picsum.photos/400/600?random=10' },
        { category: 'portrait', title: 'Maternity Shoot', image: 'https://picsum.photos/400/600?random=11' },
        { category: 'events', title: 'Anniversary', image: 'https://picsum.photos/400/600?random=12' }
    ];
    
    displayCompletePortfolio(defaultItems);
}

// Show default videos (fallback)
function showDefaultVideos() {
    const videosGrid = document.getElementById('videosGrid');
    
    if (!videosGrid) return;
    
    const defaultVideos = [
        { 
            title: 'Wedding Highlights', 
            thumbnail: 'https://picsum.photos/400/600?random=21',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            createdAt: new Date().toISOString()
        },
        { 
            title: 'Pre-Wedding Reel', 
            thumbnail: 'https://picsum.photos/400/600?random=22',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            createdAt: new Date().toISOString()
        },
        { 
            title: 'Portrait Session', 
            thumbnail: 'https://picsum.photos/400/600?random=23',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            createdAt: new Date().toISOString()
        }
    ];
    
    displayVideos(defaultVideos);
}

// Helper function to get category display name
function getCategoryDisplayName(category) {
    const categoryMap = {
        'wedding': 'Wedding',
        'pre-wedding': 'Pre-Wedding',
        'portrait': 'Portrait',
        'events': 'Events',
        'reels': 'Instagram Reel',
        'videos': 'Video'
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

// Theme and Navigation functions
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (!themeToggle) return;
    
    const themeIcon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    const applyTheme = (theme) => {
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
    
    applyTheme(savedTheme);
    
    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isDark = body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
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
    
    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    function closeMobileMenu() {
        if (navMenu) navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}