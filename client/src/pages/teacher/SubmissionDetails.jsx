import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchSubmissionDetails } from '../../api/submissions';
import { AlertTriangle, Clock } from 'lucide-react';

const SubmissionDetails = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchSubmissionDetails(submissionId, token);
        setSubmission(data);
      } catch (error) {
        console.error("Failed to fetch submission details", error);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [submissionId, token]);

  const getStudentAnswerForQuestion = (question) => {
    const answerObj = submission.answers.find(a => a.questionId.toString() === question._id.toString());
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
    const studentAnswer = submission.answers.find(a => a.questionId.toString() === question._id.toString())?.answer;
    const correctOption = question.options.find(o => o.isCorrect);
    return studentAnswer === correctOption?._id.toString();
  };

  if (loading) return <p className="text-center p-10">Loading Submission Details...</p>;
  if (!submission) return <p className="text-center p-10">Could not load submission details.</p>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-4xl font-bold text-text mb-2">Submission Details</h1>
      <p className="text-text-secondary mb-4">Exam: {submission.exam.title}</p>
      <p className="text-text-secondary mb-8">Student: {submission.student.name} ({submission.student.email})</p>
      
      <div className="bg-surface p-8 rounded-lg shadow-md mb-8 text-center">
        <p className="text-text-secondary">Final Score</p>
        <p className="text-6xl font-bold text-primary">{submission.score} <span className="text-4xl text-text-secondary">/ {submission.totalMarks}</span></p>
      </div>
      
      {submission.proctoringViolations && submission.proctoringViolations.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-red-700 flex items-center mb-4">
                <AlertTriangle className="mr-3" /> Proctoring Violations ({submission.proctoringViolations.length})
            </h2>
            <ul className="divide-y divide-red-200">
                {submission.proctoringViolations.map((v, i) => (
                    <li key={i} className="py-2 flex items-center">
                        <Clock size={16} className="mr-3 text-red-600"/>
                        <div>
                            <span className="font-semibold">{v.type}</span>
                            <span className="text-sm text-red-700 ml-2"> at {new Date(v.timestamp).toLocaleString()}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      )}
      
      <div className="space-y-6">
        {submission.exam.questions.map((q, index) => (
          <div key={q._id} className="bg-surface p-6 rounded-lg shadow-md">
            <p className="font-bold text-lg mb-4">Q{index + 1}: {q.questionText}</p>
            <div className={`p-4 rounded-md ${isCorrect(q) ? 'bg-green-50 border-green-200' : isCorrect(q) === false ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border`}>
              <p className="text-sm font-bold mb-2">Student's Answer:</p>
              <p>{getStudentAnswerForQuestion(q)}</p>
            </div>
            <div className="p-4 rounded-md bg-blue-50 border-blue-200 border mt-4">
                <p className="text-sm font-bold mb-2">Correct / Model Answer:</p>
                <p>{getCorrectAnswer(q)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SubmissionDetails;