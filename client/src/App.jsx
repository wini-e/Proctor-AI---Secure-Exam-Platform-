import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ExamForm from './pages/teacher/ExamForm';
import StudentDashboard from './pages/student/StudentDashboard';
import ExamLobby from './pages/student/ExamLobby';
import ExamRoom from './pages/student/ExamRoom';
import ResultsPage from './pages/student/ResultsPage';
import ExamReport from './pages/teacher/ExamReport';
import MyResults from './pages/student/MyResults';
import SubmissionDetails from './pages/teacher/SubmissionDetails';

const RoleBasedDashboard = () => {
    const { user } = useAuth();
    if (user?.role === 'teacher') return <TeacherDashboard />;
    if (user?.role === 'student') return <StudentDashboard />;
    return <Navigate to="/login" />;
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const TeacherRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user?.role === 'teacher' ? children : <Navigate to="/dashboard" />;
}

const StudentRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user?.role === 'student' ? children : <Navigate to="/dashboard" />;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><MainLayout><RoleBasedDashboard /></MainLayout></PrivateRoute>} />
      
      <Route path="/create-exam" element={<PrivateRoute><TeacherRoute><MainLayout><ExamForm /></MainLayout></TeacherRoute></PrivateRoute>} />
      <Route path="/edit-exam/:examId" element={<PrivateRoute><TeacherRoute><MainLayout><ExamForm /></MainLayout></TeacherRoute></PrivateRoute>} />
      <Route path="/exam-report/:examId" element={<PrivateRoute><TeacherRoute><MainLayout><ExamReport /></MainLayout></TeacherRoute></PrivateRoute>} />
      <Route path="/submission/:submissionId/details" element={<PrivateRoute><TeacherRoute><MainLayout><SubmissionDetails /></MainLayout></TeacherRoute></PrivateRoute>} />

      <Route path="/my-results" element={<PrivateRoute><StudentRoute><MainLayout><MyResults /></MainLayout></StudentRoute></PrivateRoute>} />
      <Route path="/exam-lobby/:examId" element={<PrivateRoute><StudentRoute><MainLayout><ExamLobby /></MainLayout></StudentRoute></PrivateRoute>} />
      <Route path="/exam-room/:examId" element={<PrivateRoute><StudentRoute><ExamRoom /></StudentRoute></PrivateRoute>} />
      <Route path="/result/:submissionId" element={<PrivateRoute><StudentRoute><MainLayout><ResultsPage /></MainLayout></StudentRoute></PrivateRoute>} />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
export default App;