// ─────────────────────────────────────────────
// GeneLife App — Auth + Quiz + Results + CRUD + Progress
// ─────────────────────────────────────────────

const API = "";

// ── State ──
let currentQuestionIndex = 0;
const userAnswers = [];
let currentUser = null;
let allResults = [];          // cache for history + progress
let editingResultId = null;   // which result is being edited
let progressChart = null;     // Chart.js instance

// ── DOM ──
const authScreen     = document.getElementById('auth-screen');
const welcomeScreen  = document.getElementById('welcome-screen');
const quizScreen     = document.getElementById('quiz-screen');
const resultsScreen  = document.getElementById('results-screen');
const questionContainer  = document.getElementById('question-container');
const progressFill       = document.getElementById('progress-fill');
const currentQuestionNum = document.getElementById('current-question');
const totalQuestionsNum  = document.getElementById('total-questions');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

function switchTab(tab) {
    document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('tab-login').classList.toggle('active',    tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('login-error').textContent    = '';
    document.getElementById('register-error').textContent = '';
}

async function handleLogin() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    errEl.textContent = '';
    if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
    try {
        const res  = await fetch(`${API}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) { errEl.textContent = data.error; return; }
        saveSession(data.token, data.name);
        enterApp(data.name);
    } catch { errEl.textContent = 'Server error. Is Flask running?'; }
}

async function handleRegister() {
    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const errEl    = document.getElementById('register-error');
    errEl.textContent = '';
    if (!name || !email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
    try {
        const res  = await fetch(`${API}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) { errEl.textContent = data.error; return; }
        saveSession(data.token, data.name);
        enterApp(data.name);
    } catch { errEl.textContent = 'Server error. Is Flask running?'; }
}

function saveSession(token, name) {
    localStorage.setItem('gl_token', token);
    localStorage.setItem('gl_name', name);
    currentUser = name;
}

function getToken() { return localStorage.getItem('gl_token'); }

function logout() {
    localStorage.removeItem('gl_token');
    localStorage.removeItem('gl_name');
    currentUser = null;
    allResults = [];
    showScreen(authScreen);
}

function enterApp(name) {
    currentUser = name;
    document.getElementById('welcome-user-name').textContent = `👋 Hello, ${name}`;
    showScreen(welcomeScreen);
}

window.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    const name  = localStorage.getItem('gl_name');
    if (!token || !name) { showScreen(authScreen); return; }
    try {
        const res = await fetch(`${API}/api/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { enterApp(name); } else { logout(); }
    } catch { logout(); }
});

// ─────────────────────────────────────────────
// Screen Helper
// ─────────────────────────────────────────────

function showScreen(el) {
    [authScreen, welcomeScreen, quizScreen, resultsScreen].forEach(s => s.classList.remove('active'));
    el.classList.add('active');
}

// ─────────────────────────────────────────────
// Quiz
// ─────────────────────────────────────────────

function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers.length = 0;
    totalQuestionsNum.textContent = questions.length;
    showScreen(quizScreen);
    showQuestion();
}

function restartQuiz() { showScreen(welcomeScreen); }

function showQuestion() {
    const question = questions[currentQuestionIndex];
    const progress = (currentQuestionIndex / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    currentQuestionNum.textContent = currentQuestionIndex + 1;

    let html = `<h2 class="question-text" style="margin-bottom: 20px; font-size: 24px; color: #19a3b6;">${question.question}</h2>
                <div class="options-container" style="display: flex; flex-direction: column; gap: 12px;">`;

    question.options.forEach((option, index) => {
        const isSelected = userAnswers[currentQuestionIndex]?.option.value === option.value;
        html += `
            <div class="option-item ${isSelected ? 'selected' : ''}"
                 onclick="selectOption(${index})"
                 style="padding: 15px; border: 2px solid ${isSelected ? '#1fa2b6' : '#eee'};
                        border-radius: 10px; cursor: pointer; transition: all 0.2s ease;
                        background: ${isSelected ? '#f0f9fa' : 'white'};">
                <span style="font-weight: 500;">${option.text}</span>
            </div>`;
    });

    html += `</div>`;
    questionContainer.innerHTML = html;
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next';
}

function selectOption(optionIndex) {
    const question = questions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = { questionId: question.id, option: question.options[optionIndex] };
    showQuestion();
}

function nextQuestion() {
    if (!userAnswers[currentQuestionIndex]) { alert("Please select an option to continue."); return; }
    if (currentQuestionIndex < questions.length - 1) { currentQuestionIndex++; showQuestion(); }
    else { showResults(); }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) { currentQuestionIndex--; showQuestion(); }
}

// ─────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────

async function showResults() {
    showScreen(resultsScreen);
    const riskLevels      = healthAnalyzer.calculateRiskScores(userAnswers);
    const recommendations = healthAnalyzer.generateRecommendations(riskLevels, userAnswers);
    const categoryDetails = healthAnalyzer.generateCategoryDetails(riskLevels, userAnswers);

    renderRiskScores(riskLevels);
    renderRecommendations(recommendations);
    renderCategoryBreakdown(categoryDetails);
    await saveResults(riskLevels, recommendations);
}

async function saveResults(riskLevels, recommendations) {
    const statusEl = document.getElementById('save-status');
    const token = getToken();
    if (!token) return;
    try {
        const res = await fetch(`${API}/api/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ riskLevels, recommendations })
        });
        if (res.ok) {
            statusEl.textContent = '✓ Results saved to your account';
            allResults = []; // invalidate cache
        }
    } catch { statusEl.textContent = ''; }
}

function renderRiskScores(riskLevels) {
    const container = document.getElementById('risk-scores');
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-top: 15px;">';
    for (const [category, data] of Object.entries(riskLevels)) {
        const color = data.level === 'high' ? '#e74c3c' : (data.level === 'moderate' ? '#f39c12' : '#27ae60');
        html += `
            <div style="background: white; padding: 15px; border-radius: 10px; border-top: 5px solid ${color};">
                <p style="text-transform: capitalize; font-size: 12px; color: #666; margin: 0;">${category}</p>
                <h3 style="margin: 5px 0; color: ${color};">${data.level.toUpperCase()}</h3>
                <div style="height: 6px; background: #eee; border-radius: 3px;">
                    <div style="width: ${data.percentage}%; height: 100%; background: ${color}; border-radius: 3px;"></div>
                </div>
            </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

function renderRecommendations(recommendations) {
    document.getElementById('recommendations-list').innerHTML = recommendations.map(rec => `
        <div style="text-align: left; background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px;
                    border-left: 5px solid ${rec.priority === 'high' ? '#e74c3c' : '#1fa2b6'}">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 24px;">${rec.icon}</span>
                <h3 style="margin: 0; color: #333;">${rec.title}</h3>
                <span style="margin-left: auto; font-size: 10px; padding: 3px 8px; border-radius: 10px;
                             background: #eee; text-transform: uppercase;">${rec.priority} Priority</span>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #555;">${rec.advice}</p>
        </div>`).join('');
}

function renderCategoryBreakdown(details) {
    let html = '';
    for (const [key, detail] of Object.entries(details)) {
        html += `
            <div style="text-align: left; margin-bottom: 20px;">
                <h4 style="text-transform: capitalize; color: #19a3b6; border-bottom: 1px solid #eee; padding-bottom: 5px;">${key} Analysis</h4>
                <p style="font-size: 14px; margin: 10px 0;">${detail.analysis}</p>
                <ul style="padding-left: 20px;">
                    ${detail.tips.map(tip => `<li style="font-size: 13px; color: #666; margin-bottom: 5px;">${tip}</li>`).join('')}
                </ul>
            </div>`;
    }
    document.getElementById('category-details').innerHTML = html;
}

// ─────────────────────────────────────────────
// Modal Controller
// ─────────────────────────────────────────────

async function openModal(tab = 'history') {
    document.getElementById('main-modal').style.display = 'flex';
    switchModalTab(tab);
}

function closeModal() {
    document.getElementById('main-modal').style.display = 'none';
}

function closeModalOnBackdrop(e) {
    if (e.target.id === 'main-modal') closeModal();
}

function switchModalTab(tab) {
    document.getElementById('modal-history-pane').style.display  = tab === 'history'  ? 'block' : 'none';
    document.getElementById('modal-progress-pane').style.display = tab === 'progress' ? 'block' : 'none';
    document.getElementById('modal-tab-history').classList.toggle('active',  tab === 'history');
    document.getElementById('modal-tab-progress').classList.toggle('active', tab === 'progress');

    if (tab === 'history')  loadHistory();
    if (tab === 'progress') loadProgress();
}

// ─────────────────────────────────────────────
// Fetch & Cache Results
// ─────────────────────────────────────────────

async function fetchResults() {
    if (allResults.length > 0) return allResults;
    try {
        const res = await fetch(`${API}/api/results`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
        allResults = await res.json();
    } catch { allResults = []; }
    return allResults;
}

// ─────────────────────────────────────────────
// History Tab — READ + DELETE + EDIT trigger
// ─────────────────────────────────────────────

async function loadHistory() {
    const listEl = document.getElementById('history-list');
    listEl.innerHTML = '<p style="text-align:center;color:#aaa;padding:20px 0;">Loading...</p>';

    const results = await fetchResults();

    if (!results.length) {
        listEl.innerHTML = '<p class="history-empty">No assessments yet. Take your first one!</p>';
        return;
    }

    // Show newest first in history view
    const sorted = [...results].reverse();

    listEl.innerHTML = sorted.map(r => {
        const date = new Date(r.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const chips = Object.entries(r.riskLevels).map(([cat, data]) =>
            `<span class="chip chip-${data.level}">${cat}: ${data.level}</span>`
        ).join('');
        const notesHtml = r.notes
            ? `<p class="history-notes">📝 ${r.notes}</p>`
            : `<p class="history-notes" style="color:#ccc;">No notes added.</p>`;

        return `
            <div class="history-card" id="card-${r.id}">
                <div class="history-date">📅 ${date}</div>
                <div class="history-chips">${chips}</div>
                ${notesHtml}
                <div class="history-card-actions">
                    <button class="btn-icon btn-edit" onclick="openEditModal(${r.id}, \`${escapeQuotes(r.notes)}\`)">✏️ Edit Notes</button>
                    <button class="btn-icon btn-delete" onclick="deleteResult(${r.id})">🗑️ Delete</button>
                </div>
            </div>`;
    }).join('');
}

function escapeQuotes(str) {
    return (str || '').replace(/`/g, "'").replace(/\\/g, '\\\\');
}

// ── DELETE ──
async function deleteResult(id) {
    if (!confirm('Are you sure you want to delete this assessment? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API}/api/results/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
            allResults = allResults.filter(r => r.id !== id);
            document.getElementById(`card-${id}`)?.remove();
            if (!allResults.length) {
                document.getElementById('history-list').innerHTML =
                    '<p class="history-empty">No assessments yet. Take your first one!</p>';
            }
        } else {
            alert('Could not delete. Please try again.');
        }
    } catch { alert('Server error.'); }
}

// ─────────────────────────────────────────────
// Edit Notes Modal — UPDATE
// ─────────────────────────────────────────────

function openEditModal(id, currentNotes) {
    editingResultId = id;
    document.getElementById('edit-notes-input').value = currentNotes || '';
    document.getElementById('edit-error').textContent = '';
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingResultId = null;
}

function closeEditModalOnBackdrop(e) {
    if (e.target.id === 'edit-modal') closeEditModal();
}

async function submitEditNotes() {
    const notes  = document.getElementById('edit-notes-input').value.trim();
    const errEl  = document.getElementById('edit-error');
    errEl.textContent = '';

    try {
        const res = await fetch(`${API}/api/results/${editingResultId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ notes })
        });
        if (!res.ok) { errEl.textContent = 'Could not save. Please try again.'; return; }

        // Update local cache
        const entry = allResults.find(r => r.id === editingResultId);
        if (entry) entry.notes = notes;

        closeEditModal();
        loadHistory(); // re-render history list with updated notes
    } catch { errEl.textContent = 'Server error.'; }
}

// ─────────────────────────────────────────────
// Progress Tracker
// ─────────────────────────────────────────────

const CATEGORY_COLORS = {
    cardiovascular: '#e74c3c',
    metabolic:      '#f39c12',
    lifestyle:      '#27ae60',
    mental:         '#9b59b6',
    cancer:         '#e67e22',
    respiratory:    '#2980b9'
};

const LEVEL_SCORE = { low: 1, moderate: 2, high: 3 };

async function loadProgress() {
    const results = await fetchResults(); // already sorted ASC by date from API

    const summaryEl  = document.getElementById('progress-summary');
    const insightsEl = document.getElementById('progress-insights');

    if (results.length < 2) {
        summaryEl.innerHTML  = '';
        insightsEl.innerHTML = `
            <div class="insight-card neutral">
                <span class="insight-icon">ℹ️</span>
                <span>Complete at least <strong>2 assessments</strong> to see your progress over time.</span>
            </div>`;
        renderProgressChart(results);
        return;
    }

    const first = results[0];
    const last  = results[results.length - 1];
    const categories = Object.keys(last.riskLevels);

    // ── Summary stats ──
    let improved = 0, worsened = 0, unchanged = 0;
    categories.forEach(cat => {
        const firstScore = LEVEL_SCORE[first.riskLevels[cat]?.level] || 0;
        const lastScore  = LEVEL_SCORE[last.riskLevels[cat]?.level]  || 0;
        if (lastScore < firstScore) improved++;
        else if (lastScore > firstScore) worsened++;
        else unchanged++;
    });

    const daysBetween = Math.round(
        (new Date(last.createdAt) - new Date(first.createdAt)) / (1000 * 60 * 60 * 24)
    );

    summaryEl.innerHTML = `
        <div class="progress-stat">
            <div class="stat-label">Assessments</div>
            <div class="stat-value">${results.length}</div>
            <div class="stat-sub">total taken</div>
        </div>
        <div class="progress-stat">
            <div class="stat-label">Tracking Since</div>
            <div class="stat-value">${daysBetween}</div>
            <div class="stat-sub">days</div>
        </div>
        <div class="progress-stat">
            <div class="stat-label">Improved</div>
            <div class="stat-value" style="color:#27ae60">${improved}</div>
            <div class="stat-sub">categories</div>
        </div>
        <div class="progress-stat">
            <div class="stat-label">Need Work</div>
            <div class="stat-value" style="color:#e74c3c">${worsened}</div>
            <div class="stat-sub">categories</div>
        </div>`;

    // ── Render Chart ──
    renderProgressChart(results);

    // ── Insights ──
    const insights = [];
    categories.forEach(cat => {
        const firstLevel = first.riskLevels[cat]?.level;
        const lastLevel  = last.riskLevels[cat]?.level;
        const firstScore = LEVEL_SCORE[firstLevel] || 0;
        const lastScore  = LEVEL_SCORE[lastLevel]  || 0;

        if (lastScore < firstScore) {
            insights.push({
                type: 'improved',
                icon: '✅',
                text: `<strong>${capitalize(cat)}</strong> improved from <em>${firstLevel}</em> to <em>${lastLevel}</em> risk — great progress!`
            });
        } else if (lastScore > firstScore) {
            insights.push({
                type: 'worsened',
                icon: '⚠️',
                text: `<strong>${capitalize(cat)}</strong> risk increased from <em>${firstLevel}</em> to <em>${lastLevel}</em>. Consider focusing on this area.`
            });
        } else {
            insights.push({
                type: 'neutral',
                icon: '➡️',
                text: `<strong>${capitalize(cat)}</strong> risk is unchanged at <em>${lastLevel}</em>.`
            });
        }
    });

    // Sort: worsened first, then neutral, then improved
    const order = { worsened: 0, neutral: 1, improved: 2 };
    insights.sort((a, b) => order[a.type] - order[b.type]);

    insightsEl.innerHTML = `<h4 style="color:#333; margin-bottom:12px; font-size:14px;">Category Insights (first vs. latest)</h4>` +
        insights.map(i => `
            <div class="insight-card ${i.type}">
                <span class="insight-icon">${i.icon}</span>
                <span>${i.text}</span>
            </div>`).join('');
}

function renderProgressChart(results) {
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;

    if (progressChart) { progressChart.destroy(); progressChart = null; }

    if (!results.length) return;

    const categories = Object.keys(results[0].riskLevels);
    const labels = results.map((r, i) => {
        const d = new Date(r.createdAt);
        return `#${i + 1} ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    });

    const datasets = categories.map(cat => ({
        label: capitalize(cat),
        data: results.map(r => LEVEL_SCORE[r.riskLevels[cat]?.level] || 0),
        borderColor: CATEGORY_COLORS[cat] || '#19a3b6',
        backgroundColor: (CATEGORY_COLORS[cat] || '#19a3b6') + '22',
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2
    }));

    progressChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 11 }, boxWidth: 12 } },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const lvl = ['', 'Low', 'Moderate', 'High'][ctx.parsed.y] || '';
                            return ` ${ctx.dataset.label}: ${lvl}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0.5, max: 3.5,
                    ticks: {
                        stepSize: 1,
                        callback: v => (['', 'Low', 'Moderate', 'High'][v] || ''),
                        font: { family: 'Poppins', size: 11 }
                    },
                    grid: { color: '#f0f0f0' }
                },
                x: {
                    ticks: { font: { family: 'Poppins', size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
