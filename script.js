// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
});

// Search functionality
function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (!query) return;
    
    // Scroll to products section if on same page
    const categories = document.getElementById('kategorien');
    if (categories) {
        categories.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Simple highlight effect for matching categories
    const cards = document.querySelectorAll('.category-card, .product-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
            card.style.transform = 'scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.2)';
            setTimeout(() => {
                card.style.transform = '';
                card.style.boxShadow = '';
            }, 2000);
        }
    });
}

// Enter key search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards and sections
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.category-card, .product-card, .guide-card');
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(el);
    });
});

// Lazy load Affiliatematic widgets when in viewport
const widgetObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Widget script is already loaded async
            // This just ensures the container is visible when needed
            entry.target.classList.add('widget-visible');
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', function() {
    const widgets = document.querySelectorAll('.amazon-widget-container');
    widgets.forEach(widget => {
        widgetObserver.observe(widget);
    });
});

// Console message for developers
console.log('🏠 SmartHome Guide - Affiliate Site Loaded');
console.log('📊 Monetization: Amazon Associates via Affiliatematic');