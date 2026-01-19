
import React from 'react';

interface WordProps {
    children: string;
    onWordSelect: (word: string, sentence: string) => void;
    fullParagraph: string;
}

const Word: React.FC<WordProps> = ({ children, onWordSelect, fullParagraph }) => {
    const handleClick = () => {
        // More robustly clean the word, removing common punctuation from start and end.
        const cleanedWord = children.trim().replace(/^[.,!?;:)"“'”(\[\]{}¿¡]+|[.,!?;:)"“'”(\[\]{}¿¡]+$/g, '');

        if (cleanedWord) {
            // A simple way to find the sentence. This could be improved with more complex NLP.
            const sentences = fullParagraph.match( /[^.!?]+[.!?]+/g ) || [fullParagraph];
            const containingSentence = sentences.find(s => s.includes(children)) || fullParagraph;
            onWordSelect(cleanedWord, containingSentence.trim());
        }
    };
    
    return (
        <span
            onClick={handleClick}
            className="cursor-pointer hover:bg-indigo-500/30 transition-colors duration-150 rounded px-0.5 -mx-0.5"
            aria-label={`Define "${children.trim()}"`}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter') handleClick() }}
        >
            {children}
        </span>
    );
};


interface DocumentViewerProps {
  content: string[];
  onWordSelect: (word: string, sentence: string) => void;
  fileName: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ content, onWordSelect, fileName }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-full">
        <header className="p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-200 truncate">{fileName}</h1>
        </header>
        <main className="p-6 sm:p-8 md:p-12 text-slate-300 leading-relaxed text-lg overflow-y-auto font-serif">
            {content.map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-6">
                    {paragraph.split(/(\s+)/).map((part, wIndex) => {
                        if (part.trim().length === 0) {
                            return <React.Fragment key={wIndex}>{part}</React.Fragment>;
                        }
                        return <Word key={wIndex} onWordSelect={onWordSelect} fullParagraph={paragraph}>{part}</Word>;
                    })}
                </p>
            ))}
        </main>
    </div>
  );
};

export default DocumentViewer;
