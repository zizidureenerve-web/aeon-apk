# Abyssal 🌊

Un jeu de devinette **sémantique** à thème sous-marin, inspiré de l'esprit de
sites comme *abyssion.fr* : un mot repose au fond de l'abysse. À chaque partie,
une **énigme différente** s'affiche. Vous proposez des mots ; un moteur mesure
la **proximité sémantique** de chaque proposition avec la cible cachée, et plus
vous vous rapprochez, plus votre plongeur **descend** vers le fond.

- 🎲 **Questions qui changent à chaque partie** — tirées au hasard d'une liste.
- 🧭 **Détection de la réponse la plus proche** — similarité cosinus sur des
  embeddings (NVIDIA NIM ou tout endpoint compatible OpenAI), avec repli lexical
  local si aucune clé n'est fournie.
- 🤿 **Jauge de profondeur** animée : 0 m en surface, 1000 m au fond.

## Lancer

```bash
npm install
npm start
# → http://localhost:3000
```

## Moteur de similarité

Le jeu fonctionne **sans clé** (repli lexical sur les bigrammes). Pour une vraie
proximité de sens, copiez `.env.example` vers `.env` et renseignez une option :

| Moteur | Variables |
|---|---|
| **NVIDIA NIM** | `NVIDIA_NIM_API_KEY` (+ `NVIDIA_NIM_MODEL`, défaut `nvidia/nv-embedqa-e5-v5`) |
| **OpenAI-compatible** | `EMBEDDINGS_API_KEY` (+ `EMBEDDINGS_MODEL`, `EMBEDDINGS_BASE_URL`) |

Chargez le `.env` au lancement, par exemple :

```bash
node --env-file=.env server.js
```

## Structure

```
server.js      # Express : sert le front + API /new, /guess, /giveup
words.js       # liste des cibles (mot caché + énigme)
public/        # front (index.html, style.css, app.js)
.env.example   # configuration des clés API
```

## API

- `GET  /api/new` → `{ gameId, indice, maxDepth, engine }`
- `POST /api/guess` `{ gameId, guess }` → `{ score, depth, percent, solved, answer? }`
- `POST /api/giveup` `{ gameId }` → `{ answer, guesses }`

Le mot cible n'est **jamais** envoyé au client tant qu'il n'est pas trouvé ou
que la partie n'est pas abandonnée.
