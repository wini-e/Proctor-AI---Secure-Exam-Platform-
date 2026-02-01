import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(formData);
      authLogin(data.user, data.token);
      navigate('/dashboard'); // Redirect to a dashboard page after registration
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">Create Your Account</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-6">
          <Input name="name" placeholder="Full Name" value={name} onChange={onChange} required />
          <Input name="email" type="email" placeholder="Email Address" value={email} onChange={onChange} required />
          <Input name="password" type="password" placeholder="Password" value={password} onChange={onChange} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
            <select name="role" value={role} onChange={onChange} className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;