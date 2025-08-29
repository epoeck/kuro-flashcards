import { createContext, useContext } from 'react';
import type { Flashcard, Deck } from '../types';

interface DecksContextType {
  // Estado dos Decks
  decks: Deck[];
  loading: boolean;
  
  // Funções de manipulação
  addDeck: (name: string) => void;
  deleteDeck: (deckId: string) => void;
  updateDeckName: (deckId: string, name: string) => void;
  addCard: (deckId: string, card: Omit<Flashcard, 'id' | 'needsStudy' | 'correctStreak'>) => void;
  updateCard: (deckId: string, updatedCard: Flashcard) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  updateCardMastery: (deckId: string, cardId: string, isCorrect: boolean) => void;
  importCardsToDeck: (deckId: string, cards: Omit<Flashcard, 'id'>[]) => void;
  importNewDeck: (deckName: string, cards: Omit<Flashcard, 'id'>[]) => void;

  // Novos estados e funções de sincronização
  isSyncing: boolean;
  error: string | null;
  syncId: string | null;
  loadDecksFromSyncId: (newSyncId: string) => void;
}

// Fornecemos valores padrão vazios para evitar erros
export const DecksContext = createContext<DecksContextType>({
    decks: [],
    loading: true,
    addDeck: () => {},
    deleteDeck: () => {},
    updateDeckName: () => {},
    addCard: () => {},
    updateCard: () => {},
    deleteCard: () => {},
    updateCardMastery: () => {},
    importCardsToDeck: () => {},
    importNewDeck: () => {},
    isSyncing: false,
    error: null,
    syncId: null,
    loadDecksFromSyncId: () => {},
});

export const useDecksContext = (): DecksContextType => {
  const context = useContext(DecksContext);
  // Não precisamos mais de verificar se o contexto existe, pois fornecemos um valor padrão
  return context;
};