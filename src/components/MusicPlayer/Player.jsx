"use client";
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect, useState } from "react";
import { scrobble } from "@/services/scrobbleApi";

const Player = ({
  activeSong,
  isPlaying,
  volume,
  seekTime,
  onEnded,
  onTimeUpdate,
  onLoadedData,
  repeat,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  setSeekTime,
  appTime,
}) => {
  const ref = useRef(null);
  const [hasScrobbled, setHasScrobbled] = useState(false);

  // eslint-disable-next-line no-unused-expressions
  if (ref.current) {
    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  }

  // Reset scrobble status when song changes
  useEffect(() => {
    setHasScrobbled(false);
  }, [activeSong?.id]);

  const handleTimeUpdate = (event) => {
    onTimeUpdate(event);
    
    // Scrobble after 20% of duration
    if (!hasScrobbled && event.target.duration > 0 && event.target.currentTime > event.target.duration * 0.2) {
        const sk = localStorage.getItem("lastfm_session_key");
        if (sk) {
            scrobble(activeSong, sk);
            setHasScrobbled(true);
        }
    }
  }

  // media session metadata:
  const mediaMetaData = activeSong.name
    ? {
        title: activeSong?.name,
        artist: activeSong?.primaryArtists,
        album: activeSong?.album.name,
        artwork: [
          {
            src: activeSong.image[2]?.url,
            sizes: "500x500",
            type: "image/jpg",
          },
        ],
      }
    : {};
  useEffect(() => {
    // Check if the Media Session API is available in the browser environment
    if ("mediaSession" in navigator) {
      // Set media metadata
      navigator.mediaSession.metadata = new window.MediaMetadata(mediaMetaData);

      // Define media session event handlers
      navigator.mediaSession.setActionHandler("play", onPlay);
      navigator.mediaSession.setActionHandler("pause", onPause);
      navigator.mediaSession.setActionHandler("previoustrack", onPreviousTrack);
      navigator.mediaSession.setActionHandler("nexttrack", onNextTrack);
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        setSeekTime(appTime - 5);
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        setSeekTime(appTime + 5);
      });
    }
  }, [mediaMetaData]);
  // media session handlers:
  const onPlay = () => {
    handlePlayPause();
  };

  const onPause = () => {
    handlePlayPause();
  };

  const onPreviousTrack = () => {
    handlePrevSong();
  };

  const onNextTrack = () => {
    handleNextSong();
  };

  useEffect(() => {
    ref.current.volume = volume;
  }, [volume]);
  // updates audio element only on seekTime change (and not on each rerender):
  useEffect(() => {
    ref.current.currentTime = seekTime;
  }, [seekTime]);

  return (
    <>
      <audio
        src={activeSong?.downloadUrl?.[4]?.url}
        ref={ref}
        loop={repeat}
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={onLoadedData}
      />
    </>
  );
};

export default Player;
