/* Portfolio Page Specific Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* Dark Theme Colors */
    --primary-color: #818cf8;
    --secondary-color: #a78bfa;
    --accent-color: #fbbf24;
    --text-dark: #f3f4f6;
    --text-light: #d1d5db;
    --bg-light: #111827;
    --bg-secondary: #1f2937;
    --bg-primary: #111827; /* ADDED MISSING VARIABLE */
    --card-bg: #374151;
    --border-color: #4b5563;
    --shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    --gradient: linear-gradient(135deg, #818cf8 0%, #764ba2 100%);
}

.light-theme {
    /* Light Theme Colors */
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #f59e0b;
    --text-dark: #1f2937;
    --text-light: #6b7280;
    --bg-light: #ffffff;
    --bg-secondary: #faf8fc;
    --bg-primary: #ffffff; /* ADDED MISSING VARIABLE */
    --card-bg: #ffffff;
    --border-color: #b2bce7;
    --shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Font Families */
:root {
    --font-heading: 'Playfair Display', serif;
    --font-body: 'Inter', sans-serif;
    --font-special: 'Poiret One', cursive;
}

body {
    font-family: var(--font-body);
    line-height: 1.7;
    color: var(--text-dark);
    background: var(--bg-light);
    transition: all 0.3s ease;
    visibility: hidden; /* Prevent FOUC */
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Navigation */
.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    z-index: 1000;
    padding: 0.8rem 0;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--border-color);
}

.dark-theme .navbar {
    background: rgba(17, 24, 39, 0.95);
    border-bottom-color: var(--border-color);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Logo Styling */
.nav-logo {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.logo-img {
    height: 40px;
    width: auto;
    transition: transform 0.3s ease;
}

.logo-img:hover {
    transform: scale(1.05);
}

.logo-text {
    font-family: var(--font-special);
    font-size: 1.8rem;
    font-weight: 700;
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* SMALL Box Style Navigation Links */
.box-link {
    background: var(--card-bg);
    padding: 8px 16px !important;
    border-radius: 25px;
    border: 2px solid var(--border-color);
    transition: all 0.3s ease;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: var(--shadow);
    margin: 0 3px;
    color: var(--text-dark);
}

.box-link:hover {
    background: var(--primary-color);
    color: white !important;
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.box-link::after {
    display: none !important;
}

/* Active Nav Link */
.nav-link.active {
    background: var(--primary-color) !important;
    color: white !important;
    border-color: var(--primary-color) !important;
}

/* SMALL Box Style Theme Toggle */
.box-theme {
    background: var(--card-bg) !important;
    border: 2px solid var(--border-color) !important;
    padding: 8px !important;
    border-radius: 25px !important;
    width: 40px !important;
    height: 40px !important;
    box-shadow: var(--shadow) !important;
    margin-left: 0.5rem !important;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.box-theme:hover {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    transform: translateY(-2px) rotate(30deg) !important;
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3) !important;
}

.box-theme:hover i {
    color: white !important;
}

.box-theme i {
    color: var(--text-dark);
    transition: color 0.3s ease;
}

/* Navigation Menu with SMALL Box Buttons */
.nav-menu {
    display: flex;
    gap: 0.3rem;
    align-items: center;
}

.nav-toggle {
    display: none;
    flex-direction: column;
    cursor: pointer;
    background: none;
    border: none;
    padding: 5px;
}

.bar {
    width: 22px;
    height: 2px;
    background: var(--text-dark);
    margin: 3px 0;
    transition: 0.3s;
    border-radius: 2px;
}

/* Mobile Responsive for SMALL Box Links */
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        left: -100%;
        top: 70px;
        flex-direction: column;
        background: var(--card-bg);
        width: 100%;
        text-align: center;
        transition: 0.3s;
        box-shadow: var(--shadow);
        padding: 1.5rem 0;
        gap: 0.8rem;
        z-index: 999;
    }

    .nav-menu.active {
        left: 0;
    }

    .box-link {
        padding: 10px 20px !important;
        margin: 3px 15px;
        width: 80%;
        text-align: center;
        font-size: 0.9rem;
    }

    .box-theme {
        margin: 0.8rem auto !important;
        width: 45px !important;
        height: 45px !important;
    }

    .logo-img {
        height: 35px;
    }

    .logo-text {
        font-size: 1.5rem;
    }

    .nav-toggle {
        display: flex;
    }

    .nav-toggle.active .bar:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .nav-toggle.active .bar:nth-child(2) {
        opacity: 0;
    }

    .nav-toggle.active .bar:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
}

/* Buttons */
.btn {
    padding: 12px 30px;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
}

.btn-primary {
    background: var(--gradient);
    color: white;
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
    background: transparent;
    color: var(--text-dark);
    border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-3px);
}

.btn-large {
    padding: 15px 40px;
    font-size: 1.1rem;
}

.btn-block {
    width: 100%;
    justify-content: center;
}

/* Sections Common */
.section-title {
    text-align: center;
    font-family: var(--font-heading);
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--text-dark);
    font-weight: 700;
}

.section-subtitle {
    text-align: center;
    font-size: 1.1rem;
    color: var(--text-light);
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    font-family: var(--font-body);
    font-weight: 300;
}

/* Portfolio Header */
.portfolio-header {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)), 
                url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') center/cover;
    color: white;
    text-align: center;
    padding: 120px 0 60px;
    margin-top: 70px;
}

.portfolio-header h1 {
    font-family: var(--font-heading);
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 900;
}

.portfolio-header p {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 2rem;
}

/* Portfolio Filters */
.portfolio-filters {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 2rem;
}

.filter-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    font-weight: 600;
    font-family: var(--font-body);
}

.filter-btn:hover,
.filter-btn.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    transform: translateY(-2px);
}

/* Portfolio Main Section */
.portfolio-main {
    padding: 80px 0;
    background: var(--bg-secondary);
}

.portfolio-grid-full {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.portfolio-item-full {
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: all 0.4s ease;
    aspect-ratio: 3/4;
    opacity: 0;
    transform: scale(0.8);
    background: var(--card-bg);
}

.portfolio-item-full img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.portfolio-overlay-full {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
    color: white;
    padding: 1.5rem;
    transform: translateY(100%);
    transition: transform 0.4s ease;
}

.portfolio-item-full:hover .portfolio-overlay-full {
    transform: translateY(0);
}

.portfolio-item-full:hover {
    transform: translateY(-8px) scale(1.02);
}

.portfolio-item-full:hover img {
    transform: scale(1.1);
}

/* Load More Button */
.load-more-container {
    text-align: center;
    margin-top: 3rem;
}

#loadMoreBtn {
    padding: 12px 40px;
    font-size: 1.1rem;
}

#loadMoreBtn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
}

/* Portfolio CTA */
.portfolio-cta {
    background: var(--gradient);
    color: white;
    padding: 80px 0;
    text-align: center;
}

.portfolio-cta h2 {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.portfolio-cta p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-buttons {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
}

/* Category Badge */
.category-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: var(--primary-color);
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    z-index: 2;
}

/* Loading State */
.loading {
    text-align: center;
    padding: 3rem;
    color: var(--text-light);
    font-size: 1.1rem;
    grid-column: 1 / -1;
}

/* Footer */
.footer {
    background: var(--bg-primary);
    color: var(--text-dark);
    padding: 3rem 0 1rem;
    border-top: 1px solid var(--border-color);
}

.footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.footer-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.footer-logo p {
    color: var(--text-light);
}

.footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.footer-links a {
    color: var(--text-dark);
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-links a:hover {
    color: var(--primary-color);
}

.social-links {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.social-link {
    color: var(--text-dark);
    font-size: 1.3rem;
    transition: all 0.3s ease;
    background: var(--card-bg);
    padding: 12px;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow);
    text-decoration: none;
}

.social-link:hover {
    color: var(--primary-color);
    transform: translateY(-3px) scale(1.1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* Specific social media colors */
.social-link:nth-child(1):hover {
    color: #E4405F;
    background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
    color: white !important;
}

.social-link:nth-child(2):hover {
    color: #1877F2;
    background: #1877F2;
    color: white !important;
}

.social-link:nth-child(3):hover {
    color: #25D366;
    background: #25D366;
    color: white !important;
}

.social-link:nth-child(4):hover {
    color: #FF0000;
    background: #FF0000;
    color: white !important;
}

.copyright {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
    color: var(--text-light);
    font-size: 0.9rem;
}

/* Animation Classes */
.portfolio-item-full {
    transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-color);
}

/* Selection Color */
::selection {
    background: var(--primary-color);
    color: white;
}

/* Focus outlines for accessibility */
button:focus,
a:focus,
input:focus,
textarea:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* Smooth scrolling for the whole page */
html {
    scroll-behavior: smooth;
}

/* Notification Styles */
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

/* Image fallback styling */
img {
    transition: opacity 0.3s ease;
}

img[src=""], 
img:not([src]) {
    opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .portfolio-header h1 {
        font-size: 2.5rem;
    }
    
    .portfolio-filters {
        gap: 0.5rem;
    }
    
    .filter-btn {
        padding: 8px 16px;
        font-size: 0.9rem;
    }
    
    .portfolio-grid-full {
        grid-template-columns: 1fr;
    }
    
    .cta-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .cta-buttons .btn {
        width: 200px;
        text-align: center;
        justify-content: center;
    }
    
    .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .footer-links {
        justify-content: center;
    }
    
    .social-links {
        justify-content: center;
    }
    
    .portfolio-header {
        padding: 100px 0 40px;
    }
}

@media (max-width: 480px) {
    .portfolio-header {
        padding: 90px 0 30px;
    }
    
    .portfolio-header h1 {
        font-size: 2rem;
    }
    
    .portfolio-header p {
        font-size: 1rem;
    }
    
    .section-title {
        font-size: 2rem;
    }
    
    .portfolio-main {
        padding: 60px 0;
    }
    
    .portfolio-cta {
        padding: 60px 0;
    }
    
    .portfolio-cta h2 {
        font-size: 2rem;
    }
    
    .portfolio-cta p {
        font-size: 1rem;
    }
}

/* Utility Classes */
.text-center {
    text-align: center;
}

.mb-1 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 2rem; }
.mb-3 { margin-bottom: 3rem; }

.mt-1 { margin-top: 1rem; }
.mt-2 { margin-top: 2rem; }
.mt-3 { margin-top: 3rem; }

.hidden {
    display: none !important;
}

.fade-in {
    animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Ensure smooth theme transitions */
.navbar,
.portfolio-item-full,
.filter-btn,
.social-link {
    transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease;
}

/* Make body visible after loading */
body.loaded {
    visibility: visible;
}
