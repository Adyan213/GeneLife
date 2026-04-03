
const API = "";  // same origin — Flask serves this file

// ── State ──
let currentQuestionIndex = 0;
const userAnswers = [];
let currentUser = null;

// ── DOM ──
const authScreen     = document.getElementById('auth-screen');
const welcomeScreen  = document.getElementById('welcome-screen');
const quizScreen     = document.getElementById('quiz-screen');
const resultsScreen  = document.getElementById('results-screen');
const questionContainer = document.getElementById('question-container');
const progressFill      = document.getElementById('progress-fill');
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
    } catch {
        errEl.textContent = 'Server error. Is Flask running?';
    }
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
    } catch {
        errEl.textContent = 'Server error. Is Flask running?';
    }
}

function saveSession(token, name) {
    localStorage.setItem('gl_token', token);
    localStorage.setItem('gl_name', name);
    currentUser = name;
}

function getToken() {
    return localStorage.getItem('gl_token');
}

function logout() {
    localStorage.removeItem('gl_token');
    localStorage.removeItem('gl_name');
    currentUser = null;
    showScreen(authScreen);
}

function enterApp(name) {
    currentUser = name;
    document.getElementById('welcome-user-name').textContent = `👋 Hello, ${name}`;
    showScreen(welcomeScreen);
}

// ── On page load: restore session if token exists ──
window.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    const name  = localStorage.getItem('gl_name');
    if (!token || !name) { showScreen(authScreen); return; }

    // Verify token is still valid
    try {
        const res = await fetch(`${API}/api/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            enterApp(name);
        } else {
            logout();
        }
    } catch {
        // If server is unreachable, clear session
        logout();
    }
});

// ─────────────────────────────────────────────
// Screen Helper
// ─────────────────────────────────────────────

function showScreen(el) {
    [authScreen, welcomeScreen, quizScreen, resultsScreen].forEach(s => s.classList.remove('active'));
    el.classList.add('active');
}

// ─────────────────────────────────────────────
// Quiz Navigation
// ─────────────────────────────────────────────

function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers.length = 0;
    totalQuestionsNum.textContent = questions.length;
    showScreen(quizScreen);
    showQuestion();
}

function restartQuiz() {
    showScreen(welcomeScreen);
}

function showQuestion() {
    const question = questions[currentQuestionIndex];
    const progress = (currentQuestionIndex / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    currentQuestionNum.textContent = currentQuestionIndex + 1;

    let html = `
        <h2 class="question-text" style="margin-bottom: 20px; font-size: 24px; color: #19a3b6;">
            ${question.question}
        </h2>
        <div class="options-container" style="display: flex; flex-direction: column; gap: 12px;">
    `;

    question.options.forEach((option, index) => {
        const isSelected = userAnswers[currentQuestionIndex]?.option.value === option.value;
        html += `
            <div class="option-item ${isSelected ? 'selected' : ''}"
                 onclick="selectOption(${index})"
                 style="padding: 15px; border: 2px solid ${isSelected ? '#1fa2b6' : '#eee'};
                        border-radius: 10px; cursor: pointer; transition: all 0.2s ease;
                        background: ${isSelected ? '#f0f9fa' : 'white'};">
                <span style="font-weight: 500;">${option.text}</span>
            </div>
        `;
    });

    html += `</div>`;
    questionContainer.innerHTML = html;

    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next';
}

function selectOption(optionIndex) {
    const question = questions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = {
        questionId: question.id,
        option: question.options[optionIndex]
    };
    showQuestion();
}

function nextQuestion() {
    if (!userAnswers[currentQuestionIndex]) {
        alert("Please select an option to continue.");
        return;
    }
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        showResults();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// Results

async function showResults() {
    showScreen(resultsScreen);

    const riskLevels      = healthAnalyzer.calculateRiskScores(userAnswers);
    const recommendations = healthAnalyzer.generateRecommendations(riskLevels, userAnswers);
    const categoryDetails = healthAnalyzer.generateCategoryDetails(riskLevels, userAnswers);

    renderRiskScores(riskLevels);
    renderRecommendations(recommendations);
    renderCategoryBreakdown(categoryDetails);

    // Save results to backend
    await saveResults(riskLevels, recommendations);
}

async function saveResults(riskLevels, recommendations) {
    const statusEl = document.getElementById('save-status');
    const token = getToken();
    if (!token) return;

    try {
        const res = await fetch(`${API}/api/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ riskLevels, recommendations })
        });
        if (res.ok) {
            statusEl.textContent = '✓ Results saved to your account';
        }
    } catch {
        statusEl.textContent = '';
    }
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
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

function renderRecommendations(recommendations) {
    const list = document.getElementById('recommendations-list');
    list.innerHTML = recommendations.map(rec => `
        <div style="text-align: left; background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; border-left: 5px solid ${rec.priority === 'high' ? '#e74c3c' : '#1fa2b6'}">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 24px;">${rec.icon}</span>
                <h3 style="margin: 0; color: #333;">${rec.title}</h3>
                <span style="margin-left: auto; font-size: 10px; padding: 3px 8px; border-radius: 10px; background: #eee; text-transform: uppercase;">${rec.priority} Priority</span>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #555;">${rec.advice}</p>
        </div>
    `).join('');
}

function renderCategoryBreakdown(details) {
    const container = document.getElementById('category-details');
    let html = '';
    for (const [key, detail] of Object.entries(details)) {
        html += `
            <div style="text-align: left; margin-bottom: 20px;">
                <h4 style="text-transform: capitalize; color: #19a3b6; border-bottom: 1px solid #eee; padding-bottom: 5px;">${key} Analysis</h4>
                <p style="font-size: 14px; margin: 10px 0;">${detail.analysis}</p>
                <ul style="padding-left: 20px;">
                    ${detail.tips.map(tip => `<li style="font-size: 13px; color: #666; margin-bottom: 5px;">${tip}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    container.innerHTML = html;
}

// ─────────────────────────────────────────────
// History Modal
// ─────────────────────────────────────────────

async function showHistory() {
    document.getElementById('history-modal').style.display = 'flex';
    const listEl = document.getElementById('history-list');
    listEl.innerHTML = '<p style="text-align:center; color:#aaa; padding: 20px 0;">Loading...</p>';

    try {
        const res = await fetch(`${API}/api/results`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const results = await res.json();

        if (!results.length) {
            listEl.innerHTML = '<p class="history-empty">No assessments yet. Take your first one!</p>';
            return;
        }

        listEl.innerHTML = results.map(r => {
            const date = new Date(r.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const chips = Object.entries(r.riskLevels).map(([cat, data]) =>
                `<span class="chip chip-${data.level}">${cat}: ${data.level}</span>`
            ).join('');
            return `
                <div class="history-card">
                    <div class="history-date">📅 ${date}</div>
                    <div class="history-chips">${chips}</div>
                </div>
            `;
        }).join('');

    } catch {
        listEl.innerHTML = '<p class="history-empty">Could not load history.</p>';
    }
}

function closeHistory() {
    document.getElementById('history-modal').style.display = 'none';
}

function closeHistoryOnBackdrop(e) {
    if (e.target.id === 'history-modal') closeHistory();
}
