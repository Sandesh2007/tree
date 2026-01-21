import connectDB from "@/lib/neo4j";
import driver from "@/lib/neo4j";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";


export async function POST(request: NextRequest)
{
     const {name, email, password} = await request.json();
     const hashedPassword = await bcrypt.hash(password, 10);
    const session = connectDB();
    
    try{
       //checking if user with this email id already exist
        const existingEmail = await session.run(
            `
            MATCH (u:User { email: $email })
            RETURN u
            `,
            {email}
        );
        console.log("existing user :", existingEmail.records.length);
        if(existingEmail.records.length>0){
           
            return NextResponse.json({message:"Email already registered", success:false},
                {status:409}
            )
        }
        console.log("user already exist")

        await session.run(
            `CREATE (user:User {name: $name, email: $email, password: $hashedPassword}) RETURN user`
            ,{name,email, hashedPassword}
        );

        return NextResponse.json({message:"User created successfully" ,success:true},{status:200});
    }catch (error:any) {
     
         console.error(error);
        return NextResponse.json({
        message: "Internal server error"
        },{status:500});
  }
    finally{
        await session.close();
    }
}