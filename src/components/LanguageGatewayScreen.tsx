/**
 * Study Café 24/7 - Multi-Language Selection Gateway
 * Initial landing screen for first-time visitors
 * Supports 5 authentic native speaker languages: TH, EN, JA, PT, ZH
 * Session-Locked selection policy
 */

import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../i18n/translations';
import { APP_LOGO_BASE64 } from '../data/appLogoBase64';
import { audioFeedbackService } from '../services/audioFeedbackService';
import { CanvasIcon } from './CanvasIcon';
import { WebGLAmbientBackground } from './WebGLAmbientBackground';

interface Props {
  onLanguageSelected?: (lang: AppLanguage) => void;
  onSelectLanguage?: (lang: AppLanguage) => void;
}

export const LanguageGatewayScreen: React.FC<Props> = ({ onLanguageSelected, onSelectLanguage }) => {
  const [selectedLang, setSelectedLang] = useState<AppLanguage>('th');

  const handleSelect = (code: AppLanguage) => {
    setSelectedLang(code);
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  const handleConfirm = () => {
    try {
      audioFeedbackService.playSuccessChime();
    } catch {}
    if (onLanguageSelected) onLanguageSelected(selectedLang);
    if (onSelectLanguage) onSelectLanguage(selectedLang);
  };

  const currentDict = TRANSLATIONS[selectedLang];

  return (
    <div className="min-h-screen w-full bg-[#070708] text-stone-100 flex flex-col items-center justify-center relative overflow-hidden px-4 py-8 select-none">
      {/* Dynamic Ambient Background */}
      <WebGLAmbientBackground />

      {/* Main Glassmorphic Gateway Container */}
      <div className="w-full max-w-lg bg-[#0F0F13]/90 backdrop-blur-2xl border border-[#242430] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-400">
        
        {/* Brand Header: Logo (Zero container box, clean Quiet Luxury) */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src={APP_LOGO_BASE64}
            alt="Study Café 24/7"
            className="h-20 sm:h-24 w-auto object-contain filter drop-shadow-2xl hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                STUDY CAFÉ 24/7
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF8C33] text-[10px] font-mono font-bold border border-[#FF6B00]/30 tracking-wider">
                {currentDict.open24Hours}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              {currentDict.selectLanguagePrompt}
            </p>
          </div>
        </div>

        {/* 5 Language Selection Cards */}
        <div className="space-y-2.5">
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = selectedLang === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => handleSelect(opt.code)}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#20150A] to-[#120E0A] border-[#FF6B00] shadow-lg shadow-[#FF6B00]/15 scale-[1.01]'
                    : 'bg-[#141418] border-[#22222A] hover:border-[#383846] hover:bg-[#181820]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl flex-shrink-0" role="img" aria-label={opt.name}>
                    {opt.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isSelected ? 'text-[#FF8C33]' : 'text-white'}`}>
                        {opt.nativeName}
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono">
                        ({opt.name})
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 block mt-0.5 truncate max-w-[260px] sm:max-w-xs">
                      {opt.greeting}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center w-6 h-6 rounded-full border transition-all flex-shrink-0 ml-2 ${
                  isSelected ? 'border-[#FF6B00] bg-[#FF6B00] text-[#070708]' : 'border-[#383844] bg-[#0E0E12]'
                }">
                  {isSelected ? (
                    <CanvasIcon name="check" size={14} color="#070708" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-transparent" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Locked Session Notice */}
        <div className="p-3 rounded-2xl bg-[#09090C] border border-[#222228] flex items-start gap-2.5 text-[11px] text-stone-400">
          <div className="w-4 h-4 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center flex-shrink-0 mt-0.5">
            <CanvasIcon name="shield" size={10} color="#FF6B00" />
          </div>
          <p className="leading-relaxed">
            <strong className="text-stone-300">Session Policy:</strong> {currentDict.languageLockNotice}
          </p>
        </div>

        {/* Confirm & Enter App CTA Button */}
        <button
          onClick={handleConfirm}
          className="btn-tactile-orange w-full py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#FF6B00]/25 active:scale-[0.98] transition-all min-h-[50px]"
        >
          <span>{currentDict.enterAppButton}</span>
          <CanvasIcon name="arrow-right" size={14} color="#0B0B0C" />
        </button>
      </div>

      {/* Discreet Quiet Luxury Footer */}
      <footer className="mt-6 text-[10px] text-stone-400 text-center relative z-10 font-mono">
        Study Café 24/7 Platform • Enterprise Multi-Language Architecture
      </footer>
    </div>
  );
};
