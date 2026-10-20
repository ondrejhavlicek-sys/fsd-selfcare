/* Provozovny: delivery sites. Cards + Fresh Drawer (side panel, like kosik.cz "Adresy") with address search, pin, days/times, restrictions */
(function () {
  const { reactive, computed, ref } = Vue;
  const I = KosikUI.icons, t = Acct.t, toast = UI.toast;
  const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const tm = s => String(s).replace(/^0/, '');
  const dayText = s => s.days.length === 7 ? t('každý den') : s.days.map(i => t(DAYS[i])).join(', ');
  const blank = () => ({ id: null, name: '', address: '', contact: '', phone: '', days: [0, 1, 2, 3, 4], from: '06:00', to: '12:00', restrictions: [], note: '', pin: [50, 50] });

  App.register('sites', {
    label: 'Provozovny', icon: 'LocationPinSolid',
    comp: {
      setup() {
        const list = computed(() => App.list(App.S.sites));
        const f = reactive(Object.assign(blank(), { open: false, err: {}, sug: [] }));
        const mapEl = ref(null); let drag = false;
        const openForm = s => {
          const src = s ? JSON.parse(JSON.stringify(s)) : blank();
          Object.assign(f, src, { open: true, err: {}, sug: [] });
        };
        const onAddress = v => {
          f.address = v; const q = String(v).trim().toLowerCase();
          f.sug = q.length < 2 ? [] : MockData.addressSuggestions.filter(a => a.toLowerCase().includes(q)).slice(0, 5);
        };
        const pick = a => { f.address = a; f.sug = []; f.pin = [30 + Math.round(Math.random() * 40), 40 + Math.round(Math.random() * 30)]; };
        const move = e => {
          const r = mapEl.value.getBoundingClientRect();
          f.pin = [Math.round(Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100))), Math.round(Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100)))];
        };
        const down = e => { drag = true; mapEl.value.setPointerCapture(e.pointerId); move(e); };
        const mv = e => { if (drag) move(e); };
        const up = () => { drag = false; };
        const toggleDay = i => { f.days = f.days.includes(i) ? f.days.filter(x => x !== i) : f.days.concat(i); };
        const toggleRestr = (k, on) => { f.restrictions = on ? f.restrictions.concat(k) : f.restrictions.filter(x => x !== k); };
        const submit = () => {
          f.err = {};
          const e = f.err;
          if (!f.name.trim()) return e.name = 'Zadejte název provozovny.';
          if (!f.address.trim()) return e.address = 'Zadejte adresu doručení.';
          if (!f.contact.trim()) return e.contact = 'Zadejte kontaktní osobu.';
          if (!/^\+?[\d\s]{9,16}$/.test(f.phone || '')) return e.phone = 'Zadejte telefon ve tvaru +420 777 000 111.';
          if (!f.days.length) return e.days = 'Vyberte alespoň jeden den doručení.';
          if (f.from && f.to && f.from >= f.to) return e.to = 'Konec příjmu musí být později než začátek.';
          const data = { name: f.name.trim(), address: f.address.trim(), contact: f.contact.trim(), phone: f.phone.trim(), days: f.days.slice().sort(), from: f.from || '06:00', to: f.to || '12:00',
            restrictions: f.restrictions.slice(), note: (f.note || '').trim(), pin: f.pin.slice() };
          if (f.id) Object.assign(App.S.sites.find(s => s.id === f.id), data);
          else App.S.sites.push(Object.assign({ id: 's' + Date.now(), blocked: false }, data));
          const isNew = !f.id; f.open = false; toast(isNew ? 'Provozovna je přidaná.' : 'Změny jsou uložené.');
        };
        const block = s => {
          if (s.blocked) { s.blocked = false; return toast('Provozovna je odblokovaná.'); }
          Acct.confirm({ title: 'Zablokovat provozovnu?', text: 'Do provozovny nepůjde objednávat, dokud ji neodblokujete. Otevřené objednávky zůstanou beze změny.', label: 'Zablokovat', danger: true,
            onYes: () => { s.blocked = true; toast('Provozovna je zablokovaná.'); } });
        };
        const del = s => {
          if (App.S.orders.some(o => o.site === s.id && o.status !== 'Doručeno'))
            return Acct.confirm({ title: 'Provozovnu nelze odebrat', text: 'Má otevřené objednávky. Počkejte na jejich doručení, nebo provozovnu zatím zablokujte.', cancel: 'Rozumím' });
          Acct.confirm({ title: 'Odebrat provozovnu?', text: s.name + ' zmizí z nabídky doručení a kolegům se odebere přístup.', label: 'Odebrat', danger: true, onYes: () => {
            App.S.sites = App.S.sites.filter(x => x.id !== s.id);
            App.S.users.forEach(u => { if (Array.isArray(u.sites)) u.sites = u.sites.filter(id => id !== s.id); });
            toast('Provozovna je odebraná.');
          } });
        };
        return { App, I, t, list, f, DAYS, dayText, tm, MockData, openForm, onAddress, pick, mapEl, down, mv, up, toggleDay, toggleRestr, submit, block, del };
      },
      template: `
        <page-state title="Provozovny">
          <template #action><ds-button v-if="App.isAdmin()" @click="openForm(null)">{{ t('Přidat provozovnu') }}</ds-button></template>
          <template #default>
            <ds-message v-if="!App.isAdmin()" variant="info" class="mb" :title="t('Provozovny vidíte jen ke čtení')" :body="t('Přidat nebo upravit je může správce firmy.')"></ds-message>
            <div v-if="list.length" class="acct-grid">
              <section v-for="s in list" :key="s.id" class="acct-card">
                <div class="top"><h2>{{ s.name }}</h2><product-tag :variant="s.blocked ? 'red' : 'green'" :label="t(s.blocked ? 'Zablokovaná' : 'Aktivní')"></product-tag></div>
                <div class="rows"><span>{{ s.address }}</span>
                  <span class="muted">{{ t('Kontakt') }}: {{ s.contact }}, {{ s.phone }}</span>
                  <span class="muted">{{ t('Čas doručení') }}: {{ dayText(s) }}, {{ tm(s.from) }}–{{ tm(s.to) }}</span></div>
                <div v-if="s.restrictions.length" class="tags"><product-tag v-for="r in s.restrictions" :key="r" variant="neutral" :label="t(MockData.restrictionLabels[r])"></product-tag></div>
                <div v-if="App.isAdmin()" class="acts">
                  <ds-button variant="tertiary" size="sm" @click="openForm(s)">{{ t('Upravit') }}</ds-button>
                  <ds-button variant="ghost" size="sm" @click="block(s)">{{ s.blocked ? t('Odblokovat') : t('Zablokovat') }}</ds-button>
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
              <div class="fld2 addr">
                <ds-field-label for="s-address" :invalid="!!f.err.address">{{ t('Adresa doručení') }} <span class="opt">({{ t('povinné') }})</span></ds-field-label>
                <ds-text-field id="s-address" :model-value="f.address" :invalid="!!f.err.address" :placeholder="t('např. Evropská 2758/11, 160 00 Praha 6')" autocomplete="off"
                  role="combobox" :aria-expanded="f.sug.length > 0" aria-controls="s-sug" @update:model-value="onAddress"></ds-text-field>
                <div v-if="f.sug.length" id="s-sug" class="sug" role="listbox"><button v-for="a in f.sug" :key="a" type="button" role="option" @click="pick(a)">{{ a }}</button></div>
                <ds-field-message v-if="f.err.address" role="alert" class="fld-err">{{ t(f.err.address) }}</ds-field-message>
              </div>
              <div class="fld2"><span class="lbl-t">{{ t('Přesné místo doručení (přetáhněte špendlík)') }}</span>
                <div class="map" ref="mapEl" @pointerdown="down" @pointermove="mv" @pointerup="up">
                  <svg class="pin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" :style="{ left: f.pin[0] + '%', top: f.pin[1] + '%' }"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zm0-9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                  <small>{{ t('Zjednodušená mapa prototypu') }}</small></div></div>
              <div class="row2"><field label="Kontaktní osoba" req v-model="f.contact" :error="f.err.contact"></field><field label="Telefon" type="tel" req v-model="f.phone" :error="f.err.phone"></field></div>
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
