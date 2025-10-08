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

// Initialize Firebase
function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized successfully");
            return true;
        } else {
            console.log("ℹ️ Firebase already initialized");
            return true;
        }
    } catch (error) {
        console.error("❌ Firebase initialization error:", error);
        showNotification('Firebase initialization failed!', 'error');
        return false;
    }
}

// Admin Login System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase first
    const firebaseInitialized = initializeFirebase();
    
    if (!firebaseInitialized) {
        console.error("Firebase initialization failed!");
        return;
    }

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
        
        // Check Firebase initialization
        if (!firebase.apps.length) {
            initializeFirebase();
        }
        
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
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Load Portfolio Items from Firebase
async function loadPortfolioFromFirebase() {
    const portfolioGrid = document.querySelector('.portfolio-grid-admin');
    
    if (!portfolioGrid) return;
    
    try {
        // Check Firebase initialization
        if (!firebase.apps.length) {
            initializeFirebase();
        }
        
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
        portfolioGrid.innerHTML = '<p>No portfolio items yet. Click "Add New Item" to get started.</p>';
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
        // Check Firebase initialization
        if (!firebase.apps.length) {
            initializeFirebase();
        }
        
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
            // Check Firebase initialization
            if (!firebase.apps.length) {
                initializeFirebase();
            }
            
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

// Image Upload Functionality
async function uploadImageToFirebase(file) {
    try {
        // Check Firebase initialization
        if (!firebase.apps.length) {
            initializeFirebase();
        }
        
        // Create unique filename
        const timestamp = Date.now();
        const fileName = `portfolio/${timestamp}-${file.name}`;
        const storageRef = firebase.storage().ref(fileName);
        
        // Upload file
        const snapshot = await storageRef.put(file);
        
        // Get download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// Modal Functions
function initModals() {
    const modal = document.getElementById('imageUploadModal');
    const closeBtn = document.querySelector('.modal .close');
    
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
                    document.getElementById('imagePreview').src = e.target.result;
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
                alert('Please select an image file first.');
                return;
            }
            
            try {
                uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                uploadBtn.disabled = true;
                
                const downloadURL = await uploadImageToFirebase(file);
                
                // Set the image URL in the form
                document.getElementById('itemImage').value = downloadURL;
                document.getElementById('imageUploadModal').style.display = 'none';
                
                showNotification('Image uploaded successfully!', 'success');
            } catch (error) {
                showNotification('Error uploading image. Please try again.', 'error');
            } finally {
                uploadBtn.innerHTML = 'Upload';
                uploadBtn.disabled = false;
                fileInput.value = '';
            }
        });
    }
}

function openImageUpload() {
    document.getElementById('imageUploadModal').style.display = 'block';
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
window.hidePortfolioForm = hidePortfolioForm;
