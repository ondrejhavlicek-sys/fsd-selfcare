/* Firemní informace */
(function () {
  const { esc, icon, field, dialog, toast, alertBox } = UI;
  const head = (title, btn) => `<div class="head"><h1>${esc(title)}</h1>${btn || ''}</div>`;
  window.pageHead = head;

  const editBtn = (what, label) => App.isAdmin() ? `<button class="icon-btn" data-act="co-edit" data-what="${what}" aria-label="Upravit: ${esc(label)}">${icon('edit')}</button>` : '';

  App.register('company', {
    label: 'Firemní informace', icon: 'company',
    render() {
      const c = App.S.company;
      const ro = App.isAdmin() ? '' : alertBox('info', 'Nastavení firmy vidíte jen ke čtení', 'Změny může provést správce firmy.');
      return head('Firemní informace') + ro + `
      <div class="card"><div class="rows"><h2>Název a fakturační údaje</h2>
        <b>${esc(c.name)}</b><span class="muted">${esc(c.address)}</span><span class="muted">IČ: ${esc(c.ico)}</span><span class="muted">DIČ: ${esc(c.dic)}</span></div>
        ${App.isAdmin() ? `<button class="btn soft sm" data-act="co-refresh">${icon('refresh')}Aktualizovat z rejstříku</button>` : ''}</div>
      <div class="card"><div class="rows"><h2>Kontakty pro zasílání faktur</h2><span>${esc(c.invoicePhone)}</span><span>${esc(c.invoiceEmail)}</span></div>${editBtn('invoice', 'kontakty pro zasílání faktur')}</div>
      <div class="card"><div class="rows"><h2>Kontakty pro komunikaci</h2><span>${esc(c.commPhone)}</span><span>${esc(c.commEmail)}</span></div>${editBtn('comm', 'kontakty pro komunikaci')}</div>
      <div class="card"><div class="rows"><h2>Přidávat kolegy jen s firemním e-mailem</h2>
        <span class="muted">${c.onlyCompanyEmail ? 'Zapnuto. Kolegy půjde přidat jen s e-mailem v těchto doménách:' : 'Vypnuto. Kolegu půjde přidat s jakýmkoli e-mailem.'}</span>
        ${c.onlyCompanyEmail ? `<div class="chips">${c.domains.map(d => `<span class="chip">@${esc(d)}</span>`).join('')}</div>` : ''}</div>${editBtn('domains', 'e-mail jen s firemní doménou')}</div>`;
    }
  });

  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const phoneOk = v => /^\+?[\d\s]{9,16}$/.test(v || '');

  App.on('co-refresh', el => {
    el.disabled = true; el.textContent = 'Aktualizuji…';
    setTimeout(() => { App.render(); toast('Údaje jsou aktuální podle obchodního rejstříku.'); }, 900);
  });

  App.on('co-edit', el => {
    const c = App.S.company, w = el.dataset.what;
    if (w === 'invoice' || w === 'comm') {
      const pk = w + 'Phone', ek = w + 'Email';
      dialog({
        title: w === 'invoice' ? 'Kontakty pro zasílání faktur' : 'Kontakty pro komunikaci',
        body: field('Telefon', 'phone', c[pk], { type: 'tel', req: true }) + field('E-mail', 'email', c[ek], { type: 'email', req: true }),
        onSubmit(d) {
          if (!phoneOk(d.phone)) return { field: 'phone', msg: 'Zadejte telefon ve tvaru +420 777 000 111.' };
          if (!emailOk(d.email)) return { field: 'email', msg: 'Zadejte e-mail ve tvaru jmeno@firma.cz.' };
          c[pk] = d.phone.trim(); c[ek] = d.email.trim(); App.render(); toast('Kontakty jsou uložené.');
        }
      });
    } else {
      dialog({
        title: 'E-mail jen s firemní doménou',
        sub: 'Přidání kolegy půjde dokončit jen s e-mailem v povolené doméně.',
        body: `<label class="check"><input type="checkbox" name="on" ${c.onlyCompanyEmail ? 'checked' : ''}><span>Přidávat kolegy jen s firemním e-mailem</span></label>
          <div class="fld" data-f="domains" style="margin-top:8px"><label for="f-domains">Povolené domény (oddělte čárkou)</label>
          <input id="f-domains" name="domains" type="text" value="${esc(c.domains.join(', '))}" placeholder="firma.cz, firma.com"><div class="err" hidden></div></div>`,
        onSubmit(d) {
          const on = Array.isArray(d.on) ? d.on.length > 0 : !!d.on;
          const domains = (d.domains || '').split(',').map(s => s.trim().replace(/^@/, '').toLowerCase()).filter(Boolean);
          if (on && !domains.length) return { field: 'domains', msg: 'Zadejte alespoň jednu doménu.' };
          c.onlyCompanyEmail = on; c.domains = domains; App.render(); toast('Nastavení je uložené.');
        }
      });
    }
  });
})();
