import { useState, useEffect } from 'react';
import { getRecentBooks, deleteBook } from '../../modules/storage';
import { EpubUpload } from './EpubUpload';
import type { Book } from '../../types';

interface LibraryProps {
  onBookSelect: (book: Book) => void;
  onOpenSettings: () => void;
}

export function Library({ onBookSelect, onOpenSettings }: LibraryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const loadedBooks = await getRecentBooks(20);
      setBooks(loadedBooks);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAdded = (book: Book) => {
    setBooks((prev) => [book, ...prev]);
    onBookSelect(book);
  };

  const handleDeleteBook = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Vuoi eliminare questo libro?')) return;

    try {
      await deleteBook(bookId);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-gradient)',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--text)',
              margin: 0,
            }}
          >
            📖 ScrollRead
          </h1>
          <button
            onClick={onOpenSettings}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            ⚙️
          </button>
        </div>

        {/* Upload */}
        <div style={{ marginBottom: '2rem' }}>
          <EpubUpload onBookAdded={handleBookAdded} />
        </div>

        {/* Books List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            Caricamento...
          </div>
        ) : books.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '3rem 1rem',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <p>Nessun libro ancora.</p>
            <p>Carica il tuo primo ePub per iniziare!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => onBookSelect(book)}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        color: 'var(--text)',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        margin: '0 0 0.5rem 0',
                      }}
                    >
                      {book.title}
                    </h3>
                    {book.author && (
                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem',
                          margin: '0 0 0.5rem 0',
                        }}
                      >
                        {book.author}
                      </p>
                    )}
                    <p
                      style={{
                        color: 'var(--text-faded)',
                        fontSize: '0.85rem',
                        margin: 0,
                      }}
                    >
                      {book.chapters.length} capitoli
                      {book.language && ` • ${book.language.toUpperCase()}`}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteBook(book.id, e)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.25rem 0.5rem',
                    }}
                    title="Elimina libro"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
