import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function requestBackend(method: 'GET' | 'POST', payload?: unknown) {
  const apiUrl = process.env.API_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!apiUrl) return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 });
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const response = await fetch(`${apiUrl}/appointments`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(payload ? { 'Content-Type': 'application/json' } : {}) },
      body: payload ? JSON.stringify(payload) : undefined,
      cache: 'no-store',
    });
    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: 'Appointment service is unavailable' }, { status: 503 });
  }
}

export async function GET() { return requestBackend('GET'); }
export async function POST(request: Request) { return requestBackend('POST', await request.json()); }
