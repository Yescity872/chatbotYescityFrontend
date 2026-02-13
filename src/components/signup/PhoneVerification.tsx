'use client';
import { FormEvent } from 'react';
import { FaPhoneAlt, FaKey, FaUserFriends, FaSpinner } from 'react-icons/fa';

interface PhoneVerificationProps {
  phone: string;
  setPhone: (val: string) => void;
  otp: string;
  setOtp: (val: string) => void;
  referredBy: string;
  setReferredBy: (val: string) => void;
  maskedReferral: string;
  otpSent: boolean;
  otpVerified: boolean;
  isOtpSending: boolean;
  isOtpVerifying: boolean;
  otpTimer: number;
  sendOtp: () => void;
  verifyOtp: () => void;
  searchParams: URLSearchParams;
}

export default function PhoneVerification({
  phone,
  setPhone,
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
}: PhoneVerificationProps) {
  return (
    <form className="space-y-5 overflow-hidden">
      {/* Phone Notice */}
      <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl">
        <div className="flex items-center">
          <FaPhoneAlt className="mr-3 text-sky-600 flex-shrink-0" />
          <span className="text-sm text-sky-800">Phone number verification required</span>
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FaPhoneAlt className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e)=>{
                if(e.key=='Enter'){
                    e.preventDefault();
                    sendOtp();
                }
            }}
            required
            disabled={otpVerified}
            className={`w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-800 placeholder-gray-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all ${
              otpVerified ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
            }`}
            placeholder="9876543210"
          />
        </div>

        {/* OTP Buttons */}
        {!otpSent ? (
          <button
            type="button"
            onClick={sendOtp}
            disabled={isOtpSending || !phone}
            className="mt-3 w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center shadow-lg"
          >
            {isOtpSending ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        ) : (
          !otpVerified && (
            <div className="mt-3">
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpTimer > 0 || isOtpSending}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium border border-gray-200"
              >
                {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
              </button>
            </div>
          )
        )}
      </div>

      {/* OTP Field */}
      {otpSent && !otpVerified && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Enter OTP
          </label>
          <div className="relative">
            <FaKey className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e)=>{
                if(e.key=='Enter'){
                    e.preventDefault();
                    verifyOtp();
                }
              }}
              maxLength={6}
              className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-800 focus:border-sky-400 focus:outline-none"
              placeholder="Enter 6-digit OTP"
            />
          </div>
          <button
            type="button"
            onClick={verifyOtp}
            disabled={isOtpVerifying || !otp}
            className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center shadow-lg"
          >
            {isOtpVerifying ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        </div>
      )}

      {/* Referral */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Referred By{' '}
          <span className="text-xs text-gray-500 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <FaUserFriends className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="tel"
            value={searchParams.get('ref') ? maskedReferral : referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
            onKeyDown={(e)=>{
                if(e.key=='Enter'){
                    e.preventDefault();
                    verifyOtp();
                }
            }}
            maxLength={10}
            readOnly={!!searchParams.get('ref')}
            className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-800 focus:border-sky-400"
            placeholder="Friend's phone number"
          />
        </div>
      </div>

      <div id="recaptcha-container"></div>
    </form>
  );
}
