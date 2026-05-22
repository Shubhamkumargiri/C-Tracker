import express from 'express';
import { chatWithCTAI, enhanceText, checkResumeATS, improveFullResume } from '../controllers/ctaiController.js';

const router = express.Router();

router.post('/chat', chatWithCTAI);
router.post('/enhance-text', enhanceText);
router.post('/resume-ats', checkResumeATS);
router.post('/improve-resume', improveFullResume);

export default router;
