import { NextResponse } from "next/server";
import Party from "@/models/Party";
import dbConnect from "@/utils/dbconnect";

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { code } = params;
    const { action, song, isPlaying, progress } = await req.json();
    
    const party = await Party.findOne({ code });
    if (!party) return NextResponse.json({ success: false, message: "Party not found" }, { status: 404 });
    
    if (action === "SET_SONG") {
        party.currentSong = song;
        party.isPlaying = true;
        party.progress = 0;
        party.lastUpdated = Date.now();
    } else if (action === "PLAY_PAUSE") {
        party.isPlaying = isPlaying;
        // If pausing, save progress. If playing, set progress to what was passed (or 0 if new)
        // Ideally progress should be passed from the client triggering the action
        if (progress !== undefined) {
             party.progress = progress;
        }
        party.lastUpdated = Date.now();
    } else if (action === "SEEK") {
        party.progress = progress;
        party.lastUpdated = Date.now();
    } else if (action === "NEXT") {
        // Pop from queue
        if (party.queue.length > 0) {
            party.currentSong = party.queue.shift();
            party.isPlaying = true;
            party.progress = 0;
            party.lastUpdated = Date.now();
        } else {
             party.isPlaying = false;
             // Keep current song but paused? Or null?
             // Usually keep last song paused at end or something.
             // Let's set currentSong to null if queue empty
             // party.currentSong = null; 
        }
    }

    await party.save();
    return NextResponse.json({ success: true, party });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

