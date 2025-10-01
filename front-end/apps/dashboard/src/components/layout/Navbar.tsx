// app/components/NavBar.tsx (Client)
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center gap-4 p-4 border-b">
      <a href="/">Home</a>
      <div className="ml-auto flex items-center gap-3">
        {status === "loading" ? (
          <span>…</span>
        ) : session?.user ? (
          <>
            <span>Hello, {session.user.sub ?? "Test"}</span>
            <button
              onClick={() => signOut()}
              className="px-3 py-1 rounded border"
            >
              Sign out
            </button>
          </>
        ) : (
          <button onClick={() => signIn()} className="px-3 py-1 rounded border">
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
