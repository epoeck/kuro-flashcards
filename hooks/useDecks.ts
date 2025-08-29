import { useState, useEffect, useCallback, useRef } from 'react';
import type { Flashcard, Deck } from '../types';

const SYNC_ID_STORAGE_KEY = 'flashcard-app-sync-id';

const generateCardId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncId, setSyncId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimeout = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const savedSyncId = localStorage.getItem(SYNC_ID_STORAGE_KEY);
    if (savedSyncId) {
      setSyncId(savedSyncId);
    } else {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (!syncId) return;

    const fetchDecks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/.netlify/functions/get-decks?syncId=${syncId}`);
        if (!response.ok) {
            if(response.status === 404) {
                // ID não encontrado. Permite que o utilizador crie decks com este novo ID.
                console.warn("Sync ID não encontrado na nuvem. Será criado ao guardar.");
                setDecks([]);
            } else {
                throw new Error("Falha ao buscar decks.");
            }
        } else {
            const data = await response.json();
            setDecks(data.decks || []);
        }
      } catch (e) {
        setError("Não foi possível carregar os seus decks.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, [syncId]);

  useEffect(() => {
    if (loading || isInitialMount.current) {
        if (!loading) {
            isInitialMount.current = false;
        }
        return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = window.setTimeout(() => {
        const saveDecks = async () => {
            if (!syncId) return; // Só guarda se houver um ID definido

            setIsSyncing(true);
            setError(null);
            try {
                const endpoint = `/.netlify/functions/save-decks?syncId=${syncId}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: JSON.stringify({ decks }),
                });

                if (!response.ok) throw new Error("Falha ao sincronizar decks.");

            } catch (e) {
                setError("Erro ao guardar. Verifique a sua conexão.");
                console.error(e);
            } finally {
                setIsSyncing(false);
            }
        };
        saveDecks();
    }, 1500);

  }, [decks, syncId]);

  const addDeck = useCallback((name: string) => {
    const newDeck: Deck = { id: Date.now().toString(), name, cards: [] };
    setDecks(prev => [...prev, newDeck]);
  }, []);
  
  const deleteDeck = useCallback((deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
  }, []);

  const updateDeckName = useCallback((deckId: string, name: string) => {
    setDecks(prev => prev.map(d => (d.id === deckId ? { ...d, name } : d)));
  }, []);

  const addCard = useCallback((deckId: string, card: Omit<Flashcard, 'id' | 'needsStudy' | 'correctStreak'>) => {
    const newCard: Flashcard = { ...card, id: generateCardId(), needsStudy: false, correctStreak: 0 };
    setDecks(prev => prev.map(d => d.id === deckId ? { ...d, cards: [...d.cards, newCard] } : d));
  }, []);
  
  const updateCard = useCallback((deckId: string, updatedCard: Flashcard) => {
    setDecks(prev => prev.map(d => d.id === deckId ? { ...d, cards: d.cards.map(c => c.id === updatedCard.id ? updatedCard : c) } : d));
  }, []);

  const deleteCard = useCallback((deckId: string, cardId: string) => {
    setDecks(prev => prev.map(d => d.id === deckId ? { ...d, cards: d.cards.filter(c => c.id !== cardId) } : d));
  }, []);
  
   const updateCardMastery = useCallback((deckId: string, cardId: string, isCorrect: boolean) => {
    setDecks(prevDecks => prevDecks.map(deck => {
        if (deck.id !== deckId) return deck;
        const newCards = deck.cards.map(card => {
            if (card.id !== cardId) return card;
            if (isCorrect) {
                const newStreak = (card.correctStreak || 0) + 1;
                return { ...card, correctStreak: newStreak, needsStudy: newStreak >= 5 ? false : card.needsStudy };
            } else {
                return { ...card, correctStreak: 0, needsStudy: true };
            }
        });
        return { ...deck, cards: newCards };
    }));
  }, []);

  const importCardsToDeck = useCallback((deckId: string, cards: Omit<Flashcard, 'id'>[]) => {
    const newCards: Flashcard[] = cards.map(c => ({...c, id: generateCardId(), needsStudy: c.needsStudy ?? false, correctStreak: c.correctStreak ?? 0}));
    setDecks(prev => prev.map(d => d.id === deckId ? { ...d, cards: [...d.cards, ...newCards] } : d));
  }, []);

  const importNewDeck = useCallback((deckName: string, cards: Omit<Flashcard, 'id'>[]) => {
    const newCards: Flashcard[] = cards.map(c => ({...c, id: generateCardId(), needsStudy: c.needsStudy ?? false, correctStreak: c.correctStreak ?? 0}));
    const newDeck: Deck = { id: Date.now().toString(), name: deckName, cards: newCards };
    setDecks(prev => [...prev, newDeck]);
  }, []);

  const loadDecksFromSyncId = (newSyncId: string) => {
      const trimmedId = newSyncId.trim();
      if (trimmedId && trimmedId !== syncId) {
          localStorage.setItem(SYNC_ID_STORAGE_KEY, trimmedId);
          setSyncId(trimmedId);
      }
  }

  return { 
      decks, 
      loading, 
      isSyncing,
      error,
      syncId,
      addDeck,
      deleteDeck,
      updateDeckName,
      addCard,
      updateCard,
      deleteCard,
      updateCardMastery,
      importCardsToDeck,
      importNewDeck,
      loadDecksFromSyncId
  };
};