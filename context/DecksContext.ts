
import { createContext, useContext } from 'react';
import type { Flashcard, Deck } from '../types';

interface DecksContextType {
  decks: Deck[];
  loading: boolean;
  addDeck: (name: string) => void;
  deleteDeck: (deckId: string) => void;
  updateDeckName: (deckId: string, name: string) => void;
  addCard: (deckId: string, card: Omit<Flashcard, 'id' | 'needsStudy' | 'correctStreak'>) => void;
  updateCard: (deckId: string, updatedCard: Flashcard) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  updateCardMastery: (deckId: string, cardId: string, isCorrect: boolean) => void;
  importCardsToDeck: (deckId: string, cards: Omit<Flashcard, 'id'>[]) => void;
  importNewDeck: (deckName: string, cards: Omit<Flashcard, 'id'>[]) => void;
}

export const DecksContext = createContext<DecksContextType | undefined>(undefined);

export const useDecksContext = (): DecksContextType => {
  const context = useContext(DecksContext);
  if (!context) {
    throw new Error('useDecksContext must be used within a DecksProvider');
  }
  return context;
};
