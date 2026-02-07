// ===== DOM Elements =====
const header = document.querySelector('.header');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const backToTopBtn = document.querySelector('.back-to-top');
const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialNav = document.querySelector('.testimonial-nav');
const contactForm = document.querySelector('#contactForm');
const statNumbers = document.querySelectorAll('.stat-number');
const refreshContactsBtn = document.querySelector('#refreshContacts');
const contactsList = document.querySelector('#contactsList');

// ===== Mobile Menu Toggle =====
mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ===== Header Scroll Effect =====
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Add shadow and background on scroll
    if (currentScrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Show/hide back to top button
    if (currentScrollY > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }

    lastScrollY = currentScrollY;
});

// Back to top button click
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== Smooth Scroll for Navigation Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Counter Animation for Stats =====
const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += step;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
};

// Intersection Observer for counter animation
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    counterObserver.observe(stat);
});

// ===== Testimonials Slider =====
let currentTestimonial = 0;
const totalTestimonials = testimonialCards.length;

const showTestimonial = (index) => {
    testimonialCards.forEach((card, i) => {
        card.classList.remove('active');
        if (i === index) {
            card.classList.add('active');
        }
    });
};

const nextTestimonial = () => {
    currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
    showTestimonial(currentTestimonial);
};

const prevTestimonial = () => {
    currentTestimonial = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
    showTestimonial(currentTestimonial);
};

// Testimonial navigation buttons
if (testimonialNav) {
    const prevBtn = testimonialNav.querySelector('.prev');
    const nextBtn = testimonialNav.querySelector('.next');

    prevBtn.addEventListener('click', prevTestimonial);
    nextBtn.addEventListener('click', nextTestimonial);

    // Auto-advance testimonials every 5 seconds
    setInterval(nextTestimonial, 5000);
}

// ===== Contact Form Handling =====
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // Basic validation
    if (!data.name || !data.email || !data.service || !data.message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        // Submit to API
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            contactForm.reset();
            // Refresh contacts list if admin section is visible
            if (contactsList) {
                fetchContacts();
            }
        } else {
            throw new Error('Failed to submit');
        }
    } catch (error) {
        showNotification('Error submitting form. Please try again.', 'error');
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
});

// ===== Fetch and Display Contacts =====
async function fetchContacts() {
    try {
        const response = await fetch('/api/contacts');
        const result = await response.json();

        if (result.contacts.length === 0) {
            contactsList.innerHTML = '<p class="no-contacts">No contact submissions yet.</p>';
            return;
        }

        contactsList.innerHTML = result.contacts.map(contact => `
            <div class="contact-item" data-id="${contact.id}">
                <div class="contact-header">
                    <h4>${contact.name}</h4>
                    <span class="contact-date">${new Date(contact.submitted_at).toLocaleString()}</span>
                </div>
                <div class="contact-details">
                    <p><strong>Email:</strong> ${contact.email}</p>
                    <p><strong>Service:</strong> ${contact.service}</p>
                    <p><strong>Message:</strong> ${contact.message}</p>
                </div>
                <button class="delete-btn" onclick="deleteContact(${contact.id})">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        contactsList.innerHTML = '<p class="error-message">Error fetching contacts.</p>';
    }
}

// ===== Delete Contact =====
async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) {
        return;
    }

    try {
        const response = await fetch(`/api/contacts/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Contact deleted successfully.', 'success');
            fetchContacts();
        } else {
            throw new Error('Failed to delete');
        }
    } catch (error) {
        showNotification('Error deleting contact.', 'error');
    }
}

// Make deleteContact available globally
window.deleteContact = deleteContact;

// Refresh contacts button
if (refreshContactsBtn) {
    refreshContactsBtn.addEventListener('click', fetchContacts);
}

// ===== Notification System =====
const showNotification = (message, type) => {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: linear-gradient(135deg, #10b981, #059669);' : ''}
        ${type === 'error' ? 'background: linear-gradient(135deg, #ef4444, #dc2626);' : ''}
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

// ===== Scroll Animations for Sections =====
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .product-card, .about-content, .contact-info, .contact-form, .contact-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
};

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
    // Fetch contacts on page load if admin section exists
    if (contactsList) {
        fetchContacts();
    }
});

// ===== Service Card Hover Effects =====
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ===== Product Card Hover Effects =====
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ===== Lazy Loading for Images =====
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
        }
    });
}, {
    rootMargin: '50px 0px'
});

lazyImages.forEach(img => {
    imageObserver.observe(img);
});

// ===== Active Navigation Link Highlighting =====
const sections = document.querySelectorAll('section[id]');

const highlightNavLink = () => {
    const scrollY = window.scrollY;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
};

window.addEventListener('scroll', highlightNavLink);

// ===== Keyboard Navigation for Accessibility =====
document.addEventListener('keydown', (e) => {
    // Close mobile menu on Escape
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
    }

    // Keyboard navigation for testimonials
    if (e.key === 'ArrowLeft' && testimonialNav) {
        prevTestimonial();
    }
    if (e.key === 'ArrowRight' && testimonialNav) {
        nextTestimonial();
    }
});

// ===== Preload Critical Resources =====
const preloadResources = () => {
    // Preload fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    fontLink.as = 'style';
    document.head.appendChild(fontLink);
};

// Initialize preloading
preloadResources();

console.log('GreyCells Tech Consulting website initialized successfully!');
