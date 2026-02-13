'use client';
interface StepProgressProps {
  otpVerified: boolean;
}

export default function StepProgress({ otpVerified }: StepProgressProps) {
  return (
    <div className="flex justify-center items-center mb-6">
      <div className="flex items-center space-x-3">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-300 ${
            !otpVerified
              ? 'bg-gray-500 border-gray-500 text-white'
              : 'bg-gray-400 border-gray-400 text-white'
          }`}
        >
          1
        </div>
        <div
          className={`w-8 h-0.5 transition-all duration-300 ${
            otpVerified ? 'bg-gray-400' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-300 ${
            otpVerified
              ? 'bg-gray-500 border-gray-500 text-white'
              : 'bg-white border-gray-300 text-gray-400'
          }`}
        >
          2
        </div>
      </div>
    </div>
  );
}
