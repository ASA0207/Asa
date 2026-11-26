(() => {
  'use strict';
  const guide = document.querySelector('.ore-photo-guide');
  if (!guide) return;
  const cards = [...guide.querySelectorAll('[data-ore-card]')];
  const input = guide.querySelector('#ore-photo-search');
  const count = guide.querySelector('#ore-photo-count');
  const empty = guide.querySelector('#ore-photo-empty');
  const labels = {stone:'일반 돌', deep:'심층암', nether:'네더', end:'엔드'};
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g, '');
  const index = cards.map(card => ({card, name:normalize(card.dataset.oreSearch), tier:Number(card.dataset.oreTier)}));
  function filter() {
    const query = normalize(input.value);
    const number = query.match(/^(\d+)(?:단계)?$/);
    let visible = 0;
    for (const item of index) {
      const match = number ? item.tier === Number(number[1]) : item.name.includes(query);
      item.card.hidden = !match;
      if (match) visible++;
    }
    count.textContent = '광물 ' + visible + '종';
    empty.hidden = visible !== 0;
  }
  input.addEventListener('input', filter);
  guide.querySelector('#ore-photo-reset').addEventListener('click', () => {input.value='';filter();input.focus();});
  guide.querySelectorAll('[data-ore-form]').forEach(button => button.addEventListener('click', () => {
    const form = button.dataset.oreForm;
    if (!Object.hasOwn(labels, form)) return;
    guide.querySelectorAll('[data-ore-form]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    for (const card of cards) {
      const cube = card.querySelector('[data-ore-cube]');
      cube.querySelectorAll('img').forEach(image => { image.src='../assets/ore-guide/'+card.dataset.oreKey+'/'+form+'.png'; });
      cube.setAttribute('aria-label', card.querySelector('h3').textContent+' 광석 · '+labels[form]);
      card.querySelector('[data-ore-form-caption]').textContent = labels[form];
    }
  }));
  const dialog = document.querySelector('#ore-photo-dialog');
  let opener;
  guide.querySelectorAll('[data-ore-zoom]').forEach(button => button.addEventListener('click', () => {
    const template = document.getElementById('ore-photo-detail-'+button.dataset.oreZoom);
    if (!template) return;
    opener = button;
    dialog.querySelector('#ore-photo-dialog-body').replaceChildren(template.content.cloneNode(true));
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('.ore-photo-close').focus();
  }));
  dialog.querySelector('.ore-photo-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if(opener && !opener.closest('[hidden]')) opener.focus({preventScroll:true}); });
  dialog.addEventListener('click', event => {
    if(event.target !== dialog) return;
    const box=dialog.getBoundingClientRect();
    if(event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
})();
