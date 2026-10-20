/* Firemní informace: stacked cards (billing data, invoice contacts, communication contacts, company-email-only switch) */
(function () {
  const { reactive, ref } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const phoneOk = v => /^\+?[\d\s]{9,16}$/.test(v || '');

  App.register('company', {
    label: 'Firemní informace', icon: 'BuildingOutline',
    comp: {
      setup() {
        const c = Vue.computed(() => App.S.company), refreshing = ref(false);
        const dlg = reactive({ open: false, kind: '', phone: '', email: '', on: false, domains: '', err: {} });
        const titles = { invoice: 'Kontakty pro zasílání faktur', comm: 'Kontakty pro komunikaci', domains: 'E-mail jen s firemní doménou' };
        const open = kind => {
          const co = App.S.company;
          Object.assign(dlg, { open: true, kind, err: {}, phone: co[kind + 'Phone'] || '', email: co[kind + 'Email'] || '', on: co.onlyCompanyEmail || kind === 'domains' && false, domains: co.domains.join(', ') });
          if (kind === 'domains') dlg.on = true;
        };
        const refresh = () => { refreshing.value = true; setTimeout(() => { refreshing.value = false; toast('Údaje jsou aktuální podle obchodního rejstříku.'); }, 900); };
        const toggle = on => { if (on) open('domains'); else { App.S.company.onlyCompanyEmail = false; toast('Nastavení je uložené.'); } };
        const submit = () => {
          const co = App.S.company, k = dlg.kind; dlg.err = {};
          if (k === 'domains') {
            const domains = dlg.domains.split(',').map(s => s.trim().replace(/^@/, '').toLowerCase()).filter(Boolean);
            if (!domains.length) return dlg.err = { domains: 'Zadejte alespoň jednu doménu.' };
            co.onlyCompanyEmail = true; co.domains = domains;
          } else {
            if (!phoneOk(dlg.phone)) return dlg.err = { phone: 'Zadejte telefon ve tvaru +420 777 000 111.' };
            if (!emailOk(dlg.email)) return dlg.err = { email: 'Zadejte e-mail ve tvaru jmeno@firma.cz.' };
            co[k + 'Phone'] = dlg.phone.trim(); co[k + 'Email'] = dlg.email.trim();
          }
          dlg.open = false; toast(k === 'domains' ? 'Nastavení je uložené.' : 'Kontakty jsou uložené.');
        };
        return { App, I, t, c, dlg, titles, open, refresh, refreshing, toggle, submit };
      },
      template: `
        <page-state title="Firemní informace">
          <ds-message v-if="!App.isAdmin()" variant="info" class="mb" :title="t('Nastavení firmy vidíte jen ke čtení')" :body="t('Změny může provést správce firmy.')"></ds-message>
          <section class="acct-card">
            <div class="rows"><h2>{{ t('Název a fakturační údaje') }}</h2><b>{{ c.name }}</b><span class="muted">{{ c.address }}</span><span class="muted">{{ t('IČ') }}: {{ c.ico }}</span><span class="muted">{{ t('DIČ') }}: {{ c.dic }}</span></div>
            <ds-button v-if="App.isAdmin()" variant="tertiary" size="sm" :loading="refreshing" @click="refresh">{{ t('Aktualizovat z rejstříku') }}</ds-button>
          </section>
          <section v-for="k in ['invoice', 'comm']" :key="k" class="acct-card">
            <div class="rows"><h2>{{ t(titles[k]) }}</h2><span>{{ c[k + 'Phone'] }}</span><span>{{ c[k + 'Email'] }}</span></div>
            <ds-icon-button v-if="App.isAdmin()" variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t(titles[k]).toLowerCase()" @click="open(k)"></ds-icon-button>
          </section>
          <section class="acct-card">
            <div class="rows"><h2>{{ t('Přidávat kolegy jen s firemním e-mailem') }}</h2>
              <span class="muted">{{ c.onlyCompanyEmail ? t('Zapnuto. Kolegy půjde přidat jen s e-mailem v těchto doménách:') : t('Vypnuto. Kolegu půjde přidat s jakýmkoli e-mailem.') }}</span>
              <div v-if="c.onlyCompanyEmail" class="tags"><product-tag v-for="d in c.domains" :key="d" variant="neutral" :label="'@' + d"></product-tag></div></div>
            <div class="card-act">
              <ds-switch :checked="c.onlyCompanyEmail" :disabled="!App.isAdmin()" :aria-label="t('Přidávat kolegy jen s firemním e-mailem')" @update:checked="toggle"></ds-switch>
              <ds-icon-button v-if="App.isAdmin()" variant="ghost" size="sm" :icon="I.EditSolid" :aria-label="t('Upravit') + ': ' + t('e-mail jen s firemní doménou')" @click="open('domains')"></ds-icon-button>
            </div>
          </section>
          <form-modal v-model:open="dlg.open" :title="titles[dlg.kind] || ''" :subtitle="dlg.kind === 'domains' ? 'Přidání kolegy půjde dokončit jen s e-mailem v povolené doméně.' : undefined" @submit="submit">
            <template v-if="dlg.kind === 'domains'">
              <field label="Povolené domény (oddělte čárkou)" v-model="dlg.domains" placeholder="firma.cz, firma.com" :error="dlg.err.domains"></field>
            </template>
            <template v-else>
              <field label="Telefon" type="tel" req v-model="dlg.phone" :error="dlg.err.phone"></field>
              <field label="E-mail" type="email" req v-model="dlg.email" :error="dlg.err.email"></field>
            </template>
          </form-modal>
        </page-state>`
    }
  });
})();
