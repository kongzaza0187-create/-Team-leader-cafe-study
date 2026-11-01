/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lumina 24-Hour Study & Coffee Cafe Platform
 * High-Concurrency Mobile-Centric Platform (50,000 Users Architecture)
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00)
 * Admin Password Protected with SHA-256 Cryptographic Hash & 15,000 THB Daily Circular Chart
 * Smooth React Transitions, Zero-Lag Architecture, 100% Responsive Navigation
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cafeStore } from './services/cafeStore';
import { 
  CafeTable, 
  TableSession, 
  TableActivityLog, 
  CartItem, 
  BillBreakdown, 
  PromptPayTransaction, 
  ConcurrencyMetrics,
  RevenueAnalytics
} from './types';
import { SlipVerificationResult } from './services/slipVerificationService';
import { MobileFrame } from './components/MobileFrame';
import { Navigation, NavigationTab } from './components/Navigation';
import { TableSelectionScreen } from './components/TableSelectionScreen';
import { MenuScreen } from './components/MenuScreen';
import { FloatingCartSheet } from './components/FloatingCartSheet';
import { PaymentModal } from './components/PaymentModal';
import { SessionTimelineScreen } from './components/SessionTimelineScreen';
import { ManagerDashboard } from './components/ManagerDashboard';
import { TabletDashboardLayout } from './components/TabletDashboardLayout';
import { CanvasIcon } from './components/CanvasIcon';
import { audioFeedbackService } from './services/audioFeedbackService';

interface DeviceInfo {
  device: 'mobile' | 'tablet';
  orientation: 'landscape' | 'portrait';
}

const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return { device: 'mobile', orientation: 'portrait' };
  }
  
  const ua = navigator.userAgent || '';
  const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isTabletUA = /Tablet|Android(?!.*Mobile)/i.test(ua);
  const isWideScreen = window.innerWidth >= 768;
  
  const device: 'mobile' | 'tablet' = (isIPad || isTabletUA || isWideScreen) ? 'tablet' : 'mobile';
  const orientation: 'landscape' | 'portrait' = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  
  return { device, orientation };
};

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  const [activeTab, setActiveTab] = useState<NavigationTab>('tables');
  const [tables, setTables] = useState<CafeTable[]>(cafeStore.getTables());
  const [activeSession, setActiveSession] = useState<TableSession | null>(cafeStore.getActiveSession());
  const [activityLogs, setActivityLogs] = useState<TableActivityLog[]>(cafeStore.getActivityLogs());
  const [cartItems, setCartItems] = useState<CartItem[]>(cafeStore.getCartItems());
  const [totals, setTotals] = useState<BillBreakdown>(cafeStore.getCartTotals());
  const [currentTransaction, setCurrentTransaction] = useState<PromptPayTransaction | null>(cafeStore.getCurrentTransaction());
  const [settledTransactions, setSettledTransactions] = useState<PromptPayTransaction[]>(cafeStore.getSettledTransactions());
  const [metrics, setMetrics] = useState<ConcurrencyMetrics>(cafeStore.getMetrics());
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics>(cafeStore.getRevenueAnalytics());

  // UI Modals
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [tableRequiredPrompt, setTableRequiredPrompt] = useState<boolean>(false);

  // Auto-Detect Device & Orientation (Auto-switches layout and orientation in real time)
  useEffect(() => {
    const handleUpdate = () => {
      setDeviceInfo(getDeviceInfo());
    };
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('orientationchange', handleUpdate);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
    };
  }, []);

  // Sync state with cafeStore
  useEffect(() => {
    const unsubscribe = cafeStore.subscribe(() => {
      setTables([...cafeStore.getTables()]);
      setActiveSession(cafeStore.getActiveSession());
      setActivityLogs([...cafeStore.getActivityLogs()]);
      setCartItems([...cafeStore.getCartItems()]);
      setTotals(cafeStore.getCartTotals());
      setCurrentTransaction(cafeStore.getCurrentTransaction());
      setSettledTransactions([...cafeStore.getSettledTransactions()]);
      setMetrics({ ...cafeStore.getMetrics() });
      setRevenueAnalytics({ ...cafeStore.getRevenueAnalytics() });
    });

    return () => unsubscribe();
  }, []);

  // Safe Tab Routing Handler (Clears any blocking sheets immediately)
  const handleTabChange = (tab: NavigationTab) => {
    setIsCustomizerOpen(false);
    setIsCartOpen(false);
    setTableRequiredPrompt(false);
    setActiveTab(tab);
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  // Handlers
  const handleSelectAndOccupyTable = (tableId: string) => {
    cafeStore.occupyTableWithCryptographicSession(tableId);
  };

  const handleAddToCart = (item: CartItem) => {
    cafeStore.addToCart(item);
  };

  const handleUpdateCartQty = (cartItemId: string, delta: number) => {
    cafeStore.updateCartItemQuantity(cartItemId, delta);
  };

  const handleClearCart = () => {
    cafeStore.clearCart();
    setIsCartOpen(false);
    setIsCustomizerOpen(false);
  };

  const handleProceedToPayment = () => {
    if (!activeSession) {
      setTableRequiredPrompt(true);
      try {
        audioFeedbackService.playErrorSound();
      } catch {}
      return;
    }
    cafeStore.initiatePromptPayCheckout();
    setIsCartOpen(false);
    setIsPaymentOpen(true);
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  const handleConfirmVerifiedCheckout = (slipResult: SlipVerificationResult) => {
    return cafeStore.completeCheckoutWithVerifiedSlip(slipResult);
  };

  const handleForceResetTable = (tableId: string) => {
    cafeStore.adminForceResetTable(tableId);
  };

  const handleTriggerFailover = () => {
    cafeStore.triggerFailoverRecoveryTest();
  };

  const currentTable = tables.find((t) => t.tableId === activeSession?.tableId);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Render Dedicated Tablet / iPad View (Desktop-Class Split in Landscape, Spacious Dedicated View in Portrait)
  if (deviceInfo.device === 'tablet') {
    return (
      <>
        <TabletDashboardLayout
          tables={tables}
          activeSession={activeSession}
          cartItems={cartItems}
          totals={totals}
          activityLogs={activityLogs}
          metrics={metrics}
          settledTransactions={settledTransactions}
          revenueAnalytics={revenueAnalytics}
          onSelectAndOccupyTable={handleSelectAndOccupyTable}
          onAddToCart={handleAddToCart}
          onUpdateCartQty={handleUpdateCartQty}
          onClearCart={handleClearCart}
          onProceedToPayment={handleProceedToPayment}
          onTriggerFailover={handleTriggerFailover}
          onForceResetTable={handleForceResetTable}
          orientation={deviceInfo.orientation}
        />

        {/* PromptPay Payment & Slip Verification Modal */}
        {isPaymentOpen && currentTransaction && activeSession && (
          <PaymentModal
            transaction={currentTransaction}
            totals={totals}
            activeSession={activeSession}
            onConfirmVerifiedCheckout={handleConfirmVerifiedCheckout}
            onClose={() => setIsPaymentOpen(false)}
          />
        )}
      </>
    );
  }

  const shouldHideBottomNav = isCustomizerOpen || isCartOpen || isPaymentOpen || tableRequiredPrompt;

  // Render Mobile View (One-Handed Edge-to-Edge with Docked Navigation)
  return (
    <MobileFrame
      activeTableId={activeSession?.tableId}
      secretCode={activeSession?.secretCode}
      hideNavigation={shouldHideBottomNav}
      navigation={
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          cartCount={cartCount}
          hasActiveSession={!!activeSession}
          activeTableId={activeSession?.tableId}
          onOpenCart={() => setIsCartOpen(true)}
        />
      }
    >
      {/* Optimized Fluid React Transition Animation (Zero-Lag Architecture) */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {activeTab === 'tables' && (
          <TableSelectionScreen
            tables={tables}
            activeSession={activeSession}
            onSelectAndOccupyTable={handleSelectAndOccupyTable}
            onNavigateToMenu={() => handleTabChange('menu')}
          />
        )}

        {activeTab === 'menu' && (
          <MenuScreen
            activeSession={activeSession}
            onAddToCart={handleAddToCart}
            onNavigateToTables={() => handleTabChange('tables')}
            onOpenCart={() => setIsCartOpen(true)}
            cartCount={cartCount}
            onCustomizerStateChange={setIsCustomizerOpen}
          />
        )}

        {activeTab === 'session' && (
          <SessionTimelineScreen
            activeSession={activeSession}
            table={currentTable}
            activityLogs={activityLogs}
            onNavigateToMenu={() => handleTabChange('menu')}
            onNavigateToTables={() => handleTabChange('tables')}
          />
        )}

        {activeTab === 'admin' && (
          <ManagerDashboard
            tables={tables}
            metrics={metrics}
            activityLogs={activityLogs}
            settledTransactions={settledTransactions}
            revenueAnalytics={revenueAnalytics}
            onTriggerFailoverTest={handleTriggerFailover}
            onForceResetTable={handleForceResetTable}
          />
        )}
      </motion.div>

      {/* Floating Cart Bottom Sheet */}
      <FloatingCartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        totals={totals}
        activeSession={activeSession}
        onUpdateQty={handleUpdateCartQty}
        onClearCart={handleClearCart}
        onProceedToPayment={handleProceedToPayment}
        onNavigateToTables={() => {
          setIsCartOpen(false);
          handleTabChange('tables');
        }}
      />

      {/* PromptPay Payment & Slip Verification Modal */}
      {isPaymentOpen && currentTransaction && activeSession && (
        <PaymentModal
          transaction={currentTransaction}
          totals={totals}
          activeSession={activeSession}
          onConfirmVerifiedCheckout={handleConfirmVerifiedCheckout}
          onClose={() => setIsPaymentOpen(false)}
        />
      )}

      {/* In-App Table Requirement Notice */}
      {tableRequiredPrompt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1A1E] rounded-3xl border border-[#FF6B00]/40 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-[#FF6B00] flex items-center justify-center mx-auto">
              <CanvasIcon name="table" size={24} color="#FF6B00" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#FF6B00] font-mono uppercase tracking-widest">
                ACTIVE TABLE REQUIRED
              </span>
              <h3 className="text-base font-bold text-stone-100">
                กรุณาเลือกโต๊ะก่อนดำเนินการสั่งซื้อ
              </h3>
              <p className="text-xs text-stone-400 pt-1 leading-relaxed">
                เพื่อความถูกต้องในการเสิร์ฟเครื่องดื่มและคิดคำนวณบิล กรุณาแตะเลือกโต๊ะทำงานที่ว่างก่อนชำระเงิน
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setTableRequiredPrompt(false)}
                className="btn-tactile-dark flex-1 py-2.5 rounded-xl text-stone-300 text-xs font-semibold min-h-[44px] cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => {
                  setTableRequiredPrompt(false);
                  setIsCartOpen(false);
                  handleTabChange('tables');
                }}
                className="btn-tactile-orange flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <span>ไปเลือกโต๊ะทำงาน</span>
                <CanvasIcon name="arrow-right" size={12} color="#0B0B0C" />
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
