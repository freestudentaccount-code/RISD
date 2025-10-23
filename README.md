# Emoji Invaders

Open `index.html` in a modern browser to play a small, fun Space Invaders–style game using emoji aliens.

Quick start
- Double-click or open `index.html` in your browser.
- Press the green "Start New Game" button to start or restart without reloading.

Controls
- Left / Right arrows — move the ship
- Space — shoot
- Enter — toggle pause (a PAUSED overlay appears)

Gameplay features
- Emoji alien formation that moves left/right and steps down.
- Each level adds one more row (when it fits on the screen).
- Aliens speed up as the level timer counts down and additionally whenever the formation steps down.
- Time limit per level is shown in the HUD (top-right).

Audio
- Shooting plays `pew.wav` (when allowed by the browser).
- Clearing a level plays `nextlevel.wav`.
- Game over plays `gameover.wav`.

High scores
- When you beat the current top scores, a small form will appear after game over to save your name. High scores are stored in localStorage under `emoji-inv-highlist-v1`.
- To reset high scores, clear that key in your browser DevTools Application → Local Storage.

Notes and troubleshooting
- Some browsers block autoplay of sounds until the page receives a user gesture — shooting or clicking Start typically enables audio playback.
- If you see stale behavior after edits, refresh the page (hard refresh) to ensure the newest scripts are loaded.

Development notes
- Files of interest: `index.html`, `style.css`, `main.js`.
- The game is intentionally small and self-contained; feel free to tweak speed constants in `main.js` for balance.

Enjoy — and feel free to ask for new features (pause step, lives, power-ups, levels, etc.).

# RISD
Richardson Independent School District STEM
# Emoji Invaders

Open `index.html` in a browser to play a small Space Invaders like game using emoji aliens.

Controls:
- Left / Right arrows to move
- Space to shoot

Features:
- Levels with decreasing time limits and extra alien rows
- Aliens speed up as the level timer runs out
- High score persisted in localStorage

This is a small, single-file demo (plus CSS) meant to be opened locally.
# RISD
Richardson Independent School District STEM
