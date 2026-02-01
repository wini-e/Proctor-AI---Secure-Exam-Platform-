import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWebcam } from '../../contexts/WebcamContext';
import { startExamById } from '../../api/exams';
import { startStudentExam, updateStudentExam } from '../../api/submissions';
import { startProctoring, stopProctoring, loadModel } from '../../lib/proctoringService';
import io from 'socket.io-client';
import { ChevronLeft, ChevronRight, Video, Timer, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const ExamRoom = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { startWebcam, stopWebcam } = useWebcam();
  
  const [submissionId, setSubmissionId] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [violations, setViolations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);

  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const lastViolationRef = useRef(null);
  const violationLimit = 5;

  const handleExamSubmit = useCallback(async (reason = "User submitted") => {
    if (isSubmitting || !submissionId) return;
    setIsSubmitting(true);
    stopProctoring();
    try {
      await updateStudentExam(submissionId, answers, token);
      if (reason === 'auto-submit') {
        alert(`Exam has been automatically submitted due to reaching ${violationLimit} violations.`);
      } else if (reason === 'time-up') {
        alert('Time is up! Your exam has been submitted.');
      } else {
        alert("Exam submitted successfully!");
      }
      navigate(`/result/${submissionId}`);
    } catch (err) {
      alert("There was an error submitting your exam.");
      setIsSubmitting(false);
    }
  }, [submissionId, answers, token, navigate, isSubmitting]);

  const handleViolation = useCallback((type) => {
    if (isSubmitting || !submissionId) return;
    const now = new Date();
    if (lastViolationRef.current) {
        const timeDiff = now - lastViolationRef.current.timestamp;
        if (lastViolationRef.current.type === type && timeDiff < 5000) return;
    }
    const newViolation = { type, timestamp: now };
    lastViolationRef.current = newViolation;
    setViolations(prev => {
      const updated = [...prev, newViolation];
      if (updated.length >= violationLimit && !isSubmitting) {
        handleExamSubmit('auto-submit');
      }
      return updated;
    });
    if (socketRef.current) {
      socketRef.current.emit('proctoring-violation', { submissionId, type });
    }
  }, [submissionId, handleExamSubmit, isSubmitting]);

  useEffect(() => {
    loadModel().then(() => setIsModelReady(true));
    
    startWebcam()
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => setIsWebcamReady(true);
        }
      })
      .catch(() => setError('Webcam access is required. Please enable it and refresh.'));

    return () => stopWebcam();
  }, [startWebcam, stopWebcam]);

  useEffect(() => {
    // This effect now includes the "warm-up" period
    if (isWebcamReady && isModelReady && videoRef.current) {
      console.log("Webcam and Model are ready. Starting proctoring in 3 seconds...");
      const proctoringTimeout = setTimeout(() => {
        console.log("Proctoring started.");
        startProctoring(videoRef.current, handleViolation);
      }, 3000); // 3-second grace period

      return () => {
        clearTimeout(proctoringTimeout);
        stopProctoring();
      };
    }
  }, [isWebcamReady, isModelReady, handleViolation]);

  useEffect(() => {
    const setup = async () => {
      try {
        const subData = await startStudentExam(examId, token);
        setSubmissionId(subData.submissionId);
        const examData = await startExamById(examId, token);
        setExam(examData);
        setTimeLeft(examData.duration * 60);
        const initialAnswers = {};
        examData.questions.forEach(q => {
          initialAnswers[q._id] = q.questionType === 'mcq' ? null : '';
        });
        setAnswers(initialAnswers);
        socketRef.current = io('http://localhost:5000');
        socketRef.current.on('connect', () => {
          socketRef.current.emit('join-exam-room', { submissionId: subData.submissionId });
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to start the exam session.');
      } finally {
        setLoading(false);
      }
    };
    setup();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [examId, token]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation('Left the page');
    };
    const handleBlur = () => handleViolation('Switched window/tab');
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleViolation]);

  useEffect(() => {
    if (!isSubmitting && timeLeft <= 0 && exam) {
      handleExamSubmit('time-up');
    }
    if (!exam || isSubmitting) return;
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, exam, handleExamSubmit, isSubmitting]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Starting Exam...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500 font-bold text-xl p-8 text-center">{error}</div>;

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="flex h-screen bg-background text-text">
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
          <p className="text-text-secondary mb-6">Question {currentQuestionIndex + 1} of {exam.questions.length}</p>
          <div className="bg-surface p-8 rounded-lg shadow-md">
            <p className="text-xl font-semibold mb-6">{currentQuestion.questionText}</p>
            {currentQuestion.questionType === 'mcq' ? (
              <div className="space-y-4">
                {currentQuestion.options.map(option => (
                  <label key={option._id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-primary">
                    <input type="radio" name={currentQuestion._id} value={option._id} checked={answers[currentQuestion._id] === option._id} onChange={() => handleAnswerChange(currentQuestion._id, option._id)} className="h-5 w-5 text-primary focus:ring-primary" />
                    <span className="ml-4 text-lg">{option.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea value={answers[currentQuestion._id]} onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)} rows="10" className="w-full p-4 border rounded-lg focus:ring-primary focus:border-primary" placeholder="Type your answer here..."></textarea>
            )}
          </div>
        </div>
        <div className="mt-8 flex justify-between items-center">
          <Button onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))} disabled={currentQuestionIndex === 0}>
            <ChevronLeft size={20} className="mr-2" /> Previous
          </Button>
          <Button onClick={() => setCurrentQuestionIndex(i => Math.min(exam.questions.length - 1, i + 1))} disabled={currentQuestionIndex === exam.questions.length - 1}>
            Next <ChevronRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
      <aside className="w-80 bg-surface p-6 shadow-lg flex flex-col border-l">
        <h2 className="text-xl font-bold text-center mb-4">Proctoring</h2>
        <div className="bg-black rounded-md overflow-hidden aspect-video relative">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"></video>
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Video size={12} className="mr-1" /> REC
          </div>
        </div>
        <div className="mt-6 text-center">
            <p className="text-lg font-semibold flex items-center justify-center"><Timer size={20} className="mr-2"/> Time Left</p>
            <p className={`text-5xl font-mono ${timeLeft < 60 ? 'text-red-500' : 'text-text'}`}>{formatTime(timeLeft)}</p>
        </div>
        <div className={`mt-6 p-4 border rounded-lg ${violations.length >= 3 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
            <div className="flex items-center font-bold mb-2"><AlertCircle size={20} className="mr-2"/> Proctoring Status</div>
            <p className="text-sm">
                Violations: <strong>{violations.length} / {violationLimit}</strong>
            </p>
            {violations.length > 0 && (
                <p className="text-sm mt-2 font-semibold">Last: {violations[violations.length - 1].type}</p>
            )}
        </div>
        <div className="mt-auto">
            <Button onClick={() => handleExamSubmit('user-submit')} fullWidth disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : <><CheckCircle size={20} className="mr-2"/> Submit Exam</>}
            </Button>
        </div>
      </aside>
    </div>
  );
};
export default ExamRoom;