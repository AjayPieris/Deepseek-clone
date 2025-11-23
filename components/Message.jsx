import React from "react";
import Image from "next/image";
import { assets } from "../assets/assets";
import ReactMarkdown from "react-markdown";

function Message({ role, content, timeStamp }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto text-sm px-4">
      <div
        className={`group flex flex-col w-full mb-8 ${
          role === "user" && "items-end"
        }`}
      >
        <div
          className={`relative flex max-w-2xl py-3 rounded-xl ${
            role === "user" ? "bg-[#414158] px-5" : "gap-3"
          }`}
        >
          {role === "user" ? (
            <span className="text-white/90">{content}</span>
          ) : (
            <>
              <Image
                src={assets.logo_icon}
                alt=""
                className="h-9 w-9 p-1 border border-white/15 rounded-full self-start mt-1"
              />
              <div className="space-y-4 w-full overflow-scroll markdown-content">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </>
          )}
        </div>

        <div
          className={`flex items-center gap-3 mt-2 ${
            role === "user" ? "flex-row-reverse mr-2" : "ml-14"
          }`}
        >
          {timeStamp && (
            <span className="text-xs text-gray-400">
              {formatTime(timeStamp)}
            </span>
          )}

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {role === "user" ? (
              <>
                <Image
                  src={assets.pencil_icon}
                  alt="Edit"
                  className="w-4 cursor-pointer hover:opacity-80"
                />
                <Image
                  src={assets.copy_icon}
                  alt="Copy"
                  className="w-4 cursor-pointer hover:opacity-80"
                />
              </>
            ) : (
              <>
                <Image
                  src={assets.copy_icon}
                  alt="Copy"
                  className="w-4 cursor-pointer hover:opacity-80"
                />
                <Image
                  src={assets.like_icon}
                  alt="Like"
                  className="w-4 cursor-pointer hover:opacity-80"
                />
                <Image
                  src={assets.dislike_icon}
                  alt="Dislike"
                  className="w-4 cursor-pointer hover:opacity-80"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
