
import React from 'react';
import { DESIGN_STYLES } from '../constants';
import { DesignStyle } from '../types';

interface StyleCarouselProps {
  onStyleSelect: (style: DesignStyle) => void;
  selectedStyle: DesignStyle | null;
  isLoading: boolean;
}

const StyleCarousel: React.FC<StyleCarouselProps> = ({ onStyleSelect, selectedStyle, isLoading }) => {
  return (
    <div className="w-full bg-white py-4 px-2 shadow-md">
      <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
        {DESIGN_STYLES.map((style) => (
          <button
            key={style.name}
            onClick={() => onStyleSelect(style)}
            disabled={isLoading}
            className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border-2 ${
              selectedStyle?.name === style.name
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <style.icon className="w-5 h-5 mr-2" />
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleCarousel;
