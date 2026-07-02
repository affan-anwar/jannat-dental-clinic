import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: 'API_URL is not configured' },
      { status: 500 },
    );
  }

  try {
    const payload: unknown = await request.json();
    const response = await fetch(`${apiUrl}/auth/resend-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Password reset service is unavailable' },
      { status: 503 },
    );
  }
}
