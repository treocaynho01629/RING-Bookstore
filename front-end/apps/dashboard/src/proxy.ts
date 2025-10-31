import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { locales, defaultLocale } from "@ring/i18n/locales";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: "as-needed",
});

export default withAuth(
  async function proxy(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const baseUrl = req.nextUrl.origin;

    // Check if the user is authenticated
    if (token && Date.now() >= token.data.validity.refresh_until * 1000) {
      // Redirect to the login page
      const response = NextResponse.redirect(`${baseUrl}/api/auth/signin`);

      // Clear the session cookies
      response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
      response.cookies.set("next-auth.csrf-token", "", { maxAge: 0 });

      return response;
    }

    // If authenticated, continue with the request
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // You can add custom logic here, for example, check roles
        return !!token; // if token exists, the user is authenticated
      },
    },
  }
);

export const config = {
  matcher: ["/", "/(en|vi)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
