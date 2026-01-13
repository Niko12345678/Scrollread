import { useState, useEffect } from 'react';
import { Library } from './components/Library/Library';
import { Reader } from './components/Reader/Reader';
import { Settings } from './components/Settings/Settings';
import { useSettings } from './hooks/useSettings';
import { migrateFromLocalStorage, initDB } from './modules/storage';
import { THEMES } from './utils/constants';
import type { Book } from './types';

function App() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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
      ) : (
        <Library
          onBookSelect={setCurrentBook}
          onOpenSettings={() => setShowSettings(true)}
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
