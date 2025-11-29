import { NextResponse } from "next/server";
import Party from "@/models/Party";
import dbConnect from "@/utils/dbconnect";

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { code } = params;
    const { song } = await req.json();
    
    const party = await Party.findOne({ code });
    if (!party) return NextResponse.json({ success: false, message: "Party not found" }, { status: 404 });
    
    // If no song playing, play immediately
    if (!party.currentSong) {
        party.currentSong = song;
        party.isPlaying = true;
        party.progress = 0;
        party.lastUpdated = Date.now();
    } else {
        party.queue.push(song);
    }
    
    await party.save();
    return NextResponse.json({ success: true, party });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

