import express from 'express';
import { startExamSubmission, updateExamSubmission, getSubmissionResult, getSubmissionsForExam, getMySubmissions, getSubmissionDetailsForTeacher } from '../../controllers/submissionController.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/start/:examId', protect, authorize('student'), startExamSubmission);
router.put('/update/:submissionId', protect, authorize('student'), updateExamSubmission);
router.get('/my-results', protect, authorize('student'), getMySubmissions);
router.get('/:submissionId/result', protect, authorize('student'), getSubmissionResult);
router.get('/exam/:examId', protect, authorize('teacher'), getSubmissionsForExam);
router.get('/:submissionId/details', protect, authorize('teacher'), getSubmissionDetailsForTeacher);

export default router;