import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { username, email, password, referredBy } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
       return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }
    const usersCollection = db.collection('users');

    // Check if user already exists (by email OR username)
    const existingUser = await usersCollection.findOne({ 
      $or: [
        { email },
        { username }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ message: 'Email already registered' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Username already taken' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      referredBy: referredBy || null,
      contributionPoints: 0,
      isPremium: false,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: result.insertedId,
        username,
        email,
      },
      // In a real app, generate a JWT here. For simplicity, we'll return a dummy token.
      token: 'dummy-token-' + result.insertedId,
    });
  } catch (error: any) {
    console.error('Signup Error details:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ 
      message: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
