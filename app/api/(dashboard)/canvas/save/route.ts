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
    const { canvasId, data, isPublic } = body;

    if (!canvasId || !data) {
      return NextResponse.json(
        { success: false, message: "Canvas ID and data are required" },
        { status: 400 },
      );
    }

    // Verify user exists
    const userResult = await session.run(
      "MATCH (user:User {email: $email}) RETURN user",
      { email },
    );

    if (userResult.records.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const now = new Date().toISOString();
    const dataString = JSON.stringify(data);

    // Check if canvas exists
    const canvasResult = await session.run(
      `MATCH (user:User {email: $email})
       OPTIONAL MATCH (user)-[:OWNS]->(canvas:Canvas {canvasId: $canvasId})
       RETURN canvas`,
      { email, canvasId },
    );

    if (
      canvasResult.records.length > 0 &&
      canvasResult.records[0].get("canvas")
    ) {
      // Update existing canvas
      await session.run(
        `MATCH (user:User {email: $email})-[:OWNS]->(canvas:Canvas {canvasId: $canvasId})
         SET canvas.data = $data,
             canvas.isPublic = $isPublic,
             canvas.updatedAt = $updatedAt
         RETURN canvas`,
        {
          email,
          canvasId,
          data: dataString,
          isPublic: isPublic || false,
          updatedAt: now,
        },
      );
    } else {
      // Create new canvas
      await session.run(
        `MATCH (user:User {email: $email})
         CREATE (canvas:Canvas {
           canvasId: $canvasId,
           name: $name,
           data: $data,
           isPublic: $isPublic,
           createdAt: $createdAt,
           updatedAt: $updatedAt
         })
         CREATE (user)-[:OWNS]->(canvas)
         RETURN canvas`,
        {
          email,
          canvasId,
          name: `Canvas ${canvasId}`,
          data: dataString,
          isPublic: isPublic || false,
          createdAt: now,
          updatedAt: now,
        },
      );
    }

    return NextResponse.json(
      { success: true, message: "Canvas saved successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Canvas save error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
