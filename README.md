# Typing-Speed-Tester
For testing how fast you can type a given word.
Feature	Old Version	Anti-Cheat v2
Paste / Voice / Burst Detection	✅ Basic	✅ More sensitive and adaptive
Drag-Drop Blocking	❌ Missing	✅ Added
Right-Click & Shortcuts	✅ Partial	✅ Full
Keystroke Rhythm	❌ None	✅ Detects bots / automation
Repeated Lockout	✅ Temporary	✅ Smarter reset system
Modularity	❌ Hardcoded	✅ Separated, upgradable
WPM calculation system 
⚖️ 2️⃣ Levenshtein Distance (Edit Distance) Accuracy

Measures how many edits (insertions, deletions, substitutions) are needed to turn the user’s text into the target.

accuracy = ((maxLen - editDistance) / maxLen) * 100;


✅ Pros:

Very accurate reflection of human typing errors.

Counts skipped, extra, and wrong characters fairly.

Used in advanced typing tests and code-judging systems.

❌ Cons:

Slightly heavier computation (but trivial for JS).

Might penalize “near-misses” harshly if you use a strict threshold.

🟢 Verdict: ⭐ Best balance of fairness and realism.
→ Great for your app’s leaderboard credibility.