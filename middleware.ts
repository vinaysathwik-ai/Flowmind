import { type NextRequest, NextResponse } from 'next/server';

// In mock/development mode (no Supabase keys), allow all routes through.
// Replace this with real Supabase session middleware once API keys are configured.
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, allow all routes (mock mode)
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    return NextResponse.next();
  }

  // Real Supabase auth flow
  try {
    const { updateSession } = await import('@/lib/supabase/middleware');
    return await updateSession(request);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
