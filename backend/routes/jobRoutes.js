import express from 'express';
import multer from 'multer';
import { uploadResume, fetchMockJobs, checkJobMatch, searchJobs, extractResumeText } from '../controllers/jobController.js';

const router = express.Router();

// Multer config for in-memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Endpoint to upload and parse resume
router.post('/upload-resume', upload.single('resume'), uploadResume);

// Endpoint to extract text from resume only
router.post('/extract-resume-text', upload.single('resume'), extractResumeText);

// Endpoint to check a specific job match
router.post('/check-match', checkJobMatch);

// Endpoint to fetch mock job listings
router.get('/mock-jobs', fetchMockJobs);

// Endpoint to search live jobs
router.get('/search', searchJobs);

export default router;
