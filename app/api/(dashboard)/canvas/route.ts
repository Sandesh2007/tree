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
    //console.log("decoded token:", decoded)
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

    //console.log("user ", user.records[0].get("user"));

    // const properties = {...user.records[0].get("user").properties}

    // delete properties.password;

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
  } catch (error: any) {
    console.error(error);
  } finally {
  }
}
