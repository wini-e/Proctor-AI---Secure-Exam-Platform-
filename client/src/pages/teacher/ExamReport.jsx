import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchSubmissionsForExam } from '../../api/submissions';
import { User, Mail, CalendarClock } from 'lucide-react';
import Button from '../../components/common/Button';

const ExamReport = () => {
  const { examId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const data = await fetchSubmissionsForExam(examId, token);
        setSubmissions(data);
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setLoading(false);
      }
    };
    loadSubmissions();
  }, [examId, token]);

  return (
    <div>
      <h1 className="text-4xl font-bold text-text mb-8">Exam Report</h1>
      {loading ? (
        <p>Loading submissions...</p>
      ) : submissions.length > 0 ? (
        <div className="bg-surface rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {submissions.map(sub => (
              <li key={sub._id} className="p-6 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-bold text-lg text-text flex items-center"><User size={16} className="mr-2"/>{sub.student.name}</p>
                  <p className="text-sm text-text-secondary flex items-center"><Mail size={14} className="mr-2"/>{sub.student.email}</p>
                  <p className="text-sm text-text-secondary flex items-center mt-1"><CalendarClock size={14} className="mr-2"/>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-8">
                    <div className="text-center">
                        <p className="font-bold text-2xl text-primary">{sub.score} / {sub.totalMarks}</p>
                        <p className="text-xs text-text-secondary">Score</p>
                    </div>
                    <Link to={`/submission/${sub._id}/details`}>
                      <Button>View Details</Button>
                    </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-lg">
            <h2 className="text-2xl font-semibold text-text">No Submissions Yet</h2>
            <p className="text-text-secondary mt-2">Check back after students have completed the exam.</p>
        </div>
      )}
    </div>
  );
};
export default ExamReport;