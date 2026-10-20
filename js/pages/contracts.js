/* Smlouvy a souhlasy: T&C history, GDPR consent, marketing consent + channels (per user), business-proof documents, cookies */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const CHANNELS = { email: 'E-mail', phone: 'Telefon', whatsapp: 'WhatsApp', other: 'Jiný kanál' };
  const name = u => (u.first + ' ' + u.last).trim() || u.email;
  const TODAY = '16. 10. 2026';

  App.register('contracts', {
    label: 'Smlouvy a souhlasy', icon: 'ListSolid',
    comp: {
      setup() {
        const ag = computed(() => App.S.agreements), me = computed(() => App.me());
        const users = computed(() => App.list(App.S.users.filter(u => u.status !== 'invited')));
        const cookies = reactive({ open: false, analytics: false, marketing: false });
        const up = reactive({ open: false, file: '', err: '' });
        const acceptTerms = () => {
          const a = App.S.agreements, m = App.me();
          a.terms.unshift({ version: a.pendingTerms.version, country: 'CZ', lang: 'Čeština', date: TODAY, user: name(m) }); a.pendingTerms = null; toast('Nové obchodní podmínky jste přijali.');
        };
        const setMarketing = on => {
          const m = App.me(); m.marketing.on = on; m.marketing.date = on ? TODAY : m.marketing.date;
          if (on && !m.marketing.channels.length) m.marketing.channels = ['email'];
          toast(on ? 'Marketingový souhlas je udělený.' : 'Marketingový souhlas je odvolaný.');
        };
        const setChannel = (k, on) => { const m = App.me(); m.marketing.channels = on ? m.marketing.channels.concat(k) : m.marketing.channels.filter(x => x !== k); if (!m.marketing.channels.length) { m.marketing.on = false; toast('Marketingový souhlas je odvolaný.'); } };
        const setStats = on => { const m = App.me(); m.gdpr.stats = on; toast(on ? 'Souhlas je udělený.' : 'Souhlas je odvolaný.'); };
        const openCookies = () => { Object.assign(cookies, { open: true }, App.S.agreements.cookies); };
        const saveCookies = () => { Object.assign(App.S.agreements.cookies, { analytics: cookies.analytics, marketing: cookies.marketing }); cookies.open = false; toast('Nastavení cookies je uložené.'); };
        const pick = e => { const file = e.target.files && e.target.files[0]; up.file = file ? file.name : ''; };
        const upload = () => {
          if (!up.file) return up.err = 'Vyberte soubor, který chcete nahrát.';
          if (App.S.agreements.proofDocs.length >= App.S.agreements.proofMax) return up.err = 'Dosáhli jste nejvyššího počtu dokladů.';
          App.S.agreements.proofDocs.push({ id: 'p' + Date.now(), name: up.file, date: TODAY }); up.open = false; up.file = ''; toast('Doklad je nahraný.');
        };
        const delDoc = d => {
          if (App.S.agreements.proofDocs.length <= App.S.agreements.proofMin) return Acct.confirm({ title: 'Doklad nelze odebrat', text: 'Potřebujeme alespoň jeden doklad o podnikání. Nejdřív nahrajte nový.', cancel: 'Rozumím' });
          Acct.confirm({ title: 'Odebrat doklad?', text: d.name + ' zmizí z firemního účtu.', label: 'Odebrat', danger: true, onYes: () => { App.S.agreements.proofDocs = App.S.agreements.proofDocs.filter(x => x.id !== d.id); toast('Doklad je odebraný.'); } });
        };
        const chanText = m => m.on ? m.channels.map(k => t(CHANNELS[k])).join(', ') : '—';
        return { App, I, t, ag, me, users, cookies, up, CHANNELS, name, acceptTerms, setMarketing, setChannel, setStats, openCookies, saveCookies, pick, upload, delDoc, chanText };
      },
      template: `
        <page-state title="Smlouvy a souhlasy">
          <ds-message v-if="ag.pendingTerms" variant="warning" class="mb" :title="t('Nová verze obchodních podmínek')" :body="t('Od ' + ag.pendingTerms.date + ' platí obchodní podmínky ve verzi ' + ag.pendingTerms.version + '. Potvrďte, že s nimi souhlasíte.')">
            <template #action><ds-button size="sm" @click="acceptTerms">{{ t('Přijmout') }}</ds-button></template>
          </ds-message>

          <h2 class="sec-h first">{{ t('Obchodní podmínky') }}</h2>
          <p class="muted lead2">{{ t('Evidujeme, kdy a kdo odsouhlasil kterou verzi podmínek. Podmínky jsou pro každou zemi a jazyk zvlášť.') }} <later-tag label="Ověřit"></later-tag></p>
          <ds-table class="acct-tbl">
            <thead><tr><th>{{ t('Verze') }}</th><th>{{ t('Jazyk') }}</th><th>{{ t('Země') }}</th><th>{{ t('Datum') }}</th><th>{{ t('Přijal(a)') }}</th></tr></thead>
            <tbody><tr v-for="x in ag.terms" :key="x.version"><td :data-label="t('Verze')"><b>{{ x.version }}</b></td><td :data-label="t('Jazyk')">{{ t(x.lang) }}</td><td :data-label="t('Země')">{{ t('Česko') }}</td><td :data-label="t('Datum')">{{ x.date }}</td><td :data-label="t('Přijal(a)')">{{ x.user }}</td></tr></tbody>
          </ds-table>

          <h2 class="sec-h">{{ t('Zpracování osobních údajů') }}</h2>
          <section class="acct-card"><div class="rows">
            <span v-if="me.gdpr">{{ t('Váš souhlas jste udělili') }} {{ me.gdpr.date }} · {{ t('Zásady zpracování osobních údajů') }} {{ me.gdpr.version }}</span>
            <ds-inline-field-label class="acct-radio" for="g-req"><ds-switch id="g-req" :checked="true" disabled></ds-switch><template #label>{{ t('Zpracování nutné pro objednávky a doručení') }} <span class="muted">({{ t('nelze odvolat') }})</span></template></ds-inline-field-label>
            <ds-inline-field-label v-if="me.gdpr" class="acct-radio" for="g-stats"><ds-switch id="g-stats" :checked="me.gdpr.stats" @update:checked="setStats"></ds-switch><template #label>{{ t('Statistiky a zlepšování služby') }}</template></ds-inline-field-label>
          </div></section>

          <h2 class="sec-h">{{ t('Marketingový souhlas') }}</h2>
          <ds-message variant="info" class="mb" :title="t('Souhlas ukládáme za každého kolegu')" :body="t('Otevřená otázka: souhlas může být nakonec udělován za celou firmu. Zatím ho ukládáme zvlášť u každého kolegy.')">
            <template #header><later-tag label="Ověřit"></later-tag></template>
          </ds-message>
          <section class="acct-card"><div class="rows">
            <h2>{{ t('Váš souhlas') }}</h2>
            <ds-inline-field-label class="acct-radio" for="m-on"><ds-switch id="m-on" :checked="me.marketing.on" @update:checked="setMarketing"></ds-switch><template #label>{{ t('Chci dostávat nabídky a novinky makro') }}</template></ds-inline-field-label>
            <fieldset v-if="me.marketing.on" class="fset"><legend class="lbl-t">{{ t('Kanály') }}</legend>
              <ds-inline-field-label v-for="(label, k) in CHANNELS" :key="k" class="acct-radio" :for="'mc-' + k"><ds-checkbox :id="'mc-' + k" :checked="me.marketing.channels.includes(k)" @update:checked="setChannel(k, $event)"></ds-checkbox><template #label>{{ t(label) }}</template></ds-inline-field-label></fieldset>
            <span class="note">{{ t('Souhlas můžete kdykoli odvolat.') }}</span>
          </div></section>
          <ds-table v-if="App.isAdmin() && users.length" class="acct-tbl">
            <thead><tr><th>{{ t('Kolega') }}</th><th>{{ t('Marketingový souhlas') }}</th><th>{{ t('Kanály') }}</th><th>{{ t('Souhlas se zpracováním údajů') }}</th></tr></thead>
            <tbody><tr v-for="u in users" :key="u.id"><td :data-label="t('Kolega')">{{ name(u) }}</td>
              <td :data-label="t('Marketingový souhlas')"><product-tag :variant="u.marketing.on ? 'green' : 'neutral'" :label="t(u.marketing.on ? 'Udělen' : 'Neudělen')"></product-tag><span v-if="u.marketing.date" class="cell-sub">{{ u.marketing.date }}</span></td>
              <td :data-label="t('Kanály')">{{ chanText(u.marketing) }}</td>
              <td :data-label="t('Souhlas se zpracováním údajů')">{{ u.gdpr ? u.gdpr.date + ' · ' + u.gdpr.version : '—' }}</td></tr></tbody>
          </ds-table>

          <h2 class="sec-h">{{ t('Doklady o podnikání') }}</h2>
          <p class="muted lead2">{{ t('Pro Česko evidujeme 1–3 doklady o podnikání.') }}</p>
          <ds-table v-if="ag.proofDocs.length" class="acct-tbl">
            <thead><tr><th>{{ t('Dokument') }}</th><th>{{ t('Datum') }}</th><th><span class="sr">{{ t('Akce') }}</span></th></tr></thead>
            <tbody><tr v-for="d in ag.proofDocs" :key="d.id"><td :data-label="t('Dokument')"><b>{{ t(d.name) }}</b></td><td :data-label="t('Datum')">{{ d.date }}</td>
              <td class="acts-td"><ds-button v-if="App.isAdmin()" variant="ghost" size="sm" class="acct-danger-text" @click="delDoc(d)">{{ t('Odebrat') }}</ds-button></td></tr></tbody>
          </ds-table>
          <div v-if="App.isAdmin()" class="mb-btn"><ds-button size="sm" variant="secondary" @click="up.open = true">{{ t('Nahrát doklad') }}</ds-button></div>

          <h2 class="sec-h">{{ t('Cookies') }}</h2>
          <section class="acct-card"><div class="rows"><span class="muted">{{ t('Nastavení cookies platí pro vás jako uživatele.') }}</span></div>
            <ds-button variant="secondary" size="sm" @click="openCookies">{{ t('Nastavit cookies') }}</ds-button></section>

          <form-modal v-model:open="cookies.open" title="Nastavení cookies" submit-label="Uložit" @submit="saveCookies">
            <ds-inline-field-label class="acct-radio" for="c-n"><ds-switch id="c-n" :checked="true" disabled></ds-switch><template #label>{{ t('Nezbytné cookies') }} <span class="muted">({{ t('nelze vypnout') }})</span></template></ds-inline-field-label>
            <ds-inline-field-label class="acct-radio" for="c-a"><ds-switch id="c-a" :checked="cookies.analytics" @update:checked="cookies.analytics = $event"></ds-switch><template #label>{{ t('Analytické cookies') }}</template></ds-inline-field-label>
            <ds-inline-field-label class="acct-radio" for="c-m"><ds-switch id="c-m" :checked="cookies.marketing" @update:checked="cookies.marketing = $event"></ds-switch><template #label>{{ t('Marketingové cookies') }}</template></ds-inline-field-label>
          </form-modal>
          <form-modal v-model:open="up.open" title="Nahrát doklad" submit-label="Nahrát" @submit="upload">
            <div class="fld2"><span class="lbl-t">{{ t('Soubor') }}</span>
              <label class="upslot" :class="{ on: up.file }"><input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="pick"><span>{{ up.file || t('Vyberte soubor (PDF, JPG nebo PNG)') }}</span></label>
              <ds-field-message v-if="up.err" role="alert" class="fld-err">{{ t(up.err) }}</ds-field-message></div>
          </form-modal>
        </page-state>`
    }
  });
})();
