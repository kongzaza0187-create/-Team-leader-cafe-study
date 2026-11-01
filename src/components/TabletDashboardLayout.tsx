/**
 * Lumina 24-Hour Study & Coffee Cafe Platform
 * Dedicated Tablet / iPad Desktop-Class Dashboard Architecture
 * Unified Black & Orange Theme (#0B0B0C, #121214, #1A1A1E, #FF6B00)
 * 
 * 2-Column Split Architecture:
 * - Left Column: Wide Floor Plan & Table Grid (3-4 cols), Menu Browser, Session Timeline, or Admin Telemetry
 * - Right Column: Live Workstation Companion, Real-Time Sticky Order Cart & Financial Calculations, and Live SSE Activity Feed
 * - Quiet Luxury Aesthetic with High-Performance React Transitions & Zero-Lag Architecture
 */

import React, { useState } from 'react';
import { 
  CafeTable, 
  TableSession, 
  TableActivityLog, 
  CartItem, 
  BillBreakdown, 
  PromptPayTransaction,
  ConcurrencyMetrics,
  RevenueAnalytics,
  MenuItem
} from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { CanvasIcon } from './CanvasIcon';
import { audioFeedbackService } from '../services/audioFeedbackService';
import { CanvasAnimatedCheckmark } from './CanvasAnimatedCheckmark';
import { WebGLAmbientBackground } from './WebGLAmbientBackground';
import { SessionTimelineScreen } from './SessionTimelineScreen';
import { ManagerDashboard } from './ManagerDashboard';
import { TableGridSystem } from './TableGridSystem';
import { APP_LOGO_BASE64 } from '../data/appLogoBase64';

export type TabletNavTab = 'tables' | 'menu' | 'session' | 'admin';

interface Props {
  tables: CafeTable[];
  activeSession: TableSession | null;
  cartItems: CartItem[];
  totals: BillBreakdown;
  activityLogs: TableActivityLog[];
  metrics: ConcurrencyMetrics;
  settledTransactions: PromptPayTransaction[];
  revenueAnalytics: RevenueAnalytics;
  onSelectAndOccupyTable: (tableId: string) => void;
  onAddToCart: (item: CartItem) => void;
  onUpdateCartQty: (cartItemId: string, delta: number) => void;
  onClearCart: () => void;
  onProceedToPayment: () => void;
  onTriggerFailover: () => void;
  onForceResetTable: (tableId: string) => void;
  orientation?: 'landscape' | 'portrait';
}

export const TabletDashboardLayout: React.FC<Props> = ({
  tables,
  activeSession,
  cartItems,
  totals,
  activityLogs,
  metrics,
  settledTransactions,
  revenueAnalytics,
  onSelectAndOccupyTable,
  onAddToCart,
  onUpdateCartQty,
  onClearCart,
  onProceedToPayment,
  onTriggerFailover,
  onForceResetTable,
  orientation,
}) => {
  const [activeTab, setActiveTab] = useState<TabletNavTab>('tables');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>('ALL');
  
  // Customization state for menu items
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'S' | 'L'>('S');
  const [temperature, setTemperature] = useState<'ICED' | 'HOT'>('ICED');
  const [sweetness, setSweetness] = useState<0 | 25 | 50 | 100>(50);
  const [milk, setMilk] = useState<'WHOLE' | 'OAT' | 'ALMOND'>('WHOLE');
  const [extraShot, setExtraShot] = useState<boolean>(false);
  
  // Check-in confirmation & popups
  const [confirmingTable, setConfirmingTable] = useState<CafeTable | null>(null);
  const [showCheckinSuccess, setShowCheckinSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Orientation & iPad Portrait Companion Drawer
  const [currentOrientation, setCurrentOrientation] = useState<'landscape' | 'portrait'>(() => {
    if (orientation) return orientation;
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    return 'landscape';
  });
  const [isPortraitCompanionOpen, setIsPortraitCompanionOpen] = useState<boolean>(false);

  React.useEffect(() => {
    if (orientation) {
      setCurrentOrientation(orientation);
    }
  }, [orientation]);

  React.useEffect(() => {
    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setCurrentOrientation(isPortrait ? 'portrait' : 'landscape');
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const zones = ['ALL', 'Silent Focus Zone', 'Collaborative Zone', 'Zen Garden View', 'Team Workshop Area', 'VIP Soundproof Pod'];
  const menuCategories = [
    { id: 'ALL', name: 'ทุกเมนู' },
    { id: 'coffee', name: 'กาแฟคั่วพิเศษ' },
    { id: 'tea', name: 'ชาเขียว & มัทฉะ' },
    { id: 'booster', name: 'เอนเนอร์จี้ บูสเตอร์' },
    { id: 'bakery', name: 'เบเกอรี่อบสด' },
    { id: 'bites', name: 'ของว่างทานเล่น' },
  ];

  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;
  const filteredTables = selectedZone === 'ALL' ? tables : tables.filter((t) => t.zone === selectedZone);
  const filteredMenuItems = selectedMenuCategory === 'ALL' ? MENU_ITEMS : MENU_ITEMS.filter((m) => m.categoryId === selectedMenuCategory);

  const handleTabChange = (tab: TabletNavTab) => {
    setActiveTab(tab);
    try { audioFeedbackService.playTactileClickSound(); } catch {}
  };

  const handleTableClick = (table: CafeTable) => {
    try { audioFeedbackService.playTactileClickSound(); } catch {}

    if (activeSession && activeSession.status === 'ACTIVE' && activeSession.tableId !== table.tableId) {
      setErrorMessage(`คุณกำลังใช้งานโต๊ะ ${activeSession.tableId} อยู่แล้ว กรุณา Checkout ก่อนเปลี่ยนโต๊ะ`);
      return;
    }

    if (table.status === 'OCCUPIED' && activeSession?.tableId !== table.tableId) {
      return;
    }

    setConfirmingTable(table);
  };

  const handleConfirmLease = () => {
    if (!confirmingTable) return;
    try {
      onSelectAndOccupyTable(confirmingTable.tableId);
      setConfirmingTable(null);
      setShowCheckinSuccess(true);
      try { audioFeedbackService.playSuccessChime(); } catch {}
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถจองโต๊ะได้');
    }
  };

  const handleOpenCustomizer = (item: MenuItem) => {
    setCustomizingItem(item);
    setSelectedSize('S');
    setTemperature('ICED');
    setSweetness(50);
    setMilk('WHOLE');
    setExtraShot(false);
    try { audioFeedbackService.playTactileClickSound(); } catch {}
  };

  const handleConfirmAddToCart = () => {
    if (!customizingItem) return;
    let unitPrice = selectedSize === 'L' && customizingItem.basePriceLarge 
      ? customizingItem.basePriceLarge 
      : customizingItem.basePriceSmall;
    if (milk !== 'WHOLE') unitPrice += 15;
    if (extraShot) unitPrice += 15;

    const cartItem: CartItem = {
      cartItemId: `cart_${Date.now()}`,
      menuItem: customizingItem,
      size: selectedSize,
      unitPrice,
      quantity: 1,
      customization: {
        temperature,
        sweetness,
        milk,
        extraShot,
      },
      itemSubtotal: unitPrice,
    };

    onAddToCart(cartItem);
    setCustomizingItem(null);
    try { audioFeedbackService.playSuccessChime(); } catch {}
  };

  const currentTable = tables.find((t) => t.tableId === activeSession?.tableId);

  // Companion Cards Component (Reusable in Landscape Column & Portrait Drawer)
  const renderCompanionCards = () => (
    <div className="flex flex-col space-y-4">
      {/* CARD 1: WORKSTATION COMPANION CARD */}
      <div className="p-4 rounded-3xl bg-[#141418] border border-[#282830] shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#222228] pb-2.5">
          <div className="flex items-center gap-2">
            <CanvasIcon name="table" size={16} color="#FF6B00" />
            <span className="text-xs font-extrabold text-white">โต๊ะทำงานของคุณ</span>
          </div>
          {activeSession ? (
            <span className="px-2 py-0.5 rounded-full bg-[#122419] text-[#34D399] text-[10px] font-mono font-bold border border-[#1E432E] flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              <span>ACTIVE</span>
            </span>
          ) : (
            <span className="text-[10px] text-stone-500 font-mono">NO ACTIVE TABLE</span>
          )}
        </div>

        {activeSession ? (
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-[#0B0B0C] border border-[#FF6B00]/40 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] text-stone-400 font-mono block">TABLE ID</span>
                <span className="text-2xl font-black text-[#FF8C33] font-mono">
                  {activeSession.tableId}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">{currentTable?.zone}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 font-mono block">SECRET CODE</span>
                <span className="text-2xl font-black text-[#34D399] font-mono tracking-wider">
                  {activeSession.secretCode}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#0B0B0C] border border-[#222228] text-[10px] text-stone-400 font-mono break-all">
              <span className="text-stone-300 font-semibold block mb-0.5">HMAC-SHA256 Token:</span>
              {(activeSession.hmacSignature || '').slice(0, 32)}...
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-stone-500 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0B0B0C] flex items-center justify-center mx-auto text-stone-600">
              <CanvasIcon name="table" size={20} color="#71717A" />
            </div>
            <p className="text-xs text-stone-400 font-medium">ยังไม่ได้เลือกโต๊ะทำงาน</p>
            <p className="text-[10px] text-stone-500 max-w-xs mx-auto">
              แตะเลือกโต๊ะทำงานที่ว่างเพื่อออกรหัสลับและสั่งออเดอร์
            </p>
          </div>
        )}
      </div>

      {/* CARD 2: REAL-TIME ORDER CART (STICKY ON TABLET!) */}
      <div className="p-4 rounded-3xl bg-[#141418] border border-[#282830] shadow-xl flex flex-col space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#222228] pb-2.5">
          <div className="flex items-center gap-2">
            <CanvasIcon name="cart" size={16} color="#FF6B00" />
            <span className="text-xs font-extrabold text-white">ตะกร้าสินค้า (Real-Time Cart)</span>
            <span className="px-2 py-0.2 rounded-full bg-[#222228] text-[#FF8C33] text-[10px] font-mono font-bold">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={() => {
                try { audioFeedbackService.playTactileClickSound(); } catch {}
                onClearCart();
              }}
              className="text-[10px] text-stone-500 hover:text-[#EF4444] transition-colors underline cursor-pointer"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="max-h-60 overflow-y-auto space-y-2.5 scrollbar-none pr-1">
          {cartItems.length === 0 ? (
            <div className="py-8 text-center text-stone-500 space-y-1.5">
              <p className="text-xs text-stone-400">ไม่มีสินค้าในตะกร้า</p>
              <p className="text-[10px] text-stone-500">เลือกเมนูกาแฟหรือของว่างเพื่อเพิ่มลงในตะกร้า</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="p-2.5 rounded-xl bg-[#0B0B0C] border border-[#222228] flex items-center gap-2.5"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#141418] flex-shrink-0">
                  <img
                    src={item.menuItem.imageBase64 || item.menuItem.imageUrl || ''}
                    alt={item.menuItem.nameTh}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-white truncate">{item.menuItem.nameTh}</span>
                    <span className="text-[9px] font-mono text-stone-400">({item.size})</span>
                  </div>
                  <span className="text-xs font-black text-[#FF6B00] font-mono block">
                    ฿{item.itemSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#141418] px-2 py-1 rounded-lg border border-[#222228]">
                  <button
                    onClick={() => {
                      try { audioFeedbackService.playTactileClickSound(); } catch {}
                      onUpdateCartQty(item.cartItemId, -1);
                    }}
                    className="w-4 h-4 rounded bg-[#222228] text-white flex items-center justify-center cursor-pointer active:scale-90"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold min-w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => {
                      try { audioFeedbackService.playTactileClickSound(); } catch {}
                      onUpdateCartQty(item.cartItemId, 1);
                    }}
                    className="w-4 h-4 rounded bg-[#222228] text-white flex items-center justify-center cursor-pointer active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculations Breakdown */}
        {cartItems.length > 0 && (
          <div className="p-3 rounded-2xl bg-[#0B0B0C] border border-[#222228] space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-400 text-[11px]">
              <span>ค่าสินค้า (Subtotal):</span>
              <span className="font-mono text-stone-200">฿{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-400 text-[11px]">
              <span>ภาษี VAT (7%):</span>
              <span className="font-mono text-stone-300">+฿{totals.vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-400 text-[11px]">
              <span>ค่าบริการ Service (5%):</span>
              <span className="font-mono text-stone-300">+฿{totals.serviceChargeAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[#222228] flex justify-between items-baseline font-bold">
              <span className="text-stone-300">ยอดชำระสุทธิ:</span>
              <span className="text-xl font-black text-[#FF6B00] font-mono">
                ฿{totals.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Tablet Checkout Action CTA */}
        <button
          onClick={() => {
            if (!activeSession) {
              setErrorMessage('กรุณาเลือกโต๊ะก่อนดำเนินการชำระเงิน');
              try { audioFeedbackService.playErrorSound(); } catch {}
              return;
            }
            try { audioFeedbackService.playTactileClickSound(); } catch {}
            setIsPortraitCompanionOpen(false);
            onProceedToPayment();
          }}
          disabled={cartItems.length === 0 || !activeSession}
          className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] active:scale-[0.98] ${
            cartItems.length > 0 && activeSession
              ? 'btn-tactile-orange shadow-lg shadow-[#FF6B00]/25'
              : 'bg-[#1E1E26] text-stone-500 border border-[#282830] cursor-not-allowed opacity-60'
          }`}
        >
          <CanvasIcon name="shield" size={15} color={cartItems.length > 0 && activeSession ? '#0B0B0C' : '#71717A'} />
          <span>ดำเนินการชำระเงิน (PromptPay QR)</span>
          <CanvasIcon name="arrow-right" size={13} color={cartItems.length > 0 && activeSession ? '#0B0B0C' : '#71717A'} />
        </button>
      </div>

      {/* CARD 3: REAL-TIME ACTIVITY STREAM */}
      <div className="p-4 rounded-3xl bg-[#141418] border border-[#282830] shadow-xl space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#222228] pb-2">
          <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span>กิจกรรมล่าสุดในร้าน (Live SSE Stream)</span>
          </span>
          <span className="text-[9px] font-mono text-stone-500">&lt;10ms Sync</span>
        </div>
        <div className="max-h-44 overflow-y-auto space-y-2 scrollbar-none pr-1">
          {activityLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="text-[10px] p-2 rounded-xl bg-[#0B0B0C] border border-[#222228] space-y-0.5">
              <div className="flex justify-between text-stone-400">
                <span className="font-bold text-[#FF8C33]">โต๊ะ {log.tableId}</span>
                <span className="font-mono text-stone-500">{new Date(log.timestamp).toLocaleTimeString('th-TH')}</span>
              </div>
              <p className="text-stone-300 truncate">{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#070708] text-stone-100 flex flex-col font-sans selection:bg-[#FF6B00] selection:text-stone-950 relative overflow-x-hidden">
      {/* Dynamic Ambient Background */}
      <WebGLAmbientBackground />

      {/* TOP DESKTOP-CLASS LUXURY HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0B0B0C]/90 backdrop-blur-xl border-b border-[#282832] px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
        {/* Left Branding with Study Café 24/7 Logo */}
        <div className="flex items-center gap-3">
          <img
            src={APP_LOGO_BASE64}
            alt="Study Café 24/7"
            className="h-14 sm:h-16 w-auto max-w-[130px] sm:max-w-[150px] object-contain filter drop-shadow hover:scale-105 transition-transform flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                STUDY CAFÉ 24/7
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF8C33] text-[10px] font-mono font-bold border border-[#FF6B00]/30 tracking-wider">
                {currentOrientation === 'portrait' ? 'iPAD PORTRAIT' : 'TABLET PRO'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Co-Working Sanctuary & Specialty Brews • Real-Time Distributed Architecture
            </p>
          </div>
        </div>

        {/* Center Live Stats */}
        <div className="hidden md:flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs bg-[#122419] border border-[#1E432E] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-[#34D399] font-mono font-medium">โต๊ะว่าง {availableCount} / {tables.length}</span>
          </div>
          <div className="pill-embossed-dark px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs hidden lg:flex">
            <CanvasIcon name="wifi" size={14} color="#34D399" />
            <span className="text-stone-300 font-mono">50,000 CONCURRENCY</span>
          </div>
          {activeSession && (
            <div className="px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs bg-[#122419] border border-[#1E432E] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <span className="text-[#34D399] font-bold">โต๊ะ {activeSession.tableId}</span>
              <span className="text-[#FF8C33] font-mono font-bold bg-[#0B0B0C] px-1.5 py-0.2 rounded border border-[#FF6B00]/30">
                PIN {activeSession.secretCode}
              </span>
            </div>
          )}
        </div>

        {/* Right Controls (Time Clock CE + iPad Portrait Companion Button) */}
        <div className="flex items-center gap-2.5">
          {currentOrientation === 'portrait' && (
            <button
              onClick={() => {
                try { audioFeedbackService.playTactileClickSound(); } catch {}
                setIsPortraitCompanionOpen(true);
              }}
              className="btn-tactile-orange px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold cursor-pointer active:scale-95 shadow-md shadow-[#FF6B00]/20"
            >
              <CanvasIcon name="cart" size={14} color="#0B0B0C" />
              <span>เวิร์กสเตชัน &amp; ตะกร้า ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </button>
          )}

          <div className="pill-embossed-dark px-3 py-1.5 rounded-xl text-xs font-mono text-stone-300">
            {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </header>

      {/* iPad Portrait Dedicated Quick Action Ribbon */}
      {currentOrientation === 'portrait' && (
        <div className="bg-[#101014] border-b border-[#242430] px-4 sm:px-6 py-2.5 flex items-center justify-between z-30">
          <div className="flex items-center gap-2.5">
            <img src={APP_LOGO_BASE64} alt="Study Café 24/7" className="h-9 w-auto max-w-[80px] object-contain flex-shrink-0 filter drop-shadow" />
            <div>
              <span className="text-xs font-bold text-white block">
                {activeSession ? `กำลังใช้งานโต๊ะ ${activeSession.tableId}` : 'มุมมอง iPad แนวตั้ง (iPad Portrait View)'}
              </span>
              <span className="text-[10px] text-stone-400">
                {activeSession ? `รหัสลับ PIN: ${activeSession.secretCode} • พร้อมสั่งเครื่องดื่ม` : 'แตะเลือกโต๊ะว่างด้านล่างเพื่อเริ่มเช็คอิน'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                try { audioFeedbackService.playTactileClickSound(); } catch {}
                setIsPortraitCompanionOpen(true);
              }}
              className="pill-embossed-dark px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 text-stone-200 cursor-pointer active:scale-95"
            >
              <CanvasIcon name="cart" size={13} color="#FF6B00" />
              <span className="font-mono font-bold text-[#FF8C33]">฿{totals.totalAmount.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2-COLUMN SPLIT OR PORTRAIT FULL-WIDTH WORKSPACE */}
      <div className={`flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 ${
        currentOrientation === 'landscape'
          ? 'grid grid-cols-1 lg:grid-cols-12 gap-6'
          : 'flex flex-col space-y-6 pb-28'
      } relative z-10`}>
        
        {/* ======================================================== */}
        {/* PRIMARY WORKSPACE: 8 COLS IN LANDSCAPE / FULL IN PORTRAIT */}
        {/* ======================================================== */}
        <div className={currentOrientation === 'landscape' ? 'lg:col-span-8 flex flex-col space-y-4' : 'w-full flex flex-col space-y-4'}>
          
          {/* Segmented Top Navigation Tab Bar */}
          <div className="p-1.5 rounded-2xl bg-[#121214] border border-[#282830] flex items-center gap-1.5 shadow-lg">
            <button
              onClick={() => handleTabChange('tables')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'tables'
                  ? 'btn-tactile-orange shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1A1A1E]'
              }`}
            >
              <CanvasIcon name="table" size={15} color={activeTab === 'tables' ? '#0B0B0C' : '#A1A1AA'} />
              <span>แผนผังโต๊ะทำงาน (20 Tables)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'tables' ? 'bg-[#0B0B0C]/30 text-[#0B0B0C]' : 'bg-[#1E1E26] text-stone-400'
              }`}>
                {availableCount} ว่าง
              </span>
            </button>

            <button
              onClick={() => handleTabChange('menu')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'menu'
                  ? 'btn-tactile-orange shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1A1A1E]'
              }`}
            >
              <CanvasIcon name="coffee" size={15} color={activeTab === 'menu' ? '#0B0B0C' : '#A1A1AA'} />
              <span>เมนูกาแฟ & เบเกอรี่ (10 รายการ)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'menu' ? 'bg-[#0B0B0C]/30 text-[#0B0B0C]' : 'bg-[#1E1E26] text-stone-400'
              }`}>
                10 เมนู
              </span>
            </button>

            <button
              onClick={() => handleTabChange('session')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'session'
                  ? 'btn-tactile-orange shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1A1A1E]'
              }`}
            >
              <CanvasIcon name="clock" size={15} color={activeTab === 'session' ? '#0B0B0C' : '#A1A1AA'} />
              <span>ไทม์ไลน์เซสชัน</span>
            </button>

            <button
              onClick={() => handleTabChange('admin')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'btn-tactile-orange shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1A1A1E]'
              }`}
            >
              <CanvasIcon name="chart" size={15} color={activeTab === 'admin' ? '#0B0B0C' : '#A1A1AA'} />
              <span>ควบคุมระบบ & รายได้</span>
            </button>
          </div>

          {/* TAB 1: TABLE SELECTION (WIDE TABLET GRID) */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              {/* Zone Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {zones.map((zone) => {
                  const isSelected = selectedZone === zone;
                  return (
                    <button
                      key={zone}
                      onClick={() => {
                        setSelectedZone(zone);
                        try { audioFeedbackService.playTactileClickSound(); } catch {}
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF6B00] text-stone-950 font-bold shadow-md shadow-[#FF6B00]/20'
                          : 'bg-[#141418] text-stone-400 border border-[#282830] hover:text-stone-200'
                      }`}
                    >
                      {zone === 'ALL' ? 'ทุกโซน (All Zones)' : zone}
                    </button>
                  );
                })}
              </div>

              {/* Wide Multi-Column 20-Table Grid with Instant Base64 Status Icon Switching */}
              <TableGridSystem
                tables={filteredTables}
                activeSession={activeSession}
                onTableSelect={handleTableClick}
                variant="tablet"
              />
            </div>
          )}

          {/* TAB 2: MENU BROWSER (WIDE MULTI-COLUMN GRID) */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {menuCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedMenuCategory(cat.id);
                      try { audioFeedbackService.playTactileClickSound(); } catch {}
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedMenuCategory === cat.id
                        ? 'bg-[#FF6B00] text-stone-950 font-bold shadow-md shadow-[#FF6B00]/20'
                        : 'bg-[#141418] text-stone-400 border border-[#282830] hover:text-stone-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Culinary Cards Grid (2 to 3 Columns on iPad) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#121214] border border-[#282830] hover:border-[#FF6B00]/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    {/* Real Base64 Photo */}
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-[#0B0B0C] relative group-hover:scale-[1.02] transition-transform duration-300">
                      <img
                        src={item.imageBase64 || item.imageUrl || ''}
                        alt={item.nameTh}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-[#0B0B0C]/80 border border-[#282830] text-[9px] font-mono text-[#FF8C33] font-bold">
                        {item.categoryId.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between">
                        <h4 className="text-sm font-bold text-white truncate">{item.nameTh}</h4>
                        <span className="text-sm font-black text-[#FF6B00] font-mono">
                          ฿{item.basePriceSmall}
                          {item.basePriceLarge && ` / ฿${item.basePriceLarge}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.descriptionTh}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenCustomizer(item)}
                      className="btn-tactile-orange w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <CanvasIcon name="plus" size={11} color="#0B0B0C" />
                      <span>เลือกปรับแต่ง & ใส่ตะกร้า</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SESSION TIMELINE */}
          {activeTab === 'session' && (
            <div className="rounded-2xl bg-[#121214] border border-[#282830] p-4">
              <SessionTimelineScreen
                activeSession={activeSession}
                table={currentTable}
                activityLogs={activityLogs}
                onNavigateToMenu={() => handleTabChange('menu')}
                onNavigateToTables={() => handleTabChange('tables')}
              />
            </div>
          )}

          {/* TAB 4: ADMIN DASHBOARD */}
          {activeTab === 'admin' && (
            <div className="rounded-2xl bg-[#121214] border border-[#282830] p-4">
              <ManagerDashboard
                tables={tables}
                metrics={metrics}
                activityLogs={activityLogs}
                settledTransactions={settledTransactions}
                revenueAnalytics={revenueAnalytics}
                onTriggerFailoverTest={onTriggerFailover}
                onForceResetTable={onForceResetTable}
              />
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: DESKTOP COMPANION SIDEBAR (LANDSCAPE ONLY) */}
        {/* ======================================================== */}
        {currentOrientation === 'landscape' && (
          <div className="lg:col-span-4">
            {renderCompanionCards()}
          </div>
        )}
      </div>

      {/* iPAD PORTRAIT FLOATING BOTTOM ACTION DOCK */}
      {currentOrientation === 'portrait' && (
        <aside
          aria-label="แถบข้อมูลเวิร์กสเตชันและตะกร้า"
          className="fixed bottom-0 inset-x-0 z-40 bg-[#0B0B0C]/95 backdrop-blur-xl border-t border-[#282832] px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.7)]"
        >
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO_BASE64} alt="Study Café 24/7" className="h-10 w-auto max-w-[90px] object-contain flex-shrink-0 filter drop-shadow" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {activeSession ? `โต๊ะ ${activeSession.tableId}` : 'ยังไม่ได้เลือกโต๊ะ'}
                  </span>
                  {activeSession ? (
                    <span className="text-[10px] font-mono text-[#34D399] bg-[#122419] px-1.5 py-0.5 rounded border border-[#1E432E] font-bold">
                      PIN {activeSession.secretCode}
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400">พร้อมเช็คอิน</span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400">
                  {cartItems.length} รายการ • รวม <span className="text-[#FF8C33] font-bold font-mono">฿{totals.totalAmount.toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  try { audioFeedbackService.playTactileClickSound(); } catch {}
                  setIsPortraitCompanionOpen(true);
                }}
                className="pill-embossed-dark px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-stone-200 cursor-pointer active:scale-95"
              >
                <CanvasIcon name="cart" size={14} color="#FF6B00" />
                <span>ดูตะกร้า ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
              </button>

              {cartItems.length > 0 && activeSession && (
                <button
                  onClick={() => {
                    try { audioFeedbackService.playTactileClickSound(); } catch {}
                    onProceedToPayment();
                  }}
                  className="btn-tactile-orange px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg shadow-[#FF6B00]/25"
                >
                  <CanvasIcon name="shield" size={14} color="#0B0B0C" />
                  <span>ชำระเงิน</span>
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* iPAD PORTRAIT SLIDE-OVER COMPANION DRAWER */}
      {isPortraitCompanionOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end transition-opacity">
          <div className="w-full max-w-md bg-[#0D0D10] h-full border-l border-[#282830] shadow-2xl flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#282830]">
              <div className="flex items-center gap-2.5">
                <img src={APP_LOGO_BASE64} alt="Study Café 24/7" className="h-11 w-auto max-w-[100px] object-contain flex-shrink-0 filter drop-shadow" />
                <div>
                  <h3 className="text-sm font-bold text-white">เวิร์กสเตชัน &amp; ตะกร้าสินค้า</h3>
                  <p className="text-[10px] text-stone-400">Study Café 24/7 • iPad Portrait Mode</p>
                </div>
              </div>
              <button
                onClick={() => setIsPortraitCompanionOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1A1A22] text-stone-400 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Render Companion Cards */}
            {renderCompanionCards()}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR TABLE OCCUPY */}
      {confirmingTable && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1A1E] rounded-3xl border border-[#282830] p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center mx-auto text-[#FF6B00]">
              <CanvasIcon name="table" size={24} color="#FF6B00" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#FF6B00] font-mono uppercase tracking-widest">
                CONFIRM TABLE LEASE
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                ยืนยันการเข้าใช้โต๊ะ {confirmingTable.tableId}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">{confirmingTable.zone}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingTable(null)}
                className="btn-tactile-dark flex-1 py-2.5 rounded-xl text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmLease}
                className="btn-tactile-orange flex-1 py-2.5 rounded-xl text-xs font-bold"
              >
                ยืนยันเข้าใช้งาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECK-IN SUCCESS MODAL WITH HTML5 CANVAS CHECKMARK */}
      {showCheckinSuccess && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1A1E] rounded-3xl border border-[#282830] p-6 shadow-2xl text-center space-y-4 relative">
            <div className="flex justify-center pt-2">
              <CanvasAnimatedCheckmark size={90} playAudio={true} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#10B981] font-mono uppercase tracking-widest">
                CHECK-IN SUCCESSFUL
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                เข้าใช้งานโต๊ะ {activeSession?.tableId} เรียบร้อย
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">รหัสลับ 6 หลักสำหรับผูกออเดอร์:</p>
            </div>
            <div className="py-3 rounded-2xl bg-[#0B0B0C] border border-[#282830]">
              <span className="text-3xl font-black text-[#FF6B00] font-mono tracking-widest">
                {activeSession?.secretCode}
              </span>
            </div>
            <button
              onClick={() => setShowCheckinSuccess(false)}
              className="btn-tactile-orange w-full py-3 rounded-xl text-xs font-bold"
            >
              ตกลง & สั่งอาหาร
            </button>
          </div>
        </div>
      )}

      {/* MENU CUSTOMIZER MODAL FOR TABLET */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1A1A1E] rounded-3xl border border-[#282830] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#282830] pb-2.5">
              <h3 className="text-sm font-bold text-white">{customizingItem.nameTh}</h3>
              <button
                onClick={() => setCustomizingItem(null)}
                className="w-7 h-7 rounded-full bg-[#121214] text-stone-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Preview */}
            <div className="w-full h-32 rounded-xl bg-[#0B0B0C] overflow-hidden flex items-center justify-center">
              <img
                src={customizingItem.imageBase64 || customizingItem.imageUrl || ''}
                alt={customizingItem.nameTh}
                className="h-full object-contain p-2"
              />
            </div>

            {/* Customization Options */}
            <div className="space-y-3 text-xs">
              {customizingItem.hasSizeOption && (
                <div>
                  <span className="text-stone-400 block mb-1">เลือกขนาด:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedSize('S')}
                      className={`py-2 rounded-xl border text-center transition-all ${
                        selectedSize === 'S'
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33] font-bold'
                          : 'bg-[#121214] border-[#282830] text-stone-400'
                      }`}
                    >
                      Small (12oz) - ฿{customizingItem.basePriceSmall}
                    </button>
                    <button
                      onClick={() => setSelectedSize('L')}
                      className={`py-2 rounded-xl border text-center transition-all ${
                        selectedSize === 'L'
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33] font-bold'
                          : 'bg-[#121214] border-[#282830] text-stone-400'
                      }`}
                    >
                      Large (16oz) - ฿{customizingItem.basePriceLarge || customizingItem.basePriceSmall + 40}
                    </button>
                  </div>
                </div>
              )}

              {/* Temperature & Sweetness */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-400 block mb-1">อุณหภูมิ:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setTemperature('ICED')}
                      className={`py-1.5 rounded-lg border text-center ${
                        temperature === 'ICED' ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33]' : 'bg-[#121214] border-[#282830] text-stone-400'
                      }`}
                    >
                      เย็น
                    </button>
                    <button
                      onClick={() => setTemperature('HOT')}
                      className={`py-1.5 rounded-lg border text-center ${
                        temperature === 'HOT' ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33]' : 'bg-[#121214] border-[#282830] text-stone-400'
                      }`}
                    >
                      ร้อน
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-stone-400 block mb-1">ความหวาน:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 25, 50, 100].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSweetness(s as any)}
                        className={`py-1.5 rounded-lg border text-center text-[10px] ${
                          sweetness === s ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33]' : 'bg-[#121214] border-[#282830] text-stone-400'
                        }`}
                      >
                        {s}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmAddToCart}
              className="btn-tactile-orange w-full py-3 rounded-2xl text-xs font-bold"
            >
              เพิ่มลงในตะกร้า
            </button>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1A1E] rounded-3xl border border-[#EF4444]/40 p-5 shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-center mx-auto">
              <CanvasIcon name="alert" size={20} color="#EF4444" />
            </div>
            <h3 className="text-sm font-bold text-white">แจ้งเตือน</h3>
            <p className="text-xs text-stone-300">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="btn-tactile-dark w-full py-2.5 rounded-xl text-stone-200 text-xs font-semibold"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
