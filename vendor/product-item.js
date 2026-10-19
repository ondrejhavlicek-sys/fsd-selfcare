/**
 * ProtoKit.ProductItem — flat derivation of the production product box.
 *
 * Inlined verbatim from apps/web/src/components/ProductItemBox/:
 *   ProductItem.vue, ProductAmount.vue, ProductPrice.vue, ProductPriceOneTag.vue,
 *   ProductPriceSteps.vue, ProductOneTag.vue, ProductAttributes.vue,
 *   ProductPricePerUnit.vue, ProductOriginFlag.vue, getPriceParts.ts,
 *   replaceSpaces.ts, displayOptions.ts
 * plus @/composables/useProductItem.ts, @/composables/product/useAtcFeedbackAnimation.ts,
 * @/components/Product/components/AtcFeedbackChip.vue,
 * @/components/Product/ProductControlFavorite.vue, @/componentsPure/Tooltip,
 * @/services/resizer.ts, @/utils/localizePrice.ts.
 *
 * The `product` prop is the production `Product` shape ({ id, origin, computed }).
 * Store-driven state is replaced by props (currentVendorId, sisMarketEnabled,
 * maxInCartLimit…) and by `v-model:quantity` standing in for the cart store.
 *
 * See the bottom of the README block in the parent task report for the list of
 * production branches that are intentionally not reproduced.
 */
;(function () {
  window.ProtoKit = window.ProtoKit || {}

  const { computed, nextTick, onUnmounted, reactive, ref, watch } = Vue

  // ---------------------------------------------------------------------------
  // app constants (src/constants/vendors.ts, src/services/appConfig.ts, cz appConfig)
  // ---------------------------------------------------------------------------
  // PROTO:CONFIG config
  const Vendors = { BASE: 1, PHARMACY: 2 }
  const appConfig = {
    defaultLang: 'cs-CZ',
    priceDisplayType: 'czk',
    saleProductMinimalId: 1000000000,
    productQuantityDebouncing: 750,
  }
  // src/components/ProductItemBox/displayOptions.ts
  const displayOptions = { thinSpace: '&#8239;' }

  // `/vue/img/pictographs/...` cannot resolve from file://, so the same asset is
  // pulled from production.
  const PICTOGRAPHS_BASE = 'https://www.kosik.cz/vue/img/pictographs/'
  // PROTO:CONFIG-END config

  // ---------------------------------------------------------------------------
  // cs translations (domains/cz/translations.json)
  // ---------------------------------------------------------------------------
  // PROTO:CONFIG translations
  const messages = {
    'general.approximately': 'cca',
    'general.currencyCode': 'CZK',
    'general.currencyMultibuyStep': 'Kč',
    'general.addToFavorite': 'Přidat do oblíbených',
    'general.removeFromFavorite': 'Odebrat z oblíbených',
    'product.price': 'Cena',
    'product.soldOut': 'Vyprodáno',
    'product.chooseAlternative': 'Vybrat náhradu',
    'product.showVariants': 'Zobrazit varianty',
    'product.originalPrice': 'Původní cena',
    'product.recommendedSellPrice': 'Doporučená cena',
    'product.commonPrice': 'Běžná cena',
    'product.aria.viewProductDetail': 'Zobrazit detail produktu {name}',
    'product.aria.price': 'Cena {price}',
    'product.aria.addToCart': 'Přidat {name} do košíku',
    'product.aria.increaseAmount': 'Zvýšit množství produktu {name}',
    'product.aria.decreaseAmount': 'Snížit množství produktu {name}',
    'product.aria.removeFromCart': 'Odebrat {name} z košíku',
    'product.aria.productQuantity': 'Množství produktu {name}: {quantity}',
    'product.aria.showVariants': 'Zobrazit varianty produktu {name}',
    'product.aria.priceStepsDescription':
      'Sekce s množstevními slevami, které se liší podle počtu kusů',
    'product.aria.multibuyCta': 'Přidat {quantity} kusů produktu {name} za cenu {price} za kus',
    'product.aria.multibuyInfo': 'Množstevní sleva pro {name}: {quantity} kusů za {price} - {status}',
    'product.aria.status.active': 'aktivní sleva',
    'product.aria.status.inactive': 'dostupná sleva',
    'product.aria.status.achieved': 'dosažená sleva',
    'product.aria.status.disabled': 'nedostupná sleva',
    'amount.maxInCart.tooltip': 'Limit {amount} ks<br>na nákup',
    'amount.lowAmount.tooltip': 'Skladem již <br>pouze {amount} ks',
    'amount.unitStep.tooltip': 'Nákup pouze<br>po {amount} ks',
    'product.canBeDeliveredTomorrow': 'Doručíme zítra',
    'product.canBeDeliveredInTwoDays': 'Doručíme pozítří',
    'product.canBeDeliveredIn': 'Doručíme {date}',
    'futureStock.tomorrow': 'Skladem zítra',
    'futureStock.dayAfterTomorrow': 'Skladem pozítří',
    'futureStock.from': 'Skladem od {date}',
    'futureStock.expected.today': 'Očekáváme dnes',
    'futureStock.expected.tomorrow': 'Očekáváme zítra',
    'futureStock.expected.dayAfterTomorrow': 'Očekáváme pozítří',
    'futureStock.expected.date': 'Očekáváme {date}',
    'stockAlert.todayStock': 'Dnes skladem {amount} ks',
    'stockAlert.sisFirstAdd': 'Nákup s tímto produktem<br>doručíme následující den',
    'cumulativePrices.fromPcs': 'od {quantity} ks',
    'cumulativePrices.fromOnePiece': '{price} za 1 ks',
    'cumulativePrices.addItemsToCart': 'přidat {count} ks',
    'cumulativePrices.putItemsToCart': 'vložit {count} ks',
    'pictographs.CZE': 'Česká republika',
    'pictographs.DEU': 'Německo',
    'pictographs.ESP': 'Španělsko',
    'pictographs.FRA': 'Francie',
    'pictographs.GBR': 'Velká Británie',
    'pictographs.GRC': 'Řecko',
    'pictographs.ITA': 'Itálie',
    'pictographs.JPN': 'Japonsko',
    'pictographs.KOR': 'Jižní Korea',
    'pictographs.SVK': 'Slovenská republika',
    'pictographs.THA': 'Thajsko',
    'pictographs.TWN': 'Tchai-wan',
    'pictographs.BGR': 'Bulharsko',
    'pictographs.IND': 'Indie',
    'pictographs.NLD': 'Nizozemsko',
    'pictographs.NOR': 'Norsko',
    'pictographs.ROU': 'Rumunsko',
    'pictographs.RUS': 'Rusko',
    'pictographs.TUR': 'Turecko',
    'pictographs.USA': 'Spojené státy',
    'pictographs.VNM': 'Vietnam',
    'pictographs.BRA': 'Brazílie',
    'pictographs.IRL': 'Irsko',
    'pictographs.ISR': 'Izrael',
    'pictographs.URY': 'Uruguay',
    'pictographs.UKR': 'Ukrajina',
    'pictographs.CHL': 'Chile',
    'pictographs.HRV': 'Chorvatsko',
    'pictographs.DNK': 'Dánsko',
    'pictographs.IRN': 'Írán',
    'pictographs.LKA': 'Srí Lanka',
    'pictographs.TZA': 'Tanzanie',
    'pictographs.ASM': 'Americká Samoa',
    'pictographs.CHN': 'Čína',
    'pictographs.ECU': 'Ekvádor',
    'pictographs.ISL': 'Island',
    'pictographs.ZAF': 'Jižní Afrika',
    'pictographs.CAN': 'Kanada',
    'pictographs.MYS': 'Malajsie',
    'pictographs.MAR': 'Maroko',
    'pictographs.MEX': 'Mexiko',
    'pictographs.PAN': 'Panama',
    'pictographs.PER': 'Peru',
    'pictographs.AUT': 'Rakousko',
    'pictographs.SEN': 'Senegal',
    'pictographs.SLV': 'Salvador',
  }
  // fsd-selfcare: expose the dictionary so js/grid.js can swap it on a language switch
  ProtoKit.ProductItemMessages = messages
  // PROTO:CONFIG-END translations

  function t(key, params) {
    const message = messages[key] ?? key
    if (!params) return message
    return message.replace(/\{(\w+)\}/g, (match, name) =>
      name in params ? String(params[name]) : match,
    )
  }

  // ---------------------------------------------------------------------------
  // src/utils/localizePrice.ts
  // ---------------------------------------------------------------------------
  const defaultPriceOptions = {
    style: 'currency',
    currencyDisplay: 'symbol',
    currency: t('general.currencyCode'),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }

  const formatterCache = new Map()

  function getMinimumFractionDigits(formatOptions) {
    const minimumFractionDigits =
      formatOptions?.minimumFractionDigits ?? defaultPriceOptions.minimumFractionDigits
    const maximumFractionDigits =
      formatOptions?.maximumFractionDigits ?? defaultPriceOptions.maximumFractionDigits

    return Math.min(minimumFractionDigits, maximumFractionDigits)
  }

  function createPriceFormatter(formatOptions) {
    const adjustedOptions = {
      ...defaultPriceOptions,
      ...formatOptions,
      minimumFractionDigits: getMinimumFractionDigits(formatOptions),
    }
    const cacheKey = JSON.stringify(adjustedOptions)
    let formatter = formatterCache.get(cacheKey)
    if (!formatter) {
      formatter = new Intl.NumberFormat(appConfig.defaultLang, adjustedOptions)
      formatterCache.set(cacheKey, formatter)
    }
    return formatter
  }

  function localizePrice(price, formatOptions) {
    return createPriceFormatter(formatOptions).format(price)
  }

  // src/components/ProductItemBox/getPriceParts.ts
  function getPriceParts(amount) {
    const price = localizePrice(amount)
    const match = price.match(/([\s\d]+)([,.])(\d+)\s(.+)/)
    if (match) {
      return { main: match[1], separator: match[2], cents: match[3], currency: match[4] }
    }
    return { main: price, separator: '', cents: '', currency: '' }
  }

  // src/components/ProductItemBox/replaceSpaces.ts
  function replaceSpaces(text) {
    return text.replace(' ', displayOptions.thinSpace)
  }

  // src/services/resizer.ts
  const ResizeType = { FIT: 1, SHRINK_ONLY: 8 }

  function resizer(imgUrl, width, height = width, resizeTypeName = 'FIT') {
    const resizeTypeNumber = ResizeType[resizeTypeName] ?? null
    const resizeSegment = `${width}x${height}x${resizeTypeNumber}`

    return imgUrl.replace(/WIDTHxHEIGHTx1|\/0x0x0_/, (match) =>
      match === 'WIDTHxHEIGHTx1' ? resizeSegment : `/${resizeSegment}_`,
    )
  }

  // PROTO:CONFIG label-styles
  // src/constants/hardcodedLabelStyles.ts
  const HARDCODED_BG_LABEL_IDS = new Set([16580, 17236, 13017])
  const HARDCODED_LABEL_STYLE = Object.freeze({ background: '#FFE5A4', color: '#684D08' })
  // PROTO:CONFIG-END label-styles

  function getHardcodedLabelStyle(labelId) {
    if (labelId === undefined || !HARDCODED_BG_LABEL_IDS.has(labelId)) return undefined
    return HARDCODED_LABEL_STYLE
  }

  // src/store/utils/productAvailability.ts
  function isProductSoldOut(product) {
    return product.origin.maxInCart === 0
  }

  // src/components/ProductItemBox/getTodayStock.ts (dayjs -> Date)
  function isSameDay(dateString, other) {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return false
    return date.toDateString() === other.toDateString()
  }

  function isAfterDay(dateString, other) {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return false
    return date.setHours(0, 0, 0, 0) > new Date(other).setHours(0, 0, 0, 0)
  }

  function getTodayStock(origin) {
    if (origin.transferrable !== false || !origin.availability?.length) return undefined
    const today = new Date()
    const todayEntry = origin.availability.find((d) => isSameDay(d.date, today))
    const qty = todayEntry?.quantity
    return typeof qty === 'number' && qty > 0 ? qty : undefined
  }

  // src/utils/date/formatDate.ts — default format 'D. M.'
  function formatDate(date) {
    if (Number.isNaN(date.getTime())) return null
    return date.getDate() + '. ' + (date.getMonth() + 1) + '.'
  }

  function isDaysFromToday(dateString, offset) {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return false
    const target = new Date()
    target.setDate(target.getDate() + offset)
    return date.toDateString() === target.toDateString()
  }

  // src/components/ProductItemBox/prepareFutureDeliveryLabel.ts
  function prepareFutureDeliveryLabel(firstOrderDay) {
    if (Number.isNaN(new Date(firstOrderDay).getTime())) return ''
    if (isDaysFromToday(firstOrderDay, 1)) return t('product.canBeDeliveredTomorrow')
    if (isDaysFromToday(firstOrderDay, 2)) return t('product.canBeDeliveredInTwoDays')
    return t('product.canBeDeliveredIn', { date: formatDate(new Date(firstOrderDay)) ?? '' })
  }

  // src/components/ProductItemBox/preparePlannedStockLabel.ts
  function preparePlannedStockLabel(plannedStockDatetime) {
    const date = new Date(plannedStockDatetime)
    if (Number.isNaN(date.getTime())) return ''
    if (isDaysFromToday(plannedStockDatetime, 0)) return t('futureStock.expected.today')
    if (isDaysFromToday(plannedStockDatetime, 1)) return t('futureStock.expected.tomorrow')
    if (isDaysFromToday(plannedStockDatetime, 2)) return t('futureStock.expected.dayAfterTomorrow')
    return t('futureStock.expected.date', { date: formatDate(date) ?? '' })
  }

  // src/components/ProductItemBox/prepareFutureStockLabel.ts
  function prepareFutureStockLabel(availabilityDate) {
    const date = new Date(availabilityDate)
    if (Number.isNaN(date.getTime())) return ''
    if (isDaysFromToday(availabilityDate, 1)) return t('futureStock.tomorrow')
    if (isDaysFromToday(availabilityDate, 2)) return t('futureStock.dayAfterTomorrow')
    return t('futureStock.from', { date: formatDate(date) ?? '' })
  }

  // src/components/ProductItemBox/selectAvailabilityDateForQuantity.ts
  function selectAvailabilityDateForQuantity(availability, requestedQuantity) {
    if (!availability?.length) return null

    const today = new Date()
    const future = availability.filter((day) => isAfterDay(day.date, today))
    if (!future.length) return null

    const qty = Math.max(0, requestedQuantity)

    // Special case: qty=0 comes from some call sites when the product is not in cart.
    // Avoid picking a future day with quantity=0 (which would produce "Skladem zítra" for no stock).
    if (qty === 0) {
      const positiveDay = future.find((day) => day.quantity > 0)
      return positiveDay?.date ?? null
    }

    const match = future.find((day) => day.quantity >= qty)
    return (match ?? future[future.length - 1])?.date ?? null
  }

  // src/components/ProductItemBox/stockAlertUtils.ts
  function hasFutureHigherAvailability(origin) {
    if (!origin.availability || origin.availability.length < 2) return false
    const todayQty = getTodayStock(origin) ?? 0
    return origin.availability.some((day) => day.quantity > todayQty)
  }

  // src/utils/allowNumericInputOnly.ts
  function allowNumericInputOnly(event) {
    if (
      /^\d$/.test(event?.data ?? '') ||
      ['deleteContentBackward', 'deleteContentForward'].includes(event?.inputType)
    ) {
      return
    }
    event.preventDefault()
  }

  // ---------------------------------------------------------------------------
  // Styles that live in global/scoped stylesheets in the app and have no Tailwind
  // equivalent. Injected before the Tailwind Play runtime stylesheet so that the
  // tw-* utilities on the same elements keep winning, as they do in the app.
  //   .a-tag                -> src/styles/legacy/_a-tag.scss (base rules only)
  //   .input-reset, .amount-container.has-border{,-hover}, .fade-*
  //                         -> ProductAmount.vue <style scoped>
  //   .tooltip*, .triangle*, .tooltip-wrapper, .text-white, .text-nowrap
  //                         -> componentsPure/Tooltip/Tooltip.vue <style scoped> + legacy utils
  //   .atc-pulse-*          -> motion-v keyframes of AtcFeedbackChip.vue
  //   .animate-pulse-favorite-icon
  //                         -> ProductControlFavorite.vue <style scoped>
  // ---------------------------------------------------------------------------
  const styleSheet = `
.a-tag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  font-size: 12px;
  line-height: 1.4;
  color: #651b69;
  white-space: nowrap;
  background: #fff5e5;
  border-radius: 4px;
}

.input-reset {
  padding: 0;
  margin: 0;
  appearance: none;
  outline: none;
  background: none;
  border: none;
}
.input-reset:focus { outline: none; }
.input-reset::-webkit-outer-spin-button,
.input-reset::-webkit-inner-spin-button { margin: 0; appearance: none; }
.input-reset[type='number'] { appearance: textfield; }

/* \`fade\` is scoped to ProductAmount.vue in the app; keep it inside the box so
   it cannot capture a <Transition name="fade"> of another component. */
article[data-tid='product-box'] .fade-enter-active,
article[data-tid='product-box'] .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
article[data-tid='product-box'] .fade-enter-from,
article[data-tid='product-box'] .fade-leave-to { opacity: 0; transform: translateY(-10px); }

.amount-container.has-border::after {
  position: absolute;
  top: -4px;
  right: -10px;
  bottom: 0;
  left: -4px;
  z-index: -1;
  content: '';
  background-color: white;
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 6%), 0 0 4px 0 rgba(0, 0, 0, 6%);
}

.amount-container.has-border-hover::after {
  position: absolute;
  top: -2px;
  right: -4px;
  bottom: 0;
  left: -4px;
  z-index: -1;
  content: '';
  background-color: white;
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 6%), 0 0 4px 0 rgba(0, 0, 0, 6%);
}

.tooltip-wrapper {
  position: relative;
  display: inline-block;
  vertical-align: bottom;
  cursor: auto;
}
.triangle,
.tooltip { position: absolute; }
.tooltip { z-index: 20; }
.triangle { z-index: 21; }
.tooltip--top {
  padding-bottom: 9px;
  top: auto;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
}
.triangle--top {
  width: 0;
  height: 0;
  border-right: 6px solid transparent;
  border-bottom: 9px solid currentcolor;
  border-left: 6px solid transparent;
  top: auto;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
}
.tooltip__message { padding: 7px; border-radius: 4px; }
.text-white { color: #fff; }
.text-nowrap { white-space: nowrap; }

/* proto-kit enables Tailwind preflight, the app disables it. Preflight's
   \`img { display: block }\` would push the country flag onto its own line;
   in the app the flag is an inline, vertically centred image. */
img[data-tid='pbox-origin-flag'] {
  display: inline;
  vertical-align: middle;
}

/* Same reason: preflight's \`input { color: inherit }\` would tint the quantity
   to the inherited #222. With preflight off the app's input keeps the UA
   black. Needs the attribute selector to outweigh preflight's element rule. */
input[data-tid='product-box__amount'] {
  color: #000000;
}

/* src/styles/base/_typography.scss — the app's global \`body\` and \`h2\`/\`a\`
   rules. The box inherits 13px/1.5/#222 from body and the name heading takes
   #444 from \`h2\`; without them the inline strut around the name link is a
   different height and the name renders black. Scoped to the box so the rest
   of a prototype page keeps proto-kit's own typography, and wrapped in
   \`:where()\` so the selectors keep the app's element-level specificity and
   still lose to any tw-* utility. */
:where(article[data-tid='product-box']) {
  font-size: 13px;
  line-height: 1.5;
  color: #222222;
}
:where(article[data-tid='product-box']) h2 { color: #444444; }
:where(article[data-tid='product-box']) a { color: #222222; }
/* src/styles/base/_document.scss \`img\` base (alt-text rendering only) */
:where(article[data-tid='product-box']) img {
  max-width: 100%;
  overflow: hidden;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* In the app \`tw-font-strong\`/\`tw-font-stronger\` are plugin utilities emitted
   after the core \`tw-font-*\` scale, so they win when both land on one element
   (ProductPriceOneTag's multibuy variant carries \`tw-font-normal\` from
   \`mtbClasses\` plus \`tw-font-strong\`). The Play CDN emits \`tw-font-ds-*\`
   first, so re-assert the production winner with one extra element of
   specificity. */
article[data-tid='product-box'] .tw-font-ds-strong { font-weight: 550; }
article[data-tid='product-box'] .tw-font-ds-stronger { font-weight: 650; }

@keyframes atc-pulse-plus {
  0% { transform: scale(1); }
  30% { transform: scale(1.05); }
  60% { transform: scale(1.05); }
  90% { transform: scale(1); }
  100% { transform: scale(1); }
}
@keyframes atc-pulse-minus {
  0% { transform: scale(1); }
  30% { transform: scale(0.95); }
  60% { transform: scale(0.95); }
  90% { transform: scale(1); }
  100% { transform: scale(1); }
}
.atc-pulse-plus { animation: atc-pulse-plus 500ms linear; }
.atc-pulse-minus { animation: atc-pulse-minus 500ms linear; }
.atc-feedback-motion { transition: opacity 0.22s ease-in-out, transform 0.22s ease-in-out; }

@keyframes pulse-favorite-icon {
  from { transform: none; }
  to { transform: scale(1.4) translateZ(0); }
}
.animate-pulse-favorite-icon { animation: pulse-favorite-icon 0.25s ease 2 alternate; }
`

  if (!document.getElementById('proto-product-item-styles')) {
    const styleElement = document.createElement('style')
    styleElement.id = 'proto-product-item-styles'
    styleElement.textContent = styleSheet
    document.head.prepend(styleElement)
  }

  // ---------------------------------------------------------------------------

  // PROTO:CONFIG timings
  const BOX_WIDTH = 185
  const BOX_WIDTH_XS = 164
  const FEEDBACK_PULSE_DURATION_MS = 500
  const FEEDBACK_LEAVE_MS = 0
  const REMOVE_AFTER_LEAVE_MS = 200
  const COLLAPSE_AFTER_REMOVE_MS = 10
  const TOOLTIP_HIDE_WINDOW_MS = 4000
  const HIDE_STEPS_TIMEOUT_MS = 100
  // PROTO:CONFIG-END timings

  // ---------------------------------------------------------------------------
  // useDeviceDetectorStore() substitutes (src/store/pinia/useDeviceDetectorStore.ts).
  // `breakpointDownXs` tracks the bootstrap grid (xs 0 / sm 576px), so it is true
  // below 576px; the store is a singleton and so is this listener.
  // `isTouch` is src/utils/deviceDetection.ts `isTouchDevice()` verbatim.
  // ---------------------------------------------------------------------------
  const xsMediaQuery = window.matchMedia('(max-width: 575px)')
  const breakpointDownXs = ref(xsMediaQuery.matches)
  xsMediaQuery.addEventListener('change', (event) => {
    breakpointDownXs.value = event.matches
  })

  const IS_TOUCH = 'ontouchstart' in window

  // ---------------------------------------------------------------------------
  // @kosik/ui/utils — useAnimationEffect + unwrapTemplateRef (bundled into the DS
  // but not re-exported from its index, so reproduced here).
  // ---------------------------------------------------------------------------
  function elementGuard(el) {
    if (el instanceof HTMLElement || el instanceof SVGElement) return el
    return null
  }

  function unwrapTemplateRef(templateRef) {
    const refValue = templateRef && 'value' in templateRef ? templateRef.value : templateRef
    if (!refValue) return null
    if (refValue instanceof Element) return elementGuard(refValue)
    return elementGuard(refValue.$el)
  }

  function useAnimationEffect(options) {
    const currentClass = ref('')

    async function trigger() {
      const element = unwrapTemplateRef(options.elementRef)
      if (!element) return
      if (currentClass.value) return

      currentClass.value = options.animationClass
      await nextTick()
      element.addEventListener('animationend', onAnimationEnd)

      function onAnimationEnd(event) {
        if (!element || event.target !== element) return
        currentClass.value = ''
        element.removeEventListener('animationend', onAnimationEnd)
      }
    }

    return reactive({ class: currentClass, trigger })
  }

  // ---------------------------------------------------------------------------
  // src/components/Product/ProductControlFavorite.vue
  //
  // The wishlist heart in the bottom-right corner of the price row. The store
  // write (`useProductsStore().setProduct`) and the API call
  // (`useProductsFetchService().sendApiFavoriteProduct`) become one `favorite`
  // emit carrying production's exact `{ id, favorite }` payload; the host owns
  // `product.origin.favorite`, so the icon follows the prop as it does in the app.
  //
  // `tw-text-input-border` is the app palette's #CECECE, which is not in the
  // kit's Tailwind config — mapped to the literal (see porting-components.md).
  // ---------------------------------------------------------------------------
  const ProductControlFavorite = {
    props: {
      productId: { type: Number, required: true },
      isFavorite: { type: Boolean, default: false },
    },

    emits: ['favorite'],

    setup(props, { emit }) {
      const hover = ref(false)
      const currentlyInteracted = ref(false)
      const iconRef = ref(null)
      const pulseEffect = useAnimationEffect({
        animationClass: 'animate-pulse-favorite-icon',
        elementRef: iconRef,
      })

      const showSolidHeart = computed(
        () => props.isFavorite || (hover.value && !currentlyInteracted.value),
      )

      const iconColorClass = computed(() =>
        showSolidHeart.value ? 'tw-text-ds-pink-amaranth' : 'tw-text-[#CECECE]',
      )

      const ariaLabel = computed(() =>
        t(`general.${props.isFavorite ? 'removeFromFavorite' : 'addToFavorite'}`),
      )

      function toggle() {
        currentlyInteracted.value = true
        emit('favorite', { id: props.productId, favorite: !props.isFavorite })
        pulseEffect.trigger()
      }

      function handleMouseHover(state) {
        hover.value = state
        if (!state) {
          currentlyInteracted.value = false
        }
      }

      return { iconRef, pulseEffect, showSolidHeart, iconColorClass, ariaLabel, toggle, handleMouseHover }
    },

    template: `
      <ds-icon-button
        shape="circle"
        size="md"
        variant="neutral"
        :aria-label="ariaLabel"
        :title="ariaLabel"
        data-cnstrc-btn="add_to_wishlist"
        :class="['tw-shrink-0 tw-bg-white focus-visible:tw-bg-white hover-active:tw-bg-white']"
        @mouseenter="handleMouseHover(true)"
        @mouseleave="handleMouseHover(false)"
        @click.stop="toggle">
        <span
          ref="iconRef"
          :class="['tw-flex tw-size-5 tw-items-center tw-justify-center', pulseEffect.class]">
          <icon-heart-solid
            v-if="showSolidHeart"
            :size="20"
            :class="iconColorClass"></icon-heart-solid>
          <icon-heart-outline
            v-else
            :size="20"
            :class="iconColorClass"></icon-heart-outline>
        </span>
      </ds-icon-button>
    `,
  }

  // ---------------------------------------------------------------------------
  // src/components/ProductItemBox/ProductPriceSteps.vue
  //
  // The cumulative-price tiers panel. Rendered twice by ProductAmount: in the
  // hover popover above the bare plus button, and inline under the -/+ row.
  // `cartActions.setCartProductQuantity` is replaced by a `set-quantity` emit,
  // `useDeviceDetectorStore().isTouch` by a prop. Everything else, including the
  // reads of `product.computed.{quantity,effectiveQuantity}` (the per-product
  // cart quantity and the summed quantity of the whole multibuy association
  // group), is verbatim.
  // ---------------------------------------------------------------------------

  // Configurable constant for displaying the first step (1 piece at standard price)
  const SHOW_FIRST_STEP = true

  const ProductPriceSteps = {
    props: {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
      /** useDeviceDetectorStore().isTouch */
      isTouch: { type: Boolean, default: IS_TOUCH },
    },

    emits: ['set-quantity'],

    setup(props, { emit }) {
      const maxInCart = computed(() => props.product.origin.maxInCart)

      // Create virtual first step for 1 piece at standard price
      const firstStepPrice = computed(() => ({
        quantity: 1,
        price: props.product.origin.price,
        pricePerUnit: props.product.origin.pricePerUnit,
        associationCode: null,
        percentageDiscount: 0, // No discount for single piece at standard price
      }))

      // Combine base price with cumulativePrices
      const allSteps = computed(() => {
        // Sort steps by quantity from smallest to largest
        const steps = [...props.product.origin.cumulativePrices].sort(
          (a, b) => a.quantity - b.quantity,
        )

        // If first step should be displayed and product price is greater than 0
        // and there are some steps
        if (SHOW_FIRST_STEP && props.product.origin.price > 0 && steps.length > 0) {
          // If the first step is not already for 1 piece (prevent duplication)
          if (!steps.some((step) => step.quantity === 1)) {
            return [firstStepPrice.value, ...steps]
          }
        }

        return steps
      })

      // Find index of active step based on current quantity in cart
      const currentQuantity = computed(() => props.product.computed.effectiveQuantity)

      // Determine active step - the one that corresponds to the current quantity in cart
      const activeStepIndex = computed(() => {
        // If we have 0 pieces in cart, no step is active
        if (currentQuantity.value === 0) return -1

        // Find the highest step that is less than or equal to current quantity in cart
        for (let i = allSteps.value.length - 1; i >= 0; i--) {
          if (allSteps.value[i].quantity <= currentQuantity.value) {
            return i
          }
        }

        // If we don't have any matching step, return -1
        return -1
      })

      // Function to add products to cart based on selected step
      function handleApplyDiscount(step, index) {
        // If we already have enough pieces in cart or it's a step user has already
        // reached, do nothing
        if (
          props.product.computed.effectiveQuantity >= step.quantity ||
          index <= activeStepIndex.value
        ) {
          return
        }

        // Calculate how many pieces need to be added
        const quantityToAdd = step.quantity - props.product.computed.effectiveQuantity

        // Add products to cart
        emit('set-quantity', props.product.computed.quantity + quantityToAdd)
      }

      // Label for tooltip/hint on mouse hover
      function stepTitle(step) {
        const count = step.quantity - props.product.computed.effectiveQuantity

        // Different messages depending on whether we already have something in cart
        return t(
          props.product.computed.quantity > 0
            ? 'cumulativePrices.addItemsToCart'
            : 'cumulativePrices.putItemsToCart',
          { count },
        )
      }

      // Format price for multibuy step
      function localizeMultibuyStepPrice(price) {
        return localizePrice(price, { style: 'decimal' }) + ' ' + t('general.currencyMultibuyStep')
      }

      // Determines whether the step is active, inactive, achieved or disabled
      function getStepStatus(index) {
        // If we have 0 pieces in cart, no step is active
        if (currentQuantity.value === 0) {
          return 'inactive'
        }

        // Step is active if index corresponds to active step
        if (index === activeStepIndex.value) {
          return 'active'
        }

        // Step is achieved if its index is less than active step
        if (index < activeStepIndex.value) {
          return 'achieved'
        }

        // Step is disabled if its quantity is greater than maximum possible in cart
        if (allSteps.value[index].quantity > maxInCart.value) {
          return 'disabled'
        }

        // Other steps are inactive
        return 'inactive'
      }

      // Generates ARIA attributes for the step
      function getAriaAttributes(index, step) {
        if (index === 0) {
          return { 'aria-hidden': 'true', tabindex: '-1' }
        }

        return {
          'aria-label':
            getStepStatus(index) === 'inactive'
              ? t('product.aria.multibuyCta', {
                  name: props.product.origin.name,
                  quantity: step.quantity - props.product.computed.effectiveQuantity,
                  price: localizeMultibuyStepPrice(step.price),
                })
              : t('product.aria.multibuyInfo', {
                  name: props.product.origin.name,
                  quantity: step.quantity,
                  price: localizeMultibuyStepPrice(step.price),
                  status: t(`product.aria.status.${getStepStatus(index)}`),
                }),
        }
      }

      return {
        t,
        allSteps,
        currentQuantity,
        activeStepIndex,
        maxInCart,
        handleApplyDiscount,
        stepTitle,
        localizeMultibuyStepPrice,
        getStepStatus,
        getAriaAttributes,
      }
    },

    template: `
      <section
        :aria-label="t('product.price')"
        data-tid="pbox-price-steps"
        role="group"
        :aria-describedby="'price-steps-desc-' + product.id"
        class="tw-flex tw-w-full tw-flex-col tw-gap-1 tw-text-ds-primary">
        <div
          :id="'price-steps-desc-' + product.id"
          class="tw-sr-only">
          {{ t('product.aria.priceStepsDescription') }}
        </div>
        <button
          v-for="(step, index) in allSteps"
          :key="'step-' + index"
          class="tw-pf tw-flex tw-w-full tw-justify-between tw-rounded tw-px-2 tw-py-1 tw-text-sm tw-font-ds-strong"
          :data-cnstrc-btn="quantity > 0 ? null : 'add_to_cart'"
          :class="{
            'tw-bg-ds-feedback tw-text-ds-paragraph': getStepStatus(index) === 'active',
            'tw-cursor-pointer tw-bg-ds-discount hover:tw-bg-ds-highlight':
              getStepStatus(index) === 'inactive',
            'tw-bg-ds-disabled': getStepStatus(index) === 'achieved',
            'tw-text-ds-neutral-70 tw-opacity-50': getStepStatus(index) === 'disabled',
          }"
          :data-tid="'multibuy-step-' + index"
          v-bind="getAriaAttributes(index, step)"
          @click.stop="handleApplyDiscount(step, index)">
          <div class="tw-flex tw-items-center">
            <!-- Checkmark icon for active or achieved step -->
            <icon-check-solid
              v-if="getStepStatus(index) === 'active'"
              class="tw-size-3 tw-text-ds-contrast-green"></icon-check-solid>
            <!-- Step price -->
            <span
              class="tw-ml-1 tw-whitespace-nowrap"
              v-text="localizeMultibuyStepPrice(step.price)"></span>
          </div>
          <!-- Step description (min. number of pieces or action) -->
          <span class="tw-mr-1">
            <!-- "Add X to cart" on hover (if not a touch device) -->
            <span
              v-if="
                !isTouch &&
                getStepStatus(index) === 'inactive' &&
                index > activeStepIndex &&
                step.quantity > currentQuantity &&
                step.quantity <= maxInCart
              "
              class="tw-whitespace-nowrap hover:tw-text-ds-link">
              {{ stepTitle(step) }}
            </span>
            <!-- Standard text "from X pcs" -->
            <span
              v-else
              class="tw-whitespace-nowrap">
              {{ t('cumulativePrices.fromPcs', { quantity: step.quantity }) }}
            </span>
          </span>
        </button>
      </section>
    `,
  }

  ProtoKit.ProductPriceSteps = ProductPriceSteps

  ProtoKit.ProductItem = {
    props: {
      /** Production `Product`: { id, origin: ProductOrigin, computed: ProductComputed }. */
      product: { type: Object, required: true },
      /** Cart quantity — replaces useCartStore. */
      quantity: { type: Number, default: 0 },
      order: { type: Number, default: undefined },
      separated: { type: Boolean, default: false },
      hideOpenVariantsButton: { type: Boolean, default: false },
      /**
       * useVariantsModal().hasFlag — ids of products the variants modal found no
       * variants for; the "Zobrazit varianty" button stays hidden for them.
       */
      flaggedIds: { type: Array, default: () => [] },
      /** useDeviceDetectorStore().isTouch */
      isTouch: { type: Boolean, default: IS_TOUCH },
      /** useIsLoggedIn() — gates the wishlist heart and its tw-pr-10 padding. */
      isLoggedIn: { type: Boolean, default: false },
      /** useUserInterfaceStore().currentVendorId */
      currentVendorId: { type: Number, default: Vendors.BASE },
      /** useIsSisMarketEnabled() */
      sisMarketEnabled: { type: Boolean, default: false },
      /** useConfig().general.maxInCartLimit */
      maxInCartLimit: { type: Number, default: 99 },
      /** useConfig().general.maxInCartLimitPharmacy */
      maxInCartLimitPharmacy: { type: Number, default: 99 },
    },

    emits: ['update:quantity', 'open-detail', 'replace', 'open-variants', 'plus-hover', 'favorite'],

    components: {
      'product-price-steps': ProductPriceSteps,
      'product-control-favorite': ProductControlFavorite,
    },

    setup(props, { emit }) {
      // ---- useProductItem(productRef) -------------------------------------
      const productId = computed(() => props.product?.id)
      const isProductLoaded = computed(() => !!props.product)
      const cartProductQuantity = computed(() => props.quantity)

      const isSoldOut = computed(() => isProductSoldOut(props.product))

      const isCheaperPrice = computed(
        () =>
          props.product?.origin.recommendedPrice &&
          props.product?.origin.recommendedPrice.toFixed(2) !== '0.00' &&
          props.product?.computed.price.toFixed(2) !==
            props.product?.origin.recommendedPrice.toFixed(2),
      )

      const bestCheapPriceInfo = computed(() => {
        if (isCheaperPrice.value) {
          return {
            type: 'sale',
            label: t('product.originalPrice'),
            price: props.product.origin.recommendedPrice,
          }
        }
        if (props.product.origin.recommendedSellPrice - props.product?.computed.price > 0.1) {
          return {
            type: 'recommended',
            label: t('product.recommendedSellPrice'),
            price: props.product.origin.recommendedSellPrice,
          }
        }
        return { type: 'common', label: t('product.commonPrice'), price: null }
      })

      const hasProductCumulativePrices = computed(
        () => !!props.product?.origin.cumulativePrices.length,
      )
      const hasBaseVendor = computed(() => props.product?.origin.vendorId === Vendors.BASE)
      const hasMatchingVendorId = computed(
        () => props.product?.origin.vendorId === props.currentVendorId,
      )
      const isSale = computed(() => productId.value > appConfig.saleProductMinimalId)

      const isFirstOrderDayVisible = computed(
        () =>
          props.product?.origin.firstOrderDay &&
          !isSale.value &&
          props.product?.origin.transferrable === true,
      )
      const isPlannedStockVisible = computed(
        () =>
          !!props.product?.origin.plannedStock &&
          props.product?.origin.maxInCart === 0 &&
          props.product?.origin.transferrable === false,
      )
      const isAvailabilityRibbonVisible = computed(() => {
        if (props.product?.origin.transferrable !== false) return false
        if (!props.product?.origin.availability?.length) return false
        if (isPlannedStockVisible.value) return false

        const today = new Date()
        const futureDay = props.product.origin.availability.find((day) =>
          isAfterDay(day.date, today),
        )
        if (!futureDay) return false

        const todayEntry = props.product.origin.availability.find((day) =>
          isSameDay(day.date, today),
        )
        const todayStock = todayEntry?.quantity ?? 0

        if (todayStock === 0) return true
        return cartProductQuantity.value > todayStock
      })
      const hasFutureStockInfo = computed(
        () =>
          isFirstOrderDayVisible.value ||
          isPlannedStockVisible.value ||
          isAvailabilityRibbonVisible.value,
      )
      const isMarketProduct = computed(
        () =>
          props.sisMarketEnabled &&
          props.product?.origin.transferrable === true &&
          !isSale.value,
      )

      // src/components/ProductItemBox/FutureStockInfo.vue
      const futureStockText = computed(() => {
        // 1. SiS/D+1 "Doručíme zítra" — only when transferrable === true
        if (isFirstOrderDayVisible.value) {
          return prepareFutureDeliveryLabel(props.product.origin.firstOrderDay)
        }

        // 2. PlannedStock "Očekáváme dnes|zítra|pozítří|datum"
        if (isPlannedStockVisible.value && props.product.origin.plannedStock) {
          return preparePlannedStockLabel(props.product.origin.plannedStock)
        }

        // 3. Availability "Skladem zítra|pozítří|datum"
        if (isAvailabilityRibbonVisible.value && props.product.origin.availability?.length) {
          const date = selectAvailabilityDateForQuantity(
            props.product.origin.availability,
            props.product.computed.quantity ?? 0,
          )
          if (date) return prepareFutureStockLabel(date)
        }

        return null
      })
      const isAdultOnly = computed(() => props.product?.origin.adultOnly)
      const hasProductGifts = computed(() => !!props.product?.origin.giftIds.length)
      const hasProductGroups = computed(() => !!props.product?.origin.productGroups.length)
      const getProductGroupsText = computed(() => {
        if (!hasProductGroups.value) return ''
        const joined = props.product.origin.productGroups.join(', ')
        return joined.charAt(0).toUpperCase() + joined.slice(1)
      })
      const hasMultiBuyVariants = computed(
        () =>
          !!props.product?.origin.associationCode &&
          props.product.origin.cumulativePrices.some((price) => price.associationCode),
      )
      /**
       * The firstOrderDay/earliestDeliveryTime branch needs the delivery store and is
       * dropped; the maxInCart branch is reproduced.
       */
      const isProductUnavailable = computed(() => props.product.origin.maxInCart < 1)

      function openProductDetail() {
        emit('open-detail')
      }

      // ---- ProductItem.vue -------------------------------------------------
      const isProductImageVisible = ref(true)
      const width = computed(() => (breakpointDownXs.value ? BOX_WIDTH_XS : BOX_WIDTH))

      const getImageDimensions = computed(() => ({
        default: [BOX_WIDTH, BOX_WIDTH],
        retina: [BOX_WIDTH * 2, BOX_WIDTH * 2],
      }))

      const imageSrc = computed(() =>
        resizer(props.product.origin.image, ...getImageDimensions.value.default),
      )
      const imageSrcset = computed(
        () =>
          resizer(props.product.origin.image, ...getImageDimensions.value.retina) +
          ' 1.5x, ' +
          resizer(props.product.origin.image, ...getImageDimensions.value.default) +
          ' 1x',
      )

      const productGroupsText = computed(() =>
        getProductGroupsText.value === 'Potravina pro zvláštní lékařské účely'
          ? 'Potravina pro zvl. lékař. účely'
          : getProductGroupsText.value,
      )

      const isBoxHovering = ref(false)
      const isButtonHovering = ref(false)
      const isHovered = ref(false)

      watch([isBoxHovering, isButtonHovering], () => {
        setTimeout(() => {
          isHovered.value = isBoxHovering.value && !isButtonHovering.value
        }, 0)
      })

      const isFlagged = computed(() => props.flaggedIds.includes(productId.value))

      const showMultiBuyVariants = computed(
        () =>
          hasMultiBuyVariants.value &&
          !isFlagged.value &&
          !props.hideOpenVariantsButton &&
          props.product.origin.hasAssociatedProducts,
      )

      const showTopMarketRibbon = computed(() => isMarketProduct.value)
      const showTopFutureStockRibbon = computed(
        () => isAvailabilityRibbonVisible.value && !isMarketProduct.value,
      )
      const showTopRibbon = computed(
        () => showTopMarketRibbon.value || showTopFutureStockRibbon.value,
      )
      const topRibbonGradient = computed(() => {
        if (showTopMarketRibbon.value) {
          return { background: 'linear-gradient(to bottom, #F1F8F9 0.75rem, transparent 0.75rem)' }
        }
        if (showTopFutureStockRibbon.value) {
          return { background: 'linear-gradient(to bottom, #E8E8E8 0.75rem, transparent 0.75rem)' }
        }
        return {}
      })

      // ---- ProductOneTag.vue ----------------------------------------------
      const getProductTags = computed(() =>
        props.product?.origin.infoLabels?.length
          ? props.product.origin.infoLabels.filter((tag) => !tag.excludeFromBox)
          : [],
      )
      const hasFrozen = computed(
        () => props.product?.origin.pictographs?.includes('frozen') ?? false,
      )

      const useBeforeClasses = 'tw-bg-ds-tint-highlight-red tw-text-ds-contrast-red'
      const outOfStockClasses = 'tw-bg-ds-tint-highlight-red tw-text-ds-contrast-red'
      const otherClasses = 'tw-bg-ds-secondary tw-text-ds-primary'
      const blackFridayClasses = 'tw-bg-[#333] tw-text-white'

      const businessTag = computed(() => {
        if (isProductUnavailable.value && !isFirstOrderDayVisible.value) {
          return { name: t('product.soldOut'), classes: outOfStockClasses }
        }

        if (getProductTags.value?.length > 0) {
          const firstTag = getProductTags.value[0]
          const tagIsSale = firstTag.url === 'sale'

          if (firstTag.name === 'Black Friday') {
            return { name: firstTag.name, classes: blackFridayClasses, dataTid: undefined }
          }

          return {
            name: firstTag.name,
            classes: tagIsSale ? useBeforeClasses : otherClasses,
            style: getHardcodedLabelStyle(firstTag.id),
            dataTid: tagIsSale ? 'FeatureSaleTag_save_me_tag' : undefined,
          }
        }
        return null
      })

      // ---- ProductPriceOneTag.vue -----------------------------------------
      const saveMeClasses = 'tw-bg-ds-tint-highlight-red tw-text-ds-contrast-red'
      const mtbClasses = 'tw-text-gray-500 tw-font-normal'

      const oneTag = computed(() => {
        let cumulativePriceTag = null
        if (hasProductCumulativePrices.value && props.product.origin.cumulativePrices?.length) {
          cumulativePriceTag = {
            name: t('cumulativePrices.fromOnePiece', {
              price: localizePrice(props.product.origin.price),
            }),
            classes: mtbClasses,
          }
        }

        const firstLabel = props.product?.origin.priceLabels?.[0]

        const saveMeTag = firstLabel
          ? { name: firstLabel.name, classes: saveMeClasses, dataTid: 'FeatureTag_save_me_label' }
          : null

        return cumulativePriceTag ?? saveMeTag ?? null
      })

      // ---- ProductPrice.vue ------------------------------------------------
      const getRelatedProduct = computed(() => props.product?.origin.relatedProduct)
      const hasMTBPrices = computed(
        () =>
          hasProductCumulativePrices.value && props.product.origin.cumulativePrices?.length > 0,
      )
      const firstTierPrice = computed(
        () => props.product.origin.cumulativePrices?.[0]?.price ?? props.product.computed.price,
      )
      const firstTierQuantity = computed(
        () => props.product.origin.cumulativePrices?.[0]?.quantity ?? 1,
      )
      const getActionLabel = computed(() => props.product?.origin.actionLabel)
      const showRecommendedSellPrice = computed(
        () =>
          !(hasProductCumulativePrices.value || getActionLabel.value || getRelatedProduct.value) &&
          bestCheapPriceInfo.value.type === 'recommended' &&
          !hasMTBPrices.value,
      )
      const getQuantityPricePrefix = computed(() => props.product?.origin.productQuantity?.prefix)
      const isUnavailable = computed(
        () => isProductUnavailable.value && !hasFutureStockInfo.value,
      )
      const priceParts = computed(() => getPriceParts(props.product.computed.price))
      const recommendedPrice = computed(() => {
        const parts = getPriceParts(props.product.computed.recommendedPrice)
        return `${parts.main},${parts.cents}`
      })
      const priceColorClasses = computed(() => {
        if (isUnavailable.value) return 'tw-text-ds-disabled'
        if (isCheaperPrice.value || bestCheapPriceInfo.value.price || hasMTBPrices.value) {
          return 'tw-bg-[#E01F56] tw-text-ds-paragraph-inverse tw-rounded-[4px]'
        }
        return 'tw-text-ds-paragraph'
      })
      const priceAriaLabel = computed(
        () =>
          t('product.aria.price', {
            price: localizePrice(
              hasMTBPrices.value ? firstTierPrice.value : props.product.computed.price,
            ),
            currency: '',
          }) +
          (hasMTBPrices.value && t('cumulativePrices.fromPcs', { quantity: firstTierQuantity.value })),
      )
      const priceMainHtml = computed(() =>
        replaceSpaces(
          hasMTBPrices.value ? getPriceParts(firstTierPrice.value).main : priceParts.value.main,
        ),
      )
      const priceCents = computed(() =>
        hasMTBPrices.value ? getPriceParts(firstTierPrice.value).cents : priceParts.value.cents,
      )

      // ---- ProductPricePerUnit.vue ----------------------------------------
      const pricePerUnitParts = computed(() =>
        getPriceParts(props.product.computed.pricePerUnit.price),
      )

      // ---- ProductAttributes.vue ------------------------------------------
      function formatValue(value) {
        return Intl.NumberFormat(appConfig.defaultLang).format(value)
      }
      const quantityPrefixHtml = computed(() =>
        props.product.origin.productQuantity?.prefix
          ? `${t('general.approximately')}${displayOptions.thinSpace}`
          : '',
      )

      // ---- ProductOriginFlag.vue ------------------------------------------
      const countryCode = computed(() => props.product.origin.countryCode)
      const flagTitle = computed(() => t(`pictographs.${countryCode.value}`))
      const flagSrc = computed(() => `${PICTOGRAPHS_BASE}${countryCode.value}.svg?v=1`)

      // ---- ProductAmount.vue ----------------------------------------------
      const lastInteractionElement = ref(null)
      const inputQuantityRef = ref(null)

      const quantity = computed({
        get: () => props.quantity || 0,
        set: (quantityNew) => {
          lastInteractionElement.value = 'input_quantity'

          const increasing = quantityNew > quantity.value
          if (inputQuantityRef.value && quantityNew > 0 && quantity.value !== quantityNew) {
            if (inputQuantityRef.value.checkValidity()) {
              setNewQuantity(quantityNew, increasing)
              cancelQuantityDebounce()
            } else {
              setNewQuantityDebounce(quantityNew, increasing)
            }
          }
        },
      })

      const effectiveMaxInCartLimit = computed(() =>
        props.product.origin.vendorId === Vendors.PHARMACY
          ? props.maxInCartLimitPharmacy
          : props.maxInCartLimit,
      )
      const maxInCart = computed(
        () => props.product.origin.maxInCart || effectiveMaxInCartLimit.value,
      )
      const limitInCart = computed(
        () => props.product.origin.limitInCart ?? effectiveMaxInCartLimit.value,
      )
      const unitStep = computed(() => props.product.origin.unitStep || 1)
      const limitStep = computed(() => {
        const limit = Math.min(maxInCart.value, limitInCart.value)
        return limit - (limit % unitStep.value)
      })
      const isMaxQuantity = computed(() => quantity.value >= limitStep.value)
      const isLimitReached = computed(
        () => Number.isInteger(limitInCart.value) && quantity.value >= limitStep.value,
      )

      const tooltipVisible = ref(false)
      const pendingStockAlertAmount = ref(null)
      const pendingSisFirstAdd = ref(false)
      const stockAlertShown = ref(false)
      const tooltipHideTimeoutId = ref(null)

      const shouldShowLimitTooltip = computed(
        () =>
          isLimitReached.value ||
          pendingStockAlertAmount.value !== null ||
          pendingSisFirstAdd.value,
      )

      const amountIsSoldOut = computed(() => isProductSoldOut(props.product) || !limitStep.value)

      const limitingMessage = computed(() => {
        function noBr(text) {
          return text.replace(/<br>/g, ' ')
        }

        if (isLimitReached.value && limitInCart.value <= maxInCart.value) {
          return noBr(t('amount.maxInCart.tooltip', { amount: limitStep.value }))
        }
        if (isLimitReached.value) {
          return noBr(t('amount.lowAmount.tooltip', { amount: limitStep.value }))
        }

        const stockAlertAmount =
          pendingStockAlertAmount.value ?? getTodayStock(props.product.origin)
        if (
          stockAlertAmount !== undefined &&
          (quantity.value >= stockAlertAmount || pendingStockAlertAmount.value !== null) &&
          hasFutureHigherAvailability(props.product.origin)
        ) {
          return noBr(t('stockAlert.todayStock', { amount: stockAlertAmount }))
        }
        if (pendingSisFirstAdd.value) {
          return t('stockAlert.sisFirstAdd')
        }

        return noBr(t('amount.unitStep.tooltip', { amount: unitStep.value }))
      })

      function hideTooltip() {
        tooltipVisible.value = false
        pendingStockAlertAmount.value = null
        pendingSisFirstAdd.value = false
        tooltipHideTimeoutId.value = null
      }

      function cancelTooltipHide() {
        if (tooltipHideTimeoutId.value !== null) {
          clearTimeout(tooltipHideTimeoutId.value)
          tooltipHideTimeoutId.value = null
        }
      }

      function scheduleTooltipHide() {
        if (tooltipHideTimeoutId.value !== null) return
        tooltipHideTimeoutId.value = setTimeout(hideTooltip, TOOLTIP_HIDE_WINDOW_MS)
      }

      function toggleTooltip(forceTooltip) {
        if (
          tooltipVisible.value &&
          quantity.value < limitStep.value &&
          !pendingStockAlertAmount.value &&
          !pendingSisFirstAdd.value
        ) {
          tooltipVisible.value = false
          pendingStockAlertAmount.value = null
          cancelTooltipHide()
        } else if (shouldShowLimitTooltip.value || forceTooltip) {
          tooltipVisible.value = true
          scheduleTooltipHide()
        }
      }

      watch(shouldShowLimitTooltip, (show) => {
        if (!show) toggleTooltip(false)
      })

      // ---- useAtcFeedbackAnimation ----------------------------------------
      const isCollapsing = ref(false)
      const isFeedbackVisible = ref(quantity.value > 0)
      const pulseType = ref(null)
      const pulseIteration = ref(0)
      let pulseTimeoutId = null
      let pulseRafId = null
      let feedbackLeaveTimeoutId = null
      let collapseRemoveTimeoutId = null
      let collapseEndTimeoutId = null

      const effectiveQuantity = computed(() =>
        isCollapsing.value ? unitStep.value : quantity.value,
      )
      const feedbackTotalPrice = computed(() =>
        localizePrice(effectiveQuantity.value * props.product.computed.price),
      )

      function triggerPulse(type) {
        if (pulseTimeoutId !== null) {
          clearTimeout(pulseTimeoutId)
          pulseTimeoutId = null
        }
        if (pulseRafId !== null) {
          cancelAnimationFrame(pulseRafId)
          pulseRafId = null
        }

        pulseType.value = null
        pulseRafId = requestAnimationFrame(() => {
          pulseType.value = type
          pulseIteration.value += 1
          pulseTimeoutId = setTimeout(() => {
            pulseType.value = null
            pulseTimeoutId = null
          }, FEEDBACK_PULSE_DURATION_MS)
          pulseRafId = null
        })
      }

      function collapseWithFeedback(onCollapsed) {
        if (isCollapsing.value) return

        for (const id of [feedbackLeaveTimeoutId, collapseRemoveTimeoutId, collapseEndTimeoutId]) {
          if (id !== null) clearTimeout(id)
        }
        feedbackLeaveTimeoutId = null
        collapseRemoveTimeoutId = null
        collapseEndTimeoutId = null

        isCollapsing.value = true
        feedbackLeaveTimeoutId = setTimeout(() => {
          isFeedbackVisible.value = false
          feedbackLeaveTimeoutId = null
        }, FEEDBACK_LEAVE_MS)
        collapseRemoveTimeoutId = setTimeout(() => {
          onCollapsed()
          collapseRemoveTimeoutId = null
        }, FEEDBACK_LEAVE_MS + REMOVE_AFTER_LEAVE_MS)
        collapseEndTimeoutId = setTimeout(
          () => {
            isCollapsing.value = false
            collapseEndTimeoutId = null
          },
          FEEDBACK_LEAVE_MS + REMOVE_AFTER_LEAVE_MS + COLLAPSE_AFTER_REMOVE_MS,
        )
      }

      watch(
        quantity,
        (newQuantity, oldQuantity) => {
          if (newQuantity === 0) {
            isFeedbackVisible.value = false
            return
          }
          if (newQuantity > 0 && oldQuantity === 0) {
            isFeedbackVisible.value = true
            return
          }
          if (newQuantity > oldQuantity && oldQuantity > 0) {
            triggerPulse('plus')
            return
          }
          if (newQuantity < oldQuantity && newQuantity > 0) {
            triggerPulse('minus')
          }
        },
        { flush: 'post' },
      )

      onUnmounted(() => {
        for (const id of [
          pulseTimeoutId,
          feedbackLeaveTimeoutId,
          collapseRemoveTimeoutId,
          collapseEndTimeoutId,
          tooltipHideTimeoutId.value,
        ]) {
          if (id !== null) clearTimeout(id)
        }
        if (pulseRafId !== null) cancelAnimationFrame(pulseRafId)
      })

      const feedbackStyle = computed(() =>
        isFeedbackVisible.value
          ? { opacity: 1, transform: 'translateY(0px)', pointerEvents: 'auto' }
          : { opacity: 0, transform: 'translateY(8px)', pointerEvents: 'none' },
      )

      // ---- quantity mutations ---------------------------------------------
      let quantityDebounceId = null

      function cancelQuantityDebounce() {
        if (quantityDebounceId !== null) {
          clearTimeout(quantityDebounceId)
          quantityDebounceId = null
        }
      }

      function setNewQuantityDebounce(quantityNew, increasing) {
        cancelQuantityDebounce()
        quantityDebounceId = setTimeout(() => {
          const adjustedQuantity = adjustQuantityUnitSteps(quantityNew, increasing)
          setNewQuantity(adjustedQuantity, increasing, !!adjustedQuantity)
          quantityDebounceId = null
        }, appConfig.productQuantityDebouncing)
      }

      function getInputQuantity() {
        if (inputQuantityRef.value === null) return null
        return Number(inputQuantityRef.value.value) || 0
      }

      function setNewQuantity(quantityNew, increasing, forceTooltip = false) {
        const todayStock = getTodayStock(props.product.origin)
        const forceStockAlert =
          todayStock !== undefined &&
          quantityNew >= todayStock &&
          increasing &&
          !stockAlertShown.value &&
          hasFutureHigherAvailability(props.product.origin)

        emit('update:quantity', quantityNew)

        if (!increasing && quantityNew < (todayStock ?? Infinity)) {
          pendingStockAlertAmount.value = null
          stockAlertShown.value = false
        }
        if (forceStockAlert && todayStock !== undefined) {
          pendingStockAlertAmount.value = todayStock
          stockAlertShown.value = true
        }
        toggleTooltip(forceTooltip || forceStockAlert)
      }

      function adjustQuantityUnitSteps(wantedQuantity, increasing) {
        if (!limitStep.value || (wantedQuantity < unitStep.value && !increasing)) {
          return 0
        }
        if (wantedQuantity < unitStep.value) {
          return unitStep.value
        }
        if (wantedQuantity % unitStep.value) {
          return Math.min(
            wantedQuantity - (wantedQuantity % unitStep.value) + (increasing ? unitStep.value : 0),
            limitStep.value,
          )
        }
        return Math.min(wantedQuantity, limitStep.value)
      }

      function removeProduct() {
        emit('update:quantity', 0)
      }

      function minus(interactionElement) {
        const inputQuantity = getInputQuantity()

        lastInteractionElement.value = interactionElement

        if (inputQuantity === 0 || inputQuantity === unitStep.value) {
          collapseWithFeedback(removeProduct)
          // Show hover immediately without animation
          showSteps.value = !props.isTouch
        } else if (Number(inputQuantity)) {
          setNewQuantity(adjustQuantityUnitSteps(Number(inputQuantity) - 1, false), false)
        }
      }

      function plus(interactionElement) {
        const inputQuantity = getInputQuantity()

        lastInteractionElement.value = interactionElement

        if (inputQuantity === 0) {
          quantity.value = unitStep.value
        } else if (!isMaxQuantity.value) {
          setNewQuantity(adjustQuantityUnitSteps(Number(inputQuantity) + 1, true), true)
        }
      }

      function checkQuantity(event) {
        const target = event.target
        if (!(target instanceof HTMLInputElement)) return

        const value = Number(target.value)

        if (value > limitStep.value) {
          target.value = String(limitStep.value)
        }

        if (
          (value < unitStep.value || Number.isNaN(value)) &&
          event instanceof FocusEvent &&
          event.relatedTarget !== inputQuantityRef.value
        ) {
          removeProduct()
        }
        target.blur()
      }

      // input is bound with :value + @input to avoid v-model on a computed setter
      function onQuantityInput(event) {
        quantity.value = Number(event.target.value)
      }

      const isPharmacyProduct = computed(
        () => props.product.origin.vendorId === Vendors.PHARMACY,
      )
      const isMarketStyledProduct = computed(
        () => isMarketProduct.value && !isPharmacyProduct.value,
      )

      const minusClasses = computed(() => {
        if (!hasMatchingVendorId.value) {
          return 'tw-bg-ds-button-tertiary-disabled tw-text-ds-button-tertiary-disabled'
        }
        if (isPharmacyProduct.value) {
          return 'tw-bg-ds-3rd-party-dr-max-green-light hover-active:tw-bg-ds-3rd-party-dr-max-green-light hover-active:tw-brightness-90 tw-text-ds-neutral-80'
        }
        if (isMarketStyledProduct.value) {
          return 'tw-bg-ds-market-light hover-active:tw-bg-ds-market-primary hover-active:tw-text-white tw-text-ds-market-primary'
        }
        return 'tw-bg-ds-primary-off-light hover-active:tw-brightness-90'
      })

      const plusClasses = computed(() => {
        if (isMaxQuantity.value) {
          if (isPharmacyProduct.value) return 'tw-bg-ds-3rd-party-dr-max-green'
          if (isMarketStyledProduct.value) return 'tw-bg-ds-market-primary tw-text-white'
          return 'tw-bg-ds-primary'
        }
        if (isPharmacyProduct.value) {
          return 'tw-bg-ds-3rd-party-dr-max-green hover-active:tw-bg-ds-pharmacy'
        }
        if (isMarketStyledProduct.value) {
          return 'tw-bg-ds-market-primary tw-text-white hover-active:tw-bg-ds-market-light hover-active:tw-text-ds-market-primary'
        }
        return 'tw-bg-ds-primary'
      })

      const replacementClasses = computed(() => {
        if (isPharmacyProduct.value) return ''
        if (isMarketStyledProduct.value) {
          return 'tw-bg-ds-market-primary tw-text-white hover-active:tw-bg-ds-market-light hover-active:tw-text-ds-market-primary'
        }
        return ''
      })

      const interactiveClass = computed(() => hasMatchingVendorId.value && 'tw-pointer-events-auto')

      // `replaceable` is `hasBaseVendor` at the ProductItem call site
      const replaceable = computed(() => hasBaseVendor.value)

      // ---- ProductAmount.vue: cumulative-price steps on hover ---------------
      // `useTimeoutFn(…, 100)` -> setTimeout; `useMouseInElement().isOutside`
      // -> mouseenter/mouseleave on the very same two elements.
      const showSteps = ref(false)
      const isOutsidePlusButton = ref(true)
      const isOutsideStepsWrapper = ref(true)

      let hideStepsTimeoutId = null

      function stopHideTimeout() {
        if (hideStepsTimeoutId !== null) {
          clearTimeout(hideStepsTimeoutId)
          hideStepsTimeoutId = null
        }
      }

      function startHideTimeout() {
        stopHideTimeout()
        hideStepsTimeoutId = setTimeout(() => {
          showSteps.value = false
          hideStepsTimeoutId = null
        }, HIDE_STEPS_TIMEOUT_MS)
      }

      // When mouse is outside both elements, hide steps after delay
      function updateStepsVisibility() {
        // Disable complex hover logic only on touch devices
        if (props.isTouch) return

        // If hovering over product box or specific elements, show steps
        if (isHovered.value || !isOutsidePlusButton.value || !isOutsideStepsWrapper.value) {
          stopHideTimeout()
          showSteps.value = true
        } else {
          startHideTimeout()
        }
      }

      // Watch both mouse elements and parent hover state
      watch(
        () => [isOutsidePlusButton.value, isOutsideStepsWrapper.value, isHovered.value],
        updateStepsVisibility,
      )

      // Handle hover over plus button
      function handlePlusHover() {
        isOutsidePlusButton.value = false
        // Only trigger hover behavior on non-touch devices
        if (!props.isTouch) {
          emit('plus-hover')
          showSteps.value = true
          stopHideTimeout()
        }
      }

      onUnmounted(stopHideTimeout)

      function applyStepQuantity(quantityNew) {
        emit('update:quantity', quantityNew)
      }

      function openVariantsModal() {
        emit('open-variants', productId.value)
      }

      return {
        // ProductItem
        width,
        isProductImageVisible,
        imageSrc,
        imageSrcset,
        productId,
        isProductLoaded,
        isProductUnavailable,
        hasFutureStockInfo,
        futureStockText,
        isMarketProduct,
        hasProductCumulativePrices,
        hasProductGroups,
        productGroupsText,
        isFirstOrderDayVisible,
        isPlannedStockVisible,
        showMultiBuyVariants,
        showTopRibbon,
        topRibbonGradient,
        isBoxHovering,
        isButtonHovering,
        isHovered,
        openProductDetail,
        openVariantsModal,
        t,
        // ProductOneTag
        businessTag,
        hasFrozen,
        hasProductGifts,
        isAdultOnly,
        // ProductPrice
        showRecommendedSellPrice,
        getQuantityPricePrefix,
        appConfig,
        priceColorClasses,
        priceAriaLabel,
        priceMainHtml,
        priceCents,
        isCheaperPrice,
        hasMTBPrices,
        recommendedPrice,
        firstTierPrice,
        firstTierQuantity,
        localizePrice,
        // ProductPriceOneTag
        oneTag,
        // ProductAttributes / PricePerUnit / OriginFlag
        formatValue,
        quantityPrefixHtml,
        displayOptions,
        pricePerUnitParts,
        countryCode,
        flagSrc,
        flagTitle,
        // ProductAmount
        amountIsSoldOut,
        replaceable,
        hasMatchingVendorId,
        isSale,
        interactiveClass,
        replacementClasses,
        minusClasses,
        plusClasses,
        isMaxQuantity,
        quantity,
        effectiveQuantity,
        unitStep,
        limitStep,
        inputQuantityRef,
        plus,
        minus,
        checkQuantity,
        onQuantityInput,
        toggleTooltip,
        allowNumericInputOnly,
        tooltipVisible,
        limitingMessage,
        isFeedbackVisible,
        feedbackStyle,
        feedbackTotalPrice,
        pulseType,
        pulseIteration,
        // ProductPriceSteps integration
        showSteps,
        isOutsidePlusButton,
        isOutsideStepsWrapper,
        handlePlusHover,
        applyStepQuantity,
      }
    },

    template: `
      <div>
        <article
          :style="{ '--box-width': width + 'px' }"
          class="product tw-relative tw-min-w-[var(--box-width)] tw-max-w-[var(--box-width)] tw-overflow-hidden tw-rounded-t-xl tw-bg-white tw-text-left tw-cursor-pointer"
          data-tid="product-box"
          :data-product-id="productId"
          :data-cnstrc-item-id="productId"
          :data-cnstrc-item-name="product.origin.name"
          :data-cnstrc-item-price="product.computed.price"
          @click.prevent="openProductDetail()"
          @mouseenter="isBoxHovering = true"
          @mouseleave="isBoxHovering = false">

          <!-- ProductAmount.vue (root div + the class the parent passes in) -->
          <div
            class="tw-pointer-events-none tw-absolute tw-left-0 tw-z-[2] tw-mt-[6px]"
            @click.stop.prevent>
            <!-- choose replacement -->
            <div
              v-if="amountIsSoldOut && replaceable && hasMatchingVendorId && !isSale"
              class="tw-relative tw-top-[111px] tw-flex tw-h-12 tw-w-[calc(var(--box-width))] min-[576px]:tw-top-[133px]">
              <ds-button
                data-tid="product-to-cart__replacement"
                variant="primary"
                size="md"
                shape="circle"
                class="tw-absolute tw-inset-x-0 tw-z-10 tw-mx-auto tw-inline-flex tw-h-10 tw-w-max tw-whitespace-nowrap tw-rounded-full tw-outline tw-outline-1"
                :class="[interactiveClass, replacementClasses]"
                @click="$emit('replace')">
                {{ t('product.chooseAlternative') }}
              </ds-button>
            </div>
            <!-- sold out pharmacy - disabled button only -->
            <div
              v-else-if="amountIsSoldOut"
              class="tw-pointer-events-none tw-relative tw-top-[111px] tw-ml-1.5 tw-flex tw-h-12 tw-w-[calc(var(--box-width)_-_12px)] min-[576px]:tw-top-[133px]">
              <div class="tw-z-9 tw-absolute tw-right-[-8px] tw-top-[-8px] tw-size-14 tw-rounded-full">
                <ds-icon-button
                  shape="circle"
                  disabled
                  class="tw-absolute tw-inset-0 tw-m-auto tw-size-10 tw-bg-ds-disabled tw-text-ds-disabled">
                  <icon-add-solid></icon-add-solid>
                </ds-icon-button>
              </div>
            </div>
            <!-- plus button only -->
            <div
              v-else-if="effectiveQuantity === 0"
              class="tw-relative tw-top-[111px] tw-ml-1.5 tw-flex tw-h-12 tw-w-[calc(var(--box-width)_-_12px)] min-[576px]:tw-top-[133px]">
              <div
                class="tw-z-9 tw-absolute tw-right-[-8px] tw-top-[-8px] tw-size-14 tw-cursor-pointer tw-rounded-full"
                :class="interactiveClass"
                @click="plus('button_plus')"
                @mouseenter="handlePlusHover"
                @mouseleave="isOutsidePlusButton = true">
                <ds-icon-button
                  key="amount-increase"
                  data-tid="product-to-cart__add-amount"
                  :data-cnstrc-btn="quantity > 0 ? null : 'add_to_cart'"
                  variant="primary"
                  size="md"
                  shape="circle"
                  class="tw-outline-ds-neutrals-0 tw-absolute tw-inset-0 tw-z-10 tw-m-auto tw-size-10 tw-outline tw-outline-1"
                  :class="[{ 'tw-opacity-50': isMaxQuantity }, interactiveClass, plusClasses]"
                  :aria-label="
                    quantity === 0
                      ? t('product.aria.addToCart', { name: product.origin.name })
                      : t('product.aria.increaseAmount', { name: product.origin.name })
                  "
                  @click.stop="plus('button_plus')">
                  <icon-add-solid></icon-add-solid>
                </ds-icon-button>
              </div>
              <!-- Steps displayed on hover over plus button -->
              <transition
                v-if="hasProductCumulativePrices"
                name="fade">
                <div
                  v-if="showSteps"
                  class="tw-absolute tw-left-[-6px] tw-right-[-6px] tw-top-[42px] tw-z-20"
                  :class="interactiveClass"
                  @mouseenter="isOutsideStepsWrapper = false"
                  @mouseleave="isOutsideStepsWrapper = true">
                  <div
                    class="amount-container has-border-hover tw-isolate tw-overflow-hidden tw-bg-white tw-py-1">
                    <product-price-steps
                      :product="product"
                      :quantity="quantity"
                      :is-touch="isTouch"
                      @set-quantity="applyStepQuantity"></product-price-steps>
                  </div>
                </div>
              </transition>
            </div>
            <!-- minus / input / plus -->
            <div
              v-else
              class="tw-relative tw-top-[111px] min-[576px]:tw-top-[133px]"
              @mouseenter="showSteps = true">
              <!-- componentsPure/Tooltip -->
              <span>
                <span class="tooltip-wrapper">
                  <div
                    class="amount-container tw-relative tw-isolate tw-pb-1"
                    :class="{ 'has-border': hasProductCumulativePrices }">
                    <div
                      class="tw-relative tw-ml-1.5 tw-flex tw-h-10 tw-w-[calc(var(--box-width)_-_12px)] tw-items-center tw-rounded-full tw-bg-ds-neutral-5/95"
                      :class="{ 'tw-shadow-md': !hasProductCumulativePrices }">
                      <div
                        class="tw-absolute tw-bottom-[calc(100%_+_6px)] tw-left-1/2 tw-z-20 tw--translate-x-1/2">
                        <div
                          class="atc-feedback-motion"
                          :style="feedbackStyle">
                          <!-- AtcFeedbackChip, width-mode="pbox" -->
                          <div
                            :key="(pulseType || 'idle') + '-' + pulseIteration"
                            data-tid="atc-feedback-chip"
                            class="tw-flex tw-h-[30px] tw-items-center tw-justify-between tw-rounded-ds-lg tw-bg-ds-feedback tw-py-1.5 tw-text-ds-contrast-green-dark tw-w-40 tw-px-2 max-md:tw-w-[153px] tw-border tw-border-white"
                            :class="pulseType === 'plus' ? 'atc-pulse-plus' : pulseType === 'minus' ? 'atc-pulse-minus' : ''">
                            <div class="tw-flex tw-items-center tw-gap-1">
                              <icon-shopping-cart-solid size="xs"></icon-shopping-cart-solid>
                              <span class="tw-text-style-sm">{{ effectiveQuantity }}</span>
                              <span class="tw-text-style-sm">ks</span>
                            </div>
                            <div class="tw-text-xs tw-font-bold">{{ feedbackTotalPrice }}</div>
                          </div>
                        </div>
                      </div>
                      <ds-icon-button
                        v-if="quantity > 0"
                        key="amount-decrease"
                        :data-tid="'product-to-cart__' + (quantity > 1 ? 'decrease-amount' : 'trash-icon')"
                        variant="tertiary"
                        size="md"
                        shape="circle"
                        class="tw-absolute tw-left-0 tw-z-10 tw-size-10"
                        :class="[interactiveClass, minusClasses]"
                        :aria-label="
                          quantity > 1
                            ? t('product.aria.decreaseAmount', { name: product.origin.name })
                            : t('product.aria.removeFromCart', { name: product.origin.name })
                        "
                        @click="minus('button_minus')">
                        <icon-substract-solid></icon-substract-solid>
                      </ds-icon-button>
                      <div
                        v-if="quantity > 0"
                        class="tw-flex tw-flex-1 tw-justify-center">
                        <input
                          ref="inputQuantityRef"
                          :value="quantity"
                          type="number"
                          data-tid="product-box__amount"
                          class="input-reset tw-text-ds-neutrals-90 tw-h-10 tw-w-1/2 tw-text-center tw-text-lg tw-font-ds-strong"
                          :class="interactiveClass"
                          pattern="[0-9]*"
                          min="0"
                          :max="limitStep"
                          :step="unitStep"
                          :aria-label="
                            t('product.aria.productQuantity', { name: product.origin.name, quantity })
                          "
                          @beforeinput="allowNumericInputOnly"
                          @input="onQuantityInput"
                          @blur="checkQuantity"
                          @keyup.enter="checkQuantity"
                          @keyup.up="toggleTooltip(false)" />
                      </div>
                      <ds-icon-button
                        key="amount-increase"
                        :disabled="isMaxQuantity"
                        :aria-disabled="isMaxQuantity"
                        :data-cnstrc-btn="quantity > 0 ? null : 'add_to_cart'"
                        data-tid="product-to-cart__increase-amount"
                        variant="primary"
                        size="md"
                        shape="circle"
                        class="tw-absolute tw-right-0 tw-z-10 tw-size-10"
                        :class="[{ 'tw-opacity-50': isMaxQuantity }, plusClasses, interactiveClass]"
                        :aria-label="t('product.aria.increaseAmount', { name: product.origin.name })"
                        @click="plus('button_plus')">
                        <icon-add-solid></icon-add-solid>
                      </ds-icon-button>
                    </div>
                    <!-- cumulative price selector integrated into -/+ section -->
                    <div
                      v-if="hasProductCumulativePrices"
                      class="tw-mt-1.5 tw-w-[calc(100%_+_6px)] tw-bg-white"
                      :class="interactiveClass">
                      <product-price-steps
                        :product="product"
                        :quantity="quantity"
                        :is-touch="isTouch"
                        @set-quantity="applyStepQuantity"></product-price-steps>
                    </div>
                  </div>
                  <template v-if="tooltipVisible && isProductLoaded">
                    <div class="tooltip tooltip--top tooltip--top">
                      <div
                        class="tooltip__message bg-none text-white text-nowrap tw-bg-ds-accent-blue tw-text-sm">
                        <div v-html="limitingMessage"></div>
                      </div>
                    </div>
                    <div class="triangle triangle--top text-none tw-text-ds-accent-blue"></div>
                  </template>
                </span>
              </span>
            </div>
          </div>

          <!-- Flex container: ribbon + image share fixed --box-width height -->
          <div class="tw-flex tw-h-[var(--box-width)] tw-w-[var(--box-width)] tw-flex-col">
            <!-- FutureDeliveryTag / FutureStockInfo top ribbons are not reproduced -->
            <!-- Image area: fills remaining height, gradient for čepička effect behind top rounded corners -->
            <div
              class="tw-relative tw-min-h-0 tw-flex-1"
              :style="topRibbonGradient">
              <!-- ProductPurchasedIcon is admin-view only and not reproduced -->
              <a
                :href="product.origin.url"
                tabindex="-1"
                class="tw-relative tw-block tw-w-full tw-h-full tw-text-center">
                <div
                  class="tw-text-center tw-relative tw-flex tw-h-full tw-w-full tw-justify-center tw-overflow-hidden tw-rounded-xl tw-bg-[#F3F3F3]"
                  :class="showTopRibbon ? 'tw-items-end' : 'tw-items-center'">
                  <img
                    v-if="isProductImageVisible"
                    :key="product.origin.image"
                    :class="isProductUnavailable && !product.origin.firstOrderDay && 'tw-opacity-40'"
                    class="tw-h-[var(--box-width)] tw-w-[var(--box-width)] tw-rounded-ds-lg tw-object-contain tw-mix-blend-multiply"
                    loading="lazy"
                    :src="imageSrc"
                    :srcset="imageSrcset"
                    :aria-hidden="true"
                    :aria-label="product.origin.name"
                    :alt="product.origin.name"
                    data-tid="product-box_image" />
                </div>

                <div class="tw-absolute tw-top-2 tw-ml-2">
                  <!-- ProductOneTag.vue — size-variant is undeclared in production, so it lands on the root as an attribute -->
                  <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-1 tw-max-w-[calc(var(--box-width)-10px)] tw-overflow-hidden" size-variant="normal">
                    <span
                      v-if="businessTag && businessTag.name.toLowerCase() !== 'market'"
                      :class="businessTag.classes"
                      :style="businessTag.style"
                      :data-tid="businessTag.dataTid"
                      class="a-tag tw-min-h-inherit tw-p-1 tw-text-sm tw-font-normal">
                      {{ businessTag.name }}
                    </span>
                    <icon-snowflake-solid
                      v-if="hasFrozen"
                      size="md"
                      class="tw-rounded-full tw-bg-ds-neutral-0 tw-p-0.5 tw-text-sky-400"
                      data-tid="product-box_frozen-icon"></icon-snowflake-solid>
                    <icon-gift-solid
                      v-if="hasProductGifts"
                      size="md"
                      class="tw-rounded-full tw-bg-ds-neutral-0 tw-p-1 tw-text-ds-primary"></icon-gift-solid>
                    <icon-adult-circle
                      v-if="isAdultOnly"
                      size="md"
                      class="tw-rounded-full tw-bg-ds-neutral-0 tw-p-0 tw-text-ds-primary"></icon-adult-circle>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <!-- Price section -->
          <div
            class="tw-relative"
            :class="hasProductCumulativePrices ? 'tw-mb-5' : 'tw-mb-1'">
            <div
              class="tw-relative"
              :class="{ 'tw-pr-10': isLoggedIn && !isSale }">
              <!-- ProductPrice.vue -->
              <section
                data-tid="pbox-price"
                class="tw-flex tw-flex-col tw-items-start tw-justify-end tw-self-stretch"
                :class="hasProductCumulativePrices ? 'tw-mb-[10px]' : 'tw-mb-[5px]'">
                <!-- cca -->
                <div class="tw-mb-0.5 tw-h-2.5">
                  <div
                    v-if="getQuantityPricePrefix && !showRecommendedSellPrice"
                    class="tw--mt-[3px] tw-px-1 tw-text-[12px] tw-text-ds-paragraph"
                    v-text="getQuantityPricePrefix"></div>
                </div>
                <!-- price -->
                <div class="tw-flex tw-items-end">
                  <span
                    v-if="appConfig.priceDisplayType === 'czk'"
                    :class="[
                      'tw-mr-2 tw-flex tw-items-start tw-px-1 tw-py-[2px] tw-font-ds-stronger',
                      priceColorClasses,
                    ]"
                    :aria-label="priceAriaLabel">
                    <!-- the app compiles with whitespace: 'preserve' (apps/web/vite.config.ts),
                         so production keeps a single-space text node between the two spans; the runtime
                         compiler condenses and drops whitespace spanning a line break — hence
                         the siblings sharing a line below -->
                    <span
                      class="tw-mr-[2px] tw-text-[24px] tw-leading-none"
                      v-html="priceMainHtml"></span> <span
                      aria-hidden="true"
                      class="tw-mt-[1px] tw-text-xs tw-leading-none">{{ priceCents }}</span>
                  </span>
                  <!-- euro -->
                  <span
                    v-else
                    class="tw-mr-2 tw-px-1 tw-py-[2px] tw-text-[24px] tw-font-ds-stronger tw-leading-none"
                    :class="priceColorClasses"
                    v-text="
                      localizePrice(hasMTBPrices ? firstTierPrice : product.computed.price, {
                        style: 'decimal',
                      })
                    "></span>
                  <!-- strikethrough price or MTB firstTier quantity -->
                  <s
                    v-if="isCheaperPrice && !hasMTBPrices"
                    class="tw-text-sm tw-text-ds-neutral-70"
                    data-tid="product-box__crossed-price"
                    v-text="recommendedPrice"></s>

                  <span
                    v-else-if="hasMTBPrices"
                    class="tw-font-ds-strong tw-text-ds-base">{{ t('cumulativePrices.fromPcs', { quantity: firstTierQuantity }) }}</span>
                </div>
              </section>
              <div
                v-if="isLoggedIn && !isSale"
                class="tw-absolute tw-bottom-0 tw-right-0 tw-flex tw-h-7 tw-items-center">
                <product-control-favorite
                  :product-id="productId"
                  :is-favorite="product.origin.favorite"
                  class="tw-shrink-0"
                  data-tid="product-box__favorite"
                  @favorite="$emit('favorite', $event)"></product-control-favorite>
              </div>
            </div>
            <!-- ProductPriceOneTag.vue -->
            <div
              v-if="oneTag"
              :class="oneTag.classes"
              :aria-label="oneTag.ariaLabel ?? oneTag.name"
              :data-tid="oneTag.dataTid"
              class="tw-min-h-[26px] tw-w-fit tw-rounded tw-p-1 tw-text-sm tw-font-ds-strong">
              {{ oneTag.name }}
            </div>
          </div>

          <!-- flag and name -->

          <div
            class="tw-relative tw-pl-1"
            :class="{ 'tw-opacity-70': isProductUnavailable && !hasFutureStockInfo }">
            <a
              data-tid="product-box__name"
              class="tw-inline-block tw-max-h-[44px] tw-no-underline"
              :aria-label="t('product.aria.viewProductDetail', { name: product.origin.name })"
              :href="product.origin.url">
              <h2 class="tw-mb-0 tw-text-sm tw-font-normal tw-leading-[19px]">
                <span
                  class="tw-line-clamp-2"
                  :class="product.origin.name.length > 30 && 'tw-hyphens-auto'">
                  <!-- ProductOriginFlag.vue — the space before the name is a text node
                       production renders too; it must not be swallowed by whitespace condensing -->
                  <img
                    v-if="countryCode"
                    class="-tw-mt-[3px] tw-h-4 tw-rounded-full"
                    :src="flagSrc"
                    data-tid="pbox-origin-flag"
                    :alt="flagTitle"
                    :title="flagTitle" /> <span :title="product.origin.name">{{ product.origin.name }}</span>
                </span>
              </h2>
            </a>

            <div
              class="tw-flex tw-flex-wrap tw-justify-between tw-pr-2 tw-text-sm tw-font-normal tw-text-ds-neutral-70">
              <!-- gramy — ProductAttributes.vue -->
              <div class="tw-mr-1">
                <span
                  v-if="product.origin.productQuantity"
                  data-tid="product-box_weight">
                  <span
                    v-if="product.origin.productQuantity.prefix"
                    :title="product.origin.productQuantity.prefix"
                    v-html="quantityPrefixHtml"></span>{{ formatValue(product.origin.productQuantity.value)
                  }}<span v-html="displayOptions.thinSpace"></span><span class="tw-text-sm">{{
                    product.origin.productQuantity.unit
                  }}</span>
                </span>
              </div>
              <!-- cena za kilo — ProductPricePerUnit.vue -->
              <div data-tid="pbox-price-per-unit">
                <span>{{ pricePerUnitParts.main }}{{ pricePerUnitParts.separator }}{{ pricePerUnitParts.cents }}</span><span>&#8239;</span><span>{{ pricePerUnitParts.currency }}/{{ product.computed.pricePerUnit.unit }}</span>
              </div>
            </div>
          </div>

          <!-- product group - for Dr.Max -->
          <div
            v-if="hasProductGroups"
            class="tw-ml-1 tw-mt-1 tw-text-[0.775rem] tw-leading-[1.3] tw-text-ds-paragraph-alternative"
            data-tid="product-box__product-groups"
            v-text="productGroupsText"></div>

          <!-- Planned stock and D+1 should be shown in bottom info area (not as top ribbon). -->
          <!-- FutureStockInfo.vue -> FutureDeliveryTag.vue, variant="text" -->
          <div
            v-if="(isFirstOrderDayVisible || isPlannedStockVisible) && futureStockText && !isMarketProduct"
            data-tid="FeatureDeliveryTag_container"
            class="tw-flex tw-items-center tw-w-full tw-justify-start tw-text-left tw-text-sm tw-font-semibold tw-text-ds-accent-blue tw-ml-1 tw-mt-2 tw-text-sm tw-font-semibold">
            <div v-text="futureStockText"></div>
          </div>

          <!-- Multibuy variants -->
          <ds-button
            v-if="showMultiBuyVariants"
            size="sm"
            data-tid="product-box__product-groups"
            class="tw-mt-2"
            variant="tertiary"
            :label="t('product.showVariants')"
            :aria-label="t('product.aria.showVariants', { name: product.origin.name })"
            @click.stop="openVariantsModal"
            @mouseenter="isButtonHovering = true"
            @mouseleave="isButtonHovering = false"></ds-button>

          <div
            v-if="separated"
            class="product-separator"></div>
        </article>
      </div>
    `,
  }
})()
