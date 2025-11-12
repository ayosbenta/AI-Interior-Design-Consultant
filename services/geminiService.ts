import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage, ChatMessageSender, GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

export async function reimagineRoom(
    base64Image: string,
    mimeType: string,
    style: string
): Promise<string> {
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  const textPart = {
    text: `Redesign this room in a photorealistic ${style} style. Keep the original room layout and structure.`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  if (response.candidates?.[0]?.finishReason === 'SAFETY') {
    throw new Error("The image generation was blocked due to safety policies. Please try a different image or style.");
  }
  throw new Error("No image was generated. The response may have been blocked or the model didn't return an image.");
}


export async function editImage(
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> {
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const textPart = { text: `Edit the provided image of a room based on the following instruction: "${prompt}". The output should be a photorealistic image.` };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
          return part.inlineData.data;
      }
    }
    
    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error("The image edit was blocked due to safety policies. Please try a different request.");
    }
    throw new Error("Could not edit the image. The response may have been blocked or the model didn't return an image.");
}


export async function getChatResponse(
  history: ChatMessage[]
): Promise<{ text: string, sources: GroundingSource[] }> {
    const geminiHistory = history.slice(0, -1).map(msg => {
      if (msg.sender === ChatMessageSender.USER) {
        return { role: 'user' as const, parts: [{ text: msg.text }] };
      }
      if (msg.sender === ChatMessageSender.AI) {
        return { role: 'model' as const, parts: [{ text: msg.text }] };
      }
      return null;
    }).filter((msg): msg is { role: 'user' | 'model'; parts: { text: string; }[] } => !!msg);

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: geminiHistory,
        config: {
          systemInstruction: `You are an expert interior design assistant. 
          Your task is to answer the user's questions, provide design advice, and find shoppable links for items that might fit their described design.
          When asked for links or product ideas, use your search tool to find relevant products and provide links. 
          Format links clearly in Markdown. Keep your responses helpful and concise.`,
          tools: [{googleSearch: {}}],
        },
    });

    const lastMessage = history[history.length - 1];
    
    const response = await chat.sendMessage({ message: lastMessage.text });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = [];
    if (groundingChunks) {
        for (const chunk of groundingChunks) {
            if (chunk.web && chunk.web.uri) {
                sources.push({ title: chunk.web.title || chunk.web.uri, uri: chunk.web.uri });
            }
        }
    }

    return { text: response.text, sources };
}