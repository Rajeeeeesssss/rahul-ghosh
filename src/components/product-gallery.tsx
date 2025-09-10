"use client"

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pr-2 md:pr-0">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors",
              selectedImage === image ? 'border-primary' : 'border-transparent'
            )}
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image}
              alt={`Product thumbnail ${index + 1}`}
              width={80}
              height={80}
              className="h-full w-full object-cover object-center"
              data-ai-hint="product image thumbnail"
            />
          </button>
        ))}
      </div>
      <div className="flex-1 aspect-square relative rounded-lg overflow-hidden shadow-lg">
        <Image
          src={selectedImage}
          alt="Selected product image"
          layout="fill"
          className="object-cover object-center"
          data-ai-hint="product image"
        />
      </div>
    </div>
  );
}
