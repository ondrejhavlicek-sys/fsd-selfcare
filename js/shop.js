/* Shop: cart, product listing (single category "Ovoce") and shopping lists. */
(function () {
  const { esc, icon, dialog, toast, field, emptyState } = UI;
  const SH = 'assets/icons/shop/';
  const PROD = id => ShopData.products.find(p => p.id === id);
  /* ---------- cart ---------- */
  App.cart = {
    qty: id => App.S.cart[id] || 0,
    set(id, n) { if (n <= 0) delete App.S.cart[id]; else App.S.cart[id] = Math.min(n, 99); },
    count: () => Object.values(App.S.cart).reduce((a, b) => a + b, 0),
    /* Multikup: the mock's `price` is the multi-buy price, valid from `multiFrom` pcs; below that the single price applies */
    unit: (p, q) => p.kind === 'multi' && q < p.multiFrom ? parseFloat(String(p.single).replace(',', '.')) : p.price,
    totals() {
      const net = Object.keys(App.S.cart).reduce((s, id) => s + App.cart.unit(PROD(+id), App.S.cart[id]) * App.S.cart[id], 0);
      return { net, gross: net * (1 + ShopData.vat) };
    },
    items() {
      return Object.keys(App.S.cart).map(id => { const p = PROD(+id); return { id: +id, name: p.name, img: p.img, qty: App.S.cart[id], price: App.cart.unit(p, App.S.cart[id]) * App.S.cart[id] }; });
    }
  };

  /* ---------- listing ---------- */
  const SORTS = { rec: 'Doporučené', asc: 'Cena vzestupně', desc: 'Cena sestupně', name: 'Název' };
  const F = { akce: false, multi: false, today: true, sort: 'rec' };
  const countText = n => `${n} ${n === 1 ? 'produkt' : n >= 2 && n <= 4 ? 'produkty' : 'produktů'}`;

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  App.registerShop('home', {
    get label() { return App.S.query ? 'Výsledky hledání' : 'Ovoce'; },
    crumbs: () => App.S.query ? [{ label: 'Hlavní stránka', href: '#/' }, { label: 'Výsledky hledání', href: '#/' }]
      : ShopData.breadcrumb.map((l, i) => ({ label: l, href: '#/' })),
    render() {
      const query = App.S.query || '';
      let list = ShopData.products.slice();
      if (query) { const words = norm(query).split(/\s+/).filter(Boolean); list = list.filter(p => words.every(w => norm(p.name).includes(w))); }
      if (F.akce) list = list.filter(p => p.kind === 'sale');
      if (F.multi) list = list.filter(p => p.kind === 'multi');
      if (F.sort === 'asc') list.sort((a, b) => a.price - b.price);
      if (F.sort === 'desc') list.sort((a, b) => b.price - a.price);
      if (F.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
      if (App.S.scenario === 'empty') list = [];
      const chip = (cls, on, act, icn, label) => `<button class="fchip ${cls} ${on ? 'on' : ''}" data-act="${act}" ${on ? 'aria-pressed="true"' : 'aria-pressed="false"'}><img src="${SH}${icn}.svg" alt="">${label}</button>`;
      let grid;
      if (App.S.scenario === 'loading') grid = UI.loadingBox();
      else if (App.S.scenario === 'error') grid = UI.alertBox('err', 'Stránku se nepodařilo načíst', 'Zkuste to prosím znovu. Pokud potíže přetrvají, zavolejte nám na +420 271 005 005.', '<br><button class="tbtn" data-act="retry">Zkusit znovu</button>');
      else if (list.length) { Grid.sync(list); grid = '<div id="grid-slot"></div>'; }
      else if (query) grid = emptyState('Pro hledaný výraz jsme nic nenašli', 'Zkontrolujte překlepy nebo zkuste jiné slovo.', '<button class="btn soft" data-act="clear-search">Zrušit hledání</button>');
      else grid = emptyState('Nic jsme nenašli', 'Zkuste zrušit některý z filtrů.', '<button class="btn soft" data-act="f-reset">Zrušit filtry</button>');
      const head = query
        ? `<h1 class="shop-title">Výsledky hledání</h1><p class="search-term">Hledaný výraz: <b>${esc(query)}</b> · <button class="tbtn" data-act="clear-search">Zrušit hledání</button></p>`
        : `<h1 class="shop-title">Ovoce</h1>
        <div class="tiles-row">${ShopData.tiles.map(t => `<button class="tile-sub" data-act="soon"><img src="assets/tiles/${t.img}.png" alt=""><span>${esc(t.name)}</span></button>`).join('')}</div>`;
      return `${head}
        <div class="toolbar"><div class="chips-bar">
          <button class="fchip main" data-act="soon"><img src="${SH}filter.svg" alt="">Filtry</button>
          ${chip('', F.today, 'f-today', 'calendar', 'Dostupné dnes')}${chip('', F.akce, 'f-akce', 'discount', 'Akce')}${chip('', F.multi, 'f-multi', 'multikup', 'Multikup')}</div>
          <div class="utils"><span>${countText(list.length)}</span><div class="right">
            <label class="sel"><img src="${SH}sorting.svg" alt=""><select data-fsel="sort" aria-label="Řazení">${Object.keys(SORTS).map(k => `<option value="${k}" ${F.sort === k ? 'selected' : ''}>${SORTS[k]}</option>`).join('')}</select></label>
            <label class="sel"><img src="${SH}view.svg" alt=""><select aria-label="Zobrazení"><option>Všechno najednou</option></select></label></div></div></div>${grid}`;
    }
  });
  const flip = k => () => { F[k] = !F[k]; App.render(); };
  App.on('f-today', flip('today')); App.on('f-akce', flip('akce')); App.on('f-multi', flip('multi'));
  App.on('f-reset', () => { F.akce = false; F.multi = false; App.render(); });
  document.addEventListener('change', e => { const s = e.target.closest('[data-fsel]'); if (s) { F[s.dataset.fsel] = s.value; App.render(); } });

  /* ---------- shopping lists ---------- */
  App.registerShop('lists', {
    label: 'Seznamy',
    crumbs: () => [{ label: 'Hlavní stránka', href: '#/' }, { label: 'Seznamy', href: '#/seznamy' }],
    render() {
      const lists = App.list(App.S.lists);
      const head = `<div class="head"><h1>Seznamy</h1><button class="btn" data-act="l-new">${icon('plus')}Vytvořit seznam</button></div>`;
      if (App.S.scenario === 'loading') return head + UI.loadingBox();
      if (App.S.scenario === 'error') return head + UI.alertBox('err', 'Stránku se nepodařilo načíst', 'Zkuste to prosím znovu. Pokud potíže přetrvají, zavolejte nám na +420 271 005 005.', '<br><button class="tbtn" data-act="retry">Zkusit znovu</button>');
      return head + (lists.length ? `<div style="max-width:800px">${lists.map(l => {
        const n = l.items.length;
        return `<div class="list-card"><div class="top"><div><h2>${esc(l.name)}</h2><span class="its">${n ? `${n} ${n === 1 ? 'položka' : n <= 4 ? 'položky' : 'položek'}` : 'Seznam je prázdný'}</span></div>
          <div style="display:flex;gap:16px;align-items:center">${n ? `<button class="btn" data-act="l-add" data-id="${l.id}">Přidat vše do košíku</button>` : ''}<button class="tbtn danger" data-act="l-del" data-id="${l.id}">Odebrat</button></div></div>
          ${n ? `<div class="thumbs">${l.items.map(it => `<img src="assets/products/${PROD(it.pid).img}.png" alt="${esc(PROD(it.pid).name)}" title="${esc(it.qty + '× ' + PROD(it.pid).name)}">`).join('')}</div>` : ''}</div>`;
      }).join('')}</div>` : emptyState('Zatím nemáte žádný nákupní seznam', 'Seznam vám ušetří čas při opakovaných objednávkách. Všechny položky pak vložíte do košíku jedním kliknutím.', '<button class="btn" data-act="l-new">Vytvořit seznam</button>'));
    }
  });
  App.on('l-add', el => {
    if (!App.currentSite()) return toast('Nejdřív vyberte aktivní provozovnu.');
    if (App.S.role === 'viewer') return toast('S rolí Prohlížející nemůžete nakupovat.');
    const l = App.S.lists.find(x => x.id === el.dataset.id); l.items.forEach(it => App.cart.set(it.pid, App.cart.qty(it.pid) + it.qty));
    App.render(); toast('Položky ze seznamu jsou v košíku.');
  });
  App.on('l-del', el => UI.confirmDialog('Odebrat seznam?', 'Seznam zmizí. Produkty v obchodě zůstanou beze změny.', 'Odebrat', () => { App.S.lists = App.S.lists.filter(x => x.id !== el.dataset.id); App.render(); toast('Seznam je odebraný.'); }));
  App.on('l-new', () => dialog({
    title: 'Vytvořit seznam', body: field('Název seznamu', 'name', '', { req: true, ph: 'např. Měsíční objednávka' }), submit: 'Vytvořit',
    onSubmit(d) { if (!(d.name || '').trim()) return { field: 'name', msg: 'Zadejte název seznamu.' }; App.S.lists.push({ id: 'l' + Date.now(), name: d.name.trim(), items: [] }); App.render(); toast('Seznam je vytvořený.'); }
  }));
})();
