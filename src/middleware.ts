// import { NextRequest, NextResponse } from 'next/server';

// const RUTAS_PUBLICAS = ['/login'];

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('token')?.value;
//   const { pathname } = request.nextUrl;

//   const esPublica = RUTAS_PUBLICAS.some(r => pathname.startsWith(r));

//   // Sin token en ruta protegida → login
//   if (!token && !esPublica) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // Con token intentando ir al login → dashboard
//   if (token && esPublica) {
//     return NextResponse.redirect(new URL('/', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
// };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};