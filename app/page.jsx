'use client';
import Image from "next/image";
import { assets } from "../assets/assets";
import { useState } from "react";
import Sidebar from '../components/Sidebar';
import PromptBox from '../components/PromptBox';
import Message from '../components/Message';
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedChat } = useAppContext();

  return (
    <div className="flex h-screen">
      <Sidebar expand={expand} setExpand={setExpand} />
      <div className="flex-1 flex flex-col items-center justify-between px-4 pb-8 bg-[#292a2d] text-white relative">
        <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
          <Image onClick={() => (expand ? setExpand(false) : setExpand(true))}
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

        {/* Main Content */}
        <div className="w-full h-full flex flex-col items-center justify-start py-20 md:py-8 overflow-y-auto">
          {(!selectedChat || selectedChat.messages.length === 0) && !isLoading ? (
            <div className="text-center">
              <div className="flex items-center gap-3 justify-center">
                <Image src={assets.logo_icon} alt="" className="h-16 w-16" />
                <p className="text-2xl font-medium">Hi, I'm DeepSeek.</p>
              </div>
              <p className="text-sm mt-2">How can I help you today?</p>
            </div>
          ) : (
            <div className="w-full">
              {selectedChat?.messages.map((message, index) => (
                <Message key={index} role={message.role} content={message.content} />
              ))}
              {isLoading && (
                 <div className="flex gap-3 max-w-2xl py-3 rounded-xl">
                    <Image src={assets.logo_icon} alt='' className='h-9 w-9 p-1 border border-white/15 rounded-full animate-pulse'/>
                    <div className="w-12 h-4 bg-gray-600 rounded-full animate-pulse mt-2"></div>
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Prompt Box Area */}
        <div className="w-full flex flex-col items-center">
          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
          <p className="text-xs mt-2 text-gray-500">AI-generated, for Reference only</p>
        </div>
      </div>
    </div>
  );
}