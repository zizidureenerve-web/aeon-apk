// Cibles de toutes catégories. À chaque partie, une entrée est tirée au hasard.
//   theme  = catégorie affichée au joueur
//   mot    = la réponse cachée (en minuscules, sans apostrophe ni ligature œ/æ)
//   indice = l'énigme / définition affichée
// Le but : des cibles NICHE (pointues) que l'on approche par le SENS.
export const WORDS = [
  // ── Minecraft ──────────────────────────────────────────────
  { theme: "Minecraft", mot: "netherite", indice: "Matériau le plus résistant, forgé à partir de débris antiques du Nether." },
  { theme: "Minecraft", mot: "sculk", indice: "Bloc sombre qui se propage et réagit aux vibrations près du Warden." },
  { theme: "Minecraft", mot: "allay", indice: "Petite créature bleue volante qui ramasse les objets pour toi." },
  { theme: "Minecraft", mot: "prismarine", indice: "Bloc turquoise issu des monuments océaniques gardés par les Gardiens." },
  { theme: "Minecraft", mot: "mycelium", indice: "Bloc des îles champignons sur lequel poussent d'étranges spores." },

  // ── Pays ───────────────────────────────────────────────────
  { theme: "Pays", mot: "bhoutan", indice: "Royaume himalayen qui mesure le Bonheur National Brut." },
  { theme: "Pays", mot: "kiribati", indice: "Nation du Pacifique à cheval sur l'équateur et la ligne de changement de date." },
  { theme: "Pays", mot: "liechtenstein", indice: "Minuscule principauté sans accès à la mer entre la Suisse et l'Autriche." },
  { theme: "Pays", mot: "suriname", indice: "Plus petit pays d'Amérique du Sud, ancienne Guyane néerlandaise." },
  { theme: "Pays", mot: "erythree", indice: "Pays de la Corne de l'Afrique, longtemps en guerre avec l'Éthiopie." },

  // ── Métier ─────────────────────────────────────────────────
  { theme: "Métier", mot: "luthier", indice: "Artisan qui fabrique et répare les instruments à cordes." },
  { theme: "Métier", mot: "campanologue", indice: "Spécialiste de l'étude et de la sonnerie des cloches." },
  { theme: "Métier", mot: "scaphandrier", indice: "Professionnel qui travaille sous l'eau en combinaison étanche." },
  { theme: "Métier", mot: "fauconnier", indice: "Celui qui dresse les rapaces pour la chasse." },
  { theme: "Métier", mot: "taxidermiste", indice: "Il naturalise les animaux morts pour leur garder leur apparence." },

  // ── Musique ────────────────────────────────────────────────
  { theme: "Musique", mot: "theremine", indice: "Instrument que l'on joue sans le toucher, en bougeant les mains dans un champ." },
  { theme: "Musique", mot: "djent", indice: "Sous-genre du metal basé sur des riffs saccadés très graves." },
  { theme: "Musique", mot: "contrepoint", indice: "Art de superposer plusieurs lignes mélodiques indépendantes." },
  { theme: "Musique", mot: "vaporwave", indice: "Genre internet nostalgique des années 80-90, ralenti et rétro." },
  { theme: "Musique", mot: "glissando", indice: "Glissement continu d'une note à une autre." },

  // ── Jeu vidéo ──────────────────────────────────────────────
  { theme: "Jeu vidéo", mot: "metroidvania", indice: "Genre d'exploration où de nouveaux pouvoirs ouvrent d'anciennes zones." },
  { theme: "Jeu vidéo", mot: "roguelike", indice: "Genre à niveaux générés et mort définitive à chaque run." },
  { theme: "Jeu vidéo", mot: "speedrun", indice: "Terminer un jeu le plus vite possible, au chrono." },
  { theme: "Jeu vidéo", mot: "permadeath", indice: "Quand mourir efface tout, sans seconde chance." },

  // ── Animal ─────────────────────────────────────────────────
  { theme: "Animal", mot: "axolotl", indice: "Amphibien mexicain qui garde ses branchies et régénère ses membres." },
  { theme: "Animal", mot: "okapi", indice: "Cousin de la girafe au cou court et aux pattes rayées de zèbre." },
  { theme: "Animal", mot: "pangolin", indice: "Seul mammifère couvert d'écailles, qui se roule en boule." },
  { theme: "Animal", mot: "narval", indice: "Cétacé arctique dont le mâle porte une longue défense torsadée." },
  { theme: "Animal", mot: "tardigrade", indice: "Micro-animal quasi indestructible, surnommé ourson d'eau." },

  // ── Astronomie ─────────────────────────────────────────────
  { theme: "Astronomie", mot: "quasar", indice: "Noyau de galaxie lointaine brillant comme des milliards de soleils." },
  { theme: "Astronomie", mot: "magnetar", indice: "Étoile à neutrons au champ magnétique le plus intense connu." },
  { theme: "Astronomie", mot: "pulsar", indice: "Étoile morte qui balaie l'espace d'un faisceau régulier comme un phare." },

  // ── Cuisine ────────────────────────────────────────────────
  { theme: "Cuisine", mot: "umami", indice: "La cinquième saveur, savoureuse et profonde, après sucré et salé." },
  { theme: "Cuisine", mot: "garum", indice: "Sauce de poisson fermenté très prisée dans la Rome antique." },
  { theme: "Cuisine", mot: "koji", indice: "Moisissure japonaise qui lance la fermentation du saké et du miso." },

  // ── Art ────────────────────────────────────────────────────
  { theme: "Art", mot: "sfumato", indice: "Technique de flou vaporeux, chère à Léonard de Vinci." },
  { theme: "Art", mot: "clair-obscur", indice: "Contraste fort entre zones de lumière et d'ombre." },
  { theme: "Art", mot: "pointillisme", indice: "Peindre avec une multitude de petits points de couleur pure." },

  // ── Mythologie ─────────────────────────────────────────────
  { theme: "Mythologie", mot: "golem", indice: "Être d'argile animé par la magie dans le folklore juif." },
  { theme: "Mythologie", mot: "wendigo", indice: "Esprit cannibale des forêts dans les légendes amérindiennes." },
  { theme: "Mythologie", mot: "banshee", indice: "Fée irlandaise dont le cri annonce une mort prochaine." },

  // ── Langue ─────────────────────────────────────────────────
  { theme: "Langue", mot: "oxymore", indice: "Figure qui unit deux mots contradictoires, comme obscure clarté." },
  { theme: "Langue", mot: "palindrome", indice: "Mot ou phrase qui se lit pareil dans les deux sens." },
  { theme: "Langue", mot: "onomatopee", indice: "Mot qui imite un son, comme boum ou cocorico." },

  // ── Informatique ───────────────────────────────────────────
  { theme: "Informatique", mot: "recursion", indice: "Quand une fonction s'appelle elle-même pour résoudre un problème." },
  { theme: "Informatique", mot: "idempotent", indice: "Opération qui donne le même résultat qu'on l'applique une ou mille fois." },
  { theme: "Informatique", mot: "quine", indice: "Programme dont la seule sortie est son propre code source." },

  // ── Botanique ──────────────────────────────────────────────
  { theme: "Botanique", mot: "welwitschia", indice: "Plante du désert de Namibie qui ne porte que deux feuilles, pendant des siècles." },
  { theme: "Botanique", mot: "dionee", indice: "Plante carnivore dont les feuilles se referment comme une mâchoire." },

  // ── Sport ──────────────────────────────────────────────────
  { theme: "Sport", mot: "curling", indice: "Sport de glace où l'on fait glisser des pierres vers une cible en balayant." },
  { theme: "Sport", mot: "kabaddi", indice: "Sport de contact indien où l'attaquant doit retenir son souffle." }
];
