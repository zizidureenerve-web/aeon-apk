const $ = (id) => document.getElementById(id);

const state = { gameId: null, maxDepth: 1000, best: 0, solved: false, rows: new Map() };

const els = {
  hint: $("hint"),
  engine: $("engine"),
  input: $("guess-input"),
  btn: $("guess-btn"),
  form: $("guess-form"),
  status: $("status"),
  depthCurrent: $("depth-current"),
  gaugeFill: $("gauge-fill"),
  diver: $("diver"),
  list: $("guesses-list"),
  guessesTitle: $("guesses-title"),
  giveup: $("giveup-btn"),
  newBtn: $("new-btn"),
  overlay: $("win-overlay"),
  winWord: $("win-word"),
  winStats: $("win-stats"),
  winTitle: $("win-title"),
  winAgain: $("win-again"),
};

function colorFor(score) {
  // du bleu froid (loin) au vert chaud (proche)
  const hue = 200 - score * 60; // 200 → 140
  const light = 45 + score * 20;
  return `hsl(${hue}, 80%, ${light}%)`;
}

function setDepth(score) {
  const depth = Math.round(score * state.maxDepth);
  els.depthCurrent.textContent = depth;
  const pct = score * 100;
  els.gaugeFill.style.height = pct + "%";
  els.diver.style.top = pct + "%";
}

function renderRow(data) {
  const key = data.guess.toLowerCase();
  let row = state.rows.get(key);
  if (!row) {
    row = document.createElement("li");
    row.className = "row";
    row.innerHTML = `<span class="word"></span><span class="pct"></span><span class="bar"><i></i></span>`;
    els.list.prepend(row);
    state.rows.set(key, row);
  }
  row.querySelector(".word").textContent = data.guess;
  row.querySelector(".pct").textContent = data.percent + " %";
  const bar = row.querySelector(".bar > i");
  bar.style.width = data.percent + "%";
  bar.style.background = colorFor(data.score);
  resort();
}

function resort() {
  const items = [...els.list.children];
  items.sort((a, b) => parseInt(b.querySelector(".pct").textContent) - parseInt(a.querySelector(".pct").textContent));
  items.forEach((el, i) => {
    el.classList.toggle("best", i === 0);
    els.list.appendChild(el);
  });
}

async function newGame() {
  els.overlay.hidden = true;
  els.status.textContent = "";
  els.list.innerHTML = "";
  state.rows.clear();
  state.best = 0;
  state.solved = false;
  setDepth(0);
  els.guessesTitle.hidden = true;
  els.input.disabled = true;
  els.btn.disabled = true;
  els.hint.textContent = "Chargement du sonar…";

  try {
    const r = await fetch("/api/new");
    const d = await r.json();
    state.gameId = d.gameId;
    state.maxDepth = d.maxDepth;
    els.hint.textContent = d.indice;
    els.engine.textContent = d.engine === "local"
      ? "sonar local (sans clé API)"
      : `sonar sémantique : ${d.engine}`;
    els.input.disabled = false;
    els.btn.disabled = false;
    els.giveup.hidden = false;
    els.input.focus();
  } catch {
    els.hint.textContent = "Impossible de contacter le sonar.";
  }
}

async function submitGuess(e) {
  e.preventDefault();
  const guess = els.input.value.trim();
  if (!guess || state.solved) return;
  els.status.textContent = "";
  els.btn.disabled = true;

  try {
    const r = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: state.gameId, guess }),
    });
    const d = await r.json();
    if (!r.ok) { els.status.textContent = d.error || "Erreur."; return; }

    els.guessesTitle.hidden = false;
    renderRow(d);
    els.input.value = "";

    if (d.score > state.best) {
      state.best = d.score;
      setDepth(d.score);
    }

    if (d.solved) {
      state.solved = true;
      win(d);
    }
  } catch {
    els.status.textContent = "Le sonar ne répond pas.";
  } finally {
    if (!state.solved) { els.btn.disabled = false; els.input.focus(); }
  }
}

function win(d) {
  setDepth(1);
  els.winWord.textContent = d.answer;
  els.winStats.textContent = `Atteint en ${d.guesses} sonde${d.guesses > 1 ? "s" : ""}.`;
  els.winTitle.textContent = "Touché le fond !";
  els.overlay.hidden = false;
  els.input.disabled = true;
  els.btn.disabled = true;
}

async function giveUp() {
  if (!state.gameId || state.solved) return;
  const r = await fetch("/api/giveup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId: state.gameId }),
  });
  const d = await r.json();
  if (!r.ok) return;
  state.solved = true;
  els.winTitle.textContent = "La remontée";
  els.winWord.textContent = d.answer;
  els.winStats.textContent = `Après ${d.guesses} sonde${d.guesses > 1 ? "s" : ""}.`;
  els.overlay.hidden = false;
  els.input.disabled = true;
  els.btn.disabled = true;
}

function makeBubbles() {
  const wrap = document.querySelector(".bubbles");
  for (let i = 0; i < 24; i++) {
    const b = document.createElement("span");
    const size = 4 + Math.random() * 16;
    b.style.width = b.style.height = size + "px";
    b.style.left = Math.random() * 100 + "vw";
    b.style.animationDuration = 8 + Math.random() * 14 + "s";
    b.style.animationDelay = Math.random() * 12 + "s";
    wrap.appendChild(b);
  }
}

els.form.addEventListener("submit", submitGuess);
els.newBtn.addEventListener("click", newGame);
els.giveup.addEventListener("click", giveUp);
els.winAgain.addEventListener("click", newGame);

makeBubbles();
newGame();
