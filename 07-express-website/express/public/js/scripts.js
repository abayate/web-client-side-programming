document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('h1');
    if (title) {
        title.setAttribute('data-loaded', 'true');
    }

    console.log('Page loaded successfully.');
});