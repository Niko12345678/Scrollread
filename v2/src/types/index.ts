// ============================================================
// CORE TYPES
// ============================================================

export interface Book {
  id: string;
  title: string;
  author?: string;
  fullText: string;
  chapters: Chapter[];
  chunks?: TextChunk[];
  language?: string;
  coverImage?: string;
  addedAt: number;
  lastReadAt?: number;
}

export interface Chapter {
  title: string;
  text: string;
}

export interface TextChunk {
  text: string;
  words: string[];
  index: number;
}

export interface WordPosition {
  word: string;
  start: number;
  end: number;
}

// ============================================================
// READ IT LATER TYPES
// ============================================================

export interface Article {
  id: string;
  url: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  siteName?: string;
  imageUrl?: string;
  savedAt: number;
  lastReadAt?: number;
  progress?: number; // Page index or scroll position
  isArchived?: boolean;
  tags?: string[];
}

// ============================================================
// SETTINGS TYPES
// ============================================================

export interface Settings {
  theme: ThemeName;
  ttsEngine: TtsEngine;
  browserVoice?: string;
  elevenLabsVoice?: string;
  elevenLabsKey?: string;
  wpm: number;
  autoAdvance?: boolean;
  highlightEnabled?: boolean;
}

export type ThemeName = 'dark' | 'solarized' | 'sepia';
export type TtsEngine = 'browser' | 'elevenlabs';

export interface Theme {
  name: string;
  bg: string;
  bgGradient: string;
  bgSecondary: string;
  text: string;
  textMuted: string;
  textFaded: string;
  textRead: string;
  accent: string;
  accentLight: string;
  accentGlow: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  overlayBg: string;
  highlightBg: string;
  highlightGlow: string;
}

// ============================================================
// READING PROGRESS TYPES
// ============================================================

export interface ReadingProgress {
  id: string; // book ID or article ID
  type: 'book' | 'article';
  currentPage: number;
  totalPages?: number;
  lastReadAt: number;
  completedAt?: number;
}

// ============================================================
// TTS TYPES
// ============================================================

export interface TtsConfig {
  engine: TtsEngine;
  voice: string;
  wpm: number;
  onWordBoundary?: (wordIndex: number) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface TtsController {
  speak: (text: string, config: TtsConfig) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: () => boolean;
  isPaused: () => boolean;
}

// ============================================================
// EPUB PARSER TYPES
// ============================================================

export interface EpubMetadata {
  title: string;
  author?: string;
  language?: string;
  publisher?: string;
  coverImage?: string;
}

export interface ParsedEpub {
  metadata: EpubMetadata;
  chapters: Chapter[];
  fullText: string;
}

// ============================================================
// SUPABASE TYPES
// ============================================================

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'savedAt'>;
        Update: Partial<Omit<Article, 'id'>>;
      };
      reading_progress: {
        Row: ReadingProgress;
        Insert: Omit<ReadingProgress, 'lastReadAt'>;
        Update: Partial<Omit<ReadingProgress, 'id'>>;
      };
      settings: {
        Row: Settings & { userId: string };
        Insert: Settings & { userId: string };
        Update: Partial<Settings>;
      };
    };
  };
}
