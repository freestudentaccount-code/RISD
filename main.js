// Emoji Invaders - simple Space Invaders like game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highEl = document.getElementById('highscore');
const levelEl = document.getElementById('level');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');

const W = canvas.width; const H = canvas.height;

// Game state
let ship = { x: W/2, y: H-40, w: 40, h: 20, speed: 6 };
let keys = {};
let bullets = [];
let aliens = [];
let alienEmojis = ['👽','👾','🛸','🤖','🐙','🦑','🦖','👻'];

let score = 0;
let highscore = parseInt(localStorage.getItem('emoji-inv-high')||'0',10);
highEl.textContent = highscore;

let level = 1;
let baseLevelTime = 30; // seconds for level 1
let levelTime = baseLevelTime;
let levelStart = Date.now();

let alienDir = 1; // 1 right, -1 left
let alienStepDown = 18;
let levelTimeout = null; // guard for scheduled level transition
let transitioning = false; // fallback for older cached code paths (harmless)
let paused = false; // pause state when user presses Enter
let stepCount = 0; // number of times aliens have stepped down this level
// load sounds (files added to repo)
const soundPew = new Audio('pew.wav');
const soundGameOver = new Audio('gameover.wav');
const soundNextLevel = new Audio('nextlevel.wav');
// high score storage
const HS_KEY = 'emoji-inv-highlist-v1';
function loadHighList(){
  try{
    const raw = JSON.parse(localStorage.getItem(HS_KEY) || '[]');
    // coerce score to number and ensure shape
    return (raw||[]).map(x=>({ name: x.name||'Player', score: Number(x.score)||0 })).sort((a,b)=>b.score-a.score);
  }catch(e){return []}
}
function saveHighList(list){ localStorage.setItem(HS_KEY, JSON.stringify(list.slice(0,10))); }
function renderHighList(){
  const el = document.getElementById('highList');
  const list = loadHighList();
  if(!el) return;
  if(list.length===0){ el.innerHTML = '<small>No high scores yet</small>'; return; }
  el.innerHTML = '<ol>' + list.map(i=>`<li>${i.name} — ${i.score}</li>`).join('') + '</ol>';
}

function showHighScoreForm(score){
  const form = document.getElementById('highscoreForm');
  const input = document.getElementById('playerName');
  form.style.display = 'flex';
  input.value = '';
  input.focus();
  form.dataset.score = score;
}

function hideHighScoreForm(){ document.getElementById('highscoreForm').style.display = 'none'; }

// start/reset hooks
const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', ()=>{
  // reset game state and start at level 1
  score = 0; scoreEl.textContent = score;
  level = 1; initLevel(1); running = true; messageEl.textContent = '';
});

document.getElementById('saveName').addEventListener('click', ()=>{
  const name = document.getElementById('playerName').value.trim() || 'Player';
  const score = parseInt(document.getElementById('score').textContent || '0',10);
  const list = loadHighList();
  list.push({name, score});
  list.sort((a,b)=>b.score - a.score);
  saveHighList(list);
  hideHighScoreForm(); renderHighList();
});
document.getElementById('skipSave').addEventListener('click', ()=>{ hideHighScoreForm(); });

renderHighList();

function initLevel(l){
  level = l || level;
  levelEl.textContent = level;
  bullets = [];
  aliens = [];
  // rows = baseRows + (level-1) -> only one extra row per level
  const baseRows = 2;
  const desiredRows = baseRows + (level - 1);
  const cols = 8;
  const padding = 10;
  const alienW = 36;
  const alienH = 28;
  const startX = 40;
  const startY = 40;

  // compute max rows that fit without overlapping the ship area
  const availableHeight = ship.y - 80 - startY; // leave margin above ship
  const rowHeight = alienH + padding;
  const maxRowsFit = Math.max(1, Math.floor(availableHeight / rowHeight));
  const rows = Math.min(desiredRows, maxRowsFit);
  if(desiredRows > rows){
    // notify player briefly
    messageEl.textContent = `Level ${level}: limited rows to fit screen`;
    setTimeout(()=>{ if(messageEl.textContent && messageEl.textContent.startsWith('Level')) messageEl.textContent = ''; }, 1200);
  }

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      aliens.push({
        x: startX + c*(alienW+padding),
        y: startY + r*(alienH+padding),
        w: alienW, h: alienH,
        alive: true,
        emoji: alienEmojis[(r+c) % alienEmojis.length]
      });
    }
  }
  // level time: mild per-level decrease (2s per level) to keep pacing familiar
  levelTime = Math.max(6, baseLevelTime - (level-1)*2);
  levelStart = Date.now();
}

function drawShip(){
  ctx.fillStyle = '#7fffd4';
  ctx.beginPath();
  ctx.rect(ship.x-ship.w/2, ship.y-ship.h/2, ship.w, ship.h);
  ctx.fill();
  // cockpit
  ctx.fillStyle='#003';
  ctx.fillRect(ship.x-6, ship.y-6, 12, 6);
}

function drawBullets(){
  ctx.fillStyle = '#fff';
  bullets.forEach(b=>{
    ctx.fillRect(b.x-2,b.y-6,4,8);
  });
}

function drawAliens(){
  // draw a soft rounded background behind each emoji so they remain visible in dark mode
  ctx.font = '28px Segoe UI Emoji';
  ctx.textAlign = 'center';
  aliens.forEach(a=>{
    if(!a.alive) return;
    const cx = a.x + a.w/2;
    const cy = a.y + a.h/1.6;
    const pad = 8;
    const br = 8;
    // background circle / rounded rect
    ctx.fillStyle = 'rgba(0,20,30,0.6)';
    roundRect(ctx, a.x - pad/2, a.y - pad/2, a.w + pad, a.h + pad, br, true, false);
    // subtle glow
    ctx.shadowColor = 'rgba(80,200,180,0.2)';
    ctx.shadowBlur = 12;
    // draw emoji
    ctx.fillStyle = '#fff';
    ctx.fillText(a.emoji, cx, cy);
    // reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  });
}

// helper to draw rounded rect
function roundRect(ctx, x, y, w, h, r, fill, stroke){
  if (typeof r === 'undefined') r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function update(dt){
  if(paused) return; // skip updates when paused

  // ship movement
  if(keys['ArrowLeft']) ship.x -= ship.speed;
  if(keys['ArrowRight']) ship.x += ship.speed;
  ship.x = Math.max(ship.w/2, Math.min(W-ship.w/2, ship.x));

  // bullets
  bullets.forEach(b=> b.y -= b.speed*dt);
  bullets = bullets.filter(b=> b.y > -10 && !b.hit);

  // alien horizontal speed increases as timer runs down
  const elapsed = (Date.now() - levelStart)/1000;
  const timeLeft = Math.max(0, levelTime - elapsed);
  const tFrac = 1 - timeLeft / levelTime; // 0..1
  // make aliens speed up as the level timer counts down (stronger acceleration near end)
  // per-level base speed increase
  const alienSpeedBase = 22 + level * 8 + stepCount * 6; // stepCount increases speed each time aliens step down
  // scale acceleration with level and with how many times they've stepped down this level
  const accelScale = (80 + level * 10) + stepCount * 20;
  const alienSpeed = alienSpeedBase + Math.pow(tFrac, 1.6) * accelScale;

  // move aliens left/right and check bounds
  let shouldReverse = false;
  aliens.forEach(a=>{
    if(!a.alive) return;
    a.x += alienDir * alienSpeed * dt;
    if(a.x < 4 || a.x + a.w > W-4) shouldReverse = true;
  });
  if(shouldReverse){
    alienDir *= -1;
    // increment step counter and push aliens down
    stepCount += 1;
    aliens.forEach(a=>{ if(a.alive) a.y += alienStepDown; });
  }

  // collisions
  bullets.forEach(b=>{
    aliens.forEach(a=>{
      if(!a.alive) return;
      if(b.x > a.x && b.x < a.x + a.w && b.y > a.y && b.y < a.y + a.h){
        a.alive = false;
        b.hit = true;
        score += 10;
        scoreEl.textContent = score;
        if(score > highscore){ highscore = score; localStorage.setItem('emoji-inv-high', ''+highscore); highEl.textContent = highscore; }
      }
    })
  });

  // check aliens reaching bottom
  for(const a of aliens){
    if(a.alive && a.y + a.h >= ship.y - 8){
      gameOver('Aliens landed. Game Over!');
      return;
    }
  }

  // level complete
  if(aliens.every(a=>!a.alive)){
    if(!levelTimeout){
      messageEl.textContent = 'Level cleared!';
      // play next level sound
      try{ soundNextLevel.currentTime = 0; soundNextLevel.play().catch(()=>{}); }catch(e){}
      levelTimeout = setTimeout(()=>{
        messageEl.textContent = '';
        level = level + 1;
        initLevel(level);
        levelTimeout = null;
      }, 900);
    }
  }

  // time up -> if reaches zero and aliens still alive, game over
  timerEl.textContent = Math.ceil(timeLeft);
  if(timeLeft <= 0){
    // if any aliens alive -> game over
    if(aliens.some(a=>a.alive)){
      gameOver('Time up. Game Over!');
      return;
    }
  }
}

function render(){
  ctx.clearRect(0,0,W,H);
  // background stars
  ctx.fillStyle='rgba(255,255,255,0.03)';
  for(let i=0;i<60;i++){
    const x = (i*73) % W;
    const y = (i*47 + Math.floor(Date.now()/120)%H) % H;
    ctx.fillRect(x,y,1,1);
  }
  drawAliens();
  drawShip();
  drawBullets();
}

let last = Date.now();
let running = true;

function loop(){
  const now = Date.now();
  const dt = Math.min(0.05, (now - last)/1000);
  last = now;
  if(running) update(dt);
  render();
  requestAnimationFrame(loop);
}

function fire(){
  if(!running) return;
  bullets.push({ x: ship.x, y: ship.y - 14, speed: 420, hit:false });
  // play pew sound (non-blocking)
  try{ soundPew.currentTime = 0; soundPew.play().catch(()=>{}); }catch(e){}
}

function gameOver(msg){
  running = false;
  messageEl.textContent = msg + ' Final score: ' + score;
  // play game over sound
  try{ soundGameOver.currentTime = 0; soundGameOver.play().catch(()=>{}); }catch(e){}
  // if this is a new highscore, prompt for name
  const highList = loadHighList();
  // qualifies if list has <10 entries or score is higher than the lowest in top list
  const lowestTop = highList.length ? highList[highList.length-1].score : -1;
  if(highList.length < 10 || score > lowestTop){
    showHighScoreForm(score);
  }
}

// input
window.addEventListener('keydown', e=>{
  // toggle pause on Enter
  if(e.key === 'Enter'){
    paused = !paused;
    const overlay = document.getElementById('pauseOverlay');
    if(overlay) overlay.style.display = paused ? 'block' : 'none';
    return;
  }
  keys[e.key] = true;
  if(e.key === ' '){ e.preventDefault(); fire(); }
});
window.addEventListener('keyup', e=>{ keys[e.key] = false; });

// start
initLevel(1);
score = 0; scoreEl.textContent = score;
last = Date.now();
loop();
