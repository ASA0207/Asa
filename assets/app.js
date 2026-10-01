const pages=[...document.querySelectorAll('.page')], links=[...document.querySelectorAll('.side')];
const commands=[['/돈','AsaEconomy','잔액·원화 경제 기능'],['/캐시','AsaEconomy','캐시 경제 기능'],['/은행','AsaBank 2.0.1','은행 GUI · /계좌 /bank'],['/주식','AsaStock 1.4.0','증권시장 GUI'],['/상점','AsaShop','상점 GUI'],['/상점검색','AsaShop','상점 검색'],['/길드','AsaGuild','길드 GUI'],['/인맥','AsaRelation 0.3.0','인맥·가족·커플·결혼'],['/잠수낚시','AsaAutoFishing','잠수낚시 시작/중지'],['/살림망','AsaAutoFishing','산림망 GUI'],['/잠수낚싯대수리','AsaAutoFishing','전용 낚싯대 수리'],['/잠수낚시자동판매','AsaAutoFishing','자동판매 설정'],['/창고','AsaVault','개인 창고'],['/창고보험','AsaVault','창고 보험 on/off'],['/보험함','AsaVault','보험함 열기'],['/선물함','AsaVault','선물함 열기'],['/뉴스','AsaNews 1.0.2','뉴스·TIP 설정'],['/모드','AsaChatBridge','채팅 모드 변경'],['/외치기','AsaChatBridge','전 서버 외치기'],['/귓','AsaChatBridge','귓속말'],['/답장','AsaChatBridge','귓속말 답장'],['/스킨','AsaSkin','스킨 카테고리'],['/스킨검색','AsaSkin','보유 스킨 검색'],['/배경음악','AsaVolume','개인 BGM ON/OFF'],['/bgm','AsaBGMZone','BGM 기능'],['/등급','AsaVipTicket','등급권 기능'],['/야생파티목록','AsaWilderness','야생 파티 GUI'],['/asamenu','AsaMenu 1.1.0','메인 메뉴 · /메뉴 /menu']];
document.querySelector('#cmdGrid').innerHTML=commands.map(x=>`<div class="cmd"><code>${x[0]}</code><b>${x[2]}</b><span>${x[1]}</span></div>`).join('');
const searchDocs=[...document.querySelectorAll('.page')].map(p=>({id:p.dataset.page,title:p.querySelector('h1')?.textContent||'ASA SERVER',text:p.innerText.replace(/\s+/g,' ').slice(0,2000)}));
function route(){let id=(location.hash||'#home').slice(1);if(!document.querySelector(`[data-page="${CSS.escape(id)}"]`))id='home';pages.forEach(p=>p.classList.toggle('active',p.dataset.page===id));links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));window.scrollTo(0,0);document.querySelector('#sidebar').classList.remove('open')}
addEventListener('hashchange',route);route();
const modal=document.querySelector('#searchModal'),input=document.querySelector('#searchInput'),results=document.querySelector('#results');function openSearch(){modal.classList.add('open');setTimeout(()=>input.focus(),30);render('')}function closeSearch(){modal.classList.remove('open')}function render(q){q=q.trim().toLowerCase();let docs=searchDocs.filter(d=>!q||d.title.toLowerCase().includes(q)||d.text.toLowerCase().includes(q));let cmds=commands.filter(c=>q&&(c.join(' ').toLowerCase().includes(q))).slice(0,5);results.innerHTML=[...cmds.map(c=>`<a class="result" href="#commands"><b>${c[0]} · ${c[2]}</b><span>${c[1]}</span></a>`),...docs.slice(0,8).map(d=>`<a class="result" href="#${d.id}"><b>${d.title}</b><span>${d.text.slice(0,90)}…</span></a>`)].join('')||'<div class="result"><b>검색 결과가 없습니다.</b></div>'}document.querySelector('#searchBtn').onclick=openSearch;input.oninput=e=>render(e.target.value);modal.onclick=e=>{if(e.target===modal)closeSearch()};addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape')closeSearch()});results.addEventListener('click',closeSearch);
document.querySelector('#menuBtn').onclick=()=>document.querySelector('#sidebar').classList.toggle('open');
document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copy)}catch(e){const t=document.createElement('textarea');t.value=b.dataset.copy;document.body.append(t);t.select();document.execCommand('copy');t.remove()}let toast=document.querySelector('#toast');toast.textContent=`${b.dataset.copy} 복사 완료`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)});
addEventListener('scroll',()=>{let h=document.documentElement.scrollHeight-innerHeight;document.querySelector('#progress').style.width=(h?scrollY/h*100:0)+'%'});

// Arcade — ASA Wiki background music
(()=>{
  const audio=document.querySelector('#bgmAudio');
  const player=document.querySelector('#bgmPlayer');
  const toggle=document.querySelector('#bgmToggle');
  const volume=document.querySelector('#bgmVolume');
  if(!audio||!player||!toggle||!volume)return;
  const savedVolume=Number(localStorage.getItem('asaWikiBgmVolume'));
  const initialVolume=Number.isFinite(savedVolume)&&savedVolume>=0&&savedVolume<=1?savedVolume:.20;
  audio.volume=initialVolume;
  volume.value=Math.round(initialVolume*100);
  let wanted=localStorage.getItem('asaWikiBgmEnabled')!=='0';
  const sync=()=>{
    const playing=!audio.paused;
    player.classList.toggle('playing',playing);
    toggle.textContent=playing?'Ⅱ':'▶';
    toggle.setAttribute('aria-label',playing?'배경음악 일시정지':'배경음악 재생');
  };
  const play=async()=>{
    wanted=true; localStorage.setItem('asaWikiBgmEnabled','1');
    try{await audio.play();player.classList.remove('autoplayBlocked')}catch(e){player.classList.add('autoplayBlocked')}
    sync();
  };
  const pause=()=>{wanted=false;localStorage.setItem('asaWikiBgmEnabled','0');audio.pause();player.classList.remove('autoplayBlocked');sync()};
  toggle.addEventListener('click',()=>audio.paused?play():pause());
  volume.addEventListener('input',()=>{audio.volume=Number(volume.value)/100;localStorage.setItem('asaWikiBgmVolume',String(audio.volume));if(audio.volume>0&&wanted&&audio.paused)play()});
  audio.addEventListener('play',sync);audio.addEventListener('pause',sync);
  // Intro gate owns the first playback. Never play music behind the entry screen.
  // The user's click/Enter on the gate is the playback gesture, so audible playback
  // starts only after the user explicitly enters ASA WORLD.
  audio.pause();
  audio.currentTime=0;
  sync();
})();

// ===== ASA IMMERSIVE EDITION =====
(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const glow=document.querySelector('#cursorGlow'), heroImg=document.querySelector('#heroImage');
 if(!reduce && matchMedia('(pointer:fine)').matches){
  addEventListener('pointermove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'};if(heroImg&&location.hash.replace('#','')==='home'){const x=(e.clientX/innerWidth-.5)*-14,y=(e.clientY/innerHeight-.5)*-9;heroImg.style.transform=`scale(1.06) translate(${x}px,${y}px)`}}, {passive:true});
  document.querySelectorAll('.feature,.quick>div').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;el.style.setProperty('--mx',x+'px');el.style.setProperty('--my',y+'px');const rx=(.5-y/r.height)*3.5,ry=(x/r.width-.5)*4.5;el.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`}));
  document.querySelectorAll('.feature,.quick>div').forEach(el=>el.addEventListener('pointerleave',()=>el.style.transform=''));
 }
 const flash=document.querySelector('#routeFlash'); addEventListener('hashchange',()=>{if(!flash)return;flash.classList.remove('go');void flash.offsetWidth;flash.classList.add('go')});
 // lightweight ambient star dust
 const c=document.querySelector('#starfield'); if(c&&!reduce){const ctx=c.getContext('2d');let pts=[];function resize(){const d=Math.min(devicePixelRatio||1,1.5);c.width=innerWidth*d;c.height=innerHeight*d;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';ctx.setTransform(d,0,0,d,0,0);pts=Array.from({length:Math.min(90,Math.floor(innerWidth/15))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.2+.2,v:Math.random()*.08+.02,a:Math.random()*.45+.08}))}function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of pts){p.y-=p.v;if(p.y<0)p.y=innerHeight;ctx.beginPath();ctx.fillStyle=`rgba(226,201,151,${p.a})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(draw)}resize();addEventListener('resize',resize);draw()}
 // Easter egg: type ASA — summon the ASA emblem in the center
 let seq=''; let secretTimer;
 addEventListener('keydown',e=>{
  if(e.target.matches?.('input,textarea,[contenteditable="true"]'))return;
  seq=(seq+e.key.toLowerCase()).slice(-3);
  if(seq==='asa'){
   let mark=document.querySelector('#asaSecretMark');
   if(!mark){mark=document.createElement('div');mark.id='asaSecretMark';mark.className='asaSecretMark';mark.setAttribute('aria-hidden','true');mark.innerHTML='<div class="asaSecretMark__logo">ASA</div>';document.body.append(mark)}
   clearTimeout(secretTimer);mark.classList.remove('show');void mark.offsetWidth;mark.classList.add('show');
   secretTimer=setTimeout(()=>mark.classList.remove('show'),1700);seq='';
  }
 });
})();

// Enhanced Arcade player controls (seek/time + metadata-safe autoplay)
(()=>{
 const a=document.querySelector('#bgmAudio'),seek=document.querySelector('#bgmSeek'),cur=document.querySelector('#bgmCurrent'),dur=document.querySelector('#bgmDuration'); if(!a||!seek)return;
 const fmt=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'0:00';
 a.addEventListener('loadedmetadata',()=>dur.textContent=fmt(a.duration));
 a.addEventListener('timeupdate',()=>{if(!seek.matches(':active'))seek.value=a.duration?Math.round(a.currentTime/a.duration*1000):0;cur.textContent=fmt(a.currentTime);dur.textContent=fmt(a.duration)});
 seek.addEventListener('input',()=>{if(a.duration)a.currentTime=Number(seek.value)/1000*a.duration});
})();

// ===== ASA LIGHTWEIGHT GATE V4 =====
(()=>{
 const gate=document.querySelector('#asaIntro'), audio=document.querySelector('#bgmAudio');
 if(!gate)return;
 let entered=false;
 // Hard-stop any restored/browser-initiated playback while the intro is visible.
 if(audio){audio.pause();audio.currentTime=0;}
 const enter=()=>{
  if(entered)return;
  entered=true;
  gate.classList.add('entering');
  document.body.classList.add('asaBooted');
  if(audio){
   audio.pause();
   audio.currentTime=0;
   const savedVolume=Number(localStorage.getItem('asaWikiBgmVolume'));
   audio.volume=Number.isFinite(savedVolume)&&savedVolume>=0&&savedVolume<=1?savedVolume:.22;
   localStorage.setItem('asaWikiBgmEnabled','1');
   // Keep play() directly inside the trusted click/key gesture; do not await animations first.
   const promise=audio.play();
   if(promise&&typeof promise.catch==='function')promise.catch(()=>{});
  }
  setTimeout(()=>{gate.classList.add('done');gate.setAttribute('aria-hidden','true')},900);
  setTimeout(()=>gate.remove(),1500);
 };
 const onKey=e=>{
  if(entered)return;
  if(e.key==='Enter'||e.code==='Enter'||e.code==='NumpadEnter'||e.key===' '||e.code==='Space'){
   e.preventDefault();
   e.stopPropagation();
   enter();
  }
 };
 gate.addEventListener('pointerup',enter,{once:true});
 // Capture at document level so Enter works even if the intro did not receive focus.
 document.addEventListener('keydown',onKey,true);
 const cleanup=new MutationObserver(()=>{if(!document.body.contains(gate)){document.removeEventListener('keydown',onKey,true);cleanup.disconnect();}});
 cleanup.observe(document.body,{childList:true,subtree:true});
 requestAnimationFrame(()=>{try{gate.focus({preventScroll:true})}catch(e){gate.focus()}});
})();

// Interactive ASA world network
(()=>{
 const nodes=[...document.querySelectorAll('.atlasNode')], title=document.querySelector('#atlasTitle'), desc=document.querySelector('#atlasDesc'), icon=document.querySelector('#atlasIcon');
 if(!nodes.length)return;
 nodes.forEach(n=>n.addEventListener('click',()=>{nodes.forEach(x=>x.classList.remove('active'));n.classList.add('active');title.textContent=n.dataset.title||n.querySelector('b')?.textContent||'ASA WORLD';desc.textContent=n.dataset.desc||'ASA 네트워크의 서버입니다.';icon.textContent=n.dataset.icon||'✦';const info=title.closest('.atlasInfo');if(info){info.classList.remove('flash');void info.offsetWidth;info.classList.add('flash')}}));
})();

// Magnetic primary controls + reactive sheen
(()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(pointer:fine)').matches)return;
 document.querySelectorAll('.btn,.bgmToggle').forEach(el=>{
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.09,y=(e.clientY-r.top-r.height/2)*.12;el.style.transform=`translate(${x}px,${y}px)`});
  el.addEventListener('pointerleave',()=>el.style.transform='');
 });
})();
