
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
  
  // Custom back handler to navigate to home
  const handleBackToHome = () => {
    navigate('/');
  };
  
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account"
      onBackClick={handleBackToHome}
      hideFeedback={true}
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
