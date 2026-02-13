'use client';

import { Suspense, useEffect, useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

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

const Footer = () => (
  <footer className="py-6 text-center text-gray-400 text-sm">
    &copy; {new Date().getFullYear()} YesCity. All rights reserved.
  </footer>
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
      const response = await fetch(`/api/auth/send-otp`, {
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

      const successMsg = document.createElement('div');
      successMsg.className =
        'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMsg.textContent = 'OTP sent to your email!';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
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
      const response = await fetch(`/api/auth/verify-otp`, {
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

      const successMsg = document.createElement('div');
      successMsg.className =
        'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMsg.textContent = 'Email verified! Complete your registration';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
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

  window.location.href =
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google?${params.toString()}`;
};

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white overflow-hidden flex items-center justify-center">
        <div className="w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="mb-6 flex items-center text-sky-600 hover:text-sky-700 transition-colors font-medium"
          >
            ← Back to Home
          </Link>

          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full max-w-full">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-sky-100 overflow-hidden">
              <div className="px-8 py-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
                  <div className="w-16 h-1 bg-gradient-to-r from-sky-400 to-blue-500 mx-auto rounded-full mb-6"></div>
                </div>

                {/* Step Progress */}
                <StepProgress otpVerified={otpVerified} />

                {/* Error */}
                <ErrorAlert error={error} />

                {/* Step 1: Email Verification */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    otpVerified && showNextStep
                      ? 'transform -translate-x-full opacity-0 absolute hidden'
                      : 'transform translate-x-0 opacity-100'
                  }`}
                >
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
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    otpVerified && showNextStep
                      ? 'transform translate-x-0 opacity-100'
                      : 'transform translate-x-full opacity-0 absolute hidden'
                  }`}
                >
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

              {/* Footer */}
              <div className="border-t border-gray-100 bg-sky-50 px-8 py-4 text-center rounded-b-3xl">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Suspense>
  );
}