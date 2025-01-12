import React from 'react';
import Link from 'next/link';

function Ai() {
    return (
        <Link href="/chat">
            <div className="fixed bottom-0 z-50 right-0 m-4 w-[100px] h-[100px] overflow-hidden rounded-full shadow-lg cursor-pointer">
                <img 
                    src="https://herobot.app/wp-content/uploads/2022/11/AI-bot-1.jpg" 
                    alt="AI Bot" 
                    className="w-full h-full object-cover" 
                />
            </div>
        </Link>
    );
}

export default Ai;
