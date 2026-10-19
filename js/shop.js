/* Shop: cart, product listing (single category "Ovoce") and shopping lists. */
(function () {
  const { esc, icon, dialog, toast, field, emptyState } = UI;
  const SH = 'assets/icons/shop/';
  const PROD = id => ShopData.products.find(p => p.id === id);
  const plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 4.200a1.371 1.371 0 0 1 1.371 1.371v5.058h5.058a1.370 1.370 0 1 1 0 2.742H13.370v5.058a1.370 1.370 0 1 1-2.742 0V13.370H5.570a1.371 1.371 0 1 1 0-2.742h5.058V5.570A1.371 1.371 0 0 1 12 4.201Z"/></svg>';
  const split = n => { const c = Math.round(n * 100); return [Math.floor(c / 100), String(c % 100).padStart(2, '0')]; };
  const priceHtml = p => {
    const [i, d] = split(p.price);
    if (p.kind === 'multi') return `<div class="price-row"><span class="pr tag"><b>${i}</b><sup>${d}</sup></span><span class="mk">od ${p.multiFrom} ks</span></div><div class="psingle">${esc(p.single)}</div>`;
    if (p.kind === 'sale') return `<div class="price-row"><span class="pr tag"><b>${i}</b><sup>${d}</sup></span><span class="old">${App.fmt(p.old)}</span></div>`;
    return `<div class="price-row"><span class="pr"><b>${i}</b><sup>${d}</sup></span></div>`;
  };

  /* ---------- cart ---------- */
  App.cart = {
    qty: id => App.S.cart[id] || 0,
    set(id, n) { if (n <= 0) delete App.S.cart[id]; else App.S.cart[id] = Math.min(n, 99); },
    count: () => Object.values(App.S.cart).reduce((a, b) => a + b, 0),
    totals() {
      const net = Object.keys(App.S.cart).reduce((s, id) => s + PROD(+id).price * App.S.cart[id], 0);
      return { net, gross: net * (1 + ShopData.vat) };
    },
    popover() {
      const ids = Object.keys(App.S.cart), t = App.cart.totals(), site = App.currentSite();
      return `<div class="pop cart-pop" role="dialog" aria-label="Košík"><div class="cp-head">Košík${site ? ' · ' + esc(site.name) : ''}</div>
        ${ids.length ? `<div class="cp-list">${ids.map(id => { const p = PROD(+id); return `<div class="cp-item"><img src="assets/products/${p.img}.png" alt="">
          <div><div class="n">${esc(p.name)}</div><div class="p">${App.fmt(p.price * App.S.cart[id])}</div></div>
          <div class="stepper"><button data-act="c-dec" data-id="${id}" aria-label="Ubrat">−</button><span>${App.S.cart[id]}</span><button data-act="c-inc" data-id="${id}" aria-label="Přidat">+</button></div></div>`; }).join('')}</div>
          <div class="cp-foot"><div class="row"><span>Celkem bez DPH</span><b>${App.fmt(t.net)}</b></div><div class="row"><span>Celkem včetně DPH</span><span>${App.fmt(t.gross)}</span></div>
          <button class="btn" data-act="checkout">K pokladně</button><button class="tbtn danger" data-act="c-clear" style="text-align:center">Vyprázdnit košík</button></div>`
          : '<div class="cp-empty">Košík je prázdný.</div>'}</div>`;
    }
  };
  const cartAct = fn => el => { fn(+el.dataset.id); App.render(); };
  App.on('c-inc', cartAct(id => App.cart.set(id, App.cart.qty(id) + 1)));
  App.on('c-dec', cartAct(id => App.cart.set(id, App.cart.qty(id) - 1)));
  App.on('c-clear', () => { App.S.cart = {}; App.S.pop = false; App.render(); toast('Košík je vyprázdněný.'); });
  App.on('p-add', el => {
    if (!App.currentSite()) return toast('Nejdřív vyberte aktivní provozovnu.');
    if (App.S.role === 'viewer') return toast('S rolí Prohlížející nemůžete nakupovat.');
    App.cart.set(+el.dataset.id, App.cart.qty(+el.dataset.id) + 1); App.render();
  });

  /* ---------- listing ---------- */
  const card = p => {
    const q = App.cart.qty(p.id);
    return `<article class="pcard"><div class="pimg"><img class="ph" src="assets/products/${p.img}.png" alt="" loading="lazy">
      <div class="pcta">${q ? `<div class="stepper"><button data-act="c-dec" data-id="${p.id}" aria-label="Ubrat">−</button><span>${q}</span><button data-act="c-inc" data-id="${p.id}" aria-label="Přidat">+</button></div>`
        : `<button class="add" data-act="p-add" data-id="${p.id}" aria-label="Přidat do košíku: ${esc(p.name)}">${plus}</button>`}</div></div>
      <div class="pdata">${priceHtml(p)}<div class="ptitle" title="${esc(p.name)}">${esc(p.name)}</div><div class="pmeta"><span>${esc(p.pack)}</span><span>${esc(p.unit)}</span></div></div></article>`;
  };

  const SORTS = { rec: 'Doporučené', asc: 'Cena vzestupně', desc: 'Cena sestupně', name: 'Název' };
  const F = { akce: false, multi: false, today: true, sort: 'rec' };
  const countText = n => `${n} ${n === 1 ? 'produkt' : n >= 2 && n <= 4 ? 'produkty' : 'produktů'}`;

  App.registerShop('home', {
    label: 'Ovoce',
    crumbs: () => ShopData.breadcrumb.map((l, i) => ({ label: l, href: i ? '#/' : '#/' })),
    render() {
      let list = ShopData.products.slice();
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
      else grid = list.length ? `<div class="grid-shop">${list.map(card).join('')}</div>` : emptyState('Nic jsme nenašli', 'Zkuste zrušit některý z filtrů.', '<button class="btn soft" data-act="f-reset">Zrušit filtry</button>');
      return `<h1 class="shop-title">Ovoce</h1>
        <div class="tiles-row">${ShopData.tiles.map(t => `<button class="tile-sub" data-act="soon"><img src="assets/tiles/${t.img}.png" alt=""><span>${esc(t.name)}</span></button>`).join('')}</div>
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
