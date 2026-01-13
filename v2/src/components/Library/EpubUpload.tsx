import { useRef, useState } from 'react';
import { parseEpub } from '../../modules/epub';
import { saveBook } from '../../modules/storage';
import { createTextChunks } from '../../modules/epub';
import type { Book } from '../../types';

interface EpubUploadProps {
  onBookAdded: (book: Book) => void;
}

export function EpubUpload({ onBookAdded }: EpubUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [epubUrl, setEpubUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseEpub(file);

      const book: Book = {
        id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: parsed.metadata.title,
        author: parsed.metadata.author,
        fullText: parsed.fullText,
        chapters: parsed.chapters,
        chunks: createTextChunks(parsed.fullText),
        language: parsed.metadata.language,
        addedAt: Date.now(),
        lastReadAt: Date.now(),
      };

      await saveBook(book);
      onBookAdded(book);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'DRM_PROTECTED') {
          alert('⚠️ Questo ePub è protetto da DRM e non può essere letto.');
        } else {
          alert(`❌ Errore nel caricamento: ${error.message}`);
        }
      }
      console.error('ePub upload error:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlLoad = async () => {
    if (!epubUrl.trim()) {
      alert('⚠️ Inserisci un URL valido');
      return;
    }

    setIsLoadingUrl(true);

    try {
      // Fetch the ePub from URL
      const response = await fetch(epubUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const file = new File([blob], 'book.epub', { type: 'application/epub+zip' });

      const parsed = await parseEpub(file);

      const book: Book = {
        id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: parsed.metadata.title,
        author: parsed.metadata.author,
        fullText: parsed.fullText,
        chapters: parsed.chapters,
        chunks: createTextChunks(parsed.fullText),
        language: parsed.metadata.language,
        addedAt: Date.now(),
        lastReadAt: Date.now(),
      };

      await saveBook(book);
      onBookAdded(book);
      setEpubUrl('');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'DRM_PROTECTED') {
          alert('⚠️ Questo ePub è protetto da DRM e non può essere letto.');
        } else {
          alert(`❌ Errore nel caricamento da URL: ${error.message}`);
        }
      }
      console.error('ePub URL load error:', error);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  return (
    <div>
      {/* File Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".epub"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="epub-upload"
      />
      <label htmlFor="epub-upload" style={{ cursor: 'pointer' }}>
        <div
          style={{
            padding: '1rem 2rem',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 500,
            marginBottom: '1rem',
          }}
        >
          📚 Carica ePub
        </div>
      </label>

      {/* URL Input */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <input
          type="url"
          placeholder="https://example.com/book.epub"
          value={epubUrl}
          onChange={(e) => setEpubUrl(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoadingUrl) {
              handleUrlLoad();
            }
          }}
          disabled={isLoadingUrl}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: 'var(--text)',
            fontSize: '0.9rem',
          }}
        />
        <button
          onClick={handleUrlLoad}
          disabled={isLoadingUrl || !epubUrl.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            background: isLoadingUrl || !epubUrl.trim() ? 'var(--text-muted)' : 'var(--accent)',
            color: '#fff',
            fontWeight: 500,
            cursor: isLoadingUrl || !epubUrl.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoadingUrl || !epubUrl.trim() ? 0.5 : 1,
          }}
        >
          {isLoadingUrl ? '⏳' : '🔗'}
        </button>
      </div>
    </div>
  );
}
