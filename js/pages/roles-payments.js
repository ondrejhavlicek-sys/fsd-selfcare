/* Role a oprávnění (read-only matrix) and Platební karty */
(function () {
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;

  App.register('roles', {
    label: 'Role a oprávnění', icon: 'Shield', admin: true,
    comp: {
      setup() {
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
        return { t, R, rows };
      },
      template: `
        <page-state title="Role a oprávnění">
          <p class="muted lead">{{ t('Každý kolega má právě jednu roli. Role se nastavuje u kolegy v sekci Uživatelé.') }}</p>
          <div class="acct-grid mb"><section v-for="(r, k) in R" :key="k" class="acct-card"><div class="rows"><h2>{{ t(r.label) }}</h2><span class="muted">{{ t(r.desc) }}</span></div></section></div>
          <ds-table class="acct-tbl">
            <thead><tr><th>{{ t('Oprávnění') }}</th><th>{{ t(R.admin.label) }}</th><th>{{ t(R.buyer.label) }}</th><th>{{ t(R.viewer.label) }}</th></tr></thead>
            <tbody><tr v-for="r in rows" :key="r[0]"><td :data-label="t('Oprávnění')"><b>{{ t(r[0]) }}</b></td><td :data-label="t(R.admin.label)">{{ t(r[1]) }}</td><td :data-label="t(R.buyer.label)">{{ t(r[2]) }}</td><td :data-label="t(R.viewer.label)">{{ t(r[3]) }}</td></tr></tbody>
          </ds-table>
        </page-state>`
    }
  });

  App.register('payments', {
    label: 'Platební karty', icon: 'CreditCard', admin: true,
    comp: {
      setup() {
        const c = Vue.computed(() => App.S.scenario === 'empty' ? null : App.S.card);
        const del = () => Acct.confirm({ title: 'Odebrat kartu?', text: 'Kartu budete moci kdykoli uložit znovu při placení.', label: 'Odebrat', danger: true,
          onYes: () => { App.S.card = null; toast('Karta je odebraná.'); } });
        return { t, c, del, I };
      },
      template: `
        <page-state title="Platební karty">
          <template v-if="c">
            <section class="acct-card"><div class="rows"><h2>{{ c.brand }} •••• {{ c.last4 }}</h2><span class="muted">{{ t('Platí do ' + c.exp) }}</span></div>
              <ds-button variant="ghost" size="sm" class="acct-danger-text" @click="del">{{ t('Odebrat') }}</ds-button></section>
            <p class="muted">{{ t('Novou kartu uložíte při placení v obchodě. Platba probíhá přes zabezpečenou bankovní bránu.') }}</p>
          </template>
          <empty-state v-else title="Zatím nemáte uloženou žádnou kartu" text="Kartu můžete uložit při placení, ať ji nemusíte zadávat znovu. Platba probíhá přes zabezpečenou bankovní bránu."></empty-state>
        </page-state>`
    }
  });
})();
