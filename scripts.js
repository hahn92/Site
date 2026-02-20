// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80, // Adjust for fixed nav
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for fade-up animations
document.addEventListener('DOMContentLoaded', () => {
    // Agregamos la clase fade-up a las secciones y tarjetas que no lo tengan
    const animatedElements = document.querySelectorAll('section, .project-card, .hobby-item, .contact-content');
    animatedElements.forEach(el => {
        if (!el.classList.contains('fade-up') && !el.classList.contains('hero')) {
            el.classList.add('fade-up');
        }
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Solo animar una vez
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // Animar hero al cargar
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.classList.add('fade-up', 'visible');
        }
    }, 100);
});
