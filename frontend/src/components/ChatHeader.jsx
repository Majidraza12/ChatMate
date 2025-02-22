import React from 'react'
import {useAuthStore} from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import {X} from "lucide-react"

const ChatHeader = () => {

    const {selectedUser,setSelectedUser} = useChatStore()
    const {onlineUsers} = useAuthStore() 

  return (
    <div className='p-2.5 border-b border-base-300'>
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                {/* Avatar Of The User */}
                <div className='avatar'>
                    <div className='size-10 rounded-full relative'>
                        <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
                    </div>
                </div>
                {/* User Info Section */}
                <div >
                    <h3 className='font-medium'>{selectedUser.fullName}</h3>
                    <p className='font-medium'>
                        {onlineUsers.includes(selectedUser._id) ? "Online" : "Offine"}
                    </p>
                </div>
            </div>
            {/* Close Button */}
            <button onClick={()=>setSelectedUser(null)}>
                    <X/>
            </button>
        </div>
    </div>
  )
}

export default ChatHeader