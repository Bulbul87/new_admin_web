
const abusiveWords = [
  // English examples
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "bastard",
  "asshole",

  // Hindi / Hinglish examples
  "chutiya",
  "chutiye",
  "chutiyaa",
  "chutiya",
  "gandu",
  "tari gand",
  "gaand",
  "madarchod",
  "madar chod",
  "behenchod",
  "bhenchod",
  "bhosdike",
  "bhosdi",
  "harami",
  "kamina",

  // Devanagari examples
  "चूतिया",
  "गांडू",
  "गांड",
  "मादरचोद",
  "बहनचोद",
  "भोसड़ी",
  "हरामी",
  "कमीना",
];

const normalizeText = (text: string): string =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "");

const escapeRegex = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const uniqueWords = [...new Set(
  abusiveWords.map(normalizeText)
)].sort((a, b) => b.length - a.length);

const abusiveRegex = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${uniqueWords
    .map(escapeRegex)
    .join("|")})(?![\\p{L}\\p{N}])`,
  "giu"
);

export const maskAbusiveWords = (message: string): string => {
  if (!message) return "";

  const normalized = normalizeText(message);

  return normalized.replace(abusiveRegex, (match) =>
    "*".repeat(match.length)
  );
};
