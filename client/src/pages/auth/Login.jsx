import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(formData);
      authLogin(data.user, data.token);
      navigate('/dashboard'); // Redirect after login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back!</h2>
        {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-lg">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-6">
          <Input name="email" type="email" placeholder="Email Address" value={email} onChange={onChange} required />
          <Input name="password" type="password" placeholder="Password" value={password} onChange={onChange} required />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account? <Link to="/register" className="font-medium text-blue-600 hover:underline">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;