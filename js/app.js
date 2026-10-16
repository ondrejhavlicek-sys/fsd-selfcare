/* App shell: state, hash router, header, sidebar, mobile menu hub, scenario box, delegated actions. */
(function () {
  const { esc, icon, alertBox, loadingBox } = UI;
  const clone = o => JSON.parse(JSON.stringify(o));
  const mobile = () => matchMedia('(max-width: 768px)').matches;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  const App = window.App = {
    S: {}, pages: {}, handlers: {},
    reset() {
      const d = clone(MockData);
      Object.assign(App.S, { company: d.company, sites: d.sites, users: d.users, orders: d.orders, credits: d.credits, card: d.card,
        role: App.S.role || 'admin', scenario: App.S.scenario || 'normal', pop: false, scn: App.S.scn !== undefined ? App.S.scn : innerWidth >= 1500, type: App.S.type });
    },
    register(id, def) { App.pages[id] = def; },
    on(name, fn) { App.handlers[name] = fn; },
    isAdmin: () => App.S.role === 'admin',
    list: arr => (App.S.scenario === 'empty' ? [] : arr),
    siteName: id => (App.S.sites.find(s => s.id === id) || { name: '—' }).name,
    go(id) { location.hash = '#/ucet/' + id; },
    render
  };

  const GROUPS = [
    { label: 'Nakupování', pages: ['orders', 'credits'] },
    { label: 'Firemní profil', pages: ['company', 'users', 'sites', 'roles', 'payments'] }
  ];
  const ROLE_NAMES = { admin: 'Správce', buyer: 'Nákupčí', viewer: 'Prohlížející' };

  function route() {
    const m = location.hash.match(/^#\/ucet(?:\/([\w-]+))?/);
    const id = m && m[1];
    if (!m) return { id: 'company' };
    if (!id) return mobile() ? { hub: true } : { id: 'company' };
    return { id: App.pages[id] ? id : 'company' };
  }

  const navLink = (id, cur) => {
    const p = App.pages[id]; const lock = p.admin && !App.isAdmin();
    return `<a class="nav-a" href="#/ucet/${id}" ${cur === id ? 'aria-current="page"' : ''}>${icon(p.icon)}${esc(p.label)}${lock ? '<span class="lock">' + icon('lock') + '</span>' : ''}</a>`;
  };

  function header() {
    const c = App.S.company;
    const user = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.9547 7.36563C16.9547 10.4799 15.2033 12.2313 12.089 12.2313C8.9748 12.2313 7.22341 10.4813 7.22341 7.36563C7.22341 4.24997 8.9748 2.5 12.089 2.5C15.2033 2.5 16.9547 4.2514 16.9547 7.36563ZM3.76633 16.4012C6.22957 14.7554 9.12657 13.8792 12.089 13.8841C15.1661 13.8841 18.0304 14.8112 20.4117 16.4012C21.0117 16.8026 21.4117 17.3326 21.5831 17.9297C21.7546 18.5211 21.6903 19.1283 21.4546 19.6611C20.9846 20.724 19.8432 21.5039 18.4261 21.5039H5.75343C4.33632 21.5039 3.19491 20.724 2.72492 19.6611C2.47847 19.1169 2.43291 18.5029 2.59635 17.9283C2.76777 17.3326 3.16634 16.8026 3.76633 16.4012Z" fill="#fff"/></svg>`;
    return `<header class="hdr">
      <a class="brand" href="#/ucet"><span class="logo">makro</span><span>distribuce</span></a>
      <div class="hdr-actions">
        <button class="login" data-act="acct" aria-haspopup="true" aria-expanded="${App.S.pop}" aria-label="Firemní účet: ${esc(c.name)}">${user}<span>Firemní účet</span></button>
        ${App.S.pop ? `<div class="pop" role="menu"><div class="co">${esc(c.name)}</div><div class="ico">IČ: ${esc(c.ico)} · ${ROLE_NAMES[App.S.role]}</div>
          <button class="btn soft sm" style="width:100%" data-act="personal">Přepnout na osobní účet</button><hr>
          ${GROUPS.flatMap(g => g.pages).map(id => `<a class="item" role="menuitem" href="#/ucet/${id}">${esc(App.pages[id].label)}</a>`).join('')}
          <hr><a class="item" href="#" data-act="logout">Odhlásit se</a></div>` : ''}
      </div></header>`;
  }

  function sidebar(cur) {
    const c = App.S.company;
    return `<aside class="side" aria-label="Firemní účet"><div class="who"><b>${esc(c.name)}</b><span>IČ: ${esc(c.ico)}</span></div>
      <button class="btn soft sm" style="width:100%" data-act="personal">Přepnout na osobní účet</button>
      ${GROUPS.map(g => `<div class="nav-group"><h3>${g.label}</h3>${g.pages.map(id => navLink(id, cur)).join('')}</div>`).join('')}</aside>`;
  }

  function hub() {
    return `<nav class="menu-list" aria-label="Firemní účet"><h1>Firemní účet</h1>
      <p class="muted" style="margin-top:4px">${esc(App.S.company.name)} · IČ ${esc(App.S.company.ico)}</p>
      ${GROUPS.map(g => `<div class="hub-g">${g.label}</div>${g.pages.map(id => `<a class="hub-a" href="#/ucet/${id}">${icon(App.pages[id].icon)}${esc(App.pages[id].label)}</a>`).join('')}`).join('')}
      <div style="margin-top:24px"><button class="btn soft" style="width:100%" data-act="personal">Přepnout na osobní účet</button></div></nav>`;
  }

  function body(id) {
    const p = App.pages[id], S = App.S;
    if (p.admin && !App.isAdmin())
      return `<h1>${esc(p.label)}</h1><div style="margin-top:24px">${alertBox('warn', 'K této stránce nemáte oprávnění', 'Zobrazit ji může jen správce firmy. Požádejte správce o změnu role nebo o úpravu, kterou potřebujete.')}</div>`;
    if (S.scenario === 'loading') return `<h1>${esc(p.label)}</h1><div style="margin-top:24px">${loadingBox()}</div>`;
    if (S.scenario === 'error')
      return `<h1>${esc(p.label)}</h1><div style="margin-top:24px">${alertBox('err', 'Stránku se nepodařilo načíst', 'Zkuste to prosím znovu. Pokud potíže přetrvají, zavolejte nám na +420 271 005 005.', '<br><button class="tbtn" data-act="retry">Zkusit znovu</button>')}</div>`;
    return p.render();
  }

  function scenarioBox() {
    const S = App.S;
    const opt = (v, l, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`;
    return `<div class="scn"><button data-act="scn">${S.scn ? '▾' : '▸'} Prototype scenarios</button>${S.scn ? `<div class="scn-body">
      <label>Role přihlášeného uživatele<select data-sel="role">${opt('admin', 'Správce', S.role)}${opt('buyer', 'Nákupčí', S.role)}${opt('viewer', 'Prohlížející', S.role)}</select></label>
      <label>Stav seznamů<select data-sel="scenario">${opt('normal', 'Běžný', S.scenario)}${opt('empty', 'Prázdný', S.scenario)}${opt('loading', 'Načítání', S.scenario)}${opt('error', 'Chyba', S.scenario)}</select></label>
      <label>Typography<select data-sel="type">${opt('figma', 'Figma (Inter)', S.type)}${opt('makro', 'makro.cz (Lato)', S.type)}</select></label>
      <button class="btn soft sm" data-act="reset">Obnovit ukázková data</button></div>` : ''}</div>`;
  }

  function render() {
    const r = route(), S = App.S;
    document.documentElement.dataset.type = S.type === 'makro' ? 'makro' : 'figma';
    const app = document.getElementById('app');
    const cur = r.id;
    const crumbs = r.hub ? '' : `<nav class="crumbs" aria-label="Drobečková navigace"><a href="#/ucet/company">Firemní účet</a> · ${esc(App.pages[cur].label)}</nav>`;
    app.innerHTML = header() + `<div class="page ${r.hub ? 'on-hub' : ''}">${crumbs}<div class="shell">${sidebar(cur)}<main class="content" id="main">
      ${r.hub ? hub() : `<a class="back" href="#/ucet"><i aria-hidden="true">←</i>Firemní účet</a>` + body(cur)}</main></div></div>` + scenarioBox();
    document.title = (r.hub ? 'Firemní účet' : App.pages[cur].label) + ' – makro distribuce';
  }

  /* delegated events */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (App.S.pop && !e.target.closest('.hdr-right')) { App.S.pop = false; render(); }
    if (!el) return;
    const act = el.dataset.act;
    const core = {
      acct() { if (mobile()) location.hash = '#/ucet'; else { App.S.pop = !App.S.pop; render(); } },
      personal() { UI.toast('Přepnutí na osobní účet není součástí prototypu.'); },
      logout() { e.preventDefault(); App.S.pop = false; render(); UI.toast('Odhlášení není součástí prototypu.'); },
      scn() { App.S.scn = !App.S.scn; render(); },
      retry() { App.S.scenario = 'normal'; render(); },
      reset() { const keep = { role: App.S.role, scenario: App.S.scenario, type: App.S.type, scn: App.S.scn }; App.S = Object.assign(App.S, {}); App.reset(); Object.assign(App.S, keep); render(); UI.toast('Ukázková data jsou obnovena.'); }
    };
    if (core[act]) core[act](); else if (App.handlers[act]) App.handlers[act](el, e);
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
    const q = new URLSearchParams(location.search).get('type');
    App.S.type = q === 'makro' ? 'makro' : (store.get('sc-type') || 'figma');
    App.reset(); render();
  };
})();
