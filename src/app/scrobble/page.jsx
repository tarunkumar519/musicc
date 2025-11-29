"use client";
import React, { useState, useEffect } from "react";
import { getAuthUrl, getSession } from "@/services/scrobbleApi";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const Scrobble = () => {
  const [connected, setConnected] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const setup = searchParams.get("setup");

  useEffect(() => {
    // Check local storage for existing session
    const sk = localStorage.getItem("lastfm_session_key");
    if (sk) {
      setConnected(true);
    }

    // Handle token from redirect
    if (token && !sk) {
      const fetchSession = async () => {
        const data = await getSession(token);
        if (data?.session) {
          localStorage.setItem("lastfm_session_key", data.session.key);
          localStorage.setItem("lastfm_user", data.session.name);
          setConnected(true);
          toast.success("Connected to Last.fm as " + data.session.name);
          // Remove token from URL for clean look
          router.replace("/scrobble");
        } else {
          toast.error("Failed to connect to Last.fm");
        }
      };
      fetchSession();
    }
  }, [token, router]);

  const handleConnect = () => {
    window.location.href = getAuthUrl();
  };

  const handleDisconnect = () => {
      localStorage.removeItem("lastfm_session_key");
      localStorage.removeItem("lastfm_user");
      setConnected(false);
      toast.success("Disconnected from Last.fm");
  }

  return (
    <div className="w-11/12 mx-auto mt-32 min-h-screen text-white">
      {setup && <h1 className="text-5xl font-bold mb-4 text-[#00e6e6]">One last step...</h1>}
      <h1 className="text-4xl font-bold mb-8">Last.fm Scrobbling</h1>
      <div className="bg-white/5 p-8 rounded-lg max-w-lg">
        {setup && <p className="mb-4 text-yellow-400 font-semibold">You must set up Last.fm scrobbling to continue playing music.</p>}
        <p className="mb-6 text-lg">
          Connect your Last.fm account to automatically scrobble the music you listen to.
        </p>
        {!connected ? (
          <button
            onClick={handleConnect}
            className="bg-[#d51007] hover:bg-[#b00d06] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            Connect Last.fm
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-green-400 font-semibold text-xl">
                Connected to Last.fm
            </div>
            <p className="text-gray-300">
                Account: {typeof window !== 'undefined' ? localStorage.getItem("lastfm_user") : ""}
            </p>
            <button
                onClick={handleDisconnect}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded w-fit"
            >
                Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scrobble;
