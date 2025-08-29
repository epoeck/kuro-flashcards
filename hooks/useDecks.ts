import { useState, useEffect, useCallback } from 'react';
import type { Flashcard, Deck } from '../types';
import LZString from 'lz-string';

const generateCardId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  // Efeito para carregar os decks da URL ao iniciar o app
  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const decompressed = LZString.decompressFromBase64(hash);
        if (decompressed) {
            const parsedData = JSON.parse(decompressed);
            if (parsedData && Array.isArray(parsedData.decks)) {
                setDecks(parsedData.decks);
            }
        }
      }
    } catch (error) {
      console.error("Falha ao carregar decks da URL hash", error);
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, []); // Executa apenas uma vez

  // Efeito para salvar os decks na URL sempre que eles mudarem
  useEffect(() => {
    // Ignora a execução enquanto os dados iniciais ainda estão carregando
    if (loading) {
      return;
    }

    try {
      const appData = { decks };
      const jsonString = JSON.stringify(appData);
      const compressed = LZString.compressToBase64(jsonString);
      const newHash = '#' + compressed;

      // Condição para limpar a URL se não houver mais decks
      if (decks.length === 0) {
          // Limpa a hash se ela não estiver vazia
          if(window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
          return;
      }
      
      // Apenas atualiza a URL se o conteúdo for realmente diferente
      // Isso evita atualizações desnecessárias e possíveis loops
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    } catch (error) {
      console.error("Falha ao salvar decks na URL hash", error);
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

  const addCard = useCallback((deckId: string, card: Omit<Flashcard, 'id' | 'needsStudy' | 'correctStreak'>) => {
    const newCard: Flashcard = {
        ...card,
        id: generateCardId(),
        needsStudy: false,
        correctStreak: 0,
    };
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

  const updateCardMastery = useCallback((deckId: string, cardId: string, isCorrect: boolean) => {
    setDecks(prevDecks => prevDecks.map(deck => {
        if (deck.id !== deckId) return deck;

        const newCards = deck.cards.map(card => {
            if (card.id !== cardId) return card;

            if (isCorrect) {
                const newStreak = (card.correctStreak || 0) + 1;
                let newNeedsStudy = card.needsStudy;
                if (newStreak >= 5) {
                    newNeedsStudy = false;
                }
                return { ...card, correctStreak: newStreak, needsStudy: newNeedsStudy };
            } else {
                return { ...card, correctStreak: 0, needsStudy: true };
            }
        });
        return { ...deck, cards: newCards };
    }));
  }, []);

  const importCardsToDeck = useCallback((deckId: string, cardsToImport: Omit<Flashcard, 'id'>[]) => {
    const newCards: Flashcard[] = cardsToImport.map(card => ({
        ...card,
        id: generateCardId(),
        needsStudy: card.needsStudy ?? false,
        correctStreak: card.correctStreak ?? 0,
    }));

    setDecks(prevDecks =>
        prevDecks.map(deck =>
            deck.id === deckId
                ? { ...deck, cards: [...deck.cards, ...newCards] }
                : deck
        )
    );
  }, []);

  const importNewDeck = useCallback((deckName: string, cardsToImport: Omit<Flashcard, 'id'>[]) => {
    const newCards: Flashcard[] = cardsToImport.map(card => ({
        ...card,
        id: generateCardId(),
        needsStudy: card.needsStudy ?? false,
        correctStreak: card.correctStreak ?? 0,
    }));
    
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: deckName,
      cards: newCards,
    };

    setDecks(prevDecks => [...prevDecks, newDeck]);
  }, []);

  return { decks, loading, addDeck, deleteDeck, updateDeckName, addCard, updateCard, deleteCard, updateCardMastery, importCardsToDeck, importNewDeck };
};