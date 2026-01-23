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
      const data = JSON.parse(canvas.properties.data || '{"nodes":[],"links":[]}');

      return {
        canvasId: canvas.properties.canvasId,
        nodeCount: data.nodes?.length || 0,
        linkCount: data.links?.length || 0,
        isPublic: canvas.properties.isPublic || false,
        createdAt: canvas.properties.createdAt,
        updatedAt: canvas.properties.updatedAt,
      };
    });

    return NextResponse.json(
      { success: true, canvases },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Canvases fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
