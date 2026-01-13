import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Book, Article, ReadingProgress, Settings } from '../../types';

// ============================================================
// DATABASE SCHEMA
// ============================================================

interface ScrollReadDB extends DBSchema {
  books: {
    key: string;
    value: Book;
    indexes: {
      'by-last-read': number;
      'by-added': number;
    };
  };
  articles: {
    key: string;
    value: Article;
    indexes: {
      'by-saved': number;
      'by-last-read': number;
      'by-archived': number;
    };
  };
  progress: {
    key: string;
    value: ReadingProgress;
    indexes: {
      'by-last-read': number;
    };
  };
  settings: {
    key: 'user-settings';
    value: Settings;
  };
}

const DB_NAME = 'scrollread';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<ScrollReadDB> | null = null;

// ============================================================
// DATABASE INITIALIZATION
// ============================================================

export async function initDB(): Promise<IDBPDatabase<ScrollReadDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ScrollReadDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`Upgrading DB from ${oldVersion} to ${newVersion}`);

      // Create books store
      if (!db.objectStoreNames.contains('books')) {
        const bookStore = db.createObjectStore('books', { keyPath: 'id' });
        bookStore.createIndex('by-last-read', 'lastReadAt');
        bookStore.createIndex('by-added', 'addedAt');
      }

      // Create articles store
      if (!db.objectStoreNames.contains('articles')) {
        const articleStore = db.createObjectStore('articles', { keyPath: 'id' });
        articleStore.createIndex('by-saved', 'savedAt');
        articleStore.createIndex('by-last-read', 'lastReadAt');
        articleStore.createIndex('by-archived', 'isArchived');
      }

      // Create progress store
      if (!db.objectStoreNames.contains('progress')) {
        const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
        progressStore.createIndex('by-last-read', 'lastReadAt');
      }

      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
    blocked() {
      console.warn('DB upgrade blocked - close other tabs');
    },
    blocking() {
      console.warn('DB blocking - this tab is preventing upgrade');
    },
  });

  return dbInstance;
}

// ============================================================
// BOOKS OPERATIONS
// ============================================================

export async function saveBook(book: Book): Promise<void> {
  const db = await initDB();
  await db.put('books', book);
}

export async function getBook(id: string): Promise<Book | undefined> {
  const db = await initDB();
  return db.get('books', id);
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await initDB();
  return db.getAllFromIndex('books', 'by-last-read');
}

export async function deleteBook(id: string): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(['books', 'progress'], 'readwrite');
  await Promise.all([
    tx.objectStore('books').delete(id),
    tx.objectStore('progress').delete(id),
    tx.done,
  ]);
}

export async function getRecentBooks(limit: number = 10): Promise<Book[]> {
  const db = await initDB();
  const books = await db.getAllFromIndex('books', 'by-last-read');
  return books.reverse().slice(0, limit);
}

// ============================================================
// ARTICLES OPERATIONS (Read It Later)
// ============================================================

export async function saveArticle(article: Article): Promise<void> {
  const db = await initDB();
  await db.put('articles', article);
}

export async function getArticle(id: string): Promise<Article | undefined> {
  const db = await initDB();
  return db.get('articles', id);
}

export async function getAllArticles(includeArchived = false): Promise<Article[]> {
  const db = await initDB();
  const articles = await db.getAllFromIndex('articles', 'by-saved');

  if (includeArchived) {
    return articles.reverse();
  }

  return articles.filter(a => !a.isArchived).reverse();
}

export async function archiveArticle(id: string): Promise<void> {
  const db = await initDB();
  const article = await db.get('articles', id);
  if (article) {
    article.isArchived = true;
    await db.put('articles', article);
  }
}

export async function deleteArticle(id: string): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(['articles', 'progress'], 'readwrite');
  await Promise.all([
    tx.objectStore('articles').delete(id),
    tx.objectStore('progress').delete(id),
    tx.done,
  ]);
}

// ============================================================
// READING PROGRESS OPERATIONS
// ============================================================

export async function saveProgress(progress: ReadingProgress): Promise<void> {
  const db = await initDB();
  await db.put('progress', { ...progress, lastReadAt: Date.now() });
}

export async function getProgress(id: string): Promise<ReadingProgress | undefined> {
  const db = await initDB();
  return db.get('progress', id);
}

export async function getAllProgress(): Promise<ReadingProgress[]> {
  const db = await initDB();
  return db.getAllFromIndex('progress', 'by-last-read');
}

// ============================================================
// SETTINGS OPERATIONS
// ============================================================

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await initDB();
  await db.put('settings', settings);
}

export async function getSettings(): Promise<Settings | undefined> {
  const db = await initDB();
  return db.get('settings', 'user-settings');
}

export async function getSettingsOrDefault(): Promise<Settings> {
  const settings = await getSettings();
  if (settings) return settings;

  // Default settings
  const defaultSettings: Settings = {
    theme: 'dark',
    ttsEngine: 'browser',
    wpm: 180,
    autoAdvance: true,
    highlightEnabled: true,
  };

  await saveSettings(defaultSettings);
  return defaultSettings;
}

// ============================================================
// MIGRATION FROM LOCALSTORAGE (ONE-TIME)
// ============================================================

export async function migrateFromLocalStorage(): Promise<void> {
  console.log('Checking for localStorage data to migrate...');

  // Migrate settings
  const oldSettings = localStorage.getItem('scrollread_settings');
  if (oldSettings) {
    try {
      const settings = JSON.parse(oldSettings);
      await saveSettings(settings);
      console.log('✓ Migrated settings');
    } catch (e) {
      console.error('Failed to migrate settings:', e);
    }
  }

  // Migrate books
  const oldBooks = localStorage.getItem('scrollread_books');
  if (oldBooks) {
    try {
      const books = JSON.parse(oldBooks);
      for (const book of books) {
        if (!book.id) {
          book.id = `book-${Date.now()}-${Math.random()}`;
        }
        if (!book.addedAt) {
          book.addedAt = Date.now();
        }
        await saveBook(book);

        // Migrate progress for this book
        const oldPos = localStorage.getItem(`scrollread_pos_${book.title}`);
        if (oldPos) {
          await saveProgress({
            id: book.id,
            type: 'book',
            currentPage: parseInt(oldPos),
            lastReadAt: Date.now(),
          });
        }
      }
      console.log(`✓ Migrated ${books.length} books`);
    } catch (e) {
      console.error('Failed to migrate books:', e);
    }
  }

  console.log('Migration complete!');
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export async function clearAllData(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(['books', 'articles', 'progress', 'settings'], 'readwrite');
  await Promise.all([
    tx.objectStore('books').clear(),
    tx.objectStore('articles').clear(),
    tx.objectStore('progress').clear(),
    tx.objectStore('settings').clear(),
    tx.done,
  ]);
  console.log('All data cleared');
}

export async function getStorageStats(): Promise<{
  books: number;
  articles: number;
  progress: number;
}> {
  const db = await initDB();
  const [books, articles, progress] = await Promise.all([
    db.count('books'),
    db.count('articles'),
    db.count('progress'),
  ]);

  return { books, articles, progress };
}
