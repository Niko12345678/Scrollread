import type { Theme, ThemeName } from '../types';

// ============================================================
// APP INFO
// ============================================================

export const APP_VERSION = '2.0.0';
export const BUILD_DATE = '2026-01-13';

// ============================================================
// THEMES
// ============================================================

export const THEMES: Record<ThemeName, Theme> = {
  dark: {
    name: 'Scuro',
    bg: '#0a0a0a',
    bgGradient: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
    bgSecondary: '#1a1a1a',
    text: '#f0ede8',
    textMuted: 'rgba(255,255,255,0.5)',
    textFaded: 'rgba(240, 237, 232, 0.45)',
    textRead: 'rgba(240, 237, 232, 0.85)',
    accent: '#d4a574',
    accentLight: '#e8c9a8',
    accentGlow: 'rgba(212,165,116,0.4)',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
    inputBg: 'rgba(255,255,255,0.03)',
    inputBorder: 'rgba(255,255,255,0.1)',
    overlayBg: 'rgba(0,0,0,0.8)',
    highlightBg: 'linear-gradient(180deg, rgba(212, 165, 116, 0.25) 0%, rgba(212, 165, 116, 0.1) 100%)',
    highlightGlow: '0 0 20px rgba(255, 220, 180, 0.8), 0 0 40px rgba(212, 165, 116, 0.4)',
  },
  solarized: {
    name: 'Solarized',
    bg: '#fdf6e3',
    bgGradient: 'linear-gradient(180deg, #fdf6e3 0%, #eee8d5 50%, #fdf6e3 100%)',
    bgSecondary: '#eee8d5',
    text: '#657b83',
    textMuted: '#93a1a1',
    textFaded: 'rgba(101, 123, 131, 0.5)',
    textRead: '#586e75',
    accent: '#b58900',
    accentLight: '#cb4b16',
    accentGlow: 'rgba(181,137,0,0.3)',
    cardBg: 'rgba(238,232,213,0.5)',
    cardBorder: 'rgba(147,161,161,0.3)',
    inputBg: 'rgba(238,232,213,0.8)',
    inputBorder: 'rgba(147,161,161,0.4)',
    overlayBg: 'rgba(253,246,227,0.95)',
    highlightBg: 'linear-gradient(180deg, rgba(181, 137, 0, 0.2) 0%, rgba(181, 137, 0, 0.1) 100%)',
    highlightGlow: '0 0 15px rgba(181, 137, 0, 0.5), 0 0 30px rgba(203, 75, 22, 0.3)',
  },
  sepia: {
    name: 'Seppia',
    bg: '#f4ecd8',
    bgGradient: 'linear-gradient(180deg, #f4ecd8 0%, #e8dcc8 50%, #f4ecd8 100%)',
    bgSecondary: '#e8dcc8',
    text: '#5b4636',
    textMuted: '#8b7355',
    textFaded: 'rgba(91, 70, 54, 0.5)',
    textRead: '#6b5344',
    accent: '#8b4513',
    accentLight: '#a0522d',
    accentGlow: 'rgba(139,69,19,0.3)',
    cardBg: 'rgba(232,220,200,0.6)',
    cardBorder: 'rgba(139,115,85,0.3)',
    inputBg: 'rgba(232,220,200,0.8)',
    inputBorder: 'rgba(139,115,85,0.4)',
    overlayBg: 'rgba(244,236,216,0.95)',
    highlightBg: 'linear-gradient(180deg, rgba(139, 69, 19, 0.2) 0%, rgba(139, 69, 19, 0.1) 100%)',
    highlightGlow: '0 0 15px rgba(139, 69, 19, 0.5), 0 0 30px rgba(160, 82, 45, 0.3)',
  },
};

// ============================================================
// DEFAULT SETTINGS
// ============================================================

export const DEFAULT_SETTINGS = {
  theme: 'dark' as ThemeName,
  ttsEngine: 'browser' as const,
  wpm: 180,
  autoAdvance: true,
  highlightEnabled: true,
};

// ============================================================
// TEXT CHUNKING
// ============================================================

export const DEFAULT_CHUNK_SIZE = 40; // words per chunk

// ============================================================
// ELEVENLABS VOICES
// ============================================================

export const ELEVENLABS_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (English, Italian)' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (English)' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (English)' },
] as const;
