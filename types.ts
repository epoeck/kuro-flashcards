
export interface CardContent {
  text?: string;
  image?: string; // Base64 data URL
  audio?: string; // Base64 data URL
}

export interface Flashcard {
  id: string;
  front: CardContent;
  back: CardContent;
}
