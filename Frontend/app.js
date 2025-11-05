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

    let startTime, endTime;
    let isStarted = false;
    let currentText = "";

    const usernameEl = document.getElementById("username");
    const startBtn = document.getElementById("start-btn");
    const textEl = document.getElementById("text");
    const inputEl = document.getElementById("input");
    const resultEl = document.getElementById("result");

    function startTest() {
        startBtn.disabled = true;
usernameEl.disabled = true;
    const username = usernameEl.value.trim();
    if (!username) {
        alert("Please enter your name first!");
        return;
    }

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

    inputEl.addEventListener("input", () => {
      if (!isStarted) {
        startTime = new Date();
        isStarted = true;
      }

      if (inputEl.value === currentText) {
        endTest();
      }
    });

function endTest() {
  endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000;
  const totalWords = currentText.split(" ").length;
  const wpm = Math.round((totalWords / timeTaken) * 60);

  let correctChars = 0;
  const inputText = inputEl.value;
  for (let i = 0; i < inputText.length; i++) {
    if (inputText[i] === currentText[i]) {
      correctChars++;
    }
  }
  const accuracy = Math.round((correctChars / currentText.length) * 100);

  resultEl.textContent =
    `✅ WPM: ${wpm} | 🎯 Accuracy: ${accuracy}% | ⏱ Time: ${timeTaken.toFixed(1)}s`;

 // ✅ Send score to backend using username input field
fetch("http://localhost:5000/api/scores/submit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: usernameEl.value,
    wpm,
    accuracy
  })
})
.then(res => res.json())
.then(data => console.log("Score saved:", data))
.catch(err => console.error("Error saving score:", err));
  inputEl.disabled = true;
  startBtn.disabled = false;
usernameEl.disabled = false;

}
