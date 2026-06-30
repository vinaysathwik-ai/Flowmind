import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // After password recovery redirect to settings/profile to set new password
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/settings`);
  }

  // For all other flows (OAuth, email confirm) redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
