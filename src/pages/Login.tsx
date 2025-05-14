
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  
  // Handle back button navigation to always return to home page
  const handleBackClick = () => {
    navigate('/');
  };
  
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account"
      onBackClick={handleBackClick}
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
