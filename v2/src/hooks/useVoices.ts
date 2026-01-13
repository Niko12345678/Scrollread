import { useState, useEffect } from 'react';
import { getAvailableVoices } from '../modules/tts';

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const availableVoices = await getAvailableVoices();
      // Sort with Italian voices first
      const sorted = [...availableVoices].sort((a, b) => {
        if (a.lang.startsWith('it') && !b.lang.startsWith('it')) return -1;
        if (!a.lang.startsWith('it') && b.lang.startsWith('it')) return 1;
        return 0;
      });
      setVoices(sorted);
    } catch (error) {
      console.error('Failed to load voices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { voices, isLoading };
}
