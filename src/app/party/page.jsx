"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createParty } from "@/services/partyApi";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const PartyPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [partyName, setPartyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!partyName) return toast.error("Enter party name");
    
    setLoading(true);
    const hostName = session?.user?.name || "Anonymous";
    const host = session?.user?.email || "anonymous-" + Math.random().toString(36).substr(2, 5);
    
    const res = await createParty(partyName, host, hostName);
    if (res.success) {
      router.push(`/party/${res.party.code}`);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinCode) return toast.error("Enter party code");
    router.push(`/party/${joinCode}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
      <h1 className="text-4xl font-bold mb-10">Watch Party</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl px-4">
        {/* Create Party */}
        <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-4">Create a Party</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Party Name"
              className="p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-cyan-500"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
            />
            <button
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Party"}
            </button>
          </form>
        </div>

        {/* Join Party */}
        <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-4">Join a Party</h2>
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Party Code"
              className="p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-cyan-500"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-colors"
            >
              Join Party
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartyPage;

