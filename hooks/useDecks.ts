
import { useState, useEffect, useCallback } from 'react';
import type { Flashcard, Deck } from '../types';

const DECKS_STORAGE_KEY = 'flashcard-app-data';

interface AppData {
  decks: Deck[];
}

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(DECKS_STORAGE_KEY);
      if (savedData) {
        const parsedData: AppData = JSON.parse(savedData);
        setDecks(parsedData.decks || []);
      }
    } catch (error) {
      console.error("Failed to load decks from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        const appData: AppData = { decks };
        localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(appData));
      } catch (error) {
        console.error("Failed to save decks to localStorage", error);
      }
    }
  }, [decks, loading]);

  const addDeck = useCallback((name: string) => {
    const newDeck: Deck = {
      id: Date.now().toString(),
      name,
      cards: [],
    };
    setDecks(prevDecks => [...prevDecks, newDeck]);
  }, []);

  const deleteDeck = useCallback((deckId: string) => {
    setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
  }, []);

  const updateDeckName = useCallback((deckId: string, name: string) => {
    setDecks(prevDecks =>
      prevDecks.map(deck => (deck.id === deckId ? { ...deck, name } : deck))
    );
  }, []);

  const addCard = useCallback((deckId: string, card: Omit<Flashcard, 'id'>) => {
    const newCard = { ...card, id: Date.now().toString() };
    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId
          ? { ...deck, cards: [...deck.cards, newCard] }
          : deck
      )
    );
  }, []);

  const updateCard = useCallback((deckId: string, updatedCard: Flashcard) => {
    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId
          ? { ...deck, cards: deck.cards.map(card => card.id === updatedCard.id ? updatedCard : card) }
          : deck
      )
    );
  }, []);

  const deleteCard = useCallback((deckId: string, cardId: string) => {
    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId
          ? { ...deck, cards: deck.cards.filter(card => card.id !== cardId) }
          : deck
      )
    );
  }, []);

  return { decks, loading, addDeck, deleteDeck, updateDeckName, addCard, updateCard, deleteCard };
};
