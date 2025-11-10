// ==================== Constants & Setup ====================
const API_BASE = "https://typa-zalo.onrender.com";

// Sample typing texts
const texts = [
  "Keep your fingers light and your mind steady as you type",
  "Every keystroke brings you closer to mastery and confidence",
  "Small progress each day builds great skill over time",
  "Typing faster starts with typing correctly and calmly first",
  "Stay focused and your speed will naturally improve",
  "Discipline always beats bursts of motivation and energy",
  "Great coders began with simple practice and daily effort",
  "Patience turns slow learners into fast and precise thinkers",
  "Accuracy first speed later that is the golden rule",
  "Each typing test is one more step toward precision"
];

// ==================== DOM Elements ====================
const textEl = document.getElementById("text");
const inputEl = document.getElementById("answer") || document.getElementById("input");
const resultEl = document.getElementById("result");
const boardEl = document.getElementById("leaderboard");
const leagueEl = document.getElementById("league");

// ==================== State Variables ====================
let currentText = "";
let startTime;
let isStarted = false;
let league = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

// Anti-cheat trackers
let lastInputTime = Date.now();
let lastLength = 0;
let suspiciousBursts = 0;
let keyIntervals = [];
let lastKeyTime = Date.now();

// ==================== Utility Functions ====================

// Calculate Levenshtein distance for accuracy
function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function calculateAccuracy(input, target) {
  const distance = levenshtein(input, target);
  const maxLen = Math.max(input.length, target.length);
  return Math.max(0, Math.min(100, ((maxLen - distance) / maxLen) * 100));
}

// Detect automated typing
function isBotLike() {
  if (keyIntervals.length < 10) return false;
  const avg = keyIntervals.reduce((a, b) => a + b, 0) / keyIntervals.length;
  const variance = keyIntervals.reduce((a, b) => a + Math.abs(b - avg), 0) / keyIntervals.length;
  return variance < 20; // too consistent → likely automation
}

// Reset anti-cheat trackers
function resetSuspicion() {
  suspiciousBursts = 0;
  keyIntervals = [];
}

// ==================== User Management ====================
window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("username");
  const usernameInput = document.getElementById("username");
  if (savedName && usernameInput) {
    usernameInput.value = savedName;
    console.log(`Welcome back, ${savedName}!`);
  }
  loadSeasonList(); // Load seasons & leaderboard
});

function saveUsername() {
  const usernameInput = document.getElementById("username");
  const username = usernameInput?.value.trim();
  if (username) {
    localStorage.setItem("username", username);
    console.log(`Saved username: ${username}`);
  }
}

// ==================== Input Event Handling ====================
if (inputEl) {
  // Disable paste/drag/drop/context menu
  inputEl.addEventListener("paste", e => e.preventDefault());
  inputEl.addEventListener("drop", e => e.preventDefault());
  inputEl.addEventListener("contextmenu", e => e.preventDefault());

  // Detect typing patterns
  inputEl.addEventListener("input", () => {
    const now = Date.now();
    const diff = now - lastInputTime;
    const lenDiff = inputEl.value.length - lastLength;

    // Anti-cheat: detect fast bursts
    if (lenDiff > 6 && diff < 100) suspiciousBursts++;
    else suspiciousBursts = 0;

    if (suspiciousBursts >= 2) {
      alert("🚷 Suspicious input detected — type naturally.");
      inputEl.value = "";
      resetSuspicion();
      return;
    }

    // Start timer on first keystroke
    if (!isStarted && inputEl.value.length > 0) {
      startTime = new Date();
      isStarted = true;
    }

    // Check if test is complete (trimmed comparison)
    if (inputEl.value.trim() === currentText.trim()) {
      endTest();
    }

    lastInputTime = now;
    lastLength = inputEl.value.length;
  });

  // Record keystroke intervals
  inputEl.addEventListener("keydown", () => {
    const now = Date.now();
    keyIntervals.push(now - lastKeyTime);
    lastKeyTime = now;
  });
}

// Disable common shortcuts
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && ['c','v','x','a'].includes(e.key.toLowerCase())) e.preventDefault();
});

// ==================== Test Lifecycle ====================
function startTest() {
  currentText = texts[Math.floor(Math.random() * texts.length)];
  textEl.textContent = currentText;
  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();
  resultEl.textContent = "";
  isStarted = false;
  resetSuspicion();
}

function restartTest() {
  textEl.textContent = "Your text will appear here...";
  inputEl.value = "";
  inputEl.disabled = true;
  resultEl.textContent = "";
  isStarted = false;
  resetSuspicion();
}

// ==================== End Test & Submit ====================
async function endTest() {
  const inputText = inputEl.value.trim();
  if (!inputText) return;

  const endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000;

  const totalChars = inputText.length;
  const accuracy = calculateAccuracy(inputText, currentText);
  const wpm = Math.round((totalChars / 5) / (timeTaken / 60));

  if (isBotLike()) {
    alert("🚫 Automated typing pattern detected — score rejected.");
    inputEl.value = "";
    resetSuspicion();
    return;
  }

  resultEl.textContent = `✅ WPM: ${wpm} | 🎯 Accuracy: ${accuracy}% | ⏱ Time: ${timeTaken.toFixed(1)}s`;
  inputEl.disabled = true;

  const username = localStorage.getItem("username") || prompt("Enter your name:") || "Anonymous";
  localStorage.setItem("username", username);

  const season = "2025-Q4";
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

  try {
    const res = await fetch(`${API_BASE}/api/scores/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        wpm,
        accuracy,
        totalChars,
        timeTaken,
        season,
        deviceType,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      alert(errData.error || "Error submitting score");
      return;
    }

    loadLeaderboard();
  } catch (err) {
    console.error("Submit error:", err);
    alert("Network error — unable to submit score.");
  }

  resetSuspicion();
}

// ==================== Leaderboard & Seasons ====================
async function loadSeasonList() {
  try {
    const res = await fetch(`${API_BASE}/api/scores/seasons`);
    const seasons = await res.json();

    const seasonSelect = document.getElementById("seasonSelect");
    seasonSelect.innerHTML = seasons
      .map(s => `<option value="${s.id || s}">${s.displayName || s}</option>`)
      .join("");

    if (seasons.length > 0) {
      seasonSelect.value = seasons[0].id || seasons[0];
      loadLeaderboard(seasonSelect.value);
    }

    seasonSelect.addEventListener("change", e => loadLeaderboard(e.target.value));
  } catch (err) {
    console.error("Failed to load seasons:", err);
  }
}

async function loadLeaderboard(seasonParam) {
  try {
    const season = seasonParam || "2025-Q4";
    const res = await fetch(`${API_BASE}/api/scores/season/${season}?deviceType=${league}`);
    const data = await res.json();

    if (!Array.isArray(data)) return console.error("Invalid leaderboard data:", data);

    const leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = data
      .map((s, i) => {
        const rankIcon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}th`;
        return `<tr><td>${rankIcon}</td><td>${s.username}</td><td>${s.wpm}</td><td>${s.accuracy}%</td></tr>`;
      })
      .join("") || "<tr><td colspan='4'>No scores yet.</td></tr>";
  } catch (err) {
    console.error("Leaderboard error:", err);
  }
}

function switchLeague(type) {
  league = type;
  leagueEl.textContent = type === "mobile" ? "Mobile" : "Desktop";
  loadLeaderboard();
}

// ==================== Theme Toggle ====================
const toggleBtn = document.getElementById("theme-toggle");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  });
}
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
