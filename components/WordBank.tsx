
import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WordEntry } from '../types';
import { getAudioForWord } from '../services/geminiService';
import Icon from './Icon';
import Spinner from './Spinner';

interface WordBankProps {
  words: WordEntry[];
}

const WordBank: React.FC<WordBankProps> = ({ words }) => {
  const [loadingAudioFor, setLoadingAudioFor] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAudioBuffer = (audioBuffer: AudioBuffer) => {
    if (!audioContextRef.current) {
        // FIX: Cast window to any to access webkitAudioContext without TypeScript errors.
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };
  
  const handlePlayAudio = async (word: string) => {
    if (loadingAudioFor) return;

    setLoadingAudioFor(word);
    try {
        const audioBuffer = await getAudioForWord(word);
        if (audioBuffer) {
            playAudioBuffer(audioBuffer);
        } else {
            alert(`Sorry, audio could not be generated for "${word}".`);
        }
    } catch (error) {
        console.error("Failed to play audio:", error);
        alert("An error occurred while trying to play the audio.");
    } finally {
        setLoadingAudioFor(null);
    }
  };


  if (words.length === 0) {
    return (
      <div className="text-center text-slate-400 mt-12 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-300 mb-2">Your Word Bank is Empty</h2>
        <p>Upload a document and tap on words to save them here for review.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {words.map((entry, index) => (
          <div key={index} className="bg-slate-800 rounded-lg p-6 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold capitalize text-indigo-400">{entry.word}</h3>
                <button 
                    onClick={() => handlePlayAudio(entry.word)} 
                    disabled={!!loadingAudioFor}
                    className="text-slate-400 hover:text-indigo-400 disabled:text-slate-600 disabled:cursor-wait transition-colors"
                    aria-label={`Listen to "${entry.word}"`}
                >
                    {loadingAudioFor === entry.word ? <Spinner /> : <Icon type="speaker" className="w-6 h-6" />}
                </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-li:text-slate-300 flex-grow">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {entry.definition}
              </ReactMarkdown>
            </div>
            <blockquote className="border-l-4 border-slate-600 pl-4 mt-4 text-slate-400 italic text-sm">
              {entry.sentence}
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordBank;
