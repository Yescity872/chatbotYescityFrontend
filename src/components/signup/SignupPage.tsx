'use client';

import { Suspense, useEffect, useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';

// 🔹 Imported Components
import StepProgress from '@/components/signup/StepProgress';
import ErrorAlert from '@/components/signup/ErrorAlert';
import EmailVerification from '@/components/signup/EmailVerification';
import AccountDetailsForm from '@/components/signup/AccountDetailsForm';

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
  </div>
);

export default function SignupPage() {
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [maskedReferral, setMaskedReferral] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);

  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showNextStep, setShowNextStep] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔹 Auto-fill referral from query (?ref=)
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      try {
        const decoded = atob(ref);
        setReferredBy(decoded);
        console.log('Decoded referral:', decoded);
        setMaskedReferral(decoded.replace(/.(?=.{4})/g, '•'));
      } catch {
        console.warn('Invalid referral code');
      }
    }
  }, [searchParams]);

  // Read error from URL (?error=...)
  const errorFromUrl = searchParams.get("error");
  useEffect(() => {
    if (errorFromUrl === "missing_email") {
      toast.error("Email verification is required for Google Sign-Up!", {
        position: "top-center",
      });

      // Clear URL so toast doesn't repeat
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url);
    }
  }, [errorFromUrl]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    if (!username || !password) {
      setError('Username and password are required');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    if (!email) {
      setError('Enter email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsOtpSending(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      startOtpTimer();

      toast.success('OTP sent to your email!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError('Enter OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsOtpVerifying(true);
    setError('');

    try {
      // Verify OTP with backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // OTP is valid
      setOtpVerified(true);
      setTimeout(() => setShowNextStep(true), 100);

      toast.success('Email verified! Complete your registration');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!otpVerified) {
      setError('Please verify your email first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signup({
        username,
        email,
        password,
        emailOTP: otp,
        referredBy: referredBy || null,
      });

      if (result.success) {
        toast.success(result.message);
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
  const params = new URLSearchParams();

  params.set(
    "state",
    JSON.stringify({
      referredBy: referredBy || null,
      from: `${window.location.origin}/ai-chat`
    })
  );

    const redirectUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/google?${params.toString()}`;
    console.log('Redirecting to Google OAuth (Signup):', redirectUrl);
    window.location.href = redirectUrl;
};

  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout
        title="Create Account"
        subtitle="Join YesCity to explore hidden gems"
        footerContent={
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
              Sign in
            </Link>
          </p>
        }
      >
        <div className="space-y-6">
          <StepProgress otpVerified={otpVerified} />
          <ErrorAlert error={error} />

          {/* Step 1: Email Verification */}
          <div className={otpVerified && showNextStep ? 'hidden' : 'block'}>
            <EmailVerification
              email={email}
              setEmail={setEmail}
              otp={otp}
              setOtp={setOtp}
              referredBy={referredBy}
              setReferredBy={setReferredBy}
              maskedReferral={maskedReferral}
              otpSent={otpSent}
              otpVerified={otpVerified}
              isOtpSending={isOtpSending}
              isOtpVerifying={isOtpVerifying}
              otpTimer={otpTimer}
              sendOtp={sendOtp}
              verifyOtp={verifyOtp}
              searchParams={searchParams}
              handleGoogleSignIn={handleGoogleSignIn}
            />
          </div>

          {/* Step 2: Account Details */}
          <div className={otpVerified && showNextStep ? 'block' : 'hidden'}>
            <AccountDetailsForm
              username={username}
              setUsername={setUsername}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              handleGoogleSignIn={handleGoogleSignIn}
            />
          </div>
        </div>
      </AuthLayout>
    </Suspense>
  );
}