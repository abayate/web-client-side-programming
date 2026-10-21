// Anthony Bayate - personal site
// Week 1 AS2. Plain JavaScript, no libraries.

// --- current year in the footer -------------------------------------------

document.getElementById('year').textContent = new Date().getFullYear();

// --- mobile navigation -----------------------------------------------------

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

function closeMenu() {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
}

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

// Tapping a link should close the overlay, otherwise it covers the section you jumped to.
navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
});

// --- dark mode -------------------------------------------------------------
// Respects the OS setting on a first visit, then remembers whatever the user picks.

const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
}

applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
});

// --- shrink the nav bar once the page scrolls ------------------------------

const nav = document.getElementById('nav');

window.addEventListener(
    'scroll',
    () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    },
    { passive: true }
);

// --- reveal sections as they scroll into view ------------------------------

const revealables = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (!entry.isIntersecting) return;
                // Small stagger so a row of cards animates in sequence, not all at once.
                setTimeout(() => entry.target.classList.add('visible'), index * 80);
                revealObserver.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealables.forEach((element) => revealObserver.observe(element));
} else {
    // Older browsers: just show everything rather than leaving the page blank.
    revealables.forEach((element) => element.classList.add('visible'));
}

// --- highlight the nav link for the section you're looking at --------------

const sections = document.querySelectorAll('main section[id]');
const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

if ('IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navAnchors.forEach((anchor) => {
                    anchor.classList.toggle(
                        'active',
                        anchor.getAttribute('href') === `#${entry.target.id}`
                    );
                });
            });
        },
        { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((section) => spyObserver.observe(section));
}
