"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [persist, setPersist] = useState(true);
  const [source, setSource] = useState("v3");
  const [token, setToken] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await signIn("credentials", {
          username,
          password,
          persist,
          source,
          token,
          callbackUrl: "/dashboard",
        });
      }}
    >
      <input onChange={(e) => setUsername(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />
      <input type="checkbox" onChange={(e) => setPersist(e.target.checked)} />
      <button>Login</button>
    </form>
  );
}
