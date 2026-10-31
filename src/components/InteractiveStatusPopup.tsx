/**
 * Lumina 24-Hour Cafe - Interactive Status Popup with HTML5 Canvas Automation
 * Displays animated success vector checkmarks, status chimes, and tactile neumorphic cards
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CanvasAnimatedCheckmark } from './CanvasAnimatedCheckmark';
import { CanvasIcon } from './CanvasIcon';
import { audioFeedbackService } from '../services/audioFeedbackService';

export type PopupType = 'SUCCESS_BOOKING' | 'SUCCESS_PAYMENT' | 'TABLE_FULL' | 'ALERT';

interface Props {
  isOpen: boolean;
  type: PopupType;
  title: string;
  subtitle?: string;
  details?: React.ReactNode;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onClose: () => void;
}

export const InteractiveStatusPopup: React.FC<Props> = ({
  isOpen,
  type,
  title,
  subtitle,
  details,
  primaryButtonText = 'ตกลง',
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="relative w-full max-w-sm rounded-[32px] bg-[#141418] border border-[#282832] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(255,107,0,0.08)] text-center space-y-4 z-10 overflow-hidden"
          >
            {/* Top decorative ambient flare */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 rounded-full blur-2xl pointer-events-none ${
              type === 'TABLE_FULL' || type === 'ALERT'
                ? 'bg-[#EF4444]/15'
                : 'bg-[#10B981]/20'
            }`} />

            {/* Animation Graphic Header */}
            <div className="pt-2">
              {type === 'SUCCESS_BOOKING' || type === 'SUCCESS_PAYMENT' ? (
                <div className="flex justify-center">
                  <CanvasAnimatedCheckmark size={96} playAudio={true} />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-center mx-auto shadow-inner">
                  <CanvasIcon name="alert" size={32} color="#EF4444" />
                </div>
              )}
            </div>

            {/* Content Text */}
            <div className="space-y-1">
              <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                type === 'TABLE_FULL' || type === 'ALERT' ? 'text-[#EF4444]' : 'text-[#10B981]'
              }`}>
                {type === 'SUCCESS_BOOKING' && 'SESSION CHECK-IN VERIFIED'}
                {type === 'SUCCESS_PAYMENT' && 'PROMPTPAY SETTLEMENT SUCCESS'}
                {type === 'TABLE_FULL' && 'ZONE CAPACITY LIMIT REACHED'}
                {type === 'ALERT' && 'SYSTEM NOTIFICATION'}
              </span>
              <h3 className="text-lg font-extrabold text-stone-100 tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Custom Details slot */}
            {details && (
              <div className="text-left pt-1">
                {details}
              </div>
            )}

            {/* Action Buttons with Neumorphic Tactile Effects */}
            <div className="flex gap-2 pt-2">
              {secondaryButtonText && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    audioFeedbackService.playTactileClickSound();
                    if (onSecondaryClick) onSecondaryClick();
                    else onClose();
                  }}
                  className="btn-tactile-dark flex-1 py-3 rounded-2xl text-stone-300 text-xs font-semibold"
                >
                  {secondaryButtonText}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  audioFeedbackService.playTactileClickSound();
                  if (onPrimaryClick) onPrimaryClick();
                  else onClose();
                }}
                className={`btn-tactile-orange flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg ${
                  type === 'TABLE_FULL' || type === 'ALERT' ? '!bg-[#282832] !text-stone-200' : ''
                }`}
              >
                <span>{primaryButtonText}</span>
                <CanvasIcon name="arrow-right" size={12} color="#0B0B0C" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
