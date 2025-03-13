"use client";

import React from "react";
import Image from "next/image";
import { useDarkMode } from "../DarkModeContext";
import { UserAuth } from "../context/AuthContext";
import Loader from "@/Components/loader";

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
      <div>
        <Loader/>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 md:px-4
      ${darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}
      transition-colors duration-300`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Keep existing animated elements */}
        <div className={`absolute top-10 left-10 w-16 md:w-32 h-16 md:h-32 rounded-full 
          ${darkMode ? "bg-white/5" : "bg-blue-200/20"} 
          animate-[float_20s_ease-in-out_infinite]`} />
        <div className={`absolute top-40 left-20 w-12 md:w-20 h-12 md:h-20 
          ${darkMode ? "bg-white/5" : "bg-purple-200/20"} 
          rounded-lg rotate-45 animate-[spin_15s_linear_infinite]`} />
        <div className={`absolute top-20 right-20 w-16 md:w-24 h-16 md:h-24 
          ${darkMode ? "bg-white/5" : "bg-pink-200/20"} 
          rounded-full animate-[float_18s_ease-in-out_infinite]`} />
        <div className={`absolute top-60 right-40 w-12 md:w-16 h-12 md:h-16 
          ${darkMode ? "bg-white/5" : "bg-yellow-200/20"} 
          rounded-full animate-pulse`} />
        <div className={`absolute bottom-10 left-1/4 w-24 md:w-40 h-24 md:h-40 
          ${darkMode ? "bg-white/5" : "bg-green-200/20"} 
          rounded-full animate-[ping_3s_ease-in-out_infinite]`} />
        <div className={`absolute bottom-20 right-1/4 w-20 md:w-28 h-20 md:h-28 
          ${darkMode ? "bg-white/5" : "bg-blue-200/20"} 
          rounded-full animate-[float_25s_ease-in-out_infinite]`} />
      </div>

      {/* Main Content Card */}
      <div className={`w-full max-w-5xl transform transition-all duration-500 hover:scale-102
        ${darkMode ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-200"}
        backdrop-blur-lg shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden border
        animate-[fadeIn_0.5s_ease-out] flex flex-col md:flex-row md:h-[480px]`}>
        
        {/* Profile Image and Basic Info Section */}
        <div className={`w-full md:w-1/3 relative flex flex-col items-center justify-center p-6 md:p-8 md:pt-0 
          ${darkMode ? "border-gray-700" : "border-gray-200"} 
          border-b md:border-b-0 md:border-r`}>
          <div className="animate-[slideDown_0.5s_ease-out]">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg
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
          <h1 className={`text-xl md:text-2xl font-bold mt-4 md:mt-6 animate-[fadeIn_0.8s_ease-out] text-center
            ${darkMode ? "text-white" : "text-gray-800"}`}>
            {user.displayName || "User Profile"}
          </h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mt-2
            animate-[fadeIn_1s_ease-out] text-center text-sm md:text-base`}>
            {user.email}
          </p>
        </div>

        {/* User Details Section */}
        <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className={`${darkMode ? "bg-gray-700/50" : "bg-gray-50/80"}
              backdrop-blur-sm rounded-lg p-4 md:p-6 space-y-3 md:space-y-4 animate-[slideUp_0.5s_ease-out]`}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 md:mb-4">
                User Details
              </h3>
              <div className="grid gap-3 md:gap-4">
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
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 md:py-3 px-3 md:px-4
                      hover:bg-gray-100/10 transition-colors duration-300 rounded-lg
                      ${index < 2 ? "border-b" : ""} 
                      ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                  >
                    <span className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-sm md:text-base`}>
                      {detail.label}
                    </span>
                    <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"} text-sm md:text-base mt-1 sm:mt-0`}>
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="mt-6 md:mt-auto">
            <button
              onClick={handleSignOut}
              className={`w-full py-2.5 md:py-3 rounded-lg transition-all duration-300
                transform hover:-translate-y-1 hover:shadow-lg text-sm md:text-base
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