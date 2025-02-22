import User from "../models/user.models.js"
import bcrypt from 'bcryptjs'
import { generateToken } from "../lib/utils.js"
import cloudinary from "../lib/cloudinary.js"
import nodemailer from 'nodemailer'

export const signup =  async (req,res)=>{
    const {fullName,email,password} = req.body 
    try {
        if (!password || !fullName || !email){
            return res.status(400).json({message : "All fields are required"})
        }
        //hash password
        if (password.length < 6){
            return res.status(400).json({ message : "Password must be atleast 6 characters"})
        }
        const user = await User.findOne({email})
        if (user){
            return res.status(400).json({message : "Email Already exists"})
        }
        //If the email is not registered we will store the users into the database and to do that first we will hash the users password using bycrypt JS module
        const salt = await bcrypt.genSalt(10)
        //This generates a random salt value -> A salt is a random string added to the password before hashing. It helps prevent rainbow table attacks by ensuring the hash is unique even for identical passwords -> genSalt(10) -> 10 is the cost factor or number of rounds of processing applied to genrate the salt -> higheer the number slower and secure -> 10 usually used
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser =  new User({
            fullName,
            email ,
            password : hashedPassword
        }) //User created and send to the Database
        if(newUser){
            //Generate JWT Token
            generateToken(newUser._id,res)
            await newUser.save() //save the new user to the database

            res.status(200).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic: newUser.profilePic
            })
        }
        else{
            res.status(400).json({message : "Invalid User Data"})
        }

    } catch (error) {
        console.log("Error in SignUp controller",error)
        res.send(500).json({
            message : "Internal Server Error"
        })
    }
}
export const login = async (req,res)=>{
    const {email,password}  = req.body
    console.log(req.body)
    try {
        const user = await User.findOne({email})
        if (!user){
            return res.status(404).json({message : "Invalid Credentials"})
        }
        const isPassword = await bcrypt.compare(password,user.password)
        console.log(isPassword)
        //password -> the user input
        //user.password -> password stored in the database
        if (!isPassword){
            return res.status(404).json({message : "Invalid Credentials"})
        }
        else{
            //The password is correct we will Generate the Token
            generateToken(user._id,res)

            return res.status(200).json({
                _id:user._id,
                fullName:user.fullName,
                email:user.email,
                profilePic: user.profilePic
            })
        }
    } catch (error) {
        console.log("Error in Login Controller",error.message)
        res.status(500).json({message : "Internal Sever Error"})
    }
}
export const logout = (req,res)=>{
    //when the user wants to logout all we have to do is to clear out the cookies
    try {
        res.cookie("jwt","",{maxAge : 0})
        res.status(200).json({message : "logged out successfully"})
    } catch (error) {
        console.log("Error in logout controller",error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}
export const updateProfile = async (req,res)=>{
    //Cloudinary
    try {
        const {profilePic} = req.body
        const userId = req.user._id

        if(!profilePic){
            res.status(400).json({message : "Profile pic is required"})
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic : uploadResponse.secure_url}, {new : true})
        // By default, findOneAndUpdate() returns the document as it was before update was applied. If you set new: true, findOneAndUpdate() will instead give you the object after update was applied.

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("Error in Update Profile Controller:",error)
        res.status(500).json({message : "Internal Server Error"})
    }
}
export const checkAuth = (req,res) =>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller",error.message)
        res.status(500).json({error : "Internal Server Error"})
    }
}
export const forgetPassword = async (req,res)=>{
    try {
        const {email} = req.body //Getting users email from body
        //Check if the email exists or no
        console.log(req.body)
        console.log(email)
        const user = await User.findOne({email})
        console.log(user)
        if(!user){
            return res.status(401).json({message:"User Doesn't exist"})
        }
        //Generate OTP (6-digit random number)
        const otp = Math.floor(100000 + Math.random() * 900000).toString()//A six digit OTP
        //Encrypt the OTP using Bcrypt
        const saltRounds = 10
        const hashedOTP = await bcrypt.hash(otp,saltRounds)
        user.resetPasswordOTP = hashedOTP
        user.resetPasswordExpires = Date.now() + 15 * 60 *1000 //valid for 15 mins
        await user.save() //Save the user in the Data
    
        //Now email the user the OTP using Nodemailer
        //First Create a transpoter
        const transporter = nodemailer.createTransport({
            service : 'Gmail',
            auth : {
                user : process.env.ADMIN_EMAIL,
                pass : process.env.ADMIN_PASSWORD,
            },
        })
    
        //Sending the email to the user
        try {
            await transporter.sendMail({
                to:email, //users email
                subject:'Reset Password OTP',
                text:`Your OTP is : ${otp}.It is valid for 10 minutes`
            }) 
            res.status(200).json({message:"OTP has been sent succesfully"})
        } catch (error) {
            res.status(400).json({message:"Error in send otp email to user"})
            console.error(error)
        }
    } catch (error) {
        res.status(400).json({message : "Error in forgetPassword controller"})
        console.error(error)
    }
}
export const verifyOTP = async (req,res) =>{
    try {
        const {email,otp} = req.body
        console.log(req.body)
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        if(!user.resetPasswordOTP || !user.resetPasswordExpires){
            return res.status(400).json({message : "OTP was not requested"})
        }

        //VERIFY THE OTP using bcrypt compare
        const isMatch = await bcrypt.compare(otp,user.resetPasswordOTP)
        console.log(isMatch)
        //If the otp doesnt matches or its has expired return error
        if(!isMatch){
            return res.status(400).json({message : "Invalid OTP"})
        }
        if(user.resetPasswordExpires < Date.now()){
            return res.status(400).json({message : "OTP expired"})
        }
        return res.status(200).json({message:"OTP verified"})
    } catch (error) {
        res.status(401).json({message:"Error in verify OTP controller"})
        console.error(error)
    }
}
export const resetPassowrd = async (req,res) =>{
    const {email,password} = req.body
    try {
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message:"User doesn't exist"})
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        user.password = hashedPassword
        user.resetPasswordOTP = null
        user.resetPasswordExpires = null
        await user.save()
        return res.status(200).json({message : "Password reset Successful . You can login now"})
    } catch (error) {
        res.status(401).json({message:"Error in reset password controller"})
        console.error(error)
    }
}