// Portfolio Page JavaScript - WITH IMAGE VIEWER
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio page loaded');
    
    // Initialize all systems
    initTheme();
    initNavigation();
    initPortfolioFilters();
    initPortfolioLoading();
    loadVideosForPortfolio();
    
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

// Image Viewer State
let currentImageIndex = 0;
let currentFilteredItems = [];

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
    
    // Update current filtered items for image viewer
    currentFilteredItems = filteredPortfolioItems.filter(item => item.type !== 'video');
    
    // Display filtered items
    displayPortfolioPage();
}

// Initialize portfolio loading
async function initPortfolioLoading() {
    try {
        await loadAllPortfolioItems();
        initPortfolioAnimations();
        initPortfolioImageModal(); // Initialize image modal
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
                type: 'image',
                ...data
            });
        });
        
        console.log('Portfolio data loaded:', portfolioData.length, 'items');
        
        if (portfolioData.length > 0) {
            allPortfolioItems = portfolioData;
            filteredPortfolioItems = [...portfolioData];
            currentFilteredItems = [...portfolioData]; // For image viewer
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
        allPortfolioItems = portfolioData.map(item => ({ ...item, type: 'image' }));
        filteredPortfolioItems = [...allPortfolioItems];
        currentFilteredItems = [...allPortfolioItems]; // For image viewer
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
    
    portfolioGrid.innerHTML = itemsToShow.map((item, index) => `
        <div class="portfolio-item-full" data-categories="${item.category || 'all'}" data-index="${index}">
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
            const loadMoreSpinner = document.getElementById('loadMoreSpinner');
            const loadMoreText = document.getElementById('loadMoreText');
            if (loadMoreSpinner) loadMoreSpinner.style.display = 'none';
            if (loadMoreText) loadMoreText.textContent = 'Load More';
        }
    }
    
    // Re-initialize animations after loading content
    initPortfolioAnimations();
}

// ===== PORTFOLIO IMAGE VIEWER MODAL =====
function initPortfolioImageModal() {
    const portfolioItems = document.querySelectorAll('.portfolio-item-full');
    
    portfolioItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const index = parseInt(this.getAttribute('data-index'));
            const imageSrc = this.querySelector('img').src;
            const title = this.querySelector('h3')?.textContent || 'Portfolio Image';
            const description = this.querySelector('p')?.textContent || '';
            const category = this.querySelector('small')?.textContent || '';
            
            // Set current image index
            currentImageIndex = index;
            
            // Show image modal
            showPortfolioImageModal(imageSrc, title, description, category, index);
        });
    });
}

// Show portfolio image modal
function showPortfolioImageModal(imageSrc, title, description, category, index) {
    // Remove existing modal first
    const existingModal = document.querySelector('.portfolio-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Get current filtered items (only images)
    const currentImages = currentFilteredItems.filter(item => item.type !== 'video');
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'portfolio-modal active';
    
    modal.innerHTML = `
        <div class="portfolio-modal-content">
            <button class="portfolio-modal-close" onclick="closePortfolioImageModal()">
                <i class="fas fa-times"></i>
            </button>
            
            ${currentImages.length > 1 ? `
                <button class="portfolio-modal-nav portfolio-modal-prev" onclick="navigatePortfolioImage(-1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="portfolio-modal-nav portfolio-modal-next" onclick="navigatePortfolioImage(1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="portfolio-modal-counter">
                    ${index + 1} / ${currentImages.length}
                </div>
            ` : ''}
            
            <img src="${imageSrc}" alt="${title}" class="portfolio-modal-image" 
                 onerror="this.src='https://picsum.photos/600/800?random=1'">
            
            <div class="portfolio-modal-info">
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
            closePortfolioImageModal();
        }
    });
    
    // Keyboard navigation
    const handleKeydown = function(e) {
        if (e.key === 'Escape') {
            closePortfolioImageModal();
        } else if (e.key === 'ArrowLeft') {
            navigatePortfolioImage(-1);
        } else if (e.key === 'ArrowRight') {
            navigatePortfolioImage(1);
        }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Store the event listener for cleanup
    modal._keydownHandler = handleKeydown;
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// Close portfolio image modal
function closePortfolioImageModal() {
    const modal = document.querySelector('.portfolio-modal');
    if (modal) {
        // Remove keyboard event listener
        if (modal._keydownHandler) {
            document.removeEventListener('keydown', modal._keydownHandler);
        }
        
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            // Restore body scroll
            document.body.style.overflow = '';
        }, 300);
    }
}

// Navigate between portfolio images
function navigatePortfolioImage(direction) {
    const currentImages = currentFilteredItems.filter(item => item.type !== 'video');
    
    if (currentImages.length <= 1) return;
    
    currentImageIndex += direction;
    
    // Handle wrap-around
    if (currentImageIndex < 0) {
        currentImageIndex = currentImages.length - 1;
    } else if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0;
    }
    
    const nextImage = currentImages[currentImageIndex];
    if (!nextImage) return;
    
    const imageSrc = nextImage.image || 'https://picsum.photos/600/800?random=1';
    const title = nextImage.title || 'Portfolio Image';
    const description = nextImage.description || '';
    const category = getCategoryDisplayName(nextImage.category);
    
    // Update modal with new image
    showPortfolioImageModal(imageSrc, title, description, category, currentImageIndex);
}

// Load more portfolio items
async function loadMorePortfolio() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreSpinner = document.getElementById('loadMoreSpinner');
    const loadMoreText = document.getElementById('loadMoreText');
    
    if (!loadMoreBtn) return;
    
    try {
        loadMoreBtn.disabled = true;
        if (loadMoreSpinner) loadMoreSpinner.style.display = 'inline-block';
        if (loadMoreText) loadMoreText.textContent = 'Loading...';
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentPortfolioPage++;
        displayPortfolioPage();
        
        // Re-initialize modal for new items
        initPortfolioImageModal();
        
    } catch (error) {
        console.error('Error loading more portfolio items:', error);
        showNotification('Error loading more items', 'error');
        loadMoreBtn.disabled = false;
        if (loadMoreSpinner) loadMoreSpinner.style.display = 'none';
        if (loadMoreText) loadMoreText.textContent = 'Load More';
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

// ==================== VIDEOS SECTION ====================

// Videos Loading for Portfolio Page
async function loadVideosForPortfolio() {
    try {
        const db = firebase.firestore();
        const querySnapshot = await db.collection('videos')
            .orderBy('createdAt', 'desc')
            .limit(6)
            .get();
        
        const videosGrid = document.getElementById('videosGrid');
        
        if (!videosGrid) {
            console.log('Videos grid not found on this page');
            return;
        }
        
        if (querySnapshot.empty) {
            videosGrid.innerHTML = '<p class="text-center">No videos available yet. Check back later!</p>';
            return;
        }
        
        const videosData = [];
        querySnapshot.forEach((doc) => {
            videosData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        videosGrid.innerHTML = videosData.map(video => {
            // Platform-based styling
            const isReel = video.platform === 'instagram' || video.platform === 'reels';
            const videoClass = isReel ? 'video-card reel-video' : 'video-card youtube-video';
            
            return `
                <div class="${videoClass}">
                    <div class="video-thumbnail">
                        <img src="${video.thumbnail}" alt="${video.title}" 
                             onerror="this.src='https://picsum.photos/${isReel ? '300/500' : '400/300'}?random=1'">
                        <button class="video-play-btn" onclick="playVideo('${video.url}', '${video.platform}', '${video.title || 'Video'}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="video-platform-badge ${video.platform}">
                            <i class="fab fa-${video.platform === 'youtube' ? 'youtube' : 'instagram'}"></i>
                            ${video.platform === 'youtube' ? 'YouTube' : 'Reel'}
                        </div>
                    </div>
                    <div class="video-info">
                        <h3>${video.title || 'Video'}</h3>
                        <p>${video.description || ''}</p>
                        <small>${getCategoryDisplayName(video.category)}</small>
                    </div>
                </div>
            `;
        }).join('');
        
        // Initialize video animations
        initVideoAnimations();
        
    } catch (error) {
        console.error('Error loading videos:', error);
        const videosGrid = document.getElementById('videosGrid');
        if (videosGrid) {
            videosGrid.innerHTML = '<p class="text-center">Error loading videos. Please try again later.</p>';
        }
    }
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
        { category: 'events', title: 'Anniversary Party', description: '25 years celebration', image: 'https://picsum.photos/400/600?random=12' }
    ];
    
    allPortfolioItems = defaultItems;
    filteredPortfolioItems = [...defaultItems];
    currentFilteredItems = [...defaultItems];
    displayPortfolioPage();
}

// Video Play Function
function playVideo(videoUrl, platform, videoTitle = 'Video') {
    console.log('Playing video:', videoUrl, platform, videoTitle);
    
    // Remove any existing modal first
    const existingModal = document.querySelector('.video-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;
    
    const isReel = platform === 'instagram' || platform === 'reels';
    
    // Convert URLs to embed format
    let embedUrl = videoUrl;
    
    // YouTube URL conversion
    if (videoUrl.includes('youtube.com/watch?v=')) {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0`;
    } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0`;
    }
    
    // Determine modal size based on platform
    const modalWidth = isReel ? '400px' : '800px';
    const modalHeight = isReel ? '700px' : '500px';
    
    modal.innerHTML = `
        <div class="video-modal-content" style="
            position: relative;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            width: ${modalWidth};
            max-width: 95vw;
            height: ${modalHeight};
            max-height: 90vh;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            animation: scaleIn 0.3s ease;
        ">
            <!-- Close Button -->
            <button class="close-modal" onclick="closeVideoModal()" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                font-size: 1.2rem;
                transition: all 0.3s ease;
            ">
                <i class="fas fa-times"></i>
            </button>
            
            <!-- Modal Header -->
            <div class="modal-header" style="
                padding: 1.5rem;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                align-items: center;
                gap: 10px;
            ">
                <i class="fab fa-${isReel ? 'instagram' : 'youtube'}" 
                   style="color: ${isReel ? '#E4405F' : '#FF0000'}; 
                          font-size: 1.5rem;"></i>
                <h3 style="margin: 0; color: #333; font-size: 1.3rem; font-weight: 600;">
                    ${videoTitle}
                </h3>
            </div>
            
            <!-- Video Content -->
            <div class="modal-video-container" style="height: calc(100% - 80px);">
                ${embedUrl.includes('youtube.com/embed') 
                    ? `<div style="width: 100%; height: 100%;">
                         <iframe 
                             src="${embedUrl}" 
                             style="width: 100%; height: 100%; border: none;"
                             frameborder="0" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowfullscreen>
                         </iframe>
                       </div>`
                    : `<div style="padding: 3rem 2rem; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                          <i class="fab fa-${isReel ? 'instagram' : 'video'}" 
                             style="font-size: 4rem; color: #ddd; margin-bottom: 1.5rem;"></i>
                          <h4 style="color: #666; margin-bottom: 1rem; font-size: 1.2rem;">
                              ${isReel ? 'Instagram Reel' : 'Video'} Preview
                          </h4>
                          <p style="color: #888; margin-bottom: 2rem; line-height: 1.5;">
                              This content cannot be embedded here. Click the button below to watch it on ${isReel ? 'Instagram' : 'the original platform'}.
                          </p>
                          <a href="${videoUrl}" target="_blank" style="
                              display: inline-flex;
                              align-items: center;
                              gap: 10px;
                              padding: 12px 30px;
                              background: var(--primary-color);
                              color: white;
                              text-decoration: none;
                              border-radius: 25px;
                              font-weight: 600;
                              font-size: 1rem;
                              transition: all 0.3s ease;
                          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(99, 102, 241, 0.3)';"
                          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                              <i class="fas fa-external-link-alt"></i> 
                              Watch on ${isReel ? 'Instagram' : 'YouTube'}
                          </a>
                       </div>`
                }
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeVideoModal();
        }
    });
    
    // Close with Escape key
    const closeWithEscape = function(e) {
        if (e.key === 'Escape') {
            closeVideoModal();
            document.removeEventListener('keydown', closeWithEscape);
        }
    };
    document.addEventListener('keydown', closeWithEscape);
}

// Close video modal function
function closeVideoModal() {
    const modal = document.querySelector('.video-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Initialize video animations
function initVideoAnimations() {
    const videoCards = document.querySelectorAll('.video-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    videoCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// ==================== HELPER FUNCTIONS ====================

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
    // Remove existing notification
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
    
    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
            }
            .notification-error { background: #e74c3c; }
            .notification-warning { background: #f39c12; }
            .notification-info { background: #3498db; }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Close button event
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
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

// Make functions globally available
window.loadMorePortfolio = loadMorePortfolio;
window.playVideo = playVideo;
window.closeVideoModal = closeVideoModal;
window.openWhatsApp = openWhatsApp;
window.handleImageError = handleImageError;
window.closePortfolioImageModal = closePortfolioImageModal;
window.navigatePortfolioImage = navigatePortfolioImage;
