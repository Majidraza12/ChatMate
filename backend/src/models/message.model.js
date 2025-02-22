import mongoose, { mongo, Schema } from "mongoose";

const messageSchema =  new mongoose.Schema({
    senderId : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User", //Reference to the User model as both the sender and the reciever will be users
        required : true
    },
    receiverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    text : {
        type : String,
    },
    image : {
        type :String
    }
    //Why Both text and image are not required as a message could either be a text or a image or both
},
{
    timestamps :true
}
)

const Message = mongoose.model("Message",messageSchema) //messages 

export default Message