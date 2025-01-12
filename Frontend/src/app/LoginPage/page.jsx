'use client';
import React from "react";
import AuthForm from "../../Components/AuthForm";
import {useDarkMode} from "../DarkModeContext"

const LoginPage = () => {
  const { darkMode } = useDarkMode();
  
  return (
    <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Left Side Animated Elements */}
      <div className="fixed left-0 top-0 h-full w-1/4 pointer-events-none">
        <div className={`absolute w-full h-full ${darkMode ? "opacity-10" : "opacity-20"}`}>
          {/* Floating circles */}
          <div className={`absolute w-24 h-24 rounded-full animate-[float_20s_ease-in-out_infinite] top-1/4 left-12
            ${darkMode ? "bg-white" : "bg-gray-400"}`}
          />
          <div className={`absolute w-16 h-16 rounded-full animate-[float_15s_ease-in-out_infinite] top-2/4 left-24
            ${darkMode ? "bg-white" : "bg-gray-400"}`}
          />
          {/* Pulsing circle */}
          <div className={`absolute w-32 h-32 rounded-full animate-pulse top-3/4 left-16
            ${darkMode ? "bg-white" : "bg-gray-300"}`}
          />
          {/* Geometric shapes */}
          <div className={`absolute w-20 h-20 rotate-45 animate-[spin_15s_linear_infinite] top-1/3 left-32
            ${darkMode ? "border-2 border-white" : "border-2 border-gray-400"}`}
          />
        </div>
      </div>

      {/* Right Side Animated Elements */}
      <div className="fixed right-0 top-0 h-full w-1/4 pointer-events-none">
        <div className={`absolute w-full h-full ${darkMode ? "opacity-10" : "opacity-20"}`}>
          {/* Floating circles */}
          <div className={`absolute w-20 h-20 rounded-full animate-[float_18s_ease-in-out_infinite] top-1/3 right-16
            ${darkMode ? "bg-white" : "bg-gray-400"}`}
          />
          <div className={`absolute w-12 h-12 rounded-full animate-[float_25s_ease-in-out_infinite] top-2/3 right-24
            ${darkMode ? "bg-white" : "bg-gray-400"}`}
          />
          {/* Ripple effect */}
          <div className={`absolute w-40 h-40 rounded-full animate-[ping_3s_ease-in-out_infinite] top-1/2 right-20
            ${darkMode ? "bg-white" : "bg-gray-200"}`}
          />
          {/* Rotating triangle */}
          <div className={`absolute w-0 h-0 
            border-l-[30px] border-l-transparent
            border-r-[30px] border-r-transparent
            border-b-[50px] 
            animate-[spin_10s_linear_infinite]
            top-1/4 right-32
            ${darkMode ? "border-b-white" : "border-b-gray-400"}`}
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center relative z-10">
        {/* Logo or Brand Section */}
        <div className="mb-8 text-center">
          <h1 className={`text-4xl font-extrabold ${darkMode ? "text-white" : "text-black"} mb-2`}>
            Welcome to BiteBox
          </h1>
          <p className={`${darkMode ? "text-white" : "text-black"}`}>
            Sign in to access your account
          </p>
        </div>
       
        {/* Auth Form Container with enhanced shadow and backdrop blur */}
        <div className={`w-full max-w-md ${darkMode ? "bg-gray-600" : "bg-white/95"} 
          backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.1)] 
          p-8 space-y-6 border border-white/20
          transition-all duration-300 ease-in-out z-0
          hover:shadow-[0_0_50px_rgba(0,0,0,0.15)]`}>
          <AuthForm />
        </div>
       
        {/* Footer */}
        <div className={`mt-8 text-center ${darkMode ? "text-blue-100" : "text-black"} text-sm`}>
          <p>© 2024 BiteBox. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;