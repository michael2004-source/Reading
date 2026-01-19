
import React, { useEffect } from 'react';
import Icon from './Icon';
import Spinner from './Spinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DefinitionModalProps {
  word: string | null;
  definition: string | null;
  isLoading: boolean;
  onClose: () => void;
}

const DefinitionModal: React.FC<DefinitionModalProps> = ({ word, definition, isLoading, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!word) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
        <div 
            className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg relative max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                <h2 className="text-2xl font-bold text-indigo-400 capitalize">{word}</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <Icon type="close" />
                </button>
            </header>
            <div className="p-6 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <Spinner />
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-h3:text-indigo-400 prose-h3:mb-2 prose-h3:mt-4 first:prose-h3:mt-0 prose-p:text-slate-300 prose-li:text-slate-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {definition || "No definition found."}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default DefinitionModal;
