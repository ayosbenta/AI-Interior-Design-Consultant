
import React, { useState, useRef, useEffect } from 'react';

interface ImageComparatorProps {
  originalImage: string;
  generatedImage: string;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImage, generatedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };
  
  const handleMove = (clientX: number) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
        setSliderPosition(percent);
    }
  };

  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchEnd = () => {
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto aspect-[4/3] select-none rounded-lg overflow-hidden shadow-2xl">
      <img src={originalImage} alt="Original Room" className="absolute top-0 left-0 w-full h-full object-cover" draggable={false} />
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={generatedImage} alt="Generated Design" className="absolute top-0 left-0 w-full h-full object-cover" draggable={false} />
      </div>

      <div
        className="absolute top-0 h-full w-1.5 bg-white/70 cursor-ew-resize"
        style={{ left: `calc(${sliderPosition}% - 3px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center backdrop-blur-sm">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
       <div className="absolute top-2 left-2 px-3 py-1 bg-black/50 text-white text-sm font-semibold rounded-full backdrop-blur-sm">ORIGINAL</div>
       <div className="absolute top-2 right-2 px-3 py-1 bg-black/50 text-white text-sm font-semibold rounded-full backdrop-blur-sm" style={{ opacity: sliderPosition > 50 ? 1 : 0, transition: 'opacity 0.2s' }}>GENERATED</div>
    </div>
  );
};

export default ImageComparator;
