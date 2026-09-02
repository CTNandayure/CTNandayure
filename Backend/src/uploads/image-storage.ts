import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { diskStorage } from 'multer';

export const UPLOADS_DIR = join(__dirname, '..', '..', 'uploads');

export const imageStorage = diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});
