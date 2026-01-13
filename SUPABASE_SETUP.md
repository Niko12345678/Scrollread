# Supabase Setup per Read It Later

Guida passo-passo per configurare il backend Supabase gratuito per la funzionalità Read It Later.

## 1. Crea Account Supabase (Gratis)

1. Vai su [https://supabase.com](https://supabase.com)
2. Clicca **"Start your project"**
3. Registrati con GitHub (consigliato) o email
4. Free tier: **50k utenti attivi, 500MB database, 1GB storage** → Più che sufficiente per uso personale!

## 2. Crea Nuovo Progetto

1. Dashboard → **"New Project"**
2. Compila:
   - **Name**: ScrollRead (o come preferisci)
   - **Database Password**: Genera una password forte (salvala!)
   - **Region**: Europe West (Ireland) → Più vicino all'Italia
3. Clicca **"Create new project"**
4. ⏱️ Aspetta 2-3 minuti (preparazione database)

## 3. Setup Database Schema

1. Nel dashboard, vai su **SQL Editor** (nella sidebar)
2. Clicca **"New query"**
3. Copia **tutto** il contenuto del file `supabase-schema.sql` dalla root del progetto
4. Incolla nell'editor SQL
5. Clicca **"Run"** (oppure Ctrl+Enter)
6. ✅ Dovresti vedere "Success. No rows returned"

Questo crea:
- Tabella `articles` (per gli articoli salvati)
- Tabella `reading_progress` (progresso lettura)
- Tabella `settings` (impostazioni sync)
- Indexes per performance
- Row Level Security policies

## 4. Deploy Edge Function (Estrazione Articoli)

### Installa Supabase CLI

**macOS (Homebrew):**
```bash
brew install supabase/tap/supabase
```

**Linux/macOS (via npm):**
```bash
npm install -g supabase
```

**Windows:**
Download da [https://github.com/supabase/cli/releases](https://github.com/supabase/cli/releases)

### Deploy Function

1. Login nel CLI:
```bash
supabase login
```

2. Link al progetto:
```bash
cd /percorso/ScrollRead
supabase link --project-ref TUO_PROJECT_REF
```
*Trovi PROJECT_REF nel dashboard sotto Settings → General*

3. Deploy function:
```bash
supabase functions deploy extract-article
```

4. ✅ Output: `Deployed Function extract-article version [hash]`

## 5. Ottieni Credenziali API

1. Dashboard → **Settings** (icona ingranaggio, in basso) → **API**
2. Copia questi valori:

   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: La chiave sotto "Project API keys" → `anon` `public`

⚠️ **NON** usare la `service_role` key (è per il backend server-side)

## 6. Configura App Locale

Nel progetto v2, crea file `.env`:

```bash
cd v2
cp .env.example .env
```

Modifica `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

## 7. Test Locale

```bash
cd v2
npm run dev
```

1. Apri app → Clicca **📌** (Read It Later)
2. Incolla un URL (es. https://example.com/article)
3. Clicca **💾**
4. ✅ Dovrebbe salvare l'articolo e mostrarlo nella lista!

## 8. Verifica nel Dashboard

1. Dashboard → **Table Editor** → Tabella `articles`
2. Dovresti vedere l'articolo appena salvato con tutti i campi

---

## 🔧 Troubleshooting

### "Supabase credentials not configured"
→ Controlla che il file `.env` esista in `v2/` e contenga le variabili corrette

### "Failed to invoke function"
→ Verifica che la Edge Function sia deployed:
```bash
supabase functions list
```

### "Failed to extract article"
→ Alcuni siti bloccano gli scraper. Prova con un URL diverso (es. Medium, blog personali funzionano bene)

### "CORS error"
→ Le Edge Functions hanno CORS abilitato di default. Se persiste, controlla i logs:
```bash
supabase functions logs extract-article
```

---

## 💰 Limiti Free Tier

| Risorsa | Limite Gratis | Note |
|---------|---------------|------|
| Database | 500MB | ~5000 articoli di media lunghezza |
| Storage | 1GB | Per immagini/allegati futuri |
| Edge Functions | 500k invocations/mese | ~16k al giorno |
| Bandwidth | 5GB/mese | Più che sufficiente |

Per uso personale (pochi articoli al giorno), non raggiungerai mai i limiti!

---

## 🚀 Deploy Produzione

Quando deployai su Vercel/Netlify, aggiungi le variabili d'ambiente:

**Vercel:**
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

**Netlify:**
Dashboard → Site settings → Environment variables

---

## 🔐 Sicurezza

✅ **Cosa è sicuro:**
- La `anon` key è pubblica → OK condividerla nel frontend
- Row Level Security (RLS) protegge il database
- Edge Functions validano input

⚠️ **Non fare:**
- NON usare `service_role` key nel frontend
- NON committare `.env` nel git (già in `.gitignore`)

---

## 📚 Risorse

- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [CLI Reference](https://supabase.com/docs/reference/cli)

---

Fatto! 🎉 Ora hai un backend gratis e scalabile per Read It Later!
