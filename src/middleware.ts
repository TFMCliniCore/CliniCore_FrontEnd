import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RUTAS_PUBLICAS = ['/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const esPublica = RUTAS_PUBLICAS.some((r) => pathname.startsWith(r));

  // Si no hay token y quiere entrar a una ruta privada -> enviar a /login
  if (!token && !esPublica) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si ya tiene token e intenta entrar al /login -> redirigir al dashboard
  if (token && esPublica) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};