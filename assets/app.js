const pages=[...document.querySelectorAll('.page')], links=[...document.querySelectorAll('.side')];
const commands=[['/돈','AsaEconomy','잔액·원화 경제 기능'],['/캐시','AsaEconomy','캐시 경제 기능'],['/은행','AsaBank 2.0.1','은행 GUI · /계좌 /bank'],['/주식','AsaStock 1.4.0','증권시장 GUI'],['/상점','AsaShop','상점 GUI'],['/상점검색','AsaShop','상점 검색'],['/길드','AsaGuild','길드 GUI'],['/인맥','AsaRelation 0.3.0','인맥·가족·커플·결혼'],['/잠수낚시','AsaAutoFishing','잠수낚시 시작/중지'],['/살림망','AsaAutoFishing','산림망 GUI'],['/잠수낚싯대수리','AsaAutoFishing','전용 낚싯대 수리'],['/잠수낚시자동판매','AsaAutoFishing','자동판매 설정'],['/창고','AsaVault','개인 창고'],['/창고보험','AsaVault','창고 보험 on/off'],['/보험함','AsaVault','보험함 열기'],['/선물함','AsaVault','선물함 열기'],['/뉴스','AsaNews 1.0.2','뉴스·TIP 설정'],['/모드','AsaChatBridge','채팅 모드 변경'],['/외치기','AsaChatBridge','전 서버 외치기'],['/귓','AsaChatBridge','귓속말'],['/답장','AsaChatBridge','귓속말 답장'],['/스킨','AsaSkin','스킨 카테고리'],['/스킨검색','AsaSkin','보유 스킨 검색'],['/배경음악','AsaVolume','개인 BGM ON/OFF'],['/bgm','AsaBGMZone','BGM 기능'],['/등급','AsaVipTicket','등급권 기능'],['/야생파티목록','AsaWilderness','야생 파티 GUI'],['/asamenu','AsaMenu 1.1.0','메인 메뉴 · /메뉴 /menu']];
// Extended player-facing command encyclopedia. Avoid documenting guessed argument syntax.
const wikiMeta={
'/돈':['경제','보유한 원화 잔액을 확인하거나 경제 메뉴를 이용합니다.','/돈','일반 사용자','기존 위키'],
'/캐시':['경제','캐시 잔액과 캐시 관련 기능을 확인합니다. 원화와 구분되는 프리미엄 화폐입니다.','/캐시','일반 사용자','기존 위키'],
'/은행':['경제','은행 GUI를 열어 계좌, 카드, 예금, 대출 등 이용 가능한 금융 메뉴를 확인합니다.','/은행','일반 사용자','기존 위키'],
'/주식':['경제','주식 거래 GUI를 열고 시장 동향, 보유 종목과 주문 기능을 이용합니다.','/주식','일반 사용자','기존 위키'],
'/상점':['경제','ASA 상점 GUI를 엽니다. 상품별로 구매·판매 가능 여부가 다릅니다.','/상점','일반 사용자','기존 위키'],
'/상점검색':['경제','ASA 상점의 상품을 검색합니다. 검색 방식은 게임 내 입력 안내를 따릅니다.','/상점검색','일반 사용자','기존 위키'],
'/길드':['커뮤니티','길드 메뉴를 엽니다. 창설, 가입, 길드원, 성장 혜택 등을 확인하세요.','/길드','일반 사용자','기존 위키'],
'/인맥':['커뮤니티','인맥·커플·가족 관련 GUI를 엽니다. 요청함과 관계 목록을 관리합니다.','/인맥','일반 사용자','기존 위키'],
'/잠수낚시':['생활','전용 낚싯대를 들고 허용된 구역에서 잠수낚시를 시작하거나 종료합니다.','/잠수낚시','일반 사용자 · 조건부','기존 위키'],
'/살림망':['생활','낚시로 획득한 아이템을 보관하는 살림망 GUI를 엽니다.','/살림망','일반 사용자','기존 위키'],
'/잠수낚싯대수리':['생활','전용 낚싯대 수리 메뉴/기능을 이용합니다. 수리 비용과 조건을 확인하세요.','/잠수낚싯대수리','일반 사용자 · 조건부','기존 위키'],
'/잠수낚시자동판매':['생활','자동판매 이용 상태와 설정을 확인합니다. 별도 자동판매권이 필요할 수 있습니다.','/잠수낚시자동판매','별도 이용권','기존 위키'],
'/창고':['편의','AsaVault 개인 창고를 엽니다. 접근 가능한 페이지 수는 등급에 따라 다릅니다.','/창고','일반 사용자','기존 위키'],
'/창고보험':['편의','창고 보험을 켜거나 끕니다. 적용 요율은 등급별로 달라질 수 있습니다.','/창고보험 on','일반 사용자','기존 위키'],
'/보험함':['편의','보험 처리된 보관함을 열어 저장된 아이템을 확인합니다.','/보험함','일반 사용자','기존 위키'],
'/선물함':['편의','운영 보상 또는 선물 지급 내역을 확인하는 선물함을 엽니다.','/선물함','일반 사용자','기존 위키'],
'/뉴스':['안내','서버 뉴스·공지 관련 메뉴를 확인합니다.','/뉴스','일반 사용자','기존 위키'],
'/모드':['채팅','채팅 모드를 변경합니다. 세부 모드 및 사용법은 게임 내 안내를 확인하세요.','/모드','일반 사용자','기존 위키'],
'/외치기':['채팅','다른 서버에 있는 플레이어에게 메시지를 전달하는 전 서버 채팅 기능입니다.','/외치기','일반 사용자 · 조건부','기존 위키'],
'/귓':['채팅','특정 플레이어에게 개인 메시지를 보냅니다. 대상/내용 인수는 서버 안내를 확인하세요.','/귓','일반 사용자','기존 위키'],
'/답장':['채팅','마지막 귓속말에 답장합니다.','/답장','일반 사용자','기존 위키'],
'/스킨':['꾸미기','스킨 카테고리와 소유 목록을 여는 GUI입니다.','/스킨','일반 사용자','기존 위키'],
'/스킨검색':['꾸미기','보유 스킨을 이름으로 검색합니다.','/스킨검색','일반 사용자','기존 위키'],
'/배경음악':['편의','개인 배경음악 재생을 켜고 끕니다.','/배경음악','일반 사용자','기존 위키'],
'/bgm':['편의','BGM 관련 기능/안내를 확인합니다.','/bgm','일반 사용자 · 확인 필요','기존 위키'],
'/등급':['멤버십','VIP 기간제 등급과 이용 상태를 확인하는 기능입니다.','/등급','일반 사용자','기존 위키'],
'/야생파티목록':['모험','야생 파티 목록 또는 이동 선택 GUI를 엽니다.','/야생파티목록','일반 사용자','기존 위키'],
'/asamenu':['안내','ASA 통합 메뉴를 엽니다. 별칭 /메뉴, /menu가 있을 수 있습니다.','/asamenu','일반 사용자','기존 위키'],
'/배틀패스':['성장','30일 시즌 배틀패스 화면과 보상·미션을 확인합니다.','/배틀패스','일반 사용자','2026.11 작업 기록'],
'/퀘스트':['성장','일일·주간 퀘스트 GUI 사용 명령 후보입니다. 실제 명령 등록 여부를 확인해 주세요.','/퀘스트','확인 필요','확인 필요'],
'/spawn':['이동','서버 스폰 지점으로 돌아갑니다.','/spawn','일반 사용자','2026.11 운영 기록'],
'/home':['이동','저장된 홈으로 이동합니다. 홈 개수는 등급에 따라 다릅니다.','/home','일반 사용자','HuskHomes 권한 확인'],
'/sethome':['이동','현재 위치를 홈으로 저장합니다. 이름 지정 구문은 게임 내 도움말을 확인하세요.','/sethome','일반 사용자','HuskHomes 권한 확인'],
'/delhome':['이동','기존에 저장한 홈을 삭제합니다.','/delhome','일반 사용자','HuskHomes 권한 확인'],
'/warp':['이동','서버가 제공하는 공개 워프 지점으로 이동합니다. 일반 유저는 워프를 생성·수정할 수 없습니다.','/warp','일반 사용자','LuckPerms 최종 작업'],
'/warplist':['이동','이동 가능한 워프 목록을 확인합니다.','/warplist','일반 사용자','LuckPerms 최종 작업'],
'/tpa':['이동','다른 플레이어에게 텔레포트 요청을 보냅니다. 상대방의 수락이 필요합니다.','/tpa','일반 사용자','CMI 권한 설정'],
'/tpaccept':['이동','받은 텔레포트 요청을 수락합니다.','/tpaccept','일반 사용자','CMI 권한 설정'],
'/tpdeny':['이동','받은 텔레포트 요청을 거절합니다.','/tpdeny','일반 사용자','CMI 권한 설정'],
'/casino menu':['경제','카지노 메인 GUI를 엽니다. 베팅 가능 여부 및 게임 종류는 카지노 설정을 따릅니다.','/casino menu','일반 사용자','2026.11 운영 기록']
};
for (const [cmd,category,desc,example,access,source] of Object.entries(wikiMeta)){
 if(!commands.some(x=>x[0]===cmd))commands.push([cmd,category,desc]);
}
const categoryEl=document.querySelector('#commandCategory'),filterEl=document.querySelector('#commandFilter'),countEl=document.querySelector('#commandCount');
const categories=[...new Set(Object.values(wikiMeta).map(x=>x[0]))].sort((a,b)=>a.localeCompare(b,'ko'));
for(const cat of categories){const option=document.createElement('option');option.value=cat;option.textContent=cat;categoryEl.append(option)}
function escapeWiki(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderCommands(){const q=(filterEl.value||'').trim().toLowerCase(),cat=categoryEl.value;const filtered=commands.filter(c=>{const m=wikiMeta[c[0]]||['기타',c[2],c[0],'확인 필요','확인 필요'];return (cat==='all'||m[0]===cat)&&[...c,...m].join(' ').toLowerCase().includes(q)});countEl.textContent=filtered.length+'개 명령어';document.querySelector('#cmdGrid').innerHTML=filtered.map(c=>{const m=wikiMeta[c[0]]||['기타',c[2],c[0],'확인 필요','확인 필요'];return `<article class="wikiCommand"><div class="wikiCommandTop"><span class="wikiCmdCat">${escapeWiki(m[0])}</span><span class="wikiCmdAccess ${m[3]==='확인 필요'?'pending':''}">${escapeWiki(m[3])}</span></div><div class="wikiCommandTitle"><code>${escapeWiki(c[0])}</code><button type="button" class="wikiCopy" data-copy-wiki="${escapeWiki(m[2])}" aria-label="${escapeWiki(c[0])} 명령어 복사">⧉ 복사</button></div><p>${escapeWiki(m[1])}</p><details><summary>사용 예시 · 참고</summary><div class="wikiCommandExample"><small>입력 예시</small><code>${escapeWiki(m[2])}</code><button type="button" data-copy-wiki="${escapeWiki(m[2])}">복사</button></div><div class="wikiCmdSource">기준: ${escapeWiki(m[4])} · ${escapeWiki(c[1])}</div></details></article>`}).join('')||'<div class="wikiEmpty">검색 결과가 없습니다. 다른 키워드를 입력해 보세요.</div>'}
filterEl.addEventListener('input',renderCommands);categoryEl.addEventListener('change',renderCommands);renderCommands();
document.querySelector('#cmdGrid').addEventListener('click',async e=>{const btn=e.target.closest('[data-copy-wiki]');if(!btn)return;const value=btn.getAttribute('data-copy-wiki');try{await navigator.clipboard.writeText(value)}catch(_){const temp=document.createElement('textarea');temp.value=value;document.body.append(temp);temp.select();document.execCommand('copy');temp.remove()}const toast=document.querySelector('#toast');toast.textContent=value+' 복사 완료';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)});

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
