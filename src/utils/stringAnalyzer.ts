import * as crypto from 'crypto';
import { StringProperties } from './types';

export function analyzeString(input: string): StringProperties {
  //length
  const length = input.length;

  // is_palindrome
  const cleanString = input.toLowerCase().replace(/\s/g, '');
  const is_palindrome =
    cleanString === cleanString.split('').reverse().join('');

  // unique_characters
  const unique_characters = new Set(input.toLowerCase().replace(/\s/g, ''))
    .size;

  // word_count
  const word_count = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;

  // sha256_hash
  const sha256_hash = crypto.createHash('sha256').update(input).digest('hex');

  // character_frequency_map
  const character_frequency_map: Record<string, number> = {};
  for (const char of input) {
    if (char === ' ') continue;
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}
