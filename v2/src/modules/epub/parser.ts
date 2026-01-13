import JSZip from 'jszip';
import type { ParsedEpub, Chapter, EpubMetadata } from '../../types';

// ============================================================
// DRM DETECTION
// ============================================================

function checkDRM(encContent: string): boolean {
  return (
    encContent.includes('http://www.w3.org/2001/04/xmlenc#') ||
    encContent.includes('adobe.com/adept') ||
    encContent.includes('EncryptedData') ||
    encContent.includes('EncryptionMethod')
  );
}

// ============================================================
// ENCODING DETECTION & FILE READING
// ============================================================

const ENCODING_MAP: Record<string, string> = {
  'iso-8859-1': 'iso-8859-1',
  'latin1': 'iso-8859-1',
  'latin-1': 'iso-8859-1',
  'windows-1252': 'windows-1252',
  'cp1252': 'windows-1252',
  'utf8': 'utf-8',
  'utf-8': 'utf-8',
};

async function readFileAsText(zipFile: JSZip.JSZipObject): Promise<string> {
  const uint8 = await zipFile.async('uint8array');

  // Try to detect encoding from XML declaration or meta tag
  const preview = new TextDecoder('utf-8', { fatal: false }).decode(uint8.slice(0, 1000));
  let encoding = 'utf-8';

  // Check XML declaration: <?xml version="1.0" encoding="..."?>
  const xmlMatch = preview.match(/encoding=["']([^"']+)["']/i);
  if (xmlMatch) {
    encoding = xmlMatch[1].toLowerCase();
  }

  // Check HTML meta: <meta charset="...">
  const metaMatch = preview.match(/charset=["']?([^"'\s;>]+)/i);
  if (metaMatch) {
    encoding = metaMatch[1].toLowerCase();
  }

  // Normalize common encoding names
  encoding = ENCODING_MAP[encoding] || 'utf-8';

  try {
    return new TextDecoder(encoding).decode(uint8);
  } catch (e) {
    // Fallback to UTF-8 with replacement
    return new TextDecoder('utf-8', { fatal: false }).decode(uint8);
  }
}

// ============================================================
// METADATA EXTRACTION
// ============================================================

function extractMetadata(opfDoc: Document, fileName: string): EpubMetadata {
  const titleEl =
    opfDoc.querySelector('title') ||
    opfDoc.querySelector('dc\\:title') ||
    opfDoc.querySelector('*|title');

  const creatorEl =
    opfDoc.querySelector('creator') ||
    opfDoc.querySelector('dc\\:creator') ||
    opfDoc.querySelector('*|creator');

  const languageEl =
    opfDoc.querySelector('language') ||
    opfDoc.querySelector('dc\\:language') ||
    opfDoc.querySelector('*|language');

  const publisherEl =
    opfDoc.querySelector('publisher') ||
    opfDoc.querySelector('dc\\:publisher') ||
    opfDoc.querySelector('*|publisher');

  return {
    title: titleEl?.textContent?.trim() || fileName.replace('.epub', ''),
    author: creatorEl?.textContent?.trim() || 'Autore sconosciuto',
    language: languageEl?.textContent?.trim(),
    publisher: publisherEl?.textContent?.trim(),
  };
}

// ============================================================
// MANIFEST HANDLING
// ============================================================

interface ManifestItem {
  href: string;
  mediaType: string;
}

function buildManifestMap(manifest: NodeListOf<Element>): Record<string, ManifestItem> {
  const manifestMap: Record<string, ManifestItem> = {};

  manifest.forEach((item) => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    const mediaType = item.getAttribute('media-type');

    if (id && href) {
      manifestMap[id] = {
        href: decodeURIComponent(href),
        mediaType: mediaType || '',
      };
    }
  });

  return manifestMap;
}

// ============================================================
// FILE FINDING IN ZIP
// ============================================================

async function findFileInZip(
  zip: JSZip,
  manifestItem: ManifestItem,
  opfDir: string
): Promise<JSZip.JSZipObject | null> {
  const pathsToTry = [
    opfDir + manifestItem.href,
    manifestItem.href,
    (opfDir + manifestItem.href).replace(/^\//, ''),
    manifestItem.href.replace(/^\//, ''),
    opfDir + encodeURIComponent(manifestItem.href),
  ];

  for (const path of pathsToTry) {
    let file = zip.file(path);

    if (!file) {
      // Try case-insensitive search
      const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const files = zip.file(new RegExp('^' + escapedPath + '$', 'i'));
      if (files.length > 0) file = files[0];
    }

    if (file) {
      return file;
    }
  }

  return null;
}

// ============================================================
// HTML TEXT EXTRACTION
// ============================================================

function extractTextFromHtml(htmlContent: string): string {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
  const body = htmlDoc.body || htmlDoc.querySelector('body');

  if (!body) return '';

  // Remove scripts, styles, and navigation
  body.querySelectorAll('script, style, nav, header, footer').forEach((el) => el.remove());

  // Get text content, preserving some structure
  let text = '';
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const nodeText = node.textContent;
    if (nodeText?.trim()) {
      text += nodeText + ' ';
    }
  }

  return text.replace(/\s+/g, ' ').trim();
}

// ============================================================
// CHAPTER EXTRACTION
// ============================================================

async function extractChapters(
  zip: JSZip,
  spineItems: NodeListOf<Element>,
  manifestMap: Record<string, ManifestItem>,
  opfDir: string
): Promise<{ chapters: Chapter[]; fullText: string }> {
  const chapters: Chapter[] = [];
  let fullText = '';

  for (const itemref of Array.from(spineItems)) {
    const idref = itemref.getAttribute('idref');
    if (!idref) continue;

    const manifestItem = manifestMap[idref];
    if (!manifestItem) continue;

    // Only process HTML/XHTML files
    const mediaType = manifestItem.mediaType || '';
    if (!mediaType.includes('html') && !mediaType.includes('xml') && !mediaType.includes('xhtml')) {
      continue;
    }

    const file = await findFileInZip(zip, manifestItem, opfDir);
    if (!file) continue;

    const content = await readFileAsText(file);

    // Check if content looks encrypted (binary garbage)
    const nonPrintable = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
    if (nonPrintable > content.length * 0.05) {
      throw new Error('DRM_PROTECTED');
    }

    const text = extractTextFromHtml(content);

    if (text.length > 50) {
      chapters.push({
        title: `Capitolo ${chapters.length + 1}`,
        text: text,
      });
      fullText += text + ' ';
    }
  }

  return { chapters, fullText: fullText.trim() };
}

// ============================================================
// MAIN PARSE FUNCTION
// ============================================================

export async function parseEpub(file: File): Promise<ParsedEpub> {
  try {
    const zip = await JSZip.loadAsync(file);

    // Check for DRM/encryption FIRST
    const encryptionFile = zip.file('META-INF/encryption.xml');
    if (encryptionFile) {
      const encContent = await encryptionFile.async('text');
      if (checkDRM(encContent)) {
        throw new Error('DRM_PROTECTED');
      }
    }

    // Find container.xml to get the OPF file path
    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('Invalid ePub: missing container.xml');
    }
    const containerXml = await readFileAsText(containerFile);

    // Parse container to find OPF path
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'text/xml');
    const rootfileEl = containerDoc.querySelector('rootfile');
    const opfPath = rootfileEl?.getAttribute('full-path');

    if (!opfPath) {
      throw new Error('Invalid ePub: cannot find OPF path');
    }

    // Get the base directory of the OPF file
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);

    // Load and parse the OPF file
    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      throw new Error('Invalid ePub: cannot read OPF file');
    }
    const opfContent = await readFileAsText(opfFile);
    const opfDoc = parser.parseFromString(opfContent, 'text/xml');

    // Get metadata
    const metadata = extractMetadata(opfDoc, file.name);

    // Get spine order and manifest
    const spineItems = opfDoc.querySelectorAll('spine itemref');
    const manifest = opfDoc.querySelectorAll('manifest item');
    const manifestMap = buildManifestMap(manifest);

    // Extract text from all chapters
    const { chapters, fullText } = await extractChapters(zip, spineItems, manifestMap, opfDir);

    if (fullText.length < 100) {
      throw new Error('Could not extract text from ePub');
    }

    return {
      metadata,
      chapters,
      fullText,
    };
  } catch (error) {
    console.error('ePub parsing error:', error);
    throw error;
  }
}
