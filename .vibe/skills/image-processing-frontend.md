# Skill: Image Processing in the Browser

## When to Use
Manipulating images client-side before upload: cropping, resizing, compression, format conversion, or preview generation.

## Canvas API
Native browser API for pixel-level image manipulation.

### Resize Image
```ts
function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas conversion failed'));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
```

### Compress Before Upload
```tsx
async function handleUpload(file: File) {
  // Compress if > 1MB
  let processedFile = file;
  if (file.size > 1024 * 1024) {
    const blob = await resizeImage(file, 1920, 1080);
    processedFile = new File([blob], file.name, { type: 'image/jpeg' });
  }
  
  const formData = new FormData();
  formData.append('image', processedFile);
  await fetch('/api/upload', { method: 'POST', body: formData });
}
```

## Cropping with react-cropper
```bash
npm install react-cropper cropperjs
```

```tsx
import { useRef, useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

function ImageCropper({ src, onCrop }: { src: string; onCrop: (blob: Blob) => void }) {
  const cropperRef = useRef<HTMLImageElement>(null);
  
  const handleCrop = () => {
    const cropper = (cropperRef.current as any)?.cropper;
    if (cropper) {
      cropper.getCroppedCanvas().toBlob((blob: Blob) => {
        onCrop(blob);
      }, 'image/jpeg', 0.9);
    }
  };
  
  return (
    <div>
      <Cropper
        src={src}
        style={{ height: 400, width: '100%' }}
        aspectRatio={1}
        guides={true}
        ref={cropperRef}
      />
      <button onClick={handleCrop}>Crop & Save</button>
    </div>
  );
}
```

## Lazy Loading Images
```tsx
<img
  src={thumbnail}
  data-src={fullImage}
  loading="lazy"
  className="h-auto w-full"
  alt="Description"
/>
```

Or with Intersection Observer for more control:
```tsx
import { useEffect, useRef, useState } from 'react';

function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref} className="min-h-[200px] bg-gray-100">
      {isVisible && <img src={src} alt={alt} className="h-auto w-full" />}
    </div>
  );
}
```

## Modern Image Formats
Serve WebP/AVIF with fallback:
```tsx
<picture>
  <source srcSet={imageAvif} type="image/avif" />
  <source srcSet={imageWebp} type="image/webp" />
  <img src={imageJpg} alt="Description" className="h-auto w-full" />
</picture>
```

## Drag & Drop Upload
```tsx
function DropZone({ onDrop }: { onDrop: (files: File[]) => void }) {
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      onDrop(Array.from(e.dataTransfer.files));
    }
  };
  
  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
      }`}
    >
      <p>Drag & drop images here, or click to browse</p>
      <input type="file" multiple accept="image/*" className="hidden" />
    </div>
  );
}
```

## Checklist
- [ ] Images resized/compressed before upload.
- [ ] Cropping UI provided for avatars or profile pictures.
- [ ] Lazy loading implemented for image galleries.
- [ ] Modern formats (WebP) served with fallback.
- [ ] Drag & drop supported for file uploads.
- [ ] Loading placeholders prevent layout shift.
