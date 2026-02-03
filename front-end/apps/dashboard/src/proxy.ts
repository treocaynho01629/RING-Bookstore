import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { locales, defaultLocale } from "@ring/shared/enums/locales";
import { UserRole } from "@ring/shared/models/userRole";
import createMiddleware from "next-intl/middleware";

const publicRoutes = ["/login", "/unauthorized"];

const routePermissions: Record<string, UserRole[]> = {
  "/user": [UserRole.ROLE_ADMIN],
  "/auth": [UserRole.ROLE_ADMIN],
};

const defaultRoles: UserRole[] = [UserRole.ROLE_SELLER, UserRole.ROLE_ADMIN, UserRole.ROLE_GUEST];

const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: "as-needed",
});

// Helper function to get locale from pathname or default
const getLocaleFromPath = (path: string): string => {
  const localeMatch = path.match(/^\/(en|vi)(\/|$)/);
  return localeMatch ? localeMatch[1] : defaultLocale;
};

// Helper function to create login URL with locale
const getLoginUrl = (locale: string): string => {
  return locale === defaultLocale ? "/login" : `/${locale}/login`;
};

export default withAuth(
  async function proxy(req) {
    // Authentication middleware
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const baseUrl = req.nextUrl.origin;
    const pathname = req.nextUrl.pathname;

    // Check if the user's token is expired
    if (token && Date.now() >= token.data.validity.refresh_until * 1000) {
      const locale = getLocaleFromPath(pathname);
      const loginPath = getLoginUrl(locale);
      const response = NextResponse.redirect(new URL(loginPath, baseUrl));

      // Clear the session cookies
      response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
      response.cookies.set("next-auth.csrf-token", "", { maxAge: 0 });

      return response;
    }

    // Check if user is trying to access a protected route without authentication
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!token && !isPublicRoute) {
      const locale = getLocaleFromPath(pathname);
      const loginPath = getLoginUrl(locale);
      return NextResponse.redirect(new URL(loginPath, baseUrl));
    }

    // Role based access control
    const allowedRoles = routePermissions[pathname];
    const isAllowed = allowedRoles
      ? token?.data.user.roles?.some((r) => allowedRoles.includes(r as UserRole))
      : token?.data.user.roles?.some((r) => defaultRoles.includes(r as UserRole));

    if (token && !isAllowed && !isPublicRoute) {
      return NextResponse.redirect(new URL("/unauthorized", baseUrl));
    }

    // If auth is OK or it's a public route, let intlMiddleware handle locale routing
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: () => {
        // Always return true here - we handle all auth logic in the proxy function
        // This ensures our proxy function runs and can handle locale-aware redirects
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
