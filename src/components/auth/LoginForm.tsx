
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { AuthFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const LoginForm = () => {
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signIn(formData.email, formData.password);
    } catch (error) {
      // Error is already handled in the auth context
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
          autoComplete="email"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          className="form-input"
          autoComplete="current-password"
        />
      </div>
      
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      
      <Button
        type="submit"
        className="w-full btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-apple-blue hover:underline font-medium">
          Sign up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
