// Portfolio Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio page loaded');
    
    // Initialize Firebase first
    initFirebase();
    
    initTheme();
    initNavigation();
    initPortfolioFilters();
    initPortfolioLoading();
    initVideoModal();
    
    console.log('Portfolio page initialized');
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
        // First try Firebase
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
    const portfolioGrid = document.getElementById('portfolioGridFull');
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
    
    if (portfolioData.length > 0) {
        displayCompletePortfolio(portfolioData);
    } else {
        // Final fallback - default portfolio
        showDefaultPortfolio();
    }
}

// Display complete portfolio
function displayCompletePortfolio(items) {
    const portfolioGrid = document.getElementById('portfolioGridFull');
    
    if (!portfolioGrid) return;
    
    portfolioGrid.innerHTML = items.map(item => `
        <div class="portfolio-item-full" data-categories="${item.category || 'all'}">
            <img src="${item.image}" alt="${item.title}" 
                 onerror="this.src='https://picsum.photos/400/600?random=${Math.floor(Math.random() * 100)}'">
            <div class="portfolio-overlay-full">
                <h3>${item.title}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <small>${getCategoryDisplayName(item.category)}</small>
            </div>
            <div class="category-badge">${getCategoryDisplayName(item.category)}</div>
        </div>
    `).join('');
    
    // Re-initialize animations after loading content
    initPortfolioAnimations();
}

// Load videos and reels from Firebase (Single Document) - UPDATED
async function loadVideosAndReels() {
    const videosGrid = document.getElementById('videosGrid');
    
    if (!videosGrid) return;
    
    try {
        const db = firebase.firestore();
        const doc = await db.collection('websiteData').doc('reelsData').get();
        
        if (!doc.exists) {
            showDefaultVideos();
            return;
        }
        
        const reelsData = doc.data();
        const reels = reelsData.reels || [];
        
        if (reels.length > 0) {
            displayVideos(reels);
        } else {
            showDefaultVideos();
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showDefaultVideos();
    }
}

// Display videos from single document - UPDATED
function displayVideos(reels) {
    const videosGrid = document.getElementById('videosGrid');
    
    if (!videosGrid) return;
    
    videosGrid.innerHTML = reels.map((reel, index) => `
        <div class="video-card" data-categories="${reel.category}">
            <div class="video-thumbnail">
                <img src="${reel.thumbnail}" alt="${reel.title}"
                     onerror="this.src='https://picsum.photos/400/600?random=${Math.floor(Math.random() * 100)}'">
                <button class="video-play-btn" data-video="${reel.url}" data-title="${reel.title}">
                    <i class="fas fa-play"></i>
                </button>
                ${reel.duration ? `<div class="video-duration">${reel.duration}</div>` : ''}
                ${reel.platform ? `<div class="video-platform">${reel.platform}</div>` : ''}
            </div>
            <div class="video-info">
                <h3>${reel.title}</h3>
                ${reel.description ? `<p>${reel.description}</p>` : ''}
                <div class="video-meta">
                    <span class="video-category">${getCategoryDisplayName(reel.category)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Initialize video play buttons
    initVideoPlayButtons();
}

// Initialize video play buttons - UPDATED
function initVideoPlayButtons() {
    const playButtons = document.querySelectorAll('.video-play-btn');
    
    playButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const videoUrl = this.getAttribute('data-video');
            const videoTitle = this.getAttribute('data-title');
            
            if (videoUrl) {
                // Check if video URL is valid and supported
                if (isVideoUrlSupported(videoUrl)) {
                    playVideo(videoUrl, videoTitle);
                } else {
                    // If video not supported, open in new tab or show message
                    handleUnsupportedVideo(videoUrl, videoTitle);
                }
            }
        });
    });
}

// Check if video URL is supported - NEW FUNCTION
function isVideoUrlSupported(url) {
    const supportedFormats = ['.mp4', '.webm', '.ogg', '.mov'];
    const videoExtensions = supportedFormats.filter(ext => url.toLowerCase().includes(ext));
    
    // Also check if it's a YouTube or Vimeo URL
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');
    const isInstagram = url.includes('instagram.com');
    
    return videoExtensions.length > 0 || isYouTube || isVimeo || isInstagram;
}

// Handle unsupported video URLs - NEW FUNCTION
function handleUnsupportedVideo(url, title) {
    // If it's a YouTube, Vimeo, or Instagram link, open in new tab
    if (url.includes('youtube.com') || url.includes('youtu.be') || 
        url.includes('vimeo.com') || url.includes('instagram.com')) {
        window.open(url, '_blank');
    } else {
        // Show error message for unsupported video formats
        showNotification(`Video format not supported: ${title}. Please try opening in a new tab.`, 'error');
        
        // Optional: Try to open in new tab anyway
        setTimeout(() => {
            if (confirm(`Cannot play "${title}" in browser. Open in new tab?`)) {
                window.open(url, '_blank');
            }
        }, 1000);
    }
}

// Initialize video modal - UPDATED
function initVideoModal() {
    // Check if modal already exists
    let modal = document.querySelector('.video-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <button class="close-modal">&times;</button>
                <h3 class="video-modal-title">Video</h3>
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

// Play video in modal - UPDATED
function playVideo(videoUrl, videoTitle = 'Video') {
    const modal = document.querySelector('.video-modal');
    const video = modal.querySelector('video');
    const modalTitle = modal.querySelector('.video-modal-title');
    
    if (modal && video) {
        // Set video title
        if (modalTitle) {
            modalTitle.textContent = videoTitle;
        }
        
        // Clear previous source
        video.innerHTML = '';
        
        // Create new source element
        const source = document.createElement('source');
        source.src = videoUrl;
        
        // Set type based on file extension
        if (videoUrl.includes('.mp4')) {
            source.type = 'video/mp4';
        } else if (videoUrl.includes('.webm')) {
            source.type = 'video/webm';
        } else if (videoUrl.includes('.ogg')) {
            source.type = 'video/ogg';
        }
        
        video.appendChild(source);
        video.load(); // Reload the video element
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Play video with error handling
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Video play failed:', e);
                showNotification(`Cannot play "${videoTitle}". The video format may not be supported.`, 'error');
                
                // Close modal after error
                setTimeout(() => {
                    closeVideoModal();
                }, 3000);
            });
        }
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

// Show default videos with WORKING video URLs - UPDATED
function showDefaultVideos() {
    const videosGrid = document.getElementById('videosGrid');
    
    if (!videosGrid) return;
    
    const defaultVideos = [
        { 
            title: 'Wedding Highlights Reel', 
            thumbnail: 'https://picsum.photos/400/600?random=21',
            url: 'https://assets.codepen.io/3364143/20170817_202252_1.mp4',
            category: 'wedding',
            duration: '0:30',
            platform: 'instagram'
        },
        { 
            title: 'Pre-Wedding Couple Shoot', 
            thumbnail: 'https://picsum.photos/400/600?random=22',
            url: 'https://assets.codepen.io/3364143/20170817_202252_1.mp4',
            category: 'pre-wedding',
            duration: '0:45',
            platform: 'instagram'
        },
        { 
            title: 'Portrait Session Reel', 
            thumbnail: 'https://picsum.photos/400/600?random=23',
            url: 'https://assets.codepen.io/3364143/20170817_202252_1.mp4',
            category: 'portrait',
            duration: '0:25',
            platform: 'instagram'
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

// WhatsApp integration for portfolio page
function openWhatsApp(prefilledMessage = '') {
    const phone = '919471640485';
    const message = prefilledMessage || 'Hello! I want to book photography/videography services';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

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
