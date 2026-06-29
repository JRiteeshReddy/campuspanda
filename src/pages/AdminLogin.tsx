import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { KeyRound, Mail, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const AdminLogin = () => {
  const navigate = useNavigate();
  
  // States
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Check if admin is already logged in
  useEffect(() => {
    const token = localStorage.getItem('cp_admin_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          localStorage.removeItem('cp_admin_token');
        }
      } catch (_) {
        localStorage.removeItem('cp_admin_token');
      }
    }
  }, [navigate]);

  // Handle resend countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Request OTP Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-api/send-otp', {
        method: 'POST',
        body: { email: email.toLowerCase().trim() },
      });

      if (error) {
        throw error;
      }

      toast.success('Access code sent to your email.');
      setStep('otp');
      setResendTimer(60); // 60 seconds rate limit
    } catch (err: any) {
      console.error('Request OTP error:', err);
      // Retrieve the response message if possible
      let errMsg = 'Failed to request OTP. Please try again.';
      if (err.message && err.message.includes('Unauthorized')) {
        errMsg = 'Unauthorized: This email is not configured as an administrator.';
      } else if (err.message && err.message.includes('wait 60 seconds')) {
        errMsg = 'Please wait 60 seconds before requesting another code.';
      }
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-api/verify-otp', {
        method: 'POST',
        body: { 
          email: email.toLowerCase().trim(), 
          otp: otp 
        },
      });

      if (error) {
        throw error;
      }

      if (data && data.token) {
        localStorage.setItem('cp_admin_token', data.token);
        toast.success('Access granted. Welcome back.');
        navigate('/admin/dashboard', { replace: true });
      } else {
        throw new Error('Authentication token not received.');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      let errMsg = 'Invalid verification code. Please try again.';
      if (err.message && err.message.includes('attempts remaining')) {
        errMsg = err.message;
      } else if (err.message && err.message.includes('Too many incorrect attempts')) {
        errMsg = 'Too many incorrect attempts. Please request a new OTP.';
        setStep('email');
        setOtp('');
      }
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      {/* Dynamic background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-md text-white shadow-2xl relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" />
        
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto bg-indigo-500/15 w-16 h-16 rounded-full flex items-center justify-center text-indigo-400 mb-2">
            <ShieldCheck size={36} className="animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">CampusPanda Admin</CardTitle>
          <CardDescription className="text-white/60">
            {step === 'email' 
              ? 'Provide your authorized administrator email' 
              : 'Enter the 6-digit security code sent to your email'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                <Input
                  type="email"
                  placeholder="admin@campuspanda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  disabled={loading}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Send Access Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6 flex flex-col items-center">
              <div className="text-sm text-center text-white/70 mb-2">
                Code sent to <span className="font-semibold text-white">{email}</span>
              </div>
              
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={(val) => setOtp(val)}
                disabled={loading}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="bg-white/5 border-white/10 text-white text-lg focus:ring-indigo-500 w-12 h-12" />
                  <InputOTPSlot index={1} className="bg-white/5 border-white/10 text-white text-lg focus:ring-indigo-500 w-12 h-12" />
                  <InputOTPSlot index={2} className="bg-white/5 border-white/10 text-white text-lg focus:ring-indigo-500 w-12 h-12" />
                  <InputOTPSlot index={3} className="bg-white/5 border-white/10 text-white text-lg focus:ring-indigo-500 w-12 h-12" />
                  <InputOTPSlot index={4} className="bg-white/5 border-white/10 text-white text-lg focus:ring-indigo-500 w-12 h-12" />
                  <InputOTPSlot index={5} className="bg-white/5 border-white/10 text-white text-lg focus:ring-indigo-500 w-12 h-12" />
                </InputOTPGroup>
              </InputOTP>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors mt-2"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying access...
                  </>
                ) : (
                  <>
                    Verify & Authorize
                    <KeyRound className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="px-6 pb-8 pt-2 flex flex-col space-y-4">
          {step === 'otp' && (
            <div className="flex justify-between items-center w-full text-xs text-white/60">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                }}
                className="flex items-center hover:text-white transition-colors"
                disabled={loading}
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Change email
              </button>

              <button
                type="button"
                onClick={handleRequestOtp}
                className="hover:text-white transition-colors disabled:opacity-50"
                disabled={loading || resendTimer > 0}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
              </button>
            </div>
          )}
          <div className="text-center w-full text-xs text-white/40">
            Secure admin access panel. Unauthorized attempts are logged.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
