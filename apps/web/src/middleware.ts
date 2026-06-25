export { auth as middleware } from '../../auth'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
