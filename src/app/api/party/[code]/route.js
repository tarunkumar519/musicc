import { NextResponse } from "next/server";
import Party from "@/models/Party";
import dbConnect from "@/utils/dbconnect";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { code } = params;
    const party = await Party.findOne({ code });
    if (!party) return NextResponse.json({ success: false, message: "Party not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, party });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
    // Join party or Heartbeat
    try {
        await dbConnect();
        const { code } = params;
        const body = await req.json();
        const { userId, userName } = body;
        
        const party = await Party.findOne({ code });
        if (!party) return NextResponse.json({ success: false, message: "Party not found" }, { status: 404 });

        // Check if member exists
        const memberIndex = party.members.findIndex(m => m.userId === userId);
        if (memberIndex === -1) {
            party.members.push({ userId, name: userName, isOnline: true, lastSeen: Date.now() });
        } else {
            party.members[memberIndex].isOnline = true;
            party.members[memberIndex].lastSeen = Date.now();
        }
        
        await party.save();
        return NextResponse.json({ success: true, party });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

