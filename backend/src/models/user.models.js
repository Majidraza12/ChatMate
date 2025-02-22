import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : true,
        unique : true,
        // lowercase : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true
    },
    password : {
        type : String,
        required : [true,"Password is Required"] ,//Custom messagees
        unique : true,
        minlenght : 6
    },
    profilePic : {
        type : String, //Store the url of cloudinary upload
        default : "",
        required : false
    },
    resetPasswordOTP:{
        type:String, //Store Hashed OTP
        default:null,
    },
    resetPasswordExpires:{
        type:Date,  //OTP expiry time 
        default:null,
    }
},
    {
        timestamps : true
    }
)
//Once we have created a schema then we can create a model 
const User = mongoose.model("User",userSchema)
//this User becomes user automatically -> Mongoose wants us to keep it singular and first character capital -> in Database it becomes -> Users
export default User
