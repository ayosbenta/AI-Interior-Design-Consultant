
import React, { useRef } from 'react';
import { UploadIcon } from './icons/Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-2">AI Interior Design Consultant</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-2xl">
        Upload a photo of your space, and let our AI reimagine it in various styles. Compare the before and after, then chat to perfect the details.
      </p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={isLoading}
      />
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <UploadIcon className="w-6 h-6 mr-3" />
            Upload Your Room Photo
          </>
        )}
      </button>
      <p className="text-sm text-slate-500 mt-4">Supports JPEG, PNG, WEBP</p>
    </div>
  );
};

export default ImageUploader;
