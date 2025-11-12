import React from 'react';

export interface DesignStyle {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export enum ChatMessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: ChatMessageSender;
  sources?: GroundingSource[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}
