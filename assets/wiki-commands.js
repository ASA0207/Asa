(() => {
  'use strict';
  const source = window.ASA_WIKI_COMMANDS;
  const view = document.querySelector('.cwiki-page[data-page="commands"]');
  if (!source || !view) return;
  const rows = source.records.map(values => Object.fromEntries(source.fields.map((k, i) => [k, values[i]])));
  const idMap = new Map(rows.map(row => [row.id, row]));
  const jars = new Map(source.jars.map(([plugin, site, ver, jar]) => [plugin+'|'+site, {ver, jar}]));
  const overlaps = new Map();
  for (const [name, site, plugin, main] of source.collisions) {
    const key = name.toLowerCase();
    if (!overlaps.has(key)) overlaps.set(key, []);
    overlaps.get(key).push({name, site, plugin, main});
  }
  const quickRanks = new Map(source.quickIds.map((id, i) => [id, i]));
  const rank = row => quickRanks.has(row.id) ? quickRanks.get(row.id) : (row.plugin.startsWith('Asa') ? 100 : 200) + (row.kind==='세부' ? 1 : 0);
  rows.sort((a,b) => rank(a) - rank(b) || a.plugin.localeCompare(b.plugin,'en') || a.root.localeCompare(b.root,'ko') || a.usage.localeCompare(b.usage,'ko'));
  const normal = s => String(s || '').normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g,' ').trim();
  const initials = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const hangulInitials = s => Array.from(s, c => {
    const n = c.charCodeAt(0)-0xac00;
    return n>=0 && n<11172 ? initials[Math.floor(n/588)] : c;
  }).join('').normalize('NFKC').replace(/\s+/g, '');
  const splitAliases = s => String(s || '').split(/,\s+/).filter(Boolean);
  for (const r of rows) {
    const alternate = splitAliases(r.rootAliases).map(a => a+r.usage.substring(r.root.length));
    const forms = [r.usage,r.root,r.aliases,...alternate];
    r.searchCode = normal(forms.join(' '));
    r.searchAll = normal([r.searchCode,r.plugin,r.desc,r.example,r.perm,r.basePerm,r.site].join(' '));
    r.searchInitials = hangulInitials(forms.join(' '));
  }
  function words(q) {
    return q.trim().split(/\s+/u).filter(Boolean).map(raw => ({
      value: normal(raw), initials:/^[ㄱ-ㅎ]+$/u.test(raw)
    }));
  }
  function relevance(r,tokens,q) {
    if (!tokens.length) return 1;
    if (!tokens.every(t => r.searchAll.includes(t.value) || t.initials && r.searchInitials.includes(t.value))) return -1;
    const bare = normal(q).replace(/^\/+/, '');
    const usage = normal(r.usage).replace(/^\/+/, '');
    const aliases = splitAliases(r.aliases).map(a=>normal(a).replace(/^\/+/, ''));
    if (usage===bare || aliases.includes(bare)) return 40;
    if (usage.startsWith(bare+' ') || usage.startsWith(bare+'<')) return 30;
    if (r.searchCode.includes(normal(q))) return 20;
    return tokens.reduce((n,t)=>n+(r.searchCode.includes(t.value)?3:1),0);
  }
  function ranked(q, subset=rows) {
    if (!q.trim()) return subset;
    const tokens = words(q);
    return subset.map(r=>[relevance(r,tokens,q),r]).filter(([score])=>score>=0)
      .sort((a,b)=>b[0]-a[0]).map(v=>v[1]);
  }
  function link(id) { return '#commands?id='+encodeURIComponent(id); }
  window.ASACommandGuide = Object.freeze({
    search(q,limit=8) {
      return ranked(String(q||'').slice(0,200)).slice(0,Math.min(100,Math.max(0,Number(limit)||0))).map(r=>({
        title:r.usage, subtitle:r.plugin+' · '+r.desc, href:link(r.id)
      }));
    }
  });
  const get = id => document.getElementById(id);
  const ui = {
    q:get('cwQuery'),plugin:get('cwPlugin'),kind:get('cwKind'),site:get('cwSite'),
    reset:get('cwReset'), saved:get('cwSaved'), count:get('cwCount'), list:get('cwList'),
    prev:get('cwPrev'),next:get('cwNext'), pageNum:get('cwPageNum'), title:get('cwListTitle')
  };
  const pageSize=24, bookmarkKey='asa-wiki:command-bookmarks:v1';
  const saved = new Set();
  try {
    const list = JSON.parse(localStorage.getItem(bookmarkKey)||'[]');
    if (Array.isArray(list)) for (const id of list) if (idMap.has(id)) saved.add(id);
  } catch {}
  let page=1, savedOnly=false, frequentOnly=false, focused='', items=[], invalidId=false;
  function node(tag,text,classes) {
    const n=document.createElement(tag);
    if (text!==undefined) n.textContent=text;
    if (classes) n.className=classes;
    return n;
  }
  function button(label,action) {
    const b=node('button',label); b.type='button'; b.addEventListener('click',action);return b;
  }
  for (const plugin of [...new Set(rows.map(r=>r.plugin))].sort((a,b)=>a.localeCompare(b,'en'))) ui.plugin.add(new Option(plugin,plugin));
  async function copy(value,b) {
    const initial=b.dataset.original||b.textContent;
    b.dataset.original=initial;
    let copied=false;
    try {await navigator.clipboard.writeText(value);copied=true;} catch {}
    if (!copied) {
      const t=node('textarea');t.value=value;t.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.append(t);t.select();
      try {copied=document.execCommand('copy');} catch {}
      t.remove();b.focus({preventScroll:true});
    }
    b.textContent=copied?'복사됨':'직접 선택해 복사';
    clearTimeout(b._cwTimer); b._cwTimer=setTimeout(()=>{b.textContent=initial;},1700);
  }
  function copyButton(label,value) {
    const b=button(label,()=>copy(value,b));return b;
  }
  function updateMarkCount() {
    ui.saved.setAttribute('aria-pressed',String(savedOnly));
    get('cwFrequent').setAttribute('aria-pressed',String(frequentOnly));
    get('cwFavCount').textContent=String(saved.size);
  }
  function toggleBookmark(row,b) {
    if (saved.has(row.id)) saved.delete(row.id);else saved.add(row.id);
    try {localStorage.setItem(bookmarkKey,JSON.stringify([...saved]));} catch {}
    updateMarkCount();
    b.textContent=saved.has(row.id)?'★ 저장됨':'☆ 저장';
    b.classList.toggle('is-saved',saved.has(row.id)); b.setAttribute('aria-pressed',String(saved.has(row.id)));
    if (savedOnly && !saved.has(row.id)) draw();
  }
  function detailBody(row) {
    const box=node('div',undefined,'cwiki-expanded'), dl=node('dl');
    function field(label,val,mono=false,cls='') {
      if (!val) return;
      dl.append(node('dt',label));
      const dd=node('dd');dd.append(node(mono?'code':'span',val,cls));dl.append(dd);
    }
    field('입력 예시',row.example,true,'cwiki-example');
    field(row.kind==='기본'?'별칭':'다른 입력',row.aliases,true);
    field('기본 명령 별칭',row.rootAliases,true);
    field('권한·조건',row.perm,true);
    if (row.basePerm && row.basePerm!==row.perm) field('기본 명령 권한',row.basePerm,true);
    if (!row.perm && !row.basePerm) field('권한','확인한 자료에 별도 표기 없음');
    field('선언 기본값',row.defaultPerm);
    const conflictKeys=[row.root,...splitAliases(row.rootAliases),...splitAliases(row.aliases)]
      .map(k=>k.split(' ')[0].toLowerCase());
    const conflicts=new Set();
    for (const k of conflictKeys) {
      const other=(overlaps.get(k)||[]).filter(p=>p.plugin!==row.plugin);
      if (other.length) conflicts.add(k+' · '+[...new Set(other.map(o=>o.plugin))].join(', '));
    }
    field('이름을 함께 쓰는 플러그인',[...conflicts].join(' / '));
    const jar=jars.get(row.plugin+'|'+row.site);
    field('확인한 파일',jar?jar.jar+' · 내부 버전 '+jar.ver:'');
    field('명령 등록 근거',row.source,true);
    box.append(dl);
    const route=window.ASAPlayerRoutes?.forCommand(row.id);
    if(route) {
      const guide=node('a','게임에서 여는 방법 · '+route.subtitle,'cwiki-open-route');
      guide.href=route.href;
      box.append(guide);
    }
    const controls=node('div',undefined,'cwiki-row-actions');
    controls.append(copyButton('구문 복사',row.usage));
    if (row.example) controls.append(copyButton('예시 복사',row.example));
    const mark=button(saved.has(row.id)?'★ 저장됨':'☆ 저장',()=>toggleBookmark(row,mark));
    mark.classList.toggle('is-saved',saved.has(row.id));mark.setAttribute('aria-pressed',String(saved.has(row.id)));
    const url=new URL(location.href);url.hash=link(row.id);
    controls.append(mark,copyButton('링크 복사',url.protocol==='file:'?'./index.html'+link(row.id):url.href));
    box.append(controls);return box;
  }
  function card(row,isFocused) {
    const entry=node('details',undefined,'cwiki-result'),summary=node('summary');
    const meta=node('span',undefined,'cwiki-metadata'), main=node('span',undefined,'cwiki-summary-main');
    meta.append(node('b',row.plugin),node('small',row.site+' · '+row.kind));
    main.append(node('code',row.usage),node('span',row.desc));
    summary.append(meta,main);entry.append(summary);
    entry.addEventListener('toggle',()=>{if(entry.open && entry.children.length===1) entry.append(detailBody(row));});
    if(isFocused){entry.open=true;entry.append(detailBody(row));}
    return entry;
  }
  function storeHash() {
    if (!location.hash.startsWith('#commands')) return;
    const p=new URLSearchParams();
    for(const key of ['q','plugin','kind','site']) if(ui[key].value) p.set(key,ui[key].value);
    if(frequentOnly)p.set('frequent','1');if(savedOnly)p.set('saved','1');if(page>1)p.set('page',String(page));if(focused)p.set('id',focused);
    const query=p.toString(); const next='#commands'+(query?'?'+query:'');
    if(location.hash!==next)try {history.replaceState(history.state,'',next);} catch {}
  }
  function draw(updateUrl=true) {
    if (focused&&idMap.has(focused)) items=[idMap.get(focused)];
    else if (invalidId) items=[];
    else {
      const filtered=rows.filter(r=>(!ui.plugin.value||r.plugin===ui.plugin.value)&&(!ui.kind.value||r.kind===ui.kind.value)
        &&(!ui.site.value||r.site===ui.site.value)&&(!savedOnly||saved.has(r.id))&&(!frequentOnly||quickRanks.has(r.id)));
      items=ranked(ui.q.value,filtered);
    }
    const totalPages=Math.max(1,Math.ceil(items.length/pageSize));page=Math.max(1,Math.min(page,totalPages));
    const start=(page-1)*pageSize,frag=document.createDocumentFragment();
    for (const r of items.slice(start,start+pageSize)) frag.append(card(r,focused===r.id));
    if (!items.length) {
      const msg=invalidId?'이 링크에 해당하는 명령을 찾을 수 없습니다.':savedOnly&&!saved.size?'저장한 명령이 없습니다. 명령을 펼치고 ☆ 저장을 누르세요.':'일치하는 명령이 없습니다. 다른 검색어나 필터를 시도해 보세요.';
      const blank=node('div',undefined,'cwiki-blank');blank.append(node('p',msg),button('전체 명령 보기',reset));frag.append(blank);
    }
    ui.list.replaceChildren(frag);
    ui.title.textContent=focused&&!invalidId?'선택한 명령':savedOnly?'저장한 명령':frequentOnly?'자주 쓰는 명령어':ui.q.value||ui.plugin.value||ui.kind.value||ui.site.value?'검색 결과':'전체 명령어';
    ui.count.textContent=items.length.toLocaleString('ko-KR')+'건';
    ui.pageNum.textContent=items.length?page.toLocaleString('ko-KR')+' / '+totalPages.toLocaleString('ko-KR')+' 페이지':'0건';
    ui.prev.disabled=page<=1; ui.next.disabled=page>=totalPages;
    updateMarkCount();if(updateUrl) storeHash();
  }
  function reset(){
    for(const k of ['q','plugin','kind','site'])ui[k].value='';
    savedOnly=false;frequentOnly=false;focused='';invalidId=false;page=1;draw();
  }
  function edit() {focused='';invalidId=false;page=1;draw();}
  function loadRoute() {
    const [route,query='']=location.hash.slice(1).split('?');
    if(route!=='commands') return;
    const p=new URLSearchParams(query);
    for (const k of ['q','plugin','kind','site'])ui[k].value=(p.get(k)||'').slice(0,250);
    frequentOnly=p.get('frequent')==='1';savedOnly=p.get('saved')==='1'; focused=p.get('id')||'';invalidId=!!focused&&!idMap.has(focused);
    page=Math.max(1,parseInt(p.get('page'),10)||1);
    draw(false);
  }
  for (const k of ['kind','site','plugin']) ui[k].addEventListener('change',edit);
  ui.q.addEventListener('input',edit);ui.reset.addEventListener('click',reset);
  ui.saved.addEventListener('click',()=>{savedOnly=!savedOnly; edit();});
  get('cwFrequent').addEventListener('click',()=>{frequentOnly=!frequentOnly;edit();});
  function turn(dir) {page+=dir;draw();ui.title.scrollIntoView({block:'center',behavior:'instant'});}
  ui.prev.addEventListener('click',()=>turn(-1));ui.next.addEventListener('click',()=>turn(1));
  document.addEventListener('keydown',ev=>{
    if (ev.key!=='/'||ev.shiftKey||ev.ctrlKey||ev.metaKey||ev.altKey||!view.classList.contains('active')||ev.target.isContentEditable||ev.target.closest('input,textarea,select')||document.querySelector('#searchModal.open, #asaIntro:not(.hide):not(.hidden):not([hidden])[aria-modal="true"]:focus-within'))return;
    ev.preventDefault();ui.q.focus();
  });
  addEventListener('hashchange',loadRoute);
  if(location.hash.split('?')[0]==='#commands')loadRoute();else updateMarkCount();
})();
