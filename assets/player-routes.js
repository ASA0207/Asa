(() => {
  'use strict';
  const panel = document.querySelector('[data-page="quick"]');
  if (!panel) return;
  const cards = [...panel.querySelectorAll('details[data-player-path]')];
  const chips = [...panel.querySelectorAll('[data-path-group]')];
  const input = document.getElementById('pathQuery');
  const status = document.getElementById('pathCount');
  const empty = document.getElementById('pathEmpty');
  const normal = value => String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
  const terms = value => normal(value).replace(/^\/+/, '').split(' ').filter(Boolean);
  const entries = cards.map(card => ({
    card, id:card.dataset.playerPath, category:card.dataset.category,
    title:card.querySelector('h3').textContent, subtitle:card.querySelector('.path-preview').textContent,
    words:normal([card.querySelector('h3').textContent,card.dataset.search,card.textContent].join(' ')),
    queries:(card.dataset.search||'').split('|').map(normal)
  }));
  const byRoute = new Map(entries.map(item => [item.id,item]));
  const commandIndex = JSON.parse(document.getElementById('pathCommandMap').textContent);
  let category = '';
  function score(entry, query) {
    const tokens = terms(query);
    if (!tokens.length) return 0;
    const phrase = tokens.join(' ');
    if (entry.queries.includes(phrase)) return 12;
    if (normal(entry.title).includes(phrase)) return 8;
    return tokens.every(token => entry.words.includes(token)) ? 1 : -1;
  }
  function search(query, limit=4) {
    if (!normal(query)) return [];
    const hasSlash = String(query).trim().startsWith('/');
    return entries.map(entry=>({entry,rank:score(entry,query)}))
      .filter(({rank})=>hasSlash ? rank>=12 : rank>=1)
      .sort((a,b)=>b.rank-a.rank).slice(0,limit)
      .map(({entry})=>({title:entry.title,subtitle:entry.subtitle,href:'#quick?path='+entry.id}));
  }
  function forCommand(id) {
    const entry = byRoute.get(commandIndex[id]);
    return entry ? {title:entry.title,subtitle:entry.subtitle,href:'#quick?path='+entry.id} : null;
  }
  window.ASAPlayerRoutes = Object.freeze({search,forCommand});
  function render() {
    let count=0;
    for(const entry of entries) {
      entry.card.hidden=Boolean(category && entry.category!==category || score(entry,input.value)<0);
      if(!entry.card.hidden)count++;
    }
    for(const chip of chips)chip.setAttribute('aria-pressed',String(chip.dataset.pathGroup===category));
    status.textContent=count+'개 경로';
    empty.hidden=count>0;
  }
  input.addEventListener('input',render);
  for(const chip of chips)chip.addEventListener('click',()=>{category=chip.dataset.pathGroup;render();});
  function sync() {
    const [name,query='']=location.hash.slice(1).split('?');
    if(name!=='quick')return;
    const params=new URLSearchParams(query);
    const selected=byRoute.get(params.get('path'));
    if(!selected)return;
    category='';input.value='';render();
    for(const entry of entries)entry.card.open=entry===selected;
    requestAnimationFrame(()=>{
      if(location.hash.slice(1).split('?')[0]!=='quick')return;
      selected.card.scrollIntoView({block:'start',behavior:'instant'});
      selected.card.querySelector('summary').focus({preventScroll:true});
    });
  }
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="#quick?path="]');
    if(anchor && anchor.hash===location.hash)sync();
  });
  document.addEventListener('asa:route',sync);
  render();
})();
