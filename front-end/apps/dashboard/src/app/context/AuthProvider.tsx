"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export interface AuthContextProps {
  children: React.ReactNode;
  session: Session;
}

export default function AuthProvider({ children, session }: AuthContextProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={30 * 60}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
