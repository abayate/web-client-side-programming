// Voldemort Website - Client-side JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('🖤 Voldemort Website Loaded');
    console.log('Welcome to the Dark Lord Archive');

    // Add active class to current nav link
    highlightCurrentPage();

    // Add smooth scrolling
    addSmoothScrolling();
});

/**
 * Highlights the current page in the navigation
 */
function highlightCurrentPage() {
    const navLinks = document.querySelectorAll('nav a');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.style.backgroundColor = '#8b0000';
            link.style.color = '#d4af37';
        }
    });
}

/**
 * Adds smooth scrolling behavior to the page
 */
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Loads Voldemort facts from the API and displays them
 */
function loadFacts() {
    const factsContainer = document.getElementById('facts-container');

    if (!factsContainer) return;

    // Show loading state
    factsContainer.innerHTML = '<p>Loading facts...</p>';
    factsContainer.style.display = 'block';

    // Fetch facts from API
    fetch('/api/facts')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load facts');
            }
            return response.json();
        })
        .then(data => {
            displayFacts(data.facts);
        })
        .catch(error => {
            console.error('Error loading facts:', error);
            factsContainer.innerHTML = '<p style="color: red;">Failed to load facts. Please try again.</p>';
        });
}

/**
 * Displays facts in the container
 * @param {Array} facts - Array of fact strings
 */
function displayFacts(facts) {
    const factsContainer = document.getElementById('facts-container');

    if (!factsContainer) return;

    let html = '<h3>✨ Voldemort Facts ✨</h3><ul>';

    facts.forEach((fact, index) => {
        html += `<li>${index + 1}. ${fact}</li>`;
    });

    html += '</ul>';

    factsContainer.innerHTML = html;

    // Add fade-in animation
    factsContainer.style.animation = 'fadeIn 0.5s ease-in';
}

/**
 * Handles page transitions with loading animation
 */
function handleNavigation(event) {
    // Prevent default link behavior if needed
    console.log('Navigating to:', event.target.href);
}

/**
 * Logs page analytics
 */
function logPageView(pageName) {
    console.log(`📊 Page View: ${pageName}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`🔗 URL: ${window.location.href}`);
}

/**
 * Adds click tracking to all links
 */
function setupClickTracking() {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            console.log(`🔗 Link clicked: ${this.textContent} -> ${this.href}`);
        });
    });
}

/**
 * Initializes custom events for the page
 */
function initializeEvents() {
    // Log current page view
    const pageTitle = document.querySelector('header h1')?.textContent || 'Unknown';
    logPageView(pageTitle);

    // Setup click tracking
    setupClickTracking();
}

/**
 * Dark mode toggle (optional feature)
 */
function toggleDarkMode() {
    const body = document.body;
    body.style.filter = body.style.filter === 'invert(1)' ? 'invert(0)' : 'invert(1)';
    console.log('Dark mode toggled');
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (event) => {
    // Press 'H' for Home
    if (event.key.toLowerCase() === 'h') {
        window.location.href = '/';
    }
    // Press 'A' for About
    if (event.key.toLowerCase() === 'a') {
        window.location.href = '/about';
    }
    // Press 'T' for History
    if (event.key.toLowerCase() === 't') {
        window.location.href = '/history';
    }
    // Press 'E' for Achievements
    if (event.key.toLowerCase() === 'e') {
        window.location.href = '/achievements';
    }
});

/**
 * Welcome message
 */
console.log(`
╔════════════════════════════════════════════╗
║   🖤 VOLDEMORT WEBSITE 🖤                  ║
║   Dark Lord Archive                        ║
╚════════════════════════════════════════════╝

📱 Keyboard Shortcuts:
   H - Home
   A - About
   T - History
   E - Achievements

🔗 Available Routes:
   / - Home
   /about - About Voldemort
   /history - History
   /achievements - Achievements
   /api/facts - Get facts (JSON)

💡 Tips:
   - Use loadFacts() in console to load Voldemort facts
   - Use toggleDarkMode() for dark mode
   - Check the Network tab for API calls
`);

// Initialize events on page load
initializeEvents();
