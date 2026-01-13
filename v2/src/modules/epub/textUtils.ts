import type { TextChunk, WordPosition } from '../../types';

// ============================================================
// TEXT CHUNKING
// ============================================================

/**
 * Split text into chunks of approximately targetWords words.
 * Chunks respect sentence boundaries to avoid mid-sentence breaks.
 */
export function chunkText(text: string, targetWords: number = 40): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';
  let currentWords = 0;

  sentences.forEach((sentence) => {
    const sentenceWords = sentence.trim().split(/\s+/).length;

    if (currentWords + sentenceWords > targetWords && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
      currentWords = sentenceWords;
    } else {
      currentChunk += ' ' + sentence;
      currentWords += sentenceWords;
    }
  });

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Create text chunks with word arrays for easier processing
 */
export function createTextChunks(text: string, targetWords: number = 40): TextChunk[] {
  const chunks = chunkText(text, targetWords);

  return chunks.map((chunkText, index) => ({
    text: chunkText,
    words: chunkText.split(/\s+/).filter((w) => w.length > 0),
    index,
  }));
}

// ============================================================
// WORD TOKENIZATION
// ============================================================

/**
 * Create word position map for karaoke highlighting.
 * Returns array of words with their start/end positions in the text.
 */
export function tokenizeWithPositions(text: string): WordPosition[] {
  const tokens: WordPosition[] = [];
  const regex = /(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      word: match[1],
      start: match.index,
      end: match.index + match[1].length,
    });
  }

  return tokens;
}

// ============================================================
// LANGUAGE DETECTION
// ============================================================

const LANGUAGE_PATTERNS: Record<string, string[]> = {
  it: [
    'che',
    'della',
    'per',
    'con',
    'sono',
    'una',
    'degli',
    'nella',
    'alla',
    'questo',
    'anche',
    'essere',
    'come',
    'più',
    'suo',
    'stato',
    'quando',
    'molto',
    'però',
    'ancora',
  ],
  en: [
    'the',
    'and',
    'for',
    'with',
    'are',
    'have',
    'this',
    'that',
    'from',
    'they',
    'been',
    'have',
    'their',
    'which',
    'about',
    'would',
    'there',
    'could',
    'these',
    'when',
  ],
  fr: [
    'les',
    'des',
    'pour',
    'dans',
    'que',
    'qui',
    'une',
    'avec',
    'est',
    'sont',
    'par',
    'sur',
    'pas',
    'plus',
    'peut',
    'tout',
    'comme',
    'mais',
    'été',
    'cette',
  ],
  de: [
    'der',
    'die',
    'das',
    'und',
    'den',
    'dem',
    'des',
    'ein',
    'eine',
    'ist',
    'nicht',
    'auch',
    'sich',
    'von',
    'mit',
    'wird',
    'oder',
    'sie',
    'aber',
    'aus',
  ],
  es: [
    'los',
    'las',
    'del',
    'que',
    'para',
    'con',
    'una',
    'por',
    'como',
    'más',
    'pero',
    'sus',
    'les',
    'ese',
    'esta',
    'son',
    'todo',
    'también',
    'fue',
    'era',
  ],
};

/**
 * Detect language from text sample using common word frequency analysis.
 * Takes first 500 words for analysis.
 */
export function detectLanguage(text: string): string {
  // Take first 500 words for analysis
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 500);

  if (words.length === 0) return 'it'; // Default to Italian

  // Count matches for each language
  const scores: Record<string, number> = {};
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    scores[lang] = 0;
    for (const word of words) {
      if (patterns.includes(word)) {
        scores[lang]++;
      }
    }
  }

  // Find language with highest score
  let maxScore = 0;
  let detectedLang = 'it';
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  // If no clear match, default to Italian
  if (maxScore < 3) {
    detectedLang = 'it';
  }

  console.log('Language detection scores:', scores, '→ Detected:', detectedLang);
  return detectedLang;
}

// ============================================================
// VOICE SELECTION
// ============================================================

const LANG_CODES: Record<string, string[]> = {
  it: ['it-IT', 'it'],
  en: ['en-US', 'en-GB', 'en'],
  fr: ['fr-FR', 'fr'],
  de: ['de-DE', 'de'],
  es: ['es-ES', 'es'],
};

/**
 * Auto-select best voice for detected language from available voices.
 */
export function selectVoiceForLanguage(
  detectedLang: string,
  availableVoices: SpeechSynthesisVoice[]
): string {
  if (!availableVoices || availableVoices.length === 0) return '';

  const preferredCodes = LANG_CODES[detectedLang] || ['it-IT', 'it'];

  // Try to find voice matching preferred language codes
  for (const code of preferredCodes) {
    const voice = availableVoices.find((v) => v.lang.startsWith(code));
    if (voice) {
      return voice.name;
    }
  }

  // Fallback: return first available voice
  return availableVoices[0]?.name || '';
}
