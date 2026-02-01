import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';

const ExamLobby = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { examId } = useParams();
  const exam = state?.exam;

  if (!exam) {
    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-bold">Error</h1>
            <p>Exam details not found. Please go back to the dashboard and enter the access code again.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">Go to Dashboard</Button>
        </div>
    );
  }

  const startExam = () => {
    navigate(`/exam-room/${examId}`);
  };

  return (
    <div className="max-w-3xl mx-auto bg-surface p-8 rounded-lg shadow-lg mt-10">
      <h1 className="text-4xl font-bold text-text mb-2">{exam.title}</h1>
      <p className="text-lg text-text-secondary mb-6">Created by: {exam.createdBy}</p>
      
      <div className="mb-8 p-6 bg-background rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        <p className="text-text-secondary mb-4">{exam.description}</p>
        <ul className="list-disc list-inside space-y-2 text-text">
            <li>This exam has <strong>{exam.questionCount} questions</strong>.</li>
            <li>You will have <strong>{exam.duration} minutes</strong> to complete it.</li>
            <li>Your webcam and screen will be monitored.</li>
            <li>Do not switch tabs or use your phone.</li>
            <li>Ensure you are in a quiet, well-lit room alone.</li>
        </ul>
      </div>

      <div className="text-center">
        <Button onClick={startExam}>I Understand, Start Exam</Button>
      </div>
    </div>
  );
};
export default ExamLobby;