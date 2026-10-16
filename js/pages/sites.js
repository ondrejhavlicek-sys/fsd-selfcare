/* Provozovny: delivery sites with address search, pin, delivery days/times, restrictions */
(function () {
  const { esc, icon, field, dialog, toast, confirmDialog, emptyState, alertBox } = UI;
  const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const pin = `<svg class="pin" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zm0-9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>`;
  const find = el => App.S.sites.find(s => s.id === el.dataset.id);
  const tm = t => String(t).replace(/^0/, '');
  const dayText =s => s.days.length === 7 ? 'každý den' : s.days.map(i => DAYS[i]).join(', ');

  App.register('sites', {
    label: 'Provozovny', icon: 'pin',
    render() {
      const list = App.list(App.S.sites), admin = App.isAdmin();
      const add = admin ? `<button class="btn" data-act="s-add">${icon('plus')}Přidat provozovnu</button>` : '';
      return pageHead('Provozovny', add) + (admin ? '' : alertBox('info', 'Provozovny vidíte jen ke čtení', 'Přidat nebo upravit je může správce firmy.')) +
        (list.length ? `<div class="grid2">${list.map(s => `<div class="site-card">
          <div class="top"><h2>${esc(s.name)}</h2><span class="badge ${s.blocked ? 'bad' : 'ok'}">${s.blocked ? 'Zablokovaná' : 'Aktivní'}</span></div>
          <span>${esc(s.address)}</span>
          <span class="muted">Kontakt: ${esc(s.contact)}, ${esc(s.phone)}</span>
          <span class="muted">Čas doručení: ${dayText(s)}, ${tm(s.from)}–${tm(s.to)}</span>
          ${s.restrictions.length ? `<div class="chips">${s.restrictions.map(r => `<span class="chip">${esc(MockData.restrictionLabels[r])}</span>`).join('')}</div>` : ''}
          ${admin ? `<div class="acts"><button class="tbtn" data-act="s-edit" data-id="${s.id}">Upravit</button><button class="tbtn" data-act="s-block" data-id="${s.id}">${s.blocked ? 'Odblokovat' : 'Zablokovat'}</button><button class="tbtn danger" data-act="s-del" data-id="${s.id}">Odebrat</button></div>` : ''}</div>`).join('')}</div>`
          : emptyState('Zatím tu nemáte žádnou provozovnu', 'Provozovna je místo, kam vám doručujeme. Přidejte první a určete, kdo do ní smí nakupovat.', admin ? add : ''));
    }
  });

  function form(s) {
    return field('Název provozovny', 'name', s.name, { req: true, ph: 'např. Restaurace U Mostu' }) +
      `<div class="fld" data-f="address"><label for="f-address">Adresa doručení <span class="muted">(povinné)</span></label>
        <input id="f-address" name="address" type="text" value="${esc(s.address)}" placeholder="např. Evropská 2758/11, 160 00 Praha 6" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="sug">
        <div class="sug" id="sug" role="listbox" hidden></div><div class="err" hidden></div></div>
      <div class="fld"><span class="lbl-t">Přesné místo doručení (přetáhněte špendlík)</span><div class="map" id="map">${pin.replace('class="pin"', `class="pin" id="pin" style="left:${s.pin[0]}%;top:${s.pin[1]}%"`)}<small>Zjednodušená mapa prototypu</small></div></div>
      <div class="row2">${field('Kontaktní osoba', 'contact', s.contact, { req: true })}${field('Telefon', 'phone', s.phone, { type: 'tel', req: true })}</div>
      <div class="fld"><span class="lbl-t">Dny doručení</span><div class="days">${DAYS.map((d, i) => `<label><input type="checkbox" name="days" value="${i}" ${s.days.includes(i) ? 'checked' : ''}><span>${d}</span></label>`).join('')}</div><div class="err" hidden></div></div>
      <div class="row2">${field('Čas doručení od', 'from', s.from, { type: 'time' })}${field('Čas doručení do', 'to', s.to, { type: 'time' })}</div>
      <div class="lbl-t" style="margin-bottom:2px">Omezení doručení</div>
      ${Object.keys(MockData.restrictionLabels).map(k => `<label class="check"><input type="checkbox" name="restr" value="${k}" ${s.restrictions.includes(k) ? 'checked' : ''}><span>${esc(MockData.restrictionLabels[k])}</span></label>`).join('')}
      <div class="fld" style="margin-top:12px"><label for="f-note">Poznámka pro řidiče</label><textarea id="f-note" name="note">${esc(s.note)}</textarea></div>`;
  }

  function wire(ov, s) {
    const inp = ov.querySelector('#f-address'), sug = ov.querySelector('#sug'), map = ov.querySelector('#map'), p = ov.querySelector('#pin');
    const close = () => { sug.hidden = true; inp.setAttribute('aria-expanded', 'false'); };
    inp.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase();
      const m = q.length < 2 ? [] : MockData.addressSuggestions.filter(a => a.toLowerCase().includes(q)).slice(0, 5);
      sug.innerHTML = m.map(a => `<button type="button" role="option">${esc(a)}</button>`).join(''); sug.hidden = !m.length; inp.setAttribute('aria-expanded', String(!!m.length));
    });
    sug.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { inp.value = b.textContent; s.pin = [30 + Math.round(Math.random() * 40), 40 + Math.round(Math.random() * 30)]; p.style.left = s.pin[0] + '%'; p.style.top = s.pin[1] + '%'; close(); } });
    let drag = false;
    const move = e => { const r = map.getBoundingClientRect(); const x = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)), y = Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100)); s.pin = [Math.round(x), Math.round(y)]; p.style.left = x + '%'; p.style.top = y + '%'; };
    map.addEventListener('pointerdown', e => { drag = true; map.setPointerCapture(e.pointerId); move(e); });
    map.addEventListener('pointermove', e => { if (drag) move(e); });
    map.addEventListener('pointerup', () => { drag = false; });
  }

  function save(d, s, isNew) {
    if (!(d.name || '').trim()) return { field: 'name', msg: 'Zadejte název provozovny.' };
    if (!(d.address || '').trim()) return { field: 'address', msg: 'Zadejte adresu doručení.' };
    if (!(d.contact || '').trim()) return { field: 'contact', msg: 'Zadejte kontaktní osobu.' };
    if (!/^\+?[\d\s]{9,16}$/.test(d.phone || '')) return { field: 'phone', msg: 'Zadejte telefon ve tvaru +420 777 000 111.' };
    const days = [].concat(d.days || []).map(Number);
    if (!days.length) { toast('Vyberte alespoň jeden den doručení.'); return { field: 'name', msg: '' }; }
    if (d.from && d.to && d.from >= d.to) return { field: 'to', msg: 'Konec příjmu musí být později než začátek.' };
    Object.assign(s, { name: d.name.trim(), address: d.address.trim(), contact: d.contact.trim(), phone: d.phone.trim(), days: days.sort(), from: d.from || '06:00', to: d.to || '12:00', restrictions: [].concat(d.restr || []), note: (d.note || '').trim() });
    if (isNew) App.S.sites.push(s);
    App.render(); toast(isNew ? 'Provozovna je přidaná.' : 'Změny jsou uložené.');
  }

  App.on('s-add', () => {
    const s = { id: 's' + Date.now(), name: '', address: '', contact: '', phone: '', days: [0, 1, 2, 3, 4], from: '06:00', to: '12:00', restrictions: [], note: '', blocked: false, pin: [50, 50] };
    dialog({ title: 'Přidat provozovnu', wide: true, body: form(s), onOpen: ov => wire(ov, s), onSubmit: d => save(d, s, true) });
  });
  App.on('s-edit', el => {
    const s = find(el), copy = JSON.parse(JSON.stringify(s));
    dialog({ title: 'Upravit provozovnu', sub: s.name, wide: true, body: form(copy), onOpen: ov => wire(ov, copy), onSubmit: d => { const r = save(d, copy, false); if (!r) Object.assign(s, copy); return r; } });
  });
  App.on('s-block', el => {
    const s = find(el);
    if (s.blocked) { s.blocked = false; App.render(); return toast('Provozovna je odblokovaná.'); }
    confirmDialog('Zablokovat provozovnu?', 'Do provozovny nepůjde objednávat, dokud ji neodblokujete. Otevřené objednávky zůstanou beze změny.', 'Zablokovat', () => { s.blocked = true; App.render(); toast('Provozovna je zablokovaná.'); });
  });
  App.on('s-del', el => {
    const s = find(el);
    if (App.S.orders.some(o => o.site === s.id && o.status !== 'Doručeno'))
      return dialog({ title: 'Provozovnu nelze odebrat', sub: 'Má otevřené objednávky. Počkejte na jejich doručení, nebo provozovnu zatím zablokujte.', submit: null, cancel: 'Rozumím' });
    confirmDialog('Odebrat provozovnu?', s.name + ' zmizí z nabídky doručení a kolegům se odebere přístup.', 'Odebrat', () => {
      App.S.sites = App.S.sites.filter(x => x !== s);
      App.S.users.forEach(u => { if (Array.isArray(u.sites)) u.sites = u.sites.filter(id => id !== s.id); });
      App.render(); toast('Provozovna je odebraná.');
    });
  });
})();
