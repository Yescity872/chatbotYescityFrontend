import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // 1. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Store in MongoDB
    const db = await getDatabase();
    const otpCollection = db.collection('email_otps');

    // Create TTL index (expires after 10 minutes)
    await otpCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 });

    // Upsert OTP
    await otpCollection.updateOne(
      { email },
      { 
        $set: { 
          otp, 
          createdAt: new Date() 
        } 
      },
      { upsert: true }
    );

    // 3. Send Email
    let transporter;
    let fromEmail = process.env.SMTP_USER;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Use configured SMTP
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Anonymous Fallback: Create a temporary Ethereal account
      console.log('No SMTP credentials found. Creating a temporary Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      fromEmail = testAccount.user;
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: `"YesCity" <${fromEmail}>`,
      to: email,
      subject: "Your YesCity Verification Code",
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #0ea5e9; text-align: center;">YesCity Verification</h2>
          <p>Hello,</p>
          <p>Your verification code for your YesCity account is:</p>
          <div style="font-size: 36px; font-weight: bold; color: #0ea5e9; padding: 20px 10px; letter-spacing: 5px; text-align: center; background: #f0f9ff; border-radius: 12px; margin: 25px 0; border: 1px dashed #0ea5e9;">${otp}</div>
          <p>Enter this code on the signup page to continue. The code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #ef4444; font-size: 13px;">If you did not request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0 20px;" />
          <p style="font-size: 12px; color: #737373; text-align: center;">&copy; ${new Date().getFullYear()} YesCity App. All rights reserved.</p>
        </div>
      `,
    });

    if (!process.env.SMTP_USER) {
      console.log('==========================================');
      console.log(`TEST OTP FOR ${email}: ${otp}`);
      console.log('VIEW EMAIL AT:', nodemailer.getTestMessageUrl(info));
      console.log('==========================================');
    } else {
      console.log(`OTP ${otp} sent to ${email}`);
    }
    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ 
      message: error.message || 'Failed to send OTP. Please try again later.' 
    }, { status: 500 });
  }
}
