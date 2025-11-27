"use client";
import React, { useState } from "react";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { TbRepeat, TbRepeatOnce, TbArrowsShuffle } from "react-icons/tb";
import Downloader from "./Downloader";
import FavouriteButton from "./FavouriteButton";
import { MdPlaylistAdd } from "react-icons/md";
import CreatePlaylistModal from "../CreatePlaylistModal";
import { addSongToPlaylist, getUserPlaylists } from "@/services/playlistApi";
import { toast } from "react-hot-toast";

const Controls = ({
  isPlaying,
  repeat,
  setRepeat,
  shuffle,
  setShuffle,
  currentSongs,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  activeSong,
  fullScreen,
  handleAddToFavourite,
  favouriteSongs,
  loading,
}) => {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showPlaylistsMenu, setShowPlaylistsMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  const handlePlaylistClick = async (e) => {
    e.stopPropagation();
    if (!showPlaylistsMenu) {
        const res = await getUserPlaylists();
        if (res?.success === true) {
            setPlaylists(res?.data?.playlists);
        }
    }
    setShowPlaylistsMenu(!showPlaylistsMenu);
  };

  const handleAddToPlaylist = async (playlistId) => {
      setShowPlaylistsMenu(false);
      const res = await addSongToPlaylist(playlistId, activeSong?.id);
      if (res?.success === true) {
          toast.success(res?.message);
      } else {
          toast.error(res?.message);
      }
  };

  return (
    <div className="flex items-center justify-around md:w-80 text-lg lg:w-80 2xl:w-80 gap-4 sm:gap-0 relative">
      <CreatePlaylistModal 
        show={showPlaylistModal} 
        setShow={setShowPlaylistModal} 
        setPlaylists={setPlaylists}
      />
      
      <div className="relative">
        <MdPlaylistAdd
            title="Add to Playlist"
            size={25}
            color={"white"}
            onClick={handlePlaylistClick}
            className={`${!fullScreen ? "hidden sm:block" : "m-3"} cursor-pointer hover:text-[#00e6e6]`}
        />
        {showPlaylistsMenu && (
            <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPlaylistsMenu(false)}></div>
            <div className="absolute bottom-10 left-0 bg-[#020813] border border-gray-700 rounded-lg p-2 w-48 shadow-xl z-50 max-h-60 overflow-y-auto">
                <button 
                    onClick={() => {
                        setShowPlaylistsMenu(false);
                        setShowPlaylistModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-[#00e6e6] hover:bg-white/10 rounded flex items-center gap-2 font-bold border-b border-gray-700 mb-1"
                >
                    + Create Playlist
                </button>
                {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <button
                            key={playlist._id}
                            onClick={() => handleAddToPlaylist(playlist._id)}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded truncate"
                        >
                            {playlist.name}
                        </button>
                    ))
                ) : (
                    <div className="px-3 py-2 text-sm text-gray-400 italic">No playlists</div>
                )}
            </div>
            </>
        )}
      </div>

      <FavouriteButton
        favouriteSongs={favouriteSongs}
        activeSong={activeSong}
        loading={loading}
        handleAddToFavourite={handleAddToFavourite}
        style={" sm:block hidden"}
      />
      {!repeat ? (
        <TbRepeat
          title="Repeat"
          size={25}
          color={"white"}
          onClick={(e) => {
            e.stopPropagation();
            setRepeat((prev) => !prev);
          }}
          className={`${
            !fullScreen ? "hidden sm:block" : " m-3"
          } cursor-pointer`}
        />
      ) : (
        <TbRepeatOnce
          title="Repeat Once"
          size={25}
          color={repeat ? "#00e6e6" : "white"}
          onClick={(e) => {
            e.stopPropagation();
            setRepeat((prev) => !prev);
          }}
          className={`${
            !fullScreen ? "hidden sm:block" : " m-3"
          } cursor-pointer`}
        />
      )}

      {
        <MdSkipPrevious
          title="Previous"
          size={35}
          color={currentSongs?.length ? "#ffff" : "#b3b3b3"}
          className="cursor-pointer"
          onClick={handlePrevSong}
        />
      }
      {isPlaying ? (
        <BsFillPauseFill
          size={45}
          color="#00e6e6"
          onClick={handlePlayPause}
          className="cursor-pointer"
        />
      ) : (
        <BsFillPlayFill
          size={45}
          color="#00e6e6"
          onClick={handlePlayPause}
          className="cursor-pointer"
        />
      )}
      {
        <MdSkipNext
          title="Next"
          size={35}
          color={currentSongs?.length ? "#ffff" : "#b3b3b3"}
          className="cursor-pointer"
          onClick={handleNextSong}
        />
      }
      <TbArrowsShuffle
        title="Shuffle"
        size={25}
        color={shuffle ? "#00e6e6" : "white"}
        onClick={(e) => {
          e.stopPropagation();
          setShuffle((prev) => !prev);
        }}
        className={`${!fullScreen ? "hidden sm:block" : "m-3"} cursor-pointer`}
      />
      {activeSong?.downloadUrl?.[4]?.url && (
        <div className=" hidden sm:block mt-1 ">
          <Downloader activeSong={activeSong} fullScreen={fullScreen} />
        </div>
      )}
    </div>
  );
};

export default Controls;
