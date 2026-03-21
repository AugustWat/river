import React, { useRef, useState } from 'react';

const MagicCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    // Calculate mouse position relative to the card
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-3xl bg-black/60 backdrop-blur-xl border border-gray-800 shadow-2xl shadow-red-900/20 transition-colors duration-300 ${className}`}
    >
      {/* The Magic Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(220, 38, 38, 0.15), transparent 40%)`,
        }}
      />
      
      {/* The actual content of the card sits on top of the spotlight */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default MagicCard;