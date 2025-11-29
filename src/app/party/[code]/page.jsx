"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getParty, joinParty } from "@/services/partyApi";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setPartyId, playPause, setActiveSong } from "@/redux/features/playerSlice";
import toast from "react-hot-toast";

const PartyRoom = () => {
  const { code } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Note: playback control is handled in MusicPlayer component globally.
  // This component just displays the party info.

  useEffect(() => {
    const initParty = async () => {
      // Join party
      const userId = session?.user?.email || "anon-" + Math.random().toString(36).substr(2, 5);
      const userName = session?.user?.name || "Anonymous";
      
      const res = await joinParty(code, userId, userName);
      if (res.success) {
        setParty(res.party);
        dispatch(setPartyId(code));
        
        // If party is playing something, sync immediately
        if (res.party.currentSong) {
            // Only if different song
            dispatch(setActiveSong({ song: res.party.currentSong, data: res.party.queue, i: 0 }));
            if (res.party.isPlaying) dispatch(playPause(true));
        }
      } else {
        toast.error("Failed to join party: " + res.message);
        router.push("/party");
      }
      setLoading(false);
    };

    if (code) initParty();

    return () => {
       // Optional: Leave party logic (remove setPartyId(null) if we want background play)
       // User said "music should be synced to all users... anyone can add any song from any page"
       // This implies party mode persists even if you leave the page.
       // So we DO NOT clear partyId on unmount.
    };
  }, [code, session]);

  // Poll for updates (UI only - the MusicPlayer handles playback sync)
  useEffect(() => {
    if (!party) return;
    
    const interval = setInterval(async () => {
        const res = await getParty(code);
        if (res.success) {
            setParty(res.party);
        }
    }, 3000); 
    
    return () => clearInterval(interval);
  }, [party, code]);

  if (loading) return <div className="text-white text-center mt-20">Joining Party...</div>;
  if (!party) return <div className="text-white text-center mt-20">Party not found</div>;

  return (
    <div className="text-white p-6 max-w-7xl mx-auto mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-6">
            <div>
                <h1 className="text-4xl font-bold mb-2">{party.name}</h1>
                <p className="text-gray-400">Code: <span className="text-cyan-400 font-mono text-xl select-all">{party.code}</span></p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Members ({party.members.length})</h3>
                <div className="flex flex-wrap gap-2">
                    {party.members.map((m, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-700 rounded-full text-sm flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${m.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            {m.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Now Playing</h2>
                {party.currentSong ? (
                    <div className="bg-white/5 p-6 rounded-xl flex items-center gap-6">
                         <img src={party.currentSong.image?.[2]?.url} alt={party.currentSong.name} className="w-40 h-40 rounded-lg shadow-lg" />
                         <div>
                             <h3 className="text-3xl font-bold mb-2">{party.currentSong.name}</h3>
                             <p className="text-xl text-gray-300">{party.currentSong.primaryArtists || party.currentSong.artists?.primary?.[0]?.name}</p>
                             <div className="mt-4 text-cyan-400 text-sm font-semibold">
                                 {party.isPlaying ? "Playing" : "Paused"} • Syncing with party...
                             </div>
                         </div>
                    </div>
                ) : (
                    <div className="bg-white/5 p-10 rounded-xl text-center text-gray-400">
                        No song playing. Add songs from search!
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Queue</h2>
                <div className="bg-white/5 rounded-xl p-4 min-h-[300px]">
                    {party.queue.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {party.queue.map((song, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                                    <img src={song.image?.[0]?.url} className="w-10 h-10 rounded" />
                                    <div className="overflow-hidden">
                                        <p className="truncate font-semibold">{song.name}</p>
                                        <p className="truncate text-xs text-gray-400">{song.primaryArtists}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center mt-10">Queue is empty</p>
                    )}
                </div>
            </div>
        </div>
        
        <div className="mt-8 bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg text-center text-blue-200">
            <p>ℹ️ <strong>Party Mode Active:</strong> Playback is synchronized with the party. You can browse the app and add songs to queue from anywhere.</p>
            <button onClick={() => { dispatch(setPartyId(null)); toast.success("Left party mode"); router.push('/'); }} className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded">Leave Party Mode</button>
        </div>
    </div>
  );
};

export default PartyRoom;

