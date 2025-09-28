import { NextRequest, NextResponse } from "next/server";
import { login } from "../../../actions/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await login(
      body.username,
      body.password,
      body.persist,
      body.source,
      body.token
    );

    const nextResponse = new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
    return nextResponse;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
