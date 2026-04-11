import { BackendAccessJWT, BackendJWT } from "next-auth";

var setCookie = require("set-cookie-parser");

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(
  username: string,
  pass: string,
  persist: boolean,
  source: string,
  token: string
): Promise<Response> {
  const body = { username, pass, persist };

  const response = await fetch(`${API_URL}/api/auth/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "response": token,
      source,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error("Login failed");
    return response;
  }

  const data = await response.json();
  const accessToken = data.token;

  // Get refresh token from Spring Boot response headers
  const cookieString = response.headers.get("set-cookie");
  let refreshToken = "";

  // Forward the refresh token cookie from Spring Boot
  if (cookieString) {
    const cookieObject = setCookie.parse(setCookie.splitCookiesString(cookieString), {
      map: true,
    });
    const refreshCookie = cookieObject["refreshToken"];
    refreshToken = refreshCookie.value;
  }

  const responseBody: BackendJWT = {
    access: accessToken,
    refresh: refreshToken,
  };

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    statusText: "OK",
    headers: {
      "Content-type": "application/json",
    },
  });
}

export async function refresh(token: string): Promise<Response> {
  const response = await fetch(`${API_URL}/api/auth/refresh-token?refreshToken=${token}`, {
    method: "GET",
  });

  if (!response.ok) {
    console.error("Refresh token failed");
    return response;
  }

  const data = await response.json();
  const accessToken = data.token;

  const responseBody: BackendAccessJWT = {
    access: accessToken,
  };

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    statusText: "OK",
    headers: {
      "Content-type": "application/json",
    },
  });
}

export async function logout(token: string): Promise<Response> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
}
