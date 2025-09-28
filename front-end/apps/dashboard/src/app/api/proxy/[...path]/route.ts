import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

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

// Helper function to handle backend errors
function handleBackendError(response: Response, errorText: string) {
  console.error(`Backend error ${response.status}:`, errorText);
  return NextResponse.json(
    {
      error: "Backend request failed",
      details: errorText,
      status: response.status,
    },
    { status: response.status }
  );
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Get access token from session
    const token = await getToken({ req: request });
    const accessToken = token?.data.tokens.access;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    // Get session to check token expiration
    const valid_until = token?.data?.validity.valid_until;
    if (isTokenExpired(valid_until)) {
      return NextResponse.json(
        { error: "Access token expired" },
        { status: 401 }
      );
    }

    // Build target URL
    const path = pathSegments.join("/");
    const targetUrl = `${BACKEND_URL}/api/${path}`;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    // Copy relevant headers from the original request
    const headersToCopy = [
      "accept",
      "accept-language",
      "user-agent",
      "x-forwarded-for",
      "x-real-ip",
    ];

    headersToCopy.forEach((headerName) => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers[headerName] = headerValue;
      }
    });

    // Get request body for methods that support it
    let body: string | undefined;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        body = await request.text();
      } catch (error) {
        console.warn("Failed to read request body:", error);
      }
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
      const errorText = await response.text();
      return handleBackendError(response, errorText);
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
      return NextResponse.json(
        { error: "Failed to parse backend response" },
        { status: 500 }
      );
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
    return NextResponse.json(
      { error: "Internal server error", details: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Export handlers for all HTTP methods
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = await params;
  return proxyRequest(request, path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = await params;
  return proxyRequest(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = await params;
  return proxyRequest(request, path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = await params;
  return proxyRequest(request, path, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = await params;
  return proxyRequest(request, path, "PATCH");
}
