'use client'
import { useDarkMode } from "@/app/DarkModeContext";
import React, { useEffect } from 'react';

function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Update the background color of the document body based on darkMode
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#000000' : '#FFFFFF';
  }, [darkMode]); // Correct dependency array

  return (
    <div className='h-screen flex justify-center items-center'>
      <div
        className={`flex justify-center items-center w-14 h-8 rounded-full ${
          darkMode ? 'bg-zinc-950 border border-zinc-800' : 'bg-white border border-zinc-200'
        }`}
      >
        <div className='flex justify-center items-center' onClick={toggleDarkMode}>
          <span
            className={`flex justify-center items-center px-1 py-1 rounded-full transition-colors duration-300 ${
              darkMode ? 'bg-transparent text-gray-300' : 'bg-gray-200 text-black'
            }`}
          >
            {/* Sun Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
          </span>
          <span
            className={`flex justify-center items-center px-1 py-1 rounded-full transition-colors duration-300 ${
              darkMode ? 'bg-zinc-800 text-white' : 'bg-transparent text-gray-500'
            }`}
          >
            {/* Moon Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

export default DarkModeToggle;
