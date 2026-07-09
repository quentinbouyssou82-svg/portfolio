# Calisthenics AI Tracker

Application personnelle de suivi d'entraînement en calisthénie, 100 % locale, avec IA via Ollama/Qwen.

## Démarrage rapide

```bash
cd calisthenics-tracker
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run dev
```

- **Mac / navigateur** : http://localhost:3000
- **Téléphone (LAN)** : http://\<ip-locale\>:3000
- **API** : http://localhost:3001
- **PIN par défaut** : `0610`

## Prérequis

- Node.js ≥ 20
- [Ollama](https://ollama.com) avec le modèle Qwen :
  ```bash
  ollama pull qwen2.5-coder
  ```

## Structure

```
calisthenics-tracker/
├── apps/
│   ├── mobile-web/    # Vite + React PWA (port 3000)
│   └── backend/       # Express + Prisma (port 3001)
├── packages/
│   ├── types/         # Types TypeScript partagés
│   ├── utils/         # Utilitaires (auth PIN, formatage)
│   ├── prompts/       # Prompts IA (parsing, analyse)
│   ├── database/      # Prisma + SQLite
│   └── ui/            # Composants UI partagés
└── docs/
    └── ARCHITECTURE.md
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Frontend + backend en parallèle |
| `npm run dev:web` | Frontend seul |
| `npm run dev:api` | Backend seul |
| `npm run build` | Build production |
| `npm run db:studio` | Prisma Studio |
| `npm test` | Tests unitaires |

## Roadmap

Voir `docs/ARCHITECTURE.md` pour le détail des étapes 1–13.
