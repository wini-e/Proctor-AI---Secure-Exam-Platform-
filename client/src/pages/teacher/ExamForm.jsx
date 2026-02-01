import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createExam, getExamDetails, updateExamDetails } from '../../api/exams';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ExamForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { examId } = useParams();
  const isEditMode = Boolean(examId);

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      const fetchExam = async () => {
        try {
          const data = await getExamDetails(examId, token);
          setTitle(data.title);
          setDescription(data.description);
          setDuration(data.duration);
          setQuestions(data.questions);
        } catch (err) {
          setError("Failed to load exam details. You may not be the owner.");
        } finally {
          setLoading(false);
        }
      };
      fetchExam();
    }
  }, [examId, isEditMode, token]);

  const addQuestion = (type) => {
    const newQuestion = {
      questionText: '',
      questionType: type,
      points: 1,
      options: type === 'mcq' ? [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] : [],
      modelAnswer: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleCorrectOptionChange = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.forEach((opt, idx) => { opt.isCorrect = idx === oIndex; });
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ text: '', isCorrect: false });
    setQuestions(newQuestions);
  };
  
  const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));
  
  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length > 2) {
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const examData = { title, description, duration, questions };
    try {
      if (isEditMode) {
        await updateExamDetails(examId, examData, token);
        alert('Exam updated successfully!');
      } else {
        const newExam = await createExam(examData, token);
        alert(`Exam created successfully! Access Code: ${newExam.accessCode}`);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center p-10">Loading Exam Form...</p>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-text mb-6">
        {isEditMode ? 'Edit Exam' : 'Create New Exam'}
      </h1>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-surface p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Exam Details</h2>
          <div className="space-y-4">
            <Input name="title" placeholder="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea name="description" placeholder="Exam Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
            <Input name="duration" type="number" placeholder="Duration (in minutes)" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} required />
          </div>
        </div>
        <div className="bg-surface p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Questions</h2>
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="border-t pt-6 mt-6 first:mt-0 first:border-t-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Question {qIndex + 1} ({q.questionType.toUpperCase()})</h3>
                <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700 font-semibold">Remove</button>
              </div>
              <textarea placeholder="Enter question text..." value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)} className="w-full px-4 py-2 bg-gray-50 border rounded-md mb-2" rows="2" required></textarea>
              {q.questionType === 'mcq' ? (
                <div className="space-y-2 mt-2">
                  <p className="text-sm text-text-secondary">Select the correct answer:</p>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <input type="radio" name={`correct_option_${qIndex}`} checked={opt.isCorrect} onChange={() => handleCorrectOptionChange(qIndex, oIndex)} className="form-radio h-5 w-5 text-primary" />
                      <Input placeholder={`Option ${oIndex + 1}`} value={opt.text} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} required />
                      {q.options.length > 2 && <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-gray-500 hover:text-red-500 p-1">✕</button>}
                    </div>
                  ))}
                  <Button type="button" onClick={() => addOption(qIndex)}>Add Option</Button>
                </div>
              ) : (
                <div className="mt-2">
                  <label className="text-sm text-text-secondary">Model Answer / Grading Guidelines</label>
                  <textarea
                    placeholder="Provide a model answer or key points for grading..."
                    value={q.modelAnswer || ''}
                    onChange={(e) => handleQuestionChange(qIndex, 'modelAnswer', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border rounded-md mt-1"
                    rows="3"
                  ></textarea>
                </div>
              )}
              <div className="mt-4">
                <label className="text-sm text-text-secondary">Points:</label>
                <Input type="number" value={q.points} onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 1)} className="w-24 ml-2" required />
              </div>
            </div>
          ))}
          <div className="mt-6 flex space-x-4">
            <Button type="button" onClick={() => addQuestion('mcq')}>Add MCQ Question</Button>
            <Button type="button" onClick={() => addQuestion('subjective')}>Add Subjective Question</Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Exam'}</Button>
        </div>
      </form>
    </div>
  );
};
export default ExamForm;