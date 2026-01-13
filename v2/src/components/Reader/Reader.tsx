import { useState, useEffect, useRef, useCallback } from 'react';
import { saveProgress, getProgress } from '../../modules/storage';
import { getTtsEngine, getSelectedVoice } from '../../modules/tts';
import { getBrowserTts } from '../../modules/tts';
import { tokenizeWithPositions, createTextChunks } from '../../modules/epub';
import type { Book, Settings, WordPosition } from '../../types';

interface ReaderProps {
  book: Book;
  settings: Settings;
  onBack: () => void;
  onOpenSettings: () => void;
}

export function Reader({ book, settings, onBack, onOpenSettings }: ReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [tokens, setTokens] = useState<WordPosition[]>([]);
  const [showUI, setShowUI] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isSpeedBoosted, setIsSpeedBoosted] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);

  const currentPageRef = useRef(currentPage);
  const isSpeakingRef = useRef(isSpeaking);
  const holdTimeoutRef = useRef<number | null>(null);

  // Create chunks if not already present
  const chunks = book.chunks || createTextChunks(book.fullText);
  const totalPages = chunks.length;

  // Load saved progress
  useEffect(() => {
    loadProgress();
  }, [book.id]);

  // Update refs
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Tokenize current page
  useEffect(() => {
    const pageTokens = tokenizeWithPositions(chunks[currentPage].text);
    setTokens(pageTokens);
    setCurrentWordIndex(-1);

    // Update TTS engine word tokens for browser TTS
    if (settings.ttsEngine === 'browser') {
      const browserTts = getBrowserTts();
      browserTts.setWordTokens(pageTokens);
    }
  }, [currentPage, chunks, settings.ttsEngine]);

  // Save progress on page change
  useEffect(() => {
    saveProgressToDb();
  }, [currentPage]);

  const loadProgress = async () => {
    try {
      const progress = await getProgress(book.id);
      if (progress) {
        setCurrentPage(progress.currentPage);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const saveProgressToDb = async () => {
    try {
      await saveProgress({
        id: book.id,
        type: 'book',
        currentPage,
        totalPages,
        lastReadAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const stopSpeaking = useCallback(() => {
    const tts = getTtsEngine(settings);
    tts.stop();
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
  }, [settings]);

  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(0, Math.min(totalPages - 1, page));

    // Save speaking state for autoplay
    if (isSpeakingRef.current) {
      setShouldAutoplay(true);
    }

    stopSpeaking();
    setCurrentPage(newPage);
  }, [totalPages, stopSpeaking]);

  const speak = useCallback(async () => {
    try {
      const text = chunks[currentPageRef.current].text;
      const tts = getTtsEngine(settings);
      const voice = getSelectedVoice(settings);

      setIsSpeaking(true);

      // Apply speed boost if active
      const effectiveWpm = settings.wpm * (isSpeedBoosted ? 2 : 1);

      await tts.speak(text, {
        engine: settings.ttsEngine,
        voice,
        wpm: effectiveWpm,
        onWordBoundary: (wordIndex) => {
          setCurrentWordIndex(wordIndex);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setCurrentWordIndex(-1);

          // Auto-advance to next page
          if (settings.autoAdvance && currentPageRef.current < totalPages - 1) {
            goToPage(currentPageRef.current + 1);
          }
        },
        onError: (error) => {
          console.error('TTS error:', error);
          setIsSpeaking(false);
          setCurrentWordIndex(-1);
          alert(`Errore TTS: ${error.message}`);
        },
      });
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
    }
  }, [chunks, settings, totalPages, goToPage, isSpeedBoosted]);

  const toggleSpeaking = useCallback(() => {
    if (isSpeakingRef.current) {
      stopSpeaking();
    } else {
      speak();
    }
  }, [speak, stopSpeaking]);

  // Handle autoplay after page change
  useEffect(() => {
    if (shouldAutoplay) {
      setShouldAutoplay(false);
      const timer = setTimeout(() => {
        speak();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoplay, speak]);

  // Speed boost control
  const enableSpeedBoost = useCallback(() => {
    if (!isSpeedBoosted && isSpeakingRef.current) {
      setIsSpeedBoosted(true);
      // Restart speaking with new speed
      stopSpeaking();
      setTimeout(() => speak(), 100);
    }
  }, [isSpeedBoosted, stopSpeaking, speak]);

  const disableSpeedBoost = useCallback(() => {
    if (isSpeedBoosted && isSpeakingRef.current) {
      setIsSpeedBoosted(false);
      // Restart speaking with normal speed
      stopSpeaking();
      setTimeout(() => speak(), 100);
    }
  }, [isSpeedBoosted, stopSpeaking, speak]);

  // Touch/swipe handlers with long-press for speed boost
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
    setShowUI(true);

    // Start long press timer for speed boost (activate after 200ms)
    if (isSpeakingRef.current) {
      holdTimeoutRef.current = window.setTimeout(() => {
        enableSpeedBoost();
      }, 200);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Cancel long press timer
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    // Disable speed boost if active
    if (isSpeedBoosted) {
      disableSpeedBoost();
    }

    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) goToPage(currentPage + 1);
      else goToPage(currentPage - 1);
    }

    setTouchStart(null);
  };

  const handleTouchCancel = () => {
    // Cancel long press timer
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    // Disable speed boost if active
    if (isSpeedBoosted) {
      disableSpeedBoost();
    }

    setTouchStart(null);
  };

  // Mouse handlers for desktop long-press
  const handleMouseDown = () => {
    if (isSpeakingRef.current) {
      holdTimeoutRef.current = window.setTimeout(() => {
        enableSpeedBoost();
      }, 200);
    }
  };

  const handleMouseUp = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (isSpeedBoosted) {
      disableSpeedBoost();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          goToPage(currentPage - 1);
          break;
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          goToPage(currentPage + 1);
          break;
        case 'Enter':
          e.preventDefault();
          toggleSpeaking();
          break;
        case 'Escape':
          e.preventDefault();
          stopSpeaking();
          onBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, goToPage, toggleSpeaking, stopSpeaking, onBack]);

  // Cleanup hold timeout on unmount
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  // Render text with highlighting
  const renderText = () => {
    if (!settings.highlightEnabled || currentWordIndex === -1) {
      return <span>{chunks[currentPage].text}</span>;
    }

    const text = chunks[currentPage].text;
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    tokens.forEach((token, index) => {
      // Add text before token
      if (token.start > lastEnd) {
        parts.push(
          <span key={`text-${index}`} style={{ opacity: 0.6 }}>
            {text.slice(lastEnd, token.start)}
          </span>
        );
      }

      // Add token with highlight
      const isHighlighted = index === currentWordIndex;
      parts.push(
        <span
          key={`word-${index}`}
          style={{
            background: isHighlighted ? 'var(--highlight-bg)' : 'transparent',
            textShadow: isHighlighted ? 'var(--highlight-glow)' : 'none',
            transition: 'all 0.1s ease',
            opacity: isHighlighted ? 1 : index < currentWordIndex ? 0.85 : 0.6,
          }}
        >
          {token.word}
        </span>
      );

      lastEnd = token.end;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      parts.push(
        <span key="text-end" style={{ opacity: 0.6 }}>
          {text.slice(lastEnd)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-gradient)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => setShowUI(!showUI)}
    >
      {/* Top UI Bar */}
      {showUI && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: 'var(--overlay-bg)',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              stopSpeaking();
              onBack();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ←
          </button>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {currentPage + 1} / {totalPages}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            ⚙️
          </button>
        </div>
      )}

      {/* Main Text */}
      <div
        style={{
          padding: '6rem 2rem',
          maxWidth: '700px',
          margin: '0 auto',
          color: 'var(--text)',
          fontSize: '1.5rem',
          lineHeight: '2.2',
          textAlign: 'justify',
          userSelect: 'none',
        }}
      >
        {renderText()}
      </div>

      {/* Bottom Controls */}
      {showUI && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--overlay-bg)',
            padding: '2rem 1rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            zIndex: 10,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPage(currentPage - 1);
            }}
            disabled={currentPage === 0}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text)',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1.2rem',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 0 ? 0.5 : 1,
            }}
          >
            ↑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSpeaking();
            }}
            style={{
              background: 'var(--accent)',
              border: 'none',
              color: '#fff',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {isSpeaking ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPage(currentPage + 1);
            }}
            disabled={currentPage === totalPages - 1}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text)',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1.2rem',
              cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages - 1 ? 0.5 : 1,
            }}
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
}
