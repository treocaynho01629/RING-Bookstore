"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function AuthTestComponent() {
  const { data: session, status } = useSession();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    persist: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      username: credentials.username,
      password: credentials.password,
      persist: credentials.persist,
      source: "v3",
      token: "",
      redirect: false,
    });
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
        <p>
          <strong>User:</strong> {session.user?.name}
        </p>
        <p>
          <strong>Valid Until:</strong>{" "}
          {new Date(session.valid_until * 1000).toLocaleString()}
        </p>
        <p>
          <strong>Access Token:</strong>{" "}
          {session.accessToken ? "Present" : "Missing"}
        </p>
        {session.error && (
          <p className="text-red-500">
            <strong>Error:</strong> {session.error}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="persist"
            checked={credentials.persist}
            onChange={(e) =>
              setCredentials({ ...credentials, persist: e.target.checked })
            }
            className="mr-2"
          />
          <label htmlFor="persist" className="text-sm">
            Remember me
          </label>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}
