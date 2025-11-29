import { NextResponse } from "next/server";
import Party from "@/models/Party";
import dbConnect from "@/utils/dbconnect";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, host, hostName } = await req.json();
    
    // Generate a simple 6 char code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const party = await Party.create({
      code,
      name,
      host,
      members: [{ userId: host, name: hostName, isOnline: true }],
    });

    return NextResponse.json({ success: true, party });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

