import React, { useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface PresentationOverlayProps {
  isOpen: boolean;
  slideTitle: string;
  currentSlideIndex: number;
  totalSlides: number;
  isAutoPlay: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleAutoPlay: () => void;
  onGoToSlide: (index: number) => void;
  onClose: () => void;
}

export const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  isOpen,
  slideTitle,
  currentSlideIndex,
  totalSlides,
  isAutoPlay,
  onPrev,
  onNext,
  onToggleAutoPlay,
  onGoToSlide,
  onClose
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  // Auto-advance timer
  useEffect(() => {
    if (!isOpen || !isAutoPlay) return;

    const interval = setInterval(() => {
      onNext();
    }, 8000); // 8 seconds per slide

    return () => clearInterval(interval);
  }, [isOpen, isAutoPlay, onNext]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#00205B]/90 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-4 animate-in slide-in-from-bottom-6 duration-200">
      {/* Slide Info */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/20">
        <span className="text-xs font-bold text-white max-w-[140px] truncate">{slideTitle}</span>
        <span className="text-[11px] font-mono text-blue-200">
          {currentSlideIndex + 1} / {totalSlides}
        </span>
      </div>

      {/* Slide Navigation Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrev}
          title="Previous slide (Left Arrow)"
          className="p-1.5 rounded-full hover:bg-white/15 transition-colors text-white disabled:opacity-30"
          disabled={currentSlideIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleAutoPlay}
          title={isAutoPlay ? 'Pause auto-advance' : 'Start auto-advance (8s)'}
          className="p-1.5 rounded-full hover:bg-white/15 transition-colors text-white flex items-center gap-1 px-2.5 text-xs font-medium"
        >
          {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isAutoPlay ? 'Pause' : 'Auto'}</span>
        </button>

        <button
          onClick={onNext}
          title="Next slide (Right Arrow / Space)"
          className="p-1.5 rounded-full hover:bg-white/15 transition-colors text-white disabled:opacity-30"
          disabled={currentSlideIndex === totalSlides - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="hidden sm:flex items-center gap-1.5 px-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => onGoToSlide(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === currentSlideIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
            }`}
            title={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Exit Button */}
      <button
        onClick={onClose}
        title="Exit presentation (Esc)"
        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white ml-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
