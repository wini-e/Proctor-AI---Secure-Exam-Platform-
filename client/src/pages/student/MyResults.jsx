import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchMyResults } from '../../api/submissions';

const MyResults = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await fetchMyResults(token);
        setSubmissions(data);
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [token]);

  return (
    <div>
      <h1 className="text-4xl font-bold text-text mb-8">My Results</h1>
      {loading ? (
        <p>Loading results...</p>
      ) : submissions.length > 0 ? (
        <div className="bg-surface rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {submissions.map(sub => (
              <li key={sub._id} className="p-6 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-bold text-lg text-text">{sub.exam.title}</p>
                  <p className="text-sm text-text-secondary">
                    Submitted on: {new Date(sub.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-8">
                    <div className="text-center">
                        <p className="font-bold text-2xl text-primary">{sub.score} / {sub.totalMarks}</p>
                        <p className="text-xs text-text-secondary">Score</p>
                    </div>
                    <Link to={`/result/${sub._id}`} className="text-primary font-semibold hover:underline">View Details</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-lg">
            <h2 className="text-2xl font-semibold text-text">No Results Found</h2>
            <p className="text-text-secondary mt-2">Your results will appear here after you complete an exam.</p>
        </div>
      )}
    </div>
  );
};
export default MyResults;