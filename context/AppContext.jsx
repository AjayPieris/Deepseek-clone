"use client"
import { useUser, useAuth } from "@clerk/nextjs"
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast";

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
    const { user } = useUser();
    const { getToken } = useAuth();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    const createNewChat = async () => {
        if (!user) return null;
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/chat/create', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                // Use the returned chat object which now includes _id and timestamps
                const newChat = { ...data.data, messages: [] };
                setChats(prev => [newChat, ...prev]);
                setSelectedChat(newChat);
                return newChat;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            toast.error(error.message || "Failed to create chat");
            return null;
        }
    }

    const deleteChat = async (chatId) => {
        if (!user) return null;
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/chat/delete', { chatId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success("Chat deleted");
                const updatedChats = chats.filter(chat => chat._id !== chatId);
                setChats(updatedChats);
                // If the deleted chat was selected, select the first one or create a new one
                if (selectedChat._id === chatId) {
                    if (updatedChats.length > 0) {
                        setSelectedChat(updatedChats[0]);
                    } else {
                        await createNewChat();
                    }
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || "Failed to delete chat");
        }
    }
    
    const renameChat = async (chatId, newName) => {
        if (!user || !newName.trim()) return;
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/chat/rename', { chatId, name: newName }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if(data.success) {
                toast.success("Chat renamed");
                const updatedChats = chats.map(chat => chat._id === chatId ? {...chat, name: newName} : chat);
                setChats(updatedChats);
                if(selectedChat._id === chatId) {
                    setSelectedChat(prev => ({...prev, name: newName}));
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || "Failed to rename chat");
        }
    }


    const fetchUserChats = async () => {
        if (!user) return;
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/chat/get', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                 if (data.data.length === 0) {
                    await createNewChat();
                } else {
                    // sort by updatedAt
                    const sortedChats = data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setChats(sortedChats);
                    if (sortedChats.length > 0 && sortedChats[0]) {
                        setSelectedChat({ ...sortedChats[0], messages: sortedChats[0].messages || [] });
                    }
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || "Failed to fetch chats");
        }
    }

    useEffect(() => {
        if (user) {
            fetchUserChats();
        } else {
            // Clear state on logout
            setChats([]);
            setSelectedChat(null);
        }
    }, [user]);

    const value = { user, chats, setChats, selectedChat, setSelectedChat, fetchUserChats, createNewChat, deleteChat, renameChat };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}