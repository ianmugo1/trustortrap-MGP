export const PUBLIC_ROUTES = ["/", "/login", "/register"];

export function isPublicPathname(pathname) {
  return PUBLIC_ROUTES.includes(pathname);
}
