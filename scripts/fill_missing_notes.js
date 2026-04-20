const fs = require("fs");

const DATA_FILE = "./public/data/ADNz_data.json";

const items = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

const CONCENTRATION_WORDS = new Set([
  "absolu",
  "absolue",
  "cologne",
  "de",
  "edition",
  "elixir",
  "eau",
  "edp",
  "edt",
  "extreme",
  "extrait",
  "for",
  "fraiche",
  "fresh",
  "givree",
  "her",
  "him",
  "homme",
  "intense",
  "intensely",
  "intensement",
  "le",
  "l",
  "la",
  "limited",
  "man",
  "men",
  "nude",
  "only",
  "parfum",
  "platinum",
  "pour",
  "prive",
  "sport",
  "summer",
  "toilette",
  "woman",
  "women",
]);

const NOTE_RULES = [
  { pattern: /oud|oudh/, notes: ["Oud"], layer: "base" },
  { pattern: /rose/, notes: ["Rose"], layer: "middle" },
  { pattern: /jasmine|jasmin/, notes: ["Jasmine"], layer: "middle" },
  { pattern: /iris/, notes: ["Iris"], layer: "middle" },
  { pattern: /lavande|lavender/, notes: ["Lavender"], layer: "middle" },
  { pattern: /violet/, notes: ["Violet"], layer: "middle" },
  { pattern: /freesia/, notes: ["Freesia"], layer: "middle" },
  { pattern: /peony/, notes: ["Peony"], layer: "middle" },
  { pattern: /orange blossom|blossom/, notes: ["Orange Blossom"], layer: "middle" },
  { pattern: /poppy/, notes: ["Poppy"], layer: "middle" },
  { pattern: /tuberose|do son/, notes: ["Tuberose"], layer: "middle" },
  { pattern: /ylang/, notes: ["Ylang-Ylang"], layer: "middle" },
  { pattern: /magnolia/, notes: ["Magnolia"], layer: "middle" },
  { pattern: /apple/, notes: ["Apple"], layer: "top" },
  { pattern: /pear/, notes: ["Pear"], layer: "top" },
  { pattern: /peach/, notes: ["Peach"], layer: "top" },
  { pattern: /cherry/, notes: ["Cherry"], layer: "top" },
  { pattern: /fig|philosykos/, notes: ["Fig"], layer: "top" },
  { pattern: /bergamot/, notes: ["Bergamot"], layer: "top" },
  { pattern: /lemon|citron/, notes: ["Lemon"], layer: "top" },
  { pattern: /lime/, notes: ["Lime"], layer: "top" },
  { pattern: /mandarin/, notes: ["Mandarin Orange"], layer: "top" },
  { pattern: /orange/, notes: ["Orange"], layer: "top" },
  { pattern: /grapefruit|pomelo|tygar/, notes: ["Grapefruit"], layer: "top" },
  { pattern: /neroli/, notes: ["Neroli"], layer: "top" },
  { pattern: /mint/, notes: ["Mint"], layer: "top" },
  { pattern: /blackcurrant|black currant/, notes: ["Black Currant"], layer: "top" },
  { pattern: /tea|the noir|the yulong|white tea|fig tea|matcha/, notes: ["Tea"], layer: "middle" },
  { pattern: /matcha/, notes: ["Matcha Tea"], layer: "middle" },
  { pattern: /coffee|coffeeling/, notes: ["Coffee"], layer: "top" },
  { pattern: /milk|rice milk|lactonic/, notes: ["Milk"], layer: "middle" },
  { pattern: /rice/, notes: ["Rice"], layer: "top" },
  { pattern: /vanilla/, notes: ["Vanilla"], layer: "base" },
  { pattern: /tonka/, notes: ["Tonka Bean"], layer: "base" },
  { pattern: /amber/, notes: ["Amber"], layer: "base" },
  { pattern: /musk|musc/, notes: ["Musk"], layer: "base" },
  { pattern: /sandal|santal|tam dao/, notes: ["Sandalwood"], layer: "base" },
  { pattern: /cedar/, notes: ["Cedar"], layer: "base" },
  { pattern: /vetiver/, notes: ["Vetiver"], layer: "base" },
  { pattern: /patchouli/, notes: ["Patchouli"], layer: "base" },
  { pattern: /leather|cuir/, notes: ["Leather"], layer: "base" },
  { pattern: /tobacco/, notes: ["Tobacco"], layer: "base" },
  { pattern: /incense|encens|interlude/, notes: ["Incense"], layer: "base" },
  { pattern: /cardamom/, notes: ["Cardamom"], layer: "top" },
  { pattern: /ginger/, notes: ["Ginger"], layer: "middle" },
  { pattern: /pepper/, notes: ["Pink Pepper"], layer: "top" },
  { pattern: /saffron/, notes: ["Saffron"], layer: "middle" },
  { pattern: /cinnamon/, notes: ["Cinnamon"], layer: "middle" },
  { pattern: /sage/, notes: ["Sage"], layer: "middle" },
  { pattern: /basil/, notes: ["Basil"], layer: "middle" },
  { pattern: /salt|marine|aqua|acqua|aqva|ocean|profondo|eau givree|mill[eé]sime imperial/, notes: ["Sea Notes"], layer: "top" },
  { pattern: /crystal|cristal/, notes: ["Musk"], layer: "base" },
  { pattern: /powder|poudree/, notes: ["Powdery Notes"], layer: "middle" },
  { pattern: /barley/, notes: ["Barley"], layer: "middle" },
  { pattern: /honey/, notes: ["Honey"], layer: "base" },
  { pattern: /praline|gourmand/, notes: ["Praline"], layer: "base" },
  { pattern: /coconut|soleil blanc|virgin island water|le beau/, notes: ["Coconut"], layer: "middle" },
  { pattern: /almond|hypnotic poison|l homme ideal/, notes: ["Almond"], layer: "middle" },
  { pattern: /wine|boozy|angels share|side effect/, notes: ["Rum"], layer: "middle" },
];

const FAMILY_FALLBACKS = [
  { pattern: /aquatic|marine|ozonic/, top: ["Sea Notes", "Bergamot"], middle: ["Lavender"], base: ["Musk", "Amber"] },
  { pattern: /citrus|fresh/, top: ["Bergamot", "Mandarin Orange"], middle: ["Neroli"], base: ["Musk", "Cedar"] },
  { pattern: /woody|wood/, top: ["Bergamot"], middle: ["Cedar"], base: ["Sandalwood", "Vetiver", "Musk"] },
  { pattern: /floral|white floral/, top: ["Bergamot"], middle: ["Jasmine", "Rose"], base: ["Musk"] },
  { pattern: /amber|oriental|resin/, top: ["Pink Pepper"], middle: ["Incense"], base: ["Amber", "Vanilla", "Tonka Bean"] },
  { pattern: /spicy/, top: ["Pink Pepper", "Cardamom"], middle: ["Cinnamon"], base: ["Amber", "Patchouli"] },
  { pattern: /leather/, top: ["Cardamom"], middle: ["Saffron"], base: ["Leather", "Amber"] },
  { pattern: /gourmand|sweet/, top: ["Bergamot"], middle: ["Praline"], base: ["Vanilla", "Tonka Bean"] },
  { pattern: /musky|musk/, top: ["Bergamot"], middle: ["Jasmine"], base: ["Musk", "Amber"] },
  { pattern: /fougere|aromatic/, top: ["Bergamot", "Pink Pepper"], middle: ["Lavender", "Geranium"], base: ["Vetiver", "Cedar"] },
];

const DEFAULT_NOTES = {
  male: {
    top: ["Bergamot", "Pink Pepper"],
    middle: ["Lavender", "Geranium"],
    base: ["Cedar", "Amber", "Musk"],
  },
  female: {
    top: ["Bergamot", "Pear"],
    middle: ["Jasmine", "Rose"],
    base: ["Musk", "Vanilla", "Amber"],
  },
  unisex: {
    top: ["Bergamot", "Cardamom"],
    middle: ["Jasmine", "Sage"],
    base: ["Sandalwood", "Amber", "Musk"],
  },
};

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function baseTokens(item) {
  const brandTokens = new Set(normalizeText(item.brand).split(" ").filter(Boolean));

  return normalizeText(item.fragrance_name)
    .split(" ")
    .filter(
      (token) =>
        token &&
        token.length > 1 &&
        !brandTokens.has(token) &&
        !CONCENTRATION_WORDS.has(token),
    );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function hasNotes(item, key) {
  return Array.isArray(item[key]) && item[key].length > 0;
}

function scoreSibling(source, target) {
  if (source.brand !== target.brand) return 0;
  const sourceTokens = new Set(baseTokens(source));
  const targetTokens = baseTokens(target);
  let overlap = 0;
  for (const token of targetTokens) {
    if (sourceTokens.has(token)) overlap += 1;
  }
  return overlap;
}

function findSiblingNotes(target) {
  let best = null;
  let bestScore = 0;
  const targetTokens = baseTokens(target);
  const minScore = targetTokens.length <= 1 ? 1 : 2;

  for (const source of items) {
    if (source === target) continue;
    if (!hasNotes(source, "top_notes") && !hasNotes(source, "middle_notes") && !hasNotes(source, "base_notes")) continue;
    const score = scoreSibling(source, target);
    if (score > bestScore) {
      best = source;
      bestScore = score;
    }
  }
  return bestScore >= minScore ? best : null;
}

function inferFromText(item) {
  const text = normalizeText(
    `${item.full_name} ${item.fragrance_name} ${item.olfactive_family || ""} ${item.official_description_excerpt || ""}`,
  );
  const inferred = { top_notes: [], middle_notes: [], base_notes: [] };

  for (const rule of NOTE_RULES) {
    if (rule.pattern.test(text)) {
      inferred[`${rule.layer}_notes`].push(...rule.notes);
    }
  }

  const familyText = normalizeText(item.olfactive_family || "");
  for (const fallback of FAMILY_FALLBACKS) {
    if (fallback.pattern.test(familyText)) {
      inferred.top_notes.push(...fallback.top);
      inferred.middle_notes.push(...fallback.middle);
      inferred.base_notes.push(...fallback.base);
    }
  }

  const genderFallback = DEFAULT_NOTES[item.gender] || DEFAULT_NOTES.unisex;
  if (!inferred.top_notes.length) inferred.top_notes.push(...genderFallback.top);
  if (!inferred.middle_notes.length) inferred.middle_notes.push(...genderFallback.middle);
  if (!inferred.base_notes.length) inferred.base_notes.push(...genderFallback.base);

  return {
    top_notes: unique(inferred.top_notes).slice(0, 5),
    middle_notes: unique(inferred.middle_notes).slice(0, 5),
    base_notes: unique(inferred.base_notes).slice(0, 6),
  };
}

let copied = 0;
let inferred = 0;
let builtKeyNotes = 0;

for (const item of items) {
  if (["related_variant_inferred", "name_family_inferred"].includes(item.notes_source_quality)) {
    item.key_notes = [];
    item.top_notes = [];
    item.middle_notes = [];
    item.base_notes = [];
  }

  let filledFromSibling = false;
  const sibling = findSiblingNotes(item);

  for (const key of ["top_notes", "middle_notes", "base_notes"]) {
    if (hasNotes(item, key)) continue;
    if (sibling && hasNotes(sibling, key)) {
      item[key] = [...sibling[key]];
      filledFromSibling = true;
    }
  }

  if (filledFromSibling) {
    copied += 1;
    item.notes_source_quality = "related_variant_inferred";
    item.notes_source_url = sibling.source_url || item.notes_source_url || item.source_url;
  }

  const needsHeuristic = ["top_notes", "middle_notes", "base_notes"].some((key) => !hasNotes(item, key));
  if (needsHeuristic) {
    const generated = inferFromText(item);
    for (const key of ["top_notes", "middle_notes", "base_notes"]) {
      if (!hasNotes(item, key)) {
        item[key] = generated[key];
      }
    }
    inferred += 1;
    if (!filledFromSibling) {
      item.notes_source_quality = "name_family_inferred";
      item.notes_source_url = item.source_url;
    }
  }

  if (!hasNotes(item, "key_notes")) {
    item.key_notes = unique([
      ...(item.top_notes || []),
      ...(item.middle_notes || []),
      ...(item.base_notes || []),
    ]).slice(0, 5);
    builtKeyNotes += 1;
  }
}

fs.writeFileSync(DATA_FILE, `${JSON.stringify(items, null, 2)}\n`, "utf8");

const stillMissing = items.filter((item) =>
  ["key_notes", "top_notes", "middle_notes", "base_notes"].some((key) => !hasNotes(item, key)),
);

console.log(
  JSON.stringify(
    {
      total: items.length,
      copied,
      inferred,
      builtKeyNotes,
      stillMissing: stillMissing.length,
      sampleMissing: stillMissing.slice(0, 20).map((item) => item.slug),
    },
    null,
    2,
  ),
);
