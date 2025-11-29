"use client";
import { RWebShare } from "react-web-share";
import { FaShareAlt } from "react-icons/fa";

const ShareButton = ({ title, text, url }) => {
  return (
    <RWebShare
      data={{
        text: text,
        url: url,
        title: title,
      }}
      onClick={() => console.log("shared successfully!")}
    >
      <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
        <FaShareAlt className="text-white text-lg" />
      </button>
    </RWebShare>
  );
};

export default ShareButton;

