import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { emailOrUsername, password } = await req.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }
    const usersCollection = db.collection('users');

    // Find user by email or username
    const user = await usersCollection.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check if the user has a password (they might be a Google-only user)
    if (!user.password) {
      return NextResponse.json({ 
        message: 'This account was created with Google. Please sign in with Google.' 
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || null,
        contributionPoints: user.contributionPoints || 0,
        isPremium: user.isPremium || false
      },
      token: 'dummy-token-' + user._id,
    });
  } catch (error: any) {
    console.error('Login Error details:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ 
      message: error.message === 'Database connection failed' ? 'Database connection failed' : 'Invalid credentials',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
