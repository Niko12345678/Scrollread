import { useRef } from 'react';
import { parseEpub } from '../../modules/epub';
import { saveBook } from '../../modules/storage';
import { createTextChunks } from '../../modules/epub';
import type { Book } from '../../types';

interface EpubUploadProps {
  onBookAdded: (book: Book) => void;
}

export function EpubUpload({ onBookAdded }: EpubUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div>
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
          }}
        >
          📚 Carica ePub
        </div>
      </label>
    </div>
  );
}
