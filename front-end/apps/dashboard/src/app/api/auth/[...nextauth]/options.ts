import type {
  User,
  UserObject,
  BackendJWT,
  BackendAccessJWT,
  DecodedJWT,
  NextAuthOptions,
  AuthValidity,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import { login, logout, refresh } from "../../../actions/auth";
import { jwtDecode } from "jwt-decode";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(nextAuthJWT: JWT): Promise<JWT> {
  try {
    // Get a new access token from backend using the refresh token
    const response = await refresh(nextAuthJWT.data.tokens.refresh);

    const data = await response.json();
    const authData: BackendAccessJWT = data;

    if (!response.ok) throw authData;
    const { exp }: DecodedJWT = jwtDecode(authData.access);

    // Update the token and validity in the next-auth object
    nextAuthJWT.data.validity.valid_until = exp;
    nextAuthJWT.data.tokens.access = authData.access;

    return { ...nextAuthJWT };
  } catch (error) {
    console.debug(error);
    return {
      ...nextAuthJWT,
      error: "RefreshAccessTokenError",
    };
  }
}

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Login",
      credentials: {
        username: {
          label: "Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
        persist: {
          label: "Persist",
          type: "hidden",
        },
        source: {
          label: "Source",
          type: "hidden",
        },
        token: {
          label: "Token",
          type: "hidden",
        },
      },
      async authorize(credentials, req) {
        try {
          const response = await login(
            credentials?.username || "",
            credentials?.password || "",
            Boolean(credentials?.persist) || false,
            credentials?.source || "v3",
            credentials?.token || ""
          );

          const data = await response.json();
          const tokens: BackendJWT = data;

          if (!response.ok) throw response;

          const access: DecodedJWT = jwtDecode(tokens.access);
          const refresh: DecodedJWT = jwtDecode(tokens.refresh);

          // Extract the user from the access token
          const user: UserObject = {
            id: access.id,
            sub: access.sub,
            image: access.image,
            roles: access.roles,
          };

          // Extract the auth validity from the tokens
          const validity: AuthValidity = {
            valid_until: access.exp,
            refresh_until: refresh.exp,
          };

          // Return the object that next-auth calls 'User' (which we've defined in next-auth.d.ts)
          return {
            id: user.id,
            tokens,
            user,
            validity,
          } as User;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Reset error
      token.error = undefined;

      // Initial signin contains a 'User' object from authorize method
      if (user && account) {
        console.debug("Initial signin");
        return { data: user };
      }

      // The current access token is still valid
      if (Date.now() < token.data.validity.valid_until * 1000) {
        console.debug("Access token is still valid");
        return token;
      }

      // The current access token has expired, but the refresh token is still valid
      if (Date.now() < token.data.validity.refresh_until * 1000) {
        console.debug("Access token is being refreshed");
        return await refreshAccessToken(token);
      }

      // The current access token and refresh token have both expired
      // This should not really happen unless you get really unlucky with
      // the timing of the token expiration because the middleware should
      // have caught this case before the callback is called
      console.debug("Both tokens have expired");
      return { ...token, error: "RefreshTokenExpired" } as JWT;
    },
    async session({ session, token, user }) {
      session.user = token.data.user;
      session.validity = token.data.validity;
      session.error = token.error;
      session.access = token.data.tokens.access;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      try {
        await logout(token?.refresh as string);
      } catch (e) {
        console.error(e);
      }
    },
  },
};
