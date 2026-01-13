import type { TtsConfig, TtsController } from '../../types';

// ============================================================
// BROWSER TTS ENGINE (Web Speech API)
// ============================================================

class BrowserTtsEngine implements TtsController {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isPausedState = false;
  private isPlayingState = false;
  private onWordBoundaryCallback?: (wordIndex: number) => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;
  private wordTokens: Array<{ start: number; end: number }> = [];

  async speak(text: string, config: TtsConfig): Promise<void> {
    // Stop any ongoing speech
    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      this.utterance = utterance;

      // Calculate rate from WPM
      // Average word length is ~5 characters + 1 space = 6 chars
      // WPM = (chars/min) / 6
      // SpeechSynthesis rate: 1.0 = default, 0.1-10 range
      // Default rate is ~180 WPM, so:
      // rate = (target WPM / 180)
      const baseRate = config.wpm / 180;
      utterance.rate = Math.max(0.1, Math.min(10, baseRate));
      utterance.pitch = 1;

      // Set voice
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find((v) => v.name === config.voice);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else if (voices.length > 0) {
        // Fallback: use first Italian voice or first available voice
        const italianVoice = voices.find((v) => v.lang.startsWith('it'));
        utterance.voice = italianVoice || voices[0];
        console.warn('Selected voice not found, using fallback:', utterance.voice?.name);
      }

      // Store callbacks
      this.onWordBoundaryCallback = config.onWordBoundary;
      this.onEndCallback = config.onEnd;
      this.onErrorCallback = config.onError;

      // Word boundary events for karaoke highlighting
      utterance.onboundary = (event) => {
        if (this.utterance !== utterance) return;

        if (event.name === 'word' && this.onWordBoundaryCallback) {
          const charIndex = event.charIndex;

          // Find the token that matches this character position
          const tokenIndex = this.wordTokens.findIndex(
            (t) => charIndex >= t.start && charIndex < t.end
          );

          if (tokenIndex !== -1) {
            this.onWordBoundaryCallback(tokenIndex);
          }
        }
      };

      utterance.onstart = () => {
        this.isPlayingState = true;
        this.isPausedState = false;
      };

      utterance.onend = () => {
        if (this.utterance !== utterance) return;

        this.isPlayingState = false;
        this.isPausedState = false;
        this.utterance = null;

        if (this.onEndCallback) {
          this.onEndCallback();
        }

        resolve();
      };

      utterance.onerror = (event) => {
        if (this.utterance !== utterance) return;

        this.isPlayingState = false;
        this.isPausedState = false;
        this.utterance = null;

        const error = new Error(`Speech synthesis error: ${event.error}`);

        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }

        reject(error);
      };

      // Start speech
      try {
        speechSynthesis.speak(utterance);
        this.isPlayingState = true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (this.onErrorCallback) {
          this.onErrorCallback(err);
        }
        reject(err);
      }
    });
  }

  pause(): void {
    if (this.isPlayingState && !this.isPausedState) {
      speechSynthesis.pause();
      this.isPausedState = true;
    }
  }

  resume(): void {
    if (this.isPausedState) {
      speechSynthesis.resume();
      this.isPausedState = false;
    }
  }

  stop(): void {
    if (this.isPlayingState || this.isPausedState) {
      speechSynthesis.cancel();
      this.isPlayingState = false;
      this.isPausedState = false;
      this.utterance = null;
    }
  }

  isPlaying(): boolean {
    return this.isPlayingState && !this.isPausedState;
  }

  isPaused(): boolean {
    return this.isPausedState;
  }

  setWordTokens(tokens: Array<{ start: number; end: number }>): void {
    this.wordTokens = tokens;
  }

  /**
   * Get available voices.
   * Note: On some browsers, voices are loaded asynchronously.
   * Use the onvoiceschanged event to detect when voices are ready.
   */
  static getVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }

  /**
   * Wait for voices to be loaded (for browsers that load them asynchronously)
   */
  static async waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();

      if (voices.length > 0) {
        resolve(voices);
      } else {
        speechSynthesis.onvoiceschanged = () => {
          resolve(speechSynthesis.getVoices());
        };
      }
    });
  }

  /**
   * Sort voices with Italian voices first
   */
  static sortVoicesItalianFirst(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
    return [...voices].sort((a, b) => {
      if (a.lang.startsWith('it') && !b.lang.startsWith('it')) return -1;
      if (!a.lang.startsWith('it') && b.lang.startsWith('it')) return 1;
      return 0;
    });
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

let browserTtsInstance: BrowserTtsEngine | null = null;

export function getBrowserTts(): BrowserTtsEngine {
  if (!browserTtsInstance) {
    browserTtsInstance = new BrowserTtsEngine();
  }
  return browserTtsInstance;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if the browser supports the Web Speech API
 */
export function isBrowserTtsSupported(): boolean {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Get available voices (with automatic waiting for async loading)
 */
export async function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return BrowserTtsEngine.waitForVoices();
}

/**
 * Get Italian voices (sorted)
 */
export async function getItalianVoices(): Promise<SpeechSynthesisVoice[]> {
  const voices = await getAvailableVoices();
  return BrowserTtsEngine.sortVoicesItalianFirst(voices);
}
