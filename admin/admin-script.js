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

    // Initialize sections
    initNavigation();
    initPortfolioManagement();
    initModals();
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
    const portfolioGrid = document.querySelector('.portfolio-grid-admin');
    
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
    
    // Get existing data
    let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || [];
    
    if (itemId) {
        // Update existing
        const index = portfolioData.findIndex(item => item.id == itemId);
        if (index !== -1) {
            portfolioData[index] = { id: itemId, title, category, image, description };
        }
    } else {
        // Add new
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
    
    // ALSO SAVE TO JSON FILE (Manual step for now)
    downloadPortfolioJSON(portfolioData);
    
    loadPortfolioItems();
    hidePortfolioForm();
    alert('Portfolio item saved! Download JSON file and upload to website.');
}

// Function to download JSON file
function downloadPortfolioJSON(data) {
    const jsonData = JSON.stringify({ portfolio: data }, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        
        alert('Item deleted successfully!');
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
        uploadBtn.addEventListener('click', function() {
            // In a real app, you would upload to a server
            // For demo, we'll just use the data URL
            const preview = document.getElementById('imagePreview').src;
            if (preview) {
                document.getElementById('itemImage').value = preview;
                modal.style.display = 'none';
                alert('Image uploaded! (Note: In real app, this would save to server)');
            }
        });
    }
}

function openImageUpload() {
    document.getElementById('imageUploadModal').style.display = 'block';
}

// Export portfolio data for main website
function exportPortfolioData() {
    return JSON.parse(localStorage.getItem('portfolioData')) || [];
}
