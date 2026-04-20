const fs = require("fs");

const DATA_FILE = "./public/data/ADNz_data.json";
const items = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

const CONCENTRATION_WORDS = new Set([
  "absolu",
  "absolue",
  "cologne",
  "de",
  "edition",
  "eau",
  "elixir",
  "extrait",
  "extreme",
  "for",
  "fraiche",
  "fresh",
  "givenchy",
  "her",
  "him",
  "homme",
  "intense",
  "l",
  "la",
  "le",
  "men",
  "parfum",
  "pour",
  "sport",
  "toilette",
  "women",
]);

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
        !CONCENTRATION_WORDS.has(token)
    );
}

function siblingScore(source, target) {
  if (source.brand !== target.brand) return 0;
  const sourceTokens = new Set(baseTokens(source));
  let overlap = 0;
  for (const token of baseTokens(target)) {
    if (sourceTokens.has(token)) overlap += 1;
  }
  return overlap;
}

function findSiblingFamily(target) {
  let best = null;
  let bestScore = 0;
  const minScore = baseTokens(target).length <= 1 ? 1 : 2;

  for (const source of items) {
    if (source === target) continue;
    if (source.brand !== target.brand) continue;
    if (!source.olfactive_family) continue;
    const score = siblingScore(source, target);
    if (score > bestScore) {
      best = source;
      bestScore = score;
    }
  }

  return bestScore >= minScore ? best : null;
}

function detectFlags(text) {
  const has = (pattern) => pattern.test(text);

  return {
    aquatic: has(/aquatic|marine|ocean|sea|salt|water|watery|aqua|acqua|ozonic|fresh air|profondo/),
    citrus: has(/bergamot|lemon|lime|mandarin|orange|grapefruit|neroli|citrus|citron|yuzu/),
    aromatic: has(/lavender|sage|rosemary|basil|geranium|mint|aromatic|herbal|juniper|clary sage|thyme/),
    woody: has(/wood|woody|cedar|sandalwood|vetiver|cypress|birch|papyrus|guaiac|cashmeran|pine|grapevine/),
    floral: has(/floral|flower|rose|jasmine|orange blossom|tuberose|ylang|freesia|peony|magnolia|iris|violet|blossom|gardenia|lily/),
    fruity: has(/apple|pear|peach|cherry|fig|black currant|currant|berry|berries|nectarine|plum|fruit|fruity|cassis|rhubarb/),
    green: has(/green|leaf|tea|matcha|fig leaf|galbanum|herbes|herbal|grass/),
    spicy: has(/spicy|pepper|cardamom|cinnamon|ginger|nutmeg|clove|saffron|anise|warm spice/),
    amber: has(/amber|ambery|labdanum|benzoin|resin|balsam|oriental/),
    vanilla: has(/vanilla|tonka|praline|caramel|cocoa|chocolate|marshmallow/),
    coffee: has(/coffee|latte|espresso|cappuccino/),
    gourmand: has(/gourmand|coffee|milk|rice|latte|dessert|praline|honey|candy|sugar|vanilla|chocolate|tonka/),
    leather: has(/leather|suede|cuir/),
    musky: has(/musk|musky|musc|ambrette/),
    powdery: has(/powder|powdery|poudree|orris|iris/),
    oud: has(/oud|oudh/),
    tobacco: has(/tobacco|smoke|smoky|incense/),
    chypre: has(/oakmoss|moss|patchouli|chypre|labdanum|bergamot/),
  };
}

function inferFamily(item) {
  const text = normalizeText(
    [
      item.full_name,
      item.fragrance_name,
      item.official_description_excerpt,
      item.key_notes.join(" "),
      item.top_notes.join(" "),
      item.middle_notes.join(" "),
      item.base_notes.join(" "),
    ].join(" ")
  );

  const f = detectFlags(text);

  if (f.aquatic && f.aromatic) return "Aquatic Aromatic";
  if (f.aquatic && f.woody) return "Aquatic Woody";
  if (f.citrus && f.aromatic) return "Citrus Aromatic";
  if (f.citrus && f.woody) return "Citrus Woody";
  if (f.floral && f.fruity) return "Floral Fruity";
  if (f.floral && f.woody) return "Floral Woody";
  if (f.floral && f.musky) return "Floral Musky";
  if (f.floral && f.amber) return "Amber Floral";
  if (f.woody && f.aromatic) return "Woody Aromatic";
  if (f.woody && f.spicy) return "Woody Spicy";
  if (f.woody && f.leather) return "Woody Leather";
  if (f.woody && f.oud) return "Woody Oud";
  if (f.amber && f.vanilla) return "Amber Vanilla";
  if (f.amber && f.woody) return "Amber Woody";
  if (f.amber && f.spicy) return "Amber Spicy";
  if (f.gourmand && f.vanilla) return "Gourmand Vanilla";
  if (f.gourmand && f.coffee) return "Coffee Gourmand";
  if (f.gourmand) return "Gourmand";
  if (f.green && f.citrus) return "Green Citrus";
  if (f.green && f.aromatic) return "Green Aromatic";
  if (f.powdery && f.floral) return "Powdery Floral";
  if (f.tobacco && f.vanilla) return "Tobacco Vanilla";
  if (f.leather && f.spicy) return "Leather Spicy";
  if (f.chypre && f.fruity) return "Fruity Chypre";
  if (f.chypre) return "Chypre";
  if (f.floral) return "Floral";
  if (f.woody) return "Woody";
  if (f.citrus) return "Citrus";
  if (f.aromatic) return "Aromatic";
  if (f.amber) return "Amber";
  if (f.gourmand) return "Gourmand";

  if (item.gender === "male") return "Woody Aromatic";
  if (item.gender === "female") return "Floral Fruity";
  return "Woody Musky";
}

let copied = 0;
let inferred = 0;

for (const item of items) {
  if (item.olfactive_family && String(item.olfactive_family).trim()) continue;

  const sibling = findSiblingFamily(item);
  if (sibling) {
    item.olfactive_family = sibling.olfactive_family;
    copied += 1;
    continue;
  }

  item.olfactive_family = inferFamily(item);
  inferred += 1;
}

fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      total: items.length,
      copied,
      inferred,
      remainingMissing: items.filter(
        (item) => !item.olfactive_family || !String(item.olfactive_family).trim()
      ).length,
    },
    null,
    2
  )
);
