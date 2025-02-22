import React, { useState , useRef} from 'react'
import { useChatStore } from '../store/useChatStore'
import {Image, Send , X} from 'lucide-react'
import toast from 'react-hot-toast'
const MessageInput = () => {

    const [text,setText] = useState("")
    const [imagePreview,setImagePreview] = useState(null)
    const fileInputRef = useRef(null)
    const {sendMessage} = useChatStore()

    const hanldeImageChange = (e) =>{
      const file = e.target.files[0]
      if(!file.type.startsWith("image/")){
        //If file is not an image
        toast.error("Please select an image file")
        return 
      }
      const reader = new FileReader()
      reader.onloadend = () =>{
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
    const removeImage = ()=>{
      setImagePreview(null)
      if(fileInputRef.current) {
        fileInputRef.current.value = "" //If the input exists make it null
      }
    }

    const handleSendMessage = async(e) =>{
      e.preventDefault()
      if(!text.trim() &&!imagePreview) return
      try {
        await sendMessage({
          text : text.trim(),
          image : imagePreview,
        })

        //Clear Form -> Message input field once we send the message
        setText("")
        setImagePreview(null)
        if(fileInputRef.current) fileInputRef.current.value = ""
      } catch (error) {
          console.error("Failed to send message : ",error)
      } 
    }

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
        <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
          <div className='flex-1 flex gap-2'>
            <input type="text"
              className='w-full input input-bordered rounded-lg input-sm sm:input-md'
              value={text}
              onChange={(e)=>setText(e.target.value)}
            />
            {/* Input Select Images from our device -> WHY IS THIS INPUT HIDDEN ? cause if we dont hide then it then it will show a input box -> choose file which look ugly on the UI */}
            <input type="file" accept='image/*' className='hidden' ref={fileInputRef} onChange={hanldeImageChange} />
            <button type='button' className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
              onClick={()=> fileInputRef.current?.click()}
            >
              <Image size ={20} />
            </button>
          </div>
          <button type='submit' className='btn btn-sm btn-circle' disabled={!text.trim() && !imagePreview}>  
            {/* Disable the button if there is not text or image to send so that the user is not able to send a empty message */}
            <Send size={22}/>
          </button>
        </form>
      </div>
  )
}

export default MessageInput