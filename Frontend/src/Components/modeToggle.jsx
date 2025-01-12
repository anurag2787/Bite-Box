import React from 'react'
import { useDarkMode } from '../app/DarkModeContext';
import { Moon, Sun } from 'lucide-react';


function modeToggle() {
      const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full transition-all duration-300 text-black dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    </div>
  )
}

export default modeToggle