/* Mock data (fictional). Exposed as window.MockData; copied fresh by App.reset(). */
window.MockData = {
  roles: {
    admin: { label: 'Správce', desc: 'Spravuje firmu, uživatele, provozovny a platby. Může nakupovat pro všechny provozovny.' },
    buyer: { label: 'Nákupčí', desc: 'Nakupuje pro přiřazené provozovny. Nastavení firmy vidí jen ke čtení.' },
    viewer: { label: 'Prohlížející', desc: 'Vidí objednávky a nastavení firmy, ale nenakupuje ani nic nemění.' }
  },
  company: {
    name: 'Ukázková firma s.r.o.',
    ico: '12345678',
    dic: 'CZ12345678',
    address: 'Ukázková 123/4, 110 00 Praha 1',
    invoicePhone: '+420 777 000 111',
    invoiceEmail: 'fakturace@ukazkova-firma.example',
    commPhone: '+420 777 000 222',
    commEmail: 'objednavky@ukazkova-firma.example',
    onlyCompanyEmail: false,
    domains: ['ukazkova-firma.example']
  },
  sites: [
    { id: 's1', name: 'Restaurace U Mostu', address: 'Na Příkopě 15, 110 00 Praha 1', contact: 'Jana Nováková', phone: '+420 777 111 222',
      days: [0, 1, 2, 3, 4], from: '06:00', to: '10:00', restrictions: ['avizo'], note: 'Vjezd z boční ulice, zvonek „Kuchyně“.', blocked: false, pin: [50, 60] },
    { id: 's2', name: 'Bistro Brno centrum', address: 'Masarykova 28, 602 00 Brno', contact: 'Petr Dvořák', phone: '+420 777 333 444',
      days: [0, 1, 2, 3, 4, 5], from: '07:00', to: '12:00', restrictions: ['rampa', 'vyska'], note: '', blocked: false, pin: [40, 45] },
    { id: 's3', name: 'Hotel Plzeň', address: 'Americká 42, 301 00 Plzeň', contact: 'Marie Svobodová', phone: '+420 777 555 666',
      days: [1, 3], from: '08:00', to: '14:00', restrictions: [], note: 'Příjem zboží u recepce.', blocked: true, pin: [60, 50] }
  ],
  users: [
    { id: 'u1', email: 'majitel@ukazkova-firma.example', first: 'Ondřej', last: 'Ukázkový', role: 'admin', sites: 'all', status: 'active' },
    { id: 'u2', email: 'jana.novakova@ukazkova-firma.example', first: 'Jana', last: 'Nováková', role: 'buyer', sites: ['s1'], status: 'active' },
    { id: 'u3', email: 'petr.dvorak@ukazkova-firma.example', first: 'Petr', last: 'Dvořák', role: 'buyer', sites: ['s2'], status: 'active' },
    { id: 'u4', email: 'ucetni@ukazkova-firma.example', first: '', last: '', role: 'viewer', sites: 'all', status: 'invited' },
    { id: 'u5', email: 'marie.svobodova@ukazkova-firma.example', first: 'Marie', last: 'Svobodová', role: 'buyer', sites: ['s3'], status: 'blocked' }
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
