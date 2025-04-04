import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSize: number; // in MB
  label: string;
  currentUrl?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  accept, 
  maxSize, 
  label,
  currentUrl 
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
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
      // For videos, we'll just show the file name as preview
      setPreview('video-preview');
    }
    
    onFileSelect(file);
  };

  const openFileSelector = () => {
    inputRef.current?.click();
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
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;