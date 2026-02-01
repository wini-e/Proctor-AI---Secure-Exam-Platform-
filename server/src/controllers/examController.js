import Exam from '../models/Exam.js';
import Submission from '../models/Submission.js';
import crypto from 'crypto';

export const createExam = async (req, res) => {
  try {
    const { title, description, duration, questions } = req.body;
    if (!title || !description || !duration || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields for the exam.' });
    }
    const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const exam = new Exam({
      title, description, duration, questions,
      createdBy: req.user._id,
      accessCode,
    });
    const createdExam = await exam.save();
    res.status(201).json(createdExam);
  } catch (error) {
    res.status(500).json({ message: 'A server error occurred while creating the exam.', error: error.message });
  }
};

export const findExamByAccessCode = async (req, res) => {
  try {
    const accessCode = req.params.code.toUpperCase();
    const exam = await Exam.findOne({ accessCode: accessCode, isDeleted: false }).populate('createdBy', 'name');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found with this access code.' });
    }
    const examLobbyDetails = {
        _id: exam._id, title: exam.title, description: exam.description,
        duration: exam.duration, questionCount: exam.questions.length,
        createdBy: exam.createdBy.name,
    };
    res.json(examLobbyDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error while finding exam.', error: error.message });
  }
};

export const getMyExams = async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user._id, isDeleted: false }).sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching exams.' });
  }
};

export const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (exam && exam.createdBy.toString() === req.user._id.toString()) {
            res.json(exam);
        } else {
            res.status(404).json({ message: 'Exam not found or you are not authorized to view it.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (exam && exam.createdBy.toString() === req.user._id.toString()) {
            const { title, description, duration, questions } = req.body;
            exam.title = title || exam.title;
            exam.description = description || exam.description;
            exam.duration = duration || exam.duration;
            exam.questions = questions || exam.questions;
            const updatedExam = await exam.save();
            res.json(updatedExam);
        } else {
            res.status(404).json({ message: 'Exam not found or you are not authorized to update it.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getExamForStudent = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam || exam.isDeleted) {
            return res.status(404).json({ message: 'Exam not found.' });
        }
        const questionsForStudent = exam.questions.map(q => ({
            _id: q._id, questionText: q.questionText, questionType: q.questionType,
            points: q.points, options: q.options.map(opt => ({ text: opt.text, _id: opt._id })),
        }));
        const examForStudent = {
            _id: exam._id, title: exam.title, duration: exam.duration,
            questions: questionsForStudent,
        };
        res.json(examForStudent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        if (exam.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this exam' });
        }
        
        exam.isDeleted = true;
        await exam.save();
        
        res.json({ message: 'Exam archived successfully. Student reports are preserved.' });
    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};