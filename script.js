
const $ = (s, r=document)=> r.querySelector(s);
const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));

// Elements
const startBtn = $('#startBtn');
const balloonsLayer = $('#balloons');
const tulipsLayer = $('#tulips');
const wish = $('#wish');
const replayBtn = $('#replayBalloons');
const toPuzzleBtn = $('#toPuzzle');

function releaseBalloonsAndTulips(){
  // balloons
  balloonsLayer.innerHTML='';
  tulipsLayer.innerHTML='';
  balloonsLayer.classList.remove('hidden');
  tulipsLayer.classList.remove('hidden');
  const colors = ['#b388ff','#d0b6ff','#ffc6ff','#a5b4fc','#c7d2fe','#fbcfe8'];
  const count = 26;
  for(let i=0;i<count;i++){
    const b = document.createElement('div');
    const size = Math.round(38 + Math.random()*28);
    b.className='balloon';
    b.style.left = Math.round(Math.random()*100)+'vw';
    b.style.bottom = '-20vh';
    b.style.width = size+'px';
    b.style.height = Math.round(size*1.35)+'px';
    b.style.background = colors[Math.floor(Math.random()*colors.length)];
    b.style.animation = `floatUp ${15+Math.random()*10}s linear ${Math.random()*3}s forwards`;
    balloonsLayer.appendChild(b);
  }
  // tulips (SVG) floating up gently
  const tulipCount = 12;
  for(let i=0;i<tulipCount;i++){
    const t = document.createElement('div');
    t.className='tulip';
    t.style.left = Math.round(Math.random()*100)+'vw';
    t.style.bottom = '-10vh';
    t.style.animation = `floatUp ${18+Math.random()*8}s linear ${Math.random()*4}s forwards, sway 4s ease-in-out ${Math.random()*2}s infinite`;
    t.innerHTML = `
      <svg viewBox="0 0 60 90" width="60" height="90">
        <g>
          <path d="M30 90 C30 70, 30 60, 30 45" stroke="#6d28d9" stroke-width="3" fill="none"/>
          <path d="M30 60 C20 55, 10 65, 18 70 C24 72, 25 70, 30 66" fill="#7c3aed" opacity=".6"/>
          <path d="M30 60 C40 55, 50 65, 42 70 C36 72, 35 70, 30 66" fill="#7c3aed" opacity=".6"/>
          <path d="M30 50 C20 45, 20 30, 30 30 C40 30, 40 45, 30 50" fill="#c084fc"/>
          <path d="M24 26 C27 32, 33 32, 36 26 C33 21, 27 21, 24 26" fill="#a78bfa"/>
        </g>
      </svg>`;
    tulipsLayer.appendChild(t);
  }
  // auto hide after a while
  setTimeout(()=>{balloonsLayer.classList.add('hidden'); tulipsLayer.classList.add('hidden');}, 22000);
}

startBtn?.addEventListener('click', ()=>{
  releaseBalloonsAndTulips();
  wish.scrollIntoView({behavior:'smooth'});
  const bgm = $('#bgm'); if (bgm && bgm.paused) bgm.play().catch(()=>{});
});
replayBtn?.addEventListener('click', releaseBalloonsAndTulips);
toPuzzleBtn?.addEventListener('click', ()=> $('#puzzle').scrollIntoView({behavior:'smooth'}));

// Sliding puzzle
const grid = $('#puzzleGrid');
const movesEl = $('#moves');
const statusEl = $('#status');
const winMsg = $('#winMsg');
const shuffleBtn = $('#shuffleBtn');

const images = [
  'images/angelina1.jpg',
  'images/angelina3.jpg',
  'images/angelina5.jpg'
];
let imgIndex = 0;
const N = 3;
let empty = N*N-1;
let moves = 0;

function positionTile(el, idx, val){
  const x = idx % N, y = Math.floor(idx / N);
  const ox = val % N, oy = Math.floor(val / N);
  el.style.transform = `translate(${x*100/N}%, ${y*100/N}%)`;
  el.style.width = 100/N+'%';
  el.style.height = 100/N+'%';
  el.style.backgroundImage = `url(${images[imgIndex]})`;
  el.style.backgroundPosition = `${(ox*100/(N-1))}% ${(oy*100/(N-1))}%`;
  el.dataset.idx = idx;
  el.dataset.val = val;
}

function neighbors(i){
  const res=[]; const x=i%N, y=Math.floor(i/N);
  if(x>0) res.push(i-1);
  if(x<N-1) res.push(i+1);
  if(y>0) res.push(i-N);
  if(y<N-1) res.push(i+N);
  return res;
}

function swap(i,j){
  const els = $$('.tile', grid);
  const elI = els.find(e=> +e.dataset.idx===i);
  const elJ = els.find(e=> +e.dataset.idx===j);
  if (elI) { elI.dataset.idx = j; positionTile(elI, j, +elI.dataset.val); }
  if (elJ) { elJ.dataset.idx = i; positionTile(elJ, i, +elJ.dataset.val); }
}

function tryMove(i){
  if (!neighbors(i).includes(empty)) return;
  swap(i, empty);
  empty = i;
  moves++; updateHud();
  if (isSolved()) onSolved();
}

function isSolved(){
  const els = $$('.tile', grid);
  return els.every(e=> +e.dataset.idx === +e.dataset.val);
}

function updateHud(){ movesEl.textContent = moves; }

function setupTiles(){
  grid.style.setProperty('--n', N);
  grid.innerHTML='';
  empty = N*N-1;
  for (let i=0;i<N*N-1;i++){
    const t = document.createElement('button');
    t.className='tile';
    positionTile(t, i, i);
    t.addEventListener('click', ()=> tryMove(i));
    grid.appendChild(t);
  }
  moves=0; updateHud(); statusEl.textContent='Scramble & solve';
}

function scramble(steps=100){
  let count=0; let last=-1;
  const doStep=()=>{
    const ns = neighbors(empty).filter(n=> n!==last);
    const choice = ns[Math.floor(Math.random()*ns.length)];
    swap(choice, empty);
    last = empty; empty = choice; count++;
    if (count<steps) requestAnimationFrame(doStep);
    else statusEl.textContent='Good luck!';
  };
  doStep();
}

shuffleBtn.addEventListener('click', ()=>{
  winMsg.classList.add('hidden');
  imgIndex = (imgIndex+1) % images.length;
  setupTiles();
  setTimeout(()=> scramble(120), 50);
});

function onSolved(){
  statusEl.textContent='Solved!';
  winMsg.classList.remove('hidden');
  releaseBalloonsAndTulips();
}

setupTiles();
setTimeout(()=> scramble(60), 200);

// Birth time live counter
const clock = $('#clock');
const birth = new Date('2008-08-27T13:04:00');
function renderClock(){
  const now = new Date();
  let diff = Math.max(0, now - birth);
  const years = Math.floor(diff / (365.2425*24*3600*1000));
  const currentAnniv = new Date(birth); currentAnniv.setFullYear(birth.getFullYear()+years);
  if (currentAnniv>now) currentAnniv.setFullYear(currentAnniv.getFullYear()-1);
  diff = now - currentAnniv;
  const days = Math.floor(diff / (24*3600*1000)); diff -= days*24*3600*1000;
  const hours = Math.floor(diff / (3600*1000)); diff -= hours*3600*1000;
  const mins = Math.floor(diff / (60*1000)); diff -= mins*60*1000;
  const secs = Math.floor(diff / 1000);
  clock.innerHTML = `
    <div class="tick"><b>${years}</b><span>Years</span></div>
    <div class="tick"><b>${days}</b><span>Days</span></div>
    <div class="tick"><b>${hours}</b><span>Hours</span></div>
    <div class="tick"><b>${mins}</b><span>Minutes</span></div>
    <div class="tick"><b>${secs}</b><span>Seconds</span></div>
  `;
}
renderClock(); setInterval(renderClock, 1000);
