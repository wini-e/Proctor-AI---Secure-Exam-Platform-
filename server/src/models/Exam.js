import mongoose from 'mongoose';
import questionSchema from './Question.js';

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    questions: [questionSchema],
    accessCode: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false }, // For soft delete
  },
  { timestamps: true }
);

const Exam = mongoose.model('Exam', examSchema);
export default Exam;