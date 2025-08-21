
import { createContext, useContext } from 'react';
import type { Flashcard } from '../types';

interface DeckContextType {
  deck: Flashcard[];
  addCard: (card: Omit<Flashcard, 'id'>) => void;
  updateCard: (updatedCard: Flashcard) => void;
  deleteCard: (cardId: string) => void;
  loading: boolean;
}

export const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const useDeckContext = (): DeckContextType => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error('useDeckContext must be used within a DeckProvider');
  }
  return context;
};
