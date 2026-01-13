# ScrollRead v2 - Production Architecture

**Production-ready rebuild** of ScrollRead with modern architecture, TypeScript, and unlimited storage.

## 🆕 What's New in v2

### Core Improvements
- ✅ **Modular TypeScript codebase** - Maintainable, type-safe architecture
- ✅ **IndexedDB storage** - No more localStorage limits, store unlimited books
- ✅ **Better performance** - Optimized ePub parsing and rendering
- ✅ **Full feature parity** with POC (v1)
- 🚧 **Read It Later** - Coming next (save articles from web)

### Technical Stack
- React 18 + TypeScript
- Vite (fast builds & HMR)
- IndexedDB (via `idb` library)
- JSZip (ePub parsing)
- Web Speech API + ElevenLabs TTS

## 🚀 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
v2/
├── src/
│   ├── components/
│   │   ├── Library/      # Book list & upload
│   │   ├── Reader/       # TTS reader with karaoke
│   │   └── Settings/     # Settings modal
│   ├── modules/
│   │   ├── epub/         # ePub parser & text utils
│   │   ├── storage/      # IndexedDB wrapper
│   │   └── tts/          # TTS engines (Browser, ElevenLabs)
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Constants & themes
│   └── App.tsx           # Main app component
└── dist/                 # Production build
```

## 🎨 Features

### Reader
- 📖 ePub book support (DRM-free)
- 🎤 Text-to-Speech (Browser TTS + ElevenLabs)
- ✨ Karaoke word highlighting
- 🎨 3 themes (Dark, Solarized, Sepia)
- ⚡ Adjustable reading speed (WPM)
- 📊 Progress tracking
- ⌨️ Keyboard navigation

### Storage
- 💾 IndexedDB for unlimited books
- 🔄 Auto-migration from v1 localStorage
- 📈 Reading progress sync

## 🔜 Roadmap

### Phase 1: Read It Later (In Progress)
- [ ] Supabase backend setup
- [ ] Article extractor Edge Function
- [ ] ReadLater component
- [ ] Cloud sync across devices

### Phase 2: Mobile & Extensions
- [ ] Capacitor for native Android app
- [ ] Browser extension for saving URLs
- [ ] PWA enhancements

### Phase 3: Polish
- [ ] Performance optimizations
- [ ] Virtual scrolling for long books
- [ ] Better TTS word timing (ML-based)
- [ ] Annotations & highlights

## 📝 Migration from v1

The app automatically migrates:
- ✅ Settings (theme, voice, WPM)
- ✅ Saved books
- ✅ Reading progress

No manual action needed!

## 🐛 Known Issues

- [ ] ElevenLabs word timing is estimated (not precise)
- [ ] iOS Safari requires user interaction before TTS

## 📄 License

MIT
