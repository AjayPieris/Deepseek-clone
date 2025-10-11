"use client";
import { assets } from "../assets/assets";
import React, { useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

function PromptBox({ isLoading, setIsLoading }) {
  const [prompt, setPrompt] = useState("");
  const { user, setChats, selectedChat, setSelectedChat } = useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const sendPrompt = async () => {
    const promptCopy = prompt;
    if (!user) return toast.error("Login to send message");
    if (isLoading) return toast.error("Wait for the previous prompt response");
    if (!prompt.trim()) return;

    setIsLoading(true);
    setPrompt("");

    try {
      const userPrompt = {
        role: "user",
        content: promptCopy,
        timeStamp: Date.now(),
      };

      // Update local state
      if(selectedChat) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, messages: [...chat.messages, userPrompt] }
              : chat
          )
        );

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, userPrompt],
        }));
      }


      // Send prompt to backend
      const { data } = await axios.post("/api/chat/ai", {
        chatId: selectedChat._id,
        prompt: promptCopy,
      });

      if (data.success) {
        const assistantMessage = {
          role: "assistant",
          content: data.data.content,
          timeStamp: Date.now(),
        };

        // Update local state with assistant response
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, messages: [...chat.messages, assistantMessage] }
              : chat
          )
        );

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));
      } else {
        // This will now correctly display the error from your API
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      // FIXED: Improved error handling to show detailed API error messages.
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
      toast.error(errorMessage);

      // Restore user prompt and messages on failure
      setPrompt(promptCopy);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: chat.messages.slice(0, -1) } // remove optimistic user message
            : chat
        )
      );
      setSelectedChat((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, -1), // remove optimistic user message
      }));

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); sendPrompt(); }}
      className="w-full max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all"
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className="flex items-center justify-between text-sm mt-2">
        <div className="flex items-center gap-2">
          {/* These can be implemented as features later */}
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="Pin" width={16} height={16} />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`${prompt.trim() ? "bg-blue-500" : "bg-[#71717a]"} rounded-full p-2 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt.trim() ? assets.arrow_icon : assets.arrow_icon_dull}
              alt="Send"
              width={14}
              height={14}
            />
          </button>
        </div>
      </div>
    </form>
  );
}

export default PromptBox;