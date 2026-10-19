/* Main navigation bar built from Fresh components (Vue island), restyled to makro.
   One Vue app is mounted once into a detached host and moved back into the page after every
   App.render(), so open menus, focus and animations survive re-renders. Data flows one way:
   App.render() -> Nav.sync() -> reactive state. User actions call back into App. */
(function () {
  const { reactive } = Vue;
  const state = reactive({ cur: '', lang: 'cs', langs: {}, count: 0, net: '', gross: '', items: [], siteName: '', cartOpen: false, mobile: false, hasShop: false });

  /* reading state.lang inside render functions makes every t() call re-translate on a language switch */
  const t = s => { void state.lang; return I18N.t(s); };

  const MENUS = {
    food: [['Ovoce', true], ['Zelenina'], ['Maso a ryby'], ['Mléčné výrobky a vejce'], ['Pečivo'], ['Nápoje'], ['Trvanlivé potraviny']],
    nonfood: [['Úklid a hygiena'], ['Obaly a jednorázové nádobí'], ['Kuchyňské vybavení'], ['Kancelář a papír']]
  };

  const ICONS = KosikUI.icons;
  const Globe = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>' };

  /* a nav item that looks like Fresh's MainNavBarItem button (h-10, px-2, gap-2, 14px, level-3 when active) */
  const NavItem = {
    props: { label: String, href: String, active: Boolean, icon: Object, chevron: Boolean, highlight: Boolean },
    setup: () => ({ t, ChevronDown: ICONS.ChevronDownSolid }),
    template: `
      <component :is="href ? 'a' : 'button'" :href="href" :type="href ? undefined : 'button'" :data-route-active="(active && !highlight) || undefined" :aria-current="(href && active) ? 'page' : undefined"
        class="makro-nav-item tw-shrink-0 tw-relative tw-flex tw-items-center tw-h-10 tw-px-2 tw-gap-x-2 tw-rounded-ds-lg tw-text-ds-paragraph tw-no-underline tw-outline-none data-[route-active]:tw-bg-ds-level-3 hover-active:tw-bg-ds-level-3 focus-visible:tw-ring-2 focus-visible:tw-ring-ds-form-active"
        :class="highlight && 'is-highlight'">
        <component v-if="icon" :is="icon" class="tw-icon-ds-24"></component>
        <span class="tw-font-ds-semi-strong tw-whitespace-nowrap">{{ t(label) }}</span>
        <component v-if="chevron" :is="ChevronDown" class="tw-icon-ds-20 tw-text-ds-neutral-80 chev" ></component>
      </component>`
  };

  const CartBody = {
    props: { close: Function },
    setup() {
      const dec = it => { App.cart.set(it.id, it.qty - 1); App.render(); };
      const inc = it => { App.cart.set(it.id, it.qty + 1); App.render(); };
      const clear = () => { App.S.cart = {}; App.render(); UI.toast('Košík je vyprázdněný.'); };
      const checkout = () => UI.toast(App.cart.count() ? 'Pokladna není součástí prototypu.' : 'Košík je prázdný.');
      return { state, t, dec, inc, clear, checkout, fmt: n => App.fmt(n) };
    },
    template: `
      <div class="cart-prev">
        <ul v-if="state.items.length" class="cp-list">
          <li v-for="it in state.items" :key="it.id" class="cp-item">
            <img :src="'assets/products/' + it.img + '.png'" alt="">
            <div><div class="n">{{ it.name }}</div><div class="p">{{ fmt(it.price) }}</div></div>
            <div class="cp-step">
              <ds-icon-button variant="secondary" size="sm" :aria-label="t('Ubrat')" @click="dec(it)">−</ds-icon-button>
              <span aria-live="polite">{{ it.qty }}</span>
              <ds-icon-button variant="secondary" size="sm" :aria-label="t('Přidat')" @click="inc(it)">+</ds-icon-button>
            </div>
          </li>
        </ul>
        <p v-else class="cp-empty">{{ t('Košík je prázdný.') }}</p>
        <div v-if="state.items.length" class="cp-foot">
          <div class="row"><span>{{ t('Celkem bez DPH') }}</span><b>{{ state.net }}</b></div>
          <div class="row"><span>{{ t('Celkem včetně DPH') }}</span><span>{{ state.gross }}</span></div>
          <ds-button size="lg" @click="checkout">{{ t('K pokladně') }}</ds-button>
          <ds-button size="md" variant="ghost" @click="clear">{{ t('Vyprázdnit košík') }}</ds-button>
        </div>
      </div>`
  };

  const MakroNav = {
    components: { NavItem, CartBody },
    setup() {
      const soon = () => UI.toast('Tato část není součástí prototypu.');
      const goHome = () => { App.S.query = ''; if (location.hash === '#/' || location.hash === '') App.render(); else location.hash = '#/'; };
      const pick = (m, i) => { if (m[i][1]) goHome(); else soon(); };
      const setLang = k => { App.S.lang = k; I18N.set(k); App.render(); };
      const checkout = () => UI.toast(App.cart.count() ? 'Pokladna není součástí prototypu.' : 'Košík je prázdný.');
      return { state, t, MENUS, ICONS, Globe, pick, setLang, checkout };
    },
    template: `
      <div class="subhdr"><div class="subhdr-in">
        <nav class="nav-main" :aria-label="t('Hlavní navigace')">
          <ds-dropdown-menu v-for="k in ['food','nonfood']" :key="k" align="start">
            <template #trigger><nav-item :label="k === 'food' ? 'Potraviny' : 'Nepotravinové zboží'" chevron :active="k === 'food' && state.cur === 'home'"></nav-item></template>
            <ds-dropdown-menu-item v-for="(m, i) in MENUS[k]" :key="m[0]" :label="t(m[0])" @select="pick(MENUS[k], i)"></ds-dropdown-menu-item>
          </ds-dropdown-menu>
          <nav-item label="Mé objednávky" href="#/ucet/orders" :active="state.cur === 'orders'"></nav-item>
          <nav-item label="Seznamy" href="#/seznamy" :icon="ICONS.ShoppingList" :active="state.cur === 'lists'"></nav-item>
        </nav>
        <div class="sub-right">
          <ds-dropdown-menu align="end">
            <template #trigger><button type="button" class="lang" :aria-label="t('Jazyk')"><component :is="Globe" class="g"></component>{{ state.langs[state.lang] }}</button></template>
            <ds-dropdown-menu-item v-for="(name, k) in state.langs" :key="k" :label="name" :trailing-icon="k === state.lang ? ICONS.CheckSolid : undefined" @select="setLang(k)"></ds-dropdown-menu-item>
          </ds-dropdown-menu>
          <div class="cart-sum">
            <ds-popover v-if="!state.mobile" align="end" side="bottom" :side-offset="8">
              <template #trigger>
                <button type="button" class="cart-btn" :aria-label="t('Košík')"><component :is="ICONS.ChevronDownSolid" class="dd"></component><component :is="ICONS.ShoppingCart" class="ci"></component><span class="cnt">{{ state.count }}</span></button>
              </template>
              <cart-body></cart-body>
            </ds-popover>
            <button v-else type="button" class="cart-btn" :aria-label="t('Košík')" @click="state.cartOpen = true"><component :is="ICONS.ShoppingCart" class="ci"></component><span class="cnt">{{ state.count }}</span></button>
            <div class="cart-tot"><b>{{ state.net }}</b><small>{{ t(state.gross + ' včetně DPH') }}</small></div>
            <ds-button size="md" class="checkout" @click="checkout">{{ t('K pokladně') }}</ds-button>
          </div>
        </div>
        <ds-bottom-sheet v-if="state.mobile" v-model:open="state.cartOpen" :title="t('Košík') + (state.siteName ? ' · ' + state.siteName : '')"><cart-body></cart-body></ds-bottom-sheet>
      </div></div>`
  };

  const host = document.createElement('div');
  host.id = 'nav-host';
  host.setAttribute('data-no-i18n', '');
  let mounted = false;

  window.Nav = {
    sync(r) {
      const mobile = matchMedia('(max-width: 768px)').matches, tot = App.cart.totals(), site = App.currentSite();
      Object.assign(state, {
        cur: r.shop === 'home' ? 'home' : r.shop === 'lists' ? 'lists' : r.id === 'orders' ? 'orders' : '',
        lang: App.S.lang, langs: App.LANGS, count: App.cart.count(), net: App.fmt(tot.net), gross: App.fmt(tot.gross),
        items: App.cart.items(), siteName: site ? site.name : '', mobile
      });
      if (!mobile) state.cartOpen = false;
    },
    /* put the persistent host where the placeholder is */
    attach(slot) {
      slot.replaceWith(host);
      if (!mounted) { mounted = true; Fresh.mount(MakroNav, host); }
    },
    detach() { if (host.parentNode) host.remove(); },
    openCart() { state.cartOpen = true; }
  };
})();
