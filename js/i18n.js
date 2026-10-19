/* i18n: Czech is the source language. I18N.apply(root) translates text nodes and a few attributes after each render
   (exact-match dictionary + regex patterns for strings with names/numbers). Vietnamese is a first draft and needs a native review. */
window.I18N = (function () {
  let lang = 'cs';
  const D = {};
  const IDX = { en: 0, vi: 1 };
  /* [cs, en, vi] */
  [
    /* shell */
    ['Nakupování', 'Shopping', 'Mua sắm'], ['Firemní profil', 'Company profile', 'Hồ sơ công ty'],
    ['Správce', 'Administrator', 'Quản trị viên'], ['Nákupčí', 'Buyer', 'Người mua hàng'], ['Prohlížející', 'Viewer', 'Người xem'],
    ['Žádná provozovna', 'No site', 'Chưa có cơ sở'], ['Oznámení', 'Notifications', 'Thông báo'],
    ['Potraviny', 'Food', 'Thực phẩm'], ['Nepotravinové zboží', 'Non-food goods', 'Hàng phi thực phẩm'],
    ['Mé objednávky', 'My orders', 'Đơn hàng của tôi'], ['Seznamy', 'Lists', 'Danh sách'], ['Jazyk', 'Language', 'Ngôn ngữ'],
    ['Košík', 'Cart', 'Giỏ hàng'], ['K pokladně', 'Checkout', 'Thanh toán'], ['Firemní účet', 'Company account', 'Tài khoản công ty'],
    ['Hlavní stránka', 'Home', 'Trang chủ'], ['Drobečková navigace', 'Breadcrumb navigation', 'Đường dẫn điều hướng'],
    ['Vybraná dodací adresa', 'Selected delivery address', 'Địa chỉ giao hàng đã chọn'], ['Doručení:', 'Delivery:', 'Giao hàng:'],
    ['Vyberte adresu doručení', 'Select a delivery address', 'Chọn địa chỉ giao hàng'],
    ['Košík a ceny se vztahují k vybrané provozovně.', 'The cart and prices apply to the selected site.', 'Giỏ hàng và giá áp dụng cho cơ sở đã chọn.'],
    ['Nemáte žádnou aktivní provozovnu.', 'You have no active site.', 'Bạn chưa có cơ sở nào đang hoạt động.'],
    ['Spravovat provozovny', 'Manage sites', 'Quản lý cơ sở'],
    ['Přepnout na osobní účet', 'Switch to personal account', 'Chuyển sang tài khoản cá nhân'], ['Odhlásit se', 'Sign out', 'Đăng xuất'],
    ['K této stránce nemáte oprávnění', 'You don’t have permission to view this page', 'Bạn không có quyền xem trang này'],
    ['Zobrazit ji může jen správce firmy. Požádejte správce o změnu role nebo o úpravu, kterou potřebujete.', 'Only the company administrator can view it. Ask the administrator to change your role or make the change you need.', 'Chỉ quản trị viên công ty mới xem được trang này. Hãy nhờ quản trị viên đổi vai trò của bạn hoặc thực hiện thay đổi bạn cần.'],
    ['Stránku se nepodařilo načíst', 'The page could not be loaded', 'Không thể tải trang'],
    ['Zkuste to prosím znovu. Pokud potíže přetrvají, zavolejte nám na +420 271 005 005.', 'Please try again. If the problem continues, call us on +420 271 005 005.', 'Vui lòng thử lại. Nếu sự cố vẫn tiếp diễn, hãy gọi cho chúng tôi theo số +420 271 005 005.'],
    ['Zkusit znovu', 'Try again', 'Thử lại'],
    ['Nemáte žádná nová oznámení.', 'You have no new notifications.', 'Bạn không có thông báo mới.'],
    ['Tato část není součástí prototypu.', 'This part is not included in the prototype.', 'Phần này không có trong bản mẫu.'],
    ['Pokladna není součástí prototypu.', 'Checkout is not included in the prototype.', 'Thanh toán không có trong bản mẫu.'],
    ['Košík je prázdný.', 'The cart is empty.', 'Giỏ hàng trống.'],
    ['Dodací adresa je změněná.', 'The delivery address has been changed.', 'Địa chỉ giao hàng đã được thay đổi.'],
    ['Přepnutí na osobní účet není součástí prototypu.', 'Switching to a personal account is not included in the prototype.', 'Chuyển sang tài khoản cá nhân không có trong bản mẫu.'],
    ['Odhlášení není součástí prototypu.', 'Signing out is not included in the prototype.', 'Đăng xuất không có trong bản mẫu.'],
    ['Ukázková data jsou obnovena.', 'The sample data has been restored.', 'Dữ liệu mẫu đã được khôi phục.'],
    /* footer */
    ['Pro vaše podnikání', 'For your business', 'Cho hoạt động kinh doanh của bạn'], ['Můj obchod', 'My store', 'Cửa hàng của tôi'],
    ['Vzor plné moci ke stažení', 'Power of attorney template (download)', 'Mẫu giấy ủy quyền (tải xuống)'],
    ['Vše pro maloobchod', 'Everything for retail', 'Mọi thứ cho bán lẻ'], ['Vše pro gastronomii', 'Everything for catering', 'Mọi thứ cho ngành ẩm thực'],
    ['Kvalita a standardy', 'Quality and standards', 'Chất lượng và tiêu chuẩn'],
    ['O nás', 'About us', 'Về chúng tôi'], ['O makro', 'About makro', 'Về makro'], ['Pro dodavatele', 'For suppliers', 'Dành cho nhà cung cấp'],
    ['Pro novináře', 'For journalists', 'Dành cho nhà báo'], ['Nejčastější otázky', 'FAQ', 'Câu hỏi thường gặp'],
    ['Kariéra', 'Careers', 'Tuyển dụng'], ['Udržitelnost', 'Sustainability', 'Phát triển bền vững'],
    ['Užitečné odkazy', 'Useful links', 'Liên kết hữu ích'], ['Získat makro kartu', 'Get a makro card', 'Đăng ký thẻ makro'],
    ['Bonusový program', 'Bonus programme', 'Chương trình thưởng'], ['Energetické štítky', 'Energy labels', 'Nhãn năng lượng'],
    ['Informace o stažení výrobku', 'Product recall information', 'Thông tin thu hồi sản phẩm'],
    ['makro akademie', 'makro academy', 'makro academy'], ['makro newsletter', 'makro newsletter', 'Bản tin makro'],
    ['Kontakty', 'Contact', 'Liên hệ'], ['Po - Pá: 7:00–19:00 Ne: 12:00–19:00', 'Mon–Fri: 7:00–19:00 Sun: 12:00–19:00', 'T2–T6: 7:00–19:00 CN: 12:00–19:00'],
    ['Sledujte nás', 'Follow us', 'Theo dõi chúng tôi'],
    /* common */
    ['Zavřít', 'Close', 'Đóng'], ['Uložit', 'Save', 'Lưu'], ['Zrušit', 'Cancel', 'Hủy'], ['Odebrat', 'Remove', 'Xóa'], ['Upravit', 'Edit', 'Sửa'],
    ['Rozumím', 'Got it', 'Đã hiểu'], ['(povinné)', '(required)', '(bắt buộc)'], ['Aktivní', 'Active', 'Đang hoạt động'],
    ['Zablokovat', 'Block', 'Chặn'], ['zablokovaná', 'blocked', 'bị chặn'],
    ['kontakty pro zasílání faktur', 'contacts for sending invoices', 'liên hệ nhận hóa đơn'], ['kontakty pro komunikaci', 'contacts for communication', 'liên hệ giao tiếp'], ['e-mail jen s firemní doménou', 'e-mail with a company domain only', 'chỉ e-mail có tên miền công ty'], ['Odblokovat', 'Unblock', 'Bỏ chặn'], ['Zablokovaná', 'Blocked', 'Đã bị chặn'], ['Zablokovaný', 'Blocked', 'Đã bị chặn'],
    ['Telefon', 'Phone', 'Điện thoại'], ['E-mail', 'E-mail', 'E-mail'], ['Stav', 'Status', 'Trạng thái'], ['Role', 'Role', 'Vai trò'],
    ['Po', 'Mon', 'T2'], ['Út', 'Tue', 'T3'], ['St', 'Wed', 'T4'], ['Čt', 'Thu', 'T5'], ['Pá', 'Fri', 'T6'], ['So', 'Sat', 'T7'], ['Ne', 'Sun', 'CN'],
    ['každý den', 'every day', 'mỗi ngày'],
    /* roles / data */
    ['Spravuje firmu, uživatele, provozovny a platby. Může nakupovat pro všechny provozovny.', 'Manages the company, users, sites and payments. Can buy for all sites.', 'Quản lý công ty, người dùng, cơ sở và thanh toán. Có thể mua hàng cho tất cả cơ sở.'],
    ['Nakupuje pro přiřazené provozovny. Nastavení firmy vidí jen ke čtení.', 'Buys for assigned sites. Can only view company settings.', 'Mua hàng cho các cơ sở được giao. Chỉ xem được cài đặt công ty.'],
    ['Vidí objednávky a nastavení firmy, ale nenakupuje ani nic nemění.', 'Can see orders and company settings but cannot buy or change anything.', 'Xem được đơn hàng và cài đặt công ty nhưng không mua hàng hay thay đổi gì.'],
    ['Doručeno', 'Delivered', 'Đã giao'], ['Na cestě', 'On the way', 'Đang giao'],
    ['Dobití firemních kreditů', 'Company credit top-up', 'Nạp tín dụng công ty'],
    ['Řidič má před doručením zavolat', 'Driver should call before delivery', 'Tài xế cần gọi trước khi giao hàng'],
    ['K dispozici je nakládací rampa', 'A loading ramp is available', 'Có bến bốc dỡ hàng'],
    ['Maximální výška vozidla 3,5 m', 'Maximum vehicle height 3.5 m', 'Chiều cao xe tối đa 3,5 m'],
    ['Zákaz vjezdu nákladních vozidel', 'No entry for lorries', 'Cấm xe tải vào'],
    /* company */
    ['Firemní informace', 'Company information', 'Thông tin công ty'],
    ['Nastavení firmy vidíte jen ke čtení', 'You can only view company settings', 'Bạn chỉ xem được cài đặt công ty'],
    ['Změny může provést správce firmy.', 'Only the company administrator can make changes.', 'Chỉ quản trị viên công ty mới có thể thay đổi.'],
    ['Název a fakturační údaje', 'Name and billing details', 'Tên và thông tin xuất hóa đơn'],
    ['Aktualizovat z rejstříku', 'Update from the register', 'Cập nhật từ sổ đăng ký'], ['Aktualizuji…', 'Updating…', 'Đang cập nhật…'],
    ['Údaje jsou aktuální podle obchodního rejstříku.', 'The details are up to date with the commercial register.', 'Thông tin đã được cập nhật theo sổ đăng ký kinh doanh.'],
    ['Kontakty pro zasílání faktur', 'Contacts for sending invoices', 'Liên hệ nhận hóa đơn'], ['Kontakty pro komunikaci', 'Contacts for communication', 'Liên hệ giao tiếp'],
    ['Přidávat kolegy jen s firemním e-mailem', 'Add colleagues only with a company e-mail', 'Chỉ thêm đồng nghiệp bằng e-mail công ty'],
    ['Zapnuto. Kolegy půjde přidat jen s e-mailem v těchto doménách:', 'On. Colleagues can only be added with an e-mail in these domains:', 'Đang bật. Chỉ thêm được đồng nghiệp có e-mail thuộc các tên miền sau:'],
    ['Vypnuto. Kolegu půjde přidat s jakýmkoli e-mailem.', 'Off. A colleague can be added with any e-mail.', 'Đang tắt. Có thể thêm đồng nghiệp bằng bất kỳ e-mail nào.'],
    ['E-mail jen s firemní doménou', 'E-mail with a company domain only', 'Chỉ e-mail có tên miền công ty'],
    ['Přidání kolegy půjde dokončit jen s e-mailem v povolené doméně.', 'A colleague can only be added with an e-mail in an allowed domain.', 'Chỉ thêm được đồng nghiệp có e-mail thuộc tên miền được phép.'],
    ['Povolené domény (oddělte čárkou)', 'Allowed domains (separated by commas)', 'Tên miền được phép (cách nhau bằng dấu phẩy)'],
    ['Zadejte telefon ve tvaru +420 777 000 111.', 'Enter a phone number like +420 777 000 111.', 'Nhập số điện thoại dạng +420 777 000 111.'],
    ['Zadejte e-mail ve tvaru jmeno@firma.cz.', 'Enter an e-mail like name@company.com.', 'Nhập e-mail dạng ten@congty.com.'],
    ['Kontakty jsou uložené.', 'The contacts have been saved.', 'Đã lưu thông tin liên hệ.'], ['Nastavení je uložené.', 'The setting has been saved.', 'Đã lưu cài đặt.'],
    ['Zadejte alespoň jednu doménu.', 'Enter at least one domain.', 'Nhập ít nhất một tên miền.'],
    /* orders, credits */
    ['Objednávky', 'Orders', 'Đơn hàng'], ['Zástupný přehled', 'Placeholder overview', 'Tổng quan tạm thời'],
    ['Historie objednávek je v této verzi prototypu jen ukázka.', 'The order history is only a sample in this version of the prototype.', 'Lịch sử đơn hàng chỉ là bản minh họa trong phiên bản mẫu này.'],
    ['Číslo', 'Number', 'Số đơn'], ['Datum', 'Date', 'Ngày'], ['Provozovna', 'Site', 'Cơ sở'], ['Částka', 'Amount', 'Số tiền'], ['Popis', 'Description', 'Mô tả'],
    ['Zatím tu nemáte žádnou objednávku', 'You have no orders yet', 'Bạn chưa có đơn hàng nào'],
    ['Až nakoupíte, uvidíte tady přehled svých objednávek.', 'Once you shop, you will see your orders here.', 'Sau khi mua hàng, bạn sẽ thấy các đơn hàng ở đây.'],
    ['Kredity', 'Credits', 'Tín dụng'], ['Koupit firemní kredity', 'Buy company credits', 'Mua tín dụng công ty'],
    ['Zůstatek firemních kreditů', 'Company credit balance', 'Số dư tín dụng công ty'],
    ['Kredity může koupit jen správce firmy. Použít je mohou všichni kolegové při placení.', 'Only the company administrator can buy credits. All colleagues can use them when paying.', 'Chỉ quản trị viên công ty mới mua được tín dụng. Tất cả đồng nghiệp có thể dùng khi thanh toán.'],
    ['Pohyby na účtu', 'Account activity', 'Biến động tài khoản'],
    ['Zatím nemáte žádné kredity', 'You have no credits yet', 'Bạn chưa có tín dụng nào'],
    ['Firemní kredity získáte dobitím nebo vrácením peněz za objednávku.', 'You get company credits by topping up or by a refund for an order.', 'Bạn nhận tín dụng công ty khi nạp tiền hoặc được hoàn tiền cho đơn hàng.'],
    ['Kredity budou připsány po zaplacení.', 'Credits will be added after payment.', 'Tín dụng sẽ được cộng sau khi thanh toán.'],
    ['Pokračovat k platbě', 'Continue to payment', 'Tiếp tục thanh toán'],
    ['Kredity jsou připsané (v prototypu bez platby).', 'The credits have been added (no payment in the prototype).', 'Đã cộng tín dụng (bản mẫu không thanh toán).'],
    /* roles page, payments */
    ['Role a oprávnění', 'Roles and permissions', 'Vai trò và quyền hạn'],
    ['Každý kolega má právě jednu roli. Role se nastavuje u kolegy v sekci Uživatelé.', 'Each colleague has exactly one role. The role is set for the colleague in the Users section.', 'Mỗi đồng nghiệp có đúng một vai trò. Vai trò được đặt ở mục Người dùng.'],
    ['Oprávnění', 'Permission', 'Quyền hạn'], ['Nakupovat pro firmu', 'Buy for the company', 'Mua hàng cho công ty'],
    ['Všechny provozovny', 'All sites', 'Tất cả cơ sở'], ['Přiřazené provozovny', 'Assigned sites', 'Cơ sở được giao'],
    ['Prohlížet objednávky', 'View orders', 'Xem đơn hàng'], ['Upravovat firemní informace', 'Edit company information', 'Sửa thông tin công ty'],
    ['Přidávat a spravovat kolegy', 'Add and manage colleagues', 'Thêm và quản lý đồng nghiệp'],
    ['Přidávat a spravovat provozovny', 'Add and manage sites', 'Thêm và quản lý cơ sở'],
    ['Kupovat firemní kredity', 'Buy company credits', 'Mua tín dụng công ty'], ['Spravovat platební karty', 'Manage payment cards', 'Quản lý thẻ thanh toán'],
    ['Platební karty', 'Payment cards', 'Thẻ thanh toán'], ['Zatím nemáte uloženou žádnou kartu', 'You have no saved card yet', 'Bạn chưa lưu thẻ nào'],
    ['Kartu můžete uložit při placení, ať ji nemusíte zadávat znovu. Platba probíhá přes zabezpečenou bankovní bránu.', 'You can save a card when paying so you don’t have to enter it again. Payment goes through a secure bank gateway.', 'Bạn có thể lưu thẻ khi thanh toán để không phải nhập lại. Thanh toán được thực hiện qua cổng ngân hàng an toàn.'],
    ['Novou kartu uložíte při placení v obchodě. Platba probíhá přes zabezpečenou bankovní bránu.', 'You save a new card when paying in the shop. Payment goes through a secure bank gateway.', 'Bạn lưu thẻ mới khi thanh toán trong cửa hàng. Thanh toán được thực hiện qua cổng ngân hàng an toàn.'],
    ['Odebrat kartu?', 'Remove the card?', 'Xóa thẻ?'], ['Kartu budete moci kdykoli uložit znovu při placení.', 'You can save the card again at any time when paying.', 'Bạn có thể lưu lại thẻ bất cứ lúc nào khi thanh toán.'],
    ['Karta je odebraná.', 'The card has been removed.', 'Đã xóa thẻ.'],
    /* sites */
    ['Provozovny', 'Sites', 'Cơ sở'], ['Provozovny vidíte jen ke čtení', 'You can only view sites', 'Bạn chỉ xem được các cơ sở'],
    ['Přidat nebo upravit je může správce firmy.', 'Only the company administrator can add or edit them.', 'Chỉ quản trị viên công ty mới thêm hoặc sửa được.'],
    ['Přidat provozovnu', 'Add a site', 'Thêm cơ sở'], ['Upravit provozovnu', 'Edit site', 'Sửa cơ sở'],
    ['Zatím tu nemáte žádnou provozovnu', 'You have no sites yet', 'Bạn chưa có cơ sở nào'],
    ['Provozovna je místo, kam vám doručujeme. Přidejte první a určete, kdo do ní smí nakupovat.', 'A site is a place we deliver to. Add the first one and decide who can buy for it.', 'Cơ sở là nơi chúng tôi giao hàng. Hãy thêm cơ sở đầu tiên và chọn ai được mua hàng cho cơ sở đó.'],
    ['Název provozovny', 'Site name', 'Tên cơ sở'], ['např. Restaurace U Mostu', 'e.g. U Mostu Restaurant', 'ví dụ: Nhà hàng U Mostu'],
    ['Adresa doručení', 'Delivery address', 'Địa chỉ giao hàng'], ['např. Evropská 2758/11, 160 00 Praha 6', 'e.g. Evropská 2758/11, 160 00 Prague 6', 'ví dụ: Evropská 2758/11, 160 00 Praha 6'],
    ['Přesné místo doručení (přetáhněte špendlík)', 'Exact delivery spot (drag the pin)', 'Vị trí giao hàng chính xác (kéo ghim)'],
    ['Zjednodušená mapa prototypu', 'Simplified prototype map', 'Bản đồ đơn giản của bản mẫu'],
    ['Kontaktní osoba', 'Contact person', 'Người liên hệ'], ['Dny doručení', 'Delivery days', 'Ngày giao hàng'],
    ['Čas doručení od', 'Delivery time from', 'Thời gian giao hàng từ'], ['Čas doručení do', 'Delivery time to', 'Thời gian giao hàng đến'],
    ['Omezení doručení', 'Delivery restrictions', 'Hạn chế giao hàng'], ['Poznámka pro řidiče', 'Note for the driver', 'Ghi chú cho tài xế'],
    ['Zadejte název provozovny.', 'Enter the site name.', 'Nhập tên cơ sở.'], ['Zadejte adresu doručení.', 'Enter the delivery address.', 'Nhập địa chỉ giao hàng.'],
    ['Zadejte kontaktní osobu.', 'Enter the contact person.', 'Nhập người liên hệ.'], ['Vyberte alespoň jeden den doručení.', 'Select at least one delivery day.', 'Chọn ít nhất một ngày giao hàng.'],
    ['Konec příjmu musí být později než začátek.', 'The end time must be later than the start time.', 'Thời gian kết thúc phải muộn hơn thời gian bắt đầu.'],
    ['Provozovna je přidaná.', 'The site has been added.', 'Đã thêm cơ sở.'], ['Změny jsou uložené.', 'The changes have been saved.', 'Đã lưu thay đổi.'],
    ['Provozovna je odblokovaná.', 'The site has been unblocked.', 'Đã bỏ chặn cơ sở.'], ['Zablokovat provozovnu?', 'Block the site?', 'Chặn cơ sở?'],
    ['Do provozovny nepůjde objednávat, dokud ji neodblokujete. Otevřené objednávky zůstanou beze změny.', 'You won’t be able to order for the site until you unblock it. Open orders stay unchanged.', 'Bạn sẽ không đặt hàng cho cơ sở này được cho đến khi bỏ chặn. Các đơn hàng đang mở giữ nguyên.'],
    ['Provozovna je zablokovaná.', 'The site has been blocked.', 'Đã chặn cơ sở.'], ['Provozovnu nelze odebrat', 'The site cannot be removed', 'Không thể xóa cơ sở'],
    ['Má otevřené objednávky. Počkejte na jejich doručení, nebo provozovnu zatím zablokujte.', 'It has open orders. Wait until they are delivered, or block the site for now.', 'Cơ sở còn đơn hàng đang mở. Hãy chờ giao xong hoặc tạm thời chặn cơ sở.'],
    ['Odebrat provozovnu?', 'Remove the site?', 'Xóa cơ sở?'], ['Provozovna je odebraná.', 'The site has been removed.', 'Đã xóa cơ sở.'],
    /* users */
    ['Uživatelé', 'Users', 'Người dùng'], ['Kolega', 'Colleague', 'Đồng nghiệp'], ['Jméno', 'First name', 'Tên'], ['Příjmení', 'Last name', 'Họ'],
    ['Pozvánka odeslána', 'Invitation sent', 'Đã gửi lời mời'], ['Přidat kolegu', 'Add a colleague', 'Thêm đồng nghiệp'], ['Upravit kolegu', 'Edit colleague', 'Sửa đồng nghiệp'],
    ['Kolegy půjde přidat jen s firemním e-mailem', 'Colleagues can only be added with a company e-mail', 'Chỉ thêm được đồng nghiệp bằng e-mail công ty'],
    ['Zatím tu nemáte žádné kolegy', 'You have no colleagues yet', 'Bạn chưa có đồng nghiệp nào'],
    ['Přidejte kolegu a určete, co smí ve firemním účtu dělat.', 'Add a colleague and decide what they can do in the company account.', 'Hãy thêm đồng nghiệp và quyết định họ được làm gì trong tài khoản công ty.'],
    ['E-mail kolegy', 'Colleague’s e-mail', 'E-mail của đồng nghiệp'], ['např. jmeno@firma.cz', 'e.g. name@company.com', 'ví dụ: ten@congty.com'],
    ['Kolega dostane e-mail s pozvánkou do firemního účtu.', 'The colleague will receive an e-mail inviting them to the company account.', 'Đồng nghiệp sẽ nhận được e-mail mời vào tài khoản công ty.'],
    ['Odeslat pozvánku', 'Send invitation', 'Gửi lời mời'], ['Odeslat znovu', 'Send again', 'Gửi lại'],
    ['Tento kolega už ve firmě je.', 'This colleague is already in the company.', 'Đồng nghiệp này đã có trong công ty.'],
    ['Ve firmě musí zůstat alespoň jeden správce.', 'At least one administrator must remain in the company.', 'Công ty phải còn ít nhất một quản trị viên.'],
    ['Kolega je odblokovaný.', 'The colleague has been unblocked.', 'Đã bỏ chặn đồng nghiệp.'], ['Zablokovat kolegu?', 'Block the colleague?', 'Chặn đồng nghiệp?'],
    ['Kolega se nebude moct přihlásit ani nakupovat. Odblokovat ho můžete kdykoli.', 'The colleague won’t be able to sign in or buy. You can unblock them at any time.', 'Đồng nghiệp sẽ không đăng nhập hay mua hàng được. Bạn có thể bỏ chặn bất cứ lúc nào.'],
    ['Kolega je zablokovaný.', 'The colleague has been blocked.', 'Đã chặn đồng nghiệp.'], ['Kolegu nelze odebrat', 'The colleague cannot be removed', 'Không thể xóa đồng nghiệp'],
    ['Ve firmě musí zůstat alespoň jeden správce. Nejdřív určete správcem jiného kolegu.', 'At least one administrator must remain in the company. First make another colleague an administrator.', 'Công ty phải còn ít nhất một quản trị viên. Hãy chỉ định một đồng nghiệp khác làm quản trị viên trước.'],
    ['Odebrat kolegu?', 'Remove the colleague?', 'Xóa đồng nghiệp?'], ['Kolega je odebraný.', 'The colleague has been removed.', 'Đã xóa đồng nghiệp.'],
    ['Provozovny, pro které smí nakupovat', 'Sites they can buy for', 'Các cơ sở được phép mua hàng'], ['Jen vybrané provozovny', 'Selected sites only', 'Chỉ các cơ sở đã chọn'],
    ['Zatím nemáte žádnou provozovnu.', 'You have no sites yet.', 'Bạn chưa có cơ sở nào.'],
    /* shop */
    ['Hledejte produkt, kategorii nebo značku', 'Search for a product, category or brand', 'Tìm sản phẩm, danh mục hoặc thương hiệu'],
    ['Hledat', 'Search', 'Tìm kiếm'], ['Hlasové vyhledávání', 'Voice search', 'Tìm kiếm bằng giọng nói'],
    ['Hlasové vyhledávání není součástí prototypu.', 'Voice search is not included in the prototype.', 'Tìm kiếm bằng giọng nói không có trong bản mẫu.'],
    ['Hledaný výraz:', 'Search term:', 'Từ khóa:'],
    ['Výsledky hledání', 'Search results', 'Kết quả tìm kiếm'], ['Zrušit hledání', 'Clear search', 'Xóa tìm kiếm'],
    ['Pro hledaný výraz jsme nic nenašli', 'We found nothing for your search', 'Không tìm thấy kết quả cho từ khóa của bạn'],
    ['Zkontrolujte překlepy nebo zkuste jiné slovo.', 'Check for typos or try another word.', 'Hãy kiểm tra lỗi chính tả hoặc thử từ khác.'],
    ['Čerstvé, chlazené', 'Fresh, chilled', 'Tươi, đông lạnh nhẹ'], ['Ovoce', 'Fruit', 'Trái cây'],
    ['Banány a exotické', 'Bananas and exotic', 'Chuối và trái cây nhiệt đới'], ['Citrusy', 'Citrus', 'Cam quýt'], ['Hrozny', 'Grapes', 'Nho'], ['Jablka', 'Apples', 'Táo'],
    ['Jahody a bobuloviny', 'Strawberries and berries', 'Dâu tây và quả mọng'], ['Hrušky', 'Pears', 'Lê'], ['Peckoviny', 'Stone fruit', 'Trái cây có hạt'], ['Melouny', 'Melons', 'Dưa'],
    ['Hrozny červené, bezsemenné', 'Red grapes, seedless', 'Nho đỏ không hạt'], ['Jablko Gala, 1 ks', 'Gala apple, 1 pc', 'Táo Gala, 1 quả'],
    ['Meloun Galia, 1 ks', 'Galia melon, 1 pc', 'Dưa Galia, 1 quả'], ['Blumy modré, vanička', 'Blue plums, punnet', 'Mận xanh, khay'],
    ['Mandarinky, síťka', 'Mandarins, net bag', 'Quýt, túi lưới'], ['Meruňky vanička 500g', 'Apricots punnet 500 g', 'Mơ khay 500 g'],
    ['Avokádo Hass "Ready to Eat" velké, 1 ks', 'Hass avocado "Ready to Eat" large, 1 pc', 'Bơ Hass "Ready to Eat" cỡ lớn, 1 quả'],
    ['Mango "Ready to Eat" 1 ks', 'Mango "Ready to Eat" 1 pc', 'Xoài "Ready to Eat" 1 quả'],
    ['Hrozny tmavé extra sladké, vanička', 'Dark grapes extra sweet, punnet', 'Nho đen siêu ngọt, khay'], ['Jablka červená balená', 'Red apples, packed', 'Táo đỏ đóng gói'],
    ['Švestky, vanička', 'Plums, punnet', 'Mận, khay'], ['BIO Kokos "Drink&Eat"', 'Organic coconut "Drink&Eat"', 'Dừa hữu cơ "Drink&Eat"'],
    ['Pomeranč, 1 ks', 'Orange, 1 pc', 'Cam, 1 quả'], ['Metro Chef Limeta, 1 ks', 'Metro Chef Lime, 1 pc', 'Chanh xanh Metro Chef, 1 quả'],
    ['Avokádo Hass "Ready to Eat", 2 ks', 'Hass avocado "Ready to Eat", 2 pcs', 'Bơ Hass "Ready to Eat", 2 quả'],
    ['Borůvky kanadské, vanička', 'Canadian blueberries, punnet', 'Việt quất Canada, khay'], ['Meruňky, vanička', 'Apricots, punnet', 'Mơ, khay'],
    ['Hrozny bílé, bezsemenné', 'White grapes, seedless', 'Nho trắng không hạt'], ['Kiwi "Ready to Eat", tácek', 'Kiwi "Ready to Eat", tray', 'Kiwi "Ready to Eat", khay'],
    ['Granátové jablko, vyloupané', 'Pomegranate, peeled', 'Lựu, đã tách hạt'], ['Citrony, síť', 'Lemons, net', 'Chanh vàng, túi lưới'],
    ['Přidat', 'Add', 'Thêm'], ['Ubrat', 'Remove one', 'Bớt'], ['Vyprázdnit košík', 'Empty the cart', 'Làm trống giỏ hàng'],
    ['Celkem bez DPH', 'Total excl. VAT', 'Tổng chưa VAT'], ['Celkem včetně DPH', 'Total incl. VAT', 'Tổng đã gồm VAT'],
    ['Košík je vyprázdněný.', 'The cart has been emptied.', 'Đã làm trống giỏ hàng.'], ['Nejdřív vyberte aktivní provozovnu.', 'First select an active site.', 'Hãy chọn một cơ sở đang hoạt động trước.'],
    ['S rolí Prohlížející nemůžete nakupovat.', 'You can’t buy with the Viewer role.', 'Với vai trò Người xem, bạn không thể mua hàng.'],
    ['Filtry', 'Filters', 'Bộ lọc'], ['Dostupné dnes', 'Available today', 'Có sẵn hôm nay'], ['Akce', 'Offers', 'Khuyến mãi'], ['Multikup', 'Multibuy', 'Mua nhiều giá tốt'],
    ['Doporučené', 'Recommended', 'Đề xuất'], ['Cena vzestupně', 'Price: low to high', 'Giá: thấp đến cao'], ['Cena sestupně', 'Price: high to low', 'Giá: cao đến thấp'], ['Název', 'Name', 'Tên'],
    ['Řazení', 'Sorting', 'Sắp xếp'], ['Zobrazení', 'View', 'Hiển thị'], ['Všechno najednou', 'Show all at once', 'Hiển thị tất cả'],
    ['Nic jsme nenašli', 'We found nothing', 'Không tìm thấy gì'], ['Zkuste zrušit některý z filtrů.', 'Try removing one of the filters.', 'Hãy thử bỏ một trong các bộ lọc.'], ['Zrušit filtry', 'Clear filters', 'Xóa bộ lọc'],
    ['Týdenní nákup', 'Weekly shopping', 'Mua sắm hằng tuần'], ['Víkendové menu', 'Weekend menu', 'Thực đơn cuối tuần'],
    ['Vytvořit seznam', 'Create a list', 'Tạo danh sách'], ['Vytvořit', 'Create', 'Tạo'], ['Název seznamu', 'List name', 'Tên danh sách'], ['např. Měsíční objednávka', 'e.g. Monthly order', 'ví dụ: Đơn hàng hằng tháng'],
    ['Zadejte název seznamu.', 'Enter the list name.', 'Nhập tên danh sách.'], ['Seznam je vytvořený.', 'The list has been created.', 'Đã tạo danh sách.'],
    ['Seznam je prázdný', 'The list is empty', 'Danh sách trống'], ['Zatím nemáte žádný nákupní seznam', 'You have no shopping lists yet', 'Bạn chưa có danh sách mua sắm nào'],
    ['Seznam vám ušetří čas při opakovaných objednávkách. Všechny položky pak vložíte do košíku jedním kliknutím.', 'A list saves you time on repeat orders. You can then add all items to the cart with one click.', 'Danh sách giúp bạn tiết kiệm thời gian khi đặt hàng lặp lại. Bạn có thể thêm tất cả mặt hàng vào giỏ chỉ với một lần bấm.'],
    ['Přidat vše do košíku', 'Add all to cart', 'Thêm tất cả vào giỏ'], ['Položky ze seznamu jsou v košíku.', 'The items from the list are in the cart.', 'Các mặt hàng trong danh sách đã được thêm vào giỏ.'],
    ['Odebrat seznam?', 'Remove the list?', 'Xóa danh sách?'], ['Seznam zmizí. Produkty v obchodě zůstanou beze změny.', 'The list will disappear. Products in the shop stay unchanged.', 'Danh sách sẽ biến mất. Sản phẩm trong cửa hàng không thay đổi.'], ['Seznam je odebraný.', 'The list has been removed.', 'Đã xóa danh sách.']
  ].forEach(r => { D[r[0]] = [r[1], r[2]]; });

  const lookup = (k, l) => (D[k] ? D[k][IDX[l]] : null);
  const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const unit = { en: { ks: 'pc', ksP: 'pcs', cca: 'approx.', from: 'from', per: 'for', incl: 'incl. VAT' }, vi: { ks: 'cái', ksP: 'cái', cca: 'khoảng', from: 'từ', per: 'cho', incl: 'đã gồm VAT' } };

  /* patterns for strings that contain names, numbers or other dynamic parts */
  const PATTERNS = [
    [/^Pozvánka byla odeslána na (.+)\.$/, (l, m) => ({ en: `The invitation was sent to ${m[1]}.`, vi: `Đã gửi lời mời tới ${m[1]}.` }[l])],
    [/^Pozvánka byla odeslána znovu na (.+)\.$/, (l, m) => ({ en: `The invitation was sent again to ${m[1]}.`, vi: `Đã gửi lại lời mời tới ${m[1]}.` }[l])],
    [/^Použijte firemní e-mail \((.+)\)\.$/, (l, m) => ({ en: `Use a company e-mail (${m[1]}).`, vi: `Hãy dùng e-mail công ty (${m[1]}).` }[l])],
    [/^(.+) ztratí přístup do firemního účtu\. Jeho objednávky zůstanou zachované\.$/, (l, m) => ({ en: `${m[1]} will lose access to the company account. Their orders will be kept.`, vi: `${m[1]} sẽ mất quyền truy cập tài khoản công ty. Các đơn hàng của họ vẫn được giữ lại.` }[l])],
    [/^(.+) zmizí z nabídky doručení a kolegům se odebere přístup\.$/, (l, m) => ({ en: `${m[1]} will disappear from the delivery options and colleagues will lose access to it.`, vi: `${m[1]} sẽ biến mất khỏi danh sách giao hàng và đồng nghiệp sẽ mất quyền truy cập.` }[l])],
    [/^Povolené domény: (.+)\. Změníte je ve Firemních informacích\.$/, (l, m) => ({ en: `Allowed domains: ${m[1]}. You can change them in Company information.`, vi: `Tên miền được phép: ${m[1]}. Bạn có thể thay đổi trong Thông tin công ty.` }[l])],
    [/^Otevřít Firemní informace$/, (l) => ({ en: 'Open Company information', vi: 'Mở Thông tin công ty' }[l])],
    [/^Úhrada objednávky (.+)$/, (l, m) => ({ en: `Payment of order ${m[1]}`, vi: `Thanh toán đơn hàng ${m[1]}` }[l])],
    [/^IČ: (.+)$/, (l, m) => ({ en: `Company ID: ${m[1]}`, vi: `Mã số công ty (IČ): ${m[1]}` }[l])],
    [/^IČ (.+)$/, (l, m) => ({ en: `Company ID ${m[1]}`, vi: `Mã số công ty (IČ) ${m[1]}` }[l])],
    [/^DIČ: (.+)$/, (l, m) => ({ en: `VAT ID: ${m[1]}`, vi: `Mã số thuế (DIČ): ${m[1]}` }[l])],
    [/^Firemní účet: (.+)$/, (l, m) => ({ en: `Company account: ${m[1]}`, vi: `Tài khoản công ty: ${m[1]}` }[l])],
    [/^Kontakt: (.+)$/, (l, m) => ({ en: `Contact: ${m[1]}`, vi: `Liên hệ: ${m[1]}` }[l])],
    [/^Čas doručení: (.+), (\d+:\d+–\d+:\d+)$/, (l, m) => ({ en: 'Delivery time: ', vi: 'Thời gian giao hàng: ' }[l]) + m[1].split(', ').map(d => (D[d] ? D[d][IDX[l]] : d)).join(', ') + ', ' + m[2]],
    [/^(\d+) (produkt|produkty|produktů)$/, (l, m) => ({ en: `${m[1]} ${m[1] === '1' ? 'product' : 'products'}`, vi: `${m[1]} sản phẩm` }[l])],
    [/^(\d+) (položka|položky|položek)$/, (l, m) => ({ en: `${m[1]} ${m[1] === '1' ? 'item' : 'items'}`, vi: `${m[1]} mục` }[l])],
    [/^od (\d+) ks$/, (l, m) => ({ en: `from ${m[1]} pcs`, vi: `từ ${m[1]} cái` }[l])],
    [/^(\d+) ks$/, (l, m) => ({ en: `${m[1]} ${m[1] === '1' ? 'pc' : 'pcs'}`, vi: `${m[1]} cái` }[l])],
    [/^cca (.+)$/, (l, m) => `${unit[l].cca} ${m[1]}`],
    [/^(.+) Kč za 1 ks$/, (l, m) => ({ en: `${m[1]} Kč for 1 pc`, vi: `${m[1]} Kč cho 1 cái` }[l])],
    [/^(.+) Kč\/ks$/, (l, m) => ({ en: `${m[1]} Kč/pc`, vi: `${m[1]} Kč/cái` }[l])],
    [/^(.+) včetně DPH$/, (l, m) => `${m[1]} ${unit[l].incl}`],
    [/^Přidat do košíku: (.+)$/, (l, m) => ({ en: `Add to cart: ${tr(m[1], l)}`, vi: `Thêm vào giỏ: ${tr(m[1], l)}` }[l])],
    [/^Hledaný výraz: (.+)$/, (l, m) => ({ en: `Search term: ${m[1]}`, vi: `Từ khóa: ${m[1]}` }[l])],
    [/^Zobrazit košík \((\d+)\)$/, (l, m) => ({ en: `View cart (${m[1]})`, vi: `Xem giỏ hàng (${m[1]})` }[l])],
    [/^Upravit: (.+)$/, (l, m) => ({ en: `Edit: ${tr(m[1], l)}`, vi: `Sửa: ${tr(m[1], l)}` }[l])],
    [/^Platí do (.+)$/, (l, m) => ({ en: `Valid until ${m[1]}`, vi: `Có hiệu lực đến ${m[1]}` }[l])],
    [/^(\d+)× (.+)$/, (l, m) => `${m[1]}× ${tr(m[2], l)}`]
  ];

  function tr(s, l) {
    if (l === 'cs' || !s) return s;
    const k = s.trim();
    if (!k) return s;
    const lead = s.slice(0, s.indexOf(k)), trail = s.slice(s.indexOf(k) + k.length);
    let out = lookup(k, l);
    if (out == null && k.includes(' · ')) out = k.split(' · ').map(p => tr(p, l)).join(' · ');
    if (out == null) {
      for (const [re, fn] of PATTERNS) { const m = k.match(re); if (m) { out = fn(l, m); break; } }
    }
    return out == null ? s : lead + out + trail;
  }

  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'data-label'];
  function apply(root) {
    if (lang === 'cs' || !root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement && n.parentElement.closest('[data-no-i18n],script,style')) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => { const v = tr(n.nodeValue, lang); if (v !== n.nodeValue) n.nodeValue = v; });
    root.querySelectorAll('*').forEach(el => {
      if (el.closest('[data-no-i18n]')) return;
      ATTRS.forEach(a => { if (el.hasAttribute(a)) { const v = el.getAttribute(a), t = tr(v, lang); if (t !== v) el.setAttribute(a, t); } });
    });
  }

  return {
    get lang() { return lang; },
    set(l) { lang = IDX[l] != null ? l : 'cs'; try { localStorage.setItem('sc-lang', lang); } catch (e) {} document.documentElement.lang = lang; },
    t: s => tr(s, lang), apply
  };
})();
