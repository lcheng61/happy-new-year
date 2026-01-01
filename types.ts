
export interface Resolution {
  id: string;
  category: string;
  goal: string;
  action: string;
}

export interface CelebrationMessage {
  title: string;
  content: string;
  author: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}
