import { getSupabase, isSupabaseConfigured } from './client';
import { saveArticle as saveArticleLocal, getAllArticles as getAllArticlesLocal } from '../storage';
import type { Article, ArticleRow } from '../../types';

// ============================================================
// HELPER FUNCTIONS (camelCase <-> snake_case conversion)
// ============================================================

function articleRowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt || undefined,
    author: row.author || undefined,
    siteName: row.site_name || undefined,
    imageUrl: row.image_url || undefined,
    savedAt: row.saved_at,
    lastReadAt: row.last_read_at || undefined,
    progress: row.progress || undefined,
    isArchived: row.is_archived || undefined,
    tags: row.tags || undefined,
  };
}

// ============================================================
// ARTICLE OPERATIONS (Cloud + Local Hybrid)
// ============================================================

/**
 * Save article URL and metadata to Supabase.
 * The article extraction will be done by the Edge Function.
 */
export async function saveArticleUrl(url: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping cloud save');
    return null;
  }

  try {
    const supabase = getSupabase();

    // Call Edge Function to extract article content
    // @ts-ignore - Supabase types not fully configured yet
    const { data, error } = await supabase.functions.invoke('extract-article', {
      body: { url },
    });

    if (error) throw error;

    const article: Article = {
      id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: data.url,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      author: data.author,
      siteName: data.siteName,
      imageUrl: data.imageUrl,
      savedAt: Date.now(),
    };

    // Save to Supabase (using snake_case)
    // @ts-ignore - Supabase types not fully configured yet
    const { error: insertError } = await supabase
      .from('articles')
      // @ts-ignore
      .insert({
        url: article.url,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        author: article.author,
        site_name: article.siteName,
        image_url: article.imageUrl,
        saved_at: article.savedAt,
      });

    if (insertError) throw insertError;

    // Also save locally for offline access
    await saveArticleLocal(article);

    return article;
  } catch (error) {
    console.error('Failed to save article to Supabase:', error);
    throw error;
  }
}

/**
 * Get all articles from Supabase (syncs with local DB)
 */
export async function syncArticles(): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, using local articles only');
    return;
  }

  try {
    const supabase = getSupabase();

    // @ts-ignore - Supabase types not fully configured yet
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('saved_at', { ascending: false });

    if (error) throw error;

    // Sync to local DB (convert from snake_case to camelCase)
    for (const row of data || []) {
      const article = articleRowToArticle(row);
      await saveArticleLocal(article);
    }
  } catch (error) {
    console.error('Failed to sync articles from Supabase:', error);
  }
}

/**
 * Get all articles (local first, with optional cloud sync)
 */
export async function getArticles(syncFromCloud = false): Promise<Article[]> {
  if (syncFromCloud && isSupabaseConfigured()) {
    await syncArticles();
  }

  return getAllArticlesLocal();
}

/**
 * Delete article from both Supabase and local DB
 */
export async function deleteArticle(articleId: string): Promise<void> {
  // Delete from local DB
  const { deleteArticle: deleteLocal } = await import('../storage');
  await deleteLocal(articleId);

  // Delete from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      // @ts-ignore - Supabase types not fully configured yet
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete article from Supabase:', error);
    }
  }
}
