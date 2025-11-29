"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  nextSong,
  prevSong,
  playPause,
  setFullScreen,
  setActiveSong,
} from "../../redux/features/playerSlice";
import Controls from "./Controls";
import Player from "./Player";
import Seekbar from "./Seekbar";
import Track from "./Track";
import VolumeBar from "./VolumeBar";
import FullscreenTrack from "./FullscreenTrack";
import Lyrics from "./Lyrics";
import { HiOutlineChevronDown } from "react-icons/hi";
import { addFavourite, getFavourite } from "@/services/dataAPI";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FavouriteButton from "./FavouriteButton";
import getPixels from "get-pixels";
import { extractColors } from "extract-colors";
import { getParty, updateParty } from "@/services/partyApi";

const MusicPlayer = () => {
  const {
    activeSong,
    currentSongs,
    currentIndex,
    isActive,
    isPlaying,
    fullScreen,
    partyId,
  } = useSelector((state) => state.player);
  const { isTyping } = useSelector((state) => state.loadingBar);
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const [appTime, setAppTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [favouriteSongs, setFavouriteSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { status } = useSession();
  const router = useRouter();
  const [bgColor, setBgColor] = useState();

  // Party Sync Logic
  useEffect(() => {
    let interval;
    if (partyId) {
      interval = setInterval(async () => {
        const res = await getParty(partyId);
        if (res.success) {
          const party = res.party;
          
          // 1. Sync Song
          if (party.currentSong?.id && party.currentSong.id !== activeSong?.id) {
             // Dispatch new song. We use a dummy queue or the party queue.
             // Note: update redux without triggering immediate play if we want to wait for sync?
             // But setActiveSong sets isActive=true.
             dispatch(setActiveSong({ song: party.currentSong, data: party.queue, i: 0 }));
          }

          // 2. Sync Play/Pause
          if (party.isPlaying !== isPlaying) {
             dispatch(playPause(party.isPlaying));
          }

          // 3. Sync Time
          if (party.isPlaying) {
             // Calculate expected time: party.progress + (now - party.lastUpdated)
             const timePassed = (Date.now() - party.lastUpdated) / 1000;
             const expectedTime = party.progress + timePassed;
             
             // If drift is > 2 seconds, seek
             if (Math.abs(expectedTime - appTime) > 2.5) {
                 // console.log("Syncing time...", expectedTime, appTime);
                 setSeekTime(expectedTime);
             }
          } else {
             // If paused, ensure we are at the pause spot
             if (Math.abs(party.progress - appTime) > 1) {
                 setSeekTime(party.progress);
             }
          }
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [partyId, activeSong, isPlaying, appTime, dispatch]);


  useEffect(() => {
    if (currentSongs?.length && !partyId) dispatch(playPause(true));
  }, [currentIndex]);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        setLoading(true);
        const res = await getFavourite();
        // console.log("favourites",res);
        if (res) {
          setFavouriteSongs(res);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchFavourites();
    // set ambient background
    const src = activeSong?.image?.[1]?.url;

    if (src) {
      getPixels(src, (err, pixels) => {
        if (!err) {
          const data = [...pixels.data];
          const width = Math.round(Math.sqrt(data.length / 4));
          const height = width;

          extractColors({ data, width, height })
            .then((colors) => {
              setBgColor(colors[0]);
            })
            .catch(console.log);
        }
      });
    }
    // change page title to song name
    if (activeSong?.name) {
      document.title = activeSong?.name;
    }
  }, [activeSong]);

  // off scroll when full screen
  useEffect(() => {
    document.documentElement.style.overflow = fullScreen ? "hidden" : "auto";

    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, [fullScreen]);

  // Hotkey for play pause
  const handleKeyPress = (event) => {
    // Check if the pressed key is the spacebar (keyCode 32 or key " ")
    if (!isTyping && (event.keyCode === 32 || event.key === " ")) {
      event.preventDefault();
      handlePlayPause();
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const handlePlayPause = async (e) => {
    e?.stopPropagation();
    if (!isActive) return;

    if (partyId) {
       // In party mode, we request the change to the server
       await updateParty(partyId, "PLAY_PAUSE", { isPlaying: !isPlaying, progress: appTime });
       // Optimistic update
       dispatch(playPause(!isPlaying));
       return;
    }

    if (isPlaying) {
      dispatch(playPause(false));
    } else {
      dispatch(playPause(true));
    }
  };

  const handleNextSong = async (e) => {
    e?.stopPropagation();
    
    if (partyId) {
        await updateParty(partyId, "NEXT", {});
        return;
    }

    dispatch(playPause(false));

    if (!shuffle) {
      dispatch(nextSong((currentIndex + 1) % currentSongs.length));
    } else {
      dispatch(nextSong(Math.floor(Math.random() * currentSongs.length)));
    }
  };

  const handlePrevSong = (e) => {
    e?.stopPropagation();
    if (currentIndex === 0) {
      dispatch(prevSong(currentSongs.length - 1));
    } else if (shuffle) {
      dispatch(prevSong(Math.floor(Math.random() * currentSongs.length)));
    } else {
      dispatch(prevSong(currentIndex - 1));
    }
  };

  const handleAddToFavourite = async (favsong) => {
    if (status === "unauthenticated") {
      dispatch(setFullScreen(false));
      router.push("/login");
    }

    if (favsong?.id && status === "authenticated") {
      try {
        setLoading(true);
        // optimistic update
        if (favouriteSongs?.find((song) => song === favsong?.id)) {
          setFavouriteSongs(
            favouriteSongs?.filter((song) => song !== favsong?.id)
          );
        } else {
          setFavouriteSongs([...favouriteSongs, favsong?.id]);
        }
        const res = await addFavourite(favsong);
        if (res?.success === true) {
          setFavouriteSongs(res?.data?.favourites);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("add to fav error", error);
      }
    }
  };

  if (!activeSong?.name) return null;

  return (
    <div
      className={`relative overflow-scroll items-center lg:items-stretch lg:overflow-visible hideScrollBar sm:px-12  flex flex-col transition-all duration-100 ${
        fullScreen ? "h-[100vh] w-[100vw]" : "w-full h-20 px-8 bg-black "
      }`}
      onClick={() => {
        if (activeSong?.id) {
          dispatch(setFullScreen(!fullScreen));
        }
      }}
      style={{
        backgroundColor: bgColor
          ? `rgba(${bgColor.red}, ${bgColor.green}, ${bgColor.blue}, 0.2)`
          : "rgba(0,0,0,0.2)",
      }}
    >
      <HiOutlineChevronDown
        onClick={(e) => {
          e.stopPropagation();
          dispatch(setFullScreen(!fullScreen));
        }}
        className={` absolute top-16 md:top-10 right-7 text-white text-3xl cursor-pointer ${
          fullScreen ? "" : "hidden"
        }`}
      />
      <FullscreenTrack
        handleNextSong={handleNextSong}
        handlePrevSong={handlePrevSong}
        activeSong={activeSong}
        fullScreen={fullScreen}
      />
      <div className=" flex items-center justify-between pt-2">
        <Track
          isPlaying={isPlaying}
          isActive={isActive}
          activeSong={activeSong}
          fullScreen={fullScreen}
        />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            className={`${
              fullScreen ? "" : "hidden"
            }  sm:hidden flex items-center justify-center gap-4`}
          >
            <FavouriteButton
              favouriteSongs={favouriteSongs}
              activeSong={activeSong}
              loading={loading}
              handleAddToFavourite={handleAddToFavourite}
              style={"mb-4"}
            />
          </div>
          <Controls
            isPlaying={isPlaying}
            isActive={isActive}
            repeat={repeat}
            setRepeat={setRepeat}
            shuffle={shuffle}
            setShuffle={setShuffle}
            currentSongs={currentSongs}
            activeSong={activeSong}
            fullScreen={fullScreen}
            handlePlayPause={handlePlayPause}
            handlePrevSong={handlePrevSong}
            handleNextSong={handleNextSong}
            handleAddToFavourite={handleAddToFavourite}
            favouriteSongs={favouriteSongs}
            loading={loading}
          />
          <Seekbar
            value={appTime}
            min="0"
            max={duration}
            fullScreen={fullScreen}
            onInput={(event) => setSeekTime(event.target.value)}
            onSeekEnd={async (time) => {
                if (partyId) {
                    await updateParty(partyId, "SEEK", { progress: parseFloat(time) });
                }
            }}
            setSeekTime={setSeekTime}
            appTime={appTime}
          />
          <Player
            activeSong={activeSong}
            volume={volume}
            isPlaying={isPlaying}
            seekTime={seekTime}
            repeat={repeat}
            currentIndex={currentIndex}
            onEnded={handleNextSong}
            handlePlayPause={handlePlayPause}
            handleNextSong={handleNextSong}
            handlePrevSong={handlePrevSong}
            onTimeUpdate={(event) => setAppTime(event.target.currentTime)}
            onLoadedData={(event) => setDuration(event.target.duration)}
            appTime={appTime}
            setSeekTime={setSeekTime}
          />
        </div>
        <VolumeBar
          activeSong={activeSong}
          bgColor={bgColor}
          fullScreen={fullScreen}
          value={volume}
          min="0"
          max="1"
          onChange={(event) => setVolume(event.target.value)}
          setVolume={setVolume}
        />
      </div>
      {fullScreen && (
        <div className=" lg:hidden">
          <Lyrics activeSong={activeSong} currentSongs={currentSongs} appTime={appTime} />
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
