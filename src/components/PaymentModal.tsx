/**
 * Lumina 24-Hour Cafe - PromptPay Payment Gateway & Slip Verification Modal
 * Locked Amount EMVCo QR Payload (E-Wallet string strictly hidden from UI)
 * Custom HTML5 Canvas Icons & Stars (No Icon Fonts / SVG Icon Libraries / Emojis)
 * Post-Checkout 1-5 Star Customer Rating Module
 * Web Audio API Tactile Sound Feedback
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00, #10B981, #EF4444)
 */

import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { PromptPayTransaction, BillBreakdown, TableSession } from '../types';
import { renderQRCodeDataUrl, formatThaiDateTimeWithSeconds } from '../services/promptPayService';
import { 
  verifyBankSlip, 
  SlipVerificationResult 
} from '../services/slipVerificationService';
import { cafeStore } from '../services/cafeStore';
import { audioFeedbackService } from '../services/audioFeedbackService';
import { CanvasIcon } from './CanvasIcon';
import { CanvasStarRating } from './CanvasStarRating';
import { CanvasAnimatedCheckmark } from './CanvasAnimatedCheckmark';
import { InteractiveStatusPopup } from './InteractiveStatusPopup';
import { APP_LOGO_BASE64 } from '../data/appLogoBase64';

interface Props {
  transaction: PromptPayTransaction;
  totals: BillBreakdown;
  activeSession: TableSession;
  onConfirmVerifiedCheckout: (slipResult: SlipVerificationResult) => {
    success: boolean;
    tableId: string;
    releasedSessionId: string;
    revokedSecretCode: string;
    receipt: PromptPayTransaction;
  };
  onClose: () => void;
}

const RATING_TAG_OPTIONS = [
  'กาแฟหอมอร่อย',
  'เน็ตเร็วมาก (WiFi 6)',
  'ปลั๊กไฟ PD 100W สะดวก',
  'บรรยากาศเงียบสงบ 24ชม.',
  'เก้าอี้ Ergonomic สบาย',
  'แอร์เย็นกำลังดี',
];

export const PaymentModal: React.FC<Props> = ({
  transaction,
  totals,
  activeSession,
  onConfirmVerifiedCheckout,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [, setVerificationResult] = useState<SlipVerificationResult | null>(null);

  const [settledResult, setSettledResult] = useState<{
    tableId: string;
    revokedSecretCode: string;
    receipt: PromptPayTransaction;
  } | null>(null);
  const [showInteractiveSuccessPopup, setShowInteractiveSuccessPopup] = useState<boolean>(false);

  // Post-Checkout Customer Rating State
  const [customerRating, setCustomerRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['กาแฟหอมอร่อย', 'เน็ตเร็วมาก (WiFi 6)']);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isReviewSubmitted, setIsReviewSubmitted] = useState<boolean>(false);

  // 10-Minute Countdown Timer (600 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [isQrExpired, setIsQrExpired] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSecondsRemaining(600);
    setIsQrExpired(false);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsQrExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [transaction.transactionId]);

  const formatCountdown = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleRegenerateQR = () => {
    cafeStore.initiatePromptPayCheckout();
    setSecondsRemaining(600);
    setIsQrExpired(false);
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  useEffect(() => {
    let isMounted = true;
    renderQRCodeDataUrl(transaction.emvcoPayload).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });
    return () => {
      isMounted = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [transaction.emvcoPayload]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(transaction.emvcoPayload);
    setCopied(true);
    audioFeedbackService.playTactileClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRef = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(type);
    audioFeedbackService.playTactileClickSound();
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict Client-Side File Size Validation (Max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setVerificationError('ขนาดไฟล์ภาพสลิปต้องไม่เกิน 5 MB');
      setSelectedFile(null);
      setPreviewUrl(null);
      e.target.value = '';
      return;
    }

    // Strict Client-Side MIME Whitelist Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setVerificationError('อนุญาตเฉพาะไฟล์รูปภาพนามสกุล .JPG, .PNG หรือ .WEBP เท่านั้น');
      setSelectedFile(null);
      setPreviewUrl(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setVerificationError(null);
    audioFeedbackService.playTactileClickSound();

    // Automatically trigger non-AI background verification immediately without requiring extra buttons
    executeSilentVerification(file);
  };

  // Run the automated non-AI verification script silently in background
  const executeSilentVerification = async (fileToVerify: File | Blob) => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      // Execute Automated Rule-Based Script with Ref1 (D1 + 20 digits) and Ref2 (6 digits table code)
      const result = await verifyBankSlip(
        fileToVerify,
        totals.totalAmount,
        transaction.orderNumber,
        transaction.ref1,
        transaction.ref2 || activeSession.secretCode
      );

      setIsVerifying(false);

      if (!result.isValid) {
        setVerificationError(result.failureReason || 'สลิปไม่ผ่านการตรวจสอบความถูกต้อง หรือยอดเงินไม่ตรงกับบิล');
        return;
      }

      setVerificationResult(result);

      // Trigger automatic Checkout, Table Release, and Revenue Update
      const settled = onConfirmVerifiedCheckout(result);
      setSettledResult({
        tableId: settled.tableId,
        revokedSecretCode: settled.revokedSecretCode,
        receipt: settled.receipt,
      });
      setShowInteractiveSuccessPopup(true);

      // Play success chime
      audioFeedbackService.playSuccessChime();

      // Celebration confetti
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#10B981', '#ffffff'],
      });
    } catch (err: any) {
      setIsVerifying(false);
      setVerificationError(err.message || 'เกิดข้อผิดพลาดระหว่างการตรวจสอบสลิป');
    }
  };

  // Admin-Only Demo Payment Handler (Strictly restricted to Authenticated Admins)
  const isAdmin = cafeStore.getIsAdminAuthenticated();
  const handleAdminDemoPayment = () => {
    if (!isAdmin) return;
    setIsVerifying(true);
    setVerificationError(null);
    audioFeedbackService.playTactileClickSound();

    try {
      const demoResult = cafeStore.adminSimulateDemoPayment();
      setIsVerifying(false);
      setVerificationResult(demoResult);

      const settled = onConfirmVerifiedCheckout(demoResult);
      setSettledResult({
        tableId: settled.tableId,
        revokedSecretCode: settled.revokedSecretCode,
        receipt: settled.receipt,
      });
      setShowInteractiveSuccessPopup(true);

      audioFeedbackService.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#10B981', '#ffffff'],
      });
    } catch (err: any) {
      setIsVerifying(false);
      setVerificationError(err.message || 'เกิดข้อผิดพลาดในการทดลองจ่ายเงินจำลอง');
    }
  };

  // Tag toggle handler with tactile audio
  const handleToggleTag = (tag: string) => {
    audioFeedbackService.playTactileClickSound();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Submit customer review
  const handleSubmitReview = () => {
    if (!settledResult) return;

    cafeStore.submitCustomerReview({
      orderNumber: settledResult.receipt.orderNumber,
      tableId: settledResult.tableId,
      rating: customerRating,
      tags: selectedTags,
      comment: reviewComment.trim() || undefined,
      customerName: `ลูกค้าโต๊ะ ${settledResult.tableId}`,
    });

    setIsReviewSubmitted(true);
    audioFeedbackService.playSuccessChime();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div 
        className="w-full max-w-sm sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain bg-[#1A1A1E] rounded-t-3xl sm:rounded-2xl border border-[#282830] p-5 pb-32 sm:pb-8 shadow-2xl flex flex-col scrollbar-none text-xs"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Header with Study Café 24/7 Logo */}
        <div className="flex items-center justify-between pb-3 border-b border-[#282830] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={APP_LOGO_BASE64}
              alt="Study Café 24/7"
              className="h-12 w-auto max-w-[110px] object-contain filter drop-shadow flex-shrink-0 hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider font-mono block">
                STUDY CAFÉ 24/7 • PAYMENT
              </span>
              <h3 className="text-sm font-bold text-stone-100">
                {settledResult ? 'สรุปการใช้งาน & ประเมินบริการ' : 'ชำระเงินผ่าน PromptPay'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#121214] text-stone-400 hover:text-stone-100 flex items-center justify-center transition border border-[#282830]"
          >
            <CanvasIcon name="close" size={12} color="#A1A1AA" />
          </button>
        </div>

        <div className="py-3 space-y-4 flex-1">
          {!settledResult ? (
            <>
              {/* Order & Locked Amount Summary */}
              <div className="p-3.5 rounded-2xl bg-[#121214] border border-[#282830] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono block">
                    คำสั่งซื้อ: {transaction.orderNumber}
                  </span>
                  <span className="text-xs text-stone-200 font-semibold">
                    โต๊ะ {activeSession.tableId} (PIN: {activeSession.secretCode})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block">ยอดชำระล็อกตายตัว</span>
                  <span className="text-xl font-black text-[#FF6B00] font-mono">
                    ฿{totals.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* PromptPay QR Frame */}
              <div className="p-4 rounded-3xl bg-[#0B0B0C] border border-[#282830] text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF6B00] font-bold text-[10px] border border-[#FF6B00]/30 font-mono">
                    PROMPTPAY
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    สแกนผ่าน Mobile Banking ได้ทุกธนาคาร
                  </span>
                </div>

                {/* 10-MINUTE REAL-TIME COUNTDOWN TIMER */}
                {isQrExpired ? (
                  <div className="p-4 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-center space-y-2.5 my-2">
                    <div className="w-10 h-10 rounded-full bg-[#EF4444]/20 flex items-center justify-center mx-auto text-[#EF4444]">
                      <CanvasIcon name="alert" size={20} color="#EF4444" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#EF4444] block">
                        QR Code หมดอายุแล้ว (เกินกำหนด 10 นาที)
                      </span>
                      <span className="text-[10px] text-stone-400">
                        กรุณากดสร้าง QR Code ใหม่เพื่อความปลอดภัย
                      </span>
                    </div>
                    <button
                      onClick={handleRegenerateQR}
                      className="btn-tactile-orange px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <CanvasIcon name="refresh" size={13} color="#0B0B0C" />
                      <span>สร้าง QR Code ใหม่ (นับเวลา 10 นาที)</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* QR Code Canvas */}
                    <div className="w-52 h-52 mx-auto p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-[#282830]">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="PromptPay QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-stone-500">
                          <CanvasIcon name="refresh" size={24} color="#71717A" animateSpin />
                          <span className="text-[10px] font-mono">กำลังสร้าง QR...</span>
                        </div>
                      )}
                    </div>

                    {/* Countdown Timer Badge */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono font-bold transition-colors ${
                        secondsRemaining <= 120
                          ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444] animate-pulse'
                          : 'bg-[#FF6B00]/10 border-[#FF6B00]/30 text-[#FF8C33]'
                      }`}
                    >
                      <CanvasIcon
                        name="clock"
                        size={14}
                        color={secondsRemaining <= 120 ? '#EF4444' : '#FF6B00'}
                      />
                      <span>
                        กรุณาสแกนชำระเงินภายใน: {formatCountdown(secondsRemaining)} นาที
                      </span>
                    </div>
                  </>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-1.5 text-stone-400 text-[11px]">
                  <CanvasIcon name="lock" size={13} color="#10B981" />
                  <span className="text-stone-300">
                    ยอดเงินล็อกไว้ที่ <strong className="text-[#FF6B00] font-mono">฿{totals.totalAmount.toFixed(2)}</strong> ตามบิล
                  </span>
                </div>

                {/* Second-Precision Creation Timestamp Badge */}
                <div className="text-[11px] text-stone-400 font-mono flex items-center justify-center gap-1.5 pt-1">
                  <CanvasIcon name="clock" size={12} color="#71717A" />
                  <span>
                    สร้างเมื่อ: <strong className="text-stone-300">{transaction.createdAtFormatted || formatThaiDateTimeWithSeconds(new Date(transaction.createdAt))}</strong>
                  </span>
                </div>
              </div>

              {/* SLIP UPLOAD & AUTOMATED BACKEND VERIFICATION SECTION */}
              <div className="p-4 rounded-2xl bg-[#121214] border border-[#282830] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CanvasIcon name="upload" size={15} color="#FF6B00" />
                    <span className="font-bold text-stone-200 text-xs">
                      อัปโหลดสลิปยืนยันการชำระเงิน
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#34D399] text-[9px] font-mono font-bold border border-[#10B981]/30">
                    ตรวจสลิปอัตโนมัติ
                  </span>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed">
                  เมื่อโอนเงินเรียบร้อยแล้ว แตะเลือกไฟล์สลิป ระบบจะตรวจสอบความถูกต้อง ยอดเงิน และตรวจจับรายการซ้ำในระบบหลังบ้านอัตโนมัติทันที
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Upload Picker Trigger Box (Runs Verification Automatically in Background) */}
                <div
                  onClick={() => !isVerifying && fileInputRef.current?.click()}
                  className={`p-4 rounded-xl border border-dashed transition flex flex-col items-center gap-2 ${
                    isVerifying
                      ? 'border-[#FF6B00] bg-[#FF6B00]/10 cursor-wait'
                      : 'border-[#282830] hover:border-[#FF6B00]/60 bg-[#1A1A1E] cursor-pointer'
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex flex-col items-center gap-2 text-[#FF6B00] py-2">
                      <CanvasIcon name="refresh" size={24} color="#FF6B00" animateSpin />
                      <span className="text-xs font-bold">ระบบกำลังตรวจสอบความถูกต้องของสลิปในเบื้องหลัง...</span>
                      <span className="text-[10px] text-stone-400">ตรวจสอบความถูกต้อง ลายน้ำธนาคาร และตรวจจับสลิปซ้ำ</span>
                    </div>
                  ) : previewUrl ? (
                    <div className="flex flex-col items-center gap-1.5 text-stone-200">
                      <div className="flex items-center gap-2 text-[#10B981] text-xs font-semibold">
                        <CanvasIcon name="check-circle" size={16} color="#10B981" />
                        <span>แนบไฟล์สลิปเรียบร้อยแล้ว (แตะเพื่อเปลี่ยนไฟล์)</span>
                      </div>
                      <span className="text-[10px] text-stone-400">แตะเพื่อเปลี่ยนรูปสลิปใหม่หากต้องการ</span>
                    </div>
                  ) : (
                    <>
                      <CanvasIcon name="file" size={24} color="#71717A" />
                      <span className="text-xs text-stone-200 font-semibold">
                        แตะเพื่อเลือกรูปภาพสลิปจริงจากเครื่อง
                      </span>
                      <span className="text-[10px] text-stone-400">
                        ระบบจะตรวจสอบสลิปอัตโนมัติในเบื้องหลังทันทีที่เลือกรูปภาพ
                      </span>
                    </>
                  )}
                </div>

                {/* Verification Error Display */}
                {verificationError && (
                  <div className="p-2.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-[11px] flex items-center gap-2">
                    <CanvasIcon name="alert" size={14} color="#EF4444" />
                    <span>{verificationError}</span>
                  </div>
                )}

                {/* ADMIN-ONLY DEMO PAYMENT TEST RUNNER (STRICTLY HIDDEN FROM REGULAR USERS) */}
                {isAdmin && (
                  <div className="p-3 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/40 space-y-2 text-left animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CanvasIcon name="shield" size={13} color="#FF6B00" />
                        <span className="font-bold text-[11px] text-[#FF6B00]">
                          Admin Demo Payment Mode (เฉพาะผู้ดูแลระบบ)
                        </span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-[#FF6B00]/25 text-[#FF6B00] text-[8px] font-mono font-bold border border-[#FF6B00]/40">
                        ADMIN ONLY
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-300 leading-relaxed">
                      สำหรับผู้ดูแลระบบ: จำลองการชำระเงินเพื่อทดสอบการทำงานของระบบ Checkout และการคืนสถานะโต๊ะได้ทันที
                    </p>
                    <button
                      onClick={handleAdminDemoPayment}
                      disabled={isVerifying}
                      className="w-full py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8C33] active:translate-y-0.5 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#FF6B00]/20 transition"
                    >
                      <CanvasIcon name="sparkles" size={14} color="#0B0B0C" />
                      <span>[Admin] จำลองชำระเงินสำเร็จทันที (Simulate Settle)</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Checkout Completed & Post-Checkout Customer Rating View */
            <div className="py-2 text-center space-y-4">
              <div className="flex justify-center">
                <CanvasAnimatedCheckmark size={96} />
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#34D399] font-mono tracking-widest uppercase">
                  CHECKOUT COMPLETED
                </span>
                <h4 className="text-base font-bold text-stone-100 mt-0.5">
                  ตรวจสอบสลิป &amp; ชำระเงินสำเร็จ
                </h4>
                <p className="text-[11px] text-stone-400">
                  ขอบคุณที่ใช้บริการ Study Café 24/7
                </p>
              </div>

              {/* Settlement Summary Receipt (Customer-Facing Clean Receipt) */}
              <div className="p-3.5 rounded-2xl bg-[#121214] border border-[#282830] text-left space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-stone-400">หมายเลขคำสั่งซื้อ:</span>
                  <span className="font-mono text-stone-200 font-bold">{settledResult.receipt.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">เลขอ้างอิงธุรกรรมธนาคาร:</span>
                  <span className="font-mono text-[#FF8C33] font-bold">{settledResult.receipt.bankReferenceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">ยอดเงินที่ชำระ:</span>
                  <span className="font-mono text-[#34D399] font-bold">฿{settledResult.receipt.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">สถานะโต๊ะ {settledResult.tableId}:</span>
                  <span className="text-[#34D399] font-bold">เปลี่ยนเป็น ว่าง (AVAILABLE) เรียบร้อย</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-[#282830] text-[10px]">
                  <span className="text-stone-500">เวลาที่ชำระเงิน:</span>
                  <span className="text-stone-400 font-mono">{formatThaiDateTimeWithSeconds(new Date(settledResult.receipt.settledAt || Date.now()))}</span>
                </div>
              </div>

              {/* POST-CHECKOUT CUSTOMER RATING MODULE */}
              <div className="p-4 rounded-2xl bg-[#141418] border border-[#FF6B00]/30 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CanvasIcon name="sparkles" size={16} color="#FF6B00" />
                    <span className="font-bold text-stone-100 text-xs">
                      ให้คะแนนความพึงพอใจการใช้บริการ
                    </span>
                  </div>
                  <span className="text-[10px] text-[#FF8C33] font-mono">1-5 Stars</span>
                </div>

                {!isReviewSubmitted ? (
                  <>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      ประสบการณ์การใช้บริการโต๊ะ {settledResult.tableId} และกาแฟของคุณเป็นอย่างไรบ้าง?
                    </p>

                    {/* Interactive HTML5 Canvas Star Rating */}
                    <div className="py-2 flex flex-col items-center justify-center gap-1.5 bg-[#0B0B0C] rounded-xl border border-[#282830] p-2">
                      <CanvasStarRating
                        value={customerRating}
                        onChange={(r) => setCustomerRating(r)}
                        size={32}
                        showScoreText
                      />
                      <span className="text-[10px] text-stone-400">แตะดาวเพื่อให้คะแนน (1 ถึง 5 ดาว)</span>
                    </div>

                    {/* Quick Impression Tags */}
                    <div>
                      <span className="text-[10px] text-stone-400 block mb-1.5">จุดที่คุณประทับใจ:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {RATING_TAG_OPTIONS.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => handleToggleTag(tag)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                                isSelected
                                  ? 'bg-[#FF6B00]/25 text-[#FF8C33] border border-[#FF6B00]/50 font-semibold'
                                  : 'bg-[#1A1A1E] text-stone-400 border border-[#282830] hover:text-stone-300'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Comment input */}
                    <textarea
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="ความคิดเห็นเพิ่มเติม (ไม่บังคับ)..."
                      className="w-full p-2.5 rounded-xl bg-[#0B0B0C] border border-[#282830] text-[11px] text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-[#FF6B00]"
                    />

                    {/* Submit Review CTA */}
                    <button
                      onClick={handleSubmitReview}
                      className="btn-tactile-orange w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      <CanvasIcon name="check" size={14} color="#0B0B0C" />
                      <span>ส่งความคิดเห็น & บันทึกลงระบบ</span>
                    </button>
                  </>
                ) : (
                  /* Review Submitted Success State */
                  <div className="py-3 text-center space-y-2 bg-[#0B0B0C] rounded-xl border border-[#10B981]/30 p-3">
                    <div className="flex items-center justify-center gap-1.5 text-[#10B981] font-bold text-xs">
                      <CanvasIcon name="check-circle" size={16} color="#10B981" />
                      <span>บันทึกคะแนนรีวิว {customerRating} ดาวเรียบร้อย</span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed">
                      ข้อมูลคะแนนถูกนำไปคำนวณคะแนนเฉลี่ยบนระบบหลังบ้านเรียบร้อย ขอบคุณสำหรับความคิดเห็นที่มีคุณค่า
                    </p>
                  </div>
                )}
              </div>

              {/* Final Close Button */}
              <button
                onClick={onClose}
                className="btn-tactile-dark w-full py-3 rounded-xl text-xs font-semibold"
              >
                เสร็จสิ้น & ปิดหน้าต่าง
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Status Popup with HTML5 Canvas Animated Checkmark & Vector Stroke */}
      {showInteractiveSuccessPopup && settledResult && (
        <InteractiveStatusPopup
          isOpen={showInteractiveSuccessPopup}
          type="SUCCESS_PAYMENT"
          title="ชำระเงิน & ตรวจสอบสลิปสำเร็จ"
          subtitle="ระบบหักยอดชำระเงิน ตรวจสอบสลิปความถูกต้อง และคืนสถานะโต๊ะทำงานเรียบร้อยแล้ว"
          details={
            <div className="p-3.5 rounded-2xl bg-[#0B0B0C] border border-[#282830] space-y-1.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-stone-400">เลขที่คำสั่งซื้อ:</span>
                <span className="font-mono text-[#FF8C33] font-bold">{settledResult.receipt.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Ref 1 (D1 + 20 หลัก):</span>
                <span className="font-mono text-[#FF8C33] font-bold text-[11px]">{settledResult.receipt.ref1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Ref 2 (รหัสโต๊ะ 6 หลัก):</span>
                <span className="font-mono text-[#34D399] font-bold">{settledResult.receipt.ref2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">ยอดชำระสุทธิ:</span>
                <span className="font-mono text-[#10B981] font-bold text-sm">฿{settledResult.receipt.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">เลขอ้างอิงธนาคาร:</span>
                <span className="font-mono text-stone-300">{settledResult.receipt.bankReferenceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">สถานะโต๊ะ {settledResult.tableId}:</span>
                <span className="text-[#10B981] font-bold">AVAILABLE (โต๊ะว่างพร้อมใช้งาน)</span>
              </div>
            </div>
          }
          primaryButtonText="ดูใบเสร็จ & ให้คะแนนบริการ"
          onPrimaryClick={() => setShowInteractiveSuccessPopup(false)}
          secondaryButtonText="ปิด"
          onSecondaryClick={() => {
            setShowInteractiveSuccessPopup(false);
            onClose();
          }}
          onClose={() => setShowInteractiveSuccessPopup(false)}
        />
      )}
    </div>
  );
};
