// StudyPilot client. All study data lives in the browser (localStorage) and is
// sent to the server with each request; the server runs the agent and returns
// the updated state plus a trace of the tools it called.

const $ = (s) => document.querySelector(s);
const STORE = 'studypilot.v1';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const empty = () => ({ deadlines: [], plan: null, proposal: null, quiz: null, quizHistory: [], chat: [] });
let state = load();
let attachment = null; // { name, text } or { name, mimeType, data }
let busy = false;

function load() {
  try { return { ...empty(), ...JSON.parse(localStorage.getItem(STORE)) }; } catch { return empty(); }
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* storage full or blocked */ }
}

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function prettyDate(iso, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', opts);
}
function daysUntil(iso) {
  return Math.round((new Date(iso + 'T12:00:00') - new Date(todayISO() + 'T12:00:00')) / 86400000);
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Tiny Markdown subset: bold, italics, inline code, bullet and numbered lists, paragraphs.
function md(text) {
  const inline = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  const out = [];
  let list = null;
  for (const line of String(text).split('\n')) {
    const m = line.match(/^\s*([-*•]|\d+\.)\s+(.*)$/);
    if (m) {
      const tag = /\d/.test(m[1]) ? 'ol' : 'ul';
      if (list !== tag) { if (list) out.push(`</${list}>`); out.push(`<${tag}>`); list = tag; }
      out.push(`<li>${inline(m[2])}</li>`);
      continue;
    }
    if (list) { out.push(`</${list}>`); list = null; }
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) out.push(`<p><strong>${inline(h[1])}</strong></p>`);
    else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push(`</${list}>`);
  return out.join('');
}

/* ---------- chat ---------- */

const TOOL_LABELS = {
  get_status: 'Read your data',
  save_deadlines: 'Saved deadlines',
  update_deadline: 'Updated a deadline',
  propose_study_plan: 'Built a plan',
  create_quiz: 'Wrote a quiz',
};

function renderChat() {
  const box = $('#messages');
  if (!state.chat.length) {
    box.innerHTML = `<div class="welcome">
      <h2>Hi, I'm StudyPilot.</h2>
      <p>Give me a syllabus (paste it, attach a PDF, or try the sample) and I'll pull out every deadline, build a day-by-day study plan, quiz you, and re-plan when a topic needs more work.</p>
      <ol><li>Use the sample syllabus</li><li>Tell me how many hours a day you can study</li><li>Accept the plan, then ask for a quiz</li></ol>
    </div>`;
    return;
  }
  box.innerHTML = state.chat.map((m) => {
    const trace = m.trace?.length
      ? `<div class="trace" aria-label="Tools the agent used">${m.trace.map((t) => `<span class="chip ${t.ok ? '' : 'bad'}" title="${esc(JSON.stringify(t.args))}">${esc(TOOL_LABELS[t.tool] || t.tool)}</span>`).join('')}</div>`
      : '';
    const att = m.attachment ? `<div class="att">📎 ${esc(m.attachment)}</div>` : '';
    const body = m.role === 'model' ? md(m.text) : `<p>${esc(m.text)}</p>`;
    return `<div class="msg ${m.role} ${m.error ? 'error' : ''}">${trace}${att}${body}</div>`;
  }).join('') + (busy ? '<div class="msg model thinking"><span></span><span></span><span></span></div>' : '');
  box.scrollTop = box.scrollHeight;
}

async function send(text) {
  if (busy) return;
  const message = text.trim();
  if (!message && !attachment) return;

  const syllabus = attachment;
  const history = state.chat.filter((m) => !m.error).slice(-12).map((m) => ({ role: m.role, text: m.text }));
  state.chat.push({ role: 'user', text: message || 'Here is my syllabus.', attachment: syllabus?.name });
  clearAttachment();
  busy = true;
  $('#send').disabled = true;
  renderChat();

  try {
    const { chat, ...data } = state;
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, syllabus, state: data, today: todayISO() }),
    });
    const out = await res.json();
    if (!res.ok) throw new Error(out.error || `HTTP ${res.status}`);
    const hadQuiz = state.quiz?.id;
    Object.assign(state, out.state);
    state.chat.push({ role: 'model', text: out.reply, trace: out.trace });
    if (out.trace.some((t) => t.tool === 'propose_study_plan' && t.ok)) showTab('plan');
    else if (state.quiz && state.quiz.id !== hadQuiz) showTab('quiz');
    else if (out.trace.some((t) => t.tool === 'save_deadlines' && t.ok)) showTab('deadlines');
  } catch (e) {
    state.chat.push({ role: 'model', text: `⚠️ ${e.message}`, error: true });
  } finally {
    busy = false;
    $('#send').disabled = false;
    save();
    renderAll();
  }
}

/* ---------- attachments ---------- */

function setAttachment(a) {
  attachment = a;
  $('#attachment').hidden = false;
  $('#attachName').textContent = `📎 ${a.name}`;
}
function clearAttachment() {
  attachment = null;
  $('#attachment').hidden = true;
  $('#file').value = '';
}

$('#file').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 4 * 1024 * 1024) { alertInChat('That file is over 4 MB. Try a smaller PDF or paste the text.'); return; }
  const reader = new FileReader();
  if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
    reader.onload = () => setAttachment({ name: f.name, mimeType: 'application/pdf', data: reader.result.split(',')[1] });
    reader.readAsDataURL(f);
  } else {
    reader.onload = () => setAttachment({ name: f.name, text: reader.result });
    reader.readAsText(f);
  }
});
$('#clearAttach').addEventListener('click', clearAttachment);
$('#sample').addEventListener('click', () => {
  setAttachment({ name: 'sample-syllabus.txt', text: window.sampleSyllabus() });
  $('#input').value = 'Here are my syllabi for this semester. Pull out all the deadlines.';
  $('#input').focus();
});

function alertInChat(text) {
  state.chat.push({ role: 'model', text: `⚠️ ${text}`, error: true });
  renderChat();
}

/* ---------- deadlines ---------- */

function renderDeadlines() {
  const pane = $('#tab-deadlines');
  const list = state.deadlines;
  $('#countDeadlines').textContent = list.filter((d) => !d.done).length;
  if (!list.length) { pane.innerHTML = '<p class="muted pad">No deadlines yet. Share a syllabus in the chat.</p>'; return; }

  pane.innerHTML = `<ul class="deadlines">${list.map((d) => {
    const n = daysUntil(d.due);
    const when = n < 0 ? `${-n}d ago` : n === 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n}d`;
    const urgent = !d.done && n >= 0 && n <= 3 ? 'urgent' : '';
    return `<li class="deadline ${d.done ? 'done' : ''} ${urgent}">
      <label class="check"><input type="checkbox" data-done="${esc(d.id)}" ${d.done ? 'checked' : ''} aria-label="Mark done"></label>
      <div class="dl-main">
        <div class="dl-title">${esc(d.title)}</div>
        <div class="dl-meta"><span class="tag t-${esc(d.type)}">${esc(d.type)}</span> ${esc(d.course)}${d.weight ? ` · ${d.weight}%` : ''}${d.topics ? ` · <span class="muted">${esc(d.topics)}</span>` : ''}</div>
      </div>
      <div class="dl-date"><strong>${prettyDate(d.due)}</strong><span>${when}</span></div>
      <button class="icon" data-del="${esc(d.id)}" aria-label="Delete ${esc(d.title)}">×</button>
    </li>`;
  }).join('')}</ul>`;
}

$('#tab-deadlines').addEventListener('click', (e) => {
  const del = e.target.closest('[data-del]');
  if (del) { state.deadlines = state.deadlines.filter((d) => d.id !== del.dataset.del); save(); renderAll(); }
});
$('#tab-deadlines').addEventListener('change', (e) => {
  const id = e.target.dataset.done;
  const d = state.deadlines.find((x) => x.id === id);
  if (d) { d.done = e.target.checked; save(); renderAll(); }
});

/* ---------- plan ---------- */

function planHTML(plan) {
  const byDay = {};
  for (const b of plan.blocks) (byDay[b.date] ||= []).push(b);
  const days = Object.keys(byDay).sort();
  const deadlinesByDay = {};
  for (const d of state.deadlines.filter((x) => !x.done)) (deadlinesByDay[d.due] ||= []).push(d);

  const warn = plan.warnings?.length ? `<div class="warnings">${plan.warnings.map((w) => `<p>⚠️ ${esc(w)}</p>`).join('')}</div>` : '';
  const skip = plan.skipWeekdays?.length ? ` · off: ${plan.skipWeekdays.map((n) => WEEKDAYS[n]).join(', ')}` : '';
  return `<div class="plan-meta">${plan.totalHours}h over ${days.length} days · ${plan.hoursPerDay}h/day${skip}</div>${warn}
    <div class="days">${days.map((day) => `
      <div class="day ${day === todayISO() ? 'today' : ''}">
        <div class="day-head">${prettyDate(day)}${day === todayISO() ? ' <span class="tag">today</span>' : ''}</div>
        ${byDay[day].map((b) => `<div class="block t-${esc(b.type)}"><span class="hrs">${b.hours}h</span><span class="b-title">${esc(b.title)}</span><span class="b-course">${esc(b.course)}${b.boosted ? ' · <strong>extra review</strong>' : ''}</span></div>`).join('')}
        ${(deadlinesByDay[addDaysISO(day, 1)] || []).map((d) => `<div class="due-next">Due tomorrow: ${esc(d.title)}</div>`).join('')}
      </div>`).join('')}
    </div>`;
}

function addDaysISO(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function renderPlan() {
  const pane = $('#tab-plan');
  $('#planDot').hidden = !state.proposal;
  let html = '';
  if (state.proposal) {
    html += `<div class="proposal">
      <div class="proposal-head">
        <div><strong>Proposed plan</strong><p class="muted">${esc(state.proposal.note || 'The agent drafted this plan. Nothing changes until you accept it.')}</p></div>
        <div class="proposal-actions"><button class="primary" id="accept">Accept plan</button><button class="ghost" id="discard">Discard</button></div>
      </div>
      ${planHTML(state.proposal)}
    </div>`;
  }
  if (state.plan) html += `<h3 class="section">Current plan</h3>${planHTML(state.plan)}`;
  if (!html) html = '<p class="muted pad">No plan yet. Ask the agent: “Plan my studying, I have 2 hours a day and no Sundays.”</p>';
  pane.innerHTML = html;
}

$('#tab-plan').addEventListener('click', (e) => {
  if (e.target.id === 'accept') {
    state.plan = state.proposal;
    state.proposal = null;
    state.chat.push({ role: 'user', text: '✅ Accepted the proposed plan.' });
  } else if (e.target.id === 'discard') {
    state.proposal = null;
    state.chat.push({ role: 'user', text: '❌ Discarded the proposed plan.' });
  } else return;
  save();
  renderAll();
});

/* ---------- quiz ---------- */

function renderQuiz() {
  const pane = $('#tab-quiz');
  const q = state.quiz;
  $('#quizDot').hidden = !q || q.submitted;
  const history = state.quizHistory.length
    ? `<h3 class="section">Quiz history</h3><ul class="history">${state.quizHistory.slice().reverse().map((h) => {
        const pct = Math.round((h.score / h.total) * 100);
        return `<li><span>${esc(h.topic)}</span><span class="score ${pct < 70 ? 'low' : ''}">${h.score}/${h.total} · ${pct}%</span></li>`;
      }).join('')}</ul>`
    : '';
  if (!q) { pane.innerHTML = `<p class="muted pad">No quiz yet. Ask: “Quiz me on the midterm.”</p>${history}`; return; }

  pane.innerHTML = `<form id="quizForm" class="quiz">
    <div class="quiz-head"><strong>${esc(q.topic)}</strong>${q.course ? ` <span class="muted">· ${esc(q.course)}</span>` : ''}</div>
    ${q.questions.map((item, i) => `
      <fieldset class="question">
        <legend>${i + 1}. ${esc(item.q)}</legend>
        ${item.choices.map((c, j) => {
          let cls = '';
          if (q.submitted) cls = j === item.answer ? 'right' : q.answers[i] === j ? 'wrong' : '';
          return `<label class="choice ${cls}"><input type="radio" name="q${i}" value="${j}" ${q.answers?.[i] === j ? 'checked' : ''} ${q.submitted ? 'disabled' : ''}> ${esc(c)}</label>`;
        }).join('')}
        ${q.submitted ? `<p class="explain">${esc(item.explanation)}</p>` : ''}
      </fieldset>`).join('')}
    ${q.submitted
      ? `<div class="result">Score: <strong>${q.score}/${q.questions.length}</strong></div>`
      : '<button class="primary" type="submit">Submit answers</button>'}
  </form>${history}`;
}

$('#tab-quiz').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = state.quiz;
  const form = new FormData(e.target);
  q.answers = q.questions.map((_, i) => (form.get(`q${i}`) === null ? -1 : Number(form.get(`q${i}`))));
  if (q.answers.includes(-1)) { alertInChat('Answer every question before submitting.'); return; }
  q.score = q.questions.reduce((s, item, i) => s + (item.answer === q.answers[i] ? 1 : 0), 0);
  q.submitted = true;
  state.quizHistory.push({ quizId: q.id, deadlineId: q.deadlineId, topic: q.topic, score: q.score, total: q.questions.length, date: todayISO() });
  save();
  renderAll();

  const missed = q.questions.filter((item, i) => item.answer !== q.answers[i]).map((item) => item.q);
  const msg = `I finished the quiz on "${q.topic}" and scored ${q.score}/${q.questions.length}.` +
    (missed.length ? ` I missed: ${missed.map((m) => `"${m}"`).join('; ')}.` : '');
  send(msg);
});

/* ---------- tabs, composer, reset ---------- */

function showTab(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('.tabpane').forEach((p) => { p.hidden = p.id !== `tab-${name}`; });
}
document.querySelector('.tabs').addEventListener('click', (e) => {
  const t = e.target.closest('.tab');
  if (t) showTab(t.dataset.tab);
});

$('#composer').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('#input').value;
  $('#input').value = '';
  send(text);
});
$('#input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#composer').requestSubmit(); }
});
$('#reset').addEventListener('click', () => {
  if (!state.chat.length && !state.deadlines.length) return;
  if ($('#reset').dataset.armed) { state = empty(); save(); renderAll(); delete $('#reset').dataset.armed; $('#reset').textContent = 'Reset'; return; }
  $('#reset').dataset.armed = '1';
  $('#reset').textContent = 'Click again to clear';
  setTimeout(() => { delete $('#reset').dataset.armed; $('#reset').textContent = 'Reset'; }, 3000);
});

function renderAll() {
  renderChat();
  renderDeadlines();
  renderPlan();
  renderQuiz();
}
renderAll();
