(() => {
  const panel = document.querySelector('[data-page="legacy"]');
  if (!panel) return;
  const get = (suffix) => document.getElementById('wiki-legacy-' + suffix);
  const query = get('query');
  const category = get('category');
  const kind = get('kind');
  const items = [...get('list').children].map(el => ({
    el, category: el.dataset.legacyCat, kind: el.dataset.legacyKind,
    text: el.textContent.normalize('NFKC').toLocaleLowerCase('ko-KR')
  }));
  let page = 0;
  const perPage = 12;
  function render() {
    const terms = query.value.normalize('NFKC').trim().toLocaleLowerCase('ko-KR').split(/\s+/).filter(Boolean);
    const selected = items.filter(item => (!category.value || category.value === item.category) &&
      (!kind.value || kind.value === item.kind) && terms.every(term => item.text.includes(term)));
    const pages = Math.ceil(selected.length / perPage);
    const visible = new Set(selected.slice(page * perPage, (page + 1) * perPage));
    items.forEach(item => { item.el.hidden = !visible.has(item); });
    get('count').textContent = selected.length === items.length ? '전체 ' + items.length + '개 항목' :
      selected.length + '개 항목 · 전체 ' + items.length + '개';
    get('empty').hidden = selected.length !== 0;
    get('page').textContent = (page + 1) + ' / ' + pages;
    get('pager').hidden = pages < 2;
    get('prev').disabled = page === 0;
    get('next').disabled = page + 1 >= pages;
  }
  function reset() { page = 0; render(); }
  query.addEventListener('input', reset);
  category.addEventListener('change', reset);
  kind.addEventListener('change', reset);
  function step(delta) {
    page += delta;
    render();
    get('count').scrollIntoView({block: 'start'});
  }
  get('prev').addEventListener('click', () => step(-1));
  get('next').addEventListener('click', () => step(1));
  panel.querySelector('.wiki-legacy-controls').hidden = false;
  render();
})();
