import express from 'express';
import { createExam, findExamByAccessCode, getMyExams, getExamById, updateExam, getExamForStudent, deleteExam } from '../../controllers/examController.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/my-exams').get(protect, authorize('teacher'), getMyExams);
router.route('/access/:code').get(protect, authorize('student'), findExamByAccessCode);
router.route('/:id/start').get(protect, authorize('student'), getExamForStudent);
router.route('/').post(protect, authorize('teacher'), createExam);

router.route('/:id')
  .get(protect, authorize('teacher'), getExamById)
  .put(protect, authorize('teacher'), updateExam)
  .delete(protect, authorize('teacher'), deleteExam);

export default router;