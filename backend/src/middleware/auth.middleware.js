import jwt from "jsonwebtoken"
import User from '../models/user.models.js'


export const protectRoute = async (req,res,next) =>{
    try {
        const token = req.cookies.jwt //jwt is the name of token that we defined in our utils.js file
        if(!token){
            return res.status(401).json({message : "Unauthorized - No Token Provided"})
        }
        //Since we have the token we have to validate if the token is valid or no -> we can decode the userId as we used userId a our payload increating the token
        const decodedUserId = jwt.verify(token,process.env.JWT_SECRET)
        const userId = decodedUserId.userId //Doing this so that userId contains the userId of the decoded payload -> When you pass userId to the payload, it is stored as a string in the JWT. When you decode the token, you get the same string. To use it with MongoDB queries, you need to extract it properly and ensure it's in the correct format for MongoDB (ObjectId if that's what MongoDB expects for _id).
        if(!userId){
            return res.status(401).json({message : "Unauthorized - Invalid Token"})
        }
        //Now since the Token is valid -> we will find the user in the DB
        const user = await User.findById(userId).select("-password") //select everything except the password as it wont be secure to send the password back to the client
        if(!user){
            return res.status(404).json({message : "User not found"})
            //To make our code more robust
        }
        req.user = user
        next() //As we are using this as a middleware once we are done with we will move to the next function
    } catch (error) {
        console.log("Error in protectRoute middleware",error)
        res.status(500).json({message : "Internal server Error"})
    }
}