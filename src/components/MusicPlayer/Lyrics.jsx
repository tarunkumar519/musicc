"use client";
import { getlyricsData } from "@/services/dataAPI";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import SongsList from "../SongsList";
import { setAutoAdd } from "@/redux/features/playerSlice";

const Lyrics = ({ activeSong, appTime }) => {
  const dispatch = useDispatch();
  const { currentSongs, autoAdd } = useSelector((state) => state.player);
  const [lyrics, setLyrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");
  const lyricsContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getlyricsData(activeSong);
      setLyrics(res);
      setLoading(false);
    };
    if (activeSong?.name) fetchData();
  }, [activeSong?.id]);

  const handleAutoAdd = (checked) => {
    if (checked) {
      dispatch(setAutoAdd(true));
      localStorage.setItem("autoAdd", true);
    } else {
      dispatch(setAutoAdd(false));
      localStorage.setItem("autoAdd", false);
    }
  };

  // Helper to parse LRC timestamp to seconds
  const parseTime = (timeStr) => {
    const parts = timeStr.split(":");
    const min = parseFloat(parts[0]);
    const sec = parseFloat(parts[1]);
    return min * 60 + sec;
  };

  // Logic to determine current synced line
  const getCurrentLineIndex = () => {
    if (!lyrics?.data?.syncedLyrics || !appTime) return -1;
    const lines = lyrics.data.syncedLyrics;
    // syncedLyrics format from LrcLib is typically array of { time: 12.34, lyrics: "text" } if pre-parsed or just string
    // But dataAPI returns raw string or object? 
    // Wait, LrcLib returns `syncedLyrics` as a string: "[00:12.00] line... \n [00:15.00] line..."
    // My dataAPI logic returns `syncedLyrics` directly from LrcLib response.
    
    // I need to parse the syncedLyrics string if it's a string.
    // Let's assume it is a string in standard LRC format.
    
    // BUT wait, dataAPI.js returns `syncedLyrics: data.syncedLyrics`. LrcLib `syncedLyrics` IS a string.
    // So I need to parse it here or in dataAPI. I'll parse here to keep dataAPI simple.
    
    return -1;
  };

  // Memoized parsed lyrics
  const [parsedLyrics, setParsedLyrics] = useState([]);

  useEffect(() => {
    if (lyrics?.data?.syncedLyrics) {
      const raw = lyrics.data.syncedLyrics;
      const lines = raw.split("\n").map(line => {
        // Match timestamps in format [mm:ss.xx] or [mm:ss.xxx]
        const match = line.match(/^\[(\d+):(\d+\.\d+)\](.*)/);
        if (match) {
          const minutes = parseFloat(match[1]);
          const seconds = parseFloat(match[2]);
          const time = minutes * 60 + seconds;
          return { time, text: match[3] };
        }
        return null;
      }).filter(Boolean);
      setParsedLyrics(lines);
    } else {
      setParsedLyrics([]);
    }
  }, [lyrics]);

  // Find active line index
  const activeLineIndex = parsedLyrics.findIndex((line, i) => {
    const nextLine = parsedLyrics[i + 1];
    return appTime >= line.time && (!nextLine || appTime < nextLine.time);
  });

  // Auto scroll
  useEffect(() => {
    if (activeTab === "lyrics" && activeLineIndex !== -1 && lyricsContainerRef.current) {
      const activeElement = lyricsContainerRef.current.children[activeLineIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeLineIndex, activeTab]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex justify-center items-center w-full">
        <button
          onClick={() => {
            setActiveTab("queue");
          }}
          className={`${
            activeTab === "queue" ? "border-[#00e6e6] border-b-2" : ""
          } text-white text-xl m-3 mt-20 sm:mt-0 font-medium `}
        >
          Queue
        </button>
        <button
          onClick={() => {
            setActiveTab("lyrics");
          }}
          className={`${
            activeTab === "lyrics" ? "border-[#00e6e6] border-b-2" : ""
          } text-white text-xl m-3 mt-20 sm:mt-0  font-medium`}
        >
          Lyrics
        </button>
      </div>
      <div>
        {activeTab === "lyrics" ? (
          lyrics?.success ? (
            parsedLyrics.length > 0 ? (
               <div ref={lyricsContainerRef} className="text-white text-sm sm:text-base p-4 sm:p-0 mt-5 md:w-[450px] md:h-[530px] overflow-y-scroll hideScrollBar text-center flex flex-col gap-4">
                  {parsedLyrics.map((line, index) => (
                    <p
                      key={index}
                      className={`transition-all duration-300 ${
                        index === activeLineIndex
                          ? "text-[#00e6e6] font-bold scale-110 origin-center my-4"
                          : "text-gray-400 opacity-60"
                      }`}
                    >
                      {line.text}
                    </p>
                  ))}
               </div>
            ) : (
                <div className="text-white text-sm sm:text-base p-4 sm:p-0 mt-5 md:w-[450px] md:h-[530px] overflow-y-scroll hideScrollBar text-center">
                {lyrics?.data?.lyrics?.split("<br>").map((line, index) => {
                    return <p key={index}>{line}</p>;
                })}
                </div>
            )
          ) : (
            <div className="text-white text-lg p-4 sm:p-0 mt-5 md:w-[450px] md:h-[530px] overflow-y-scroll hideScrollBar text-center">
              No Lyrics Found
            </div>
          )
        ) : (
          <div>
            <div
              className=" flex justify-between gap-7 mt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className=" text-white font-medium">
                Auto add similar songs to queue
              </p>

              <label
                htmlFor="autoAddButton"
                className="relative inline-flex items-center mb-1 cursor-pointer mr-4"
              >
                <input
                  onChange={(e) => {
                    handleAutoAdd(e.target.checked);
                  }}
                  type="checkbox"
                  checked={autoAdd}
                  className="sr-only peer"
                  name="autoAddButton"
                  id="autoAddButton"
                  placeholder="autoAddButton"
                  title={autoAdd ? "on" : "off"}
                ></input>
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none ring-2  ring-gray-500 ch rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#00e6e6]"></div>
              </label>
            </div>
            {currentSongs?.length > 0 ? (
              <div className=" text-white p- mt- md:w-[450px] md:h-[530px] overflow-y-scroll hideScrollBar ">
                <SongsList
                  SongData={currentSongs}
                  loading={false}
                  hidePlays={true}
                  activeSong={activeSong}
                />
              </div>
            ) : (
              <div className="text-white text-lg p-4 sm:p-0 mt-5 md:w-[450px] md:h-[500px] overflow-y-scroll hideScrollBar text-center">
                No Songs
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lyrics;
