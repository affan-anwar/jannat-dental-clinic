
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const apiUrl = process.env.API_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  const { id } = await context.params;
  if (!apiUrl) return NextResponse.json({ message: 'API_URL is not configured' }, { status: 500 });
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const response = await fetch(`${apiUrl}/admin/doctors/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(await request.json()),
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: 'Doctor status service is unavailable' }, { status: 503 });
  }
}
