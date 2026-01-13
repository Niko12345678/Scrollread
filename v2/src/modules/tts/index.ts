import type { TtsEngine, TtsController, Settings } from '../../types';
import { getBrowserTts, isBrowserTtsSupported } from './browserTts';
import { getElevenLabsTts } from './elevenLabsTts';

export * from './browserTts';
export * from './elevenLabsTts';

// ============================================================
// TTS FACTORY
// ============================================================

/**
 * Get the appropriate TTS engine based on settings
 */
export function getTtsEngine(settings: Settings): TtsController {
  const engine: TtsEngine = settings.ttsEngine || 'browser';

  switch (engine) {
    case 'browser':
      if (!isBrowserTtsSupported()) {
        throw new Error('Browser TTS is not supported in this browser');
      }
      return getBrowserTts();

    case 'elevenlabs':
      if (!settings.elevenLabsKey) {
        throw new Error('ElevenLabs API key not set');
      }
      return getElevenLabsTts(settings.elevenLabsKey);

    default:
      console.warn(`Unknown TTS engine: ${engine}, falling back to browser TTS`);
      return getBrowserTts();
  }
}

/**
 * Get the selected voice name based on settings and engine
 */
export function getSelectedVoice(settings: Settings): string {
  if (settings.ttsEngine === 'elevenlabs' && settings.elevenLabsVoice) {
    return settings.elevenLabsVoice;
  }

  return settings.browserVoice || '';
}
