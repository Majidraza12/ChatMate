import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import {Eye,EyeOff, Loader} from "lucide-react"
import {useNavigate} from 'react-router-dom'

const ResetPage = () => {
  const { step, forgetPassword, verifyOTP, resetPassword ,isSendingOTP,isVerifyingOTP,isResettingPassword} = useAuthStore();
  const [showPassword,setShowPassword] = useState(false)
  const [showPassword2,setShowPassword2] = useState(false)
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState(''); // Confirm Password field
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
  });
  const navigate = useNavigate()

  const handleShowPassword = ()=>{
    showPassword ? setShowPassword(false) : setShowPassword(true)
  }
  const handleShowPassword2 = ()=>{
    showPassword2 ? setShowPassword2(false) : setShowPassword2(true)
  }

  useEffect(() => {
    if (step === 0) {
      navigate("/login"); // Replace "/login" with the path to your login page
    }
  }, [step, navigate]);

  // Handle email submission (Request OTP)
  const handleEmailSubmit = async () => {
    if (formData.email.trim() === '') return toast.error('Please enter an email');
    try {
      await forgetPassword(formData); // Assuming `forgetPassword` takes the email as a parameter
    } catch (error) {
      console.error(error);
      toast.error('Failed to send OTP');
    }
  };

  // Handle OTP verification
  const handleOtpVerify = async () => {
    if (formData.otp.trim() === '') return toast.error('Please enter OTP');
    try {
      await verifyOTP(formData); // Assuming `verifyOTP` takes email and OTP as parameters
    } catch (error) {
      console.error(error);
      toast.error('OTP verification failed');
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (password !== password2) {
      console.error('Passwords do not match');
      return toast.error('Passwords do not match');
    }
    if(password.length < 6){
        return toast.error('Password should atleast Contain 6 Characters')
    }
    console.log("Password : ",password)
    // setFormData({ ...formData, password: password }); // Update formData with password
    const updatedFormData = { ...formData, password };
    console.log(updatedFormData)
    try {
      await resetPassword(updatedFormData); // Assuming `resetPassword` takes email and new password as parameters
      toast.success('Password reset was successful');
    } catch (error) {
      console.error(error);
      toast.error('Password reset failed');
    }
  };

  return (
    <div className="h-screen flex justify-center">
      <div className="flex flex-col mt-20 items-center p-6">
        <p className="text-4xl font-bold">Reset Your Password</p>
        {step === 1 && (
          <div className="flex flex-col w-full">
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input input-bordered  mb-4 mt-10"
            />
            <button onClick={handleEmailSubmit} className="btn btn-primary mx-auto" >
                {isSendingOTP ? (<Loader className='animate-spin'/>) : "Request OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col mt-10">
            <p className="mb-2 text-sm mt-2">OTP sent to: {formData.email}</p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              className="input input-bordered w-full mb-4"
            />
            <button onClick={handleOtpVerify} className="btn btn-primary mx-auto">
            {isVerifyingOTP ? (<Loader className='animate-spin'/>) : "Verify OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col mt-10 w-full gap-4">
            <div className='relative'>
                <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
               className="input input-bordered w-full pr-10"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" onClick={handleShowPassword}> {
                        showPassword ? <EyeOff/> : <Eye/>
                    }</button>
            </div>
            <div className='relative'>
                <input
                type={showPassword2 ? "text" : "password"}
                placeholder="Confirm new password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                  className="input input-bordered w-full pr-10"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={handleShowPassword2}
                >
                    {
                        showPassword2 ? <EyeOff/> : <Eye/>
                    }
                </button>
            </div>
            <button onClick={handlePasswordReset} className="btn btn-success mx-auto">
            {isSendingOTP ? (<Loader className='animate-spin'/>) : "Reset Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPage;
