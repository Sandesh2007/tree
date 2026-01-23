import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/neo4j";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = connectDB();
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    const email = decoded?.email;

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    // Get canvas ID from query params
    const canvasId = request.nextUrl.searchParams.get("id");

    if (!canvasId) {
      return NextResponse.json(
        { success: false, message: "Canvas ID is required" },
        { status: 400 },
      );
    }

    // Check if canvas exists and user has access
    const result = await session.run(
      `MATCH (user:User {email: $email})
       OPTIONAL MATCH (user)-[:OWNS]->(canvas:Canvas {canvasId: $canvasId})
       RETURN canvas, user`,
      { email, canvasId },
    );

    if (result.records.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const canvas = result.records[0].get("canvas");

    if (!canvas) {
      // Canvas doesn't exist yet - return success with null canvas
      return NextResponse.json(
        { success: true, canvas: null },
        { status: 200 },
      );
    }

    // Canvas exists - return the data
    const canvasData = {
      canvasId: canvas.properties.canvasId,
      data: JSON.parse(canvas.properties.data || '{"nodes":[],"links":[]}'),
      isPublic: canvas.properties.isPublic || false,
      createdAt: canvas.properties.createdAt,
      updatedAt: canvas.properties.updatedAt,
    };

    return NextResponse.json(
      { success: true, canvas: canvasData },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Canvas GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = connectDB();
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    const email = decoded?.email;

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const user = await session.run(
      "MATCH (user:User {email:$email }) return user",
      { email },
    );

    const userWithoutPassword = {
      ...user.records[0].get("user"),
      properties: (({ ...rest }) => rest)(
        user.records[0].get("user").properties,
      ),
    };

    return NextResponse.json(
      { user: userWithoutPassword, success: true },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
