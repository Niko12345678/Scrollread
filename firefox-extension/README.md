# ScrollRead Gist Saver - Firefox Extension

Estensione Firefox per salvare velocemente articoli web su GitHub Gist per leggerli su ScrollRead.

## 🚀 Setup

### 1. Preparare le icone

Le icone devono essere create dalle icone esistenti di ScrollRead:

```bash
# Con ImageMagick
convert ../icon-192.png -resize 48x48 icon-48.png
convert ../icon-192.png -resize 96x96 icon-96.png

# Oppure con un editor grafico, esporta:
# - icon-48.png (48×48 px)
# - icon-96.png (96×96 px)
```

### 2. Configurare GitHub Gist

1. Vai su [gist.github.com](https://gist.github.com)
2. Crea una nuova **Gist privata** (o usa quella esistente di ScrollRead)
3. Aggiungi/verifica questi tre file:
   - `queue.json` con contenuto `[]`
   - `progress.json` con contenuto `{}`
   - `articles.json` con contenuto `[]` ⚠️ **NUOVO**
4. Copia l'ID della Gist dalla URL (es: `abc123def456...`)

### 3. Creare GitHub Personal Access Token

1. Vai su [github.com/settings/tokens](https://github.com/settings/tokens)
2. Clicca "Generate new token (classic)"
3. Dai un nome (es: "ScrollRead Extension")
4. Seleziona lo scope **gist** (permesso di leggere/scrivere Gist)
5. Clicca "Generate token"
6. Copia il token (inizia con `ghp_...`)

### 4. Installare l'estensione

#### Metodo 1: Installazione temporanea (development)

1. Apri Firefox
2. Vai su `about:debugging#/runtime/this-firefox`
3. Clicca "Carica componente aggiuntivo temporaneo"
4. Seleziona il file `manifest.json` in questa cartella
5. L'estensione verrà caricata fino alla chiusura del browser

#### Metodo 2: Installazione permanente (packaging)

```bash
# Crea il file .xpi
cd firefox-extension
zip -r scrollread-gist-saver.xpi *

# Poi in Firefox:
# 1. Vai su about:addons
# 2. Clicca sulla rotella ⚙️ → "Installa componente aggiuntivo da file"
# 3. Seleziona scrollread-gist-saver.xpi
```

## 📖 Utilizzo

### Prima configurazione

1. Clicca sull'icona dell'estensione nella toolbar
2. Inserisci il **Gist ID** e il **GitHub PAT**
3. Clicca "Salva configurazione"

⚠️ **Usa la stessa Gist e lo stesso token configurati nell'app ScrollRead!**

### Salvare un articolo

**Metodo 1: Context menu**
- Click destro sulla pagina → "Salva su ScrollRead"

**Metodo 2: Popup**
- Clicca sull'icona dell'estensione → "💾 Salva questa pagina"

**Metodo 3: Shortcut (opzionale)**
- Configura una scorciatoia da tastiera in `about:addons` → ⚙️ → "Gestisci scorciatoie estensioni"

### Leggere su ScrollRead

1. Apri ScrollRead ([tua-app-url])
2. Nella schermata Library, clicca "📥 Importa da Gist"
3. Gli articoli salvati appariranno nella coda di lettura

## 🔧 Funzionalità

### Estrazione intelligente del contenuto

L'estensione estrae automaticamente:
- ✅ Titolo dell'articolo
- ✅ Testo principale (rimuove menu, footer, ads)
- ✅ Autore (se disponibile)
- ✅ Nome del sito
- ✅ URL originale
- ✅ Data di salvataggio

### Storage su Gist

Gli articoli vengono salvati in `articles.json` con questa struttura:

```json
[
  {
    "id": "unique-id",
    "title": "Titolo dell'articolo",
    "url": "https://example.com/article",
    "content": "Testo completo...",
    "author": "Nome Autore",
    "siteName": "example.com",
    "savedAt": "2025-01-12T10:30:00.000Z",
    "readAt": null,
    "archived": false
  }
]
```

## 🐛 Troubleshooting

### "Configurazione mancante"
- Verifica di aver inserito sia Gist ID che GitHub PAT nel popup

### "Failed to fetch Gist: 404"
- Controlla che il Gist ID sia corretto
- Verifica che la Gist esista e sia accessibile

### "Failed to fetch Gist: 401"
- Il token GitHub è scaduto o non ha i permessi corretti
- Genera un nuovo token con scope "gist"

### "Impossibile estrarre il contenuto"
- Alcune pagine dinamiche potrebbero non essere supportate
- Prova a salvare dopo che la pagina è completamente caricata
- Per siti complessi, potrebbe essere necessario migliorare i selettori in `content.js`

### L'articolo appare vuoto su ScrollRead
- Verifica che `articles.json` sia stato creato nella Gist
- Controlla la console del browser per errori durante il salvataggio

## 📝 File structure

```
firefox-extension/
├── manifest.json      # Configurazione estensione
├── background.js      # Logica Gist API e context menu
├── content.js         # Estrazione contenuto pagina
├── popup.html         # UI popup configurazione
├── popup.js           # Logica popup
├── icon-48.png        # Icona 48x48
├── icon-96.png        # Icona 96x96
└── README.md          # Questo file
```

## 🚀 Next steps

Possibili miglioramenti futuri:
- [ ] Sync bidirezionale: marcare articoli come "letti" dall'app
- [ ] Tag e categorie per organizzare articoli
- [ ] Ricerca full-text negli articoli salvati
- [ ] Export in altri formati (Markdown, EPUB)
- [ ] Supporto per salvare selezione di testo invece dell'intera pagina
- [ ] Shortcut da tastiera personalizzabili

## 📄 License

Stesso license di ScrollRead (vedi repository principale)
