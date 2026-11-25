// Les codes doivent rester identiques aux CHECK de supabase/migrations/*_survey.sql
export const TEXT_MAX = 1000;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const QUESTIONS = {
  gender_identity: {
    label: "Tu es :",
    type: "single",
    options: [
      ["femme_celibataire", "Femme célibataire"],
      ["homme_celibataire", "Homme célibataire"],
      ["couple_fh", "Couple femme + homme"],
      ["couple_ff", "Couple de femmes"],
      ["couple_hh", "Couple d'hommes"],
      ["trans", "Personne trans"],
      ["autre", "Autre"],
    ],
  },
  age_range: {
    label: "Ta tranche d'âge :",
    type: "single",
    options: ["18-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50+"].map((v) => [v, v]),
  },
  sector: {
    label: "Ton secteur :",
    type: "single",
    options: [
      ["nord", "Nord"],
      ["sud", "Sud"],
      ["est", "Est"],
      ["ouest", "Ouest"],
      ["hauts", "Les Hauts"],
    ],
  },
  experience: {
    label: "Ton expérience du libertinage :",
    type: "single",
    options: [
      ["jamais", "Pas encore envisagé"],
      ["moins_1an", "Moins d'un an"],
      ["1_3ans", "1 à 3 ans"],
      ["3_10ans", "3 à 10 ans"],
      ["plus_10ans", "Plus de 10 ans"],
    ],
  },
  meeting_methods: {
    label: "Comment rencontres-tu actuellement ?",
    hint: "Plusieurs réponses possibles",
    type: "multi",
    options: [
      ["sites_apps", "Sites / applis"],
      ["groupes_reseaux", "Groupes WhatsApp / Facebook"],
      ["clubs", "Clubs"],
      ["soirees_privees", "Soirées privées"],
      ["bouche_oreille", "Bouche-à-oreille"],
      ["pas_encore", "Pas encore"],
      ["autre", "Autre"],
    ],
  },
  libertinage_meaning: {
    label: "Que t'apporte le libertinage ?",
    type: "text",
  },
  main_frustration: {
    label:
      "Qu'est-ce qui t'agace le plus lorsque tu recherches des rencontres libertines à La Réunion ?",
    type: "text",
  },
  top_problems: {
    label: "Tes 3 principaux problèmes",
    hint: "3 maximum",
    type: "multi",
    max: 3,
    options: [
      ["faux_profils", "Faux profils"],
      ["messages_lourds", "Messages lourds"],
      ["peur_reconnu", "Peur d'être reconnu·e"],
      ["manque_meme_age", "Manque de personnes du même âge"],
      ["profils_metropole", "Pas de site 100 % péi 🇷🇪"],
      ["lapins", "Personnes qui ne répondent pas ou ne viennent pas"],
      ["sorties_couteuses", "Sorties coûteuses"],
      ["manque_temps", "Manque de temps"],
      ["codes", "Méconnaissance des codes"],
      ["peur_couple", "Peur pour le couple"],
      ["autre", "Autre"],
    ],
  },
  desired_features: {
    label: "Tes 3 fonctionnalités préférées",
    hint: "3 maximum",
    type: "multi",
    max: 3,
    options: [
      ["profils_verifies", "Profils vérifiés"],
      ["controle_messages", "Contrôle des messages"],
      ["album_prive", "Album photo privé"],
      ["evenements", "Événements et participants"],
      ["disponibilites", "Disponibilités"],
      ["swipe", "Swipe"],
      ["groupes_prives", "Groupes et événements privés"],
      ["avis_membres", "Avis des membres"],
      ["contenus_educatifs", "Podcasts / vidéos éducatifs"],
      ["reductions_clubs", "Réductions clubs"],
      ["autre", "Autre"],
    ],
  },
  ideal_platform: {
    label: "Décris ton site de rencontres libertines idéal.",
    type: "text",
  },
  monthly_budget: {
    label: "Combien dépenses-tu par mois pour tes rencontres ?",
    type: "single",
    options: [
      ["rien", "Rien"],
      ["moins_20", "Moins de 20 €"],
      ["20_50", "20 à 50 €"],
      ["50_100", "50 à 100 €"],
      ["plus_100", "Plus de 100 €"],
    ],
  },
};

export const STEPS = [
  { title: "Toi", fields: ["gender_identity", "age_range", "sector"] },
  { title: "Toi et le libertinage", fields: ["experience", "meeting_methods", "libertinage_meaning"] },
  { title: "Ce qui coince", fields: ["main_frustration", "top_problems"] },
  { title: "Ton site idéal", fields: ["desired_features", "ideal_platform"] },
  { title: "Ton budget", fields: ["monthly_budget"] },
  { title: "Restons en contact", fields: [] },
];

export function fieldError(name, value) {
  const q = QUESTIONS[name];
  if (q.type === "text") {
    const v = typeof value === "string" ? value.trim() : "";
    if (!v) return "Réponse requise.";
    return v.length > TEXT_MAX ? `${TEXT_MAX} caractères maximum.` : null;
  }
  const allowed = q.options.map(([v]) => v);
  if (q.type === "single") return allowed.includes(value) ? null : "Choisis une réponse.";
  if (!Array.isArray(value) || !value.length) return "Choisis au moins une réponse.";
  const max = q.max || allowed.length;
  if (value.length > max || new Set(value).size !== value.length || !value.every((v) => allowed.includes(v))) {
    return `${max} réponses maximum.`;
  }
  return null;
}

export function validateSurvey(input) {
  if (!input || typeof input !== "object") return null;
  const data = {};
  for (const name of Object.keys(QUESTIONS)) {
    if (fieldError(name, input[name])) return null;
    data[name] = typeof input[name] === "string" ? input[name].trim() : input[name];
  }
  return data;
}
