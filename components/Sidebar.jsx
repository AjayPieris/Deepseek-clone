"use client";

import React from "react";
import Image from "next/image";
import { assets } from "../assets/assets";
import { useClerk, UserButton } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";
import ChatLabel from '../components/ChatLabel';

function Sidebar({ expand, setExpand }) {
  const { openSignIn } = useClerk();
  const { user, chats, createNewChat, selectedChat, setSelectedChat } = useAppContext();

  return (
    <div
      className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50 max-md:absolute max-md:h-screen ${
        expand ? "p-4 w-64" : "md:w-20 w-0 max-md:overflow-hidden"
      }`}
    >
      {/* Top Section */}
      <div>
        <div className={`flex ${expand ? "flex-row gap-10" : "flex-col items-center gap-8"}`}>
          <Image
            className={expand ? "w-36" : "w-10"}
            src={expand ? assets.logo_text : assets.logo_icon}
            alt="Logo"
          />
          <div
            onClick={() => setExpand(!expand)}
            className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 aspect-square rounded-lg cursor-pointer"
          >
            <Image src={assets.menu_icon} alt="" className="md:hidden w-6" />
            <Image
              src={expand ? assets.sidebar_close_icon : assets.sidebar_icon}
              alt=""
              className="hidden md:block w-7"
            />
            <div
              className={`absolute w-max ${
                expand ? "left-1/2 -translate-x-1/2 top-12" : "top-1/2 -translate-y-1/2 left-24"
              } opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}
            >
              {expand ? "Close sidebar" : "Open sidebar"}
              <div
                className={`w-3 h-3 absolute bg-black rotate-45 ${
                  expand ? "left-1/2 -top-1.5 -translate-x-1/2" : "left-[-6px] top-1/2 -translate-y-1/2"
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={createNewChat}
          className={`mt-8 flex items-center justify-center cursor-pointer ${
            expand
              ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max"
              : "group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"
          }`}
        >
          <Image
            className={expand ? "w-6" : "w-7"}
            src={expand ? assets.chat_icon : assets.chat_icon_dull}
            alt="New Chat"
          />
          <div className="absolute w-max top-1/2 -translate-y-1/2 left-24 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
            New chat
            <div className="w-3 h-3 absolute bg-black rotate-45 left-[-6px] top-1/2 -translate-y-1/2"></div>
          </div>
          {expand && <p className="text-white text font-medium">New chat</p>}
        </button>

        {/* Recents */}
        <div className={`mt-8 text-white/25 text-sm ${expand ? "block" : "hidden"}`}>
          <p className="my-1 px-2">Recents</p>
          {chats.map(chat => (
            <ChatLabel
              key={chat._id}
              chat={chat}
              selected={selectedChat?._id === chat._id}
              onClick={() => setSelectedChat(chat)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        {/* Profile / Sign-In */}
        <div
          onClick={user ? null : openSignIn}
          className={`flex items-center ${
            expand ? "hover:bg-white/10 rounded-lg" : "justify-center w-full"
          } gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer`}
        >
          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Image src={assets.profile_icon} alt="Profile" className="w-7" />
          )}
          {expand && <span>{user ? user.fullName : "Sign In"}</span>}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;