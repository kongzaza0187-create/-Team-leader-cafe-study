/**
 * Study Café 24/7 - Client Security Guard & Viewport Lock
 * Features:
 * 1. Disable Zoom In / Zoom Out (Pinch zoom, double-tap zoom, Ctrl+wheel, keyboard zoom)
 * 2. Disable DevTools Shortcuts & Context Menu (F12, Ctrl+Shift+I/J/C, Ctrl+U, Right-Click)
 * 3. Quiet Luxury Protection with Zero Console Spam
 */

export function initSecurityGuard(): void {
  if (typeof window === 'undefined') return;

  // 1. DISABLE CONTEXT MENU (Right click & Long-press inspect menu)
  document.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault();
  }, { capture: true });

  // 2. DISABLE DEVTOOLS KEYBOARD SHORTCUTS
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Picker), Ctrl+Shift+K (Firefox)
    if (isCtrlOrMeta && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+Option+U (View Source)
    if (isCtrlOrMeta && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if (isCtrlOrMeta && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+P / Cmd+P (Print Page)
    if (isCtrlOrMeta && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // 3. DISABLE KEYBOARD ZOOM IN / ZOOM OUT (Ctrl + '+', Ctrl + '-', Ctrl + '0', Ctrl + '=')
    if (isCtrlOrMeta && ['+', '-', '=', '0', '_'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 4. DISABLE MOUSE WHEEL ZOOM (Ctrl + Mouse Wheel)
  window.addEventListener('wheel', (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  }, { passive: false });

  // 5. DISABLE PINCH-TO-ZOOM GESTURES (iOS Safari & Modern Browsers)
  document.addEventListener('gesturestart', (e: Event) => {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturechange', (e: Event) => {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('gestureend', (e: Event) => {
    e.preventDefault();
  }, { passive: false });

  // 6. DISABLE MULTI-TOUCH PINCH ZOOM ON TOUCH DEVICES
  document.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchmove', (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // 7. DISABLE MOBILE DOUBLE-TAP TO ZOOM
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // 8. ANTI-DEVTOOLS CONSOLE CLEANER & WARNING
  try {
    const notice = '%cStudy Café 24/7 Security Shield Active - DevTools are restricted.';
    console.info(notice, 'color: #FF6B00; font-weight: bold; font-size: 14px;');
  } catch {}
}
