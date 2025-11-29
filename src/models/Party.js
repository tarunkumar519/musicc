import mongoose from "mongoose";

const partySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  host: { type: String, required: true }, // User ID or Name
  members: [{ 
    userId: String,
    name: String,
    socketId: String, // If we were using sockets, but here maybe just to track
    isOnline: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now }
  }],
  currentSong: { type: Object, default: null }, // Full song object
  isPlaying: { type: Boolean, default: false },
  progress: { type: Number, default: 0 }, // Progress in seconds at lastUpdated
  lastUpdated: { type: Number, default: () => Date.now() }, // Timestamp of last status change
  queue: [{ type: Object }], // Array of song objects
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24h
});

export default mongoose.models.Party || mongoose.model("Party", partySchema);

