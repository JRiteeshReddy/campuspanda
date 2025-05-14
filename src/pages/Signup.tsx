
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';

const Signup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  
  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Sign up to get started"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
