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
            
            if (username === 'admin' && password === 'password123') {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'admin-dashboard.html';
            } else {
                alert('Invalid credentials! Try: admin / password123');
            }
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

    // Initialize systems
    initNavigation();
    initPortfolioManagement();
    initModals();
    
    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
        });
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
    const portfolioForm = document.getElementById('portfolioItemForm');
    
    // Load existing portfolio items
    loadPortfolioItems();
    
    // Add new item button
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            showPortfolioForm();
        });
    }
    
    // Portfolio form submission
    if (portfolioForm) {
        portfolioForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePortfolioItem();
        });
    }
}

function showPortfolioForm(item = null) {
    const form = document.getElementById('portfolioForm');
    const formTitle = document.getElementById('formTitle');
    
    if (item) {
        // Edit mode
        formTitle.textContent = 'Edit Portfolio Item';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemTitle').value = item.title || '';
        document.getElementById('itemCategory').value = item.category || '';
        document.getElementById('itemImage').value = item.image || '';
        document.getElementById('itemDescription').value = item.description || '';
    } else {
        // Add mode
        formTitle.textContent = 'Add Portfolio Item';
        document.getElementById('portfolioItemForm').reset();
        document.getElementById('itemId').value = '';
    }
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function hidePortfolioForm() {
    const form = document.getElementById('portfolioForm');
    if (form) {
        form.style.display = 'none';
    }
}

async function savePortfolioItem() {
    const itemId = document.getElementById('itemId').value;
    const title = document.getElementById('itemTitle').value.trim();
    const category = document.getElementById('itemCategory').value;
    const image = document.getElementById('itemImage').value.trim();
    const description = document.getElementById('itemDescription').value.trim();
    
    if (!title || !category || !image) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    try {
        const db = firebase.firestore();
        const portfolioRef = db.collection('portfolio');
        
        const portfolioData = {
            title: title,
            category: category,
            image: image,
            description: description,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (itemId) {
            // Update existing item
            await portfolioRef.doc(itemId).update(portfolioData);
            showNotification('Portfolio item updated successfully!', 'success');
        } else {
            // Add new item
            await portfolioRef.add(portfolioData);
            showNotification('Portfolio item added successfully!', 'success');
        }
        
        // Reload portfolio items
        loadPortfolioItems();
        hidePortfolioForm();
        
    } catch (error) {
        console.error('Error saving portfolio item:', error);
        showNotification('Error saving portfolio item: ' + error.message, 'error');
    }
}

async function loadPortfolioItems() {
    try {
        const db = firebase.firestore();
        const querySnapshot = await db.collection('portfolio')
            .orderBy('createdAt', 'desc')
            .get();
        
        const portfolioGrid = document.getElementById('portfolioGrid');
        
        if (querySnapshot.empty) {
            portfolioGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <p>No portfolio items yet.</p>
                    <p>Click "Add New Item" to get started.</p>
                </div>
            `;
            return;
        }
        
        const portfolioData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            portfolioData.push({
                id: doc.id,
                ...data
            });
        });
        
        portfolioGrid.innerHTML = portfolioData.map(item => `
            <div class="portfolio-item-admin">
                <img src="${item.image}" alt="${item.title}" 
                     onerror="this.src='https://picsum.photos/400/300?random=1'">
                <div class="item-details">
                    <h4>${item.title || 'Untitled'}</h4>
                    <p><strong>Category:</strong> ${getCategoryDisplayName(item.category) || 'Uncategorized'}</p>
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
        
    } catch (error) {
        console.error('Error loading portfolio items:', error);
        const portfolioGrid = document.getElementById('portfolioGrid');
        portfolioGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #e74c3c;">
                <p>Error loading portfolio items.</p>
                <p>Check Firebase permissions and console.</p>
            </div>
        `;
    }
}

async function editPortfolioItem(id) {
    try {
        const db = firebase.firestore();
        const doc = await db.collection('portfolio').doc(id).get();
        
        if (doc.exists) {
            const item = {
                id: doc.id,
                ...doc.data()
            };
            showPortfolioForm(item);
        } else {
            showNotification('Portfolio item not found', 'error');
        }
    } catch (error) {
        console.error('Error loading portfolio item:', error);
        showNotification('Error loading portfolio item details.', 'error');
    }
}

async function deletePortfolioItem(id) {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
        return;
    }
    
    try {
        const db = firebase.firestore();
        await db.collection('portfolio').doc(id).delete();
        
        showNotification('Portfolio item deleted successfully!', 'success');
        loadPortfolioItems();
        
    } catch (error) {
        console.error('Error deleting portfolio item:', error);
        showNotification('Error deleting portfolio item: ' + error.message, 'error');
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
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
            if (placeholder) placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
        
        // Enable upload button
        if (uploadBtn) uploadBtn.disabled = false;
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
    
    if (!fileInput || !fileInput.files[0]) {
        showNotification('Please select an image first', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    try {
        // Show progress
        if (uploadBtn) uploadBtn.disabled = true;
        if (progress) progress.style.display = 'block';
        if (progressFill) progressFill.style.width = '30%';
        if (progressText) progressText.textContent = 'Uploading to ImgBB...';
        
        // Create form data
        const formData = new FormData();
        formData.append('image', file);
        
        // Upload to ImgBB
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (progressFill) progressFill.style.width = '70%';
        if (progressText) progressText.textContent = 'Processing image...';
        
        const result = await response.json();
        
        if (result.success) {
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = 'Upload successful!';
            
            // Get the image URL
            const imageUrl = result.data.display_url;
            
            // Set the image URL in the form
            const itemImageInput = document.getElementById('itemImage');
            if (itemImageInput) {
                itemImageInput.value = imageUrl;
                itemImageInput.focus();
            }
            
            // Show success message
            setTimeout(() => {
                showNotification('Image uploaded successfully to ImgBB! URL copied to form.', 'success');
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
    
    if (fileInput) fileInput.value = '';
    if (uploadBtn) uploadBtn.disabled = true;
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'flex';
    if (progress) progress.style.display = 'none';
}

function closeImageUploadModal() {
    const modal = document.getElementById('imageUploadModal');
    if (modal) {
        modal.style.display = 'none';
    }
    resetImageUpload();
}

function openImageUpload() {
    const modal = document.getElementById('imageUploadModal');
    if (modal) {
        modal.style.display = 'block';
        resetImageUpload();
    }
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
    return categoryMap[category] || category;
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
            <button class="notification-close">&times;</button>
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
    
    // Close button event
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Make functions globally available
window.openImageUpload = openImageUpload;
window.closeImageUploadModal = closeImageUploadModal;
window.hidePortfolioForm = hidePortfolioForm;
window.editPortfolioItem = editPortfolioItem;
window.deletePortfolioItem = deletePortfolioItem;
