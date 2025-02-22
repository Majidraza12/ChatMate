import express from "express"
import router from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import cookieParser from 'cookie-parser'
import cors from 'cors'
import {app,server} from './lib/socket.js'
dotenv.config()

// const app = express() 
//Delete this app as we have already created on in our socket.js file
const port = process.env.PORT

app.use(cors({
    origin : process.env.CORS_ORIGIN, //CORS_ORIGIN -> reactapplication url
    credentials : true
}))
app.use(express.json())
//Allows us to extract JSON data from the Body
app.use(cookieParser())
//Cookie Parser allows us to parse the cookie and grab the values out of it 
app.use("/api/auth", router)
app.use("/api/messages",messageRoutes)

// app.get('/',(req,res)=>{
//     res.send(200).json({message : "This is HOME PAGE/route"})
// })


// app.get('/test',(req,res)=>{
//     res.send("this is test route")
//     console.log("This is test Route")
// })
//We will replace the app.listen with server.listen here
server.listen(5001,()=>{
    console.log(`server is running on port ${port}`)
    connectDB()
})

