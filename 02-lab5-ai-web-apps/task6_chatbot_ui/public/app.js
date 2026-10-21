// Lab 5 - Task 6: front-end logic for the resume analyzer.
// Talks to the Node backend over fetch. No API key is ever present in the browser.

const uploadView = document.getElementById('upload-view');
const loadingView = document.getElementById('loading-view');
const resultsView = document.getElementById('results-view');

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const fileChosen = document.getElementById('file-chosen');
const roleInput = document.getElementById('role-input');
const uploadForm = document.getElementById('upload-form');
const analyzeBtn = document.getElementById('analyze-btn');
const uploadError = document.getElementById('upload-error');
const newUploadBtn = document.getElementById('new-upload-btn');

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatLog = document.getElementById('chat-log');
const suggestions = document.getElementById('suggestions');

let selectedFile = null;
let sessionId = null;

// --- view switching ---

function showView(view) {
    uploadView.hidden = view !== 'upload';
    loadingView.hidden = view !== 'loading';
    resultsView.hidden = view !== 'results';
}

function showError(message) {
    uploadError.textContent = message;
    uploadError.hidden = false;
}

function clearError() {
    uploadError.hidden = true;
}

// --- file selection ---

function acceptFile(file) {
    if (!file) return;

    if (file.type !== 'application/pdf') {
        showError('Please choose a PDF file. Word documents and images are not supported.');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        showError('That file is larger than the 10 MB limit.');
        return;
    }

    clearError();
    selectedFile = file;
    fileChosen.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
    fileChosen.hidden = false;
    analyzeBtn.disabled = false;
}

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInput.click();
    }
});

fileInput.addEventListener('change', (event) => acceptFile(event.target.files[0]));

['dragenter', 'dragover'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.remove('dragover');
    });
});

dropzone.addEventListener('drop', (event) => {
    acceptFile(event.dataTransfer.files[0]);
});

// --- fake-but-honest progress ticker for the loading view ---
// The backend does not stream progress, so these advance on a timer that roughly
// matches how long each stage actually takes.
let stepTimers = [];

function runLoadingSteps() {
    const steps = [...loadingView.querySelectorAll('.steps li')];
    steps.forEach((li) => li.classList.remove('active', 'done'));
    stepTimers.forEach(clearTimeout);
    stepTimers = [];

    const delays = [0, 1200, 3200, 9000];
    steps.forEach((li, index) => {
        stepTimers.push(setTimeout(() => {
            steps.slice(0, index).forEach((prev) => {
                prev.classList.remove('active');
                prev.classList.add('done');
            });
            li.classList.add('active');
        }, delays[index]));
    });
}

// --- submit ---

uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!selectedFile) return;

    clearError();
    showView('loading');
    runLoadingSteps();

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('role', roleInput.value.trim() || 'a mid-level front-end engineer');

    try {
        const response = await fetch('/api/analyze', { method: 'POST', body: formData });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || `Server returned ${response.status}`);

        sessionId = data.sessionId;
        renderResults(data);
        showView('results');
    } catch (error) {
        stepTimers.forEach(clearTimeout);
        showView('upload');
        showError(error.message);
    }
});

newUploadBtn.addEventListener('click', () => {
    selectedFile = null;
    sessionId = null;
    fileInput.value = '';
    fileChosen.hidden = true;
    analyzeBtn.disabled = true;
    chatLog.innerHTML = '';
    suggestions.hidden = false;
    clearError();
    showView('upload');
});

// --- rendering ---

// Minimal markdown: **bold** plus paragraph breaks. Everything is inserted as text
// nodes or through a whitelist, so model output can never inject HTML.
function renderProse(container, text) {
    container.innerHTML = '';
    text.split(/\n{2,}/).forEach((block) => {
        const p = document.createElement('p');
        const parts = block.split(/\*\*(.+?)\*\*/g);
        parts.forEach((part, index) => {
            if (index % 2 === 1) {
                const strong = document.createElement('strong');
                strong.textContent = part;
                p.appendChild(strong);
            } else if (part) {
                p.appendChild(document.createTextNode(part));
            }
        });
        container.appendChild(p);
    });
}

function renderFacts(facts) {
    const dl = document.getElementById('out-facts');
    const card = document.getElementById('facts-card');
    dl.innerHTML = '';

    if (!facts) {
        card.hidden = true;
        return;
    }
    card.hidden = false;

    const rows = [
        ['Name', facts.name],
        ['Current title', facts.current_title],
        ['Years of experience', facts.years_of_experience],
        ['Education', facts.education_status],
        ['Top skills', facts.top_skills],
        ['Employers', facts.employers],
        ['Quantified achievements', facts.quantified_achievements],
    ];

    for (const [label, value] of rows) {
        const isEmptyArray = Array.isArray(value) && value.length === 0;
        if (value === null || value === undefined || value === '' || isEmptyArray) continue;

        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');

        if (Array.isArray(value) && label === 'Quantified achievements') {
            const ul = document.createElement('ul');
            value.forEach((item) => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            dd.appendChild(ul);
        } else if (Array.isArray(value)) {
            const row = document.createElement('div');
            row.className = 'pill-row';
            value.forEach((item) => {
                const span = document.createElement('span');
                span.className = 'pill';
                span.textContent = item;
                row.appendChild(span);
            });
            dd.appendChild(row);
        } else {
            dd.textContent = String(value);
        }

        dl.append(dt, dd);
    }
}

function renderResults(data) {
    document.getElementById('result-filename').textContent = data.meta.filename;
    document.getElementById('result-meta').textContent =
        `${data.meta.pageCount} page(s) · ${data.meta.charCount.toLocaleString()} characters · ` +
        `${data.meta.chunkCount} chunks · retriever k=${data.meta.k} · ` +
        `analyzed in ${(data.meta.elapsedMs / 1000).toFixed(1)}s · role: ${data.meta.role}`;

    document.getElementById('out-recommendation').textContent = data.recommendation;
    renderProse(document.getElementById('out-praise'), data.praise);
    renderProse(document.getElementById('out-critique'), data.critique);
    renderFacts(data.facts);
}

// --- chat ---

function addMessage(text, variant) {
    const div = document.createElement('div');
    div.className = `msg msg-${variant}`;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div;
}

async function ask(question) {
    if (!question || !sessionId) return;

    suggestions.hidden = true;
    addMessage(question, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    chatSend.disabled = true;

    const typing = addMessage('Thinking…', 'bot msg-typing');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, question }),
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || `Server returned ${response.status}`);

        typing.classList.remove('msg-typing');
        typing.textContent = data.answer;
    } catch (error) {
        typing.classList.remove('msg-typing');
        typing.classList.add('msg-error');
        typing.textContent = error.message;
    } finally {
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.focus();
        chatLog.scrollTop = chatLog.scrollHeight;
    }
}

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(chatInput.value.trim());
});

suggestions.addEventListener('click', (event) => {
    if (event.target.classList.contains('chip')) {
        ask(event.target.textContent.trim());
    }
});
