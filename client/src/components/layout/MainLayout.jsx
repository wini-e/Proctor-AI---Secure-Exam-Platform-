import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BookUser, FilePlus2, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';

const NavItem = ({ to, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 space-x-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-primary text-white shadow-md'
          : 'text-text-secondary hover:bg-background hover:text-text'
      }`
    }
  >
    {icon}
    <span className="font-medium">{children}</span>
  </NavLink>
);

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background text-text">
      <aside className="w-64 bg-surface flex flex-col border-r border-gray-200">
        <div className="flex items-center justify-center p-6 space-x-2 border-b">
          <ShieldCheck className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold text-primary">ProctorAI</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {user?.role === 'teacher' && (
            <>
              <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />}>Dashboard</NavItem>
              <NavItem to="/create-exam" icon={<FilePlus2 size={20} />}>Create Exam</NavItem>
            </>
          )}
          {user?.role === 'student' && (
            <>
              <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />}>Dashboard</NavItem>
              <NavItem to="/my-results" icon={<BookUser size={20} />}>My Results</NavItem>
            </>
          )}
        </nav>
        <div className="px-4 py-6 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 space-x-3 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-surface flex justify-end items-center p-4 border-b">
            <span className="font-medium">Welcome, {user?.name}</span>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;