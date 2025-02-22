import {create} from 'zustand'
import toast from 'react-hot-toast'
import {axiosInstance} from "../lib/axios"
import {useAuthStore} from './useAuthStore'


export const useChatStore = create((set,get)=>({
    messages : [],
    users:[] ,
    selectedUser:null, //The user that we want to chat with
    isUsersLoading:false,
    isMessagesLoading:false,


    getUsers : async ()=>{
        set({isUsersLoading : true})
        try {
            const res = await axiosInstance.get("/messages/users")
            console.log("Users Response Data : ",res.data)
            set({users:res.data})
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isUsersLoading : false})
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true }); // Set to true at the start of the async process
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            console.log(userId)
            console.log(res.data)
            set({ messages: res.data }); // Update messages state
        } catch (error) {
            console.error("Error fetching messages:", error); // Log full error for debugging
            toast.error(error.response?.data?.message || "Failed to fetch messages"); // Handle cases where error.response or data is undefined
        } finally {
            set({ isMessagesLoading: false }); // Ensure state is updated after the process ends
        }
    },
    sendMessage: async (messageData) =>{
        //To get state value in zustand we use the get function to destructure the state that we want to work with
        const {selectedUser , messages} = get()
        try {
            const res =  await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData)
            set({messages : [...messages,res.data]})
            //By using the spread operator here we keep the previous messages and append the new message that we send to messages 
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send Message")
        }
    },
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
        const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
        if (!isMessageSentFromSelectedUser) return;

        set({
            messages: [...get().messages, newMessage],
        });
        });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

})) 