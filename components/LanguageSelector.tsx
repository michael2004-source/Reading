
import React from 'react';

interface LanguageSelectorProps {
    selectedLanguage: string;
    onSelectLanguage: (language: string) => void;
}

const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Dutch",
    "Russian",
    "Chinese (Simplified)",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Turkish",
    "Vietnamese"
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onSelectLanguage }) => {
    return (
        <div className="mb-6">
            <label htmlFor="language-select" className="block text-sm font-medium text-slate-400 mb-2 text-center">
                Choose a language for definitions:
            </label>
            <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => onSelectLanguage(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;
