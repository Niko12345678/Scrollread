# ScrollRead PWA

E-reader in stile TikTok con Text-to-Speech e effetto karaoke.

## Funzionalità

- 📱 **PWA installabile** - Funziona su browser, Android e iOS
- 📖 **Supporto ePub** - Carica qualsiasi libro in formato ePub
- 🎤 **Text-to-Speech** - Voci browser gratuite + ElevenLabs premium
- ✨ **Effetto karaoke** - Parole illuminate sincronizzate con l'audio
- 🎨 **Temi** - Scuro, Solarized (chiaro), Seppia
- ⚡ **Velocità in WPM** - Parole al minuto, più intuitivo
- 💾 **Offline** - Funziona anche senza connessione
- 📊 **Progresso salvato** - Riprendi da dove avevi lasciato

## Pubblicazione su GitHub Pages (CONSIGLIATO)

### Passo 1: Crea il repository

1. Vai su [github.com](https://github.com) e accedi
2. Clicca il pulsante **"+"** in alto a destra → **"New repository"**
3. Nome repository: `scrollread` (o quello che preferisci)
4. Lascia **Public** selezionato
5. **NON** selezionare "Add a README file"
6. Clicca **"Create repository"**

### Passo 2: Carica i file

**Opzione A - Via browser (più semplice):**

1. Nella pagina del repository vuoto, clicca **"uploading an existing file"**
2. Trascina TUTTI i file dalla cartella scaricata:
   - `index.html`
   - `sw.js`
   - `manifest.json`
   - `icon-192.png`
   - `icon-512.png`
3. Scrivi un messaggio tipo "Initial commit"
4. Clicca **"Commit changes"**

**Opzione B - Via Git (se lo hai installato):**

```bash
# Clona il repo vuoto
git clone https://github.com/TUO_USERNAME/scrollread.git
cd scrollread

# Copia i file nella cartella
# (copia index.html, sw.js, manifest.json, icon-192.png, icon-512.png)

# Carica
git add .
git commit -m "Initial commit"
git push origin main
```

### Passo 3: Attiva GitHub Pages

1. Nel repository, vai su **Settings** (icona ingranaggio)
2. Nel menu a sinistra, clicca **"Pages"**
3. Sotto "Source", seleziona:
   - Branch: **main**
   - Folder: **/ (root)**
4. Clicca **"Save"**
5. Aspetta 1-2 minuti

### Passo 4: Accedi all'app

Il tuo sito sarà disponibile a:
```
https://TUO_USERNAME.github.io/scrollread/
```

(sostituisci TUO_USERNAME col tuo username GitHub)

**Nota:** La prima volta potrebbe mostrare 404, aspetta qualche minuto e ricarica.

---

## Alternative di hosting

### Netlify (drag & drop)

1. Vai su [app.netlify.com/drop](https://app.netlify.com/drop)
2. Trascina la cartella decompressa
3. Fatto! Ricevi subito un URL

### Vercel

1. Vai su [vercel.com](https://vercel.com)
2. "Add New Project" → importa da GitHub o trascina cartella
3. Deploy automatico

---

## Installazione come App

### Android (Chrome)
1. Apri il sito in Chrome
2. Menu ⋮ → "Aggiungi a schermata Home"
3. ScrollRead apparirà come app

### iOS (Safari)
1. Apri il sito in Safari
2. Tocca l'icona condividi ⬆️
3. "Aggiungi a Home"

---

## Voci Premium (ElevenLabs)

Le voci del browser sono basilari. Per voci naturali:

1. Crea account su [elevenlabs.io](https://elevenlabs.io) (10k caratteri gratis/mese)
2. Copia la tua API Key dal profilo
3. In ScrollRead: Impostazioni → ElevenLabs → incolla la key

---

## File inclusi

```
scrollread/
├── index.html      # App completa
├── manifest.json   # Configurazione PWA
├── sw.js          # Service Worker (offline)
├── icon-192.png   # Icona piccola
├── icon-512.png   # Icona grande
└── README.md      # Questo file
```

---

## Troubleshooting

**L'ePub non si carica:**
- Alcuni ePub hanno formati non standard. Prova con un altro file.
- Controlla che il file sia .epub e non .pdf

**Il cambio pagina non funziona:**
- Svuota la cache del browser (Ctrl+Shift+R)
- Se hai la PWA installata, disinstallala e reinstallala

**GitHub Pages mostra 404:**
- Aspetta 2-3 minuti dopo il primo deploy
- Verifica che i file siano nella root del repository
- Controlla che Pages sia attivato su branch "main"

---

## Licenza

MIT - Usa come vuoi!
