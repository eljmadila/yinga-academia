import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/en/student/catalog?error=NoCode', request.url));
  }

  try {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://yinga-backend.onrender.com/api"
        : "http://localhost:8000/api");
    const res = await fetch(`${API_BASE}/auth/facebook/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code }),
    });

    if (!res.ok) {
      console.error("Backend Error:", await res.text());
      return NextResponse.redirect(new URL('/en/student/catalog?error=BackendFailed', request.url));
    }

    const data = await res.json();
    
    const response = NextResponse.redirect(new URL('/en/student/catalog', request.url));
    if (data.access) {
      response.cookies.set('access_token', data.access, { maxAge: 86400, path: '/' });
    }
    if (data.refresh) {
      response.cookies.set('refresh_token', data.refresh, { maxAge: 604800, path: '/' });
    }
    
    return response;
  } catch (err) {
    console.error("Network Error:", err);
    return NextResponse.redirect(new URL('/en/student/catalog?error=NetworkError', request.url));
  }
}
