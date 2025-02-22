import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId,io } from '../lib/socket.js'
import Message from '../models/message.model.js'
import User from '../models/user.models.js'

export const getUsersForSidebar = async (req,res) =>{
    try {
        const loggedInUserId = req.user._id //We can grab the user from the request because this route is protected -> as the user is authenticated when the route it accessed
        //here we just need to show all the users expect the user itself
        // console.log(req.user_id)
        // console.log(loggedInUserId)
        const filteredUsers = await User.find({_id : {$ne: loggedInUserId}}).select("-password") //Find all the users where the id is not equal to the logged In user Id
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error in getUsersForSidebar : ",error.message)
        res.status(500).json({error : "Internal Server Error"})
    }
}

export const getMessages = async (req,res) =>{
    try {
        const {id:userToChatId} = req.params //we call it id as we mentioned id in route -> could be anything but it should be consistent
        const senderId = req.user._id

        const messages = await Message.find({
            $or:[
                {
                    senderId:senderId,
                    receiverId: userToChatId,
                },
                {
                    senderId:userToChatId,
                    receiverId:senderId,
                }
                //To Get Messages Between 2 users
            ]
        })
        res.status(200).json(messages || "no messages Found")
    } catch (error) {
        console.log("Error in Get Messages Controller",error.message)
        res.status(500).json({error : "Internal Server Error"})
    }
}
export const sendMessages = async (req,res) =>{
    try {
        const {text,image} = req.body
        const {id:receiverId} = req.params  //getting Id and renamming it to recieverId
        const senderId = req.user._id

        let imageUrl;
        if(image) { //if the user sends an image
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }
        //Create a New message
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image : imageUrl
        })
        await newMessage.save() //Save the message to the Database

        //Todo : realtime functionality goes here => with the help of socket.io

        const receiverSocketId = getReceiverSocketId(receiverId)
        console.log(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
            //As we know that io.emit() send the event to all available users therefore we use io.to().emit() to send the message to a particular user
        }

        res.status(200).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage Controller",error.message)
        res.status(500).json({error:"Internal Server Error"})
    }
}
