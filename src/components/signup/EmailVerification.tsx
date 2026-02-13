import { Dispatch, SetStateAction } from 'react';
import { ReadonlyURLSearchParams } from 'next/navigation';

interface EmailVerificationProps {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  otp: string;
  setOtp: Dispatch<SetStateAction<string>>;
  referredBy: string;
  setReferredBy: Dispatch<SetStateAction<string>>;
  maskedReferral: string;
  otpSent: boolean;
  otpVerified: boolean;
  isOtpSending: boolean;
  isOtpVerifying: boolean;
  otpTimer: number;
  sendOtp: () => void;
  verifyOtp: () => void;
  searchParams: ReadonlyURLSearchParams;
  handleGoogleSignIn: () => void;
}

export default function EmailVerification({
  email,
  setEmail,
  otp,
  setOtp,
  referredBy,
  setReferredBy,
  maskedReferral,
  otpSent,
  otpVerified,
  isOtpSending,
  isOtpVerifying,
  otpTimer,
  sendOtp,
  verifyOtp,
  searchParams,
  handleGoogleSignIn
}: EmailVerificationProps) {
  const hasReferralParam = Boolean(searchParams.get('ref'));

  // Handle Enter key press for email input
    const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && email && !isOtpSending && !otpSent) {
        e.preventDefault();
        sendOtp();
    }
    };

    // Handle Enter key press for OTP input
    const handleOtpKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && otp.length === 6 && !isOtpVerifying) {
        e.preventDefault();
        verifyOtp();
    }
    };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-gray-600 mb-4 text-center">
          {otpSent
            ? 'Enter the 6-digit code sent to your email'
            : 'Choose your signup method'}
        </p>
      </div>

      {/* Email Input */}
      <div className="relative">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleEmailKeyPress}  
            disabled={otpSent}
            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
              otpSent
                ? 'border-blue-300 bg-green-50 text-gray-500 cursor-not-allowed'
                : 'border-gray-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100'
            }`}
            placeholder="Enter your email"
          />
        </div>
      </div>

      {/* OTP Input (shown after email is sent) */}
      {otpSent && !otpVerified && (
        <div className="relative animate-fadeIn">
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) setOtp(value);
              }}
              onKeyDown={handleOtpKeyPress}
              maxLength={6}
              className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-200 tracking-widest text-center text-lg font-semibold"
              placeholder="000000"
            />
          </div>
          {otpTimer > 0 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Resend OTP in <span className="font-semibold text-sky-600">{otpTimer}s</span>
            </p>
          )}
        </div>
      )}


      {/* Action Buttons */}
      <div className="space-y-3">
        {!otpSent ? (
          // Before OTP is sent - Show both email OTP and Google buttons
          <>

          {
            email && (
                <button
                type="button"
                onClick={sendOtp}
                disabled={isOtpSending}
                className="w-full py-3.5 mb-5 rounded-xl font-semibold text-white transition-all duration-200 transform
                    bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl
                "
                >
                {isOtpSending ? (
                    <span className="flex items-center justify-center">
                    <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        ></circle>
                        <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    Sending OTP...
                    </span>
                ) : (
                    'Send Verification Code'
                )}
                </button>
            )
          }


            {/* Referral Code (optional) - Only show before OTP is sent */}
            {!hasReferralParam && !otpSent && (
                <div className="relative">
                <label htmlFor="referral" className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    </div>
                    <input
                    id="referral"
                    type="text"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-200"
                    placeholder="Enter referral code"
                    />
                </div>
                </div>
            )}

            {/* Show masked referral if from URL */}
            {hasReferralParam && maskedReferral && (
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                    <svg
                        className="h-6 w-6 text-sky-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    </div>
                    <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Referral Applied!</p>
                    <p className="text-xs text-gray-600 mt-1 font-mono">{maskedReferral}</p>
                    </div>
                </div>
                </div>
            )}


            {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 py-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

            {/* Google Sign Up Button - Direct signup without email verification */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-3 hover:border-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </>
        ) : (
          // After OTP is sent - Show verify and resend buttons
          <div className="space-y-3">
            <button
              type="button"
              onClick={verifyOtp}
              disabled={isOtpVerifying || !otp || otp.length !== 6}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                isOtpVerifying || !otp || otp.length !== 6
                  ? 'bg-gray-300 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              }`}
            >
              {isOtpVerifying ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>

            {otpTimer === 0 && (
            <button
                type="button"
                onClick={sendOtp}
                disabled={isOtpSending}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                isOtpSending
                    ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed"
                    : "text-sky-600 border-2 border-sky-200 hover:bg-sky-50"
                }`}
            >
                {isOtpSending ? (
                <span className="flex items-center justify-center">
                    <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-sky-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                    </svg>
                    Sending...
                </span>
                ) : (
                "Resend Code"
                )}
            </button>
            )}

          </div>
        )}
      </div>
    </div>
  );
}