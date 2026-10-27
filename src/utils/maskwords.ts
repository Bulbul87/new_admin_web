
const abusiveWords = [
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "bastard",
  "asshole",
];

export const maskAbusiveWords = (message: string): string => {
  if (!message) return "";

  let result = message;

  for (const word of abusiveWords) {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match whole words, ignoring uppercase/lowercase
    const regex = new RegExp(
      `(?<![\\p{L}\\p{N}_])${escapedWord}(?![\\p{L}\\p{N}_])`,
      "giu"
    );

    result = result.replace(regex, (match) => "*".repeat(match.length));
  }

  return result;
};
