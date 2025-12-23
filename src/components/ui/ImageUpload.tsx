'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Button from './Button';

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Error al subir imagen');

        const data = await response.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      onChange([...value, ...urls].slice(0, maxImages));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error al subir las imágenes');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (url: string) => {
    onChange(value.filter((v) => v !== url));
  };

  const canUploadMore = value.length < maxImages;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Imágenes ({value.length}/{maxImages})
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Imágenes existentes */}
        {value.map((url, index) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
          >
            <Image
              src={url}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              disabled={disabled}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Botón de upload */}
        {canUploadMore && (
          <label
            className={cn(
              'relative aspect-square rounded-lg border-2 border-dashed border-gray-300',
              'flex flex-col items-center justify-center cursor-pointer',
              'hover:border-primary hover:bg-gray-50 transition-all',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={disabled || isUploading}
              className="hidden"
            />
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Subir imagen</span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-500">
        Formatos: JPG, PNG, WEBP. Máximo {maxImages} imágenes.
      </p>
    </div>
  );
}
