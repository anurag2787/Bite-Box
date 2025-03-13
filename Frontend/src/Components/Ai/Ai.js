"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";

function Ai() {
    // Initialize with default position, will be updated after mount
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    
    // Set initial position after component mounts
    useEffect(() => {
        setPosition({ 
            x: window.innerWidth - 120, 
            y: window.innerHeight - 120 
        });
    }, []);

    // Set up global event listeners when dragging starts
    useEffect(() => {
        if (dragging) {
            // Add mouse event listeners
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            // Add touch event listeners
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);
            document.addEventListener('touchcancel', handleTouchEnd);
        } else {
            // Remove mouse event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Remove touch event listeners
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchcancel', handleTouchEnd);
        }
        
        // Cleanup function
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [dragging]); 

    // Mouse event handlers
    const handleMouseDown = (e) => {
        e.preventDefault();
        setDragging(true);
        setOffset({ 
            x: e.clientX - position.x, 
            y: e.clientY - position.y 
        });
    };

    const handleMouseMove = (e) => {
        if (!dragging) return;
        setPosition({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y
        });
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    // Touch event handlers
    const handleTouchStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        setDragging(true);
        setOffset({ 
            x: touch.clientX - position.x, 
            y: touch.clientY - position.y 
        });
    };

    const handleTouchMove = (e) => {
        if (!dragging) return;
        const touch = e.touches[0];
        setPosition({
            x: touch.clientX - offset.x,
            y: touch.clientY - offset.y
        });
    };

    const handleTouchEnd = () => {
        setDragging(false);
    };

    // Prevent the click event from triggering navigation when dragging
    const handleClick = (e) => {
        if (dragging) {
            e.preventDefault();
        }
    };

    return (
        <Link href="/chat" passHref onClick={handleClick}>
            <div
                className="fixed z-50 w-[100px] h-[100px] overflow-hidden rounded-full shadow-lg cursor-move"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    touchAction: "none" // Prevents browser handling of touch events
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
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