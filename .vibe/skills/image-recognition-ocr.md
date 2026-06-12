# Skill: Image Recognition & OCR Integration

## When to Use
Extracting text, objects, or data from images; building features like receipt scanning, document parsing, barcode reading, or visual search.

## Overview
Image recognition splits into two main tasks:
1. **OCR (Optical Character Recognition)** — extracting text from images.
2. **Computer Vision** — detecting objects, faces, labels, scenes in images.

## Option 1: Client-Side OCR (Tesseract.js)
Best for: privacy-sensitive data, offline capability, small documents.

```bash
npm install tesseract.js
```

```ts
import Tesseract from 'tesseract.js';

async function extractText(imageUrl: string): Promise<string> {
  const result = await Tesseract.recognize(imageUrl, 'eng+rus', {
    logger: (m) => console.log(m),
  });
  return result.data.text;
}

// Usage
const text = await extractText('/receipt.jpg');
console.log(text);
```

**Pros:** No API costs, works offline.
**Cons:** Large bundle (~10MB+), slower than cloud APIs, lower accuracy on complex layouts.

## Option 2: Cloud Vision APIs

### Google Cloud Vision
```bash
npm install @google-cloud/vision
```

```ts
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({ keyFilename: 'key.json' });

async function detectText(imagePath: string) {
  const [result] = await client.textDetection(imagePath);
  return result.textAnnotations?.[0]?.description ?? '';
}

// Detect objects/labels
async function detectLabels(imagePath: string) {
  const [result] = await client.labelDetection(imagePath);
  return result.labelAnnotations?.map((l) => l.description) ?? [];
}
```

**Pricing:** Free tier: 1000 units/month. Paid: $1.50 per 1000 units.

### AWS Rekognition
```ts
import { RekognitionClient, DetectTextCommand } from '@aws-sdk/client-rekognition';

const client = new RekognitionClient({ region: 'us-east-1' });

async function detectText(imageBytes: Buffer) {
  const command = new DetectTextCommand({ Image: { Bytes: imageBytes } });
  const result = await client.send(command);
  return result.TextDetections?.map((t) => t.DetectedText).join('\n');
}
```

**Pricing:** Free tier: 5000 images/month for 12 months. Paid: $1 per 1000 images.

### OpenAI GPT-4 Vision (Multimodal)
```ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function describeImage(imageBase64: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all text from this receipt and format as JSON with fields: store, date, items (array of name, price), total.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      },
    ],
  });
  return response.choices[0].message.content;
}
```

**Best for:** Unstructured documents, complex layouts, need for reasoning.
**Pricing:** ~$0.005–$0.015 per image depending on resolution.

## Option 3: Open-Source Models (Self-Hosted)

### EasyOCR (Python)
```python
import easyocr
reader = easyocr.Reader(['en', 'ru'])
result = reader.readtext('image.jpg')
for (bbox, text, prob) in result:
    print(f"{text} (confidence: {prob:.2f})")
```

### PaddleOCR (Python, supports 80+ languages)
```bash
pip install paddlepaddle paddleocr
```

```python
from paddleocr import PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')
result = ocr.ocr('image.jpg', cls=True)
```

### Self-Hosted via Docker
```yaml
services:
  ocr:
    image: jaidedai/easyocr:latest
    ports:
      - "8000:8000"
```

## Image Preprocessing for Better OCR
Before sending to OCR, preprocess images:

```ts
// Using Canvas API
function preprocessImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Grayscale + contrast boost
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i + 1] = data[i + 2] = gray > 128 ? 255 : 0; // Threshold
      }
      
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

**Preprocessing steps:**
1. **Resize** to 300 DPI equivalent.
2. **Grayscale** — color doesn't help OCR.
3. **Denoise** — remove speckles.
4. **Threshold/Binarize** — convert to pure black and white.
5. **Deskew** — straighten tilted text.

## Building a Receipt Scanner Feature

### Architecture
```
Frontend:
  Camera/File Input → Image Preview → Crop/Rotate → Upload

Backend:
  Upload to S3 → Queue Job (Bull/Redis) → OCR Service → Parse with Zod → Save to DB
```

### Frontend (React)
```tsx
function ReceiptUploader() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const base64 = await toBase64(file);
    setImage(base64);
    
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    });
    
    const data = await response.json();
    setText(data.text);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFile} />
      {image && <img src={image} alt="Receipt" className="max-w-sm" />}
      {text && <pre>{text}</pre>}
    </div>
  );
}
```

### Backend (Express)
```ts
import { z } from 'zod';

const ScanSchema = z.object({
  image: z.string().regex(/^data:image\/\w+;base64,/),
});

app.post('/api/scan', async (req, res) => {
  const { image } = ScanSchema.parse(req.body);
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Send to OCR service (e.g., Google Vision)
  const [result] = await visionClient.textDetection({ image: { content: buffer } });
  const text = result.textAnnotations?.[0]?.description ?? '';
  
  // Parse with regex or GPT
  const parsed = parseReceipt(text);
  
  res.json({ success: true, data: parsed });
});
```

## Extracting Structured Data

### Regex Approach (Fast, brittle)
```ts
function parseReceipt(text: string) {
  const totalMatch = text.match(/Total[:\s]*([\d.,]+)/i);
  const dateMatch = text.match(/(\d{2}[\/\-.]\d{2}[\/\-.]\d{4})/);
  
  return {
    total: totalMatch ? parseFloat(totalMatch[1]) : null,
    date: dateMatch ? new Date(dateMatch[1]) : null,
    raw: text,
  };
}
```

### LLM Approach (Robust, slower)
Send OCR text to GPT-4 with a structured prompt:
```
You are a receipt parser. Extract the following fields from the OCR text below.
Return ONLY valid JSON with this structure:
{
  "store": "string",
  "date": "YYYY-MM-DD",
  "items": [{"name": "string", "quantity": number, "price": number}],
  "total": number,
  "tax": number
}

OCR text:
---
{{text}}
```

## File Upload Handling

### Multer (Backend)
```ts
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  const buffer = req.file?.buffer;
  // process...
});
```

### Direct to S3 (Frontend → S3)
Use pre-signed URLs to upload directly from browser:
```ts
// Backend: generate presigned URL
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function getUploadUrl(key: string) {
  const command = new PutObjectCommand({ Bucket: 'my-bucket', Key: key, ContentType: 'image/jpeg' });
  return getSignedUrl(s3Client, command, { expiresIn: 300 });
}
```

## Security Considerations
- **Validate file type** — check magic numbers, not just extension.
- **Limit file size** — prevent DoS.
- **Scan for malware** — use ClamAV or similar if processing user uploads.
- **Sanitize EXIF data** — strip metadata to prevent leaks.
- **Rate limit** — OCR APIs can be expensive.

## Checklist
- [ ] Image preprocessing applied (grayscale, threshold, deskew).
- [ ] OCR engine chosen based on accuracy/cost/offline needs.
- [ ] Structured data parsed from raw text.
- [ ] File uploads validated and size-limited.
- [ ] Error handling for unreadable images.
- [ ] Rate limiting on scanning endpoints.
- [ ] PII from documents handled securely.
