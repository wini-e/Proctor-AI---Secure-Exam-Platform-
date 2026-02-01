import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchMyExams, deleteExamById } from '../../api/exams';
import { FilePlus2, Copy, BarChart, Clock, Hash, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const ExamCard = ({ exam, onDeleteClick }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exam.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col">
      <h3 className="text-xl font-bold text-text mb-2">{exam.title}</h3>
      <div className="flex items-center space-x-4 text-text-secondary text-sm mb-4">
        <div className="flex items-center space-x-1"><Hash size={14} /><span>{exam.questions.length} Questions</span></div>
        <div className="flex items-center space-x-1"><Clock size={14} /><span>{exam.duration} mins</span></div>
      </div>
      <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-text-secondary">Access Code</span>
          <span className="font-mono text-primary font-bold text-lg">{exam.accessCode}</span>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={copyToClipboard} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                <Copy size={18} className={copied ? 'text-green-500' : 'text-text-secondary'} />
            </button>
            <Link to={`/exam-report/${exam._id}`} className="p-2 rounded-md hover:bg-gray-100 text-text-secondary transition-colors">
                <BarChart size={18} />
            </Link>
            <Link to={`/edit-exam/${exam._id}`} className="p-2 rounded-md hover:bg-gray-100 text-text-secondary transition-colors">
                <Pencil size={18} />
            </Link>
            <button onClick={() => onDeleteClick(exam._id)} className="p-2 rounded-md hover:bg-red-100 text-text-secondary hover:text-red-600 transition-colors">
                <Trash2 size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const loadExams = async () => {
      try {
        const data = await fetchMyExams(token);
        setExams(data);
      } catch (error) {
        console.error("Failed to fetch exams", error);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, [token]);

  const handleDeleteClick = (examId) => {
    setSelectedExamId(examId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedExamId) return;
    try {
      await deleteExamById(selectedExamId, token);
      setExams(exams.filter(exam => exam._id !== selectedExamId));
      setIsModalOpen(false);
      setSelectedExamId(null);
    } catch (error) {
      console.error("Failed to delete exam", error);
      alert("Could not delete the exam. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-text">My Exams</h1>
        <Link to="/create-exam" className="flex items-center space-x-2 bg-primary text-white px-5 py-3 rounded-lg font-semibold hover:bg-primary-hover transition-all duration-200 shadow-sm hover:shadow-md">
          <FilePlus2 size={20} />
          <span>Create New Exam</span>
        </Link>
      </div>

      {loading ? (
        <p>Loading exams...</p>
      ) : exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => <ExamCard key={exam._id} exam={exam} onDeleteClick={handleDeleteClick} />)}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-lg">
          <h2 className="text-2xl font-semibold text-text">No exams found</h2>
          <p className="text-text-secondary mt-2">Get started by creating your first exam.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Exam"
      >
        Are you sure you want to delete this exam? All associated student submissions will also be permanently deleted. This action cannot be undone.
      </Modal>
    </div>
  );
};
export default TeacherDashboard;