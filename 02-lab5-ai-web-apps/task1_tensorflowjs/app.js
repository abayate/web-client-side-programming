// Lab 5 - Task 1: client-side image classification with TensorFlow.js + MobileNet.
// The model is loaded once and reused for every image the user classifies.

const SAMPLE_IMAGE = 'img/labrador.jpg';

let model = null;
let activeObjectUrl = null; // tracked so we can revoke it and not leak memory

const imgElement = document.getElementById('subject-image');
const listElement = document.getElementById('prediction-list');
const statusElement = document.getElementById('model-status');
const timingElement = document.getElementById('timing');
const uploadBtn = document.getElementById('upload-btn');
const resetBtn = document.getElementById('reset-btn');
const fileInput = document.getElementById('file-input');

// Replace the prediction list with a single message (used for loading/error states).
function showMessage(text, className = 'placeholder') {
    listElement.innerHTML = '';
    const li = document.createElement('li');
    li.className = className;
    li.textContent = text;
    listElement.appendChild(li);
}

function setStatus(text, variant) {
    statusElement.textContent = text;
    statusElement.className = `badge badge-${variant}`;
}

async function loadModel() {
    try {
        console.log('Loading MobileNet model...');
        model = await mobilenet.load();
        console.log('Model loaded successfully!');
        setStatus('Model ready', 'ready');
        uploadBtn.disabled = false;
        classifyCurrentImage();
    } catch (error) {
        console.error('Error loading MobileNet:', error);
        setStatus('Model failed to load', 'error');
        showMessage('Could not load MobileNet. Check your internet connection.', 'error-text');
    }
}

// Classify whatever is currently in the <img> element and render the top 3 guesses.
async function classifyCurrentImage() {
    if (!model) {
        showMessage('Model is still loading...');
        return;
    }

    showMessage('Analyzing image...');
    timingElement.textContent = '';

    try {
        const start = performance.now();
        const predictions = await model.classify(imgElement, 3);
        const elapsed = performance.now() - start;
        console.log('Predictions:', predictions);

        if (!predictions.length) {
            showMessage('No predictions returned for this image.');
            return;
        }

        listElement.innerHTML = '';
        predictions.forEach((pred) => {
            const percent = pred.probability * 100;
            const li = document.createElement('li');

            const label = document.createElement('span');
            label.className = 'label';
            label.textContent = pred.className;

            const bar = document.createElement('span');
            bar.className = 'bar';
            const fill = document.createElement('span');
            fill.className = 'bar-fill';
            fill.style.width = `${percent.toFixed(2)}%`;
            bar.appendChild(fill);

            const value = document.createElement('span');
            value.className = 'value';
            value.textContent = `${percent.toFixed(2)}%`;

            li.append(label, bar, value);
            listElement.appendChild(li);
        });

        timingElement.textContent = `Classified in ${elapsed.toFixed(0)} ms, entirely in the browser.`;
    } catch (error) {
        console.error('Error during classification:', error);
        showMessage('Something went wrong while classifying this image.', 'error-text');
    }
}

// Swap the displayed image, then classify once the new pixels are actually decoded.
// decode() avoids the classic bug where a cached image fires `load` before the
// handler is attached and the classification silently never runs.
async function showAndClassify(src) {
    imgElement.src = src;
    try {
        await imgElement.decode();
    } catch (error) {
        console.warn('decode() failed, falling back to the load event:', error);
        await new Promise((resolve) => { imgElement.onload = resolve; });
    }
    await classifyCurrentImage();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (jpg, png, gif, webp).');
        fileInput.value = '';
        return;
    }

    if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = URL.createObjectURL(file);

    imgElement.alt = `Uploaded image: ${file.name}`;
    showAndClassify(activeObjectUrl);

    // Reset the input so picking the same file twice still fires `change`.
    fileInput.value = '';
}

function resetToSample() {
    if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
        activeObjectUrl = null;
    }
    imgElement.alt = 'The image currently being classified';
    showAndClassify(SAMPLE_IMAGE);
}

uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);
resetBtn.addEventListener('click', resetToSample);

loadModel();
