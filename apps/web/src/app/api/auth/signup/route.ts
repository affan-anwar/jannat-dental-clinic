import { NextResponse } from 'next/server';

interface AuthResponse {
  accessToken?: string;
  user?: unknown;
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
      return NextResponse.json(
        { message: 'API_URL is not configured' },
        { status: 500 },
      );
    }

    const payload: unknown = await request.json();

    const backendResponse = await fetch(`${apiUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = (await backendResponse.json().catch(() => ({
      message: 'Invalid response from backend',
    }))) as AuthResponse;

    if (!backendResponse.ok || !data.accessToken) {
      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    }

    const response = NextResponse.json(
      {
        success: true,
        user: data.user,
      },
      { status: 201 },
    );

    response.cookies.set('access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    console.error('Signup route error:', error);

    return NextResponse.json(
      { message: 'Authentication service is unavailable' },
      { status: 503 },
    );
  }
}