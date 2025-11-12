
import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import StyleCarousel from './components/StyleCarousel';
import ImageComparator from './components/ImageComparator';
import ChatInterface from './components/ChatInterface';
import { DesignStyle, ChatMessage, ChatMessageSender } from './types';
import { reimagineRoom, editImage, getChatResponse } from './services/geminiService';
import { IMAGE_EDIT_KEYWORDS } from './constants';

// Helper to convert file to base64
const fileToDataUrl = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1];
      if (data && mimeType) {
        resolve({ base64: data, mimeType });
      } else {
        reject(new Error('Could not parse file data.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function App() {
  const [originalImage, setOriginalImage] = useState<{ base64: string; mimeType: string; url: string } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [currentGeneratedImage, setCurrentGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleImageUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const { base64, mimeType } = await fileToDataUrl(file);
      setOriginalImage({ base64, mimeType, url: URL.createObjectURL(file) });
      setGeneratedImages({});
      setCurrentGeneratedImage(null);
      setSelectedStyle(null);
      setChatMessages([
        { id: crypto.randomUUID(), text: "Welcome! Select a style above to start redesigning, or chat with me to refine the current design.", sender: ChatMessageSender.AI }
      ]);
    } catch (e) {
      setError('Failed to load image. Please try another file.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStyleSelect = useCallback(async (style: DesignStyle) => {
    if (!originalImage) return;

    setSelectedStyle(style);
    setError(null);

    if (generatedImages[style.name]) {
      setCurrentGeneratedImage(generatedImages[style.name]);
      return;
    }

    setIsLoading(true);
    setCurrentGeneratedImage(null);
    try {
      const newImageBase64 = await reimagineRoom(originalImage.base64, originalImage.mimeType, style.name);
      const newImageUrl = `data:${originalImage.mimeType};base64,${newImageBase64}`;
      setGeneratedImages(prev => ({ ...prev, [style.name]: newImageUrl }));
      setCurrentGeneratedImage(newImageUrl);
    } catch (e) {
      setError(`Failed to generate ${style.name} design. Please try again or select another style.`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, generatedImages]);

  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage: ChatMessage = { id: crypto.randomUUID(), text: message, sender: ChatMessageSender.USER };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    setError(null);

    const currentImageForEdit = currentGeneratedImage || originalImage?.url;
    const isEditRequest = IMAGE_EDIT_KEYWORDS.test(message) && currentImageForEdit;

    try {
      if (isEditRequest) {
          if (!currentImageForEdit) throw new Error("No image available to edit.");
          
          const response = await fetch(currentImageForEdit);
          const blob = await response.blob();
          const {base64, mimeType} = await fileToDataUrl(blob as File);

          const newImageBase64 = await editImage(base64, mimeType, message);
          const newImageUrl = `data:${mimeType};base64,${newImageBase64}`;
          
          setCurrentGeneratedImage(newImageUrl);
          if (selectedStyle) {
              setGeneratedImages(prev => ({ ...prev, [selectedStyle.name]: newImageUrl }));
          }

          const aiMessage: ChatMessage = { id: crypto.randomUUID(), text: "Here's the updated design based on your request.", sender: ChatMessageSender.AI };
          setChatMessages(prev => [...prev, aiMessage]);

      } else {
        const fullHistory = [...chatMessages, userMessage];
        const { text, sources } = await getChatResponse(fullHistory);
        const aiMessage: ChatMessage = { id: crypto.randomUUID(), text, sender: ChatMessageSender.AI, sources };
        setChatMessages(prev => [...prev, aiMessage]);
      }
    } catch (e) {
      console.error(e);
      const err = e instanceof Error ? e.message : 'An unknown error occurred.';
      const errorMessage: ChatMessage = { id: crypto.randomUUID(), text: `Sorry, I ran into an issue: ${err}`, sender: ChatMessageSender.AI };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessages, currentGeneratedImage, originalImage, selectedStyle]);


  return (
    <div className="bg-slate-100 min-h-screen w-full flex flex-col items-center font-sans">
      {!originalImage ? (
        <ImageUploader onImageUpload={handleImageUpload} isLoading={isLoading} />
      ) : (
        <div className="w-full flex flex-col items-center">
          <StyleCarousel onStyleSelect={handleStyleSelect} selectedStyle={selectedStyle} isLoading={isLoading} />
          <main className="flex-1 w-full p-4 md:p-8 flex flex-col items-center">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">{error}</div>}
            
            <div className="w-full max-w-5xl aspect-[4/3] bg-slate-200 rounded-lg shadow-lg flex items-center justify-center mb-4">
              {isLoading && !currentGeneratedImage && (
                <div className="text-center">
                   <svg className="animate-spin mx-auto h-10 w-10 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                  <p className="text-lg font-semibold text-slate-700">Reimagining your space as {selectedStyle?.name}...</p>
                  <p className="text-sm text-slate-500">This may take a moment.</p>
                </div>
              )}
              {currentGeneratedImage && originalImage && (
                <ImageComparator originalImage={originalImage.url} generatedImage={currentGeneratedImage} />
              )}
              {!isLoading && !currentGeneratedImage && (
                 <div className="text-center p-8">
                  <h2 className="text-2xl font-bold text-slate-800">Select a Style</h2>
                  <p className="text-slate-600 mt-2">Choose a design style from the carousel above to see your room's transformation.</p>
                </div>
              )}
            </div>
            
            <ChatInterface messages={chatMessages} onSendMessage={handleSendMessage} isLoading={isChatLoading} />
          </main>
        </div>
      )}
    </div>
  );
}
