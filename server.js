import express from "express";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WORDS } from "./words.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const MAX_DEPTH = 1000; // mètres : le fond de l'abysse où repose le mot

/* ------------------------------------------------------------------ *
 * Configuration du moteur de similarité
 *   1. NVIDIA NIM           → NVIDIA_NIM_API_KEY
 *   2. OpenAI-compatible    → EMBEDDINGS_API_KEY (+ EMBEDDINGS_BASE_URL / MODEL)
 *   3. Repli lexical local  → aucune clé nécessaire
 * ------------------------------------------------------------------ */
function resolveEngine() {
  if (process.env.NVIDIA_NIM_API_KEY) {
    return {
      kind: "nvidia",
      baseUrl: process.env.NVIDIA_NIM_BASE_URL || "https://integrate.api.nvidia.com/v1",
      apiKey: process.env.NVIDIA_NIM_API_KEY,
      model: process.env.NVIDIA_NIM_MODEL || "nvidia/nv-embedqa-e5-v5",
    };
  }
  if (process.env.EMBEDDINGS_API_KEY) {
    return {
      kind: "openai",
      baseUrl: process.env.EMBEDDINGS_BASE_URL || "https://api.openai.com/v1",
      apiKey: process.env.EMBEDDINGS_API_KEY,
      model: process.env.EMBEDDINGS_MODEL || "text-embedding-3-small",
    };
  }
  return { kind: "local" };
}
const ENGINE = resolveEngine();
console.log(`[abyssal] moteur de similarité : ${ENGINE.kind}` +
  (ENGINE.model ? ` (${ENGINE.model})` : ""));

/* ------------------------------------------------------------------ *
 * Embeddings
 * ------------------------------------------------------------------ */
const embedCache = new Map(); // texte normalisé -> vecteur

async function fetchEmbedding(text, inputType /* "query" | "passage" */) {
  const key = `${ENGINE.kind}:${inputType}:${text}`;
  if (embedCache.has(key)) return embedCache.get(key);

  const body = { model: ENGINE.model, input: [text], encoding_format: "float" };
  // NVIDIA NIM (nv-embedqa) exige input_type pour distinguer requête et document.
  if (ENGINE.kind === "nvidia") body.input_type = inputType === "query" ? "query" : "passage";

  const res = await fetch(`${ENGINE.baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENGINE.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Embeddings ${res.status}: ${detail.slice(0, 300)}`);
  }
  const json = await res.json();
  const vec = json?.data?.[0]?.embedding;
  if (!Array.isArray(vec)) throw new Error("Réponse d'embeddings invalide");
  embedCache.set(key, vec);
  return vec;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/* ------------------------------------------------------------------ *
 * Repli lexical (sans clé API) : coefficient de Dice sur les bigrammes
 * ------------------------------------------------------------------ */
function bigrams(s) {
  const set = new Set();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
}
function diceSimilarity(a, b) {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const A = bigrams(a), B = bigrams(b);
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return (2 * inter) / (A.size + B.size);
}

/* ------------------------------------------------------------------ *
 * Similarité d'une proposition vers la cible → score calibré [0,1]
 * ------------------------------------------------------------------ */
const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/[-'’]/g, " ")          // traits d'union et apostrophes -> espace
    .replace(/[^a-z0-9\s]/g, "")     // ponctuation restante
    .replace(/\s+/g, " ")            // espaces multiples
    .trim();

async function similarity(guess, target) {
  const g = normalize(guess);
  const t = normalize(target);
  if (!g) return { raw: 0, score: 0, solved: false };
  if (g === t) return { raw: 1, score: 1, solved: true };

  let raw;
  if (ENGINE.kind === "local") {
    raw = diceSimilarity(g, t);
  } else {
    const [vg, vt] = await Promise.all([
      fetchEmbedding(g, "query"),
      fetchEmbedding(t, "passage"),
    ]);
    raw = cosine(vg, vt);
  }

  // Calibrage : les embeddings sémantiques saturent haut (~0.5–1.0).
  // On étale cette plage utile sur [0,1] pour que la profondeur soit parlante.
  const FLOOR = ENGINE.kind === "local" ? 0 : 0.35;
  let score = (raw - FLOOR) / (1 - FLOOR);
  score = Math.max(0, Math.min(1, score));
  const solved = score >= 0.985;
  return { raw, score, solved };
}

/* ------------------------------------------------------------------ *
 * État des parties (en mémoire)
 * ------------------------------------------------------------------ */
const games = new Map(); // gameId -> { wordIndex, guesses, solved, createdAt }

function newGame() {
  const wordIndex = Math.floor(Math.random() * WORDS.length);
  const gameId = crypto.randomUUID();
  games.set(gameId, { wordIndex, guesses: 0, solved: false, createdAt: Date.now() });
  return { gameId, wordIndex };
}

// Purge des parties de plus de 6 h, toutes les heures.
setInterval(() => {
  const cutoff = Date.now() - 6 * 3600 * 1000;
  for (const [id, g] of games) if (g.createdAt < cutoff) games.delete(id);
}, 3600 * 1000).unref?.();

/* ------------------------------------------------------------------ *
 * API
 * ------------------------------------------------------------------ */
app.get("/api/new", (_req, res) => {
  const { gameId, wordIndex } = newGame();
  res.json({
    gameId,
    theme: WORDS[wordIndex].theme,
    indice: WORDS[wordIndex].indice,
    maxDepth: MAX_DEPTH,
    engine: ENGINE.kind,
  });
});

app.post("/api/guess", async (req, res) => {
  const { gameId, guess } = req.body || {};
  const game = games.get(gameId);
  if (!game) return res.status(404).json({ error: "Partie introuvable. Lance une nouvelle plongée." });
  if (typeof guess !== "string" || !guess.trim())
    return res.status(400).json({ error: "Proposition vide." });

  const target = WORDS[game.wordIndex].mot;
  try {
    const { score, solved } = await similarity(guess, target);
    game.guesses += 1;
    const depth = Math.round(score * MAX_DEPTH);
    if (solved) game.solved = true;
    res.json({
      guess: guess.trim(),
      score,                       // 0..1
      depth,                       // mètres
      percent: Math.round(score * 100),
      solved,
      guesses: game.guesses,
      answer: solved ? target : undefined,
    });
  } catch (err) {
    console.error("[abyssal] erreur de similarité :", err.message);
    res.status(502).json({ error: "Le sonar est en panne (moteur de similarité indisponible).", detail: err.message });
  }
});

app.post("/api/giveup", (req, res) => {
  const { gameId } = req.body || {};
  const game = games.get(gameId);
  if (!game) return res.status(404).json({ error: "Partie introuvable." });
  res.json({ answer: WORDS[game.wordIndex].mot, guesses: game.guesses });
});

app.listen(PORT, () => console.log(`[abyssal] à l'écoute sur http://localhost:${PORT}`));
