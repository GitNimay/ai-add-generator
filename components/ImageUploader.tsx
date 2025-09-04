
import React, { useState, useCallback, DragEvent } from 'react';
import { UploadCloudIcon, XIcon } from './icons';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  imagePreview: string | null;
  onClear: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, imagePreview, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert('Please upload an image file.');
      }
    }
  };

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files);
  }, [onFileSelect]);
  
  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClear();
  };


  if (imagePreview) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
        <img src={imagePreview} alt="Product Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-transform transform hover:scale-110"
            aria-label="Remove image"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 transition-all duration-300 cursor-pointer
        ${isDragging ? 'border-brand-purple bg-brand-purple/10' : 'border-dark-border hover:border-brand-purple-light'}`}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => handleFileChange(e.target.files)}
      />
      <UploadCloudIcon className={`h-12 w-12 mb-3 transition-colors ${isDragging ? 'text-brand-purple' : 'text-medium-text'}`} />
      <p className="font-semibold text-light-text">
        <span className="text-brand-purple-light">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-medium-text mt-1">PNG, JPG, WEBP, etc.</p>
    </div>
  );
};

export default ImageUploader;
