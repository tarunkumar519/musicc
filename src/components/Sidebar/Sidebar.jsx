import React from "react";
import Languages from "./Languages";
import Favourites from "./Favourites";
import { MdOutlineMenu } from "react-icons/md";
import Link from "next/link";
import Profile from "./Profile";
import { useDispatch } from "react-redux";
import Playlists from "./Playlists";
import { setProgress } from "@/redux/features/loadingBarSlice";

const Sidebar = ({ showNav, setShowNav }) => {
  const dispatch = useDispatch();
  return (
    <div
      className={`${
        showNav ? "" : "translate-x-[-100%]"
      } transition-all duration-200  h-screen lg:w-[300px] md:w-[250px] w-[65vw] fixed top-0 left-0 z-40 bg-[#020813] flex flex-col justify-between`}
    >
      <div>
        <div className=" flex mt-3">
          <MdOutlineMenu
            onClick={() => setShowNav(false)}
            className=" mx-4 text-2xl lg:text-3xl my-auto text-white cursor-pointer"
          />
          <div className=" flex justify-center items-center">
            <Link href="/">
              <div
                onClick={() => {
                  dispatch(setProgress(100));
                }}
                className="text-white text-2xl font-bold lg:py-2 flex items-center justify-center w-[139px] h-[31px] lg:h-[62px] lg:w-[190px]"
              >
                Music
              </div>
            </Link>
          </div>
        </div>
        <div className=" mt-7 pb-7 border-b border-gray-400 w-[95%]">
          <Profile setShowNav={setShowNav} />
        </div>
        <div className="flex flex-col gap-1">
          <Languages />
          <hr className="border-gray-400 w-[95%] mx-auto" />
        </div>
        <Favourites setShowNav={setShowNav} />
        <div className="flex flex-col gap-1">
          <hr className="border-gray-400 w-[95%] mx-auto" />
          <Playlists setShowNav={setShowNav} />
          <hr className="border-gray-400 w-[95%] mx-auto" />
        </div>
      </div>
      <div className=" mb-28 text-gray-200 mx-3 flex gap-3">
      </div>
    </div>
  );
};

export default Sidebar;
