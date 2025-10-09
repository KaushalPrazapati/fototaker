// ImgBB Configuration
const IMGBB_API_KEY = 'e473f5abe25409c5e97480f6a03bb992';

// Admin Login System
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true' && 
        window.location.pathname.includes('admin-login.html')) {
        window.location.href = 'admin-dashboard.html';
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple authentication (in real app, use secure backend)
            if (username === 'admin' && password === 'password123') {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'admin-dashboard.html';
            } else {
                alert('Invalid credentials! Try: admin / password123');
            }
        });
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
        });
    }

    // Initialize Admin Dashboard
    if (window.location.pathname.includes('admin-dashboard.html')) {
        initAdminDashboard();
    }
});

// Admin Dashboard Functions
function initAdminDashboard() {
    // Check authentication
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    // Initialize Firebase
    initFirebase();

    // Initialize sections
    initNavigation();
    initPortfolioManagement();
    initVideosManagement();
    initModals();
}

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

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}

// Navigation
function initNavigation() {
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.admin-section');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active menu
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Portfolio Management
function initPortfolioManagement() {
    const addBtn = document.getElementById('addPortfolioBtn');
    const portfolioForm = document.getElementById('portfolioForm');
    
    // Load existing portfolio items
    loadPortfolioItems();
    
    // Add new item button
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            showPortfolioForm();
        });
    }
    
    // Portfolio form submission
    const portfolioFormElement = document.getElementById('portfolioItemForm');
    if (portfolioFormElement) {
        portfolioFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            savePortfolioItem();
        });
    }
}

function showPortfolioForm(item = null) {
    const form = document.getElementById('portfolioForm');
    const formTitle = document.getElementById('formTitle');
    const formElement = document.getElementById('portfolioItemForm');
    
    if (item) {
        // Edit mode
        formTitle.textContent = 'Edit Portfolio Item';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemTitle').value = item.title;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemImage').value = item.image;
        document.getElementById('itemDescription').value = item.description || '';
    } else {
        // Add mode
        formTitle.textContent = 'Add Portfolio Item';
        formElement.reset();
        document.getElementById('itemId').value = '';
    }
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function hidePortfolioForm() {
    document.getElementById('portfolioForm').style.display = 'none';
}

function savePortfolioItem() {
    const itemId = document.getElementById('itemId').value;
    const title = document.getElementById('itemTitle').value;
    const category = document.getElementById('itemCategory').value;
    const image = document.getElementById('itemImage').value;
    const description = document.getElementById('itemDescription').value;
    
    // Get existing portfolio data
    let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
    
    if (itemId) {
        // Update existing item
        const index = portfolioData.findIndex(item => item.id == itemId);
        if (index !== -1) {
            portfolioData[index] = { id: itemId, title, category, image, description };
        }
    } else {
        // Add new item
        const newItem = {
            id: Date.now().toString(),
            title,
            category,
            image,
            description
        };
        portfolioData.push(newItem);
    }
    
    // Save to localStorage
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    
    // Reload portfolio items
    loadPortfolioItems();
    hidePortfolioForm();
    
    showNotification('Portfolio item saved successfully!', 'success');
}

function loadPortfolioItems() {
    const portfolioGrid = document.querySelector('.portfolio-grid-admin');
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
    
    if (portfolioGrid) {
        if (portfolioData.length === 0) {
            portfolioGrid.innerHTML = '<p>No portfolio items yet. Click "Add New Item" to get started.</p>';
            return;
        }
        
        portfolioGrid.innerHTML = portfolioData.map(item => `
            <div class="portfolio-item-admin">
                <img src="${item.image}" alt="${item.title}" onerror="this.src='https://picsum.photos/400/300?random=1'">
                <div class="item-details">
                    <h4>${item.title}</h4>
                    <p><strong>Category:</strong> ${item.category}</p>
                    <p>${item.description || 'No description'}</p>
                    <div class="item-actions">
                        <button class="btn btn-primary" onclick="editPortfolioItem('${item.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-logout" onclick="deletePortfolioItem('${item.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function editPortfolioItem(id) {
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
    const item = portfolioData.find(item => item.id === id);
    
    if (item) {
        showPortfolioForm(item);
    }
}

function deletePortfolioItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
        portfolioData = portfolioData.filter(item => item.id !== id);
        
        localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
        loadPortfolioItems();
        
        showNotification('Item deleted successfully!', 'success');
    }
}

// Videos Management System
function initVideosManagement() {
    const addVideoBtn = document.getElementById('addVideoBtn');
    const videoForm = document.getElementById('videoItemForm');
    
    // Load existing videos
    loadVideosList();
    
    // Add new video button
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', function() {
            showVideoForm();
        });
    }
    
    // Video form submission
    if (videoForm) {
        videoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveVideoItem();
        });
    }
}

async function loadVideosList() {
    try {
        const db = firebase.firestore();
        const doc = await db.collection('websiteData').doc('reelsData').get();
        
        const videosList = document.getElementById('videosList');
        
        if (!doc.exists) {
            videosList.innerHTML = '<tr><td colspan="6" class="text-center">No videos found. Add your first video!</td></tr>';
            return;
        }
        
        const reelsData = doc.data();
        const reels = reelsData.reels || [];
        
        if (reels.length === 0) {
            videosList.innerHTML = '<tr><td colspan="6" class="text-center">No videos found. Add your first video!</td></tr>';
            return;
        }
        
        videosList.innerHTML = reels.map((reel, index) => `
            <tr>
                <td>
                    <img src="${reel.thumbnail}" alt="${reel.title}" 
                         class="admin-thumbnail" 
                         onerror="this.src='https://picsum.photos/100/100?random=1'">
                </td>
                <td>${reel.title}</td>
                <td><span class="category-badge">${reel.category}</span></td>
                <td>${reel.duration || 'N/A'}</td>
                <td>${reel.platform || 'instagram'}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editVideo(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-logout btn-sm" onclick="deleteVideo(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading videos:', error);
        const videosList = document.getElementById('videosList');
        if (videosList) {
            videosList.innerHTML = '<tr><td colspan="6" class="text-center error">Error loading videos</td></tr>';
        }
    }
}

async function saveVideoItem() {
    const editIndex = document.getElementById('videoId').value;
    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;
    const url = document.getElementById('videoUrl').value;
    const thumbnail = document.getElementById('videoThumbnail').value;
    const category = document.getElementById('videoCategory').value;
    const duration = document.getElementById('videoDuration').value;
    const platform = document.getElementById('videoPlatform').value;
    
    const newReel = {
        title,
        description,
        url,
        thumbnail,
        category,
        duration,
        platform
    };
    
    try {
        const db = firebase.firestore();
        const docRef = db.collection('websiteData').doc('reelsData');
        const doc = await docRef.get();
        
        let reels = [];
        if (doc.exists) {
            const data = doc.data();
            reels = data.reels || [];
        }
        
        if (editIndex !== '') {
            // Edit existing reel
            reels[editIndex] = newReel;
        } else {
            // Add new reel
            reels.push(newReel);
        }
        
        // Save back to Firebase
        await docRef.set({
            reels: reels,
            lastUpdated: new Date().toISOString()
        }, { merge: true });
        
        showNotification(`Video ${editIndex !== '' ? 'updated' : 'added'} successfully!`, 'success');
        hideVideoForm();
        loadVideosList();
        
    } catch (error) {
        console.error('Error saving video:', error);
        showNotification('Error saving video. Please try again.', 'error');
    }
}

async function editVideo(index) {
    try {
        const db = firebase.firestore();
        const doc = await db.collection('websiteData').doc('reelsData').get();
        
        if (doc.exists) {
            const reelsData = doc.data();
            const reels = reelsData.reels || [];
            
            if (reels[index]) {
                showVideoForm(reels[index], index);
            }
        }
    } catch (error) {
        console.error('Error loading video:', error);
        showNotification('Error loading video details.', 'error');
    }
}

function showVideoForm(video = null, index = '') {
    const form = document.getElementById('videoForm');
    const formTitle = document.getElementById('videoFormTitle');
    const formElement = document.getElementById('videoItemForm');
    
    if (video) {
        // Edit mode
        formTitle.textContent = 'Edit Video';
        document.getElementById('videoId').value = index;
        document.getElementById('videoTitle').value = video.title;
        document.getElementById('videoDescription').value = video.description || '';
        document.getElementById('videoUrl').value = video.url;
        document.getElementById('videoThumbnail').value = video.thumbnail;
        document.getElementById('videoCategory').value = video.category;
        document.getElementById('videoDuration').value = video.duration || '';
        document.getElementById('videoPlatform').value = video.platform || 'instagram';
    } else {
        // Add mode
        formTitle.textContent = 'Add Video/Reel';
        formElement.reset();
        document.getElementById('videoId').value = '';
    }
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function hideVideoForm() {
    document.getElementById('videoForm').style.display = 'none';
}

async function deleteVideo(index) {
    if (!confirm('Are you sure you want to delete this video?')) {
        return;
    }
    
    try {
        const db = firebase.firestore();
        const docRef = db.collection('websiteData').doc('reelsData');
        const doc = await docRef.get();
        
        if (doc.exists) {
            const reelsData = doc.data();
            let reels = reelsData.reels || [];
            
            // Remove the reel at specified index
            reels.splice(index, 1);
            
            // Save back to Firebase
            await docRef.set({
                reels: reels,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
            
            showNotification('Video deleted successfully!', 'success');
            loadVideosList();
        }
        
    } catch (error) {
        console.error('Error deleting video:', error);
        showNotification('Error deleting video. Please try again.', 'error');
    }
}

// Image Upload Functions
function initModals() {
    const modal = document.getElementById('imageUploadModal');
    const closeBtn = document.querySelector('.modal .close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeImageUploadModal();
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageUploadModal();
        }
    });
    
    // Image upload preview
    const imageFile = document.getElementById('imageFile');
    if (imageFile) {
        imageFile.addEventListener('change', function(e) {
            handleImageSelect(e);
        });
    }
    
    // Upload image button
    const uploadBtn = document.getElementById('uploadImageBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            uploadToImgBB();
        });
    }
}

function handleImageSelect(e) {
    const file = e.target.files[0];
    const uploadBtn = document.getElementById('uploadImageBtn');
    const preview = document.getElementById('imagePreview');
    const placeholder = document.querySelector('.preview-placeholder');
    
    if (file) {
        // File validation
        const maxSize = 32 * 1024 * 1024; // 32MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (file.size > maxSize) {
            showNotification('Image size should be less than 32MB', 'error');
            resetImageUpload();
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            showNotification('Please select a valid image file (JPG, PNG, GIF, WEBP)', 'error');
            resetImageUpload();
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
        
        // Enable upload button
        uploadBtn.disabled = false;
    } else {
        resetImageUpload();
    }
}

async function uploadToImgBB() {
    const fileInput = document.getElementById('imageFile');
    const uploadBtn = document.getElementById('uploadImageBtn');
    const progress = document.querySelector('.upload-progress');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (!fileInput.files[0]) {
        showNotification('Please select an image first', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    try {
        // Show progress
        uploadBtn.disabled = true;
        progress.style.display = 'block';
        progressFill.style.width = '30%';
        progressText.textContent = 'Uploading to ImgBB...';
        
        // Create form data
        const formData = new FormData();
        formData.append('image', file);
        
        // Upload to ImgBB
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        progressFill.style.width = '70%';
        progressText.textContent = 'Processing image...';
        
        const result = await response.json();
        
        if (result.success) {
            progressFill.style.width = '100%';
            progressText.textContent = 'Upload successful!';
            
            // Get the image URL
            const imageUrl = result.data.url;
            const thumbUrl = result.data.thumb.url; // Thumbnail URL
            const displayUrl = result.data.display_url;
            
            // Set the image URL in the form
            document.getElementById('itemImage').value = displayUrl;
            
            // Show success message
            setTimeout(() => {
                showNotification('Image uploaded successfully to ImgBB!', 'success');
                closeImageUploadModal();
                resetImageUpload();
            }, 1000);
            
        } else {
            throw new Error(result.error.message || 'Upload failed');
        }
        
    } catch (error) {
        console.error('ImgBB Upload Error:', error);
        showNotification('Image upload failed: ' + error.message, 'error');
        resetImageUpload();
    }
}

function resetImageUpload() {
    const fileInput = document.getElementById('imageFile');
    const uploadBtn = document.getElementById('uploadImageBtn');
    const preview = document.getElementById('imagePreview');
    const placeholder = document.querySelector('.preview-placeholder');
    const progress = document.querySelector('.upload-progress');
    
    fileInput.value = '';
    uploadBtn.disabled = true;
    preview.src = '';
    preview.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    progress.style.display = 'none';
}

function closeImageUploadModal() {
    document.getElementById('imageUploadModal').style.display = 'none';
    resetImageUpload();
}

function openImageUpload() {
    document.getElementById('imageUploadModal').style.display = 'block';
    resetImageUpload();
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.admin-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                &times;
            </button>
        </div>
    `;
    
    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .admin-notification {
                position: fixed;
                top: 80px;
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
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
