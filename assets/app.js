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

// Promise — SoundStills / ASA Wiki background music
(()=>{
  const audio=document.querySelector('#bgmAudio');
  const player=document.querySelector('#bgmPlayer');
  const toggle=document.querySelector('#bgmToggle');
  const volume=document.querySelector('#bgmVolume');
  if(!audio||!player||!toggle||!volume)return;
  const savedVolume=Number(localStorage.getItem('asaWikiBgmVolume'));
  const initialVolume=Number.isFinite(savedVolume)&&savedVolume>=0&&savedVolume<=1?savedVolume:.22;
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
  // Browsers may reject audible autoplay. Try immediately, then retry on the user's first interaction.
  if(wanted){audio.play().then(()=>{player.classList.remove('autoplayBlocked');sync()}).catch(()=>{player.classList.add('autoplayBlocked');sync();const unlock=()=>{if(wanted)play();document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock)};document.addEventListener('pointerdown',unlock,{once:true});document.addEventListener('keydown',unlock,{once:true})})}else sync();
})();
