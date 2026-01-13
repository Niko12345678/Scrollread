import { useState, useEffect } from 'react';
import { Library } from './components/Library/Library';
import { Reader } from './components/Reader/Reader';
import { ReadLater } from './components/ReadLater/ReadLater';
import { Settings } from './components/Settings/Settings';
import { useSettings } from './hooks/useSettings';
import { migrateFromLocalStorage, initDB } from './modules/storage';
import { createTextChunks } from './modules/epub';
import { THEMES } from './utils/constants';
import type { Book, Article } from './types';

type ViewMode = 'library' | 'readLater';

function App() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('library');

  // Initialize DB and migrate localStorage data
  useEffect(() => {
    initDB().then(() => {
      migrateFromLocalStorage().catch((error) => {
        console.error('Migration error:', error);
      });
    });
  }, []);

  // Apply theme CSS variables
  useEffect(() => {
    if (!settings) return;

    const theme = THEMES[settings.theme];
    const root = document.documentElement;

    Object.entries(theme).forEach(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });
  }, [settings?.theme]);

  // Convert article to book format for reading
  const convertArticleToBook = (article: Article): Book => {
    return {
      id: article.id,
      title: article.title,
      author: article.author || article.siteName,
      fullText: article.content,
      chapters: [{ title: article.title, text: article.content }],
      chunks: createTextChunks(article.content),
      addedAt: article.savedAt,
      lastReadAt: article.lastReadAt || article.savedAt,
    };
  };

  const handleArticleSelect = (article: Article) => {
    const book = convertArticleToBook(article);
    setCurrentBook(book);
  };

  if (isLoading || !settings) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0a0a0a',
          color: '#f0ede8',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
          <p>Caricamento ScrollRead...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentBook ? (
        <Reader
          book={currentBook}
          settings={settings}
          onBack={() => setCurrentBook(null)}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : viewMode === 'library' ? (
        <Library
          onBookSelect={setCurrentBook}
          onOpenSettings={() => setShowSettings(true)}
          onShowReadLater={() => setViewMode('readLater')}
        />
      ) : (
        <ReadLater
          onArticleSelect={handleArticleSelect}
          onBack={() => setViewMode('library')}
        />
      )}

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={updateSettings}
      />
    </>
  );
}

export default App;
