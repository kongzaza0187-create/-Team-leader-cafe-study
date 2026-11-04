/**
 * Lumina 24-Hour Cafe - Menu & Customizer Screen
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00)
 * Inline Base64 Image Storage (Zero HTTP Image Delay)
 * Custom HTML5 Canvas Icons (No Lucide / Emojis)
 * Web Audio API Tactile Sound Feedback
 * Features Americano S (50 THB) / L (90 THB) with dynamic real-time price updates
 */

import React, { useState } from 'react';
import { MenuItem, CartItem, CoffeeTemperature, SweetnessLevel, MilkOption, TableSession, AppLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menuData';
import { CanvasIcon } from './CanvasIcon';
import { audioFeedbackService } from '../services/audioFeedbackService';
import { APP_LOGO_BASE64 } from '../data/appLogoBase64';

interface Props {
  activeSession: TableSession | null;
  language?: AppLanguage;
  onAddToCart: (item: CartItem) => void;
  onNavigateToTables: () => void;
  onOpenCart: () => void;
  cartCount: number;
  onCustomizerStateChange?: (isOpen: boolean) => void;
}

export const MenuScreen: React.FC<Props> = ({
  activeSession,
  language = 'th',
  onAddToCart,
  onNavigateToTables,
  onOpenCart,
  cartCount,
  onCustomizerStateChange,
}) => {
  const dict = TRANSLATIONS[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('coffee');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Customization modal state
  const [selectedSize, setSelectedSize] = useState<'S' | 'L'>('S');
  const [selectedTemp, setSelectedTemp] = useState<CoffeeTemperature>('ICED');
  const [selectedSweetness, setSelectedSweetness] = useState<SweetnessLevel>(25);
  const [selectedMilk, setSelectedMilk] = useState<MilkOption>('WHOLE');
  const [hasExtraShot, setHasExtraShot] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      onCustomizerStateChange?.(false);
    };
  }, [onCustomizerStateChange]);

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch =
      item.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descriptionTh.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const calculateModalUnitPrice = (item: MenuItem): number => {
    let base = item.basePriceSmall;
    if (selectedSize === 'L' && item.basePriceLarge) {
      base = item.basePriceLarge;
    }
    if (selectedMilk === 'OAT' || selectedMilk === 'ALMOND') {
      base += 20;
    }
    if (hasExtraShot) {
      base += 25;
    }
    return base;
  };

  const handleOpenCustomizer = (item: MenuItem) => {
    setCustomizingItem(item);
    onCustomizerStateChange?.(true);
    setSelectedSize('S');
    setSelectedTemp('ICED');
    setSelectedSweetness(25);
    setSelectedMilk('WHOLE');
    setHasExtraShot(false);
    setQuantity(1);
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  const handleCloseCustomizer = () => {
    setCustomizingItem(null);
    onCustomizerStateChange?.(false);
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  const handleConfirmAddToCart = () => {
    if (!customizingItem) return;

    const unitPrice = calculateModalUnitPrice(customizingItem);
    const cartItemId = `${customizingItem.id}_${selectedSize}_${selectedTemp}_${selectedSweetness}_${selectedMilk}_${hasExtraShot ? 'shot' : 'noshot'}`;

    const cartItem: CartItem = {
      cartItemId,
      menuItem: customizingItem,
      size: selectedSize,
      unitPrice,
      quantity,
      customization: {
        temperature: customizingItem.categoryId === 'coffee' || customizingItem.categoryId === 'tea' ? selectedTemp : undefined,
        sweetness: customizingItem.categoryId === 'coffee' || customizingItem.categoryId === 'tea' ? selectedSweetness : undefined,
        milk: customizingItem.categoryId === 'coffee' ? selectedMilk : undefined,
        extraShot: customizingItem.categoryId === 'coffee' ? hasExtraShot : false,
      },
      itemSubtotal: unitPrice * quantity,
    };

    onAddToCart(cartItem);
    setCustomizingItem(null);
    onCustomizerStateChange?.(false);
    setAddedToast(`${customizingItem.nameTh} (${selectedSize}) เพิ่มลงในตะกร้าแล้ว`);

    try {
      audioFeedbackService.playSuccessChime();
    } catch {}
    setTimeout(() => setAddedToast(null), 2500);
  };

  return (
    <div className="px-3 sm:px-4 py-2 space-y-3">

      {/* Table Warning if not checked in */}
      {!activeSession ? (
        <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-[#282830] flex items-center justify-between text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <CanvasIcon name="alert" size={15} color="#FF6B00" />
            <span>กรุณา Check-in โต๊ะก่อนสั่งเพื่อรับรหัสลับ 6 หลัก</span>
          </div>
          <button
            onClick={() => {
              audioFeedbackService.playTactileClickSound();
              onNavigateToTables();
            }}
            className="btn-tactile-orange px-3 py-1 rounded-xl text-xs whitespace-nowrap"
          >
            เลือกโต๊ะ
          </button>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-[#1A1A1E] border border-[#282830] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34D399]"></span>
            <span className="text-stone-300">
              สั่งสำหรับ: <strong className="text-[#FF6B00] font-mono">โต๊ะ {activeSession.tableId}</strong>
            </span>
          </div>
          <span className="text-stone-400 text-[11px] font-mono">PIN: {activeSession.secretCode}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
          <CanvasIcon name="search" size={14} color="#71717A" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหากาแฟ, Americano, Matcha, Bakery..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#121214] border border-[#282830] text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#FF6B00] transition-colors"
        />
      </div>

      {/* Category Horizontal Filter */}
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 flex items-center gap-1.5 py-1">
        <button
          onClick={() => {
            setSelectedCategory('all');
            try {
              audioFeedbackService.playTactileClickSound();
            } catch {}
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#FF6B00] text-stone-950 font-bold shadow'
              : 'bg-[#1A1A1E] text-stone-400 border border-[#282830]'
          }`}
        >
          ทั้งหมด
        </button>
        {MENU_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              try {
                audioFeedbackService.playTactileClickSound();
              } catch {}
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#FF6B00] text-stone-950 font-bold shadow'
                : 'bg-[#1A1A1E] text-stone-400 border border-[#282830]'
            }`}
          >
            {cat.nameEn}
          </button>
        ))}
      </div>

      {/* Menu Cards Grid - Responsive for Mobile & Tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
        {filteredItems.map((item) => {
          const isAmericano = item.id === 'americano';
          // Use inline Base64 image directly (zero external network latency)
          const displayImage = item.imageBase64 || item.imageUrl || '';

          return (
            <div
              key={item.id}
              onClick={() => handleOpenCustomizer(item)}
              className="p-3 rounded-2xl bg-[#1A1A1E] border border-[#282830] hover:border-[#FF6B00]/50 transition-all flex gap-3 cursor-pointer group min-h-[96px]"
            >
              {/* Product Thumbnail (Rendered from real culinary photography Base64) */}
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-[#121214] flex-shrink-0 relative border border-[#282830]">
                <img
                  src={displayImage}
                  alt={item.nameTh}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="eager"
                />
                {isAmericano && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#0B0B0C]/90 text-[#FF6B00] border border-[#282830] font-mono font-bold text-[9px]">
                    50 / 90฿
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-100 group-hover:text-[#FF6B00] transition-colors line-clamp-1">
                    {item.nameTh}
                  </h3>
                  <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2">
                    {item.descriptionTh}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#282830] mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] text-stone-500">เริ่มต้น</span>
                    <span className="text-sm font-black text-[#FF6B00] font-mono">
                      ฿{item.basePriceSmall}
                    </span>
                    {item.basePriceLarge && (
                      <span className="text-[10px] text-stone-500 font-mono">
                        (L: ฿{item.basePriceLarge})
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCustomizer(item);
                    }}
                    className="w-8 h-8 rounded-xl bg-[#222228] hover:bg-[#FF6B00] hover:text-stone-950 text-stone-300 border border-[#282830] flex items-center justify-center transition-all btn-tactile-dark min-h-[32px]"
                    aria-label={`เพิ่ม ${item.nameTh}`}
                  >
                    <CanvasIcon name="plus" size={13} color="#F4F4F5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Customizer Sheet / Modal with Smooth Scrolling & Pinned Action Bar */}
      {customizingItem && (
        <div 
          onClick={handleCloseCustomizer}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm sm:max-w-md max-h-[85vh] sm:max-h-[88vh] bg-[#1A1A1E] rounded-t-3xl sm:rounded-3xl border border-[#282830] shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            {/* Modal Fixed Header */}
            <div className="p-4 sm:p-5 border-b border-[#282830] flex items-start justify-between flex-shrink-0 bg-[#1A1A1E] z-10">
              <div className="pr-3">
                <span className="text-[10px] font-mono text-[#FF6B00] uppercase tracking-wider font-bold block mb-0.5">
                  CUSTOMIZE ORDER
                </span>
                <h3 className="text-base font-bold text-stone-100 line-clamp-1">
                  {customizingItem.nameTh}
                </h3>
                <span className="text-[11px] text-stone-400 block mt-0.5 line-clamp-1">
                  {customizingItem.nameEn}
                </span>
              </div>
              <button
                onClick={handleCloseCustomizer}
                className="w-8 h-8 rounded-full bg-[#121214] hover:bg-[#282830] text-stone-400 hover:text-stone-100 flex items-center justify-center border border-[#282830] transition-colors cursor-pointer flex-shrink-0 active:scale-95"
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body: with touch scrolling, overscroll-contain, and bottom padding */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-none overscroll-contain pb-28 sm:pb-32"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Base64 Product Preview */}
              <div className="w-full h-36 rounded-2xl overflow-hidden bg-[#121214] border border-[#282830] relative group">
                <img
                  src={customizingItem.imageBase64 || customizingItem.imageUrl || ''}
                  alt={customizingItem.nameTh}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-[#0B0B0C]/80 border border-[#282830] text-[10px] font-mono text-[#FF6B00] font-bold">
                  {customizingItem.categoryId.toUpperCase()}
                </div>
              </div>

              {/* Size Selector (If Available) */}
              {customizingItem.hasSizeOption && (
                <div className="space-y-1.5">
                  <span className="text-xs text-stone-300 font-semibold block">เลือกขนาด (Cup Size):</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedSize('S');
                        try { audioFeedbackService.playTactileClickSound(); } catch {}
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                        selectedSize === 'S'
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33] font-bold shadow-md shadow-[#FF6B00]/10'
                          : 'bg-[#121214] border-[#282830] text-stone-400 hover:border-stone-600'
                      }`}
                    >
                      <span className="block text-xs">Small (12oz)</span>
                      <span className="font-mono text-[11px]">฿{customizingItem.basePriceSmall}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSize('L');
                        try { audioFeedbackService.playTactileClickSound(); } catch {}
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                        selectedSize === 'L'
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33] font-bold shadow-md shadow-[#FF6B00]/10'
                          : 'bg-[#121214] border-[#282830] text-stone-400 hover:border-stone-600'
                      }`}
                    >
                      <span className="block text-xs">Large (16oz)</span>
                      <span className="font-mono text-[11px]">฿{customizingItem.basePriceLarge}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Temperature Option (Coffee & Tea) */}
              {(customizingItem.categoryId === 'coffee' || customizingItem.categoryId === 'tea') && (
                <div className="space-y-1.5">
                  <span className="text-xs text-stone-300 font-semibold block">อุณหภูมิ (Temperature):</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemp('ICED');
                        try { audioFeedbackService.playTactileClickSound(); } catch {}
                      }}
                      className={`py-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                        selectedTemp === 'ICED'
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33] font-bold'
                          : 'bg-[#121214] border-[#282830] text-stone-400'
                      }`}
                    >
                      เย็น (Iced)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemp('HOT');
                        try { audioFeedbackService.playTactileClickSound(); } catch {}
                      }}
                      className={`py-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                        selectedTemp === 'HOT'
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33] font-bold'
                          : 'bg-[#121214] border-[#282830] text-stone-400'
                      }`}
                    >
                      ร้อน (Hot)
                    </button>
                  </div>
                </div>
              )}

              {/* Sweetness Slider/Buttons */}
              {(customizingItem.categoryId === 'coffee' || customizingItem.categoryId === 'tea') && (
                <div className="space-y-1.5">
                  <span className="text-xs text-stone-300 font-semibold block">ระดับความหวาน (Sweetness):</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 25, 50, 100].map((level) => (
                      <button
                        key={level}
                        onClick={() => {
                          setSelectedSweetness(level as SweetnessLevel);
                          try { audioFeedbackService.playTactileClickSound(); } catch {}
                        }}
                        className={`py-2 rounded-xl border text-center font-mono text-[11px] transition-all cursor-pointer active:scale-95 ${
                          selectedSweetness === level
                            ? 'bg-[#FF6B00] text-stone-950 font-bold border-[#FF6B00] shadow'
                            : 'bg-[#121214] border-[#282830] text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {level}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Milk Option (For Coffee) */}
              {customizingItem.categoryId === 'coffee' && customizingItem.id !== 'americano' && (
                <div className="space-y-1.5">
                  <span className="text-xs text-stone-300 font-semibold block">นมทางเลือก (Milk Option):</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedMilk('WHOLE');
                        try { audioFeedbackService.playTactileClickSound(); } catch {}
                      }}
                      className={`py-2.5 rounded-xl border text-center text-[10px] transition-all cursor-pointer active:scale-95 ${
                        selectedMilk === 'WHOLE'
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33] font-bold'
                          : 'bg-[#121214] border-[#282830] text-stone-400'
                      }`}
                    >
                      นมสดแท้ (+0฿)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMilk('OAT');
                        try { audioFeedbackService.playTactileClickSound(); } catch {}
                      }}
                      className={`py-2.5 rounded-xl border text-center text-[10px] transition-all cursor-pointer active:scale-95 ${
                        selectedMilk === 'OAT'
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33] font-bold'
                          : 'bg-[#121214] border-[#282830] text-stone-400'
                      }`}
                    >
                      นมโอ๊ต (+20฿)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMilk('ALMOND');
                        try { audioFeedbackService.playTactileClickSound(); } catch {}
                      }}
                      className={`py-2.5 rounded-xl border text-center text-[10px] transition-all cursor-pointer active:scale-95 ${
                        selectedMilk === 'ALMOND'
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF8C33] font-bold'
                          : 'bg-[#121214] border-[#282830] text-stone-400'
                      }`}
                    >
                      อัลมอนด์ (+20฿)
                    </button>
                  </div>
                </div>
              )}

              {/* Extra Shot Add-on */}
              {customizingItem.categoryId === 'coffee' && (
                <div className="p-3.5 rounded-xl bg-[#121214] border border-[#282830] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-200 block">เพิ่มเอสเพรสโซ่ช็อต</span>
                    <span className="text-[10px] text-stone-400">+25 บาท (Double Ristretto)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasExtraShot}
                    onChange={(e) => {
                      setHasExtraShot(e.target.checked);
                      try { audioFeedbackService.playTactileClickSound(); } catch {}
                    }}
                    className="w-5 h-5 accent-[#FF6B00] rounded cursor-pointer"
                  />
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-2 border-t border-[#282830]">
                <span className="text-xs text-stone-300 font-semibold">จำนวน:</span>
                <div className="flex items-center gap-3 bg-[#121214] px-3 py-1.5 rounded-xl border border-[#282830]">
                  <button
                    onClick={() => {
                      setQuantity((q) => Math.max(1, q - 1));
                      try { audioFeedbackService.playTactileClickSound(); } catch {}
                    }}
                    className="w-7 h-7 rounded-lg bg-[#222228] hover:bg-[#282830] text-stone-300 flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    <CanvasIcon name="minus" size={10} color="#F4F4F5" />
                  </button>
                  <span className="font-mono text-sm font-bold text-stone-100 min-w-5 text-center">{quantity}</span>
                  <button
                    onClick={() => {
                      setQuantity((q) => q + 1);
                      try { audioFeedbackService.playTactileClickSound(); } catch {}
                    }}
                    className="w-7 h-7 rounded-lg bg-[#222228] hover:bg-[#282830] text-stone-300 flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    <CanvasIcon name="plus" size={10} color="#F4F4F5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Action Bar (Always visible and reachable) */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-[#1A1A1E]/95 backdrop-blur-md border-t border-[#282830] z-20 pb-8 sm:pb-4 flex-shrink-0">
              <button
                onClick={handleConfirmAddToCart}
                className="btn-tactile-orange w-full py-3.5 rounded-2xl text-xs flex items-center justify-between px-5 cursor-pointer shadow-xl min-h-[48px]"
              >
                <span className="font-bold">เพิ่มลงในตะกร้า</span>
                <span className="font-mono text-sm font-extrabold bg-[#0B0B0C]/40 px-2.5 py-1 rounded-xl border border-[#FF6B00]/40">
                  ฿{(calculateModalUnitPrice(customizingItem) * quantity).toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Added Toast */}
      {addedToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1A1A1E] text-stone-100 border border-[#282830] text-xs shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CanvasIcon name="check" size={14} color="#34D399" />
          <span>{addedToast}</span>
        </div>
      )}
    </div>
  );
};
