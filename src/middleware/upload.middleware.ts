import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = path.resolve(__dirname, '../../../../public/uploads');
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const validateImageFile = (file: Express.Multer.File): boolean => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedMimes.includes(file.mimetype);
};

export const deleteFile = (filePath: string): void => {
  const fs = require('fs');
  const fullPath = path.resolve(__dirname, '../../../../public', filePath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};