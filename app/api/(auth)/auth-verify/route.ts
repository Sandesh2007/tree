import { NextResponse } from "next/server";


export async function GET() {
    
    return NextResponse.json({
        message:"verified sucessfully",
        success: true
    },{status:200});
}