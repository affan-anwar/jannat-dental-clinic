import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: Context) {
  const apiUrl = process.env.API_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  const { id } = await context.params;
  if (!apiUrl) return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 });
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const response = await fetch(`${apiUrl}/appointments/${encodeURIComponent(id)}/cancel`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: 'Appointment service is unavailable' }, { status: 503 });
  }
}
