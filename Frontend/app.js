// Username save
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
//If you want to detect voice input (since it tends to insert large text chunks all at once
//This detects unnatural bursts of text appearing too quickly and clears the field.
// ✅ Anti–voice recognition & anti–paste detection
let lastTime = Date.now();
let lastLength = 0;
let suspiciousCount = 0;

if (inputEl) {
  inputEl.addEventListener("input", () => {
    const now = Date.now();
    const diff = now - lastTime;
    const lengthDiff = inputEl.value.length - lastLength;

    // Detect massive jump in characters or ultra-fast input
    if (lengthDiff > 10 && diff < 200) {
      suspiciousCount++;
      if (suspiciousCount >= 2) {
        alert("🚫 Voice input or pasting detected. Please type manually.");
        inputEl.value = "";
        suspiciousCount = 0;
        return;
      }
    } else {
      suspiciousCount = 0; // reset if normal typing resumes
    }

    lastTime = now;
    lastLength = inputEl.value.length;

    // Start timer when typing begins
    if (!isStarted && inputEl.value.length > 0) {
      startTime = new Date();
      isStarted = true;
    }
   //If someone keeps triggering the alert 3+ times, you can temporarily disable input for 30 seconds:
   if (suspiciousCount >= 3) {
  inputEl.disabled = true;
  alert("🚷 Typing locked due to repeated suspicious input.");
  setTimeout(() => { inputEl.disabled = false; }, 30000);
}

    // Finish when full text is typed
    if (inputEl.value === currentText) endTest();
  });
}

//Main
const API_BASE = "https://typa-zalo.onrender.com";
const texts = [
    "The quick brown fox jumps over the lazy dog",
    "Typing speed tests measure how fast you can type",
    "Practice makes perfect keep improving daily",
    "Javascript is fun once you understand the basics",
    "Discipline and consistency will always beat motivation",
    "Achievers University is building the future today",
    "Great developers start with small projects and grow big",
    "Accuracy is more important than speed when learning typing",
    "Success is the sum of small efforts repeated daily"
];

let startTime, currentText, isStarted = false;
const textEl = document.getElementById("text");
// The textarea in index.html is `id="answer"` — fall back to `input` if present.
const inputEl = document.getElementById("answer") || document.getElementById("input");
const resultEl = document.getElementById("result");
const boardEl = document.getElementById("leaderboard");
const leagueEl = document.getElementById("league");
let league = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

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

if (inputEl) {
    inputEl.addEventListener("input", () => {
        if (!isStarted) {
            startTime = new Date();
            isStarted = true;
        }
        if (inputEl.value === currentText) endTest();
    });
} else {
    console.warn("Input element not found: expected id 'answer' or 'input'. Some features may not work.");
}

async function endTest() {
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;
    const totalWords = currentText.split(" ").length;
    const wpm = Math.round((totalWords / timeTaken) * 60);
    const inputText = inputEl.value;
    const correctChars = [...inputText].filter((c, i) => c === currentText[i]).length;
    const accuracy = Math.round((correctChars / currentText.length) * 100);

    resultEl.textContent = `✅ WPM: ${wpm} | 🎯 Accuracy: ${accuracy}% | ⏱ Time: ${timeTaken.toFixed(1)}s`;
    inputEl.disabled = true;

    const username = localStorage.getItem("username") || prompt("Enter your name:") || "Anonymous";
    localStorage.setItem("username", username);
    const season = "2025-Q4";

    try {
        await fetch(`${API_BASE}/api/scores/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, wpm, accuracy, season, deviceType: league })
        });
        loadLeaderboard();
    } catch (err) {
        console.error("Submit error:", err);
    }
}

async function loadLeaderboard() {
    try {
        const res = await fetch(`${API_BASE}/api/scores/season/2025-Q4?deviceType=${league}`);
        const data = await res.json();

        function getOrdinalSuffix(n) {
            const j = n % 10, k = n % 100;
            if (j === 1 && k !== 11) return `${n}st`;
            if (j === 2 && k !== 12) return `${n}nd`;
            if (j === 3 && k !== 13) return `${n}rd`;
            return `${n}th`;
        }

        boardEl.innerHTML = data.map((s, i) => {
            let rankIcon;

            if (i === 0) rankIcon = "🥇";
            else if (i === 1) rankIcon = "🥈";
            else if (i === 2) rankIcon = "🥉";
            else rankIcon = `${getOrdinalSuffix(i + 1)}`;

            return `
                <tr>
                    <td class="rank">${rankIcon}</td>
                    <td>${s.username}</td>
                    <td>${s.wpm}</td>
                    <td>${s.accuracy}%</td>
                </tr>
            `;
        }).join("");
    } catch (err) {
        console.error("Leaderboard error:", err);
    }
}

function switchLeague(type) {
    league = type;
    leagueEl.textContent = type === "mobile" ? "Mobile" : "Desktop";
    loadLeaderboard();
}

// Theme toggle
const toggleBtn = document.getElementById("theme-toggle");
if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });
} else {
    console.warn("Theme toggle button not found (id='theme-toggle').");
}

// Apply saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

loadLeaderboard();

//Copy paste family contingency
function disableShortcuts(e) {
    // Disable Ctrl/Command shortcuts like copy, paste, cut, etc.
    if ((e.ctrlKey || e.metaKey) &&
        ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
}