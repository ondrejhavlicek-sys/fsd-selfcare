/* Role a oprávnění (read-only matrix) and Platební karty */
(function () {
  const { esc, icon, toast, confirmDialog, emptyState, alertBox } = UI;

  App.register('roles', {
    label: 'Role a oprávnění', icon: 'shield', admin: true,
    render() {
      const R = MockData.roles;
      const rows = [
        ['Nakupovat pro firmu', 'Všechny provozovny', 'Přiřazené provozovny', '—'],
        ['Prohlížet objednávky', '✓', '✓', '✓'],
        ['Upravovat firemní informace', '✓', '—', '—'],
        ['Přidávat a spravovat kolegy', '✓', '—', '—'],
        ['Přidávat a spravovat provozovny', '✓', '—', '—'],
        ['Kupovat firemní kredity', '✓', '—', '—'],
        ['Spravovat platební karty', '✓', '—', '—']
      ];
      return pageHead('Role a oprávnění') + `<p class="muted" style="margin:-8px 0 20px">Každý kolega má právě jednu roli. Role se nastavuje u kolegy v sekci Uživatelé.</p>
        <div class="grid2" style="margin-bottom:24px">${Object.keys(R).map(k => `<div class="site-card"><h2>${esc(R[k].label)}</h2><span class="muted">${esc(R[k].desc)}</span></div>`).join('')}</div>
        <table class="tbl"><thead><tr><th>Oprávnění</th><th>Správce</th><th>Nákupčí</th><th>Prohlížející</th></tr></thead><tbody>${rows.map(r =>
          `<tr><td data-label="Oprávnění"><b>${esc(r[0])}</b></td><td data-label="Správce">${esc(r[1])}</td><td data-label="Nákupčí">${esc(r[2])}</td><td data-label="Prohlížející">${esc(r[3])}</td></tr>`).join('')}</tbody></table>`;
    }
  });

  App.register('payments', {
    label: 'Platební karty', icon: 'card', admin: true,
    render() {
      const c = App.S.scenario === 'empty' ? null : App.S.card;
      return pageHead('Platební karty') + (c
        ? `<div class="card"><div class="rows"><h2>${esc(c.brand)} •••• ${esc(c.last4)}</h2><span class="muted">Platí do ${esc(c.exp)}</span></div><button class="tbtn danger" data-act="pay-del">Odebrat</button></div>
           <p class="muted">Novou kartu uložíte při placení v obchodě. Platba probíhá přes zabezpečenou bankovní bránu.</p>`
        : emptyState('Zatím nemáte uloženou žádnou kartu', 'Kartu můžete uložit při placení, ať ji nemusíte zadávat znovu. Platba probíhá přes zabezpečenou bankovní bránu.'));
    }
  });

  App.on('pay-del', () => confirmDialog('Odebrat kartu?', 'Kartu budete moci kdykoli uložit znovu při placení.', 'Odebrat', () => {
    App.S.card = null; App.render(); toast('Karta je odebraná.');
  }));
})();
