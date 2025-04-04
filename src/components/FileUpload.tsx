import React, { useState, useRef } from 'react';
import { Upload, Link } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUrlEnter: (url: string) => void;
  accept: string;
  maxSize: number; // in MB
  label: string;
  currentUrl?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onUrlEnter,
  accept, 
  maxSize, 
  label,
  currentUrl 
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size (convert MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    // Check file type
    const fileType = file.type.split('/')[0];
    if (accept.includes('image') && fileType !== 'image') {
      setError('Please upload an image file');
      return false;
    }
    if (accept.includes('video') && fileType !== 'video') {
      setError('Please upload a video file');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        handleFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        handleFile(file);
      }
    }
  };

  const handleFile = (file: File) => {
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      // For videos, we'll just show a placeholder
      setPreview('video-preview');
    }
    
    onFileSelect(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setError('Please enter a URL');
      return;
    }

    // Vérification basique que c'est une URL
    if (!imageUrl.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setError(null);
    setPreview(imageUrl);
    onUrlEnter(imageUrl);
    setShowUrlInput(false);
  };

  const openFileSelector = () => {
    if (!showUrlInput) {
      inputRef.current?.click();
    }
  };

  const toggleUrlInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUrlInput(!showUrlInput);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
        
        {showUrlInput ? (
          <div onClick={(e) => e.stopPropagation()} className="relative z-10">
            <form onSubmit={handleUrlSubmit} className="flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={toggleUrlInput}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {preview ? (
              <div className="mb-3">
                {preview === 'video-preview' ? (
                  <div className="bg-gray-200 p-4 rounded flex items-center justify-center">
                    <span className="text-gray-700">Video file selected</span>
                  </div>
                ) : (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-40 mx-auto rounded"
                  />
                )}
              </div>
            ) : (
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            )}
            
            <p className="text-sm text-gray-500">
              Drag and drop your file here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max size: {maxSize}MB. Accepted formats: {accept.replace(/\./g, '')}
            </p>
            <button
              type="button"
              onClick={toggleUrlInput}
              className="mt-3 inline-flex items-center text-sm text-blue-500 hover:text-blue-700"
            >
              <Link className="h-4 w-4 mr-1" />
              Or enter an image URL
            </button>
          </>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Définir des props par défaut pour la rétrocompatibilité
FileUpload.defaultProps = {
  onUrlEnter: () => {} // Fonction vide par défaut
};

export default FileUpload;
