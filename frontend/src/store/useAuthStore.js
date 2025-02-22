//Here we can store different states and functions that we can use in different components

import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useState } from "react";
import toast from "react-hot-toast";
import {io} from "socket.io-client"

//const [authUser,setAuthUser] = useState('')

const BASE_URL = "http://localhost:5001"

export const useAuthStore = create((set,get)=>({
    authUser : null, //authUser state is null
    isCheckingAuth : true, //Loading state
    isSigningUp : false, //Is the user signing Up loading State
    isLogingIn : false, //Is the user trying to LogIn state
    isUpdatingProfile:false, //Is the user trying update there profile
    onlineUsers : [],//List of all online users
    isSendingOTP: false, //If t
    isVerifyingOTP:false,
    isResettingPassword:false,
    socket : null,
    isValid: true,
    step : 1,


    checkAuth : async () =>{
        try {
            const res = await axiosInstance.get("/auth/check")
            set({authUser:res.data})
            //If u are authenticated then u should be connecting to the socket 
            get().connectSocket()
        } catch (error) {
            console.log("Error in CheckAuth:",error)
            set({authUser:null})
        }finally{
            set({isCheckingAuth:false})
        }
    },

    signup : async (data)=>{
        try {
            const res = await axiosInstance.post("/auth/signup",data)
            set({authUser :res.data })
            toast.success("Account Created Successfully")
            //As soon as we login successfully we need to connect to the socket.io server 
            get().connectSocket
        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error)
        }finally{
            set({isSigningUp:false})
        }
    },
    logout : async () =>{
        try {
            //We can add a state For logging out functionality But it is super Quick so we can work without it as well
            const res = await axiosInstance.post("auth/logout")
            set({authUser:null})
            toast.success("Logged out successfully")
            //We logout successfully we need to disconnect from the socket.io server that we connected to when we logged in
            get().disconnectSocket()
        } catch (error) {
            console.log("Error in Logout: ",error)
            console.log(error)
        }
    },
    login : async (data) =>{
        set({isLogingIn : true})
        try {
            console.log("Frontend send : ",data)
            const res = await axiosInstance.post("/auth/login",data)
            set({authUser:res.data})
            toast.success("logged In")
            //Once the user is logged In successfully we have to make sure that the user is connected to the server
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
            set({isValid : false})
            console.log(error)
        }finally{
            set({isLogingIn:false})
        }
    },
    updateProfile : async (data) =>{
        set({isUpdatingProfile:true})
        try {
            const res = await axiosInstance.post("/auth/update-profile",data)
            set({authUser:res.data})
            toast.success("Profile Picture Updated")
        } catch (error) {
            console.log("Error in update profile :",error)
            toast.error(error.response.data.message)
        }finally{
            set({isUpdatingProfile :false})
        }
    },
    connectSocket : async ()=>{
        const {authUser} = get()
        //If the user is not authenticated or if already a socket connection exists then return out of the function 
        if (!authUser || get().socket?.connected) return 
        const socket = io(BASE_URL,{
            query :{
                userId : authUser._id
            }
        });
        socket.connect()
        set({socket : socket})

        socket.on("getOnlineUsers", (userIds)=>{
            set({onlineUsers:userIds})
        })
    },
    disconnectSocket : async ()=>{
        //When we close our browser we are automatically disconnected 
        //But if a user is still connected then disconnect him
        if(get().socket?.connected) get().socket.disconnect()
    },
    forgetPassword: async (data) => {
        set((state)=>({...state,isSendingOTP:true}))
        try {
            console.log("Frontend send: ",data)
            const res = await axiosInstance.post("/auth/forget-password", data);
            toast.success("OTP sent successfully");
    
            // Correct way to update step in Zustand store
            set((state) => ({ ...state, step: 2 })); // Moves to step 2 after OTP is sent
    
        } catch (error) {
            // Safely handle error if the error response is undefined
            const errorMessage = error?.response?.data?.message || "An error occurred";
            toast.error(errorMessage);
            console.log(error);
        }finally{
            set((state)=>({...state,isSendingOTP:false}))
        }
    },
    verifyOTP : async(data) =>{
        set((state)=>({...state,isVerifyingOTP:true}))
        try {
            console.log("Frontend send : ",data)
            const res = await axiosInstance.post("/auth/verify-otp",data)
            toast.success("OTP verified")
            set((state) => ({ ...state, step: 3 }));
        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error)
        }finally{
            set((state)=>({...state,isVerifyingOTP:false}))
        }
    },
    resetPassword : async(data)=>{
        set((state)=>({...state,isResettingPassword:true}))
        try {
            console.log("Frontend send : ",data)
            const res = await axiosInstance.post("/auth/reset-password",data)
            toast.success("Password Reset was successful")
            set((state) => ({ ...state, step: 0 }));
            set((state)=>({...state,isValid:true}))
        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error)
        }finally{
            set((state)=>({...state,isResettingPassword:false}))
        }
    }
}))