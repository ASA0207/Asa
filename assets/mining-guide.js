(() => {
  'use strict';
  const root = document.querySelector('[data-page="mining"]');
  if (!root) return;
  const ores = JSON.parse(root.querySelector('#mine-data').textContent);
  const byId = id => root.querySelector('#mine-' + id);
  const forms = [
    { key: 'stone', label: '일반석', id: key => key + '_ore' },
    { key: 'deep', label: '심층암', id: key => 'deepslate_' + key + '_ore' },
    { key: 'nether', label: '네더', id: key => key + '_nether_ore' },
    { key: 'end', label: '엔드', id: key => key + '_end_ore' }
  ];
  const format = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 });
  const rank = number => String(number).padStart(2, '0');
  const numberInRange = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const keyText = value => String(value).normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
  const stageButtons = Array.from(root.querySelectorAll('[data-mine-open]'));
  const variants = Array.from(root.querySelectorAll('[data-mine-variant]'));
  const searchItems = ores.map(ore => ({
    number: ore.n,
    text: keyText([ore.name, ore.key, ore.dim, ore.n+'단계', rank(ore.n), '광물 채굴 광석 곡괭이',
      ...forms.map(form => ore.ns + ':' + form.id(ore.key)), ore.pickid, ore.ns+':'+ore.key+'_ingot', ore.ns+':raw_'+ore.key].join(' '))
  }));
  function matches(ore, query) {
    const needle = keyText(query);
    if (!needle) return true;
    return needle.split(/\s+/).every(word => {
      const numeric = word.match(/^(\d+)(?:단계)?$/);
      return numeric ? ore.n === Number(numeric[1]) : searchItems[ore.n - 1].text.includes(word);
    });
  }
  let stage = 1;
  let variant = 0;
  let shareTimer;
  function stageHash() {
    return '#mining?tier=' + stage + '&v=' + forms[variant].key;
  }
  function updateLocation() {
    if (!/^#mining(?:\?|$)/.test(location.hash)) return;
    try { history.replaceState(history.state, '', stageHash()); }
    catch (_) { /* file URLs can restrict replacing history */ }
  }
  function showStage(number, form, writeURL = true) {
    if (!numberInRange(number, 1, 16)) return;
    stage = number;
    const ore = ores[stage - 1];
    const best = ore.loc.findIndex(row => row.chance === Math.max(...ore.loc.map(item => item.chance)));
    variant = numberInRange(form, 0, 3) ? form : best;
    const current = forms[variant];
    const location = ore.loc[variant];
    const figure = byId('display');
    figure.style.setProperty('--mine-flare', ore.color);
    byId('object').firstElementChild.style.setProperty('--mine-block', 'url("' + ore.images[current.key] + '")');
    byId('name').textContent = ore.name;
    byId('stage').textContent = rank(stage) + '단계';
    byId('coordinate').textContent = rank(stage) + ' / 16';
    byId('object-caption').textContent = ore.name + ' · ' + current.label;
    byId('favored').textContent = ore.dim + ' 추천';
    byId('required').textContent = ore.tool;
    byId('next-name').textContent = stage < ores.length ? rank(stage + 1) + ' · ' + ores[stage].name : '최종 단계';
    byId('height').textContent = 'Y ' + location.low + ' ~ ' + location.high;
    byId('chance').textContent = format.format(location.chance) + '%';
    byId('vein').textContent = format.format(location.size) + '블록';
    byId('ingot-img').src = ore.images.ingot;
    byId('pick-img').src = ore.images.pick;
    byId('craft').textContent = '제작대 맨 윗줄에 ' + ore.name + ' 주괴 3개를 놓고, 가운데 칸과 그 아래 칸에 막대기 1개씩을 놓으세요.';
    const rawName = '거친 ' + ore.name;
    byId('price').textContent = ore.page + '페이지에서 ‘' + rawName +
      '’을 우클릭한 뒤 판매 수량을 고르고 ‘✔ 판매 확정’을 누르세요. ' +
      '1개 기본가 · 판매 ' + format.format(ore.sell) + '원 / 구매 ' + format.format(ore.buy) + '원';
    byId('id').textContent = ore.ns + ':' + current.id(ore.key);
    byId('previous').disabled = stage === 1;
    byId('next').disabled = stage === ores.length;
    clearTimeout(shareTimer); byId('share').textContent = '단계 링크 복사';
    byId('share-link').hidden = true;
    variants.forEach((button,i) => button.setAttribute('aria-pressed',String(i === variant)));
    stageButtons.forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.mineOpen) === stage)));
    if (writeURL) updateLocation();
  }
  function syncHash() {
    const match = location.hash.match(/^#mining(?:\?(.*))?$/);
    if (!match) return;
    const params = new URLSearchParams(match[1] || '');
    const requested = Number(params.get('tier'));
    if (!params.has('tier')) return;
    if (numberInRange(requested, 1, 16)) showStage(requested, forms.findIndex(f => f.key === params.get('v')), false);
  }
  function focusStage(number) {
    showStage(number);
    const target = byId('detail');
    target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
    target.scrollIntoView({behavior:reducedMotion() ? 'instant' : 'smooth', block:'start'});
  }
  stageButtons.forEach(button => button.addEventListener('click', () => focusStage(Number(button.dataset.mineOpen))));
  root.querySelectorAll('[data-mine-hero]').forEach(button => button.addEventListener('click',() => focusStage(Number(button.dataset.mineHero))));
  variants.forEach((button,i) => button.addEventListener('click', () => showStage(stage, i)));
  byId('previous').addEventListener('click', () => showStage(stage - 1));
  byId('next').addEventListener('click', () => showStage(stage + 1));
  byId('to-order').addEventListener('click', () => {
    byId('query').focus({preventScroll:true});
    byId('order-title').scrollIntoView({behavior:reducedMotion() ? 'instant' : 'smooth', block:'start'});
  });
  const searchInput = byId('query');
  searchInput.addEventListener('input', () => {
    const found = new Set(ores.filter(ore => matches(ore,searchInput.value)).map(ore => ore.n));
    root.querySelectorAll('[data-mine-tier]').forEach(li => { li.hidden = !found.has(Number(li.dataset.mineTier)); });
    root.querySelectorAll('[data-mine-band]').forEach(section => { section.hidden = !section.querySelector('li:not([hidden])'); });
    byId('empty').hidden = found.size !== 0;
    byId('hits').textContent = '광물 ' + found.size + '종';
  });
  const tool = byId('tool');
  function describeTool(selectStage) {
    const value = tool.value;
    const number = Number(value);
    let text = '';
    if (value !== '' && numberInRange(number,0,16)) {
      const last = Math.min(16,number + 1);
      text = number >= 15 ? '모든 광물을 채굴할 수 있어요. 최종 광물은 16단계 루비스입니다.' : '채굴 가능 ' + (last === 1 ? '1단계' : '1~'+last+'단계') + ' · 다음 목표 ' + ores[last - 1].name;
      if (selectStage) showStage(last);
    }
    byId('tool-status').textContent = text;
  }
  tool.addEventListener('change', () => {
    try { if (tool.value === '') localStorage.removeItem('asa-mining-pick-v1'); else localStorage.setItem('asa-mining-pick-v1', tool.value); } catch (_) {}
    describeTool(true);
  });
  try {
    const saved = localStorage.getItem('asa-mining-pick-v1');
    if (saved !== null && /^\d+$/.test(saved) && numberInRange(Number(saved),0,16)) tool.value = saved;
  } catch (_) {}
  byId('share').addEventListener('click', async () => {
    const link = new URL(window.location.href);
    link.hash = stageHash();
    const target = location.protocol === 'file:' ? link.hash : link.href;
    try {
      if (!navigator.clipboard?.writeText) throw new Error();
      await navigator.clipboard.writeText(target);
      byId('share').textContent = '링크 복사됨';
      clearTimeout(shareTimer); shareTimer=setTimeout(() => { byId('share').textContent='단계 링크 복사'; },1800);
    } catch (_) {
      const field=byId('share-link');field.value=target;field.hidden=false;field.focus();field.select();
    }
  });
  window.ASAMiningGuide = Object.freeze({
    search(query,limit = 5) {
      const needle=keyText(query);
      if (!needle) return [];
      return ores.filter(ore => matches(ore,needle)).slice(0,limit).map(ore => ({
        title: rank(ore.n)+'단계 · '+ore.name,
        subtitle: '광물 도감 · '+ore.dim+' 추천 · '+ore.tool+' 이상',
        href: '#mining?tier='+ore.n
      }));
    }
  });
  showStage(1,0,false);
  const linked = /^#mining\?/.test(location.hash) && new URLSearchParams(location.hash.split("?")[1]).has("tier");
  describeTool(!linked); syncHash();
  window.addEventListener('hashchange',syncHash);
})();
