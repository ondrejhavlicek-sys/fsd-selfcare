/* Product listing grid built from the Fresh product box (<product-item>, vendor/product-item.js).
   One persistent Vue island renders all boxes: it is mounted once and moved into the page after every
   App.render() (like the nav), so the boxes keep their state (add-to-cart feedback, tooltips, focus) across
   re-renders, and the 21 boxes cost one Vue app instead of 21. Data flows one way:
   shop.js -> Grid.sync(list) -> reactive state; box events -> App.cart -> App.render(). */
(function () {
  const { reactive, computed } = Vue;
  const state = reactive({ list: [], qty: {}, lang: 'cs' });

  /* ---- mock product -> production `Product` shape ({ id, origin, computed }) ---- */
  const num = s => parseFloat(String(s).replace(/\s/g, '').replace(',', '.'));
  function parseUnit(u) { const m = String(u || '').match(/^([\d\s,]+)\s*Kč\/(\S+)$/); return m ? { price: num(m[1]), unit: m[2] } : { price: 0, unit: 'ks' }; }
  function parsePack(p) {
    const m = String(p || '').match(/^(cca\s+)?([\d,]+)\s*(\S+)$/);
    return m ? { prefix: m[1] ? 'cca' : '', value: num(m[2]), unit: m[3] } : null;
  }
  const origin = (p, name) => {
    const unit = parseUnit(p.unit), steps = [];
    let price = p.price;
    if (p.kind === 'multi') {
      /* Multikup: the mock stores the multi-buy price in `price` and the single price as text ("12,90 Kč za 1 ks") */
      const single = num(String(p.single).split(' ')[0]);
      steps.push({ quantity: p.multiFrom, price: p.price, pricePerUnit: unit, associationCode: 'mk' + p.id, percentageDiscount: Math.round((1 - p.price / single) * 100) });
      price = single;
    }
    return {
      id: p.id, name, image: 'assets/products/' + p.img + '.png', url: '#/',
      price, recommendedPrice: p.old || price, recommendedSellPrice: 0, percentageDiscount: p.old ? Math.round((1 - p.price / p.old) * 100) : 0,
      pricePerUnit: unit, productQuantity: parsePack(p.pack), unit: 'ks', countryCode: null, pictographs: [],
      infoLabels: [], priceLabels: [], labels: [], actionLabel: null, cumulativePrices: steps, associationCode: null, hasAssociatedProducts: false,
      maxInCart: 99, limitInCart: null, unitStep: 1, vendorId: 1, giftIds: [], productGroups: [], availability: [], adultOnly: false,
      favorite: false, purchased: false, relatedProduct: null, firstOrderDay: null, plannedStock: null, returnablePackagePrice: 0
    };
  };
  /* the box's `computed` part (useCumulativePricesStore.createProductComputed, without association groups) */
  function computedPart(o, q) {
    const steps = o.cumulativePrices.slice().sort((a, b) => a.quantity - b.quantity);
    let idx = -1; steps.forEach((s, i) => { if (q >= s.quantity) idx = i; });
    const cur = steps[idx], next = steps[idx + 1];
    return { id: o.id, quantity: q, currentStep: cur, nextStep: next, remainingQuantity: next ? next.quantity - q : null,
      price: cur ? cur.price : o.price, pricePerUnit: cur ? cur.pricePerUnit : o.pricePerUnit, recommendedPrice: o.recommendedPrice, effectiveQuantity: q };
  }
  const products = computed(() => state.list.map(p => {
    const o = origin(p, I18N.t(p.name)), q = state.qty[p.id] || 0, c = computedPart(o, q);
    return { id: p.id, origin: o, computed: c };
  }));

  /* ---- box texts: Fresh ships Czech only; swap the dictionary on a language switch ---- */
  const M = window.ProtoKit.ProductItemMessages, CS = Object.assign({}, M);
  const TR = {
    en: { 'general.approximately': 'approx.', 'product.soldOut': 'Sold out', 'product.originalPrice': 'Original price', 'product.commonPrice': 'Regular price',
      'product.aria.viewProductDetail': 'Show product detail {name}', 'product.aria.price': 'Price {price}', 'product.aria.addToCart': 'Add {name} to cart',
      'product.aria.increaseAmount': 'Increase quantity of {name}', 'product.aria.decreaseAmount': 'Decrease quantity of {name}', 'product.aria.removeFromCart': 'Remove {name} from cart',
      'product.aria.productQuantity': 'Quantity of {name}: {quantity}', 'product.aria.multibuyCta': 'Add {quantity} pieces of {name} at {price} per piece',
      'product.aria.multibuyInfo': 'Multi-buy price for {name}: {quantity} pieces for {price} - {status}', 'product.aria.priceStepsDescription': 'Multi-buy prices that depend on the number of pieces',
      'product.aria.status.active': 'active price', 'product.aria.status.inactive': 'available price', 'product.aria.status.achieved': 'reached price', 'product.aria.status.disabled': 'unavailable price',
      'cumulativePrices.fromPcs': 'from {quantity} pcs', 'cumulativePrices.fromOnePiece': '{price} for 1 pc', 'cumulativePrices.addItemsToCart': 'add {count} pcs', 'cumulativePrices.putItemsToCart': 'put {count} pcs',
      'amount.maxInCart.tooltip': 'Limit {amount} pcs<br>per order', 'amount.unitStep.tooltip': 'Only in<br>multiples of {amount}' },
    vi: { 'general.approximately': 'khoảng', 'product.soldOut': 'Hết hàng', 'product.originalPrice': 'Giá gốc', 'product.commonPrice': 'Giá thường',
      'product.aria.viewProductDetail': 'Xem chi tiết sản phẩm {name}', 'product.aria.price': 'Giá {price}', 'product.aria.addToCart': 'Thêm {name} vào giỏ hàng',
      'product.aria.increaseAmount': 'Tăng số lượng {name}', 'product.aria.decreaseAmount': 'Giảm số lượng {name}', 'product.aria.removeFromCart': 'Bỏ {name} khỏi giỏ hàng',
      'product.aria.productQuantity': 'Số lượng {name}: {quantity}', 'product.aria.multibuyCta': 'Thêm {quantity} sản phẩm {name} với giá {price} mỗi sản phẩm',
      'product.aria.multibuyInfo': 'Giá mua nhiều cho {name}: {quantity} sản phẩm giá {price} - {status}', 'product.aria.priceStepsDescription': 'Giá mua nhiều thay đổi theo số lượng',
      'product.aria.status.active': 'giá đang áp dụng', 'product.aria.status.inactive': 'giá có thể áp dụng', 'product.aria.status.achieved': 'giá đã đạt', 'product.aria.status.disabled': 'giá không khả dụng',
      'cumulativePrices.fromPcs': 'từ {quantity} sp', 'cumulativePrices.fromOnePiece': '{price} cho 1 sp', 'cumulativePrices.addItemsToCart': 'thêm {count} sp', 'cumulativePrices.putItemsToCart': 'cho {count} sp vào giỏ',
      'amount.maxInCart.tooltip': 'Giới hạn {amount} sp<br>mỗi đơn', 'amount.unitStep.tooltip': 'Chỉ mua<br>theo bội số {amount}' }
  };
  const applyLang = l => { Object.keys(M).forEach(k => { M[k] = CS[k]; }); Object.assign(M, TR[l] || {}); };

  const Grid = {
    template: `<div class="grid-shop"><product-item v-for="(p, i) in products" :key="p.id" :product="p" :order="i + 1" :quantity="p.computed.quantity" @update:quantity="setQty(p.id, $event)"></product-item></div>`,
    setup() {
      const setQty = (id, n) => {
        const cur = App.cart.qty(id);
        if (n > cur) {
          if (!App.currentSite()) return UI.toast('Nejdřív vyberte aktivní provozovnu.');
          if (App.S.role === 'viewer') return UI.toast('S rolí Prohlížející nemůžete nakupovat.');
        }
        App.cart.set(id, n); App.render();
      };
      return { products, setQty };
    }
  };

  const host = document.createElement('div');
  host.id = 'grid-host';
  host.setAttribute('data-no-i18n', '');
  let mounted = false;

  window.Grid = {
    sync(list) { state.list = list; state.qty = Object.assign({}, App.S.cart); if (state.lang !== I18N.lang) { applyLang(I18N.lang); state.lang = I18N.lang; } },
    detach() { if (host.parentNode) host.remove(); },
    attach(slot) {
      if (!slot) return;
      slot.replaceWith(host);
      if (!mounted) { mounted = true; Fresh.mount(Grid, host, app => app.component('product-item', ProtoKit.ProductItem)); }
    }
  };
})();
