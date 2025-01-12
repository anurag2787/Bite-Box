"use client";

import React from "react";
import Image from "next/image";
import { useDarkMode } from "../DarkModeContext";
import { UserAuth } from "../context/AuthContext";

function ProfilePage() {
  const { darkMode } = useDarkMode();
  const { user, logOut } = UserAuth();

  const handleSignOut = async () => {
    try {
      await logOut();
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-8
        bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        
        {/* Loader Animation */}
        <div className="relative">
          {/* Spinning outer ring */}
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-b-transparent
            border-x-blue-500 animate-[spin_1s_linear_infinite]">
          </div>
          
          {/* Inner pulsing circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-8 h-8 rounded-full bg-blue-400
            animate-[pulse_1.5s_ease-in-out_infinite]">
          </div>
        </div>
  
        {/* Loading Text with Typing Animation */}
        <div className="flex items-center gap-1">
          <p className="text-lg font-medium text-gray-200
            animate-[fadeIn_0.5s_ease-out]">
            Loading user details
          </p>
          <span className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-400
                  animate-[bounce_1s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        </div>
  
        {/* Loading Progress Ring */}
        <div className="w-48 h-1 rounded-full bg-gray-700 overflow-hidden">
          <div className="h-full rounded-full bg-blue-400
            animate-[loadingProgress_2s_ease-in-out_infinite]">
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen relative overflow-hidden flex items-center justify-center px-4 
      ${darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}
      transition-colors duration-300`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Keep existing animated elements */}
        <div className={`absolute top-10 left-10 w-32 h-32 rounded-full 
          ${darkMode ? "bg-white/5" : "bg-blue-200/20"} 
          animate-[float_20s_ease-in-out_infinite]`} />
        <div className={`absolute top-40 left-20 w-20 h-20 
          ${darkMode ? "bg-white/5" : "bg-purple-200/20"} 
          rounded-lg rotate-45 animate-[spin_15s_linear_infinite]`} />
        <div className={`absolute top-20 right-20 w-24 h-24 
          ${darkMode ? "bg-white/5" : "bg-pink-200/20"} 
          rounded-full animate-[float_18s_ease-in-out_infinite]`} />
        <div className={`absolute top-60 right-40 w-16 h-16 
          ${darkMode ? "bg-white/5" : "bg-yellow-200/20"} 
          rounded-full animate-pulse`} />
        <div className={`absolute bottom-10 left-1/4 w-40 h-40 
          ${darkMode ? "bg-white/5" : "bg-green-200/20"} 
          rounded-full animate-[ping_3s_ease-in-out_infinite]`} />
        <div className={`absolute bottom-20 right-1/4 w-28 h-28 
          ${darkMode ? "bg-white/5" : "bg-blue-200/20"} 
          rounded-full animate-[float_25s_ease-in-out_infinite]`} />
      </div>

      {/* Main Content Card - Now in Landscape */}
      <div className={`w-full max-w-5xl h-[480px] transform transition-all duration-500 hover:scale-102
        ${darkMode ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-200"}
        backdrop-blur-lg shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden border
        animate-[fadeIn_0.5s_ease-out] flex`}>
        
        {/* Left Section - Profile Image and Basic Info */}
        <div className={`w-1/3 relative flex flex-col items-center justify-center p-8 pt-0 border-r ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="animate-[slideDown_0.5s_ease-out]">
            <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden shadow-lg
              hover:scale-105 transition-transform duration-300 mx-auto">
              <Image
                src={user.photoURL || "/default-avatar.png"}
                alt="Profile Picture"
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className={`text-2xl font-bold mt-6 animate-[fadeIn_0.8s_ease-out] text-center
            ${darkMode ? "text-white" : "text-gray-800"}`}>
            {user.displayName || "User Profile"}
          </h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mt-2
            animate-[fadeIn_1s_ease-out] text-center`}>
            {user.email}
          </p>
        </div>

        {/* Right Section - User Details */}
        <div className="w-2/3 p-8 flex flex-col justify-between">
          <div>
            <div className={`${darkMode ? "bg-gray-700/50" : "bg-gray-50/80"}
              backdrop-blur-sm rounded-lg p-6 space-y-4 animate-[slideUp_0.5s_ease-out]`}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                User Details
              </h3>
              <div className="grid gap-4">
                {[
                  { label: "Display Name", value: user.displayName || "Not Set" },
                  { label: "Email", value: user.email },
                  {
                    label: "Account Created",
                    value: user.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : "Unknown",
                  },
                ].map((detail, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-3 px-4
                      hover:bg-gray-100/10 transition-colors duration-300 rounded-lg
                      ${index < 2 ? "border-b" : ""} 
                      ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                  >
                    <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {detail.label}
                    </span>
                    <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="mt-auto">
            <button
              onClick={handleSignOut}
              className={`w-full py-3 rounded-lg transition-all duration-300
                transform hover:-translate-y-1 hover:shadow-lg
                ${darkMode 
                  ? "bg-gradient-to-r from-blue-300 to-blue-900 hover:from-red-600 hover:to-pink-800 text-white" 
                  : "bg-gradient-to-br from-blue-400 to-blue-500  hover:from-blue-500 hover:to-blue-900 text-white"}`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;