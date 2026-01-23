import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/neo4j";
import { NextRequest, NextResponse } from "next/server";

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

    const body = await request.json();
    const { canvasId, isPublic } = body;

    if (!canvasId || typeof isPublic !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Canvas ID and visibility are required" },
        { status: 400 },
      );
    }

    // Update canvas visibility - only if user owns it
    const result = await session.run(
      `MATCH (user:User {email: $email})-[:OWNS]->(canvas:Canvas {canvasId: $canvasId})
       SET canvas.isPublic = $isPublic,
           canvas.updatedAt = $updatedAt
       RETURN canvas`,
      {
        email,
        canvasId,
        isPublic,
        updatedAt: new Date().toISOString(),
      },
    );

    if (result.records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Canvas not found or you don't have permission",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Visibility updated successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Canvas visibility error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
