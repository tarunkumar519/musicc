import React, { useEffect, useState } from "react";
import {
  BsFillVolumeUpFill,
  BsVolumeDownFill,
  BsFillVolumeMuteFill,
} from "react-icons/bs";
import { BiAddToQueue } from "react-icons/bi";
import { addSongToPlaylist, getUserPlaylists } from "@/services/playlistApi";
import { toast } from "react-hot-toast";
import PlaylistModal from "../Sidebar/PlaylistModal";
import { FaPlus } from "react-icons/fa";

const VolumeBar = ({
  value,
  min,
  max,
  onChange,
  setVolume,
  activeSong,
  bgColor,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getPlaylists = async () => {
    const res = await getUserPlaylists();
    if (res?.success == true) {
      setPlaylists(res?.data?.playlists);
    }
  };

  useEffect(() => {
    if (showMenu) {
        getPlaylists();
    }
  }, [showMenu, showCreateModal]);

  // add song to playlist
  const handleAddToPlaylist = async (song, playlistID) => {
    setShowMenu(false);
    const res = await addSongToPlaylist(playlistID, song);
    if (res?.success == true) {
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
  };
  return (
    <>
      <div className="hidden lg:flex flex-1 items-center justify-end">
        <div className=" relative">
          <BiAddToQueue
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="Add to Playlist"
            size={25}
            color={"white"}
            className={`${!true ? "hidden sm:block" : " m-3"} cursor-pointer`}
          />
          {showMenu && (
            <div
              onClick={() => {
                setShowMenu(false);
              }}
              className="absolute text-white bottom-[130%] right-0 backdrop-blur-lg rounded-lg p-3 w-40 flex flex-col gap-2 z-[100]"
              style={{
                backgroundColor: bgColor
                  ? `rgba(${bgColor.red}, ${bgColor.green}, ${bgColor.blue}, 0.3)`
                  : "rgba(0,0,0,0.8)",
                backdropFilter: "blur(20px)",
              }}
            >
              <p className="text-sm font-semibold flex gap-1 border-b border-white items-center pb-1">
                Add to Playlist
              </p>
              <div className="max-h-40 overflow-y-auto hideScrollBar flex flex-col gap-2">
                {playlists?.length > 0 ? (
                  playlists?.map((playlist, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToPlaylist(activeSong?.id, playlist._id);
                      }}
                      className="text-sm font-semibold flex gap-1 items-center hover:underline text-left truncate"
                    >
                      {playlist?.name}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-gray-300">No Playlists</p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateModal(true);
                  setShowMenu(false);
                }}
                className="text-xs font-bold flex gap-1 items-center justify-center border border-white rounded p-1 mt-1 hover:bg-white/10"
              >
                <FaPlus size={10} /> Create New
              </button>
            </div>
          )}
        </div>
        {value <= 1 && value > 0.5 && (
          <BsFillVolumeUpFill
            size={25}
            color="#FFF"
            className=" cursor-pointer"
            onClick={() => setVolume(0)}
          />
        )}
        {value <= 0.5 && value > 0 && (
          <BsVolumeDownFill
            size={25}
            className=" cursor-pointer"
            color="#FFF"
            onClick={() => setVolume(0)}
          />
        )}
        {value === 0 && (
          <BsFillVolumeMuteFill
            size={25}
            color="#FFF"
            className=" cursor-pointer"
            onClick={() => setVolume(1)}
          />
        )}
        <input
          onClick={(event) => {
            event.stopPropagation();
          }}
          type="range"
          step="any"
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          className="2xl:w-24 lg:w-24 md:w-28 h-1 ml-2 accent-[#00e6e6] cursor-pointer"
        />
      </div>
      {/* overlay */}
      {showMenu && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
          className=" absolute w-screen h-screen bottom-0 left-0 z-[50]"
        ></div>
      )}
    </>
  );
};

export default VolumeBar;
