import React, { useEffect } from 'react'
import { Routes ,Route, Navigate} from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import SignUpPage from './pages/SignUpPage'
import Navbar from './components/Navbar'
import { axiosInstance } from './lib/axios'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'
import {Toaster} from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'
import ResetPage from './pages/ResetPage'

const App = () => {


  const {authUser,checkAuth,isCheckingAuth,onlineUsers} = useAuthStore()
  const {theme} = useThemeStore()

  console.log("Online Users :" ,onlineUsers)

  useEffect(()=>{
    checkAuth()
  },[checkAuth])

  console.log({authUser})

  if(isCheckingAuth && !authUser) return (
    <div className='flex items-center justify-center h-screen'>
      <Loader className='size-10 animate-spin'/>
    </div>
  )

  return (
    <div data-theme={theme}>
      <Navbar/>
      <Routes>
        <Route path='/' element={authUser ? <HomePage/> : <LoginPage/>}/>
        <Route path='/signup' element={!authUser ? <SignUpPage/>: <Navigate to="/" />}/>
        <Route path='/login' element={ !authUser ? <LoginPage/> : <Navigate to="/" />}/> 
        {/* //If user is authenticated then navigate to Home Page */}
        <Route path='/settings' element={authUser? <SettingsPage/> : <LoginPage/>}/>
        <Route path='/profile' element={authUser ?<ProfilePage/>:<LoginPage/>}/>
        <Route path='/forgetPassword' element={!authUser ? <ResetPage/> : <Navigate to="/"/>}/>
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App