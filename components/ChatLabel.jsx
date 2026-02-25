import { assets } from "../assets/assets";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

function ChatLabel({ chat, selected, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { renameChat, deleteChat } = useAppContext();
  const menuRef = useRef(null);

  // Click outside to close menu
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const handleRename = (e) => {
    e.stopPropagation();
    const newName = prompt("Enter new chat name:", chat.name);
    if (newName) {
      renameChat(chat._id, newName);
    }
    setMenuOpen(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      deleteChat(chat._id);
    }
    setMenuOpen(false);
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-2 text-white/80 ${selected ? 'bg-white/15' : 'hover:bg-white/10'} rounded-lg text-sm group cursor-pointer relative`}
    >
      <p className="max-w-[80%] truncate">{chat.name}</p>
      <div className="relative" ref={menuRef}>
        <Image
          src={assets.three_dots}
          alt="menu"
          className="w-4 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
        />
        {menuOpen && (
          <div className="absolute -right-2 top-6 bg-gray-700 rounded-xl w-max p-2 z-10">
            <div onClick={handleRename} className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg">
              <Image src={assets.pencil_icon} alt="rename" className="w-4" />
              <p>Rename</p>
            </div>
            <div onClick={handleDelete} className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg">
              <Image src={assets.delete_icon} alt="delete" className="w-4" />
              <p>Delete</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatLabel;