# NextAuth with Spring JWT Authentication Setup

This document describes how NextAuth is configured to work with Spring Boot JWT authentication.

## Overview

The authentication system uses:

- **Access Token**: Stored in NextAuth session, returned in response body
- **Refresh Token**: Stored in HTTP-only cookies, returned in Set-Cookie header
- **Automatic Token Refresh**: When access token expires, refresh token is used to get new access token

## Configuration Files

### 1. Auth Actions (`src/app/actions/auth.ts`)

- `login()`: Calls Spring Boot authentication endpoint
- `refresh()`: Calls Spring Boot refresh endpoint using refresh token from cookies
- Both functions return both response and parsed data

### 2. NextAuth Options (`src/app/api/auth/[...nextauth]/options.ts`)

- **Credentials Provider**: Handles username/password authentication
- **JWT Callback**: Manages token storage and automatic refresh
- **Session Callback**: Exposes access token and user data to client
- **Cookie Configuration**: Secure HTTP-only cookies for refresh tokens

### 3. API Routes

- `/api/auth/authenticate`: Forwards login request to Spring Boot
- `/api/auth/refresh`: Forwards refresh request to Spring Boot
- `/api/auth/logout`: Clears refresh token cookie

### 4. Type Definitions (`next-auth.d.ts`)

- Extended NextAuth types to include access token and custom user data
- Proper TypeScript support for the authentication flow

## Authentication Flow

1. **Login**:
   - User submits credentials
   - NextAuth calls Spring Boot `/api/auth/authenticate`
   - Spring Boot returns access token in body, refresh token in Set-Cookie header
   - NextAuth stores access token in JWT session
   - Refresh token is automatically stored in HTTP-only cookie

2. **Token Refresh**:
   - When access token expires, NextAuth automatically calls refresh
   - Uses refresh token from cookie to get new access token
   - Updates session with new access token
   - If refresh fails, user is logged out

3. **Session Management**:
   - Access token is available in `session.accessToken`
   - User data is available in `session.user`
   - Token expiration is available in `session.valid_until`

## Usage

### Using the Session

```tsx
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {session.user?.name}!</p>
      <p>Access Token: {session.accessToken}</p>
      <p>
        Valid Until: {new Date(session.valid_until * 1000).toLocaleString()}
      </p>
    </div>
  );
}
```

### Making Authenticated Requests

```tsx
import { useSession } from "next-auth/react";

function ApiCall() {
  const { data: session } = useSession();

  const callApi = async () => {
    const response = await fetch("/api/protected", {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    // Handle response
  };
}
```

## Environment Variables

Required environment variables:

- `NEXTAUTH_SECRET`: Secret for NextAuth JWT signing
- `BACKEND_URL`: Spring Boot backend URL (default: http://localhost:8080)

## Security Features

- **HTTP-Only Cookies**: Refresh tokens are stored in secure HTTP-only cookies
- **Automatic Refresh**: Access tokens are automatically refreshed before expiration
- **Secure Cookies**: Cookies are secure in production
- **SameSite Protection**: Prevents CSRF attacks
- **Token Validation**: JWT tokens are validated and decoded properly

## Backend API Proxy

The system includes a proxy API that automatically handles authentication:

### API Route: `/api/backend/[...path]`

This route proxies all requests to your Spring Boot backend with automatic authentication:

- **URL Pattern**: `/api/backend/{any-path}`
- **Authentication**: Automatically uses access token from NextAuth session
- **Methods**: GET, POST, PUT, DELETE, PATCH
- **Error Handling**: Automatic token validation and error responses

### Usage Examples

```tsx
// Using the useBackendApi hook
import { useBackendApi } from "../hooks/useBackendApi";

function MyComponent() {
  const { get, post, put, delete: del } = useBackendApi();

  const fetchUsers = async () => {
    const result = await get("users");
    if (result.error) {
      console.error("Error:", result.error);
    } else {
      console.log("Users:", result.data);
    }
  };

  const createUser = async () => {
    const result = await post("users", {
      name: "John Doe",
      email: "john@example.com",
    });
    // Handle result...
  };
}
```

### Direct API Calls

```tsx
// Direct fetch calls to the proxy
const response = await fetch("/api/backend/users", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Error Handling

The proxy automatically handles:

- **401 Unauthorized**: When access token is missing or invalid
- **Token Expiration**: Checks if token is expired before making requests
- **Backend Errors**: Forwards backend error messages and status codes
- **Network Errors**: Handles connection issues gracefully

## Testing

Use the `AuthTestComponent` to test the authentication flow:

- Login with valid credentials
- Verify session data is populated
- Check that access token is available
- Test automatic token refresh
- Test logout functionality

Use the `ApiTestComponent` to test the backend API proxy:

- Test different HTTP methods (GET, POST, PUT, DELETE)
- Verify authentication is working
- Check error handling
- Test various endpoints
