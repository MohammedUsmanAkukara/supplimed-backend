import { v2 as cloudinary } from 'cloudinary';
import { config } from './env.js';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = !!(
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true
  });
}

// Local storage directory fallback (always server/public/uploads)
const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadMediaStream = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (isCloudinaryConfigured) {
      const uploadOptions = {
        folder: config.cloudinary.folder,
        resource_type: options.resourceType || 'auto',
        public_id: options.publicId || undefined,
        ...options
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve({
            provider: 'cloudinary',
            url: result.secure_url,
            storageKey: result.public_id,
            bytes: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height
          });
        }
      );

      Readable.from(fileBuffer).pipe(uploadStream);
    } else {
      // Local fallback storage for development or self-hosted
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = options.ext || '.png';
        const filename = `media-${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, fileBuffer);
        const relativeUrl = `/uploads/${filename}`;

        resolve({
          provider: 'local',
          url: relativeUrl,
          storageKey: filename,
          bytes: fileBuffer.length,
          format: ext.replace('.', '')
        });
      } catch (err) {
        reject(err);
      }
    }
  });
};

export const deleteMediaAsset = async (storageKey, provider = 'cloudinary') => {
  if (provider === 'cloudinary' && isCloudinaryConfigured) {
    return await cloudinary.uploader.destroy(storageKey);
  } else {
    const filePath = path.join(uploadsDir, storageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { result: 'ok' };
  }
};

export { cloudinary, isCloudinaryConfigured };
