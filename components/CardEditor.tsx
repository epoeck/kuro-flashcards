
import React, { useState, useEffect } from 'react';
import { useDeckContext } from '../context/DeckContext';
import type { Flashcard, CardContent } from '../types';
import FileInput from './FileInput';
import { CloseIcon } from './ui';

interface CardEditorProps {
  cardToEdit: Flashcard | null;
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
};

const CardEditor: React.FC<CardEditorProps> = ({ cardToEdit, onClose }) => {
  const { addCard, updateCard } = useDeckContext();
  const [front, setFront] = useState<CardContent>({ text: '', image: '', audio: '' });
  const [back, setBack] = useState<CardContent>({ text: '', image: '', audio: '' });
  
  useEffect(() => {
    if (cardToEdit) {
      setFront(cardToEdit.front);
      setBack(cardToEdit.back);
    }
  }, [cardToEdit]);

  const handleContentChange = (side: 'front' | 'back', content: CardContent) => {
    if (side === 'front') {
      setFront(content);
    } else {
      setBack(content);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = { front, back };
    if (cardToEdit) {
      updateCard({ ...cardData, id: cardToEdit.id });
    } else {
      addCard(cardData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{cardToEdit ? 'Edit Card' : 'Add New Card'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800"><CloseIcon className="w-6 h-6"/></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto">
            <div className="flex flex-col md:flex-row p-6 gap-6">
                <CardSideEditor title="Front" content={front} onChange={(c) => handleContentChange('front', c)} />
                <div className="border-l border-slate-200 hidden md:block"></div>
                <hr className="md:hidden"/>
                <CardSideEditor title="Back" content={back} onChange={(c) => handleContentChange('back', c)} />
            </div>
            <div className="flex justify-end p-4 bg-slate-50 border-t rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 mr-2 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Card</button>
            </div>
        </form>
      </div>
    </div>
  );
};

interface CardSideEditorProps {
    title: string;
    content: CardContent;
    onChange: (content: CardContent) => void;
}

const CardSideEditor: React.FC<CardSideEditorProps> = ({ title, content, onChange }) => {
    
    const handleFileChange = async (file: File | null, type: 'image' | 'audio') => {
        if (!file) {
            onChange({ ...content, [type]: '' });
            return;
        }
        try {
            const base64 = await fileToBase64(file);
            onChange({ ...content, [type]: base64 });
        } catch (error) {
            console.error("Error converting file to Base64", error);
        }
    }

    return (
        <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Text</label>
                <textarea
                    value={content.text}
                    onChange={(e) => onChange({ ...content, text: e.target.value })}
                    rows={4}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`Text for the ${title.toLowerCase()} of the card...`}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                <FileInput
                    accept="image/*"
                    value={content.image || ''}
                    onChange={(file) => handleFileChange(file, 'image')}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Audio</label>
                <FileInput
                    accept="audio/*"
                    value={content.audio || ''}
                    onChange={(file) => handleFileChange(file, 'audio')}
                />
            </div>
        </div>
    )
}

export default CardEditor;
