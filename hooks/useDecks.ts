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

  // Carregar o syncId do localStorage ao iniciar
  useEffect(() => {
    const savedSyncId = localStorage.getItem(SYNC_ID_STORAGE_KEY);
    if (savedSyncId) {
      setSyncId(savedSyncId);
    } else {
      setLoading(false); // Não há ID, então não há o que carregar
    }
  }, []);
  
  // Efeito para buscar os decks da nuvem quando o syncId for definido
  useEffect(() => {
    if (!syncId) return;

    const fetchDecks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/.netlify/functions/get-decks?syncId=${syncId}`);
        if (!response.ok) {
            if(response.status === 404) {
                // ID não encontrado, talvez tenha sido apagado. Limpa o ID local.
                console.warn("Sync ID não encontrado na nuvem. Começando do zero.");
                localStorage.removeItem(SYNC_ID_STORAGE_KEY);
                setSyncId(null);
                setDecks([]);
            } else {
                throw new Error("Falha ao buscar decks.");
            }
        } else {
            const data = await response.json();
            setDecks(data.decks || []);
        }
      } catch (e) {
        setError("Não foi possível carregar seus decks.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, [syncId]);


  // Efeito para salvar os decks na nuvem quando eles mudarem
  useEffect(() => {
    // Não salva se estiver carregando ou se for o estado inicial sem syncId
    if (loading || isSyncing) return;

    // Limpa o timeout anterior para "debounce"
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = window.setTimeout(() => {
        const saveDecks = async () => {
            setIsSyncing(true);
            setError(null);
            try {
                const endpoint = `/.netlify/functions/save-decks${syncId ? `?syncId=${syncId}` : ''}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: JSON.stringify({ decks }),
                });

                if (!response.ok) throw new Error("Falha ao sincronizar decks.");

                const result = await response.json();
                
                // Se for um novo conjunto de decks, um novo ID será retornado
                if (result.syncId && !syncId) {
                    localStorage.setItem(SYNC_ID_STORAGE_KEY, result.syncId);
                    setSyncId(result.syncId);
                }
            } catch (e) {
                setError("Erro ao salvar. Verifique sua conexão.");
                console.error(e);
            } finally {
                setIsSyncing(false);
            }
        };
        saveDecks();
    }, 1500); // Espera 1.5 segundos após a última mudança para salvar

  }, [decks]);


  // Funções de manipulação de decks (a lógica interna delas não muda)
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

  // Nova função para permitir ao usuário carregar decks de outro ID
  const loadDecksFromSyncId = (newSyncId: string) => {
      if (newSyncId && newSyncId.trim() !== syncId) {
          localStorage.setItem(SYNC_ID_STORAGE_KEY, newSyncId.trim());
          setSyncId(newSyncId.trim());
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