
import { useState, useEffect, useCallback } from 'react';
import type { Flashcard } from '../types';

const DECK_STORAGE_KEY = 'flashcard-deck';

export const useDeck = () => {
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedDeck = localStorage.getItem(DECK_STORAGE_KEY);
      if (savedDeck) {
        setDeck(JSON.parse(savedDeck));
      }
    } catch (error) {
      console.error("Failed to load deck from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
        try {
            localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deck));
        } catch (error) {
            console.error("Failed to save deck to localStorage", error);
        }
    }
  }, [deck, loading]);
  
  const addCard = useCallback((card: Omit<Flashcard, 'id'>) => {
    const newCard = { ...card, id: Date.now().toString() };
    setDeck(prevDeck => [...prevDeck, newCard]);
  }, []);

  const updateCard = useCallback((updatedCard: Flashcard) => {
    setDeck(prevDeck => prevDeck.map(card => card.id === updatedCard.id ? updatedCard : card));
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setDeck(prevDeck => prevDeck.filter(card => card.id !== cardId));
  }, []);

  return { deck, addCard, updateCard, deleteCard, loading };
};
