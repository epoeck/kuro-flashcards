import React, { useState, useEffect } from 'react';
import { useDecksContext } from '../context/DecksContext';
import { CopyIcon, CheckIcon, SyncIcon } from './ui';

const SyncManager: React.FC = () => {
  const { syncId, loadDecksFromSyncId } = useDecksContext();
  // Estado para o campo de texto editável
  const [editableSyncId, setEditableSyncId] = useState(syncId || '');
  const [hasCopied, setHasCopied] = useState(false);

  // Efeito para manter o campo de texto sincronizado com o ID real do contexto.
  // Isto é útil quando um novo ID é gerado após criar o primeiro deck.
  useEffect(() => {
    setEditableSyncId(syncId || '');
  }, [syncId]);

  const handleCopyToClipboard = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000); // Resetar após 2 segundos
    }
  };
  
  const handleLoadDecks = (e: React.FormEvent) => {
      e.preventDefault();
      const newId = editableSyncId.trim();
      // Apenas carrega se o ID for novo e não for vazio
      if (newId && newId !== syncId) {
          if (window.confirm(`Tem a certeza? Isto irá substituir os seus decks atuais por aqueles do ID que inseriu.`)) {
              loadDecksFromSyncId(newId);
          }
      }
  }

  return (
    <div className="mb-8 p-6 bg-kuromi-surface rounded-xl border border-kuromi-purple/50">
      <h2 className="text-2xl font-extrabold mb-4 flex items-center"><SyncIcon className="w-6 h-6 mr-3 text-kuromi-purple"/>Sincronização na Nuvem</h2>
      
      <p className="text-sm text-kuromi-muted mb-4">
        Insira um ID abaixo para carregar os seus decks, ou comece a criar decks para gerar um novo ID.
      </p>
      
      <form onSubmit={handleLoadDecks}>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="syncIdInput"
            type="text"
            value={editableSyncId}
            onChange={(e) => setEditableSyncId(e.target.value)}
            placeholder="Insira um ID ou crie um deck..."
            aria-label="ID de Sincronização"
            className="flex-grow p-3 bg-kuromi-dark border border-kuromi-purple/50 rounded-lg focus:ring-2 focus:ring-kuromi-pink focus:border-kuromi-pink placeholder-kuromi-muted/50"
          />
          <button
              type="button"
              onClick={handleCopyToClipboard}
              disabled={!syncId}
              title="Copiar ID"
              className="w-full sm:w-12 h-12 flex-shrink-0 flex items-center justify-center bg-kuromi-purple text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasCopied ? <CheckIcon className="w-6 h-6"/> : <CopyIcon className="w-6 h-6"/>}
          </button>
          <button 
              type="submit" 
              disabled={!editableSyncId.trim() || editableSyncId.trim() === syncId}
              className="w-full sm:w-auto bg-kuromi-pink text-black font-bold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all shadow-lg shadow-kuromi-pink/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Carregar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SyncManager;