(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const source = $('asa-field-data');
  if (!source) return;
  const {products, routes, jobs, fees, awakenGold, awakenCount} = JSON.parse(source.textContent);
  const nf = new Intl.NumberFormat('ko-KR', {maximumFractionDigits:2});
  const fold = text => String(text || '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
  const words = text => fold(text).split(' ').filter(Boolean);
  const match = (hay, tokens) => tokens.every(token => hay.includes(token));
  const price = (value, currency) => value == null ? '거래 불가' : nf.format(value) + currency;
  const make = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const categories = ['특수광물','광물','광산 전리품','일반작물','특수작물','특수과일','특수농기구','건축','바닐라잡화','야생잡템'];
  for (const product of products) {
    if (!categories.includes(product.cat)) categories.push(product.cat);
    product.id = product.cat + '-' + product.page + '-' + product.slot;
    product.hay = fold([product.name, product.cat, product.key, ...(routes[product.cat] || []).slice(0,2)].join(' '));
  }
  products.sort((a,b) => categories.indexOf(a.cat)-categories.indexOf(b.cat) || a.page-b.page || a.slot-b.slot);
  for (const job of jobs) job.hay = fold([job.name, job.id, ...job.skills.map(s=>s.name)].join(' '));
  const productById = new Map(products.map(p=>[p.id,p]));
  const parts = () => new URLSearchParams(location.hash.split('?')[1] || '');
  function link(page, params) {
    const query = new URLSearchParams();
    for (const [key,val] of Object.entries(params)) if (val) query.set(key, val);
    return '#' + page + (query.size ? '?' + query : '');
  }
  function remember(url) {
    const notice=$(url.startsWith('#market') ? 'market-notice':'job-notice');
    notice.hidden=true;
    try { history.replaceState(history.state, '', url); } catch { /* Links also work in local files. */ }
  }
  function reveal(id) {
    if (!matchMedia('(max-width:850px)').matches) return;
    const target=$(id);
    target.tabIndex=-1;
    target.focus({preventScroll:true});
    target.scrollIntoView({block:'start'});
  }
  const marketOptions = $('market-category');
  for (const cat of categories) {
    const option = make('option',cat);
    option.value=cat;
    marketOptions.append(option);
  }
  const pageSize = 10;
  let currentPage=1, selected, matches=[];
  const queryInput=$('market-query'), tradeMode=$('market-mode'), amount=$('market-amount');
  function marketLink() {
    return link('market',{q:queryInput.value.trim(),cat:marketOptions.value,trade:tradeMode.value,
      page:currentPage>1?currentPage:'',item:selected?.id,qty:Number(amount.value)>1?amount.value:''});
  }
  function totals() {
    if (!selected) return;
    const n=Number(amount.value);
    const valid=Number.isInteger(n)&&n>=1&&n<=2304;
    amount.setAttribute('aria-invalid', String(!valid));
    for (const side of ['buy','sell']) {
      const val=selected[side];
      $('market-'+side).textContent=valid?price(val==null?null:val*n,selected.currency):'1~2,304개 입력';
    }
  }
  function showProduct() {
    $('market-details').hidden=!selected;
    if (!selected) return;
    $('market-detail-title').textContent=selected.name;
    $('market-meta').textContent=selected.cat+' · 상점 '+selected.page+'쪽';
    const route=routes[selected.cat];
    $('market-route').textContent=route
      ? 'Shift + F → 상점 → '+route[0]+' 우클릭 → 휠로 ‘'+route[1]+'’ 선택 → F로 확정'
      : '상품은 상점 설정에 등록되어 있습니다. 제공된 메뉴와 NPC 대화에서는 이 상점의 입구를 확인할 수 없습니다.';
    $('market-npc').hidden=!route;
    if (route) $('market-npc').href=link('quick',{path:route[2]});
    $('market-permalink').href=link('market',{item:selected.id});
    totals();
  }
  function paintRows() {
    const area=$('market-rows');
    area.replaceChildren();
    for (const product of matches.slice((currentPage-1)*pageSize,currentPage*pageSize)) {
      const btn=make('button',null,'market-row');
      btn.type='button'; btn.dataset.product=product.id;
      btn.setAttribute('aria-pressed',String(selected===product));
      const name=make('span'); name.append(make('strong',product.name),make('small',product.cat));
      btn.append(name,make('span',price(product.buy,product.currency)),make('span',price(product.sell,product.currency)));
      area.append(btn);
    }
    if (!matches.length) area.append(make('p','조건에 맞는 상품이 없습니다. 상품명이나 상점 필터를 바꿔 보세요.','field-empty'));
    const last=Math.max(1,Math.ceil(matches.length/pageSize));
    $('market-count').textContent=nf.format(matches.length)+'개';
    $('market-page').textContent=currentPage+' / '+last;
    $('market-prev').disabled=currentPage<=1;
    $('market-next').disabled=currentPage>=last;
    showProduct();
  }
  function refreshMarket(requestedPage=1, productId) {
    const q=words(queryInput.value), cat=marketOptions.value, mode=tradeMode.value;
    matches=products.filter(p=>(!cat||p.cat===cat) && match(p.hay,q) && (
      !mode || (mode==='off' ? p.buy==null && p.sell==null : p[mode]!=null)));
    const index=productId?matches.findIndex(p=>p.id===productId):-1;
    currentPage=index>=0?Math.floor(index/pageSize)+1:Math.min(Math.max(1,Number(requestedPage)||1),Math.max(1,Math.ceil(matches.length/pageSize)));
    currentPage=Math.floor(currentPage);
    selected=index>=0?matches[index]:matches[(currentPage-1)*pageSize];
    paintRows();
  }
  for (const [node, evt] of [[queryInput,'input'],[marketOptions,'change'],[tradeMode,'change']]) {
    node.addEventListener(evt,()=>{refreshMarket();remember(marketLink());});
  }
  for (const [id, direction] of [['market-prev',-1],['market-next',1]]) {
    $(id).addEventListener('click',()=>{refreshMarket(currentPage+direction);remember(marketLink());});
  }
  $('market-rows').addEventListener('click',e=>{
    const row=e.target.closest('button[data-product]');
    if (!row) return;
    selected=productById.get(row.dataset.product);
    for (const btn of $('market-rows').querySelectorAll('button')) btn.setAttribute('aria-pressed',String(btn===row));
    showProduct();remember(marketLink());reveal('market-detail-title');
  });
  $('market-details').addEventListener('click',e=>{
    const preset=e.target.closest('[data-qty]'); if (!preset) return;
    amount.value=preset.dataset.qty;totals();remember(marketLink());
  });
  amount.addEventListener('input',()=>{totals();if(amount.getAttribute('aria-invalid')==='false')remember(marketLink());});
  const jl=$('job-level'), jq=$('job-query');
  const skillTypes={passive:'패시브',active:'액티브',awakening:'각성'};
  let currentJob=jobs[0];
  function jobLink(){return link('jobs',{job:currentJob?.id,q:jq.value.trim(),lv:Number(jl.value)>1?jl.value:''});}
  function paintSkills(){
    const panel=$('job-title').closest('section');panel.hidden=!currentJob;
    if (!currentJob) return;
    $('job-title').textContent=currentJob.name;
    const level=Number(jl.value), valid=Number.isInteger(level)&&level>=1&&level<=fees['level-cap'];
    jl.setAttribute('aria-invalid',String(!valid));
    const next=currentJob.skills.find(s=>s.level>level);
    $('job-next').textContent=!valid?'1~1,000 사이의 레벨을 입력하세요.':next?'다음 기술 · Lv.'+nf.format(next.level)+' '+next.name:'모든 스킬의 레벨 조건에 도달했습니다.';
    const list=$('job-skills');list.replaceChildren();
    for(const s of currentJob.skills){
      const li=make('li');li.className=valid&&s.level<=level?'level-met':'';
      li.append(make('span','Lv. '+nf.format(s.level),'skill-level'),make('strong',s.name),make('small',skillTypes[s.type]||s.type));list.append(li);
    }
    $('job-fees').textContent='직업 선택 '+price(fees['selection-fee'],'원')+' · 해제 '+price(fees['release-fee'],'원')+' · 각성 비용 '+price(awakenGold,'원')+'과 네더의 별 '+awakenCount+'개';
    $('job-permalink').href=link('jobs',{job:currentJob.id});
  }
  function paintJobs(requested){
    const filtered=jobs.filter(j=>match(j.hay,words(jq.value)));
    currentJob=filtered.find(j=>j.id===requested)||filtered[0];
    $('job-count').textContent=filtered.length+'개';
    const area=$('job-roster');area.replaceChildren();
    for (const job of filtered) {
      const b=make('button', job.name);b.type='button';b.dataset.job=job.id;
      b.setAttribute('aria-pressed',String(job===currentJob));area.append(b);
    }
    if(!filtered.length)area.append(make('p','검색 결과가 없습니다. 다른 직업이나 스킬을 입력해 보세요.','field-empty'));
    paintSkills();
  }
  $('job-roster').addEventListener('click',e=>{
    const b=e.target.closest('[data-job]');if(!b)return;
    currentJob=jobs.find(j=>j.id===b.dataset.job);
    for(const el of $('job-roster').querySelectorAll('button'))el.setAttribute('aria-pressed',String(el===b));
    paintSkills();remember(jobLink());reveal('job-title');
  });
  jq.addEventListener('input',()=>{paintJobs();remember(jobLink());});
  jl.addEventListener('input',()=>{paintSkills();if(jl.getAttribute('aria-invalid')==='false')remember(jobLink());});
  document.addEventListener('asa:route',e=>{
    const p=parts();
    if(e.detail.page==='market'){
      queryInput.value=p.get('q')||'';marketOptions.value=categories.includes(p.get('cat'))?p.get('cat'):'';
      tradeMode.value=['buy','sell','off'].includes(p.get('trade'))?p.get('trade'):'';
      const qty=Number(p.get('qty'));amount.value=Number.isInteger(qty)&&qty>=1&&qty<=2304?String(qty):'1';
      refreshMarket(p.get('page'), p.get('item'));
      const notice=$('market-notice');
      notice.hidden=!p.has('item') || selected?.id===p.get('item');
      if(!notice.hidden)notice.textContent='이 링크의 상품을 현재 목록에서 찾을 수 없습니다. 상품명이나 상점을 다시 선택하세요.';
    }
    if(e.detail.page==='jobs'){
      jq.value=p.get('q')||'';const lv=Number(p.get('lv'));
      jl.value=Number.isInteger(lv)&&lv>=1&&lv<=fees['level-cap']?String(lv):'1';paintJobs(p.get('job'));
      const notice=$('job-notice');
      notice.hidden=!p.has('job') || currentJob?.id===p.get('job');
      if(!notice.hidden)notice.textContent='이 링크의 직업을 현재 목록에서 찾을 수 없습니다. 직업 목록에서 다시 선택하세요.';
    }
  });
  window.ASAFieldGuide={
    search(query){
      const q=fold(query),tokens=words(q);if(!q||q.startsWith('/'))return [];
      const ps=products.filter(p=>match(p.hay,tokens)).sort((a,b)=>Number(fold(b.name)===q)-Number(fold(a.name)===q)).slice(0,3);
      const js=jobs.filter(j=>match(j.hay,tokens)).slice(0,2);
      return [...js.map(j=>({title:j.name,subtitle:'직업 · '+(j.skills.map(s=>s.name).filter(s=>fold(s).includes(q)).join(', ')||'스킬 6종과 해금 레벨'),href:link('jobs',{job:j.id})})),
        ...ps.map(p=>({title:p.name,subtitle:p.cat+' · 구매 '+price(p.buy,p.currency)+' · 판매 '+price(p.sell,p.currency),href:link('market',{item:p.id})}))];
    }
  };
})();
