import React from 'react'

function loader() {
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
        Loading
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
  )
}

export default loader