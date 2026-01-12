# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ScrollRead is a Progressive Web App (PWA) e-reader with TikTok-style scrolling and Text-to-Speech with synchronized karaoke-style word highlighting. The app is built as a single-file application with no build process.

## Architecture

### Single-File Application
- **All application code** lives in `index.html` - React components, ePub parser, TTS logic, and styles are all inline
- **No build system** - React, Babel, and JSZip are loaded from CDN at runtime
- **No package.json** - This is a pure static site

### Core Files
- `index.html` - Main application (1600+ lines)
- `sw.js` - Service worker for offline caching and PWA functionality
- `manifest.json` - PWA manifest for installability
- `README.md` - Italian documentation with deployment instructions

## Running the Application

### Local Development
```bash
# Option 1: Simple HTTP server (recommended)
python3 -m http.server 8000
# Then open http://localhost:8000

# Option 2: Direct file access (service worker won't work)
open index.html
```

### Testing Changes
1. Make changes to `index.html`
2. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R) to bypass service worker cache
3. Check browser console for errors
4. Test ePub loading and TTS functionality manually

## Key Technical Components

### ePub Parser (`parseEpub` function, lines 97-301)
- Uses JSZip library to extract ePub archive
- **Critical**: Handles DRM detection and multiple encoding formats (UTF-8, ISO-8859-1, Windows-1252)
- Parses OPF file for metadata and reading order
- Extracts text from HTML/XHTML spine items
- **Path handling**: Tries multiple path variations (relative, absolute, encoded) to find content files

### Text-to-Speech System
Two engines are supported:
1. **Browser TTS** (`speakWithBrowserTTS`, lines 1182-1211): Uses Web Speech API with word boundary events for karaoke highlighting
2. **ElevenLabs API** (`speakWithElevenLabs`, lines 418-468): Premium voices with estimated word timing

**Word Synchronization**: The karaoke effect uses `tokenizeWithPositions` (lines 330-344) to track word positions and highlight the currently spoken word.

### Text Chunking
- Text is split into "pages" of ~40 words per chunk (`chunkText`, lines 304-328)
- Chunks respect sentence boundaries to avoid mid-sentence breaks
- Pages auto-advance when TTS finishes speaking

### State Management
All state is React hooks-based with localStorage persistence:
- **Book progress**: `scrollread_pos_${bookTitle}` stores current page index
- **Settings**: `scrollread_settings` stores theme, TTS engine, voice, WPM, API key
- **Library**: `scrollread_books` stores up to 10 recently opened books

### Theme System
Three themes defined in `THEMES` object (lines 355-416): dark, solarized, sepia
- Each theme provides complete color scheme including highlight effects
- Theme affects all UI colors, text contrast, and karaoke glow effects

### Navigation
- **Touch**: Swipe up/down to change pages
- **Keyboard**: Arrow keys (up/down), Space (next page), Enter (play/pause), Escape (back to library)
- **Mouse**: Scroll wheel to navigate pages

## Deployment

### GitHub Pages (Primary Method)
The README includes detailed Italian instructions for GitHub Pages deployment. Key points:
1. Push all files to repository root
2. Enable Pages in Settings → Pages → Source: main branch, / (root)
3. Site will be available at `https://username.github.io/repositoryname/`

### Alternative Hosts
- Netlify: Drag and drop the folder
- Vercel: Import and deploy

**Important**: Service worker paths are relative, so the app should work at any URL path without configuration changes.

## Common Modifications

### Adding New Themes
1. Add theme definition to `THEMES` object (line 355)
2. Define all required color properties (see existing themes for structure)
3. Theme will automatically appear in settings modal

### Adjusting Text Chunking
- Modify `targetWords` parameter in `chunkText` function (default: 40 words)
- Larger chunks = fewer page turns but longer TTS segments
- Smaller chunks = more page turns but faster navigation

### Changing Voice Options
- **Browser voices**: Automatically detected from `speechSynthesis.getVoices()`
- **ElevenLabs voices**: Defined in `ELEVENLABS_VOICES` array (lines 347-352)

### Service Worker Updates
- Increment `CACHE_NAME` version in `sw.js` (line 1) when updating cached assets
- Add new CDN resources to `ASSETS` array if dependencies change

## Important Constraints

### No Build Process
- All code changes must be in valid ES6 that Babel Standalone can transpile in-browser
- Cannot use npm packages that require bundling
- JSX syntax is supported via Babel Standalone

### Browser Compatibility
- Requires modern browser with ES6, Web Speech API, Service Workers
- iOS Safari requires user interaction before playing audio
- Service Worker requires HTTPS in production (or localhost for development)

### LocalStorage Limitations
- ePub books are stored with full text in localStorage
- Browser localStorage typically limited to 5-10MB
- Very large ePubs may exceed storage limits

## Version Management

**CRITICAL**: Always increment `APP_VERSION` in `index.html` (line ~232) when making ANY code changes.

### Version Format
Use semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes or major rewrites
- **MINOR**: New features, significant enhancements
- **PATCH**: Bug fixes, small improvements

### When to Update
- **Bug fixes**: Increment PATCH version (e.g., 1.6.0 → 1.6.1)
- **New features**: Increment MINOR version (e.g., 1.6.1 → 1.7.0)
- **Breaking changes**: Increment MAJOR version (e.g., 1.7.0 → 2.0.0)

### Required Steps
1. Update `APP_VERSION` constant in `index.html`
2. Update `BUILD_DATE` to current date (YYYY-MM-DD format)
3. Include version change in commit message
4. Never commit code changes without updating version

### Example
```javascript
const APP_VERSION = '1.6.1'; // Was 1.6.0
const BUILD_DATE = '2026-01-12'; // Updated to today
```

## Debugging Tips

### Service Worker Issues
```javascript
// In browser console, unregister service worker:
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))
// Then hard refresh
```

### DRM Detection
The ePub parser includes extensive DRM detection (lines 102-111, 250-254). If legitimate ePubs are being rejected, check:
- `encryption.xml` parsing logic
- Non-printable character threshold (currently 5%)

### TTS Not Working
- Browser TTS: Check `speechSynthesis.getVoices()` returns voices
- ElevenLabs: Verify API key is valid and has remaining quota
- iOS: Ensure TTS is triggered by user interaction (button press)
