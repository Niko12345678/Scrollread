// Background script for ScrollRead Gist Saver

// Create context menu on install
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: 'save-to-scrollread',
    title: 'Salva su ScrollRead',
    contexts: ['page', 'selection', 'link']
  });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-to-scrollread') {
    saveArticleToGist(tab);
  }
});

// Handle messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveCurrentPage') {
    browser.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        if (tabs[0]) {
          saveArticleToGist(tabs[0]);
        }
      });
  }
  return true;
});

// Main function to save article to Gist
async function saveArticleToGist(tab) {
  try {
    // Get settings from storage
    const settings = await browser.storage.local.get(['githubPat', 'githubGistId']);

    if (!settings.githubPat || !settings.githubGistId) {
      showNotification('Configurazione mancante', 'Apri il popup e configura GitHub PAT e Gist ID');
      return;
    }

    // Show notification that we're working
    showNotification('Salvataggio in corso...', 'Estrazione del contenuto dell\'articolo');

    // Extract article content from the page
    const article = await browser.tabs.sendMessage(tab.id, { action: 'extractArticle' });

    if (!article || !article.content) {
      showNotification('Errore', 'Impossibile estrarre il contenuto dell\'articolo');
      return;
    }

    // Fetch current Gist to get existing articles
    const gistResponse = await fetch(`https://api.github.com/gists/${settings.githubGistId}`, {
      headers: {
        'Authorization': `token ${settings.githubPat}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!gistResponse.ok) {
      throw new Error(`Failed to fetch Gist: ${gistResponse.status}`);
    }

    const gist = await gistResponse.json();
    const articlesContent = gist.files['articles.json']?.content;
    const articles = articlesContent ? JSON.parse(articlesContent) : [];

    // Add new article (prepend to array)
    const newArticle = {
      id: generateId(),
      title: article.title,
      url: article.url,
      content: article.content,
      author: article.author,
      siteName: article.siteName,
      savedAt: article.savedAt,
      readAt: null,
      archived: false
    };

    articles.unshift(newArticle);

    // Update Gist with new articles list
    const updateResponse = await fetch(`https://api.github.com/gists/${settings.githubGistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${settings.githubPat}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'articles.json': {
            content: JSON.stringify(articles, null, 2)
          }
        }
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update Gist: ${updateResponse.status}`);
    }

    showNotification('✓ Salvato!', `"${article.title}" è stato salvato su ScrollRead`);

  } catch (error) {
    console.error('Error saving article:', error);
    showNotification('Errore', error.message || 'Impossibile salvare l\'articolo');
  }
}

// Generate unique ID for articles
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Show browser notification
function showNotification(title, message) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: 'icon-48.png',
    title: title,
    message: message
  });
}
