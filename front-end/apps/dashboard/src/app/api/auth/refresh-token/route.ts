import { NextRequest, NextResponse } from "next/server";
import { refresh } from "../../../actions/auth";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get refresh token
    const token = await getToken({ req: request as any });
    const refreshToken = token?.data.tokens.refresh;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 401 }
      );
    }

    const response = await refresh(refreshToken);

    const nextResponse = new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
    return nextResponse;
  } catch (error) {
    console.error("Refresh API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
