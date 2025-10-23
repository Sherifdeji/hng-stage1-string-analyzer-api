import { Request, Response } from 'express';
import { analyzeString } from '../utils/stringAnalyzer';
import { StringResponse } from '../utils/types';
import { stringStore } from '../utils/storage';
import { parseNaturalLanguageQuery } from '../utils/naturalLanguageParser';

export const createStringAnalysis = (req: Request, res: Response) => {
  const inputString: string = req.body.value;

  if (!inputString) {
    return res
      .status(400)
      .json({ error: 'Invalid request body or missing "value" field' });
  }

  // Used regex to validate that inputString is indeed a string
  if (/\d/.test(inputString)) {
    return res.status(422).json({
      error:
        "Unprocessable Entity: Invalid data type for 'value' (must be string)",
    });
  }

  const analysisResult = analyzeString(inputString);
  const { sha256_hash } = analysisResult;

  if (stringStore.has(sha256_hash)) {
    return res.status(409).json({
      error: 'Conflict: String already exists in the system',
    });
  }

  const newEntry: StringResponse = {
    id: sha256_hash,
    value: inputString,
    properties: analysisResult,
    created_at: new Date().toISOString(),
  };

  stringStore.set(sha256_hash, newEntry);
  res.status(201).json(newEntry);
};

export const getString = (req: Request, res: Response) => {
  const stringValue: string = req.params.string_value;

  const { sha256_hash } = analyzeString(stringValue);

  // Direct lookup by hash (much faster)
  const entry = stringStore.get(sha256_hash);

  if (!entry) {
    return res
      .status(404)
      .json({ error: 'String does not exist in the system' });
  }
  res.status(200).json(entry);
};

// GET /strings -  with optional filtering
export const getAllStrings = (req: Request, res: Response) => {
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = req.query;

  let filteredEntries = Array.from(stringStore.values());
  const filtersApplied: Record<string, any> = {};

  // Validate is_palindrome
  if (is_palindrome !== undefined) {
    if (is_palindrome !== 'true' && is_palindrome !== 'false') {
      return res.status(400).json({
        error: 'Bad Request: Invalid query parameter values or types',
        details: 'is_palindrome must be "true" or "false"',
      });
    }
    const isPalindromeBool = is_palindrome === 'true';
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.is_palindrome === isPalindromeBool
    );
    filtersApplied.is_palindrome = isPalindromeBool;
  }

  // Validate and apply min_length
  if (min_length !== undefined) {
    const minLengthNum = parseInt(min_length as string, 10);
    if (isNaN(minLengthNum) || minLengthNum < 0) {
      return res.status(400).json({
        error: 'Bad Request: Invalid query parameter values or types',
        details: 'min_length must be a non-negative integer',
      });
    }
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.length >= minLengthNum
    );
    filtersApplied.min_length = minLengthNum;
  }

  // Validate and apply max_length
  if (max_length !== undefined) {
    const maxLengthNum = parseInt(max_length as string, 10);
    if (isNaN(maxLengthNum) || maxLengthNum < 0) {
      return res.status(400).json({
        error: 'Bad Request: Invalid query parameter values or types',
        details: 'max_length must be a non-negative integer',
      });
    }
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.length <= maxLengthNum
    );
    filtersApplied.max_length = maxLengthNum;
  }

  // Check for conflicting length constraints
  if (min_length !== undefined && max_length !== undefined) {
    const minLengthNum = parseInt(min_length as string, 10);
    const maxLengthNum = parseInt(max_length as string, 10);
    if (minLengthNum > maxLengthNum) {
      return res.status(400).json({
        error: 'Bad Request: Invalid query parameter values or types',
        details: 'min_length cannot be greater than max_length',
      });
    }
  }

  // Validate and apply word_count
  if (word_count !== undefined) {
    const wordCountNum = parseInt(word_count as string, 10);
    if (isNaN(wordCountNum) || wordCountNum < 0) {
      return res.status(400).json({
        error: 'Bad Request: Invalid query parameter values or types',
        details: 'word_count must be a non-negative integer',
      });
    }
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.word_count === wordCountNum
    );
    filtersApplied.word_count = wordCountNum;
  }

  // Validate and apply contains_character
  if (contains_character !== undefined) {
    const character = (contains_character as string).toLowerCase();
    // Validate that it's a single character
    if (character.length !== 1 || !/^[a-z]$/.test(character)) {
      return res.status(400).json({
        error: 'Bad Request: Invalid query parameter values or types',
        details: 'contains_character must be a single lowercase letter (a-z)',
      });
    }
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.character_frequency_map[character] !== undefined
    );
    filtersApplied.contains_character = character;
  }

  console.log('Filtered entries:', filteredEntries);

  res.status(200).json({
    data: filteredEntries,
    count: filteredEntries.length,
    filters_applied: filtersApplied,
  });
};

// GET /strings/filter-by-natural-language
export const filterByNaturalLanguage = (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query || query.trim() === '') {
    return res.status(400).json({
      error: 'Bad Request: Missing or empty query parameter',
    });
  }

  let parsedFilters: Record<string, any>;

  try {
    parsedFilters = parseNaturalLanguageQuery(query);

    // Check if we could parse any filters
    if (Object.keys(parsedFilters).length === 0) {
      return res.status(400).json({
        error: 'Bad Request: Unable to parse natural language query',
      });
    }
  } catch (error: any) {
    if (error.message === 'Conflicting length constraints') {
      return res.status(422).json({
        error:
          'Unprocessable Entity: Query parsed but resulted in conflicting filters',
        details: error.message,
      });
    }

    return res.status(400).json({
      error: 'Bad Request: Unable to parse natural language query',
    });
  }

  // Apply filters
  let filteredEntries = Array.from(stringStore.values());

  if (parsedFilters.is_palindrome !== undefined) {
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.is_palindrome === parsedFilters.is_palindrome
    );
  }

  if (parsedFilters.min_length !== undefined) {
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.length >= parsedFilters.min_length
    );
  }

  if (parsedFilters.max_length !== undefined) {
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.length <= parsedFilters.max_length
    );
  }

  if (parsedFilters.word_count !== undefined) {
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.word_count === parsedFilters.word_count
    );
  }

  if (parsedFilters.contains_character !== undefined) {
    const character = parsedFilters.contains_character.toLowerCase();
    filteredEntries = filteredEntries.filter(
      entry => entry.properties.character_frequency_map[character] !== undefined
    );
  }

  console.log('Natural language query processed:', query);

  res.status(200).json({
    data: filteredEntries,
    count: filteredEntries.length,
    interpreted_query: {
      original: query,
      parsed_filters: parsedFilters,
    },
  });
};

export const deleteString = (req: Request, res: Response) => {
  const stringValue: string = req.params.string_value;

  // Calculate the hash of the string to find it in the store
  const { sha256_hash } = analyzeString(stringValue);

  // Check if the entry exists
  const entry = stringStore.get(sha256_hash);

  if (!entry) {
    return res
      .status(404)
      .json({ error: 'String does not exist in the system' });
  }

  stringStore.delete(sha256_hash);

  console.log('deleted');

  res.status(204).send();
};
