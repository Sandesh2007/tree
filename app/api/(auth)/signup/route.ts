import connectDB from "@/lib/neo4j";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    const { name, email, password } = await request.json();

    // Basic Input Validation
    if (!email || !password || !name) {
        return NextResponse.json({
            message: "Missing required fields",
            success: false
        }, { status: 400 });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const session = connectDB();

    try {
        // Check if the email already exists using COUNT for optimization
        const result = await session.run(
            `
            MATCH (u:User { email: $email })
            RETURN COUNT(u) AS emailCount
            `,
            { email }
        );

        // If the email is already taken
        if (result.records[0].get("emailCount").toNumber() > 0) {
            return NextResponse.json({
                message: "Email already registered",
                success: false
            }, { status: 409 });
        }

        // Create the new user
        await session.run(
            `
            CREATE (user:User { name: $name, email: $email, password: $hashedPassword })
            RETURN user
            `,
            { name, email, hashedPassword }
        );

        return NextResponse.json({
            message: "User created successfully",
            success: true
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error during user creation:", error);
        return NextResponse.json({
            message: "Internal server error",
            success: false
        }, { status: 500 });
    } finally {
        // Ensure the session is always closed
        await session.close();
    }
}
