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

function initLevel(l){
  level = l || level;
  levelEl.textContent = level;
  bullets = [];
  aliens = [];
  // rows = 2 + level (adds one row each level)
  const rows = 2 + level;
  const cols = 8;
  const padding = 10;
  const alienW = 36;
  const alienH = 28;
  const startX = 40;
  const startY = 40;
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
  levelTime = Math.max(6, baseLevelTime - (level-1)*2); // decrease time per level
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
  const alienSpeedBase = 20 + level*6;
  const alienSpeed = alienSpeedBase + Math.pow(tFrac,1.5)*80; // speeds up near end

  // move aliens left/right and check bounds
  let shouldReverse = false;
  aliens.forEach(a=>{
    if(!a.alive) return;
    a.x += alienDir * alienSpeed * dt;
    if(a.x < 4 || a.x + a.w > W-4) shouldReverse = true;
  });
  if(shouldReverse){
    alienDir *= -1;
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
    messageEl.textContent = 'Level cleared!';
    setTimeout(()=>{ messageEl.textContent = ''; initLevel(level+1); }, 900);
  }

  // time up -> increase alien downward push (speed already increases) and if still time up and aliens not cleared, they move faster; if time=0 and still aliens, let them continue; when they reach bottom game over handled above
  timerEl.textContent = Math.ceil(timeLeft);
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
}

function gameOver(msg){
  running = false;
  messageEl.textContent = msg + ' Final score: ' + score;
}

// input
window.addEventListener('keydown', e=>{ keys[e.key] = true; if(e.key === ' '){ e.preventDefault(); fire(); } });
window.addEventListener('keyup', e=>{ keys[e.key] = false; });

// start
initLevel(1);
score = 0; scoreEl.textContent = score;
last = Date.now();
loop();
