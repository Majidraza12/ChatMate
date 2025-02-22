import express from 'express'
import { signup , login , logout , updateProfile ,checkAuth, forgetPassword, verifyOTP, resetPassowrd  } from '../controllers/auth.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'
const router = express.Router()
router.post("/signup",signup)
router.post('/login' ,login)
router.post('/logout',logout)
router.post('/forget-password',forgetPassword)
router.post('/verify-otp',verifyOTP)
router.post('/reset-password',resetPassowrd)
//We have to make sure that the user is logged in before they access the updateProfile route -> protectRoute -> serves as a middleware here
router.put('/update-profile',protectRoute,updateProfile)
router.get('/check',protectRoute,checkAuth)
export default router