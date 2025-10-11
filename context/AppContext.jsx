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
                const newChat = { ...data.data, messages: [] }; // ensure messages array
                setChats(prev => [newChat, ...prev]);
                setSelectedChat(newChat);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || "Failed to create chat");
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
                setChats(data.data);

                if (data.data.length === 0) {
                    await createNewChat();
                } else {
                    // sort by updatedAt
                    data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setSelectedChat({ ...data.data[0], messages: data.data[0].messages || [] });
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || "Failed to fetch chats");
        }
    }

    useEffect(() => {
        if (user) fetchUserChats();
    }, [user]);

    const value = { user, chats, setChats, selectedChat, setSelectedChat, fetchUserChats, createNewChat };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
