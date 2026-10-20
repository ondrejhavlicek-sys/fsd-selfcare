/* App shell: state, hash router, shared header / navigation bar / footer, shop + account pages, delegated actions. */
(function () {
  const { esc, icon, alertBox, loadingBox } = UI;
  const clone = o => JSON.parse(JSON.stringify(o));
  const mobile = () => matchMedia('(max-width: 768px)').matches;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const SH = 'assets/icons/shop/';
  const img = (n, cls) => `<img ${cls ? `class="${cls}"` : ''} src="${SH}${n}.svg" alt="" aria-hidden="true">`;
  const LANGS = { cs: 'Čeština', en: 'English', vi: 'Tiếng Việt' };

  const App = window.App = {
    LANGS,
    S: Vue.reactive({}), pages: {}, shopPages: {}, handlers: {},
    reset() {
      const d = clone(MockData), keep = App.S;
      Object.assign(App.S, { company: d.company, staff: d.staff, authz: d.authz, payments: d.payments, agreements: d.agreements, sites: d.sites, users: d.users, orders: d.orders, credits: d.credits, card: d.card,
        lists: clone(ShopData.lists), cart: {}, siteId: keep.siteId || 's1', lang: keep.lang || 'cs',
        role: keep.role || 'owner', scenario: keep.scenario || 'normal', pop: false, cartOpen: false,
        scn: keep.scn !== undefined ? keep.scn : innerWidth >= 1500, type: keep.type });
    },
    register(id, def) { App.pages[id] = def; },
    registerShop(id, def) { App.shopPages[id] = def; },
    on(name, fn) { App.handlers[name] = fn; },
    /* Vlastník and Správce účtu both have admin rights; only the owner is the top role */
    isAdmin: () => App.S.role === 'owner' || App.S.role === 'admin',
    isOwner: () => App.S.role === 'owner',
    /* the user the prototype "is" for the selected role (used for personal consents) */
    me: () => App.S.users.find(u => u.id === ({ owner: 'u1', admin: 'u6', buyer: 'u2', viewer: 'u7' })[App.S.role]),
    list: arr => (App.S.scenario === 'empty' ? [] : arr),
    siteName: id => (App.S.sites.find(s => s.id === id) || { name: '—' }).name,
    currentSite() { const a = App.S.sites.filter(s => !s.blocked); return a.find(s => s.id === App.S.siteId) || a[0] || null; },
    go(id) { location.hash = '#/ucet/' + id; },
    render
  };

  const ROLE_NAMES = { owner: 'Vlastník', admin: 'Správce účtu', buyer: 'Nákupčí', viewer: 'Prohlížející' };
  /* renamed or merged pages keep working: old hash -> new page */
  const REDIRECTS = { newsletter: 'privacy' };

  function route() {
    const h = location.hash;
    if (h === '#/seznamy') return { shop: 'lists' };
    const m = h.match(/^#\/ucet(?:\/([\w-]+))?/);
    if (!m) return { shop: 'home' };
    const id = m[1];
    if (!id) return mobile() ? { hub: true } : { id: 'company' };
    const rid = REDIRECTS[id] || id;
    if (REDIRECTS[id]) history.replaceState(null, '', '#/ucet/' + rid);
    return { id: App.pages[rid] ? rid : 'company' };
  }

  /* ---------- shared shell ---------- */
  function header() {
    const S = App.S, c = S.company, site = App.currentSite();
    const addrPop = S.pop === 'addr' ? `<div class="pop left" role="menu"><div class="co">Vyberte adresu doručení</div><div class="ico">Košík a ceny se vztahují k vybrané provozovně.</div>
      ${S.sites.filter(s => !s.blocked).map(s => `<a class="item ${site && site.id === s.id ? 'on' : ''}" href="#" role="menuitem" data-act="pick-site" data-id="${s.id}">${esc(s.name)}<br><span class="muted">${esc(s.address)}</span></a>`).join('') || '<span class="muted">Nemáte žádnou aktivní provozovnu.</span>'}
      <hr><a class="item" href="#/ucet/sites">Spravovat provozovny</a></div>` : '';
    const addrLabel = site ? site.address : 'Žádná provozovna';
    const sf = cls => `<form class="${cls}" role="search" data-search><input type="search" name="q" value="${esc(S.query || '')}" placeholder="Hledejte produkt, kategorii nebo značku" aria-label="Hledat" autocomplete="off"><button type="button" class="mic" data-act="mic" aria-label="Hlasové vyhledávání">${img('mic')}</button><button class="go" type="submit" aria-label="Hledat">${img('search')}</button></form>`;
    return `<header class="hdr">
      <div class="hdr-left">
        <a class="brand" href="#/" data-act="clear-search"><span class="logo">makro</span><span>distribuce</span></a>
        <div class="pop-host"><button class="hdr-addr" data-act="addr" aria-haspopup="true" aria-expanded="${S.pop === 'addr'}"><span><small>Vybraná dodací adresa</small><b>${esc(addrLabel)}</b></span>${img('chevron-right')}</button>${addrPop}</div>
      </div>
      ${sf('hdr-search')}
      <div class="hdr-actions">
        <button class="circ" data-act="bell" aria-label="Oznámení">${img('bell')}</button>
        <div id="acct-menu-slot"></div>
      </div></header>
      ${sf('m-search')}
      <button class="deliv-bar" data-act="addr"><span>Doručení: <b>${esc(addrLabel)}</b></span>${img('chevron-down')}</button>`;
  }

  /* the navigation bar is a Fresh Vue island (js/nav.js); the shell only leaves a slot for it */
  const subheader = () => '<div id="nav-slot"></div>';

  const footer = () => `<footer class="ftr"><div class="ftr-cols">
    <div><h4>Pro vaše podnikání</h4>${['Můj obchod', 'Vzor plné moci ke stažení', 'Vše pro maloobchod', 'Vše pro gastronomii', 'Track & Trace', 'ProTrace', 'Kvalita a standardy', 'Compliance'].map(x => `<a href="#" data-act="soon">${esc(x)}</a>`).join('')}</div>
    <div><h4>O nás</h4>${['O makro', 'Pro dodavatele', 'Pro novináře', 'Nejčastější otázky', 'Kariéra', 'Udržitelnost', 'Metro AG'].map(x => `<a href="#" data-act="soon">${esc(x)}</a>`).join('')}</div>
    <div><h4>Užitečné odkazy</h4>${['Získat makro kartu', 'Bonusový program', 'Energetické štítky', 'Informace o stažení výrobku', 'makro akademie', 'makro newsletter'].map(x => `<a href="#" data-act="soon">${esc(x)}</a>`).join('')}</div>
    <div><h4>Kontakty</h4><a href="tel:+420271005005">+420 271 005 005</a><a>Po - Pá: 7:00–19:00 Ne: 12:00–19:00</a><a href="mailto:info@makro.cz">info@makro.cz</a>
      <h4 style="margin-top:20px">Sledujte nás</h4><div class="soc" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8V6.5c0-.7.2-1 1.1-1H17V2h-2.6C11.6 2 10 3.700 10 6.200V8H8v3.500h2V22h4V11.500h2.700L17 8z"/></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.500" cy="6.500" r="1" fill="currentColor" stroke="none"/></svg>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.600 7.200a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800C22 15.200 22 12 22 12s0-3.200-.4-4.800zM10 15V9l5.200 3z"/></svg></div></div>
  </div><div class="copy">© Makro Cash & Carry ČR, s.r.o.</div></footer>`;

  function mobCart(r) {
    if (!r.shop || !App.cart.count()) return '';
    const t = App.cart.totals();
    return `<div class="mob-cart"><div><b>${App.fmt(t.net)}</b><small>${App.fmt(t.gross)} včetně DPH</small></div><button class="btn" data-act="cart">Zobrazit košík (${App.cart.count()})</button></div>`;
  }

  function scenarioBox() {
    const S = App.S;
    const opt = (v, l, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`;
    return `<div class="scn" data-no-i18n><button data-act="scn">${S.scn ? '▾' : '▸'} Prototype scenarios</button>${S.scn ? `<div class="scn-body">
      <label>Role přihlášeného uživatele<select data-sel="role">${opt('owner', 'Vlastník', S.role)}${opt('admin', 'Správce účtu', S.role)}${opt('buyer', 'Nákupčí', S.role)}${opt('viewer', 'Prohlížející', S.role)}</select></label>
      <label>Stav seznamů<select data-sel="scenario">${opt('normal', 'Běžný', S.scenario)}${opt('empty', 'Prázdný', S.scenario)}${opt('loading', 'Načítání', S.scenario)}${opt('error', 'Chyba', S.scenario)}</select></label>
      <label>Typography<select data-sel="type">${opt('figma', 'Figma (Inter)', S.type)}${opt('makro', 'makro.cz (Lato)', S.type)}</select></label>
      <button class="btn soft sm" data-act="reset">Obnovit ukázková data</button></div>` : ''}</div>`;
  }

  const crumbsHtml = items => `<nav class="crumbs" aria-label="Drobečková navigace"><ul>${items.map((c, i) => `<li>${i ? '<span class="sep" aria-hidden="true"></span>' : ''}<a href="${c.href || '#/'}" ${i === items.length - 1 ? 'aria-current="page"' : ''}>${esc(c.label)}</a></li>`).join('')}</ul></nav>`;

  App.fmt = n => n.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\s/g, ' ') + ' Kč';

  function render() {
    if (!App.S.company) return; /* not booted yet (Fresh still loading) */
    const r = route(), S = App.S;
    document.documentElement.dataset.type = S.type === 'makro' ? 'makro' : 'figma';
    document.documentElement.lang = S.lang;
    const app = document.getElementById('app');
    let page, title;
    if (r.shop) {
      const sp = App.shopPages[r.shop];
      page = `<div class="page wide">${crumbsHtml(sp.crumbs())}<main id="main">${sp.render()}</main></div>`;
      title = sp.label;
    } else {
      page = `<div class="page acct-page"><div id="acct-slot"></div></div>`;
      title = r.hub ? 'Firemní účet' : App.pages[r.id].label;
    }
    Nav.detach(); Grid.detach(); Acct.detach(); AcctMenu.detach(); Acct.sync(r); AcctMenu.sync();
    Nav.sync(r);
    app.innerHTML = header() + subheader(r) + page + footer() + mobCart(r) + scenarioBox();
    Nav.attach(app.querySelector('#nav-slot'));
    Grid.attach(app.querySelector('#grid-slot'));
    Acct.attach(app.querySelector('#acct-slot'));
    AcctMenu.attach(app.querySelector('#acct-menu-slot'));
    I18N.apply(app);
    document.title = I18N.t(title) + ' – makro distribuce';
  }

  /* ---------- delegated events ---------- */
  const togglePop = k => { App.S.pop = App.S.pop === k ? false : k; render(); };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    const closing = App.S.pop && !e.target.closest('.pop-host') && !(el && el.dataset.act === 'cart');
    if (closing) { App.S.pop = false; if (!el) render(); }
    if (!el) return;
    if (closing) setTimeout(() => { if (!App.S.pop && document.querySelector('.pop')) render(); }, 0);
    const act = el.dataset.act;
    const core = {
      acct() { if (mobile()) { App.S.pop = false; location.hash = '#/ucet'; } else togglePop('acct'); },
      addr() { togglePop('addr'); },
      cart() { Nav.openCart(); },
      bell() { UI.toast('Nemáte žádná nová oznámení.'); },
      mic() { UI.toast('Hlasové vyhledávání není součástí prototypu.'); },
      'clear-search'() { App.S.query = ''; if (location.hash === '#/' || location.hash === '') render(); else location.hash = '#/'; },
      soon(ev) { e.preventDefault(); UI.toast('Tato část není součástí prototypu.'); },
      checkout() { UI.toast(App.cart.count() ? 'Pokladna není součástí prototypu.' : 'Košík je prázdný.'); },
      'pick-site'() { e.preventDefault(); App.S.siteId = el.dataset.id; App.S.pop = false; render(); UI.toast('Dodací adresa je změněná.'); },
      personal() { UI.toast('Přepnutí na osobní účet není součástí prototypu.'); },
      logout() { e.preventDefault(); App.S.pop = false; render(); UI.toast('Odhlášení není součástí prototypu.'); },
      scn() { App.S.scn = !App.S.scn; render(); },
      retry() { App.S.scenario = 'normal'; render(); },
      reset() { const keep = { role: App.S.role, scenario: App.S.scenario, type: App.S.type, scn: App.S.scn, lang: App.S.lang }; App.reset(); Object.assign(App.S, keep); render(); UI.toast('Ukázková data jsou obnovena.'); }
    };
    if (core[act]) core[act](); else if (App.handlers[act]) App.handlers[act](el, e);
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-search]'); if (!f) return;
    e.preventDefault();
    App.S.query = f.q.value.trim(); App.S.pop = false;
    if (location.hash === '#/' || location.hash === '') render(); else location.hash = '#/';
  });
  document.addEventListener('change', e => {
    const s = e.target.closest('[data-sel]'); if (!s) return;
    App.S[s.dataset.sel] = s.value;
    if (s.dataset.sel === 'type') store.set('sc-type', s.value);
    render();
  });
  window.addEventListener('hashchange', () => { App.S.pop = false; UI.closeDialog(); render(); window.scrollTo(0, 0); });
  let wasMobile = mobile();
  window.addEventListener('resize', () => { if (wasMobile !== mobile()) { wasMobile = mobile(); render(); } });

  App.boot = function () {
    const q = new URLSearchParams(location.search);
    App.S.type = q.get('type') === 'makro' ? 'makro' : (store.get('sc-type') || 'figma');
    const lang = q.get('lang') || store.get('sc-lang');
    App.S.lang = LANGS[lang] ? lang : 'cs';
    I18N.set(App.S.lang);
    App.reset(); render();
  };
})();
