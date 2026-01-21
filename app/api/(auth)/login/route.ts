import { generateToken } from "@/lib/auth";
import connectDB from "@/lib/neo4j";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request:NextRequest) {     

    const session = connectDB();

    // if(!session){
    //     return Response.json()
    // }
    const {email, password} = await request.json();

    try{

        const result = await session.run(
            `MATCH (user:User {email:$email}) RETURN user.password AS hashedPassword`
            ,{email,password}
        )

        const hashedPassword = result.records[0].get('hashedPassword');

        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
            console.log("step 3") 

        if(!isPasswordValid){
           return NextResponse.json({
                message:"Invalid Credentials",
                success:false
            },{status:401});
        }


        const token = generateToken(email);
            console.log("step 5") 
       const response = NextResponse.json({
        message:"Logged In successfully",
        success:true
       },{status:200})

       response.cookies.set('token',token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60*60*24*7,
        path:'/'
       })

       return response;

           

    }catch(error){
        
         return NextResponse.json({
        message: "Internal server error"
        },{status:500});

    }finally{
        await session.close()
    }
    
}