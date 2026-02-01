import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answer: { type: mongoose.Schema.Types.Mixed },
  }],
  score: { type: Number, required: true, default: 0 },
  totalMarks: { type: Number, required: true, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
  proctoringViolations: [{
      type: { type: String },
      timestamp: { type: Date },
      severity: { type: String },
  }],
});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;