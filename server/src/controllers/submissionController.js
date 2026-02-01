
import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';

export const startExamSubmission = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;

    const existingSubmission = await Submission.findOne({ exam: examId, student: studentId });
    if (existingSubmission && existingSubmission.status === 'submitted') {
      return res.status(400).json({ message: 'You have already completed this exam. Only one attempt is allowed.' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // If an incomplete submission exists, let them resume. Otherwise, create a new one.
    if (existingSubmission) {
        return res.status(200).json({ message: 'Resuming existing exam session.', submissionId: existingSubmission._id });
    }

    const newSubmission = new Submission({
      exam: examId,
      student: studentId,
      answers: exam.questions.map(q => ({ questionId: q._id, answer: null })),
      totalMarks: exam.questions.reduce((acc, q) => acc + q.points, 0),
      status: 'in-progress',
    });

    await newSubmission.save();
    res.status(201).json({ message: 'Exam started successfully', submissionId: newSubmission._id });

  } catch (error) {
    console.error("Error in startExamSubmission:", error);
    res.status(500).json({ message: 'Server error starting exam submission.' });
  }
};

export const updateExamSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { answers } = req.body;
    const studentId = req.user._id;

    const submission = await Submission.findById(submissionId).populate('exam');
    if (!submission || submission.student.toString() !== studentId.toString()) {
      return res.status(404).json({ message: 'Submission not found or not authorized.' });
    }

    let score = 0;
    submission.exam.questions.forEach(question => {
      const studentAnswer = answers[question._id];
      if (question.questionType === 'mcq' && studentAnswer) {
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (correctOption && correctOption._id.toString() === studentAnswer) {
          score += question.points;
        }
      }
    });

    submission.answers = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    submission.score = score;
    submission.submittedAt = new Date();
    submission.status = 'submitted';

    await submission.save();
    res.status(200).json({ message: 'Exam submitted successfully', submissionId: submission._id });
  } catch (error) {
    console.error("Error in updateExamSubmission:", error);
    res.status(500).json({ message: 'Server error during exam submission.' });
  }
};

export const getSubmissionsForExam = async (req, res) => {
    try {
        const submissions = await Submission.find({ exam: req.params.examId, status: 'submitted' })
            .populate('student', 'name email')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getSubmissionResult = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId)
            .populate({ path: 'exam', select: 'title questions' })
            .populate('student', 'name');
        if (!submission || submission.student._id.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Submission not found or not authorized.' });
        }
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ student: req.user._id, status: 'submitted' })
            .populate('exam', 'title')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getSubmissionDetailsForTeacher = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId)
            .populate({
                path: 'exam',
                select: 'title questions createdBy'
            })
            .populate('student', 'name email');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }
        if (submission.exam.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to view this submission.' });
        }
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};