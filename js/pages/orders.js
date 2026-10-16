/* Nákupy (low priority – simple placeholder list) and Kredity */
(function () {
  const { esc, icon, dialog, toast, alertBox, emptyState } = UI;
  const kc = n => n.toLocaleString('cs-CZ').replace(/\s/g, ' ') + ' Kč';
  const badge = s => `<span class="badge ${s === 'Doručeno' ? 'ok' : 'warn'}">${esc(s)}</span>`;

  App.register('orders', {
    label: 'Objednávky', icon: 'box',
    render() {
      const list = App.list(App.S.orders);
      return pageHead('Objednávky') + alertBox('info', 'Zástupný přehled', 'Historie objednávek je v této verzi prototypu jen ukázka.') +
        (list.length ? `<table class="tbl"><thead><tr><th>Číslo</th><th>Datum</th><th>Provozovna</th><th>Částka</th><th>Stav</th></tr></thead><tbody>${list.map(o =>
          `<tr><td data-label="Číslo"><b>${esc(o.id)}</b></td><td data-label="Datum">${esc(o.date)}</td><td data-label="Provozovna">${esc(App.siteName(o.site))}</td><td data-label="Částka">${kc(o.total)}</td><td data-label="Stav">${badge(o.status)}</td></tr>`).join('')}</tbody></table>`
          : emptyState('Zatím tu nemáte žádnou objednávku', 'Až nakoupíte, uvidíte tady přehled svých objednávek.'));
    }
  });

  App.register('credits', {
    label: 'Kredity', icon: 'credit',
    render() {
      const cr = App.S.credits, hist = App.list(cr.history);
      const buy = App.isAdmin() ? `<button class="btn" data-act="cr-buy">${icon('plus')}Koupit firemní kredity</button>` : '';
      return pageHead('Kredity', buy) +
        `<div class="card"><div class="rows"><h2>Zůstatek firemních kreditů</h2><b style="font-size:24px;color:var(--ink-strong)">${kc(App.S.scenario === 'empty' ? 0 : cr.balance)}</b>
          <span class="muted">Kredity může koupit jen správce firmy. Použít je mohou všichni kolegové při placení.</span></div></div>` +
        (hist.length ? `<h2 style="margin:20px 0 8px">Pohyby na účtu</h2><table class="tbl"><thead><tr><th>Datum</th><th>Popis</th><th>Částka</th></tr></thead><tbody>${hist.map(h =>
          `<tr><td data-label="Datum">${esc(h.date)}</td><td data-label="Popis">${esc(h.text)}</td><td data-label="Částka"><b style="color:${h.amount < 0 ? 'var(--err)' : 'var(--ok)'}">${h.amount > 0 ? '+' : ''}${kc(h.amount)}</b></td></tr>`).join('')}</tbody></table>`
          : emptyState('Zatím nemáte žádné kredity', 'Firemní kredity získáte dobitím nebo vrácením peněz za objednávku.'));
    }
  });

  App.on('cr-buy', () => {
    const tiles = [5000, 10000, 20000, 50000].map((a, i) => `<label class="tile"><input type="radio" name="amount" value="${a}" ${i === 1 ? 'checked' : ''}><div><b>${kc(a)}</b></div></label>`).join('');
    dialog({
      title: 'Koupit firemní kredity', sub: 'Kredity budou připsány po zaplacení.',
      body: `<div class="tiles">${tiles}</div>`, submit: 'Pokračovat k platbě',
      onSubmit(d) {
        const a = +d.amount; App.S.credits.balance += a; App.S.credits.history.unshift({ date: '16. 10. 2026', text: 'Dobití firemních kreditů', amount: a });
        App.render(); toast('Kredity jsou připsané (v prototypu bez platby).');
      }
    });
  });
})();
