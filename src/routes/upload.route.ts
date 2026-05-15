import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middlewares/auth.middleware';
import { env } from '../config/env.config';
import { AppResponse } from '../utils/response.util';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

router.post('/', authMiddleware, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      AppResponse.fail(400, 'No file provided').send(res);
      return;
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      AppResponse.error(500, 'Failed to upload file to storage').send(res);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    AppResponse.success(200, 'File uploaded', { url: publicUrlData.publicUrl }).send(res);
  } catch (err) {
    next(err);
  }
});

export default router;
