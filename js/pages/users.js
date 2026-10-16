/* Uživatelé: list, add/invite, edit (role + sites), block/unblock, remove */
(function () {
  const { esc, icon, field, dialog, toast, confirmDialog, emptyState, alertBox } = UI;
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const STATUS = { active: ['Aktivní', 'ok'], invited: ['Pozvánka odeslána', 'warn'], blocked: ['Zablokovaný', 'bad'] };

  const sitesText = u => {
    if (u.role === 'admin' || u.sites === 'all') return 'Všechny provozovny';
    return u.sites.length ? u.sites.map(App.siteName).join(', ') : 'Žádná provozovna';
  };

  App.register('users', {
    label: 'Uživatelé', icon: 'users', admin: true,
    render() {
      const list = App.list(App.S.users), c = App.S.company;
      const banner = c.onlyCompanyEmail
        ? alertBox('info', 'Kolegy půjde přidat jen s firemním e-mailem', 'Povolené domény: ' + c.domains.map(d => '@' + d).join(', ') + '. Změníte je ve Firemních informacích.', '<br><a href="#/ucet/company">Otevřít Firemní informace</a>')
        : '';
      return pageHead('Uživatelé', `<button class="btn" data-act="u-add">${icon('plus')}Přidat kolegu</button>`) + banner +
        (list.length ? `<table class="tbl"><thead><tr><th>Kolega</th><th>Role</th><th>Provozovny</th><th>Stav</th><th></th></tr></thead><tbody>${list.map(u => {
          const st = STATUS[u.status];
          const nm = (u.first + ' ' + u.last).trim();
          return `<tr><td data-label="Kolega"><span class="email">${esc(u.email)}</span>${nm ? `<br><span class="muted">${esc(nm)}</span>` : ''}</td>
            <td data-label="Role"><span class="role">${esc(MockData.roles[u.role].label)}</span></td><td data-label="Provozovny">${esc(sitesText(u))}</td>
            <td data-label="Stav"><span class="badge ${st[1]}">${st[0]}</span></td>
            <td class="acts-td"><div class="acts"><button class="tbtn" data-act="u-edit" data-id="${u.id}">Upravit</button>
            ${u.status === 'invited' ? `<button class="tbtn" data-act="u-resend" data-id="${u.id}">Odeslat znovu</button>` : `<button class="tbtn" data-act="u-block" data-id="${u.id}">${u.status === 'blocked' ? 'Odblokovat' : 'Zablokovat'}</button>`}
            <button class="tbtn danger" data-act="u-del" data-id="${u.id}">Odebrat</button></div></td></tr>`;
        }).join('')}</tbody></table>`
          : emptyState('Zatím tu nemáte žádné kolegy', 'Přidejte kolegu a určete, co smí ve firemním účtu dělat.', `<button class="btn" data-act="u-add">${icon('plus')}Přidat kolegu</button>`));
    }
  });

  function form(u) {
    const R = MockData.roles, sites = App.S.sites;
    const all = u.role === 'admin' || u.sites === 'all';
    return (u.id ? `<div class="fld"><label>E-mail</label><b>${esc(u.email)}</b></div>` : field('E-mail kolegy', 'email', '', { type: 'email', req: true, ph: 'např. jmeno@firma.cz' })) +
      `<div class="row2">${field('Jméno', 'first', u.first)}${field('Příjmení', 'last', u.last)}</div>
      <div class="lbl-t" style="margin-bottom:6px">Role</div>
      <div class="tiles">${Object.keys(R).map(k => `<label class="tile"><input type="radio" name="role" value="${k}" ${u.role === k ? 'checked' : ''}><div><b>${R[k].label}</b><span>${esc(R[k].desc)}</span></div></label>`).join('')}</div>
      <div id="sites-box" ${u.role === 'admin' ? 'hidden' : ''}><div class="lbl-t" style="margin:12px 0 6px">Provozovny, pro které smí nakupovat</div>
        <label class="check"><input type="radio" name="scope" value="all" ${all ? 'checked' : ''}><span>Všechny provozovny</span></label>
        <label class="check"><input type="radio" name="scope" value="some" ${all ? '' : 'checked'}><span>Jen vybrané provozovny</span></label>
        <div id="site-list" style="margin:4px 0 0 26px" ${all ? 'hidden' : ''}>${sites.map(s => `<label class="check"><input type="checkbox" name="site" value="${s.id}" ${!all && u.sites.includes(s.id) ? 'checked' : ''}><span>${esc(s.name)}${s.blocked ? ' <span class="badge bad">zablokovaná</span>' : ''}<br><span class="muted">${esc(s.address)}</span></span></label>`).join('') || '<span class="muted">Zatím nemáte žádnou provozovnu.</span>'}</div></div>`;
  }
  function wire(ov) {
    const sync = () => {
      const role = ov.querySelector('[name=role]:checked').value, scope = ov.querySelector('[name=scope]:checked').value;
      ov.querySelector('#sites-box').hidden = role === 'admin';
      ov.querySelector('#site-list').hidden = scope === 'all';
    };
    ov.addEventListener('change', sync);
  }
  const collect = (d, base) => {
    base.first = (d.first || '').trim(); base.last = (d.last || '').trim(); base.role = d.role;
    base.sites = d.role === 'admin' || d.scope === 'all' ? 'all' : [].concat(d.site || []);
  };
  const find = el => App.S.users.find(u => u.id === el.dataset.id);

  App.on('u-add', () => dialog({
    title: 'Přidat kolegu', sub: 'Kolega dostane e-mail s pozvánkou do firemního účtu.', wide: true, submit: 'Odeslat pozvánku', onOpen: wire,
    body: form({ first: '', last: '', role: 'buyer', sites: 'all' }),
    onSubmit(d) {
      const email = (d.email || '').trim().toLowerCase(), c = App.S.company;
      if (!emailOk(email)) return { field: 'email', msg: 'Zadejte e-mail ve tvaru jmeno@firma.cz.' };
      if (App.S.users.some(u => u.email === email)) return { field: 'email', msg: 'Tento kolega už ve firmě je.' };
      if (c.onlyCompanyEmail && !c.domains.includes(email.split('@')[1])) return { field: 'email', msg: 'Použijte firemní e-mail (' + c.domains.map(x => '@' + x).join(', ') + ').' };
      const u = { id: 'u' + Date.now(), email, status: 'invited' }; collect(d, u); App.S.users.push(u); App.render(); toast('Pozvánka byla odeslána na ' + email + '.');
    }
  }));

  App.on('u-edit', el => {
    const u = find(el);
    dialog({ title: 'Upravit kolegu', sub: u.email, wide: true, onOpen: wire, body: form(u),
      onSubmit(d) {
        if (u.role === 'admin' && d.role !== 'admin' && App.S.users.filter(x => x.role === 'admin' && x.status !== 'blocked').length < 2)
          return { field: 'first', msg: 'Ve firmě musí zůstat alespoň jeden správce.' };
        collect(d, u); App.render(); toast('Změny jsou uložené.');
      } });
  });

  App.on('u-resend', el => toast('Pozvánka byla odeslána znovu na ' + find(el).email + '.'));

  App.on('u-block', el => {
    const u = find(el);
    if (u.status === 'blocked') { u.status = 'active'; App.render(); return toast('Kolega je odblokovaný.'); }
    confirmDialog('Zablokovat kolegu?', 'Kolega se nebude moct přihlásit ani nakupovat. Odblokovat ho můžete kdykoli.', 'Zablokovat', () => { u.status = 'blocked'; App.render(); toast('Kolega je zablokovaný.'); });
  });

  App.on('u-del', el => {
    const u = find(el);
    if (u.role === 'admin' && App.S.users.filter(x => x.role === 'admin').length < 2)
      return dialog({ title: 'Kolegu nelze odebrat', sub: 'Ve firmě musí zůstat alespoň jeden správce. Nejdřív určete správcem jiného kolegu.', submit: null, cancel: 'Rozumím' });
    confirmDialog('Odebrat kolegu?', u.email + ' ztratí přístup do firemního účtu. Jeho objednávky zůstanou zachované.', 'Odebrat', () => { App.S.users = App.S.users.filter(x => x !== u); App.render(); toast('Kolega je odebraný.'); });
  });
})();
