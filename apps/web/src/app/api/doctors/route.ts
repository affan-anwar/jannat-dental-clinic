import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: 'API_URL is not configured' },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${apiUrl}/doctors`, {
      cache: 'no-store',
    });

    const data: unknown = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: 'Doctor service is unavailable' },
      { status: 503 },
    );
  }
}
