// Content script for extracting article content from web pages

// Listen for messages from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractArticle') {
    const article = extractArticleContent();
    sendResponse(article);
  }
  return true; // Keep message channel open for async response
});

// Extract article content from the current page
function extractArticleContent() {
  // Try to use Readability-like extraction
  const article = {
    title: getTitle(),
    url: window.location.href,
    content: getMainContent(),
    author: getAuthor(),
    siteName: getSiteName(),
    savedAt: new Date().toISOString()
  };

  return article;
}

// Get page title
function getTitle() {
  // Try meta og:title first
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) {
    return ogTitle.content;
  }

  // Try h1
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent.trim()) {
    return h1.textContent.trim();
  }

  // Fallback to document title
  return document.title;
}

// Get main content
function getMainContent() {
  // Look for common article containers
  const selectors = [
    'article',
    '[role="main"]',
    'main',
    '.article-content',
    '.post-content',
    '.entry-content',
    '#article-body',
    '.story-body'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return cleanText(element);
    }
  }

  // Fallback: get all p tags
  const paragraphs = Array.from(document.querySelectorAll('p'))
    .map(p => p.textContent.trim())
    .filter(text => text.length > 50) // Filter short paragraphs
    .join('\n\n');

  return paragraphs;
}

// Clean and extract text from element
function cleanText(element) {
  // Clone to avoid modifying original
  const clone = element.cloneNode(true);

  // Remove script, style, nav, footer, ads
  const unwanted = clone.querySelectorAll('script, style, nav, footer, aside, .ad, .advertisement, .social-share');
  unwanted.forEach(el => el.remove());

  // Get text content
  let text = clone.textContent;

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\n\s*\n/g, '\n\n');

  return text;
}

// Get author
function getAuthor() {
  // Try meta author
  const metaAuthor = document.querySelector('meta[name="author"]');
  if (metaAuthor && metaAuthor.content) {
    return metaAuthor.content;
  }

  // Try rel="author"
  const relAuthor = document.querySelector('[rel="author"]');
  if (relAuthor && relAuthor.textContent.trim()) {
    return relAuthor.textContent.trim();
  }

  // Try common author classes
  const authorElement = document.querySelector('.author, .byline, [class*="author"]');
  if (authorElement && authorElement.textContent.trim()) {
    return authorElement.textContent.trim();
  }

  return '';
}

// Get site name
function getSiteName() {
  // Try meta og:site_name
  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  if (ogSiteName && ogSiteName.content) {
    return ogSiteName.content;
  }

  // Fallback to hostname
  return window.location.hostname.replace('www.', '');
}
