export function splitVerseIntoWords(text: string): string[] {
  return text.trim().split(/\s+/).filter((word) => word.length > 0);
}

export function splitWordIntoLetters(word: string): string[] {
  return Array.from(word);
}
