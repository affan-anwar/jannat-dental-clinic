import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 });
  try {
    const response = await fetch(`${apiUrl}/clinics`, { cache: 'no-store' });
    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: 'Clinic service is unavailable' }, { status: 503 });
  }
}
