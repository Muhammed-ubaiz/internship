import  { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Mentorlogin() {
const navigate = useNavigate()

const [email,setEmail]=useState("")
const [password,setPassword]=useState("")

const login = async (e) => {
  e.preventDefault();



  try {
    const res = await axios.post(
      "http://localhost:3001/mentor/mentorlogin",
      { email, password },
      
    );



    if (!res.data.success) {
      alert(res.data.message || "Login failed");
      return;
    }

    navigate("/mentordashboard");

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert(error.response?.data?.message || "Something went wrong");
  }
};


  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-[#EEF6FB] p-8 rounded-2xl shadow-2xl w-[90%] max-w-md">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-[#1679AB] mb-6">
         MENTOR LOGIN
        </h2>
        <p className="text-center text-gray-400 mb-8">
          Login to your account
        </p>

        {/* Form */}
        <form onSubmit={login}
        // onSubmit={(e)=>{handleSubmit(e)}}
        className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[#1679AB] mb-2">Email</label>
            <input
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg  text-black border border-gray-700 focus:outline-none focus:border-[#141E46]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#1679AB] mb-2">Password</label>
            <input
            value={password}
             onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg  text-black border border-gray-700 focus:outline-none focus:border-[#141E46]"
            />
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center gap-2">
              
            </label>
            <a href="#" className="hover:text-[#1679AB]">
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
          
            type="submit"
            className="w-full py-3 bg-[#141E46] hover:bg-[#2e3656] text-white font-semibold rounded-lg transition"
          >
            Login
          </button>
        </form>

        {/* Signup */}
        <p className="text-center text-gray-400 mt-6">
          Don’t have an account?{" "}
          <span className="text-[#1679AB] hover:underline cursor-pointer">
            Sign up
          </span>
        </p>
      </div>
    </div>
    </>
  )
}

export default Mentorlogin
