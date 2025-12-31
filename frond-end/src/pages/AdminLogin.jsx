import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminLogin() {

    const  [email,setEmail] = useState()
    const  [password,setPassword] = useState()

    const navigate = useNavigate()
     
    const handlesubmit = async(e)=>{
      e.preventDefault();

      try {
        const respones = await axios.post("http://localhost:5001/admin/Login",{
          email,
          password
    
        })

        if(respones.data.success){
          navigate("/home")
        }

      } catch (error) {
        console.log(error);
        
      }
    }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-gray-400 mb-8">
          Login to your account
        </p>

        {/* Form */}
        <form
        onSubmit={(e)=>{handlesubmit(e)}}
        className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
            onChange={(e)=>setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              onChange={(e)=>setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-green-500" />
              Remember me
            </label>
            <a href="#" className="hover:text-green-400">
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition"
          >
            Login
          </button>
        </form>

        {/* Signup */}
        <p className="text-center text-gray-400 mt-6">
          Don’t have an account?{" "}
          <span className="text-green-400 hover:underline cursor-pointer">
            Sign up
          </span>
        </p>
      </div>
    </div>
    </>
  )
}

export default AdminLogin
