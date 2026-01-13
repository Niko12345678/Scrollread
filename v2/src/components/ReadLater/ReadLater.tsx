import { useState, useEffect } from 'react';
import { getArticles, saveArticleUrl, deleteArticle, isSupabaseConfigured } from '../../modules/supabase';
import type { Article } from '../../types';

interface ReadLaterProps {
  onArticleSelect: (article: Article) => void;
  onBack: () => void;
}

export function ReadLater({ onArticleSelect, onBack }: ReadLaterProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const loadedArticles = await getArticles(true);
      setArticles(loadedArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
      setError('Errore nel caricamento degli articoli');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    if (!supabaseConfigured) {
      setError('Supabase non configurato. Aggiungi le credenziali nel file .env');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const article = await saveArticleUrl(url.trim());
      if (article) {
        setArticles((prev) => [article, ...prev]);
        setUrl('');
      }
    } catch (error) {
      console.error('Failed to save article:', error);
      setError(error instanceof Error ? error.message : 'Errore nel salvare l\'articolo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Vuoi eliminare questo articolo?')) return;

    try {
      await deleteArticle(articleId);
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } catch (error) {
      console.error('Failed to delete article:', error);
      setError('Errore nell\'eliminazione');
    }
  };

  if (!supabaseConfigured) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-gradient)',
          padding: '2rem 1rem',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              marginBottom: '2rem',
            }}
          >
            ← Indietro
          </button>

          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: 'var(--text)', marginBottom: '1rem' }}>
              ⚙️ Configurazione Richiesta
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              La funzionalità "Read It Later" richiede un backend Supabase.
            </p>
            <div
              style={{
                background: 'var(--input-bg)',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'left',
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
              }}
            >
              <p>1. Crea un progetto su supabase.com (gratis)</p>
              <p>2. Esegui lo schema SQL da supabase-schema.sql</p>
              <p>3. Deploy della Edge Function extract-article</p>
              <p>4. Crea file .env con le credenziali</p>
            </div>
            <p
              style={{
                color: 'var(--text-muted)',
                marginTop: '1rem',
                fontSize: '0.85rem',
              }}
            >
              Vedi README.md per istruzioni dettagliate
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ←
          </button>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text)',
              margin: 0,
            }}
          >
            📌 Read It Later
          </h1>
          <div style={{ width: '1.5rem' }} />
        </div>

        {/* URL Input */}
        <form onSubmit={handleSaveUrl} style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              disabled={isSaving}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '1rem',
              }}
            />
            <button
              type="submit"
              disabled={isSaving || !url.trim()}
              style={{
                padding: '1rem 2rem',
                background: isSaving ? 'var(--card-bg)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving || !url.trim() ? 0.6 : 1,
              }}
            >
              {isSaving ? '...' : '💾'}
            </button>
          </div>
          {error && (
            <p
              style={{
                color: '#ff6b6b',
                fontSize: '0.9rem',
                marginTop: '0.5rem',
              }}
            >
              {error}
            </p>
          )}
        </form>

        {/* Articles List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            Caricamento...
          </div>
        ) : articles.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '3rem 1rem',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📌</div>
            <p>Nessun articolo salvato.</p>
            <p>Incolla un URL sopra per salvare un articolo!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => onArticleSelect(article)}
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
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem',
                          margin: '0 0 0.5rem 0',
                          lineHeight: '1.4',
                        }}
                      >
                        {article.excerpt}
                      </p>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-faded)',
                      }}
                    >
                      {article.siteName && <span>🌐 {article.siteName}</span>}
                      {article.author && <span>✍️ {article.author}</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(article.id, e)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.25rem 0.5rem',
                    }}
                    title="Elimina articolo"
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
