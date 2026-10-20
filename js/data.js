/* Mock data (fictional). Exposed as window.MockData; copied fresh by App.reset().
   Shape follows docs/DATA-MODEL-DRAFT.md (Company, Location, User). Fields set by makro staff live under `staff`. */
window.MockData = {
  /* four roles per company (REG-12); one role per user + a list of locations the user can buy for */
  roles: {
    owner: { label: 'Vlastník', desc: 'Nejvyšší role. Spravuje vše, včetně dalších vlastníků. Ve firmě vždy zůstává alespoň jeden.' },
    admin: { label: 'Správce účtu', desc: 'Spravuje firmu, kolegy, provozovny a platby. Nemůže měnit ani odebrat vlastníka.' },
    buyer: { label: 'Nákupčí', desc: 'Nakupuje pro přiřazené provozovny. Nastavení firmy vidí jen ke čtení.' },
    viewer: { label: 'Prohlížející', desc: 'Vidí objednávky a nastavení firmy, ale nenakupuje ani nic nemění.' }
  },
  /* business segments are an administrable list (REG-31); it drives the starter catalogue */
  segments: ['Restaurace', 'Kavárna', 'Pizzerie', 'Hotel', 'Bar', 'Obchod', 'Jiné'],
  sizes: ['1–5 zaměstnanců', '6–20 zaměstnanců', '21–100 zaměstnanců', 'Více než 100 zaměstnanců'],
  company: {
    name: 'Ukázková firma s.r.o.',
    legalForm: 's.r.o.',
    country: 'CZ',
    ico: '12345678',
    dic: 'CZ12345678',
    address: 'Ukázková 123/4, 110 00 Praha 1',
    seatAddress: '',
    tradeName: 'Restaurace U Mostu',
    segment: 'Restaurace',
    size: '6–20 zaměstnanců',
    contactPhone: '+420 777 000 222',
    contactEmail: 'objednavky@ukazkova-firma.example',
    onlyCompanyEmail: false,
    domains: ['ukazkova-firma.example']
  },
  /* set by makro staff, read-only for the customer */
  staff: {
    customerNo: '4 512 337',
    status: 'Stávající zákazník',
    linked: [{ ico: '87654321', name: 'Ukázkový hotel a.s.' }, { ico: '24681357', name: 'Ukázkové bistro s.r.o.' }],
    rep: { name: 'Tereza Obchodní', email: 'tereza.obchodni@makro.example', phone: '+420 271 005 123' },
    segmentDiscount: 'Gastro B – 3 % na vybraný sortiment',
    priceMode: 'Smluvní ceny',
    pricedItems: 42,
    assortment: 'Omezený sortiment',
    assortmentGroups: ['Čerstvé ovoce a zelenina', 'Maso a ryby', 'Mléčné výrobky a vejce', 'Nápoje'],
    alternatives: [
      { item: 'Jablko Gala, 1 ks', alt: 'Jablko Golden Delicious, 1 ks' },
      { item: 'Hrozny červené, bezsemenné', alt: 'Hrozny bílé, bezsemenné' },
      { item: 'Avokádo Hass „Ready to Eat“', alt: 'Avokádo Hass, tvrdé' }
    ],
    methodsAllowed: ['invoice', 'cod', 'bonus', 'voucher'],
    credit: { status: 'approved', limit: 50000, terms: 'Splatnost faktur 14 dní', balance: 12340 }
  },
  /* representative authorisation and verification (REG-02, REG-03) */
  authz: {
    type: 'statutory', person: 'Ondřej Ukázkový', position: 'Jednatel',
    method: 'Bank iD', verifiedAt: '2. 9. 2026', status: 'verified',
    docs: [
      { id: 'd1', name: 'Výpis z obchodního rejstříku.pdf', kind: 'Výpis z rejstříku', date: '2. 9. 2026', status: 'ok' },
      { id: 'd2', name: 'Živnostenský list.pdf', kind: 'Doklad o podnikání', date: '2. 9. 2026', status: 'ok' }
    ]
  },
  payments: {
    preferred: ['invoice'],
    invoicePhone: '+420 777 000 111',
    invoiceEmail: 'fakturace@ukazkova-firma.example'
  },
  /* consents and agreements (REG-27/28/32/29); marketing consent is per user (REG-32) */
  agreements: {
    terms: [
      { version: '2.1', country: 'CZ', lang: 'Čeština', date: '2. 9. 2026', user: 'Ondřej Ukázkový' },
      { version: '2.0', country: 'CZ', lang: 'Čeština', date: '14. 3. 2026', user: 'Ondřej Ukázkový' }
    ],
    pendingTerms: { version: '2.2', date: '1. 11. 2026' },
    cookies: { analytics: true, marketing: false },
    proofDocs: [{ id: 'p1', name: 'Výpis z obchodního rejstříku.pdf', date: '2. 9. 2026' }],
    proofMin: 1, proofMax: 3
  },
  sites: [
    { id: 's1', name: 'Restaurace U Mostu', tradeName: '', contact: 'Jana Nováková', phone: '+420 777 111 222',
      addresses: [
        { id: 'a1', name: 'Hlavní vchod', address: 'Na Příkopě 15, 110 00 Praha 1', pin: [50, 60], entrance: 'Boční ulice', floor: 'Přízemí', door: '', note: 'Zvonek „Kuchyně“.', main: true, from: '', to: '' },
        { id: 'a2', name: 'Letní zahrádka', address: 'Na Příkopě 22, 110 00 Praha 1', pin: [42, 48], entrance: 'Vstup z nádvoří', floor: '', door: '', note: '', main: false, from: '2026-05-01', to: '2026-09-30' }
      ],
      days: [0, 1, 2, 3, 4], from: '06:00', to: '10:00', restrictions: ['avizo'], note: 'Vjezd z boční ulice.',
      licence: { kind: 'alcohol', code: 'ALK-2024-0815', expiry: '2026-12-15' }, blocked: false, address: 'Na Příkopě 15, 110 00 Praha 1' },
    { id: 's2', name: 'Bistro Brno centrum', tradeName: 'Bistro Brno', contact: 'Petr Dvořák', phone: '+420 777 333 444',
      addresses: [{ id: 'a3', name: 'Provozovna', address: 'Masarykova 28, 602 00 Brno', pin: [40, 45], entrance: 'Zadní dvůr', floor: '', door: 'č. 3', note: '', main: true, from: '', to: '' }],
      days: [0, 1, 2, 3, 4, 5], from: '07:00', to: '12:00', restrictions: ['rampa', 'vyska'], note: '',
      licence: { kind: 'none', code: '', expiry: '' }, blocked: false, address: 'Masarykova 28, 602 00 Brno' },
    { id: 's3', name: 'Hotel Plzeň', tradeName: '', contact: 'Marie Svobodová', phone: '+420 777 555 666',
      addresses: [{ id: 'a4', name: 'Recepce', address: 'Americká 42, 301 00 Plzeň', pin: [60, 50], entrance: 'Recepce', floor: '', door: '', note: 'Příjem zboží u recepce.', main: true, from: '', to: '' }],
      days: [1, 3], from: '08:00', to: '14:00', restrictions: [], note: 'Příjem zboží u recepce.',
      licence: { kind: 'tobacco', code: 'TAB-2025-0042', expiry: '2026-11-20' }, blocked: true, address: 'Americká 42, 301 00 Plzeň' }
  ],
  /* status: active | invited | blocked (shown as Deaktivovaný) */
  users: [
    { id: 'u1', email: 'majitel@ukazkova-firma.example', first: 'Ondřej', last: 'Ukázkový', phone: '+420 777 100 001', role: 'owner', sites: 'all', status: 'active', lastActive: '16. 10. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '2. 9. 2026', version: '3.0', stats: true }, marketing: { on: true, channels: ['email', 'phone'], date: '2. 9. 2026' } },
    { id: 'u6', email: 'sprava@ukazkova-firma.example', first: 'Lenka', last: 'Správcová', phone: '+420 777 100 006', role: 'admin', sites: 'all', status: 'active', lastActive: '15. 10. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '10. 9. 2026', version: '3.0', stats: true }, marketing: { on: false, channels: [], date: '' } },
    { id: 'u2', email: 'jana.novakova@ukazkova-firma.example', first: 'Jana', last: 'Nováková', phone: '+420 777 111 222', role: 'buyer', sites: ['s1'], status: 'active', lastActive: '16. 10. 2026',
      limit: 20000, approval: true, approver: 'u1', gdpr: { date: '12. 9. 2026', version: '3.0', stats: false }, marketing: { on: true, channels: ['email'], date: '12. 9. 2026' } },
    { id: 'u3', email: 'petr.dvorak@ukazkova-firma.example', first: 'Petr', last: 'Dvořák', phone: '+420 777 333 444', role: 'buyer', sites: ['s2'], status: 'active', lastActive: '12. 10. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '12. 9. 2026', version: '3.0', stats: true }, marketing: { on: false, channels: [], date: '' } },
    { id: 'u7', email: 'eva.ucetni@ukazkova-firma.example', first: 'Eva', last: 'Účetní', phone: '', role: 'viewer', sites: 'all', status: 'active', lastActive: '9. 10. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '15. 9. 2026', version: '3.0', stats: false }, marketing: { on: false, channels: [], date: '' } },
    { id: 'u4', email: 'ucetni@ukazkova-firma.example', first: '', last: '', phone: '', role: 'viewer', sites: 'all', status: 'invited', lastActive: '',
      limit: null, approval: false, approver: '', gdpr: null, marketing: { on: false, channels: [], date: '' } },
    { id: 'u5', email: 'marie.svobodova@ukazkova-firma.example', first: 'Marie', last: 'Svobodová', phone: '+420 777 555 666', role: 'buyer', sites: ['s3'], status: 'blocked', lastActive: '2. 8. 2026',
      limit: null, approval: false, approver: '', gdpr: { date: '12. 9. 2026', version: '3.0', stats: false }, marketing: { on: false, channels: [], date: '' } }
  ],
  orders: [
    { id: '2026-104512', date: '14. 10. 2026', site: 's1', total: 18420, status: 'Doručeno' },
    { id: '2026-104377', date: '12. 10. 2026', site: 's2', total: 9860, status: 'Doručeno' },
    { id: '2026-104201', date: '9. 10. 2026', site: 's1', total: 22150, status: 'Doručeno' },
    { id: '2026-104688', date: '16. 10. 2026', site: 's2', total: 12340, status: 'Na cestě' }
  ],
  credits: { balance: 12500, history: [
    { date: '2. 10. 2026', text: 'Dobití firemních kreditů', amount: 15000 },
    { date: '9. 10. 2026', text: 'Úhrada objednávky 2026-104201', amount: -2500 }
  ] },
  card: { brand: 'Visa', last4: '4242', exp: '12/28' }
};
window.MockData.restrictionLabels = {
  avizo: 'Řidič má před doručením zavolat',
  rampa: 'K dispozici je nakládací rampa',
  vyska: 'Maximální výška vozidla 3,5 m',
  zakaz: 'Zákaz vjezdu nákladních vozidel'
};
window.MockData.addressSuggestions = [
  'Na Příkopě 15, 110 00 Praha 1', 'Na Příkopě 22, 110 00 Praha 1', 'Evropská 2758/11, 160 00 Praha 6',
  'Masarykova 28, 602 00 Brno', 'Masarykova 5, 602 00 Brno', 'Americká 42, 301 00 Plzeň',
  'Náměstí Republiky 1, 306 32 Plzeň', 'Zlatnická 10, 110 00 Praha 1'
];
/* per-user settings (docs/DATA-MODEL-DRAFT.md section 3): display toggles, SSO identities, e-mail verification, password */
window.MockData.users.forEach(u => Object.assign(u, {
  display: { vat: 'excl', pack: 'piece', unit: 'kg' },
  sso: { google: false, microsoft: false },
  emailVerified: u.status !== 'invited',
  passwordChanged: u.status === 'invited' ? '' : '1. 9. 2026'
}));
window.MockData.users.find(u => u.id === 'u1').sso.google = true;
