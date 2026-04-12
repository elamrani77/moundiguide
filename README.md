# MoundiGuide ⚽🌍

Assistant IA Multilingue pour les Touristes de la Coupe du Monde FIFA 2030

## Déploiement sur Vercel (étape par étape)

### Prérequis
- Un compte GitHub (github.com)
- Un compte Vercel (vercel.com) — gratuit
- Une clé API Anthropic (console.anthropic.com)

### Étape 1 : Créer le repo GitHub

```bash
# Sur ton PC, ouvre le terminal dans le dossier moundiguide
cd moundiguide

# Initialise git
git init
git add .
git commit -m "Initial commit - MoundiGuide"

# Crée un repo sur github.com, puis :
git remote add origin https://github.com/TON_USERNAME/moundiguide.git
git branch -M main
git push -u origin main
```

### Étape 2 : Déployer sur Vercel

1. Va sur **vercel.com** et connecte-toi avec GitHub
2. Clique **"Add New Project"**
3. Sélectionne le repo **moundiguide**
4. Vercel détecte automatiquement Vite — laisse les paramètres par défaut
5. **IMPORTANT** — Avant de cliquer Deploy, ajoute la variable d'environnement :
   - Clique **"Environment Variables"**
   - Name : `ANTHROPIC_API_KEY`
   - Value : `sk-ant-xxxxxxxxxxxxx` (ta vraie clé)
6. Clique **"Deploy"**
7. Attends 1-2 minutes — ton site est en ligne !

### Étape 3 : Tester

Ouvre l'URL fournie par Vercel (ex: moundiguide.vercel.app) et pose une question au chatbot.

## Développement local

```bash
npm install
cp .env.example .env.local
# Édite .env.local et ajoute ta clé API Anthropic
npm run dev
```

## Structure du projet

```
moundiguide/
├── api/
│   └── chat.js          # Serverless function (proxy API Anthropic)
├── src/
│   ├── main.jsx         # Point d'entrée React
│   └── MoundiGuide.jsx  # Composant principal
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .gitignore
```
