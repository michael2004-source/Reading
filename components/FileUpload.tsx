
import React, { useRef } from 'react';
import Icon from './Icon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-lg bg-slate-800 text-center mt-4">
      <Icon type="upload" className="w-12 h-12 text-slate-500 mb-4" />
      <h2 className="text-xl font-bold mb-2 text-slate-300">Upload your document</h2>
      <p className="text-slate-400 mb-6 text-sm">Select a PDF or ePub file to start reading.</p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.epub"
        className="hidden"
        disabled={isLoading}
      />
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
      >
        {isLoading ? 'Processing...' : 'Choose File'}
      </button>
    </div>
  );
};

export default FileUpload;
