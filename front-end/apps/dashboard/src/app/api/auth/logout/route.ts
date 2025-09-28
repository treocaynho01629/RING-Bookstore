import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function DELETE(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // Call Spring Boot logout endpoint
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "DELETE",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    // Clear the refresh token cookie
    const response = NextResponse.json({ message: "Logout successful" });
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
