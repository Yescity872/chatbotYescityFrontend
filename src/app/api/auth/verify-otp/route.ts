import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const otpCollection = db.collection('email_otps');

    const storedRecord = await otpCollection.findOne({ email });

    if (!storedRecord) {
      return NextResponse.json({ message: 'OTP expired or not found. Please request a new one.' }, { status: 400 });
    }

    if (storedRecord.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP. Please check your email.' }, { status: 400 });
    }

    // Success - Remove OTP so it can't be reused
    await otpCollection.deleteOne({ email });

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
