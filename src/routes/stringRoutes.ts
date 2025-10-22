import { Router } from 'express';
import {
  createStringAnalysis,
  getString,
  getAllStrings,
  filterByNaturalLanguage,
  deleteString,
} from '../controllers/stringController';

const router = Router();

router.post('/strings', createStringAnalysis);

router.get('/strings', getAllStrings);

router.get('/strings/filter-by-natural-language', filterByNaturalLanguage);

// route to get a specific string analysis
router.get('/strings/:string_value', getString);

router.delete('/strings/:string_value', deleteString);

export default router;
