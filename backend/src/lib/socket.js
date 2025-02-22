import {Server} from "socket.io"
import http from 'http'
import express from "express"
import dotenv from "dotenv"
dotenv.config()

//Create a normal http server
const app = express()
//Create a server
const server = http.createServer(app)


//Implementing Online Users
//used to store online users
const userSocketMap = {} //{userId : SocketId}

//Create a socket.io server
const io = new Server(server,{
    cors:{
        origin:[process.env.CORS_ORIGIN]
    }
})

export function getReceiverSocketId(userId){
    return userSocketMap[userId]
    //as userSocketMap store userId and socketId as keyvalue pairs therefore doing this will return users socketId
}
io.on("connection",(socket)=>{
    //socket is the user trying to connect
    console.log("A user connected",socket.id)

    const userId = socket.handshake.query.userId
    if (userId) userSocketMap[userId] = socket.id
    //io.emit() is used to send event to all the connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
    //getOnlineUsers is the name of the event/method

    socket.on("disconnect",()=>{
        console.log("A user disconnected",socket.id)
        //Once the user disconnects remove him from userSocketMap so online users are updated
        // Find and remove the disconnected user's ID from userSocketMap
        const userId = Object.keys(userSocketMap).find((key) => userSocketMap[key] === socket.id);
        if (userId) delete userSocketMap[userId];

        // Update online users after removal
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export {io,app,server}