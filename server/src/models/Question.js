import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['mcq', 'subjective'], required: true },
  options: [{
    text: { type: String },
    isCorrect: { type: Boolean, default: false },
  }],
  modelAnswer: { type: String }, // For subjective questions
  points: { type: Number, required: true, default: 1 },
});

export default questionSchema;