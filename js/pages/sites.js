/* Provozovny (Location): name + commercial name, several delivery addresses (one main) with pin and handover details,
   preferred delivery days/times (a demand signal, not a guaranteed slot), alcohol/tobacco licence, active flag.
   Add/edit in a Fresh Drawer. Map, address suggestions and days picker are hand-built. */
(function () {
  const { reactive, computed } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const tm = s => String(s).replace(/^0/, '');
  const dayText = s => s.days.length === 7 ? t('každý den') : s.days.map(i => t(DAYS[i])).join(', ');
  const KINDS = [{ value: 'none', label: 'Žádná' }, { value: 'alcohol', label: 'Alkohol' }, { value: 'tobacco', label: 'Tabák' }, { value: 'both', label: 'Alkohol a tabák' }];
  const KIND_LABEL = { alcohol: 'Alkohol', tobacco: 'Tabák', both: 'Alkohol a tabák' };
  const TODAY = '2026-10-16';
  const dcz = iso => iso ? iso.split('-').reverse().map(x => String(+x)).join('. ') : '';
  const soon = s => s.licence && s.licence.kind !== 'none' && s.licence.expiry && s.licence.expiry < '2027-01-16';
  const newAddr = main => ({ id: 'a' + Date.now() + Math.round(Math.random() * 99), name: '', address: '', pin: [50, 50], entrance: '', floor: '', door: '', note: '', main: !!main, from: '', to: '', sug: [] });
  const blank = () => ({ id: null, name: '', tradeName: '', contact: '', phone: '', addresses: [newAddr(true)], days: [0, 1, 2, 3, 4], from: '06:00', to: '12:00', restrictions: [], note: '', licKind: 'none', licCode: '', licExpiry: '', copyFrom: 'none' });

  App.register('sites', {
    label: 'Provozovny', icon: 'LocationPinSolid',
    comp: {
      setup() {
        const list = computed(() => App.list(App.S.sites));
        const f = reactive(Object.assign(blank(), { open: false, err: {} }));
        const kinds = KINDS, otherSites = computed(() => [{ value: 'none', label: 'Nekopírovat' }].concat(App.S.sites.filter(s => s.id !== f.id).map(s => ({ value: s.id, label: s.name }))));
        const openForm = s => {
          const src = s ? JSON.parse(JSON.stringify(s)) : blank();
          const lic = src.licence || { kind: 'none', code: '', expiry: '' };
          Object.assign(f, blank(), src, { open: true, err: {}, addresses: src.addresses.map(a => Object.assign({ sug: [] }, a)),
            licKind: lic.kind, licCode: lic.code, licExpiry: lic.expiry, copyFrom: 'none' });
        };
        const onAddress = (a, v) => {
          a.address = v; const q = String(v).trim().toLowerCase();
          a.sug = q.length < 2 ? [] : MockData.addressSuggestions.filter(x => x.toLowerCase().includes(q)).slice(0, 5);
        };
        const pick = (a, v) => { a.address = v; a.sug = []; a.pin = [30 + Math.round(Math.random() * 40), 40 + Math.round(Math.random() * 30)]; };
        let drag = null;
        const move = (e, a) => { const r = e.currentTarget.getBoundingClientRect(); a.pin = [Math.round(Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100))), Math.round(Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100)))]; };
        const down = (e, a) => { drag = a; e.currentTarget.setPointerCapture(e.pointerId); move(e, a); };
        const mv = (e, a) => { if (drag === a) move(e, a); };
        const up = () => { drag = null; };
        const addAddr = () => f.addresses.push(newAddr(false));
        const delAddr = a => { const was = a.main; f.addresses = f.addresses.filter(x => x !== a); if (was && f.addresses.length) f.addresses[0].main = true; };
        const setMain = a => f.addresses.forEach(x => { x.main = x === a; });
        const toggleDay = i => { f.days = f.days.includes(i) ? f.days.filter(x => x !== i) : f.days.concat(i); };
        const toggleRestr = (k, on) => { f.restrictions = on ? f.restrictions.concat(k) : f.restrictions.filter(x => x !== k); };
        const submit = () => {
          f.err = {}; const e = f.err;
          if (!f.name.trim()) return e.name = 'Zadejte název provozovny.';
          if (!f.contact.trim()) return e.contact = 'Zadejte kontaktní osobu.';
          if (!/^\+?[\d\s]{9,16}$/.test(f.phone || '')) return e.phone = 'Zadejte telefon ve tvaru +420 777 000 111.';
          for (const a of f.addresses) {
            if (!a.name.trim()) return e.addr = 'Pojmenujte každou doručovací adresu.';
            if (!a.address.trim()) return e.addr = 'Zadejte adresu doručení.';
            if (a.from && a.to && a.from > a.to) return e.addr = 'Konec platnosti adresy musí být později než začátek.';
          }
          if (!f.days.length) return e.days = 'Vyberte alespoň jeden den doručení.';
          if (f.from && f.to && f.from >= f.to) return e.to = 'Konec příjmu musí být později než začátek.';
          if (f.licKind !== 'none' && !f.licCode.trim()) return e.licCode = 'Zadejte číslo licence.';
          const main = f.addresses.find(a => a.main) || f.addresses[0];
          const addresses = f.addresses.map(a => ({ id: a.id, name: a.name.trim(), address: a.address.trim(), pin: a.pin.slice(), entrance: a.entrance.trim(), floor: a.floor.trim(), door: a.door.trim(), note: a.note.trim(), main: a === main, from: a.from, to: a.to }));
          const data = { name: f.name.trim(), tradeName: f.tradeName.trim(), contact: f.contact.trim(), phone: f.phone.trim(), addresses, address: main.address,
            days: f.days.slice().sort(), from: f.from || '06:00', to: f.to || '12:00', restrictions: f.restrictions.slice(), note: (f.note || '').trim(),
            licence: { kind: f.licKind, code: f.licKind === 'none' ? '' : f.licCode.trim(), expiry: f.licKind === 'none' ? '' : f.licExpiry } };
          const isNew = !f.id;
          if (f.id) Object.assign(App.S.sites.find(s => s.id === f.id), data);
          else {
            const id = 's' + Date.now(); App.S.sites.push(Object.assign({ id, blocked: false }, data));
            if (f.copyFrom && f.copyFrom !== 'none') App.S.users.forEach(u => { if (Array.isArray(u.sites) && u.sites.includes(f.copyFrom)) u.sites.push(id); });
          }
          f.open = false; toast(isNew ? 'Provozovna je přidaná.' : 'Změny jsou uložené.');
        };
        const block = s => {
          if (s.blocked) { s.blocked = false; return toast('Provozovna je znovu aktivní.'); }
          Acct.confirm({ title: 'Deaktivovat provozovnu?', text: 'Do provozovny nepůjde objednávat, dokud ji znovu neaktivujete. Otevřené objednávky zůstanou beze změny.', label: 'Deaktivovat', danger: true,
            onYes: () => { s.blocked = true; toast('Provozovna je deaktivovaná.'); } });
        };
        const del = s => {
          if (App.S.orders.some(o => o.site === s.id && o.status !== 'Doručeno'))
            return Acct.confirm({ title: 'Provozovnu nelze odebrat', text: 'Má otevřené objednávky. Počkejte na jejich doručení, nebo provozovnu zatím deaktivujte.', cancel: 'Rozumím' });
          Acct.confirm({ title: 'Odebrat provozovnu?', text: s.name + ' zmizí z nabídky doručení a kolegům se odebere přístup.', label: 'Odebrat', danger: true, onYes: () => {
            App.S.sites = App.S.sites.filter(x => x.id !== s.id);
            App.S.users.forEach(u => { if (Array.isArray(u.sites)) u.sites = u.sites.filter(id => id !== s.id); });
            toast('Provozovna je odebraná.');
          } });
        };
        const handover = a => [a.entrance, a.floor, a.door, a.note].filter(Boolean).map(x => t(x)).join(' · ');
        const validity = a => a.from || a.to ? t('Platí') + ' ' + (dcz(a.from) || '…') + '–' + (dcz(a.to) || '…') : '';
        return { App, I, t, list, f, DAYS, dayText, tm, MockData, kinds, otherSites, KIND_LABEL, dcz, soon, handover, validity, openForm, onAddress, pick, down, mv, up, addAddr, delAddr, setMain, toggleDay, toggleRestr, submit, block, del };
      },
      template: `
        <page-state title="Provozovny">
          <template #action><ds-button v-if="App.isAdmin()" @click="openForm(null)">{{ t('Přidat provozovnu') }}</ds-button></template>
          <template #default>
            <ds-message v-if="!App.isAdmin()" variant="info" class="mb" :title="t('Provozovny vidíte jen ke čtení')" :body="t('Přidat nebo upravit je může správce firmy.')"></ds-message>
            <div v-if="list.length" class="acct-grid">
              <section v-for="s in list" :key="s.id" class="acct-card">
                <div class="top"><h2>{{ s.name }}</h2><product-tag :variant="s.blocked ? 'red' : 'green'" :label="t(s.blocked ? 'Deaktivovaná' : 'Aktivní')"></product-tag></div>
                <div class="rows">
                  <span class="muted">{{ t('Obchodní název') }}: {{ s.tradeName || App.S.company.tradeName || '—' }}<template v-if="!s.tradeName && App.S.company.tradeName"> ({{ t('z firmy') }})</template></span>
                  <div v-for="a in s.addresses" :key="a.id" class="addr-row">
                    <span><b>{{ t(a.name) }}</b> · {{ a.address }}</span>
                    <product-tag v-if="a.main" variant="green" :label="t('Hlavní')"></product-tag>
                    <span v-if="handover(a)" class="cell-sub">{{ handover(a) }}</span>
                    <span v-if="validity(a)" class="cell-sub">{{ validity(a) }} <later-tag label="Sezónní adresa"></later-tag></span>
                  </div>
                  <span class="muted">{{ t('Kontakt') }}: {{ s.contact }}, {{ s.phone }}</span>
                  <span class="muted">{{ t('Preferovaný čas doručení') }}: {{ dayText(s) }}, {{ tm(s.from) }}–{{ tm(s.to) }}</span>
                  <span v-if="s.licence && s.licence.kind !== 'none'" class="muted">{{ t('Licence') }}: {{ t(KIND_LABEL[s.licence.kind]) }} · {{ s.licence.code }}<template v-if="s.licence.expiry"> · {{ t('platí do') }} {{ dcz(s.licence.expiry) }}</template>
                    <product-tag v-if="soon(s)" variant="red" :label="t('Brzy vyprší')"></product-tag><later-tag v-if="s.licence.expiry" label="Hlídání platnosti"></later-tag></span>
                </div>
                <div v-if="s.restrictions.length" class="tags"><product-tag v-for="r in s.restrictions" :key="r" variant="neutral" :label="t(MockData.restrictionLabels[r])"></product-tag></div>
                <div v-if="App.isAdmin()" class="acts">
                  <ds-button variant="tertiary" size="sm" @click="openForm(s)">{{ t('Upravit') }}</ds-button>
                  <ds-button variant="ghost" size="sm" @click="block(s)">{{ s.blocked ? t('Aktivovat') : t('Deaktivovat') }}</ds-button>
                  <ds-button variant="ghost" size="sm" class="acct-danger-text" @click="del(s)">{{ t('Odebrat') }}</ds-button>
                </div>
              </section>
            </div>
            <empty-state v-else title="Zatím tu nemáte žádnou provozovnu" text="Provozovna je místo, kam vám doručujeme. Přidejte první a určete, kdo do ní smí nakupovat.">
              <ds-button v-if="App.isAdmin()" @click="openForm(null)">{{ t('Přidat provozovnu') }}</ds-button>
            </empty-state>

            <ds-drawer v-model:open="f.open" :title="t(f.id ? 'Upravit provozovnu' : 'Přidat provozovnu')" :subtitle="f.id ? f.name : undefined" class="acct-drawer">
              <form novalidate @submit.prevent="submit">
                <field label="Název provozovny" req v-model="f.name" placeholder="např. Restaurace U Mostu" :error="f.err.name"></field>
                <field label="Obchodní název provozovny" v-model="f.tradeName" placeholder="např. Bistro Brno" hint="Nepovinné. Když ho nevyplníte, použije se obchodní název firmy."></field>

                <div class="sub-sec"><h3>{{ t('Doručovací adresy') }}</h3>
                  <p class="note">{{ t('Provozovna může mít několik adres, například sklad nebo zahrádku. Jedna je hlavní.') }}</p>
                  <div v-for="(a, i) in f.addresses" :key="a.id" class="addr-box">
                    <div class="addr-box-h"><b>{{ t('Adresa') }} {{ i + 1 }}</b>
                      <ds-inline-field-label class="acct-radio" :for="'am-' + a.id"><ds-radio-group :model-value="a.main ? a.id : ''" @update:model-value="setMain(a)"><ds-radio :id="'am-' + a.id" :value="a.id"></ds-radio></ds-radio-group><template #label>{{ t('Hlavní adresa') }}</template></ds-inline-field-label>
                      <ds-button v-if="f.addresses.length > 1" variant="ghost" size="sm" class="acct-danger-text" @click="delAddr(a)">{{ t('Odebrat adresu') }}</ds-button></div>
                    <field label="Název adresy" req v-model="a.name" placeholder="např. Hlavní vchod"></field>
                    <div class="fld2 addr">
                      <ds-field-label :for="'ad-' + a.id">{{ t('Adresa doručení') }} <span class="opt">({{ t('povinné') }})</span></ds-field-label>
                      <ds-text-field :id="'ad-' + a.id" :model-value="a.address" :placeholder="t('např. Evropská 2758/11, 160 00 Praha 6')" autocomplete="off" role="combobox" :aria-expanded="a.sug.length > 0" :aria-controls="'sg-' + a.id" @update:model-value="onAddress(a, $event)"></ds-text-field>
                      <div v-if="a.sug.length" :id="'sg-' + a.id" class="sug" role="listbox"><button v-for="x in a.sug" :key="x" type="button" role="option" @click="pick(a, x)">{{ x }}</button></div>
                    </div>
                    <div class="fld2"><span class="lbl-t">{{ t('Přesné místo doručení (přetáhněte špendlík)') }}</span>
                      <div class="map" @pointerdown="down($event, a)" @pointermove="mv($event, a)" @pointerup="up">
                        <svg class="pin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" :style="{ left: a.pin[0] + '%', top: a.pin[1] + '%' }"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zm0-9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                        <small>{{ t('Zjednodušená mapa prototypu') }}</small></div></div>
                    <div class="row3"><field label="Vchod" v-model="a.entrance"></field><field label="Patro" v-model="a.floor"></field><field label="Číslo dveří" v-model="a.door"></field></div>
                    <field label="Poznámka k předání zboží" v-model="a.note" placeholder="např. zvonek Kuchyně"></field>
                    <div class="row2"><field label="Adresa platí od" type="date" v-model="a.from"></field><field label="Adresa platí do" type="date" v-model="a.to"></field></div>
                    <p class="note"><later-tag label="Sezónní adresa"></later-tag> {{ t('Nepovinné. Mimo toto období se adresa v objednávce nenabízí, například sklad v zimě nebo zahrádka v létě.') }}</p>
                  </div>
                  <ds-message v-if="f.err.addr" variant="error" :title="t(f.err.addr)"></ds-message>
                  <ds-button variant="secondary" size="sm" @click="addAddr">{{ t('Přidat adresu') }}</ds-button>
                </div>

                <div class="row2 sub-sec"><field label="Kontaktní osoba" req v-model="f.contact" :error="f.err.contact"></field><field label="Telefon" type="tel" req v-model="f.phone" :error="f.err.phone"></field></div>

                <div class="sub-sec"><h3>{{ t('Preferovaný čas doručení') }}</h3>
                  <p class="note">{{ t('Jde o vaše přání, ne o garantovaný čas doručení. Přesný čas potvrdíme při objednávce.') }}</p>
                  <div class="fld2"><span class="lbl-t" id="days-l">{{ t('Dny doručení') }}</span>
                    <div class="days" role="group" aria-labelledby="days-l"><button v-for="(d, i) in DAYS" :key="d" type="button" :aria-pressed="f.days.includes(i)" :class="{ on: f.days.includes(i) }" @click="toggleDay(i)">{{ t(d) }}</button></div>
                    <ds-field-message v-if="f.err.days" role="alert" class="fld-err">{{ t(f.err.days) }}</ds-field-message></div>
                  <div class="row2"><field label="Čas doručení od" type="time" v-model="f.from"></field><field label="Čas doručení do" type="time" v-model="f.to" :error="f.err.to"></field></div>
                  <fieldset class="fset"><legend class="lbl-t">{{ t('Omezení doručení') }}</legend>
                    <ds-inline-field-label v-for="(label, k) in MockData.restrictionLabels" :key="k" class="acct-radio" :for="'r-' + k">
                      <ds-checkbox :id="'r-' + k" :checked="f.restrictions.includes(k)" @update:checked="toggleRestr(k, $event)"></ds-checkbox>
                      <template #label>{{ t(label) }}</template>
                    </ds-inline-field-label></fieldset>
                  <field label="Poznámka pro řidiče" textarea v-model="f.note"></field>
                </div>

                <div class="sub-sec"><h3>{{ t('Licence na alkohol a tabák') }}</h3>
                  <sel-field label="Druh licence" v-model="f.licKind" :options="kinds"></sel-field>
                  <template v-if="f.licKind !== 'none'">
                    <field label="Číslo licence" req v-model="f.licCode" :error="f.err.licCode"></field>
                    <field label="Platnost licence do" type="date" v-model="f.licExpiry"></field>
                    <p class="note"><later-tag label="Hlídání platnosti"></later-tag> {{ t('Před koncem platnosti vám dáme vědět, ať licenci včas obnovíte.') }}</p>
                  </template>
                </div>

                <div v-if="!f.id" class="sub-sec"><h3>{{ t('Role kolegů') }} <later-tag></later-tag></h3>
                  <sel-field label="Zkopírovat přístup kolegů z jiné provozovny" v-model="f.copyFrom" :options="otherSites" placeholder="Nekopírovat"></sel-field></div>
                <button type="submit" hidden tabindex="-1"></button>
              </form>
              <template #actions="{ close }">
                <ds-button size="lg" @click="submit">{{ t('Uložit') }}</ds-button>
                <ds-button size="lg" variant="ghost" @click="close">{{ t('Zrušit') }}</ds-button>
              </template>
            </ds-drawer>
          </template>
        </page-state>`
    }
  });
})();
