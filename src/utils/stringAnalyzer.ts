import * as crypto from 'crypto';
import { StringProperties } from './types';

export function analyzeString(input: string): StringProperties {
  //length
  const length = input.length;

  // isPalindrome
  const cleanString = input.toLowerCase().replace(/\s/g, '');
  const isPalindrome = cleanString === cleanString.split('').reverse().join('');

  // uniqueCharacters
  const uniqueCharacters = new Set(input.toLowerCase().replace(/\s/g, '')).size;

  // wordCount
  const wordCount = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;

  // sha256Hash
  const sha256Hash = crypto.createHash('sha256').update(input).digest('hex');

  // charFrequencyMap
  const charFrequencyMap: Record<string, number> = {};
  for (const char of input) {
    if (char === ' ') continue;
    charFrequencyMap[char] = (charFrequencyMap[char] || 0) + 1;
  }

  return {
    length,
    isPalindrome,
    uniqueCharacters,
    wordCount,
    sha256Hash,
    charFrequencyMap,
  };
}
