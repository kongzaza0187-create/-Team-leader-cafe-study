/**
 * Study Café 24/7 - Multi-Language Localization System
 * Authentic Native Speaker Terminology for:
 * 1. ภาษาไทย (Thai - Default)
 * 2. English (US/UK)
 * 3. 日本語 (Japanese)
 * 4. Português (Portuguese)
 * 5. 中文 (Simplified Chinese)
 */

import { AppLanguage, LanguageOption } from '../types';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ภาษาไทย',
    flag: 'TH',
    greeting: 'ยินดีต้อนรับสู่ Study Café 24/7',
    welcomeSub: 'พื้นที่ทำงาน Co-Working Sanctuary และกาแฟสเปเชียลตี้ตลอด 24 ชั่วโมง',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: 'EN',
    greeting: 'Welcome to Study Café 24/7',
    welcomeSub: 'Co-Working Sanctuary & Artisanal Coffee available 24/7',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: 'JA',
    greeting: 'Study Café 24/7 へようこそ',
    welcomeSub: '24時間利用可能なコワーキング・サンクチュアリ＆スペシャルティコーヒー',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: 'PT',
    greeting: 'Bem-vindo ao Study Café 24/7',
    welcomeSub: 'Santuário de Co-Working e Cafés Especiais aberto 24 horas por dia',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: 'ZH',
    greeting: '欢迎来到 Study Café 24/7',
    welcomeSub: '24小时联合办公圣地与精品手冲咖啡',
  },
];

export interface TranslationDictionary {
  appName: string;
  open24Hours: string;
  selectLanguage: string;
  selectLanguagePrompt: string;
  languageLockNotice: string;
  enterAppButton: string;
  topNav: {
    tables: string;
    menu: string;
    session: string;
    dashboard: string;
    cart: string;
    activeTable: string;
    pin: string;
    noActiveTable: string;
  };
  tables: {
    heroTitle: string;
    heroSubtitle: string;
    availableBadge: string;
    allZones: string;
    tableAvailable: string;
    tableOccupied: string;
    yourTable: string;
    seats: string;
    sockets: string;
    fastCharge: string;
    ergonomic: string;
    checkInConfirmTitle: string;
    checkInConfirmSubtitle: string;
    cancel: string;
    confirmCheckIn: string;
    checkInSuccessTitle: string;
    checkInSuccessDesc: string;
    secretPinLabel: string;
    goToMenu: string;
    close: string;
    alreadyHasTable: string;
  };
  menu: {
    bannerTitle: string;
    bannerSub: string;
    tableWarning: string;
    selectTableButton: string;
    orderingFor: string;
    all: string;
    coffee: string;
    tea: string;
    booster: string;
    bakery: string;
    bites: string;
    customizationTitle: string;
    cupSize: string;
    small: string;
    large: string;
    temperature: string;
    iced: string;
    hot: string;
    sweetness: string;
    milk: string;
    wholeMilk: string;
    oatMilk: string;
    almondMilk: string;
    extraShot: string;
    addToCart: string;
  };
  cart: {
    title: string;
    emptyCart: string;
    emptyCartSub: string;
    clearCart: string;
    subtotal: string;
    vat: string;
    serviceCharge: string;
    netTotal: string;
    proceedToPayment: string;
    needTableNotice: string;
  };
  payment: {
    modalTitle: string;
    qrPrompt: string;
    scanToPay: string;
    amountToPay: string;
    uploadSlip: string;
    slipVerified: string;
    verifying: string;
    verifyAndRelease: string;
    successThankYou: string;
    tableReleasedNotice: string;
    reviewPrompt: string;
    submitReview: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    selectPeriod: string;
    daily: string;
    weekly: string;
    monthly: string;
    annual: string;
    totalRevenue: string;
    netProfit: string;
    unitsSold: string;
    totalOrders: string;
    chartTitle: string;
    revenueLegend: string;
    netProfitLegend: string;
    zeroDataNotice: string;
    auditLedger: string;
    verifiedRecords: string;
    timeframe: string;
    ordersCount: string;
    unitLabel: string;
    avgOrderValue: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  th: {
    appName: 'Study Café 24/7',
    open24Hours: 'เปิดบริการ 24 ชม.',
    selectLanguage: 'เลือกภาษา / Language',
    selectLanguagePrompt: 'กรุณาเลือกภาษาสำหรับการใช้งานในเซสชันนี้',
    languageLockNotice: 'เมื่อเลือกภาษาแล้ว จะถูกล็อคไว้ตลอดการใช้งานจนกว่าจะออกจากระบบหรือเข้าสู่แอปใหม่',
    enterAppButton: 'เข้าสู่แอปพลิเคชัน',
    topNav: {
      tables: 'โต๊ะทำงาน',
      menu: 'สั่งเครื่องดื่ม',
      session: 'เซสชัน',
      dashboard: 'แดชบอร์ด',
      cart: 'ตะกร้า',
      activeTable: 'โต๊ะที่ใช้งาน',
      pin: 'PIN',
      noActiveTable: 'ยังไม่เลือกโต๊ะ',
    },
    tables: {
      heroTitle: 'แผนผังโต๊ะทำงาน Study Café 24/7',
      heroSubtitle: 'แตะเลือกโต๊ะว่างเพื่อรับรหัสผ่าน PIN 6 หลักและเริ่มสั่งเครื่องดื่ม',
      availableBadge: 'ว่าง',
      allZones: 'ทุกโซน',
      tableAvailable: 'ว่างพร้อมใช้',
      tableOccupied: 'มีผู้ใช้งาน',
      yourTable: 'โต๊ะของคุณ',
      seats: 'ที่นั่ง',
      sockets: 'ปลั๊กไฟ',
      fastCharge: 'Type-C 100W',
      ergonomic: 'เก้าอี้ Ergonomic',
      checkInConfirmTitle: 'ยืนยันการเข้าใช้งานโต๊ะ',
      checkInConfirmSubtitle: 'ระบบจะออกรหัสลับเซสชันและผูกกับคำสั่งซื้อของคุณ',
      cancel: 'ยกเลิก',
      confirmCheckIn: 'ยืนยันเข้าใช้งาน',
      checkInSuccessTitle: 'เช็คอินโต๊ะสำเร็จ!',
      checkInSuccessDesc: 'ระบบออกรหัสลับเฉพาะสำหรับโต๊ะของคุณเรียบร้อยแล้ว',
      secretPinLabel: 'รหัสลับประจำโต๊ะ (PIN)',
      goToMenu: 'ไปสั่งเครื่องดื่ม & ขนม',
      close: 'ปิดหน้าต่าง',
      alreadyHasTable: 'คุณมีโต๊ะที่กำลังใช้งานอยู่แล้ว กรุณาชำระเงินก่อนจองเพิ่ม',
    },
    menu: {
      bannerTitle: 'Study Café 24/7 Specialty Brews',
      bannerSub: 'สั่งตรงถึงโต๊ะทำงานของคุณ • คำนวณบิลเรียลไทม์',
      tableWarning: 'กรุณาเลือกโต๊ะก่อนสั่งเพื่อรับรหัสลับ 6 หลัก',
      selectTableButton: 'ไปเลือกโต๊ะ',
      orderingFor: 'สั่งสำหรับโต๊ะ',
      all: 'ทั้งหมด',
      coffee: 'กาแฟสเปเชียลตี้',
      tea: 'ชาพรีเมียม',
      booster: 'เครื่องดื่มบำรุงสมอง',
      bakery: 'เบเกอรี่อบสด',
      bites: 'ของว่างรองท้อง',
      customizationTitle: 'ปรับแต่งเมนูของคุณ',
      cupSize: 'ขนาดแก้ว',
      small: 'แก้วเล็ก (Standard)',
      large: 'แก้วใหญ่ (Grande)',
      temperature: 'อุณหภูมิ',
      iced: 'เย็น',
      hot: 'ร้อน',
      sweetness: 'ระดับความหวาน',
      milk: 'ประเภทนม',
      wholeMilk: 'นมสดพรีเมียม',
      oatMilk: 'นมโอ๊ต (Oat Milk)',
      almondMilk: 'นมอัลมอนด์',
      extraShot: 'เพิ่มเอสเพรสโซช็อต (+฿15)',
      addToCart: 'เพิ่มลงในตะกร้า',
    },
    cart: {
      title: 'ตะกร้าสินค้า',
      emptyCart: 'ไม่มีสินค้าในตะกร้า',
      emptyCartSub: 'เลือกกาแฟหรือของว่างจากเมนูด้านบนเพื่อเริ่มออเดอร์',
      clearCart: 'ล้างตะกร้า',
      subtotal: 'ค่าสินค้า (Subtotal)',
      vat: 'ภาษีมูลค่าเพิ่ม (VAT 7%)',
      serviceCharge: 'ค่าบริการ (Service 5%)',
      netTotal: 'ยอดชำระสุทธิ',
      proceedToPayment: 'ดำเนินการชำระเงิน (PromptPay)',
      needTableNotice: 'กรุณาเลือกโต๊ะทำงานก่อนชำระเงิน',
    },
    payment: {
      modalTitle: 'ชำระเงินผ่าน PromptPay QR',
      qrPrompt: 'สแกน QR Code ด้านล่างด้วยแอปธนาคารใดก็ได้',
      scanToPay: 'พร้อมเพย์ วอลเล็ท',
      amountToPay: 'ยอดเงินที่ต้องชำระ',
      uploadSlip: 'แนบหลักฐานสลิปโอนเงิน',
      slipVerified: 'ตรวจสอบสลิปถูกต้องเรียบร้อย',
      verifying: 'กำลังตรวจสอบสลิปกับระบบธนาคาร...',
      verifyAndRelease: 'ยืนยันและเช็คเอาท์',
      successThankYou: 'ชำระเงินสำเร็จ ขอบคุณที่ใช้บริการ Study Café 24/7',
      tableReleasedNotice: 'ระบบทำการคืนสถานะโต๊ะเป็นว่างและบันทึกใบเสร็จเรียบร้อย',
      reviewPrompt: 'ให้คะแนนความพึงพอใจการใช้บริการ',
      submitReview: 'ส่งความเห็นและคะแนน',
    },
    dashboard: {
      title: 'แดชบอร์ดผลการดำเนินงาน & ยอดขาย',
      subtitle: 'ดึงข้อมูลจริงจากตารางธุรกรรมและออเดอร์ • ระบบ Zero Mock Data',
      selectPeriod: 'เลือกช่วงเวลาการแสดงผล',
      daily: 'รายวัน (Daily)',
      weekly: 'รายสัปดาห์ (Weekly)',
      monthly: 'รายเดือน (Monthly)',
      annual: 'รายปี (Annual)',
      totalRevenue: 'รายได้รวม (Total Revenue)',
      netProfit: 'กำไรสุทธิ (Net Profit)',
      unitsSold: 'ยอดจำหน่ายรวม (Units Sold)',
      totalOrders: 'ออเดอร์ทั้งหมด',
      chartTitle: 'กราฟแท่งแสดงรายได้และยอดขาย',
      revenueLegend: 'รายได้ (฿)',
      netProfitLegend: 'กำไรสุทธิ (฿)',
      zeroDataNotice: 'ไม่มีรายการชำระเงินจริงในช่วงนี้ กราฟแสดงสถานะ 0.00 THB และ 0 Unit ตามความจริง',
      auditLedger: 'สมุดบัญชีคำสั่งซื้อจริง (Transactions Log)',
      verifiedRecords: 'รายการที่ยืนยันแล้ว',
      timeframe: 'ช่วงเวลา',
      ordersCount: 'บิล',
      unitLabel: 'Unit',
      avgOrderValue: 'เฉลี่ยต่อบิล',
    },
  },

  en: {
    appName: 'Study Café 24/7',
    open24Hours: 'Open 24/7',
    selectLanguage: 'Select Language',
    selectLanguagePrompt: 'Please choose your preferred language for this session',
    languageLockNotice: 'Language is locked for the duration of this session until you restart or return to the gateway.',
    enterAppButton: 'Enter Study Café 24/7',
    topNav: {
      tables: 'Tables',
      menu: 'Order Menu',
      session: 'Session',
      dashboard: 'Dashboard',
      cart: 'Cart',
      activeTable: 'Active Table',
      pin: 'PIN',
      noActiveTable: 'No Table',
    },
    tables: {
      heroTitle: 'Study Café 24/7 Workstation Map',
      heroSubtitle: 'Select any available desk to receive a 6-digit PIN and order refreshments',
      availableBadge: 'Available',
      allZones: 'All Zones',
      tableAvailable: 'Available',
      tableOccupied: 'Occupied',
      yourTable: 'Your Table',
      seats: 'Seats',
      sockets: 'Sockets',
      fastCharge: 'Type-C 100W',
      ergonomic: 'Ergonomic Chair',
      checkInConfirmTitle: 'Confirm Table Lease',
      checkInConfirmSubtitle: 'A cryptographic session and unique 6-digit PIN will be assigned',
      cancel: 'Cancel',
      confirmCheckIn: 'Confirm Check-in',
      checkInSuccessTitle: 'Check-in Successful!',
      checkInSuccessDesc: 'Your private session code has been generated.',
      secretPinLabel: 'Table PIN Code',
      goToMenu: 'Order Coffee & Snacks',
      close: 'Close',
      alreadyHasTable: 'You already have an active table. Please settle before taking another.',
    },
    menu: {
      bannerTitle: 'Study Café 24/7 Specialty Brews',
      bannerSub: 'Delivered directly to your workstation • Real-time bill calculations',
      tableWarning: 'Please check into a table first to receive your 6-digit PIN',
      selectTableButton: 'Select Table',
      orderingFor: 'Ordering for Table',
      all: 'All Items',
      coffee: 'Specialty Coffee',
      tea: 'Artisanal Tea',
      booster: 'Cognitive Boosters',
      bakery: 'Fresh Bakery',
      bites: 'Snacks & Bites',
      customizationTitle: 'Customize Your Order',
      cupSize: 'Cup Size',
      small: 'Standard (S)',
      large: 'Grande (L)',
      temperature: 'Temperature',
      iced: 'Iced',
      hot: 'Hot',
      sweetness: 'Sweetness Level',
      milk: 'Milk Option',
      wholeMilk: 'Fresh Whole Milk',
      oatMilk: 'Oat Milk (Barista Edition)',
      almondMilk: 'Almond Milk',
      extraShot: 'Extra Espresso Shot (+฿15)',
      addToCart: 'Add to Cart',
    },
    cart: {
      title: 'Order Cart',
      emptyCart: 'Your cart is empty',
      emptyCartSub: 'Explore our artisan coffees and snacks from the top menu to start ordering',
      clearCart: 'Clear Cart',
      subtotal: 'Subtotal',
      vat: 'VAT (7%)',
      serviceCharge: 'Service Charge (5%)',
      netTotal: 'Net Total',
      proceedToPayment: 'Proceed to Payment (PromptPay)',
      needTableNotice: 'Please select a desk before completing checkout',
    },
    payment: {
      modalTitle: 'PromptPay QR Checkout',
      qrPrompt: 'Scan the EMVCo QR code using any banking application',
      scanToPay: 'PromptPay e-Wallet',
      amountToPay: 'Total Amount Payable',
      uploadSlip: 'Attach Bank Transfer Slip',
      slipVerified: 'Bank Slip Verified Successfully',
      verifying: 'Verifying bank transaction proof...',
      verifyAndRelease: 'Confirm & Release Table',
      successThankYou: 'Payment Completed. Thank you for studying at Study Café 24/7',
      tableReleasedNotice: 'The table has been restored to AVAILABLE status and receipt archived.',
      reviewPrompt: 'Rate your sanctuary experience',
      submitReview: 'Submit Review',
    },
    dashboard: {
      title: 'Financial & Operational Analytics',
      subtitle: 'Strict real PostgreSQL transactions • Zero mock data fallback',
      selectPeriod: 'Select Time Horizon',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      annual: 'Annual',
      totalRevenue: 'Total Revenue',
      netProfit: 'Net Profit',
      unitsSold: 'Total Units Sold',
      totalOrders: 'Total Orders',
      chartTitle: 'Revenue & Sales Bar Chart',
      revenueLegend: 'Revenue (฿)',
      netProfitLegend: 'Net Profit (฿)',
      zeroDataNotice: 'No settled transactions in this period. The chart reflects exact 0.00 THB and 0 Unit.',
      auditLedger: 'Real Transaction Audit Ledger',
      verifiedRecords: 'Verified Records',
      timeframe: 'Period',
      ordersCount: 'orders',
      unitLabel: 'Unit',
      avgOrderValue: 'Avg Order Value',
    },
  },

  ja: {
    appName: 'Study Café 24/7',
    open24Hours: '24時間営業',
    selectLanguage: '言語を選択 / Language',
    selectLanguagePrompt: '本セッションで使用する言語を選択してください',
    languageLockNotice: '選択された言語は、再起動または初期画面に戻るまでセッション中維持されます。',
    enterAppButton: 'アプリを開始する',
    topNav: {
      tables: 'ワーク席',
      menu: 'ドリンク注文',
      session: 'セッション',
      dashboard: 'ダッシュボード',
      cart: 'カート',
      activeTable: 'ご利用中の席',
      pin: '暗証番号',
      noActiveTable: '席未選択',
    },
    tables: {
      heroTitle: 'Study Café 24/7 ワークスペース席配置',
      heroSubtitle: '空いているデスクを選択して6桁のPINコードを取得し、ご注文へお進みください',
      availableBadge: '空席',
      allZones: '全エリア',
      tableAvailable: '利用可能',
      tableOccupied: '利用中',
      yourTable: 'ご利用席',
      seats: '定員',
      sockets: '電源コンセント',
      fastCharge: 'Type-C 100W 急速充電',
      ergonomic: '人間工学チェア',
      checkInConfirmTitle: 'デスク利用確認',
      checkInConfirmSubtitle: '暗号化された利用セッションと6桁のPINコードが発行されます',
      cancel: 'キャンセル',
      confirmCheckIn: '利用を開始する',
      checkInSuccessTitle: 'チェックインが完了しました',
      checkInSuccessDesc: 'あなた専用の暗証コードが発行されました。',
      secretPinLabel: 'デスク暗証番号 (PIN)',
      goToMenu: 'ドリンク・軽食の注文へ',
      close: '閉じる',
      alreadyHasTable: '既にご利用中の席があります。追加予約の前にご精算ください。',
    },
    menu: {
      bannerTitle: 'Study Café 24/7 スペシャルティドリンク',
      bannerSub: 'ご着席中のデスクまで直接お届け • リアルタイム自動計算',
      tableWarning: 'ご注文の前にデスクを選択して6桁のPINコードを取得してください',
      selectTableButton: '席を選択する',
      orderingFor: '注文先デスク',
      all: 'すべて',
      coffee: 'スペシャルティコーヒー',
      tea: 'プレミアムティー',
      booster: '集中サポート飲料',
      bakery: '焼きたてベーカリー',
      bites: '軽食・スナック',
      customizationTitle: 'お好みのカスタマイズ',
      cupSize: 'サイズ',
      small: 'レギュラー (S)',
      large: 'グランデ (L)',
      temperature: '温度',
      iced: 'アイス',
      hot: 'ホット',
      sweetness: '甘さの選択',
      milk: 'ミルクの種類',
      wholeMilk: '新鮮な牛乳',
      oatMilk: 'オーツミルク',
      almondMilk: 'アーモンドミルク',
      extraShot: 'エスプレッソショット追加 (+฿15)',
      addToCart: 'カートに追加',
    },
    cart: {
      title: 'ご注文カート',
      emptyCart: 'カートは空です',
      emptyCartSub: '上のメニューからお好みのコーヒーや軽食をお選びください',
      clearCart: 'カートを空にする',
      subtotal: '小計',
      vat: '消費税 (VAT 7%)',
      serviceCharge: 'サービス料 (5%)',
      netTotal: 'お支払い合計',
      proceedToPayment: 'お支払いへ進む (PromptPay)',
      needTableNotice: 'お支払いの前にデスクを選択してください',
    },
    payment: {
      modalTitle: 'PromptPay QR 決済',
      qrPrompt: '銀行アプリで下記QRコードを読み取ってお支払いください',
      scanToPay: 'PromptPay ウォレット',
      amountToPay: 'お支払い金額',
      uploadSlip: '振込明細スリップの添付',
      slipVerified: 'スリップ検証が完了しました',
      verifying: '銀行システムと照合確認中...',
      verifyAndRelease: '確認して退席する',
      successThankYou: '決済が完了しました。Study Café 24/7 のご利用ありがとうございます。',
      tableReleasedNotice: '席は利用可能な状態に戻り、領収情報が記録されました。',
      reviewPrompt: '本日のご利用体験を評価してください',
      submitReview: 'レビューを送信',
    },
    dashboard: {
      title: '売上・財務分析ダッシュボード',
      subtitle: 'PostgreSQL 実トランザクション連動 • モックデータ完全排除',
      selectPeriod: '分析期間を選択',
      daily: '日次 (Daily)',
      weekly: '週次 (Weekly)',
      monthly: '月次 (Monthly)',
      annual: '年次 (Annual)',
      totalRevenue: '総売上高 (Total Revenue)',
      netProfit: '純利益 (Net Profit)',
      unitsSold: '総販売個数 (Units Sold)',
      totalOrders: '総注文数',
      chartTitle: '売上実績 棒グラフ',
      revenueLegend: '売上 (฿)',
      netProfitLegend: '純利益 (฿)',
      zeroDataNotice: 'この期間の決済履歴はありません。実績値 0.00 THB および 0 Unit を正確に表示しています。',
      auditLedger: '確定トランザクション台帳',
      verifiedRecords: '件の確定記録',
      timeframe: '期間',
      ordersCount: '件',
      unitLabel: 'Unit',
      avgOrderValue: '平均注文単価',
    },
  },

  pt: {
    appName: 'Study Café 24/7',
    open24Hours: 'Aberto 24 Horas',
    selectLanguage: 'Selecionar Idioma',
    selectLanguagePrompt: 'Por favor, selecione seu idioma preferido para esta sessão',
    languageLockNotice: 'O idioma permanecerá bloqueado durante toda a sessão até que o aplicativo seja reiniciado.',
    enterAppButton: 'Entrar no Study Café 24/7',
    topNav: {
      tables: 'Mesas',
      menu: 'Cardápio',
      session: 'Sessão',
      dashboard: 'Painel',
      cart: 'Carrinho',
      activeTable: 'Mesa Ativa',
      pin: 'PIN',
      noActiveTable: 'Sem Mesa',
    },
    tables: {
      heroTitle: 'Mapa de Estações de Trabalho Study Café 24/7',
      heroSubtitle: 'Selecione uma mesa disponível para receber o código PIN de 6 dígitos e fazer pedidos',
      availableBadge: 'Disponível',
      allZones: 'Todas as Zonas',
      tableAvailable: 'Disponível',
      tableOccupied: 'Ocupada',
      yourTable: 'Sua Mesa',
      seats: 'Lugares',
      sockets: 'Tomadas',
      fastCharge: 'Type-C 100W',
      ergonomic: 'Cadeira Ergonômica',
      checkInConfirmTitle: 'Confirmar Ocupação da Mesa',
      checkInConfirmSubtitle: 'Um PIN confidencial de 6 dígitos e sessão criptografada serão gerados',
      cancel: 'Cancelar',
      confirmCheckIn: 'Confirmar Check-in',
      checkInSuccessTitle: 'Check-in Realizado com Sucesso!',
      checkInSuccessDesc: 'O código PIN exclusivo da sua mesa foi emitido.',
      secretPinLabel: 'Código PIN da Mesa',
      goToMenu: 'Pedir Cafés e Lanches',
      close: 'Fechar',
      alreadyHasTable: 'Você já possui uma mesa ativa. Por favor, finalize a conta antes de reservar outra.',
    },
    menu: {
      bannerTitle: 'Study Café 24/7 Specialty Brews',
      bannerSub: 'Servido diretamente em sua mesa • Cálculo de conta em tempo real',
      tableWarning: 'Faça check-in em uma mesa para receber seu PIN antes de pedir',
      selectTableButton: 'Escolher Mesa',
      orderingFor: 'Pedido para Mesa',
      all: 'Todos',
      coffee: 'Cafés Especiais',
      tea: 'Chás Artesanais',
      booster: 'Energéticos Cognitivos',
      bakery: 'Padaria Fresca',
      bites: 'Petiscos e Lanches',
      customizationTitle: 'Personalizar Pedido',
      cupSize: 'Tamanho da Xícara',
      small: 'Padrão (S)',
      large: 'Grande (L)',
      temperature: 'Temperatura',
      iced: 'Gelado',
      hot: 'Quente',
      sweetness: 'Nível de Doçura',
      milk: 'Opção de Leite',
      wholeMilk: 'Leite Integral Fresco',
      oatMilk: 'Leite de Aveia',
      almondMilk: 'Leite de Amêndoas',
      extraShot: 'Dose Extra de Espresso (+฿15)',
      addToCart: 'Adicionar ao Carrinho',
    },
    cart: {
      title: 'Carrinho de Pedidos',
      emptyCart: 'Seu carrinho está vazio',
      emptyCartSub: 'Escolha cafés artesanais ou lanches no menu superior para começar',
      clearCart: 'Limpar Carrinho',
      subtotal: 'Subtotal',
      vat: 'IVA / Imposto (7%)',
      serviceCharge: 'Taxa de Serviço (5%)',
      netTotal: 'Total Líquido',
      proceedToPayment: 'Prosseguir para Pagamento (PromptPay)',
      needTableNotice: 'Por favor, selecione uma mesa antes de finalizar a compra',
    },
    payment: {
      modalTitle: 'Pagamento PromptPay QR',
      qrPrompt: 'Digitalize o código QR abaixo com seu aplicativo bancário',
      scanToPay: 'Carteira PromptPay',
      amountToPay: 'Valor Total a Pagar',
      uploadSlip: 'Anexar Comprovante de Transferência',
      slipVerified: 'Comprovante Verificado com Sucesso',
      verifying: 'Verificando comprovante no sistema bancário...',
      verifyAndRelease: 'Confirmar e Liberar Mesa',
      successThankYou: 'Pagamento Concluído. Obrigado por escolher o Study Café 24/7',
      tableReleasedNotice: 'A mesa foi redefinida para DISPONÍVEL e o recibo arquivado.',
      reviewPrompt: 'Avalie sua experiência de trabalho',
      submitReview: 'Enviar Avaliação',
    },
    dashboard: {
      title: 'Painel Financeiro e de Vendas',
      subtitle: 'Conexão direta com transações reais PostgreSQL • Zero dados simulados',
      selectPeriod: 'Selecionar Período de Análise',
      daily: 'Diário (Daily)',
      weekly: 'Semanal (Weekly)',
      monthly: 'Mensal (Monthly)',
      annual: 'Anual (Annual)',
      totalRevenue: 'Receita Total (Total Revenue)',
      netProfit: 'Lucro Líquido (Net Profit)',
      unitsSold: 'Unidades Vendidas (Units Sold)',
      totalOrders: 'Total de Pedidos',
      chartTitle: 'Gráfico de Barras de Receita e Vendas',
      revenueLegend: 'Receita (฿)',
      netProfitLegend: 'Lucro Líquido (฿)',
      zeroDataNotice: 'Nenhuma transação concluída neste período. O gráfico reflete exatamente 0.00 THB e 0 Unit.',
      auditLedger: 'Livro de Transações Reais',
      verifiedRecords: 'registros confirmados',
      timeframe: 'Período',
      ordersCount: 'pedidos',
      unitLabel: 'Unit',
      avgOrderValue: 'Ticket Médio',
    },
  },

  zh: {
    appName: 'Study Café 24/7',
    open24Hours: '24小时营业',
    selectLanguage: '选择语言 / Language',
    selectLanguagePrompt: '请选择您在此会话中使用的偏好语言',
    languageLockNotice: '选定语言后将在本次会话中锁定，退出登录或重新打开前无法更改。',
    enterAppButton: '进入 Study Café 24/7',
    topNav: {
      tables: '工位桌位',
      menu: '点单饮品',
      session: '会话详情',
      dashboard: '运营看板',
      cart: '购物车',
      activeTable: '当前工位',
      pin: 'PIN码',
      noActiveTable: '未选座',
    },
    tables: {
      heroTitle: 'Study Café 24/7 工位布局图',
      heroSubtitle: '轻触选择空闲工位以获取6位密码PIN码并开始点单',
      availableBadge: '空闲',
      allZones: '全部区域',
      tableAvailable: '空闲可用',
      tableOccupied: '使用中',
      yourTable: '您的工位',
      seats: '座位数',
      sockets: '电源插座',
      fastCharge: 'Type-C 100W 快充',
      ergonomic: '人体工学椅',
      checkInConfirmTitle: '确认入座该工位',
      checkInConfirmSubtitle: '系统将生成专属加密会话与6位验证PIN码',
      cancel: '取消',
      confirmCheckIn: '确认入座',
      checkInSuccessTitle: '入座签到成功！',
      checkInSuccessDesc: '系统已成功为您的工位签发专属PIN码。',
      secretPinLabel: '工位专属 PIN 码',
      goToMenu: '前往选购咖啡与茶点',
      close: '关闭',
      alreadyHasTable: '您当前已有正在使用的工位，请结账后再选择新工位。',
    },
    menu: {
      bannerTitle: 'Study Café 24/7 精品手冲与茶饮',
      bannerSub: '直接送达您的工位 • 账单实时精准核算',
      tableWarning: '点单前请先选择工位签到以获取6位PIN码',
      selectTableButton: '去选工位',
      orderingFor: '送至工位',
      all: '全部',
      coffee: '精品咖啡',
      tea: '原叶茗茶',
      booster: '思维提神饮',
      bakery: '现烤烘焙',
      bites: '能量小食',
      customizationTitle: '定制您的专属饮品',
      cupSize: '杯型',
      small: '标准杯 (S)',
      large: '大杯 (L)',
      temperature: '温度',
      iced: '冰饮',
      hot: '热饮',
      sweetness: '甜度选择',
      milk: '奶类选择',
      wholeMilk: '优质鲜牛奶',
      oatMilk: '咖啡师燕麦奶',
      almondMilk: '巴旦木杏仁奶',
      extraShot: '加一份浓缩咖啡 (+฿15)',
      addToCart: '加入购物车',
    },
    cart: {
      title: '订单购物车',
      emptyCart: '购物车空空如也',
      emptyCartSub: '从上方菜单挑选精选咖啡或点心开始点单',
      clearCart: '清空购物车',
      subtotal: '商品小计',
      vat: '增值税 (VAT 7%)',
      serviceCharge: '服务费 (5%)',
      netTotal: '应付总金额',
      proceedToPayment: '前往支付 (PromptPay)',
      needTableNotice: '结算前请先选定工位',
    },
    payment: {
      modalTitle: 'PromptPay QR 扫码支付',
      qrPrompt: '使用任意手机银行应用扫描下方二维码完成支付',
      scanToPay: 'PromptPay 电子钱包',
      amountToPay: '应付金额',
      uploadSlip: '上传银行转账电子凭证',
      slipVerified: '凭证核验通过',
      verifying: '正在校验银行电子转账凭证...',
      verifyAndRelease: '核验确认并释放工位',
      successThankYou: '支付完成，感谢您在 Study Café 24/7 学习与工作',
      tableReleasedNotice: '工位已恢复为“空闲”状态，电子收据已归档。',
      reviewPrompt: '为本次体验提供宝贵评分',
      submitReview: '提交评价',
    },
    dashboard: {
      title: '财务与销售运营看板',
      subtitle: '直连 PostgreSQL 真实数据库 • 严禁模拟虚假数据',
      selectPeriod: '选择统计时间跨度',
      daily: '每日看板 (Daily)',
      weekly: '每周看板 (Weekly)',
      monthly: '每月看板 (Monthly)',
      annual: '年度看板 (Annual)',
      totalRevenue: '总营业额 (Total Revenue)',
      netProfit: '净利润 (Net Profit)',
      unitsSold: '商品总销量 (Units Sold)',
      totalOrders: '总订单数',
      chartTitle: '营业额与销售柱状图',
      revenueLegend: '营业额 (฿)',
      netProfitLegend: '净利润 (฿)',
      zeroDataNotice: '此区间内无结算成功的真实交易。图表如实显示 0.00 THB 和 0 Unit。',
      auditLedger: '真实交易审计台账',
      verifiedRecords: '笔已核验凭证',
      timeframe: '统计区间',
      ordersCount: '笔',
      unitLabel: 'Unit',
      avgOrderValue: '笔均消费',
    },
  },
};
