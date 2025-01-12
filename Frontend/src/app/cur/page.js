"use client"

import React, { useEffect, useRef } from 'react';

const Cursor = () => {
  const circlesRef = useRef([]);
  const coordsRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef();

  const colors = [
    "#FF1493",  // Deep Pink
    "#FF69B4",  // Hot Pink
    "#FFB6C1",  // Light Pink
    "#FFC0CB",  // Pink
    "#DB7093",  // Pale Violet Red
    "#C71585",  // Medium Violet Red
    "#FF00FF",  // Magenta
    "#FF00FF",  // Fuchsia
    "#FF1493",  // Deep Pink (repeated for smoother transition)
  ];

  useEffect(() => {
    // Create trail container
    const trail = document.createElement('div');
    trail.id = 'cursor-trail';
    trail.style.position = 'fixed';
    trail.style.inset = '0';
    trail.style.pointerEvents = 'none';
    document.body.appendChild(trail);

    // Create circles
    const circles = Array.from({ length: 30 }, (_, index) => {
      const circle = document.createElement('div');
      circle.classList.add('circle');
      circle.style.position = 'fixed';
      circle.style.borderRadius = '50%';
      circle.style.pointerEvents = 'none';
      circle.style.width = '24px';
      circle.style.height = '24px';
      circle.style.transition = 'background-color 0.3s ease';
      circle.style.backgroundColor = colors[index % colors.length];
      
      // Custom properties to track position
      circle.x = 0;
      circle.y = 0;
      
      trail.appendChild(circle);
      return circle;
    });

    circlesRef.current = circles;

    // Mouse move handler
    const handleMouseMove = (e) => {
      coordsRef.current.x = e.clientX;
      coordsRef.current.y = e.clientY;
    };

    // Animation loop
    const animateCircles = () => {
      let x = coordsRef.current.x;
      let y = coordsRef.current.y;

      circles.forEach((circle, index) => {
        // Update circle position
        circle.style.left = `${x - 12}px`;
        circle.style.top = `${y - 12}px`;

        // Scale and opacity
        const scale = (circles.length - index) / circles.length;
        circle.style.transform = `scale(${scale})`;
        circle.style.opacity = `${scale}`;

        // Store current position
        circle.x = x;
        circle.y = y;

        // Calculate next circle's position
        const nextCircle = circles[index + 1] || circles[0];
        x += (nextCircle.x - x) * 0.3;
        y += (nextCircle.y - y) * 0.3;
      });

      // Continue animation
      requestRef.current = requestAnimationFrame(animateCircles);
    };

    // Start animation and add event listener
    window.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(animateCircles);

    // Disable default cursor
    document.body.style.cursor = 'none';

    // Cleanup
    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeChild(trail);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return null;
};

export default Cursor;