import type { TtsConfig, TtsController } from '../../types';

// ============================================================
// ELEVENLABS VOICES
// ============================================================

export const ELEVENLABS_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (English, Italian)' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (English)' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (English)' },
] as const;

// ============================================================
// ELEVENLABS TTS ENGINE
// ============================================================

class ElevenLabsTtsEngine implements TtsController {
  private apiKey: string;
  private audioContext: AudioContext | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private isPlayingState = false;
  private isPausedState = false;
  private pausedAt = 0;
  private startedAt = 0;
  private duration = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async speak(text: string, config: TtsConfig): Promise<void> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not set');
    }

    // Stop any ongoing speech
    this.stop();

    // Find voice ID
    const voice = ELEVENLABS_VOICES.find((v) => v.name === config.voice);
    const voiceId = voice?.id || ELEVENLABS_VOICES[0].id;

    try {
      // Call ElevenLabs API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
      }

      const audioBlob = await response.blob();
      const audioBuffer = await this.decodeAudioData(audioBlob);

      // Play audio
      await this.playAudioBuffer(audioBuffer, config);
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      if (config.onError) {
        config.onError(error instanceof Error ? error : new Error(String(error)));
      }
      throw error;
    }
  }

  private async decodeAudioData(audioBlob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await audioBlob.arrayBuffer();

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    return this.audioContext.decodeAudioData(arrayBuffer);
  }

  private async playAudioBuffer(
    audioBuffer: AudioBuffer,
    config: TtsConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      this.audioSource = source;
      this.duration = audioBuffer.duration;
      this.startedAt = this.audioContext.currentTime;
      this.isPlayingState = true;

      // Estimate word timing (since ElevenLabs doesn't provide word boundaries)
      if (config.onWordBoundary) {
        this.estimateWordTiming(audioBuffer.duration, config);
      }

      source.onended = () => {
        this.isPlayingState = false;
        this.isPausedState = false;
        this.audioSource = null;

        if (config.onEnd) {
          config.onEnd();
        }

        resolve();
      };

      try {
        source.start(0);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (config.onError) {
          config.onError(err);
        }
        reject(err);
      }
    });
  }

  private estimateWordTiming(duration: number, config: TtsConfig): void {
    // Estimate word timing based on WPM
    // This is approximate since ElevenLabs doesn't provide word boundaries
    const wordsPerSecond = config.wpm / 60;
    const timePerWord = 1000 / wordsPerSecond;

    let wordIndex = 0;
    const interval = setInterval(() => {
      if (!this.isPlayingState || this.isPausedState) {
        clearInterval(interval);
        return;
      }

      if (config.onWordBoundary) {
        config.onWordBoundary(wordIndex);
      }

      wordIndex++;

      // Stop when audio ends
      const elapsed = (Date.now() - this.startedAt * 1000) / 1000;
      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, timePerWord);
  }

  pause(): void {
    if (this.isPlayingState && !this.isPausedState && this.audioContext) {
      this.pausedAt = this.audioContext.currentTime - this.startedAt;
      this.audioContext.suspend();
      this.isPausedState = true;
    }
  }

  resume(): void {
    if (this.isPausedState && this.audioContext) {
      this.audioContext.resume();
      this.startedAt = this.audioContext.currentTime - this.pausedAt;
      this.isPausedState = false;
    }
  }

  stop(): void {
    if (this.audioSource) {
      try {
        this.audioSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.audioSource = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isPlayingState = false;
    this.isPausedState = false;
  }

  isPlaying(): boolean {
    return this.isPlayingState && !this.isPausedState;
  }

  isPaused(): boolean {
    return this.isPausedState;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
}

// ============================================================
// FACTORY
// ============================================================

let elevenLabsTtsInstance: ElevenLabsTtsEngine | null = null;

export function getElevenLabsTts(apiKey: string): ElevenLabsTtsEngine {
  if (!elevenLabsTtsInstance) {
    elevenLabsTtsInstance = new ElevenLabsTtsEngine(apiKey);
  } else {
    elevenLabsTtsInstance.setApiKey(apiKey);
  }
  return elevenLabsTtsInstance;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if ElevenLabs API key is valid
 */
export async function validateElevenLabsKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('ElevenLabs API key validation error:', error);
    return false;
  }
}

/**
 * Get user's remaining character quota
 */
export async function getElevenLabsQuota(apiKey: string): Promise<{
  characterCount: number;
  characterLimit: number;
}> {
  const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get ElevenLabs quota');
  }

  const data = await response.json();

  return {
    characterCount: data.character_count || 0,
    characterLimit: data.character_limit || 0,
  };
}
