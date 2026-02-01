import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchSubmissionResult } from '../../api/submissions';

const ResultsPage = () => {
  const { submissionId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await fetchSubmissionResult(submissionId, token);
        setResult(data);
      } catch (error) {
        console.error("Failed to fetch result", error);
      } finally {
        setLoading(false);
      }
    };
    loadResult();
  }, [submissionId, token]);

  const getStudentAnswerForQuestion = (question) => {
    const answerObj = result.answers.find(a => a.questionId.toString() === question._id.toString());
    if (!answerObj || answerObj.answer === null) return 'Not Answered';
    
    if (question.questionType === 'mcq') {
        const option = question.options.find(o => o._id.toString() === answerObj.answer);
        return option ? option.text : 'Not Answered';
    }
    return answerObj.answer || 'Not Answered';
  };

  const getCorrectAnswer = (question) => {
    if (question.questionType === 'mcq') {
        return question.options.find(opt => opt.isCorrect)?.text;
    }
    return question.modelAnswer || 'No model answer provided.';
  };

  const isCorrect = (question) => {
    if (question.questionType !== 'mcq') return null;
    const studentAnswer = result.answers.find(a => a.questionId.toString() === question._id.toString())?.answer;
    const correctOption = question.options.find(o => o.isCorrect);
    return studentAnswer === correctOption?._id.toString();
  };

  if (loading) return <p className="text-center p-10">Loading your result...</p>;
  if (!result) return <p className="text-center p-10">Could not load result.</p>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-4xl font-bold text-text mb-4">Your Result</h1>
      <div className="bg-surface p-8 rounded-lg shadow-md mb-8 text-center">
        <p className="text-text-secondary">You scored</p>
        <p className="text-6xl font-bold text-primary">{result.score} <span className="text-4xl text-text-secondary">/ {result.totalMarks}</span></p>
      </div>
      
      <div className="space-y-6">
        {result.exam.questions.map((q, index) => (
          <div key={q._id} className="bg-surface p-6 rounded-lg shadow-md">
            <p className="font-bold text-lg mb-4">Q{index + 1}: {q.questionText}</p>
            <div className={`p-4 rounded-md ${isCorrect(q) ? 'bg-green-50 border-green-200' : isCorrect(q) === false ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border`}>
              <p className="text-sm font-bold mb-2">Your Answer:</p>
              <p>{getStudentAnswerForQuestion(q)}</p>
            </div>
            <div className="p-4 rounded-md bg-green-50 border-green-200 border mt-4">
                <p className="text-sm font-bold mb-2">Correct / Model Answer:</p>
                <p>{getCorrectAnswer(q)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ResultsPage;