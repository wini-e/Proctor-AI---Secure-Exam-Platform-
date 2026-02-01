import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getExamByAccessCode } from '../../api/exams';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const StudentDashboard = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleJoinExam = async (e) => {
    e.preventDefault();
    if (!accessCode) {
      setError('Please enter an access code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const exam = await getExamByAccessCode(accessCode, token);
      // Navigate to the exam lobby, passing exam details
      navigate(`/exam-lobby/${exam._id}`, { state: { exam } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find exam.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Join an Exam</h2>
        <form onSubmit={handleJoinExam} className="flex items-center space-x-4">
          <Input
            name="accessCode"
            placeholder="Enter Exam Access Code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Join Exam'}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      {/* We can list active/past exams here later */}
    </div>
  );
};

export default StudentDashboard;