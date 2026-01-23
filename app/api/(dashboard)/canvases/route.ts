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

    // Fetch all canvases owned by the user
    const result = await session.run(
      `MATCH (user:User {email: $email})-[:OWNS]->(canvas:Canvas)
       RETURN canvas
       ORDER BY canvas.updatedAt DESC`,
      { email },
    );

    const canvases = result.records.map((record) => {
      const canvas = record.get("canvas");
      const data = JSON.parse(
        canvas.properties.data || '{"nodes":[],"links":[]}',
      );

      return {
        canvasId: canvas.properties.canvasId,
        name: canvas.properties.name || null,
        nodeCount: data.nodes?.length || 0,
        linkCount: data.links?.length || 0,
        isPublic: canvas.properties.isPublic || false,
        createdAt: canvas.properties.createdAt,
        updatedAt: canvas.properties.updatedAt,
      };
    });

    return NextResponse.json({ success: true, canvases }, { status: 200 });
  } catch (error: unknown) {
    console.error("Canvases fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update canvas (rename)
export async function PUT(request: NextRequest) {
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

    if (!decoded || !email) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { canvasId, name } = body;

    if (!canvasId) {
      return NextResponse.json(
        { success: false, message: "Canvas ID is required" },
        { status: 400 },
      );
    }

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Canvas name is required" },
        { status: 400 },
      );
    }

    // Verify ownership and update
    const result = await session.run(
      `MATCH (user:User {email: $email})-[:OWNS]->(canvas:Canvas {canvasId: $canvasId})
       SET canvas.name = $name, canvas.updatedAt = datetime().epochMillis
       RETURN canvas`,
      { email, canvasId, name: name.trim() },
    );

    if (result.records.length === 0) {
      await session.close();
      return NextResponse.json(
        { success: false, message: "Canvas not found or unauthorized" },
        { status: 404 },
      );
    }

    await session.close();

    return NextResponse.json(
      {
        success: true,
        message: "Canvas renamed successfully",
        data: {
          canvasId,
          name: name.trim(),
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Canvas rename error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to rename canvas" },
      { status: 500 },
    );
  }
}

// DELETE - Delete canvas
export async function DELETE(request: NextRequest) {
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

    if (!decoded || !email) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const canvasId = searchParams.get("canvasId");

    if (!canvasId) {
      return NextResponse.json(
        { success: false, message: "Canvas ID is required" },
        { status: 400 },
      );
    }

    // Verify ownership and delete
    const result = await session.run(
      `MATCH (user:User {email: $email})-[:OWNS]->(canvas:Canvas {canvasId: $canvasId})
       DETACH DELETE canvas
       RETURN count(canvas) as deleted`,
      { email, canvasId },
    );

    const deleted = result.records[0]?.get("deleted").toNumber();

    if (deleted === 0) {
      await session.close();
      return NextResponse.json(
        { success: false, message: "Canvas not found or unauthorized" },
        { status: 404 },
      );
    }

    await session.close();

    return NextResponse.json(
      {
        success: true,
        message: "Canvas deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Canvas delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete canvas" },
      { status: 500 },
    );
  }
}
