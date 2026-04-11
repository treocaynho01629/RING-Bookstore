import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/lib/authOptions";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to check if token is expired
function isTokenExpired(validUntil: number): boolean {
  return Date.now() >= validUntil * 1000;
}

// Helper function to handle authentication errors
function handleAuthError(error: any) {
  console.error("Authentication error:", error);
  return NextResponse.json(
    {
      error: "Authentication failed",
      details: "Please log in again",
    },
    { status: 401 }
  );
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  try {
    // Get access token from session so it auto refresh
    const session = await getServerSession(options);
    const accessToken = session?.access;
    const valid_until = session?.validity.valid_until;

    // Error handling
    if (!accessToken) {
      return NextResponse.json({ error: "No access token found" }, { status: 403 });
    } else if (isTokenExpired(valid_until ?? 0)) {
      return NextResponse.json({ error: "Access token expired" }, { status: 403 });
    } else if (session?.error === "RefreshTokenExpired") {
      return NextResponse.json({ error: "Refresh token expired" }, { status: 403 });
    } else if (session?.error === "RefreshAccessTokenError") {
      return NextResponse.json({ error: "Refresh access token error" }, { status: 403 });
    }

    // Build target URL
    const path = pathSegments.join("/");
    const targetUrl = `${API_URL}/api/${path}`;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;
    const incomingContentType = request.headers.get("content-type");

    // Prepare headers
    const headers: HeadersInit = {
      // "Accept-Language": request.nextUrl.locale ?? defaultLocale,
      "Authorization": `Bearer ${accessToken}`,
    };

    const locale = request.cookies.get("NEXT_LOCALE")?.value;
    if (locale) headers["Accept-Language"] = locale;

    // Copy relevant headers from the original request
    const headersToCopy = ["Accept", "User-Agent", "X-Forwarded-For", "X-Real-IP"];

    headersToCopy.forEach((headerName) => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers[headerName] = headerValue;
      }
    });

    // Get request body for methods that support it
    let body: BodyInit | undefined;
    let proxiedContentType: string | null = null;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        // Pass request body through as raw bytes to avoid multipart parsing/rebuild
        // issues in the proxy layer.
        const buffer = await request.arrayBuffer();
        body = buffer.byteLength > 0 ? buffer : undefined;
        proxiedContentType = incomingContentType ?? "application/json";
      } catch (error) {
        console.warn("Failed to read request body:", error);
      }
    }
    if (proxiedContentType) {
      headers["Content-Type"] = proxiedContentType;
    }

    // Make the proxied request
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    // Handle authentication errors
    if (response.status === 401) {
      return handleAuthError("Token invalid or expired");
    }

    // Handle other errors
    if (!response.ok) {
      const errorResponse = await response.json();
      const nextResponse = NextResponse.json(errorResponse, {
        status: response.status,
      });
      return nextResponse;
    }

    // Get response data
    const contentType = response.headers.get("content-type");
    let responseData;

    try {
      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (error) {
      console.error("Failed to parse response:", error);
      return NextResponse.json({ error: "Failed to parse backend response" }, { status: 500 });
    }

    // Create response
    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
    });

    // Copy relevant headers
    const headersToForward = [
      "content-type",
      "cache-control",
      "expires",
      "last-modified",
      "etag",
      "content-disposition",
    ];

    headersToForward.forEach((headerName) => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        nextResponse.headers.set(headerName, headerValue);
      }
    });

    return nextResponse;
  } catch (error) {
    console.error("Proxy request error:", error);
    return NextResponse.json({ error: "Internal server error", details: "Failed to process request" }, { status: 500 });
  }
}

// Export handlers for all HTTP methods
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path, "GET");
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path, "POST");
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path, "PUT");
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path, "DELETE");
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path, "PATCH");
}
