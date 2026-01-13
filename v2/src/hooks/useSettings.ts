import { useState, useEffect } from 'react';
import { getSettingsOrDefault, saveSettings as saveSettingsDB } from '../modules/storage';
import type { Settings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await getSettingsOrDefault();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) return;

    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    try {
      await saveSettingsDB(updated);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return {
    settings,
    updateSettings,
    isLoading,
  };
}
