import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check for session token in cookies
  const token = request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('__Secure-next-auth.session-token')?.value
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/')
  
  // If accessing protected route without token, redirect to signin
  if (!token && !isAuthPage) {
    const signinUrl = new URL('/auth/signin', request.url)
    signinUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signinUrl)
  }
  
  // If accessing auth page with token, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
