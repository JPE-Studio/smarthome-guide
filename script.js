// Premium Smart Home Guide JavaScript

// Dark Mode Toggle
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

// Check for saved theme preference or default to dark
const currentTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', currentTheme);

themeToggle?.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Animated Counter
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += step;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString() + '+';
        }
    };
    
    updateCounter();
}

// Intersection Observer for Counter Animation
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-value');
            counters.forEach(counter => {
                if (!counter.classList.contains('animated')) {
                    counter.classList.add('animated');
                    animateCounter(counter);
                }
            });
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.hero-stats-premium');
if (statsSection) {
    counterObserver.observe(statsSection);
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.nav-glass').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
        // Close mobile menu
        navLinks?.classList.remove('active');
        menuToggle?.classList.remove('active');
    });
});

// Scroll Progress Indicator
const nav = document.querySelector('.nav-glass');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove scrolled class for nav styling
    if (currentScroll > 50) {
        nav?.classList.add('scrolled');
    } else {
        nav?.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Parallax Effect for Gradient Orbs
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll('.gradient-orb');
    
    orbs.forEach((orb, index) => {
        const speed = 0.1 + (index * 0.05);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Intersection Observer for Fade-in Animations
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe elements for fade-in
document.querySelectorAll('.category-card-premium, .lighting-card, .step-item, .product-winner').forEach(el => {
    el.style.opacity = '0';
    fadeObserver.observe(el);
});

// Spec Bars Animation
const specObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll('.spec-fill');
            bars.forEach((bar, index) => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, index * 200);
            });
            specObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const winnerSection = document.querySelector('.winner-specs');
if (winnerSection) {
    specObserver.observe(winnerSection);
}

// Card Hover Effect Enhancement
document.querySelectorAll('.category-card-premium').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// Amazon Widget Lazy Loading
const widgetObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('widget-visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.amazon-widget-container').forEach(widget => {
    widgetObserver.observe(widget);
});

// Add custom styles for scrolled nav
const style = document.createElement('style');
style.textContent = `
    .nav-glass.scrolled .nav-container {
        background: rgba(10, 10, 15, 0.95);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    }
    
    [data-theme="light"] .nav-glass.scrolled .nav-container {
        background: rgba(255, 255, 255, 0.95);
    }
`;
document.head.appendChild(style);

// Newsletter Form Handler
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const originalText = button?.textContent;
        
        if (button) {
            button.textContent = '✓ Gesendet!';
            button.disabled = true;
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                form.reset();
            }, 3000);
        }
    });
});

// Performance: Disable animations on reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition', '0s');
    document.documentElement.style.setProperty('--transition-slow', '0s');
}

// Console Art
console.log('%c🏠 SmartHome Guide', 'font-size: 24px; font-weight: bold; color: #6366f1;');
console.log('%cPremium Affiliate Experience', 'font-size: 14px; color: #8b5cf6;');
console.log('%cMonetization: Amazon Associates + Affiliatematic', 'font-size: 12px; color: #64748b;');