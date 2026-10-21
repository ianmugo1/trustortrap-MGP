export const PUBLIC_ROUTES = ["/", "/login", "/register", "/privacy"];

export function isPublicPathname(pathname) {
  // The iOS build uses trailing slashes ("/login/"), so strip them first
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PUBLIC_ROUTES.includes(path);
}
