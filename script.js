// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initMenuCategories();
    initMenuSectionObserver();
    initContactForm();
    initScrollEffects();
    initBackToTop();
    initGallery();
    initAnimations();
});

// Observe the menu section so animations replay whenever the user scrolls to it
function initMenuSectionObserver() {
    const menuSection = document.getElementById('menu');
    if (!menuSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // animate the currently active category when the section becomes visible
                const activeBtn = document.querySelector('.category-btn.active') || document.querySelector('.category-btn');
                const category = activeBtn && activeBtn.getAttribute('data-category');
                const container = category && document.querySelector(`.menu-items[data-category="${category}"]`);
                if (container) {
                    // ensure container is visible
                    container.style.display = 'grid';
                    animateMenuItems(container);
                }
            } else {
                // clear animation classes so they can replay next time the section is visited
                document.querySelectorAll('.menu-items').forEach(items => {
                    items.querySelectorAll('.menu-item').forEach(item => {
                        item.classList.remove('anim-fade-scale', 'anim-slide-up', 'anim-pop', 'anim-flip', 'anim-zoom-in');
                        item.style.animationDelay = '';
                    });
                });
            }
        });
    }, { threshold: 0.15 });

    observer.observe(menuSection);
}

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Active navigation link based on scroll position
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Menu category filtering
function initMenuCategories() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const menuItems = document.querySelectorAll('.menu-items');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide menu items with animation
            menuItems.forEach(items => {
                if (items.getAttribute('data-category') === category) {
                    // make visible before animating
                    items.style.display = 'grid';
                    animateMenuItems(items);
                } else {
                    // clear animations on hidden categories so they restart next time
                    const hidden = items.querySelectorAll('.menu-item');
                    hidden.forEach(h => {
                        h.classList.remove('anim-fade-scale', 'anim-slide-up', 'anim-pop', 'anim-flip', 'anim-zoom-in');
                        h.style.animationDelay = '';
                        h.style.animationName = '';
                    });
                    items.style.display = 'none';
                }
            });
        });
    });
}

// Animate menu items when category changes
function animateMenuItems(container) {
    const items = container.querySelectorAll('.menu-item');

    // Determine animation type from the category button (fallback to fade-scale)
    const category = container.getAttribute('data-category');
    const categoryBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
    const animation = (categoryBtn && categoryBtn.getAttribute('data-animation')) || 'fade-scale';
    items.forEach((item, index) => {
        // Remove any previous animation state and scroll-triggered class that may pin opacity/transform
        item.classList.remove('anim-fade-scale', 'anim-slide-up', 'anim-pop', 'anim-flip', 'anim-zoom-in', 'animate');
        item.style.opacity = '';
        item.style.transform = '';
        item.style.transition = '';
        item.style.animationDelay = '';

        // Small timeout to ensure DOM update (helps in some browsers)
        setTimeout(() => {
            // set staggered delay per item
            item.style.animationDelay = `${index * 100}ms`;

            // force reflow so re-adding the class restarts the animation
            void item.offsetWidth;

            const animClass = `anim-${animation}`;
            item.classList.add(animClass);

            // Cleanup after animation so it can replay next time
            const onEnd = (e) => {
                // only respond to the animation on the element itself
                if (e.target !== item) return;
                item.classList.remove(animClass);
                item.style.animationDelay = '';
                item.removeEventListener('animationend', onEnd);
            };

            item.addEventListener('animationend', onEnd);
        }, 20);
    });
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Validate form
            if (!name || !email || !message) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // Reset form
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Show success message
                showToast('Thank you for your message! We\'ll get back to you soon.', 'success');
            }, 2000);
        });
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Scroll effects
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        
        // Add shadow to navbar when scrolled
        if (scrollTop > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Back to top button
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Gallery functionality
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Create lightbox effect
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="close-lightbox">&times;</span>
                    <div class="lightbox-image">
                        ${this.innerHTML}
                    </div>
                </div>
            `;
            
            document.body.appendChild(lightbox);
            
            // Add lightbox styles
            const style = document.createElement('style');
            style.textContent = `
                .lightbox {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    opacity: 0;
                    animation: fadeIn 0.3s forwards;
                }
                
                .lightbox-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 15px;
                    max-width: 500px;
                    text-align: center;
                    position: relative;
                    transform: scale(0.8);
                    animation: scaleIn 0.3s forwards;
                }
                
                .close-lightbox {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 2rem;
                    cursor: pointer;
                    color: var(--text-dark);
                }
                
                .lightbox-image i {
                    font-size: 5rem;
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                }
                
                @keyframes fadeIn {
                    to { opacity: 1; }
                }
                
                @keyframes scaleIn {
                    to { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
            
            // Close lightbox
            const closeBtn = lightbox.querySelector('.close-lightbox');
            closeBtn.addEventListener('click', function() {
                lightbox.remove();
                style.remove();
            });
            
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    lightbox.remove();
                    style.remove();
                }
            });
        });
    });
}

// Animation on scroll
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .menu-item, .gallery-item, .stat');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        .animate {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// Toast notification system
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add typing effect to hero title
function typeWriter() {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        function type() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(type, 50);
            }
        }
        
        setTimeout(type, 500);
    }
}

// Initialize typing effect
typeWriter();

// Add hover effect to menu items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    
    if (heroContent && heroImage) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Add loading animation for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.classList.add('loaded');
    });
});

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.stat h3');
    const speed = 200;
    
    counters.forEach(counter => {
        const animate = () => {
            const value = +counter.getAttribute('data-count');
            const data = +counter.innerText;
            const time = value / speed;
            
            if (data < value) {
                counter.innerText = Math.ceil(data + time);
                setTimeout(animate, 1);
            } else {
                counter.innerText = value + (counter.innerText.includes('+') ? '+' : '');
            }
        };
        
        // Store original value
        if (!counter.getAttribute('data-count')) {
            counter.setAttribute('data-count', counter.innerText.replace(/[^\d]/g, ''));
        }
    });
}

// Initialize counter animation when stats section is visible
const statsSection = document.querySelector('.about-stats');
if (statsSection) {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(statsSection);
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close lightbox if open
        const lightbox = document.querySelector('.lightbox');
        if (lightbox) {
            lightbox.remove();
        }
        
        // Close mobile menu if open
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});

// Performance optimization - Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
window.addEventListener('scroll', debounce(function() {
    // Scroll-related functions here
}, 10));

// Add print styles
const printStyles = document.createElement('style');
printStyles.textContent = `
    @media print {
        .navbar, .back-to-top, .hamburger {
            display: none !important;
        }
        
        .hero {
            min-height: auto;
            padding: 2rem 0;
        }
        
        .section-header {
            page-break-after: avoid;
        }
        
        .menu-item, .feature-card, .gallery-item {
            page-break-inside: avoid;
        }
    }
`;
document.head.appendChild(printStyles);