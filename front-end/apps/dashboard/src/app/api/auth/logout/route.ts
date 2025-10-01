import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { logout } from "../../../actions/auth";

export async function DELETE(request: NextRequest) {
  try {
    // Get access token from session
    const token = await getToken({ req: request });
    const refreshToken = token?.data.tokens.refresh;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 401 }
      );
    }

    const response = await logout(refreshToken);
    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
