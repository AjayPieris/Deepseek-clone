"use client";
import Image from "next/image";
import { assets } from "../assets/assets";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import PromptBox from "../components/PromptBox";
import Message from "../components/Message";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedChat, createNewChat } = useAppContext();

  const isChatting = selectedChat && selectedChat.messages.length > 0;

  return (
    <div className="flex h-screen">
      <Sidebar expand={expand} setExpand={setExpand} />
      <div className="flex-1 flex flex-col items-center text-white relative bg-[#292a2d]">
        <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full z-10">
          <Image
            onClick={() => (expand ? setExpand(false) : setExpand(true))}
            className="w-6 cursor-pointer"
            src={assets.menu_icon}
            alt="menu icon"
          />
          <p className="font-semibold">{selectedChat?.name}</p>
          <Image
            onClick={() => createNewChat()}
            className="opacity-70 w-5 cursor-pointer"
            src={assets.new_icon}
            alt="new chat icon"
          />
        </div>

        {isChatting || isLoading ? (
          <>
            {/* Main Content - Chat Mode */}
            <div className="w-full flex-1 flex flex-col items-center justify-start py-20 md:py-8 px-4 overflow-y-auto scroll-smooth">
              <div className="w-full">
                {selectedChat?.messages.map((message, index) => (
                  <Message
                    key={index}
                    role={message.role}
                    content={message.content}
                    timeStamp={message.timeStamp}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3 max-w-3xl mx-auto w-full px-4 py-3 rounded-xl">
                    <Image
                      src={assets.logo_icon}
                      alt=""
                      className="h-9 w-9 p-1 border border-white/15 rounded-full animate-pulse self-start mt-1"
                    />
                    <div className="w-12 h-4 bg-gray-600 rounded-full animate-pulse mt-3"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Box Area - Bottom */}
            <div className="w-full flex flex-col items-center px-4 pb-8">
              <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
              <p className="text-xs mt-2 text-gray-500">
                DeepSeek can make mistakes. Check important info.
              </p>
            </div>
          </>
        ) : (
          /* Initial State - Centered */
          <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
            <div className="text-center mb-8">
              <div className="flex items-center gap-3 justify-center">
                <Image src={assets.logo_icon} alt="" className="h-16 w-16" />
                <p className="text-2xl font-medium">Hi, I'm DeepSeek.</p>
              </div>
              <p className="text-sm mt-2">How can I help you today?</p>
            </div>

            <div className="w-full flex flex-col items-center">
              <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
              <p className="text-xs mt-2 text-gray-500">
                DeepSeek can make mistakes. Check important info.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
