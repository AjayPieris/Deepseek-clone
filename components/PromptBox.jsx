"use client";
import { assets } from "../assets/assets";
import React, { useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

function PromptBox({ isLoading, setIsLoading }) {
  const [prompt, setPrompt] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deepThinking, setDeepThinking] = useState(false);
  const [search, setSearch] = useState(false);
  const { user, setChats, selectedChat, setSelectedChat, createNewChat } =
    useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types (images, PDFs, audio, video)
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "application/pdf",
      "audio/wav",
      "audio/mp3",
      "audio/aiff",
      "audio/aac",
      "audio/ogg",
      "audio/flac",
      "video/mp4",
      "video/mpeg",
      "video/mov",
      "video/avi",
      "video/x-flv",
      "video/mpg",
      "video/webm",
      "video/wmv",
      "video/3gpp",
    ];

    const invalidFiles = files.filter((f) => !validTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      toast.error("Some files have unsupported formats");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (data.success) {
          return { ...data.data, localName: file.name };
        }
        throw new Error(data.message);
      });

      const results = await Promise.all(uploadPromises);
      setUploadedFiles((prev) => [...prev, ...results]);
      toast.success("Files uploaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to upload files");
      setSelectedFiles((prev) => prev.filter((f) => !files.includes(f)));
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendPrompt = async () => {
    const promptCopy = prompt;
    const filesCopy = [...uploadedFiles];
    if (!user) return toast.error("Login to send message");
    if (isLoading) return toast.error("Wait for the previous prompt response");
    if (!prompt.trim()) return;

    setIsLoading(true);
    setPrompt("");
    setSelectedFiles([]);
    setUploadedFiles([]);

    let currentChat = selectedChat;

    try {
      // Create new chat if none selected
      if (!currentChat) {
        currentChat = await createNewChat();
        if (!currentChat) {
          setIsLoading(false);
          setPrompt(promptCopy);
          setUploadedFiles(filesCopy);
          return;
        }
      }

      const userPrompt = {
        role: "user",
        content: promptCopy,
        timeStamp: Date.now(),
        files: filesCopy,
      };

      // Update local state
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === currentChat._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat,
        ),
      );

      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, userPrompt],
      }));

      // Send prompt to backend
      const { data } = await axios.post("/api/chat/ai", {
        chatId: currentChat._id,
        prompt: promptCopy,
        files: filesCopy,
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
            chat._id === currentChat._id
              ? {
                  ...chat,
                  messages: [...chat.messages, assistantMessage],
                  name: data.newChatName || chat.name, // Update name if provided
                }
              : chat,
          ),
        );

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          name: data.newChatName || prev.name, // Update name if provided
        }));
      } else {
        // This will now correctly display the error from your API
        toast.error(data.message);
        setPrompt(promptCopy);
        setUploadedFiles(filesCopy);
        // Revert optimistic update
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === currentChat._id
              ? { ...chat, messages: chat.messages.slice(0, -1) }
              : chat,
          ),
        );
        setSelectedChat((prev) => ({
          ...prev,
          messages: prev.messages.slice(0, -1),
        }));
      }
    } catch (error) {
      // FIXED: Improved error handling to show detailed API error messages.
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);

      // Restore user prompt and messages on failure
      setPrompt(promptCopy);
      setUploadedFiles(filesCopy);

      if (currentChat) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === currentChat._id
              ? { ...chat, messages: chat.messages.slice(0, -1) } // remove optimistic user message
              : chat,
          ),
        );
        setSelectedChat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.slice(0, -1), // remove optimistic user message
          };
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendPrompt();
      }}
      className="w-full max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all"
    >
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="relative bg-[#2a2a2e] rounded-lg p-2 flex items-center gap-2"
            >
              {file.type.startsWith("image/") ? (
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  width={40}
                  height={40}
                  className="rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-[#404045] rounded flex items-center justify-center text-xs">
                  {file.type.includes("pdf")
                    ? "PDF"
                    : file.type.startsWith("video/")
                      ? "VID"
                      : file.type.startsWith("audio/")
                        ? "AUD"
                        : "FILE"}
                </div>
              )}
              <span className="text-xs text-gray-300 max-w-[100px] truncate">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white placeholder:text-gray-400"
        rows={2}
        placeholder="Message DeepSeek"
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {/* Deep Thinking Button */}
          <button
            type="button"
            onClick={() => setDeepThinking(!deepThinking)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border ${
              deepThinking
                ? "bg-[#5b8ef4] text-white border-[#5b8ef4]"
                : "bg-[#3a3a3f] text-white border-[#3a3a3f] hover:bg-[#4a4a4f]"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>Deep thinking</span>
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => setSearch(!search)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border ${
              search
                ? "bg-[#5b8ef4] text-white border-[#5b8ef4]"
                : "bg-[#3a3a3f] text-white border-[#3a3a3f] hover:bg-[#4a4a4f]"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span>Search</span>
          </button>

          {isUploading && (
            <span className="text-xs text-gray-400 ml-2">Uploading...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload Button */}
          <label className="cursor-pointer text-gray-400 hover:text-gray-200 transition">
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,audio/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading || isLoading}
            />
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </label>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`${
              prompt.trim() ? "bg-[#5b8ef4]" : "bg-[#71717a]"
            } rounded-full p-2.5 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90`}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}

export default PromptBox;
