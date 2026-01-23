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

    if (!decoded || !email) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    // Fetch user's created nodes
    const userNodesResult = await session.run(
      `MATCH (user:User {email: $email})-[:CREATED]->(node:Person)
       OPTIONAL MATCH (node)-[r]-(connected)
       WITH node, count(DISTINCT r) as connections
       RETURN node, connections
       ORDER BY node.name`,
      { email },
    );

    const userNodes = userNodesResult.records.map((record) => {
      const node = record.get("node").properties;
      const connections = record.get("connections").toNumber();
      return {
        key: node.key || node.id,
        name: node.name,
        role: node.role,
        department: node.department || "",
        email: node.email || "",
        phone: node.phone || "",
        level: node.level || "member",
        connections: connections,
        createdAt: node.createdAt || new Date().toISOString(),
      };
    });

    // Fetch nodes the user is connected to (but didn't create)
    const connectedNodesResult = await session.run(
      `MATCH (user:User {email: $email})-[:CREATED]->(myNode:Person)
       MATCH (myNode)-[r]-(connectedNode:Person)
       WHERE NOT (user)-[:CREATED]->(connectedNode)
       WITH DISTINCT connectedNode, count(r) as connections
       RETURN connectedNode, connections
       ORDER BY connectedNode.name`,
      { email },
    );

    const connectedNodes = connectedNodesResult.records.map((record) => {
      const node = record.get("connectedNode").properties;
      const connections = record.get("connections").toNumber();
      return {
        key: node.key || node.id,
        name: node.name,
        role: node.role,
        department: node.department || "",
        email: node.email || "",
        phone: node.phone || "",
        level: node.level || "member",
        connections: connections,
      };
    });

    await session.close();

    return NextResponse.json(
      {
        success: true,
        data: {
          userNodes,
          connectedNodes,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}

// POST endpoint for creating new nodes
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
    const { name, role, department, email: nodeEmail, phone, level, parentKey, relationType } = body;

    // Validate required fields
    if (!name || !role || !level) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, role, level" },
        { status: 400 },
      );
    }

    // Generate unique key for the node
    const nodeKey = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create the new node
    const createNodeQuery = `
      MATCH (user:User {email: $userEmail})
      CREATE (node:Person {
        key: $key,
        name: $name,
        role: $role,
        department: $department,
        email: $nodeEmail,
        phone: $phone,
        level: $level,
        createdAt: datetime()
      })
      CREATE (user)-[:CREATED]->(node)
      RETURN node
    `;

    const createResult = await session.run(createNodeQuery, {
      userEmail: email,
      key: nodeKey,
      name,
      role,
      department: department || "",
      nodeEmail: nodeEmail || "",
      phone: phone || "",
      level,
    });

    const newNode = createResult.records[0].get("node").properties;

    // If parent key is provided, create relationship
    if (parentKey && relationType) {
      await session.run(
        `MATCH (parent:Person {key: $parentKey})
         MATCH (child:Person {key: $childKey})
         CREATE (parent)-[r:${relationType}]->(child)
         RETURN r`,
        { parentKey, childKey: nodeKey },
      );
    }

    await session.close();

    return NextResponse.json(
      {
        success: true,
        message: "Node created successfully",
        data: {
          key: newNode.key,
          name: newNode.name,
          role: newNode.role,
          department: newNode.department,
          email: newNode.email,
          level: newNode.level,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create node error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create node" },
      { status: 500 },
    );
  }
}

// PUT endpoint for updating nodes
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
    const { nodeKey, name, role, department, email: nodeEmail, phone, level } = body;

    if (!nodeKey) {
      return NextResponse.json(
        { success: false, message: "Node key is required" },
        { status: 400 },
      );
    }

    // Verify user owns this node
    const verifyOwnership = await session.run(
      `MATCH (user:User {email: $email})-[:CREATED]->(node:Person {key: $nodeKey})
       RETURN node`,
      { email, nodeKey },
    );

    if (verifyOwnership.records.length === 0) {
      return NextResponse.json(
        { success: false, message: "Node not found or unauthorized" },
        { status: 404 },
      );
    }

    // Update the node
    const updateResult = await session.run(
      `MATCH (node:Person {key: $nodeKey})
       SET node.name = $name,
           node.role = $role,
           node.department = $department,
           node.email = $nodeEmail,
           node.phone = $phone,
           node.level = $level,
           node.updatedAt = datetime()
       RETURN node`,
      {
        nodeKey,
        name,
        role,
        department: department || "",
        nodeEmail: nodeEmail || "",
        phone: phone || "",
        level,
      },
    );

    const updatedNode = updateResult.records[0].get("node").properties;

    await session.close();

    return NextResponse.json(
      {
        success: true,
        message: "Node updated successfully",
        data: updatedNode,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update node error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update node" },
      { status: 500 },
    );
  }
}

// DELETE endpoint for deleting nodes
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
    const nodeKey = searchParams.get("nodeKey");

    if (!nodeKey) {
      return NextResponse.json(
        { success: false, message: "Node key is required" },
        { status: 400 },
      );
    }

    // Verify user owns this node
    const verifyOwnership = await session.run(
      `MATCH (user:User {email: $email})-[:CREATED]->(node:Person {key: $nodeKey})
       RETURN node`,
      { email, nodeKey },
    );

    if (verifyOwnership.records.length === 0) {
      return NextResponse.json(
        { success: false, message: "Node not found or unauthorized" },
        { status: 404 },
      );
    }

    // Delete the node and all its relationships
    await session.run(
      `MATCH (node:Person {key: $nodeKey})
       DETACH DELETE node`,
      { nodeKey },
    );

    await session.close();

    return NextResponse.json(
      {
        success: true,
        message: "Node deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete node error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete node" },
      { status: 500 },
    );
  }
}
