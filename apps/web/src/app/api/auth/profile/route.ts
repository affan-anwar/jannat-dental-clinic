import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.API_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!apiUrl) {
    return NextResponse.json(
      { message: 'API_URL is not configured' },
      { status: 500 },
    );
  }

  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(`${apiUrl}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data: unknown = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: 'Profile service is unavailable' },
      { status: 503 },
    );
  }
}
