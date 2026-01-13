# 🚀 Guida Deploy ScrollRead v2

Guida completa per pubblicare ScrollRead v2 su Vercel (hosting gratuito).

## Prerequisiti

✅ Hai configurato Supabase (vedi `SUPABASE_SETUP.md`)
✅ Hai le credenziali Supabase (URL + anon key)
✅ Hai un account GitHub (per il repository)

## Metodo 1: Deploy via Dashboard Vercel (Consigliato)

### Step 1: Crea Account Vercel

1. Vai su [https://vercel.com](https://vercel.com)
2. Clicca **"Sign Up"**
3. Scegli **"Continue with GitHub"** (più facile per il deploy automatico)
4. Autorizza Vercel ad accedere a GitHub

### Step 2: Import Repository

1. Nel dashboard Vercel, clicca **"Add New..."** → **"Project"**
2. Autorizza Vercel ad accedere ai tuoi repository GitHub
3. Seleziona il repository **`Scrollread`**
4. Clicca **"Import"**

### Step 3: Configura Progetto

Vercel rileverà automaticamente Vite. Configura:

- **Framework Preset**: Vite (auto-rilevato)
- **Root Directory**: `v2` ⚠️ **IMPORTANTE!**
- **Build Command**: `npm run build` (già preconfigurato)
- **Output Directory**: `dist` (già preconfigurato)

### Step 4: Aggiungi Variabili d'Ambiente

**Prima di fare deploy**, clicca su **"Environment Variables"**:

1. Aggiungi `VITE_SUPABASE_URL`:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://xxxxx.supabase.co` (il tuo URL Supabase)
   - Environment: **Production**, **Preview**, **Development** (tutti e 3)

2. Aggiungi `VITE_SUPABASE_ANON_KEY`:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIs...` (la tua anon key)
   - Environment: **Production**, **Preview**, **Development** (tutti e 3)

### Step 5: Deploy

1. Clicca **"Deploy"**
2. ⏱️ Aspetta 2-3 minuti (Vercel fa il build)
3. ✅ Quando vedi **"Congratulations!"**, il deploy è completo!

### Step 6: Apri App

1. Clicca sul link tipo: `https://scrollread-xxx.vercel.app`
2. 🎉 L'app è online!

---

## Metodo 2: Deploy via CLI (Alternativo)

Per sviluppatori più esperti:

```bash
# Installa Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy da v2/
cd v2
vercel

# Aggiungi variabili d'ambiente
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Redeploy con le variabili
vercel --prod
```

---

## ⚙️ Configurazione Post-Deploy

### Custom Domain (Opzionale)

Se hai un dominio:

1. Dashboard Vercel → **Settings** → **Domains**
2. Aggiungi il tuo dominio (es. `scrollread.tuodominio.com`)
3. Segui le istruzioni per configurare i DNS

### Deploy Automatici

Ogni volta che fai push su GitHub:
- ✅ **Branch principale** → Deploy in produzione automatico
- ✅ **Altri branch** → Preview deployment (URL temporaneo)

Per disabilitare deploy automatici:
- Dashboard → **Settings** → **Git** → Configura branch

---

## 🔍 Verifica Funzionamento

Dopo il deploy, testa:

1. ✅ **Carica ePub**: Funziona il lettore?
2. ✅ **Read It Later**: Clicca 📌, incolla un URL
3. ✅ **TTS**: Play audio funziona?
4. ✅ **Temi**: Cambia tema nelle impostazioni
5. ✅ **Storage**: Ricarica pagina, i libri rimangono?

### Troubleshooting

**"Failed to fetch article"**
→ Controlla che le variabili d'ambiente Supabase siano configurate correttamente in Vercel

**"Supabase not configured"**
→ Le variabili d'ambiente devono iniziare con `VITE_` per Vite!

**Build fallisce**
→ Verifica che "Root Directory" sia impostato su `v2`

**404 su refresh**
→ Il file `vercel.json` dovrebbe gestire le routes SPA (già configurato)

---

## 📊 Analytics (Opzionale)

Vercel offre analytics gratuiti:

1. Dashboard → **Analytics**
2. Attiva analytics (gratis fino a 100k eventi/mese)
3. Vedi visite, performance, errori

---

## 🔄 Aggiornamenti Futuri

Per aggiornare l'app:

1. Fai modifiche al codice localmente
2. Commit e push su GitHub:
   ```bash
   git add .
   git commit -m "feat: nuova feature"
   git push
   ```
3. Vercel fa deploy automaticamente! ⚡

Vedi il deploy in tempo reale:
- Dashboard Vercel → **Deployments**
- Ogni deploy ha log completi

---

## 💰 Costi

**Vercel Free Tier (Hobby Plan):**
- ✅ 100 GB bandwidth/mese
- ✅ Deploy illimitati
- ✅ HTTPS automatico
- ✅ CDN globale
- ✅ Preview deployments
- ✅ Analytics (100k eventi/mese)

Più che sufficiente per uso personale!

**Se superi i limiti:**
- Vercel ti avvisa prima
- Puoi upgradare a Pro ($20/mese) solo se necessario

---

## 🌐 Alternative a Vercel

### Netlify (Simile a Vercel)

1. [https://netlify.com](https://netlify.com) → Sign up
2. **"Add new site"** → **"Import from Git"**
3. Seleziona repository
4. **Base directory**: `v2`
5. **Build command**: `npm run build`
6. **Publish directory**: `v2/dist`
7. Aggiungi environment variables
8. Deploy!

### GitHub Pages (Solo Reader, NO Supabase)

Solo se vuoi hosting minimale senza backend:

```bash
cd v2
npm install gh-pages --save-dev
npm run build

# Aggiungi al package.json:
# "homepage": "https://USERNAME.github.io/Scrollread",
# "deploy": "gh-pages -d dist"

npm run deploy
```

⚠️ **Limitazione**: Non puoi usare variabili d'ambiente su GitHub Pages, quindi Read It Later non funzionerà.

---

## ✅ Checklist Deploy

- [ ] Account Vercel creato
- [ ] Repository importato
- [ ] Root directory = `v2`
- [ ] Variabili d'ambiente configurate (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] Deploy completato (verde)
- [ ] App testata e funzionante
- [ ] URL salvato e condiviso (se vuoi)

---

🎉 **Congratulazioni!** ScrollRead è online e accessibile da qualsiasi dispositivo!

Per supporto: vedi [Vercel Docs](https://vercel.com/docs) o [Vite Docs](https://vitejs.dev/guide/static-deploy.html)
