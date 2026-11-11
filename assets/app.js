/* Shared shell. Every screen and search link uses a relative hash for GitHub project Pages. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const pages = new Map([...document.querySelectorAll('main .page[data-page]')].map(p => [p.dataset.page,p]));
  const sidebar = $('sidebar'), menu = $('menuBtn'), scrim = $('drawerScrim');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const modal = $('searchModal'), input = $('searchInput'), results = $('results');
  let previousPage = '', previousFocus, current = -1, shown = [], toastTimeout;
  const read = (store,key,fallback) => { try { return window[store].getItem(key) ?? fallback; } catch { return fallback; } };
  const write = (store,key,value) => { try { window[store].setItem(key,value); } catch { /* Storage is optional in local previews. */ } };
  const fold = value => String(value || '').normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g,' ').trim();
  const make = (tag, cls, text) => { const n=document.createElement(tag); if(cls)n.className=cls; if(text)n.textContent=text; return n; };
  function toast(message) {
    const t=$('toast'); clearTimeout(toastTimeout); t.textContent=message; t.classList.add('show');
    toastTimeout=setTimeout(()=>t.classList.remove('show'),1650);
  }
  async function copy(text) {
    try { if(!navigator.clipboard?.writeText)throw Error(); await navigator.clipboard.writeText(text); return true; } catch {
      const t=make('textarea'); t.value=text; t.style.cssText='position:fixed;opacity:0;pointer-events:none'; document.body.append(t);
      const from=document.activeElement; t.select(); let ok=false; try{ok=document.execCommand('copy');}catch{} t.remove(); from?.focus({preventScroll:true}); return ok;
    }
  }
  document.addEventListener('click',async e=>{ const b=e.target.closest('[data-copy]'); if(b)toast(await copy(b.dataset.copy)?'서버 주소를 복사했어요.':b.dataset.copy); });
  function drawer(open){
    const isOpen=Boolean(open && matchMedia('(max-width:760px)').matches);
    sidebar.classList.toggle('open',isOpen);scrim.hidden=!isOpen;document.body.classList.toggle('drawer-open',isOpen);
    menu.setAttribute('aria-expanded',String(isOpen));menu.setAttribute('aria-label',isOpen?'탐색 메뉴 닫기':'탐색 메뉴 열기');
    sidebar.inert=!isOpen&&matchMedia('(max-width:760px)').matches;
  }
  menu.addEventListener('click',()=>drawer(!sidebar.classList.contains('open')));
  scrim.addEventListener('click',()=>{drawer(false);menu.focus();});
  matchMedia('(max-width:760px)').addEventListener('change',()=>drawer(false));
  const navLinks=[...document.querySelectorAll('.side, .topbar nav a')];
  const pageName=()=>{ const s=location.hash.slice(1).split('?')[0];return pages.has(s)?s:'home'; };
  const guides = [...pages].map(([id,p])=>{
    const title=p.querySelector('h1')?.textContent.trim()||id;
    const subtitle= p.querySelector('.docHero p,.heroDescription')?.textContent.trim() || ({
      quick:'메인 메뉴에서 누를 버튼과 상점가에서 말을 걸 NPC 찾기',
      commands:'플러그인별 명령어 · 입력 예시 · 권한',
      mining:'16단계 광물 · 필요 곡괭이 · 차원별 채굴 높이',
      legacy:'기존 위키의 GUI 이용 방법'
    })[id] || '';
    const shortText = ['home','quick','commands','mining','legacy','market','jobs'].includes(id)?'':p.textContent.replace(/\s+/g,' ').slice(0,1600);
    return {id,title,subtitle,href:'#'+id,hay:fold(title+' '+subtitle+' '+shortText)};
  });
  function markNavigation(id){
    navLinks.forEach(link=>{const selected=link.hash===(id==='commands' && new URLSearchParams(location.hash.split('?')[1]||'').get('frequent')==='1' ? '#commands?frequent=1' : '#'+id);link.classList.toggle('active',selected);
      if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  }
  document.addEventListener('asa:command-filters',()=>markNavigation(pageName()));
  function route(){
    const id=pageName(), changed=previousPage!==id;
    for(const [key,p] of pages){p.classList.toggle('active',key===id); p.setAttribute('aria-hidden',String(key!==id));}
    markNavigation(id);
    document.title=id==='home'?'ASA SERVER · 공식 위키':(guides.find(g=>g.id===id)?.title||id)+' · ASA SERVER';
    if(changed){window.scrollTo(0,0); if(previousPage){$('app').focus({preventScroll:true});}}
    drawer(false); if(!modal.hidden)closeSearch(false); previousPage=id;
    document.dispatchEvent(new CustomEvent('asa:route',{detail:{page:id}}));
  }
  window.addEventListener('hashchange',route);
  sidebar.addEventListener('click',e=>{if(e.target.closest('a'))drawer(false);});
  document.querySelector('.wiki-skip').addEventListener('click',e=>{e.preventDefault();$('app').focus({preventScroll:true});});
  function progress(){const range=document.documentElement.scrollHeight-innerHeight;$('progress').style.width=(range>0?100*scrollY/range:0)+'%';}
  let scheduled=false;
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{progress();scheduled=false;});}},{passive:true});
  addEventListener('hashchange',()=>requestAnimationFrame(progress));progress();
  function group(title,items){
    if(!items.length)return;
    results.append(make('div','searchGroup',title));
    for(const item of items){
      if(!item || !String(item.href).startsWith('#'))continue;
      const a=make('a','result');a.href=item.href; a.append(make('b','',item.title),make('span','',item.subtitle));results.append(a);shown.push(a);
    }
  }
  function renderSearch(){
    const q=fold(input.value);results.replaceChildren();current=-1;shown=[];
    if(!q){
      group('빠른 이동',['quick','market','jobs','commands','mining','start'].map(id=>guides.find(g=>g.id===id)).filter(Boolean));
      return;
    }
    const token=q.split(' ');
    const docMatches=guides.filter(d=>token.every(t=>d.hay.includes(t))).sort((a,b)=>Number(fold(b.title).includes(q))-Number(fold(a.title).includes(q)));
    const commandHits=window.ASACommandGuide?.search(input.value.trim(),8)||[];
    const minerals=window.ASAMiningGuide?.search(q,5)||[];
    const paths=window.ASAPlayerRoutes?.search(input.value.trim(),4)||[];
    const oreFirst=minerals.some(item=>fold(item.title.split('·').pop())===q) || /^\d+단계$/.test(q);
    if(oreFirst)group('광물',minerals);
    group('게임 이용 방법',paths);
    if(q.startsWith('/')){group('명령어',commandHits);group('광물',minerals);}
    else{
      if(!oreFirst)group('광물',minerals);
      group('상품 · 직업과 스킬',window.ASAFieldGuide?.search(q)||[]);
      group('명령어',commandHits);
    }
    group('가이드',docMatches.slice(0,5));
    if(!shown.length)results.append(make('p','searchEmpty','검색 결과가 없습니다. 명령어 일부나 광물 이름을 입력해 주세요.'));
  }
  function selectResult(i){
    if(!shown.length)return;
    current=(i+shown.length)%shown.length;
    shown.forEach((a,n)=>{if(n===current)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
    shown[current].scrollIntoView({block:'nearest'});
  }
  function openSearch(){
    if(!$('asaIntro').hidden)return;
    drawer(false); previousFocus=document.activeElement; modal.hidden=false;modal.classList.add('open');document.body.classList.add('modal-open');
    input.value='';renderSearch();input.focus({preventScroll:true});
  }
  function closeSearch(restore=true){
    if(modal.hidden)return;
    modal.hidden=true;modal.classList.remove('open');document.body.classList.remove('modal-open'); if(restore)previousFocus?.focus({preventScroll:true});
  }
  $('searchBtn').addEventListener('click',openSearch);$('closeSearch').addEventListener('click',()=>closeSearch());input.addEventListener('input',renderSearch);
  modal.addEventListener('click',e=>{if(e.target===modal)closeSearch();});
  results.addEventListener('click',e=>{if(e.target.closest('a.result'))closeSearch(false);});
  document.addEventListener('keydown',e=>{
    if(e.isComposing||!$('asaIntro').hidden)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();modal.hidden?openSearch():closeSearch();return;}
    if(modal.hidden){
      if(e.key==='Escape'&&sidebar.classList.contains('open')){drawer(false);menu.focus();}
      return;
    }
    if(e.key==='Escape'){e.preventDefault();closeSearch();}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();selectResult(current<0?(e.key==='ArrowDown'?0:shown.length-1):current+(e.key==='ArrowDown'?1:-1));}
    if(e.key==='Enter'&&e.target===input){e.preventDefault();shown[Math.max(current,0)]?.click();}
    if(e.key==='Tab'){const targets=[...modal.querySelectorAll('button,input,.result')];const first=targets[0],last=targets[targets.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  });
  // Only a sound-enabled entry or the player button starts the bundled track.
  const audio=$('bgmAudio'), deck=$('bgmPlayer'), launcher=$('musicLauncher'), toggle=$('bgmToggle'), volume=$('bgmVolume'), seek=$('bgmSeek'), gate=$('asaIntro');
  const saved=Number(read('localStorage','asaWikiBgmVolume','.22'));audio.volume=Number.isFinite(saved)?Math.min(1,Math.max(0,saved)):.22;volume.value=Math.round(audio.volume*100);
  function syncMusic(){const playing=!audio.paused;deck.classList.toggle('playing',playing);launcher.classList.toggle('playing',playing);toggle.textContent=playing?'Ⅱ':'▶';toggle.setAttribute('aria-label',playing?'배경음악 일시정지':'배경음악 재생');}
  function expandMusic(open){deck.classList.toggle('collapsed',!open);launcher.hidden=open;launcher.setAttribute('aria-expanded',String(open));}
  const play=()=>{audio.play()?.catch(()=>toast('음악 재생 버튼을 다시 눌러 주세요.'));};
  toggle.addEventListener('click',()=>{if(audio.paused)play();else audio.pause();});
  volume.addEventListener('input',()=>{audio.volume=Number(volume.value)/100;write('localStorage','asaWikiBgmVolume',String(audio.volume));});
  audio.addEventListener('play',syncMusic);audio.addEventListener('pause',syncMusic);
  launcher.addEventListener('click',()=>{expandMusic(true);toggle.focus({preventScroll:true});});
  $('musicCollapse').addEventListener('click',()=>{expandMusic(false);launcher.focus({preventScroll:true});});
  const fmt=s=>Number.isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
  function clock(){if(!seek.matches(':active'))seek.value=audio.duration?Math.round(audio.currentTime/audio.duration*1000):0;$('bgmCurrent').textContent=fmt(audio.currentTime);$('bgmDuration').textContent=fmt(audio.duration);}
  audio.addEventListener('loadedmetadata',clock);audio.addEventListener('timeupdate',clock);seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value)/1000*audio.duration;});
  let entered=false;function enter(sound){
    if(entered)return;entered=true;
    if(sound)play();else audio.pause();
    write('sessionStorage','asaWikiEntered','1');gate.classList.add('entering');document.body.classList.add('asaBooted');
    setTimeout(()=>{gate.hidden=true;gate.setAttribute('aria-hidden','true');setGateInert(false);$('app').focus({preventScroll:true});},reduced.matches?0:460);
  }
  function setGateInert(on){for(const n of [document.querySelector('.topbar'),$('app'),sidebar,launcher,deck]){if(n===sidebar&&!on)drawer(false);else n.inert=on;}}
  $('enterSound').addEventListener('click',()=>enter(true));$('enterQuiet').addEventListener('click',()=>enter(false));
  gate.addEventListener('keydown',e=>{if(e.key==='Tab'){if(e.shiftKey&&e.target===$('enterSound')){e.preventDefault();$('enterQuiet').focus();}else if(!e.shiftKey&&e.target===$('enterQuiet')){e.preventDefault();$('enterSound').focus();}}});
  syncMusic();expandMusic(false);route();
  if(pageName()==='home' && !read('sessionStorage','asaWikiEntered','')){gate.hidden=false;setGateInert(true);$('enterSound').focus({preventScroll:true});}

  const nodes=[...document.querySelectorAll('.atlasNode')];
  nodes.forEach(n=>{n.setAttribute('aria-pressed',String(n.classList.contains('active')));n.addEventListener('click',()=>{
    nodes.forEach(x=>{x.classList.toggle('active',x===n);x.setAttribute('aria-pressed',String(x===n));});
    $('atlasTitle').textContent=n.dataset.title;$('atlasDesc').textContent=n.dataset.desc;$('atlasIcon').textContent=n.dataset.icon;
  });});
  let sequence='', secretTimer;
  window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,textarea,select,[contenteditable="true"]')||!gate.hidden||!modal.hidden)return;
    sequence=(sequence+e.key.toLowerCase()).slice(-3);if(sequence!=='asa')return;sequence='';
    let mark=$('asaSecretMark');if(!mark){mark=make('div','asaSecretMark');mark.id='asaSecretMark';mark.setAttribute('aria-hidden','true');mark.append(make('div','asaSecretMark__logo','ASA'));document.body.append(mark);}
    clearTimeout(secretTimer);mark.classList.add('show');secretTimer=setTimeout(()=>mark.classList.remove('show'),1500);
  });
})();
