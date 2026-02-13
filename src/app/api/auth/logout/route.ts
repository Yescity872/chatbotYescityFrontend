import { NextResponse } from 'next/server';

export async function POST() {
  // Since we are using token-based auth with dummy tokens, 
  // we just return success. If we were using cookies, we would clear them here.
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });
}
