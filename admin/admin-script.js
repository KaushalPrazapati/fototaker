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
            
            // Simple authentication
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

    // Initialize sections
    initNavigation();
    initPortfolioManagement();
    initModals();
    
    // Load portfolio items from Firebase
    loadPortfolioFromFirebase();
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

// Portfolio Management with Firebase
function initPortfolioManagement() {
    const addBtn = document.getElementById('addPortfolioBtn');
    
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
            savePortfolioItemToFirebase();
        });
    }
}

// Show Portfolio Form
function showPortfolioForm(item = null) {
    const form = document.getElementById('portfolioForm');
    const formTitle = document.getElementById('formTitle');
    
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
        document.getElementById('portfolioItemForm').reset();
        document.getElementById('itemId').value = '';
    }
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function hidePortfolioForm() {
    document.getElementById('portfolioForm').style.display = 'none';
}

// Save Portfolio Item to Firebase
async function savePortfolioItemToFirebase() {
    const itemId = document.getElementById('itemId').value;
    const title = document.getElementById('itemTitle').value;
    const category = document.getElementById('itemCategory').value;
    const image = document.getElementById('itemImage').value;
    const description = document.getElementById('itemDescription').value;
    
    const submitBtn = document.querySelector('#portfolioItemForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        const db = firebase.firestore();
        const portfolioData = {
            title,
            category,
            image,
            description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (itemId) {
            // Update existing item
            const docRef = db.collection('portfolio').doc(itemId);
            await docRef.update({
                ...portfolioData,
                updatedAt: new Date().toISOString()
            });
            showNotification('Portfolio item updated successfully!', 'success');
        } else {
            // Add new item
            await db.collection('portfolio').add(portfolioData);
            showNotification('Portfolio item added successfully!', 'success');
        }
        
        // Reload portfolio items
        loadPortfolioFromFirebase();
        hidePortfolioForm();
        
    } catch (error) {
        console.error('Error saving portfolio item:', error);
        showNotification('Error saving portfolio item. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Item';
        submitBtn.disabled = false;
    }
}

// Load Portfolio Items from Firebase
async function loadPortfolioFromFirebase() {
    const portfolioGrid = document.querySelector('.portfolio-grid-admin');
    
    if (!portfolioGrid) return;
    
    try {
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
        
        displayPortfolioItemsAdmin(portfolioData);
    } catch (error) {
        console.error('Error loading portfolio:', error);
        portfolioGrid.innerHTML = '<p>Error loading portfolio items. Please check console for details.</p>';
    }
}

// Display Portfolio Items in Admin Panel
function displayPortfolioItemsAdmin(items) {
    const portfolioGrid = document.querySelector('.portfolio-grid-admin');
    
    if (items.length === 0) {
        portfolioGrid.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No portfolio items yet</h3>
                <p>Click "Add New Item" to get started</p>
            </div>
        `;
        return;
    }
    
    portfolioGrid.innerHTML = items.map(item => `
        <div class="portfolio-item-admin">
            <img src="${item.image}" alt="${item.title}" 
                 onerror="this.src='https://picsum.photos/400/300?random=1'">
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

// Edit Portfolio Item
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
            showNotification('Item not found!', 'error');
        }
    } catch (error) {
        console.error('Error loading item for edit:', error);
        showNotification('Error loading item for editing.', 'error');
    }
}

// Delete Portfolio Item
async function deletePortfolioItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            const db = firebase.firestore();
            await db.collection('portfolio').doc(id).delete();
            loadPortfolioFromFirebase();
            showNotification('Item deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting item:', error);
            showNotification('Error deleting item. Please try again.', 'error');
        }
    }
}

// Direct Image URL Input (No File Upload)
function openImageUpload() {
    const currentUrl = document.getElementById('itemImage').value;
    const imageUrl = prompt('Paste your image URL here:', currentUrl || '');
    
    if (imageUrl) {
        // Basic URL validation
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            document.getElementById('itemImage').value = imageUrl;
            showNotification('Image URL added successfully!', 'success');
        } else {
            showNotification('Please enter a valid URL starting with http:// or https://', 'error');
        }
    }
}

// Image Upload to Firebase Storage
async function uploadImageToFirebase(file) {
    try {
        // Check if file is selected
        if (!file) {
            throw new Error('No file selected');
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size too large. Maximum 5MB allowed.');
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select an image file');
        }

        console.log('Starting upload for file:', file.name, 'Size:', file.size);

        // Create unique filename
        const timestamp = Date.now();
        const fileName = `portfolio/${timestamp}-${file.name}`;
        const storageRef = firebase.storage().ref(fileName);
        
        // Upload file with metadata
        const metadata = {
            contentType: file.type
        };
        
        console.log('Uploading to:', fileName);
        const snapshot = await storageRef.put(file, metadata);
        console.log('Upload completed, getting download URL...');
        
        // Get download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log('Download URL:', downloadURL);
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// Modal Functions
function initModals() {
    const modal = document.getElementById('imageUploadModal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Image upload preview
    const imageFile = document.getElementById('imageFile');
    if (imageFile) {
        imageFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('imagePreview');
                    if (preview) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Upload image button
    const uploadBtn = document.getElementById('uploadImageBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async function() {
            const fileInput = document.getElementById('imageFile');
            const file = fileInput.files[0];
            
            if (!file) {
                showNotification('Please select an image file first.', 'error');
                return;
            }
            
            try {
                uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                uploadBtn.disabled = true;
                
                console.log('Upload process started...');
                const downloadURL = await uploadImageToFirebase(file);
                console.log('Upload successful, URL:', downloadURL);
                
                // Set the image URL in the form
                document.getElementById('itemImage').value = downloadURL;
                document.getElementById('imageUploadModal').style.display = 'none';
                
                showNotification('Image uploaded successfully!', 'success');
                
            } catch (error) {
                console.error('Upload failed:', error);
                let errorMessage = 'Error uploading image. ';
                
                if (error.message.includes('permission') || error.message.includes('unauthorized')) {
                    errorMessage += 'Please check Firebase Storage rules.';
                } else if (error.message.includes('size')) {
                    errorMessage += 'File too large. Maximum 5MB allowed.';
                } else {
                    errorMessage += 'Please try again.';
                }
                
                showNotification(errorMessage, 'error');
            } finally {
                uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload';
                uploadBtn.disabled = false;
                if (fileInput) fileInput.value = '';
                const preview = document.getElementById('imagePreview');
                if (preview) preview.style.display = 'none';
            }
        });
    }
}

function openFileUpload() {
    const modal = document.getElementById('imageUploadModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
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

// Logout Handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin-login.html';
    });
}

// Make functions global for HTML onclick
window.editPortfolioItem = editPortfolioItem;
window.deletePortfolioItem = deletePortfolioItem;
window.openImageUpload = openImageUpload;
window.openFileUpload = openFileUpload;
window.hidePortfolioForm = hidePortfolioForm;
