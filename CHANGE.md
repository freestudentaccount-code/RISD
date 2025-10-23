2025-10-22  (jasmoone)
Prompt: Create an Emoji Invaders arcade game similar to Space Invaders with ship, aliens, levels, timer, and high score.
Reasoning: Added a minimal playable HTML5 canvas game that meets the requirements: ship movement, shooting, alien rows that increase each level, time limit per level which decreases, aliens speed up as time runs out, and high score persistence. Used emoji for aliens to keep it fun.
Changed: Added `index.html`, `style.css`, `main.js`, `README.md`.
Modified Files: (new) index.html, style.css, main.js, README.md
GitHub Commit Summary: Initial add - Emoji Invaders game (HTML/CSS/JS)

2025-10-22  (jasmoone)
Prompt: Improve emoji visibility in dark mode
Reasoning: Emoji were hard to see against the dark canvas; added a soft rounded background, larger emoji font, and subtle glow to increase contrast.
Changed: Updated `main.js` to render a rounded background behind each alive alien emoji, increase emoji font size, and add glow. Added `roundRect` helper.
Modified Files: main.js
GitHub Commit Summary: Improve emoji visibility (background + glow)
 
2025-10-22  (jasmoone)
Prompt: Prevent alien rows from overflowing to bottom
Reasoning: On higher levels adding rows could push aliens too close to the ship; cap rows to the maximum that fits the canvas and show a brief message when rows are limited.
Changed: Updated `main.js` to compute maximum rows that fit and cap rows added per level. Shows a short message if rows were limited.
Modified Files: main.js
GitHub Commit Summary: Cap alien rows so they fit on-screen

2025-10-22  (jasmoone)
Prompt: Only add 1 row per level
Reasoning: Make progression predictable by adding exactly one row per level instead of multiple rows.
Changed: Updated `main.js` row calculation to use baseRows + (level-1).
Modified Files: main.js
GitHub Commit Summary: Levels now add exactly one alien row each
