/* Uživatelé: Fresh table, add/edit dialog with role radios, block/unblock, remove */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const STATUS = { active: ['Aktivní', 'green'], invited: ['Pozvánka odeslána', 'neutral'], blocked: ['Zablokovaný', 'red'] };

  const sitesText = u => {
    if (u.role === 'admin' || u.sites === 'all') return 'Všechny provozovny';
    return u.sites.length ? u.sites.map(App.siteName).join(', ') : 'Žádná provozovna';
  };

  App.register('users', {
    label: 'Uživatelé', icon: 'Users', admin: true,
    comp: {
      setup() {
        const list = computed(() => App.list(App.S.users));
        const f = reactive({ open: false, id: null, email: '', first: '', last: '', role: 'buyer', scope: 'all', sites: [], err: {} });
        const roles = MockData.roles;
        const openForm = u => {
          const all = !u || u.role === 'admin' || u.sites === 'all';
          Object.assign(f, { open: true, id: u ? u.id : null, err: {}, email: u ? u.email : '', first: u ? u.first : '', last: u ? u.last : '',
            role: u ? u.role : 'buyer', scope: all ? 'all' : 'some', sites: all ? [] : u.sites.slice() });
        };
        const collect = base => {
          base.first = f.first.trim(); base.last = f.last.trim(); base.role = f.role;
          base.sites = f.role === 'admin' || f.scope === 'all' ? 'all' : f.sites.slice();
        };
        const submit = () => {
          f.err = {}; const c = App.S.company;
          if (!f.id) {
            const email = f.email.trim().toLowerCase();
            if (!emailOk(email)) return f.err = { email: 'Zadejte e-mail ve tvaru jmeno@firma.cz.' };
            if (App.S.users.some(u => u.email === email)) return f.err = { email: 'Tento kolega už ve firmě je.' };
            if (c.onlyCompanyEmail && !c.domains.includes(email.split('@')[1])) return f.err = { email: 'Použijte firemní e-mail (' + c.domains.map(x => '@' + x).join(', ') + ').' };
            const u = { id: 'u' + Date.now(), email, status: 'invited' }; collect(u); App.S.users.push(u);
            f.open = false; toast('Pozvánka byla odeslána na ' + email + '.');
          } else {
            const u = App.S.users.find(x => x.id === f.id);
            if (u.role === 'admin' && f.role !== 'admin' && App.S.users.filter(x => x.role === 'admin' && x.status !== 'blocked').length < 2)
              return f.err = { role: 'Ve firmě musí zůstat alespoň jeden správce.' };
            collect(u); f.open = false; toast('Změny jsou uložené.');
          }
        };
        const toggleSite = (id, on) => { f.sites = on ? f.sites.concat(id) : f.sites.filter(x => x !== id); };
        const resend = u => toast('Pozvánka byla odeslána znovu na ' + u.email + '.');
        const block = u => {
          if (u.status === 'blocked') { u.status = 'active'; return toast('Kolega je odblokovaný.'); }
          Acct.confirm({ title: 'Zablokovat kolegu?', text: 'Kolega se nebude moct přihlásit ani nakupovat. Odblokovat ho můžete kdykoli.', label: 'Zablokovat', danger: true,
            onYes: () => { u.status = 'blocked'; toast('Kolega je zablokovaný.'); } });
        };
        const del = u => {
          if (u.role === 'admin' && App.S.users.filter(x => x.role === 'admin').length < 2)
            return Acct.confirm({ title: 'Kolegu nelze odebrat', text: 'Ve firmě musí zůstat alespoň jeden správce. Nejdřív určete správcem jiného kolegu.', cancel: 'Rozumím' });
          Acct.confirm({ title: 'Odebrat kolegu?', text: u.email + ' ztratí přístup do firemního účtu. Jeho objednávky zůstanou zachované.', label: 'Odebrat', danger: true,
            onYes: () => { App.S.users = App.S.users.filter(x => x.id !== u.id); toast('Kolega je odebraný.'); } });
        };
        return { App, I, t, list, f, roles, STATUS, sitesText, openForm, submit, toggleSite, resend, block, del, MockData };
      },
      template: `
        <page-state title="Uživatelé">
          <template #action><ds-button @click="openForm(null)">{{ t('Přidat kolegu') }}</ds-button></template>
          <template #default>
            <ds-message v-if="App.S.company.onlyCompanyEmail" variant="info" class="mb" :title="t('Kolegy půjde přidat jen s firemním e-mailem')"
              :body="t('Povolené domény:') + ' ' + App.S.company.domains.map(d => '@' + d).join(', ') + '. ' + t('Změníte je ve Firemních informacích.')">
              <template #action><ds-button variant="secondary" size="sm" as="a" href="#/ucet/company">{{ t('Otevřít Firemní informace') }}</ds-button></template>
            </ds-message>
            <ds-table v-if="list.length" class="acct-tbl">
              <thead><tr><th>{{ t('E-mail') }}</th><th>{{ t('Jméno') }}</th><th>{{ t('Příjmení') }}</th><th>{{ t('Role') }}</th><th>{{ t('Provozovny') }}</th><th>{{ t('Stav') }}</th><th><span class="sr">{{ t('Akce kolegy') }}</span></th></tr></thead>
              <tbody>
                <tr v-for="u in list" :key="u.id">
                  <td :data-label="t('E-mail')"><span class="email">{{ u.email }}</span></td>
                  <td :data-label="t('Jméno')">{{ u.first || '—' }}</td>
                  <td :data-label="t('Příjmení')">{{ u.last || '—' }}</td>
                  <td :data-label="t('Role')">{{ t(roles[u.role].label) }}</td>
                  <td :data-label="t('Provozovny')">{{ t(sitesText(u)) }}</td>
                  <td :data-label="t('Stav')"><product-tag :variant="STATUS[u.status][1]" :label="t(STATUS[u.status][0])"></product-tag></td>
                  <td class="acts-td">
                    <ds-dropdown-menu align="end">
                      <template #trigger><ds-icon-button variant="ghost" size="sm" :icon="I.KebabMenuSolid" :aria-label="t('Akce kolegy') + ': ' + u.email"></ds-icon-button></template>
                      <ds-dropdown-menu-item :label="t('Upravit')" @select="openForm(u)"></ds-dropdown-menu-item>
                      <ds-dropdown-menu-item v-if="u.status === 'invited'" :label="t('Odeslat znovu')" @select="resend(u)"></ds-dropdown-menu-item>
                      <ds-dropdown-menu-item v-else :label="u.status === 'blocked' ? t('Odblokovat') : t('Zablokovat')" @select="block(u)"></ds-dropdown-menu-item>
                      <ds-dropdown-menu-item :label="t('Odebrat')" class="acct-danger-text" @select="del(u)"></ds-dropdown-menu-item>
                    </ds-dropdown-menu>
                  </td>
                </tr>
              </tbody>
            </ds-table>
            <empty-state v-else title="Zatím tu nemáte žádné kolegy" text="Přidejte kolegu a určete, co smí ve firemním účtu dělat.">
              <ds-button @click="openForm(null)">{{ t('Přidat kolegu') }}</ds-button>
            </empty-state>
          <form-modal v-model:open="f.open" :title="f.id ? 'Upravit kolegu' : 'Přidat kolegu'" :subtitle="f.id ? undefined : 'Kolega dostane e-mail s pozvánkou do firemního účtu.'"
            :submit-label="f.id ? 'Uložit' : 'Odeslat pozvánku'" @submit="submit">
            <div v-if="f.id" class="fld2"><span class="lbl-t">{{ t('E-mail') }}</span><b>{{ f.email }}</b></div>
            <field v-else label="E-mail kolegy" type="email" req v-model="f.email" placeholder="např. jmeno@firma.cz" :error="f.err.email"></field>
            <div class="row2"><field label="Jméno" v-model="f.first"></field><field label="Příjmení" v-model="f.last"></field></div>
            <fieldset class="fset">
              <legend class="lbl-t">{{ t('Role') }}</legend>
              <ds-radio-group v-model="f.role" class="radios">
                <ds-inline-field-label v-for="(r, k) in roles" :key="k" class="acct-radio" :for="'role-' + k">
                  <ds-radio :id="'role-' + k" :value="k"></ds-radio>
                  <template #label><span><b>{{ t(r.label) }}</b><span class="rdesc">{{ t(r.desc) }}</span></span></template>
                </ds-inline-field-label>
              </ds-radio-group>
              <ds-field-message v-if="f.err.role" role="alert" class="fld-err">{{ t(f.err.role) }}</ds-field-message>
            </fieldset>
            <fieldset v-if="f.role !== 'admin'" class="fset">
              <legend class="lbl-t">{{ t('Provozovny, pro které smí nakupovat') }}</legend>
              <ds-radio-group v-model="f.scope" class="radios">
                <ds-inline-field-label class="acct-radio" for="scope-all"><ds-radio id="scope-all" value="all"></ds-radio><template #label>{{ t('Všechny provozovny') }}</template></ds-inline-field-label>
                <ds-inline-field-label class="acct-radio" for="scope-some"><ds-radio id="scope-some" value="some"></ds-radio><template #label>{{ t('Jen vybrané provozovny') }}</template></ds-inline-field-label>
              </ds-radio-group>
              <div v-if="f.scope === 'some'" class="site-pick">
                <ds-inline-field-label v-for="s in App.S.sites" :key="s.id" class="acct-radio" :for="'sp-' + s.id">
                  <ds-checkbox :id="'sp-' + s.id" :checked="f.sites.includes(s.id)" @update:checked="toggleSite(s.id, $event)"></ds-checkbox>
                  <template #label>{{ s.name }}<span v-if="s.blocked" class="muted"> ({{ t('zablokovaná') }})</span></template>
                </ds-inline-field-label>
              </div>
            </fieldset>
          </form-modal>
          </template>
        </page-state>`
    }
  });
})();
