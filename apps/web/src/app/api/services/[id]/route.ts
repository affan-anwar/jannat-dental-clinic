
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function proxy(method: 'PATCH' | 'DELETE', id: string, payload?: unknown) {
  const apiUrl = process.env.API_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!apiUrl) return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 });
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const response = await fetch(`${apiUrl}/services/${id}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(payload ? { 'Content-Type': 'application/json' } : {}) },
      body: payload ? JSON.stringify(payload) : undefined,
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: 'Service update is unavailable' }, { status: 503 });
  }
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxy('PATCH', id, await request.json());
}
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxy('DELETE', id);
}
