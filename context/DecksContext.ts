
import { createContext, useContext } from 'react';
import type { Flashcard, Deck } from '../types';

interface DecksContextType {
  decks: Deck[];
  loading: boolean;
  addDeck: (name: string) => void;
  deleteDeck: (deckId: string) => void;
  updateDeckName: (deckId: string, name: string) => void;
  addCard: (deckId: string, card: Omit<Flashcard, 'id'>) => void;
  updateCard: (deckId: string, updatedCard: Flashcard) => void;
  deleteCard: (deckId: string, cardId: string) => void;
}

export const DecksContext = createContext<DecksContextType | undefined>(undefined);

export const useDecksContext = (): DecksContextType => {
  const context = useContext(DecksContext);
  if (!context) {
    throw new Error('useDecksContext must be used within a DecksProvider');
  }
  return context;
};
