
import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import DocumentViewer from './components/DocumentViewer';
import DefinitionModal from './components/DefinitionModal';
import { parseFile } from './services/fileParser';
import { getDefinition } from './services/geminiService';
import WordBank from './components/WordBank';
import LanguageSelector from './components/LanguageSelector';
import { WordEntry } from './types';
import Tabs from './components/Tabs';

type TabName = 'reader' | 'wordbank';

const App: React.FC = () => {
  const [fileContent, setFileContent] = useState<string[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [definitionLanguage, setDefinitionLanguage] = useState<string>('English');

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [isLoadingDefinition, setIsLoadingDefinition] = useState<boolean>(false);
  
  const [wordBank, setWordBank] = useState<WordEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>('reader');

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoadingFile(true);
    setError(null);
    setFileContent(null);
    setFileName(file.name);
    setWordBank([]);

    try {
      const paragraphs = await parseFile(file);
      setFileContent(paragraphs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred during file parsing.');
    } finally {
      setIsLoadingFile(false);
    }
  }, []);

  const handleWordSelect = useCallback(async (word: string, contextSentence: string) => {
    if (!word || word === selectedWord) return;

    setSelectedWord(word);
    setIsLoadingDefinition(true);
    setDefinition(null);
    
    const def = await getDefinition(word, definitionLanguage);
    setDefinition(def);
    setIsLoadingDefinition(false);

    if (def && !wordBank.some(entry => entry.word.toLowerCase() === word.toLowerCase())) {
        setWordBank(prev => [...prev, { word, definition: def, sentence: contextSentence }]);
    }

  }, [selectedWord, definitionLanguage, wordBank]);

  const handleCloseModal = useCallback(() => {
    setSelectedWord(null);
    setDefinition(null);
  }, []);

  const handleReset = () => {
      setFileContent(null);
      setFileName('');
      setError(null);
      setSelectedWord(null);
      setDefinition(null);
      setWordBank([]);
      setActiveTab('reader');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col p-4 sm:p-6 lg:p-8">
        <DefinitionModal
            word={selectedWord}
            definition={definition}
            isLoading={isLoadingDefinition}
            onClose={handleCloseModal}
        />
        
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Interactive Reader
            </h1>
            <p className="mt-2 text-lg text-slate-400">Expand your vocabulary while you read.</p>
        </header>

        <div className="flex-grow flex flex-col">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} wordCount={wordBank.length} />
            <div className="flex-grow mt-6">
                {activeTab === 'reader' && (
                    <>
                        {fileContent ? (
                            <div className="flex-grow flex flex-col h-[calc(100vh-18rem)] relative">
                                <button 
                                    onClick={handleReset} 
                                    className="absolute top-0 right-0 z-20 px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors duration-200 text-sm">
                                    Upload New File
                                </button>
                                <DocumentViewer 
                                    content={fileContent} 
                                    onWordSelect={handleWordSelect} 
                                    fileName={fileName} 
                                />
                            </div>
                        ) : (
                            <div className='max-w-2xl mx-auto w-full'>
                                <LanguageSelector selectedLanguage={definitionLanguage} onSelectLanguage={setDefinitionLanguage} />
                                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoadingFile} />
                                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                            </div>
                        )}
                    </>
                )}
                {activeTab === 'wordbank' && <WordBank words={wordBank} />}
            </div>
        </div>
    </div>
  );
};

export default App;
