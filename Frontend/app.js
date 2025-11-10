
// ✅ Username save
window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("username");
  const usernameInput = document.getElementById("username");

  if (savedName && usernameInput) {
    usernameInput.value = savedName;
    console.log(`Welcome back, ${savedName}!`);
  }
});

function saveUsername() {
  const usernameInput = document.getElementById("username");
  const username = usernameInput?.value.trim();

  if (username) {
    localStorage.setItem("username", username);
    console.log(`Saved username: ${username}`);
  }
}

// ✅ Main
const API_BASE = "https://typa-zalo.onrender.com";
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

let startTime, currentText, isStarted = false;
const textEl = document.getElementById("text");
const inputEl = document.getElementById("answer") || document.getElementById("input");
const resultEl = document.getElementById("result");
const boardEl = document.getElementById("leaderboard");
const leagueEl = document.getElementById("league");
let league = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

// ✅ Anti-Cheat v2
let lastInputTime = Date.now();
let lastLength = 0;
let suspiciousBursts = 0;
let keyIntervals = [];
let lastKeyTime = Date.now();

function resetSuspicion() {
  suspiciousBursts = 0;
  keyIntervals = [];
}

if (inputEl) {
  // Disable paste, drop, and shortcuts
  inputEl.addEventListener("paste", e => {
    e.preventDefault();
    alert("🚫 Pasting is disabled — type manually.");
  });

  inputEl.addEventListener("drop", e => {
    e.preventDefault();
    alert("🚫 Drag & drop disabled.");
  });

  inputEl.addEventListener("contextmenu", e => e.preventDefault());

  // Detect typing patterns
  inputEl.addEventListener("input", () => {
    const now = Date.now();
    const diff = now - lastInputTime;
    const lenDiff = inputEl.value.length - lastLength;

    // ⚠️ Detect abnormal typing bursts (voice/paste)
    if (lenDiff > 4 && diff < 120) {
      suspiciousBursts++;
      if (suspiciousBursts >= 2) {
        alert("🚷 Suspicious input detected — type naturally.");
        inputEl.value = "";
        resetSuspicion();
        return;
      }
    } else {
      suspiciousBursts = 0;
    }

    // Start timer when typing begins
    if (!isStarted && inputEl.value.length > 0) {
      startTime = new Date();
      isStarted = true;
    }

    // End test when done
    if (inputEl.value === currentText) endTest();

    lastInputTime = now;
    lastLength = inputEl.value.length;
  });

  // Record keystroke rhythm for variance detection
  inputEl.addEventListener("keydown", () => {
    const now = Date.now();
    keyIntervals.push(now - lastKeyTime);
    lastKeyTime = now;
  });
}

// ✅ Check if typing rhythm looks “too uniform”
function isBotLike() {
  if (keyIntervals.length < 10) return false;
  const avg = keyIntervals.reduce((a, b) => a + b, 0) / keyIntervals.length;
  const variance = keyIntervals.reduce((a, b) => a + Math.abs(b - avg), 0) / keyIntervals.length;
  return variance < 20; // too consistent → likely automation
}

// ✅ Run at test end
async function endTest() {
  const endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000;
  const totalWords = currentText.split(" ").length;
  const inputText = inputEl.value;
  const correctChars = [...inputText].filter((c, i) => c === currentText[i]).length;
  const accuracy = Math.round((correctChars / currentText.length) * 100);
  const wpm = Math.round((totalWords / timeTaken) * 60);

  if (isBotLike()) {
    alert("🚫 Automated typing pattern detected — score rejected.");
    inputEl.value = "";
    resetSuspicion();
    return;
  }

  resultEl.textContent = `✅ WPM: ${wpm} | 🎯 Accuracy: ${accuracy}% | ⏱ Time: ${timeTaken.toFixed(1)}s`;
  inputEl.disabled = true;

  // Send verified data to backend
  const username = localStorage.getItem("username") || prompt("Enter your name:") || "Anonymous";
  localStorage.setItem("username", username);
  const season = "2025-Q4";

  try {
    await fetch(`${API_BASE}/api/scores/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        wpm,
        accuracy,
        totalChars: inputText.length,
        timeTaken,
        season,
        deviceType: league,
      }),
    });
    loadLeaderboard();
  } catch (err) {
    console.error("Submit error:", err);
  }
}

// ✅ Test functions
async function startTest() {
  currentText = texts[Math.floor(Math.random() * texts.length)];
  textEl.textContent = currentText;
  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();
  resultEl.textContent = "";
  isStarted = false;
}

function restartTest() {
  textEl.textContent = "Your text will appear here...";
  inputEl.value = "";
  inputEl.disabled = true;
  resultEl.textContent = "";
  isStarted = false;
}
async function endTest() {
  const endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000; // seconds
  const inputText = inputEl.value.trim();

  // ✅ Calculate WPM using total characters / 5 (standard definition)
  const totalChars = inputText.length;
  const wpm = Math.round((totalChars / 5) / (timeTaken / 60));

  // ✅ Calculate accuracy
  const correctChars = [...inputText].filter((c, i) => c === currentText[i]).length;
  const accuracy = Math.round((correctChars / currentText.length) * 100);

  // ✅ Show results on screen
  resultEl.textContent = `✅ WPM: ${wpm} | 🎯 Accuracy: ${accuracy}% | ⏱ Time: ${timeTaken.toFixed(1)}s`;
  inputEl.disabled = true;

  // ✅ Get or save username locally
  const username = localStorage.getItem("username") || prompt("Enter your name:") || "Anonymous";
  localStorage.setItem("username", username);

  // ✅ Manually set the current season
  const season = "2025-Q4";

  // ✅ Auto-detect device type (cannot be faked by switching leaderboard tab)
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

  try {
    // ✅ Submit score to backend
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

    // ✅ Reload leaderboard with updated results
    loadLeaderboard();
  } catch (err) {
    console.error("Submit error:", err);
    alert("Network error — unable to submit score.");
  }
}

// ✅ Load season list for dropdown
async function loadSeasonList() {
  try {
    // 🔹 Fetch available seasons from backend
    const res = await fetch(`${API_BASE}/api/scores/seasons`);
    const seasons = await res.json();

    const seasonSelect = document.getElementById("seasonSelect");
    seasonSelect.innerHTML = seasons
      .map((s) => `<option value="${s.id || s}">${s.displayName || s}</option>`)
      .join("");

    // 🔹 Default to the latest season (backend returns newest first)
    if (seasons.length > 0) {
      const latest = seasons[0];
      const latestValue = latest.id || latest;
      seasonSelect.value = latestValue;
      loadLeaderboard(latestValue);
    }

    // 🔹 Reload leaderboard when season changes
    seasonSelect.addEventListener("change", (e) => {
      loadLeaderboard(e.target.value);
    });
  } catch (err) {
    console.error("Failed to load seasons:", err);
  }
}

// ✅ Leaderboard functions
async function loadLeaderboard(seasonParam) {
  try {
    // 🔹 Use provided season or fallback to today’s
    function getTodaySeason() {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0]; // e.g., "2025-11-07"
      const suffix = "S" + (today.getFullYear() % 100); // e.g., "S25"
      return `${dateStr}-${suffix}`;
    }

    const season = seasonParam || getTodaySeason();

    // 🔹 Fetch leaderboard for selected season
    const res = await fetch(
      `${API_BASE}/api/scores/season/${season}?deviceType=${league}`
    );
    const data = await res.json();
    console.log("📊 Leaderboard fetch result:", data);

    if (!Array.isArray(data)) {
      console.error("Invalid leaderboard data:", data);
      return;
    }

    function getOrdinalSuffix(n) {
      const j = n % 10,
        k = n % 100;
      if (j === 1 && k !== 11) return `${n}st`;
      if (j === 2 && k !== 12) return `${n}nd`;
      if (j === 3 && k !== 13) return `${n}rd`;
      return `${n}th`;
    }

    // ✅ Update leaderboard table body
    const leaderboardBody = document.getElementById("leaderboard-body");
    const html = data
      .map((s, i) => {
        let rankIcon;
        if (i === 0) rankIcon = "🥇";
        else if (i === 1) rankIcon = "🥈";
        else if (i === 2) rankIcon = "🥉";
        else rankIcon = `${getOrdinalSuffix(i + 1)}`;

        return `
          <tr>
            <td>${rankIcon}</td>
            <td>${s.username}</td>
            <td>${s.wpm}</td>
            <td>${s.accuracy}%</td>
          </tr>
        `;
      })
      .join("");

    leaderboardBody.innerHTML =
      html || "<tr><td colspan='4'>No scores yet.</td></tr>";
  } catch (err) {
    console.error("Leaderboard error:", err);
  }
}



function switchLeague(type) {
  league = type;
  leagueEl.textContent = type === "mobile" ? "Mobile" : "Desktop";
  loadLeaderboard();
}

// ✅ Theme toggle
const toggleBtn = document.getElementById("theme-toggle");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  });
} else {
  console.warn("Theme toggle button not found (id='theme-toggle').");
}

// ✅ Apply saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

// ✅ Load leaderboard initially
loadLeaderboard();

// ✅ Disable Ctrl/Command shortcuts like copy, paste, cut, etc.
function disableShortcuts(e) {
  if ((e.ctrlKey || e.metaKey) &&
    ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
}
document.addEventListener("keydown", disableShortcuts);
// ✅ Auto-load season list (and leaderboard) when the page is ready
window.addEventListener("DOMContentLoaded", () => {
  loadSeasonList();
});
