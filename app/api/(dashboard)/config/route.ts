import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/neo4j";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch user's custom configurations
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

    if (!decoded || !email) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    // Fetch user's custom levels
    const levelsResult = await session.run(
      `MATCH (user:User {email: $email})-[:CREATED]->(level:CustomLevel)
       RETURN level
       ORDER BY level.createdAt DESC`,
      { email },
    );

    const customLevels = levelsResult.records.map((record) => {
      const level = record.get("level").properties;
      return {
        id: level.id,
        value: level.value,
        label: level.label,
        color: level.color,
        bgColor: level.bgColor,
        borderColor: level.borderColor,
        createdBy: level.createdBy,
        createdAt: level.createdAt,
      };
    });

    // Fetch user's custom relations
    const relationsResult = await session.run(
      `MATCH (user:User {email: $email})-[:CREATED]->(relation:CustomRelation)
       RETURN relation
       ORDER BY relation.createdAt DESC`,
      { email },
    );

    const customRelations = relationsResult.records.map((record) => {
      const relation = record.get("relation").properties;
      return {
        id: relation.id,
        value: relation.value,
        label: relation.label,
        color: relation.color,
        dashed: relation.dashed,
        createdBy: relation.createdBy,
        createdAt: relation.createdAt,
      };
    });

    await session.close();

    return NextResponse.json(
      {
        success: true,
        data: {
          customLevels,
          customRelations,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Config fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch configurations" },
      { status: 500 },
    );
  }
}

// POST - Create new custom level or relation
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

    if (!decoded || !email) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: type, data" },
        { status: 400 },
      );
    }

    if (type === "level") {
      // Create custom level
      const { value, label, color, bgColor, borderColor } = data;

      if (!value || !label || !color || !bgColor || !borderColor) {
        return NextResponse.json(
          { success: false, message: "Missing required level fields" },
          { status: 400 },
        );
      }

      const levelId = `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const createLevelQuery = `
        MATCH (user:User {email: $email})
        CREATE (level:CustomLevel {
          id: $id,
          value: $value,
          label: $label,
          color: $color,
          bgColor: $bgColor,
          borderColor: $borderColor,
          createdBy: $email,
          createdAt: datetime().epochMillis
        })
        CREATE (user)-[:CREATED]->(level)
        RETURN level
      `;

      const result = await session.run(createLevelQuery, {
        email,
        id: levelId,
        value,
        label,
        color,
        bgColor,
        borderColor,
      });

      const newLevel = result.records[0].get("level").properties;

      await session.close();

      return NextResponse.json(
        {
          success: true,
          message: "Custom level created successfully",
          data: {
            id: newLevel.id,
            value: newLevel.value,
            label: newLevel.label,
            color: newLevel.color,
            bgColor: newLevel.bgColor,
            borderColor: newLevel.borderColor,
          },
        },
        { status: 201 },
      );
    } else if (type === "relation") {
      // Create custom relation
      const { value, label, color, dashed } = data;

      if (!value || !label || !color || dashed === undefined) {
        return NextResponse.json(
          { success: false, message: "Missing required relation fields" },
          { status: 400 },
        );
      }

      const relationId = `relation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const createRelationQuery = `
        MATCH (user:User {email: $email})
        CREATE (relation:CustomRelation {
          id: $id,
          value: $value,
          label: $label,
          color: $color,
          dashed: $dashed,
          createdBy: $email,
          createdAt: datetime().epochMillis
        })
        CREATE (user)-[:CREATED]->(relation)
        RETURN relation
      `;

      const result = await session.run(createRelationQuery, {
        email,
        id: relationId,
        value,
        label,
        color,
        dashed,
      });

      const newRelation = result.records[0].get("relation").properties;

      await session.close();

      return NextResponse.json(
        {
          success: true,
          message: "Custom relation created successfully",
          data: {
            id: newRelation.id,
            value: newRelation.value,
            label: newRelation.label,
            color: newRelation.color,
            dashed: newRelation.dashed,
          },
        },
        { status: 201 },
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid type. Must be 'level' or 'relation'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Create config error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create configuration" },
      { status: 500 },
    );
  }
}

// DELETE - Remove custom level or relation
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
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: type, id" },
        { status: 400 },
      );
    }

    if (type === "level") {
      // Verify ownership and delete
      const result = await session.run(
        `MATCH (user:User {email: $email})-[:CREATED]->(level:CustomLevel {id: $id})
         DETACH DELETE level
         RETURN count(level) as deleted`,
        { email, id },
      );

      const deleted = result.records[0]?.get("deleted").toNumber();

      if (deleted === 0) {
        return NextResponse.json(
          { success: false, message: "Level not found or unauthorized" },
          { status: 404 },
        );
      }

      await session.close();

      return NextResponse.json(
        { success: true, message: "Custom level deleted successfully" },
        { status: 200 },
      );
    } else if (type === "relation") {
      // Verify ownership and delete
      const result = await session.run(
        `MATCH (user:User {email: $email})-[:CREATED]->(relation:CustomRelation {id: $id})
         DETACH DELETE relation
         RETURN count(relation) as deleted`,
        { email, id },
      );

      const deleted = result.records[0]?.get("deleted").toNumber();

      if (deleted === 0) {
        return NextResponse.json(
          { success: false, message: "Relation not found or unauthorized" },
          { status: 404 },
        );
      }

      await session.close();

      return NextResponse.json(
        { success: true, message: "Custom relation deleted successfully" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid type. Must be 'level' or 'relation'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Delete config error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete configuration" },
      { status: 500 },
    );
  }
}
