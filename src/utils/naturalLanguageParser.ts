export const parseNaturalLanguageQuery = (query: string) => {
  const lowerQuery = query.toLowerCase().trim();
  const filters: Record<string, any> = {};

  // Parse word count
  if (lowerQuery.includes('single word')) {
    filters.word_count = 1;
  } else if (lowerQuery.includes('two word')) {
    filters.word_count = 2;
  } else if (lowerQuery.includes('three word')) {
    filters.word_count = 3;
  }

  // Match "X word" or "X words" pattern
  const wordCountMatch = lowerQuery.match(/(\d+)\s+words?/);
  if (wordCountMatch) {
    filters.word_count = parseInt(wordCountMatch[1], 10);
  }

  // Parse palindrome
  if (lowerQuery.includes('palindrom')) {
    filters.is_palindrome = true;
  }

  // Parse length constraints
  // "longer than X characters" or "more than X characters"
  const longerThanMatch = lowerQuery.match(
    /(?:longer|more)\s+than\s+(\d+)\s+characters?/
  );
  if (longerThanMatch) {
    filters.min_length = parseInt(longerThanMatch[1], 10) + 1;
  }

  // "shorter than X characters" or "less than X characters"
  const shorterThanMatch = lowerQuery.match(
    /(?:shorter|less)\s+than\s+(\d+)\s+characters?/
  );
  if (shorterThanMatch) {
    filters.max_length = parseInt(shorterThanMatch[1], 10) - 1;
  }

  // "at least X characters"
  const atLeastMatch = lowerQuery.match(/at\s+least\s+(\d+)\s+characters?/);
  if (atLeastMatch) {
    filters.min_length = parseInt(atLeastMatch[1], 10);
  }

  // "at most X characters" or "maximum X characters"
  const atMostMatch = lowerQuery.match(
    /(?:at\s+most|maximum)\s+(\d+)\s+characters?/
  );
  if (atMostMatch) {
    filters.max_length = parseInt(atMostMatch[1], 10);
  }

  // Parse character constraints
  // "containing the letter X" or "contain the letter X"
  const letterMatch = lowerQuery.match(
    /contain(?:ing)?\s+(?:the\s+)?letter\s+([a-z])/
  );
  if (letterMatch) {
    filters.contains_character = letterMatch[1];
  }

  // "first vowel" → 'a'
  if (lowerQuery.includes('first vowel')) {
    filters.contains_character = 'a';
  } else if (lowerQuery.includes('vowel')) {
    // Could default to 'a' or handle differently
    filters.contains_character = 'a';
  }

  // "strings containing X" (where X is a single character)
  const containsMatch = lowerQuery.match(/containing\s+([a-z])(?:\s|$)/);
  if (containsMatch && !letterMatch) {
    filters.contains_character = containsMatch[1];
  }

  // Check for conflicting filters
  if (
    filters.min_length &&
    filters.max_length &&
    filters.min_length > filters.max_length
  ) {
    throw new Error('Conflicting length constraints');
  }

  return filters;
};
